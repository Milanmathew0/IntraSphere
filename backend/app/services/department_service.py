from app.database.connection import db

departments_collection = db["departments"]


async def create_department(department):
    department_dict = department.model_dump()

    existing = await departments_collection.find_one(
        {
            "$or": [
                {"department_code": department.department_code},
                {"department_name": department.department_name}
            ]
        }
    )

    if existing:
        return None

    result = await departments_collection.insert_one(department_dict)

    return str(result.inserted_id)


async def get_all_departments():
    departments = []

    async for department in departments_collection.find():
        department["_id"] = str(department["_id"])
        departments.append(department)

    return departments