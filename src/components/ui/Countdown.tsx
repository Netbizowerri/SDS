import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getRemainingTime } from '../../lib/utils';

interface CountdownProps {
  validUntil: string;
  onExpire?: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({ validUntil, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(validUntil));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingTime(validUntil);
      setTimeLeft(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [validUntil, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-medium">
        <AlertTriangle className="w-4 h-4 text-rose-600" />
        <span>Quote Expired</span>
      </div>
    );
  }

  const { hours, minutes, seconds, isUrgent } = timeLeft;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
        isUrgent
          ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-amber-600' : 'text-slate-500'}`} />
      <span className="text-slate-600">Valid for:</span>
      <span className="font-mono font-semibold tabular-nums tracking-wide">
        {hours}h {pad(minutes)}m {pad(seconds)}s
      </span>
      {isUrgent && (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
          Expiring Soon
        </span>
      )}
    </div>
  );
};
