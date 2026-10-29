const Tours = {
  // Page Header
  catalogTitle: "Tour Packages",
  pageTitle: "Tour Packages",
  catalogSubtitle: "Curate and manage all-inclusive travel itineraries, pricing, duration, and availability across Cambodia.",
  addPackageBtn: "Add Tour Package",

  // Stat Cards
  statTotalPackages: "Total Tour Packages",
  statTotalSubtext: "Itineraries across Cambodia",
  statActivePublished: "Active & Published",
  statActiveSubtext: "Ready for live booking",
  statAverageRating: "Average Rating",
  statRatingSubtext: "Traveler satisfaction score",
  statAvgRatePerson: "Avg Rate / Person",
  statRateSubtext: "Market index per traveler",

  // Table Toolbar
  allTourPackages: "All Tour Packages",
  packageCountSingle: "package",
  packageCountPlural: "packages",
  filterAllDestinations: "All Destinations",
  filterAllStatuses: "All Statuses",
  statusPublished: "Published",
  statusDraft: "Draft",
  statusActivePublished: "Active & Published",
  statusDraftUnlisted: "Draft (Unlisted)",

  // Table Columns
  colNumber: "#",
  colPackageCategory: "Tour Package & Category",
  colDestinationDuration: "Destination & Duration",
  colCapacity: "Capacity",
  colPrice: "Price",
  colRating: "Rating",
  colStatus: "Status",
  colActions: "Actions",

  // Table States & Helpers
  loadingPackages: "Loading tour packages...",
  noPackagesFound: "No tour packages found",
  adjustFilterPrompt: "Try adjusting your destination or status filter",
  perPerson: "per person",
  reviewsCount: "{count} reviews",
  upToPax: "Up to {count}",
  paxUnit: "pax",

  // Actions & Tooltips
  viewDetails: "View Details",
  editPackage: "Edit Package",
  moveToDraft: "Move to Draft",
  publishTour: "Publish Tour",
  deletePackage: "Delete Package",

  // Notifications & Confirmations
  deleteTitle: "Delete Tour Package",
  deleteMessage: "Are you sure you want to permanently delete \"{title}\" from the catalog?\n\nThis will remove all associated itinerary links and reservations.",
  deleteConfirmBtn: "Delete Package",
  packageCreatedSuccess: "New tour package \"{title}\" created successfully.",
  packageCreatedTitle: "Package Created",
  packageUpdatedSuccess: "Tour package \"{title}\" updated successfully.",
  packageUpdatedTitle: "Changes Saved",
  packageDeletedSuccess: "Tour package \"{title}\" has been deleted.",
  packageDeletedTitle: "Package Removed",
  statusUpdatedSuccess: "Tour \"{title}\" is now {status}.",
  statusUpdatedTitle: "Status Updated",
  errorSaving: "Failed to save tour package.",
  errorSavingTitle: "Save Failed",

  // Modal Add / Edit
  createModalTitle: "Create New Tour Package",
  editModalTitle: "Edit Tour Package",
  modalSubtitle: "Set package itinerary, pricing, duration, and group capacity",
  
  // Modal Form Fields
  packageTitle: "Package Title",
  titlePlaceholder: "e.g. Angkor Sunrise & Floating Village Day Tour",
  titleRequired: "Tour title is required",
  primaryDestination: "Primary Destination",
  tourCategory: "Tour Category",
  duration: "Duration (e.g. 1 Day, 3 Days)",
  durationPlaceholder: "1 Full Day or 3 Days / 2 Nights",
  pricePerPerson: "Price / Person (USD)",
  pricePlaceholder: "60",
  priceRequired: "Valid price per person is required",
  maxTravelers: "Max Travelers (Group Size)",
  maxTravelersPlaceholder: "12",
  publishStatus: "Publish Status",
  coverImageUrl: "Cover Image URL",
  imagePlaceholder: "https://images.unsplash.com/photo-...",
  descriptionHighlights: "Description & Itinerary Highlights",
  descPlaceholder: "Detailed itinerary breakdown, inclusions (water, transport, guide), and departure highlights...",
  createPackageBtn: "Create Package",
  saveChangesBtn: "Save Changes",

  // Details Modal
  pricePersonLabel: "Price / Person",
  durationLabel: "Duration",
  destinationLabel: "Destination",
  maxTravelersLabel: "Max Travelers",
  verifiedReviews: "verified reviews",
  satisfactionLabel: "High Traveler Satisfaction",
  itineraryOverview: "Itinerary Overview & Highlights",
  defaultDescription: "All-inclusive curated itinerary exploring majestic temples, local artisan workshops, and authentic dining across Cambodia with accredited licensed guides.",
  defaultCategory: "Cultural & Heritage",
  defaultDuration: "1 Full Day",
  defaultDestination: "Siem Reap",

  // Categories
  catCultural: "Cultural & Heritage",
  catEco: "Eco Tourism & Nature",
  catAdventure: "Adventure & Trekking",
  catCulinary: "Culinary & Food Tour",
  catBeach: "Beach & Island Excursion",
  catHistorical: "Historical & War History",
  catReligious: "Religious & Spiritual",
  statusUpdateFailed: "Failed to update tour status.",
  deleteFailed: "Failed to delete tour package.",
};

export default Tours;
