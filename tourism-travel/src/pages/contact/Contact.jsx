import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, ChevronDown, CheckCircle2, ShieldAlert, Clock, Send } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';

const FAQS = [
  {
    q: 'Do I need an Angkor Pass to visit the temples in Siem Reap?',
    a: 'Yes, all foreign visitors require an official Angkor Pass issued by Angkor Enterprise. A 1-day pass is $37 USD, a 3-day pass is $62 USD (valid over 10 days), and a 7-day pass is $72 USD (valid over 30 days). Children under 12 enter free with a passport.'
  },
  {
    q: 'How does payment and booking work on AngkorVerses?',
    a: 'We accept ABA Pay (KHQR), major international credit and debit cards (Visa/Mastercard), or Pay on Arrival for selected verified hotel partners. All bookings come with instant digital confirmation and zero hidden booking fees.'
  },
  {
    q: 'What is the dress code for Cambodian temples and the Royal Palace?',
    a: 'Visitors must dress respectfully. Shoulders and knees must be covered (no tank tops, short shorts, or revealing clothing). Lightweight cotton or linen clothing and comfortable walking shoes are recommended.'
  },
  {
    q: 'Are the local tour guides verified and licensed?',
    a: 'Yes. Every guide listed on our platform holds an active, verified license issued by the Cambodian Ministry of Tourism and has passed background and language competency evaluations.'
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Most day tours, guides, and activities offer free cancellation up to 24 hours before the scheduled start time for a full 100% refund.'
  }
];

import contactService from '../../services/contactService';

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'booking', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const res = await contactService.submitInquiry(form);
      const data = res?.data || res;
      setTicketCode(data?.ticket_code || 'INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: 'booking', message: '' });
    } catch (err) {
      console.error('Contact inquiry error:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: 'Contact & Support' }]} />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Visitor Care & Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Contact & Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Have a question about your trip, temple tickets, or booking an authentic local tour? Our team in Phnom Penh and Siem Reap is available 7 days a week.
          </p>
        </div>
      </div>

      {/* Contact Channels & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 space-y-5">
          {/* Emergency Card */}
          <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>24/7 Emergency Tourist Hotlines</span>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              For immediate in-country emergency assistance anywhere in Cambodia:
            </p>
            <div className="space-y-1.5 text-xs font-semibold text-rose-900 dark:text-rose-200">
              <p>• Tourist Police (Siem Reap / Phnom Penh): <strong>+855 31 322 2117</strong></p>
              <p>• National Police: <strong>117</strong></p>
              <p>• Medical Ambulance: <strong>119</strong></p>
            </div>
          </div>

          {/* Office Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Our Cambodian Offices</h3>

            <div className="flex items-start gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <MapPin className="w-4 h-4 text-[#003E83] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 dark:text-white block font-bold">Siem Reap Regional Center</strong>
                <span>Sivutha Boulevard, Svay Dangkum, Siem Reap, Cambodia</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <MapPin className="w-4 h-4 text-[#003E83] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 dark:text-white block font-bold">Phnom Penh Headquarters</strong>
                <span>Preah Norodom Boulevard, Daun Penh, Phnom Penh, Cambodia</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-400 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white block font-bold">General Support Email</strong>
                <span>support@tourism.gov.kh</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white block font-bold">Operating Hours</strong>
                <span>Monday – Sunday: 7:00 AM – 8:00 PM (ICT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support Inquiry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in-95">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Inquiry Received!</h3>
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold text-[#003E83] dark:text-blue-300">
                Ticket Reference: {ticketCode}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting AngkorVerses. Your message has been saved to our traveler support queue and an administrator will respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-[#003E83] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#002e62] transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Send Us an Inquiry</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Direct connection to our Cambodian travel administration desk.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah Jenkins"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., sarah@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] cursor-pointer"
                >
                  <option value="booking">Tour / Guide Booking Inquiry</option>
                  <option value="angkor">Angkor Temple Pass & Regulations</option>
                  <option value="merchant">Hotel / Business Partner Registration</option>
                  <option value="general">General Travel Assistance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can our Cambodian travel team assist your upcoming journey?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-[#003E83] to-blue-600 hover:from-[#002e62] hover:to-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>{submitting ? 'Submitting Inquiry...' : 'Send Support Message'}</span>
                <Send size={14} className={submitting ? 'animate-pulse' : ''} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003E83] dark:text-blue-400">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Helpful answers about visiting Cambodia, temple regulations, visas, and bookings.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#003E83] dark:text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed border-t border-gray-100 dark:border-zinc-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
