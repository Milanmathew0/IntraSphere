from datetime import datetime, timedelta

from bson import ObjectId

from app.database.connection import db

attendance_collection = db["attendance"]
employees_collection = db["employees"]


users_collection = db["users"]


async def get_or_create_employee_record(identifier: str):
    if not identifier:
        # Fallback to first available employee
        emp = await employees_collection.find_one({"is_active": True})
        if emp:
            return emp
        return None

    clean_id = str(identifier).strip()

    # 1. Search employees collection by employee_id, email, or _id
    emp = await employees_collection.find_one({
        "$or": [
            {"employee_id": clean_id},
            {"email": clean_id},
            {"email": clean_id.lower()},
            {"employee_id": clean_id.upper()},
        ]
    })

    if not emp and ObjectId.is_valid(clean_id):
        emp = await employees_collection.find_one({"_id": ObjectId(clean_id)})

    if not emp and ObjectId.is_valid(clean_id):
        emp = await employees_collection.find_one({"user_id": ObjectId(clean_id)})

    if emp:
        return emp

    # 2. Search users collection by email, username, or _id
    usr = await users_collection.find_one({
        "$or": [
            {"email": clean_id},
            {"email": clean_id.lower()},
            {"username": clean_id},
        ]
    })

    if not usr and ObjectId.is_valid(clean_id):
        usr = await users_collection.find_one({"_id": ObjectId(clean_id)})

    if usr:
        user_id_str = str(usr["_id"])
        user_email = usr.get("email", "")
        emp_code = f"EMP-{user_id_str[-6:].upper()}"

        emp = await employees_collection.find_one({
            "$or": [
                {"employee_id": emp_code},
                {"email": user_email},
                {"user_id": usr["_id"]},
            ]
        })
        if emp:
            return emp

        name_parts = usr.get("username", user_email.split("@")[0] if user_email else "Employee").strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        employee_doc = {
            "employee_id": emp_code,
            "first_name": first_name,
            "last_name": last_name,
            "email": user_email,
            "user_id": usr["_id"],
            "employment_status": "Active",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        res = await employees_collection.insert_one(employee_doc)
        employee_doc["_id"] = res.inserted_id
        return employee_doc

    # 3. Last fallback: return any existing active employee
    emp = await employees_collection.find_one({"is_active": True})
    if emp:
        return emp

    return None


# =====================================================
# Employee Check In
# =====================================================

async def check_in(employee_code: str):

    employee = await get_or_create_employee_record(employee_code)

    if employee is None:
        return "EMPLOYEE_NOT_FOUND"

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    existing = await attendance_collection.find_one(
        {
            "employee_id": employee["_id"],
            "attendance_date": today
        }
    )

    if existing:
        return "ALREADY_CHECKED_IN"

    attendance = {

        "employee_id": employee["_id"],

        "attendance_date": today,

        "check_in": datetime.utcnow(),

        "check_out": None,

        "working_hours": None,

        "status": "Present",

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow()
    }

    result = await attendance_collection.insert_one(attendance)

    return str(result.inserted_id)


# =====================================================
# Employee Check Out
# =====================================================

async def check_out(employee_code: str):

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    employee = await get_or_create_employee_record(employee_code)

    if employee is None:
        return "EMPLOYEE_NOT_FOUND"

    attendance = await attendance_collection.find_one(
        {
            "employee_id": employee["_id"],
            "attendance_date": today
        }
    )

    if attendance is None:
        return "CHECKIN_NOT_FOUND"

    if attendance["check_out"] is not None:
        return "ALREADY_CHECKED_OUT"

    checkout_time = datetime.utcnow()

    working_hours = (
        checkout_time - attendance["check_in"]
    ).total_seconds() / 3600

    result = await attendance_collection.update_one(
        {
            "_id": attendance["_id"]
        },
        {
            "$set": {
                "check_out": checkout_time,
                "working_hours": round(working_hours, 2),
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 0:
        return None

    return True


# =====================================================
# Get All Attendance (Aggregation)
# =====================================================

async def get_all_attendance():
    pipeline = [
        {
            "$lookup": {
                "from": "employees",
                "localField": "employee_id",
                "foreignField": "_id",
                "as": "employee"
            }
        },
        {
            "$unwind": {
                "path": "$employee",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$lookup": {
                "from": "departments",
                "localField": "employee.department_id",
                "foreignField": "_id",
                "as": "department"
            }
        },
        {
            "$unwind": {
                "path": "$department",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$lookup": {
                "from": "designations",
                "localField": "employee.designation_id",
                "foreignField": "_id",
                "as": "designation"
            }
        },
        {
            "$unwind": {
                "path": "$designation",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$project": {
                "_id": 1,
                "email": { "$ifNull": ["$employee.email", ""] },
                "employee_code": { "$ifNull": ["$employee.employee_id", ""] },
                "employee_id": { "$ifNull": ["$employee.employee_id", ""] },
                "user_id": {
                    "$cond": {
                        "if": { "$and": [{ "$ne": ["$employee.user_id", None] }, { "$ne": ["$employee.user_id", ""] }] },
                        "then": { "$toString": "$employee.user_id" },
                        "else": ""
                    }
                },
                "employee_name": {
                    "$trim": {
                        "input": {
                            "$concat": [
                                { "$ifNull": ["$employee.first_name", ""] },
                                " ",
                                { "$ifNull": ["$employee.last_name", ""] }
                            ]
                        }
                    }
                },
                "department": { "$ifNull": ["$department.department_name", "General"] },
                "designation": { "$ifNull": ["$designation.designation_name", "Staff"] },
                "attendance_date": 1,
                "check_in": 1,
                "check_out": 1,
                "working_hours": 1,
                "status": 1
            }
        }
    ]

    attendance = []
    async for record in attendance_collection.aggregate(pipeline):
        record["_id"] = str(record["_id"])
        attendance.append(record)

    return attendance


# =====================================================
# Get Attendance By Employee
# =====================================================

async def get_employee_attendance(employee_id: str):

    attendance = []

    async for record in attendance_collection.find(
        {
            "employee_id": ObjectId(employee_id)
        }
    ):

        record["_id"] = str(record["_id"])
        record["employee_id"] = str(record["employee_id"])

        attendance.append(record)

    return attendance


# =====================================================
# Get Today's Attendance
# =====================================================

async def get_today_attendance():

    today = datetime.combine(
        datetime.utcnow().date(),
        datetime.min.time()
    )

    attendance = []

    async for record in attendance_collection.find(
        {
            "attendance_date": today
        }
    ):
        record["_id"] = str(record["_id"])
        emp_obj_id = record["employee_id"]
        record["employee_id"] = str(emp_obj_id)

        emp_doc = await employees_collection.find_one({"_id": emp_obj_id})
        if emp_doc:
            record["email"] = emp_doc.get("email", "")
            record["employee_code"] = emp_doc.get("employee_id", "")
            record["employee_name"] = f"{emp_doc.get('first_name', '')} {emp_doc.get('last_name', '')}".strip()

        attendance.append(record)

    return attendance


# =====================================================
# Performance Overview Aggregation
# =====================================================

async def get_performance_overview(start_date_str: str = None, end_date_str: str = None, department: str = None):
    now = datetime.utcnow()
    if end_date_str:
        try:
            end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
        except ValueError:
            end_dt = now
    else:
        end_dt = now

    if start_date_str:
        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
        except ValueError:
            start_dt = end_dt - timedelta(days=30)
    else:
        start_dt = end_dt - timedelta(days=30)

    start_dt = datetime.combine(start_dt.date(), datetime.min.time())
    end_dt = datetime.combine(end_dt.date(), datetime.max.time())

    emp_filter = {"is_active": True}
    if department and department != "All":
        dept_doc = await db["departments"].find_one({"department_name": department})
        if dept_doc:
            emp_filter["department_id"] = dept_doc["_id"]

    active_employees = await employees_collection.find(emp_filter).to_list(length=1000)
    total_employees = len(active_employees)
    emp_ids = [emp["_id"] for emp in active_employees]

    att_query = {
        "attendance_date": {"$gte": start_dt, "$lte": end_dt}
    }
    if emp_ids:
        att_query["employee_id"] = {"$in": emp_ids}

    records = await attendance_collection.find(att_query).to_list(length=10000)

    total_present = 0
    total_late = 0
    total_on_time = 0
    total_early_leave = 0
    total_working_hours = 0.0

    daily_stats = {}
    curr = start_dt.date()
    end_d = end_dt.date()
    while curr <= end_d:
        d_str = curr.strftime("%Y-%m-%d")
        daily_stats[d_str] = {
            "date": d_str,
            "present": 0,
            "late": 0,
            "on_time": 0,
            "working_hours": 0.0
        }
        curr += timedelta(days=1)

    for rec in records:
        total_present += 1
        check_in = rec.get("check_in")
        check_out = rec.get("check_out")
        hours = rec.get("working_hours") or 0.0
        total_working_hours += hours

        is_late = False
        if check_in:
            if check_in.hour > 9 or (check_in.hour == 9 and check_in.minute > 15):
                is_late = True

        if is_late:
            total_late += 1
        else:
            total_on_time += 1

        if check_out and (check_out.hour < 17):
            total_early_leave += 1

        att_date = rec.get("attendance_date")
        if isinstance(att_date, datetime):
            d_str = att_date.strftime("%Y-%m-%d")
            if d_str in daily_stats:
                daily_stats[d_str]["present"] += 1
                if is_late:
                    daily_stats[d_str]["late"] += 1
                else:
                    daily_stats[d_str]["on_time"] += 1
                daily_stats[d_str]["working_hours"] += hours

    days_count = max((end_dt.date() - start_dt.date()).days + 1, 1)
    possible_attendances = total_employees * days_count if total_employees > 0 else 1

    attendance_rate = round((total_present / possible_attendances) * 100, 1) if possible_attendances > 0 else 0.0
    punctuality_rate = round((total_on_time / total_present) * 100, 1) if total_present > 0 else 100.0
    avg_working_hours = round(total_working_hours / total_present, 2) if total_present > 0 else 0.0

    trend = list(daily_stats.values())

    depts = await db["departments"].find({}).to_list(length=100)
    dept_map = {str(d["_id"]): d["department_name"] for d in depts}

    dept_stats = {}
    for emp in active_employees:
        d_id = str(emp.get("department_id", "general"))
        d_name = dept_map.get(d_id, "General")
        if d_name not in dept_stats:
            dept_stats[d_name] = {"department": d_name, "total_employees": 0, "present": 0, "late": 0, "on_time": 0}
        dept_stats[d_name]["total_employees"] += 1

    for rec in records:
        emp_id = rec.get("employee_id")
        emp_doc = next((e for e in active_employees if e["_id"] == emp_id), None)
        if emp_doc:
            d_id = str(emp_doc.get("department_id", "general"))
            d_name = dept_map.get(d_id, "General")
            if d_name in dept_stats:
                dept_stats[d_name]["present"] += 1
                check_in = rec.get("check_in")
                if check_in and (check_in.hour > 9 or (check_in.hour == 9 and check_in.minute > 15)):
                    dept_stats[d_name]["late"] += 1
                else:
                    dept_stats[d_name]["on_time"] += 1

    department_breakdown = []
    for d_name, stats in dept_stats.items():
        pres = stats["present"]
        punct = round((stats["on_time"] / pres) * 100, 1) if pres > 0 else 100.0
        department_breakdown.append({
            "department": d_name,
            "total_employees": stats["total_employees"],
            "present_count": pres,
            "late_count": stats["late"],
            "punctuality_rate": punct
        })

    return {
        "summary": {
            "total_employees": total_employees,
            "total_present": total_present,
            "total_late": total_late,
            "total_on_time": total_on_time,
            "total_early_leave": total_early_leave,
            "attendance_rate": min(attendance_rate, 100.0),
            "punctuality_rate": min(punctuality_rate, 100.0),
            "avg_working_hours": avg_working_hours,
            "date_range": {
                "start_date": start_dt.strftime("%Y-%m-%d"),
                "end_date": end_dt.strftime("%Y-%m-%d"),
                "days_count": days_count
            }
        },
        "trend": trend,
        "department_breakdown": department_breakdown
    }


# =====================================================
# Punctuality Reports Aggregation
# =====================================================

async def get_punctuality_reports(start_date_str: str = None, end_date_str: str = None, department: str = None, search: str = None):
    now = datetime.utcnow()
    if end_date_str:
        try:
            end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
        except ValueError:
            end_dt = now
    else:
        end_dt = now

    if start_date_str:
        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
        except ValueError:
            start_dt = end_dt - timedelta(days=30)
    else:
        start_dt = end_dt - timedelta(days=30)

    start_dt = datetime.combine(start_dt.date(), datetime.min.time())
    end_dt = datetime.combine(end_dt.date(), datetime.max.time())

    depts = await db["departments"].find({}).to_list(length=100)
    dept_map = {str(d["_id"]): d["department_name"] for d in depts}
    desigs = await db["designations"].find({}).to_list(length=100)
    desig_map = {str(d["_id"]): d["designation_name"] for d in desigs}

    emp_query = {"is_active": True}
    if department and department != "All":
        dept_doc = await db["departments"].find_one({"department_name": department})
        if dept_doc:
            emp_query["department_id"] = dept_doc["_id"]

    employees = await employees_collection.find(emp_query).to_list(length=1000)

    if search:
        s_lower = search.lower()
        employees = [
            e for e in employees
            if s_lower in f"{e.get('first_name', '')} {e.get('last_name', '')}".lower()
            or s_lower in e.get("employee_id", "").lower()
            or s_lower in e.get("email", "").lower()
        ]

    reports = []
    for emp in employees:
        emp_id = emp["_id"]
        emp_code = emp.get("employee_id", f"EMP-{str(emp_id)[-6:].upper()}")
        full_name = f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip() or "Unnamed Employee"
        email = emp.get("email", "")
        dept_name = dept_map.get(str(emp.get("department_id")), "General")
        desig_name = desig_map.get(str(emp.get("designation_id")), "Staff")

        records = await attendance_collection.find({
            "employee_id": emp_id,
            "attendance_date": {"$gte": start_dt, "$lte": end_dt}
        }).to_list(length=500)

        total_days_present = len(records)
        on_time_days = 0
        late_days = 0
        early_checkout_days = 0
        total_check_in_minutes = 0
        total_working_hours = 0.0

        for r in records:
            c_in = r.get("check_in")
            c_out = r.get("check_out")
            hours = r.get("working_hours") or 0.0
            total_working_hours += hours

            if c_in:
                total_check_in_minutes += c_in.hour * 60 + c_in.minute
                if c_in.hour > 9 or (c_in.hour == 9 and c_in.minute > 15):
                    late_days += 1
                else:
                    on_time_days += 1

            if c_out and c_out.hour < 17:
                early_checkout_days += 1

        avg_daily_hours = round(total_working_hours / total_days_present, 2) if total_days_present > 0 else 0.0
        punctuality_score = round((on_time_days / total_days_present) * 100, 1) if total_days_present > 0 else 100.0

        if total_days_present > 0 and total_check_in_minutes > 0:
            avg_min = total_check_in_minutes // total_days_present
            avg_h = avg_min // 60
            avg_m = avg_min % 60
            ampm = "AM" if avg_h < 12 else "PM"
            dis_h = avg_h if avg_h <= 12 else avg_h - 12
            if dis_h == 0:
                dis_h = 12
            avg_check_in_time = f"{dis_h:02d}:{avg_m:02d} {ampm}"
        else:
            avg_check_in_time = "N/A"

        if total_days_present == 0:
            grade = "No Data"
        elif punctuality_score >= 90:
            grade = "Excellent"
        elif punctuality_score >= 75:
            grade = "Good"
        elif punctuality_score >= 60:
            grade = "Average"
        else:
            grade = "Needs Improvement"

        reports.append({
            "employee_id": str(emp_id),
            "employee_code": emp_code,
            "employee_name": full_name,
            "email": email,
            "department": dept_name,
            "designation": desig_name,
            "total_days_present": total_days_present,
            "on_time_days": on_time_days,
            "late_days": late_days,
            "early_checkout_days": early_checkout_days,
            "avg_check_in_time": avg_check_in_time,
            "total_working_hours": round(total_working_hours, 2),
            "avg_daily_hours": avg_daily_hours,
            "punctuality_score": punctuality_score,
            "grade": grade
        })

    return reports