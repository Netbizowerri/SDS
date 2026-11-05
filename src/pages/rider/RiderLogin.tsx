import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bike, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthService } from '../../services/mock';

export const RiderLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your rider email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await AuthService.login(email, password);
      if (user.role !== 'rider') {
        await AuthService.logout();
        throw new Error('This account is set up for the operations console.');
      }
      navigate('/rider');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Invalid login credentials. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl text-white font-black flex items-center justify-center mx-auto text-lg shadow">
            SDS
          </div>
          <h1 className="text-xl font-bold text-slate-900">Courier Rider Portal</h1>
          <p className="text-xs text-slate-500">Sign in to view your assigned dispatch runs and capture signatures.</p>
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
              Rider Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@sdsdelivery.com"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 uppercase tracking-wide">
                Password <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset placeholder: In production, password reset instructions are sent via SMS/WhatsApp.')}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
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
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Rider App</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500">Rider accounts are created by the SDS project owner.</p>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 underline">
            Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
