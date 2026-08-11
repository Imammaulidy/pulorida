#!/bin/bash

# ============================================================
#   🚀 PULORIDA FINANCIAL CENTER - SUPER FAST LINUX VPS SETUP
# ============================================================

set -e

echo -e "\033[1;32m[1/5] Memeriksa & Menginstall Dependensi Sistem Linux (Fast Mode)...\033[0m"

# Pastikan apt tidak interaktif
export DEBIAN_FRONTEND=noninteractive

# Fix dpkg jika terputus
sudo dpkg --configure -a 2>/dev/null || true

# Install Node.js, npm, nginx, git jika belum ada
if ! command -v node &> /dev/null || ! command -v nginx &> /dev/null; then
    echo "Installing Node.js, NPM & Nginx..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq --no-install-recommends nodejs npm nginx git curl
fi

# Install PM2 jika belum ada
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -g pm2 --no-audit --no-fund --loglevel=error
fi

echo -e "\033[1;32m[2/5] Menginstall Dependensi Proyek (Fast NPM Install)...\033[0m"
# Menggunakan opsi super cepat tanpa audit & funding check
npm install --no-audit --no-fund --prefer-offline --loglevel=error

echo -e "\033[1;32m[3/5] Membangun Bundle Produksi (Vite Build)...\033[0m"
npm run build

echo -e "\033[1;32m[4/5] Memulai Service 24/7 dengan PM2...\033[0m"
pm2 delete pulorida-bot pulorida-web 2>/dev/null || true
pm2 start bot_telegram.cjs --name "pulorida-bot"
pm2 start server.js --name "pulorida-web"
pm2 save

echo -e "\033[1;32m[5/5] Memasang Konfigurasi Nginx untuk highcards.biz.id...\033[0m"
cat << 'EOF' | sudo tee /etc/nginx/sites-available/highcards > /dev/null
server {
    listen 80;
    server_name highcards.biz.id www.highcards.biz.id;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/highcards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo -e "\033[1;36m============================================================\033[0m"
echo -e "\033[1;32m  ✅ VPS SETUP SELESAI & BERHASIL 100%!\033[0m"
echo -e "\033[1;32m  - Web Dashboard : http://highcards.biz.id/\033[0m"
echo -e "\033[1;32m  - Direct IP     : http://0.0.0.0:3004/\033[0m"
echo -e "\033[1;32m  - Telegram Bot  : ONLINE (PM2 Active)\033[0m"
echo -e "\033[1;36m============================================================\033[0m"
