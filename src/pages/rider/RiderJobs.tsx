import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  MapPin,
  RotateCw,
  ChevronRight,
  AlertCircle,
  Truck,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { RidersService, AuthService } from '../../services/mock';
import { Order } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { formatNaira, formatLagosDate } from '../../lib/utils';

export const RiderJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assigned' | 'active' | 'completed'>('assigned');
  const [jobs, setJobs] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = AuthService.getCurrentUser();
  const riderId = currentUser?.riderId || 'rider-1';

  const loadJobs = async (isPull = false) => {
    if (isPull) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const riderJobs = await RidersService.listJobsForRider(riderId);
      setJobs(riderJobs);
    } catch {
      setJobs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [riderId]);

  // Tab Filtering
  const assignedJobs = jobs.filter((j) => j.status === 'assigned');
  const inProgressJobs = jobs.filter((j) => j.status === 'picked_up' || j.status === 'in_transit');
  const completedJobs = jobs.filter((j) => j.status === 'delivered');

  const displayedJobs =
    activeTab === 'assigned'
      ? assignedJobs
      : activeTab === 'active'
      ? inProgressJobs
      : completedJobs;

  return (
    <div className="p-4 space-y-4">
      {/* Title & Refresh Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Assigned Dispatch Runs</h1>
          <p className="text-xs text-slate-500">Tap a job to view pickup and delivery coordinates</p>
        </div>

        <button
          onClick={() => loadJobs(true)}
          disabled={isRefreshing}
          className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
          title="Refresh jobs"
          aria-label="Refresh jobs list"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'assigned'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          <span>Assigned</span>
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center">
            {assignedJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          <span>Active</span>
          <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] flex items-center justify-center">
            {inProgressJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          <span>Completed</span>
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center">
            {completedJobs.length}
          </span>
        </button>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your runs...</p>
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No {activeTab} jobs found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {activeTab === 'assigned'
              ? 'New runs assigned by dispatch will appear here immediately.'
              : activeTab === 'active'
              ? 'Jobs currently in transit will show up here.'
              : 'Completed delivery runs will be listed here with earnings recorded.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedJobs.map((job) => (
            <Link
              key={job.id}
              to={`/rider/jobs/${job.id}`}
              className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-sm text-slate-900 tracking-wide">
                  {job.orderCode}
                </span>
                <StatusBadge status={job.status} size="sm" />
              </div>

              {/* Route */}
              <div className="py-2.5 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium truncate">{job.sender.pickupAddress.streetAddress}, {job.sender.pickupAddress.city}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-medium truncate">{job.receiver.deliveryAddress.streetAddress}, {job.receiver.deliveryAddress.city}</span>
                </div>
              </div>

              {/* Footer info: scheduled time & trip pay */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pickup: {job.sender.pickupTimeSlot}</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-700 font-bold font-mono">
                  <span>Trip Pay:</span>
                  <span>{formatNaira(job.tripPayKobo || 350000)}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
