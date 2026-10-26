import { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Heart, Users, Award, MapPin, Globe, Sparkles } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import provinceService from '../../services/provinceService';
import placeService from '../../services/placeService';
import businessService from '../../services/businessService';
import eventService from '../../services/eventService';

export default function About() {
  const [stats, setStats] = useState([
    { label: 'Provinces Covered', value: '25', desc: 'Across entire Cambodia' },
    { label: 'Documented Destinations', value: '24+', desc: 'Verified cultural & nature sites' },
    { label: 'Licensed Guides & Businesses', value: '18+', desc: 'Ministry of Tourism verified' },
    { label: 'Annual Cultural Festivals', value: '8+', desc: 'Celebrated nationwide' },
  ]);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [provRes, placeRes, bizRes, eventRes] = await Promise.allSettled([
          provinceService.getProvinces(),
          placeService.getPlaces({ per_page: 100 }),
          businessService.getBusinesses({ per_page: 100 }),
          eventService.getEvents({ per_page: 100 })
        ]);

        const provCount = provRes.status === 'fulfilled' ? (provRes.value?.data?.length || 25) : 25;
        const placeCount = placeRes.status === 'fulfilled' ? (placeRes.value?.data?.places?.length || placeRes.value?.data?.data?.length || placeRes.value?.data?.length || 24) : 24;
        const bizCount = bizRes.status === 'fulfilled' ? (bizRes.value?.data?.businesses?.length || bizRes.value?.data?.data?.length || bizRes.value?.data?.length || 18) : 18;
        const eventCount = eventRes.status === 'fulfilled' ? (eventRes.value?.data?.events?.length || eventRes.value?.data?.data?.length || eventRes.value?.data?.length || 8) : 8;

        setStats([
          { label: 'Provinces Covered', value: `${provCount}`, desc: 'Across entire Cambodia' },
          { label: 'Documented Destinations', value: `${placeCount}+`, desc: 'Verified cultural & nature sites' },
          { label: 'Licensed Guides & Businesses', value: `${bizCount}+`, desc: 'Ministry of Tourism verified' },
          { label: 'Annual Cultural Festivals', value: `${eventCount}+`, desc: 'Celebrated nationwide' },
        ]);
      } catch (err) {
        console.warn('Backend metrics fallback used:', err.message);
      }
    };

    fetchPlatformStats();
  }, []);

  const values = [
    {
      icon: ShieldCheck,
      title: 'Authenticity & Cultural Respect',
      desc: 'We partner directly with Khmer historians and local community elders to ensure sacred temples and ancient heritage sites are honored and preserved.'
    },
    {
      icon: Heart,
      title: 'Community-First Tourism',
      desc: 'Over 85% of tour fees flow directly to local family-run businesses, homestays, community rangers, and indigenous artisan workshops.'
    },
    {
      icon: Compass,
      title: 'Seamless Modern Exploration',
      desc: 'Combining cutting-edge itinerary building, instant booking, and transparent pricing inspired by world-class travel technology.'
    },
    {
      icon: Globe,
      title: 'Eco-Conservation Leadership',
      desc: 'Committed to ethical wildlife sanctuaries with zero animal riding, plastic-free trekking initiatives, and rainforest reforestation.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-900 via-[#003E83] to-slate-900 text-white p-8 sm:p-14 shadow-lg text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md border border-white/15">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Our Vision & Heritage Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Connecting the World to the Soul of Cambodia
        </h1>
        <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
          AngkorVerses is the Kingdom of Cambodia&apos;s premier digital tourism gateway, dedicated to showcasing ancient Angkorian wonders, tropical coastlines, and vibrant local communities.
        </p>
      </div>

      {/* Metrics Counter (Live from Backend API) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl text-center space-y-1 shadow-xs"
          >
            <p className="text-3xl sm:text-4xl font-extrabold text-[#003E83] dark:text-blue-400">{s.value}</p>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{s.label}</h4>
            <p className="text-[11px] text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Story & Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 text-xs font-bold text-[#003E83] dark:text-blue-400">
            <Compass size={13} />
            <span>Our Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Preserving History Through Sustainable Travel
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Cambodia is home to one of the most awe-inspiring civilizations on earth. Beyond the legendary towers of Angkor Wat lie emerald cardamom mountain rainforests, ancient Mekong river dolphins, peaceful rural pottery villages, and pristine coral islands.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            We founded AngkorVerses to empower local Cambodian entrepreneurs, licensed guides, and community tourism cooperatives with a modern digital platform that makes discovering and booking Cambodia as effortless and trustworthy as top global platforms like Airbnb and Booking.com.
          </p>
        </div>

        <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 dark:border-zinc-800">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
            alt="Angkor Heritage"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">UNESCO World Heritage</span>
            <p className="text-lg font-bold">Angkor Archaeological Park, Siem Reap</p>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003E83] dark:text-blue-400">
            Core Principles
          </span>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            What Drives AngkorVerses
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl space-y-3 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{v.title}</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
