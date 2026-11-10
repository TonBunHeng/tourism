<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

class GenerateSwaggerDocument
{
    public function handle(Request $request, Closure $next): Response
    {
        $paths = [];
        $httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        foreach (app('router')->getRoutes() as $route) {
            if (! $route instanceof Route || ($route->uri() !== 'api' && ! str_starts_with($route->uri(), 'api/'))) {
                continue;
            }

            $path = $route->uri() === 'api' ? '/' : '/'.preg_replace('#^api/#', '', $route->uri());
            if (in_array($path, ['/documentation', '/oauth2-callback'], true)) {
                continue;
            }

            foreach (array_intersect($route->methods(), $httpMethods) as $method) {
                $operation = [
                    'tags' => [$this->tagFor($path)],
                    'summary' => $this->summaryFor($route, $method),
                    'operationId' => strtolower($method).'_'.trim(str_replace(['/', '{', '}', '-'], ['_', '', '', '_'], $path), '_'),
                    'parameters' => $this->parametersFor($route),
                    'responses' => [
                        '200' => ['description' => 'Successful response'],
                        'default' => ['description' => 'Error response'],
                    ],
                ];

                if ($this->requiresAuthentication($route)) {
                    $operation['security'] = [['sanctum' => []]];
                }

                $paths[$path][strtolower($method)] = $operation;
            }
        }

        ksort($paths);
        $document = [
            'openapi' => '3.0.3',
            'info' => [
                'title' => config('app.name', 'AngkorVerses').' API',
                'version' => '1.0.0',
                'description' => 'Automatically generated from the registered Laravel API routes.',
            ],
            'servers' => [['url' => $request->getSchemeAndHttpHost().'/api']],
            'paths' => (object) $paths,
            'components' => [
                'securitySchemes' => [
                    'sanctum' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'Personal Access Token',
                    ],
                ],
            ],
        ];

        $directory = config('l5-swagger.defaults.paths.docs', storage_path('api-docs'));
        File::ensureDirectoryExists($directory);
        File::put($directory.'/'.config('l5-swagger.documentations.default.paths.docs_json', 'api-docs.json'), json_encode($document, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return $next($request);
    }

    private function parametersFor(Route $route): array
    {
        $parameters = [];
        preg_match_all('/\{([^}]+)\}/', $route->uri(), $matches);

        foreach ($matches[1] as $name) {
            $parameters[] = [
                'name' => rtrim($name, '?'),
                'in' => 'path',
                'required' => ! str_ends_with($name, '?'),
                'schema' => ['type' => 'string'],
            ];
        }

        return $parameters;
    }

    private function requiresAuthentication(Route $route): bool
    {
        return collect($route->gatherMiddleware())->contains(fn (string $middleware) =>
            str_starts_with($middleware, 'auth:') || str_starts_with($middleware, 'role:')
        );
    }

    private function tagFor(string $path): string
    {
        $segments = explode('/', trim($path, '/'));
        if (count($segments) > 1 && in_array($segments[0], ['travel', 'admin', 'business'], true)) {
            return ucfirst($segments[0]).' / '.ucfirst($segments[1]);
        }

        return ucfirst($segments[0] ?: 'General');
    }

    private function summaryFor(Route $route, string $method): string
    {
        $action = $route->getActionName();
        $handler = str_contains($action, '@') ? class_basename(strstr($action, '@', true)).' '.substr(strstr($action, '@'), 1) : $action;

        return $method.' '.$route->uri().' ('.$handler.')';
    }
}
