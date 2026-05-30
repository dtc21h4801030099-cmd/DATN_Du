import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.database import engine, Base
import app.models  # noqa: F401 — registers all models before create_all
from app.routers import auth, users, universities, majors, posts, chatbot, faq, registrations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("duta")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DUTA - Nền tảng Tư vấn & Tuyển sinh Đại học",
    description="API cho hệ thống tư vấn và tuyển sinh tích hợp AI Chatbot",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = round((time.time() - start) * 1000)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms}ms)")
    return response


import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(universities.router, prefix="/api")
app.include_router(majors.router, prefix="/api")
app.include_router(posts.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(faq.router, prefix="/api")
app.include_router(registrations.router, prefix="/api")


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "DUTA API đang chạy", "docs": "/docs"}
