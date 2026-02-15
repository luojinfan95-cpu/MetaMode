/**
 * GoalForm — 创建新目标
 * 调用 AI 生成国策树后跳转到树视图
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Target, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { generateGoal } from '../api/client';

const EXAMPLES = [
    { title: '三个月减重10kg', desc: '通过饮食控制和运动习惯建立，实现健康减重' },
    { title: '每天阅读30分钟', desc: '建立持续的读书习惯，积累知识' },
    { title: '学会弹吉他', desc: '从零开始，6个月内能流畅弹奏3首歌' },
    { title: '戒掉熬夜', desc: '建立规律作息，每晚11点前入睡' },
];

export default function GoalForm() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const res = await generateGoal(title, description);
            navigate(`/tree/${res.data.id}`);
        } catch (e) {
            setError('生成失败: ' + (e.response?.data?.detail || e.message));
        } finally {
            setLoading(false);
        }
    };

    const fillExample = (ex) => {
        setTitle(ex.title);
        setDescription(ex.desc);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-float-in">
                {/* 返回 */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition mb-8 text-sm"
                >
                    <ArrowLeft size={16} />
                    返回控制台
                </button>

                {/* 头部 */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 mb-4">
                        <Sparkles size={32} className="text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-gray-100 mb-2">
                        创建新目标
                    </h1>
                    <p className="text-sm text-gray-500">
                        AI 将为你的目标生成一棵定制的国策树
                    </p>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                            目标名称
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例如：三个月减重10kg"
                            className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-gray-800
                text-gray-100 placeholder-gray-600
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                            详细描述（可选）
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="描述你的具体情况、限制条件或偏好..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-gray-800
                text-gray-100 placeholder-gray-600 resize-none
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                transition-all"
                        />
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className={`w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2
              transition-all ${loading || !title.trim()
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                AI 正在生成国策树...
                            </>
                        ) : (
                            <>
                                <Wand2 size={18} />
                                生成国策树
                            </>
                        )}
                    </button>
                </form>

                {/* 示例 */}
                <div className="mt-8">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">💡 快速示例</p>
                    <div className="grid grid-cols-2 gap-2">
                        {EXAMPLES.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => fillExample(ex)}
                                className="p-3 rounded-xl bg-[#111827]/60 border border-gray-800/50
                  text-left text-xs text-gray-400 hover:text-gray-200
                  hover:border-gray-700/50 hover:bg-[#1a2332] transition-all"
                            >
                                <Target size={14} className="text-cyan-600 mb-1.5" />
                                {ex.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
