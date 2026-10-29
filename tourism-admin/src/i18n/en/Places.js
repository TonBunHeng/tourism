const Places = {
  // Header
  managementTitle: "Places",
  managementSubtitle: "Manage and organize all heritage sites and attractions",
  addPlaceBtn: "Add New Place",

  // Stats
  statTotalPlaces: "Total Places",
  statTotalSubtext: "Registered heritage & attractions",
  statActiveSites: "Active Sites",
  statActiveSubtext: "{percent}% published destinations",
  statAverageRating: "Average Rating",
  statRatingSubtext: "Overall destination score",
  statTotalReviews: "Total Reviews",
  statReviewsSubtext: "Traveler feedback entries",

  // Toolbar & Filters
  allPlaces: "All Places",
  placeCountSingle: "place",
  placeCountPlural: "places",
  allCategories: "All Categories",

  // Table Headers
  thIndex: "#",
  thPlaceCategory: "Place & Category",
  thAddress: "Address",
  thRating: "Rating",
  thStatus: "Status",
  thActions: "Actions",

  // Table Content & Cards
  noPlacesFound: "No places found",
  refineSearchFilter: "Try adjusting your search or filter criteria",
  loadingPlaces: "Loading places from database...",
  statusActive: "Active",
  statusInactive: "Inactive",
  statusClosed: "Closed",
  statusRenovation: "Under Renovation",

  // Tooltips & Actions
  tooltipViewDetails: "View Details",
  tooltipEdit: "Edit",
  tooltipDelete: "Delete",
  viewPhoto: "Photo",
  viewMap: "Map",
  mapsBadge: "Maps",

  // Add / Edit Modal
  modalAddTitle: "Add New Place",
  modalEditTitle: "Edit Place Details",
  modalAddSubtitle: "Fill in attraction details and assign location coordinates below.",
  modalEditSubtitle: "Update destination details, pricing and location.",
  placeNameLabel: "Place Name",
  placeNamePlaceholder: "e.g. Angkor Wat, Royal Palace, Bokor Mountain",
  placeNameRequired: "Place name is required",
  photoLabel: "Place Picture / Photo (Max 5MB: JPG, PNG, WEBP)",
  changePhotoBtn: "Change Photo",
  removePhotoBtn: "Remove",
  uploadingPicture: "Uploading picture...",
  clickSelectPicture: "Click to select picture",
  photoFormatHint: "JPG, PNG, WEBP up to 5MB",
  photoUrlPlaceholder: "Or paste image URL (https://...)",
  categoryLabel: "Category",
  statusLabel: "Status",
  addressLabel: "Address",
  addressPlaceholder: "Enter full address or select location preset below",
  addressRequired: "Address is required",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Enter attraction history, highlights, and tourist details...",
  bestTimeLabel: "Best Time to Visit",
  bestTimePlaceholder: "e.g. Sunrise (5:30 AM - 7:00 AM)",
  durationLabel: "Suggested Duration",
  durationPlaceholder: "e.g. 2 - 3 Hours",
  priceLabel: "Ticket Price / Entry Fee",
  pricePlaceholder: "e.g. Free, $37 USD, $5 USD",
  ratingLabel: "Initial Rating Score",

  // Map Picker in Modal
  selectLocationMap: "Select Location on Map",
  interactivePick: "Interactive Pick",
  googleView: "Google View",
  quickPresets: "Quick Presets:",
  clickMapPinHint: "Click anywhere on map to pick location pin",
  pinSelected: "Pin Selected ({lat}, {lng})",
  moveMapHint: "Move map and click any point to set address",
  openGoogleMaps: "Open in Google Maps",
  googleMapsLocation: "Google Maps Location",
  cancelBtn: "Cancel",
  addBtn: "Add Place",
  updateBtn: "Update Place",

  // Details Modal
  detailsTitle: "Place Details",
  idLabel: "ID: #{id}",
  totalReviewsLabel: "total reviews",
  editPlaceBtn: "Edit Place",

  // Presets
  presetAngkorWat: "Angkor Wat",
  presetPhnomPenhPalace: "Phnom Penh Palace",
  presetSiemReapCity: "Siem Reap City",
  presetBattambang: "Battambang",
  presetKampotRiverfront: "Kampot Riverfront",
  presetKohRong: "Koh Rong",

  // Alerts & Notifications
  deleteTitle: "Delete Destination",
  deletePermanentConfirm: "Are you sure you want to permanently delete \"{name}\"?\n\nThis action cannot be undone.",
  deletePermanentBtn: "Delete Permanently",
  deleteSuccess: "Destination \"{name}\" has been permanently deleted.",
  deleteSuccessTitle: "Destination Deleted",
  deleteFailed: "Failed to delete destination.",
  deleteFailedTitle: "Delete Failed",

  deletionRequestTitle: "Submit Deletion Request",
  deletionRequestMessage: "Are you sure you want to submit a deletion request for \"{name}\"?\n\nThis will be submitted to the Super Administrator for review and approval.",
  submitDeletionBtn: "Submit Deletion",
  deletionRequestReason: "Request to delete destination: {name}",
  deletionRequestSuccess: "Deletion request for \"{name}\" has been submitted to Super Admin for approval.",
  requestSubmittedTitle: "Request Submitted",
  submissionFailed: "Failed to submit deletion request.",
  submissionFailedTitle: "Submission Failed",

  placeCreatedSuccess: "Place \"{name}\" has been created successfully.",
  placeCreatedTitle: "Place Created",
  placeUpdatedSuccess: "Place \"{name}\" has been updated successfully.",
  placeUpdatedTitle: "Place Updated",
  saveFailed: "Failed to save place.",
  saveFailedTitle: "Save Failed",
};

export default Places;
