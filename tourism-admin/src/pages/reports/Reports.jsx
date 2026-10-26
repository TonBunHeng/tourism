import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, FileSpreadsheet } from 'lucide-react';
import ReportsHeader from './ReportsHeader';
import ReportsStats from './ReportsStats';
import ReportsTable from './ReportsTable';
import { exportToPDF, exportToExcel } from '../../utils/exportReports';
import { useAlert } from '../../context/AlertContext';
import placeService from '../../services/placeService';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import reviewService from '../../services/reviewService';
import categoryService from '../../services/categoryService';
import bookingService from '../../services/bookingService';
import tourService from '../../services/tourService';
import { useSearch } from '../../context/SearchContext';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchTerm, setSearchTerm, setPlaceholder } = useSearch();

  // Tab persistence via search param + sessionStorage (defaults to 'all' master dataset)
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('reports_active_tab');
    return tabFromStorage || 'all';
  });

  useEffect(() => {
    const tabPlaceholders = {
      all: 'Search all records across platform...',
      places: 'Search places report...',
      events: 'Search events report...',
      tours: 'Search tours report...',
      bookings: 'Search bookings report...',
      users: 'Search users report...',
      reviews: 'Search reviews report...',
      categories: 'Search categories report...'
    };
    if (setPlaceholder) {
      setPlaceholder(tabPlaceholders[activeTab] || 'Search reports...');
    }
  }, [activeTab, setPlaceholder]);

  const [selectedDay, setSelectedDay] = useState('');
  const [appliedDay, setAppliedDay] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { showConfirm, showSuccess, showError } = useAlert();
  const [totalExports, setTotalExports] = useState(16);

  const cachedDatasets = getPageCache('reports_datasets');
  const [isLoading, setIsLoading] = useState(() => !cachedDatasets);

  const [datasets, setDatasets] = useState(() => cachedDatasets || {
    all: [],
    places: [],
    events: [],
    tours: [],
    bookings: [],
    users: [],
    reviews: [],
    categories: []
  });

  const loadAllReportsData = async () => {
    if (!cachedDatasets && datasets.all.length === 0) {
      setIsLoading(true);
    }
    try {
      const [placesRes, eventsRes, usersRes, reviewsRes, categoriesRes, bookingsRes, toursRes] = await Promise.allSettled([
        placeService.getPlaces({ per_page: 100, all: true }),
        eventService.getEvents({ per_page: 100, all: true }),
        userService.getUsers({ per_page: 100, all: true }),
        reviewService.getReviews({ per_page: 100, all: true }),
        categoryService.getCategories({ per_page: 100, all: true }),
        bookingService.getBookings({ per_page: 100, all: true }),
        tourService.getTours({ per_page: 100, all: true })
      ]);

      const extractArray = (resVal) => {
        if (!resVal) return [];
        if (Array.isArray(resVal)) return resVal;
        if (Array.isArray(resVal.data)) return resVal.data;
        if (Array.isArray(resVal.data?.data)) return resVal.data.data;
        if (Array.isArray(resVal.data?.bookings)) return resVal.data.bookings;
        if (Array.isArray(resVal.data?.tours)) return resVal.data.tours;
        return [];
      };

      const rawPlaces = placesRes.status === 'fulfilled' ? extractArray(placesRes.value) : [];
      const rawEvents = eventsRes.status === 'fulfilled' ? extractArray(eventsRes.value) : [];
      const rawUsers = usersRes.status === 'fulfilled' ? extractArray(usersRes.value) : [];
      const rawReviews = reviewsRes.status === 'fulfilled' ? extractArray(reviewsRes.value) : [];
      const rawCategories = categoriesRes.status === 'fulfilled' ? extractArray(categoriesRes.value) : [];
      const rawBookings = bookingsRes.status === 'fulfilled' ? extractArray(bookingsRes.value) : [];
      const rawTours = toursRes.status === 'fulfilled' ? extractArray(toursRes.value) : [];

      // 1. Formatted Places
      const formattedPlaces = rawPlaces.map(p => ({
        id: p.id,
        entityType: 'Place',
        name: p.name || 'Unnamed Place',
        category: p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || 'General',
        province: p.province_name || (typeof p.province === 'object' ? p.province?.name : p.province) || 'Siem Reap',
        rating: Number(p.rating || 4.5),
        reviews: Number(p.reviews_count || 0),
        status: p.status || 'Active',
        createdAt: p.created_at ? String(p.created_at).split('T')[0] : (p.createdAt ? String(p.createdAt).split('T')[0] : '2026-08-18'),
        location: p.address || 'Cambodia',
        primaryName: p.name || 'Unnamed Place',
        secondaryDetail: `${p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || 'Attraction'} • ${p.province_name || (typeof p.province === 'object' ? p.province?.name : p.province) || 'Siem Reap'}`,
        date: p.created_at ? String(p.created_at).split('T')[0] : (p.createdAt ? String(p.createdAt).split('T')[0] : '2026-08-18')
      }));

      // 2. Formatted Events
      const formattedEvents = rawEvents.map(e => ({
        id: e.id,
        entityType: 'Event',
        title: e.title || 'Upcoming Event',
        location: e.location || 'Phnom Penh',
        startDate: e.start_date ? String(e.start_date).split('T')[0] : (e.startDate ? String(e.startDate).split('T')[0] : '2026-08-18'),
        endDate: e.end_date ? String(e.end_date).split('T')[0] : (e.endDate ? String(e.endDate).split('T')[0] : '2026-08-20'),
        attendees: Number(e.attendees_count || 500),
        status: e.status || 'Upcoming',
        primaryName: e.title || 'Upcoming Event',
        secondaryDetail: e.location || 'Phnom Penh',
        date: e.start_date ? String(e.start_date).split('T')[0] : (e.startDate ? String(e.startDate).split('T')[0] : '2026-08-18')
      }));

      // 3. Formatted Tours
      const formattedTours = rawTours.map(t => ({
        id: t.id,
        entityType: 'Tour',
        title: t.title || 'Tour Package',
        destination: t.destination || t.province || 'Siem Reap',
        duration: t.duration || (t.duration_days ? `${t.duration_days} Days` : '1 Full Day'),
        price_per_person: parseFloat(t.price || t.price_per_person || 0),
        rating: parseFloat(t.rating || 5.0),
        reviews_count: Number(t.reviews_count || 0),
        status: t.status === 'active' ? 'Active' : (t.status || 'Active'),
        category: t.category || 'Tour Package',
        description: t.description || 'Curated travel experience in Cambodia.',
        primaryName: t.title || 'Tour Package',
        secondaryDetail: `${t.destination || 'Siem Reap'} • $${parseFloat(t.price || t.price_per_person || 0)} / person`,
        date: t.created_at ? String(t.created_at).split('T')[0] : '2026-08-18'
      }));

      // 4. Formatted Bookings
      const formattedBookings = rawBookings.map(b => ({
        id: b.id,
        entityType: 'Booking',
        booking_code: b.booking_code || `BK-${b.id || Math.floor(1000 + Math.random() * 9000)}`,
        service_name: b.service?.name || b.service_name || 'Travel Experience',
        business_name: b.business?.name || b.business_name || 'Hospitality Partner',
        total_price: Number(b.total_price) || 0,
        booking_date: b.booking_date ? String(b.booking_date).split('T')[0] : (b.created_at ? String(b.created_at).split('T')[0] : '2026-08-18'),
        status: b.status === 'confirmed' ? 'Active' : (b.status === 'pending' ? 'Pending' : (b.status || 'Active')),
        customer_name: b.user?.name || b.customer_name || 'Traveler',
        customer_email: b.user?.email || b.customer_email || 'guest@example.com',
        primaryName: `Booking #${b.booking_code || b.id}`,
        secondaryDetail: `${b.service?.name || b.service_name || 'Experience'} • $${Number(b.total_price) || 0}`,
        date: b.booking_date ? String(b.booking_date).split('T')[0] : (b.created_at ? String(b.created_at).split('T')[0] : '2026-08-18')
      }));

      // 5. Formatted Users
      const formattedUsers = rawUsers.map(u => ({
        id: u.id,
        entityType: 'User',
        name: u.name || 'User',
        email: u.email || 'N/A',
        role: u.role || 'User',
        joinedDate: u.created_at ? String(u.created_at).split('T')[0] : (u.joinedDate ? String(u.joinedDate).split('T')[0] : '2026-08-18'),
        reviewsCount: Number(u.reviews_count || 0),
        status: u.status || 'Active',
        primaryName: u.name || 'User',
        secondaryDetail: `${u.role || 'User'} • ${u.email || ''}`,
        date: u.created_at ? String(u.created_at).split('T')[0] : (u.joinedDate ? String(u.joinedDate).split('T')[0] : '2026-08-18')
      }));

      // 6. Formatted Reviews
      const formattedReviews = rawReviews.map(r => ({
        id: r.id,
        entityType: 'Review',
        userName: r.user_name || (typeof r.user === 'object' ? r.user?.name : r.user) || 'Traveler',
        avatar: r.avatar || r.user_avatar || (typeof r.user === 'object' ? r.user?.avatar : null),
        placeName: r.place_name || (typeof r.place === 'object' ? r.place?.name : r.place) || 'Attraction',
        rating: Number(r.rating || 5),
        comment: r.comment || r.title || '',
        createdAt: r.created_at ? String(r.created_at).split('T')[0] : (r.date || '2026-08-18'),
        date: r.date || (r.created_at ? String(r.created_at).split('T')[0] : '2026-08-18'),
        status: r.status || 'Approved',
        primaryName: `${r.user_name || (typeof r.user === 'object' ? r.user?.name : r.user) || 'Traveler'} on ${r.place_name || (typeof r.place === 'object' ? r.place?.name : r.place) || 'Attraction'}`,
        secondaryDetail: `${Number(r.rating || 5).toFixed(1)}★ • ${r.comment ? `"${r.comment.slice(0, 40)}..."` : 'Feedback'}`,
      }));

      // 7. Formatted Categories
      const formattedCategories = rawCategories.map(c => ({
        id: c.id,
        entityType: 'Category',
        name: c.name || 'Category',
        description: c.description || 'Category description',
        totalPlaces: Number(c.places_count || 0),
        status: c.status || 'Active',
        primaryName: c.name || 'Category',
        secondaryDetail: `${Number(c.places_count || 0)} Places Listed`,
        date: c.created_at ? String(c.created_at).split('T')[0] : '2026-08-18'
      }));

      // Master Consolidated Dataset (All records united across platform)
      const combinedAll = [
        ...formattedPlaces,
        ...formattedEvents,
        ...formattedTours,
        ...formattedBookings,
        ...formattedUsers,
        ...formattedReviews,
        ...formattedCategories
      ];

      // Sort by date descending
      combinedAll.sort((a, b) => {
        const dateA = a.date || a.createdAt || a.startDate || '';
        const dateB = b.date || b.createdAt || b.startDate || '';
        return String(dateB).localeCompare(String(dateA));
      });

      const newDatasets = {
        all: combinedAll,
        places: formattedPlaces,
        events: formattedEvents,
        tours: formattedTours,
        bookings: formattedBookings,
        users: formattedUsers,
        reviews: formattedReviews,
        categories: formattedCategories
      };

      setDatasets(newDatasets);
      setPageCache('reports_datasets', newDatasets);
    } catch (e) {
      console.error('Failed to load reports datasets from API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllReportsData();
  }, []);

  const currentDataset = datasets[activeTab] || datasets.all || [];

  const filteredData = currentDataset.filter(item => {
    const itemDate = item.date || item.createdAt || item.startDate || item.joinedDate || item.booking_date;

    let matchesDate = true;
    const activeDate = appliedDay || selectedDay;
    if (itemDate && activeDate) {
      const itemDateStr = String(itemDate);
      if (item.startDate && item.endDate) {
        matchesDate = activeDate >= String(item.startDate) && activeDate <= String(item.endDate);
      } else {
        matchesDate = itemDateStr === activeDate || itemDateStr.startsWith(activeDate);
      }
    }

    const term = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !term || Object.values(item).some(val =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const s = (item.status || '').toLowerCase();
      const f = statusFilter.toLowerCase();
      if (f === 'active') {
        matchesStatus = ['active', 'approved', 'completed', 'confirmed', 'published'].includes(s);
      } else if (f === 'pending') {
        matchesStatus = ['pending', 'upcoming', 'scheduled', 'draft', 'under_review'].includes(s);
      } else if (f === 'suspended') {
        matchesStatus = ['suspended', 'flagged', 'inactive', 'rejected', 'cancelled'].includes(s);
      } else {
        matchesStatus = s.includes(f);
      }
    }

    return matchesDate && matchesSearch && matchesStatus;
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('reports_active_tab', tabId);
    if (tabId === 'all') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }
  };

  const handleSubmitFilter = () => {
    setAppliedDay(selectedDay);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 250);
  };

  const handleResetFilter = () => {
    setSelectedDay('');
    setAppliedDay('');
    setSearchTerm('');
    setStatusFilter('All');
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
    }, 250);
    loadAllReportsData();
  };

  const handleOpenExportPDF = async () => {
    const tabName = activeTab === 'all'
      ? 'All Records (Master)'
      : (activeTab ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Data');
    const recordCount = filteredData.length;

    const confirmed = await showConfirm({
      title: 'Export PDF Report Confirmation',
      message: `Are you sure you want to export the "${tabName}" dataset (${recordCount} items) as a styled PDF document?`,
      confirmText: 'Export PDF',
      cancelText: 'Cancel',
      type: 'danger',
      customIcon: (
        <div className="w-16 h-16 rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 ring-8 ring-red-50/70 dark:ring-red-950/30 flex items-center justify-center shadow-xs">
          <FileText size={30} />
        </div>
      )
    });

    if (!confirmed) return;

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      let headers = [];
      let rows = [];

      if (activeTab === 'all') {
        headers = ['#', 'Type', 'ID', 'Title / Subject', 'Category / Detail', 'Status', 'Date'];
        rows = filteredData.map((r, idx) => [
          idx + 1,
          r.entityType || 'Record',
          r.id,
          r.primaryName || r.name || r.title || r.userName || 'N/A',
          r.secondaryDetail || r.category || r.destination || r.email || 'N/A',
          r.status || 'Active',
          r.date || r.createdAt || r.startDate || 'N/A'
        ]);
      } else if (activeTab === 'places') {
        headers = ['ID', 'Place Name', 'Category', 'Province', 'Rating', 'Reviews', 'Status', 'Created Date'];
        rows = filteredData.map(r => [r.id, r.name, r.category, r.province, r.rating, r.reviews, r.status, r.createdAt]);
      } else if (activeTab === 'events') {
        headers = ['ID', 'Event Title', 'Location', 'Start Date', 'End Date', 'Attendees', 'Status'];
        rows = filteredData.map(r => [r.id, r.title, r.location, r.startDate, r.endDate, r.attendees, r.status]);
      } else if (activeTab === 'tours') {
        headers = ['ID', 'Tour Title', 'Destination', 'Duration', 'Price / Person ($)', 'Rating', 'Status'];
        rows = filteredData.map(r => [r.id, r.title, r.destination, r.duration, r.price_per_person, r.rating, r.status]);
      } else if (activeTab === 'bookings') {
        headers = ['ID', 'Booking Code', 'Guest Name', 'Service Name', 'Date', 'Price ($)', 'Status'];
        rows = filteredData.map(r => [r.id, r.booking_code, r.customer_name || 'Guest', r.service_name, r.booking_date || r.date, r.total_price, r.status]);
      } else if (activeTab === 'users') {
        headers = ['User ID', 'Full Name', 'Email', 'Role', 'Joined Date', 'Reviews Written', 'Status'];
        rows = filteredData.map(r => [r.id, r.name, r.email, r.role, r.joinedDate, r.reviewsCount, r.status]);
      } else if (activeTab === 'reviews') {
        headers = ['ID', 'User Name', 'Target Place', 'Rating', 'Comment', 'Date', 'Status'];
        rows = filteredData.map(r => [r.id, r.userName, r.placeName, r.rating, r.comment, r.date, r.status]);
      } else if (activeTab === 'categories') {
        headers = ['Category ID', 'Category Name', 'Description', 'Total Places', 'Status'];
        rows = filteredData.map(r => [r.id, r.name, r.description, r.totalPlaces, r.status]);
      }

      const result = exportToPDF({
        title: `${tabName.toUpperCase()} DATASET REPORT`,
        subtitle: `Exported on ${new Date().toLocaleString()} | Filter: ${statusFilter} | Total Records: ${recordCount}`,
        headers,
        rows,
        filename: `Tourism_${activeTab === 'all' ? 'All_Records_Master' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}_Report_${todayStr}.pdf`
      });

      if (result.success) {
        setTotalExports(prev => prev + 1);
        showSuccess(`The "${tabName}" dataset (${recordCount} items) has been exported to PDF successfully.`, 'PDF Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate PDF report document.', 'Export Failed');
      }
    } catch (e) {
      showError(e.message || 'An unexpected error occurred during PDF export.', 'Export Failed');
    }
  };

  const handleOpenExportExcel = async () => {
    const tabName = activeTab === 'all'
      ? 'All Records (Master)'
      : (activeTab ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Data');
    const recordCount = filteredData.length;

    const confirmed = await showConfirm({
      title: 'Export Excel Spreadsheet Confirmation',
      message: `Are you sure you want to export the "${tabName}" dataset (${recordCount} items) as an Excel spreadsheet?${
        activeTab === 'all' ? ' This will generate a comprehensive workbook with all datasets in separate sheets.' : ''
      }`,
      confirmText: 'Export Excel',
      cancelText: 'Cancel',
      type: 'success',
      customIcon: (
        <div className="w-16 h-16 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/70 dark:ring-emerald-950/30 flex items-center justify-center shadow-xs">
          <FileSpreadsheet size={30} />
        </div>
      )
    });

    if (!confirmed) return;

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      let result;

      if (activeTab === 'all') {
        // Multi-Sheet Master Workbook Export
        const sheets = [
          {
            name: 'All Records Master',
            data: filteredData.map((r, idx) => ({
              '#': idx + 1,
              'Dataset Type': r.entityType || 'Record',
              'Record ID': r.id,
              'Title / Subject': r.primaryName || r.name || r.title || r.booking_code || r.userName || '',
              'Category / Detail': r.secondaryDetail || r.category || r.destination || r.role || '',
              'Status': r.status || 'Active',
              'Date': r.date || r.createdAt || r.startDate || ''
            }))
          },
          {
            name: 'Places',
            data: datasets.places.map(p => ({
              'ID': p.id,
              'Place Name': p.name,
              'Category': p.category,
              'Province': p.province,
              'Rating': p.rating,
              'Reviews Count': p.reviews,
              'Status': p.status,
              'Created Date': p.createdAt,
              'Location': p.location
            }))
          },
          {
            name: 'Events',
            data: datasets.events.map(e => ({
              'ID': e.id,
              'Event Title': e.title,
              'Location': e.location,
              'Start Date': e.startDate,
              'End Date': e.endDate,
              'Attendees': e.attendees,
              'Status': e.status
            }))
          },
          {
            name: 'Tours',
            data: datasets.tours.map(t => ({
              'ID': t.id,
              'Tour Title': t.title,
              'Destination': t.destination,
              'Duration': t.duration,
              'Price ($)': t.price_per_person,
              'Rating': t.rating,
              'Status': t.status,
              'Category': t.category
            }))
          },
          {
            name: 'Bookings',
            data: datasets.bookings.map(b => ({
              'ID': b.id,
              'Booking Code': b.booking_code,
              'Guest': b.customer_name || 'Traveler',
              'Email': b.customer_email,
              'Service': b.service_name,
              'Partner': b.business_name,
              'Date': b.booking_date || b.date,
              'Total Price ($)': b.total_price,
              'Status': b.status
            }))
          },
          {
            name: 'Users',
            data: datasets.users.map(u => ({
              'User ID': u.id,
              'Full Name': u.name,
              'Email': u.email,
              'Role': u.role,
              'Joined Date': u.joinedDate,
              'Reviews Written': u.reviewsCount,
              'Status': u.status
            }))
          },
          {
            name: 'Reviews',
            data: datasets.reviews.map(r => ({
              'ID': r.id,
              'Reviewer': r.userName,
              'Target Place': r.placeName,
              'Rating': r.rating,
              'Comment': r.comment,
              'Date': r.date,
              'Status': r.status
            }))
          },
          {
            name: 'Categories',
            data: datasets.categories.map(c => ({
              'ID': c.id,
              'Category Name': c.name,
              'Description': c.description,
              'Total Places': c.totalPlaces,
              'Status': c.status
            }))
          }
        ];

        result = exportToExcel({
          sheets,
          filename: `Tourism_All_Data_Master_${todayStr}.xlsx`
        });
      } else {
        // Single sheet export for specific active dataset
        const cleanTabData = filteredData.map(item => {
          const rowCopy = { ...item };
          delete rowCopy.primaryName;
          delete rowCopy.secondaryDetail;
          delete rowCopy.avatar;
          return rowCopy;
        });

        result = exportToExcel({
          data: cleanTabData,
          sheetName: `${activeTab.toUpperCase()} Report`,
          filename: `Tourism_${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_Report_${todayStr}.xlsx`
        });
      }

      if (result.success) {
        setTotalExports(prev => prev + 1);
        showSuccess(`The "${tabName}" dataset (${recordCount} items) has been exported to Excel successfully.`, 'Excel Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate Excel spreadsheet.', 'Export Failed');
      }
    } catch (e) {
      showError(e.message || 'An unexpected error occurred during Excel export.', 'Export Failed');
    }
  };

  const totalCount = filteredData.length;
  const activeCount = filteredData.filter(i =>
    ['active', 'approved', 'completed', 'confirmed', 'published'].includes(i.status?.toLowerCase())
  ).length;

  const ratedItems = filteredData.filter(i => Number(i.rating) > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, curr) => acc + Number(curr.rating), 0) / ratedItems.length).toFixed(1)
    : '4.9';

  return (
    <div className="flex flex-col">

      <ReportsHeader
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onSubmitFilter={handleSubmitFilter}
        onResetFilter={handleResetFilter}
        onExportPDF={handleOpenExportPDF}
        onExportExcel={handleOpenExportExcel}
        isSubmitting={isSubmitting}
        isResetting={isResetting}
      />

      <ReportsStats
        totalCount={totalCount}
        activeCount={activeCount}
        avgRating={avgRating || '4.9'}
        totalExports={totalExports}
      />

      <ReportsTable
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        data={filteredData}
        isLoading={isLoading}
      />
    </div>
  );
}
