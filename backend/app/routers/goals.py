"""
目标相关路由
POST /api/v1/goal/generate — 创建目标并生成国策树
GET  /api/v1/goals — 获取所有目标
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas, models
from ..ai_service import TreeGenerator

router = APIRouter(prefix="/api/v1", tags=["goals"])


def _flatten_tree_nodes(
    db: Session,
    goal_id: str,
    nodes_data: list,
    parent_id: str = None,
):
    """递归展开嵌套树结构并入库"""
    for node_data in nodes_data:
        node = crud.create_focus_node(
            db=db,
            goal_id=goal_id,
            title=node_data.get("title", "未命名"),
            parent_id=parent_id,
            description=node_data.get("description", ""),
            action_type=node_data.get("type", "ACTION"),
            difficulty=node_data.get("difficulty", 1),
            required_streak=3,
            # 根节点默认 AVAILABLE，子节点 LOCKED
            status="AVAILABLE" if parent_id is None else "LOCKED",
            config={
                "rationale": node_data.get("rationale", ""),
            },
        )
        # 递归处理子节点
        children = node_data.get("children", [])
        if children:
            _flatten_tree_nodes(db, goal_id, children, parent_id=node.id)


@router.post("/goal/generate", response_model=schemas.GoalResponse)
def generate_goal(req: schemas.GoalCreate, db: Session = Depends(get_db)):
    """输入目标 → AI 生成国策树 → 存入数据库"""
    import logging
    logger = logging.getLogger("goals")

    # 获取/创建默认用户
    user = crud.get_or_create_default_user(db)
    user_id = req.user_id or user.id

    # 创建目标
    goal = crud.create_goal(db, user_id=user_id, title=req.title, description=req.description)

    # AI 生成树结构
    settings = user.settings or {}
    api_key = settings.get("api_key", "") or os.getenv("DEEPSEEK_API_KEY", "")
    base_url = settings.get("base_url", "") or os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")

    logger.warning(f"[CivHabit] API Key resolved: {'YES (' + api_key[:8] + '...)' if api_key else 'EMPTY (will use Mock)'}")
    logger.warning(f"[CivHabit] Base URL: {base_url}")

    generator = TreeGenerator(
        api_key=api_key,
        base_url=base_url,
    )

    logger.warning(f"[CivHabit] is_mock={generator.is_mock}, generating tree for: {req.title}")
    tree_data = generator.generate(req.title, req.description)
    logger.warning(f"[CivHabit] Generated {len(tree_data)} root nodes: {[n.get('title','?') for n in tree_data]}")

    # 递归入库
    _flatten_tree_nodes(db, goal.id, tree_data)

    return goal


@router.get("/goals", response_model=List[schemas.GoalResponse])
def list_goals(db: Session = Depends(get_db)):
    """获取所有目标"""
    user = crud.get_or_create_default_user(db)
    return crud.get_goals_by_user(db, user.id)
