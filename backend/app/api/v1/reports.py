from fastapi import APIRouter, Depends, Query, Response, HTTPException
from typing import Optional, Any

from app.utils.dependencies import get_current_user
from app.services.report_service import (
    get_attendance_report_data,
    generate_attendance_excel,
    generate_attendance_pdf,
    get_leave_report_data,
    generate_leave_excel,
    generate_leave_pdf,
    get_resource_utilization_report_data,
    generate_resource_utilization_excel,
    generate_resource_utilization_pdf
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports & Analytics"]
)


def _clean_str(val: Any) -> Optional[str]:
    return val if isinstance(val, str) and val.strip() != "" else None

def _clean_int(val: Any) -> Optional[int]:
    return val if isinstance(val, int) else None


# =========================================================================
# 1. ATTENDANCE REPORTS (HR Administrator & Employee Modules)
# =========================================================================

@router.get("/attendance/data")
async def get_attendance_report_json(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Department filter"),
    search: Optional[str] = Query(None, description="Search employee name or code"),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve structured attendance and punctuality report data for dashboards and personal logs."""
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    dept = _clean_str(department)
    srch = _clean_str(search)

    user_role = current_user.get("role", "")
    if user_role in ["Employee", "User"]:
        # Scope attendance search to current employee
        srch = current_user.get("sub") or srch

    return await get_attendance_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        department=dept,
        search=srch
    )


@router.get("/attendance/export")
async def export_attendance_report(
    format: str = Query("excel", description="Export format: 'excel' (or 'xlsx') or 'pdf'"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Department filter"),
    search: Optional[str] = Query(None, description="Search employee name or code"),
    current_user: dict = Depends(get_current_user)
):
    """Export attendance reports in Excel (.xlsx) or PDF (.pdf) format."""
    fmt = format.lower().strip() if isinstance(format, str) else "excel"
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    dept = _clean_str(department)
    srch = _clean_str(search)

    user_role = current_user.get("role", "")
    if user_role in ["Employee", "User"]:
        # Scope export to current employee's records
        srch = current_user.get("sub") or srch

    data = await get_attendance_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        department=dept,
        search=srch
    )

    out_s_date = data["metadata"]["start_date"]
    out_e_date = data["metadata"]["end_date"]

    if fmt in ("excel", "xlsx"):
        buffer = generate_attendance_excel(data)
        filename = f"IntraSphere_Attendance_Report_{out_s_date}_to_{out_e_date}.xlsx"
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    elif fmt == "pdf":
        buffer = generate_attendance_pdf(data)
        filename = f"IntraSphere_Attendance_Report_{out_s_date}_to_{out_e_date}.pdf"
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported formats: 'excel' or 'pdf'")


# =========================================================================
# 2. LEAVE REPORTS (HR Administrator & Employee Modules)
# =========================================================================

@router.get("/leave/data")
async def get_leave_report_json(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Department filter"),
    status: Optional[str] = Query(None, description="Status filter: Approved, Pending, Rejected, etc."),
    leave_type: Optional[str] = Query(None, description="Leave type ID"),
    search: Optional[str] = Query(None, description="Search employee name or code"),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve structured leave records and quota balance report data."""
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    dept = _clean_str(department)
    stat = _clean_str(status)
    l_type = _clean_str(leave_type)
    srch = _clean_str(search)

    user_role = current_user.get("role", "")
    if user_role in ["Employee", "User"]:
        srch = current_user.get("sub") or srch

    return await get_leave_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        department=dept,
        status_filter=stat,
        leave_type_id=l_type,
        search=srch
    )


@router.get("/leave/export")
async def export_leave_report(
    format: str = Query("excel", description="Export format: 'excel' (or 'xlsx') or 'pdf'"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Department filter"),
    status: Optional[str] = Query(None, description="Status filter: Approved, Pending, Rejected, etc."),
    leave_type: Optional[str] = Query(None, description="Leave type ID"),
    search: Optional[str] = Query(None, description="Search employee name or code"),
    current_user: dict = Depends(get_current_user)
):
    """Export leave reports in Excel (.xlsx) or PDF (.pdf) format."""
    fmt = format.lower().strip() if isinstance(format, str) else "excel"
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    dept = _clean_str(department)
    stat = _clean_str(status)
    l_type = _clean_str(leave_type)
    srch = _clean_str(search)

    user_role = current_user.get("role", "")
    if user_role in ["Employee", "User"]:
        srch = current_user.get("sub") or srch

    data = await get_leave_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        department=dept,
        status_filter=stat,
        leave_type_id=l_type,
        search=srch
    )

    out_s_date = data["metadata"]["start_date"]
    out_e_date = data["metadata"]["end_date"]

    if fmt in ("excel", "xlsx"):
        buffer = generate_leave_excel(data)
        filename = f"IntraSphere_Leave_Report_{out_s_date}_to_{out_e_date}.xlsx"
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    elif fmt == "pdf":
        buffer = generate_leave_pdf(data)
        filename = f"IntraSphere_Leave_Report_{out_s_date}_to_{out_e_date}.pdf"
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported formats: 'excel' or 'pdf'")


# =========================================================================
# 3. RESOURCE UTILIZATION REPORTS (Facility Manager Module)
# =========================================================================

@router.get("/resource-utilization/data")
async def get_resource_utilization_report_json(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    floor: Optional[int] = Query(None, description="Floor number filter"),
    zone: Optional[str] = Query(None, description="Workspace zone filter"),
    resource_type: Optional[str] = Query(None, description="Filter: 'rooms', 'workspaces', 'all'"),
    current_user: dict = Depends(get_current_user)
):
    """Generate reports showing room occupancy rates and workspace utilization."""
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    fl = _clean_int(floor)
    zn = _clean_str(zone)
    rtype = _clean_str(resource_type)

    return await get_resource_utilization_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        floor=fl,
        zone=zn,
        resource_type=rtype
    )


@router.get("/resource-utilization/export")
async def export_resource_utilization_report(
    format: str = Query("excel", description="Export format: 'excel' (or 'xlsx') or 'pdf'"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    floor: Optional[int] = Query(None, description="Floor number filter"),
    zone: Optional[str] = Query(None, description="Workspace zone filter"),
    resource_type: Optional[str] = Query(None, description="Filter: 'rooms', 'workspaces', 'all'"),
    current_user: dict = Depends(get_current_user)
):
    """Export Resource Utilization reports (Room Occupancy & Workspace Utilization) in Excel or PDF format."""
    fmt = format.lower().strip() if isinstance(format, str) else "excel"
    s_date = _clean_str(start_date)
    e_date = _clean_str(end_date)
    fl = _clean_int(floor)
    zn = _clean_str(zone)
    rtype = _clean_str(resource_type)

    data = await get_resource_utilization_report_data(
        start_date_str=s_date,
        end_date_str=e_date,
        floor=fl,
        zone=zn,
        resource_type=rtype
    )

    out_s_date = data["metadata"]["start_date"]
    out_e_date = data["metadata"]["end_date"]

    if fmt in ("excel", "xlsx"):
        buffer = generate_resource_utilization_excel(data)
        filename = f"IntraSphere_Resource_Utilization_Report_{out_s_date}_to_{out_e_date}.xlsx"
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    elif fmt == "pdf":
        buffer = generate_resource_utilization_pdf(data)
        filename = f"IntraSphere_Resource_Utilization_Report_{out_s_date}_to_{out_e_date}.pdf"
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported formats: 'excel' or 'pdf'")
