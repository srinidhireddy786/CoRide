from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import fetch, fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/ratings", tags=["ratings"])

class RatingCreate(BaseModel):
    ride_id: str
    stars: int
    review: Optional[str] = None

@router.get("/check/{ride_id}")
async def check_rating(ride_id: str, user_id: str = Depends(get_current_user)):
    existing = await fetchrow(
        "SELECT id, stars, review FROM ratings WHERE ride_id = $1 AND reviewer_id = $2",
        ride_id, user_id,
    )
    if existing:
        return {"rated": True, "stars": existing["stars"], "review": existing["review"]}
    return {"rated": False}

@router.post("")
async def create_rating(req: RatingCreate, user_id: str = Depends(get_current_user)):
    ride = await fetchrow("SELECT * FROM rides WHERE id = $1", req.ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed rides")
    if ride["owner_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")

    participant = await fetchrow(
        "SELECT id FROM ride_participants WHERE ride_id = $1 AND user_id = $2 AND role = 'passenger'",
        req.ride_id, user_id,
    )
    if not participant:
        raise HTTPException(status_code=403, detail="Not a passenger on this ride")

    existing = await fetchrow(
        "SELECT id FROM ratings WHERE ride_id = $1 AND reviewer_id = $2",
        req.ride_id, user_id,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already rated this ride")

    if req.stars < 1 or req.stars > 5:
        raise HTTPException(status_code=400, detail="Stars must be 1-5")

    await fetchrow(
        """INSERT INTO ratings (ride_id, reviewer_id, reviewee_id, stars, review)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id""",
        req.ride_id, user_id, ride["owner_id"], req.stars, req.review,
    )
    return {"message": "Rating submitted"}
