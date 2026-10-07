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


class PerformanceOverviewQuery(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    department: Optional[str] = None


class PunctualityReportItem(BaseModel):
    employee_id: str
    employee_code: str
    employee_name: str
    email: str
    department: str
    designation: str
    total_days_present: int
    on_time_days: int
    late_days: int
    early_checkout_days: int
    avg_check_in_time: str
    total_working_hours: float
    avg_daily_hours: float
    punctuality_score: float
    grade: str