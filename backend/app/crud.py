"""
CRUD 操作 — 数据库增删查改
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from . import models


# ─────────────────── User ───────────────────

def get_or_create_default_user(db: Session) -> models.User:
    """获取或创建默认用户（MVP 简化版）"""
    user = db.query(models.User).first()
    if not user:
        user = models.User(username="default_user", settings={
            "api_key": "",
            "base_url": "https://api.deepseek.com",
        })
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user_settings(db: Session, user_id: str, settings: dict) -> models.User:
    user = get_user(db, user_id)
    if user:
        current = user.settings or {}
        current.update(settings)
        user.settings = current
        db.commit()
        db.refresh(user)
    return user


# ─────────────────── Goal ───────────────────

def create_goal(db: Session, user_id: str, title: str, description: str = "") -> models.Goal:
    goal = models.Goal(user_id=user_id, title=title, description=description)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goal(db: Session, goal_id: str) -> Optional[models.Goal]:
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()


def get_goals_by_user(db: Session, user_id: str) -> List[models.Goal]:
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()


# ─────────────────── FocusNode ───────────────────

def create_focus_node(
    db: Session,
    goal_id: str,
    title: str,
    parent_id: Optional[str] = None,
    description: str = "",
    action_type: str = "ACTION",
    difficulty: int = 1,
    required_streak: int = 3,
    status: str = "LOCKED",
    config: dict = None,
) -> models.FocusNode:
    node = models.FocusNode(
        goal_id=goal_id,
        parent_id=parent_id,
        title=title,
        description=description,
        action_type=models.ActionType(action_type),
        difficulty=difficulty,
        required_streak=required_streak,
        status=models.NodeStatus(status),
        config=config or {},
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


def get_nodes_by_goal(db: Session, goal_id: str) -> List[models.FocusNode]:
    return db.query(models.FocusNode).filter(models.FocusNode.goal_id == goal_id).all()


def get_node(db: Session, node_id: str) -> Optional[models.FocusNode]:
    return db.query(models.FocusNode).filter(models.FocusNode.id == node_id).first()


def get_children(db: Session, node_id: str) -> List[models.FocusNode]:
    return db.query(models.FocusNode).filter(models.FocusNode.parent_id == node_id).all()


def update_node_status(db: Session, node_id: str, status: str, streak: Optional[int] = None):
    node = get_node(db, node_id)
    if node:
        node.status = models.NodeStatus(status)
        if streak is not None:
            node.current_streak = streak
        db.commit()
        db.refresh(node)
    return node


# ─────────────────── DailyLog ───────────────────

def create_daily_log(
    db: Session,
    node_id: str,
    status: bool,
    user_note: str = "",
    ai_feedback: str = "",
) -> models.DailyLog:
    log = models.DailyLog(
        node_id=node_id,
        status=status,
        user_note=user_note,
        ai_feedback=ai_feedback,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
