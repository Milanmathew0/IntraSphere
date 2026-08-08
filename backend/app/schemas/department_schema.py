from pydantic import BaseModel
from typing import Optional


class DepartmentCreate(BaseModel):
    department_code: str
    department_name: str
    description: Optional[str] = None
    status: str = "Active"


class DepartmentResponse(BaseModel):
    department_code: str
    department_name: str
    description: Optional[str] = None
    status: str
    