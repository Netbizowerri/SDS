import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  User,
  MapPin,
  Clock,
  RotateCw,
} from 'lucide-react';
import { OrdersService, RidersService } from '../../services/mock';
import { Order, OrderStatus, PaymentStatus, Rider } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [riderFilter, setRiderFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allOrders, allRiders] = await Promise.all([
        OrdersService.list(),
        RidersService.list(),
      ]);
      setOrders(allOrders);
      setRiders(allRiders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (riderFilter !== 'all' && o.assignedRiderId !== riderFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        o.orderCode.toLowerCase().includes(q) ||
        o.sender.fullName.toLowerCase().includes(q) ||
        o.receiver.fullName.toLowerCase().includes(q) ||
        o.sender.phone.includes(q) ||
        o.sender.pickupAddress.city.toLowerCase().includes(q) ||
        o.receiver.deliveryAddress.city.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiderName = (riderId?: string) => {
    if (!riderId) return 'Unassigned';
    const match = riders.find((r) => r.id === riderId);
    return match ? match.fullName : 'Assigned';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Orders & Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full directory of requested, quoted, and dispatched jobs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="sm:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, customer, city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="requested">New Request</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="paid">Paid (Unassigned)</option>
              <option value="assigned">Rider Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Payment filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
            >
              <option value="all">All Payment States</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Rider filter */}
          <div>
            <select
              value={riderFilter}
              onChange={(e) => {
                setRiderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
            >
              <option value="all">All Couriers</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.vehicleType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders View: Desktop Table & Mobile Cards Mode */}
      {isLoading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading orders...</p>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching orders found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="py-3 px-4">Order Code</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Quote Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Assigned Courier</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link to={`/admin/orders/${o.id}`} className="hover:text-emerald-700">
                          {o.orderCode}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatLagosDate(o.createdAt).split(',')[0]}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{o.sender.fullName}</div>
                        <div className="text-[11px] text-slate-400">{o.sender.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {o.sender.pickupAddress.city} → {o.receiver.deliveryAddress.city}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {o.quote ? formatNaira(o.quote.totalKobo) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`capitalize font-semibold text-[11px] ${
                            o.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {getRiderName(o.assignedRiderId)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px]"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (PRD Section 4 & 9) */}
          <div className="md:hidden space-y-3">
            {paginatedOrders.map((o) => (
              <Link
                key={o.id}
                to={`/admin/orders/${o.id}`}
                className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-400"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {o.orderCode}
                  </span>
                  <StatusBadge status={o.status} size="sm" />
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-800">
                    Sender: {o.sender.fullName} ({o.sender.phone})
                  </p>
                  <p className="text-slate-600">
                    Route: {o.sender.pickupAddress.city} → {o.receiver.deliveryAddress.city}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="font-bold font-mono text-slate-900">
                      {o.quote ? formatNaira(o.quote.totalKobo) : 'Awaiting Quote'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Courier</span>
                    <span className="font-medium text-slate-700">
                      {getRiderName(o.assignedRiderId)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
