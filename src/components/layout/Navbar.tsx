import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, MessageSquare } from 'lucide-react';
import { DEFAULT_BUSINESS_SETTINGS } from '../../config/business';
import { buildWhatsAppLink } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Track Order', path: '/track' },
    { label: 'Request Delivery', path: '/request' },
    { label: 'About', path: '/about' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const quickWhatsapp = buildWhatsAppLink(
    DEFAULT_BUSINESS_SETTINGS.phone,
    'Hello SDS, I would like to inquire about a delivery.'
  );

  return (
    <header className="sticky top-0 inset-x-0 z-50 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-8 h-16 w-full">
          {/* Zone 1: Single Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group"
          >
            <span className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm group-hover:bg-emerald-700 transition-colors">
              SDS
            </span>
            <span className="font-bold text-slate-900">
              Delivery<span className="text-emerald-600">.</span>
            </span>
          </Link>

          {/* Zone 2: Concise Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    isActive
                      ? 'border-emerald-600 text-slate-950 font-semibold'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Quick WhatsApp */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href={quickWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>{DEFAULT_BUSINESS_SETTINGS.phone}</span>
            </a>

            <Link
              to="/request"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <span>Book Courier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/request"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <a
              href={quickWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Chat with Dispatch: {DEFAULT_BUSINESS_SETTINGS.phone}</span>
            </a>

            <div className="pt-2 px-1 text-xs flex items-center justify-between">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Login / Register
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-900 underline"
              >
                Track Package
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
