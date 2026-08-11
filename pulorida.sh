#!/bin/bash

# ============================================================
#   🚀 PULORIDA FINANCIAL CENTER - SERVER & VPS LAUNCHER
#   Support: Linux VPS (Ubuntu/Debian/CentOS), Termux, macOS/Linux
# ============================================================

clear
echo -e "\033[1;32m============================================================\033[0m"
echo -e "\033[1;36m  🚀 PULORIDA FINANCIAL CENTER (WEB DASHBOARD + BOT TELEGRAM)\033[0m"
echo -e "\033[1;32m============================================================\033[0m"
echo ""

# 1. Cek & Install Node.js jika belum terpasang
if ! command -v node &> /dev/null; then
    echo -e "\033[1;33m[!] Node.js belum terinstall. Menginstall Node.js...\033[0m"
    if command -v pkg &> /dev/null; then
        # Environment Termux
        pkg update -y && pkg install nodejs git -y
    elif command -v apt &> /dev/null; then
        # Environment Ubuntu / Debian
        sudo apt update -y && sudo apt install nodejs npm git -y
    elif command -v yum &> /dev/null; then
        # Environment CentOS / RHEL
        sudo yum install -y nodejs npm git
    fi
fi

# 2. Cek & Install Dependensi npm
if [ ! -d "node_modules" ]; then
    echo -e "\033[1;33m[!] Menginstall dependensi npm (Pertama kali running)...\033[0m"
    npm install
fi

# 3. Jalankan Bot Telegram di background
echo -e "\033[1;34m[1/2] Memulai Bot Telegram di background...\033[0m"
node bot_telegram.cjs > /dev/null 2>&1 &
BOT_PID=$!

echo -e "\033[1;34m[2/2] Memulai Server Web Dashboard (Port 3004)...\033[0m"
echo ""
echo -e "\033[1;32m  - Web Dashboard : http://localhost:3004/\033[0m"
echo -e "\033[1;32m  - Public / VPS   : http://0.0.0.0:3004/ (Gunakan IP Server Anda)\033[0m"
echo -e "\033[1;32m  - Telegram Bot  : ONLINE (Token Active)\033[0m"
echo -e "\033[1;32m============================================================\033[0m"
echo ""

# Tangkap perintah pembatalan (Ctrl+C) untuk mematikan bot telegram di background
trap "kill $BOT_PID 2>/dev/null; exit" SIGINT SIGTERM

npm run dev -- --host 0.0.0.0
