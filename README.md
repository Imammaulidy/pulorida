# 🏢 PULORIDA FINANCIAL CENTER

> Dashboard Web Pengelolaan & Transparansi Keuangan Organisasi + Bot Telegram Realtime (Synchronized).

Direct Deployment via GitHub (`git clone https://github.com/Imammaulidy/pulorida.git`) tanpa perlu Cloudflare Tunnel atau Local Tunnel.

---

## 📌 Server & Domain Info
- **VPS IP**: `38.253.224.30`
- **SSH Port**: `45196` (User: `root`)
- **Domain**: `highcards.biz.id`
- **Default Application Port**: `3004`
- **Telegram Bot**: `@PuloridaBot` (`8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto`)

---

## 🚀 Panduan Instalasi Berdasarkan Jenis Perangkat (Device Types)

### 🐧 1. Linux VPS (Ubuntu / Debian / CentOS) — Recommended 24/7 Production

Gunakan panduan ini untuk mendeploy aplikasi langsung ke VPS agar aktif 24 jam nonstop:

#### 🔹 Step A: Hubungi VPS via SSH
```bash
ssh -p 45196 root@38.253.224.30
```

#### 🔹 Step B: Pull Project & Run 1-Click VPS Setup Script
```bash
git clone https://github.com/Imammaulidy/pulorida.git
cd pulorida
chmod +x vps_setup.sh start_pm2.sh pulorida.sh
./vps_setup.sh
```
*Script `vps_setup.sh` otomatis meng-install Node.js, NPM, PM2, Nginx, menginstall dependensi dengan cepat (Fast Mode), mem-build bundle produksi, menyalakan PM2 24/7 daemon, serta mengatur Reverse Proxy Nginx untuk `highcards.biz.id`!*

#### 🔹 Perintah Manajemen PM2:
```bash
pm2 status       # Cek status aplikasi & bot
pm2 logs         # Cek log aplikasi real-time
pm2 restart all  # Restart seluruh service
```

#### 🌐 Akses Web & Domain
- Direct Web: `http://38.253.224.30:3004/` atau `http://highcards.biz.id:3004/`
- Opsional (Nginx Reverse Proxy ke Port 80/443): Arahkan `proxy_pass http://127.0.0.1:3004;` untuk domain `highcards.biz.id`.

---

### 💻 2. PC / Laptop Desktop (Windows / macOS / Linux) — Local Development

Gunakan panduan ini jika ingin menjalankan aplikasi di komputer lokal untuk pengujian atau pengembangan:

#### 🔹 Step 1: Clone Repository & Install Dependensi
```bash
git clone https://github.com/Imammaulidy/pulorida.git
cd pulorida
npm install
```

#### 🔹 Step 2: Jalankan Web Dashboard & Telegram Bot
```bash
# Terminal 1 (Web Dashboard)
npm run dev

# Terminal 2 (Telegram Bot)
node bot_telegram.cjs
```

#### 🌐 Akses Web
Buka browser di: `http://localhost:3004/`

---

### 📱 3. Smartphone Android (Termux) — Portable Server

Gunakan panduan ini jika ingin menjalankan server & bot langsung dari HP Android via Termux:

#### 🔹 Step 1: Install Package & Clone Repo
```bash
pkg update && pkg install git nodejs -y
git clone https://github.com/Imammaulidy/pulorida.git
cd pulorida
chmod +x pulorida.sh
```

#### 🔹 Step 2: Jalankan Auto Launcher
```bash
./pulorida.sh
```

#### 🌐 Akses Web
Buka browser HP: `http://localhost:3004/`

---

## 🤖 Integrasi Bot Telegram Realtime
- **Token Bot**: `8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto`
- **Fitur Commands**:
  - `💰 Cek Saldo Kas` / `/saldo`: Menampilkan Saldo Kas Akhir, Total Pemasukan, Pengeluaran & Status Sync.
  - `📩 + Catat Pemasukan` / `/masuk <nominal>`: Input transaksi debet (pemasukan).
  - `📤 - Catat Pengeluaran` / `/keluar <nominal>`: Input transaksi kredit (pengeluaran).
  - `📊 Laporan Ringkas` / `/laporan`: Menampilkan ringkasan 3 transaksi terakhir.
  - `🏷️ Daftar Kategori` / `/kategori`: Menampilkan daftar Kategori terdaftar.
  - `👥 Daftar PJ` / `/pj`: Menampilkan daftar Penanggung Jawab.

---

## 🔐 Hak Akses Dual-Role
1. **Mode Admin**: Hak akses penuh (Tambah, Edit, Hapus Transaksi, Akses Laporan Cetak PDF & Ekspor CSV, Pengaturan Profil). PIN Default: `0000`.
2. **Mode User**: Mode transparansi publik (Read-Only) untuk seluruh anggota komunitas.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **Pulorida Financial Center**. All Rights Reserved.
