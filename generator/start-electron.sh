#!/bin/bash

echo "🚀 Starting Invoice Generator Desktop App..."
echo "📱 Platform: $(uname -s)"
echo "📦 Node Version: $(node -v)"
echo "⚡ Vite + Electron Development Mode"
echo ""

# Start the development server
npm run electron-dev
