import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, ShieldCheck } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const Track: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = code
    ? `Hello SDS Dispatch, please share an update for delivery ${code}.`
    : 'Hello SDS Dispatch, please share an update about my delivery.';

  return (
    <div className="min-h-[70vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-lg w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-9 text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Get a delivery update</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            SDS staff share shipment updates directly. Message dispatch with your order code and we’ll check the latest status for you.
          </p>
        </div>
        {code && <p className="font-mono text-sm font-bold text-slate-900 bg-slate-50 rounded-lg px-4 py-3">Order {code}</p>}
        <WhatsAppButton
          phone={DEFAULT_BUSINESS_SETTINGS.whatsappNumber}
          message={message}
          label="Ask Dispatch on WhatsApp"
          size="md"
          className="w-full"
        />
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Order addresses and status are only available to authorized SDS staff.
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>
    </div>
  );
};
