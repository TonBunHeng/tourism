const Bookings = {
  // Page Header
  title: "ការកក់",
  subtitle: "ត្រួតពិនិត្យ អនុម័ត បំពេញ និងតាមដានការកក់របស់ភ្ញៀវទេសចរសម្រាប់សណ្ឋាគារ កញ្ចប់ដំណើរកម្សាន្ត និងសេវាកម្មទេសចរណ៍។",

  // Stat Cards
  statTotalReservations: "ការកក់សរុប",
  statTotalSubtext: "បរិមាណក្នុងជួរការកក់",
  statPendingAction: "រង់ចាំការត្រួតពិនិត្យ",
  statPendingSubtext: "ទាមទារការផ្ទៀងផ្ទាត់/បញ្ជាក់",
  statConfirmedBookings: "ការកក់បានបញ្ជាក់",
  statConfirmedSubtext: "រង់ចាំភ្ញៀវទេសចរមកដល់",
  statGrossValue: "តម្លៃប្រតិបត្តិការសរុប",
  statGrossSubtext: "ទំហំទឹកប្រាក់នៃការកក់សកម្ម",

  // Table Toolbar
  allBookings: "ការកក់ទាំងអស់",
  bookingCountSingle: "ការកក់",
  bookingCountPlural: "ការកក់",
  filterAll: "ការកក់ទាំងអស់",
  filterPending: "រង់ចាំពិនិត្យ",
  filterConfirmed: "បានបញ្ជាក់",
  filterCompleted: "បានបញ្ចប់",
  filterCancelled: "បានបោះបង់",

  // Table Columns
  colNumber: "#",
  colReference: "លេខកូដសម្គាល់",
  colGuestInfo: "ព័ត៌មានភ្ញៀវ",
  colExperiencePartner: "សេវាកម្ម & ដៃគូ",
  colDateGuests: "កាលបរិច្ឆេទ & ចំនួនភ្ញៀវ",
  colTotalPrice: "តម្លៃសរុប",
  colStatus: "ស្ថានភាព",
  colActions: "សកម្មភាព",

  // Table States & Helpers
  loadingQueue: "កំពុងផ្ទុកជួរការកក់...",
  noBookingsFound: "រកមិនឃើញការកក់ទេ",
  adjustFilterPrompt: "សូមព្យាយាមស្វែងរកឡើងវិញ ឬប្តូរលក្ខខណ្ឌចម្រាញ់",
  clickToCopy: "ចុចដើម្បីចម្លងកូដ",
  guestSingle: "នាក់",
  guestPlural: "នាក់",
  fullDay: "ពេញមួយថ្ងៃ",
  paid: "បានទូទាត់",
  pendingPayment: "មិនទាន់ទូទាត់",
  statusPending: "រង់ចាំពិនិត្យ",
  statusConfirmed: "បានបញ្ជាក់",
  statusCompleted: "បានបញ្ចប់",
  statusCancelled: "បានបោះបង់",

  // Actions & Tooltips
  viewDetails: "មើលព័ត៌មានលម្អិតការកក់",
  visitPublicPage: "មើលទំព័រសាធារណៈ",
  confirmBooking: "បញ្ជាក់ការកក់",
  completeBooking: "បញ្ចប់ការកក់",
  cancelBooking: "បោះបង់ / បដិសេធ",
  deleteBooking: "លុបការកក់",

  // Confirmations & Notifications
  deleteTitle: "លុបកំណត់ត្រាការកក់",
  deleteMessage: "តើអ្នកពិតជាចង់លុបការកក់លេខកូដ \"{ref}\" ជារៀងរហូតមែនទេ?\n\nសកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  deleteConfirmBtn: "លុបកំណត់ត្រា",
  statusUpdatedSuccess: "ស្ថានភាពការកក់ត្រូវបានផ្លាស់ប្តូរទៅជា {status} ដោយជោគជ័យ។",
  statusUpdatedTitle: "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាព",
  deletedSuccess: "ការកក់លេខកូដ \"{ref}\" ត្រូវបានលុបចេញពីប្រព័ន្ធ។",
  deletedTitle: "បានលុបការកក់",

  // Fallbacks
  defaultPartner: "ដៃគូបដិសណ្ឋារកិច្ច",
  defaultService: "ដំណើរកម្សាន្តទេសចរណ៍",
  defaultGuest: "ភ្ញៀវ",
  noEmailProvided: "មិនមានអ៊ីមែល",

  // Cancel Modal
  cancelModalTitle: "បោះបង់ / បដិសេធការកក់ទុក",
  referenceLabel: "លេខកូដសម្គាល់៖",
  reasonForCancellation: "មូលហេតុនៃការបោះបង់",
  cancelPlaceholder: "ផ្តល់មូលហេតុច្បាស់លាស់នៃការបដិសេធដើម្បីជូនដំណឹងដល់អតិថិជន...",
  cancelReasonRequired: "សូមផ្តល់មូលហេតុសម្រាប់ការបោះបង់ការកក់នេះ។",
  defaultCancelReason: "អ្នកផ្តល់សេវាមិនទំនេរ ឬមានជម្លោះកាលវិភាគ។",
  confirmCancellation: "បញ្ជាក់ការបោះបង់",

  // Details Modal
  detailsTitle: "ព័ត៌មានលម្អិតនៃការកក់",
  clickToCopyRef: "ចុចដើម្បីចម្លងលេខកូដកក់",
  recordedOn: "កត់ត្រានៅថ្ងៃ {date}",
  serviceTravelExperience: "សេវាកម្ម / បទពិសោធន៍ទេសចរណ៍",
  partnerLabel: "ដៃគូ៖",
  travelDate: "កាលបរិច្ឆេទធ្វើដំណើរ",
  partySize: "ចំនួនភ្ញៀវ",
  totalPrice: "តម្លៃសរុប",
  payment: "ការទូទាត់",
  primaryTravelerContact: "ទំនាក់ទំនងភ្ញៀវចម្បង",
  travelerName: "ឈ្មោះភ្ញៀវ",
  emailAddress: "អាសយដ្ឋានអ៊ីមែល",
  contactPhone: "លេខទូរស័ព្ទទំនាក់ទំនង",
  cancellationDeclineReason: "មូលហេតុនៃការបោះបង់ / បដិសេធ៖",
  specialRequestsNotes: "សំណូមពរពិសេស & កំណត់សម្គាល់៖",
  visitPage: "ចូលមើលទំព័រ",
  markCompleted: "សម្គាល់ថាបានបញ្ចប់",
  statusUpdateFailed: "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពការកក់បានទេ។",
  statusUpdateFailedTitle: "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព",
  deleteFailed: "មិនអាចលុបការកក់បានទេ។",
  deleteFailedTitle: "ការលុបបរាជ័យ",
};

export default Bookings;
