from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import asyncio
import random
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# --- Pydantic Models ---
class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: str = ""
    credits: int = 3
    plan: str = "free"
    created_at: str = ""

class JobOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    job_id: str
    user_id: str
    status: str
    reference_video_name: str = ""
    face_image_name: str = ""
    prompt: str = ""
    output_video_url: str = ""
    created_at: str = ""
    updated_at: str = ""
    watermarked: bool = True

class SessionExchange(BaseModel):
    session_id: str

class PlanUpgrade(BaseModel):
    plan: str

PRICING_PLANS = [
    {"id": "free", "name": "Free", "price": 0, "credits": 3, "features": ["3 watermarked videos", "720p quality", "Basic support"], "popular": False},
    {"id": "starter", "name": "Starter", "price": 29, "credits": 50, "features": ["50 HD videos", "1080p quality", "No watermark", "Priority support"], "popular": False},
    {"id": "pro", "name": "Pro", "price": 79, "credits": 200, "features": ["200 HD videos", "1080p quality", "No watermark", "Priority support", "Batch processing"], "popular": True},
    {"id": "agency", "name": "Agency", "price": 199, "credits": 1000, "features": ["1000 HD videos", "4K quality", "No watermark", "Dedicated support", "API access", "Team seats"], "popular": False},
]

# --- Auth Helpers ---
async def get_current_user(request: Request) -> dict:
    token = None
    session_cookie = request.cookies.get("session_token")
    if session_cookie:
        token = session_cookie
    auth_header = request.headers.get("Authorization")
    if not token and auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc

# --- Auth Routes ---
@api_router.post("/auth/session")
async def exchange_session(data: SessionExchange, response: Response):
    async with httpx.AsyncClient() as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": data.session_id}
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    auth_data = r.json()
    email = auth_data["email"]
    name = auth_data.get("name", "")
    picture = auth_data.get("picture", "")
    session_token = auth_data["session_token"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "credits": 3,
            "plan": "free",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 3600
    )
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}

# --- Mock Job Processor ---
async def process_job(job_id: str):
    await asyncio.sleep(3)
    await db.jobs.update_one({"job_id": job_id}, {"$set": {"status": "processing", "updated_at": datetime.now(timezone.utc).isoformat()}})
    await asyncio.sleep(random.randint(5, 10))
    sample_videos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    ]
    await db.jobs.update_one({"job_id": job_id}, {"$set": {
        "status": "completed",
        "output_video_url": random.choice(sample_videos),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }})

# --- Job Routes ---
@api_router.post("/jobs")
async def create_job(
    request: Request,
    background_tasks: BackgroundTasks,
    prompt: str = Form(...),
    reference_video: UploadFile = File(...),
    face_image: UploadFile = File(...)
):
    user = await get_current_user(request)
    if user.get("credits", 0) <= 0:
        raise HTTPException(status_code=403, detail="No credits remaining. Please upgrade your plan.")
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    vid_ext = reference_video.filename.split(".")[-1] if reference_video.filename else "mp4"
    vid_path = UPLOAD_DIR / f"{job_id}_ref.{vid_ext}"
    vid_content = await reference_video.read()
    with open(vid_path, "wb") as f:
        f.write(vid_content)
    img_ext = face_image.filename.split(".")[-1] if face_image.filename else "jpg"
    img_path = UPLOAD_DIR / f"{job_id}_face.{img_ext}"
    img_content = await face_image.read()
    with open(img_path, "wb") as f:
        f.write(img_content)
    is_watermarked = user.get("plan", "free") == "free"
    job_doc = {
        "job_id": job_id,
        "user_id": user["user_id"],
        "status": "queued",
        "reference_video_name": reference_video.filename or "reference.mp4",
        "face_image_name": face_image.filename or "face.jpg",
        "prompt": prompt,
        "output_video_url": "",
        "watermarked": is_watermarked,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.jobs.insert_one(job_doc)
    await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"credits": -1}})
    background_tasks.add_task(process_job, job_id)
    del job_doc["_id"]
    return job_doc

@api_router.get("/jobs")
async def list_jobs(request: Request):
    user = await get_current_user(request)
    jobs = await db.jobs.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, request: Request):
    user = await get_current_user(request)
    job = await db.jobs.find_one({"job_id": job_id, "user_id": user["user_id"]}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# --- User Routes ---
@api_router.get("/user/credits")
async def get_credits(request: Request):
    user = await get_current_user(request)
    return {"credits": user.get("credits", 0), "plan": user.get("plan", "free")}

@api_router.post("/user/upgrade")
async def upgrade_plan(data: PlanUpgrade, request: Request):
    user = await get_current_user(request)
    plan = next((p for p in PRICING_PLANS if p["id"] == data.plan), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if data.plan == "free":
        raise HTTPException(status_code=400, detail="Cannot downgrade to free")
    new_credits = user.get("credits", 0) + plan["credits"]
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"plan": data.plan, "credits": new_credits}}
    )
    return {"message": f"Upgraded to {plan['name']}", "credits": new_credits, "plan": data.plan}

# --- Pricing ---
@api_router.get("/pricing")
async def get_pricing():
    return PRICING_PLANS

# --- Health ---
@api_router.get("/")
async def root():
    return {"message": "AI Reel Replicator API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
