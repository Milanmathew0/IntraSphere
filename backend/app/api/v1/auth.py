from fastapi import APIRouter, HTTPException, Depends

from app.schemas.user_schema import UserRegister, UserLogin, UserGoogleLogin
from app.services.user_service import create_user, get_user_by_email, get_or_create_google_user, sync_and_get_user_role
from app.utils.security import verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(user: UserRegister):

    user_id = await create_user(user)

    if user_id is None:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User registered successfully",
        "user_id": user_id
    }


@router.post("/login")
async def login(user: UserLogin):

    db_user = await get_user_by_email(user.email)

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
        
    account_status = db_user.get("account_status", "Active")
    is_active = db_user.get("is_active", True)
    
    if account_status == "Invited":
        raise HTTPException(
            status_code=403,
            detail="Please activate your account using the invitation link."
        )
    if account_status in ["Inactive", "Suspended"] or not is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive or suspended."
        )

    user_role = await sync_and_get_user_role(db_user)
    username = db_user.get("username", db_user["email"].split("@")[0])

    access_token = create_access_token(
        {
            "sub": db_user["email"],
            "role": user_role,
            "username": username
        }
    )

    user_id_str = str(db_user["_id"])
    emp_code = f"EMP-{user_id_str[-6:].upper()}"

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user_role,
        "email": db_user["email"],
        "username": username,
        "user_id": user_id_str,
        "employee_code": emp_code
    }


@router.post("/google")
async def google_login(payload: UserGoogleLogin):
    db_user = await get_or_create_google_user(
        email=payload.email,
        name=payload.name,
        picture=payload.picture
    )
    
    account_status = db_user.get("account_status", "Active")
    is_active = db_user.get("is_active", True)
    
    if account_status == "Invited":
        raise HTTPException(
            status_code=403,
            detail="Please activate your account using the invitation link."
        )
    if account_status in ["Inactive", "Suspended"] or not is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive or suspended."
        )

    user_role = await sync_and_get_user_role(db_user)

    username = db_user.get("username", db_user["email"].split("@")[0])

    access_token = create_access_token(
        {
            "sub": db_user["email"],
            "role": user_role,
            "username": username
        }
    )

    user_id_str = str(db_user["_id"])
    emp_code = f"EMP-{user_id_str[-6:].upper()}"

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user_role,
        "email": db_user["email"],
        "username": username,
        "user_id": user_id_str,
        "employee_code": emp_code,
        "picture": db_user.get("picture", "")
    }


from app.schemas.user_schema import AccountActivate, ResendActivationRequest
from app.database.connection import db
from app.utils.security import hash_password
from app.core.config import settings
from app.services.email_service import send_employee_activation_email
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets
import hashlib

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

@router.post("/activate")
async def activate_account(payload: AccountActivate):
    if not payload.token or not payload.token.strip():
        raise HTTPException(status_code=400, detail="Invalid or expired activation link")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    users_collection = db["users"]
    
    # 1. Fast O(1) indexed SHA-256 token hash lookup
    token_hash = hashlib.sha256(payload.token.encode("utf-8")).hexdigest()
    matched_user = await users_collection.find_one({
        "activation_token_hash": token_hash,
        "account_status": "Invited"
    })

    # 2. Legacy fallback check for tokens hashed with passlib
    if not matched_user:
        invited_users = await users_collection.find({"account_status": "Invited"}).to_list(length=500)
        for u in invited_users:
            th = u.get("activation_token_hash")
            if th and th.startswith("$argon2") and pwd_context.verify(payload.token, th):
                matched_user = u
                break

    if not matched_user:
        raise HTTPException(status_code=400, detail="Invalid or expired activation link")

    # Check token expiration
    expires = matched_user.get("activation_token_expires_at") or matched_user.get("activation_token_expires")
    if expires and expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired activation link")

    # Activate user account
    await users_collection.update_one(
        {"_id": matched_user["_id"]},
        {
            "$set": {
                "password": hash_password(payload.password),
                "account_status": "Active",
                "is_active": True,
                "updated_at": datetime.utcnow()
            },
            "$unset": {
                "activation_token_hash": "",
                "activation_token_expires_at": "",
                "activation_token_expires": ""
            }
        }
    )

    # Sync employee record status
    employees_collection = db["employees"]
    await employees_collection.update_one(
        {"$or": [{"user_id": matched_user["_id"]}, {"email": matched_user["email"]}]},
        {"$set": {"employment_status": "Active", "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Account activated successfully"}


@router.post("/resend-activation")
async def resend_activation(payload: ResendActivationRequest):
    users_collection = db["users"]
    user = await users_collection.find_one({"email": payload.email})

    generic_response = {"message": "If an invited account exists for this email, a new activation link has been sent."}

    if not user or user.get("account_status") != "Invited":
        return generic_response

    # Rate limiting: 60-second cooldown
    now = datetime.utcnow()
    last_sent = user.get("last_activation_email_sent_at")
    if last_sent and (now - last_sent).total_seconds() < 60:
        raise HTTPException(
            status_code=429,
            detail="Please wait at least 60 seconds before requesting another activation email."
        )

    # Generate new activation token
    new_token = secrets.token_urlsafe(32)
    new_token_hash = hashlib.sha256(new_token.encode("utf-8")).hexdigest()
    expires_at = now + timedelta(hours=24)

    # Invalidate old token hash and set new token hash
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "activation_token_hash": new_token_hash,
                "activation_token_expires_at": expires_at,
                "activation_token_expires": expires_at,
                "last_activation_email_sent_at": now,
                "updated_at": now
            }
        }
    )

    activation_url = f"{settings.FRONTEND_URL}/activate-account?token={new_token}"
    full_name = user.get("username") or user["email"].split("@")[0]
    email_sent, email_msg = await send_employee_activation_email(
        recipient_email=user["email"],
        employee_name=full_name,
        activation_url=activation_url
    )

    return {
        "message": "If an invited account exists for this email, a new activation email has been sent.",
        "email_sent": email_sent
    }


@router.get("/me")
async def get_logged_in_user(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated user",
        "user": current_user
    }