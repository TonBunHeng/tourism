import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  X, 
  Building2 
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export default function Listings() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('2 hours');
  const [capacity, setCapacity] = useState('10');
  const [status, setStatus] = useState('active');

  const fetchServices = useCallback(() => {
    if (!selectedBusiness?.id) return;
    setIsLoading(true);
    businessOwnerService.getServices(selectedBusiness.id)
      .then((res) => {
        if (res?.success) {
          const list = res.data?.services || res.data || [];
          setServices(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load services:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedBusiness]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('25');
    setDuration('2 hours');
    setCapacity('10');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setName(svc.name || '');
    setDescription(svc.description || '');
    setPrice(String(svc.price || ''));
    setDuration(svc.duration || '');
    setCapacity(String(svc.capacity || '10'));
    setStatus(svc.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please enter service name.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price) || 0,
      duration: duration.trim() || undefined,
      capacity: parseInt(capacity, 10) || undefined,
      status,
    };

    try {
      if (editingService) {
        const res = await businessOwnerService.updateService(selectedBusiness.id, editingService.id, payload);
        if (res?.success) {
          showSuccess('Service listing updated successfully.');
          setIsModalOpen(false);
          fetchServices();
        }
      } else {
        const res = await businessOwnerService.createService(selectedBusiness.id, payload);
        if (res?.success) {
          showSuccess('New service listing published!', 'Service Created');
          setIsModalOpen(false);
          fetchServices();
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (svcId) => {
    const confirmed = await showConfirm({
      title: 'Delete Service Listing',
      message: 'Are you sure you want to delete this service listing? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deleteService(selectedBusiness.id, svcId);
      if (res?.success) {
        showSuccess('Service deleted.');
        setServices((prev) => prev.filter((s) => s.id !== svcId));
      }
    } catch (err) {
      showError(err.message || 'Failed to delete service.');
    }
  };

  if (!selectedBusiness) {
    return (
      <EmptyState
        icon={Building2}
        title="No active business selected"
        description="Please select or register a business profile first before managing listings."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
            Service Catalog ({selectedBusiness.name})
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Listings & Offerings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage your bookable tourism services, pricing tiers, party capacities, and schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading published listings..." />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No services created yet"
          description="Create your first tourism service (e.g. Khmer Cooking Class, Deluxe Heritage Suite, or Guided Boat Excursion)."
          action={
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#003E83] text-white text-xs font-bold shadow-sm"
            >
              Add First Service
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={svc.status === 'active' ? 'success' : 'neutral'}>
                    {svc.status || 'Active'}
                  </Badge>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ${Number(svc.price || 0).toFixed(2)}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {svc.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {svc.description || 'Verified tourism experience offered by business.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                    <span>{svc.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                    <span>Max: {svc.capacity || '10'} guests</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(svc)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(svc.id)}
                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingService ? 'Edit Service Listing' : 'Publish New Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Service / Offering Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Traditional Khmer Amok Cooking Masterclass"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Price (USD $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2.5 hours"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Max Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Description & Inclusions
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail what is included, departure times, dietary options, or equipment provided..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Saving...' : editingService ? 'Update Service' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
