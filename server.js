import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Gunakan PORT dari env atau fallback ke 3004 jika tidak ada (sesuai setup VPS/Vite lama)
const PORT = process.env.PORT || 3004;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());

// Inisialisasi file db.json jika belum ada
const initDB = () => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
      orgInfo: {
        name: "PULORIDA FINANCIAL CENTER",
        subTitle: "Organisasi Kepemudaan & Komunitas Pulorida",
        period: "Tahun Anggaran 2026",
        treasurer: "Ahmad Rizky, S.E.",
        chairman: "Muhammad Imam",
        initialBalance: 0,
        logoText: "PFC",
        bankAccount: "BCA 8920192841 a.n. Organisasi Pulorida",
        contactPhone: "0812-3456-7890",
        address: "Jl. Pulorida Raya No. 45, Cilegon, Banten"
      },
      categories: [
        { id: "cat-0", name: "Makanan & Minuman", icon: "🍔", type: "expense", color: "#f97316" },
        { id: "cat-1", name: "Hiburan & Lifestyle", icon: "🎮", type: "expense", color: "#a855f7" },
        { id: "cat-2", name: "Transportasi", icon: "🚗", type: "expense", color: "#3b82f6" },
        { id: "cat-3", name: "Tagihan & Utilitas", icon: "🏠", type: "expense", color: "#ef4444" },
        { id: "cat-4", name: "Operasional & ATK", icon: "📦", type: "expense", color: "#64748b" },
        { id: "cat-5", name: "Event & Kegiatan", icon: "🎉", type: "expense", color: "#ec4899" },
        { id: "cat-6", name: "Pemasukan Kas Umum", icon: "💼", type: "income", color: "#10b981" },
        { id: "cat-7", name: "Sponsorship & Donasi", icon: "🎁", type: "income", color: "#06b6d4" },
        { id: "cat-8", name: "Gaji & Usaha", icon: "💵", type: "income", color: "#22c55e" }
      ],
      pjs: [
        "Ahmad Rizky, S.E.", "Muhammad Imam", "Siti Nurhaliza", "Farhan Maulana",
        "Budi Santoso", "Dewi Lestari", "Nadia Putri", "Eka Rahmawati",
        "Doni Setiawan", "Maya Kartika"
      ],
      transactions: [],
      adminPin: "0000"
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  } else {
    // Pastikan adminPin ada pada database yang sudah ada
    try {
      const existingData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (existingData.adminPin === undefined) {
        existingData.adminPin = "0000";
        fs.writeFileSync(DB_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error(e);
    }
  }
};
initDB();

// API ROUTES
app.get('/api/data', (req, res) => {
  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    res.json(JSON.parse(rawData));
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: 'Gagal membaca data server' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(DB_PATH, JSON.stringify(newData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Data berhasil disimpan' });
  } catch (error) {
    console.error("Error writing data:", error);
    res.status(500).json({ error: 'Gagal menyimpan data ke server' });
  }
});

// Melayani file frontend (React Vite) saat production
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
  const indexFile = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Web Dashboard belum di-build. Jalankan "npm run build" terlebih dahulu.');
  }
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 PULORIDA BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`=============================================`);
});
