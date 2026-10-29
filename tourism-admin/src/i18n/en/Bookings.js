const Bookings = {
  // Page Header
  title: "Bookings",
  subtitle: "Review, approve, fulfill, and monitor tourist reservations for hotels, tour packages, and travel experiences.",

  // Stat Cards
  statTotalReservations: "Total Reservations",
  statTotalSubtext: "Booking queue volume",
  statPendingAction: "Pending Action",
  statPendingSubtext: "Requires review/confirmation",
  statConfirmedBookings: "Confirmed Bookings",
  statConfirmedSubtext: "Awaiting tourist arrival",
  statGrossValue: "Gross Transaction Value",
  statGrossSubtext: "Active confirmed volume",

  // Table Toolbar
  allBookings: "All Bookings",
  bookingCountSingle: "booking",
  bookingCountPlural: "bookings",
  filterAll: "All Bookings",
  filterPending: "Pending",
  filterConfirmed: "Confirmed",
  filterCompleted: "Completed",
  filterCancelled: "Cancelled",

  // Table Columns
  colNumber: "#",
  colReference: "REFERENCE",
  colGuestInfo: "GUEST INFORMATION",
  colExperiencePartner: "EXPERIENCE & PARTNER",
  colDateGuests: "TRAVEL DATE & GUESTS",
  colTotalPrice: "TOTAL PRICE",
  colStatus: "STATUS",
  colActions: "ACTIONS",

  // Table States & Helpers
  loadingQueue: "Loading reservations queue...",
  noBookingsFound: "No bookings found",
  adjustFilterPrompt: "Try adjusting your search query or status filter",
  clickToCopy: "Click to copy code",
  guestSingle: "Guest",
  guestPlural: "Guests",
  fullDay: "Full day",
  paid: "Paid",
  pendingPayment: "Pending",
  statusPending: "Pending",
  statusConfirmed: "Confirmed",
  statusCompleted: "Completed",
  statusCancelled: "Cancelled",

  // Actions & Tooltips
  viewDetails: "View Booking Details",
  visitPublicPage: "Visit Public Page",
  confirmBooking: "Confirm Booking",
  completeBooking: "Complete Booking",
  cancelBooking: "Cancel / Decline",
  deleteBooking: "Delete Booking",

  // Confirmations & Notifications
  deleteTitle: "Delete Booking Record",
  deleteMessage: "Are you sure you want to delete reservation \"{ref}\" permanently?\n\nThis action cannot be undone.",
  deleteConfirmBtn: "Delete Record",
  statusUpdatedSuccess: "Booking status successfully changed to {status}.",
  statusUpdatedTitle: "Status Updated",
  deletedSuccess: "Reservation \"{ref}\" has been removed.",
  deletedTitle: "Booking Deleted",

  // Fallbacks
  defaultPartner: "Hospitality Partner",
  defaultService: "Travel Experience",
  defaultGuest: "Guest",
  noEmailProvided: "No email provided",

  // Cancel Modal
  cancelModalTitle: "Cancel / Decline Reservation",
  referenceLabel: "Reference:",
  reasonForCancellation: "Reason for Cancellation",
  cancelPlaceholder: "Provide a clear reason for cancellation to notify the customer...",
  cancelReasonRequired: "Please provide a reason for cancelling this booking.",
  defaultCancelReason: "Service provider unavailable or schedule conflict.",
  confirmCancellation: "Confirm Cancellation",

  // Details Modal
  detailsTitle: "Reservation Details",
  clickToCopyRef: "Click to copy booking reference",
  recordedOn: "Recorded on {date}",
  serviceTravelExperience: "Service / Travel Experience",
  partnerLabel: "Partner:",
  travelDate: "Travel Date",
  partySize: "Party Size",
  totalPrice: "Total Price",
  payment: "Payment",
  primaryTravelerContact: "Primary Traveler Contact",
  travelerName: "Traveler Name",
  emailAddress: "Email Address",
  contactPhone: "Contact Phone",
  cancellationDeclineReason: "Cancellation / Decline Reason:",
  specialRequestsNotes: "Special Requests & Notes:",
  visitPage: "Visit Page",
  markCompleted: "Mark Completed",
  statusUpdateFailed: "Failed to update booking status.",
  statusUpdateFailedTitle: "Update Failed",
  deleteFailed: "Failed to delete booking.",
  deleteFailedTitle: "Delete Failed",
};

export default Bookings;
