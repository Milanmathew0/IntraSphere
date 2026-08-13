from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


# Create Employee
class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str

    department_id: str
    designation_id: str

    address: Optional[str] = ""

    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""

    joining_date: date

    employment_status: str = "Active"

    profile_image: Optional[str] = None
    reporting_manager_id: Optional[str] = None


# Update Employee
class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    department_id: Optional[str] = None
    designation_id: Optional[str] = None

    address: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    joining_date: Optional[date] = None

    employment_status: Optional[str] = None

    profile_image: Optional[str] = None
    reporting_manager_id: Optional[str] = None


# Response Model
class EmployeeResponse(BaseModel):
    id: str

    user_id: str
    employee_id: str

    first_name: str
    last_name: str
    email: EmailStr
    phone: str

    department_id: str
    designation_id: str

    address: Optional[str] = ""

    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""

    joining_date: date

    employment_status: str

    profile_image: Optional[str] = None
    reporting_manager_id: Optional[str] = None