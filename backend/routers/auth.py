from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import fetchrow
from auth import hash_password, verify_password, create_token, get_current_user
from fastapi import Depends

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(req: SignupRequest):
    existing = await fetchrow("SELECT id FROM users WHERE email = $1", req.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(req.password)
    user = await fetchrow(
        """INSERT INTO users (name, email, phone, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING id, name, email, phone, avg_rating, total_ratings""",
        req.name, req.email, req.phone, hashed,
    )

    token = create_token(str(user["id"]))
    return {
        "token": token,
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "avg_rating": float(user["avg_rating"] or 0),
            "total_ratings": user["total_ratings"],
        },
    }

@router.post("/login")
async def login(req: LoginRequest):
    user = await fetchrow("SELECT * FROM users WHERE email = $1", req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["id"]))
    return {
        "token": token,
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "avg_rating": float(user["avg_rating"] or 0),
            "total_ratings": user["total_ratings"],
        },
    }

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await fetchrow(
        "SELECT id, name, email, phone, avg_rating, total_ratings FROM users WHERE id = $1",
        user_id,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "avg_rating": float(user["avg_rating"] or 0),
        "total_ratings": user["total_ratings"],
    }
