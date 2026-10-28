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
import { useLanguage } from '../../i18n';

const VALID_TABS = ['all', 'places', 'events', 'tours', 'bookings', 'users', 'reviews', 'categories'];

const safeStr = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val.name || val.title || val.label || fallback;
  return String(val);
};

const safeDateStr = (dateVal, fallback = '2026-08-18') => {
  if (!dateVal) return fallback;
  try {
    return String(dateVal).split('T')[0];
  } catch {
    return fallback;
  }
};

export default function Reports() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchTerm, setSearchTerm, placeholder, setPlaceholder } = useSearch();

  // Tab persistence via search param + sessionStorage (defaults to 'all' master dataset)
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('reports_active_tab');
    if (tabFromStorage && VALID_TABS.includes(tabFromStorage)) return tabFromStorage;
    return 'all';
  });

  useEffect(() => {
    const tabPlaceholders = {
      all: t('reports.searchAllPlaceholder', 'Search all records across platform...'),
      places: t('reports.searchPlacesPlaceholder', 'Search places report...'),
      events: t('reports.searchEventsPlaceholder', 'Search events report...'),
      tours: t('reports.searchToursPlaceholder', 'Search tours report...'),
      bookings: t('reports.searchBookingsPlaceholder', 'Search bookings report...'),
      users: t('reports.searchUsersPlaceholder', 'Search users report...'),
      reviews: t('reports.searchReviewsPlaceholder', 'Search reviews report...'),
      categories: t('reports.searchCategoriesPlaceholder', 'Search categories report...')
    };
    const desired = tabPlaceholders[activeTab] || t('reports.searchPlaceholder', 'Search reports...');
    if (setPlaceholder && placeholder !== desired) {
      setPlaceholder(desired);
    }
  }, [activeTab, setPlaceholder, t, placeholder]);

  const [selectedDay, setSelectedDay] = useState('');
  const [appliedDay, setAppliedDay] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { showConfirm, showSuccess, showError } = useAlert();
  const [totalExports, setTotalExports] = useState(16);

  const [isLoading, setIsLoading] = useState(() => !getPageCache('reports_datasets'));

  const [datasets, setDatasets] = useState(() => getPageCache('reports_datasets') || {
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
    if (datasets.all.length === 0) {
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
      const formattedPlaces = rawPlaces.filter(Boolean).map(p => {
        const catName = safeStr(p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category), 'General');
        const provName = safeStr(p.province_name || (typeof p.province === 'object' ? p.province?.name : p.province), 'Siem Reap');
        const placeDate = safeDateStr(p.created_at || p.createdAt);
        const pName = safeStr(p.name, 'Unnamed Place');
        return {
          id: p.id,
          entityType: 'Place',
          name: pName,
          category: catName,
          province: provName,
          rating: Number(p.rating || 4.5),
          reviews: Number(p.reviews_count || 0),
          status: safeStr(p.status, 'Active'),
          createdAt: placeDate,
          location: safeStr(p.address, 'Cambodia'),
          primaryName: pName,
          secondaryDetail: `${catName} • ${provName}`,
          date: placeDate
        };
      });

      // 2. Formatted Events
      const formattedEvents = rawEvents.filter(Boolean).map(e => {
        const startDate = safeDateStr(e.start_date || e.startDate);
        const endDate = safeDateStr(e.end_date || e.endDate);
        const loc = safeStr(e.location, 'Phnom Penh');
        const eTitle = safeStr(e.title, 'Upcoming Event');
        return {
          id: e.id,
          entityType: 'Event',
          title: eTitle,
          location: loc,
          startDate,
          endDate,
          attendees: Number(e.attendees_count || 500),
          status: safeStr(e.status, 'Upcoming'),
          primaryName: eTitle,
          secondaryDetail: loc,
          date: startDate
        };
      });

      // 3. Formatted Tours
      const formattedTours = rawTours.filter(Boolean).map(t => {
        const dest = safeStr(t.destination || (typeof t.province === 'object' ? t.province?.name : t.province), 'Siem Reap');
        const tourPrice = parseFloat(t.price || t.price_per_person || 0);
        const tourCat = safeStr(typeof t.category === 'object' ? t.category?.name : t.category, 'Tour Package');
        const tourDate = safeDateStr(t.created_at);
        const tourTitle = safeStr(t.title, 'Tour Package');
        return {
          id: t.id,
          entityType: 'Tour',
          title: tourTitle,
          destination: dest,
          duration: safeStr(t.duration || (t.duration_days ? `${t.duration_days} Days` : '1 Full Day')),
          price_per_person: tourPrice,
          rating: parseFloat(t.rating || 5.0),
          reviews_count: Number(t.reviews_count || 0),
          status: String(t.status || '').toLowerCase() === 'active' ? 'Active' : safeStr(t.status, 'Active'),
          category: tourCat,
          description: safeStr(t.description, 'Curated travel experience in Cambodia.'),
          primaryName: tourTitle,
          secondaryDetail: `${dest} • $${tourPrice} / person`,
          date: tourDate
        };
      });

      // 4. Formatted Bookings
      const formattedBookings = rawBookings.filter(Boolean).map(b => {
        const code = safeStr(b.booking_code || b.booking_reference || `BK-${b.id || Math.floor(1000 + Math.random() * 9000)}`);
        const sName = safeStr(b.service?.name || b.service_name, 'Travel Experience');
        const bName = safeStr(b.business?.name || b.business_name, 'Hospitality Partner');
        const cName = safeStr(b.user?.name || b.customer_name, 'Traveler');
        const cEmail = safeStr(b.user?.email || b.customer_email, 'guest@example.com');
        const price = Number(b.total_price) || 0;
        const bDate = safeDateStr(b.booking_date || b.created_at);
        const bStatus = String(b.status || '').toLowerCase();
        const normStatus = bStatus === 'confirmed' ? 'Active' : (bStatus === 'pending' ? 'Pending' : safeStr(b.status, 'Active'));
        return {
          id: b.id,
          entityType: 'Booking',
          booking_code: code,
          service_name: sName,
          business_name: bName,
          total_price: price,
          booking_date: bDate,
          status: normStatus,
          customer_name: cName,
          customer_email: cEmail,
          primaryName: `Booking #${code}`,
          secondaryDetail: `${sName} • $${price}`,
          date: bDate
        };
      });

      // 5. Formatted Users
      const formattedUsers = rawUsers.filter(Boolean).map(u => {
        const uName = safeStr(u.name, 'User');
        const uEmail = safeStr(u.email, 'N/A');
        const uRole = safeStr(u.role, 'User');
        const uDate = safeDateStr(u.created_at || u.joinedDate);
        return {
          id: u.id,
          entityType: 'User',
          name: uName,
          email: uEmail,
          role: uRole,
          joinedDate: uDate,
          reviewsCount: Number(u.reviews_count || 0),
          status: safeStr(u.status, 'Active'),
          primaryName: uName,
          secondaryDetail: `${uRole} • ${uEmail}`,
          date: uDate
        };
      });

      // 6. Formatted Reviews
      const formattedReviews = rawReviews.filter(Boolean).map(r => {
        const uName = safeStr(r.user_name || (typeof r.user === 'object' ? r.user?.name : r.user), 'Traveler');
        const pName = safeStr(r.place_name || (typeof r.place === 'object' ? r.place?.name : r.place), 'Attraction');
        const commentStr = safeStr(r.comment || r.title, '');
        const rDate = safeDateStr(r.created_at || r.date);
        const rRating = Number(r.rating || 5);
        return {
          id: r.id,
          entityType: 'Review',
          userName: uName,
          avatar: r.avatar || r.user_avatar || (typeof r.user === 'object' ? r.user?.avatar : null),
          placeName: pName,
          rating: rRating,
          comment: commentStr,
          createdAt: rDate,
          date: rDate,
          status: safeStr(r.status, 'Approved'),
          primaryName: `${uName} on ${pName}`,
          secondaryDetail: `${rRating.toFixed(1)}★ • ${commentStr ? `"${commentStr.slice(0, 40)}..."` : 'Feedback'}`
        };
      });

      // 7. Formatted Categories
      const formattedCategories = rawCategories.filter(Boolean).map(c => {
        const cName = safeStr(c.name, 'Category');
        const cDesc = safeStr(c.description, 'Category description');
        const cPlaces = Number(c.places_count || 0);
        const cDate = safeDateStr(c.created_at);
        return {
          id: c.id,
          entityType: 'Category',
          name: cName,
          description: cDesc,
          totalPlaces: cPlaces,
          status: safeStr(c.status, 'Active'),
          primaryName: cName,
          secondaryDetail: `${cPlaces} Places Listed`,
          date: cDate
        };
      });

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
      const s = String(item.status || '').toLowerCase();
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
    const validTab = VALID_TABS.includes(tabId) ? tabId : 'all';
    setActiveTab(validTab);
    sessionStorage.setItem('reports_active_tab', validTab);
    if (validTab === 'all') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: validTab }, { replace: true });
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
      ? t('reports.tabAllRecords', 'All Records')
      : (activeTab ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Data');
    const recordCount = filteredData.length;

    const confirmed = await showConfirm({
      title: t('reports.exportPdfConfirmation', 'Export PDF Report Confirmation'),
      message: t('reports.confirmPdfExportMessage', { tab: tabName, count: recordCount }, `Are you sure you want to export the "${tabName}" dataset (${recordCount} items) as a styled PDF document?`),
      confirmText: t('reports.btnExportPdf', 'Export PDF'),
      cancelText: t('common.cancel', 'Cancel'),
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
        showSuccess(
          t('reports.pdfExportSuccess', { tab: tabName, count: recordCount }, `The "${tabName}" dataset (${recordCount} items) has been exported to PDF successfully.`),
          t('reports.pdfExportedSuccessTitle', 'PDF Exported Successfully')
        );
      } else {
        showError(
          result.error || t('reports.pdfExportFailed', 'Failed to generate PDF report document.'), 
          t('reports.exportFailedTitle', 'Export Failed')
        );
      }
    } catch (e) {
      showError(
        e.message || t('reports.pdfExportFailed', 'Failed to generate PDF report document.'), 
        t('reports.exportFailedTitle', 'Export Failed')
      );
    }
  };

  const handleOpenExportExcel = async () => {
    const tabName = activeTab === 'all'
      ? t('reports.tabAllRecords', 'All Records')
      : (activeTab ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Data');
    const recordCount = filteredData.length;

    const confirmed = await showConfirm({
      title: t('reports.exportExcelConfirmation', 'Export Excel Spreadsheet Confirmation'),
      message: t('reports.confirmExcelExportMessage', { tab: tabName, count: recordCount }, `Are you sure you want to export the "${tabName}" dataset (${recordCount} items) as an Excel spreadsheet?`) + (activeTab === 'all' ? t('reports.excelMasterNote', ' This will generate a comprehensive workbook with all datasets in separate sheets.') : ''),
      confirmText: t('reports.btnExportExcel', 'Export Excel'),
      cancelText: t('common.cancel', 'Cancel'),
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
        showSuccess(
          t('reports.excelExportSuccess', { tab: tabName, count: recordCount }, `The "${tabName}" dataset (${recordCount} items) has been exported to Excel successfully.`),
          t('reports.excelExportedSuccessTitle', 'Excel Exported Successfully')
        );
      } else {
        showError(
          result.error || t('reports.excelExportFailed', 'Failed to generate Excel spreadsheet.'), 
          t('reports.exportFailedTitle', 'Export Failed')
        );
      }
    } catch (e) {
      showError(
        e.message || t('reports.excelExportFailed', 'Failed to generate Excel spreadsheet.'), 
        t('reports.exportFailedTitle', 'Export Failed')
      );
    }
  };

  const totalCount = filteredData.length;
  const activeCount = filteredData.filter(i =>
    ['active', 'approved', 'completed', 'confirmed', 'published'].includes(String(i.status || '').toLowerCase())
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
