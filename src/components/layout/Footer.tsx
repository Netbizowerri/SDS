import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { DEFAULT_BUSINESS_SETTINGS } from '../../config/business';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                SDS
              </span>
              <span className="text-xl font-bold text-white tracking-tight">Delivery</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nationwide and worldwide courier logistics. Personal dispatch support, direct payment instructions, and proof of delivery.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <p>CAC Reg: <span className="text-slate-400">{DEFAULT_BUSINESS_SETTINGS.cacNumber}</span></p>
              <p>Operating Hours: Mon - Sat, 06:00 to 02:00 (20h daily)</p>
              <p className="text-amber-400/80">Sunday: Fleet Maintenance & Servicing</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services & Booking</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/request" className="hover:text-white transition-colors">
                  Request a Delivery
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Your Package
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Operations
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Prohibited Items
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors text-emerald-400 font-medium">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Call & WhatsApp: <strong className="text-white">{DEFAULT_BUSINESS_SETTINGS.phone}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{DEFAULT_BUSINESS_SETTINGS.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{DEFAULT_BUSINESS_SETTINGS.address}</span>
              </li>
            </ul>
          </div>

          {/* Security & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security & Guarantee</h4>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Payment receipt confirmed by SDS operations staff</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Prompt manual dispatch with personal courier care</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Nationwide state-to-state and international deliveries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SDS Delivery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Carriage
            </Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Customer Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
