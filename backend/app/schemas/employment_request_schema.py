from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EmploymentRequestCreate(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    reason: str


class EmploymentRequestResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    reason: str
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime