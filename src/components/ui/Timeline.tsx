import React from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  UserCheck,
  Package,
  Truck,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { TimelineEvent, OrderStatus } from '../../types';
import { formatLagosDate } from '../../lib/utils';

interface TimelineProps {
  events: TimelineEvent[];
  currentStatus: OrderStatus;
  showInternalNotes?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  currentStatus,
  showInternalNotes = false,
}) => {
  const filteredEvents = showInternalNotes
    ? events
    : events.filter((e) => !e.isInternal);

  const getStatusIcon = (status?: OrderStatus, isInternal?: boolean) => {
    if (isInternal) {
      return <Lock className="w-4 h-4 text-purple-600" />;
    }
    switch (status) {
      case 'requested':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'quoted':
        return <Send className="w-4 h-4 text-sky-600" />;
      case 'awaiting_payment':
      case 'paid':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'assigned':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'picked_up':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-cyan-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {filteredEvents.map((event, index) => {
          const isLast = index === filteredEvents.length - 1;
          const isLatest = index === filteredEvents.length - 1;

          return (
            <li key={event.id || index}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3.5">
                  {/* Icon circle */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white shadow-sm shrink-0 ${
                      event.isInternal
                        ? 'bg-purple-100'
                        : isLatest
                        ? 'bg-emerald-100 ring-emerald-50'
                        : 'bg-slate-100'
                    }`}
                  >
                    {getStatusIcon(event.status, event.isInternal)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-semibold ${
                          isLatest ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {event.title}
                      </h4>
                      <time className="text-xs text-slate-400 font-mono tabular-nums">
                        {formatLagosDate(event.timestamp)}
                      </time>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Actor tag */}
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="capitalize">
                        Actor: <strong className="text-slate-600 font-medium">{event.actor}</strong>
                      </span>
                      {event.isInternal && (
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                          Staff Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
