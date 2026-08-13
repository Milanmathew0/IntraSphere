from datetime import datetime
from bson import ObjectId

from app.database.connection import db

employment_requests_collection = db["employment_requests"]
users_collection = db["users"]
employees_collection = db["employees"]
departments_collection = db["departments"]
designations_collection = db["designations"]


# =====================================================
# Create Employment Request
# =====================================================

async def create_request(request):

    request_data = request.model_dump()

    # Check user exists
    user = await users_collection.find_one(
        {
            "_id": ObjectId(request.user_id)
        }
    )

    if user is None:
        return "USER_NOT_FOUND"

    # Check if request already exists
    existing_request = await employment_requests_collection.find_one(
        {
            "user_id": ObjectId(request.user_id),
            "status": "Pending"
        }
    )

    if existing_request:
        return "REQUEST_ALREADY_EXISTS"

    request_data["user_id"] = ObjectId(request.user_id)
    request_data["status"] = "Pending"
    request_data["approved_by"] = None
    request_data["approved_at"] = None
    request_data["created_at"] = datetime.utcnow()
    request_data["updated_at"] = datetime.utcnow()

    result = await employment_requests_collection.insert_one(request_data)

    return str(result.inserted_id)


# =====================================================
# Get Pending Requests
# =====================================================

async def get_pending_requests():

    requests = []

    async for request in employment_requests_collection.find(
        {
            "status": "Pending"
        }
    ):
        request["_id"] = str(request["_id"])
        request["user_id"] = str(request["user_id"])

        requests.append(request)

    return requests


# =====================================================
# Get My Request
# =====================================================

async def get_request_by_user(user_id: str):

    request = await employment_requests_collection.find_one(
        {
            "user_id": ObjectId(user_id)
        }
    )

    if request is None:
        return None

    request["_id"] = str(request["_id"])
    request["user_id"] = str(request["user_id"])

    return request


# =====================================================
# Approve Request
# =====================================================

async def approve_request(
    request_id: str,
    hr_user_id: str,
    employee_data
):

    # Find Request
    request = await employment_requests_collection.find_one(
        {
            "_id": ObjectId(request_id)
        }
    )

    if request is None:
        return "REQUEST_NOT_FOUND"

    if request["status"] != "Pending":
        return "REQUEST_ALREADY_PROCESSED"

    # Check User
    user = await users_collection.find_one(
        {
            "_id": request["user_id"]
        }
    )

    if user is None:
        return "USER_NOT_FOUND"

    # Check Existing Employee
    existing_employee = await employees_collection.find_one(
        {
            "user_id": request["user_id"]
        }
    )

    if existing_employee:
        return "EMPLOYEE_ALREADY_EXISTS"

    # Duplicate Employee ID
    duplicate_employee = await employees_collection.find_one(
        {
            "employee_id": employee_data.employee_id
        }
    )

    if duplicate_employee:
        return "EMPLOYEE_ID_EXISTS"

    # Department Exists
    department = await departments_collection.find_one(
        {
            "_id": ObjectId(employee_data.department_id)
        }
    )

    if department is None:
        return "DEPARTMENT_NOT_FOUND"

    # Designation Exists
    designation = await designations_collection.find_one(
        {
            "_id": ObjectId(employee_data.designation_id)
        }
    )

    if designation is None:
        return "DESIGNATION_NOT_FOUND"

    desig_name = designation.get("designation_name", "") if designation else ""
    assigned_role = "Employee"
    if "manager" in desig_name.lower():
        assigned_role = "Manager"
    elif "hr" in desig_name.lower():
        assigned_role = "HR"

    # Update User Role
    await users_collection.update_one(
        {
            "_id": request["user_id"]
        },
        {
            "$set": {
                "role": assigned_role,
                "updated_at": datetime.utcnow()
            }
        }
    )

    employee = employee_data.model_dump()

    employee["user_id"] = request["user_id"]

    employee["department_id"] = ObjectId(employee_data.department_id)
    employee["designation_id"] = ObjectId(employee_data.designation_id)

    employee["joining_date"] = datetime.combine(
        employee_data.joining_date,
        datetime.min.time()
    )

    employee["created_at"] = datetime.utcnow()
    employee["updated_at"] = datetime.utcnow()

    result = await employees_collection.insert_one(employee)

    # Update Request
    await employment_requests_collection.update_one(
        {
            "_id": ObjectId(request_id)
        },
        {
            "$set": {
                "status": "Approved",
                "approved_by": ObjectId(hr_user_id),
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )

    return str(result.inserted_id)


# =====================================================
# Reject Request
# =====================================================

async def reject_request(
    request_id: str,
    hr_user_id: str
):

    request = await employment_requests_collection.find_one(
        {
            "_id": ObjectId(request_id)
        }
    )

    if request is None:
        return "REQUEST_NOT_FOUND"

    if request["status"] != "Pending":
        return "REQUEST_ALREADY_PROCESSED"

    await employment_requests_collection.update_one(
        {
            "_id": ObjectId(request_id)
        },
        {
            "$set": {
                "status": "Rejected",
                "approved_by": ObjectId(hr_user_id),
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )

    return True