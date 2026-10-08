from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
from fastapi.staticfiles import StaticFiles
from app.api.v1.auth import router as auth_router
from app.api.v1.employee import router as employee_router
from app.database.connection import db
from app.api.v1.department import router as department_router
from app.api.v1.designation import router as designation_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.employment_request import router as employment_request_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.leave import router as leave_router
from app.api.v1.meeting_rooms import router as meeting_rooms_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.admin import router as admin_router
from app.api.v1.facility import router as facility_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.health import router as health_router
from app.services.leave_service import init_leave_system
from app.services.department_service import init_departments
from app.services.designation_service import init_designations
from app.services.meeting_service import init_meeting_rooms
from app.services.workspace_service import init_workspace_desks
from app.services.user_service import init_facility_manager

app = FastAPI(
    title="IntraSphere API",
    description="Backend API for Smart Office Management System",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    try:
        await init_leave_system()
        await init_departments()
        await init_designations()
        await init_meeting_rooms()
        await init_workspace_desks()
        await init_facility_manager()

        await db["users"].create_index("email", unique=True)
        await db["users"].create_index("activation_token_hash")
        await db["employees"].create_index("employee_id", unique=True)
        await db["facility_maintenance"].create_index("resource_type")
        await db["facility_maintenance"].create_index("resource_id")
        await db["facility_maintenance"].create_index("status")
        await db["facility_maintenance"].create_index("priority")
        await db["facility_maintenance"].create_index("created_at")
        await db["facility_maintenance"].create_index("scheduled_date")
    except Exception as e:
        print(f"[STARTUP ERROR] Error during database initialization: {e}")


# Mount Static Uploads Directory
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Allow React frontend to access the backend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://intra-sphere.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(employee_router, prefix="/api/v1")
app.include_router(department_router, prefix="/api/v1")
app.include_router(designation_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(attendance_router, prefix="/api/v1")
app.include_router(employment_request_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1")
app.include_router(leave_router, prefix="/api/v1")
app.include_router(meeting_rooms_router, prefix="/api/v1")
app.include_router(workspaces_router, prefix="/api/v1")
app.include_router(facility_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")

@app.get("/")
async def root():
    collections = await db.list_collection_names()

    return {
        "message": "Welcome to IntraSphere API",
        "database": "Connected Successfully",
        "collections": collections
    }