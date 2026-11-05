import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { EarningsService, AuthService } from '../../services/mock';
import { formatNaira, formatLagosDate } from '../../lib/utils';
import { Order, Rider } from '../../types';

export const RiderEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<{
    rider: Rider | null;
    thisWeekKobo: number;
    thisMonthKobo: number;
    unpaidBalanceKobo: number;
    trips: Array<{ order: Order; amountKobo: number; isPaid: boolean }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const currentUser = AuthService.getCurrentUser();
  const riderId = currentUser?.riderId || '';

  useEffect(() => {
    EarningsService.getForRider(riderId).then((data) => {
      setEarnings(data);
      setIsLoading(false);
    });
  }, [riderId]);

  if (isLoading || !earnings) {
    return (
      <div className="p-8 text-center space-y-2">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-24">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Earnings & Payouts</h1>
        <p className="text-xs text-slate-500">Per-trip payments recorded by SDS operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Unpaid Balance - Prominent */}
        <div className="col-span-2 p-5 bg-slate-900 text-white rounded-2xl shadow space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Unpaid Accumulated Balance
          </span>
          <p className="text-2xl font-bold font-mono tracking-tight tabular-nums">
            {formatNaira(earnings.unpaidBalanceKobo)}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Settled weekly via bank transfer by SDS management.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Week</span>
          <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {formatNaira(earnings.thisWeekKobo)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Active cycle</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Earned</span>
          <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {formatNaira(earnings.thisMonthKobo)}
          </p>
          <span className="text-[10px] text-slate-500">{earnings.rider?.completedJobsCount || 0} trips completed</span>
        </div>
      </div>

      {/* Trip Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            Completed Trips Ledger
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {earnings.trips.length} records
          </span>
        </div>

        {earnings.trips.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No completed trips on record yet. Complete your first assigned run to see earnings!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {earnings.trips.map((trip, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono">
                    <span>{trip.order.orderCode}</span>
                    <span className="text-[10px] font-sans font-normal text-slate-500">
                      ({trip.order.sender.pickupAddress.city} → {trip.order.receiver.deliveryAddress.city})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatLagosDate(trip.order.deliveryProof?.deliveredAt || trip.order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-700 text-sm block">
                    {formatNaira(trip.amountKobo)}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Unpaid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
