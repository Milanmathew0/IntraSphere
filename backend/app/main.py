from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.employee import router as employee_router
from app.database.connection import db
from app.api.v1.department import router as department_router
from app.api.v1.designation import router as designation_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.employment_request import router as employment_request_router
from app.api.v1.onboarding import router as onboarding_router

app = FastAPI(
    title="IntraSphere API",
    description="Backend API for Smart Office Management System",
    version="1.0.0"
)

# Allow React frontend to access the backend
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/")
async def root():
    collections = await db.list_collection_names()

    return {
        "message": "Welcome to IntraSphere API",
        "database": "Connected Successfully",
        "collections": collections
    }