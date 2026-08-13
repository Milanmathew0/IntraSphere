from datetime import datetime
from bson import ObjectId
from app.database.connection import db

notifications_collection = db["notifications"]

async def create_notification(
    recipient_id: ObjectId,
    title: str,
    message: str,
    notification_type: str = "LEAVE_REQUEST",
    sender_id: ObjectId = None,
    related_entity_id: ObjectId = None
):
    """
    Creates an in-app notification for a user/employee.
    """
    doc = {
        "recipient_id": recipient_id,
        "sender_id": sender_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "related_entity_id": related_entity_id,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    result = await notifications_collection.insert_one(doc)
    return str(result.inserted_id)

async def get_user_notifications(user_id: ObjectId, limit: int = 50):
    notifications = []
    cursor = notifications_collection.find({"recipient_id": user_id}).sort("created_at", -1).limit(limit)
    async for n in cursor:
        notifications.append({
            "_id": str(n["_id"]),
            "recipient_id": str(n["recipient_id"]),
            "sender_id": str(n["sender_id"]) if n.get("sender_id") else None,
            "title": n.get("title", ""),
            "message": n.get("message", ""),
            "type": n.get("type", "GENERAL"),
            "related_entity_id": str(n["related_entity_id"]) if n.get("related_entity_id") else None,
            "is_read": n.get("is_read", False),
            "created_at": n.get("created_at").isoformat() if n.get("created_at") else None
        })
    return notifications

async def mark_notification_as_read(notification_id: str, user_id: ObjectId):
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "recipient_id": user_id},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

async def mark_all_notifications_as_read(user_id: ObjectId):
    result = await notifications_collection.update_many(
        {"recipient_id": user_id, "is_read": False},
        {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count
