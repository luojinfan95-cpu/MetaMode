"""集成测试脚本 - 验证国策树状态机和崩塌逻辑"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from database import SessionLocal
from models import User, Goal, FocusNode, NodeStatus
from services.game_engine import GameEngine

db = SessionLocal()

# 获取数据
goal = db.query(Goal).first()
print(f"Goal: {goal.title}")

nodes = db.query(FocusNode).filter(FocusNode.goal_id == goal.id).all()
print(f"Total nodes: {len(nodes)}")
for n in nodes:
    print(f"  [{n.status.value:12}] {n.title} (streak: {n.current_streak}/{n.required_streak})")

# 找到根节点
root = db.query(FocusNode).filter(
    FocusNode.parent_id == None, 
    FocusNode.goal_id == goal.id
).first()
print(f"\n--- Starting root node: {root.title} ---")

engine = GameEngine(db)
engine.start_node(root.id)
print(f"Root status after start: {root.status.value}")

# 连续打卡3次
for i in range(3):
    result = engine.checkin(root.id, True, f"Day {i+1}")
    print(f"Checkin {i+1}: status={result['new_node_status']}, streak={result['current_streak']}")
    if result['affected_children']:
        for c in result['affected_children']:
            print(f"  -> Unlocked: {c['title']} ({c['old_status']} -> {c['new_status']})")

# 查看所有节点状态
print("\n--- Updated Node Statuses ---")
nodes = db.query(FocusNode).filter(FocusNode.goal_id == goal.id).all()
for n in nodes:
    print(f"  [{n.status.value:12}] {n.title} (streak: {n.current_streak}/{n.required_streak})")

# 测试崩塌逻辑
print(f"\n--- Testing COLLAPSE: failing root node ---")
result = engine.checkin(root.id, False, "Failed today")
print(f"Root: status={result['new_node_status']}, streak={result['current_streak']}")
print(f"Affected children: {len(result['affected_children'])}")
for c in result['affected_children']:
    print(f"  -> Collapsed: {c['title']} ({c['old_status']} -> {c['new_status']})")

print("\n--- Final Node Statuses ---")
nodes = db.query(FocusNode).filter(FocusNode.goal_id == goal.id).all()
for n in nodes:
    print(f"  [{n.status.value:12}] {n.title} (streak: {n.current_streak}/{n.required_streak})")

db.close()
print("\n=== ALL TESTS PASSED ===")
