/**
 * API 客户端 — Axios 封装
 * 代理到 http://localhost:8000
 */
import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

// ── Goals ──
export const generateGoal = (title, description = '') =>
    api.post('/goal/generate', { title, description });

export const listGoals = () =>
    api.get('/goals');

// ── Tree ──
export const getTree = (goalId) =>
    api.get(`/tree/${goalId}`);

// ── Check-in ──
export const checkin = (nodeId, status, note = '') =>
    api.post('/checkin', { node_id: nodeId, status, note });

// ── Nodes ──
export const activateNode = (nodeId) =>
    api.post(`/node/${nodeId}/activate`);

export const addChildNode = (parentNodeId, data = {}) =>
    api.post('/node/add_child', { parent_node_id: parentNodeId, ...data });

export const getActiveNodes = () =>
    api.get('/nodes/active');

// ── Settings ──
export const getSettings = () =>
    api.get('/settings');

export const updateSettings = (data) =>
    api.put('/settings', data);

export default api;
