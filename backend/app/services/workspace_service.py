import os
from datetime import datetime, timedelta, time as dtime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.connection import db
from app.services.notification_service import create_notification

desks_collection = db["workspace_desks"]
reservations_collection = db["workspace_reservations"]
employees_collection = db["employees"]
users_collection = db["users"]

# Configurable business policy defaults
OFFICE_START_HOUR = 9   # 09:00
OFFICE_END_HOUR = 18   # 18:00
MIN_BOOKING_MINUTES = 30
MAX_BOOKING_HOURS = 8
CANCELLATION_DEADLINE_MINUTES = 15


# ==========================================
# INITIALIZATION & SEEDING
# ==========================================

async def init_workspace_desks():
    """Create database indexes and seed sample workspace desks if empty."""
    try:
        # workspace_desks indexes
        await desks_collection.create_index("desk_code", unique=True)
        await desks_collection.create_index("floor")
        await desks_collection.create_index("zone")
        await desks_collection.create_index("status")
        await desks_collection.create_index("is_active")

        # workspace_reservations indexes
        await reservations_collection.create_index([
            ("desk_id", 1), ("date", 1), ("start_time", 1), ("end_time", 1)
        ])
        await reservations_collection.create_index([("employee_id", 1), ("status", 1)])
        await reservations_collection.create_index([("start_time", 1), ("end_time", 1)])
    except Exception as e:
        print("Workspace index creation notice:", e)

    # Seed sample desks if collection is empty
    count = await desks_collection.count_documents({})
    if count == 0:
        sample_desks = [
            {
                "desk_code": "D-1-001",
                "desk_name": "Hot Desk 001",
                "floor": 1,
                "zone": "Atrium Open Workspace",
                "location": "Ground Floor Atrium",
                "building": "Main Office",
                "description": "Ergonomic workspace near main reception with natural daylight.",
                "capacity": 1,
                "workspace_type": "Standard Desk",
                "is_accessible": True,
                "facilities": ["Monitor", "USB-C", "Wi-Fi", "Ergonomic Chair", "Power Outlet"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "desk_code": "D-2-015",
                "desk_name": "Desk 015 (Engineering)",
                "floor": 2,
                "zone": "Engineering Zone",
                "location": "North Wing - 2nd Floor",
                "building": "Main Office",
                "description": "High-spec workstation optimized for software development with dual monitors.",
                "capacity": 1,
                "workspace_type": "Standing Desk",
                "is_accessible": False,
                "facilities": ["Dual Monitor", "USB-C", "Docking Station", "Wi-Fi", "Ergonomic Chair", "Standing Desk", "Power Outlet"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "desk_code": "D-2-016",
                "desk_name": "Quiet Workstation 016",
                "floor": 2,
                "zone": "Engineering Zone",
                "location": "North Wing - Quiet Section",
                "building": "Main Office",
                "description": "Focus desk situated in deep-work quiet zone with acoustic dividers.",
                "capacity": 1,
                "workspace_type": "Quiet Desk",
                "is_accessible": False,
                "facilities": ["Monitor", "USB-C", "Wi-Fi", "Power Outlet", "Keyboard", "Mouse"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "desk_code": "D-3-102",
                "desk_name": "Collaborative Desk 102",
                "floor": 3,
                "zone": "Product & Design",
                "location": "East Wing Pod 3",
                "building": "Main Office",
                "description": "Spacious desk adjacent to team whiteboard area for design syncs.",
                "capacity": 1,
                "workspace_type": "Collaborative Desk",
                "is_accessible": True,
                "facilities": ["Monitor", "USB-C", "Wi-Fi", "Ergonomic Chair"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "desk_code": "D-3-105",
                "desk_name": "Executive Desk 105",
                "floor": 3,
                "zone": "Executive Suite",
                "location": "South Wing Executive Corridor",
                "building": "Main Office",
                "description": "Premium workstation with privacy screen and desk docking setup.",
                "capacity": 1,
                "workspace_type": "Executive Desk",
                "is_accessible": True,
                "facilities": ["Dual Monitor", "Docking Station", "USB-C", "Wi-Fi", "Ergonomic Chair", "Power Outlet"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "desk_code": "D-4-201",
                "desk_name": "Finance Pod Desk 201",
                "floor": 4,
                "zone": "Finance & HR",
                "location": "West Tower 4th Floor",
                "building": "Main Office",
                "description": "Secure workspace located within the finance department wing.",
                "capacity": 1,
                "workspace_type": "Standard Desk",
                "is_accessible": False,
                "facilities": ["Monitor", "Power Outlet", "Wi-Fi"],
                "status": "Available",
                "is_active": True,
                "image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await desks_collection.insert_many(sample_desks)
        print("Seeded 6 default workspace hot desks.")


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def format_iso_utc(dt) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, datetime):
        s = dt.isoformat()
    else:
        s = str(dt)
    if not s.endswith("Z"):
        s += "Z"
    return s


async def get_employee_from_user(user_payload: dict):
    """Resolve authenticated user payload to employee document."""
    email = user_payload.get("sub")
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found.")

    emp = await employees_collection.find_one({"user_id": user["_id"]})
    if not emp:
        emp = await employees_collection.find_one({"email": email})

    if not emp:
        # Fallback: Auto-provision basic employee record for management accounts if missing
        name_parts = user.get("username", email.split("@")[0]).split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        emp_doc = {
            "user_id": user["_id"],
            "employee_id": f"EMP-{str(user['_id'])[-6:].upper()}",
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "department": "General",
            "designation": user.get("role", "Employee"),
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await employees_collection.insert_one(emp_doc)
        emp_doc["_id"] = res.inserted_id
        emp = emp_doc

    return user, emp


async def compute_desk_current_status(desk: dict, check_dt: Optional[datetime] = None) -> str:
    """
    Compute dynamic current desk availability status:
    'Inactive', 'Maintenance', 'Reserved', or 'Available Now'.
    """
    if not desk.get("is_active", True):
        return "Inactive"
    if desk.get("status") == "Maintenance":
        return "Maintenance"

    if check_dt is None:
        check_dt = datetime.utcnow()

    # Check for active confirmed reservation overlapping target check time
    active_res = await reservations_collection.find_one({
        "desk_id": desk["_id"],
        "status": "Confirmed",
        "start_time": {"$lte": check_dt},
        "end_time": {"$gt": check_dt}
    })

    if active_res:
        return "Reserved"
    return "Available Now"


# ==========================================
# WORKSPACE DESK APIS
# ==========================================

async def get_all_desks_filtered(
    search: Optional[str] = None,
    floor: Optional[int] = None,
    zone: Optional[str] = None,
    workspace_type: Optional[str] = None,
    facility: Optional[str] = None,
    is_accessible: Optional[bool] = None,
    status_filter: Optional[str] = None,
    target_date: Optional[str] = None
):
    """List hot desks with filters and calculated current status."""
    query = {"is_active": True}

    if floor is not None:
        query["floor"] = floor
    if zone and zone != "All":
        query["zone"] = {"$regex": zone, "$options": "i"}
    if workspace_type and workspace_type != "All":
        query["workspace_type"] = workspace_type
    if is_accessible is not None and is_accessible:
        query["is_accessible"] = True
    if facility:
        query["facilities"] = facility

    if search:
        query["$or"] = [
            {"desk_code": {"$regex": search, "$options": "i"}},
            {"desk_name": {"$regex": search, "$options": "i"}},
            {"zone": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"building": {"$regex": search, "$options": "i"}}
        ]

    now = datetime.utcnow()
    desks = []
    cursor = desks_collection.find(query).sort("desk_code", 1)

    async for d in cursor:
        curr_status = await compute_desk_current_status(d, now)

        # Apply status_filter
        if status_filter and status_filter != "All":
            if status_filter in ("Available", "Available Now") and curr_status != "Available Now":
                continue
            if status_filter in ("Reserved", "Occupied") and curr_status != "Reserved":
                continue
            if status_filter == "Maintenance" and curr_status != "Maintenance":
                continue

        desks.append({
            "id": str(d["_id"]),
            "desk_code": d["desk_code"],
            "desk_name": d["desk_name"],
            "floor": d["floor"],
            "zone": d["zone"],
            "location": d.get("location", "Main Office"),
            "building": d.get("building", "Main Office"),
            "description": d.get("description", ""),
            "capacity": d.get("capacity", 1),
            "workspace_type": d.get("workspace_type", "Standard Desk"),
            "is_accessible": d.get("is_accessible", False),
            "facilities": d.get("facilities", []),
            "status": d.get("status", "Available"),
            "current_status": curr_status,
            "image_url": d.get("image_url"),
            "is_active": d.get("is_active", True),
            "created_at": format_iso_utc(d.get("created_at"))
        })

    return desks


async def get_desk_details_by_id(desk_id_str: str, target_date_str: Optional[str] = None):
    """Fetch details and schedule for a specific desk on target_date."""
    try:
        d_id = ObjectId(desk_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Desk ID format.")

    desk = await desks_collection.find_one({"_id": d_id})
    if not desk:
        raise HTTPException(status_code=404, detail="Workspace desk not found.")

    now = datetime.utcnow()
    curr_status = await compute_desk_current_status(desk, now)

    # Determine date range for schedule
    if target_date_str:
        try:
            parsed_date = datetime.strptime(target_date_str, "%Y-%m-%d")
            start_of_day = datetime(parsed_date.year, parsed_date.month, parsed_date.day, 0, 0, 0)
        except ValueError:
            start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0)
    else:
        start_of_day = datetime(now.year, now.month, now.day, 0, 0, 0)

    end_of_day = start_of_day + timedelta(days=1)

    res_cursor = reservations_collection.find({
        "desk_id": d_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_of_day},
        "end_time": {"$gt": start_of_day}
    }).sort("start_time", 1)

    today_schedule = []
    async for r in res_cursor:
        emp = await employees_collection.find_one({"_id": r["employee_id"]})
        emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() if emp else "Employee"

        today_schedule.append({
            "reservation_id": str(r["_id"]),
            "employee_name": emp_name,
            "purpose": r.get("purpose", "Office work"),
            "start_time": format_iso_utc(r["start_time"]),
            "end_time": format_iso_utc(r["end_time"])
        })

    return {
        "id": str(desk["_id"]),
        "desk_code": desk["desk_code"],
        "desk_name": desk["desk_name"],
        "floor": desk["floor"],
        "zone": desk["zone"],
        "location": desk.get("location", ""),
        "building": desk.get("building", "Main Office"),
        "description": desk.get("description", ""),
        "capacity": desk.get("capacity", 1),
        "workspace_type": desk.get("workspace_type", "Standard Desk"),
        "is_accessible": desk.get("is_accessible", False),
        "facilities": desk.get("facilities", []),
        "status": desk.get("status", "Available"),
        "current_status": curr_status,
        "image_url": desk.get("image_url"),
        "is_active": desk.get("is_active", True),
        "today_schedule": today_schedule
    }


async def check_desk_availability(desk_id_str: str, start_time: datetime, end_time: datetime):
    """Check whether desk is available during specified start_time and end_time."""
    if start_time.tzinfo is not None:
        start_time = start_time.replace(tzinfo=None)
    if end_time.tzinfo is not None:
        end_time = end_time.replace(tzinfo=None)

    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be strictly before end time.")

    try:
        d_id = ObjectId(desk_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Desk ID format.")

    desk = await desks_collection.find_one({"_id": d_id})
    if not desk or not desk.get("is_active", True):
        return {"available": False, "reason": "Desk is inactive or does not exist.", "conflicts": []}

    if desk.get("status") == "Maintenance":
        return {"available": False, "reason": "Desk is currently under maintenance.", "conflicts": []}

    # Query overlapping confirmed reservations
    conflict = await reservations_collection.find_one({
        "desk_id": d_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_time},
        "end_time": {"$gt": start_time}
    })

    if conflict:
        return {
            "available": False,
            "reason": "This desk is already reserved during the selected time.",
            "conflicts": [{
                "start_time": format_iso_utc(conflict["start_time"]),
                "end_time": format_iso_utc(conflict["end_time"]),
                "purpose": conflict.get("purpose", "")
            }]
        }

    return {
        "available": True,
        "desk_id": desk_id_str,
        "desk_name": desk["desk_name"],
        "start_time": format_iso_utc(start_time),
        "end_time": format_iso_utc(end_time),
        "conflicts": []
    }


# ==========================================
# WORKSPACE RESERVATION MANAGEMENT
# ==========================================

async def create_reservation(user_payload: dict, res_data):
    """Create a hot-desk reservation with strict enterprise rules."""
    user, emp = await get_employee_from_user(user_payload)
    role = user_payload.get("role", "Employee")

    if role == "User":
        raise HTTPException(status_code=403, detail="Normal User account cannot reserve a workspace. Employee profile required.")

    # 1. Parse & Validate Desk
    try:
        d_id = ObjectId(res_data.desk_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Desk ID format.")

    desk = await desks_collection.find_one({"_id": d_id})
    if not desk or not desk.get("is_active", True):
        raise HTTPException(status_code=400, detail="The selected desk is not active or available.")

    if desk.get("status") == "Maintenance":
        raise HTTPException(status_code=400, detail="Desk is currently under maintenance.")

    # 2. Parse Datetimes & Validate timezone
    start_dt = res_data.start_time
    end_dt = res_data.end_time
    now = datetime.utcnow()

    if start_dt.tzinfo is not None:
        start_dt = start_dt.replace(tzinfo=None)
    if end_dt.tzinfo is not None:
        end_dt = end_dt.replace(tzinfo=None)

    if start_dt >= end_dt:
        raise HTTPException(status_code=400, detail="End time must be strictly after start time.")

    # 3. Past Date & Past Time Validation
    if start_dt < (now - timedelta(minutes=5)):
        raise HTTPException(status_code=400, detail="Cannot reserve a workspace for a past date or time.")

    # 4. Office Working Hours Validation (09:00 -> 18:00)
    if start_dt.time() < dtime(OFFICE_START_HOUR, 0) or end_dt.time() > dtime(OFFICE_END_HOUR, 0):
        raise HTTPException(
            status_code=400,
            detail=f"Reservation must be within office working hours ({OFFICE_START_HOUR:02d}:00 to {OFFICE_END_HOUR:02d}:00)."
        )

    # 5. Booking Duration Validation (30m min, 8h max)
    duration_minutes = (end_dt - start_dt).total_seconds() / 60.0
    if duration_minutes < MIN_BOOKING_MINUTES:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum reservation duration is {MIN_BOOKING_MINUTES} minutes."
        )

    if duration_minutes > (MAX_BOOKING_HOURS * 60):
        raise HTTPException(
            status_code=400,
            detail=f"Maximum reservation duration is {MAX_BOOKING_HOURS} hours."
        )

    # 6. Double-booking Conflict Check on Desk
    desk_conflict = await reservations_collection.find_one({
        "desk_id": d_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_dt},
        "end_time": {"$gt": start_dt}
    })

    if desk_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This desk is already reserved during the selected time."
        )

    # 7. Same Employee Conflict Check (One desk per employee during overlapping window)
    emp_conflict = await reservations_collection.find_one({
        "employee_id": emp["_id"],
        "status": "Confirmed",
        "start_time": {"$lt": end_dt},
        "end_time": {"$gt": start_dt}
    })

    if emp_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a workspace reservation during this time."
        )

    # 8. Create Reservation Document
    date_str = res_data.date if res_data.date else start_dt.strftime("%Y-%m-%d")

    new_res = {
        "desk_id": d_id,
        "employee_id": emp["_id"],
        "user_id": user["_id"],
        "date": date_str,
        "start_time": start_dt,
        "end_time": end_dt,
        "purpose": res_data.purpose or "Office work",
        "notes": res_data.notes.strip() if res_data.notes else "",
        "status": "Confirmed",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    inserted = await reservations_collection.insert_one(new_res)
    res_id = str(inserted.inserted_id)

    # 9. Send Notification to Employee
    await create_notification(
        recipient_id=user["_id"],
        title="Workspace Reservation Confirmed",
        message=f"Your reservation for {desk['desk_name']} ({desk['desk_code']}) on {date_str} ({start_dt.strftime('%H:%M')}–{end_dt.strftime('%H:%M')}) is confirmed.",
        notification_type="WORKSPACE_RESERVED",
        sender_id=user["_id"],
        related_entity_id=inserted.inserted_id
    )

    return {
        "message": "Workspace reserved successfully!",
        "reservation_id": res_id,
        "desk_code": desk["desk_code"],
        "desk_name": desk["desk_name"],
        "status": "Confirmed"
    }


async def get_my_reservations(user_payload: dict):
    """Retrieve authenticated employee's workspace reservations."""
    user, emp = await get_employee_from_user(user_payload)
    now = datetime.utcnow()

    cursor = reservations_collection.find({
        "$or": [
            {"employee_id": emp["_id"]},
            {"employee_id": str(emp["_id"])},
            {"user_id": user["_id"]},
            {"user_id": str(user["_id"])}
        ]
    }).sort("start_time", -1)

    result = []
    async for r in cursor:
        desk = await desks_collection.find_one({"_id": r["desk_id"]})
        status_val = r.get("status", "Confirmed")

        # Auto update status to Completed if time passed
        if status_val == "Confirmed" and r["end_time"] < now:
            status_val = "Completed"

        result.append({
            "id": str(r["_id"]),
            "desk_id": str(r["desk_id"]),
            "desk_name": desk["desk_name"] if desk else "Hot Desk",
            "desk_code": desk["desk_code"] if desk else "",
            "building": desk.get("building", "Main Office") if desk else "",
            "floor": desk.get("floor", 1) if desk else 1,
            "zone": desk.get("zone", "") if desk else "",
            "location": desk.get("location", "") if desk else "",
            "employee_id": str(r["employee_id"]),
            "user_id": str(r["user_id"]),
            "employee_name": f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip(),
            "employee_email": emp.get("email", ""),
            "department": emp.get("department", ""),
            "date": r.get("date", r["start_time"].strftime("%Y-%m-%d")),
            "start_time": format_iso_utc(r["start_time"]),
            "end_time": format_iso_utc(r["end_time"]),
            "purpose": r.get("purpose", "Office work"),
            "notes": r.get("notes", ""),
            "status": status_val,
            "created_at": format_iso_utc(r.get("created_at"))
        })

    return result


async def cancel_reservation(reservation_id_str: str, user_payload: dict, cancellation_reason: str = "Cancelled by employee"):
    """Cancel an existing workspace reservation adhering to authorization & 15m cancellation deadline."""
    user, emp = await get_employee_from_user(user_payload)
    role = user_payload.get("role", "Employee")

    try:
        r_id = ObjectId(reservation_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Reservation ID format.")

    res_doc = await reservations_collection.find_one({"_id": r_id})
    if not res_doc:
        raise HTTPException(status_code=404, detail="Reservation record not found.")

    # Authorization check
    is_owner = str(res_doc["employee_id"]) == str(emp["_id"]) or str(res_doc.get("user_id")) == str(user["_id"])
    is_admin_or_fm = role in ("Admin", "Facility Manager")

    if not (is_owner or is_admin_or_fm):
        raise HTTPException(status_code=403, detail="You are not authorized to cancel this workspace reservation.")

    if res_doc["status"] == "Cancelled":
        raise HTTPException(status_code=400, detail="This reservation is already cancelled.")

    # Cancellation deadline check: 15 minutes before reservation start
    now = datetime.utcnow()
    deadline = res_doc["start_time"] - timedelta(minutes=CANCELLATION_DEADLINE_MINUTES)
    if now > deadline and not is_admin_or_fm:
        raise HTTPException(
            status_code=400,
            detail=f"Reservations cannot be cancelled less than {CANCELLATION_DEADLINE_MINUTES} minutes before the start time."
        )

    await reservations_collection.update_one(
        {"_id": r_id},
        {"$set": {
            "status": "Cancelled",
            "cancellation_reason": cancellation_reason,
            "updated_at": datetime.utcnow()
        }}
    )

    desk = await desks_collection.find_one({"_id": res_doc["desk_id"]})
    desk_name = desk["desk_name"] if desk else "Hot Desk"

    await create_notification(
        recipient_id=user["_id"],
        title="Workspace Reservation Cancelled",
        message=f"Your reservation for {desk_name} on {res_doc.get('date')} has been cancelled.",
        notification_type="WORKSPACE_CANCELLED",
        sender_id=user["_id"],
        related_entity_id=r_id
    )

    return {
        "message": "Workspace reservation cancelled successfully.",
        "reservation_id": reservation_id_str,
        "status": "Cancelled"
    }


async def get_all_organization_reservations(user_payload: dict, desk_id: Optional[str] = None, status_filter: Optional[str] = None):
    """Facility Manager / Admin view of all organization reservations."""
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager", "HR"):
        raise HTTPException(status_code=403, detail="Access denied. Admin or Facility Manager role required.")

    query = {}
    if status_filter and status_filter != "All":
        query["status"] = status_filter
    if desk_id and desk_id != "All":
        try:
            query["desk_id"] = ObjectId(desk_id)
        except Exception:
            pass

    cursor = reservations_collection.find(query).sort("start_time", -1)
    results = []
    now = datetime.utcnow()

    async for r in cursor:
        desk = await desks_collection.find_one({"_id": r["desk_id"]})
        emp = await employees_collection.find_one({"_id": r["employee_id"]})

        status_val = r.get("status", "Confirmed")
        if status_val == "Confirmed" and r["end_time"] < now:
            status_val = "Completed"

        results.append({
            "id": str(r["_id"]),
            "desk_id": str(r["desk_id"]),
            "desk_name": desk["desk_name"] if desk else "Desk",
            "desk_code": desk["desk_code"] if desk else "",
            "building": desk.get("building", "") if desk else "",
            "floor": desk.get("floor", 1) if desk else 1,
            "zone": desk.get("zone", "") if desk else "",
            "employee_id": str(r["employee_id"]),
            "employee_name": f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() if emp else "Employee",
            "employee_email": emp.get("email", "") if emp else "",
            "department": emp.get("department", "") if emp else "",
            "date": r.get("date", r["start_time"].strftime("%Y-%m-%d")),
            "start_time": format_iso_utc(r["start_time"]),
            "end_time": format_iso_utc(r["end_time"]),
            "purpose": r.get("purpose", "Office work"),
            "status": status_val,
            "created_at": format_iso_utc(r.get("created_at"))
        })

    return results


# ==========================================
# DESK MANAGEMENT (ADMIN / FACILITY MANAGER)
# ==========================================

async def create_desk(desk_data, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can create workspace desks.")

    # Check for duplicate desk_code
    existing = await desks_collection.find_one({"desk_code": desk_data.desk_code.strip()})
    if existing:
        raise HTTPException(status_code=409, detail=f"Desk code '{desk_data.desk_code}' already exists.")

    new_desk = {
        "desk_code": desk_data.desk_code.strip(),
        "desk_name": desk_data.desk_name.strip(),
        "floor": desk_data.floor,
        "zone": desk_data.zone.strip(),
        "location": desk_data.location.strip() if desk_data.location else "Main Office",
        "building": desk_data.building.strip() if desk_data.building else "Main Office",
        "description": desk_data.description.strip() if desk_data.description else "",
        "capacity": desk_data.capacity if desk_data.capacity else 1,
        "workspace_type": desk_data.workspace_type or "Standard Desk",
        "is_accessible": desk_data.is_accessible if desk_data.is_accessible is not None else False,
        "facilities": desk_data.facilities or [],
        "status": desk_data.status or "Available",
        "image_url": desk_data.image_url,
        "is_active": desk_data.is_active if desk_data.is_active is not None else True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = await desks_collection.insert_one(new_desk)
    return {"message": "Workspace desk created successfully.", "id": str(res.inserted_id)}


async def update_desk(desk_id_str: str, desk_data, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can update workspace desks.")

    try:
        d_id = ObjectId(desk_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Desk ID format.")

    update_fields = {k: v for k, v in desk_data.dict(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.utcnow()

    res = await desks_collection.update_one({"_id": d_id}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workspace desk not found.")

    return {"message": "Workspace desk updated successfully."}


async def deactivate_desk(desk_id_str: str, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can deactivate workspace desks.")

    try:
        d_id = ObjectId(desk_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Desk ID format.")

    desk = await desks_collection.find_one({"_id": d_id})
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found.")

    new_active = not desk.get("is_active", True)
    await desks_collection.update_one({"_id": d_id}, {"$set": {"is_active": new_active, "updated_at": datetime.utcnow()}})

    return {"message": f"Desk {'activated' if new_active else 'deactivated'} successfully.", "is_active": new_active}


# ==========================================
# SUMMARY STATS & ANALYTICS
# ==========================================

async def get_workspace_summary_stats(user_payload: dict):
    """Fetch live summary counts for Workspace header cards."""
    user, emp = await get_employee_from_user(user_payload)
    now = datetime.utcnow()

    total_desks = await desks_collection.count_documents({"is_active": True})

    # Available now count
    all_desks = await desks_collection.find({"is_active": True}).to_list(length=500)
    available_now = 0
    for d in all_desks:
        st = await compute_desk_current_status(d, now)
        if st == "Available Now":
            available_now += 1

    # Booked today count
    start_of_today = datetime(now.year, now.month, now.day, 0, 0, 0)
    end_of_today = start_of_today + timedelta(days=1)
    reserved_today = await reservations_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$lt": end_of_today},
        "end_time": {"$gt": start_of_today}
    })

    # My upcoming reservations
    my_upcoming = await reservations_collection.count_documents({
        "employee_id": emp["_id"],
        "status": "Confirmed",
        "start_time": {"$gte": now}
    })

    return {
        "available_now": available_now,
        "reserved_today": reserved_today,
        "my_upcoming": my_upcoming,
        "total_desks": total_desks
    }


async def get_workspace_analytics(user_payload: dict):
    """
    Calculate real workspace utilization stats for Facility Managers & Admins.
    Utilization Formula = (Total Booked Hours) / (Active Desks * Daily Work Hours * Days) * 100
    """
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Access denied. Admin or Facility Manager role required.")

    now = datetime.utcnow()
    start_of_today = datetime(now.year, now.month, now.day, 0, 0, 0)

    # Active desks count
    active_desks_count = await desks_collection.count_documents({"is_active": True, "status": {"$ne": "Maintenance"}})
    if active_desks_count == 0:
        return {
            "total_desks": 0,
            "average_utilization_pct": 0,
            "reservations_today": 0,
            "reservations_this_week": 0,
            "reservations_this_month": 0,
            "desk_utilization_list": []
        }

    # Time windows
    end_of_today = start_of_today + timedelta(days=1)
    start_of_week = start_of_today - timedelta(days=now.weekday())
    start_of_month = datetime(now.year, now.month, 1)

    res_today = await reservations_collection.count_documents({
        "status": "Confirmed", "start_time": {"$lt": end_of_today}, "end_time": {"$gt": start_of_today}
    })
    res_week = await reservations_collection.count_documents({
        "status": "Confirmed", "start_time": {"$gte": start_of_week}
    })
    res_month = await reservations_collection.count_documents({
        "status": "Confirmed", "start_time": {"$gte": start_of_month}
    })

    # Calculate average utilization over the last 30 days
    thirty_days_ago = start_of_today - timedelta(days=30)
    cursor = reservations_collection.find({
        "status": "Confirmed",
        "start_time": {"$gte": thirty_days_ago}
    })

    total_booked_hours_30d = 0.0
    desk_hours_map = {}

    async for r in cursor:
        duration_hrs = (r["end_time"] - r["start_time"]).total_seconds() / 3600.0
        total_booked_hours_30d += duration_hrs

        d_id_str = str(r["desk_id"])
        desk_hours_map[d_id_str] = desk_hours_map.get(d_id_str, 0.0) + duration_hrs

    # Available capacity over 30 days = active_desks * 30 days * 9 working hours/day
    total_capacity_hours_30d = active_desks_count * 30 * (OFFICE_END_HOUR - OFFICE_START_HOUR)
    avg_utilization_pct = round((total_booked_hours_30d / total_capacity_hours_30d) * 100, 1) if total_capacity_hours_30d > 0 else 0.0

    # Build per-desk utilization list
    all_desks = await desks_collection.find({"is_active": True}).to_list(length=500)
    desk_utilization_list = []
    max_desk_cap_hrs = 30 * (OFFICE_END_HOUR - OFFICE_START_HOUR)

    for d in all_desks:
        d_id_str = str(d["_id"])
        booked_hrs = desk_hours_map.get(d_id_str, 0.0)
        u_pct = round((booked_hrs / max_desk_cap_hrs) * 100, 1) if max_desk_cap_hrs > 0 else 0.0

        desk_utilization_list.append({
            "desk_id": d_id_str,
            "desk_code": d["desk_code"],
            "desk_name": d["desk_name"],
            "zone": d["zone"],
            "floor": d["floor"],
            "booked_hours_30d": round(booked_hrs, 1),
            "utilization_pct": min(u_pct, 100.0)
        })

    # Sort desk utilization list descending
    desk_utilization_list.sort(key=lambda x: x["utilization_pct"], reverse=True)

    return {
        "total_desks": active_desks_count,
        "average_utilization_pct": min(avg_utilization_pct, 100.0),
        "reservations_today": res_today,
        "reservations_this_week": res_week,
        "reservations_this_month": res_month,
        "desk_utilization_list": desk_utilization_list
    }
