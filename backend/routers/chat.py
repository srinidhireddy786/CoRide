from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from database import fetch, fetchrow, execute
from auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

class MessageCreate(BaseModel):
    content: str

@router.get("/{ride_id}")
async def get_messages(
    ride_id: str,
    after_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
):
    # Check user is participant
    participant = await fetchrow(
        "SELECT id FROM ride_participants WHERE ride_id = $1 AND user_id = $2",
        ride_id, user_id,
    )
    owner = await fetchrow("SELECT owner_id FROM rides WHERE id = $1", ride_id)
    if not participant and (not owner or owner["owner_id"] != user_id):
        raise HTTPException(status_code=403, detail="Not a participant of this ride")

    if after_id:
        after = await fetchrow("SELECT created_at FROM chat_messages WHERE id = $1", after_id)
        if after:
            rows = await fetch(
                """SELECT cm.*, u.name as sender_name
                   FROM chat_messages cm
                   JOIN users u ON u.id = cm.sender_id
                   WHERE cm.ride_id = $1 AND cm.created_at > $2
                   ORDER BY cm.created_at ASC""",
                ride_id, after["created_at"],
            )
        else:
            rows = []
    else:
        rows = await fetch(
            """SELECT cm.*, u.name as sender_name
               FROM chat_messages cm
               JOIN users u ON u.id = cm.sender_id
               WHERE cm.ride_id = $1
               ORDER BY cm.created_at ASC""",
            ride_id,
        )
    return [dict(r) for r in rows]

@router.post("/{ride_id}")
async def send_message(ride_id: str, req: MessageCreate, user_id: str = Depends(get_current_user)):
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    row = await fetchrow(
        """INSERT INTO chat_messages (ride_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING *""",
        ride_id, user_id, req.content.strip()[:500],
    )
    return dict(row)
@router.get("/conversations/list")
async def get_conversations(user_id: str = Depends(get_current_user)):
    rows = await fetch(
        """
        SELECT
            r.id AS ride_id,
            r.from_city,
            r.to_city,
            r.status,
            r.departure_time,
            -- Get the other person's name (if user is passenger, get driver; if driver, get a passenger)
            CASE
                WHEN r.owner_id = $1 THEN (
                    SELECT u.name FROM ride_participants rp
                    JOIN users u ON u.id = rp.user_id
                    WHERE rp.ride_id = r.id
                    LIMIT 1
                )
                ELSE (
                    SELECT u.name FROM users u WHERE u.id = r.owner_id
                )
            END AS name,
            (
                SELECT cm.content FROM chat_messages cm
                WHERE cm.ride_id = r.id
                ORDER BY cm.created_at DESC LIMIT 1
            ) AS last_message,
            (
                SELECT cm.created_at FROM chat_messages cm
                WHERE cm.ride_id = r.id
                ORDER BY cm.created_at DESC LIMIT 1
            ) AS last_message_time
        FROM rides r
        WHERE
            r.owner_id = $1
            OR r.id IN (
                SELECT rp.ride_id FROM ride_participants rp WHERE rp.user_id = $1
            )
        ORDER BY last_message_time DESC NULLS LAST
        """,
        user_id,
    )
    return [dict(r) for r in rows]