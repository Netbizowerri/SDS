import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Bike, LogOut, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { AuthService } from '../../services/mock';

export const RiderProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/rider/login');
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Courier Profile</h1>
        <p className="text-xs text-slate-500">Your registered dispatch credentials</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name || 'Tunde Bakare'}</h2>
            <p className="text-xs text-slate-500">{user?.email || 'rider.tunde@sdsdelivery.com'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              Active Dispatch Courier
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Vehicle:</span>
            <span className="font-semibold text-slate-800">Motorcycle (Fleet Bay 3)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Phone Hotline:</span>
            <span className="font-mono text-slate-800">+234 803 456 7890</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Primary Dispatch Zone:</span>
            <span className="font-semibold text-slate-800">Lagos Mainland & Island</span>
          </div>
        </div>
      </div>

      {/* Return to public site link */}
      <Link
        to="/"
        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
      >
        <span>Return to SDS Public Website</span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
      </Link>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 px-4 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Rider Portal</span>
      </button>
    </div>
  );
};
