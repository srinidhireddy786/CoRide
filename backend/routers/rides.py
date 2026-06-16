from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from database import fetch, fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/rides", tags=["rides"])

class RideCreate(BaseModel):
    from_city: str
    to_city: str
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    departure_time: str
    total_seats: int
    final_cost: float
    vehicle_id: str
    distance_km: Optional[float] = None

@router.get("")
async def search_rides(
    from_city: str = Query(""),
    to_city: str = Query(""),
    date: str = Query(""),
    user_id: str = Depends(get_current_user),
):
    conditions = ["r.status = 'open'", "r.available_seats > 0", "r.owner_id != $1"]
    params = [user_id]
    idx = 2

    if from_city:
        conditions.append(f"LOWER(r.from_city) LIKE LOWER(${idx})")
        params.append(f"%{from_city}%")
        idx += 1
    if to_city:
        conditions.append(f"LOWER(r.to_city) LIKE LOWER(${idx})")
        params.append(f"%{to_city}%")
        idx += 1
    if date:
        conditions.append(f"r.departure_time::date = ${idx}::date")
        params.append(date)
        idx += 1

    where = " AND ".join(conditions)
    query = f"""
        SELECT r.*, u.name as driver_name, u.avg_rating as driver_avg_rating,
               u.total_ratings as driver_total_ratings
        FROM rides r
        JOIN users u ON u.id = r.owner_id
        WHERE {where}
        ORDER BY r.departure_time ASC
    """
    rows = await fetch(query, *params)
    return [dict(r) for r in rows]

@router.post("")
async def create_ride(req: RideCreate, user_id: str = Depends(get_current_user)):
    dep_time = datetime.fromisoformat(req.departure_time)
    dep_time_utc = dep_time.astimezone(timezone.utc) if dep_time.tzinfo else dep_time.replace(tzinfo=timezone.utc)
    if dep_time_utc < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Departure time cannot be in the past")

    row = await fetchrow(
        """INSERT INTO rides
           (owner_id, vehicle_id, from_city, to_city, from_lat, from_lng, to_lat, to_lng,
            departure_time, total_seats, available_seats, final_cost, distance_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *""",
        user_id, req.vehicle_id, req.from_city, req.to_city,
        req.from_lat, req.from_lng, req.to_lat, req.to_lng,
        dep_time_utc, req.total_seats, req.total_seats,
        req.final_cost, req.distance_km,
    )
    return dict(row)

@router.get("/my")
async def my_rides(user_id: str = Depends(get_current_user)):
    rows = await fetch(
        """SELECT r.*, u.name as driver_name, u.avg_rating as driver_avg_rating
           FROM rides r
           JOIN users u ON u.id = r.owner_id
           WHERE r.owner_id = $1
           ORDER BY r.departure_time DESC""",
        user_id,
    )
    return [dict(r) for r in rows]

@router.get("/joined")
async def joined_rides(user_id: str = Depends(get_current_user)):
    rows = await fetch(
        """SELECT r.*, u.name as driver_name, u.avg_rating as driver_avg_rating,
                  rr.status as booking_status
           FROM ride_requests rr
           JOIN rides r ON r.id = rr.ride_id
           JOIN users u ON u.id = r.owner_id
           WHERE rr.passenger_id = $1 AND rr.status != 'cancelled'
           ORDER BY r.departure_time DESC""",
        user_id,
    )
    return [dict(r) for r in rows]

@router.get("/{ride_id}")
async def get_ride(ride_id: str, user_id: str = Depends(get_current_user)):
    row = await fetchrow(
        """SELECT r.*, u.name as driver_name, u.email as driver_email,
                  u.phone as driver_phone, u.avg_rating as driver_avg_rating,
                  u.total_ratings as driver_total_ratings
           FROM rides r
           JOIN users u ON u.id = r.owner_id
           WHERE r.id = $1""",
        ride_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Ride not found")

    result = dict(row)

    # Include user's booking status if they're a passenger
    booking = await fetchrow(
        "SELECT id, status FROM ride_requests WHERE ride_id = $1 AND passenger_id = $2 AND status != 'cancelled'",
        ride_id, user_id,
    )
    result["booking_status"] = booking["status"] if booking else None
    result["booking_id"] = str(booking["id"]) if booking else None

    return result

@router.patch("/{ride_id}/status")
async def update_ride_status(ride_id: str, status: str = Query(...), user_id: str = Depends(get_current_user)):
    valid = {"open", "in_progress", "completed", "cancelled"}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")

    ride = await fetchrow("SELECT * FROM rides WHERE id = $1 AND owner_id = $2", ride_id, user_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or not authorized")

    await execute("UPDATE rides SET status = $1 WHERE id = $2", status, ride_id)

    # Notify passengers
    if status in ("completed", "cancelled"):
        passengers = await fetch(
            "SELECT passenger_id FROM ride_requests WHERE ride_id = $1 AND status = 'accepted'",
            ride_id,
        )
        title_map = {
            "completed": "Ride Completed",
            "cancelled": "Ride Cancelled",
        }
        msg_map = {
            "completed": f"Your ride from {ride['from_city']} to {ride['to_city']} has been completed.",
            "cancelled": f"Your ride from {ride['from_city']} to {ride['to_city']} has been cancelled.",
        }
        for p in passengers:
            await execute(
                """INSERT INTO notifications (user_id, type, title, message, related_ride_id)
                   VALUES ($1, $2, $3, $4, $5)""",
                p["passenger_id"], f"ride_{status}",
                title_map[status], msg_map[status], ride_id,
            )

    return {"message": f"Ride {status}"}

@router.patch("/{ride_id}/location")
async def update_location(ride_id: str, lat: float = Query(...), lng: float = Query(...), user_id: str = Depends(get_current_user)):
    ride = await fetchrow("SELECT * FROM rides WHERE id = $1 AND owner_id = $2", ride_id, user_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or not authorized")

    await execute(
        "UPDATE rides SET driver_lat = $1, driver_lng = $2, last_updated = NOW() WHERE id = $3",
        lat, lng, ride_id,
    )
    return {"message": "Location updated"}
