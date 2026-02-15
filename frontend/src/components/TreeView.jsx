/**
 * TreeView — React Flow 国策树拓扑视图
 * 自行从 URL 参数获取 goalId 并加载数据
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import FocusNodeComponent from './FocusNode';
import { getTree, activateNode, checkin } from '../api/client';

const nodeTypes = { focusNode: FocusNodeComponent };

/**
 * BFS 分层布局
 */
function layoutNodes(flatNodes, edges) {
    const childrenMap = {};
    flatNodes.forEach((n) => { childrenMap[n.id] = []; });
    edges.forEach((e) => {
        if (childrenMap[e.source]) childrenMap[e.source].push(e.target);
    });

    const targetSet = new Set(edges.map((e) => e.target));
    const roots = flatNodes.filter((n) => !targetSet.has(n.id));

    const levels = [];
    let queue = roots.map((r) => r.id);
    const visited = new Set();

    while (queue.length > 0) {
        levels.push([...queue]);
        queue.forEach((id) => visited.add(id));
        const nextQueue = [];
        queue.forEach((id) => {
            (childrenMap[id] || []).forEach((childId) => {
                if (!visited.has(childId)) nextQueue.push(childId);
            });
        });
        queue = nextQueue;
    }

    const xSpacing = 300;
    const ySpacing = 180;
    const positions = {};
    levels.forEach((level, depth) => {
        const totalWidth = level.length * xSpacing;
        const startX = -totalWidth / 2 + xSpacing / 2;
        level.forEach((id, idx) => {
            positions[id] = { x: startX + idx * xSpacing, y: depth * ySpacing };
        });
    });

    return positions;
}

export default function TreeView() {
    const { goalId } = useParams();
    const navigate = useNavigate();
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTree = useCallback(async () => {
        if (!goalId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await getTree(goalId);
            setTreeData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    }, [goalId]);

    useEffect(() => { loadTree(); }, [loadTree]);

    const handleAction = useCallback(async (action, nodeId, status) => {
        try {
            if (action === 'activate') {
                await activateNode(nodeId);
            } else if (action === 'checkin') {
                await checkin(nodeId, status);
            }
            await loadTree(); // 刷新树
        } catch (err) {
            alert(err.response?.data?.detail || err.message);
        }
    }, [loadTree]);

    const { flowNodes, flowEdges } = useMemo(() => {
        if (!treeData?.nodes?.length) return { flowNodes: [], flowEdges: [] };

        const positions = layoutNodes(treeData.nodes, treeData.edges || []);

        const flowNodes = treeData.nodes.map((node) => ({
            id: node.id,
            type: 'focusNode',
            position: positions[node.id] || { x: 0, y: 0 },
            data: {
                ...node,
                onActivate: () => handleAction('activate', node.id),
                onCheckin: (success) => handleAction('checkin', node.id, success),
            },
        }));

        const flowEdges = (treeData.edges || []).map((e, i) => {
            const targetNode = treeData.nodes.find((n) => n.id === e.target);
            const status = targetNode?.status || 'LOCKED';
            return {
                id: `e-${i}`,
                source: e.source,
                target: e.target,
                type: 'smoothstep',
                animated: status === 'AVAILABLE' || status === 'IN_PROGRESS',
                style: {
                    stroke: status === 'LOCKED' ? '#374151'
                        : status === 'ACTIVE' ? '#fbbf24'
                            : status === 'BROKEN' ? '#ef4444'
                                : status === 'IN_PROGRESS' ? '#3b82f6'
                                    : '#06b6d4',
                    strokeWidth: 2,
                },
            };
        });

        return { flowNodes, flowEdges };
    }, [treeData, handleAction]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 同步计算的 flow 数据到 React Flow 内部状态
    useEffect(() => { setNodes(flowNodes); }, [flowNodes, setNodes]);
    useEffect(() => { setEdges(flowEdges); }, [flowEdges, setEdges]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-cyan-400" />
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error}</p>
                <button onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition text-sm">
                    返回控制台
                </button>
            </div>
        );
    }

    // ── Empty ──
    if (!treeData?.nodes?.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-4xl">🌳</p>
                <h3 className="text-lg font-semibold text-gray-300">尚无国策树</h3>
                <p className="text-sm text-gray-500">创建一个目标以生成你的第一棵国策树</p>
                <button onClick={() => navigate('/new')}
                    className="mt-2 px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/40 transition text-sm">
                    创建新目标
                </button>
            </div>
        );
    }

    // ── Tree ──
    return (
        <div className="h-screen flex flex-col">
            {/* 顶栏 */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40 bg-[#060a13]/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')}
                        className="p-2 rounded-lg hover:bg-gray-800/50 transition text-gray-500 hover:text-gray-300">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-sm font-display font-bold text-gray-200 tracking-wider">
                            {treeData.goal?.title || '国策树'}
                        </h1>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                            {treeData.nodes.length} 个战略节点
                        </p>
                    </div>
                </div>
                <button onClick={loadTree}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition text-gray-500 hover:text-gray-300">
                    <RefreshCw size={16} />
                </button>
            </header>

            {/* React Flow */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    minZoom={0.3}
                    maxZoom={1.5}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#1e293b" gap={30} size={1} />
                    <Controls
                        style={{ background: '#1a2332', border: '1px solid #1e293b', borderRadius: 8 }}
                    />
                    <MiniMap
                        nodeColor={(n) => {
                            const s = n.data?.status;
                            if (s === 'ACTIVE') return '#fbbf24';
                            if (s === 'IN_PROGRESS') return '#3b82f6';
                            if (s === 'AVAILABLE') return '#06b6d4';
                            if (s === 'BROKEN') return '#ef4444';
                            return '#374151';
                        }}
                        style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8 }}
                        maskColor="rgba(10, 14, 23, 0.8)"
                    />
                </ReactFlow>
            </div>
        </div>
    );
}
