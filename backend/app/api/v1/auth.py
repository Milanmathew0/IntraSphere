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


from app.schemas.user_schema import AccountActivate
from app.database.mongodb import db
from app.utils.security import hash_password
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

@router.post("/activate")
async def activate_account(payload: AccountActivate):
    users_collection = db["users"]
    
    invited_users = await users_collection.find({"account_status": "Invited"}).to_list(length=1000)
    matched_user = None
    for u in invited_users:
        token_hash = u.get("activation_token_hash")
        expires = u.get("activation_token_expires")
        
        if token_hash and pwd_context.verify(payload.token, token_hash):
            if expires and expires < datetime.utcnow():
                raise HTTPException(status_code=400, detail="Activation link has expired")
            matched_user = u
            break
            
    if not matched_user:
        raise HTTPException(status_code=400, detail="Invalid or expired activation link")
        
    await users_collection.update_one(
        {"_id": matched_user["_id"]},
        {
            "$set": {
                "password": hash_password(payload.password),
                "account_status": "Active",
                "is_active": True
            },
            "$unset": {
                "activation_token_hash": "",
                "activation_token_expires": ""
            }
        }
    )
    
    return {"message": "Account activated successfully"}


@router.get("/me")
async def get_logged_in_user(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated user",
        "user": current_user
    }