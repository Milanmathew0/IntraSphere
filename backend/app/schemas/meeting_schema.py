from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# ROOM SCHEMAS
# ==========================================

class RoomCreate(BaseModel):
    room_name: str = Field(..., example="Conference Room A")
    room_code: str = Field(..., example="CR-A-201")
    floor: int = Field(..., example=2)
    location: str = Field(..., example="North Wing")
    capacity: int = Field(..., example=10, gt=0)
    description: Optional[str] = Field(None, example="Executive conference room with 4K display and VC.")
    facilities: List[str] = Field(default_factory=list, example=["Projector", "Video Conferencing", "Whiteboard"])
    status: Optional[str] = Field("Available", example="Available") # Available, Maintenance, Inactive
    image_url: Optional[str] = None
    is_active: Optional[bool] = True


class RoomUpdate(BaseModel):
    room_name: Optional[str] = None
    room_code: Optional[str] = None
    floor: Optional[int] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    facilities: Optional[List[str]] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class RoomOut(BaseModel):
    id: str
    room_name: str
    room_code: str
    floor: int
    location: str
    capacity: int
    description: Optional[str] = ""
    facilities: List[str] = []
    status: str # Administrative status: Available, Maintenance, Inactive
    current_status: str # Computed availability: "Available Now", "Occupied", "Maintenance"
    image_url: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None


# ==========================================
# BOOKING SCHEMAS
# ==========================================

class BookingCreate(BaseModel):
    room_id: str
    title: str = Field(..., example="Project Sprint Review")
    description: Optional[str] = Field("", example="Bi-weekly sprint review with engineering team.")
    meeting_type: Optional[str] = Field("Internal Sync", example="Internal Sync")
    start_time: datetime
    end_time: datetime
    attendees: List[str] = Field(default_factory=list) # List of employee_ids


class BookingOut(BaseModel):
    id: str
    room_id: str
    room_name: str
    room_code: str
    location: str
    floor: int
    organizer_employee_id: str
    organizer_name: str
    organizer_email: str
    title: str
    description: Optional[str] = ""
    meeting_type: str
    start_time: datetime
    end_time: datetime
    attendees: List[dict] = [] # list of attendee objects {id, name, email, employee_id}
    attendee_count: int
    status: str # Confirmed, Cancelled, Completed
    created_at: Optional[datetime] = None


class BookingCancel(BaseModel):
    cancellation_reason: Optional[str] = "Cancelled by organizer"


class AvailabilityCheckRequest(BaseModel):
    start_time: datetime
    end_time: datetime
