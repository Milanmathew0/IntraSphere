from app.database.connection import db

employees_collection = db["employees"]
departments_collection = db["departments"]
designations_collection = db["designations"]


async def get_dashboard_summary():

    total_employees = await employees_collection.count_documents({})

    active_employees = await employees_collection.count_documents(
        {
            "employment_status": "Active"
        }
    )

    inactive_employees = await employees_collection.count_documents(
        {
            "employment_status": "Inactive"
        }
    )

    total_departments = await departments_collection.count_documents({})

    total_designations = await designations_collection.count_documents({})

    return {
        "employees": {
            "total": total_employees,
            "active": active_employees,
            "inactive": inactive_employees,
        },
        "departments": {
            "total": total_departments,
        },
        "designations": {
            "total": total_designations,
        },
    }