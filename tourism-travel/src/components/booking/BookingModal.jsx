import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import bookingService from '../../services/bookingService';

export default function BookingModal({
  isOpen,
  onClose,
  business,
  initialService = null,
  onSuccess
}) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showAlert } = useAlert();

  const services = Array.isArray(business?.services) ? business.services : [];

  const [serviceId, setServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('12:00');
  const [guests, setGuests] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  // Set default minimum date as today
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('');
      setCreatedBooking(null);
      setServiceId(initialService?.id ? String(initialService.id) : '');
      
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setBookingDate(tomorrow.toISOString().split('T')[0]);
      
      if (user) {
        setCustomerName(user.name || '');
        setCustomerEmail(user.email || '');
        setCustomerPhone(user.phone || '');
      }
    }
  }, [isOpen, initialService, user]);

  if (!isOpen || !business) return null;

  const selectedServiceObj = services.find(s => String(s.id) === String(serviceId));
  const estimatedPrice = selectedServiceObj && selectedServiceObj.price !== null
    ? Number(selectedServiceObj.price) * Number(guests || 1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!bookingDate) {
      setError('Please select a booking date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        business_id: business.id,
        service_id: serviceId ? parseInt(serviceId, 10) : undefined,
        customer_name: customerName.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        booking_date: bookingDate,
        booking_time: bookingTime || undefined,
        number_of_guests: parseInt(guests, 10) || 1,
        special_requests: specialRequests.trim() || undefined,
      };

      const res = await bookingService.createBooking(payload);
      const bookingData = res?.data || res;
      setCreatedBooking(bookingData);

      showAlert({
        title: 'Booking Placed!',
        message: `Your booking request #${bookingData.booking_reference} has been sent to ${business.name}.`,
        type: 'success',
      });

      if (onSuccess) {
        onSuccess(bookingData);
      }
    } catch (err) {
      setError(err?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-800/30">
          <div>
            <span className="text-[10px] font-bold text-[#003E83] dark:text-[#60a5fa] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Booking Request
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {business.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {createdBooking ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Booking Request Submitted!</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                Your request has been forwarded to the business owner. You will receive an in-app notification once confirmed.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-lg border border-gray-200 dark:border-zinc-700/60 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-zinc-400">Reference Number</span>
                <span className="font-mono font-bold text-[#003E83] dark:text-[#60a5fa]">{createdBooking.booking_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-zinc-400">Date & Time</span>
                <span className="font-bold text-gray-900 dark:text-white">{createdBooking.booking_date} {createdBooking.booking_time ? `at ${createdBooking.booking_time}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-zinc-400">Guests</span>
                <span className="font-bold text-gray-900 dark:text-white">{createdBooking.number_of_guests} guest(s)</span>
              </div>
              {createdBooking.total_price > 0 && (
                <div className="flex justify-between border-t border-gray-200 dark:border-zinc-700 pt-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Total Estimated</span>
                  <span>${Number(createdBooking.total_price).toFixed(2)} {createdBooking.currency || 'USD'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                to="/bookings"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View My Bookings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>Please log in to finalize your reservation with this business.</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-bold underline text-[#003E83] dark:text-[#60a5fa] ml-2 shrink-0 cursor-pointer"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Service Selection */}
            {services.length > 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Select Service / Package (Optional)
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none transition-all"
                >
                  <option value="">General Table / Visit Reservation (No specific package)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id} disabled={!s.is_available}>
                      {s.name} {s.price !== null ? `— $${s.price}` : ''} {!s.is_available ? '(Unavailable)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Booking Date *</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Time / Slot</span>
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
            </div>

            {/* Guests & Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Guests</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your contact name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+855 12 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                Special Requests or Notes
              </label>
              <textarea
                rows={2}
                placeholder="Dietary preferences, special setup, arrival details..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none resize-none"
              />
            </div>

            {/* Price Preview Card */}
            {estimatedPrice > 0 && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">Estimated Total:</span>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    ${selectedServiceObj.price} × {guests} guest(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#003E83] dark:text-[#60a5fa]">
                    ${estimatedPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400 block">USD</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Request Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
