from pydantic import BaseModel
from typing import Optional
from datetime import date

# --- Leave Type Schemas ---
class LeaveTypeCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    annual_allocation: float = 12.0
    carry_forward_allowed: bool = False
    maximum_consecutive_days: Optional[int] = 5
    requires_attachment: bool = False
    requires_approval: bool = True
    allow_negative_balance: bool = False
    is_active: bool = True

class LeaveTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    annual_allocation: Optional[float] = None
    carry_forward_allowed: Optional[bool] = None
    maximum_consecutive_days: Optional[int] = None
    requires_attachment: Optional[bool] = None
    requires_approval: Optional[bool] = None
    allow_negative_balance: Optional[bool] = None
    is_active: Optional[bool] = None

class LeaveTypeResponse(BaseModel):
    id: str
    name: str
    description: str
    annual_allocation: float
    carry_forward_allowed: bool
    maximum_consecutive_days: Optional[int]
    requires_attachment: bool
    requires_approval: bool
    allow_negative_balance: bool
    is_active: bool

# --- Leave Request Schemas ---
class LeaveRequestCreate(BaseModel):
    leave_type_id: str
    start_date: date
    end_date: date
    is_half_day: bool = False
    half_day_session: Optional[str] = None  # "Morning" | "Afternoon"
    reason: str
    contact_number: Optional[str] = None
    attachment_url: Optional[str] = None

class LeaveApprovalAction(BaseModel):
    approval_comment: Optional[str] = "Approved"

class LeaveRejectionAction(BaseModel):
    rejection_reason: str

class LeaveCancellationAction(BaseModel):
    cancellation_reason: Optional[str] = "Cancelled by user"

# --- Leave Balance Schemas ---
class LeaveBalanceAdjustment(BaseModel):
    allocated: Optional[float] = None
    reason: str

class LeaveBalanceResponse(BaseModel):
    id: str
    employee_id: str
    leave_type_id: str
    leave_type_name: str
    year: int
    allocated: float
    used: float
    pending: float
    remaining: float

# --- Holiday Schemas ---
class HolidayCreate(BaseModel):
    name: str
    date: date
    is_active: bool = True

class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    is_active: Optional[bool] = None
