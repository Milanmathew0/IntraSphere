import os
import secrets
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from bson import ObjectId

from app.utils.dependencies import get_current_user, require_roles
from app.schemas.leave_schema import (
    LeaveTypeCreate, LeaveTypeUpdate,
    LeaveRequestCreate, LeaveApprovalAction, LeaveRejectionAction, LeaveCancellationAction,
    LeaveBalanceAdjustment, HolidayCreate, HolidayUpdate
)
from app.services.leave_service import (
    init_leave_system,
    submit_leave_request,
    approve_leave_request,
    reject_leave_request,
    cancel_leave_request,
    get_my_leave_requests,
    get_pending_approvals_for_user,
    get_all_leave_requests_filtered,
    get_or_create_leave_balances,
    get_all_leave_types,
    create_leave_type,
    update_leave_type,
    get_all_holidays,
    create_holiday,
    adjust_employee_leave_balance,
    calculate_working_days
)
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read
)
from app.database.connection import db

router = APIRouter(
    prefix="/leave-requests",
    tags=["Leave Management"]
)

# Base directory for uploads
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =====================================================
# LEAVE CALCULATION PREVIEW API
# =====================================================

@router.post("/calculate-days")
async def preview_calculate_days(
    start_date: date,
    end_date: date,
    is_half_day: bool = False,
    leave_type_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        from app.services.leave_service import (
            calculate_working_days_detail,
            get_or_create_leave_balances,
            users_collection,
            employees_collection,
            leave_types_collection
        )
        
        detail = await calculate_working_days_detail(start_date, end_date, is_half_day)
        working_days = detail["working_days"]
        
        remaining_balance = None
        balance_after_request = None
        leave_type_name = None
        requires_attachment = False

        if leave_type_id:
            try:
                lt_obj_id = ObjectId(leave_type_id)
                leave_type = await leave_types_collection.find_one({"_id": lt_obj_id, "is_active": True})
                if leave_type:
                    leave_type_name = leave_type.get("name")
                    requires_attachment = leave_type.get("requires_attachment", False)

                    email = current_user.get("sub")
                    user = await users_collection.find_one({"email": email})
                    if user:
                        employee = await employees_collection.find_one({"user_id": user["_id"]})
                        if employee:
                            balances = await get_or_create_leave_balances(employee["_id"], user["_id"], start_date.year)
                            target_bal = next((b for b in balances if b["leave_type_id"] == leave_type_id), None)
                            if target_bal:
                                remaining_balance = float(target_bal["remaining"])
                                balance_after_request = remaining_balance - working_days
            except Exception:
                pass

        return {
            "total_days": working_days,
            "working_days": working_days,
            "weekends_excluded": detail["weekends_excluded"],
            "holidays_excluded": detail["holidays_excluded"],
            "total_calendar_days": detail["total_calendar_days"],
            "remaining_balance": remaining_balance,
            "balance_after_request": balance_after_request,
            "leave_type_name": leave_type_name,
            "requires_attachment": requires_attachment
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


# =====================================================
# ATTACHMENT UPLOAD API
# =====================================================

@router.post("/upload-attachment")
async def upload_leave_attachment(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.")

    # Generate secure unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"leave_doc_{secrets.token_hex(12)}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5MB.")

    with open(file_path, "wb") as f:
        f.write(content)

    attachment_url = f"/uploads/{filename}"
    return {"attachment_url": attachment_url, "filename": filename}


# =====================================================
# EMPLOYEE - LEAVE SUBMISSION & MY REQUESTS
# =====================================================

@router.post("/")
async def apply_for_leave(
    payload: LeaveRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    result = await submit_leave_request(current_user, payload.model_dump())
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


@router.get("/my")
async def get_my_requests(
    current_user: dict = Depends(get_current_user)
):
    return await get_my_leave_requests(current_user)


# =====================================================
# MANAGER / HR - PENDING APPROVALS & ACTION APIs
# =====================================================

@router.get("/pending-approvals")
async def get_pending_approvals(
    current_user: dict = Depends(get_current_user)
):
    return await get_pending_approvals_for_user(current_user)


@router.patch("/{id}/approve")
async def approve_request_api(
    id: str,
    action: LeaveApprovalAction,
    current_user: dict = Depends(get_current_user)
):
    result = await approve_leave_request(id, current_user, action.approval_comment)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


@router.patch("/{id}/reject")
async def reject_request_api(
    id: str,
    action: LeaveRejectionAction,
    current_user: dict = Depends(get_current_user)
):
    result = await reject_leave_request(id, current_user, action.rejection_reason)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


@router.patch("/{id}/cancel")
async def cancel_request_api(
    id: str,
    action: LeaveCancellationAction,
    current_user: dict = Depends(get_current_user)
):
    result = await cancel_leave_request(id, current_user, action.cancellation_reason)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


# =====================================================
# HR / ADMIN - ALL LEAVE REQUESTS WITH FILTERS
# =====================================================

@router.get("/all")
async def get_all_requests(
    department: Optional[str] = None,
    employee_id: Optional[str] = None,
    leave_type_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(require_roles(["Admin", "HR", "Manager"]))
):
    return await get_all_leave_requests_filtered(
        department_name=department,
        employee_id_str=employee_id,
        leave_type_id_str=leave_type_id,
        status_filter=status
    )


# =====================================================
# LEAVE BALANCES APIs
# =====================================================

@router.get("/balances/me")
async def get_my_balances(
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    emp = await db["employees"].find_one({"user_id": user["_id"]})
    if not emp:
        return []
    return await get_or_create_leave_balances(emp["_id"], user["_id"], year=2026)


@router.get("/balances/{employee_id}")
async def get_employee_balances(
    employee_id: str,
    current_user: dict = Depends(require_roles(["Admin", "HR", "Manager"]))
):
    try:
        emp_obj_id = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Employee ID.")

    emp = await db["employees"].find_one({"_id": emp_obj_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")
    return await get_or_create_leave_balances(emp["_id"], emp.get("user_id", emp["_id"]), year=2026)


@router.patch("/balances/{employee_id}/adjust")
async def adjust_balance_api(
    employee_id: str,
    payload: LeaveBalanceAdjustment,
    leave_type_id: str,
    current_user: dict = Depends(require_roles(["Admin", "HR"]))
):
    if payload.allocated is None:
        raise HTTPException(status_code=400, detail="Allocated balance is required for adjustment.")
    result = await adjust_employee_leave_balance(
        employee_id_str=employee_id,
        leave_type_id_str=leave_type_id,
        new_allocated=payload.allocated,
        reason=payload.reason,
        user_payload=current_user
    )
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


# =====================================================
# LEAVE TYPES APIs (HR/Admin)
# =====================================================

@router.get("/types/")
async def list_leave_types(
    current_user: dict = Depends(get_current_user)
):
    return await get_all_leave_types()


@router.post("/types/")
async def create_new_leave_type(
    payload: LeaveTypeCreate,
    current_user: dict = Depends(require_roles(["Admin", "HR"]))
):
    type_id = await create_leave_type(payload.model_dump(), current_user)
    return {"message": "Leave type created successfully", "id": type_id}


@router.patch("/types/{id}")
async def edit_leave_type(
    id: str,
    payload: LeaveTypeUpdate,
    current_user: dict = Depends(require_roles(["Admin", "HR"]))
):
    success = await update_leave_type(id, payload.model_dump(exclude_unset=True), current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Leave type not found or update failed.")
    return {"message": "Leave type updated successfully."}


# =====================================================
# HOLIDAYS APIs
# =====================================================

@router.get("/holidays/")
async def list_holidays(
    current_user: dict = Depends(get_current_user)
):
    return await get_all_holidays()


@router.post("/holidays/")
async def create_new_holiday(
    payload: HolidayCreate,
    current_user: dict = Depends(require_roles(["Admin", "HR"]))
):
    h_id = await create_holiday(payload.model_dump(), current_user)
    return {"message": "Holiday created successfully", "id": h_id}


# =====================================================
# NOTIFICATIONS APIs
# =====================================================

@router.get("/notifications/my")
async def list_my_notifications(
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        return []
    return await get_user_notifications(user["_id"])


@router.patch("/notifications/{id}/read")
async def mark_notification_read_api(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    success = await mark_notification_as_read(id, user["_id"])
    return {"success": success}


@router.patch("/notifications/read-all")
async def mark_all_notifications_read_api(
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    count = await mark_all_notifications_as_read(user["_id"])
    return {"marked_read": count}
