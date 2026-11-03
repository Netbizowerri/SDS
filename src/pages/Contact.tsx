import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';
import { buildWhatsAppLink } from '../lib/utils';
import { WhatsAppButton } from '../components/ui/Buttons';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const dispatchWhatsapp = buildWhatsAppLink(
    DEFAULT_BUSINESS_SETTINGS.phone,
    'Hello SDS, I would like to inquire about courier dispatch services.'
  );

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Support & Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Contact SDS Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Direct communication is at the core of our business. Reach out to our operations team on WhatsApp, phone, or email.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900">Direct Dispatch Contacts</h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Direct Call & WhatsApp Line:</strong>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{DEFAULT_BUSINESS_SETTINGS.phone}</p>
                  <p className="text-[11px] text-slate-500">Available 20 hours daily during active fleet operations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Email:</strong>
                  <p className="text-slate-800">{DEFAULT_BUSINESS_SETTINGS.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Central Hub & Parcel Drop:</strong>
                  <p className="text-slate-800">{DEFAULT_BUSINESS_SETTINGS.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Operating Schedule:</strong>
                  <p className="text-slate-800">Monday - Saturday: 06:00 to 02:00 (Africa/Lagos)</p>
                  <p className="text-amber-700 text-[11px] mt-0.5">Sunday: Closed for vehicle maintenance</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <WhatsAppButton
                phone={DEFAULT_BUSINESS_SETTINGS.phone}
                message="Hello SDS, I would like to speak with a dispatch officer."
                label="Open WhatsApp Chat Now"
                size="md"
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Send an Inquiry</h2>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-900 text-sm">Message Received</h3>
                <p className="text-xs text-emerald-800">
                  Thank you, {name}! A representative will respond to your inquiry via phone or email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-emerald-800 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Titi Adeleke"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Email Address or Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0812 345 6789 or email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Message or Quote Questions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your delivery requirements or inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
