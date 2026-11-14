#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating tourism-admin .env from .env.example..."
    cp .env.example .env
fi

# Ensure node_modules exists
if [ ! -d "node_modules" ] || [ ! -d "node_modules/vite" ]; then
    echo "Installing admin frontend dependencies..."
    npm install
fi

exec "$@"
