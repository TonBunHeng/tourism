import { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  HelpCircle, 
  Send, 
  ShieldCheck, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';

const FAQS = [
  {
    q: 'Do I need an Angkor Pass to visit the Angkor Archaeological Park?',
    a: 'Yes, all international visitors must purchase an official Angkor Pass (1-Day, 3-Day, or 7-Day). Children under 12 and Cambodian citizens do not require a ticket.'
  },
  {
    q: 'What is the required dress code for visiting ancient Khmer temples and pagodas?',
    a: 'Visitors must dress modestly with shoulders and knees covered (no sleeveless tops, tank tops, or short skirts). Hats and sunglasses must be removed when entering sacred shrines.'
  },
  {
    q: 'Are US Dollars accepted in Cambodia, or do I need Cambodian Riel (KHR)?',
    a: 'Both US Dollars ($) and Cambodian Riel (៛) are standard currencies across Cambodia. Small change is frequently returned in Riel. Clean, undamaged USD banknotes are required.'
  },
  {
    q: 'How do I book an accredited tour guide in Cambodia?',
    a: 'You can book verified, accredited guides directly through AngkorVerses or request an official licensed guide at the Ministry of Tourism visitor centers in Siem Reap and Phnom Penh.'
  }
];

export default function Support() {
  const { showSuccess, showError } = useAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await travelService.sendContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res?.success) {
        showSuccess('Your travel inquiry has been received! A tourist support officer will reply via email shortly.', 'Message Sent');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
          Tourist Assistance
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Help Center & Official Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Emergency contacts, frequently asked questions, and official travel inquiries.
        </p>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003E83] text-white flex items-center justify-center shrink-0">
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Tourist Police Hotline</div>
            <div className="text-xl font-black text-[#003E83] dark:text-blue-400 font-mono">117</div>
            <div className="text-[11px] text-slate-500">24/7 Nationwide Assistance</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Emergency Ambulance</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">119</div>
            <div className="text-[11px] text-slate-500">Medical Rapid Response</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Fire & Rescue Service</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">118</div>
            <div className="text-[11px] text-slate-500">Civil Defense</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FAQs Accordion */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={18} className="text-[#003E83] dark:text-blue-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2"
              >
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Inquiry Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-[#003E83] dark:text-blue-400" />
              <span>Contact Tourism Support</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Have inquiries about tour packages, certified guides, or travel permits? Send us a message.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Private Guided Angkor Sunrise Tour Inquiry"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your travel dates, group size, or questions..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Support Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
