from app.database.connection import db

designations_collection = db["designations"]


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