from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: str
    phone: str

@router.get("")
async def get_profile(user_id: str = Depends(get_current_user)):
    user = await fetchrow(
        """SELECT id, name, email, phone, avg_rating, total_ratings,
                  completed_rides, cancelled_rides
           FROM users WHERE id = $1""",
        user_id,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)

@router.patch("")
async def update_profile(req: ProfileUpdate, user_id: str = Depends(get_current_user)):
    await execute(
        "UPDATE users SET name = $1, phone = $2 WHERE id = $3",
        req.name, req.phone, user_id,
    )
    user = await fetchrow(
        "SELECT id, name, email, phone, avg_rating, total_ratings FROM users WHERE id = $1",
        user_id,
    )
    return dict(user)
