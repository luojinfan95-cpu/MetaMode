/**
 * CivHabit — 国策树自律系统
 * 主应用路由
 */
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import TreeView from './components/TreeView';
import Dashboard from './components/Dashboard';
import GoalForm from './components/GoalForm';
import Settings from './components/Settings';
import { Plus, Settings as SettingsIcon, LayoutDashboard, Map } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-[#060a13]/90 backdrop-blur-sm border-b border-gray-800/40">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Map size={16} className="text-white" />
            </div>
            <h1 className="font-display text-sm font-bold text-gray-200 tracking-wider">
              CIVHABIT
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-cyan-600/20 text-cyan-300 border border-cyan-500/30
                hover:bg-cyan-600/40 transition-all"
            >
              <Plus size={14} />
              新目标
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition text-gray-500 hover:text-gray-300"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <Dashboard />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<GoalForm />} />
        <Route path="/tree/:goalId" element={<TreeView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
