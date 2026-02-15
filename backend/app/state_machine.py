"""
状态机 & 崩塌逻辑 (State Machine & Collapse)
核心惩罚机制：父节点失败 → 递归崩塌所有子节点
"""
from typing import List, Tuple
from sqlalchemy.orm import Session
from . import models, crud, schemas


def process_checkin(
    db: Session,
    node_id: str,
    success: bool,
) -> Tuple[models.FocusNode, List[schemas.AffectedNode]]:
    """
    处理每日打卡，返回 (更新后的节点, 受影响的子节点列表)

    成功路径:
      streak+1 → 达标后 status=ACTIVE → 解锁子节点

    失败路径:
      streak=0 → status=BROKEN → 递归崩塌所有后代
    """
    node = crud.get_node(db, node_id)
    if not node:
        raise ValueError(f"节点不存在: {node_id}")

    if node.status not in (models.NodeStatus.IN_PROGRESS, models.NodeStatus.ACTIVE):
        raise ValueError(f"节点状态 {node.status.value} 不允许打卡")

    affected: List[schemas.AffectedNode] = []

    if success:
        _handle_success(db, node, affected)
    else:
        _handle_failure(db, node, affected)

    db.commit()
    db.refresh(node)
    return node, affected


def _handle_success(
    db: Session,
    node: models.FocusNode,
    affected: List[schemas.AffectedNode],
):
    """成功打卡逻辑"""
    node.current_streak += 1

    # 达到所需连续天数 → 激活
    if node.status == models.NodeStatus.IN_PROGRESS and \
       node.current_streak >= node.required_streak:
        node.status = models.NodeStatus.ACTIVE
        # 解锁所有直接子节点: LOCKED → AVAILABLE
        _unlock_children(db, node.id, affected)


def _handle_failure(
    db: Session,
    node: models.FocusNode,
    affected: List[schemas.AffectedNode],
):
    """失败打卡 → 崩塌逻辑"""
    old_status = node.status.value
    node.current_streak = 0
    node.status = models.NodeStatus.BROKEN

    # 递归崩塌：所有后代节点设为 LOCKED
    _recursive_collapse(db, node.id, affected)


def _unlock_children(
    db: Session,
    parent_id: str,
    affected: List[schemas.AffectedNode],
):
    """将父节点的直接子节点从 LOCKED 解锁为 AVAILABLE"""
    children = crud.get_children(db, parent_id)
    for child in children:
        if child.status == models.NodeStatus.LOCKED:
            old = child.status.value
            child.status = models.NodeStatus.AVAILABLE
            affected.append(schemas.AffectedNode(
                id=child.id,
                title=child.title,
                old_status=old,
                new_status=child.status.value,
            ))


def _recursive_collapse(
    db: Session,
    parent_id: str,
    affected: List[schemas.AffectedNode],
):
    """递归崩塌：将所有后代节点设为 LOCKED，streak 归零"""
    children = crud.get_children(db, parent_id)
    for child in children:
        if child.status not in (models.NodeStatus.LOCKED,):
            old = child.status.value
            child.status = models.NodeStatus.LOCKED
            child.current_streak = 0
            affected.append(schemas.AffectedNode(
                id=child.id,
                title=child.title,
                old_status=old,
                new_status=child.status.value,
            ))
        # 继续递归
        _recursive_collapse(db, child.id, affected)


def activate_node(db: Session, node_id: str) -> models.FocusNode:
    """
    用户手动开始一个 AVAILABLE 节点 → IN_PROGRESS
    """
    node = crud.get_node(db, node_id)
    if not node:
        raise ValueError(f"节点不存在: {node_id}")

    if node.status != models.NodeStatus.AVAILABLE:
        raise ValueError(f"只有 AVAILABLE 状态的节点才能开始研究，当前: {node.status.value}")

    node.status = models.NodeStatus.IN_PROGRESS
    node.current_streak = 0
    db.commit()
    db.refresh(node)
    return node
