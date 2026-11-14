<?php

namespace App\Http\Controllers\Api\Travel;

use App\Http\Controllers\Controller;
use App\Http\Resources\Travel\TravelUserResource;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Symfony\Component\HttpFoundation\Response;

class TravelOAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @param Request $request
     * @return Response
     */
    public function redirectToGoogle(Request $request): Response
    {
        try {
            $clientId = config('services.google.client_id');
            $clientSecret = config('services.google.client_secret');

            // Capture the originating frontend URL (e.g. http://localhost:5175)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5175');
            $referer = $request->header('Referer');
            if ($referer && !str_contains($referer, 'google.com') && !str_contains($referer, 'accounts.google')) {
                $cleanReferer = preg_replace('#/(login|register).*$#', '', $referer);
                if (filter_var($cleanReferer, FILTER_VALIDATE_URL)) {
                    $frontendUrl = rtrim($cleanReferer, '/');
                }
            }

            if ($request->filled('frontend_url') && filter_var($request->query('frontend_url'), FILTER_VALIDATE_URL)) {
                $frontendUrl = rtrim($request->query('frontend_url'), '/');
            }

            if (empty($clientId) || $clientId === 'your_google_client_id_here') {
                return redirect($frontendUrl . '/login?error=' . urlencode('Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID in backend .env.'));
            }

            if (empty($clientSecret) || $clientSecret === 'your_google_client_secret_here') {
                return redirect($frontendUrl . '/login?error=' . urlencode('Google OAuth requires GOOGLE_CLIENT_SECRET. Please add your Client Secret in tourism-backend-api/.env.'));
            }

            /** @var AbstractProvider $driver */
            $driver = Socialite::driver('google');

            // Encode originating frontend URL into state so callback knows where to redirect
            $statePayload = base64_encode(json_encode(['frontend_url' => $frontendUrl]));

            return $driver->stateless()->with(['state' => $statePayload])->redirect();
        } catch (\Throwable $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5175');
            return redirect($frontendUrl . '/login?error=' . urlencode('Google connection error: ' . $e->getMessage()));
        }
    }

    /**
     * Obtain the user information from Google callback.
     *
     * @param Request $request
     * @return Response
     */
    public function handleGoogleCallback(Request $request): Response
    {
        // Default frontend URL
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5175');

        // Extract originating frontend URL from state parameter if present
        $state = $request->query('state');
        if ($state) {
            try {
                $decoded = json_decode(base64_decode($state), true);
                if (!empty($decoded['frontend_url']) && filter_var($decoded['frontend_url'], FILTER_VALIDATE_URL)) {
                    $candidateUrl = rtrim($decoded['frontend_url'], '/');
                    if (!str_contains($candidateUrl, 'google.com') && !str_contains($candidateUrl, 'accounts.google')) {
                        $frontendUrl = $candidateUrl;
                    }
                }
            } catch (\Throwable $e) {
                // fallback to FRONTEND_URL
            }
        }

        // Safety guarantee: Ensure frontendUrl never points to google.com
        if (str_contains($frontendUrl, 'google.com') || str_contains($frontendUrl, 'accounts.google')) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5175');
        }

        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();
        } catch (\Throwable $e) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Google authentication failed: ' . $e->getMessage()));
        }

        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();
        $name = $googleUser->getName();
        $avatar = $googleUser->getAvatar();

        $user = User::where('provider', 'google')->where('provider_id', $googleId)->first();

        if (!$user && $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update([
                    'provider' => 'google',
                    'provider_id' => $googleId,
                    'provider_email' => $email,
                    'avatar' => $user->avatar ?: $avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                    'last_active_at' => now(),
                ]);
            }
        }

        if (!$user) {
            $user = User::create([
                'name' => $name ?: 'Google Traveler',
                'email' => $email ?: ($googleId . '@google.oauth'),
                'avatar' => $avatar,
                'role' => User::ROLE_USER,
                'status' => 'Active',
                'verified' => true,
                'provider' => 'google',
                'provider_id' => $googleId,
                'provider_email' => $email,
                'email_verified_at' => now(),
                'last_active_at' => now(),
            ]);

            Notification::createNotification([
                'type' => 'user',
                'category' => 'Users',
                'title' => "New User Joined via Google: {$user->name}",
                'description' => "{$user->name} ({$user->email}) authenticated with Google.",
                'link' => '/users',
                'read' => false,
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'provider' => 'google',
                ]
            ]);
        } else {
            if ($user->status !== 'Active') {
                return redirect($frontendUrl . '/login?error=' . urlencode('Account is ' . strtolower($user->status)));
            }

            // Enforce administrative role protection
            $normalizedRole = User::normalizeRole($user->role);
            if (in_array($normalizedRole, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_GUIDE_EDITOR], true)) {
                return redirect($frontendUrl . '/login?error=' . urlencode('Access restricted. Administrative accounts (Super Admin, Admin, Tourism Content Editor) must sign in via the Admin Portal.'));
            }

            $user->update([
                'last_active_at' => now(),
                'avatar' => $avatar ?: $user->avatar,
            ]);
        }

        $token = $user->createToken('travel_google_auth_token')->plainTextToken;

        return redirect($frontendUrl . '/auth/callback?token=' . urlencode($token) . '&user=' . urlencode(json_encode(new TravelUserResource($user))));
    }
}
