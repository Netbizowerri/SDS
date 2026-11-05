import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Users, Clock, Award, MapPin, ArrowRight } from 'lucide-react';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Behind the Fleet
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About SDS Courier & Logistics
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Founded to provide transparent, accountable, and prompt courier services connecting businesses and private senders across all 36 Nigerian states and global destinations.
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Personal dispatch care meets modern technology.
            </h2>
            <p>
              At SDS, we believe high-value shipments, delicate parcels, and urgent corporate documentation should not be left to the chance of anonymous automated gig workers.
            </p>
            <p>
              Our operations combine digital delivery requests with hands-on human dispatch supervision. Staff share quotes and transfer instructions directly, confirm payment, and assign each job to a vetted courier.
            </p>
            <div className="pt-2">
              <Link
                to="/request"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Book your first dispatch with SDS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Our Operating Standards
            </h3>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>20-Hour Daily Operations:</strong> Couriers on the road from 06:00 to 02:00 Africa/Lagos, Monday through Saturday.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Digital Signature on Handover:</strong> No package is marked delivered without recorded recipient name and signature.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Direct Rider Coordination:</strong> Senders receive direct mobile and WhatsApp contact with their assigned courier.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Fair Courier Trip Pay:</strong> Our dispatch couriers are compensated transparently per trip, fostering care and commitment.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Corporate Disclosure Banner */}
        <div className="p-6 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Corporate & Registration Notice</p>
          <p>Registration: Corporate Affairs Commission {DEFAULT_BUSINESS_SETTINGS.cacNumber}</p>
          <p>Central Hub: {DEFAULT_BUSINESS_SETTINGS.address}</p>
        </div>
      </section>
    </div>
  );
};
