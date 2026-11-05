import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const QuotePayment: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-[70vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-lg w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-9 text-center space-y-5">
        <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Payment is arranged with SDS staff</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Online payment is not enabled. SDS will send your quote and transfer details directly, then confirm receipt before dispatching a rider.
          </p>
        </div>
        {token && <p className="text-[11px] text-slate-500">Quote reference: <span className="font-mono">{token.slice(0, 8).toUpperCase()}</span></p>}
        <WhatsAppButton
          phone={DEFAULT_BUSINESS_SETTINGS.whatsappNumber}
          message="Hello SDS Dispatch, please send me the quote and payment instructions for my delivery."
          label="Contact Dispatch on WhatsApp"
          size="md"
          className="w-full"
        />
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Only pay using details sent directly by SDS staff.
        </p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>
    </div>
  );
};
