from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# DESK SCHEMAS
# ==========================================

class WorkspaceDeskCreate(BaseModel):
    desk_code: str = Field(..., example="D-2-015")
    desk_name: str = Field(..., example="Desk 015")
    floor: int = Field(..., example=2)
    zone: str = Field(..., example="Engineering")
    location: Optional[str] = Field("North Wing", example="North Wing")
    building: Optional[str] = Field("Main Office", example="Main Office")
    description: Optional[str] = Field(None, example="Standard workstation near engineering area")
    capacity: Optional[int] = Field(1, example=1)
    workspace_type: Optional[str] = Field("Standard Desk", example="Standard Desk")
    is_accessible: Optional[bool] = Field(False, example=False)
    facilities: List[str] = Field(default_factory=list, example=["Monitor", "USB-C", "Wi-Fi"])
    status: Optional[str] = Field("Available", example="Available")  # Available, Maintenance, Inactive
    image_url: Optional[str] = None
    is_active: Optional[bool] = True


class WorkspaceDeskUpdate(BaseModel):
    desk_code: Optional[str] = None
    desk_name: Optional[str] = None
    floor: Optional[int] = None
    zone: Optional[str] = None
    location: Optional[str] = None
    building: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    workspace_type: Optional[str] = None
    is_accessible: Optional[bool] = None
    facilities: Optional[List[str]] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class WorkspaceDeskOut(BaseModel):
    id: str
    desk_code: str
    desk_name: str
    floor: int
    zone: str
    location: str
    building: str
    description: Optional[str] = ""
    capacity: int
    workspace_type: str
    is_accessible: bool
    facilities: List[str] = []
    status: str          # Administrative status: Available, Maintenance, Inactive
    current_status: str  # Computed status: Available Now, Reserved, Maintenance, Inactive
    image_url: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None


# ==========================================
# RESERVATION SCHEMAS
# ==========================================

class WorkspaceReservationCreate(BaseModel):
    desk_id: str
    date: str = Field(..., example="2026-09-15")  # YYYY-MM-DD
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = Field("Office work", example="Office work")
    notes: Optional[str] = Field("", example="Need quiet space for client demo")


class WorkspaceReservationOut(BaseModel):
    id: str
    desk_id: str
    desk_name: str
    desk_code: str
    building: str
    floor: int
    zone: str
    location: str
    employee_id: str
    user_id: str
    employee_name: str
    employee_email: str
    department: str
    date: str
    start_time: str
    end_time: str
    purpose: str
    notes: Optional[str] = ""
    status: str  # Confirmed, Cancelled, Completed, Pending
    created_at: Optional[str] = None


class WorkspaceReservationCancel(BaseModel):
    cancellation_reason: Optional[str] = "Cancelled by employee"


class DeskAvailabilityCheckRequest(BaseModel):
    start_time: datetime
    end_time: datetime
