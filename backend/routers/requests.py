from fastapi import APIRouter, Depends, HTTPException, Query
from database import fetch, fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.get("/ride/{ride_id}")
async def get_requests(ride_id: str, user_id: str = Depends(get_current_user)):
    ride = await fetchrow("SELECT * FROM rides WHERE id = $1 AND owner_id = $2", ride_id, user_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or not authorized")

    rows = await fetch(
        """SELECT rr.*, u.name as passenger_name, u.phone as passenger_phone
           FROM ride_requests rr
           JOIN users u ON u.id = rr.passenger_id
           WHERE rr.ride_id = $1
           ORDER BY rr.requested_at DESC""",
        ride_id,
    )
    return [dict(r) for r in rows]

@router.post("/ride/{ride_id}")
async def create_request(ride_id: str, user_id: str = Depends(get_current_user)):
    ride = await fetchrow("SELECT * FROM rides WHERE id = $1", ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride["owner_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot request your own ride")
    if ride["status"] != "open":
        raise HTTPException(status_code=400, detail="Ride is not open")
    if ride["available_seats"] <= 0:
        raise HTTPException(status_code=400, detail="No available seats")

    existing = await fetchrow(
        "SELECT * FROM ride_requests WHERE ride_id = $1 AND passenger_id = $2 AND status = 'pending'",
        ride_id, user_id,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Request already sent")

    row = await fetchrow(
        """INSERT INTO ride_requests (ride_id, passenger_id)
           VALUES ($1, $2)
           RETURNING *""",
        ride_id, user_id,
    )

    # Notify driver
    passenger = await fetchrow("SELECT name FROM users WHERE id = $1", user_id)
    await execute(
        """INSERT INTO notifications (user_id, type, title, message, related_ride_id, related_request_id)
           VALUES ($1, $2, $3, $4, $5, $6)""",
        ride["owner_id"], "request_sent",
        "New Ride Request",
        f"{passenger['name']} wants to join your ride from {ride['from_city']} to {ride['to_city']}.",
        ride_id, row["id"],
    )

    return dict(row)

@router.patch("/{request_id}")
async def respond_to_request(
    request_id: str,
    status: str = Query(...),
    user_id: str = Depends(get_current_user),
):
    if status not in ("accepted", "rejected", "cancelled"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted', 'rejected', or 'cancelled'")

    req = await fetchrow(
        """SELECT rr.*, r.owner_id, r.from_city, r.to_city, r.status as ride_status
           FROM ride_requests rr
           JOIN rides r ON r.id = rr.ride_id
           WHERE rr.id = $1""",
        request_id,
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request already responded")

    # Driver accept/reject
    if status in ("accepted", "rejected"):
        if req["owner_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if req["ride_status"] != "open":
            raise HTTPException(status_code=400, detail="Ride is no longer open")

    # Passenger self-cancel
    if status == "cancelled":
        if req["passenger_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

    # DB triggers handle seat management
    await execute(
        "UPDATE ride_requests SET status = $1, responded_at = NOW() WHERE id = $2",
        status, request_id,
    )

    # Notify passenger of accept/reject
    if status in ("accepted", "rejected"):
        driver = await fetchrow("SELECT name FROM users WHERE id = $1", user_id)
        title = "Request Accepted" if status == "accepted" else "Request Rejected"
        msg = (
            f"{driver['name']} accepted your request for {req['from_city']} → {req['to_city']}."
            if status == "accepted"
            else f"{driver['name']} declined your request for {req['from_city']} → {req['to_city']}."
        )
        await execute(
            """INSERT INTO notifications (user_id, type, title, message, related_ride_id, related_request_id)
               VALUES ($1, $2, $3, $4, $5, $6)""",
            req["passenger_id"], f"request_{status}", title, msg, req["ride_id"], request_id,
        )

    return {"message": f"Request {status}"}
