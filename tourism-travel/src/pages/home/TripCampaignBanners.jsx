import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, ChevronRight } from 'lucide-react';

export default function TripCampaignBanners() {
  const campaigns = [
    {
      id: 1,
      badge: 'Trip.com Super Sale',
      title: 'GO ANGKOR',
      subtitle: 'Up to 50% OFF',
      desc: 'Sunrise Tours, Luxury Resorts & Temple Passes',
      bgGradient: 'from-purple-900 via-indigo-900 to-[#1a134a]',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      btnText: 'See Deals',
      btnColor: 'bg-amber-400 hover:bg-amber-300 text-gray-900',
      link: '/places?search=Angkor',
    },
    {
      id: 2,
      badge: 'SUPER DESTINATION',
      title: 'ISLAND ESCAPES',
      subtitle: 'Hotels & Ferries up to 40% off',
      desc: 'White sands & private villas in Koh Rong & Sanloem',
      bgGradient: 'from-sky-900 via-teal-900 to-[#072d3b]',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      btnText: 'View Deals',
      btnColor: 'bg-emerald-400 hover:bg-emerald-300 text-gray-900',
      link: '/places?search=Koh%20Rong',
    },
    {
      id: 3,
      badge: 'Trip.com Exclusive',
      title: 'PHNOM PENH & BEYOND',
      subtitle: 'Boutique Stays up to 35% off',
      desc: 'Riverside dining, Silk Island & royal heritage',
      bgGradient: 'from-amber-950 via-orange-950 to-[#2e1302]',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
      btnText: 'Book Now',
      btnColor: 'bg-amber-400 hover:bg-amber-300 text-gray-900',
      link: '/places?search=Phnom%20Penh',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <Link
            key={camp.id}
            to={camp.link}
            className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-44 sm:h-48 flex items-center p-6 text-white border border-white/10"
          >
            {/* Background image & gradient overlay */}
            <img
              src={camp.image}
              alt={camp.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 group-hover:opacity-50"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${camp.bgGradient} opacity-85 group-hover:opacity-80 transition-opacity`} />

            {/* Campaign Content */}
            <div className="relative z-10 space-y-1.5 max-w-[70%]">
              <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase rounded bg-white/20 backdrop-blur-xs tracking-wider">
                {camp.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black italic tracking-tight leading-tight">
                {camp.title}
              </h3>
              <div className="text-xs font-bold text-amber-300">
                {camp.subtitle}
              </div>
              <p className="text-[11px] text-gray-200 line-clamp-1 opacity-90">
                {camp.desc}
              </p>

              <div className="pt-2">
                <span
                  className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs transition-transform group-hover:scale-105 ${camp.btnColor}`}
                >
                  <span>{camp.btnText}</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>

            {/* Accent badge floating on the right */}
            <div className="absolute right-4 top-4 hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-center text-white">
              <span className="text-[9px] font-bold uppercase leading-none">Super</span>
              <span className="text-xs font-black text-amber-300">SALE</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
