import asyncio
import random
import string
from contextlib import suppress
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Query, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware
import os
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

INDEXES: dict[str, list[IndexModel]] = {
    "draw_codes": [IndexModel([("code", ASCENDING)], name="code", unique=True)],
    "coupons": [IndexModel([("code", ASCENDING)], name="code", unique=True)],
    "winners": [IndexModel([("created_at", DESCENDING)], name="created_desc")],
    "invites": [IndexModel([("user_id", ASCENDING)], name="user_id")],
}

async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logging.getLogger(__name__).error("ensure_indexes(%s): %s", collection, exc)

app = FastAPI()
api_router = APIRouter(prefix="/api")

PRIZES = [5000, 1000, 200, 50, 10, 2]
PRIZE_WEIGHTS = [1, 4, 15, 30, 30, 20]
TOTAL_POOL = 1_000_000


def gen_code(prefix: str) -> str:
    return prefix + "".join(random.choices(string.digits, k=8))


class DrawCodeValidate(BaseModel):
    code: str


class DrawResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    amount: int
    coupon_code: str


class InviteInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    invite_url: str
    invited_count: int
    visit_count: int


@api_router.get("/")
async def root():
    return {"message": "GSET RWA Lucky Draw API"}


@api_router.post("/draw/validate")
async def validate_code(body: DrawCodeValidate):
    code = body.code.strip().upper()
    doc = await db.draw_codes.find_one({"code": code}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=400, detail="抽奖码无效、已使用或已过期")
    if doc["status"] != "unused":
        raise HTTPException(status_code=400, detail="抽奖码无效、已使用或已过期")
    return {"valid": True, "message": "校验成功：抽奖码有效，已解锁抽奖机会"}


@api_router.post("/draw/spin", response_model=DrawResult)
async def spin(body: DrawCodeValidate):
    code = body.code.strip().upper()
    doc = await db.draw_codes.find_one({"code": code}, {"_id": 0})
    if not doc or doc["status"] != "unused":
        raise HTTPException(status_code=400, detail="抽奖码无效、已使用或已过期")

    amount = random.choices(PRIZES, weights=PRIZE_WEIGHTS, k=1)[0]
    coupon_code = gen_code("LC")

    await db.draw_codes.update_one({"code": code}, {"$set": {"status": "used", "used_at": datetime.now(timezone.utc).isoformat()}})
    await db.coupons.insert_one({
        "code": coupon_code,
        "amount": amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
    })
    wallet = doc.get("wallet", "0x" + "".join(random.choices("0123456789abcdef", k=40)))
    await db.winners.insert_one({
        "wallet": wallet,
        "amount": amount,
        "coupon_code": coupon_code,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return DrawResult(code=code, amount=amount, coupon_code=coupon_code)


@api_router.get("/codes/my")
async def my_codes(user_id: str = Query("guest")):
    codes = await db.draw_codes.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    now = datetime.now(timezone.utc).isoformat()
    for c in codes:
        if c["status"] == "unused" and c.get("expires_at", "") < now:
            c["status"] = "expired"
    return {"codes": codes}


@api_router.get("/coupons/my")
async def my_coupons(user_id: str = Query("guest")):
    coupons = await db.coupons.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    now = datetime.now(timezone.utc).isoformat()
    for c in coupons:
        if c["status"] == "pending" and c.get("expires_at", "") < now:
            c["status"] = "expired"
    return {"coupons": coupons}


@api_router.get("/winners/recent")
async def recent_winners(limit: int = Query(20, ge=1, le=50)):
    winners = await db.winners.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"winners": winners}


@api_router.get("/pool/stats")
async def pool_stats():
    total = await db.coupons.aggregate([
        {"$match": {"status": "pending"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    used = total[0]["total"] if total else 0
    return {"total_pool": TOTAL_POOL, "used": used, "remaining": TOTAL_POOL - used}


@api_router.get("/invite/info")
async def invite_info(user_id: str = Query("guest")):
    invite = await db.invites.find_one({"user_id": user_id}, {"_id": 0})
    if not invite:
        invite_doc = {
            "user_id": user_id,
            "invite_url": f"https://gset-rwa.example.com/invite/{user_id[:8]}",
            "invited_count": 0,
            "visit_count": random.randint(3, 15),
        }
        await db.invites.insert_one(invite_doc)
        return {k: v for k, v in invite_doc.items() if k != "_id"}
    return invite


@api_router.get("/invite/leaderboard")
async def invite_leaderboard(limit: int = Query(10, ge=1, le=20)):
    leaders = await db.invites.find({}, {"_id": 0}).sort("invited_count", -1).limit(limit).to_list(limit)
    return {"leaders": leaders}


async def seed_demo_data():
    now = datetime.now(timezone.utc)
    if await db.draw_codes.count_documents({}) == 0:
        codes = [
            {"code": "CODE2026110801", "user_id": "guest", "status": "unused", "created_at": (now - timedelta(days=2)).isoformat(), "expires_at": (now + timedelta(days=5)).isoformat(), "wallet": "0x8f3cf7a2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"},
            {"code": "CODE2026102002", "user_id": "guest", "status": "used", "created_at": (now - timedelta(days=18)).isoformat(), "expires_at": (now - timedelta(days=11)).isoformat(), "used_at": (now - timedelta(days=18)).isoformat(), "wallet": "0x8f3cf7a2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"},
            {"code": "CODE2026091501", "user_id": "guest", "status": "expired", "created_at": (now - timedelta(days=53)).isoformat(), "expires_at": (now - timedelta(days=46)).isoformat(), "wallet": "0x8f3cf7a2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"},
        ]
        await db.draw_codes.insert_many(codes)
    if await db.winners.count_documents({}) == 0:
        winners = [
            {"wallet": "0x8f3cf7a2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", "amount": 1000, "coupon_code": "LC20261108001", "status": "pending", "created_at": (now - timedelta(hours=2)).isoformat()},
            {"wallet": "0x2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b", "amount": 200, "coupon_code": "LC20261107002", "status": "redeemed", "created_at": (now - timedelta(hours=5)).isoformat()},
            {"wallet": "0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d", "amount": 50, "coupon_code": "LC20261106003", "status": "redeemed", "created_at": (now - timedelta(days=1)).isoformat()},
            {"wallet": "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c", "amount": 5000, "coupon_code": "LC20261105004", "status": "redeemed", "created_at": (now - timedelta(days=2)).isoformat()},
            {"wallet": "0xf1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e", "amount": 10, "coupon_code": "LC20261104005", "status": "expired", "created_at": (now - timedelta(days=3)).isoformat()},
        ]
        await db.winners.insert_many(winners)
    if await db.coupons.count_documents({}) == 0:
        coupons = [
            {"code": "LC20261108001", "user_id": "guest", "amount": 1000, "status": "pending", "created_at": (now - timedelta(hours=2)).isoformat(), "expires_at": (now + timedelta(days=5)).isoformat()},
            {"code": "LC20261025002", "user_id": "guest", "amount": 50, "status": "redeemed", "created_at": (now - timedelta(days=12)).isoformat(), "expires_at": (now - timedelta(days=5)).isoformat()},
            {"code": "LC20261010001", "user_id": "guest", "amount": 10, "status": "expired", "created_at": (now - timedelta(days=27)).isoformat(), "expires_at": (now - timedelta(days=20)).isoformat()},
        ]
        await db.coupons.insert_many(coupons)


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await seed_demo_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
