/**
 * FocusNode — React Flow 自定义节点组件
 * 核心视觉：LOCKED(灰) / AVAILABLE(青色脉冲) / IN_PROGRESS(进度条) / ACTIVE(金色) / BROKEN(红色)
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Lock, Unlock, Flame, Trophy, AlertTriangle,
    Moon, BookOpen, Dumbbell, Coffee, Zap, Shield, Target,
} from 'lucide-react';

const ICON_MAP = {
    '🌙': Moon, '📵': Shield, '⏰': Zap, '🧘': Moon,
    '🚫': AlertTriangle, '💧': Coffee,
    '🏃': Dumbbell, '👟': Dumbbell, '🚶': Dumbbell,
    '📚': BookOpen, '🎯': Target,
};

function getIcon(title) {
    for (const [emoji, Icon] of Object.entries(ICON_MAP)) {
        if (title.includes(emoji)) return Icon;
    }
    return Target;
}

const STATUS_STYLES = {
    LOCKED: {
        bg: 'bg-gray-900/60',
        border: 'border-gray-700/50',
        text: 'text-gray-500',
        iconColor: 'text-gray-600',
        glow: '',
        StatusIcon: Lock,
    },
    AVAILABLE: {
        bg: 'bg-cyan-950/40',
        border: 'border-cyan-500/50',
        text: 'text-cyan-300',
        iconColor: 'text-cyan-400',
        glow: 'animate-pulse-border',
        StatusIcon: Unlock,
    },
    IN_PROGRESS: {
        bg: 'bg-blue-950/40',
        border: 'border-blue-500/50',
        text: 'text-blue-200',
        iconColor: 'text-blue-400',
        glow: '',
        StatusIcon: Flame,
    },
    ACTIVE: {
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/60',
        text: 'text-amber-200',
        iconColor: 'text-amber-400',
        glow: 'animate-gold-glow',
        StatusIcon: Trophy,
    },
    BROKEN: {
        bg: 'bg-red-950/30',
        border: 'border-red-500/50',
        text: 'text-red-300',
        iconColor: 'text-red-400',
        glow: 'animate-crack-pulse',
        StatusIcon: AlertTriangle,
    },
};

const STATUS_LABELS = {
    LOCKED: '🔒 已锁定',
    AVAILABLE: '✨ 可开启',
    IN_PROGRESS: '🔥 研究中',
    ACTIVE: '⭐ 已激活',
    BROKEN: '💔 已断裂',
};

function FocusNodeComponent({ data }) {
    const { title, status, action_type, difficulty, current_streak, required_streak, onActivate, onCheckin } = data;
    const style = STATUS_STYLES[status] || STATUS_STYLES.LOCKED;
    const Icon = getIcon(title);
    const { StatusIcon } = style;

    return (
        <div className={`
      relative w-[270px] rounded-xl border-2 p-4 backdrop-blur-sm
      transition-all duration-300 cursor-pointer
      ${style.bg} ${style.border} ${style.glow}
      hover:scale-[1.02]
    `}>
            {/* 连接点 */}
            <Handle type="target" position={Position.Top} className="!bg-gray-600 !border-gray-500 !w-3 !h-3" />
            <Handle type="source" position={Position.Bottom} className="!bg-gray-600 !border-gray-500 !w-3 !h-3" />

            {/* 头部 */}
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-black/30 ${style.iconColor}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold leading-tight truncate ${style.text}`}>
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusIcon size={12} className={style.iconColor} />
                        <span className={`text-xs ${style.iconColor}`}>
                            {STATUS_LABELS[status]}
                        </span>
                    </div>
                </div>
            </div>

            {/* 难度 & 类型 */}
            <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-gray-400 border border-gray-700/50">
                    {action_type === 'AVOIDANCE' ? '🚫 戒断' : '✅ 行动'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-gray-400 border border-gray-700/50">
                    难度 {'★'.repeat(difficulty)}{'☆'.repeat(5 - difficulty)}
                </span>
            </div>

            {/* 进度条 (IN_PROGRESS) */}
            {status === 'IN_PROGRESS' && (
                <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-blue-400 mb-1">
                        <span>稳态进度</span>
                        <span>{current_streak}/{required_streak} 天</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${(current_streak / required_streak) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ACTIVE streak */}
            {status === 'ACTIVE' && (
                <div className="mt-3 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    <span className="text-xs text-amber-300 font-medium">
                        连续 {current_streak} 天 · 需每日维护
                    </span>
                </div>
            )}

            {/* 操作按钮 */}
            {status === 'AVAILABLE' && onActivate && (
                <button
                    onClick={(e) => { e.stopPropagation(); onActivate(); }}
                    className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg
            bg-cyan-600/30 text-cyan-300 border border-cyan-500/40
            hover:bg-cyan-600/50 transition-all"
                >
                    ▶ 开始研究
                </button>
            )}

            {(status === 'IN_PROGRESS' || status === 'ACTIVE') && onCheckin && (
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCheckin(true); }}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg
              bg-green-600/20 text-green-300 border border-green-500/30
              hover:bg-green-600/40 transition-all"
                    >
                        ✅ 完成
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCheckin(false); }}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg
              bg-red-600/20 text-red-300 border border-red-500/30
              hover:bg-red-600/40 transition-all"
                    >
                        ❌ 失败
                    </button>
                </div>
            )}
        </div>
    );
}

export default memo(FocusNodeComponent);
