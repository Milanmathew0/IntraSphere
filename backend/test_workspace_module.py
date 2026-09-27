import asyncio
import os
import sys
from datetime import datetime, timedelta
from bson import ObjectId

# Setup asyncio loop and sys path for app imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import db
from app.services.workspace_service import (
    init_workspace_desks,
    get_all_desks_filtered,
    get_desk_details_by_id,
    check_desk_availability,
    create_reservation,
    get_my_reservations,
    cancel_reservation,
    create_desk,
    update_desk,
    deactivate_desk,
    get_workspace_summary_stats,
    get_workspace_analytics,
    desks_collection,
    reservations_collection,
    users_collection,
    employees_collection
)
from app.schemas.workspace_schema import (
    WorkspaceDeskCreate, WorkspaceDeskUpdate,
    WorkspaceReservationCreate
)
from fastapi import HTTPException

async def run_all_tests():
    print("=" * 60)
    print("STARTING WORKSPACE / DESK RESERVATION MODULE TEST SUITE")
    print("=" * 60)

    # 0. Initialize & seed default desks
    await init_workspace_desks()

    # Create dummy users & employees for testing
    user_emp1_email = "emp1_test@intrasphere.com"
    user_emp2_email = "emp2_test@intrasphere.com"
    admin_email = "admin_test@intrasphere.com"

    # Clean up test accounts and test reservations if any exist
    await users_collection.delete_many({"email": {"$in": [user_emp1_email, user_emp2_email, admin_email]}})
    await employees_collection.delete_many({"email": {"$in": [user_emp1_email, user_emp2_email, admin_email]}})
    await reservations_collection.delete_many({"purpose": {"$regex": "^TEST_"}})

    u1_res = await users_collection.insert_one({"email": user_emp1_email, "username": "Employee One", "role": "Employee"})
    e1_res = await employees_collection.insert_one({
        "user_id": u1_res.inserted_id, "employee_id": "EMP-TEST1", "first_name": "Employee", "last_name": "One",
        "email": user_emp1_email, "department": "Engineering", "employment_status": "Active", "is_active": True
    })

    u2_res = await users_collection.insert_one({"email": user_emp2_email, "username": "Employee Two", "role": "Employee"})
    e2_res = await employees_collection.insert_one({
        "user_id": u2_res.inserted_id, "employee_id": "EMP-TEST2", "first_name": "Employee", "last_name": "Two",
        "email": user_emp2_email, "department": "Design", "employment_status": "Active", "is_active": True
    })

    u_admin_res = await users_collection.insert_one({"email": admin_email, "username": "Admin User", "role": "Admin"})
    e_admin_res = await employees_collection.insert_one({
        "user_id": u_admin_res.inserted_id, "employee_id": "EMP-ADMIN", "first_name": "Admin", "last_name": "User",
        "email": admin_email, "department": "Management", "employment_status": "Active", "is_active": True
    })

    payload1 = {"sub": user_emp1_email, "role": "Employee"}
    payload2 = {"sub": user_emp2_email, "role": "Employee"}
    payload_admin = {"sub": admin_email, "role": "Admin"}

    # Fetch seed desks
    all_desks = await get_all_desks_filtered()
    assert len(all_desks) >= 1, "Failed to fetch seeded desks"
    test_desk_1 = all_desks[0]
    test_desk_2 = all_desks[1] if len(all_desks) > 1 else all_desks[0]

    print(f"Loaded {len(all_desks)} desks for testing.")

    # Dates setup for tests
    tomorrow = datetime.utcnow().date() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    # TEST 1: Employee views available desks (Real MongoDB data)
    print("\n[TEST 1] Employee views available desks...")
    desks_list = await get_all_desks_filtered()
    assert len(desks_list) > 0, "TEST 1 FAILED: No desks returned"
    print(f"  -> SUCCESS: Fetched {len(desks_list)} real desks from MongoDB.")

    # TEST 2: Employee reserves available desk (10:00 -> 12:00 tomorrow)
    print("\n[TEST 2] Employee reserves available desk...")
    t2_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 10, 0, 0)
    t2_end = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0, 0)

    res2 = await create_reservation(payload1, WorkspaceReservationCreate(
        desk_id=test_desk_1["id"],
        date=tomorrow_str,
        start_time=t2_start,
        end_time=t2_end,
        purpose="TEST_Office work"
    ))
    res2_id = res2["reservation_id"]
    assert res2["status"] == "Confirmed", "TEST 2 FAILED"
    print(f"  -> SUCCESS: Reservation created with ID {res2_id}")

    # TEST 3: Employee attempts overlapping desk reservation (11:00 -> 13:00 tomorrow on same desk)
    print("\n[TEST 3] Employee attempts overlapping desk reservation on same desk...")
    t3_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 11, 0, 0)
    t3_end = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 13, 0, 0)
    try:
        await create_reservation(payload2, WorkspaceReservationCreate(
            desk_id=test_desk_1["id"],
            date=tomorrow_str,
            start_time=t3_start,
            end_time=t3_end,
            purpose="TEST_Overlap"
        ))
        assert False, "TEST 3 FAILED: Overlap was allowed!"
    except HTTPException as ex:
        assert ex.status_code == 409, f"TEST 3 FAILED: Unexpected status code {ex.status_code}"
        print(f"  -> SUCCESS: Rejected with 409 Conflict: {ex.detail}")

    # TEST 4: Same Employee attempts overlapping reservation on another desk
    print("\n[TEST 4] Employee attempts overlapping reservation on another desk...")
    try:
        await create_reservation(payload1, WorkspaceReservationCreate(
            desk_id=test_desk_2["id"],
            date=tomorrow_str,
            start_time=t3_start,
            end_time=t3_end,
            purpose="TEST_EmpOverlap"
        ))
        assert False, "TEST 4 FAILED: Same employee double booking allowed!"
    except HTTPException as ex:
        assert ex.status_code == 400, f"TEST 4 FAILED: Unexpected status code {ex.status_code}"
        print(f"  -> SUCCESS: Rejected with 400 Bad Request: {ex.detail}")

    # TEST 5: Adjacent reservation (12:00 -> 14:00 tomorrow on same desk)
    print("\n[TEST 5] Adjacent reservation check...")
    t5_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0, 0)
    t5_end = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 14, 0, 0)
    res5 = await create_reservation(payload2, WorkspaceReservationCreate(
        desk_id=test_desk_1["id"],
        date=tomorrow_str,
        start_time=t5_start,
        end_time=t5_end,
        purpose="TEST_Adjacent"
    ))
    assert res5["status"] == "Confirmed", "TEST 5 FAILED"
    print("  -> SUCCESS: Adjacent booking 12:00->14:00 allowed alongside 10:00->12:00.")

    # TEST 6: Past date reservation
    print("\n[TEST 6] Past date reservation check...")
    past_date = datetime.utcnow() - timedelta(days=2)
    try:
        await create_reservation(payload1, WorkspaceReservationCreate(
            desk_id=test_desk_1["id"],
            date=past_date.strftime("%Y-%m-%d"),
            start_time=past_date,
            end_time=past_date + timedelta(hours=2),
            purpose="TEST_PastDate"
        ))
        assert False, "TEST 6 FAILED: Past date allowed!"
    except HTTPException as ex:
        assert ex.status_code == 400
        print(f"  -> SUCCESS: Past date rejected: {ex.detail}")

    # TEST 7: Past time today reservation
    print("\n[TEST 7] Past time today reservation check...")
    past_time_today = datetime.utcnow() - timedelta(hours=2)
    try:
        await create_reservation(payload1, WorkspaceReservationCreate(
            desk_id=test_desk_1["id"],
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            start_time=past_time_today,
            end_time=past_time_today + timedelta(hours=1),
            purpose="TEST_PastTimeToday"
        ))
        assert False, "TEST 7 FAILED: Past time today allowed!"
    except HTTPException as ex:
        assert ex.status_code == 400
        print(f"  -> SUCCESS: Past time today rejected: {ex.detail}")

    # TEST 8: Maintenance desk booking attempt
    print("\n[TEST 8] Maintenance desk booking check...")
    # Mark test_desk_2 maintenance
    await desks_collection.update_one({"_id": ObjectId(test_desk_2["id"])}, {"$set": {"status": "Maintenance"}})
    try:
        await create_reservation(payload1, WorkspaceReservationCreate(
            desk_id=test_desk_2["id"],
            date=tomorrow_str,
            start_time=t2_start,
            end_time=t2_end,
            purpose="TEST_Maint"
        ))
        assert False, "TEST 8 FAILED: Maintenance desk allowed!"
    except HTTPException as ex:
        assert ex.status_code == 400
        print(f"  -> SUCCESS: Maintenance desk booking rejected: {ex.detail}")
    finally:
        await desks_collection.update_one({"_id": ObjectId(test_desk_2["id"])}, {"$set": {"status": "Available"}})

    # TEST 9: Inactive desk booking attempt
    print("\n[TEST 9] Inactive desk booking check...")
    await desks_collection.update_one({"_id": ObjectId(test_desk_2["id"])}, {"$set": {"is_active": False}})
    try:
        await create_reservation(payload1, WorkspaceReservationCreate(
            desk_id=test_desk_2["id"],
            date=tomorrow_str,
            start_time=t2_start,
            end_time=t2_end,
            purpose="TEST_Inactive"
        ))
        assert False, "TEST 9 FAILED: Inactive desk allowed!"
    except HTTPException as ex:
        assert ex.status_code == 400
        print(f"  -> SUCCESS: Inactive desk booking rejected: {ex.detail}")
    finally:
        await desks_collection.update_one({"_id": ObjectId(test_desk_2["id"])}, {"$set": {"is_active": True}})

    # TEST 10: Employee cancels own upcoming reservation
    print("\n[TEST 10] Employee cancels own upcoming reservation...")
    cancel_res = await cancel_reservation(res2_id, payload1, cancellation_reason="Changed plans")
    assert cancel_res["status"] == "Cancelled", "TEST 10 FAILED"
    print("  -> SUCCESS: Status updated to Cancelled.")

    # TEST 11: Employee attempts to cancel another employee's reservation
    print("\n[TEST 11] Employee cancels another employee's reservation check...")
    # res5 belongs to payload2
    try:
        await cancel_reservation(res5["reservation_id"], payload1)
        assert False, "TEST 11 FAILED: Unauthorized cancellation allowed!"
    except HTTPException as ex:
        assert ex.status_code == 403
        print(f"  -> SUCCESS: Unauthorized cancellation rejected with 403: {ex.detail}")

    # TEST 12: Simultaneous double reservation on same desk
    print("\n[TEST 12] Double reservation conflict test...")
    t12_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 14, 0, 0)
    t12_end = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 16, 0, 0)
    res12_a = await create_reservation(payload1, WorkspaceReservationCreate(
        desk_id=test_desk_1["id"],
        date=tomorrow_str,
        start_time=t12_start,
        end_time=t12_end,
        purpose="TEST_AtomicFirst"
    ))
    try:
        await create_reservation(payload2, WorkspaceReservationCreate(
            desk_id=test_desk_1["id"],
            date=tomorrow_str,
            start_time=t12_start,
            end_time=t12_end,
            purpose="TEST_AtomicSecond"
        ))
        assert False, "TEST 12 FAILED: Second booking succeeded!"
    except HTTPException as ex:
        assert ex.status_code == 409
        print(f"  -> SUCCESS: First succeeded ({res12_a['reservation_id']}), second rejected with 409 Conflict.")

    # TEST 13: Admin creates desk
    print("\n[TEST 13] Admin creates desk...")
    new_desk_code = f"D-TEST-{int(datetime.utcnow().timestamp())}"
    new_desk_res = await create_desk(WorkspaceDeskCreate(
        desk_code=new_desk_code,
        desk_name="Test Automation Desk",
        floor=5,
        zone="Testing Zone",
        location="Lab 501",
        building="Main Office",
        description="Created via test runner",
        capacity=1,
        workspace_type="Standing Desk",
        is_accessible=True,
        facilities=["Monitor", "USB-C"],
        status="Available"
    ), payload_admin)
    print(f"  -> SUCCESS: Admin created desk ID {new_desk_res['id']} ({new_desk_code})")

    # TEST 14: Duplicate desk_code rejection
    print("\n[TEST 14] Duplicate desk_code check...")
    try:
        await create_desk(WorkspaceDeskCreate(
            desk_code=new_desk_code,
            desk_name="Duplicate Desk",
            floor=1,
            zone="General",
            location="Lobby",
            building="Main Office",
            facilities=[]
        ), payload_admin)
        assert False, "TEST 14 FAILED: Duplicate desk code allowed!"
    except HTTPException as ex:
        assert ex.status_code == 409
        print(f"  -> SUCCESS: Duplicate desk code rejected with 409: {ex.detail}")

    # TEST 15: Facility Manager / Admin sets desk Maintenance
    print("\n[TEST 15] Admin marks desk Maintenance...")
    await update_desk(new_desk_res['id'], WorkspaceDeskUpdate(status="Maintenance"), payload_admin)
    d_updated = await get_desk_details_by_id(new_desk_res['id'])
    assert d_updated["status"] == "Maintenance", "TEST 15 FAILED"
    print("  -> SUCCESS: Desk status updated to Maintenance.")

    # TEST 16: Admin views utilization statistics
    print("\n[TEST 16] Admin views utilization stats...")
    analytics = await get_workspace_analytics(payload_admin)
    assert "average_utilization_pct" in analytics, "TEST 16 FAILED"
    assert "desk_utilization_list" in analytics, "TEST 16 FAILED"
    print(f"  -> SUCCESS: Average utilization: {analytics['average_utilization_pct']}%, Total active desks: {analytics['total_desks']}.")

    # TEST 17: Cancelled reservation slot is free for subsequent booking
    print("\n[TEST 17] Cancelled slot reuse check...")
    # res2_id was for 10:00 -> 12:00 tomorrow on test_desk_1, and was cancelled in TEST 10.
    res17 = await create_reservation(payload2, WorkspaceReservationCreate(
        desk_id=test_desk_1["id"],
        date=tomorrow_str,
        start_time=t2_start,
        end_time=t2_end,
        purpose="TEST_ReuseSlot"
    ))
    assert res17["status"] == "Confirmed", "TEST 17 FAILED"
    print(f"  -> SUCCESS: Slot previously cancelled in TEST 10 was successfully booked by Employee Two!")

    # Clean up test artifacts in DB
    await users_collection.delete_many({"email": {"$in": [user_emp1_email, user_emp2_email, admin_email]}})
    await employees_collection.delete_many({"email": {"$in": [user_emp1_email, user_emp2_email, admin_email]}})
    await reservations_collection.delete_many({"purpose": {"$regex": "^TEST_"}})
    await desks_collection.delete_one({"desk_code": new_desk_code})

    print("\n" + "=" * 60)
    print("ALL 17 BACKEND LOGIC VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
