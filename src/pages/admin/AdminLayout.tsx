import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Bike,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  User,
  Sparkles,
} from 'lucide-react';
import { AuthService } from '../../services/mock';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  if (!user || user.role === 'rider') return null;

  const isOwner = user.role === 'owner';

  const navLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Orders & Quotes', path: '/admin/orders', icon: Package },
    { label: 'Riders & Dispatch', path: '/admin/riders', icon: Bike },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    ...(isOwner
      ? [{ label: 'Settings', path: '/admin/settings', icon: Settings }]
      : []),
  ];

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-800">
          <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
            SDS
          </span>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              SDS Operations
            </h1>
            <span className="text-[10px] text-emerald-400 font-mono">Central Dispatch</span>
          </div>
        </div>

        {/* Current Staff Tag */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Logged in as:</span>
            <span
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                isOwner ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-slate-950'
              }`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-1 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 text-xs font-medium">
          {navLinks.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom public link & logout */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            to="/"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              Public Website
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
            SDS
          </span>
          <span className="text-sm font-bold">Admin Console</span>
          <span
            className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${
              isOwner ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-slate-950'
            }`}
          >
            {user.role}
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
          aria-label="Toggle admin navigation"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Dropdown */}
      {sidebarOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 z-40">
          <div className="text-xs text-slate-400 pb-2 border-b border-slate-800">
            Signed in as: <strong className="text-white">{user.name}</strong> ({user.role})
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="text-emerald-400 hover:underline">
              Public Website
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:underline cursor-pointer">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Workspace Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
