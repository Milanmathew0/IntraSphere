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
from app.services.leave_service import init_leave_system
from app.services.department_service import init_departments
from app.services.designation_service import init_designations
from app.services.meeting_service import init_meeting_rooms

app = FastAPI(
    title="IntraSphere API",
    description="Backend API for Smart Office Management System",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    await init_leave_system()
    await init_departments()
    await init_designations()
    await init_meeting_rooms()


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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
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

@app.get("/")
async def root():
    collections = await db.list_collection_names()

    return {
        "message": "Welcome to IntraSphere API",
        "database": "Connected Successfully",
        "collections": collections
    }