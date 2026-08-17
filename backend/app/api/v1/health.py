from fastapi import APIRouter
from app.services.admin_service import check_system_health

router = APIRouter(
    prefix="/health",
    tags=["System Health"]
)


@router.get("/")
async def health_check():
    """Public system health verification endpoint."""
    health = await check_system_health()
    return {
        "status": "online",
        "service": "IntraSphere API",
        "health": health
    }
