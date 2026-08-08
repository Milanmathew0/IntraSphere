from fastapi import APIRouter, HTTPException

from app.schemas.attendance_schema import AttendanceCheckIn

from app.services.attendance_service import (
    check_in,
    check_out,
    get_all_attendance,
    get_employee_attendance,
    get_today_attendance
)

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


# =====================================================
# Employee Check In
# =====================================================
@router.post("/check-in")
async def employee_check_in(data: AttendanceCheckIn):

    result = await check_in(data.employee_code)

    if result == "EMPLOYEE_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if result == "ALREADY_CHECKED_IN":
        raise HTTPException(
            status_code=400,
            detail="Employee already checked in today"
        )

    return {
        "message": "Check-in successful",
        "attendance_id": result
    }


# =====================================================
# Employee Check Out
# =====================================================
@router.patch("/check-out/{employee_code}")
async def employee_check_out(employee_code: str):

    result = await check_out(employee_code)

    if result == "EMPLOYEE_NOT_FOUND":
      raise HTTPException(
          status_code=404,
          detail="Employee not found"
      )

    if result == "CHECKIN_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    if result == "ALREADY_CHECKED_OUT":
        raise HTTPException(
            status_code=400,
            detail="Employee already checked out"
        )

    return {
        "message": "Check-out successful"
    }


# =====================================================
# Get All Attendance
# =====================================================
@router.get("/")
async def attendance_list():

    attendance = await get_all_attendance()

    return {
        "count": len(attendance),
        "attendance": attendance
    }


# =====================================================
# Get Today's Attendance
# =====================================================
@router.get("/today")
async def today_attendance():

    attendance = await get_today_attendance()

    return {
        "count": len(attendance),
        "attendance": attendance
    }


# =====================================================
# Get Employee Attendance
# =====================================================
@router.get("/{employee_id}")
async def employee_attendance(employee_id: str):

    attendance = await get_employee_attendance(employee_id)

    return {
        "count": len(attendance),
        "attendance": attendance
    }