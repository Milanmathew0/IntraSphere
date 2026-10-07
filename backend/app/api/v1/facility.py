from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from datetime import datetime

from app.schemas.facility_schema import (
    MaintenanceCreate, MaintenanceUpdate, MaintenanceStatusUpdate,
    ResourceMaintenanceStatus, ReservationCancelRequest, ReservationStatusUpdate
)
from app.services.facility_service import (
    get_facility_dashboard_stats,
    get_all_facility_maintenance,
    create_maintenance_record,
    update_maintenance_status,
    get_facility_reservations,
    cancel_facility_reservation,
    update_facility_reservation,
    delete_facility_reservation,
    get_facility_analytics
)
from app.schemas.meeting_schema import RoomCreate, RoomUpdate
from app.services.meeting_service import (
    get_all_rooms_filtered,
    get_room_details_by_id,
    create_room,
    update_room,
    deactivate_room
)
from app.schemas.workspace_schema import WorkspaceDeskCreate, WorkspaceDeskUpdate
from app.services.workspace_service import (
    get_all_desks_filtered,
    get_desk_details_by_id,
    create_desk,
    update_desk,
    deactivate_desk
)
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/facility",
    tags=["Facility Management"]
)

# Helper dependency to enforce Admin or Facility Manager role
require_facility_manager = require_roles(["Admin", "Facility Manager"])


# ==========================================
# 1. FACILITY DASHBOARD
# ==========================================

@router.get("/dashboard")
@router.get("/dashboard/")
async def facility_dashboard(current_user: dict = Depends(require_facility_manager)):
    return await get_facility_dashboard_stats(current_user)


# ==========================================
# 2. MEETING ROOM MANAGEMENT
# ==========================================

@router.get("/meeting-rooms")
@router.get("/meeting-rooms/")
async def facility_list_rooms(
    search: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    min_capacity: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_facility_manager)
):
    return await get_all_rooms_filtered(
        search=search, floor=floor, min_capacity=min_capacity, location=location, status_filter=status
    )


@router.post("/meeting-rooms", status_code=201)
@router.post("/meeting-rooms/", status_code=201)
async def facility_add_room(
    room_data: RoomCreate,
    current_user: dict = Depends(require_facility_manager)
):
    return await create_room(room_data, current_user)


@router.get("/meeting-rooms/{room_id}")
async def facility_get_room(
    room_id: str,
    current_user: dict = Depends(require_facility_manager)
):
    return await get_room_details_by_id(room_id)


@router.patch("/meeting-rooms/{room_id}")
async def facility_edit_room(
    room_id: str,
    room_data: RoomUpdate,
    current_user: dict = Depends(require_facility_manager)
):
    return await update_room(room_id, room_data, current_user)


@router.patch("/meeting-rooms/{room_id}/maintenance")
async def facility_toggle_room_maintenance(
    room_id: str,
    status_data: ResourceMaintenanceStatus,
    current_user: dict = Depends(require_facility_manager)
):
    # Set status to Maintenance or Available
    target_status = status_data.status if status_data.status in ["Available", "Maintenance", "Inactive"] else "Maintenance"
    res = await update_room(room_id, RoomUpdate(status=target_status), current_user)

    # If setting to maintenance and title is provided, create a maintenance record
    if target_status == "Maintenance" and status_data.issue_title:
        room_doc = await get_room_details_by_id(room_id)
        room_name = room_doc.get("name", "Meeting Room") if isinstance(room_doc, dict) else "Meeting Room"
        await create_maintenance_record(
            current_user,
            MaintenanceCreate(
                resource_type="meeting_room",
                resource_id=room_id,
                resource_name=room_name,
                issue_title=status_data.issue_title,
                issue_description=status_data.issue_description or status_data.issue_title,
                priority=status_data.priority or "Medium"
            )
        )
    return res


@router.patch("/meeting-rooms/{room_id}/deactivate")
async def facility_deactivate_room(
    room_id: str,
    current_user: dict = Depends(require_facility_manager)
):
    return await deactivate_room(room_id, current_user)


# ==========================================
# 3. WORKSPACE / DESK MANAGEMENT
# ==========================================

@router.get("/workspaces")
@router.get("/workspaces/")
async def facility_list_desks(
    search: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    zone: Optional[str] = Query(None),
    workspace_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_facility_manager)
):
    return await get_all_desks_filtered(
        search=search, floor=floor, zone=zone, workspace_type=workspace_type, status_filter=status
    )


@router.post("/workspaces", status_code=201)
@router.post("/workspaces/", status_code=201)
async def facility_add_desk(
    desk_data: WorkspaceDeskCreate,
    current_user: dict = Depends(require_facility_manager)
):
    return await create_desk(desk_data, current_user)


@router.get("/workspaces/{desk_id}")
async def facility_get_desk(
    desk_id: str,
    current_user: dict = Depends(require_facility_manager)
):
    return await get_desk_details_by_id(desk_id)


