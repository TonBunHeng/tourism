import { useState, useEffect } from 'react';
import { 
  Search, 
  PhoneCall, 
  Mail, 
  HelpCircle, 
  Send, 
  ShieldCheck, 
  Loader2, 
  Clock, 
  MapPin, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Headphones
} from 'lucide-react';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';

const FAQS_DATA = [
  {
    id: 1,
    category: 'Passes & Tickets',
    q: 'Do I need an Angkor Pass to visit the Angkor Archaeological Park?',
    a: 'Yes, all international visitors must purchase an official Angkor Pass (1-Day at $37, 3-Day at $62, or 7-Day at $72). Children under 12 years and Cambodian citizens enter free with valid identification.',
    tag: 'Angkor Pass'
  },
  {
    id: 2,
    category: 'Culture & Customs',
    q: 'What is the required dress code for visiting ancient Khmer temples and pagodas?',
    a: 'Visitors must dress modestly with shoulders and knees fully covered. Sleeveless tops, tank tops, and short skirts or shorts are strictly prohibited inside temple sanctuaries. Hats and sunglasses must be removed when entering active sacred shrines.',
    tag: 'Temple Etiquette'
  },
  {
    id: 3,
    category: 'Currency & Payments',
    q: 'Are US Dollars accepted in Cambodia, or do I need Cambodian Riel (KHR)?',
    a: 'Both US Dollars ($) and Cambodian Riel (៛) are standard currencies across Cambodia. Small change is frequently returned in Riel at an approximate rate of 4,000 KHR = $1 USD. Clean, undamaged USD banknotes without tears or marks are required.',
    tag: 'Currency'
  },
  {
    id: 4,
    category: 'Safety & Guides',
    q: 'How do I identify and book an accredited tour guide in Cambodia?',
    a: 'Accredited guides carry an official photo ID license issued by the Ministry of Tourism, typically wearing standard brown uniforms with license cards. You can browse and hire certified guides directly via the AngkorVerses Tour Guides registry.',
    tag: 'Licensed Guides'
  },
  {
    id: 5,
    category: 'Passes & Tickets',
    q: 'Can I purchase tickets online or do I have to go to the ticket counter?',
    a: 'Angkor Passes can be purchased at the Angkor Enterprise Official Ticket Center in Siem Reap (open 04:30 - 17:30 daily) or online via the official Angkor Enterprise e-ticketing portal. Avoid purchasing from unauthorized third-party resellers.',
    tag: 'Ticketing Portal'
  },
  {
    id: 6,
    category: 'Emergency',
    q: 'What should I do if I lose my passport or belongings while traveling?',
    a: 'Immediately contact the Tourist Police Hotline at 117 or visit the nearest Tourist Police booth in Siem Reap or Phnom Penh. They will file an official Police Report (required by your embassy for replacement emergency travel documents).',
    tag: 'Emergency'
  }
];

