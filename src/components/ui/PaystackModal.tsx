import React, { useState } from 'react';
import { ShieldCheck, X, CreditCard, Building2, Smartphone, AlertCircle, Lock } from 'lucide-react';
import { formatNaira } from '../../lib/utils';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountKobo: number;
  customerEmail?: string;
  orderCode: string;
  onSuccess: (reference: string) => void;
  onFailure: (errorMessage: string) => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  onClose,
  amountKobo,
  customerEmail = 'customer@example.com',
  orderCode,
  onSuccess,
  onFailure,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'bank' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const reference = `pstk_mock_${Date.now()}`;
      onSuccess(reference);
    }, 900);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onFailure('Card declined: Insufficient funds or card restriction by issuer.');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Sandbox Test Banner */}
        <div className="bg-emerald-500 text-slate-950 px-4 py-1 text-xs font-bold text-center uppercase tracking-wide flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Paystack Sandbox Payment Gateway
        </div>

        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-emerald-400">paystack</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">Secured</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">Paying to <strong className="text-white">SDS Delivery</strong> ({orderCode})</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Amount</p>
            <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatNaira(amountKobo)}
            </p>
          </div>
        </div>

        {/* Channels Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'card'
                ? 'border-emerald-600 text-emerald-800 bg-white font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'bank'
                ? 'border-emerald-600 text-emerald-800 bg-white font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'transfer'
                ? 'border-emerald-600 text-emerald-800 bg-white font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>Customer: <strong className="text-slate-700">{customerEmail}</strong></span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL
            </span>
          </div>

          {activeTab === 'card' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-sans">Simulated Card</p>
                <p className="font-semibold text-slate-800">4084 ···· ···· 9821</p>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Expires: 12/28</span>
                  <span>CVV: ···</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-2 text-xs text-slate-600">
              <p>Simulated Instant Bank Debit</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-800">Guaranty Trust Bank (GTB)</p>
                <p className="font-mono text-slate-500 mt-1">Account: 0123****89</p>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-2 text-xs text-slate-600">
              <p>Simulated Dynamic Virtual Account:</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-medium text-slate-800">Wema Bank / Paystack</p>
                <p className="font-mono text-slate-900 font-semibold text-sm">9928 1049 20</p>
                <p className="text-[11px] text-slate-500">Expires in 30 minutes</p>
              </div>
            </div>
          )}

          {/* Action Simulation Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Simulating verification...' : `Pay ${formatNaira(amountKobo)}`}</span>
            </button>

            <button
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="w-full py-2 px-4 border border-rose-200 hover:bg-rose-50 text-rose-700 font-medium text-xs rounded-lg transition-colors"
            >
              Simulate Failed Transaction (Error Test)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            End-to-end encrypted
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium underline"
          >
            Cancel & return
          </button>
        </div>
      </div>
    </div>
  );
};
