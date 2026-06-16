from fastapi import APIRouter, Depends, Query
from typing import Optional
from database import fetch, execute
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("")
async def list_notifications(
    after_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
):
    if after_id:
        after = await fetch("SELECT created_at FROM notifications WHERE id = $1", after_id)
        if after:
            rows = await fetch(
                """SELECT * FROM notifications
                   WHERE user_id = $1 AND created_at > $2
                   ORDER BY created_at DESC LIMIT 50""",
                user_id, after[0]["created_at"],
            )
        else:
            rows = []
    else:
        rows = await fetch(
            """SELECT * FROM notifications
               WHERE user_id = $1
               ORDER BY created_at DESC LIMIT 50""",
            user_id,
        )
    return [dict(r) for r in rows]

@router.post("/read")
async def mark_read(user_id: str = Depends(get_current_user)):
    await execute(
        "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
        user_id,
    )
    return {"message": "Marked as read"}
