import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Phone,
  Mail,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCw,
  Search,
} from 'lucide-react';
import { RidersService, EarningsService, AuthService } from '../../services/mock';
import { Rider, RiderPayout } from '../../types';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const AdminRiders: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [payouts, setPayouts] = useState<RiderPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add rider modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderEmail, setNewRiderEmail] = useState('');
  const [newRiderVehicle, setNewRiderVehicle] = useState<'motorcycle' | 'van' | 'car'>('motorcycle');

  // Record payout modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedRiderForPayout, setSelectedRiderForPayout] = useState<Rider | null>(null);
  const [payoutAmountNaira, setPayoutAmountNaira] = useState(20000);
  const [payoutRef, setPayoutRef] = useState('');

  const currentUser = AuthService.getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rList, pList] = await Promise.all([
        RidersService.list(),
        EarningsService.listPayouts(),
      ]);
      setRiders(rList);
      setPayouts(pList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName.trim() || !newRiderPhone.trim()) return;

    try {
      await RidersService.create({
        fullName: newRiderName,
        phone: newRiderPhone,
        email: newRiderEmail || `${newRiderName.toLowerCase().replace(/\s+/g, '.')}@sdsdelivery.com`,
        vehicleType: newRiderVehicle,
        status: 'active',
      });
      await loadData();
      setAddModalOpen(false);
      setNewRiderName('');
      setNewRiderPhone('');
      setNewRiderEmail('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRiderForPayout) return;

    try {
      const ref = payoutRef.trim() || `PAYOUT-${Date.now().toString().slice(-6)}`;
      await EarningsService.recordPayout(
        selectedRiderForPayout.id,
        payoutAmountNaira * 100,
        ref
      );
      await loadData();
      setPayoutModalOpen(false);
      setSelectedRiderForPayout(null);
      alert('Payout recorded! Trips updated and rider balance adjusted.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dispatch Couriers & Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage rider profiles, vehicle assignments, and trip payment records.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Courier</span>
        </button>
      </div>

      {/* Manager Permission Note if not Owner */}
      {!isOwner && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
          <strong>Manager View:</strong> Courier rosters and contact details are available. Financial balances and payout records are restricted to Owner.
        </div>
      )}

      {/* Rider Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riders.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  {r.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{r.fullName}</h3>
                  <p className="text-xs text-slate-500 capitalize">{r.vehicleType}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{r.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{r.email}</span>
              </div>
            </div>

            {/* Financial Ledger (Owner Only) */}
            {isOwner && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Unpaid Trips Balance:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatNaira(r.unpaidEarningsKobo)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Completed Runs:</span>
                  <span>{r.completedJobsCount} trips</span>
                </div>

                {r.unpaidEarningsKobo > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRiderForPayout(r);
                      setPayoutAmountNaira(r.unpaidEarningsKobo / 100);
                      setPayoutRef(`PAYOUT-${Date.now().toString().slice(-6)}`);
                      setPayoutModalOpen(true);
                    }}
                    className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Record Payout
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payout History Ledger (Owner Only) */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Recorded Rider Payouts (Bank Settlement History)
            </h2>
            <span className="text-xs text-slate-400 font-mono">{payouts.length} disbursements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Payout Ref</th>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Trips Settled</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => {
                  const rider = riders.find((r) => r.id === p.riderId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{rider?.fullName || p.riderId}</td>
                      <td className="py-3 px-4 text-slate-500">{formatLagosDate(p.paidAt)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatNaira(p.amountKobo)}</td>
                      <td className="py-3 px-4 text-slate-600">{p.tripsCount} trips</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Settled
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Rider Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateRider} className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Courier to Fleet</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Jinadu"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 803 000 0000"
                  value={newRiderPhone}
                  onChange={(e) => setNewRiderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="courier@sdsdelivery.com"
                  value={newRiderEmail}
                  onChange={(e) => setNewRiderEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={newRiderVehicle}
                  onChange={(e) => setNewRiderVehicle(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="van">Delivery Van</option>
                  <option value="car">Saloon Car</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Payout Modal */}
      {payoutModalOpen && selectedRiderForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleRecordPayout} className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Record Bank Settlement for {selectedRiderForPayout.fullName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payout Amount (NGN)</label>
                <input
                  type="number"
                  required
                  value={payoutAmountNaira}
                  onChange={(e) => setPayoutAmountNaira(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Reference ID</label>
                <input
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
