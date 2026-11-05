import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike, ClipboardList, Package } from 'lucide-react';

export const DemoHub: React.FC = () => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-slate-900 text-white rounded-2xl p-7 sm:p-9 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">SDS Delivery Operations</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Delivery request and dispatch workflow</h1>
        <p className="max-w-2xl text-sm text-slate-300 leading-relaxed">
          Customers submit delivery requests. SDS staff review each request, contact the customer offline with a quote and payment details, confirm payment, and assign a rider.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/request" className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 hover:border-emerald-500 transition-colors">
          <Package className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900">Submit a request</h2>
          <p className="text-xs text-slate-600">Send pickup, delivery, and parcel details to SDS.</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">Open booking form <ArrowRight className="w-3.5 h-3.5" /></span>
        </Link>
        <Link to="/rider/login" className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 hover:border-emerald-500 transition-colors">
          <Bike className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900">Rider portal</h2>
          <p className="text-xs text-slate-600">View assigned jobs and update delivery progress.</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">Rider sign in <ArrowRight className="w-3.5 h-3.5" /></span>
        </Link>
      </div>

      <aside className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-950">
        <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
        <p>Tracking updates and payment instructions are handled directly by SDS staff. This page no longer offers simulated tracking, quick role switching, or a fake payment flow.</p>
      </aside>
    </div>
  </div>
);
