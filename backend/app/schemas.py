"""
Pydantic 请求/响应模型
"""
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date


# ─────────────────── Goal ───────────────────

class GoalCreate(BaseModel):
    title: str
    description: str = ""
    user_id: Optional[str] = None  # MVP: 不传则使用默认用户


class GoalResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────── FocusNode ───────────────────

class FocusNodeResponse(BaseModel):
    id: str
    goal_id: str
    parent_id: Optional[str] = None
    title: str
    description: str
    action_type: str
    difficulty: int
    required_streak: int
    current_streak: int
    status: str
    config: dict = {}

    model_config = {"from_attributes": True}


class AddChildRequest(BaseModel):
    parent_node_id: str
    title: Optional[str] = None  # 如果不填，AI 自动生成
    action_type: str = "ACTION"
    difficulty: int = 1


# ─────────────────── Check-in ───────────────────

class CheckinRequest(BaseModel):
    node_id: str
    status: bool  # True=成功, False=失败
    note: str = ""


class AffectedNode(BaseModel):
    id: str
    title: str
    old_status: str
    new_status: str


class CheckinResponse(BaseModel):
    node_id: str
    new_node_status: str
    current_streak: int
    affected_children: List[AffectedNode] = []
    ai_feedback: str = ""


# ─────────────────── Tree ───────────────────

class TreeEdge(BaseModel):
    source: str
    target: str


class TreeResponse(BaseModel):
    goal: GoalResponse
    nodes: List[FocusNodeResponse]
    edges: List[TreeEdge]


# ─────────────────── DailyLog ───────────────────

class DailyLogResponse(BaseModel):
    id: str
    node_id: str
    date: date
    status: bool
    user_note: str
    ai_feedback: str

    model_config = {"from_attributes": True}


# ─────────────────── Settings ───────────────────

class UserSettings(BaseModel):
    api_key: str = ""
    base_url: str = "https://api.deepseek.com"

class UserSettingsUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
