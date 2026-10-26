import { useState, useEffect } from "react";
import SimplePagination from "../../components/common/SimplePagination";
import RatingsHeader from "./RatingsHeader";
import RatingsStats from "./RatingsStats";
import RatingsSentiment from "./RatingsSentiment";
import RatingsToolbar from "./RatingsToolbar";
import RatingsTable from "./RatingsTable";
import ReviewDetailsModal from "./ReviewDetailsModal";
import ReviewReplyModal from "./ReviewReplyModal";

import reviewService from "../../services/reviewService";
import placeService from "../../services/placeService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { getPageCache, setPageCache } from "../../utils/pageCache";

export default function Ratings() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();

  const cachedRatings = getPageCache('ratings_data');
  const [reviews, setReviews] = useState(() => cachedRatings?.reviews || []);
  const [places, setPlaces] = useState(() => cachedRatings?.places || ["All"]);
  const [isLoading, setIsLoading] = useState(() => !cachedRatings);
  const [analyticsData, setAnalyticsData] = useState(() => cachedRatings?.analyticsData || null);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedPlace, setSelectedPlace] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedRatings?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedRatings?.totalPages || 1);
  const itemsPerPage = 10;

  const statuses = ["All", "Approved", "Pending", "Rejected"];
  const ratings = ["All", "5", "4", "3", "2", "1"];

  useEffect(() => {
    const fetchPlacesList = async () => {
      try {
        const res = await placeService.getPlaces({ per_page: 100 });
        if (res.success && res.data) {
          const names = ["All", ...res.data.map((p) => p.name)];
          setPlaces(names);
        }
      } catch (e) {
        console.error("Failed to load places filter list from API", e);
      }
    };
    fetchPlacesList();
  }, []);

  useEffect(() => {
    const fetchAnalyticsOverview = async () => {
      try {
        const res = await reviewService.getAnalytics();
        if (res && (res.success || res.data)) {
          const data = res.data || res;
          setAnalyticsData(data);
          const current = getPageCache('ratings_data') || {};
          setPageCache('ratings_data', { ...current, analyticsData: data });
        }
      } catch (e) {
        console.warn("Failed to load analytics overview for ratings", e);
      }
    };
    fetchAnalyticsOverview();
  }, []);

  const loadReviews = async () => {
    if (!cachedRatings && reviews.length === 0) {
      setIsLoading(true);
    }
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== "All") params.status = selectedStatus;
      if (selectedRating !== "All") params.rating = selectedRating;

      const res = await reviewService.getReviews(params);
      if (res.success && res.data) {
        const formatted = res.data.map((r) => ({
          ...r,
          user: r.user || { name: "Anonymous Traveler", email: "user@example.com" },
          place: r.place || { name: "General Attraction" },
          title: r.title || "User Review",
          comment: r.comment || "",
          status: r.status || "Approved",
          replies: r.replies || [],
        }));
        setReviews(formatted);
        const total = res.meta?.total || formatted.length;
        const pages = res.meta?.last_page || Math.ceil(total / itemsPerPage) || 1;
        setTotalRecords(total);
        setTotalPages(pages);

        if (currentPage === 1 && !searchTerm && selectedStatus === "All" && selectedRating === "All") {
          const current = getPageCache('ratings_data') || {};
          setPageCache('ratings_data', { ...current, reviews: formatted, totalRecords: total, totalPages: pages });
        }
      }
    } catch (e) {
      console.error("Failed to load reviews from API", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadReviews();
  }, [currentPage, searchTerm, selectedStatus, selectedRating]);

  // Client side filtering for places & sorting
  const filteredReviews = reviews
    .filter((review) => {
      const matchesPlace =
        selectedPlace === "All" || review.place?.name === selectedPlace;
      return matchesPlace;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return Number(b.rating) - Number(a.rating);
      if (sortBy === "lowest") return Number(a.rating) - Number(b.rating);
      if (sortBy === "most-replies") return (b.replies?.length || 0) - (a.replies?.length || 0);
      return new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0);
    });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reviewService.updateReviewStatus(id, newStatus);
      showSuccess(`Review status updated to "${newStatus}".`, "Status Updated");
      loadReviews();
    } catch (e) {
      showError(e.message || "Failed to update review status", "Update Failed");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: "Delete Review",
      message: "Are you sure you want to delete this tourist review permanently?",
      confirmText: "Delete Review",
      type: "danger"
    });
    if (!confirmed) return;

    try {
      await reviewService.deleteReview(id);
      showSuccess("Review has been deleted successfully.", "Review Deleted");
      loadReviews();
    } catch (e) {
      showError(e.message || "Failed to delete review", "Delete Failed");
    }
  };

  const handleReplySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;
    try {
      await reviewService.replyToReview(selectedReview.id, { comment: replyText });
      setReplyText("");
      setIsReplyModalOpen(false);
      showSuccess("Your reply has been posted successfully.", "Reply Submitted");
      loadReviews();
    } catch (e) {
      showError(e.message || "Failed to reply to review", "Reply Failed");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + filteredReviews.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* Header with Analytics button */}
      <RatingsHeader />

      {/* Top 4 Stat Summary Cards */}
      <RatingsStats reviews={reviews} stats={analyticsData?.overview} />

      {/* Main Reviews Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1 mb-6 sm:mb-8">
        <RatingsToolbar
          selectedStatus={selectedStatus}
          onStatusChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
          selectedPlace={selectedPlace}
          onPlaceChange={(val) => { setSelectedPlace(val); }}
          places={places}
          statuses={statuses}
          totalCount={totalRecords}
        />

        <RatingsTable
          reviews={filteredReviews}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onView={(rev) => { setSelectedReview(rev); setIsDetailsOpen(true); }}
          onReply={(rev) => { setSelectedReview(rev); setIsReplyModalOpen(true); }}
          startIndex={startIndex}
        />

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="reviews"
        />
      </div>

      {/* Sentiment & Star Distribution Cards */}
      <RatingsSentiment
        reviews={reviews}
        ratingDistribution={analyticsData?.rating_distribution}
        stats={analyticsData?.overview}
      />

      {/* Review Details Modal */}
      <ReviewDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        review={selectedReview}
        onStatusChange={handleStatusChange}
        onReply={() => {
          setIsDetailsOpen(false);
          setIsReplyModalOpen(true);
        }}
      />

      {/* Admin Reply Modal */}
      <ReviewReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        review={selectedReview}
        replyText={replyText}
        setReplyText={setReplyText}
        onSubmit={handleReplySubmit}
      />


    </div>
  );
}
