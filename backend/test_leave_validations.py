import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def http_post(endpoint, data, token=None):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode(),
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {})
        }
    )
    try:
        res = urllib.request.urlopen(req)
        return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        return e.code, body

def http_get(endpoint, token=None):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        headers={"Authorization": f"Bearer {token}"} if token else {}
    )
    res = urllib.request.urlopen(req)
    return res.status, json.loads(res.read())

def run_tests():
    print("==================================================")
    print("RUNNING ENTERPRISE LEAVE VALIDATION SUITE")
    print("==================================================")

    # 1. Login
    status, res = http_post("/auth/login", {"email": "admin@intrasphere.com", "password": "Admin123!"})
    if status != 200:
        print("LOGIN FAILED:", res)
        sys.exit(1)
    token = res["access_token"]
    print("1. Login Successful as Admin/Employee")

    # 2. Fetch Leave Types
    status, leave_types = http_get("/leave-requests/types/", token)
    print(f"2. Fetched {len(leave_types)} Leave Types from DB")
    
    casual_type = next((t for t in leave_types if t["name"] == "Casual Leave"), leave_types[0])
    sick_type = next((t for t in leave_types if t["name"] == "Sick Leave"), leave_types[0])
    earned_type = next((t for t in leave_types if t["name"] == "Earned Leave"), None)
    
    if not earned_type:
        # Create Earned Leave via API
        _, create_res = http_post("/leave-requests/types/", {
            "name": "Earned Leave",
            "description": "Privilege annual leave accrued over service duration",
            "annual_allocation": 15.0,
            "carry_forward_allowed": True,
            "maximum_consecutive_days": 14,
            "minimum_notice_days": 3,
            "maximum_advance_days": 90,
            "requires_attachment": False,
            "requires_approval": True,
            "allow_negative_balance": False,
            "is_active": True
        }, token)
        status, leave_types = http_get("/leave-requests/types/", token)
        earned_type = next((t for t in leave_types if t["name"] == "Earned Leave"), leave_types[0])

    # 3. Test Start Date > End Date
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-25",
        "end_date": "2026-08-20",
        "reason": "Family emergency function requiring presence."
    }, token)
    assert status == 400 and "End date" in res["detail"]
    print("✓ Test 3 Passed: Start Date > End Date Rejected:", res["detail"])

    # 4. Test Date completely in past
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2025-01-01",
        "end_date": "2025-01-05",
        "reason": "Personal work at home town requiring stay."
    }, token)
    assert status == 400 and "already passed" in res["detail"]
    print("✓ Test 4 Passed: Past Date Rejected:", res["detail"])

    # 5. Test Weekend Only Date Range (e.g. 2026-08-22 Saturday to 2026-08-23 Sunday)
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-22",
        "end_date": "2026-08-23",
        "reason": "Personal weekend work at home town."
    }, token)
    assert status == 400 and "no working days" in res["detail"]
    print("✓ Test 5 Passed: Weekend Only Date Range Rejected:", res["detail"])

    # 6. Test Multi-day Half Day
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-20",
        "end_date": "2026-08-21",
        "is_half_day": True,
        "half_day_session": "First Half",
        "reason": "Personal work at home town requiring stay."
    }, token)
    assert status == 400 and "single working day" in res["detail"]
    print("✓ Test 6 Passed: Multi-day Half Day Rejected:", res["detail"])

    # 7. Test Short Reason (< 10 chars)
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-25",
        "end_date": "2026-08-25",
        "reason": "Family"
    }, token)
    assert status == 400 and "at least 10 characters" in res["detail"]
    print("✓ Test 7 Passed: Short Reason Rejected:", res["detail"])

    # 8. Test Sick Leave Missing Medical Attachment
    status, res = http_post("/leave-requests/", {
        "leave_type_id": sick_type["id"],
        "start_date": "2026-08-25",
        "end_date": "2026-08-26",
        "reason": "Fever and severe doctor mandated rest."
    }, token)
    assert status == 400 and "document is required" in res["detail"]
    print("✓ Test 8 Passed: Sick Leave Missing Attachment Rejected:", res["detail"])

    # 9. Test Notice Period Violation (Earned Leave requires 3 days notice)
    status, res = http_post("/leave-requests/", {
        "leave_type_id": earned_type["id"],
        "start_date": "2026-08-18", # Only 1 day in advance vs 3 required
        "end_date": "2026-08-19",
        "reason": "Personal privilege leave for travel."
    }, token)
    assert status == 400 and "in advance" in res["detail"]
    print("✓ Test 9 Passed: Notice Period Violation Rejected:", res["detail"])

    # 10. Test Maximum Consecutive Days Violation
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-09-01",
        "end_date": "2026-09-15", # 11 working days vs 5 max
        "reason": "Long personal vacation at home town."
    }, token)
    assert status == 400 and "consecutive working days" in res["detail"]
    print("✓ Test 10 Passed: Consecutive Days Violation Rejected:", res["detail"])

    # 11. Test Valid Casual Leave Submission
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-27",
        "end_date": "2026-08-28",
        "reason": "Personal urgent family function attendance."
    }, token)
    assert status == 200 and res["status"] == "Pending"
    print(f"✓ Test 11 Passed: Valid Casual Leave Submitted! Request ID: {res['request_id']}, Working Days: {res['total_days']}")

    # 12. Test Overlapping Leave Request
    status, res = http_post("/leave-requests/", {
        "leave_type_id": casual_type["id"],
        "start_date": "2026-08-27",
        "end_date": "2026-08-29",
        "reason": "Overlapping request attempt."
    }, token)
    assert status in (400, 409) and "overlaps" in res["detail"]
    print("✓ Test 12 Passed: Overlapping Leave Request Rejected:", res["detail"])

    print("==================================================")
    print("ALL 12 AUTOMATED BACKEND LEAVE VALIDATION TESTS PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
