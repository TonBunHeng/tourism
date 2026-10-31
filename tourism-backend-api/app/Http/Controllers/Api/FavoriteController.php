<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FavoriteResource;
use App\Models\Category;
use App\Models\Favorite;
use App\Models\Place;
use App\Models\Province;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Favorite::with(['user', 'place.category', 'place.province']);

        // Admins and Super Admins can see all users' saved favorites or filter by user
        if ($user->isAdmin()) {
            if ($request->has('user_id') && $request->query('user_id') !== 'All') {
                $query->where('user_id', $request->query('user_id'));
            }
        } else {
            $query->where('user_id', $user->id);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('place', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%")
                       ->orWhere('address', 'like', "%{$search}%");
                })->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        $favorites = $query->orderBy('id', 'desc')->get();

        return $this->successResponse(FavoriteResource::collection($favorites), 'Favorite places retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'place_id' => 'required|exists:places,id',
            'visited' => 'boolean',
        ]);

        $userId = $request->user()->id;

        $favorite = Favorite::where('user_id', $userId)->where('place_id', $validated['place_id'])->first();

        if ($favorite) {
            return $this->errorResponse('Place is already in your favorites.', 409);
        }

        $favorite = Favorite::create([
            'user_id' => $userId,
            'place_id' => $validated['place_id'],
            'visited' => $validated['visited'] ?? false,
            'saved_date' => now()->toDateString(),
        ]);

        $favorite->load('place.category', 'place.province');

        return $this->successResponse(new FavoriteResource($favorite), 'Place added to favorites.', 201);
    }

    public function destroy(Request $request, string $placeId): JsonResponse
    {
        $userId = $request->user()->id;

        $favorite = Favorite::where('user_id', $userId)
            ->where(function ($q) use ($placeId) {
                $q->where('id', $placeId)->orWhere('place_id', $placeId);
            })->first();

        if (!$favorite) {
            return $this->errorResponse('Favorite record not found.', 404);
        }

        $favorite->delete();

        return $this->successResponse(null, 'Place removed from favorites.');
    }

    public function toggleVisited(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $favorite = Favorite::where('user_id', $userId)->where('id', $id)->first();

        if (!$favorite) {
            return $this->errorResponse('Favorite record not found.', 404);
        }

        $favorite->update(['visited' => !$favorite->visited]);
        $favorite->load('place.category', 'place.province');

        return $this->successResponse(new FavoriteResource($favorite), 'Visited status updated.');
    }

    public function analytics(Request $request): JsonResponse
    {
        $timeframe = $request->query('timeframe', (string) date('Y'));
        $targetYear = is_numeric($timeframe) ? (int) $timeframe : (int) date('Y');
        $selectedCategory = $request->query('category', 'ALL');
        $statusInput = $request->query('visit_status', $request->query('status', 'ALL'));
        $statusUpper = strtoupper((string) $statusInput);

        $query = Favorite::with(['place.category', 'place.province', 'user']);

        if ($timeframe !== 'ALL' && is_numeric($timeframe)) {
            $query->where(function ($q) use ($targetYear) {
                $q->whereYear('saved_date', $targetYear)
                  ->orWhere(function ($sq) use ($targetYear) {
                      $sq->whereNull('saved_date')->whereYear('created_at', $targetYear);
                  });
            });
        }

        if ($selectedCategory !== 'ALL' && !empty($selectedCategory)) {
            $query->whereHas('place.category', function ($q) use ($selectedCategory) {
                if (is_numeric($selectedCategory)) {
                    $q->where('id', $selectedCategory);
                } else {
                    $q->where('name', $selectedCategory);
                }
            });
        }

        if ($statusUpper === 'VISITED') {
            $query->where('visited', true);
        } elseif ($statusUpper === 'PLANNED' || $statusUpper === 'WISHLIST' || $statusUpper === 'TO VISIT' || $statusUpper === 'TO_VISIT') {
            $query->where('visited', false);
        }

        // Fast overview statistics via SQL Aggregation
        $statsRow = (clone $query)->selectRaw('
            COUNT(*) as total_favorites,
            SUM(CASE WHEN visited = 1 THEN 1 ELSE 0 END) as visited_count,
            COUNT(DISTINCT user_id) as unique_users
        ')->first();

        $totalFavorites = (int) ($statsRow->total_favorites ?? 0);
        $visitedCount = (int) ($statsRow->visited_count ?? 0);
        $wishlistCount = $totalFavorites - $visitedCount;
        $conversionRate = $totalFavorites > 0 ? round(($visitedCount / $totalFavorites) * 100, 1) : 0.0;
        $uniqueUsers = (int) ($statsRow->unique_users ?? 0);

        // Calculate average rating of favorited places in 1 fast join query
        $avgRatingRow = (clone $query)
            ->join('places', 'favorites.place_id', '=', 'places.id')
            ->selectRaw('COALESCE(AVG(places.rating), 0) as avg_rating')
            ->first();
        $avgRating = round((float) ($avgRatingRow->avg_rating ?? 0), 2);

        // Categories breakdown via 1 GROUP BY query
        $colors = ['bg-[#003E83]', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500', 'bg-indigo-500'];
        $fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#6366f1'];
        $categories = Category::all();

        $catScopeQuery = Favorite::query();
        if ($timeframe !== 'ALL' && is_numeric($timeframe)) {
            $catScopeQuery->where(function ($q) use ($targetYear) {
                $q->whereYear('favorites.saved_date', $targetYear)
                  ->orWhere(function ($sq) use ($targetYear) {
                      $sq->whereNull('favorites.saved_date')->whereYear('favorites.created_at', $targetYear);
                  });
            });
        }
        if ($statusUpper === 'VISITED') {
            $catScopeQuery->where('favorites.visited', true);
        } elseif ($statusUpper === 'PLANNED' || $statusUpper === 'WISHLIST' || $statusUpper === 'TO VISIT' || $statusUpper === 'TO_VISIT') {
            $catScopeQuery->where('favorites.visited', false);
        }

        $catCounts = (clone $catScopeQuery)
            ->join('places', 'favorites.place_id', '=', 'places.id')
            ->selectRaw('places.category_id, COUNT(*) as count')
            ->groupBy('places.category_id')
            ->pluck('count', 'places.category_id');

        $catScopeTotal = $catCounts->sum();

        $categoryData = [];
        foreach ($categories as $i => $cat) {
            $catFavCount = (int) ($catCounts->get($cat->id, 0));
            if ($catFavCount > 0 || $catScopeTotal === 0) {
                $categoryData[] = [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'count' => $catFavCount,
                    'percentage' => $catScopeTotal > 0 ? round(($catFavCount / $catScopeTotal) * 100) : 0,
                    'color' => $colors[$i % count($colors)],
                    'fillColor' => $fillColors[$i % count($fillColors)],
                ];
            }
        }
        usort($categoryData, fn($a, $b) => $b['count'] <=> $a['count']);

        // Status breakdown
        $statusBreakdown = [
            [
                'label' => 'Marked as Visited',
                'count' => $visitedCount,
                'percentage' => $totalFavorites > 0 ? round(($visitedCount / $totalFavorites) * 100) : 0,
                'color' => 'bg-emerald-500',
                'subtext' => 'Places traveler has explored'
            ],
            [
                'label' => 'Pending Wishlist',
                'count' => $wishlistCount,
                'percentage' => $totalFavorites > 0 ? round(($wishlistCount / $totalFavorites) * 100) : 0,
                'color' => 'bg-rose-500',
                'subtext' => 'Saved for future Cambodian trips'
            ]
        ];

        // Top Favorited Places (1 fast GROUP BY query and eager-load places in bulk)
        $topPlaceCounts = (clone $query)
            ->selectRaw('place_id, COUNT(*) as count, SUM(CASE WHEN visited = 1 THEN 1 ELSE 0 END) as visited_count')
            ->groupBy('place_id')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $placeIds = $topPlaceCounts->pluck('place_id');
        $places = Place::with(['category', 'province'])->whereIn('id', $placeIds)->get()->keyBy('id');

        $topFavorites = [];
        $rank = 1;
        foreach ($topPlaceCounts as $item) {
            $place = $places->get($item->place_id);
            if ($place) {
                $topFavorites[] = [
                    'rank' => $rank++,
                    'id' => $place->id,
                    'name' => $place->name,
                    'image_url' => $place->image_url,
                    'image' => $place->image_url,
                    'category' => $place->category ? $place->category->name : 'Destination',
                    'province' => $place->province ? $place->province->name : 'Cambodia',
                    'rating' => (float) $place->rating,
                    'saves_count' => (int) $item->count,
                    'visited_count' => (int) $item->visited_count,
                    'percentage' => $totalFavorites > 0 ? round(((int) $item->count / $totalFavorites) * 100) : 100,
                ];
            }
        }

        // Monthly trends (1 fast query with GROUP BY month instead of 24 queries)
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthlyData = [];
        $runningCumulative = 0;

        $monthBaseQuery = Favorite::query();
        if ($selectedCategory !== 'ALL' && !empty($selectedCategory)) {
            $monthBaseQuery->whereHas('place.category', function ($q) use ($selectedCategory) {
                if (is_numeric($selectedCategory)) {
                    $q->where('id', $selectedCategory);
                } else {
                    $q->where('name', $selectedCategory);
                }
            });
        }
        if ($statusUpper === 'VISITED') {
            $monthBaseQuery->where('visited', true);
        } elseif ($statusUpper === 'PLANNED' || $statusUpper === 'WISHLIST' || $statusUpper === 'TO VISIT' || $statusUpper === 'TO_VISIT') {
            $monthBaseQuery->where('visited', false);
        }
        if ($timeframe !== 'ALL' && is_numeric($timeframe)) {
            $monthBaseQuery->where(function ($q) use ($targetYear) {
                $q->whereYear('saved_date', $targetYear)
                  ->orWhere(function ($sq) use ($targetYear) {
                      $sq->whereNull('saved_date')->whereYear('created_at', $targetYear);
                  });
            });
        }

        $monthlyRows = (clone $monthBaseQuery)
            ->selectRaw('MONTH(COALESCE(saved_date, created_at)) as m_num, COUNT(*) as count, SUM(CASE WHEN visited = 1 THEN 1 ELSE 0 END) as visited_count')
            ->groupBy(DB::raw('MONTH(COALESCE(saved_date, created_at))'))
            ->get()
            ->keyBy('m_num');

        foreach ($months as $idx => $mName) {
            $mNum = $idx + 1;
            $row = $monthlyRows->get($mNum);
            $realCount = $row ? (int) $row->count : 0;
            $realVisited = $row ? (int) $row->visited_count : 0;
            $runningCumulative += $realCount;

            $monthlyData[] = [
                'month' => $mName,
                'newSaves' => $realCount,
                'count' => $realCount,
                'saves' => $realCount,
                'totalFavorites' => $realCount,
                'visitedCount' => $realVisited,
                'cumulative' => $runningCumulative,
                'total' => $runningCumulative,
            ];
        }

        $recentFavorites = (clone $query)->with(['place.category', 'place.province', 'user'])->orderBy('id', 'desc')->take(20)->get();

        return $this->successResponse([
            'overview' => [
                'total_favorites' => $totalFavorites,
                'total' => $totalFavorites,
                'visited_count' => $visitedCount,
                'wishlist_count' => $wishlistCount,
                'planned_count' => $wishlistCount,
                'conversion_rate' => $conversionRate,
                'visited_pct' => $conversionRate,
                'unique_travelers' => max($uniqueUsers, $totalFavorites > 0 ? 1 : 0),
                'avg_rating' => $avgRating,
            ],
            'monthly_trends' => $monthlyData,
            'category_distribution' => $categoryData,
            'status_breakdown' => $statusBreakdown,
            'top_favorites' => $topFavorites,
            'categories' => Category::pluck('name')->toArray(),
            'favorites' => FavoriteResource::collection($recentFavorites),
            'recent_favorites' => FavoriteResource::collection($recentFavorites),
        ], 'Favorite places analytics retrieved successfully.');
    }
}
