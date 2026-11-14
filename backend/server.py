import asyncio
import random
import string
import csv
import io
from contextlib import suppress
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Query, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware
import jwt
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

PRIZES = [8888, 1888, 588, 58, 18, 8]
PRIZE_WEIGHTS = [1, 3, 8, 20, 30, 38]
TOTAL_POOL = 1_000_000

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_admin_token() -> str:
    payload = {"sub": "admin", "role": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="未登录")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="无权限")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="登录已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效凭证")


class AdminLogin(BaseModel):
    password: str


@api_router.post("/admin/login")
async def admin_login(body: AdminLogin):
    if body.password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(status_code=401, detail="密码错误")
    return {"token": create_admin_token()}


def make_csv(rows, headers):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(headers)
    for r in rows:
        w.writerow(r)
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})


def gen_code(prefix: str) -> str:
    return prefix + "".join(random.choices(string.digits, k=10))


class DrawCodeValidate(BaseModel):
    code: str


# ---------- Admin settings ----------


class SettingsUpdate(BaseModel):
    total_pool: int | None = None
    activity_title: str | None = None
    activity_active: bool | None = None


@api_router.get("/admin/settings")
async def admin_get_settings(_=Depends(require_admin)):
    s = await db.settings.find_one({"_id": "main"})
    if not s:
        s = {"_id": "main", "total_pool": TOTAL_POOL, "activity_title": "GSET 机构 RWA 幸运抽奖", "activity_active": True}
        await db.settings.insert_one(s)
    return {k: v for k, v in s.items() if k != "_id"}


