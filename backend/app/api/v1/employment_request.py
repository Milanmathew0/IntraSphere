from fastapi import APIRouter, HTTPException

from app.schemas.employment_request_schema import (
    EmploymentRequestCreate
)

from app.schemas.employee_schema import EmployeeCreate

from app.services.employment_request_service import (
    create_request,
    get_pending_requests,
    get_request_by_user,
    approve_request,
    reject_request
)

router = APIRouter(
    prefix="/employment-request",
    tags=["Employment Requests"]
)


# =====================================================
# Submit Employment Request
# =====================================================

@router.post("/")
async def submit_request(request: EmploymentRequestCreate):

    result = await create_request(request)

    if result == "USER_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if result == "REQUEST_ALREADY_EXISTS":
        raise HTTPException(
            status_code=400,
            detail="Employment request already submitted"
        )

    return {
        "message": "Employment request submitted successfully",
        "request_id": result
    }


# =====================================================
# Get My Employment Request
# =====================================================

@router.get("/me/{user_id}")
async def my_request(user_id: str):

    request = await get_request_by_user(user_id)

    if request is None:
        raise HTTPException(
            status_code=404,
            detail="No employment request found"
        )

    return request


# =====================================================
# HR - Get Pending Requests
# =====================================================

@router.get("/pending")
async def pending_requests():

    requests = await get_pending_requests()

    return {
        "count": len(requests),
        "requests": requests
    }


# =====================================================
# HR - Approve Request
# =====================================================

@router.patch("/{request_id}/approve")
async def approve_employment_request(
    request_id: str,
    hr_user_id: str,
    employee: EmployeeCreate
):

    result = await approve_request(
        request_id,
        hr_user_id,
        employee
    )

    if result == "REQUEST_NOT_FOUND":
        raise HTTPException(status_code=404, detail="Employment request not found")

    if result == "REQUEST_ALREADY_PROCESSED":
        raise HTTPException(status_code=400, detail="Request already processed")

    if result == "USER_NOT_FOUND":
        raise HTTPException(status_code=404, detail="User not found")

    if result == "EMPLOYEE_ALREADY_EXISTS":
        raise HTTPException(status_code=400, detail="Employee profile already exists")

    if result == "EMPLOYEE_ID_EXISTS":
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    if result == "DEPARTMENT_NOT_FOUND":
        raise HTTPException(status_code=404, detail="Department not found")

    if result == "DESIGNATION_NOT_FOUND":
        raise HTTPException(status_code=404, detail="Designation not found")

    return {
        "message": "Employment request approved successfully",
        "employee_id": result
    }


# =====================================================
# HR - Reject Request
# =====================================================

@router.patch("/{request_id}/reject")
async def reject_employment_request(
    request_id: str,
    hr_user_id: str
):

    result = await reject_request(
        request_id,
        hr_user_id
    )

    if result == "REQUEST_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Employment request not found"
        )

    if result == "REQUEST_ALREADY_PROCESSED":
        raise HTTPException(
            status_code=400,
            detail="Request already processed"
        )

    return {
        "message": "Employment request rejected successfully"
    }