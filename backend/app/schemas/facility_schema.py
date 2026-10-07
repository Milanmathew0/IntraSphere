from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ==========================================
# MAINTENANCE SCHEMAS
# ==========================================

class MaintenanceCreate(BaseModel):
    resource_type: str = Field(..., description="meeting_room or workspace or general")
    resource_id: str = Field(..., description="ID of the room or workspace desk")
    resource_name: str = Field(..., description="Name or code of the resource")
    issue_title: str = Field(..., min_length=3, max_length=150)
    issue_description: str = Field(..., min_length=5)
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None


class MaintenanceUpdate(BaseModel):
    issue_title: Optional[str] = None
    issue_description: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    status: Optional[str] = None  # Open, Scheduled, In Progress, Completed, Cancelled
    resolution_notes: Optional[str] = None


class MaintenanceStatusUpdate(BaseModel):
    status: str = Field(..., description="Open, Scheduled, In Progress, Completed, Cancelled")
    resolution_notes: Optional[str] = None


class MaintenanceResponse(BaseModel):
    id: str
    resource_type: str
    resource_id: str
    resource_name: str
    issue_title: str
    issue_description: str
    priority: str
    reported_by: Optional[str] = None
    reported_by_name: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    status: str
    scheduled_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    conflict_reservations_count: Optional[int] = 0


# ==========================================
# RESOURCE MAINTENANCE OVERRIDE
# ==========================================

class ResourceMaintenanceStatus(BaseModel):
    status: str = Field(..., description="Available, Maintenance, Inactive")
    issue_title: Optional[str] = None
    issue_description: Optional[str] = None
    priority: Optional[str] = "Medium"


class ReservationCancelRequest(BaseModel):
    cancellation_reason: str = Field("Cancelled by Facility Policy", min_length=3)


class ReservationStatusUpdate(BaseModel):
    status: str = Field(..., description="Confirmed, Pending, Cancelled, Completed")
    purpose: Optional[str] = None
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None

