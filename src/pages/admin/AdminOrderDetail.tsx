import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Clock,
  User,
  MapPin,
  Send,
  CreditCard,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Lock,
  RotateCw,
  Plus,
} from 'lucide-react';
import {
  OrdersService,
  QuotesService,
  PaymentsService,
  RidersService,
  AuthService,
  SettingsService,
} from '../../services/mock';
import { Order, Rider, BusinessSettings } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { CopyButton, WhatsAppButton } from '../../components/ui/Buttons';
import { Timeline } from '../../components/ui/Timeline';
import { formatNaira, formatLagosDate, buildWhatsAppLink } from '../../lib/utils';
import { DEFAULT_BUSINESS_SETTINGS } from '../../config/business';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'request' | 'quote' | 'payment' | 'rider' | 'timeline'>('quote');

  // Quote Composer Form State
  const [basePriceNaira, setBasePriceNaira] = useState(8000);
  const [isExpress, setIsExpress] = useState(false);
  const [expressChargeNaira, setExpressChargeNaira] = useState(3500);
  const [heavyItemChargeNaira, setHeavyItemChargeNaira] = useState(0);
  const [handlingChargeNaira, setHandlingChargeNaira] = useState(1500);
  const [validityHours, setValidityHours] = useState(72);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  // Manual Payment Modal
  const [manualPayOpen, setManualPayOpen] = useState(false);
  const [manualPayReason, setManualPayReason] = useState('Customer paid via direct GTBank transfer');

  // Rider Assignment State
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [tripPayNaira, setTripPayNaira] = useState(3500);
  const [isAssigning, setIsAssigning] = useState(false);

  // Exception Modals
  const [exceptionType, setExceptionType] = useState<'cancel' | 'delay' | 'damage' | null>(null);
  const [exceptionReason, setExceptionReason] = useState('');

  // Internal Note State
  const [newNote, setNewNote] = useState('');

  const currentUser = AuthService.getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [ord, rList, st] = await Promise.all([
        OrdersService.getById(id),
        RidersService.list(),
        SettingsService.get(),
      ]);
      setOrder(ord);
      setRiders(rList);
      setSettings(st);

      if (ord?.quote) {
        setBasePriceNaira(ord.quote.basePriceKobo / 100);
        setExpressChargeNaira(ord.quote.expressChargeKobo / 100);
        setIsExpress(ord.quote.expressChargeKobo > 0);
        setHeavyItemChargeNaira(ord.quote.heavyItemChargeKobo / 100);
        setHandlingChargeNaira(ord.quote.handlingChargeKobo / 100);
        setValidityHours(ord.quote.validityHours || 72);
        setQuoteNotes(ord.quote.notes || '');
      } else if (ord) {
        setIsExpress(ord.item.isExpress);
      }

      if (ord?.assignedRiderId) {
        setSelectedRiderId(ord.assignedRiderId);
      } else if (rList.length > 0) {
        setSelectedRiderId(rList[0].id);
      }

      if (ord?.tripPayKobo) {
        setTripPayNaira(ord.tripPayKobo / 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading || !order) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Retrieving order dossier...</p>
      </div>
    );
  }

  // Quote calculations
  const totalQuoteKobo =
    (Number(basePriceNaira) +
      (isExpress ? Number(expressChargeNaira) : 0) +
      Number(heavyItemChargeNaira) +
      Number(handlingChargeNaira)) *
    100;

  const currentHost = window.location.origin;
  const quoteUrl = order.quote ? `${currentHost}/quote/${order.quote.token}` : '';

  // Prefilled WhatsApp quote message
  const quoteWhatsappMessage = order.quote
    ? settings.quoteWhatsappTemplate
        .replace('{customerName}', order.whoPays === 'sender' ? order.sender.fullName : order.receiver.fullName)
        .replace('{orderCode}', order.orderCode)
        .replace('{total}', formatNaira(order.quote.totalKobo))
        .replace('{link}', quoteUrl)
        .replace('{validUntil}', formatLagosDate(order.quote.validUntil))
    : '';

  const customerPhone = order.whoPays === 'sender' ? order.sender.phone : order.receiver.phone;

  // Handle Generate / Revise Quote Link
  const handleGenerateQuote = async (isRevise = false) => {
    setIsGeneratingQuote(true);
    try {
      const res = await QuotesService.generateLink(order.id, {
        basePriceKobo: Number(basePriceNaira) * 100,
        expressChargeKobo: isExpress ? Number(expressChargeNaira) * 100 : 0,
        heavyItemChargeKobo: Number(heavyItemChargeNaira) * 100,
        handlingChargeKobo: Number(handlingChargeNaira) * 100,
        validityHours: Number(validityHours),
        notes: quoteNotes || undefined,
      });
      setOrder(res.order);
      alert(isRevise ? 'Quote revised! Old token invalidated and new link created.' : 'Quote link generated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error creating quote.');
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  // Revoke quote
  const handleRevokeQuote = async () => {
    if (window.confirm('Are you sure you want to revoke this quote link? The customer will no longer be able to pay.')) {
      const updated = await QuotesService.revokeLink(order.id);
      setOrder(updated);
    }
  };

  // Handle Manual Payment
  const handleManualPayment = async () => {
    if (!order.quote) return;
    try {
      const updated = await PaymentsService.markPaidManually(order.id, order.quote.totalKobo, manualPayReason);
      setOrder(updated);
      setManualPayOpen(false);
      alert('Order marked as paid manually (Bank Transfer recorded).');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Rider Assignment
  const handleAssignRider = async () => {
    if (!selectedRiderId) return;
    setIsAssigning(true);
    try {
      const updated = await RidersService.assign(order.id, selectedRiderId, Number(tripPayNaira) * 100);
      setOrder(updated);
      alert('Courier assigned successfully! You can now send them the dispatch instructions.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Exception Submission
  const handleApplyException = async () => {
    if (!exceptionReason.trim()) return;
    try {
      if (exceptionType === 'cancel') {
        const updated = await OrdersService.updateStatus(order.id, 'cancelled', exceptionReason, 'admin');
        setOrder(updated);
      } else {
        await OrdersService.addNote(order.id, `EXCEPTION [${exceptionType?.toUpperCase()}]: ${exceptionReason}`, false);
        await loadData();
      }
      setExceptionType(null);
      setExceptionReason('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Add Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = await OrdersService.addNote(order.id, newNote.trim(), true);
    setOrder(updated);
    setNewNote('');
  };

  const assignedRider = riders.find((r) => r.id === order.assignedRiderId);

  // Rider WhatsApp instruction message
  const riderWhatsappMessage = assignedRider
    ? settings.riderWhatsappTemplate
        .replace('{riderName}', assignedRider.fullName)
        .replace('{orderCode}', order.orderCode)
        .replace('{pickupCity}', order.sender.pickupAddress.city)
        .replace('{deliveryCity}', order.receiver.deliveryAddress.city)
        .replace('{pickupTime}', order.sender.pickupTimeSlot)
        .replace('{tripPay}', formatNaira(order.tripPayKobo || 350000))
        .replace('{link}', `${currentHost}/rider/jobs/${order.id}`)
    : '';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
              {order.orderCode}
            </h1>
            <StatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Created on {formatLagosDate(order.createdAt)} · Designated Payer: <strong className="capitalize text-slate-800">{order.whoPays}</strong>
          </p>
        </div>

        {/* Quick Exception Trigger Buttons */}
        <div className="flex items-center gap-2">
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={() => {
                setExceptionType('cancel');
                setExceptionReason('Customer requested cancellation prior to delivery.');
              }}
              className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => {
              setExceptionType('delay');
              setExceptionReason('Transit delay due to heavy road traffic / vehicle check.');
            }}
            className="px-3 py-1.5 border border-amber-200 hover:bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Report Delay
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 text-xs font-semibold text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quote')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'quote'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Quote Composer & WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'request'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Request & Cargo Dossier
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'payment'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Payment Management
        </button>
        <button
          onClick={() => setActiveTab('rider')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rider'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Rider Assignment & Proof
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Timeline & Staff Notes
        </button>
      </div>

      {/* TAB 1: QUOTE COMPOSER */}
      {activeTab === 'quote' && (
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Active quote link banner if exists */}
          {order.quote && (
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
                  <span className="text-xs font-bold text-sky-950 uppercase">
                    Active Private Quote Link ({order.quote.status})
                  </span>
                </div>
                <span className="text-xs text-sky-800 font-mono">
                  Valid until {formatLagosDate(order.quote.validUntil)}
                </span>
              </div>

              {/* Warning per PRD 7 */}
              <p className="text-[11px] text-sky-900 font-medium">
                ⚠️ Anyone with this private token link can view and pay this quote. Phone numbers are automatically masked on the customer view.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={quoteUrl}
                  className="flex-1 min-w-[280px] px-3 py-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-slate-800 select-all"
                />
                <CopyButton text={quoteUrl} label="Copy Link" />
                <a
                  href={quoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-sky-300 rounded-lg text-xs font-semibold text-sky-800 hover:bg-sky-100 flex items-center gap-1"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* WhatsApp prefilled link */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <WhatsAppButton
                  phone={customerPhone}
                  message={quoteWhatsappMessage}
                  label={`Send Quote to Customer WhatsApp (${customerPhone})`}
                  size="sm"
                />

                <button
                  onClick={handleRevokeQuote}
                  className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 underline font-medium"
                >
                  Revoke this link
                </button>
              </div>
            </div>
          )}

          {/* Pricing Calculation Form */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {order.quote ? 'Revise or Update Quote Pricing' : 'Compose Route Quote'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Base Delivery Fee (NGN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={basePriceNaira}
                  onChange={(e) => setBasePriceNaira(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Express Priority Fee (NGN)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={isExpress}
                    onChange={(e) => setIsExpress(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <input
                    type="number"
                    disabled={!isExpress}
                    value={expressChargeNaira}
                    onChange={(e) => setExpressChargeNaira(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Heavy/Bulky Cargo Surcharge (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={heavyItemChargeNaira}
                  onChange={(e) => setHeavyItemChargeNaira(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Handling & Insurance Fee (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="250"
                  value={handlingChargeNaira}
                  onChange={(e) => setHandlingChargeNaira(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Validity Window (Hours, 24-72) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="24"
                  max="72"
                  value={validityHours}
                  onChange={(e) => setValidityHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Note to Customer (Included on Quote Page)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rate includes fragile box packaging and interstate toll pass."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Total Display */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Computed Quote Total
                </span>
                <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                  {formatNaira(totalQuoteKobo)}
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingQuote}
                onClick={() => handleGenerateQuote(Boolean(order.quote))}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                {isGeneratingQuote ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{order.quote ? 'Revise Quote (New Token)' : 'Generate Private Quote Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST & CARGO DOSSIER */}
      {activeTab === 'request' && (
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Sender */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Sender & Pickup Information
              </span>
              <div className="space-y-1 text-slate-700 pt-1">
                <p><strong>Name:</strong> {order.sender.fullName}</p>
                <p><strong>Phone:</strong> {order.sender.phone}</p>
                <p><strong>Email:</strong> {order.sender.email || 'Not provided'}</p>
                <p><strong>Pickup Date:</strong> {order.sender.pickupDate} ({order.sender.pickupTimeSlot})</p>
                <p><strong>Address:</strong> {order.sender.pickupAddress.streetAddress}, {order.sender.pickupAddress.city}, {order.sender.pickupAddress.state}</p>
                {order.sender.pickupAddress.landmark && (
                  <p className="text-slate-500"><strong>Landmark:</strong> {order.sender.pickupAddress.landmark}</p>
                )}
              </div>
            </div>

            {/* Receiver */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Receiver & Delivery Destination
              </span>
              <div className="space-y-1 text-slate-700 pt-1">
                <p><strong>Name:</strong> {order.receiver.fullName}</p>
                <p><strong>Phone:</strong> {order.receiver.phone}</p>
                <p><strong>Email:</strong> {order.receiver.email || 'Not provided'}</p>
                <p><strong>Preferred Date:</strong> {order.receiver.preferredDeliveryDate || 'Standard'}</p>
                <p><strong>Address:</strong> {order.receiver.deliveryAddress.streetAddress}, {order.receiver.deliveryAddress.city}, {order.receiver.deliveryAddress.state}</p>
                {order.receiver.deliveryAddress.landmark && (
                  <p className="text-slate-500"><strong>Landmark:</strong> {order.receiver.deliveryAddress.landmark}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cargo Specs */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-600" /> Cargo Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block">Category</span>
                <strong className="capitalize">{order.item.itemType}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Weight</span>
                <strong>{order.item.weightKg} kg</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Package Size</span>
                <strong className="capitalize">{order.item.size.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Express Priority</span>
                <strong>{order.item.isExpress ? 'Yes (Priority)' : 'No (Standard)'}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-400 block">Description</span>
              <p className="text-slate-800">{order.item.description}</p>
            </div>

            {order.item.specialInstructions && (
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                <strong>Handling Note:</strong> {order.item.specialInstructions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT MANAGEMENT */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Payment Status & Reconciliation
            </h2>
            <span className="capitalize text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
              Status: {order.paymentStatus}
            </span>
          </div>

          {order.payment ? (
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Verified Payment Record
                </span>
                <span className="text-emerald-800 font-mono">
                  {formatLagosDate(order.payment.paidAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Amount Paid</span>
                  <span className="font-mono text-base font-bold text-emerald-800">
                    {formatNaira(order.payment.amountKobo)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Payment Method</span>
                  <span className="font-semibold capitalize">{order.payment.method.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Reference ID</span>
                  <span className="font-mono font-medium">{order.payment.reference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Payer Designation</span>
                  <span className="capitalize font-semibold">{order.payment.payer}</span>
                </div>
              </div>

              {order.payment.manualReason && (
                <div className="p-2.5 bg-white rounded border border-emerald-300 text-slate-700">
                  <strong>Manual Note:</strong> {order.payment.manualReason}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>No verified online payment recorded yet.</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                If the customer has paid via direct bank transfer into SDS account, you can manually record and mark this order as paid.
              </p>

              <button
                onClick={() => setManualPayOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Mark as Paid Manually (Bank Transfer)
              </button>
            </div>
          )}

          {/* Manual Payment Dialog */}
          {manualPayOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Manual Bank Transfer Payment
                </h3>
                <p className="text-xs text-slate-600">
                  Total amount to reconcile: <strong>{formatNaira(order.quote?.totalKobo || 0)}</strong>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason / Bank Confirmation Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualPayReason}
                    onChange={(e) => setManualPayReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setManualPayOpen(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualPayment}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Confirm & Mark Paid
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RIDER ASSIGNMENT & PROOF */}
      {activeTab === 'rider' && (
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              Manual Dispatch Assignment
            </h2>
            <p className="text-xs text-slate-500">
              Assign a dedicated dispatch courier. Once assigned, rider contact coordinates will display on the customer's tracking timeline.
            </p>
          </div>

          {/* Payment guard warning per PRD 9 */}
          {order.paymentStatus !== 'paid' && !isOwner && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Rider assignment is locked until payment is verified.</span>
            </div>
          )}

          {/* Assignment Box */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Select Dispatch Courier
                </label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.vehicleType.toUpperCase()}) · {r.completedJobsCount} runs completed
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Trip Pay Amount (NGN)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={tripPayNaira}
                  onChange={(e) => setTripPayNaira(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleAssignRider}
              disabled={isAssigning}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{order.assignedRiderId ? 'Reassign Courier' : 'Assign Courier'}</span>
            </button>
          </div>

          {/* Assigned Rider Info & WhatsApp Dispatch message */}
          {assignedRider && (
            <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Currently Assigned: {assignedRider.fullName}
                </span>
                <span className="text-indigo-800 font-mono">Trip Pay: {formatNaira(order.tripPayKobo || 350000)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <WhatsAppButton
                  phone={assignedRider.phone}
                  message={riderWhatsappMessage}
                  label={`Dispatch Job to Rider WhatsApp (${assignedRider.phone})`}
                  size="sm"
                />
                <CopyButton text={riderWhatsappMessage} label="Copy Message" />
              </div>
            </div>
          )}

          {/* Delivery Proof (if delivered) */}
          {order.deliveryProof && (
            <div className="p-5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3 text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Delivery Handover Proof
              </span>
              <p>Accepted by: <strong>{order.deliveryProof.receiverName}</strong> on {formatLagosDate(order.deliveryProof.deliveredAt)}</p>
              <div className="bg-white p-2 border border-emerald-300 rounded max-w-xs h-24 flex items-center justify-center">
                <img src={order.deliveryProof.signatureDataUrl} alt="Signature" className="max-h-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TIMELINE & STAFF NOTES */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Add Staff Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Add Internal Staff Note (Visible to Operations Only)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Sender phoned, requested courier call 15 mins before arrival..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0"
              >
                Save Note
              </button>
            </div>
          </form>

          {/* Timeline View */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-6">
              Complete Event Progression
            </h3>
            <Timeline events={order.timeline} currentStatus={order.status} showInternalNotes={true} />
          </div>
        </div>
      )}

      {/* Exception Reason Modal */}
      {exceptionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 capitalize">
              Record Order Exception: {exceptionType}
            </h3>
            <p className="text-xs text-slate-600">
              Provide an operational explanation. This will be permanently recorded in the order timeline and staff notes.
            </p>
            <textarea
              rows={3}
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setExceptionType(null)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyException}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
              >
                Apply Exception
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
