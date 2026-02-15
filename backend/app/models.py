"""
ORM 数据模型 — 严格按照需求文档 Section 3 定义
User / Goal / FocusNode / DailyLog
"""
import uuid
import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, String, Text, Integer, Boolean, Date, DateTime,
    ForeignKey, Enum, JSON,
)
from sqlalchemy.orm import relationship

from .database import Base


# ─────────────────────────── 枚举类型 ───────────────────────────

class GoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class NodeStatus(str, enum.Enum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    ACTIVE = "ACTIVE"
    BROKEN = "BROKEN"


class ActionType(str, enum.Enum):
    AVOIDANCE = "AVOIDANCE"  # 不做某事
    ACTION = "ACTION"        # 做某事


# ─────────────────────────── 辅助函数 ───────────────────────────

def generate_uuid() -> str:
    return str(uuid.uuid4())


# ─────────────────────────── User ───────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(100), nullable=False, default="default_user")
    created_at = Column(DateTime, default=datetime.utcnow)
    settings = Column(JSON, default=dict)  # API Key, Base URL, 偏好

    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")


# ─────────────────────────── Goal ───────────────────────────

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(Enum(GoalStatus), default=GoalStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="goals")
    focus_nodes = relationship("FocusNode", back_populates="goal", cascade="all, delete-orphan")


# ─────────────────────────── FocusNode (核心) ───────────────────────────

class FocusNode(Base):
    __tablename__ = "focus_nodes"

    id = Column(String, primary_key=True, default=generate_uuid)
    goal_id = Column(String, ForeignKey("goals.id"), nullable=False)
    parent_id = Column(String, ForeignKey("focus_nodes.id"), nullable=True)  # 根节点无父级

    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    action_type = Column(Enum(ActionType), default=ActionType.ACTION)
    difficulty = Column(Integer, default=1)  # 1-5
    required_streak = Column(Integer, default=3)  # 解锁下一级所需连续天数
    current_streak = Column(Integer, default=0)
    status = Column(Enum(NodeStatus), default=NodeStatus.LOCKED)
    config = Column(JSON, default=dict)  # AI 生成的建议

    created_at = Column(DateTime, default=datetime.utcnow)

    goal = relationship("Goal", back_populates="focus_nodes")
    parent = relationship("FocusNode", remote_side=[id], backref="children")
    daily_logs = relationship("DailyLog", back_populates="node", cascade="all, delete-orphan")


# ─────────────────────────── DailyLog ───────────────────────────

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    node_id = Column(String, ForeignKey("focus_nodes.id"), nullable=False)
    date = Column(Date, default=date.today)
    status = Column(Boolean, nullable=False)  # True=成功, False=失败
    user_note = Column(Text, default="")
    ai_feedback = Column(Text, default="")

    node = relationship("FocusNode", back_populates="daily_logs")
