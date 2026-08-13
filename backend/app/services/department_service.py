from app.database.connection import db

departments_collection = db["departments"]


async def init_departments():
    """Initializes and seeds IT-related departments, cleaning up non-IT departments."""
    it_departments = [
        {"department_code": "DEP-ENG", "department_name": "Software Engineering", "description": "Software development and engineering architecture", "status": "Active"},
        {"department_code": "DEP-IT", "department_name": "IT & Infrastructure", "description": "Internal IT systems and network infrastructure", "status": "Active"},
        {"department_code": "DEP-QA", "department_name": "Quality Assurance & Testing", "description": "Software quality assurance and automated testing", "status": "Active"},
        {"department_code": "DEP-DATA", "department_name": "Data Analytics & AI", "description": "Business intelligence, data science, and AI solutions", "status": "Active"},
        {"department_code": "DEP-PRD", "department_name": "Product Management", "description": "Product strategy and user experience planning", "status": "Active"},
        {"department_code": "DEP-DES", "department_name": "Design & UI/UX", "description": "Product UI/UX and graphic design", "status": "Active"}
    ]

    valid_codes = {dept["department_code"] for dept in it_departments}

    # Delete non-IT departments from collection
    await departments_collection.delete_many({"department_code": {"$nin": list(valid_codes)}})

    for dept in it_departments:
        existing = await departments_collection.find_one({
            "$or": [
                {"department_code": dept["department_code"]},
                {"department_name": dept["department_name"]}
            ]
        })
        if not existing:
            await departments_collection.insert_one(dept)



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