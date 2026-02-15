/**
 * GoalCreator - 目标创建组件
 */
import { useState } from 'react';
import { Sparkles, Loader2, Target } from 'lucide-react';
import { generateGoal } from '../lib/api';

export default function GoalCreator({ onGoalCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError('');

        try {
            const goal = await generateGoal(title.trim(), description.trim());
            setTitle('');
            setDescription('');
            onGoalCreated?.(goal);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="goal-creator fade-in">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(251, 191, 36, 0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <Target size={24} color="#60a5fa" />
                </div>
                <h2>部署新战略目标</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                    输入你的宏观目标，AI 参谋部将为你生成国策研究方案
                </p>
            </div>

            <form className="goal-form" onSubmit={handleSubmit}>
                <input
                    className="input"
                    type="text"
                    placeholder="例如：三个月减重10kg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                />
                <textarea
                    className="input textarea"
                    placeholder="补充说明（可选）：当前体重、生活习惯、时间约束等..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                />

                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171', fontSize: '0.83rem'
                    }}>
                        {error}
                    </div>
                )}

                <button className="btn btn-primary" type="submit" disabled={loading || !title.trim()}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.9rem' }}>
                    {loading ? (
                        <>
                            <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                            AI 正在推演国策方案...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            生成国策树
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
