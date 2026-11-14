#!/bin/sh
set -e

echo "=== AngkorVerses Backend Initialization ==="

# 1. Wait for MySQL database connection
echo "Checking database connection on ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
MAX_TRIES=30
COUNT=0
until php -r "
try {
    \$host = getenv('DB_HOST') ?: 'mysql';
    \$port = getenv('DB_PORT') ?: '3306';
    \$db   = getenv('DB_DATABASE') ?: 'tourism_db';
    \$user = getenv('DB_USERNAME') ?: 'root';
    \$pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';
    \$pdo = new PDO(\"mysql:host={\$host};port={\$port};dbname={\$db}\", \$user, \$pass);
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
"; do
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        echo "Error: Database connection timed out after $MAX_TRIES attempts."
        exit 1
    fi
    echo "Waiting for MySQL database to become ready... (attempt $COUNT/$MAX_TRIES)"
    sleep 2
done

echo "MySQL database connection established successfully!"

# 2. Ensure environment file exists before composer or artisan runs
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 3. Ensure composer dependencies exist and platform check matches container PHP
if [ ! -f "vendor/autoload.php" ]; then
    echo "vendor/autoload.php not found. Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=php+
else
    # Re-dump autoload with current platform to prevent platform_check mismatch
    composer dump-autoload --optimize --ignore-platform-req=php+ >/dev/null 2>&1 || true
fi

# 4. Ensure APP_KEY exists
if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    echo "Generating Laravel application key..."
    php artisan key:generate --force || true
fi

# 5. Fix directory permissions for storage and bootstrap/cache
echo "Setting storage and cache permissions..."
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache \
         storage/app/public

chown -R www-data:www-data storage bootstrap/cache
chmod -R 777 storage bootstrap/cache

# 6. Ensure public/storage relative symlink is active
if [ -L public/storage ] || [ -e public/storage ]; then
    rm -rf public/storage
fi
php artisan storage:link --relative --force || php artisan storage:link --force || true

# 7. Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# 8. Seed database if initial data is not present
echo "Checking if database needs seeding..."
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null || echo "0")
USER_COUNT=$(echo "$USER_COUNT" | tr -dc '0-9')

if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
    echo "Seeding initial accounts, destinations, events, categories, and settings..."
    php artisan db:seed --force
    echo "Seeding completed successfully!"
else
    echo "Database already contains $USER_COUNT users. Skipping initial seeding."
fi

echo "=== Backend Ready! Starting PHP-FPM ==="
exec "$@"
