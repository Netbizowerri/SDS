import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import { OrdersService, PaymentsService } from '../services/mock';
import { Order } from '../types';
import { formatNaira, maskPhone, formatLagosDate, buildWhatsAppLink } from '../lib/utils';
import { Countdown } from '../components/ui/Countdown';
import { StatusBadge } from '../components/ui/Badge';
import { PaystackModal } from '../components/ui/PaystackModal';
import { WhatsAppButton } from '../components/ui/Buttons';
import { Timeline } from '../components/ui/Timeline';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const QuotePayment: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [paymentFailedError, setPaymentFailedError] = useState<string | null>(null);

  const fetchQuote = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const match = await OrdersService.getByQuoteToken(token);
      setOrder(match);
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [token]);

  // Handle Paystack simulation success
  const handlePaymentSuccess = async (reference: string) => {
    if (!token) return;
    setPaystackModalOpen(false);
    try {
      await PaymentsService.confirmPayment(token, reference, 'paystack');
      await fetchQuote();
      navigate(`/payment/result?status=success&ref=${reference}&code=${order?.orderCode}`);
    } catch (err: any) {
      setPaymentFailedError(err.message || 'Payment confirmation failed');
    }
  };

  // Handle Paystack simulation failure
  const handlePaymentFailure = (errorMessage: string) => {
    setPaystackModalOpen(false);
    setPaymentFailedError(errorMessage);
  };

  // -------------------------------------------------------------
  // STATE 7: Loading State
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">Verifying Quote Token...</h2>
          <p className="text-xs text-slate-500">Decrypting private dispatch booking details.</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 5: Invalid Token State
  // -------------------------------------------------------------
  if (!order || !order.quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">This quote link is not valid</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            We could not locate an active quote with this security token. It may have expired, been revised by our dispatch desk, or the URL is incomplete.
          </p>
          <div className="pt-2">
            <WhatsAppButton
              phone={DEFAULT_BUSINESS_SETTINGS.phone}
              message="Hello SDS, my quote payment link says it is not valid. Can you please check?"
              label="Contact Dispatch on WhatsApp"
              size="md"
              className="w-full"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            For security, quote details are only accessible via direct encrypted token links.
          </p>
        </div>
      </div>
    );
  }

  const { quote } = order;
  const isExpired = quote.status === 'expired' || new Date(quote.validUntil).getTime() < Date.now();
  const isRevoked = quote.status === 'revoked';
  const isPaid = order.paymentStatus === 'paid' || quote.status === 'accepted';

  // -------------------------------------------------------------
  // STATE 4: Revoked / Cancelled State
  // -------------------------------------------------------------
  if (isRevoked || order.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quote Inactive or Revoked</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {order.status === 'cancelled'
              ? `This order was cancelled. Reason: ${order.cancellationReason || 'Cancelled upon request.'}`
              : 'Our operations team has revised this quote. A new payment link will be sent to the registered customer on WhatsApp.'}
          </p>
          <div className="pt-2">
            <WhatsAppButton
              phone={DEFAULT_BUSINESS_SETTINGS.phone}
              message={`Hello SDS, checking on quote status for order ${order.orderCode}.`}
              label="Inquire on WhatsApp"
              size="md"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: Paid Receipt State
  // -------------------------------------------------------------
  if (isPaid && order.payment) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Payment Completed · Order Confirmed
            </span>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Official Delivery Receipt
            </h1>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your payment of <strong className="text-slate-900 font-mono">{formatNaira(order.payment.amountKobo)}</strong> has been verified. Courier dispatch is underway.
            </p>

            {/* Receipt Summary Details */}
            <div className="my-6 p-5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Order Tracking Code:</span>
                <strong className="font-mono text-slate-900">{order.orderCode}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono text-slate-700">{order.payment.reference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Timestamp:</span>
                <span className="text-slate-700">{formatLagosDate(order.payment.paidAt)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Method:</span>
                <span className="capitalize text-slate-700">{order.payment.method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-emerald-700">{formatNaira(order.payment.amountKobo)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/track?code=${encodeURIComponent(order.orderCode)}`}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-2"
              >
                <span>Track Delivery Milestones</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <WhatsAppButton
                phone={DEFAULT_BUSINESS_SETTINGS.phone}
                message={`Hello SDS, I have paid for delivery ${order.orderCode} (Ref: ${order.payment.reference}). Please confirm rider details.`}
                label="Message Dispatch"
                size="md"
              />
            </div>
          </div>

          {/* Timeline below paid receipt */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-6">
              Milestone Progress
            </h3>
            <Timeline events={order.timeline} currentStatus={order.status} showInternalNotes={false} />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: Expired Quote State
  // -------------------------------------------------------------
  if (isExpired) {
    const requoteMessage = `Hello SDS, my delivery quote for order ${order.orderCode} has expired. Could you please prepare a refreshed quote?`;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300">
            Quote Validity Lapsed
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            This Delivery Quote Has Expired
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Quotes are valid for 72 hours from issuance. Due to fuel and route pricing updates, this link is no longer payable. You can request a fast quote update via WhatsApp.
          </p>

          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs opacity-60 pointer-events-none">
            <div className="flex justify-between text-slate-400 pb-1">
              <span>Order Code:</span>
              <span className="font-mono">{order.orderCode}</span>
            </div>
            <div className="flex justify-between text-slate-400 pb-1">
              <span>Route:</span>
              <span>{order.sender.pickupAddress.city} to {order.receiver.deliveryAddress.city}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-500 pt-2 border-t border-slate-200">
              <span>Previous Total:</span>
              <span className="line-through">{formatNaira(quote.totalKobo)}</span>
            </div>
          </div>

          <div className="pt-2">
            <WhatsAppButton
              phone={DEFAULT_BUSINESS_SETTINGS.phone}
              message={requoteMessage}
              label="Ask SDS for a New Quote on WhatsApp"
              size="lg"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 1 & 6: Valid Quote Awaiting Payment (with Payment Failed banner if applicable)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* State 6: Payment Failed Alert (if simulation failed) */}
        {paymentFailedError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold">Transaction Unsuccessful</h3>
              <p className="mt-0.5">{paymentFailedError}</p>
            </div>
            <button
              onClick={() => setPaymentFailedError(null)}
              className="text-xs font-semibold text-rose-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
          {/* Header Bar */}
          <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                SDS
              </span>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Official Delivery Quote
                </span>
                <h1 className="text-lg font-bold text-white">Private Payment Invoice</h1>
              </div>
            </div>

            {/* Countdown */}
            <div>
              <Countdown validUntil={quote.validUntil} onExpire={() => fetchQuote()} />
            </div>
          </div>

          {/* Privacy Note Banner */}
          <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Anyone with this private link can view and pay this quote. Phone numbers are securely masked.
            </span>
          </div>

          {/* Route & Shipment Summary (MASKED CONTACT DATA PER PRD 7) */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Pickup info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Pickup Location
                </span>
                <p className="font-bold text-slate-900">
                  {order.sender.fullName.split(' ')[0]} {/* First name only */}
                </p>
                <p className="text-slate-600 font-mono text-[11px]">
                  {maskPhone(order.sender.phone)}
                </p>
                <p className="text-slate-700">
                  {order.sender.pickupAddress.streetAddress}, {order.sender.pickupAddress.city}, {order.sender.pickupAddress.state}
                </p>
              </div>

              {/* Delivery info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900">
                  {order.receiver.fullName.split(' ')[0]} {/* First name only */}
                </p>
                <p className="text-slate-600 font-mono text-[11px]">
                  {maskPhone(order.receiver.phone)}
                </p>
                <p className="text-slate-700">
                  {order.receiver.deliveryAddress.streetAddress}, {order.receiver.deliveryAddress.city}, {order.receiver.deliveryAddress.state}
                </p>
              </div>
            </div>

            {/* Payer and Item summary */}
            <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Item Summary</span>
                <span className="font-semibold text-slate-800">
                  {order.item.description} ({order.item.weightKg} kg, {order.item.size})
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">To Be Paid By</span>
                <span className="inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                  {order.whoPays}
                </span>
              </div>
            </div>

            {/* Dispatch Note (if any) */}
            {quote.notes && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Note from SDS Dispatch:</strong> {quote.notes}
              </div>
            )}
          </div>

          {/* Transparent Price Breakdown */}
          <div className="p-6 bg-slate-50/50 space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Official Price Breakdown
            </h2>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Courier Dispatch Fee</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatNaira(quote.basePriceKobo)}
                </span>
              </div>

              {quote.expressChargeKobo > 0 && (
                <div className="flex justify-between">
                  <span>Priority Express Dispatch Charge</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatNaira(quote.expressChargeKobo)}
                  </span>
                </div>
              )}

              {quote.heavyItemChargeKobo > 0 && (
                <div className="flex justify-between">
                  <span>Heavy / Bulky Item Surcharge</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatNaira(quote.heavyItemChargeKobo)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Secure Packaging & Insurance Handling</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatNaira(quote.handlingChargeKobo)}
                </span>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
                <div>
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <p className="text-[11px] text-slate-400">All taxes & transit fees included</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-extrabold text-emerald-700 tabular-nums">
                    {formatNaira(quote.totalKobo)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action Box */}
          <div className="p-6 sm:p-8 space-y-4">
            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I accept the delivery terms and confirm payment of <strong>{formatNaira(quote.totalKobo)}</strong> for dispatch of order <strong>{order.orderCode}</strong>.
              </span>
            </label>

            {/* Pay with Paystack button */}
            <button
              type="button"
              disabled={!termsAccepted}
              onClick={() => setPaystackModalOpen(true)}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay {formatNaira(quote.totalKobo)} with Paystack</span>
            </button>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paystack Verified</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Receipt</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paystack Modal */}
        <PaystackModal
          isOpen={paystackModalOpen}
          onClose={() => setPaystackModalOpen(false)}
          amountKobo={quote.totalKobo}
          customerEmail={order.sender.email || 'customer@sdsdelivery.ng'}
          orderCode={order.orderCode}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </div>
    </div>
  );
};
