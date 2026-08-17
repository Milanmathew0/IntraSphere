from datetime import datetime, date, timedelta
from typing import Optional, List, Dict
from bson import ObjectId
from app.database.connection import db
from app.services.notification_service import create_notification

# Collections
leave_types_collection = db["leave_types"]
leave_balances_collection = db["leave_balances"]
leave_requests_collection = db["leave_requests"]
holidays_collection = db["holidays"]
leave_audit_logs_collection = db["leave_audit_logs"]
employees_collection = db["employees"]
users_collection = db["users"]


# =====================================================
# SEEDING & INDEX INITIALIZATION
# =====================================================

async def init_leave_system():
    """Initializes MongoDB indexes and seeds default leave types if empty."""
    # Create Indexes
    await leave_requests_collection.create_index([("employee_id", 1), ("status", 1), ("start_date", 1), ("end_date", 1)])
    await leave_requests_collection.create_index([("reporting_manager_id", 1), ("status", 1)])
    await leave_balances_collection.create_index([("employee_id", 1), ("leave_type_id", 1), ("year", 1)], unique=True)
    await holidays_collection.create_index([("date", 1), ("is_active", 1)])
    await leave_audit_logs_collection.create_index([("entity_id", 1), ("timestamp", -1)])

    # Seed Default Leave Types if empty
    count = await leave_types_collection.count_documents({})
    if count == 0:
        default_types = [
            {
                "name": "Casual Leave",
                "description": "Short-term leave for urgent personal matters",
                "annual_allocation": 12.0,
                "carry_forward_allowed": False,
                "maximum_consecutive_days": 5,
                "minimum_notice_days": 1,
                "maximum_advance_days": 90,
                "requires_attachment": False,
                "requires_approval": True,
                "allow_negative_balance": False,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Sick Leave",
                "description": "Medical leave for health recovery and treatment",
                "annual_allocation": 10.0,
                "carry_forward_allowed": False,
                "maximum_consecutive_days": 7,
                "minimum_notice_days": 0,
                "maximum_advance_days": None,
                "requires_attachment": True,
                "requires_approval": True,
                "allow_negative_balance": False,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Earned Leave",
                "description": "Privilege annual leave accrued over service duration",
                "annual_allocation": 15.0,
                "carry_forward_allowed": True,
                "maximum_consecutive_days": 14,
                "minimum_notice_days": 3,
                "maximum_advance_days": 90,
                "requires_attachment": False,
                "requires_approval": True,
                "allow_negative_balance": False,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Unpaid Leave",
                "description": "Leave without pay when paid balance is exhausted",
                "annual_allocation": 0.0,
                "carry_forward_allowed": False,
                "maximum_consecutive_days": 30,
                "minimum_notice_days": 0,
                "maximum_advance_days": 90,
                "requires_attachment": False,
                "requires_approval": True,
                "allow_negative_balance": True,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await leave_types_collection.insert_many(default_types)


# =====================================================
# AUDIT LOGGING HELPER
# =====================================================

async def create_audit_log(user_id: ObjectId, action: str, entity_type: str, entity_id: ObjectId, details: dict):
    doc = {
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "timestamp": datetime.utcnow()
    }
    await leave_audit_logs_collection.insert_one(doc)


# =====================================================
# DURATION CALCULATOR (Single Source of Truth)
# =====================================================

async def calculate_working_days_detail(start_date: date, end_date: date, is_half_day: bool = False) -> dict:
    if start_date > end_date:
        return {
            "working_days": 0.0,
            "weekends_excluded": 0,
            "holidays_excluded": 0,
            "total_calendar_days": 0
        }

    total_calendar_days = (end_date - start_date).days + 1

    if is_half_day:
        if start_date != end_date:
            raise ValueError("Half-day leave start date must equal end date.")
        
        is_weekend = start_date.weekday() in (5, 6)
        start_dt = datetime.combine(start_date, datetime.min.time())
        holiday = await holidays_collection.find_one({"date": start_dt, "is_active": True})
        
        if is_weekend:
            return {
                "working_days": 0.0,
                "weekends_excluded": 1,
                "holidays_excluded": 0,
                "total_calendar_days": 1
            }
        if holiday:
            return {
                "working_days": 0.0,
                "weekends_excluded": 0,
                "holidays_excluded": 1,
                "total_calendar_days": 1
            }
        return {
            "working_days": 0.5,
            "weekends_excluded": 0,
            "holidays_excluded": 0,
            "total_calendar_days": 1
        }

    working_days = 0.0
    weekends_excluded = 0
    holidays_excluded = 0

    current = start_date
    while current <= end_date:
        if current.weekday() in (5, 6):
            weekends_excluded += 1
        else:
            curr_dt = datetime.combine(current, datetime.min.time())
            holiday = await holidays_collection.find_one({"date": curr_dt, "is_active": True})
            if holiday:
                holidays_excluded += 1
            else:
                working_days += 1.0
        current += timedelta(days=1)

    return {
        "working_days": working_days,
        "weekends_excluded": weekends_excluded,
        "holidays_excluded": holidays_excluded,
        "total_calendar_days": total_calendar_days
    }

async def calculate_working_days(start_date: date, end_date: date, is_half_day: bool = False) -> float:
    detail = await calculate_working_days_detail(start_date, end_date, is_half_day)
    return detail["working_days"]


# =====================================================
# LEAVE BALANCE MANAGERS
# =====================================================

async def get_or_create_leave_balances(employee_id: ObjectId, user_id: ObjectId, year: int = 2026):
    """Fetches or initializes active leave balances for an employee."""
    active_types = await leave_types_collection.find({"is_active": True}).to_list(length=100)
    balances = []

    for lt in active_types:
        name_lower = lt.get("name", "").lower()
        if "earned" in name_lower or "unpaid" in name_lower:
            continue
        bal = await leave_balances_collection.find_one({
            "employee_id": employee_id,
            "leave_type_id": lt["_id"],
            "year": year
        })
        if not bal:
            allocated = float(lt.get("annual_allocation", 12.0))
            bal_doc = {
                "employee_id": employee_id,
                "user_id": user_id,
                "leave_type_id": lt["_id"],
                "year": year,
                "allocated": allocated,
                "used": 0.0,
                "pending": 0.0,
                "remaining": allocated,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            res = await leave_balances_collection.insert_one(bal_doc)
            bal_doc["_id"] = res.inserted_id
            bal = bal_doc
        else:
            # Sync remaining calculation
            remaining = float(bal["allocated"]) - float(bal["used"]) - float(bal["pending"])
            if bal["remaining"] != remaining:
                await leave_balances_collection.update_one({"_id": bal["_id"]}, {"$set": {"remaining": remaining}})
                bal["remaining"] = remaining

        balances.append({
            "_id": str(bal["_id"]),
            "employee_id": str(bal["employee_id"]),
            "user_id": str(bal["user_id"]),
            "leave_type_id": str(bal["leave_type_id"]),
            "leave_type_name": lt["name"],
            "year": bal["year"],
            "allocated": float(bal["allocated"]),
            "used": float(bal["used"]),
            "pending": float(bal["pending"]),
            "remaining": float(bal["remaining"]),
            "allow_negative_balance": lt.get("allow_negative_balance", False),
            "requires_attachment": lt.get("requires_attachment", False)
        })

    return balances


# =====================================================
# LEAVE REQUEST SUBMISSION & VALIDATIONS
# =====================================================

async def submit_leave_request(user_payload: dict, req_data: dict):
    today_date = date.today()

    # 1. Fetch User and Employee records (Active Employee check)
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})
    if not user or not user.get("is_active", True):
        return {"error": "Authenticated user account is inactive or not found.", "status_code": 403}

    employee = await employees_collection.find_one({"user_id": user["_id"]})
    if not employee or employee.get("employment_status") != "Active":
        return {"error": "Only active employees can submit leave requests.", "status_code": 403}

    # 2. Leave Type check
    try:
        leave_type_id = ObjectId(req_data["leave_type_id"])
    except Exception:
        return {"error": "Invalid Leave Type ID.", "status_code": 400}

    leave_type = await leave_types_collection.find_one({"_id": leave_type_id, "is_active": True})
    if not leave_type:
        return {"error": "This leave type is currently unavailable.", "status_code": 400}

    # 3. Dates validation & Start <= End
    start_date = req_data.get("start_date")
    end_date = req_data.get("end_date")

    if not start_date:
        return {"error": "Please select a start date.", "status_code": 400}
    if not end_date:
        return {"error": "Please select an end date.", "status_code": 400}
    if start_date > end_date:
        return {"error": "End date must be on or after the start date.", "status_code": 400}

    # 4. Check if date range is completely in the past
    if end_date < today_date:
        return {"error": "You cannot apply for leave for a date that has already passed.", "status_code": 400}

    # 5. Notice Period Validation
    min_notice = leave_type.get("minimum_notice_days", 0)
    if min_notice > 0:
        advance_notice_days = (start_date - today_date).days
        if advance_notice_days < min_notice:
            return {"error": f"Please apply at least {min_notice} day(s) in advance for {leave_type['name']}.", "status_code": 400}

    # 6. Future Advance Limit Validation
    max_advance = leave_type.get("maximum_advance_days")
    if max_advance is not None and max_advance > 0:
        advance_days = (start_date - today_date).days
        if advance_days > max_advance:
            return {"error": f"You cannot apply for {leave_type['name']} more than {max_advance} days in advance.", "status_code": 400}

    # 7. Half-Day Validation
    is_half_day = req_data.get("is_half_day", False)
    half_day_session = req_data.get("half_day_session")

    if is_half_day:
        if start_date != end_date:
            return {"error": "Half-day leave can only be applied for a single working day.", "status_code": 400}
        if half_day_session not in ("Morning", "Afternoon", "First Half", "Second Half"):
            return {"error": "Please select a valid half-day session (Morning or Afternoon).", "status_code": 400}
        
        if start_date.weekday() in (5, 6):
            return {"error": "Half-day leave can only be applied on a working day.", "status_code": 400}
        
        start_dt_check = datetime.combine(start_date, datetime.min.time())
        holiday_check = await holidays_collection.find_one({"date": start_dt_check, "is_active": True})
        if holiday_check:
            return {"error": "Half-day leave can only be applied on a working day.", "status_code": 400}

    # 8. Reason Validation
    reason = req_data.get("reason", "").strip()
    if not reason:
        return {"error": "Reason for leave is required.", "status_code": 400}
    if len(reason) < 10:
        return {"error": "Reason must be at least 10 characters long.", "status_code": 400}
    if len(reason) > 500:
        return {"error": "Reason cannot exceed 500 characters.", "status_code": 400}

    # 9. Attachment Requirement Validation
    if leave_type.get("requires_attachment") and not req_data.get("attachment_url"):
        return {"error": f"Medical certificate or supporting document is required for {leave_type['name']}.", "status_code": 400}

    # 10. Calculate total working days (excluding weekends & holidays)
    try:
        days_detail = await calculate_working_days_detail(start_date, end_date, is_half_day)
        total_days = days_detail["working_days"]
    except ValueError as ve:
        return {"error": str(ve), "status_code": 400}

    if total_days <= 0:
        return {"error": "The selected date range does not contain any working days.", "status_code": 400}

    # 11. Check Maximum Consecutive Working Days Limit
    max_days = leave_type.get("maximum_consecutive_days")
    if max_days and total_days > max_days:
        return {"error": f"{leave_type['name']} cannot exceed {max_days} consecutive working days.", "status_code": 400}

    # 12. Check Overlapping Pending or Approved Leave Requests
    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date, datetime.max.time())

    overlapping = await leave_requests_collection.find_one({
        "employee_id": employee["_id"],
        "status": {"$in": ["Pending", "Approved"]},
        "$or": [
            {"start_date": {"$lte": end_dt}, "end_date": {"$gte": start_dt}}
        ]
    })
    if overlapping:
        return {"error": "You already have a pending or approved leave request during part of the selected period.", "status_code": 409}

    # 13. Check Leave Balance (Atomic Check)
    year = start_date.year
    balances = await get_or_create_leave_balances(employee["_id"], user["_id"], year)
    target_bal = next((b for b in balances if b["leave_type_id"] == str(leave_type_id)), None)

    if not target_bal and not leave_type.get("allow_negative_balance", False):
        return {"error": "Leave balance record not found.", "status_code": 400}

    if target_bal and not leave_type.get("allow_negative_balance", False):
        if target_bal["remaining"] < total_days:
            return {"error": f"Insufficient {leave_type['name']} balance. You have {target_bal['remaining']} day(s) remaining.", "status_code": 400}

    # 14. Determine Reporting Manager (or fallback to HR/Admin)
    reporting_manager_id = employee.get("reporting_manager_id")
    if not reporting_manager_id:
        hr_admin = await users_collection.find_one({"role": {"$in": ["Admin", "HR"]}, "is_active": True})
        if hr_admin:
            admin_emp = await employees_collection.find_one({"user_id": hr_admin["_id"]})
            if admin_emp:
                reporting_manager_id = admin_emp["_id"]

    # 15. Construct Leave Request Document
    leave_doc = {
        "employee_id": employee["_id"],
        "user_id": user["_id"],
        "leave_type_id": leave_type_id,
        "start_date": start_dt,
        "end_date": datetime.combine(end_date, datetime.min.time()),
        "is_half_day": is_half_day,
        "half_day_session": half_day_session if is_half_day else None,
        "total_days": total_days,
        "reason": reason,
        "attachment_url": req_data.get("attachment_url"),
        "contact_number": req_data.get("contact_number"),
        "status": "Pending",
        "reporting_manager_id": reporting_manager_id,
        "approved_by": None,
        "approved_at": None,
        "approval_comment": None,
        "rejected_by": None,
        "rejected_at": None,
        "rejection_reason": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await leave_requests_collection.insert_one(leave_doc)
    request_id = result.inserted_id

    # 16. Increase `pending` in leave_balances (if balance record exists)
    if target_bal:
        new_pending = target_bal["pending"] + total_days
        new_remaining = target_bal["allocated"] - target_bal["used"] - new_pending

        await leave_balances_collection.update_one(
            {"_id": ObjectId(target_bal["_id"])},
            {"$set": {"pending": new_pending, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
        )

    # 12. Create Notification for Reporting Manager (if assigned)
    emp_name = f"{employee.get('first_name', '')} {employee.get('last_name', '')}".strip() or user.get("username", "Employee")
    if reporting_manager_id:
        manager_emp = await employees_collection.find_one({"_id": reporting_manager_id})
        if manager_emp and manager_emp.get("user_id"):
            await create_notification(
                recipient_id=manager_emp["user_id"],
                title="New Leave Request Pending Approval",
                message=f"{emp_name} requested {total_days} day(s) of {leave_type['name']} from {start_date} to {end_date}.",
                notification_type="LEAVE_REQUEST",
                sender_id=user["_id"],
                related_entity_id=request_id
            )

    # 13. Create Audit Log
    await create_audit_log(
        user_id=user["_id"],
        action="SUBMIT_LEAVE",
        entity_type="leave_request",
        entity_id=request_id,
        details={"leave_type": leave_type["name"], "total_days": total_days, "start_date": str(start_date), "end_date": str(end_date)}
    )

    return {
        "message": "Leave request submitted successfully",
        "request_id": str(request_id),
        "total_days": total_days,
        "status": "Pending"
    }


# =====================================================
# LEAVE APPROVAL & REJECTION
# =====================================================

async def approve_leave_request(request_id: str, user_payload: dict, approval_comment: str = "Approved"):
    email = user_payload.get("sub")
    role = user_payload.get("role", "Employee")
    auth_user = await users_collection.find_one({"email": email})
    if not auth_user:
        return {"error": "User not found.", "status_code": 404}

    try:
        req_obj_id = ObjectId(request_id)
    except Exception:
        return {"error": "Invalid Request ID.", "status_code": 400}

    leave_req = await leave_requests_collection.find_one({"_id": req_obj_id})
    if not leave_req:
        return {"error": "Leave request not found.", "status_code": 404}

    if leave_req["status"] != "Pending":
        return {"error": f"Cannot approve request with status '{leave_req['status']}'.", "status_code": 400}

    # Find Manager's employee record
    manager_emp = await employees_collection.find_one({"user_id": auth_user["_id"]})

    # Security Validation: Authorization to approve
    is_authorized = role in ("Admin", "HR", "Manager") or (manager_emp and leave_req.get("reporting_manager_id") and (leave_req["reporting_manager_id"] == manager_emp["_id"]))

    if not is_authorized:
        return {"error": "Access denied. Only the assigned Reporting Manager, HR, or Admin can approve this request.", "status_code": 403}

    # Prevent Self-Approval
    if str(leave_req["user_id"]) == str(auth_user["_id"]):
        return {"error": "Employees are strictly prohibited from approving their own leave requests.", "status_code": 403}

    total_days = float(leave_req["total_days"])
    year = leave_req["start_date"].year

    # Update Leave Balance: pending decreases, used increases
    bal = await leave_balances_collection.find_one({
        "employee_id": leave_req["employee_id"],
        "leave_type_id": leave_req["leave_type_id"],
        "year": year
    })

    if bal:
        new_pending = max(0.0, float(bal["pending"]) - total_days)
        new_used = float(bal["used"]) + total_days
        new_remaining = float(bal["allocated"]) - new_used - new_pending

        await leave_balances_collection.update_one(
            {"_id": bal["_id"]},
            {"$set": {"pending": new_pending, "used": new_used, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
        )

    # Update Request Status
    await leave_requests_collection.update_one(
        {"_id": req_obj_id},
        {"$set": {
            "status": "Approved",
            "approved_by": auth_user["_id"],
            "approved_at": datetime.utcnow(),
            "approval_comment": approval_comment,
            "updated_at": datetime.utcnow()
        }}
    )

    # Notify Employee
    lt = await leave_types_collection.find_one({"_id": leave_req["leave_type_id"]})
    lt_name = lt["name"] if lt else "Leave"

    await create_notification(
        recipient_id=leave_req["user_id"],
        title="Leave Request Approved",
        message=f"Your request for {total_days} day(s) of {lt_name} has been APPROVED.",
        notification_type="LEAVE_APPROVED",
        sender_id=auth_user["_id"],
        related_entity_id=req_obj_id
    )

    # Audit Log
    await create_audit_log(
        user_id=auth_user["_id"],
        action="APPROVE_LEAVE",
        entity_type="leave_request",
        entity_id=req_obj_id,
        details={"approved_by": str(auth_user["_id"]), "approval_comment": approval_comment}
    )

    return {"message": "Leave request approved successfully.", "request_id": request_id, "status": "Approved"}


async def reject_leave_request(request_id: str, user_payload: dict, rejection_reason: str):
    if not rejection_reason or not rejection_reason.strip():
        return {"error": "A valid rejection reason is required.", "status_code": 400}

    email = user_payload.get("sub")
    role = user_payload.get("role", "Employee")
    auth_user = await users_collection.find_one({"email": email})
    if not auth_user:
        return {"error": "User not found.", "status_code": 404}

    try:
        req_obj_id = ObjectId(request_id)
    except Exception:
        return {"error": "Invalid Request ID.", "status_code": 400}

    leave_req = await leave_requests_collection.find_one({"_id": req_obj_id})
    if not leave_req:
        return {"error": "Leave request not found.", "status_code": 404}

    if leave_req["status"] != "Pending":
        return {"error": f"Cannot reject request with status '{leave_req['status']}'.", "status_code": 400}

    manager_emp = await employees_collection.find_one({"user_id": auth_user["_id"]})

    is_authorized = role in ("Admin", "HR", "Manager") or (manager_emp and leave_req.get("reporting_manager_id") and (leave_req["reporting_manager_id"] == manager_emp["_id"]))

    if not is_authorized:
        return {"error": "Access denied. Only the assigned Reporting Manager, HR, or Admin can reject this request.", "status_code": 403}

    total_days = float(leave_req["total_days"])
    year = leave_req["start_date"].year

    # Update Leave Balance: pending decreases, used remains unchanged
    bal = await leave_balances_collection.find_one({
        "employee_id": leave_req["employee_id"],
        "leave_type_id": leave_req["leave_type_id"],
        "year": year
    })

    if bal:
        new_pending = max(0.0, float(bal["pending"]) - total_days)
        new_remaining = float(bal["allocated"]) - float(bal["used"]) - new_pending

        await leave_balances_collection.update_one(
            {"_id": bal["_id"]},
            {"$set": {"pending": new_pending, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
        )

    # Update Request Status
    await leave_requests_collection.update_one(
        {"_id": req_obj_id},
        {"$set": {
            "status": "Rejected",
            "rejected_by": auth_user["_id"],
            "rejected_at": datetime.utcnow(),
            "rejection_reason": rejection_reason.strip(),
            "updated_at": datetime.utcnow()
        }}
    )

    # Notify Employee
    lt = await leave_types_collection.find_one({"_id": leave_req["leave_type_id"]})
    lt_name = lt["name"] if lt else "Leave"

    await create_notification(
        recipient_id=leave_req["user_id"],
        title="Leave Request Rejected",
        message=f"Your request for {total_days} day(s) of {lt_name} was REJECTED. Reason: {rejection_reason}",
        notification_type="LEAVE_REJECTED",
        sender_id=auth_user["_id"],
        related_entity_id=req_obj_id
    )

    # Audit Log
    await create_audit_log(
        user_id=auth_user["_id"],
        action="REJECT_LEAVE",
        entity_type="leave_request",
        entity_id=req_obj_id,
        details={"rejected_by": str(auth_user["_id"]), "rejection_reason": rejection_reason}
    )

    return {"message": "Leave request rejected.", "request_id": request_id, "status": "Rejected"}


# =====================================================
# LEAVE CANCELLATION / WITHDRAWAL
# =====================================================

async def cancel_leave_request(request_id: str, user_payload: dict, cancellation_reason: str = "Cancelled by user"):
    email = user_payload.get("sub")
    role = user_payload.get("role", "Employee")
    auth_user = await users_collection.find_one({"email": email})
    if not auth_user:
        return {"error": "User not found.", "status_code": 404}

    try:
        req_obj_id = ObjectId(request_id)
    except Exception:
        return {"error": "Invalid Request ID.", "status_code": 400}

    leave_req = await leave_requests_collection.find_one({"_id": req_obj_id})
    if not leave_req:
        return {"error": "Leave request not found.", "status_code": 404}

    is_owner = str(leave_req["user_id"]) == str(auth_user["_id"])
    is_admin_or_hr = role in ("Admin", "HR")

    if not (is_owner or is_admin_or_hr):
        return {"error": "You can only cancel or withdraw your own leave requests.", "status_code": 403}

    current_status = leave_req["status"]
    if current_status != "Pending" and not is_admin_or_hr:
        return {"error": "Only Pending leave requests can be withdrawn by employees. Approved/Rejected requests cannot be modified.", "status_code": 400}

    total_days = float(leave_req["total_days"])
    year = leave_req["start_date"].year

    bal = await leave_balances_collection.find_one({
        "employee_id": leave_req["employee_id"],
        "leave_type_id": leave_req["leave_type_id"],
        "year": year
    })

    if bal:
        if current_status == "Pending":
            # Reverse pending
            new_pending = max(0.0, float(bal["pending"]) - total_days)
            new_remaining = float(bal["allocated"]) - float(bal["used"]) - new_pending
            await leave_balances_collection.update_one(
                {"_id": bal["_id"]},
                {"$set": {"pending": new_pending, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
            )
        elif current_status == "Approved":
            # Reverse used
            new_used = max(0.0, float(bal["used"]) - total_days)
            new_remaining = float(bal["allocated"]) - new_used - float(bal["pending"])
            await leave_balances_collection.update_one(
                {"_id": bal["_id"]},
                {"$set": {"used": new_used, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
            )

    new_status = "Withdrawn" if (current_status == "Pending" and is_owner) else "Cancelled"

    await leave_requests_collection.update_one(
        {"_id": req_obj_id},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.utcnow()
        }}
    )

    # Notify Manager if pending request was withdrawn
    if leave_req.get("reporting_manager_id"):
        manager_emp = await employees_collection.find_one({"_id": leave_req["reporting_manager_id"]})
        if manager_emp and manager_emp.get("user_id"):
            emp_name = auth_user.get("username", "Employee")
            await create_notification(
                recipient_id=manager_emp["user_id"],
                title=f"Leave Request {new_status}",
                message=f"{emp_name} has {new_status.lower()} their leave request for {total_days} day(s).",
                notification_type="LEAVE_CANCELLED",
                sender_id=auth_user["_id"],
                related_entity_id=req_obj_id
            )

    # Audit Log
    await create_audit_log(
        user_id=auth_user["_id"],
        action="CANCEL_LEAVE",
        entity_type="leave_request",
        entity_id=req_obj_id,
        details={"previous_status": current_status, "new_status": new_status, "reason": cancellation_reason}
    )

    return {"message": f"Leave request {new_status.lower()} successfully.", "request_id": request_id, "status": new_status}


# =====================================================
# FETCHING LEAVE REQUESTS
# =====================================================

async def get_my_leave_requests(user_payload: dict):
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})
    if not user:
        return []

    requests = []
    cursor = leave_requests_collection.find({"user_id": user["_id"]}).sort("created_at", -1)
    async for req in cursor:
        lt = await leave_types_collection.find_one({"_id": req["leave_type_id"]})
        lt_name = lt["name"] if lt else "Leave"

        mgr_name = "Direct to HR / Admin"
        if req.get("reporting_manager_id"):
            mgr_emp = await employees_collection.find_one({"_id": req["reporting_manager_id"]})
            if mgr_emp:
                mgr_name = f"{mgr_emp.get('first_name', '')} {mgr_emp.get('last_name', '')}".strip()

        requests.append({
            "_id": str(req["_id"]),
            "employee_id": str(req["employee_id"]),
            "leave_type_id": str(req["leave_type_id"]),
            "leave_type_name": lt_name,
            "start_date": req["start_date"].strftime("%Y-%m-%d"),
            "end_date": req["end_date"].strftime("%Y-%m-%d"),
            "is_half_day": req.get("is_half_day", False),
            "half_day_session": req.get("half_day_session"),
            "total_days": float(req["total_days"]),
            "reason": req.get("reason", ""),
            "attachment_url": req.get("attachment_url"),
            "contact_number": req.get("contact_number"),
            "status": req.get("status", "Pending"),
            "reporting_manager_name": mgr_name,
            "approval_comment": req.get("approval_comment"),
            "rejection_reason": req.get("rejection_reason"),
            "created_at": req.get("created_at").isoformat() if req.get("created_at") else None
        })

    return requests


async def get_pending_approvals_for_user(user_payload: dict):
    email = user_payload.get("sub")
    role = user_payload.get("role", "Employee")
    user = await users_collection.find_one({"email": email})
    if not user:
        return []

    # Find or link Manager's employee record
    manager_emp = await employees_collection.find_one({"user_id": user["_id"]})
    if not manager_emp:
        manager_emp = await employees_collection.find_one({"email": email})
        if manager_emp and "user_id" not in manager_emp:
            await employees_collection.update_one({"_id": manager_emp["_id"]}, {"$set": {"user_id": user["_id"]}})
            manager_emp["user_id"] = user["_id"]

    if not manager_emp and role in ("Manager", "Admin", "HR"):
        name_parts = user.get("username", email.split("@")[0]).split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        emp_code = f"EMP-{str(user['_id'])[-6:].upper()}"
        new_emp = {
            "user_id": user["_id"],
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": "",
            "department": "Management",
            "designation": role,
            "address": "",
            "emergency_contact_name": "",
            "emergency_contact_phone": "",
            "joining_date": datetime.utcnow(),
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await employees_collection.insert_one(new_emp)
        new_emp["_id"] = res.inserted_id
        manager_emp = new_emp

    requests = []
    cursor = leave_requests_collection.find({"status": "Pending"}).sort("created_at", -1)
    async for req in cursor:
        # Exclude self-requests
        if str(req["user_id"]) == str(user["_id"]):
            continue

        can_see = False
        if role in ("Admin", "HR"):
            can_see = True
        elif manager_emp:
            req_mgr = str(req["reporting_manager_id"]) if req.get("reporting_manager_id") else None
            mgr_id_str = str(manager_emp["_id"])
            user_id_str = str(user["_id"])

            if req_mgr and req_mgr in (mgr_id_str, user_id_str):
                can_see = True
            else:
                applicant_emp = await employees_collection.find_one({"_id": req["employee_id"]})
                applicant_mgr = str(applicant_emp["reporting_manager_id"]) if applicant_emp and applicant_emp.get("reporting_manager_id") else None
                if applicant_mgr and applicant_mgr in (mgr_id_str, user_id_str):
                    can_see = True
                elif not req_mgr and not applicant_mgr:
                    can_see = True

        if not can_see:
            continue

        emp = await employees_collection.find_one({"_id": req["employee_id"]})
        emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() if emp else "Employee"
        emp_code = emp.get("employee_id", "EMP-000") if emp else "EMP-000"
        dept_name = emp.get("department", "Engineering") if emp else "Engineering"

        lt = await leave_types_collection.find_one({"_id": req["leave_type_id"]})
        lt_name = lt["name"] if lt else "Leave"

        bal = await leave_balances_collection.find_one({
            "employee_id": req["employee_id"],
            "leave_type_id": req["leave_type_id"],
            "year": req["start_date"].year
        })
        rem_balance = float(bal["remaining"]) if bal else 0.0

        requests.append({
            "_id": str(req["_id"]),
            "employee_id": str(req["employee_id"]),
            "employee_code": emp_code,
            "employee_name": emp_name,
            "department": dept_name,
            "leave_type_id": str(req["leave_type_id"]),
            "leave_type_name": lt_name,
            "start_date": req["start_date"].strftime("%Y-%m-%d"),
            "end_date": req["end_date"].strftime("%Y-%m-%d"),
            "is_half_day": req.get("is_half_day", False),
            "half_day_session": req.get("half_day_session"),
            "total_days": float(req["total_days"]),
            "reason": req.get("reason", ""),
            "attachment_url": req.get("attachment_url"),
            "contact_number": req.get("contact_number"),
            "status": req["status"],
            "remaining_balance": rem_balance,
            "created_at": req.get("created_at").isoformat() if req.get("created_at") else None
        })

    return requests


async def get_all_leave_requests_filtered(
    department_name: Optional[str] = None,
    employee_id_str: Optional[str] = None,
    leave_type_id_str: Optional[str] = None,
    status_filter: Optional[str] = None
):
    query = {}
    if status_filter and status_filter != "All":
        query["status"] = status_filter
    if leave_type_id_str:
        try:
            query["leave_type_id"] = ObjectId(leave_type_id_str)
        except Exception:
            pass
    if employee_id_str:
        try:
            query["employee_id"] = ObjectId(employee_id_str)
        except Exception:
            pass

    requests = []
    cursor = leave_requests_collection.find(query).sort("created_at", -1)
    async for req in cursor:
        emp = await employees_collection.find_one({"_id": req["employee_id"]})
        if not emp:
            continue

        emp_dept = emp.get("department", "Engineering")
        if department_name and department_name != "All" and emp_dept != department_name:
            continue

        emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip()
        emp_code = emp.get("employee_id", "EMP-000")

        lt = await leave_types_collection.find_one({"_id": req["leave_type_id"]})
        lt_name = lt["name"] if lt else "Leave"

        requests.append({
            "_id": str(req["_id"]),
            "employee_id": str(req["employee_id"]),
            "employee_code": emp_code,
            "employee_name": emp_name,
            "department": emp_dept,
            "leave_type_id": str(req["leave_type_id"]),
            "leave_type_name": lt_name,
            "start_date": req["start_date"].strftime("%Y-%m-%d"),
            "end_date": req["end_date"].strftime("%Y-%m-%d"),
            "is_half_day": req.get("is_half_day", False),
            "half_day_session": req.get("half_day_session"),
            "total_days": float(req["total_days"]),
            "reason": req.get("reason", ""),
            "attachment_url": req.get("attachment_url"),
            "status": req.get("status", "Pending"),
            "approval_comment": req.get("approval_comment"),
            "rejection_reason": req.get("rejection_reason"),
            "created_at": req.get("created_at").isoformat() if req.get("created_at") else None
        })

    return requests


# =====================================================
# LEAVE TYPE & HOLIDAY & BALANCE MANAGEMENT (HR/Admin)
# =====================================================

async def get_all_leave_types():
    types = []
    async for lt in leave_types_collection.find().sort("name", 1):
        name_lower = lt.get("name", "").lower()
        if "earned" in name_lower or "unpaid" in name_lower:
            continue
        types.append({
            "_id": str(lt["_id"]),
            "name": lt["name"],
            "description": lt.get("description", ""),
            "annual_allocation": float(lt.get("annual_allocation", 12.0)),
            "carry_forward_allowed": lt.get("carry_forward_allowed", False),
            "maximum_consecutive_days": lt.get("maximum_consecutive_days", 5),
            "requires_attachment": lt.get("requires_attachment", False),
            "requires_approval": lt.get("requires_approval", True),
            "allow_negative_balance": lt.get("allow_negative_balance", False),
            "is_active": lt.get("is_active", True)
        })
    return types

async def create_leave_type(data: dict, user_payload: dict):
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})

    doc = {
        "name": data["name"].strip(),
        "description": data.get("description", "").strip(),
        "annual_allocation": float(data.get("annual_allocation", 12.0)),
        "carry_forward_allowed": bool(data.get("carry_forward_allowed", False)),
        "maximum_consecutive_days": int(data["maximum_consecutive_days"]) if data.get("maximum_consecutive_days") else None,
        "requires_attachment": bool(data.get("requires_attachment", False)),
        "requires_approval": bool(data.get("requires_approval", True)),
        "allow_negative_balance": bool(data.get("allow_negative_balance", False)),
        "is_active": bool(data.get("is_active", True)),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    res = await leave_types_collection.insert_one(doc)
    if user:
        await create_audit_log(user["_id"], "LEAVE_TYPE_CREATED", "leave_type", res.inserted_id, doc)
    return str(res.inserted_id)

async def update_leave_type(leave_type_id: str, data: dict, user_payload: dict):
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})

    try:
        lt_obj_id = ObjectId(leave_type_id)
    except Exception:
        return None

    update_fields = {k: v for k, v in data.items() if v is not None}
    update_fields["updated_at"] = datetime.utcnow()

    res = await leave_types_collection.update_one({"_id": lt_obj_id}, {"$set": update_fields})
    if res.matched_count > 0 and user:
        await create_audit_log(user["_id"], "LEAVE_TYPE_UPDATED", "leave_type", lt_obj_id, update_fields)
        return True
    return False

# --- Holidays ---

async def get_all_holidays():
    hols = []
    async for h in holidays_collection.find().sort("date", 1):
        hols.append({
            "_id": str(h["_id"]),
            "name": h["name"],
            "date": h["date"].strftime("%Y-%m-%d"),
            "is_active": h.get("is_active", True)
        })
    return hols

async def create_holiday(data: dict, user_payload: dict):
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})

    dt = datetime.combine(data["date"], datetime.min.time())
    doc = {
        "name": data["name"].strip(),
        "date": dt,
        "is_active": bool(data.get("is_active", True)),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    res = await holidays_collection.insert_one(doc)
    if user:
        await create_audit_log(user["_id"], "HOLIDAY_CREATED", "holiday", res.inserted_id, doc)
    return str(res.inserted_id)

# --- HR Balance Adjustment ---

async def adjust_employee_leave_balance(employee_id_str: str, leave_type_id_str: str, new_allocated: float, reason: str, user_payload: dict):
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})

    try:
        emp_obj_id = ObjectId(employee_id_str)
        lt_obj_id = ObjectId(leave_type_id_str)
    except Exception:
        return {"error": "Invalid IDs", "status_code": 400}

    bal = await leave_balances_collection.find_one({"employee_id": emp_obj_id, "leave_type_id": lt_obj_id, "year": 2026})
    if not bal:
        return {"error": "Balance record not found", "status_code": 404}

    old_allocated = float(bal["allocated"])
    new_remaining = new_allocated - float(bal["used"]) - float(bal["pending"])

    await leave_balances_collection.update_one(
        {"_id": bal["_id"]},
        {"$set": {"allocated": new_allocated, "remaining": new_remaining, "updated_at": datetime.utcnow()}}
    )

    if user:
        await create_audit_log(
            user["_id"],
            "BALANCE_ADJUSTMENT",
            "leave_balance",
            bal["_id"],
            {"old_allocated": old_allocated, "new_allocated": new_allocated, "reason": reason}
        )

    return {"message": "Leave balance adjusted successfully."}
