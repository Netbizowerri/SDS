import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  Shield,
  Truck,
  Globe,
  Clock,
  PenTool,
  MessageSquare,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';
import { buildWhatsAppLink } from '../lib/utils';

export const Home: React.FC = () => {
  const [quickTrackCode, setQuickTrackCode] = useState('');
  const navigate = useNavigate();

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackCode.trim()) return;
    navigate(`/track?code=${encodeURIComponent(quickTrackCode.trim())}`);
  };

  const heroImage = 'https://res.cloudinary.com/titznrnk/image/upload/v1793692440/mzDtZ_1.jpg';
  const handoverImage = 'https://res.cloudinary.com/titznrnk/image/upload/v1793691883/Untitled_Design_2.jpg';
  const courierImage = 'https://res.cloudinary.com/titznrnk/image/upload/v1793693103/SDS.jpg';

  const dispatchChatLink = buildWhatsAppLink(
    DEFAULT_BUSINESS_SETTINGS.phone,
    'Hello SDS, I would like to book a delivery quote.'
  );

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-full text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operating 20h Daily Across Nigeria & Worldwide</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
                Fast, reliable courier delivery with personal dispatch care.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Book deliveries across town or across states. SDS staff will contact you with a quote and transfer details, confirm payment, then assign a rider.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/request"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-emerald-900/30 transition-all duration-150 active:scale-95"
                >
                  <span>Request a Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={dispatchChatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 fill-current" />
                  <span>WhatsApp {DEFAULT_BUSINESS_SETTINGS.phone}</span>
                </a>
              </div>

              {/* Compact Tracking Lookup Bar */}
              <div className="pt-4 max-w-md">
                <form
                  onSubmit={handleQuickTrack}
                  className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-inner"
                >
                  <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter Tracking Code (e.g. SDS-829410)"
                    value={quickTrackCode}
                    onChange={(e) => setQuickTrackCode(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Track
                  </button>
                </form>
                <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                  For quote, payment, or delivery updates, contact SDS dispatch with your order code.
                </p>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
                <img
                  src={heroImage}
                  alt="SDS professional logistics hub with delivery couriers and motorcycles"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-semibold flex items-center gap-1.5 text-white">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      Active Dispatch Grid
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">13 Couriers Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct handoffs, motorbikes, vans, and interstate haulage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Seamless Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How SDS quote-to-cash delivery works
            </h3>
            <p className="text-sm text-slate-600">
              Clear, transparent pricing without hidden extras. From initial request to receiver signature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Request Delivery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit pickup and delivery details in 2 minutes. Upload item photos and indicate who pays (Sender or Receiver).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Get Quote from Dispatch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our operations team reviews the route and sends your quote and payment details directly by WhatsApp or phone.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Pay by Transfer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay using the bank details sent to you by SDS. Our team confirms receipt manually before dispatch.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center mb-4">
                4
              </span>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Dispatch & Delivery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                After payment is confirmed, a dedicated rider is assigned. Contact SDS staff for progress updates and proof of delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Strip */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Our Capabilities
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Full-spectrum logistics solutions
              </h3>
            </div>
            <Link
              to="/request"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Start delivery request <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1">Intra-State Express</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Same-day motorcycle and van pickups within Lagos and major metropolitan hubs. Urgent time slot dispatch available.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1">Nationwide Haulage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reliable interstate transfers linking Lagos, Abuja, Port Harcourt, Kano, Enugu, and all 36 states across Nigeria.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1">Worldwide Freight</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                International express documents, commercial samples, and personal parcels with full documentation guidance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1">Special Handling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialized care for high-value artwork, legal deeds, sensitive electronics, fashion apparel, and temperature items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof Section with Images */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Accountability & Security
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                Every delivery sealed, tracked, and signed.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unlike automated platforms where parcels get lost in algorithms, SDS relies on experienced dispatch supervisors and vetted couriers. You receive verifiable delivery proof for every run.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <PenTool className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Digital Signatures</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Recipients sign on the courier's screen at handover.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Direct Courier Contact</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Direct phone & WhatsApp buttons once rider is assigned.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Personal Quote Support</h4>
                    <p className="text-xs text-slate-400 mt-0.5">SDS staff share quotes and payment instructions directly with the customer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Manual Payment Confirmation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Our operations team verifies transfer receipt before dispatch.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src={handoverImage}
                  alt="Courier handing a parcel to a smiling customer and confirming handover on a clipboard"
                  className="rounded-xl object-cover h-56 w-full shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs">
                  <p className="font-semibold text-white">100% Handover Verification</p>
                  <p className="text-slate-400 mt-1">Recipient name & timestamp stored forever in your order tracking link.</p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="bg-emerald-950/70 p-4 rounded-xl border border-emerald-500/30 text-xs">
                  <p className="font-semibold text-emerald-400">20-Hour Operations</p>
                  <p className="text-slate-300 mt-1">From 06:00 to 02:00 Africa/Lagos. Pickups scheduled around your day.</p>
                </div>
                <img
                  src={courierImage}
                  alt="Smiling courier in red uniform holding a delivery package in her vehicle"
                  className="rounded-xl object-cover h-56 w-full shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Questions</h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                Can the receiver pay for the delivery instead of the sender?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. During request submission, select whether the sender or receiver pays. SDS staff will contact the designated payer directly.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                How long is my delivery quote valid?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                SDS staff will include the quote validity period when they contact you. Message dispatch if you need updated pricing or payment details.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-1.5">
                What items are prohibited from carriage?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Per Nigerian law and our terms of carriage, we do not transport hazardous chemicals, illegal contraband, unauthorized firearms, or perishable items requiring cold chains exceeding our capacity. View our full prohibited items list on the Terms page.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/faq" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline">
              View all logistics questions & answers →
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Ready to dispatch your package?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Submit your delivery details now and receive your official quote on WhatsApp within minutes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/request"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg text-center shadow transition-all duration-150 active:scale-95"
              >
                Request Delivery
              </Link>
              <Link
                to="/track"
                className="w-full sm:w-auto px-5 py-3 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-lg text-center transition-colors"
              >
                Track Existing Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
