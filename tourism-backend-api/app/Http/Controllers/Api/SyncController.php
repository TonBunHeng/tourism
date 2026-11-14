<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    /**
     * Ultra-lightweight real-time pulse endpoint.
     * Returns timestamps and counters of the latest activities so clients can sync in real time.
     */
    public function pulse(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user() ?? $request->user();
        $unreadCount = 0;

        if ($user) {
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('read', false)
                ->count();
        }

        // Fast indexed latest records (executed in < 2ms)
        $latestBooking = Booking::select('id', 'updated_at')->latest('updated_at')->first();
        $latestReview = Review::select('id', 'updated_at')->latest('updated_at')->first();
        $latestBusiness = Business::select('id', 'updated_at')->latest('updated_at')->first();

        // If user is a business owner, also fetch their own business latest booking
        $ownerLatestBookingTime = null;
        if ($user && $user->role === 'business_owner') {
            $ownerBizIds = Business::where('owner_id', $user->id)->pluck('id');
            $ownerBooking = Booking::select('id', 'updated_at')
                ->whereIn('business_id', $ownerBizIds)
                ->latest('updated_at')
                ->first();
            $ownerLatestBookingTime = $ownerBooking?->updated_at?->timestamp;
        }

        // If user is a tourist, also fetch their own bookings timestamp
        $userLatestBookingTime = null;
        if ($user) {
            $userBooking = Booking::select('id', 'updated_at')
                ->where('user_id', $user->id)
                ->latest('updated_at')
                ->first();
            $userLatestBookingTime = $userBooking?->updated_at?->timestamp;
        }

        return response()->json([
            'success' => true,
            'timestamp' => now()->timestamp,
            'unread_notifications' => $unreadCount,
            'latest_booking_id' => $latestBooking?->id,
            'latest_booking_time' => $latestBooking?->updated_at?->timestamp,
            'owner_latest_booking_time' => $ownerLatestBookingTime,
            'user_latest_booking_time' => $userLatestBookingTime,
            'latest_review_id' => $latestReview?->id,
            'latest_review_time' => $latestReview?->updated_at?->timestamp,
            'latest_business_id' => $latestBusiness?->id,
            'latest_business_time' => $latestBusiness?->updated_at?->timestamp,
        ]);
    }
}
