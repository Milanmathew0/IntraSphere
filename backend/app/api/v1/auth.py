from fastapi import APIRouter, HTTPException, Depends

from app.schemas.user_schema import UserRegister, UserLogin, UserGoogleLogin
from app.services.user_service import create_user, get_user_by_email, get_or_create_google_user
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

    user_role = db_user.get("role", "User")
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

    user_role = db_user.get("role", "User")
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


@router.get("/me")
async def get_logged_in_user(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated user",
        "user": current_user
    }