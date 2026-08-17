import urllib.request
import json
import sys
import random
from datetime import datetime, timedelta

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

def http_patch(endpoint, data, token=None):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode(),
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {})
        },
        method="PATCH"
    )
    try:
        res = urllib.request.urlopen(req)
        return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        return e.code, body

def run_tests():
    print("==================================================")
    print("RUNNING MEETING ROOM TIMELINE VALIDATION SUITE")
    print("==================================================")

    # 1. Login
    status, res = http_post("/auth/login", {"email": "admin@intrasphere.com", "password": "Admin123!"})
    if status != 200:
        print("LOGIN FAILED:", res)
        sys.exit(1)
    token = res["access_token"]
    print("1. Login Successful as Admin")

    # 2. Fetch Rooms
    status, rooms = http_get("/meeting-rooms/", token)
    print(f"2. Fetched {len(rooms)} Meeting Rooms from DB")
    room = rooms[0]
    room_id = room["id"]

    # Use a unique random future date for each test run to ensure idempotency
    random_days = random.randint(10, 300)
    future_date = (datetime.now() + timedelta(days=random_days)).strftime("%Y-%m-%d")

    # 3. Test Past Time Slot Booking
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Past Meeting Test",
        "start_time": "2025-01-01T10:00:00Z",
        "end_time": "2025-01-01T11:00:00Z",
        "attendees": []
    }, token)
    assert status == 400 and "past time slot" in res["detail"]
    print("[PASS] Test 3: Past Time Slot Booking Rejected:", res["detail"])

    # 4. Test Start Time >= End Time
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Zero Duration Test",
        "start_time": f"{future_date}T15:00:00Z",
        "end_time": f"{future_date}T15:00:00Z",
        "attendees": []
    }, token)
    assert status == 400 and "later than start time" in res["detail"]
    print("[PASS] Test 4: Start Time >= End Time Rejected:", res["detail"])

    # 5. Test Minimum Duration (< 15 mins)
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Short Meeting Test",
        "start_time": f"{future_date}T15:00:00Z",
        "end_time": f"{future_date}T15:10:00Z",
        "attendees": []
    }, token)
    assert status == 400 and "at least 15 minutes" in res["detail"]
    print("[PASS] Test 5: Minimum Duration (<15m) Rejected:", res["detail"])

    # 6. Test Maximum Duration (> 4 hours)
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Marathon Meeting Test",
        "start_time": f"{future_date}T10:00:00Z",
        "end_time": f"{future_date}T15:00:00Z",
        "attendees": []
    }, token)
    assert status == 400 and "cannot exceed 4 hours" in res["detail"]
    print("[PASS] Test 6: Maximum Duration (>4h) Rejected:", res["detail"])

    # 7. Test Valid Booking Creation (15:00 - 16:00 on future_date)
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Sprint Planning Meeting",
        "start_time": f"{future_date}T15:00:00Z",
        "end_time": f"{future_date}T16:00:00Z",
        "attendees": []
    }, token)
    assert status == 200 and "booking_id" in res
    b1_id = res["booking_id"]
    print(f"[PASS] Test 7: Valid Booking Created! Booking ID: {b1_id}")

    # 8. Test 409 Double-Booking Conflict (15:30 - 16:30 on future_date)
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Conflicting Meeting Request",
        "start_time": f"{future_date}T15:30:00Z",
        "end_time": f"{future_date}T16:30:00Z",
        "attendees": []
    }, token)
    assert status == 409 and "already booked" in res["detail"]
    print("[PASS] Test 8: 409 Double-Booking Conflict Rejected:", res["detail"])

    # 9. Test Adjacent Booking (16:00 - 17:00 on future_date - Allowed!)
    status, res = http_post("/meeting-bookings/", {
        "room_id": room_id,
        "title": "Adjacent Architecture Review",
        "start_time": f"{future_date}T16:00:00Z",
        "end_time": f"{future_date}T17:00:00Z",
        "attendees": []
    }, token)
    assert status == 200 and "booking_id" in res
    b2_id = res["booking_id"]
    print(f"[PASS] Test 9: Adjacent Booking Success! Booking ID: {b2_id}")

    # 10. Test Cancellation
    status, res = http_patch(f"/meeting-bookings/{b1_id}/cancel", {"cancellation_reason": "Test cancellation"}, token)
    assert status == 200 and "cancelled" in res["message"].lower()
    print("[PASS] Test 10: Booking Cancellation Successful:", res["message"])

    print("==================================================")
    print("ALL 10 AUTOMATED MEETING ROOM TIMELINE TESTS PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
