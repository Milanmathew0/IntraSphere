from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttendanceCheckIn(BaseModel):
    employee_code: str


class AttendanceResponse(BaseModel):
    id: str

    employee_id: str

    attendance_date: datetime

    check_in: datetime

    check_out: Optional[datetime] = None

    working_hours: Optional[float] = None

    status: str

    created_at: datetime

    updated_at: datetime