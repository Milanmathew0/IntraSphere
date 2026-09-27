from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read
)
from app.database.connection import db

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/my")
async def list_my_notifications(current_user: dict = Depends(get_current_user)):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        return []
    return await get_user_notifications(user["_id"])

@router.patch("/{id}/read")
async def mark_notification_read_api(id: str, current_user: dict = Depends(get_current_user)):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    success = await mark_notification_as_read(id, user["_id"])
    return {"success": success}

@router.patch("/read-all")
async def mark_all_notifications_read_api(current_user: dict = Depends(get_current_user)):
    email = current_user.get("sub")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    count = await mark_all_notifications_as_read(user["_id"])
    return {"marked_read": count}
