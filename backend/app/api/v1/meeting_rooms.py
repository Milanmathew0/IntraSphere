from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from app.schemas.meeting_schema import (
    RoomCreate, RoomUpdate, RoomOut,
    BookingCreate, BookingOut, BookingCancel,
    AvailabilityCheckRequest
)
from app.services.meeting_service import (
    get_all_rooms_filtered,
    get_room_details_by_id,
    check_room_availability,
    create_booking,
    get_my_bookings,
    cancel_booking,
    create_room,
    update_room,
    deactivate_room,
    get_all_organization_bookings,
    get_meeting_room_summary_stats
)
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["Meeting Rooms"])

# ==========================================
# SUMMARY STATS & ROOMS
# ==========================================

@router.get("/meeting-rooms/stats")
@router.get("/meeting-rooms/stats/")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return await get_meeting_room_summary_stats(current_user)


@router.get("/meeting-rooms")
@router.get("/meeting-rooms/")
async def list_rooms(
    search: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    min_capacity: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    facility: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await get_all_rooms_filtered(
        search=search,
        floor=floor,
        min_capacity=min_capacity,
        location=location,
        status_filter=status,
        facility=facility
    )


@router.get("/meeting-rooms/{room_id}")
async def get_room_by_id(
    room_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await get_room_details_by_id(room_id)


@router.post("/meeting-rooms", status_code=201)
@router.post("/meeting-rooms/", status_code=201)
async def add_room(
    room_data: RoomCreate,
    current_user: dict = Depends(get_current_user)
):
    return await create_room(room_data, current_user)


@router.patch("/meeting-rooms/{room_id}")
async def edit_room(
    room_id: str,
    room_data: RoomUpdate,
    current_user: dict = Depends(get_current_user)
):
    return await update_room(room_id, room_data, current_user)


@router.patch("/meeting-rooms/{room_id}/deactivate")
async def toggle_room_active(
    room_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await deactivate_room(room_id, current_user)


@router.get("/meeting-rooms/{room_id}/availability")
async def check_availability(
    room_id: str,
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    current_user: dict = Depends(get_current_user)
):
    return await check_room_availability(room_id, start_time, end_time)


# ==========================================
# MEETING BOOKINGS
# ==========================================

@router.post("/meeting-bookings", status_code=201)
@router.post("/meeting-bookings/", status_code=201)
async def make_booking(
    booking_data: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    return await create_booking(current_user, booking_data)


@router.get("/meeting-bookings/my")
@router.get("/meeting-bookings/my/")
async def fetch_my_bookings(
    current_user: dict = Depends(get_current_user)
):
    return await get_my_bookings(current_user)


@router.get("/meeting-bookings/all")
@router.get("/meeting-bookings/all/")
async def fetch_all_bookings(
    room_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await get_all_organization_bookings(current_user, room_id=room_id, status_filter=status)


@router.patch("/meeting-bookings/{booking_id}/cancel")
async def cancel_meeting_booking(
    booking_id: str,
    cancel_data: Optional[BookingCancel] = None,
    current_user: dict = Depends(get_current_user)
):
    reason = cancel_data.cancellation_reason if cancel_data else "Cancelled by user"
    return await cancel_booking(booking_id, current_user, cancellation_reason=reason)
