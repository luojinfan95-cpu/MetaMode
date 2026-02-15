/**
 * CivHabit API 客户端
 * 与后端 app/ 包结构对齐
 * 通过 Vite 代理 /api → http://localhost:8000
 */
const API_BASE = '/api/v1';

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(error.detail || '请求失败');
    }
    return res.json();
}

// ─── 目标 ───────────────────────────────────────────────
export const generateGoal = (title, description = '') =>
    request('/goal/generate', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
    });

export const getUserGoals = () => request('/goals');

// ─── 国策树 ─────────────────────────────────────────────
export const getTree = (goalId) => request(`/tree/${goalId}`);

// ─── 打卡 ───────────────────────────────────────────────
export const checkin = (nodeId, status, note = '') =>
    request('/checkin', {
        method: 'POST',
        body: JSON.stringify({ node_id: nodeId, status, note }),
    });

// ─── 节点操作 ────────────────────────────────────────────
export const activateNode = (nodeId) =>
    request(`/node/${nodeId}/activate`, { method: 'POST' });

export const addChildNode = (parentNodeId, title, actionType = 'ACTION', difficulty = 1) =>
    request('/node/add_child', {
        method: 'POST',
        body: JSON.stringify({
            parent_node_id: parentNodeId,
            title,
            action_type: actionType,
            difficulty,
        }),
    });

export const getActiveNodes = () => request('/nodes/active');

// ─── 设置 ───────────────────────────────────────────────
export const getSettings = () => request('/settings');

export const updateSettings = (apiKey, baseUrl) =>
    request('/settings', {
        method: 'PUT',
        body: JSON.stringify({ api_key: apiKey, base_url: baseUrl }),
    });
