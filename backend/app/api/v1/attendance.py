from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
import csv
import io

from app.schemas.attendance_schema import AttendanceCheckIn

from app.services.attendance_service import (
    check_in,
    check_out,
    get_all_attendance,
    get_employee_attendance,
    get_today_attendance,
    get_performance_overview,
    get_punctuality_reports
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
# Get Performance Overview
# =====================================================
@router.get("/performance-overview")
async def performance_overview_api(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department: Optional[str] = Query(None)
):
    return await get_performance_overview(start_date, end_date, department)


# =====================================================
# Get Punctuality Reports
# =====================================================
@router.get("/punctuality-reports")
async def punctuality_reports_api(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    reports = await get_punctuality_reports(start_date, end_date, department, search)
    return {
        "count": len(reports),
        "reports": reports
    }


# =====================================================
# Export Punctuality Reports CSV
# =====================================================
@router.get("/punctuality-reports/export")
async def export_punctuality_reports_api(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    reports = await get_punctuality_reports(start_date, end_date, department, search)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Employee Code", "Employee Name", "Email", "Department", "Designation",
        "Days Present", "On-Time Days", "Late Days", "Early Checkout Days",
        "Avg Check-In Time", "Total Hours", "Avg Daily Hours", "Punctuality Rate (%)", "Grade"
    ])
    for r in reports:
        writer.writerow([
            r["employee_code"], r["employee_name"], r["email"], r["department"], r["designation"],
            r["total_days_present"], r["on_time_days"], r["late_days"], r["early_checkout_days"],
            r["avg_check_in_time"], r["total_working_hours"], r["avg_daily_hours"], r["punctuality_score"], r["grade"]
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=punctuality_report.csv"
        }
    )


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