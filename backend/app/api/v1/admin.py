from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.utils.dependencies import require_roles
from app.services.admin_service import (
    get_admin_dashboard_stats,
    get_system_audit_logs,
    check_system_health,
    get_all_users_list,
    update_user_role
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


class RoleUpdateSchema(BaseModel):
    role: str


@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """Centralized admin dashboard statistics endpoint."""
    return await get_admin_dashboard_stats()


@router.get("/users")
async def list_users(
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """List all registered system users and their roles."""
    users = await get_all_users_list()
    return {
        "count": len(users),
        "users": users
    }


@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    payload: RoleUpdateSchema,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """Update a user's system authorization role."""
    result = await update_user_role(user_id, payload.role)

    if result == "INVALID_ROLE":
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    if result == "USER_NOT_FOUND":
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "message": f"User role updated to '{payload.role}' successfully."
    }


@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 50,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """Fetch administrative system audit logs."""
    logs = await get_system_audit_logs(limit=limit)
    return {
        "count": len(logs),
        "audit_logs": logs
    }


@router.get("/system-health")
async def get_admin_health_status(
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """Detailed health check report for system administrators."""
    return await check_system_health()
