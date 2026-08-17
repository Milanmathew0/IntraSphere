import asyncio
import hashlib
import secrets
from datetime import datetime, timedelta
from app.database.connection import db
from app.services.employee_service import create_employee
from app.schemas.employee_schema import EmployeeCreate
from app.utils.security import hash_password, verify_password
from app.api.v1.auth import activate_account, resend_activation
from app.schemas.user_schema import AccountActivate, ResendActivationRequest
from fastapi import HTTPException


async def run_tests():
    print("=== STARTING EMAIL ACTIVATION WORKFLOW TESTS ===")
    
    users_coll = db["users"]
    employees_coll = db["employees"]
    depts_coll = db["departments"]
    desigs_coll = db["designations"]

    # 1. Setup Test Department & Designation
    dept = await depts_coll.find_one()
    desig = await desigs_coll.find_one()
    
    dept_id = str(dept["_id"]) if dept else None
    desig_id = str(desig["_id"]) if desig else None
    
    if not dept_id or not desig_id:
        print("Creating mock department and designation for test...")
        d_res = await depts_coll.insert_one({"department_name": "Engineering", "created_at": datetime.utcnow()})
        ds_res = await desigs_coll.insert_one({"designation_name": "Software Engineer", "created_at": datetime.utcnow()})
        dept_id = str(d_res.inserted_id)
        desig_id = str(ds_res.inserted_id)

    test_email = f"test_emp_{secrets.token_hex(4)}@example.com"
    
    # Cleanup any pre-existing test data
    await users_coll.delete_many({"email": test_email})
    await employees_coll.delete_many({"email": test_email})

    # TEST 1: Create Employee (HR/Manager action)
    print("\n--- TEST 1: HR/Manager Creates Employee ---")
    emp_payload = EmployeeCreate(
        first_name="Test",
        last_name="Employee",
        email=test_email,
        phone="555-0199",
        department_id=dept_id,
        designation_id=desig_id,
        joining_date=datetime.utcnow().date()
    )

    res = await create_employee(emp_payload)
    assert isinstance(res, dict), f"Expected dict response, got {res}"
    assert "employee_id" in res, "Missing employee_id in response"
    assert "activation_token" not in res, "Raw activation token must NOT be returned in manager response"
    print(f"[OK] Employee created with ID: {res['employee_id']}, Email sent status: {res.get('email_sent')}")

    # TEST 2: Inspect Database Record State
    print("\n--- TEST 2: Inspect User Document in DB ---")
    created_user = await users_coll.find_one({"email": test_email})
    assert created_user is not None, "User not found in DB"
    assert created_user["account_status"] == "Invited", f"Expected Invited status, got {created_user['account_status']}"
    assert created_user["is_active"] is False, "Expected is_active=False"
    assert created_user["password"] is None or created_user["password"] == "", "Password must be unset/empty"
    assert "activation_token_hash" in created_user and created_user["activation_token_hash"], "Missing activation_token_hash"
    assert "activation_token_expires_at" in created_user, "Missing expiration date"
    print("[OK] User document successfully initialized with 'Invited' state, SHA-256 token hash & 24h expiration")

    # TEST 3: Activate Account with Valid Token & Password
    print("\n--- TEST 3: Activate Account with Valid Token ---")
    # For testing, we generate a mock token and hash it in DB to simulate receiving the URL token
    raw_test_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_test_token.encode("utf-8")).hexdigest()
    await users_coll.update_one(
        {"email": test_email},
        {"$set": {"activation_token_hash": token_hash}}
    )

    activate_payload = AccountActivate(
        token=raw_test_token,
        password="MySecurePassword123!"
    )
    act_res = await activate_account(activate_payload)
    assert act_res["message"] == "Account activated successfully"

    updated_user = await users_coll.find_one({"email": test_email})
    assert updated_user["account_status"] == "Active", "Expected account_status='Active'"
    assert updated_user["is_active"] is True, "Expected is_active=True"
    assert verify_password("MySecurePassword123!", updated_user["password"]), "Password Argon2 verification failed"
    assert "activation_token_hash" not in updated_user or updated_user.get("activation_token_hash") is None, "Token hash was not cleared"
    print("[OK] Account successfully activated, Argon2 password set, token hash cleared")

    # TEST 4: Reusing Same Activation Token Must Be Rejected
    print("\n--- TEST 4: Reusing Reused Token Must Fail ---")
    try:
        await activate_account(activate_payload)
        assert False, "Should have thrown HTTPException 400"
    except HTTPException as e:
        assert e.status_code == 400
        print(f"[OK] Reused token rejected with error: {e.detail}")

    # TEST 5: Test Resend Activation Email
    print("\n--- TEST 5: Resend Activation Email ---")
    resend_email = f"resend_emp_{secrets.token_hex(4)}@example.com"
    await users_coll.delete_many({"email": resend_email})
    
    # Create invited user directly
    mock_token = secrets.token_urlsafe(32)
    old_hash = hashlib.sha256(mock_token.encode("utf-8")).hexdigest()
    await users_coll.insert_one({
        "username": "Resend Test",
        "email": resend_email,
        "account_status": "Invited",
        "is_active": False,
        "activation_token_hash": old_hash,
        "activation_token_expires_at": datetime.utcnow() + timedelta(hours=24)
    })

    resend_req = ResendActivationRequest(email=resend_email)
    resend_res = await resend_activation(resend_req)
    assert "message" in resend_res

    resent_user = await users_coll.find_one({"email": resend_email})
    new_hash = resent_user.get("activation_token_hash")
    assert new_hash != old_hash, "Resend did not generate a new token hash"
    print("[OK] Resend activation created new token hash and invalidated old token")

    # TEST 6: Rate Limiting on Resend
    print("\n--- TEST 6: Rate Limit Cooldown Check ---")
    try:
        await resend_activation(resend_req)
        assert False, "Should have thrown HTTPException 429"
    except HTTPException as e:
        assert e.status_code == 429
        print(f"[OK] Rate limit enforced correctly: {e.detail}")

    # TEST 7: Login Before Activation Must Be Rejected
    print("\n--- TEST 7: Login Before Activation Must Fail ---")
    unactivated_email = f"unact_{secrets.token_hex(4)}@example.com"
    await users_coll.delete_many({"email": unactivated_email})
    await users_coll.insert_one({
        "username": "Unactivated User",
        "email": unactivated_email,
        "password": hash_password("Password123!"),
        "role": "Employee",
        "account_status": "Invited",
        "is_active": False
    })
    
    from app.api.v1.auth import login
    from app.schemas.user_schema import UserLogin
    try:
        await login(UserLogin(email=unactivated_email, password="Password123!"))
        assert False, "Login before activation should fail"
    except HTTPException as e:
        assert e.status_code == 403
        assert "activate your account" in e.detail
        print(f"[OK] Login before activation rejected with HTTP 403: {e.detail}")

    await users_coll.delete_many({"email": unactivated_email})

    # Cleanup test records
    await users_coll.delete_many({"email": test_email})
    await employees_coll.delete_many({"email": test_email})
    await users_coll.delete_many({"email": resend_email})
    print("\n=== ALL EMAIL ACTIVATION & AUTH TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    asyncio.run(run_tests())
