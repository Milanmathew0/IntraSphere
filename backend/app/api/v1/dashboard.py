from fastapi import APIRouter
from app.services.dashboard_service import get_dashboard_summary
from app.services.admin_service import get_admin_dashboard_stats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
async def dashboard():
    summary = await get_dashboard_summary()
    return summary


@router.get("/admin")
async def admin_dashboard_summary():
    return await get_admin_dashboard_stats()