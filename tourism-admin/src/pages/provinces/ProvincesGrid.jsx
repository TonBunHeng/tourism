import { Eye, Edit, Trash2, Users, Navigation, Building2, Home, Star, Clock } from 'lucide-react';
import { getStatusColor, getTypeBadgeColor } from '../../utils/StatusUtils';

export default function ProvincesGrid({ provinces, onViewProvince, onEditProvince, onDeleteProvince }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
      {provinces.length > 0 ? (
        provinces.map((province) => {
          return (
            <div
              key={province.id}
              onClick={() => onViewProvince(province)}
              className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-gray-200 dark:border-zinc-800 rounded-md p-4 hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm truncate">{province.name}</h3>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md border ${getTypeBadgeColor(province.type)}`}>
                    {province.type}
                  </span>
                </div>
                {/* Actions: always visible on touch/mobile, fade in on hover for pointer devices */}
                <div className="flex gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onViewProvince(province); }}
                    className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEditProvince(province); }}
                    className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteProvince(province.id || province); }}
                    className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-3 line-clamp-2">{province.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{province.population}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                  <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{province.area}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{province.districts} Districts</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                  <Home className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{province.places} Places</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{province.rating}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getStatusColor(province.status)}`}>
                  <Clock className="w-3 h-3" />
                  {province.status}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No provinces found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
