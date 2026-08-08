from datetime import datetime
from bson import ObjectId
from app.database.mongodb import db

requests_collection = db["onboarding_requests"]
users_collection = db["users"]
employees_collection = db["employees"]


async def submit_onboarding_request(user_email: str, username: str, department: str, job_title: str, emp_code: str = "", message: str = ""):
    # Check if there is an existing pending request
    existing = await requests_collection.find_one({
        "email": user_email,
        "status": "pending"
    })
    
    now = datetime.utcnow()
    request_data = {
        "email": user_email,
        "username": username,
        "department": department,
        "job_title": job_title,
        "emp_code": emp_code.strip(),
        "message": message.strip(),
        "status": "pending",
        "submitted_at": now.strftime("%b %d, %Y, %I:%M %p"),
        "created_at": now,
        "updated_at": now
    }

    if existing:
        await requests_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": request_data}
        )
        return str(existing["_id"])
    else:
        result = await requests_collection.insert_one(request_data)
        return str(result.inserted_id)


async def get_user_onboarding_request(user_email: str):
    # Fetch the latest onboarding request for the user
    request = await requests_collection.find_one(
        {"email": user_email},
        sort=[("created_at", -1)]
    )
    if not request:
        return None
    
    request["_id"] = str(request["_id"])
    return request


async def get_all_onboarding_requests(status_filter: str = None):
    query = {}
    if status_filter and status_filter.lower() != "all":
        query["status"] = status_filter.lower()

    requests = []
    async for req in requests_collection.find(query).sort("created_at", -1):
        req["_id"] = str(req["_id"])
        requests.append(req)

    return requests


async def approve_onboarding_request(request_id: str):
    try:
        obj_id = ObjectId(request_id)
    except Exception:
        return None

    request = await requests_collection.find_one({"_id": obj_id})
    if not request:
        return None

    user_email = request["email"]
    username = request.get("username", "Employee")

    # 1. Update request status to approved
    await requests_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )

    # 2. Upgrade user role in users collection to 'Employee'
    user_record = await users_collection.find_one({"email": user_email})
    user_id = user_record["_id"] if user_record else None

    if user_record:
        await users_collection.update_one(
            {"_id": user_id},
            {"$set": {"role": "Employee"}}
        )

    # 3. Auto-create or activate profile in employees collection
    existing_emp = await employees_collection.find_one({"email": user_email})
    emp_code = request.get("emp_code") or f"EMP-{(str(user_id) if user_id else request_id)[-6:].upper()}"

    name_parts = username.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    if not existing_emp:
        await employees_collection.insert_one({
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": user_email,
            "department": request.get("department", "Engineering"),
            "designation": request.get("job_title", "Employee"),
            "user_id": user_id,
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow()
        })
    else:
        await employees_collection.update_one(
            {"_id": existing_emp["_id"]},
            {
                "$set": {
                    "employment_status": "Active",
                    "is_active": True,
                    "department": request.get("department", "Engineering"),
                    "designation": request.get("job_title", "Employee"),
                    "updated_at": datetime.utcnow()
                }
            }
        )

    return True


async def reject_onboarding_request(request_id: str, reason: str = ""):
    try:
        obj_id = ObjectId(request_id)
    except Exception:
        return None

    result = await requests_collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": reason,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        return None

    return True
