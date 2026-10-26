import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SimplePagination from '../../components/common/SimplePagination';
import EventsHeader from './EventsHeader';
import EventsStats from './EventsStats';
import EventsToolbar from './EventsToolbar';
import EventsList from './EventsList';
import EventModal, { calculateAutoStatus } from './EventModal';
import EventDetailsModal from './EventDetailsModal';
import eventService from '../../services/eventService';
import deletionRequestService from '../../services/deletionRequestService';
import authService, { isSuperAdminRole } from '../../services/authService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Events() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  const cachedEvents = getPageCache('events_data');
  const [events, setEvents] = useState(() => cachedEvents?.events || []);
  const [isLoading, setIsLoading] = useState(() => !cachedEvents);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedEvents?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedEvents?.totalPages || 1);
  const itemsPerPage = 10;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cultural',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '08:00 AM',
    price: 'Free',
    status: 'Auto',
    organizer: '',
    imageUrl: ''
  });

  const categoriesList = ['All', 'Cultural', 'Festival', 'Sports', 'Food', 'Music', 'Exhibition'];

  const loadEvents = async () => {
    if (!cachedEvents && events.length === 0) {
      setIsLoading(true);
    }
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await eventService.getEvents(params);
      if (res.success && res.data) {
        const mapped = res.data.map(e => {
          const startDate = e.start_date || e.date;
          const endDate = e.end_date || null;
          const computedStatus = e.status || calculateAutoStatus(startDate, endDate, e.raw_status);

          return {
            id: e.id,
            title: e.title,
            category: e.category || 'Cultural',
            description: e.description || '',
            location: e.location || 'Phnom Penh, Cambodia',
            date: startDate,
            start_date: startDate,
            end_date: endDate,
            time: e.start_time || e.time || '08:00 AM',
            start_time: e.start_time || e.time || '08:00 AM',
            price: e.price || 'Free',
            status: computedStatus,
            organizer: e.organizer || 'Ministry of Tourism',
            attendees: Number(e.attendees_count || 0),
            rating: Number(e.rating || 5.0),
            image_url: e.image_url || e.imageUrl || '',
            imageUrl: e.image_url || e.imageUrl || '',
            featured: Boolean(e.featured)
          };
        });

        setEvents(mapped);
        const total = res.meta?.total || mapped.length;
        const pages = res.meta?.last_page || Math.ceil(total / itemsPerPage) || 1;
        setTotalRecords(total);
        setTotalPages(pages);

        if (currentPage === 1 && !searchTerm && selectedCategory === 'All' && selectedStatus === 'All') {
          setPageCache('events_data', { events: mapped, totalRecords: total, totalPages: pages });
        }
      }
    } catch (e) {
      console.error('Failed to load events from API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadEvents();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleView = (idOrEvent) => {
    const event = typeof idOrEvent === 'object'
      ? idOrEvent
      : events.find(e => e.id === idOrEvent);
    if (event) setViewingEvent(event);
  };

  const handleDelete = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    const eventTitle = event?.title || `Event #${eventId}`;

    if (isSuperAdmin) {
      const confirmed = await showConfirm({
        title: 'Delete Event',
        message: `Are you sure you want to permanently delete "${eventTitle}"?\n\nThis action cannot be undone.`,
        confirmText: 'Delete Permanently',
        type: 'danger'
      });

      if (!confirmed) return;

      try {
        await eventService.deleteEvent(eventId);
        showSuccess(`Event "${eventTitle}" has been permanently deleted.`, 'Event Deleted');
        loadEvents();
      } catch (e) {
        showError(e.message || 'Failed to delete event.', 'Delete Failed');
      }
      return;
    }

    const confirmed = await showConfirm({
      title: 'Submit Deletion Request',
      message: `Are you sure you want to submit a deletion request for "${eventTitle}"?\n\nThis will be submitted to the Super Administrator for review and approval.`,
      confirmText: 'Submit Deletion',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletionRequestService.createRequest({
        request_type: 'item',
        reason: `Request to delete event: ${eventTitle}`,
        urgency: 'medium',
        items: [{
          item_type: 'event',
          item_id: eventId,
          item_name: eventTitle,
          category: event?.category || 'Event'
        }]
      });
      showSuccess(`Deletion request for "${eventTitle}" has been submitted to Super Admin for approval.`, 'Request Submitted');
    } catch (e) {
      showError(e.message || 'Failed to submit deletion request.', 'Submission Failed');
    }
  };

  const openAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingEvent(null);
    setFormData({
      title: '',
      category: 'Cultural',
      description: '',
      location: '',
      start_date: today,
      end_date: '',
      start_time: '08:00 AM',
      price: 'Free',
      status: 'Ongoing',
      organizer: '',
      imageUrl: ''
    });
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openAdd) {
      openAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openEditModal = (idOrEvent) => {
    const event = typeof idOrEvent === 'object'
      ? idOrEvent
      : events.find(e => e.id === idOrEvent) || {};
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      category: event.category || 'Cultural',
      description: event.description || '',
      location: event.location || '',
      start_date: event.start_date || event.date || '',
      end_date: event.end_date || '',
      start_time: event.start_time || event.time || '08:00 AM',
      price: event.price || 'Free',
      status: event.status || 'Ongoing',
      organizer: event.organizer || '',
      imageUrl: event.imageUrl || event.image_url || ''
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormChange = (fieldOrData, value) => {
    if (typeof fieldOrData === 'object' && fieldOrData !== null) {
      setFormData(fieldOrData);
    } else {
      setFormData(prev => ({ ...prev, [fieldOrData]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title?.trim() || !formData.location?.trim()) return;

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description || '',
        location: formData.location.trim(),
        start_date: formData.start_date || formData.date,
        end_date: formData.end_date || null,
        start_time: formData.start_time || formData.time || '08:00 AM',
        price: formData.price || 'Free',
        status: formData.status || 'Auto',
        organizer: formData.organizer || 'Ministry of Tourism',
        image_url: formData.imageUrl || formData.image_url || ''
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        showSuccess(`Event "${formData.title}" has been updated successfully.`, 'Event Updated');
      } else {
        await eventService.createEvent(payload);
        showSuccess(`Event "${formData.title}" has been created successfully.`, 'Event Created');
      }
      closeModal();
      loadEvents();
    } catch (e) {
      showError(e.message || 'Failed to save event.', 'Save Failed');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + events.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <EventsHeader onOpenAddModal={openAddModal} />

      {/* Stats Section */}
      <EventsStats events={events} />

      {/* Main Content Section */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        <EventsToolbar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categoriesList}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          totalCount={totalRecords}
        />

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            Loading events from API...
          </div>
        ) : (
          <EventsList
            events={events}
            onViewEvent={handleView}
            onEditEvent={openEditModal}
            onDeleteEvent={handleDelete}
            startIndex={startIndex}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="events"
        />
      </div>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        editingEvent={editingEvent}
        formData={formData}
        onFormChange={handleFormChange}
        onFormDataChange={handleFormChange}
        onSubmit={handleSubmit}
        categories={categoriesList.filter(c => c !== 'All')}
      />

      {/* View Event Details Modal */}
      <EventDetailsModal
        isOpen={Boolean(viewingEvent)}
        event={viewingEvent}
        onClose={() => setViewingEvent(null)}
        onEdit={(e) => {
          setViewingEvent(null);
          openEditModal(e);
        }}
        onEditEvent={(e) => {
          setViewingEvent(null);
          openEditModal(e);
        }}
      />
    </div>
  );
}
