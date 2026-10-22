import asyncio
import os
import sys

# Setup asyncio loop and sys path for app imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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

async def run_report_tests():
    print("=" * 65)
    print("STARTING HR ADMINISTRATOR & FACILITY MANAGER REPORT TEST SUITE")
    print("=" * 65)

    # -------------------------------------------------------------
    # 1. HR Administrator Attendance Reports
    # -------------------------------------------------------------
    print("\n[TEST 1] Testing HR Administrator Attendance Data Retrieval...")
    att_data = await get_attendance_report_data()
    assert "metadata" in att_data, "Metadata missing from attendance report"
    assert "summary" in att_data, "Summary missing from attendance report"
    assert "employees" in att_data, "Employees list missing from attendance report"
    print(f"  [PASS] Retrieved attendance data for {len(att_data['employees'])} employees.")
    print(f"  [PASS] Summary: {att_data['summary']['total_present_instances']} present logs, "
          f"{att_data['summary']['overall_attendance_rate']}% attendance rate, "
          f"{att_data['summary']['overall_punctuality_rate']}% punctuality rate.")

    print("\n[TEST 2] Testing HR Administrator Attendance Excel Export (.xlsx)...")
    att_excel = generate_attendance_excel(att_data)
    att_excel_bytes = att_excel.getvalue()
    assert len(att_excel_bytes) > 1000, "Excel output is suspiciously small"
    # Verify PK zip magic header (standard for xlsx)
    assert att_excel_bytes[:2] == b"PK", "Excel output lacks valid XLSX magic bytes"
    print(f"  [PASS] Attendance Excel generated successfully! ({len(att_excel_bytes)} bytes)")

    print("\n[TEST 3] Testing HR Administrator Attendance PDF Export (.pdf)...")
    att_pdf = generate_attendance_pdf(att_data)
    att_pdf_bytes = att_pdf.getvalue()
    assert len(att_pdf_bytes) > 500, "PDF output is suspiciously small"
    # Verify %PDF magic header
    assert att_pdf_bytes[:4] == b"%PDF", "PDF output lacks valid PDF magic bytes"
    print(f"  [PASS] Attendance PDF generated successfully! ({len(att_pdf_bytes)} bytes)")

    # -------------------------------------------------------------
    # 2. HR Administrator Leave Reports
    # -------------------------------------------------------------
    print("\n[TEST 4] Testing HR Administrator Leave Data Retrieval...")
    leave_data = await get_leave_report_data()
    assert "metadata" in leave_data, "Metadata missing from leave report"
    assert "summary" in leave_data, "Summary missing from leave report"
    assert "requests" in leave_data, "Requests list missing from leave report"
    print(f"  [PASS] Retrieved leave data with {len(leave_data['requests'])} leave requests.")
    print(f"  [PASS] Summary: {leave_data['summary']['approved']} approved, "
          f"{leave_data['summary']['pending']} pending, "
          f"{leave_data['summary']['total_days_approved']} total days approved.")

    print("\n[TEST 5] Testing HR Administrator Leave Excel Export (.xlsx)...")
    leave_excel = generate_leave_excel(leave_data)
    leave_excel_bytes = leave_excel.getvalue()
    assert len(leave_excel_bytes) > 1000, "Leave Excel output is suspiciously small"
    assert leave_excel_bytes[:2] == b"PK", "Leave Excel output lacks valid XLSX magic bytes"
    print(f"  [PASS] Leave Excel generated successfully! ({len(leave_excel_bytes)} bytes)")

    print("\n[TEST 6] Testing HR Administrator Leave PDF Export (.pdf)...")
    leave_pdf = generate_leave_pdf(leave_data)
    leave_pdf_bytes = leave_pdf.getvalue()
    assert len(leave_pdf_bytes) > 500, "Leave PDF output is suspiciously small"
    assert leave_pdf_bytes[:4] == b"%PDF", "Leave PDF output lacks valid PDF magic bytes"
    print(f"  [PASS] Leave PDF generated successfully! ({len(leave_pdf_bytes)} bytes)")

    # -------------------------------------------------------------
    # 3. Facility Manager Resource Utilization Reports
    # -------------------------------------------------------------
    print("\n[TEST 7] Testing Facility Manager Resource Utilization Data Retrieval...")
    util_data = await get_resource_utilization_report_data()
    assert "metadata" in util_data, "Metadata missing from utilization report"
    assert "summary" in util_data, "Summary missing from utilization report"
    assert "meeting_rooms" in util_data["summary"], "Meeting rooms summary missing"
    assert "workspaces" in util_data["summary"], "Workspaces summary missing"
    assert "rooms" in util_data, "Rooms breakdown list missing"
    assert "desks" in util_data, "Desks breakdown list missing"

    rm_s = util_data["summary"]["meeting_rooms"]
    ws_s = util_data["summary"]["workspaces"]
    print(f"  [PASS] Meeting Rooms: {rm_s['total_rooms']} rooms, {rm_s['average_occupancy_rate']}% occupancy rate, peak: {rm_s['peak_booking_time']}.")
    print(f"  [PASS] Workspaces: {ws_s['total_desks']} desks, {ws_s['average_utilization_rate']}% utilization rate, peak: {ws_s['peak_reservation_time']}.")
    print(f"  [PASS] Overall Space Efficiency Index: {util_data['summary']['overall_space_efficiency_score']}%.")

    print("\n[TEST 8] Testing Facility Manager Resource Utilization Excel Export (.xlsx)...")
    util_excel = generate_resource_utilization_excel(util_data)
    util_excel_bytes = util_excel.getvalue()
    assert len(util_excel_bytes) > 1000, "Utilization Excel output is suspiciously small"
    assert util_excel_bytes[:2] == b"PK", "Utilization Excel lacks valid XLSX magic bytes"
    print(f"  [PASS] Resource Utilization Excel generated successfully! ({len(util_excel_bytes)} bytes)")

    print("\n[TEST 9] Testing Facility Manager Resource Utilization PDF Export (.pdf)...")
    util_pdf = generate_resource_utilization_pdf(util_data)
    util_pdf_bytes = util_pdf.getvalue()
    assert len(util_pdf_bytes) > 500, "Utilization PDF output is suspiciously small"
    assert util_pdf_bytes[:4] == b"%PDF", "Utilization PDF lacks valid PDF magic bytes"
    print(f"  [PASS] Resource Utilization PDF generated successfully! ({len(util_pdf_bytes)} bytes)")

    print("\n" + "=" * 65)
    print("ALL 9 TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(run_report_tests())
