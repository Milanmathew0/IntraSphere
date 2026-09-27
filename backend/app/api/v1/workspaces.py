from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from app.schemas.workspace_schema import (
    WorkspaceDeskCreate, WorkspaceDeskUpdate, WorkspaceDeskOut,
    WorkspaceReservationCreate, WorkspaceReservationOut, WorkspaceReservationCancel
)
from app.services.workspace_service import (
    get_all_desks_filtered,
    get_desk_details_by_id,
    check_desk_availability,
    create_reservation,
    get_my_reservations,
    cancel_reservation,
    create_desk,
    update_desk,
    deactivate_desk,
    get_all_organization_reservations,
    get_workspace_summary_stats,
    get_workspace_analytics
)
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["Workspace Desk Reservation"])

# ==========================================
# SUMMARY STATS & DESK DIRECTORY
# ==========================================

@router.get("/workspaces/stats")
@router.get("/workspaces/stats/")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return await get_workspace_summary_stats(current_user)


@router.get("/workspaces/analytics")
@router.get("/workspaces/analytics/")
async def fetch_analytics(current_user: dict = Depends(get_current_user)):
    return await get_workspace_analytics(current_user)


@router.get("/workspaces")
@router.get("/workspaces/")
async def list_desks(
    search: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    zone: Optional[str] = Query(None),
    workspace_type: Optional[str] = Query(None),
    facility: Optional[str] = Query(None),
    is_accessible: Optional[bool] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await get_all_desks_filtered(
        search=search,
        floor=floor,
        zone=zone,
        workspace_type=workspace_type,
        facility=facility,
        is_accessible=is_accessible,
        status_filter=status,
        target_date=date
    )


@router.get("/workspaces/{desk_id}")
async def get_desk_by_id(
    desk_id: str,
    date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await get_desk_details_by_id(desk_id, date)


@router.post("/workspaces", status_code=201)
@router.post("/workspaces/", status_code=201)
async def add_desk(
    desk_data: WorkspaceDeskCreate,
    current_user: dict = Depends(get_current_user)
):
    return await create_desk(desk_data, current_user)


@router.patch("/workspaces/{desk_id}")
async def edit_desk(
    desk_id: str,
    desk_data: WorkspaceDeskUpdate,
    current_user: dict = Depends(get_current_user)
):
    return await update_desk(desk_id, desk_data, current_user)


@router.patch("/workspaces/{desk_id}/deactivate")
async def toggle_desk_active(
    desk_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await deactivate_desk(desk_id, current_user)


@router.get("/workspaces/{desk_id}/availability")
async def check_availability(
    desk_id: str,
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    current_user: dict = Depends(get_current_user)
):
    return await check_desk_availability(desk_id, start_time, end_time)


# ==========================================
# WORKSPACE RESERVATIONS
# ==========================================

@router.post("/workspace-reservations", status_code=201)
@router.post("/workspace-reservations/", status_code=201)
async def make_reservation(
    res_data: WorkspaceReservationCreate,
    current_user: dict = Depends(get_current_user)
):
    return await create_reservation(current_user, res_data)


@router.get("/workspace-reservations/my")
@router.get("/workspace-reservations/my/")
async def fetch_my_reservations(
    current_user: dict = Depends(get_current_user)
):
    return await get_my_reservations(current_user)


@router.get("/workspace-reservations/all")
@router.get("/workspace-reservations/all/")
async def fetch_all_reservations(
    desk_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await get_all_organization_reservations(current_user, desk_id=desk_id, status_filter=status)


@router.patch("/workspace-reservations/{reservation_id}/cancel")
async def cancel_desk_reservation(
    reservation_id: str,
    cancel_data: Optional[WorkspaceReservationCancel] = None,
    current_user: dict = Depends(get_current_user)
):
    reason = cancel_data.cancellation_reason if cancel_data else "Cancelled by employee"
    return await cancel_reservation(reservation_id, current_user, cancellation_reason=reason)
