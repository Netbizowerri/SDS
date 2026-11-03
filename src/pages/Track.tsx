import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { OrdersService, RidersService } from '../services/mock';
import { Order, Rider } from '../types';
import { Timeline } from '../components/ui/Timeline';
import { StatusBadge } from '../components/ui/Badge';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';
import { formatLagosDate, formatNaira } from '../lib/utils';

export const Track: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [orderCode, setOrderCode] = useState(initialCode);
  const [contactInfo, setContactInfo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);

  // If a valid demo code was passed in, auto-lookup with hint or sender phone
  useEffect(() => {
    if (initialCode) {
      // Auto-populate for reviewer convenience if matches seed demo order
      if (initialCode.toUpperCase() === 'SDS-829410') setContactInfo('08031112233');
      if (initialCode.toUpperCase() === 'SDS-829411') setContactInfo('08067778899');
      if (initialCode.toUpperCase() === 'SDS-829412') setContactInfo('08093334455');
      if (initialCode.toUpperCase() === 'SDS-829413') setContactInfo('08124445566');
      if (initialCode.toUpperCase() === 'SDS-829414') setContactInfo('08037654321');
      if (initialCode.toUpperCase() === 'SDS-829415') setContactInfo('08023334411');
      if (initialCode.toUpperCase() === 'SDS-829416') setContactInfo('08098881234');
      if (initialCode.toUpperCase() === 'SDS-829417') setContactInfo('08039991122');
    }
  }, [initialCode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !contactInfo.trim()) {
      setErrorMessage('Please enter both your tracking code and the phone number or email used.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setOrder(null);
    setRider(null);

    try {
      const match = await OrdersService.getByTrackingLookup(orderCode, contactInfo);
      if (!match) {
        // Neutral error message that reveals nothing per PRD 6.3
        setErrorMessage("We couldn't find a matching order. Please verify your tracking code and phone number.");
      } else {
        setOrder(match);
        if (match.assignedRiderId) {
          const r = await RidersService.getById(match.assignedRiderId);
          setRider(r);
        }
      }
    } catch {
      setErrorMessage("We couldn't find a matching order. Please verify your details.");
    } finally {
      setIsSearching(false);
    }
  };

  const supportMessage = order
    ? `Hello SDS Support, I am inquiring about order ${order.orderCode} (Status: ${order.status}).`
    : `Hello SDS Support, I need assistance tracking my package.`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Your Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Enter your SDS tracking code along with the phone number or email registered on the request.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tracking Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDS-829417"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono uppercase tracking-wide focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Sender or Receiver Phone / Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Phone or email on booking"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Demo Hint */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1">
              <span>
                Demo test: Try code <button type="button" onClick={() => { setOrderCode('SDS-829417'); setContactInfo('08039991122'); }} className="text-emerald-700 font-mono underline font-medium">SDS-829417</button> (Delivered with signature) or <button type="button" onClick={() => { setOrderCode('SDS-829416'); setContactInfo('08098881234'); }} className="text-emerald-700 font-mono underline font-medium">SDS-829416</button> (In transit)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Looking up delivery records...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Package</span>
                </>
              )}
            </button>
          </form>

          {/* Neutral Error state */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Search Results Display */}
        {order && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {/* Order Header Banner */}
            <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-mono">TRACKING ID</span>
                <h2 className="text-xl font-mono font-bold text-white tracking-wide">
                  {order.orderCode}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Route: <strong>{order.sender.pickupAddress.city}</strong> ({order.sender.pickupAddress.state}) → <strong>{order.receiver.deliveryAddress.city}</strong> ({order.receiver.deliveryAddress.state})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">CURRENT STATUS</span>
                <StatusBadge status={order.status} size="md" />
              </div>
            </div>

            {/* Assigned Rider Contact Strip (shown once assigned) */}
            {rider && (
              <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {rider.fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-700 font-semibold uppercase">
                      Dedicated Dispatch Courier
                    </span>
                    <h3 className="font-bold text-slate-900">{rider.fullName}</h3>
                    <p className="text-slate-600 capitalize">Vehicle: {rider.vehicleType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${rider.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-semibold shadow-sm text-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Courier</span>
                  </a>

                  <WhatsAppButton
                    phone={rider.phone}
                    message={`Hi ${rider.fullName}, checking on delivery status for SDS order ${order.orderCode}.`}
                    label="WhatsApp"
                    size="sm"
                  />
                </div>
              </div>
            )}

            {/* Delivery Proof Card (if delivered) */}
            {order.deliveryProof && (
              <div className="p-6 bg-emerald-50/40 border-b border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Proof of Delivery Confirmed
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Accepted in Person By</span>
                    <strong className="text-slate-900 text-sm">{order.deliveryProof.receiverName}</strong>
                    <span className="text-slate-500 block text-[11px] mt-1">
                      Time: {formatLagosDate(order.deliveryProof.deliveredAt)}
                    </span>
                    {order.deliveryProof.note && (
                      <p className="text-slate-600 text-[11px] mt-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                        "{order.deliveryProof.note}"
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Captured Recipient Signature</span>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 h-24 flex items-center justify-center">
                      <img
                        src={order.deliveryProof.signatureDataUrl}
                        alt="Digital delivery signature"
                        className="max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Specification Summary */}
            <div className="p-6 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
                Shipment Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Item Category</span>
                  <span className="font-semibold text-slate-800 capitalize">{order.item.itemType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Weight</span>
                  <span className="font-semibold text-slate-800">{order.item.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Priority</span>
                  <span className="font-semibold text-slate-800">{order.item.isExpress ? 'Express Priority' : 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment</span>
                  <span className="font-semibold text-slate-800 capitalize">{order.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-6">
                Milestone Progress Timeline
              </h3>
              <Timeline events={order.timeline} currentStatus={order.status} showInternalNotes={false} />
            </div>

            {/* Support Action */}
            <div className="p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Need help or routing modification?
              </span>
              <WhatsAppButton
                phone={DEFAULT_BUSINESS_SETTINGS.phone}
                message={supportMessage}
                label="Chat with Dispatch Support"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
