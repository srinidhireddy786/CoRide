from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import fetch, fetchrow
from auth import get_current_user

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

class VehicleCreate(BaseModel):
    type: str
    brand: str
    model: str
    registration_number: str
    seat_capacity: int

@router.get("")
async def list_vehicles(user_id: str = Depends(get_current_user)):
    rows = await fetch(
        "SELECT id, type, brand, model, registration_number, seat_capacity FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC",
        user_id,
    )
    return [dict(r) for r in rows]

@router.post("")
async def add_vehicle(req: VehicleCreate, user_id: str = Depends(get_current_user)):
    existing = await fetchrow(
        "SELECT id FROM vehicles WHERE registration_number = $1",
        req.registration_number,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Registration number already exists")

    row = await fetchrow(
        """INSERT INTO vehicles (user_id, type, brand, model, registration_number, seat_capacity)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, type, brand, model, registration_number, seat_capacity""",
        user_id, req.type, req.brand, req.model, req.registration_number, req.seat_capacity,
    )
    return dict(row)
