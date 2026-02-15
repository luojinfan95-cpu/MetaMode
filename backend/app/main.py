"""
CivHabit — FastAPI 入口
国策树习惯养成系统
"""
import os
from dotenv import load_dotenv

# 加载 .env 文件（API Key 等配置）
import pathlib
_env_path = pathlib.Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)
print(f"[CivHabit] Loaded .env from: {_env_path} (exists={_env_path.exists()})")
print(f"[CivHabit] DEEPSEEK_API_KEY={'SET (' + os.getenv('DEEPSEEK_API_KEY', '')[:8] + '...)' if os.getenv('DEEPSEEK_API_KEY') else 'NOT SET'}")

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from . import models, crud, schemas
from .routers import goals, tree, checkin, nodes

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivHabit API",
    description="国策树习惯养成系统 — AI 驱动的自律管理工具",
    version="0.1.0",
)

# CORS 中间件 — 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP: 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载路由
app.include_router(goals.router)
app.include_router(tree.router)
app.include_router(checkin.router)
app.include_router(nodes.router)


@app.get("/")
def root():
    return {
        "name": "CivHabit API",
        "version": "0.1.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/debug/env")
def debug_env():
    """调试端点：检查环境变量是否正确加载"""
    key = os.getenv("DEEPSEEK_API_KEY", "")
    return {
        "env_file": str(_env_path),
        "env_exists": _env_path.exists(),
        "api_key_set": bool(key),
        "api_key_prefix": key[:8] + "..." if key else "EMPTY",
        "base_url": os.getenv("DEEPSEEK_BASE_URL", "NOT SET"),
    }


@app.get("/api/v1/settings", response_model=schemas.UserSettings)
def get_settings(db: Session = Depends(get_db)):
    """获取用户 API 设置"""
    user = crud.get_or_create_default_user(db)
    settings = user.settings or {}
    return schemas.UserSettings(
        api_key=settings.get("api_key", ""),
        base_url=settings.get("base_url", "https://api.deepseek.com"),
    )


@app.put("/api/v1/settings", response_model=schemas.UserSettings)
def update_settings(req: schemas.UserSettingsUpdate, db: Session = Depends(get_db)):
    """更新用户 API 设置"""
    user = crud.get_or_create_default_user(db)
    update_data = {}
    if req.api_key is not None:
        update_data["api_key"] = req.api_key
    if req.base_url is not None:
        update_data["base_url"] = req.base_url

    user = crud.update_user_settings(db, user.id, update_data)
    settings = user.settings or {}
    return schemas.UserSettings(
        api_key=settings.get("api_key", ""),
        base_url=settings.get("base_url", "https://api.deepseek.com"),
    )
