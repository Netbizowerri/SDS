import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Send,
  UserCheck,
  Truck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { OrdersService } from '../../services/mock';
import { Order } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequestNotice, setNewRequestNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    OrdersService.list().then((data) => {
      if (!active) return;
      setOrders(data);
      setIsLoading(false);
      unsubscribe = OrdersService.subscribeToNewRequests((requests) => {
        setOrders((current) => [...current.filter((order) => order.status !== 'requested'), ...requests]);
      }, (order) => setNewRequestNotice(order.orderCode));
    }).catch(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Compiling fleet dispatch KPIs...</p>
      </div>
    );
  }

  // Calculate Metrics
  const newRequests = orders.filter((o) => o.status === 'requested');
  const quotesAwaitingPayment = orders.filter((o) => o.status === 'awaiting_payment' || o.status === 'quoted');
  const paidAwaitingRider = orders.filter((o) => o.status === 'paid' && !o.assignedRiderId);
  const jobsInProgress = orders.filter(
    (o) => o.status === 'assigned' || o.status === 'picked_up' || o.status === 'in_transit'
  );
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  // Total paid revenue
  const totalRevenueKobo = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid' && o.payment) {
      return sum + o.payment.amountKobo;
    }
    return sum;
  }, 0);

  // Needs Attention List
  const needsAttentionList = [
    ...paidAwaitingRider.map((o) => ({
      order: o,
      type: 'paid_unassigned',
      priority: 'CRITICAL',
      title: `Order ${o.orderCode} paid - Rider needed`,
      desc: `Paid ₦${((o.payment?.amountKobo || 0) / 100).toLocaleString()} via ${o.payment?.method}. Please assign a courier.`,
    })),
    ...newRequests.map((o) => ({
      order: o,
      type: 'new_request',
      priority: 'HIGH',
      title: `New Request: ${o.sender.pickupAddress.city} to ${o.receiver.deliveryAddress.city}`,
      desc: `Submitted by ${o.sender.fullName}. Needs quote calculation.`,
    })),
    ...orders
      .filter((o) => o.quote && o.quote.status === 'sent' && new Date(o.quote.validUntil).getTime() - Date.now() < 6 * 3600 * 1000 && new Date(o.quote.validUntil).getTime() > Date.now())
      .map((o) => ({
        order: o,
        type: 'expiring_soon',
        priority: 'MEDIUM',
        title: `Quote ${o.orderCode} expiring in under 6 hours`,
        desc: `Customer ${o.sender.fullName} has not completed payment yet.`,
      })),
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Operations & Dispatch Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time quote-to-cash pipeline and manual dispatch assignment desk.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {newRequestNotice && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
          <p className="font-semibold text-emerald-950">New delivery request received: {newRequestNotice}</p>
          <div className="flex items-center gap-3">
            <Link to={`/admin/orders/${encodeURIComponent(newRequestNotice)}`} className="font-bold text-emerald-800 underline">Review request</Link>
            <button onClick={() => setNewRequestNotice(null)} className="text-emerald-800 hover:text-emerald-950">Dismiss</button>
          </div>
        </div>
      )}

      {/* 6 KPI Cards per PRD 9 */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Quote
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {newRequests.length}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">New guest requests</span>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Payment
            </span>
            <Send className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {quotesAwaitingPayment.length}
          </p>
          <span className="text-[11px] text-sky-700 font-medium">Quotes sent on WhatsApp</span>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
              Paid · Needs Rider
            </span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-950 tabular-nums">
            {paidAwaitingRider.length}
          </p>
          <span className="text-[11px] text-amber-800 font-bold">Requires dispatch!</span>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              In Progress
            </span>
            <Truck className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {jobsInProgress.length}
          </p>
          <span className="text-[11px] text-cyan-700 font-medium">Active runs on road</span>
        </div>

        {/* KPI 5 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Delivered
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {deliveredOrders.length}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">With signed proof</span>
        </div>

        {/* KPI 6: Revenue */}
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatNaira(totalRevenueKobo)}
          </p>
          <span className="text-[10px] text-slate-400">Total verified payments</span>
        </div>
      </div>

      {/* Needs Attention List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Needs Immediate Operations Attention
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {needsAttentionList.length} items
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {needsAttentionList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                All clear! No urgent bottlenecks in the dispatch queue.
              </div>
            ) : (
              needsAttentionList.slice(0, 5).map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>

                  <Link
                    to={`/admin/orders/${item.order.id}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    Manage →
                  </Link>
                </div>
              ))
            )}
          </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Recent Orders & Live Queue
          </h2>
          <Link to="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline">
            View full orders directory →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
              <tr>
                <th className="py-3 px-4">Order Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Item Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Quote Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-slate-500">
                    No delivery requests yet. New customer requests will appear here.
                  </td>
                </tr>
              ) : orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link to={`/admin/orders/${o.id}`} className="hover:text-emerald-700">
                      {o.orderCode}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {o.sender.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {o.sender.pickupAddress.city} → {o.receiver.deliveryAddress.city}
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-600">
                    {o.item.itemType}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={o.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {o.quote ? formatNaira(o.quote.totalKobo) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700 text-[11px]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