@api_router.post("/admin/settings")
async def admin_update_settings(body: SettingsUpdate, _=Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.settings.update_one({"_id": "main"}, {"$set": update}, upsert=True)
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(_=Depends(require_admin)):
    total_codes = await db.draw_codes.count_documents({})
    used_codes = await db.draw_codes.count_documents({"status": "used"})
    total_wins = await db.winners.count_documents({})
    submitted = await db.winners.count_documents({"status": "submitted"})
    paid = await db.winners.count_documents({"status": "paid"})
    total_amount = await db.winners.aggregate([{"$group": {"_id": None, "t": {"$sum": "$amount"}}}]).to_list(1)
    paid_amount = await db.winners.aggregate([{"$match": {"status": "paid"}}, {"$group": {"_id": None, "t": {"$sum": "$amount"}}}]).to_list(1)
    settings = await db.settings.find_one({"_id": "main"})
    total_pool = (settings or {}).get("total_pool", TOTAL_POOL)
    return {
        "total_codes": total_codes,
        "used_codes": used_codes,
        "unused_codes": total_codes - used_codes,
        "total_wins": total_wins,
        "submitted": submitted,
        "paid": paid,
        "total_amount": total_amount[0]["t"] if total_amount else 0,
        "paid_amount": paid_amount[0]["t"] if paid_amount else 0,
        "total_pool": total_pool,
    }


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

    amount = doc.get("amount")
    if amount is None:
        amount = random.choices(PRIZES, weights=PRIZE_WEIGHTS, k=1)[0]
    wallet = doc.get("wallet", "0x" + "".join(random.choices("0123456789abcdef", k=40)))

    await db.draw_codes.update_one({"code": code}, {"$set": {"status": "used", "used_at": datetime.now(timezone.utc).isoformat()}})
    await db.winners.insert_one({
        "wallet": wallet,
        "amount": amount,
        "code": code,
        "status": "won",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return DrawResult(code=code, amount=amount, coupon_code="")


class RedeemSubmit(BaseModel):
    code: str
    account_id: str


@api_router.post("/draw/claim")
async def claim_prize(body: RedeemSubmit):
    code = body.code.strip().upper()
    account_id = body.account_id.strip()
    if not account_id:
        raise HTTPException(status_code=400, detail="请填写 GSET RWA 账户 ID")
    doc = await db.winners.find_one({"code": code}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=400, detail="未找到中奖记录")
    if doc["status"] != "won":
        raise HTTPException(status_code=400, detail="该奖励已提交领取")
    await db.winners.update_one({"code": code}, {"$set": {
        "status": "submitted", "account_id": account_id,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }})
    return {"ok": True, "message": "领取申请已提交，客服核验后发放 USDT"}


@api_router.get("/codes/my")
async def my_codes(user_id: str = Query("guest")):
    codes = await db.draw_codes.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    now = datetime.now(timezone.utc).isoformat()
    for c in codes:
        if c["status"] == "unused" and c.get("expires_at", "") < now:
            c["status"] = "expired"
    return {"codes": codes}


@api_router.get("/winners/recent")
async def recent_winners(limit: int = Query(20, ge=1, le=50)):
    # never expose draw codes / account IDs publicly: a code is all that /draw/claim needs
    winners = await db.winners.find({}, {"_id": 0, "code": 0, "account_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"winners": winners}


@api_router.get("/pool/stats")
async def pool_stats():
    total = await db.winners.aggregate([
        {"$match": {"status": "won"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    used = total[0]["total"] if total else 0
    return {"total_pool": TOTAL_POOL, "used": used, "remaining": TOTAL_POOL - used}


# ---------- Admin ----------


class BatchGen(BaseModel):
    amount: int
    count: int


@api_router.get("/admin/claims")
async def admin_claims(_=Depends(require_admin)):
    claims = await db.winners.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"claims": claims}


@api_router.post("/admin/claims/{code}/pay")
async def admin_pay(code: str, _=Depends(require_admin)):
    doc = await db.winners.find_one({"code": code.strip().upper()})
    if not doc:
        raise HTTPException(status_code=404, detail="未找到该记录")
    if doc["status"] != "submitted":
        raise HTTPException(status_code=400, detail="该记录不是待发放状态")
    await db.winners.update_one({"code": code.strip().upper()}, {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True}


@api_router.post("/admin/codes/batch")
async def admin_batch_gen(body: BatchGen, _=Depends(require_admin)):
    if body.amount not in PRIZES:
        raise HTTPException(status_code=400, detail="无效的金额档位")
    count = min(body.count, 200)
    now = datetime.now(timezone.utc)
    docs = []
    for _ in range(count):
        docs.append({
            "code": gen_code("CODE"),
            "user_id": "guest",
            "status": "unused",
            "amount": body.amount,
            "created_at": now.isoformat(),
            "expires_at": (now + timedelta(days=30)).isoformat(),
        })
    await db.draw_codes.insert_many(docs)
    return {"ok": True, "generated": count, "codes": [d["code"] for d in docs]}


@api_router.get("/admin/codes")
async def admin_codes(limit: int = Query(500, ge=1, le=1000), status: str | None = None, amount: int | None = None, _=Depends(require_admin)):
    q = {}
    if status:
        q["status"] = status
    if amount:
        q["amount"] = amount
    codes = await db.draw_codes.find(q, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"codes": codes}


@api_router.get("/admin/export/codes")
async def admin_export_codes(status: str | None = None, amount: int | None = None, _=Depends(require_admin)):
    q = {}
    if status:
        q["status"] = status
    if amount:
        q["amount"] = amount
    codes = await db.draw_codes.find(q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    rows = [[c["code"], c.get("amount", ""), {"unused": "未使用", "used": "已使用", "expired": "已失效"}.get(c["status"], c["status"]), c.get("created_at", "")] for c in codes]
    return make_csv(rows, ["抽奖码", "金额USDT", "状态", "创建时间"])


@api_router.get("/admin/export/claims")
async def admin_export_claims(status: str | None = None, _=Depends(require_admin)):
    q = {}
    if status:
        q["status"] = status
    claims = await db.winners.find(q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    rows = [[c["code"], c.get("amount", ""), {"won": "待领取", "submitted": "已提交", "paid": "已发放"}.get(c["status"], c["status"]), c.get("account_id", ""), c.get("created_at", ""), c.get("paid_at", "")] for c in claims]
    return make_csv(rows, ["抽奖码", "金额USDT", "状态", "收款ID", "中奖时间", "发放时间"])








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
            {"wallet": "0x8f3cf7a2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", "amount": 8888, "status": "won", "created_at": (now - timedelta(hours=2)).isoformat()},
            {"wallet": "0x2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b", "amount": 1888, "status": "won", "created_at": (now - timedelta(hours=5)).isoformat()},
            {"wallet": "0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d", "amount": 588, "status": "won", "created_at": (now - timedelta(days=1)).isoformat()},
            {"wallet": "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c", "amount": 58, "status": "won", "created_at": (now - timedelta(days=2)).isoformat()},
            {"wallet": "0xf1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e", "amount": 18, "status": "won", "created_at": (now - timedelta(days=3)).isoformat()},
        ]
        await db.winners.insert_many(winners)



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
