/**
 * Settings — API 配置页
 * 配置 API Key 和 Base URL
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Globe, Save, Check, AlertCircle } from 'lucide-react';
import { getSettings, updateSettings } from '../api/client';

export default function Settings() {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getSettings().then(res => {
            setApiKey(res.data.api_key || '');
            setBaseUrl(res.data.base_url || 'https://api.deepseek.com');
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings({ api_key: apiKey, base_url: baseUrl });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-lg mx-auto py-8 animate-float-in">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition mb-8 text-sm"
                >
                    <ArrowLeft size={16} />
                    返回
                </button>

                <h1 className="text-xl font-display font-bold text-gray-100 mb-6">
                    ⚙️ 系统设置
                </h1>

                <div className="space-y-6">
                    {/* API Key */}
                    <div className="p-5 rounded-xl bg-[#111827]/60 border border-gray-800/50 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Key size={16} className="text-cyan-500" />
                            <span className="font-medium">API Key</span>
                        </div>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-gray-700/50
                text-gray-200 placeholder-gray-600 text-sm
                focus:outline-none focus:border-cyan-500/50"
                        />
                        <p className="text-[11px] text-gray-600">
                            留空则使用 Mock 模式（预设示例数据）
                        </p>
                    </div>

                    {/* Base URL */}
                    <div className="p-5 rounded-xl bg-[#111827]/60 border border-gray-800/50 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Globe size={16} className="text-cyan-500" />
                            <span className="font-medium">Base URL</span>
                        </div>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://api.deepseek.com"
                            className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-gray-700/50
                text-gray-200 placeholder-gray-600 text-sm
                focus:outline-none focus:border-cyan-500/50"
                        />
                        <p className="text-[11px] text-gray-600">
                            支持 DeepSeek (https://api.deepseek.com) 或 OpenAI (https://api.openai.com/v1)
                        </p>
                    </div>

                    {/* 提示 */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300/80 leading-relaxed">
                            API Key 仅存储在本地数据库中，不会上传到任何外部服务器。
                            如果不填写 API Key，系统将使用 Mock 模式生成示例国策树。
                        </p>
                    </div>

                    {/* 保存按钮 */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2
              transition-all ${saved
                                ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500'
                            }`}
                    >
                        {saved ? (
                            <><Check size={18} /> 已保存</>
                        ) : (
                            <><Save size={18} /> 保存设置</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
