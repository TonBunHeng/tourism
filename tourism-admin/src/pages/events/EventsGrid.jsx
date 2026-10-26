import { Eye, Edit, Trash2, Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import { getEventStatusColor as getStatusColor, getCategoryColor } from '../../utils/StatusUtils';

export default function EventsGrid({
  events = [],
  onViewDetails,
  onEdit,
  onDelete,
  onViewEvent,
  onEditEvent,
  onDeleteEvent
}) {
  const handleView = onViewDetails || onViewEvent || (() => {});
  const handleEdit = onEdit || onEditEvent || (() => {});
  const handleDeleteItem = onDelete || onDeleteEvent || (() => {});

  const safeEvents = events || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
      {safeEvents.length > 0 ? (
        safeEvents.map((event) => {
          return (
            <div
              key={event.id}
              onClick={() => handleView(event)}
              className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-4 hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors cursor-pointer"
            >
              {/* Event Image Picture Header */}
              <div className="relative w-full h-36 mb-3 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center p-3 text-center">
                    <span className="text-white text-xs font-semibold drop-shadow">{event.title}</span>
                  </div>
                )}
                {event.featured && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="px-2 py-0.5 bg-[var(--color-warning-text)] text-[var(--color-white)] text-xs font-medium rounded-md">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm line-clamp-1">{event.title}</h3>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md border ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleView(event); }}
                    className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                    className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(event.id)}
                    className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-3 line-clamp-2">{event.description}</p>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{(event.attendees || event.attendees_count || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border ${getStatusColor(event.status)}`}>
                    <Clock className="w-3 h-3" />
                    {event.status}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]">{event.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[var(--color-amber-star)] text-[var(--color-amber-star)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{event.rating}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No events found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
