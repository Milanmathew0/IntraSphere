from app.database.mongodb import db
from app.utils.security import hash_password


async def create_user(user):
    users_collection = db["users"]

    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:
        return None

    # Force role to User for public registration
    assigned_role = "User"

    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "role": assigned_role,
        "is_active": True,
        "account_status": "Active"
    }

    result = await users_collection.insert_one(new_user)
    user_id_str = str(result.inserted_id)

    return user_id_str

async def get_user_by_email(email: str):
    users_collection = db["users"]

    user = await users_collection.find_one(
        {"email": email}
    )

    return user

async def get_or_create_google_user(email: str, name: str = "", picture: str = ""):
    users_collection = db["users"]
    employees_collection = db["employees"]

    existing_user = await users_collection.find_one({"email": email})

    if existing_user:
        return existing_user

    username = name or email.split("@")[0]
    name_parts = username.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    new_user = {
        "username": username,
        "email": email,
        "password": "",
        "role": "User",
        "picture": picture,
        "auth_provider": "google",
        "is_active": True,
        "account_status": "Active"
    }

    result = await users_collection.insert_one(new_user)
    user_id = result.inserted_id

    new_user["_id"] = user_id
    return new_user

from bson import ObjectId

async def sync_and_get_user_role(db_user: dict) -> str:
    if not db_user:
        return "User"

    user_role = db_user.get("role", "User")
    if user_role == "Admin":
        return "Admin"

    users_collection = db["users"]
    employees_collection = db["employees"]
    designations_collection = db["designations"]

    user_id = db_user["_id"]
    email = db_user.get("email")

    query = []
    if user_id:
        query.append({"user_id": user_id})
    if email:
        query.append({"email": email})

    emp = None
    if query:
        emp = await employees_collection.find_one({"$or": query})

    if emp:
        if "user_id" not in emp or emp["user_id"] != user_id:
            await employees_collection.update_one(
                {"_id": emp["_id"]},
                {"$set": {"user_id": user_id}}
            )

        designation_name = ""
        desig_val = emp.get("designation")
        if isinstance(desig_val, str):
            designation_name = desig_val
        elif isinstance(desig_val, dict):
            designation_name = desig_val.get("designation_name", "")
        elif "designation_id" in emp and isinstance(emp["designation_id"], ObjectId):
            desig_obj = await designations_collection.find_one({"_id": emp["designation_id"]})
            if desig_obj:
                designation_name = desig_obj.get("designation_name", "")

        department_val = emp.get("department", "")
        if isinstance(department_val, dict):
            department_val = department_val.get("department_name", "")

        emp_role = str(emp.get("role", ""))

        detected_role = None
        desig_lower = designation_name.lower()
        dept_lower = str(department_val).lower()
        emp_role_lower = emp_role.lower()

        if (
            "manager" in desig_lower
            or "manager" in emp_role_lower
            or designation_name == "Manager"
            or (dept_lower == "management" and (not designation_name or "manager" in desig_lower or desig_lower == ""))
        ):
            detected_role = "Manager"
        elif (
            "hr" in desig_lower
            or "human resource" in desig_lower
            or designation_name == "HR"
            or emp_role == "HR"
        ):
            detected_role = "HR"
        elif user_role == "User":
            detected_role = "Employee"

        if detected_role and detected_role != user_role:
            user_role = detected_role
            await users_collection.update_one(
                {"_id": user_id},
                {"$set": {"role": user_role}}
            )
            db_user["role"] = user_role

    return user_role