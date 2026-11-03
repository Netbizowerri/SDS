import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { OrdersService, RidersService, AuthService } from '../../services/mock';
import { Order } from '../../types';
import { SignaturePad } from '../../components/ui/SignaturePad';

export const RiderSignature: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const riderId = currentUser?.riderId || 'rider-1';

  useEffect(() => {
    if (!id) return;
    OrdersService.getById(id).then((ord) => {
      if (ord) {
        setOrder(ord);
        setReceiverName(ord.receiver.fullName);
      }
    });
  }, [id]);

  if (!order) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-xs text-slate-500">Loading order...</p>
      </div>
    );
  }

  const handleSaveSignature = async (dataUrl: string) => {
    setIsSubmitting(true);
    try {
      await RidersService.submitSignature(
        order.id,
        {
          receiverName,
          signatureDataUrl: dataUrl,
          deliveredAt: new Date().toISOString(),
          note: deliveryNote || undefined,
        },
        riderId
      );

      setSuccess(true);
      setTimeout(() => {
        navigate(`/rider/jobs/${order.id}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit signature proof.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center space-y-4 my-12 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Delivery Confirmed!</h2>
        <p className="text-xs text-slate-600">
          Signature captured for {receiverName}. Trip pay has been credited to your earnings ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/rider/jobs/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>
        <span className="text-xs font-mono font-bold text-slate-900">{order.orderCode}</span>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
          Final Handover Step
        </span>
        <h1 className="text-lg font-bold">Capture Proof of Delivery</h1>
        <p className="text-xs text-slate-300">
          Please ask the recipient to sign with their finger or stylus below.
        </p>
      </div>

      {/* Signature Pad Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <SignaturePad
          receiverName={receiverName}
          onReceiverNameChange={setReceiverName}
          note={deliveryNote}
          onNoteChange={setDeliveryNote}
          onSave={handleSaveSignature}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Stored securely with timestamp and receiver identification.</span>
      </div>
    </div>
  );
};
