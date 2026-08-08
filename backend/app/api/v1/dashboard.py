from fastapi import APIRouter

from app.services.dashboard_service import (
    get_dashboard_summary,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
async def dashboard():

    summary = await get_dashboard_summary()

    return summary