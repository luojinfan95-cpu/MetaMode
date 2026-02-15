/**
 * SettingsPanel - API 设置面板
 */
import { useState, useEffect } from 'react';
import { Settings, Save, Key, Globe } from 'lucide-react';
import { getSettings, updateSettings } from '../lib/api';

export default function SettingsPanel() {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getSettings()
            .then((data) => {
                setApiKey(data.api_key || '');
                setBaseUrl(data.base_url || 'https://api.deepseek.com');
            })
            .catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await updateSettings(apiKey, baseUrl);
            setMessage('✅ 设置已保存');
        } catch (err) {
            setMessage('❌ ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-panel fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Settings size={20} color="var(--text-secondary)" />
                <h2>系统配置</h2>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    AI 服务配置
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    配置 LLM 接口以启用国策树 AI 生成功能。兼容 OpenAI 和 DeepSeek API。
                </p>

                <div className="settings-group">
                    <label><Key size={12} style={{ marginRight: 4 }} /> API Key</label>
                    <input
                        className="input"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>

                <div className="settings-group">
                    <label><Globe size={12} style={{ marginRight: 4 }} /> Base URL</label>
                    <input
                        className="input"
                        type="text"
                        placeholder="https://api.deepseek.com"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        DeepSeek: https://api.deepseek.com &nbsp;|&nbsp; OpenAI: https://api.openai.com/v1
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem', marginBottom: 12,
                        background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.startsWith('✅') ? '#34d399' : '#f87171'
                    }}>
                        {message}
                    </div>
                )}

                <button className="btn btn-primary" onClick={handleSave} disabled={saving}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    <Save size={14} />
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>

            <div className="card" style={{ opacity: 0.7 }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                    关于 CivHabit
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    CivHabit 基于"微扰动原理"，将宏大目标拆解为极低成本的微小行动链。
                    通过国策树的解锁与崩塌机制，建立自然的正/负反馈循环。
                </p>
                <div style={{
                    marginTop: 12, fontSize: '0.7rem', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-display)', letterSpacing: 1
                }}>
                    v0.1.0 MVP · POWERED BY AI
                </div>
            </div>
        </div>
    );
}
