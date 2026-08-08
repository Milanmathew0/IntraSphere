from motor.motor_asyncio import AsyncIOMotorClient

from app.database.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)

db = client[settings.DATABASE_NAME]