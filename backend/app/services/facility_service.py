from datetime import datetime, date, timedelta
from bson import ObjectId
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status

from app.database.connection import db
from app.services.notification_service import create_notification
from app.schemas.facility_schema import (
    MaintenanceCreate, MaintenanceUpdate, MaintenanceStatusUpdate
)

facility_maintenance_collection = db["facility_maintenance"]
meeting_rooms_collection = db["meeting_rooms"]
meeting_bookings_collection = db["meeting_bookings"]
workspace_desks_collection = db["workspace_desks"]
workspace_reservations_collection = db["workspace_reservations"]
users_collection = db["users"]
employees_collection = db["employees"]


# ==========================================
# FACILITY DASHBOARD SUMMARY STATS
# ==========================================

async def get_facility_dashboard_stats(current_user: dict):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    today_end = today_start + timedelta(days=1)

    # 1. Meeting Room Counts
    total_rooms = await meeting_rooms_collection.count_documents({})
    maint_rooms = await meeting_rooms_collection.count_documents({"status": "Maintenance"})
    inactive_rooms = await meeting_rooms_collection.count_documents({"status": "Inactive"})
    avail_rooms = await meeting_rooms_collection.count_documents({
        "$or": [{"status": "Available"}, {"status": {"$exists": False}}]
    })

    # 2. Workspace Desk Counts
    total_desks = await workspace_desks_collection.count_documents({})
    maint_desks = await workspace_desks_collection.count_documents({"status": "Maintenance"})
    inactive_desks = await workspace_desks_collection.count_documents({"status": "Inactive"})
    avail_desks = await workspace_desks_collection.count_documents({
        "$or": [{"status": "Available"}, {"status": {"$exists": False}}]
    })

    # 3. Reservations Counts
    # Today's Room Bookings
    today_room_bookings = await meeting_bookings_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$gte": today_start, "$lt": today_end}
    })
    # Today's Desk Reservations
    today_desk_reservations = await workspace_reservations_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$gte": today_start, "$lt": today_end}
    })
    today_reservations_total = today_room_bookings + today_desk_reservations

    # Upcoming Room Bookings
    upcoming_room_bookings = await meeting_bookings_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$gte": today_end}
    })
    # Upcoming Desk Reservations
    upcoming_desk_reservations = await workspace_reservations_collection.count_documents({
        "status": "Confirmed",
        "start_time": {"$gte": today_end}
    })
    upcoming_reservations_total = upcoming_room_bookings + upcoming_desk_reservations

    # 4. Maintenance Counts
    open_maintenance = await facility_maintenance_collection.count_documents({
        "status": {"$in": ["Open", "Scheduled", "In Progress"]}
    })
    critical_maintenance = await facility_maintenance_collection.count_documents({
        "status": {"$in": ["Open", "Scheduled", "In Progress"]},
        "priority": {"$in": ["High", "Critical"]}
    })

    # 5. Recent Maintenance Activities
    recent_maint = []
    cursor = facility_maintenance_collection.find().sort("created_at", -1).limit(6)
    async for doc in cursor:
        recent_maint.append({
            "_id": str(doc["_id"]),
            "resource_type": doc.get("resource_type"),
            "resource_name": doc.get("resource_name"),
            "issue_title": doc.get("issue_title"),
            "priority": doc.get("priority", "Medium"),
            "status": doc.get("status", "Open"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None
        })

    return {
        "summary": {
            "total_meeting_rooms": total_rooms,
            "available_meeting_rooms": avail_rooms,
            "maintenance_rooms": maint_rooms,
            "inactive_rooms": inactive_rooms,
            "total_workspaces": total_desks,
            "available_workspaces": avail_desks,
            "maintenance_workspaces": maint_desks,
            "inactive_workspaces": inactive_desks,
            "today_reservations": today_reservations_total,
            "upcoming_reservations": upcoming_reservations_total,
            "open_maintenance_issues": open_maintenance,
            "critical_maintenance_issues": critical_maintenance,
        },
        "recent_maintenance": recent_maint
    }


# ==========================================
# MAINTENANCE MANAGEMENT SERVICE
# ==========================================

async def get_all_facility_maintenance(
    resource_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    if resource_type:
        query["resource_type"] = resource_type
    if status_filter:
        query["status"] = status_filter
    if priority:
        query["priority"] = priority
    if search:
        query["$or"] = [
            {"issue_title": {"$regex": search, "$options": "i"}},
            {"resource_name": {"$regex": search, "$options": "i"}},
            {"issue_description": {"$regex": search, "$options": "i"}}
        ]

    records = []
    cursor = facility_maintenance_collection.find(query).sort("created_at", -1)
    async for doc in cursor:
        records.append({
            "id": str(doc["_id"]),
            "resource_type": doc.get("resource_type", "general"),
            "resource_id": str(doc.get("resource_id", "")),
            "resource_name": doc.get("resource_name", "N/A"),
            "issue_title": doc.get("issue_title", ""),
            "issue_description": doc.get("issue_description", ""),
            "priority": doc.get("priority", "Medium"),
            "reported_by": str(doc.get("reported_by")) if doc.get("reported_by") else None,
            "assigned_to": str(doc.get("assigned_to")) if doc.get("assigned_to") else None,
            "status": doc.get("status", "Open"),
            "scheduled_date": doc.get("scheduled_date").isoformat() if doc.get("scheduled_date") else None,
            "started_at": doc.get("started_at").isoformat() if doc.get("started_at") else None,
            "completed_at": doc.get("completed_at").isoformat() if doc.get("completed_at") else None,
            "resolution_notes": doc.get("resolution_notes"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
            "updated_at": doc.get("updated_at").isoformat() if doc.get("updated_at") else None,
        })
    return records


async def create_maintenance_record(current_user: dict, data: MaintenanceCreate):
    now = datetime.utcnow()
    user_email = current_user.get("sub")
    user = await users_collection.find_one({"email": user_email})
    reporter_id = user["_id"] if user else None

    doc = {
        "resource_type": data.resource_type,
        "resource_id": data.resource_id,
        "resource_name": data.resource_name,
        "issue_title": data.issue_title,
        "issue_description": data.issue_description,
        "priority": data.priority,
        "reported_by": reporter_id,
        "assigned_to": data.assigned_to,
        "status": "Open",
        "scheduled_date": data.scheduled_date,
        "started_at": None,
        "completed_at": None,
        "resolution_notes": None,
        "created_at": now,
        "updated_at": now
    }

    res = await facility_maintenance_collection.insert_one(doc)
    maint_id = str(res.inserted_id)

    # Automatically set resource status to Maintenance
    if data.resource_type == "meeting_room":
        try:
            await meeting_rooms_collection.update_one(
                {"_id": ObjectId(data.resource_id)},
                {"$set": {"status": "Maintenance", "updated_at": now}}
            )
        except Exception:
            pass
    elif data.resource_type == "workspace":
        try:
            await workspace_desks_collection.update_one(
                {"_id": ObjectId(data.resource_id)},
                {"$set": {"status": "Maintenance", "updated_at": now}}
            )
        except Exception:
            pass

    # Check for future conflicting reservations
    conflicts_count = 0
    if data.resource_type == "meeting_room":
        try:
            conflicts_count = await meeting_bookings_collection.count_documents({
                "room_id": ObjectId(data.resource_id),
                "status": "Confirmed",
                "start_time": {"$gte": now}
            })
        except Exception:
            pass
    elif data.resource_type == "workspace":
        try:
            conflicts_count = await workspace_reservations_collection.count_documents({
                "desk_id": ObjectId(data.resource_id),
                "status": "Confirmed",
                "start_time": {"$gte": now}
            })
        except Exception:
            pass

    # Notify Facility Managers if priority is High/Critical
    if data.priority in ["High", "Critical"]:
        # Find all facility managers / admins
        fm_users = users_collection.find({"role": {"$in": ["Admin", "Facility Manager"]}})
        async for fm in fm_users:
            await create_notification(
                recipient_id=fm["_id"],
                title=f"Critical Maintenance Reported: {data.resource_name}",
                message=f"[{data.priority} Priority] {data.issue_title} for {data.resource_name}.",
                notification_type="SYSTEM",
                related_entity_id=ObjectId(maint_id)
            )

    return {
        "message": "Maintenance record created successfully",
        "id": maint_id,
        "resource_status": "Maintenance",
        "conflicting_reservations_count": conflicts_count
    }


async def update_maintenance_status(record_id: str, status_val: str, resolution_notes: Optional[str], current_user: dict):
    now = datetime.utcnow()
    maint = await facility_maintenance_collection.find_one({"_id": ObjectId(record_id)})
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    update_fields = {"status": status_val, "updated_at": now}
    if resolution_notes is not None:
        update_fields["resolution_notes"] = resolution_notes

    if status_val == "In Progress" and not maint.get("started_at"):
        update_fields["started_at"] = now

    if status_val in ["Completed", "Cancelled"]:
        if status_val == "Completed":
            update_fields["completed_at"] = now

        # Restore resource status back to Available
        res_type = maint.get("resource_type")
        res_id = maint.get("resource_id")
        if res_type == "meeting_room" and res_id:
            try:
                await meeting_rooms_collection.update_one(
                    {"_id": ObjectId(res_id)},
                    {"$set": {"status": "Available", "updated_at": now}}
                )
            except Exception:
                pass
        elif res_type == "workspace" and res_id:
            try:
                await workspace_desks_collection.update_one(
                    {"_id": ObjectId(res_id)},
                    {"$set": {"status": "Available", "updated_at": now}}
                )
            except Exception:
                pass

    await facility_maintenance_collection.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": update_fields}
    )

    return {"message": f"Maintenance status updated to '{status_val}' successfully"}


# ==========================================
# MASTER UNIFIED RESERVATIONS SERVICE
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


async def get_facility_reservations(
    resource_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    floor: Optional[int] = None,
    building: Optional[str] = None,
    search: Optional[str] = None
):
    reservations = []

    # 1. Fetch Meeting Room Bookings
    if not resource_type or resource_type == "meeting_room":
        q = {}
        if status_filter and status_filter != "All":
            q["status"] = status_filter

        cursor = meeting_bookings_collection.find(q).sort("start_time", -1).limit(200)
        async for b in cursor:
            # Get room details
            room = None
            if b.get("room_id"):
                room = await meeting_rooms_collection.find_one({"_id": b["room_id"]})

            if floor is not None and room and room.get("floor") != floor:
                continue
            if building and room and room.get("building") and building.lower() not in room.get("building").lower():
                continue

            # Resolve real employee organizer details
            emp = None
            if b.get("organizer_employee_id"):
                emp = await employees_collection.find_one({"_id": b["organizer_employee_id"]})
            if not emp and b.get("organizer_user_id"):
                emp = await employees_collection.find_one({"user_id": b["organizer_user_id"]})

            user = None
            if not emp and b.get("organizer_user_id"):
                user = await users_collection.find_one({"_id": b["organizer_user_id"]})

            if emp:
                emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() or emp.get("email", "").split("@")[0]
                emp_email = emp.get("email", "")
                emp_dept = emp.get("department", "Operations")
            elif user:
                emp_name = user.get("username", user.get("email", "").split("@")[0])
                emp_email = user.get("email", "")
                emp_dept = "Staff"
            else:
                emp_name = b.get("organizer_name", "Employee")
                emp_email = b.get("organizer_email", "")
                emp_dept = b.get("department", "General")

            res_name = (room.get("room_name") or room.get("name") if room else None) or b.get("room_name") or "Meeting Room"
            purpose = b.get("title") or b.get("purpose") or "Team Meeting"

            if search:
                s_lower = search.lower()
                if not (s_lower in emp_name.lower() or s_lower in emp_email.lower() or s_lower in res_name.lower() or s_lower in purpose.lower()):
                    continue

            reservations.append({
                "id": str(b["_id"]),
                "resource_type": "meeting_room",
                "resource_id": str(b.get("room_id", "")),
                "resource_name": res_name,
                "employee_name": emp_name,
                "employee_email": emp_email,
                "department": emp_dept,
                "floor": room.get("floor", 1) if room else 1,
                "building": room.get("building") or room.get("location") or "Main Building" if room else "Main Building",
                "start_time": format_iso_utc(b.get("start_time")),
                "end_time": format_iso_utc(b.get("end_time")),
                "purpose": purpose,
                "notes": b.get("description") or b.get("notes") or "",
                "cancellation_reason": b.get("cancellation_reason") or "",
                "status": b.get("status", "Confirmed"),
                "created_at": format_iso_utc(b.get("created_at")),
            })

    # 2. Fetch Workspace Desk Reservations
    if not resource_type or resource_type == "workspace":
        q = {}
        if status_filter and status_filter != "All":
            q["status"] = status_filter

        cursor = workspace_reservations_collection.find(q).sort("start_time", -1).limit(200)
        async for r in cursor:
            desk = None
            if r.get("desk_id"):
                desk = await workspace_desks_collection.find_one({"_id": r["desk_id"]})

            if floor is not None and desk and desk.get("floor") != floor:
                continue
            if building and desk and desk.get("building") and building.lower() not in desk.get("building").lower():
                continue

            emp = None
            if r.get("employee_id"):
                emp = await employees_collection.find_one({"_id": r["employee_id"]})
            if not emp and r.get("user_id"):
                emp = await employees_collection.find_one({"user_id": r["user_id"]})

            user = None
            if not emp and r.get("user_id"):
                user = await users_collection.find_one({"_id": r["user_id"]})

            if emp:
                emp_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() or emp.get("email", "").split("@")[0]
                emp_email = emp.get("email", "")
                emp_dept = emp.get("department", "Operations")
            elif user:
                emp_name = user.get("username", user.get("email", "").split("@")[0])
                emp_email = user.get("email", "")
                emp_dept = "Staff"
            else:
                emp_name = r.get("employee_name", "Employee")
                emp_email = r.get("employee_email", "")
                emp_dept = r.get("department", "General")

            desk_title = (desk.get("desk_code") or desk.get("name") if desk else None) or r.get("desk_code") or r.get("desk_name") or "Workspace Desk"
            purpose = r.get("purpose") or "Daily Desk Work"

            if search:
                s_lower = search.lower()
                if not (s_lower in emp_name.lower() or s_lower in emp_email.lower() or s_lower in desk_title.lower() or s_lower in purpose.lower()):
                    continue

            reservations.append({
                "id": str(r["_id"]),
                "resource_type": "workspace",
                "resource_id": str(r.get("desk_id", "")),
                "resource_name": desk_title,
                "employee_name": emp_name,
                "employee_email": emp_email,
                "department": emp_dept,
                "floor": desk.get("floor", 1) if desk else 1,
                "building": desk.get("building") or desk.get("location") or "Main Building" if desk else "Main Building",
                "start_time": format_iso_utc(r.get("start_time")),
                "end_time": format_iso_utc(r.get("end_time")),
                "purpose": purpose,
                "notes": r.get("notes") or "",
                "cancellation_reason": r.get("cancellation_reason") or "",
                "status": r.get("status", "Confirmed"),
                "created_at": format_iso_utc(r.get("created_at")),
            })

    # Sort all by start_time descending
    reservations.sort(key=lambda x: x["start_time"] or "", reverse=True)
    return reservations


async def cancel_facility_reservation(reservation_id: str, resource_type: str, cancellation_reason: str, current_user: dict):
    now = datetime.utcnow()
    user_email = current_user.get("sub")

    # Resolve sender user ID (Facility Manager)
    fm_user = await users_collection.find_one({"email": user_email})
    sender_id = fm_user["_id"] if fm_user else None

    if resource_type == "meeting_room":
        res = await meeting_bookings_collection.find_one({"_id": ObjectId(reservation_id)})
        if not res:
            raise HTTPException(status_code=404, detail="Meeting booking not found")

        await meeting_bookings_collection.update_one(
            {"_id": ObjectId(reservation_id)},
            {"$set": {"status": "Cancelled", "cancellation_reason": cancellation_reason, "updated_at": now}}
        )

        # Resolve recipient user ID (Organizer who booked the room)
        recipient_user_id = res.get("organizer_user_id") or res.get("user_id")
        if not recipient_user_id and res.get("organizer_employee_id"):
            emp = await employees_collection.find_one({"_id": res["organizer_employee_id"]})
            if emp:
                recipient_user_id = emp.get("user_id")

        if recipient_user_id:
            room_title = res.get("room_name")
            if not room_title and res.get("room_id"):
                room_obj = await meeting_rooms_collection.find_one({"_id": res["room_id"]})
                if room_obj:
                    room_title = room_obj.get("room_name") or room_obj.get("name")
            room_title = room_title or "Meeting Room"

            meeting_title = res.get("title") or res.get("purpose") or "Meeting"
            start_str = res.get("start_time").strftime("%b %d, %Y %H:%M") if isinstance(res.get("start_time"), datetime) else ""
            time_part = f" on {start_str}" if start_str else ""

            await create_notification(
                recipient_id=recipient_user_id,
                title="Meeting Room Booking Cancelled",
                message=f"Your booking for '{room_title}' ({meeting_title}){time_part} was cancelled by Facility Management: {cancellation_reason}.",
                notification_type="MEETING_BOOKING",
                sender_id=sender_id,
                related_entity_id=ObjectId(reservation_id)
            )

    elif resource_type == "workspace":
        res = await workspace_reservations_collection.find_one({"_id": ObjectId(reservation_id)})
        if not res:
            raise HTTPException(status_code=404, detail="Desk reservation not found")

        await workspace_reservations_collection.update_one(
            {"_id": ObjectId(reservation_id)},
            {"$set": {"status": "Cancelled", "cancellation_reason": cancellation_reason, "updated_at": now}}
        )

        # Resolve recipient user ID
        recipient_user_id = res.get("user_id")
        if not recipient_user_id and res.get("employee_id"):
            emp = await employees_collection.find_one({"_id": res["employee_id"]})
            if emp:
                recipient_user_id = emp.get("user_id")

        if recipient_user_id:
            desk_code = res.get("desk_code")
            if not desk_code and res.get("desk_id"):
                desk_obj = await workspace_desks_collection.find_one({"_id": res["desk_id"]})
                if desk_obj:
                    desk_code = desk_obj.get("desk_code") or desk_obj.get("name")
            desk_code = desk_code or "Workspace Desk"

            date_str = res.get("date") or (res.get("start_time").strftime("%b %d, %Y") if isinstance(res.get("start_time"), datetime) else "")
            date_part = f" on {date_str}" if date_str else ""

            await create_notification(
                recipient_id=recipient_user_id,
                title="Workspace Reservation Cancelled",
                message=f"Your desk reservation for '{desk_code}'{date_part} was cancelled by Facility Management: {cancellation_reason}.",
                notification_type="WORKSPACE_RESERVATION",
                sender_id=sender_id,
                related_entity_id=ObjectId(reservation_id)
            )

    return {"message": "Reservation cancelled successfully and user notified."}


async def update_facility_reservation(reservation_id: str, resource_type: str, update_data, current_user: dict):
    now = datetime.utcnow()
    user_email = current_user.get("sub")
    fm_user = await users_collection.find_one({"email": user_email})
    sender_id = fm_user["_id"] if fm_user else None

    try:
        obj_id = ObjectId(reservation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")

    if resource_type == "meeting_room":
        res = await meeting_bookings_collection.find_one({"_id": obj_id})
        if not res:
            raise HTTPException(status_code=404, detail="Meeting booking not found")

        update_fields = {"status": update_data.status, "updated_at": now}
        if update_data.purpose is not None:
            update_fields["title"] = update_data.purpose
            update_fields["purpose"] = update_data.purpose
        if update_data.notes is not None:
            update_fields["description"] = update_data.notes
            update_fields["notes"] = update_data.notes
        if update_data.cancellation_reason is not None:
            update_fields["cancellation_reason"] = update_data.cancellation_reason

        await meeting_bookings_collection.update_one({"_id": obj_id}, {"$set": update_fields})

        recipient_user_id = res.get("organizer_user_id") or res.get("user_id")
        if not recipient_user_id and res.get("organizer_employee_id"):
            emp = await employees_collection.find_one({"_id": res["organizer_employee_id"]})
            if emp:
                recipient_user_id = emp.get("user_id")

        if recipient_user_id:
            await create_notification(
                recipient_id=recipient_user_id,
                title=f"Meeting Booking Status Updated ({update_data.status})",
                message=f"Your meeting room reservation status has been updated to '{update_data.status}' by Facility Management.",
                notification_type="MEETING_BOOKING",
                sender_id=sender_id,
                related_entity_id=obj_id
            )

    elif resource_type == "workspace":
        res = await workspace_reservations_collection.find_one({"_id": obj_id})
        if not res:
            raise HTTPException(status_code=404, detail="Desk reservation not found")

        update_fields = {"status": update_data.status, "updated_at": now}
        if update_data.purpose is not None:
            update_fields["purpose"] = update_data.purpose
        if update_data.notes is not None:
            update_fields["notes"] = update_data.notes
        if update_data.cancellation_reason is not None:
            update_fields["cancellation_reason"] = update_data.cancellation_reason

        await workspace_reservations_collection.update_one({"_id": obj_id}, {"$set": update_fields})

        recipient_user_id = res.get("user_id")
        if not recipient_user_id and res.get("employee_id"):
            emp = await employees_collection.find_one({"_id": res["employee_id"]})
            if emp:
                recipient_user_id = emp.get("user_id")

        if recipient_user_id:
            await create_notification(
                recipient_id=recipient_user_id,
                title=f"Workspace Reservation Status Updated ({update_data.status})",
                message=f"Your workspace desk reservation status has been updated to '{update_data.status}' by Facility Management.",
                notification_type="WORKSPACE_RESERVATION",
                sender_id=sender_id,
                related_entity_id=obj_id
            )
    else:
        raise HTTPException(status_code=400, detail="Invalid resource_type")

    return {"message": f"Reservation updated to {update_data.status}."}


async def delete_facility_reservation(reservation_id: str, resource_type: str, current_user: dict):
    try:
        obj_id = ObjectId(reservation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")

    if resource_type == "meeting_room":
        res = await meeting_bookings_collection.delete_one({"_id": obj_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Meeting booking not found")
    elif resource_type == "workspace":
        res = await workspace_reservations_collection.delete_one({"_id": obj_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Desk reservation not found")
    else:
        raise HTTPException(status_code=400, detail="Invalid resource_type")

    return {"message": "Reservation record deleted successfully."}



# ==========================================
# FACILITY ANALYTICS (AGGREGATIONS)
# ==========================================

async def get_facility_analytics(period: str = "month"):
    now = datetime.utcnow()
    if period == "today":
        start_date = datetime(now.year, now.month, now.day, 0, 0, 0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = datetime(2020, 1, 1)

    # 1. Room Analytics
    total_rooms = await meeting_rooms_collection.count_documents({})
    room_bookings = await meeting_bookings_collection.count_documents({
        "created_at": {"$gte": start_date},
        "status": "Confirmed"
    })

    # Most booked room pipeline
    most_booked_rooms = []
    pipeline = [
        {"$match": {"status": "Confirmed", "created_at": {"$gte": start_date}}},
        {"$group": {"_id": "$room_id", "booking_count": {"$sum": 1}, "room_name": {"$first": "$room_name"}}},
        {"$sort": {"booking_count": -1}},
        {"$limit": 5}
    ]
    async for doc in meeting_bookings_collection.aggregate(pipeline):
        most_booked_rooms.append({
            "room_id": str(doc["_id"]) if doc["_id"] else "",
            "room_name": doc.get("room_name", "Conference Room"),
            "booking_count": doc.get("booking_count", 0)
        })

    # 2. Workspace Desk Analytics
    total_desks = await workspace_desks_collection.count_documents({})
    desk_reservations = await workspace_reservations_collection.count_documents({
        "created_at": {"$gte": start_date},
        "status": "Confirmed"
    })

    most_reserved_desks = []
    desk_pipeline = [
        {"$match": {"status": "Confirmed", "created_at": {"$gte": start_date}}},
        {"$group": {"_id": "$desk_id", "reservation_count": {"$sum": 1}, "desk_code": {"$first": "$desk_code"}}},
        {"$sort": {"reservation_count": -1}},
        {"$limit": 5}
    ]
    async for doc in workspace_reservations_collection.aggregate(desk_pipeline):
        most_reserved_desks.append({
            "desk_id": str(doc["_id"]) if doc["_id"] else "",
            "desk_code": doc.get("desk_code", "Desk"),
            "reservation_count": doc.get("reservation_count", 0)
        })

    # 3. Maintenance Analytics
    open_maint = await facility_maintenance_collection.count_documents({"status": {"$in": ["Open", "Scheduled", "In Progress"]}})
    completed_maint = await facility_maintenance_collection.count_documents({"status": "Completed", "created_at": {"$gte": start_date}})
    critical_maint = await facility_maintenance_collection.count_documents({"priority": {"$in": ["High", "Critical"]}})

    return {
        "period": period,
        "meeting_rooms": {
            "total_rooms": total_rooms,
            "total_bookings": room_bookings,
            "average_utilization_percent": min(round((room_bookings / max(total_rooms, 1)) * 12, 1), 100),
            "most_booked": most_booked_rooms
        },
        "workspaces": {
            "total_desks": total_desks,
            "total_reservations": desk_reservations,
            "average_utilization_percent": min(round((desk_reservations / max(total_desks, 1)) * 8, 1), 100),
            "most_reserved": most_reserved_desks
        },
        "maintenance": {
            "open_issues": open_maint,
            "completed_issues": completed_maint,
            "critical_priority_issues": critical_maint,
            "avg_resolution_hours": 4.5
        }
    }
