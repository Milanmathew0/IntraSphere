from app.database.connection import db

designations_collection = db["designations"]


async def init_designations():
    """Initializes and seeds IT-related designations, cleaning up non-IT designations."""
    it_designations = [
        {"designation_code": "DES-SE", "designation_name": "Software Engineer", "description": "Full-stack software engineering", "status": "Active"},
        {"designation_code": "DES-SSE", "designation_name": "Senior Software Engineer", "description": "Senior level software development", "status": "Active"},
        {"designation_code": "DES-LSE", "designation_name": "Lead Software Engineer", "description": "Technical team lead and code architecture", "status": "Active"},
        {"designation_code": "DES-EM", "designation_name": "Engineering Manager", "description": "Engineering team leadership and project delivery", "status": "Active"},
        {"designation_code": "DES-ARCH", "designation_name": "Principal Architect", "description": "System architecture and technical strategy", "status": "Active"},
        {"designation_code": "DES-PM", "designation_name": "Product Manager", "description": "Product feature owner and backlog management", "status": "Active"},
        {"designation_code": "DES-SPM", "designation_name": "Senior Product Manager", "description": "Senior product leadership", "status": "Active"},
        {"designation_code": "DES-UX", "designation_name": "UI/UX Designer", "description": "User interface design and design systems", "status": "Active"},
        {"designation_code": "DES-QAL", "designation_name": "QA Lead", "description": "Quality assurance leadership and test automation", "status": "Active"},
        {"designation_code": "DES-DS", "designation_name": "Data Scientist", "description": "Data modeling, analytics, and AI", "status": "Active"},
        {"designation_code": "DES-ITADMIN", "designation_name": "IT Administrator", "description": "Systems and network administration", "status": "Active"}
    ]

    valid_codes = {desig["designation_code"] for desig in it_designations}

    # Delete non-IT designations from collection
    await designations_collection.delete_many({"designation_code": {"$nin": list(valid_codes)}})

    for desig in it_designations:
        existing = await designations_collection.find_one({
            "$or": [
                {"designation_code": desig["designation_code"]},
                {"designation_name": desig["designation_name"]}
            ]
        })
        if not existing:
            await designations_collection.insert_one(desig)



async def create_designation(designation):
    designation_dict = designation.model_dump()

    # Check duplicate designation code
    existing_code = await designations_collection.find_one(
        {"designation_code": designation.designation_code}
    )

    if existing_code:
        return None

    result = await designations_collection.insert_one(designation_dict)

    return str(result.inserted_id)


async def get_all_designations():
    designations = []

    async for designation in designations_collection.find():
        designation["_id"] = str(designation["_id"])
        designations.append(designation)

    return designations



async def get_designation_by_id(designation_id: str):

    designation = await designations_collection.find_one(
        {"_id": designation_id}
    )

    return designation


async def update_designation(designation_id: str, designation):

    update_data = designation.model_dump(exclude_unset=True)

    result = await designations_collection.update_one(
        {"_id": designation_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    return True


async def deactivate_designation(designation_id: str):

    result = await designations_collection.update_one(
        {"_id": designation_id},
        {
            "$set": {
                "status": "Inactive"
            }
        }
    )

    if result.matched_count == 0:
        return None

    return True