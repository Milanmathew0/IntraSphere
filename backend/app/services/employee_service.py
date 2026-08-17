from datetime import datetime, date
from app.database.connection import db
from bson import ObjectId

employees_collection = db["employees"]
departments_collection = db["departments"]
designations_collection = db["designations"]


import secrets
import hashlib
from datetime import datetime, timedelta, date
from bson import ObjectId
from app.core.config import settings
from app.services.email_service import send_employee_activation_email
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

async def create_employee(employee):
    employee_dict = employee.model_dump()

    employee_dict["department_id"] = ObjectId(
        employee_dict["department_id"]
    )
    employee_dict["designation_id"] = ObjectId(
        employee_dict["designation_id"]
    )
    if employee_dict.get("reporting_manager_id"):
        try:
            employee_dict["reporting_manager_id"] = ObjectId(employee_dict["reporting_manager_id"])
        except Exception:
            employee_dict["reporting_manager_id"] = None
    else:
        employee_dict["reporting_manager_id"] = None

    employee_dict["joining_date"] = datetime.combine(
        employee_dict["joining_date"],
        datetime.min.time()
    )

    # Check if user email already exists
    users_collection = db["users"]
    existing_user = await users_collection.find_one({"email": employee.email})
    if existing_user:
        return "USER_EXISTS"

    # Check department
    department = await departments_collection.find_one(
        {"_id": ObjectId(employee.department_id)}
    )
    if department is None:
        return "DEPARTMENT_NOT_FOUND"

    # Check designation
    designation = await designations_collection.find_one(
        {"_id": ObjectId(employee.designation_id)}
    )
    if designation is None:
        return "DESIGNATION_NOT_FOUND"

    desig_name = designation.get("designation_name", "")
    assigned_role = "Employee"
    if "manager" in desig_name.lower():
        assigned_role = "Manager"
    elif "hr" in desig_name.lower():
        assigned_role = "HR"

    # Generate secure activation token
    activation_token = secrets.token_urlsafe(32)
    activation_token_hash = hashlib.sha256(activation_token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=24)

    # Create User
    full_name = f"{employee.first_name} {employee.last_name}".strip()
    new_user = {
        "username": full_name,
        "email": employee.email,
        "password": None,  # Set upon activation
        "role": assigned_role,
        "account_status": "Invited",
        "is_active": False,
        "activation_token_hash": activation_token_hash,
        "activation_token_expires_at": expires_at,
        "activation_token_expires": expires_at,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    user_result = await users_collection.insert_one(new_user)

    user_id = user_result.inserted_id
    user_id_str = str(user_id)

    # Auto-generate employee_id
    emp_code = f"EMP-{user_id_str[-6:].upper()}"

    # Create Employee Profile
    employee_dict["employee_id"] = emp_code
    employee_dict["user_id"] = user_id
    employee_dict["created_at"] = datetime.utcnow()
    employee_dict["updated_at"] = datetime.utcnow()

    result = await employees_collection.insert_one(employee_dict)

    # Build activation URL and send activation email
    activation_url = f"{settings.FRONTEND_URL}/activate-account?token={activation_token}"
    email_sent, email_msg = await send_employee_activation_email(
        recipient_email=employee.email,
        employee_name=full_name,
        activation_url=activation_url
    )

    return {
        "employee_id": emp_code,
        "email_sent": email_sent,
        "email_message": email_msg,
        "dev_activation_url": activation_url if settings.DEV_MODE else None
    }


async def get_all_employees():
    employees = []
    async for emp in employees_collection.find():
        emp_id = str(emp["_id"])

        first_name = emp.get("first_name", "")
        last_name = emp.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip() or emp.get("name") or emp.get("username") or "Employee"

        # Department string vs ObjectId resolution
        department_val = emp.get("department")
        if isinstance(department_val, dict):
            department_val = department_val.get("department_name", "General")
        elif not department_val and "department_id" in emp and isinstance(emp["department_id"], ObjectId):
            dept_obj = await departments_collection.find_one({"_id": emp["department_id"]})
            department_val = dept_obj.get("department_name") if dept_obj else "General"
        if not department_val:
            department_val = "Engineering"

        # Designation string vs ObjectId resolution
        designation_val = emp.get("designation")
        if isinstance(designation_val, dict):
            designation_val = designation_val.get("designation_name", "Staff Member")
        elif not designation_val and "designation_id" in emp and isinstance(emp["designation_id"], ObjectId):
            desig_obj = await designations_collection.find_one({"_id": emp["designation_id"]})
            designation_val = desig_obj.get("designation_name") if desig_obj else "Staff Member"
        if not designation_val:
            designation_val = "Software Engineer"

        reporting_manager_id_str = str(emp["reporting_manager_id"]) if emp.get("reporting_manager_id") else None

        employees.append({
            "_id": emp_id,
            "user_id": str(emp.get("user_id", "")),
            "employee_id": emp.get("employee_id", f"EMP-{emp_id[-6:].upper()}"),
            "first_name": first_name,
            "last_name": last_name,
            "name": full_name,
            "email": emp.get("email", ""),
            "phone": emp.get("phone", ""),
            "department": str(department_val),
            "designation": str(designation_val),
            "department_id": str(emp.get("department_id", "")),
            "designation_id": str(emp.get("designation_id", "")),
            "reporting_manager_id": reporting_manager_id_str,
            "employment_status": emp.get("employment_status", "Active"),
            "is_active": emp.get("is_active", True),
        })

    return employees

async def get_employee_by_id(employee_id: str):

    try:
        employee = await employees_collection.find_one({"_id": ObjectId(employee_id)})
    except Exception:
        employee = await employees_collection.find_one({"employee_id": employee_id})

    if employee is None:
        return None

    employee["_id"] = str(employee["_id"])
    if "user_id" in employee:
        employee["user_id"] = str(employee["user_id"])
    if "department_id" in employee:
        employee["department_id"] = str(employee["department_id"])
    if "designation_id" in employee:
        employee["designation_id"] = str(employee["designation_id"])
    if "reporting_manager_id" in employee and employee["reporting_manager_id"]:
        employee["reporting_manager_id"] = str(employee["reporting_manager_id"])

    return employee

async def update_employee(employee_id: str, employee):

    employee_data = employee.model_dump(exclude_unset=True)

    if "reporting_manager_id" in employee_data:
        if employee_data["reporting_manager_id"]:
            try:
                employee_data["reporting_manager_id"] = ObjectId(employee_data["reporting_manager_id"])
            except Exception:
                employee_data["reporting_manager_id"] = None
        else:
            employee_data["reporting_manager_id"] = None

    if "department_id" in employee_data and employee_data["department_id"]:
        employee_data["department_id"] = ObjectId(employee_data["department_id"])
    if "designation_id" in employee_data and employee_data["designation_id"]:
        employee_data["designation_id"] = ObjectId(employee_data["designation_id"])

    employee_data["updated_at"] = datetime.utcnow()

    result = await employees_collection.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": employee_data}
    )

    if result.matched_count == 0:
        return None

    # Sync role in users collection if designation was updated
    if "designation_id" in employee_data or "designation" in employee_data:
        emp = await employees_collection.find_one({"_id": ObjectId(employee_id)})
        if emp and "user_id" in emp and emp["user_id"]:
            users_coll = db["users"]
            u = await users_coll.find_one({"_id": emp["user_id"]})
            if u:
                from app.services.user_service import sync_and_get_user_role
                await sync_and_get_user_role(u)

    return True

async def deactivate_employee(employee_id: str):

    result = await employees_collection.update_one(
        {"_id": ObjectId(employee_id)},
        {
            "$set": {
                "employment_status": "Inactive",
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        return None

    return True

async def activate_employee(employee_id: str):

    result = await employees_collection.update_one(
        {"_id": ObjectId(employee_id)},
        {
            "$set": {
                "employment_status": "Active",
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        return None

    return True