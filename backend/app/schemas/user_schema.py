from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[str] = "User"


class UserResponse(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserGoogleLogin(BaseModel):
    email: EmailStr
    name: Optional[str] = ""
    picture: Optional[str] = ""
    google_id: Optional[str] = ""
    token: Optional[str] = ""

class AccountActivate(BaseModel):
    token: str
    password: str = Field(..., min_length=8)