import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import SimplePagination from '../../components/common/SimplePagination';
import EventsHeader from './EventsHeader';
import EventsGrid from './EventsGrid';
import EventDetailsModal from './EventDetailsModal';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function Events() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const statusFilter = searchParams.get('status') || 'All';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = { per_page: 8, page };
        if (statusFilter !== 'All') params.status = statusFilter;
        if (search.trim()) params.search = search.trim();

        const res = await eventService.getEvents(params);
        if (res?.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.data || [];
          setEvents(list);
          setPagination(res.meta || res.data?.meta || res.data?.pagination || res.pagination || (res.last_page !== undefined ? res : null));

          // If URL has an event ID, find it or fetch it
          if (id) {
            const found = list.find((e) => String(e.id) === String(id));
            if (found) {
              setSelectedEvent(found);
              setIsDetailsOpen(true);
            } else {
              try {
                const singleRes = await eventService.getEventById(id);
                if (singleRes?.data) {
                  setSelectedEvent(singleRes.data);
                  setIsDetailsOpen(true);
                }
              } catch (e) {
                console.error('Failed to load event by id', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [statusFilter, search, page, id]);

  const handleStatusFilterChange = (newStatus) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus !== 'All') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val.trim()) {
      params.set('search', val.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const isServerPaginated = Boolean(pagination && pagination.last_page);
  const totalPages = isServerPaginated ? pagination.last_page : (Math.ceil(events.length / 8) || 1);
  const currentPage = isServerPaginated ? (pagination.current_page || page) : Math.min(Math.max(1, page), totalPages);

  const displayedEvents = isServerPaginated
    ? events
    : events.slice((currentPage - 1) * 8, currentPage * 8);

  const handlePageChange = (newPage) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', String(newPage));
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvent(null);
    if (id) {
      navigate('/events', { replace: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Events & Festivals' }]} />
      <EventsHeader
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        search={search}
        setSearch={handleSearchChange}
      />

      <EventsGrid
        events={displayedEvents}
        loading={loading}
        onViewDetails={handleViewDetails}
      />

      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        startIndex={isServerPaginated && pagination?.from ? pagination.from - 1 : (currentPage - 1) * 8}
        endIndex={isServerPaginated && pagination?.to ? pagination.to : Math.min((currentPage - 1) * 8 + displayedEvents.length, pagination?.total ?? events.length)}
        totalRecords={pagination?.total ?? events.length}
        label="events"
        className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
      />

      <EventDetailsModal
        isOpen={isDetailsOpen}
        event={selectedEvent}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