@router.patch("/workspaces/{desk_id}")
async def facility_edit_desk(
    desk_id: str,
    desk_data: WorkspaceDeskUpdate,
    current_user: dict = Depends(require_facility_manager)
):
    return await update_desk(desk_id, desk_data, current_user)


@router.patch("/workspaces/{desk_id}/maintenance")
async def facility_toggle_desk_maintenance(
    desk_id: str,
    status_data: ResourceMaintenanceStatus,
    current_user: dict = Depends(require_facility_manager)
):
    target_status = status_data.status if status_data.status in ["Available", "Maintenance", "Inactive"] else "Maintenance"
    res = await update_desk(desk_id, WorkspaceDeskUpdate(status=target_status), current_user)

    if target_status == "Maintenance" and status_data.issue_title:
        desk_doc = await get_desk_details_by_id(desk_id)
        desk_name = desk_doc.get("desk_code") or desk_doc.get("name", "Desk") if isinstance(desk_doc, dict) else "Desk"
        await create_maintenance_record(
            current_user,
            MaintenanceCreate(
                resource_type="workspace",
                resource_id=desk_id,
                resource_name=desk_name,
                issue_title=status_data.issue_title,
                issue_description=status_data.issue_description or status_data.issue_title,
                priority=status_data.priority or "Medium"
            )
        )
    return res


@router.patch("/workspaces/{desk_id}/deactivate")
async def facility_deactivate_desk(
    desk_id: str,
    current_user: dict = Depends(require_facility_manager)
):
    return await deactivate_desk(desk_id, current_user)


# ==========================================
# 4. RESERVATIONS MANAGEMENT
# ==========================================

@router.get("/reservations")
@router.get("/reservations/")
async def facility_get_all_reservations(
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    building: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_facility_manager)
):
    return await get_facility_reservations(
        resource_type=resource_type, status_filter=status, floor=floor, building=building, search=search
    )


@router.patch("/reservations/{reservation_id}/cancel")
async def facility_cancel_reservation(
    reservation_id: str,
    resource_type: str = Query(..., description="meeting_room or workspace"),
    cancel_data: Optional[ReservationCancelRequest] = None,
    current_user: dict = Depends(require_facility_manager)
):
    reason = cancel_data.cancellation_reason if cancel_data else "Cancelled by Facility Policy"
    return await cancel_facility_reservation(
        reservation_id=reservation_id,
        resource_type=resource_type,
        cancellation_reason=reason,
        current_user=current_user
    )


@router.patch("/reservations/{reservation_id}/status")
async def facility_update_reservation_status(
    reservation_id: str,
    update_data: ReservationStatusUpdate,
    resource_type: str = Query(..., description="meeting_room or workspace"),
    current_user: dict = Depends(require_facility_manager)
):
    return await update_facility_reservation(
        reservation_id=reservation_id,
        resource_type=resource_type,
        update_data=update_data,
        current_user=current_user
    )


@router.delete("/reservations/{reservation_id}")
async def facility_remove_reservation(
    reservation_id: str,
    resource_type: str = Query(..., description="meeting_room or workspace"),
    current_user: dict = Depends(require_facility_manager)
):
    return await delete_facility_reservation(
        reservation_id=reservation_id,
        resource_type=resource_type,
        current_user=current_user
    )



# ==========================================
# 5. MAINTENANCE MANAGEMENT
# ==========================================

@router.get("/maintenance")
@router.get("/maintenance/")
async def facility_list_maintenance(
    resource_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_facility_manager)
):
    return await get_all_facility_maintenance(
        resource_type=resource_type, status_filter=status, priority=priority, search=search
    )


@router.post("/maintenance", status_code=201)
@router.post("/maintenance/", status_code=201)
async def facility_create_maintenance(
    maint_data: MaintenanceCreate,
    current_user: dict = Depends(require_facility_manager)
):
    return await create_maintenance_record(current_user, maint_data)


@router.patch("/maintenance/{record_id}")
async def facility_update_maintenance(
    record_id: str,
    status_data: MaintenanceStatusUpdate,
    current_user: dict = Depends(require_facility_manager)
):
    return await update_maintenance_status(
        record_id=record_id,
        status_val=status_data.status,
        resolution_notes=status_data.resolution_notes,
        current_user=current_user
    )


@router.patch("/maintenance/{record_id}/complete")
async def facility_complete_maintenance(
    record_id: str,
    resolution_notes: Optional[str] = Query(None),
    current_user: dict = Depends(require_facility_manager)
):
    return await update_maintenance_status(
        record_id=record_id,
        status_val="Completed",
        resolution_notes=resolution_notes or "Maintenance successfully completed and verified.",
        current_user=current_user
    )


# ==========================================
# 6. FACILITY ANALYTICS
# ==========================================

@router.get("/analytics")
@router.get("/analytics/")
async def facility_get_analytics(
    period: str = Query("month", description="today, week, month, all"),
    current_user: dict = Depends(require_facility_manager)
):
    return await get_facility_analytics(period=period)
