#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating aichatbot .env from .env.example..."
    cp .env.example .env
fi

# Ensure storage directories exist
mkdir -p storage/conversations storage/vector_db

exec "$@"
