/**
 * Dashboard — 每日控制台
 * 移动端优先，卡片式布局，含 DEFCON 自律等级
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Flame, Shield, AlertTriangle, CheckCircle2, XCircle,
    Target, Trophy, Zap, ChevronRight,
} from 'lucide-react';
import { getActiveNodes, checkin, listGoals } from '../api/client';

const DEFCON_LEVELS = [
    { min: 0, label: 'DEFCON 5', desc: '和平时期', color: 'text-gray-400', bg: 'bg-gray-800/40', border: 'border-gray-600/30' },
    { min: 1, label: 'DEFCON 4', desc: '开始警惕', color: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-600/30' },
    { min: 3, label: 'DEFCON 3', desc: '积极备战', color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-600/30' },
    { min: 5, label: 'DEFCON 2', desc: '高度戒备', color: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-600/30' },
    { min: 8, label: 'DEFCON 1', desc: '最高战备', color: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-600/30' },
];

function getDefconLevel(activeCount) {
    let level = DEFCON_LEVELS[0];
    for (const l of DEFCON_LEVELS) {
        if (activeCount >= l.min) level = l;
    }
    return level;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [nodesRes, goalsRes] = await Promise.all([
                getActiveNodes(),
                listGoals(),
            ]);
            setNodes(nodesRes.data);
            setGoals(goalsRes.data);
        } catch (e) {
            console.error('加载失败', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCheckin = async (nodeId, success) => {
        setChecking(nodeId);
        try {
            await checkin(nodeId, success);
            await loadData();
        } catch (e) {
            console.error('打卡失败', e);
        } finally {
            setChecking(null);
        }
    };

    const activeNodes = nodes.filter(n => n.status === 'ACTIVE');
    const inProgressNodes = nodes.filter(n => n.status === 'IN_PROGRESS');
    const defcon = getDefconLevel(activeNodes.length);

    return (
        <div className="min-h-screen pb-24">
            {/* DEFCON 头部 */}
            <div className={`px-6 py-6 ${defcon.bg} border-b ${defcon.border}`}>
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">自律等级</p>
                            <h1 className={`text-2xl font-display font-bold ${defcon.color}`}>
                                {defcon.label}
                            </h1>
                            <p className="text-sm text-gray-400 mt-0.5">{defcon.desc}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <Trophy size={16} />
                                <span className="text-lg font-bold">{activeNodes.length}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">已激活 Buff</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* 进行中的任务 */}
                {inProgressNodes.length > 0 && (
                    <section className="animate-float-in">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={16} className="text-blue-400" />
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                研究中 ({inProgressNodes.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {inProgressNodes.map((node) => (
                                <NodeCard key={node.id} node={node} onCheckin={handleCheckin} checking={checking} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 已激活的 Buff */}
                {activeNodes.length > 0 && (
                    <section className="animate-float-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={16} className="text-amber-400" />
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                永久 Buff — 每日维护 ({activeNodes.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {activeNodes.map((node) => (
                                <NodeCard key={node.id} node={node} onCheckin={handleCheckin} checking={checking} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 空状态 */}
                {nodes.length === 0 && !loading && (
                    <div className="text-center py-16 animate-float-in">
                        <Target size={48} className="text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-400 font-medium mb-2">暂无活跃任务</h3>
                        <p className="text-sm text-gray-600 mb-6">去国策树中激活一些节点开始你的征程</p>
                    </div>
                )}

                {/* 目标列表快捷入口 */}
                {goals.length > 0 && (
                    <section className="animate-float-in" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            我的目标
                        </h2>
                        <div className="space-y-2">
                            {goals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => navigate(`/tree/${goal.id}`)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl
                    bg-[#111827]/60 border border-gray-800/50
                    hover:bg-[#1a2332] hover:border-gray-700/50
                    transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Target size={18} className="text-cyan-500" />
                                        <span className="text-sm text-gray-300 group-hover:text-gray-100">
                                            {goal.title}
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}


function NodeCard({ node, onCheckin, checking }) {
    const isActive = node.status === 'ACTIVE';
    const isChecking = checking === node.id;

    return (
        <div className={`
      flex items-center gap-4 p-4 rounded-xl border transition-all
      ${isActive
                ? 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40'
                : 'bg-blue-950/20 border-blue-500/20 hover:border-blue-500/40'
            }
    `}>
            {/* 图标 + 标题 */}
            <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium truncate ${isActive ? 'text-amber-200' : 'text-blue-200'}`}>
                    {node.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <Flame size={12} className={isActive ? 'text-amber-500' : 'text-blue-500'} />
                    <span className="text-xs text-gray-400">
                        {isActive
                            ? `连续 ${node.current_streak} 天`
                            : `${node.current_streak}/${node.required_streak} 天`
                        }
                    </span>
                    <span className="text-[10px] text-gray-600">
                        {node.action_type === 'AVOIDANCE' ? '🚫 戒断' : '✅ 行动'}
                    </span>
                </div>
                {/* 进度条 */}
                {!isActive && (
                    <div className="mt-2 h-1 bg-black/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                            style={{ width: `${(node.current_streak / node.required_streak) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            {/* 打卡按钮 */}
            <div className="flex gap-2 shrink-0">
                <button
                    disabled={isChecking}
                    onClick={() => onCheckin(node.id, true)}
                    className={`p-2.5 rounded-lg transition-all
            ${isChecking ? 'opacity-50' : 'hover:scale-110'}
            bg-green-600/20 text-green-400 border border-green-500/30
            hover:bg-green-600/40`}
                >
                    <CheckCircle2 size={18} />
                </button>
                <button
                    disabled={isChecking}
                    onClick={() => onCheckin(node.id, false)}
                    className={`p-2.5 rounded-lg transition-all
            ${isChecking ? 'opacity-50' : 'hover:scale-110'}
            bg-red-600/20 text-red-400 border border-red-500/30
            hover:bg-red-600/40`}
                >
                    <XCircle size={18} />
                </button>
            </div>
        </div>
    );
}
