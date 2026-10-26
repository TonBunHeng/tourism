import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Check, ArrowRight, Heart } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

const DEFAULT_BEST_PLACES = [
  {
    id: 101,
    name: 'Angkor Wat Sunrise & Sacred Grand Circuit',
    location: 'Siem Reap',
    badge: 'BEST SELLER',
    duration: '3 Days / 2 Nights',
    maxGuests: 'Max 10 guests',
    rating: '5.0',
    reviews: '342',
    price: '$185',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    desc: 'Experience an unforgettable sunrise over the lotus ponds of Angkor Wat, followed by Bayon stone faces, Ta Prohm tree roots and grand circuits.',
    highlights: [
      'Angkor Wat VIP sunrise access with photography guide',
      'Ta Prohm (Tomb Raider) overgrown jungle temple'
    ],
    link: '/places',
  },
  {
    id: 102,
    name: 'Phnom Penh Royal Heritage & Sunset Mekong',
    location: 'Phnom Penh',
    badge: 'CULTURAL IMMERSION',
    duration: '2 Days / 1 Night',
    maxGuests: 'Max 8 guests',
    rating: '4.9',
    reviews: '198',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    desc: 'Explore the grand architecture of the Royal Palace and Silver Pagoda, visit the National Museum, and cruise the Mekong at golden hour.',
    highlights: [
      'Royal Palace & Emerald Buddha Silver Pagoda',
      'National Museum of Cambodia ancient Angkor sculptures'
    ],
    link: '/places',
  },
  {
    id: 103,
    name: 'Koh Rong Sanloem Coral Atolls & Bioluminescence',
    location: 'Sihanoukville',
    badge: 'ISLAND GETAWAY',
    duration: '3 Days / 2 Nights',
    maxGuests: 'Max 12 guests',
    rating: '4.9',
    reviews: '275',
    price: '$165',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    desc: 'Snorkel in crystal clear tropical waters, relax on Saracen Bay white sand beaches, and watch glowing plankton at night.',
    highlights: [
      'Speed ferry transfers and island hopping longtail boat',
      'Night snorkeling with glowing bioluminescent plankton'
    ],
    link: '/places',
  },
  {
    id: 104,
    name: 'Bokor Hill Station & Kampot Pepper Sanctuary',
    location: 'Kampot',
    badge: 'NATURE & ADVENTURE',
    duration: '2 Days / 1 Night',
    maxGuests: 'Max 8 guests',
    rating: '4.8',
    reviews: '142',
    price: '$95',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    desc: 'Ascend mist-shrouded Bokor mountain for colonial ruins and waterfall views, followed by organic pepper plantation tastings.',
    highlights: [
      'Historic French colonial palace and mountain cliff views',
      'Organic Kampot pepper farm tour and river kayak cruise'
    ],
    link: '/places',
  },
];

export default function TripBestPlaces({ places = [] }) {
  const { isFavorite, toggleFavorite } = useTravel();

  const displayPlaces = places.length >= 4
    ? places.slice(0, 4).map((p, idx) => ({
        id: p.id,
        name: p.name,
        location: p.province || DEFAULT_BEST_PLACES[idx].location,
        badge: idx === 0 ? 'BEST SELLER' : idx === 1 ? 'CULTURAL IMMERSION' : 'TOP RATED',
        duration: idx % 2 === 0 ? '3 Days / 2 Nights' : '2 Days / 1 Night',
        maxGuests: idx % 2 === 0 ? 'Max 10 guests' : 'Max 8 guests',
        rating: p.rating ? Number(p.rating).toFixed(1) : DEFAULT_BEST_PLACES[idx].rating,
        reviews: p.reviews_count || DEFAULT_BEST_PLACES[idx].reviews,
        price: p.price ? (String(p.price).startsWith('$') ? p.price : `$${p.price}`) : DEFAULT_BEST_PLACES[idx].price,
        image: p.image_url || p.image || DEFAULT_BEST_PLACES[idx].image,
        desc: p.description || DEFAULT_BEST_PLACES[idx].desc,
        highlights: DEFAULT_BEST_PLACES[idx].highlights,
        link: `/places/${p.id}`,
      }))
    : DEFAULT_BEST_PLACES;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
            Places you may like
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Top ranked destinations chosen by millions of verified explorers.
          </p>
        </div>
        <Link
          to="/places"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline"
        >
          <span>More</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayPlaces.map((place) => {
          const favorited = isFavorite(place.id);

          return (
            <div
              key={place.id}
              className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                {/* Cover Photo Frame */}
                <Link to={place.link} className="block relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Badge Top Left */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
                      {place.badge}
                    </span>
                  </div>

                  {/* Duration Top Right & Wishlist */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20">
                      <Clock size={14} className="text-[#2563eb]" />
                      <span>{place.duration}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(place);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm backdrop-blur-md active:scale-90 ${
                        favorited
                          ? 'bg-rose-500 text-white shadow-rose-500/30'
                          : 'bg-white/90 text-gray-700 hover:text-rose-500'
                      }`}
                      title={favorited ? 'Saved to wishlist' : 'Save to wishlist'}
                    >
                      <Heart size={14} className={favorited ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Location & Guests on Image */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
                    <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
                      <span>{place.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
                      <Users size={14} className="text-white/80" />
                      <span>{place.maxGuests}</span>
                    </span>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-3">
                  {/* Review Rating Badge + Free Cancellation Tag */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#0f294d] text-white text-xs font-black">
                        {place.rating}
                      </span>
                      <span className="font-bold text-[#0f294d] dark:text-white text-sm">
                        Excellent
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        ({place.reviews})
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 text-xs font-bold">
                      Free Cancellation
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={place.link} className="block">
                    <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
                      {place.name}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {place.desc}
                  </p>

                  {/* Highlights Mini-list with 2 Green Checkmarks */}
                  <div className="space-y-1.5 pt-1">
                    {place.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-3xl">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block leading-none mb-1">
                    FROM
                  </span>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-black text-[#2563eb] dark:text-blue-400">
                      {place.price}
                    </span>
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      / person
                    </span>
                  </div>
                </div>

                <Link
                  to={place.link}
                  className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <span>Book Tour</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
