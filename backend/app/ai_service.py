"""
AI 集成服务 — TreeGenerator
支持 OpenAI / DeepSeek / 任何兼容 API
MVP 阶段提供 Mock 模式
"""
import json
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


# ─────────────────── Mock 数据 ───────────────────

MOCK_TREES = {
    "default": [
        {
            "title": "🌙 作息储备计划",
            "description": "建立稳定的睡眠基础，这是一切改变的根基",
            "type": "AVOIDANCE",
            "difficulty": 1,
            "rationale": "睡眠是恢复力的源泉。不带手机进卧室是最小阻力的改变。",
            "children": [
                {
                    "title": "📵 不带手机进卧室",
                    "description": "每晚睡前将手机放在卧室外充电",
                    "type": "AVOIDANCE",
                    "difficulty": 1,
                    "rationale": "消除睡前刷手机的触发条件",
                    "children": [
                        {
                            "title": "⏰ 固定起床时间",
                            "description": "每天 7:00 起床，周末也不例外",
                            "type": "ACTION",
                            "difficulty": 2,
                            "rationale": "固定起床时间比固定入睡时间更容易建立",
                            "children": []
                        },
                        {
                            "title": "🧘 睡前冥想5分钟",
                            "description": "躺在床上做5分钟呼吸冥想",
                            "type": "ACTION",
                            "difficulty": 1,
                            "rationale": "替代手机的睡前活动",
                            "children": []
                        }
                    ]
                },
                {
                    "title": "🚫 晚9点后不摄入咖啡因",
                    "description": "避免咖啡、茶、可乐等含咖啡因饮品",
                    "type": "AVOIDANCE",
                    "difficulty": 1,
                    "rationale": "咖啡因半衰期约5-6小时，晚间摄入严重影响睡眠质量",
                    "children": [
                        {
                            "title": "💧 用温水替代晚间饮品",
                            "description": "晚餐后只喝温水或花草茶",
                            "type": "ACTION",
                            "difficulty": 1,
                            "rationale": "建立替代行为比单纯禁止更有效",
                            "children": []
                        }
                    ]
                }
            ]
        },
        {
            "title": "🏃 运动启动协议",
            "description": "从零开始建立运动习惯",
            "type": "ACTION",
            "difficulty": 1,
            "rationale": "运动是减重的加速器，但必须从极低门槛开始",
            "children": [
                {
                    "title": "👟 每天穿运动鞋出门",
                    "description": "不管运不运动，先穿上运动鞋走出家门",
                    "type": "ACTION",
                    "difficulty": 1,
                    "rationale": "降低启动阻力到几乎为零——穿鞋就是胜利",
                    "children": [
                        {
                            "title": "🚶 饭后散步15分钟",
                            "description": "午餐或晚餐后散步15分钟",
                            "type": "ACTION",
                            "difficulty": 2,
                            "rationale": "已有穿鞋习惯后，散步是自然的延伸",
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
}


class TreeGenerator:
    """
    AI 国策树生成器
    支持 Mock 模式（默认）和真实 API 调用
    """

    SYSTEM_PROMPT = """你是一个习惯养成架构师。请将用户的目标拆解为一棵"国策树"。

规则：
1. Root Nodes (根节点)：必须是极易执行的微小改变，最好是"不做什么"（AVOIDANCE 类型）
2. Child Nodes (子节点)：基于父节点的稳态，进一步施加的微小压力
3. 每个节点的难度应循序渐进（difficulty 1-5）
4. 每个节点都需要提供 rationale（科学原理或心理学依据）

返回 JSON 格式（数组，每个元素代表一个根节点）：
[
  {
    "title": "带有emoji的标题",
    "description": "详细描述",
    "type": "AVOIDANCE 或 ACTION",
    "difficulty": 1-5,
    "rationale": "为什么这样设计",
    "children": [ ... 递归子节点 ... ]
  }
]

只返回 JSON，不要其他文字。"""

    def __init__(self, api_key: str = "", base_url: str = ""):
        self.api_key = api_key
        self.base_url = base_url
        self._client = None

    @property
    def is_mock(self) -> bool:
        return not self.api_key

    def _get_client(self):
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url or "https://api.deepseek.com",
                )
            except ImportError:
                logger.warning("openai 包未安装，使用 Mock 模式")
                return None
        return self._client

    def generate(self, goal_title: str, goal_description: str = "") -> List[Dict]:
        """
        生成国策树结构
        返回嵌套字典列表
        """
        if self.is_mock:
            logger.info("使用 Mock 模式生成国策树")
            return MOCK_TREES["default"]

        return self._call_api(goal_title, goal_description)

    def _call_api(self, goal_title: str, goal_description: str) -> List[Dict]:
        """调用真实 AI API"""
        client = self._get_client()
        if not client:
            logger.warning("[CivHabit AI] 无法创建 OpenAI 客户端，回退 Mock")
            return MOCK_TREES["default"]

        try:
            user_prompt = f"我的目标是：{goal_title}"
            if goal_description:
                user_prompt += f"\n详细说明：{goal_description}"

            logger.warning(f"[CivHabit AI] 正在调用 API: model=deepseek-chat, goal={goal_title}")

            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
            )

            content = response.choices[0].message.content
            logger.warning(f"[CivHabit AI] API 原始返回 ({len(content)} chars): {content[:200]}...")

            # 清理可能包含的 markdown 代码块标记
            cleaned = content.strip()
            if cleaned.startswith("```"):
                # 移除 ```json 或 ``` 开头和结尾
                lines = cleaned.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                cleaned = "\n".join(lines)

            result = json.loads(cleaned)

            # 兼容两种返回格式
            if isinstance(result, dict) and "nodes" in result:
                return result["nodes"]
            elif isinstance(result, dict) and "tree" in result:
                return result["tree"]
            elif isinstance(result, list):
                return result
            else:
                # 尝试提取任何列表值
                for v in result.values():
                    if isinstance(v, list):
                        return v
                logger.warning(f"[CivHabit AI] AI 返回格式异常: {type(result)}, keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}")
                return MOCK_TREES["default"]

        except json.JSONDecodeError as e:
            logger.error(f"[CivHabit AI] JSON 解析失败: {e}\n原始内容: {content[:500]}")
            return MOCK_TREES["default"]
        except Exception as e:
            logger.error(f"[CivHabit AI] API 调用失败: {type(e).__name__}: {e}", exc_info=True)
            return MOCK_TREES["default"]
