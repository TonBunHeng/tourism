import { useState } from 'react';
import { Heart, ChevronRight, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TRAVEL_MOMENTS = [
  {
    id: 1,
    title: 'Top 5 Things You Should Know Before Visiting Angkor Wat',
    author: 'Dara Vicheka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    likes: 2480,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    tag: 'Culture Guide',
  },
  {
    id: 2,
    title: 'Hidden Waterfalls of Phnom Kulen National Sacred Park',
    author: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    likes: 1890,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
    tag: 'Adventure',
  },
  {
    id: 3,
    title: 'Sunset Cruises on Tonle Sap Freshwater Biosphere',
    author: 'Marc Dubois',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    likes: 1420,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tag: 'Nature',
  },
  {
    id: 4,
    title: 'A Foodie Guide to Siem Reap Street Markets & Amok',
    author: 'Kimberly Tan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    likes: 3120,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    tag: 'Food & Wine',
  },
];

export default function TripTravelMoments() {
  const [likesState, setLikesState] = useState({});

  const handleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikesState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
            Magical trip moments that last
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Real stories, photography, and travel advice from our verified tourist community.
          </p>
        </div>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#287dfa] hover:underline"
        >
          <span>More</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRAVEL_MOMENTS.map((moment) => {
          const isLiked = likesState[moment.id];
          const totalLikes = isLiked ? moment.likes + 1 : moment.likes;

          return (
            <Link
              key={moment.id}
              to="/gallery"
              className="group relative h-80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 border border-gray-100 dark:border-zinc-800"
            >
              <img
                src={moment.image}
                alt={moment.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Tag Top Left & Like Button Top Right */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/40 text-white backdrop-blur-md">
                  {moment.tag}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleLike(moment.id, e)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm backdrop-blur-md ${
                    isLiked
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/80 dark:bg-zinc-900/80 text-gray-700 dark:text-zinc-200 hover:text-rose-500'
                  }`}
                >
                  <Heart size={15} className={isLiked ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Title & Author Bottom */}
              <div className="relative z-10 text-white space-y-2">
                <h3 className="text-sm font-black tracking-tight leading-snug drop-shadow-sm group-hover:text-blue-200 transition-colors line-clamp-2">
                  {moment.title}
                </h3>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
                  <div className="flex items-center gap-2">
                    <img
                      src={moment.avatar}
                      alt={moment.author}
                      className="w-5 h-5 rounded-full object-cover border border-white/40"
                    />
                    <span className="text-[11px] font-semibold text-gray-200 truncate max-w-[100px]">
                      {moment.author}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-300 font-medium flex items-center gap-1">
                    <Heart size={12} className={isLiked ? 'text-rose-400 fill-current' : 'text-gray-300'} />
                    <span>{totalLikes.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
