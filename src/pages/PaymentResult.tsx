import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const PaymentResult: React.FC = () => (
  <div className="min-h-[70vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
    <div className="max-w-lg w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-9 text-center space-y-5">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
        <MessageCircle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">Payment confirmation is handled by SDS</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        After you pay using the details SDS sent you, contact dispatch with your order code. An administrator will confirm receipt and update your delivery request.
      </p>
      <WhatsAppButton
        phone={DEFAULT_BUSINESS_SETTINGS.whatsappNumber}
        message="Hello SDS Dispatch, I have made the transfer for my delivery. Please confirm receipt."
        label="Ask Dispatch to Confirm Payment"
        size="md"
        className="w-full"
      />
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to home
      </Link>
    </div>
  </div>
);
