import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, MessageSquare } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const reference = searchParams.get('ref') || `pstk_${Date.now()}`;
  const code = searchParams.get('code') || 'SDS-829413';

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 text-center space-y-4">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Payment Successful!
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your transaction has been confirmed by Paystack. Our dispatch supervisor has received your order and is assigning a delivery courier.
            </p>

            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-left space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Order:</span>
                <span className="font-bold text-slate-900">{code}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Reference:</span>
                <span className="text-slate-800">{reference}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to={`/track?code=${encodeURIComponent(code)}`}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <span>Track Delivery Milestones</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <WhatsAppButton
                phone={DEFAULT_BUSINESS_SETTINGS.phone}
                message={`Hi SDS Dispatch, I have completed payment for order ${code} (Ref: ${reference}).`}
                label="Message Dispatch on WhatsApp"
                size="md"
                className="w-full"
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 ring-8 ring-rose-50">
              <XCircle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Payment Declined
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              The card or account transaction was not completed by the issuing bank. No funds have been debited from your account.
            </p>

            <div className="space-y-2.5 pt-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return to Quote & Try Another Card</span>
              </button>

              <WhatsAppButton
                phone={DEFAULT_BUSINESS_SETTINGS.phone}
                message="Hello SDS, my payment did not go through. Can I pay via direct bank transfer?"
                label="Request Bank Transfer on WhatsApp"
                size="md"
                className="w-full"
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
