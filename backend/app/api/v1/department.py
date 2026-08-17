from fastapi import APIRouter, HTTPException

from app.schemas.department_schema import DepartmentCreate
from app.services.department_service import (
    create_department,
    get_all_departments,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


@router.post("/")
@router.post("")
async def add_department(department: DepartmentCreate):

    result = await create_department(department)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Department already exists"
        )

    return {
        "message": "Department created successfully",
        "department_id": result
    }


@router.get("/")
@router.get("")
async def get_departments():

    departments = await get_all_departments()

    return {
        "count": len(departments),
        "departments": departments
    }