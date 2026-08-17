from fastapi import APIRouter, HTTPException
from app.schemas.employee_schema import (
    EmployeeCreate,
    EmployeeUpdate,
)
from app.services.employee_service import (
    create_employee,
    get_all_employees,
    get_employee_by_id,
    update_employee,
    deactivate_employee,
    activate_employee,
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("/")
async def add_employee(employee: EmployeeCreate):

    result = await create_employee(employee)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    if result == "USER_EXISTS":
        raise HTTPException(
            status_code=400,
            detail="This user email already exists"
        )
        
    if result == "DEPARTMENT_NOT_FOUND":
        raise HTTPException(status_code=400, detail="Department not found")
        
    if result == "DESIGNATION_NOT_FOUND":
        raise HTTPException(status_code=400, detail="Designation not found")

    employee_id = result["employee_id"]
    email_sent = result.get("email_sent", False)
    email_msg = result.get("email_message", "")

    if email_sent:
        message = "Employee created successfully. Activation email has been sent."
        invitation_status = "Sent"
    else:
        message = "Employee created, but activation email could not be sent."
        invitation_status = "Pending"

    return {
        "message": message,
        "employee_id": employee_id,
        "invitation_status": invitation_status,
        "email_sent": email_sent,
        "email_message": email_msg,
        "dev_activation_url": result.get("dev_activation_url")
    }


@router.get("/")
async def get_employees():
    employees = await get_all_employees()

    return {
        "count": len(employees),
        "employees": employees
    }

@router.get("/{employee_id}")
async def get_employee(employee_id: str):

    employee = await get_employee_by_id(employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee

@router.put("/{employee_id}")
async def edit_employee(employee_id: str, employee: EmployeeUpdate):

    updated = await update_employee(employee_id, employee)

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "message": "Employee updated successfully"
    }

@router.patch("/{employee_id}/deactivate")
async def deactivate_employee_api(employee_id: str):

    result = await deactivate_employee(employee_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "message": "Employee deactivated successfully"
    }

@router.patch("/{employee_id}/activate")
async def activate_employee_api(employee_id: str):

    result = await activate_employee(employee_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "message": "Employee activated successfully"
    }