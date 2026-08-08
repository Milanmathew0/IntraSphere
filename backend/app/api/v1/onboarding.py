from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.services.onboarding_service import (
    submit_onboarding_request,
    get_user_onboarding_request,
    get_all_onboarding_requests,
    approve_onboarding_request,
    reject_onboarding_request,
)
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"]
)


class OnboardingRequestSchema(BaseModel):
    department: str
    job_title: str
    emp_code: Optional[str] = ""
    message: Optional[str] = ""


class RejectRequestSchema(BaseModel):
    reason: Optional[str] = ""


@router.post("/request")
async def create_onboarding_request(
    data: OnboardingRequestSchema,
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    username = current_user.get("username", email.split("@")[0])

    request_id = await submit_onboarding_request(
        user_email=email,
        username=username,
        department=data.department,
        job_title=data.job_title,
        emp_code=data.emp_code,
        message=data.message
    )

    return {
        "message": "Onboarding request submitted successfully",
        "request_id": request_id
    }


@router.get("/request/me")
async def get_my_onboarding_request(
    current_user: dict = Depends(get_current_user)
):
    email = current_user.get("sub")
    request = await get_user_onboarding_request(email)

    return {
        "request": request
    }


@router.get("/requests")
async def list_onboarding_requests(
    status: Optional[str] = Query(None, description="Filter by status (pending, approved, rejected, all)")
):
    requests = await get_all_onboarding_requests(status_filter=status)
    return {
        "count": len(requests),
        "requests": requests
    }


@router.post("/requests/{request_id}/approve")
async def approve_request_api(request_id: str):
    success = await approve_onboarding_request(request_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to approve request. Invalid ID or request not found.")

    return {
        "message": "Onboarding request approved. User upgraded to Employee status successfully!"
    }


@router.post("/requests/{request_id}/reject")
async def reject_request_api(request_id: str, data: Optional[RejectRequestSchema] = None):
    reason = data.reason if data else ""
    success = await reject_onboarding_request(request_id, reason=reason)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reject request. Invalid ID or request not found.")

    return {
        "message": "Onboarding request rejected."
    }
