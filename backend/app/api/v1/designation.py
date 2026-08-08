from fastapi import APIRouter, HTTPException

from app.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
)

from app.services.designation_service import (
    create_designation,
    get_all_designations,
    get_designation_by_id,
    update_designation,
    deactivate_designation,
)

router = APIRouter(
    prefix="/designations",
    tags=["Designations"]
)


@router.post("/")
async def add_designation(designation: DesignationCreate):

    result = await create_designation(designation)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Designation code already exists"
        )

    return {
        "message": "Designation created successfully",
        "designation_id": result
    }


@router.get("/")
async def get_designations():

    designations = await get_all_designations()

    return {
        "count": len(designations),
        "designations": designations
    }


@router.get("/{designation_id}")
async def get_designation(designation_id: str):

    designation = await get_designation_by_id(designation_id)

    if designation is None:
        raise HTTPException(
            status_code=404,
            detail="Designation not found"
        )

    return designation


@router.put("/{designation_id}")
async def edit_designation(
    designation_id: str,
    designation: DesignationUpdate
):

    updated = await update_designation(
        designation_id,
        designation
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Designation not found"
        )

    return {
        "message": "Designation updated successfully"
    }


@router.patch("/{designation_id}/deactivate")
async def deactivate_designation_api(designation_id: str):

    result = await deactivate_designation(designation_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Designation not found"
        )

    return {
        "message": "Designation deactivated successfully"
    }