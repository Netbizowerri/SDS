import React from 'react';
import {
  Clock,
  Send,
  CreditCard,
  UserCheck,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { OrderStatus, PaymentStatus, QuoteStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus | PaymentStatus | QuoteStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'requested':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>New Request</span>
        </span>
      );
    case 'quoted':
    case 'sent':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/60 ${sizeClasses}`}>
          <Send className="w-3.5 h-3.5 shrink-0 text-sky-600" />
          <span>Quote Sent</span>
        </span>
      );
    case 'awaiting_payment':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 ${sizeClasses}`}>
          <CreditCard className="w-3.5 h-3.5 shrink-0 text-blue-600" />
          <span>Awaiting Payment</span>
        </span>
      );
    case 'paid':
    case 'accepted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span>Paid</span>
        </span>
      );
    case 'assigned':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/60 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
          <span>Rider Assigned</span>
        </span>
      );
    case 'picked_up':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60 ${sizeClasses}`}>
          <Package className="w-3.5 h-3.5 shrink-0 text-purple-600" />
          <span>Picked Up</span>
        </span>
      );
    case 'in_transit':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200/60 ${sizeClasses}`}>
          <Truck className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
          <span>In Transit</span>
        </span>
      );
    case 'delivered':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
          <span>Delivered</span>
        </span>
      );
    case 'cancelled':
    case 'revoked':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/60 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{status === 'revoked' ? 'Quote Revoked' : 'Cancelled'}</span>
        </span>
      );
    case 'expired':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span>Quote Expired</span>
        </span>
      );
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span>Draft Quote</span>
        </span>
      );
    case 'unpaid':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <CreditCard className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Unpaid</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
