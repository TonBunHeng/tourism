<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.role' => \App\Http\Middleware\EnsureAdminRole::class,
            'role' => \App\Http\Middleware\EnsureRole::class,
            'check.blocked.ip' => \App\Http\Middleware\CheckBlockedIp::class,
            'update.user.activity' => \App\Http\Middleware\UpdateUserActivity::class,
            'account.active' => \App\Http\Middleware\EnsureAccountActive::class,
        ]);
        $middleware->api(prepend: [
            \App\Http\Middleware\CheckBlockedIp::class,
            \App\Http\Middleware\UpdateUserActivity::class,
            \App\Http\Middleware\EnsureAccountActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, Request $request) {
            if ($request->is('*auth/google*') || $request->is('*oauth*')) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:5175');
                $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
                return redirect($frontendUrl . '/login?error=' . urlencode("Too many connection attempts. Please wait {$retryAfter} seconds before trying again."));
            }
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => true,
        );
    })->create();
