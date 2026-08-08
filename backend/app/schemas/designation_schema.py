from pydantic import BaseModel
from typing import Optional


class DesignationCreate(BaseModel):
    designation_code: str
    designation_name: str
    description: Optional[str] = None
    status: str = "Active"


class DesignationUpdate(BaseModel):
    designation_code: Optional[str] = None
    designation_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class DesignationResponse(BaseModel):
    id: str
    designation_code: str
    designation_name: str
    description: Optional[str] = None
    status: str