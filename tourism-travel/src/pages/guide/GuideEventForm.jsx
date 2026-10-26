import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import guideService from '../../services/guideService';
import provinceService from '../../services/provinceService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Culture',
    description: '',
    location: '',
    province_id: '',
    start_date: '',
    end_date: '',
    price: '',
    organizer: '',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const pRes = await provinceService.getProvinces().catch(() => ({ data: [] }));
        setProvinces(pRes?.data || pRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();

    if (isEdit) {
      const fetchEvent = async () => {
        try {
          const res = await guideService.getEvent(id);
          const data = res?.data || res;
          if (data) {
            setFormData({
              title: data.title || '',
              category: data.category || 'Culture',
              description: data.description || '',
              location: data.location || '',
              province_id: data.province_id || '',
              start_date: data.start_date || '',
              end_date: data.end_date || '',
              price: data.price || '',
              organizer: data.organizer || '',
            });
          }
        } catch (err) {
          showAlert({ title: 'Error', message: err?.message || 'Failed to load event.', type: 'danger' });
          navigate('/guide/events');
        } finally {
          setFetching(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEdit, navigate, showAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showAlert({ title: 'Validation Error', message: 'Title is required.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await guideService.updateEvent(id, formData);
        showAlert({ title: 'Success', message: 'Event updated successfully.', type: 'success' });
      } else {
        await guideService.createEvent(formData);
        showAlert({ title: 'Success', message: 'Event scheduled successfully.', type: 'success' });
      }
      navigate('/guide/events');
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to save event.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Events & Festivals', to: '/guide/events' },
          { label: isEdit ? 'Edit Event' : 'Schedule Event' }
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEdit ? 'Edit Cultural Event' : 'Schedule Cultural Event'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Publish cultural festivals, traditional ceremony dates, and regional events for tourists.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-6 shadow-xs transition-colors">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
            Event Information
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Khmer New Year Water Festival"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Culture, Heritage, Exhibition..."
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Province</label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none cursor-pointer"
              >
                <option value="">Select Province</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Location & Venue</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Venue or Landmark"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Description & Program</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Festival details, schedules, entrance info..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Link
            to="/guide/events"
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold rounded-md transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? 'Update Event' : 'Save Event'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
