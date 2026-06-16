from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from database import init_db, close_db
from routers import auth, vehicles, rides, requests as req_router, chat, ratings, notifications, profile

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()

app = FastAPI(title="CoRide API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(rides.router)
app.include_router(req_router.router)
app.include_router(chat.router)
app.include_router(ratings.router)
app.include_router(notifications.router)
app.include_router(profile.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
