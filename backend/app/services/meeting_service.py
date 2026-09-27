import os
from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.connection import db
from app.services.notification_service import create_notification

rooms_collection = db["meeting_rooms"]
bookings_collection = db["meeting_bookings"]
employees_collection = db["employees"]
users_collection = db["users"]

# ==========================================
# INITIALIZATION & SEEDING
# ==========================================

async def init_meeting_rooms():
    """Create database indexes and seed default rooms if empty."""
    try:
        await rooms_collection.create_index("room_code", unique=True)
        await rooms_collection.create_index("status")
        await rooms_collection.create_index("floor")
        await rooms_collection.create_index("is_active")

        await bookings_collection.create_index([("room_id", 1), ("start_time", 1), ("end_time", 1)])
        await bookings_collection.create_index([("organizer_employee_id", 1), ("status", 1)])
    except Exception as e:
        print("Index creation notice:", e)

    # Seed sample rooms if collection is empty
    count = await rooms_collection.count_documents({})
    if count == 0:
        sample_rooms = [
            {
                "room_name": "Conference Room A",
                "room_code": "CR-A-201",
                "floor": 2,
                "location": "North Wing",
                "capacity": 10,
                "description": "Executive conference room equipped with 4K display and VC.",
                "facilities": ["Projector", "Video Conferencing", "Whiteboard", "Smart Display", "Air Conditioning", "Wi-Fi"],
                "status": "Available",
                "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "room_name": "Executive Suite B",
                "room_code": "EX-B-402",
                "floor": 4,
                "location": "South Tower",
                "capacity": 16,
                "description": "Premium board discussion suite with high-capacity seating.",
                "facilities": ["4K Display", "Video Conferencing", "Whiteboard", "Air Conditioning", "Wi-Fi", "Power Outlets"],
                "status": "Available",
                "image_url": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "room_name": "Rapid Huddle Pod 101",
                "room_code": "HP-101",
                "floor": 1,
                "location": "Central Atrium",
                "capacity": 4,
                "description": "Quick discussion pod for agile standups and 1-on-1 syncs.",
                "facilities": ["Smart Display", "Whiteboard", "Wi-Fi"],
                "status": "Available",
                "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "room_name": "Boardroom East",
                "room_code": "BR-E-305",
                "floor": 3,
                "location": "East Wing",
                "capacity": 20,
                "description": "Large corporate boardroom for company-wide syncs and all-hands.",
                "facilities": ["Dual Projector", "Video Conferencing", "Whiteboard", "Air Conditioning", "Wi-Fi", "Power Outlets"],
                "status": "Available",
                "image_url": "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800&q=80",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await rooms_collection.insert_many(sample_rooms)
        print("Seeded 4 default meeting rooms.")


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
            "department": "Management",
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


async def compute_room_current_status(room: dict, now: Optional[datetime] = None) -> str:
    """Compute dynamic current status: Maintenance, Inactive, Occupied, or Available Now."""
    if not room.get("is_active", True):
        return "Inactive"
    if room.get("status") == "Maintenance":
        return "Maintenance"

    if now is None:
        now = datetime.utcnow()

    # Check for active confirmed booking overlapping current time
    active_booking = await bookings_collection.find_one({
        "room_id": room["_id"],
        "status": "Confirmed",
        "start_time": {"$lte": now},
        "end_time": {"$gt": now}
    })

    if active_booking:
        return "Occupied"
    return "Available Now"


# ==========================================
# ROOM APIS & SERVICES
# ==========================================

async def get_all_rooms_filtered(
    search: Optional[str] = None,
    floor: Optional[int] = None,
    min_capacity: Optional[int] = None,
    location: Optional[str] = None,
    status_filter: Optional[str] = None,
    facility: Optional[str] = None
):
    query = {"is_active": True}
    if floor is not None:
        query["floor"] = floor
    if min_capacity is not None and isinstance(min_capacity, (int, float)) and min_capacity > 0:
        query["capacity"] = {"$gte": int(min_capacity)}
    if location and location != "All":
        query["location"] = {"$regex": location, "$options": "i"}
    if facility:
        query["facilities"] = facility

    if search:
        query["$or"] = [
            {"room_name": {"$regex": search, "$options": "i"}},
            {"room_code": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]

    rooms = []
    now = datetime.utcnow()
    cursor = rooms_collection.find(query).sort("room_name", 1)

    async for r in cursor:
        curr_status = await compute_room_current_status(r, now)

        # Apply current_status filter if specified
        if status_filter and status_filter != "All":
            if status_filter in ("Available", "Available Now") and curr_status != "Available Now":
                continue
            if status_filter == "Occupied" and curr_status != "Occupied":
                continue
            if status_filter == "Maintenance" and curr_status != "Maintenance":
                continue

        created_at_str = format_iso_utc(r.get("created_at"))

        room_title = r.get("room_name") or r.get("name") or "Meeting Room"
        rooms.append({
            "id": str(r["_id"]),
            "name": room_title,
            "room_name": room_title,
            "room_code": r.get("room_code", f"CR-{str(r['_id'])[-4:]}"),
            "floor": r.get("floor", 1),
            "location": r.get("location", "Main Office"),
            "capacity": r.get("capacity", 8),
            "description": r.get("description", ""),
            "facilities": r.get("facilities", []),
            "status": r.get("status", "Available"),
            "current_status": curr_status,
            "image_url": r.get("image_url"),
            "is_active": r.get("is_active", True),
            "created_at": created_at_str
        })

    return rooms


async def get_room_details_by_id(room_id_str: str):
    try:
        r_id = ObjectId(room_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await rooms_collection.find_one({"_id": r_id})
    if not room:
        raise HTTPException(status_code=404, detail="Meeting room not found.")

    now = datetime.utcnow()
    curr_status = await compute_room_current_status(room, now)

    # Fetch today's schedule for this room
    start_of_today = datetime(now.year, now.month, now.day, 0, 0, 0)
    end_of_today = start_of_today + timedelta(days=1)

    bookings_cursor = bookings_collection.find({
        "room_id": r_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_of_today},
        "end_time": {"$gt": start_of_today}
    }).sort("start_time", 1)

    today_schedule = []
    async for b in bookings_cursor:
        org = await employees_collection.find_one({"_id": b["organizer_employee_id"]})
        org_name = f"{org.get('first_name', '')} {org.get('last_name', '')}".strip() if org else "Organizer"

        today_schedule.append({
            "booking_id": str(b["_id"]),
            "title": b["title"],
            "meeting_type": b.get("meeting_type", "Internal Sync"),
            "start_time": format_iso_utc(b["start_time"]),
            "end_time": format_iso_utc(b["end_time"]),
            "organizer_name": org_name,
            "attendee_count": len(b.get("attendees", [])) + 1
        })

    room_title = room.get("room_name") or room.get("name") or "Meeting Room"
    return {
        "id": str(room["_id"]),
        "name": room_title,
        "room_name": room_title,
        "room_code": room.get("room_code", f"CR-{str(room['_id'])[-4:]}"),
        "floor": room.get("floor", 1),
        "location": room.get("location", "Main Office"),
        "capacity": room.get("capacity", 8),
        "description": room.get("description", ""),
        "facilities": room.get("facilities", []),
        "status": room.get("status", "Available"),
        "current_status": curr_status,
        "image_url": room.get("image_url"),
        "is_active": room.get("is_active", True),
        "today_schedule": today_schedule
    }


async def check_room_availability(room_id_str: str, start_time: datetime, end_time: datetime):
    """Check whether room is available between start_time and end_time."""
    if start_time.tzinfo is not None:
        start_time = start_time.replace(tzinfo=None)
    if end_time.tzinfo is not None:
        end_time = end_time.replace(tzinfo=None)

    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be strictly before end time.")

    try:
        r_id = ObjectId(room_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await rooms_collection.find_one({"_id": r_id})
    if not room or not room.get("is_active", True):
        return {"available": False, "reason": "Room is inactive or does not exist.", "conflicts": []}

    if room.get("status") == "Maintenance":
        return {"available": False, "reason": "Room is currently under maintenance.", "conflicts": []}

    # Query conflicting bookings: existing.start_time < requested.end_time AND existing.end_time > requested.start_time
    conflicts_cursor = bookings_collection.find({
        "room_id": r_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_time},
        "end_time": {"$gt": start_time}
    })

    conflicts = []
    async for c in conflicts_cursor:
        conflicts.append({
            "title": c["title"],
            "start_time": format_iso_utc(c["start_time"]),
            "end_time": format_iso_utc(c["end_time"])
        })

    is_available = len(conflicts) == 0
    return {
        "available": is_available,
        "room_id": room_id_str,
        "room_name": room["room_name"],
        "start_time": format_iso_utc(start_time),
        "end_time": format_iso_utc(end_time),
        "conflicts": conflicts
    }


# ==========================================
# BOOKING CREATION & MANAGING
# ==========================================

async def create_booking(user_payload: dict, booking_data):
    user, emp = await get_employee_from_user(user_payload)

    # 1. Parse & Validate Room ID
    try:
        r_id = ObjectId(booking_data.room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await rooms_collection.find_one({"_id": r_id})
    if not room or not room.get("is_active", True):
        raise HTTPException(status_code=400, detail="The selected meeting room is not active or available.")

    if room.get("status") == "Maintenance":
        raise HTTPException(status_code=400, detail="This meeting room is currently under maintenance.")

    # 2. Validate Interval Dates & Times
    start_dt = booking_data.start_time
    end_dt = booking_data.end_time
    now = datetime.utcnow()

    if start_dt.tzinfo is not None:
        start_dt = start_dt.replace(tzinfo=None)
    if end_dt.tzinfo is not None:
        end_dt = end_dt.replace(tzinfo=None)

    if start_dt >= end_dt:
        raise HTTPException(status_code=400, detail="End time must be later than start time. Meeting duration must be greater than zero.")

    if end_dt <= now or start_dt < (now - timedelta(minutes=5)):
        raise HTTPException(status_code=400, detail="Cannot book a meeting room for a past time slot.")

    duration_seconds = (end_dt - start_dt).total_seconds()

    # Minimum duration check (15 minutes)
    if duration_seconds < 900:
        raise HTTPException(status_code=400, detail="Meeting duration must be at least 15 minutes.")

    # Maximum duration check (4 hours)
    if duration_seconds > 14400:
        raise HTTPException(status_code=400, detail="Meeting duration cannot exceed 4 hours.")

    # 3. Resolve & Validate Attendees
    organizer_emp_id = emp["_id"]
    attendee_obj_ids = []
    
    # Process attendees list
    for att_id_str in booking_data.attendees:
        try:
            att_obj_id = ObjectId(att_id_str)
            if att_obj_id != organizer_emp_id and att_obj_id not in attendee_obj_ids:
                # Verify active employee
                att_emp = await employees_collection.find_one({"_id": att_obj_id, "is_active": True})
                if att_emp:
                    attendee_obj_ids.append(att_obj_id)
        except Exception:
            continue

    total_participants = len(attendee_obj_ids) + 1 # Organizer counts as participant
    if total_participants > room["capacity"]:
        raise HTTPException(
            status_code=400,
            detail=f"Selected room cannot accommodate all attendees. Room capacity is {room['capacity']}."
        )

    # 4. Atomic Conflict Detection (Double-booking protection)
    conflict = await bookings_collection.find_one({
        "room_id": r_id,
        "status": "Confirmed",
        "start_time": {"$lt": end_dt},
        "end_time": {"$gt": start_dt}
    })

    if conflict:
        c_start = conflict['start_time'].strftime('%H:%M')
        c_end = conflict['end_time'].strftime('%H:%M')
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{room['room_name']} is already booked from {c_start} to {c_end}."
        )

    # 5. Insert Booking Document
    new_booking = {
        "room_id": r_id,
        "organizer_employee_id": organizer_emp_id,
        "organizer_user_id": user["_id"],
        "title": booking_data.title.strip(),
        "description": booking_data.description.strip() if booking_data.description else "",
        "meeting_type": booking_data.meeting_type or "Internal Sync",
        "start_time": start_dt,
        "end_time": end_dt,
        "attendees": attendee_obj_ids,
        "status": "Confirmed",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = await bookings_collection.insert_one(new_booking)
    booking_id = str(res.inserted_id)

    # 6. Trigger In-App Notification to Organizer
    await create_notification(
        recipient_id=user["_id"],
        title="Meeting Room Booking Confirmed",
        message=f"Your booking for '{room['room_name']}' ({booking_data.title}) on {start_dt.strftime('%b %d, %Y %H:%M')} is confirmed.",
        notification_type="MEETING_BOOKED",
        sender_id=user["_id"],
        related_entity_id=res.inserted_id
    )

    # Notify attendees who have user accounts
    for att_id in attendee_obj_ids:
        att_emp = await employees_collection.find_one({"_id": att_id})
        if att_emp and att_emp.get("user_id"):
            await create_notification(
                recipient_id=att_emp["user_id"],
                title="Meeting Invitation",
                message=f"You've been invited to '{booking_data.title}' in {room['room_name']} on {start_dt.strftime('%b %d, %Y %H:%M')}.",
                notification_type="MEETING_INVITE",
                sender_id=user["_id"],
                related_entity_id=res.inserted_id
            )

    return {
        "message": "Meeting room booked successfully!",
        "booking_id": booking_id,
        "room_name": room["room_name"],
        "status": "Confirmed"
    }


async def get_my_bookings(user_payload: dict):
    user, emp = await get_employee_from_user(user_payload)
    now = datetime.utcnow()

    # Match where user is organizer or in attendees
    cursor = bookings_collection.find({
        "$or": [
            {"organizer_employee_id": emp["_id"]},
            {"organizer_employee_id": str(emp["_id"])},
            {"organizer_user_id": user["_id"]},
            {"organizer_user_id": str(user["_id"])},
            {"attendees": emp["_id"]},
            {"attendees": str(emp["_id"])}
        ]
    }).sort("start_time", -1)

    bookings = []
    async for b in cursor:
        room = await rooms_collection.find_one({"_id": b["room_id"]})
        room_name = room["room_name"] if room else "Meeting Room"
        room_code = room["room_code"] if room else "ROOM"
        location = room["location"] if room else ""
        floor = room["floor"] if room else 1

        org = await employees_collection.find_one({"_id": b["organizer_employee_id"]})
        org_name = f"{org.get('first_name', '')} {org.get('last_name', '')}".strip() if org else "Organizer"
        org_email = org.get("email", "") if org else ""

        # Auto update status to Completed if passed
        status_val = b.get("status", "Confirmed")
        if status_val == "Confirmed" and b["end_time"] < now:
            status_val = "Completed"

        # Populate attendees objects
        att_list = []
        for att_id in b.get("attendees", []):
            att_e = await employees_collection.find_one({"_id": att_id})
            if att_e:
                att_list.append({
                    "id": str(att_e["_id"]),
                    "name": f"{att_e.get('first_name', '')} {att_e.get('last_name', '')}".strip(),
                    "email": att_e.get("email", ""),
                    "employee_id": att_e.get("employee_id", "")
                })

        bookings.append({
            "id": str(b["_id"]),
            "room_id": str(b["room_id"]),
            "room_name": room_name,
            "room_code": room_code,
            "location": location,
            "floor": floor,
            "organizer_employee_id": str(b["organizer_employee_id"]),
            "organizer_name": org_name,
            "organizer_email": org_email,
            "title": b["title"],
            "description": b.get("description", ""),
            "meeting_type": b.get("meeting_type", "Internal Sync"),
            "start_time": format_iso_utc(b["start_time"]),
            "end_time": format_iso_utc(b["end_time"]),
            "attendees": att_list,
            "attendee_count": len(att_list) + 1,
            "status": status_val,
            "created_at": format_iso_utc(b.get("created_at"))
        })

    return bookings


async def cancel_booking(booking_id_str: str, user_payload: dict, cancellation_reason: str = "Cancelled by user"):
    user, emp = await get_employee_from_user(user_payload)
    role = user_payload.get("role", "Employee")

    try:
        b_id = ObjectId(booking_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Booking ID format.")

    booking = await bookings_collection.find_one({"_id": b_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found.")

    # Authorization Check: Organizer, Admin, or Facility Manager
    is_organizer = str(booking["organizer_employee_id"]) == str(emp["_id"]) or str(booking.get("organizer_user_id")) == str(user["_id"])
    is_admin_or_facility = role in ("Admin", "Facility Manager")

    if not (is_organizer or is_admin_or_facility):
        raise HTTPException(status_code=403, detail="You are not authorized to cancel this meeting booking.")

    if booking["status"] == "Cancelled":
        raise HTTPException(status_code=400, detail="This booking has already been cancelled.")

    # Update status to Cancelled (Preserve record history)
    await bookings_collection.update_one(
        {"_id": b_id},
        {"$set": {
            "status": "Cancelled",
            "cancellation_reason": cancellation_reason,
            "updated_at": datetime.utcnow()
        }}
    )

    # Notify participants
    room = await rooms_collection.find_one({"_id": booking["room_id"]})
    room_name = room["room_name"] if room else "Meeting Room"

    for att_id in booking.get("attendees", []):
        att_emp = await employees_collection.find_one({"_id": att_id})
        if att_emp and att_emp.get("user_id"):
            await create_notification(
                recipient_id=att_emp["user_id"],
                title="Meeting Cancelled",
                message=f"The meeting '{booking['title']}' in {room_name} has been cancelled.",
                notification_type="MEETING_CANCELLED",
                sender_id=user["_id"],
                related_entity_id=b_id
            )

    return {"message": "Meeting booking cancelled successfully.", "booking_id": booking_id_str, "status": "Cancelled"}


# ==========================================
# FACILITY MANAGER & ADMIN ROOM CRUD
# ==========================================

async def create_room(room_data, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can create meeting rooms.")

    name_str = (room_data.room_name or room_data.name or "Meeting Room").strip()
    code_str = (room_data.room_code or f"RM-{int(datetime.utcnow().timestamp()) % 10000}").strip()

    # Check for duplicate room_code
    existing = await rooms_collection.find_one({"room_code": code_str})
    if existing:
        code_str = f"{code_str}-{int(datetime.utcnow().timestamp()) % 1000}"

    new_room = {
        "room_name": name_str,
        "name": name_str,
        "room_code": code_str,
        "floor": room_data.floor or 1,
        "location": (room_data.location or "Main Wing").strip(),
        "capacity": room_data.capacity or 8,
        "description": room_data.description.strip() if room_data.description else "",
        "facilities": room_data.facilities or [],
        "status": room_data.status or "Available",
        "image_url": room_data.image_url,
        "is_active": room_data.is_active if room_data.is_active is not None else True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = await rooms_collection.insert_one(new_room)
    return {"message": "Meeting room created successfully.", "id": str(res.inserted_id)}


async def update_room(room_id_str: str, room_data, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can update meeting rooms.")

    try:
        r_id = ObjectId(room_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    update_fields = {k: v for k, v in room_data.dict(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.utcnow()

    res = await rooms_collection.update_one({"_id": r_id}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found.")

    return {"message": "Meeting room updated successfully."}


async def deactivate_room(room_id_str: str, user_payload: dict):
    role = user_payload.get("role", "Employee")
    if role not in ("Admin", "Facility Manager"):
        raise HTTPException(status_code=403, detail="Only Facility Managers and Admins can deactivate meeting rooms.")

    try:
        r_id = ObjectId(room_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await rooms_collection.find_one({"_id": r_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    new_active = not room.get("is_active", True)
    await rooms_collection.update_one({"_id": r_id}, {"$set": {"is_active": new_active, "updated_at": datetime.utcnow()}})

    return {"message": f"Room {'activated' if new_active else 'deactivated'} successfully.", "is_active": new_active}


async def get_all_organization_bookings(user_payload: dict, room_id: Optional[str] = None, status_filter: Optional[str] = None):
    query = {}
    if status_filter and status_filter != "All":
        query["status"] = status_filter
    if room_id and room_id != "All":
        try:
            query["room_id"] = ObjectId(room_id)
        except Exception:
            pass

    cursor = bookings_collection.find(query).sort("start_time", -1)
    bookings = []
    now = datetime.utcnow()

    async for b in cursor:
        room = await rooms_collection.find_one({"_id": b["room_id"]})
        org = await employees_collection.find_one({"_id": b["organizer_employee_id"]})

        status_val = b.get("status", "Confirmed")
        if status_val == "Confirmed" and b["end_time"] < now:
            status_val = "Completed"

        st_str = b["start_time"].isoformat()
        if not st_str.endswith("Z"):
            st_str += "Z"
        et_str = b["end_time"].isoformat()
        if not et_str.endswith("Z"):
            et_str += "Z"

        bookings.append({
            "id": str(b["_id"]),
            "room_id": str(b["room_id"]),
            "room_name": room["room_name"] if room else "Room",
            "room_code": room["room_code"] if room else "",
            "organizer_name": f"{org.get('first_name', '')} {org.get('last_name', '')}".strip() if org else "Organizer",
            "organizer_email": org.get("email", "") if org else "",
            "title": b["title"],
            "meeting_type": b.get("meeting_type", "Internal Sync"),
            "start_time": st_str,
            "end_time": et_str,
            "attendee_count": len(b.get("attendees", [])) + 1,
            "status": status_val,
            "created_at": b.get("created_at")
        })

    return bookings


async def get_meeting_room_summary_stats(user_payload: dict):
    """Fetch live summary cards data for main Meeting Rooms header."""
    user, emp = await get_employee_from_user(user_payload)
    now = datetime.utcnow()

    # 1. Total active rooms
    total_rooms = await rooms_collection.count_documents({"is_active": True})

    # 2. Rooms available right now
    all_rooms = await rooms_collection.find({"is_active": True}).to_list(length=200)
    available_now = 0
    for r in all_rooms:
        st = await compute_room_current_status(r, now)
        if st == "Available Now":
            available_now += 1

    # 3. Booked Today count
    start_of_today = datetime(now.year, now.month, now.day, 0, 0, 0)
    end_of_today = start_of_today + timedelta(days=1)
    booked_today = await bookings_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$lt": end_of_today},
        "end_time": {"$gt": start_of_today}
    })

    # 4. My Upcoming Meetings
    my_upcoming = await bookings_collection.count_documents({
        "organizer_employee_id": emp["_id"],
        "status": "Confirmed",
        "start_time": {"$gte": now}
    })

    return {
        "available_now": available_now,
        "booked_today": booked_today,
        "my_upcoming": my_upcoming,
        "total_rooms": total_rooms
    }
