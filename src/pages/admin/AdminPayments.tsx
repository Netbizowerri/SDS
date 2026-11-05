import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Download,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PaymentsService } from '../../services/mock';
import { Order, PaymentRecord } from '../../types';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Array<{ order: Order; payment: PaymentRecord }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    PaymentsService.list().then((data) => {
      setPayments(data);
      setIsLoading(false);
    });
  }, []);

  const totalCollectedKobo = payments.reduce((sum, item) => sum + item.payment.amountKobo, 0);

  const filtered = payments.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.order.orderCode.toLowerCase().includes(q) ||
      item.payment.reference.toLowerCase().includes(q) ||
      item.order.sender.fullName.toLowerCase().includes(q) ||
      item.order.receiver.fullName.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Order Code', 'Reference', 'Amount (NGN)', 'Method', 'Payer', 'Date'];
    const rows = payments.map((p) => [
      p.order.orderCode,
      p.payment.reference,
      (p.payment.amountKobo / 100).toFixed(2),
      p.payment.method,
      p.payment.payer,
      p.payment.paidAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sds_payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Payments & Collections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Payments confirmed manually by SDS operations staff.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Inflow
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatNaira(totalCollectedKobo)}
          </p>
          <span className="text-[11px] text-slate-500">Gross carriage collections</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Transactions Verified
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {payments.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">100% successful conversion</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Payment Processor
          </span>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg pt-1">
            <span className="text-emerald-600 font-extrabold tracking-tight">paystack</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-normal px-1.5 py-0.5 rounded">
              + Bank Transfer
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Automated webhooks active</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, order code, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">
            {filtered.length} entries
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Payment Reference</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      <Link to={`/admin/orders/${item.order.id}`} className="hover:text-emerald-700">
                        {item.order.orderCode}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{item.payment.reference}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.order.sender.fullName}</td>
                    <td className="py-3 px-3 capitalize text-slate-600">{item.payment.payer}</td>
                    <td className="py-3 px-3 capitalize text-slate-600">{item.payment.method.replace('_', ' ')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {formatNaira(item.payment.amountKobo)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatLagosDate(item.payment.paidAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
