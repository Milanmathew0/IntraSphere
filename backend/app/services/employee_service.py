from datetime import datetime, date
from app.database.connection import db
from bson import ObjectId

employees_collection = db["employees"]
departments_collection = db["departments"]
designations_collection = db["designations"]


async def create_employee(employee):

    employee_dict = employee.model_dump()

    # Convert joining_date from date to datetime
    employee_dict["user_id"] = ObjectId(
        employee_dict["user_id"]
)

    employee_dict["department_id"] = ObjectId(
        employee_dict["department_id"]
)

    employee_dict["designation_id"] = ObjectId(
        employee_dict["designation_id"]
)
    employee_dict["joining_date"] = datetime.combine(
        employee_dict["joining_date"],
        datetime.min.time()
    )

    # Check duplicate employee ID
    existing_employee = await employees_collection.find_one(
        {"employee_id": employee.employee_id}
    )

    if existing_employee:
        return None

    # Check duplicate user
    existing_user = await employees_collection.find_one(
    {"user_id": ObjectId(employee.user_id)}
)

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

    employee_dict["created_at"] = datetime.utcnow()
    employee_dict["updated_at"] = datetime.utcnow()

    result = await employees_collection.insert_one(employee_dict)

    return str(result.inserted_id)


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

        employees.append({
            "_id": emp_id,
            "employee_id": emp.get("employee_id", f"EMP-{emp_id[-6:].upper()}"),
            "first_name": first_name,
            "last_name": last_name,
            "name": full_name,
            "email": emp.get("email", ""),
            "phone": emp.get("phone", ""),
            "department": str(department_val),
            "designation": str(designation_val),
            "employment_status": emp.get("employment_status", "Active"),
            "is_active": emp.get("is_active", True),
        })

    return employees

async def get_employee_by_id(employee_id: str):

    employee = await employees_collection.find_one(
        {
            "_id": ObjectId(employee_id)
        }
    )

    if employee is None:
        return None

    employee["_id"] = str(employee["_id"])

    return employee

async def update_employee(employee_id: str, employee):

    employee_data = employee.model_dump(exclude_unset=True)

    employee_data["updated_at"] = datetime.utcnow()

    result = await employees_collection.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": employee_data}
    )

    if result.matched_count == 0:
        return None

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