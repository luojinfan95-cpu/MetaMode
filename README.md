# 智律 AI (AI Self-Discipline Assistant) - 项目需求文档 (PRD)

## 1. 项目愿景 (Project Vision)
本项目旨在开发一款基于 **人工智能 (Artificial Intelligence)** 的个人自律与任务管理应用。区别于传统的清单式 (To-Do List) 软件，本应用利用 **大语言模型 (LLM - Large Language Model)** 的理解能力，将用户输入的碎片化、无序的任务自动转化为结构化、可视化的执行方案，并通过用户的每日反馈不断迭代优化，成为更懂用户的智能规划助手。

> **Key Term Explanation:**
> * **LLM (Large Language Model):** 大语言模型。一种经过海量文本训练的AI模型（如 GPT-4, Gemini），具备理解自然语言、生成文本和推理的能力。在这里，它充当应用的“大脑”，负责理解用户的任务描述。

---

## 2. 核心功能 (Core Features)

### 2.1 智能任务结构化 (Intelligent Task Structuring)
用户无需手动分类，只需在输入框中输入自然语言描述的一系列繁琐任务。
* **功能描述：** 程序通过调用 **API (Application Programming Interface)** 将文本发送给 AI，AI 自动分析语义，识别任务之间的关联性。
* **示例：**
    * **输入：** “我要写数学卷子，数学作业，英语预习，还要整理一下物理笔记。”
    * **输出：** 系统自动识别出“数学”、“英语”、“物理”三个父级类别，并将具体任务归类到对应分支下。

> **Key Term Explanation:**
> * **API (Application Programming Interface):** 应用程序编程接口。这里指你的APP与AI模型（如OpenAI或Google Gemini）之间沟通的桥梁。你的APP通过API发送请求（用户的任务），AI处理后通过API返回结果（分类好的数据）。
> * **Natural Language Processing (NLP):** 自然语言处理。指AI理解人类日常语言（如“我要写...”）的技术，而非要求用户输入特定的指令代码。

### 2.2 树状可视化视图 (Tree-Structured Visualization)
* **功能描述：** 摒弃传统的列表视图，采用 **树状结构 (Tree Structure)** 展示任务。
* **可视化逻辑：**
    * **根节点 (Root):** 今日计划 (Today's Plan)
    * **父节点 (Parent Node):** 学科或大类（如：数学、英语、健身）
    * **子节点 (Child Node):** 具体执行项（如：代数习题、单词背诵）
* **价值：** 帮助用户从宏观视角俯瞰当日任务，理清层级关系，减轻面对大量任务时的心理压力。

### 2.3 智能时间规划 (Smart Scheduling)
* **功能描述：** AI 不仅分类任务，还会根据任务的难度和描述，预估所需时间，并生成时间表。
* **逻辑：** 结合用户的可用时间段，自动将“树枝”填入时间轴，生成一份可执行的日程表。

### 2.4 个性化反馈闭环 (Personalized Feedback Loop)
这是一个基于 **强化学习 (Reinforcement Learning)** 思想的功能，旨在让系统越用越聪明。
* **交互流程：**
    1.  用户在一天结束时，在特定区域输入 **复盘 (Reflection/Review)** 或感受（例如：“今天的数学计划太满了，做不完，很挫败” 或 “英语背单词的时间安排得很合适”）。
    2.  系统通过 **RAG (Retrieval-Augmented Generation)** 或上下文记忆技术，记录这些反馈。
    3.  **动态调整：** 在制定下一天的计划时，AI 会检索历史反馈。如果用户曾抱怨“数学太满”，下次规划时它会自动留出更多缓冲时间或减少任务量。

> **Key Term Explanation:**
> * **Feedback Loop (反馈闭环):** 指“输出-反馈-调整-再输出”的循环过程。在这里指：AI出计划 -> 用户执行并评价 -> AI根据评价优化 -> AI出更好的计划。
> * **Context (上下文):** 在AI对话中，指之前的聊天记录或背景信息。为了让APP“记住”用户的习惯，需要合理管理上下文，让AI知道用户之前的偏好。

---

## 3. 用户流程 (User Flow)

1.  **Input (输入):** 用户打开APP，语音或打字输入：“今天好多事，要做高数第三章，复习线代，还要背雅思单词，晚上想跑个步。”
2.  **Process (处理):**
    * APP 调用后端 API。
    * AI 解析文本 -> 提取实体 (高数, 线代, 雅思, 跑步) -> 生成 JSON 格式的结构化数据。
3.  **Render (渲染):** 前端将 JSON 数据转化为思维导图或树状图。
4.  **Action (执行):** 用户按照规划完成任务，勾选完成。
5.  **Feedback (反馈):** 晚间，用户输入：“高数比想象中难，花了双倍时间。”
6.  **Optimization (优化):** 数据库记录此偏好（User Preference），明日规划时自动增加高数类任务的预估时长。

---

## 4. 技术栈建议 (Suggested Tech Stack)

* **后端 (Backend):** Python (Flask 或 FastAPI)
    * *理由：* Python 是 AI 开发的首选语言，能够极快地对接 LLM API。
* **AI 接口 (AI Provider):** Gemini API 或 OpenAI API
    * *理由：* 具备强大的指令遵循能力，适合处理复杂的分类和规划任务。
* **前端 (Frontend):** React Native 或 Flutter (跨平台) 或 简单的 Web 前端 (Vue/React)
    * *理由：* 需要良好的可视化组件库来实现“树状结构”的绘制。
* **数据存储 (Database):** SQLite 或 MongoDB
    * *理由：* 存储用户的历史反馈和偏好设置 (JSON 文档型数据库 MongoDB 非常适合存储非结构化的反馈数据)。

---

## 5. 项目亮点 (Key Highlights)

* **从无序到有序 (Order from Chaos):** 解决大学生面对繁杂学业无从下手的痛点。
* **成长型系统 (Growth System):** 系统随用户使用时间的增长而进化，体现“千人千面”的个性化算法。
* **直观可视化 (Intuitive Visualization):** 利用图形化界面降低认知负荷。