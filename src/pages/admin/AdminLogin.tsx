import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { AuthService } from '../../services/mock';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@sdsdelivery.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // If email has manager, login as manager
      const role = email.includes('manager') ? 'manager' : 'owner';
      await AuthService.login(role, email);
      navigate('/admin');
    } catch {
      setErrorMsg('Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = async (role: 'owner' | 'manager') => {
    setIsLoading(true);
    await AuthService.login(role);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 rounded-xl text-emerald-400 font-black flex items-center justify-center mx-auto text-lg shadow">
            SDS
          </div>
          <h1 className="text-xl font-bold text-slate-900">Operations Console Sign In</h1>
          <p className="text-xs text-slate-500">Access central dispatch, quote composer, and fleet tracking.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Staff Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sdsdelivery.com"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Shortcuts */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Demo Staff Roles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickRole('owner')}
              className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 text-left bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-900 block">Owner (Full Admin)</span>
              <span className="text-[10px] text-slate-500">Orders, Payouts & Settings</span>
            </button>

            <button
              onClick={() => handleQuickRole('manager')}
              className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 text-left bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-900 block">Operations Manager</span>
              <span className="text-[10px] text-slate-500">Orders & Quotes Only</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 underline">
            Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
