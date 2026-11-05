import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does quote-to-cash booking work at SDS?',
      a: 'First, you submit your pickup and delivery details on our Request page. Our dispatch team reviews the route, package weight, and timing, then contacts you with a quote and bank transfer details. After staff confirm receipt, a rider is assigned.',
    },
    {
      q: 'Can the receiver pay for the delivery instead of the sender?',
      a: 'Absolutely! On the request form, specify whether the sender or receiver pays. SDS staff will contact the designated payer directly with the quote and transfer details.',
    },
    {
      q: 'What payment methods do you support?',
      a: 'SDS staff will send bank transfer instructions directly after reviewing your request. An administrator confirms receipt before dispatch.',
    },
    {
      q: 'How long is a quote valid?',
      a: 'The dispatch team will include the quote validity period when they contact you. Message SDS if you need an updated quote or payment instructions.',
    },
    {
      q: 'Do you offer live GPS vehicle tracking?',
      a: 'Shipment updates are shared by SDS staff. Message dispatch with your order code and we will check the latest status for you.',
    },
    {
      q: 'What proof of delivery is provided?',
      a: 'The rider records the recipient name and digital signature at handover. Contact SDS dispatch for delivery confirmation and proof.',
    },
    {
      q: 'What are your operating hours?',
      a: 'Our dispatch couriers operate 20 hours a day, from 06:00 AM to 02:00 AM (Africa/Lagos time), Monday through Saturday. Sunday is our scheduled fleet servicing and maintenance day.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Answers & Clarity
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Everything you need to know about our quote, payment, and courier dispatch process.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Still have a specific logistics question?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Our dispatch supervisors are on WhatsApp 20 hours daily to help with quotes and route feasibility.
          </p>
          <div className="pt-1">
            <WhatsAppButton
              phone={DEFAULT_BUSINESS_SETTINGS.phone}
              message="Hello SDS, I have a delivery inquiry not covered in the FAQ."
              label="Ask Us on WhatsApp"
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
