import React from 'react';
import { APP_CONFIG } from '../../config/business';

export const PrototypeRibbon: React.FC = () => {
  if (!APP_CONFIG.showPrototypeRibbon) return null;
  return (
    <aside className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2 px-4 text-xs">
      <div className="max-w-7xl mx-auto">
        SDS Delivery prototype. Staff access uses Firebase Authentication; customer payment and tracking updates are coordinated offline.
      </div>
    </aside>
  );
};
