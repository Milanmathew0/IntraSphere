import sys
import asyncio
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def main():
    if len(sys.argv) < 3:
        print("Usage: python reset_password.py <email> <new_password>")
        sys.exit(1)

    email = sys.argv[1]
    new_password = sys.argv[2]

    from app.database.connection import db

    user = await db["users"].find_one({"email": email})
    if not user:
        print(f"Error: User with email '{email}' not found in MongoDB.")
        sys.exit(1)

    hashed = hash_password(new_password)
    await db["users"].update_one(
        {"email": email},
        {"$set": {"password": hashed, "is_active": True, "account_status": "Active"}}
    )
    print(f"SUCCESS: Password for '{email}' has been reset to '{new_password}'!")

if __name__ == "__main__":
    asyncio.run(main())
