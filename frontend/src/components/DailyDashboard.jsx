/**
 * DailyDashboard - 每日控制台（移动端优先）
 * 显示 IN_PROGRESS 和 ACTIVE 节点
 */
import {
    Flame, Check, X, Trophy, Target, Moon, BookOpen,
    Dumbbell, Coffee, Ban, Shield
} from 'lucide-react';
import { checkin } from '../lib/api';

function getIcon(title, actionType) {
    const t = (title || '').toLowerCase();
    if (t.includes('睡') || t.includes('作息') || t.includes('起床')) return Moon;
    if (t.includes('学') || t.includes('读') || t.includes('书')) return BookOpen;
    if (t.includes('运动') || t.includes('跑') || t.includes('散步') || t.includes('健身')) return Dumbbell;
    if (t.includes('饮') || t.includes('喝') || t.includes('咖啡')) return Coffee;
    if (actionType === 'AVOIDANCE') return Ban;
    return Target;
}

function StatusBadge({ status }) {
    const colors = {
        IN_PROGRESS: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', text: '研究中' },
        ACTIVE: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', text: '已激活' },
        BROKEN: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', text: '已损坏' },
    };
    const c = colors[status] || colors.IN_PROGRESS;
    return (
        <span style={{
            fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4,
            background: c.bg, color: c.color, fontWeight: 600
        }}>
            {c.text}
        </span>
    );
}

export default function DailyDashboard({ activeNodes, onRefresh }) {
    const nodes = activeNodes || [];

    const handleCheckin = async (nodeId, success) => {
        try {
            await checkin(nodeId, success);
            onRefresh?.();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>DAILY OPS CONSOLE</h2>
            </div>

            {nodes.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📋</div>
                    <h3>无进行中任务</h3>
                    <p>前往国策树视图开始你的第一个研究项目</p>
                </div>
            ) : (
                nodes.map((node) => {
                    const Icon = getIcon(node.title, node.action_type);
                    const isActive = node.status === 'ACTIVE';

                    return (
                        <div key={node.id} className="daily-card fade-in" style={
                            isActive ? { borderColor: 'rgba(251, 191, 36, 0.2)' } : {}
                        }>
                            <div className="card-icon" style={{
                                background: isActive ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                            }}>
                                <Icon size={20} color={isActive ? '#fbbf24' : '#f59e0b'} />
                            </div>

                            <div className="card-info">
                                <div className="card-title">{node.title}</div>
                                <div className="card-streak">
                                    <StatusBadge status={node.status} />
                                    <Flame size={12} color="#f59e0b" style={{ marginLeft: 6 }} />
                                    <span>{node.current_streak}/{node.required_streak}</span>
                                    {isActive && <Trophy size={12} color="#fbbf24" style={{ marginLeft: 4 }} />}
                                </div>
                            </div>

                            <div className="card-actions">
                                <button className="btn btn-success btn-sm" onClick={() => handleCheckin(node.id, true)}>
                                    <Check size={13} />
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleCheckin(node.id, false)}>
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
