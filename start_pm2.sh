#!/bin/bash

# ============================================================
#   🚀 PULORIDA FINANCIAL CENTER - VPS 24/7 PM2 LAUNCHER
# ============================================================

echo "Installing PM2 globally if not present..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies (Fast Mode)..."
    npm install --no-audit --no-fund --prefer-offline --loglevel=error
fi

echo "Building production bundle..."
npm run build

echo "Managing PM2 processes..."
pm2 delete pulorida-bot pulorida-web 2>/dev/null || true

echo "Starting Telegram Bot with PM2..."
pm2 start bot_telegram.cjs --name "pulorida-bot"

echo "Starting Web Dashboard Server with PM2 on Port 3004..."
pm2 start server.js --name "pulorida-web"

echo "Saving PM2 process list for auto-restart on server reboot..."
pm2 save

echo "============================================================"
echo "  ✅ PULORIDA FINANCIAL CENTER IS RUNNING 24/7 ON VPS!"
echo "  - Web Dashboard : http://0.0.0.0:3004/ (or http://highcards.biz.id)"
echo "  - Check status  : pm2 status"
echo "  - View logs     : pm2 logs"
echo "============================================================"

