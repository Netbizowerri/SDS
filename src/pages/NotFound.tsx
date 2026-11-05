import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Home, Search, MessageSquare } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          The page you are looking for does not exist or has been moved. Contact SDS dispatch if you need help with a delivery request.
        </p>

        <div className="space-y-2.5 pt-3">
          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </Link>

          <Link
            to="/track"
            className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track a Package</span>
          </Link>

          <WhatsAppButton
            phone={DEFAULT_BUSINESS_SETTINGS.phone}
            message="Hello SDS, I clicked a link that resulted in a 404 error."
            label="Inquire on WhatsApp"
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
