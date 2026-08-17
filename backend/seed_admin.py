import asyncio
import sys
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_admin(email: str = "admin@intrasphere.com", password: str = "Admin123!", username: str = "System Admin"):
    from app.database.connection import db

    users_collection = db["users"]
    employees_collection = db["employees"]

    existing_user = await users_collection.find_one({"email": email})
    hashed_pwd = hash_password(password)

    if existing_user:
        await users_collection.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "role": "Admin",
                    "password": hashed_pwd,
                    "account_status": "Active",
                    "is_active": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        print(f"[SUCCESS] Updated existing user '{email}' to role 'Admin' with new password!")
    else:
        new_user = {
            "username": username,
            "email": email,
            "password": hashed_pwd,
            "role": "Admin",
            "account_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await users_collection.insert_one(new_user)
        user_id = res.inserted_id

        emp_code = f"EMP-{str(user_id)[-6:].upper()}"
        employee_doc = {
            "employee_id": emp_code,
            "first_name": "System",
            "last_name": "Admin",
            "email": email,
            "user_id": user_id,
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await employees_collection.insert_one(employee_doc)
        print(f"[SUCCESS] Created new Admin account '{email}' with password '{password}'!")

if __name__ == "__main__":
    email_arg = sys.argv[1] if len(sys.argv) > 1 else "admin@intrasphere.com"
    pass_arg = sys.argv[2] if len(sys.argv) > 2 else "Admin123!"
    asyncio.run(seed_admin(email_arg, pass_arg))
