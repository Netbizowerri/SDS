import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, DollarSign, User, Bike } from 'lucide-react';
import { AuthService } from '../../services/mock';

export const RiderLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const navItems = [
    { label: 'My Jobs', path: '/rider', icon: Package, exact: true },
    { label: 'Earnings', path: '/rider/earnings', icon: DollarSign },
    { label: 'Profile', path: '/rider/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile-constrained app shell (max-w-md on desktop, full on phone) */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* Top Mini Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              SDS
            </span>
            <span className="text-sm font-bold tracking-tight">Rider Dispatch</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{user?.name?.split(' ')[0] || 'Tunde'}</span>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 pb-20 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom App Navigation (Min 44px tap targets, thumb-reachable) */}
        <nav
          aria-label="Rider navigation"
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 py-2 px-4 z-40 flex items-center justify-around shadow-lg"
        >
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 px-3 min-h-[48px] min-w-[64px] rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-700 font-bold bg-emerald-50/60'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[11px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
