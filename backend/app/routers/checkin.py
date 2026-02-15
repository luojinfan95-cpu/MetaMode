"""
每日打卡路由
POST /api/v1/checkin — 提交今日打卡结果
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas
from ..state_machine import process_checkin

router = APIRouter(prefix="/api/v1", tags=["checkin"])


@router.post("/checkin", response_model=schemas.CheckinResponse)
def checkin(req: schemas.CheckinRequest, db: Session = Depends(get_db)):
    """
    提交打卡
    Body: { node_id, status (bool), note }
    Response: { new_node_status, current_streak, affected_children }
    """
    try:
        node, affected = process_checkin(db, req.node_id, req.status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 记录日志
    crud.create_daily_log(
        db=db,
        node_id=req.node_id,
        status=req.status,
        user_note=req.note,
        ai_feedback="继续保持！" if req.status else "没关系，明天重新开始。",
    )

    return schemas.CheckinResponse(
        node_id=node.id,
        new_node_status=node.status.value,
        current_streak=node.current_streak,
        affected_children=affected,
        ai_feedback="✅ 干得好！保持势头！" if req.status else "⚠️ 链条断裂。别气馁，重新激活这个节点即可。",
    )
