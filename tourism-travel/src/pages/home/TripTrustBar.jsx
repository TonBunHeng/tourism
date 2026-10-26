import { ShieldCheck, Award, Headphones, CreditCard, CheckCircle2 } from 'lucide-react';

export default function TripTrustBar() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'We Price Match',
      desc: 'Found a lower price for the same tour or hotel? We will match it and credit the difference.',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      icon: Award,
      title: 'Booking & Stay Guarantee',
      desc: 'Instant booking confirmation. In case of operational changes, we provide alternative booking or 100% refund.',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      desc: 'Round-the-clock live chat, emergency tourist hotline, and dedicated local travel concierge.',
      color: 'text-[#287dfa] bg-blue-50 dark:bg-blue-950/40',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment Options',
      desc: 'Encrypted checkout supporting ABA PAY, Wing, ACLEDA KHQR, Visa, MasterCard, and PayPal.',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-2xs">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
            Why Book With Trip.com
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            Official travel booking partner for the Kingdom of Cambodia. Over 10 million journeys planned with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${item.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
