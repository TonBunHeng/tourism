import { useState } from 'react';
import { Star, MapPin, Eye, Edit, Trash2, Clock, ExternalLink, Image as ImageIcon, Map as MapIcon } from 'lucide-react';
import { getStatusColor } from '../../utils/StatusUtils';

export default function PlacesGrid({ places, onViewPlace, onEditPlace, onDeletePlace }) {
  const [activeMediaTab, setActiveMediaTab] = useState({}); // { [placeId]: 'photo' | 'map' }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
      {places && places.length > 0 ? (
        places.map((place) => {
          const mapQuery = encodeURIComponent(place.address || place.name || 'Cambodia');
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
          const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
          const hasImage = Boolean(place.image_url || place.image);
          const currentTab = activeMediaTab[place.id] || (hasImage ? 'photo' : 'map');

          return (
            <div
              key={place.id}
              onClick={() => onViewPlace(place.id)}
              className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-4 hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* 1. Header Media: Photo or Interactive Google Map */}
                <div
                  className="relative w-full h-36 mb-4 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)] group/media"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentTab === 'photo' && hasImage ? (
                    <img
                      src={place.image_url || place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      title={`Google Map - ${place.name}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={embedMapUrl}
                      className="w-full h-full pointer-events-none"
                    />
                  )}

                  {/* Toggle button between Photo and Map if image exists */}
                  {hasImage && (
                    <div className="absolute bottom-2 left-2 z-10 flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaTab(prev => ({ ...prev, [place.id]: 'photo' }));
                        }}
                        className={`p-1 px-2 rounded-md text-[10px] font-semibold transition-colors ${currentTab === 'photo'
                          ? 'bg-black/85 text-white'
                          : 'bg-white/90 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-white'
                          }`}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaTab(prev => ({ ...prev, [place.id]: 'map' }));
                        }}
                        className={`p-1 px-2 rounded-md text-[10px] font-semibold transition-colors ${currentTab === 'map'
                          ? 'bg-black/85 text-white'
                          : 'bg-white/90 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-white'
                          }`}
                      >
                        Map
                      </button>
                    </div>
                  )}

                  {/* Google Map badge link */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-[var(--color-white)]/90 dark:bg-zinc-900/90 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 2. Place Name, Category & Action Buttons */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm truncate">
                      {place.name}
                    </h3>
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] mt-1">
                      {place.category || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onViewPlace(place.id); }}
                      className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEditPlace(place); }}
                      className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                      title="Edit Place"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeletePlace(place.id); }}
                      className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                      title="Delete Place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Address */}
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-start gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
                  <span className="line-clamp-2">{place.address}</span>
                </p>
              </div>

              {/* 5. Card Footer: Rating & Status */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {place.rating || '5.0'}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getStatusColor(place.status)}`}>
                  <Clock className="w-3 h-3" />
                  {place.status}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No places found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