export default function Support() {
  const { showSuccess, showError } = useAlert();

  // Settings & Contacts from Database/API
  const [settings, setSettings] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  // FAQ Expand state
  const [openFaqs, setOpenFaqs] = useState({ 1: true });
  const [copiedNumber, setCopiedNumber] = useState(null);

  // Inquiry Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    travelService.getSettings()
      .then((res) => {
        if (res?.success) {
          setSettings(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load system settings from backend:', err);
      });
  }, []);

  const handleCopyNumber = (num, key) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(key);
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2000);
  };

  const toggleFaq = (id) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmittedTicket(null);

    try {
      const res = await travelService.sendContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || 'Tourist Support Inquiry',
        message: message.trim(),
      });

      if (res?.success) {
        const ticketCode = res.data?.ticket_code || 'TKT-' + Math.floor(100000 + Math.random() * 900000);
        setSubmittedTicket(ticketCode);
        showSuccess(`Your travel inquiry #${ticketCode} has been recorded in the central database!`, 'Inquiry Submitted');
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        showError(res?.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      showError(err?.message || 'Failed to connect to backend support service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hotline Cards Data
  const emergencyHotlines = [
    {
      id: 'police',
      badge: '24/7 Rapid Response',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800',
      title: 'Tourist Police Department',
      subtitle: 'Ministry of Interior & Tourism',
      dialNumber: '117',
      fullNumber: settings?.emergency_contacts?.tourist_police || '+855 31 322 2117',
      category: 'Emergency',
      description: 'Dedicated law enforcement division handling tourist safety, incident reports, theft assistance, and rapid dispute mediation.',
      hours: '24/7 Nationwide',
      location: 'Siem Reap & Phnom Penh'
    },
    {
      id: 'ambulance',
      badge: 'Medical Rapid Response',
      image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=800',
      title: 'SAMU Emergency Ambulance',
      subtitle: 'Ministry of Health Dispatch',
      dialNumber: '119',
      fullNumber: settings?.emergency_contacts?.ambulance || '119',
      category: 'Emergency',
      description: 'Nationwide emergency ambulance fleet providing rapid medical trauma dispatch, doctor consultation, and referral hospital transport.',
      hours: '24/7 Dispatch',
      location: 'All 25 Provinces'
    },
    {
      id: 'fire',
      badge: 'Civil Rescue & Fire',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
      title: 'Fire & Civil Defense',
      subtitle: 'Department of Public Safety',
      dialNumber: '118',
      fullNumber: settings?.emergency_contacts?.fire || '118',
      category: 'Emergency',
      description: 'National firefighting and civil protection unit handling structural fires, road rescue operations, and flood evacuation services.',
      hours: '24/7 Standby',
      location: 'Nationwide Network'
    }
  ];

  // Filtering Logic
  const filteredHotlines = emergencyHotlines.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.dialNumber.includes(search) ||
      item.fullNumber.includes(search);
    const matchesCat = selectedCategory === 'All' || selectedCategory === item.category;
    return matchesSearch && matchesCat;
  });

  const filteredFaqs = FAQS_DATA.filter((item) => {
    const matchesSearch = 
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()) ||
      item.tag.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || selectedCategory === item.category;
    return matchesSearch && matchesCat;
  });

  const showHotlines = selectedSection === 'All' || selectedSection === 'hotlines';
  const showFaqs = selectedSection === 'All' || selectedSection === 'faqs';
  const showInquiry = selectedSection === 'All' || selectedSection === 'inquiry';

  const totalCount = (showHotlines ? filteredHotlines.length : 0) + (showFaqs ? filteredFaqs.length : 0) + (showInquiry ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Official Support & Assistance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Help Center & Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Access 24/7 nationwide emergency hotlines, verified tourist FAQs, or submit an official travel inquiry.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar matching screenshot design */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotlines, FAQs, or topics..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Support Categories</option>
              <option value="Emergency">Emergency & Police Hotlines</option>
              <option value="Passes & Tickets">Angkor Passes & Tickets</option>
              <option value="Culture & Customs">Temple Etiquette & Dress Code</option>
              <option value="Currency & Payments">Currency & Payments</option>
              <option value="Safety & Guides">Licensed Guides & Safety</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
            >
              <option value="All">All Resources</option>
              <option value="hotlines">Emergency Hotlines (24/7)</option>
              <option value="faqs">Knowledge Base (FAQs)</option>
              <option value="inquiry">Direct Ministry Inquiry</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
          <div>
            Support Resources Available: <strong className="text-slate-800 dark:text-zinc-200">{totalCount} items</strong>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>Ministry Verified Official Support</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: 24/7 Emergency Hotlines (Styled like Tour Cards in screenshot) */}
      {showHotlines && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall size={20} className="text-[#002D62] dark:text-blue-400" />
                <span>Nationwide 24/7 Emergency Hotlines</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Direct toll-free connections to emergency response departments across Cambodia.
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              Live Dispatch Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotlines.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/95 text-white text-[10px] font-bold tracking-wide shadow-sm">
                        {item.badge}
                      </span>
                    </div>

                    {/* Dial Number Badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white font-black text-sm">
                      Dial {item.dialNumber}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#002D62] dark:text-blue-400" />
                        <span>{item.hours}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500" />
                        <span>{item.location}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <ShieldCheck size={13} />
                        <span>Ministry Verified</span>
                      </div>
                      <span className="text-slate-500 dark:text-zinc-400">
                        ({item.subtitle})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(item.fullNumber, item.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedNumber === item.id ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Num</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${item.dialNumber}`}
                    className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall size={13} />
                    <span>Call {item.dialNumber}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Frequently Asked Questions */}
      {showFaqs && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-[#002D62] dark:text-blue-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Official guidance on passes, temple etiquette, and travel regulations.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredFaqs.length} verified answers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openFaqs[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs p-5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-300 text-[11px] font-semibold">
                        {faq.tag}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg transition"
                      >
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <h3 
                      onClick={() => toggleFaq(faq.id)}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#002D62] dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                    >
                      {faq.q}
                    </h3>

                    {isOpen && (
                      <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal pt-2 border-t border-slate-100 dark:border-zinc-800">
                        {faq.a}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Official Inquiry Form & Ministry Office Info */}
      {showInquiry && (
        <div className="pt-4">
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Office info & Contact channels */}
              <div className="lg:col-span-5 bg-slate-50/70 dark:bg-zinc-800/40 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-2">
                    <Mail size={14} />
                    <span>Official Communications</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Contact Tourism Support
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Have questions regarding custom tour packages, licensed guides, or business accreditation? Submit an official inquiry.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-700/60 shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Ministry Support Email</div>
                      <div className="text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                        {settings?.support_email || 'support@tourism.gov.kh'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Official Response & Tickets</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-700/60 shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Tourism Desk Phone</div>
                      <div className="text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                        {settings?.support_phone || '+855 23 888 999'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Mon - Fri: 08:00 - 17:00 (GMT+7)</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-700/60 shadow-xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white">Siem Reap Visitor Center</div>
                      <div className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        Mondul 3, Sangkat Slor Kram, Siem Reap City, Cambodia
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Open daily 07:00 - 18:00</div>
                    </div>
                  </div>
                </div>

                {submittedTicket && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      <span>Inquiry Logged Successfully!</span>
                    </div>
                    <div className="font-mono text-xs">
                      Reference Ticket: <strong>{submittedTicket}</strong>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      A confirmation notification has been dispatched to administrators and your registered email.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Submission Form */}
              <div className="lg:col-span-7 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+855 12 345 678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Inquiry Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Private Angkor Sunrise Tour Guide"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Detailed Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify your travel dates, preferred destinations, group size, or questions for the support team..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit Official Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
