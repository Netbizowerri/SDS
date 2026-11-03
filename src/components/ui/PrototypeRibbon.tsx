import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, User, X } from 'lucide-react';
import { APP_CONFIG } from '../../config/business';
import { AuthService } from '../../services/mock';

export const PrototypeRibbon: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  if (!APP_CONFIG.showPrototypeRibbon) {
    return null;
  }

  const handleRoleSwitch = async (role: 'owner' | 'manager' | 'rider') => {
    await AuthService.login(role);
    if (role === 'rider') {
      navigate('/rider');
    } else {
      navigate('/admin');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo orders, quotes, and riders back to initial seed state?')) {
      AuthService.resetDemoData();
      window.location.reload();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 bg-slate-900 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Demo Controls</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Demo environment controls"
      className="bg-slate-900 text-slate-200 border-b border-slate-800 py-1.5 px-4 text-xs z-50 sticky top-0 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
            SDS Demo
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Interactive system demonstration and workflow preview.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick role switches */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Role:</span>
            <button
              onClick={() => handleRoleSwitch('owner')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentUser?.role === 'owner' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Owner
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleRoleSwitch('manager')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentUser?.role === 'manager' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Manager
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleRoleSwitch('rider')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentUser?.role === 'rider' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Rider
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetData}
            title="Reset data to initial state"
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          {/* Minimize */}
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800"
            title="Minimize banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
