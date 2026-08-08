from app.database.mongodb import db
from app.utils.security import hash_password


async def create_user(user):
    users_collection = db["users"]

    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:
        return None

    assigned_role = getattr(user, "role", "User") or "User"
    # Normalize role to standard title casing if provided (Admin, Manager, Employee, User)
    if assigned_role.lower() == "admin":
        assigned_role = "Admin"
    elif assigned_role.lower() == "manager":
        assigned_role = "Manager"
    elif assigned_role.lower() == "employee":
        assigned_role = "Employee"
    else:
        assigned_role = "User"

    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "role": assigned_role,
        "is_active": True
    }

    

    result = await users_collection.insert_one(new_user)
    user_id_str = str(result.inserted_id)

    # Auto-create matching profile in employees collection so attendance check-in/out works seamlessly
    employees_collection = db["employees"]
    emp_code = f"EMP-{user_id_str[-6:].upper()}"
    
    existing_emp = await employees_collection.find_one({"email": user.email})
    if not existing_emp:
        name_parts = user.username.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        await employees_collection.insert_one({
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": user.email,
            "user_id": result.inserted_id,
            "is_active": True
        })

    return user_id_str

async def get_user_by_email(email: str):
    users_collection = db["users"]

    user = await users_collection.find_one(
        {"email": email}
    )

    return user