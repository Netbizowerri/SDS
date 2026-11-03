import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Truck,
  Check,
} from 'lucide-react';
import { OrdersService, RidersService, AuthService } from '../../services/mock';
import { Order } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { CopyButton, WhatsAppButton } from '../../components/ui/Buttons';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const RiderJobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const riderId = currentUser?.riderId || 'rider-1';

  const loadJob = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const match = await OrdersService.getById(id);
      setOrder(match);
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-2">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-700">Job not found.</p>
        <Link to="/rider" className="text-xs text-emerald-700 font-bold underline">
          Back to Jobs List
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async (newStatus: 'picked_up' | 'in_transit') => {
    setIsUpdating(true);
    try {
      await RidersService.updateJobStatus(order.id, newStatus, riderId);
      await loadJob();
      setConfirmingAction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update job status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const pickupMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.sender.pickupAddress.streetAddress}, ${order.sender.pickupAddress.city}, Nigeria`
  )}`;

  const deliveryMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.receiver.deliveryAddress.streetAddress}, ${order.receiver.deliveryAddress.city}, Nigeria`
  )}`;

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/rider"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Jobs</span>
        </Link>

        <StatusBadge status={order.status} size="sm" />
      </div>

      {/* Order Header Card */}
      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">ORDER CODE</span>
          <span className="text-xs bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
            Trip Pay: {formatNaira(order.tripPayKobo || 350000)}
          </span>
        </div>
        <h1 className="text-xl font-mono font-bold tracking-wide">{order.orderCode}</h1>
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
          <span>Payment: <strong className="uppercase text-emerald-400">{order.paymentStatus}</strong></span>
          <span>Payer: <strong className="capitalize text-white">{order.whoPays}</strong></span>
        </div>
      </div>

      {/* Pickup Location Block */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">
              1. Pickup Location (Sender)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {order.sender.pickupDate} ({order.sender.pickupTimeSlot})
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-bold text-slate-900 text-sm">{order.sender.fullName}</p>
          <p className="text-slate-700 leading-snug">
            {order.sender.pickupAddress.streetAddress}, {order.sender.pickupAddress.city}, {order.sender.pickupAddress.state}
          </p>
          {order.sender.pickupAddress.landmark && (
            <p className="text-slate-500 text-[11px]">
              Landmark: <strong>{order.sender.pickupAddress.landmark}</strong>
            </p>
          )}
        </div>

        {/* Action Buttons: Call, WhatsApp, Copy, Maps */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <a
            href={`tel:${order.sender.phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-800 min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Sender</span>
          </a>

          <WhatsAppButton
            phone={order.sender.phone}
            message={`Hi ${order.sender.fullName}, this is your SDS delivery courier regarding pickup for order ${order.orderCode}.`}
            label="WhatsApp"
            size="sm"
          />

          <CopyButton
            text={`${order.sender.pickupAddress.streetAddress}, ${order.sender.pickupAddress.city}, Nigeria`}
            label="Copy Address"
            className="w-full justify-center min-h-[44px]"
          />

          <a
            href={pickupMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold text-slate-700 min-h-[44px]"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Maps</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Delivery Destination Block */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">
              2. Delivery Destination (Recipient)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            {order.receiver.preferredDeliveryDate || 'Same Day'}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-bold text-slate-900 text-sm">{order.receiver.fullName}</p>
          <p className="text-slate-700 leading-snug">
            {order.receiver.deliveryAddress.streetAddress}, {order.receiver.deliveryAddress.city}, {order.receiver.deliveryAddress.state}
          </p>
          {order.receiver.deliveryAddress.landmark && (
            <p className="text-slate-500 text-[11px]">
              Landmark: <strong>{order.receiver.deliveryAddress.landmark}</strong>
            </p>
          )}
        </div>

        {/* Action Buttons: Call, WhatsApp, Copy, Maps */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <a
            href={`tel:${order.receiver.phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-800 min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Call Recipient</span>
          </a>

          <WhatsAppButton
            phone={order.receiver.phone}
            message={`Hi ${order.receiver.fullName}, this is your SDS delivery courier on route with parcel ${order.orderCode}.`}
            label="WhatsApp"
            size="sm"
          />

          <CopyButton
            text={`${order.receiver.deliveryAddress.streetAddress}, ${order.receiver.deliveryAddress.city}, Nigeria`}
            label="Copy Address"
            className="w-full justify-center min-h-[44px]"
          />

          <a
            href={deliveryMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-semibold text-slate-700 min-h-[44px]"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Maps</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Package Specs & Special Instructions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-600" />
          Cargo & Handling Notes
        </h3>

        <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block">Category</span>
            <span className="font-semibold text-slate-900 capitalize">{order.item.itemType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Weight & Size</span>
            <span className="font-semibold text-slate-900">{order.item.weightKg} kg · {order.item.size}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 block">Description</span>
            <span className="text-slate-800">{order.item.description}</span>
          </div>
        </div>

        {order.item.specialInstructions && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
            <strong>Handling Instruction:</strong> {order.item.specialInstructions}
          </div>
        )}
      </div>

      {/* Proof of delivery if delivered */}
      {order.deliveryProof && (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Delivery Proof Captured</span>
          </div>
          <p className="text-slate-700">
            Signed by <strong>{order.deliveryProof.receiverName}</strong> on {formatLagosDate(order.deliveryProof.deliveredAt)}.
          </p>
          <div className="bg-white p-2 rounded border border-emerald-300 max-w-[200px] h-20 flex items-center justify-center">
            <img src={order.deliveryProof.signatureDataUrl} alt="Signature" className="max-h-full" />
          </div>
        </div>
      )}

      {/* STRICT SEQUENTIAL STATUS ACTION (SINGLE PRIMARY BUTTON) */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30">
        {order.status === 'assigned' && (
          <button
            onClick={() => setConfirmingAction('picked_up')}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Package className="w-4 h-4" />
            <span>Mark as Picked Up</span>
          </button>
        )}

        {order.status === 'picked_up' && (
          <button
            onClick={() => setConfirmingAction('in_transit')}
            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Truck className="w-4 h-4" />
            <span>Mark as In Transit</span>
          </button>
        )}

        {order.status === 'in_transit' && (
          <Link
            to={`/rider/jobs/${order.id}/signature`}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark as Delivered (Capture Signature)</span>
          </Link>
        )}

        {order.status === 'delivered' && (
          <div className="py-2.5 text-center text-xs text-emerald-800 font-bold bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Job Completed & Earned {formatNaira(order.tripPayKobo || 350000)}</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet Confirmation Modal */}
      {confirmingAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Status Update
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmingAction === 'picked_up'
                ? `Confirm you have physically inspected and collected the parcel from ${order.sender.fullName}?`
                : `Confirm you are on your way with the package to ${order.receiver.deliveryAddress.city}?`}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingAction(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(confirmingAction as any)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs min-h-[44px] flex items-center justify-center"
              >
                {isUpdating ? 'Updating...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
