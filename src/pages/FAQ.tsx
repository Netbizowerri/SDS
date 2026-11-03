import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/Buttons';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/business';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does quote-to-cash booking work at SDS?',
      a: 'First, you submit your pickup and delivery details on our Request page. Our human dispatch team reviews the route, package weight, and timing, then calculates an exact rate and sends a private quote link directly to your WhatsApp. Once paid securely online via Paystack, a dedicated dispatch courier is assigned immediately.',
    },
    {
      q: 'Can the receiver pay for the delivery instead of the sender?',
      a: 'Absolutely! On Step 3 of the request form, you specify who pays (Sender or Receiver). The private quote link is designed to be forwarded to whichever party is paying. To protect customer privacy when the link is forwarded, the page displays first names only and masks phone numbers (e.g., +234 810 *** **60).',
    },
    {
      q: 'What payment methods do you support?',
      a: 'We accept all Nigerian bank debit cards (Mastercard, Visa, Verve), instant bank debits, and dynamic virtual account bank transfers through Paystack. For corporate accounts, manual bank transfers can be arranged with operations.',
    },
    {
      q: 'How long is a quote link valid?',
      a: 'Quotes are typically valid for 72 hours from the moment our dispatch desk issues the link. The quote page features a live countdown timer. If your quote expires before payment, the link shows an expired notice with an instant WhatsApp button to request a fresh quote.',
    },
    {
      q: 'Do you offer live GPS vehicle tracking?',
      a: 'SDS provides milestone-based tracking (Request received, Quote sent, Paid, Rider assigned, Picked up, In transit, Delivered). Because of battery efficiency and rider safety on motorcycles, we do not stream continuous live GPS. Instead, we connect you directly with your assigned courier with one-click Call and WhatsApp buttons.',
    },
    {
      q: 'What proof of delivery is provided?',
      a: 'Every delivery culminates in digital proof. The courier captures the full recipient name and records their digital handwritten signature directly on their device screen upon handover. This signature and timestamp remain permanently accessible in your tracking link.',
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
