"""
国策树查询路由
GET /api/v1/tree/{goal_id} — 获取完整树结构（节点+边）
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/v1", tags=["tree"])


@router.get("/tree/{goal_id}", response_model=schemas.TreeResponse)
def get_tree(goal_id: str, db: Session = Depends(get_db)):
    """获取完整的树结构 JSON（前端渲染 React Flow 用）"""
    goal = crud.get_goal(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="目标不存在")

    nodes = crud.get_nodes_by_goal(db, goal_id)

    # 构建边列表（parent → child）
    edges = []
    for node in nodes:
        if node.parent_id:
            edges.append(schemas.TreeEdge(source=node.parent_id, target=node.id))

    return schemas.TreeResponse(
        goal=schemas.GoalResponse.model_validate(goal),
        nodes=[schemas.FocusNodeResponse.model_validate(n) for n in nodes],
        edges=edges,
    )
