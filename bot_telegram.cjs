/**
 * BOT TELEGRAM RESMI PULORIDA FINANCIAL CENTER
 * Token Bot: 8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto
 * Synchronized with Web Dashboard (public/shared_data.json)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SHARED_DATA_PATH = path.join(__dirname, 'data', 'db.json');

let lastUpdateId = 0;
const userSessions = {}; // Session state per chatId: 'income' or 'expense'

// Helper to read shared_data.json
function loadSharedData() {
  try {
    if (fs.existsSync(SHARED_DATA_PATH)) {
      const raw = fs.readFileSync(SHARED_DATA_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading shared_data.json:', err.message);
  }
  return {
    initialBalance: 25000000,
    transactions: []
  };
}

// Helper to write shared_data.json
function saveSharedData(data) {
  try {
    fs.writeFileSync(SHARED_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing shared_data.json:', err.message);
  }
}

// Helper to compute net balance dynamically
function getFinancialStats() {
  const data = loadSharedData();
  const initial = data.orgInfo?.initialBalance || 0;
  let income = 0;
  let expense = 0;

  (data.transactions || []).forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') income += amt;
    if (t.type === 'expense') expense += amt;
  });

  const netBalance = initial + income - expense;
  return {
    initialBalance: initial,
    totalIncome: income,
    totalExpense: expense,
    netBalance: netBalance,
    transactions: data.transactions || []
  };
}

// Formatting Currency Rupiah
function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper to parse nominal numbers (supports: 25.000.000, 500000, 50.000, 500rb, 500k, Rp 25.000.000)
function parseNominalAndDesc(rawText) {
  if (!rawText) return null;
  let clean = rawText.trim();

  // Remove leading 'Rp' or 'Rp.'
  clean = clean.replace(/^(?:rp\.?\s*)/i, '');

  const parts = clean.split(/\s+/);
  let firstToken = parts[0];

  let multiplier = 1;
  if (/rb$/i.test(firstToken) || /k$/i.test(firstToken)) {
    multiplier = 1000;
    firstToken = firstToken.replace(/(rb|k)$/i, '');
  }

  // Remove all dots/commas to get raw digits
  const numericOnly = firstToken.replace(/[^0-9]/g, '');

  if (numericOnly && !isNaN(Number(numericOnly)) && Number(numericOnly) > 0) {
    const amount = Number(numericOnly) * multiplier;
    const desc = parts.slice(1).join(' ').trim();
    return { amount, desc };
  }

  return null;
}

// Send Message helper using Telegram HTTPS API
function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const data = JSON.stringify(payload);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(`${API_URL}/sendMessage`, options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      // Message sent successfully
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Gagal mengirim pesan ke Telegram: ${e.message}`);
  });

  req.write(data);
  req.end();
}

// Telegram Custom Keyboard Buttons
const mainKeyboard = {
  keyboard: [
    [{ text: '💰 Cek Saldo Kas' }, { text: '📊 Laporan Ringkas' }],
    [{ text: '📩 + Catat Pemasukan' }, { text: '📤 - Catat Pengeluaran' }],
    [{ text: '🏷️ Daftar Kategori' }, { text: '👥 Daftar PJ' }],
    [{ text: '❓ Bantuan / Help' }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false
};

// Process incoming Telegram Messages
function handleMessage(message) {
  const chatId = message.chat.id;
  const rawText = (message.text || '').trim();
  const senderName = message.from.first_name || 'Pengurus';

  console.log(`📩 Pesan dari ${senderName} (${chatId}): "${rawText}"`);

  // 1. Button Click: + Catat Pemasukan
  if (rawText.includes('+ Catat Pemasukan') || rawText.includes('Catat Pemasukan')) {
    userSessions[chatId] = 'income';
    sendMessage(chatId, "Masukan nominal", mainKeyboard);
    return;
  }

  // 2. Button Click: - Catat Pengeluaran
  if (rawText.includes('- Catat Pengeluaran') || rawText.includes('Catat Pengeluaran')) {
    userSessions[chatId] = 'expense';
    sendMessage(chatId, "Masukan nominal", mainKeyboard);
    return;
  }

  // 3. Command /start, /help, or Bantuan button
  const command = rawText.split(' ')[0].toLowerCase();
  if (command === '/start' || command === '/help' || rawText.includes('Bantuan')) {
    delete userSessions[chatId];
    sendMessage(chatId, "Masukan nominal", mainKeyboard);
    return;
  }

  // 4. Saldo Kas (DYNAMIC CALCULATION!)
  if (command === '/saldo' || rawText.includes('Cek Saldo')) {
    delete userSessions[chatId];
    const stats = getFinancialStats();
    const reply = `💰 INFORMASI SALDO KAS ORGANISASI\n` +
      `🏢 Pulorida Financial Center\n\n` +
      `• Saldo Kas Bersih: ${formatIDR(stats.netBalance)}\n` +
      `• Total Pemasukan: ${formatIDR(stats.totalIncome)}\n` +
      `• Total Pengeluaran: ${formatIDR(stats.totalExpense)}\n` +
      `• Total Transaksi: ${stats.transactions.length} Transaksi\n` +
      `• Status Kas: Synchronized ✨`;
    sendMessage(chatId, reply, mainKeyboard);
    return;
  }

  // 5. Laporan Ringkas (DYNAMIC FROM SHARED DATA!)
  if (command === '/laporan' || rawText.includes('Laporan')) {
    delete userSessions[chatId];
    const stats = getFinancialStats();
    const recent3 = stats.transactions.slice(0, 3).map((t, idx) => 
      `${idx + 1}. [${t.type === 'income' ? 'MASUK' : 'KELUAR'}] ${formatIDR(t.amount)} - ${t.description} (PJ: ${t.personInCharge})`
    ).join('\n');

    const reply = `📊 RINGKASAN TRANSAKSI KAS LOKAL\n\n` +
      `Saldo Kas Saat Ini: ${formatIDR(stats.netBalance)}\n\n` +
      `3 Transaksi Terakhir:\n${recent3 || 'Belum ada transaksi.'}\n\n` +
      `_Laporan lengkap dapat diunduh di Web Dashboard._`;
    sendMessage(chatId, reply, mainKeyboard);
    return;
  }

  // 6. Daftar Kategori
  if (command === '/kategori' || rawText.includes('Daftar Kategori') || rawText.includes('Kategori')) {
    delete userSessions[chatId];
    const reply = `🏷️ DAFTAR KATEGORI KAS TERDAFTAR\n\n` +
      `1. Kas (Default)\n` +
      `2. Pemasukan Kas Umum\n` +
      `3. Sponsorship & Donasi\n` +
      `4. Hibah / Bantuan Pemda\n` +
      `5. Operasional & ATK\n` +
      `6. Event & Kegiatan\n` +
      `7. Bantuan Sosial (Sosmas)\n` +
      `8. Konsumsi & Gathering`;
    sendMessage(chatId, reply, mainKeyboard);
    return;
  }

  // 7. Daftar PJ
  if (command === '/pj' || rawText.includes('Daftar PJ') || rawText.includes('Penanggung Jawab')) {
    delete userSessions[chatId];
    const reply = `👥 DAFTAR PENANGGUNG JAWAB (PJ) TERDAFTAR\n\n` +
      `• Ahmad Rizky, S.E.\n` +
      `• Muhammad Imam\n` +
      `• Siti Nurhaliza\n` +
      `• Farhan Maulana\n` +
      `• Budi Santoso\n` +
      `• Eka Rahmawati`;
    sendMessage(chatId, reply, mainKeyboard);
    return;
  }

  // 8. DIRECT NOMINAL PARSING & DYNAMIC SAVE TO SHARED_DATA.JSON
  let textToParse = rawText;
  if (command === '/masuk' || command === '/keluar') {
    textToParse = rawText.replace(/^\/(masuk|keluar)\s*/i, '');
  }

  const parsed = parseNominalAndDesc(textToParse);
  if (parsed) {
    const sessionMode = userSessions[chatId] || (command === '/keluar' ? 'expense' : 'income');
    const isIncome = sessionMode === 'income';

    const amount = parsed.amount;
    const category = isIncome ? 'Kas' : 'Operasional & ATK';
    const description = parsed.desc || (isIncome ? 'Pemasukan Kas Organisasi' : 'Pengeluaran Kas Organisasi');

    // Reset session mode
    delete userSessions[chatId];

    // Create & append new transaction object
    const newTrx = {
      id: `TRX-BOT-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      type: isIncome ? 'income' : 'expense',
      category: category,
      description: description,
      amount: amount,
      personInCharge: senderName,
      status: 'verified'
    };

    const currentData = loadSharedData();
    currentData.transactions = [newTrx, ...(currentData.transactions || [])];
    saveSharedData(currentData);

    // Compute updated stats
    const stats = getFinancialStats();

    const reply = `✅ TRANSAKSI KAS BERHASIL DICATAT\n\n` +
      `• Jenis: ${isIncome ? 'Pemasukan (Debet)' : 'Pengeluaran (Kredit)'}\n` +
      `• Nominal: ${formatIDR(amount)}\n` +
      `• Kategori: ${category}\n` +
      `• Deskripsi: ${description}\n` +
      `• Penanggung Jawab: ${senderName}\n\n` +
      `💰 Saldo Kas Bersih Terbaru: ${formatIDR(stats.netBalance)}`;

    sendMessage(chatId, reply, mainKeyboard);
    return;
  }

  // Fallback
  sendMessage(chatId, "Masukan nominal", mainKeyboard);
}

// Long Polling Bot Loop
function pollUpdates() {
  const url = `${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;

  https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        if (response.ok && response.result.length > 0) {
          response.result.forEach((update) => {
            lastUpdateId = update.update_id;
            if (update.message) {
              handleMessage(update.message);
            }
          });
        }
      } catch (err) {
        console.error('Error parsing Telegram response:', err.message);
      }
      setTimeout(pollUpdates, 1000);
    });
  }).on('error', (e) => {
    console.error('Polling error:', e.message);
    setTimeout(pollUpdates, 5000);
  });
}

console.log('====================================================');
console.log('🤖 BOT TELEGRAM RESMI PULORIDA FINANCIAL CENTER');
console.log('🔑 Token: 8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto');
console.log('⚡ Status: REALTIME DYNAMIC SYNC (public/shared_data.json)!');
console.log('====================================================');

pollUpdates();
