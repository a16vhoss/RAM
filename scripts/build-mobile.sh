#!/bin/bash

# Mobile Build Script
# Temporarily hides API routes and Middleware to allow Next.js Static Export for Capacitor
# Usage: npm run build:mobile

echo "Preparing for mobile build..."

# failure handling
set -e

# Rename folders/files to hide them from Next.js build
if [ -d "app/api" ]; then
    echo "Hiding app/api..."
    mv app/api ./api_hidden
fi

if [ -f "middleware.js" ]; then
    echo "Hiding middleware.js..."
    mv middleware.js middleware.js.hidden
fi

if [ -d "app/(admin)" ]; then
    echo "Hiding app/(admin)..."
    mv "app/(admin)" ./admin_hidden
fi

# Function to restore on exit
cleanup() {
    echo "Restoring original files..."
    if [ -d "./api_hidden" ]; then
        mv ./api_hidden app/api
    fi
    if [ -f "middleware.js.hidden" ]; then
        mv middleware.js.hidden middleware.js
    fi
    if [ -d "./admin_hidden" ]; then
        echo "Restoring app/(admin)..."
        mv ./admin_hidden "app/(admin)"
    fi
}

# Trap exit to ensure cleanup
trap cleanup EXIT

# Run the build
echo "Running Next.js Build with APP_ENV=mobile..."
export APP_ENV=mobile
npm run build

echo "Mobile build successful!"
