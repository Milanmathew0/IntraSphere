from datetime import datetime

from bson import ObjectId

from app.database.connection import db

attendance_collection = db["attendance"]
employees_collection = db["employees"]


users_collection = db["users"]


async def get_or_create_employee_record(identifier: str):
    if not identifier:
        # Fallback to first available employee
        emp = await employees_collection.find_one({"is_active": True})
        if emp:
            return emp
        return None

    clean_id = str(identifier).strip()

    # 1. Search employees collection by employee_id, email, or _id
    emp = await employees_collection.find_one({
        "$or": [
            {"employee_id": clean_id},
            {"email": clean_id},
            {"email": clean_id.lower()},
            {"employee_id": clean_id.upper()},
        ]
    })

    if not emp and ObjectId.is_valid(clean_id):
        emp = await employees_collection.find_one({"_id": ObjectId(clean_id)})

    if not emp and ObjectId.is_valid(clean_id):
        emp = await employees_collection.find_one({"user_id": ObjectId(clean_id)})

    if emp:
        return emp

    # 2. Search users collection by email, username, or _id
    usr = await users_collection.find_one({
        "$or": [
            {"email": clean_id},
            {"email": clean_id.lower()},
            {"username": clean_id},
        ]
    })

    if not usr and ObjectId.is_valid(clean_id):
        usr = await users_collection.find_one({"_id": ObjectId(clean_id)})

    if usr:
        user_id_str = str(usr["_id"])
        user_email = usr.get("email", "")
        emp_code = f"EMP-{user_id_str[-6:].upper()}"

        emp = await employees_collection.find_one({
            "$or": [
                {"employee_id": emp_code},
                {"email": user_email},
                {"user_id": usr["_id"]},
            ]
        })
        if emp:
            return emp

        name_parts = usr.get("username", user_email.split("@")[0] if user_email else "Employee").strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        employee_doc = {
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": user_email,
            "user_id": usr["_id"],
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        res = await employees_collection.insert_one(employee_doc)
        employee_doc["_id"] = res.inserted_id
        return employee_doc

    # 3. Last fallback: return any existing active employee
    emp = await employees_collection.find_one({"is_active": True})
    if emp:
        return emp

    return None


# =====================================================
# Employee Check In
# =====================================================

async def check_in(employee_code: str):

    employee = await get_or_create_employee_record(employee_code)

    if employee is None:
        return "EMPLOYEE_NOT_FOUND"

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    existing = await attendance_collection.find_one(
        {
            "employee_id": employee["_id"],
            "attendance_date": today
        }
    )

    if existing:
        return "ALREADY_CHECKED_IN"

    attendance = {

        "employee_id": employee["_id"],

        "attendance_date": today,

        "check_in": datetime.utcnow(),

        "check_out": None,

        "working_hours": None,

        "status": "Present",

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow()
    }

    result = await attendance_collection.insert_one(attendance)

    return str(result.inserted_id)


# =====================================================
# Employee Check Out
# =====================================================

async def check_out(employee_code: str):

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    employee = await get_or_create_employee_record(employee_code)

    if employee is None:
        return "EMPLOYEE_NOT_FOUND"

    attendance = await attendance_collection.find_one(
        {
            "employee_id": employee["_id"],
            "attendance_date": today
        }
    )

    if attendance is None:
        return "CHECKIN_NOT_FOUND"

    if attendance["check_out"] is not None:
        return "ALREADY_CHECKED_OUT"

    checkout_time = datetime.utcnow()

    working_hours = (
        checkout_time - attendance["check_in"]
    ).total_seconds() / 3600

    result = await attendance_collection.update_one(
        {
            "_id": attendance["_id"]
        },
        {
            "$set": {
                "check_out": checkout_time,
                "working_hours": round(working_hours, 2),
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 0:
        return None

    return True


# =====================================================
# Get All Attendance (Aggregation)
# =====================================================

async def get_all_attendance():

    pipeline = [

        {
            "$lookup": {
                "from": "employees",
                "localField": "employee_id",
                "foreignField": "_id",
                "as": "employee"
            }
        },

        {
            "$unwind": "$employee"
        },

        {
            "$lookup": {
                "from": "departments",
                "localField": "employee.department_id",
                "foreignField": "_id",
                "as": "department"
            }
        },

        {
            "$unwind": "$department"
        },

        {
            "$lookup": {
                "from": "designations",
                "localField": "employee.designation_id",
                "foreignField": "_id",
                "as": "designation"
            }
        },

        {
            "$unwind": "$designation"
        },

        {
            "$project": {

                "_id": 1,

                "employee_id": "$employee.employee_id",

                "employee_name": {
                    "$concat": [
                        "$employee.first_name",
                        " ",
                        "$employee.last_name"
                    ]
                },

                "department": "$department.department_name",

                "designation": "$designation.designation_name",

                "attendance_date": 1,

                "check_in": 1,

                "check_out": 1,

                "working_hours": 1,

                "status": 1
            }
        }

    ]

    attendance = []

    async for record in attendance_collection.aggregate(pipeline):

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance


# =====================================================
# Get Attendance By Employee
# =====================================================

async def get_employee_attendance(employee_id: str):

    attendance = []

    async for record in attendance_collection.find(
        {
            "employee_id": ObjectId(employee_id)
        }
    ):

        record["_id"] = str(record["_id"])
        record["employee_id"] = str(record["employee_id"])

        attendance.append(record)

    return attendance


# =====================================================
# Get Today's Attendance
# =====================================================

async def get_today_attendance():

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    attendance = []

    async for record in attendance_collection.find(
        {
            "attendance_date": today
        }
    ):
        record["_id"] = str(record["_id"])
        emp_obj_id = record["employee_id"]
        record["employee_id"] = str(emp_obj_id)

        emp_doc = await employees_collection.find_one({"_id": emp_obj_id})
        if emp_doc:
            record["email"] = emp_doc.get("email", "")
            record["employee_code"] = emp_doc.get("employee_id", "")
            record["employee_name"] = f"{emp_doc.get('first_name', '')} {emp_doc.get('last_name', '')}".strip()

        attendance.append(record)

    return attendance