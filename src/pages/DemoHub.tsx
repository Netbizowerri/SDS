import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Shield,
  UserCheck,
  Package,
  CreditCard,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AuthService } from '../services/mock';

export const DemoHub: React.FC = () => {
  const navigate = useNavigate();

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

  const quoteStates = [
    {
      title: 'State 1: Valid Quote (68h Left)',
      desc: 'Intra-state fashion parcel, ₦13,500 total, live countdown timer.',
      url: '/quote/token_valid_72h_awaiting_payment_123456789',
      badge: 'Awaiting Payment',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'State 1b: Urgent Quote (<4h Left)',
      desc: 'Electronics logistics, urgent pulsating countdown timer (<6h threshold).',
      url: '/quote/token_urgent_expiring_soon_6hours',
      badge: 'Expiring Soon',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'State 2: Expired Quote',
      desc: 'Validity window lapsed. Pay button disabled with WhatsApp requote action.',
      url: '/quote/token_expired_quote_demo_987654321',
      badge: 'Expired',
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      title: 'State 3: Paid Receipt View',
      desc: 'Payment completed via Paystack with official reference and tracking button.',
      url: '/quote/token_paid_receipt_demo_view_567890',
      badge: 'Paid Receipt',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'State 4: Revoked / Revised Quote',
      desc: 'Admin invalidated old link to issue revised pricing.',
      url: '/quote/token_revoked_by_admin_sample_123456',
      badge: 'Revoked',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      title: 'State 5: Invalid Token',
      desc: 'Non-existent random token. Shows neutral error without leaking order state.',
      url: '/quote/random_non_existent_security_token_xyz9999',
      badge: 'Invalid Link',
      badgeColor: 'bg-slate-100 text-slate-600',
    },
  ];

  const trackingDemos = [
    {
      code: 'SDS-829417',
      contact: '08039991122',
      status: 'Delivered',
      desc: 'Full timeline with recipient digital signature & Mrs. Folashade Adeyemi handover.',
    },
    {
      code: 'SDS-829416',
      contact: '08098881234',
      status: 'In Transit',
      desc: 'On motorcycle en route to Lekki with courier contact buttons.',
    },
    {
      code: 'SDS-829415',
      contact: '08023334411',
      status: 'Picked Up',
      desc: 'Rider confirmed custody at sender premises.',
    },
    {
      code: 'SDS-829413',
      contact: '08124445566',
      status: 'Paid & Awaiting Rider',
      desc: 'Paid order needing dispatch supervisor assignment.',
    },
    {
      code: 'SDS-829410',
      contact: '08031112233',
      status: 'Requested',
      desc: 'New guest request awaiting quote composer.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[11px] uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Operations Showcase
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              SDS Delivery System Test Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Quick access shortcuts to test every PRD user journey, all 7 private quote states, masked tracking lookups, rider mobile app, and admin quote-to-cash workflows.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>

        {/* 1. Direct Portal Switchers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            1. Role Logins & Portal Switchers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Owner (Full Admin)</span>
              <p className="text-[11px] text-slate-600">Full access to orders, quote composer, payouts ledger, and business settings.</p>
              <button
                onClick={() => handleRoleSwitch('owner')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
              >
                Launch Admin as Owner →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Operations Manager</span>
              <p className="text-[11px] text-slate-600">Can manage orders, compose quotes, and assign riders. Payouts and settings hidden.</p>
              <button
                onClick={() => handleRoleSwitch('manager')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Launch Admin as Manager →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Courier Rider (Tunde Bakare)</span>
              <p className="text-[11px] text-slate-600">Mobile-first app with bottom navigation, job cards, and digital signature capture.</p>
              <button
                onClick={() => handleRoleSwitch('rider')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Launch Rider App →
              </button>
            </div>
          </div>
        </div>

        {/* 2. All 7 Quote States */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              2. Private Quote States (/quote/:token)
            </h2>
            <span className="text-xs text-slate-500">PRD Section 7 Compliance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quoteStates.map((qs, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{qs.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${qs.badgeColor}`}>
                      {qs.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{qs.desc}</p>
                </div>

                <Link
                  to={qs.url}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Open Quote Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Tracking Lookup Demos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              3. Tracking Lookup Demos (/track)
            </h2>
            <span className="text-xs text-slate-500">PRD Section 6.3 Compliance</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order Code</th>
                  <th className="py-2.5 px-3">Registered Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Key Feature Verified</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trackingDemos.map((td, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{td.code}</td>
                    <td className="py-3 px-3 text-slate-600">{td.contact}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {td.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600">{td.desc}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <Link
                        to={`/track?code=${td.code}`}
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Track <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
