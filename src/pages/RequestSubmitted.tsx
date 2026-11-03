import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowRight, Home, Search, ShieldCheck } from 'lucide-react';
import { CopyButton, WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const RequestSubmitted: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || 'SDS-829410';
  const navigate = useNavigate();

  const whatsappInquiry = `Hello SDS Dispatch, I just submitted request ${code}. When will the quote be ready?`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-10">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Request Submitted Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Your delivery request is now in our central dispatch queue. Our operations team will calculate your route quote and send the private payment link directly to your WhatsApp.
        </p>

        {/* Tracking Code Box */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Your Tracking Code
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-extrabold text-slate-950 tracking-wider">
              {code}
            </span>
            <CopyButton text={code} label="Copy Code" />
          </div>
          <p className="text-[11px] text-slate-400">
            Keep this code safe to check live milestones on our tracking portal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <WhatsAppButton
            phone={DEFAULT_BUSINESS_SETTINGS.phone}
            message={whatsappInquiry}
            label="Chat with Dispatch Desk on WhatsApp"
            size="md"
            className="w-full"
          />

          <Link
            to={`/track?code=${encodeURIComponent(code)}`}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Track This Order Now</span>
          </Link>

          <Link
            to="/"
            className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        {/* Trust badge */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Manual supervisor review · Dispatch within operating hours</span>
        </div>
      </div>
    </div>
  );
};
