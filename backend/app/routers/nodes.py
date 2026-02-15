"""
节点管理路由
POST /api/v1/node/add_child — 添加子节点
POST /api/v1/node/activate — 激活节点（AVAILABLE → IN_PROGRESS）
GET  /api/v1/node/active — 获取所有活跃/进行中节点（Dashboard 用）
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas, models
from ..state_machine import activate_node

router = APIRouter(prefix="/api/v1", tags=["nodes"])


@router.post("/node/add_child", response_model=schemas.FocusNodeResponse)
def add_child_node(req: schemas.AddChildRequest, db: Session = Depends(get_db)):
    """为某个 ACTIVE 节点增加新的子策略"""
    parent = crud.get_node(db, req.parent_node_id)
    if not parent:
        raise HTTPException(status_code=404, detail="父节点不存在")

    if parent.status != models.NodeStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail=f"只有 ACTIVE 状态的节点才能添加子节点，当前: {parent.status.value}",
        )

    node = crud.create_focus_node(
        db=db,
        goal_id=parent.goal_id,
        title=req.title or "AI 建议的新习惯",
        parent_id=parent.id,
        action_type=req.action_type,
        difficulty=req.difficulty,
        status="AVAILABLE",  # 父节点已 ACTIVE，子节点直接可用
    )
    return schemas.FocusNodeResponse.model_validate(node)


@router.post("/node/{node_id}/activate", response_model=schemas.FocusNodeResponse)
def activate(node_id: str, db: Session = Depends(get_db)):
    """用户开始研究一个 AVAILABLE 节点"""
    try:
        node = activate_node(db, node_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return schemas.FocusNodeResponse.model_validate(node)


@router.get("/nodes/active", response_model=List[schemas.FocusNodeResponse])
def get_active_nodes(db: Session = Depends(get_db)):
    """获取所有 IN_PROGRESS 和 ACTIVE 节点（Dashboard 用）"""
    nodes = db.query(models.FocusNode).filter(
        models.FocusNode.status.in_([
            models.NodeStatus.IN_PROGRESS,
            models.NodeStatus.ACTIVE,
        ])
    ).all()
    return [schemas.FocusNodeResponse.model_validate(n) for n in nodes]
