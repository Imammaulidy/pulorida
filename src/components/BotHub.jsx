import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Terminal, 
  Key, 
  Copy, 
  Code2, 
  Zap,
  DollarSign,
  PieChart,
  PlusCircle,
  MinusCircle,
  Tag,
  Users,
  CheckCircle2,
  MessageSquare,
  QrCode,
  Smartphone,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatIDR } from '../utils/formatters';

export default function BotHub({ 
  onAddTransaction, 
  totalBalance, 
  transactions, 
  categories = [],
  pjs = [],
  orgInfo,
  userRole
}) {
  const [activePlatform, setActivePlatform] = useState('telegram'); // 'telegram' or 'whatsapp'
  const [activeTab, setActiveTab] = useState('simulator');
  const [commandInput, setCommandInput] = useState('');
  const [sessionMode, setSessionMode] = useState('income');
  
  const [botConfig, setBotConfig] = useState({
    telegramToken: '8925659221:AAFLIQsrq-uX1OUrNPn2OtPR1IJWfstzpto',
    waNumber: '6281234567890',
    waApiKey: 'FONNTE_PULORIDA_SECRET_API_KEY_2026',
    autoVerify: true
  });

  // Telegram Chat Logs
  const [chatLogs, setChatLogs] = useState([
    {
      sender: 'bot',
      text: `🤖 Bot Keuangan ${orgInfo.name}\nMasukan nominal`,
      time: '08:00'
    }
  ]);

  // WhatsApp Chat Logs
  const [waChatLogs, setWaChatLogs] = useState([
    {
      sender: 'bot',
      text: `💬 *BOT WHATSAPP PULORIDA FINANCIAL CENTER*\n\nSelamat datang! Balas perintah berikut:\n\n*+ Catat Pemasukan*\n*- Catat Pengeluaran*\n*Cek Saldo*\n*Laporan Kas*\n\nAtau ketik nominal langsung (contoh: *500000* atau *500rb*).`,
      time: '08:00'
    }
  ]);

  const [copiedCode, setCopiedCode] = useState(false);

  // Parser helper
  const parseNominalAndDesc = (rawText) => {
    if (!rawText) return null;
    const clean = rawText.trim();

    const regex = /^(?:rp\.?\s*)?(\d+(?:[\.,]\d+)?)\s*(rb|k)?(?:\s+(.*))?$/i;
    const match = clean.match(regex);

    if (match) {
      let numStr = match[1].replace(/[\.,]/g, '');
      let num = Number(numStr);
      const unit = (match[2] || '').toLowerCase();

      if (unit === 'rb' || unit === 'k') {
        num = num * 1000;
      }

      const desc = (match[3] || '').trim();
      if (!isNaN(num) && num > 0) {
        return { amount: num, desc };
      }
    }

    const parts = clean.split(' ');
    const firstWord = parts[0].replace(/[^0-9]/g, '');
    if (firstWord && !isNaN(Number(firstWord)) && Number(firstWord) > 0) {
      return {
        amount: Number(firstWord),
        desc: parts.slice(1).join(' ').trim()
      };
    }

    return null;
  };

  // Telegram Command Handler
  const processCommand = (rawText) => {
    if (!rawText.trim()) return;

    const userText = rawText.trim();
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let botReply = '';

    if (userText.includes('+ Catat Pemasukan') || userText.includes('Catat Pemasukan')) {
      setSessionMode('income');
      botReply = "Masukan nominal";
    }
    else if (userText.includes('- Catat Pengeluaran') || userText.includes('Catat Pengeluaran')) {
      setSessionMode('expense');
      botReply = "Masukan nominal";
    }
    else if (userText.toLowerCase().includes('cek saldo') || userText.toLowerCase().includes('saldo')) {
      botReply = `💰 SALDO KAS SAAT INI\n\n- Saldo Kas: ${formatIDR(totalBalance)}\n- Total Transaksi: ${transactions.length} Catatan`;
    }
    else {
      const parsed = parseNominalAndDesc(userText);
      if (parsed) {
        const { amount, desc } = parsed;
        const newTrx = {
          id: `trx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: sessionMode,
          wallet: '💵 Cash / Tunai',
          category: sessionMode === 'income' ? 'Pemasukan Kas Umum' : 'Operasional & ATK',
          description: desc || (sessionMode === 'income' ? 'Pemasukan via Bot' : 'Pengeluaran via Bot'),
          amount: amount,
          personInCharge: pjs[0] || 'Ahmad Rizky, S.E.',
          status: 'verified'
        };

        onAddTransaction(newTrx);
        botReply = `✅ Pencatatan Kas Berhasil!\n\nNominal: ${formatIDR(amount)}\nJenis: ${sessionMode === 'income' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}\nKet: ${newTrx.description}`;
      } else {
        botReply = "Masukan nominal";
      }
    }

    setChatLogs(prev => [
      ...prev,
      { sender: 'user', text: userText, time: now },
      { sender: 'bot', text: botReply, time: now }
    ]);
    setCommandInput('');
  };

  // WhatsApp Command Handler
  const processWaCommand = (rawText) => {
    if (!rawText.trim()) return;

    const userText = rawText.trim();
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let botReply = '';

    if (userText.includes('+ Catat Pemasukan') || userText.includes('Catat Pemasukan')) {
      setSessionMode('income');
      botReply = "💬 *WhatsApp Bot Pulorida*\n\nMasukan nominal";
    }
    else if (userText.includes('- Catat Pengeluaran') || userText.includes('Catat Pengeluaran')) {
      setSessionMode('expense');
      botReply = "💬 *WhatsApp Bot Pulorida*\n\nMasukan nominal";
    }
    else if (userText.toLowerCase().includes('cek saldo') || userText.toLowerCase().includes('saldo')) {
      botReply = `💰 *SALDO KAS PULORIDA*\n\n- *Saldo Kas:* ${formatIDR(totalBalance)}\n- *Total Catatan:* ${transactions.length} Transaksi`;
    }
    else {
      const parsed = parseNominalAndDesc(userText);
      if (parsed) {
        const { amount, desc } = parsed;
        const newTrx = {
          id: `trx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: sessionMode,
          wallet: '📱 E-Wallet (WhatsApp)',
          category: sessionMode === 'income' ? 'Pemasukan Kas Umum' : 'Operasional & ATK',
          description: desc || (sessionMode === 'income' ? 'Pemasukan via WhatsApp Bot' : 'Pengeluaran via WhatsApp Bot'),
          amount: amount,
          personInCharge: pjs[0] || 'Ahmad Rizky, S.E.',
          status: 'verified'
        };

        onAddTransaction(newTrx);
        botReply = `✅ *Pencatatan WhatsApp Berhasil!*\n\n• *Nominal:* ${formatIDR(amount)}\n• *Jenis:* ${sessionMode === 'income' ? 'Pemasukan (+)' : 'Pengeluaran (-)'}\n• *Keterangan:* ${newTrx.description}\n\n*Saldo Baru:* ${formatIDR(totalBalance + (sessionMode === 'income' ? amount : -amount))}`;
      } else {
        botReply = "💬 *WhatsApp Bot Pulorida*\n\nMasukan nominal";
      }
    }

    setWaChatLogs(prev => [
      ...prev,
      { sender: 'user', text: userText, time: now },
      { sender: 'bot', text: botReply, time: now }
    ]);
    setCommandInput('');
  };

  const copyScriptCode = () => {
    const scriptText = `
// bot_telegram.cjs - Pulorida Financial Center
const https = require('https');
const fs = require('fs');
const path = require('path');
const BOT_TOKEN = '${botConfig.telegramToken}';
console.log('Bot Telegram Active...');
    `;

    navigator.clipboard.writeText(scriptText.trim());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER PLATFORM SWITCHER (Telegram vs WhatsApp) */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-3xl border border-emerald-800/60 bg-[#122419]">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${activePlatform === 'telegram' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
            {activePlatform === 'telegram' ? <Bot className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {activePlatform === 'telegram' ? 'Bot Telegram Financial Center' : 'Bot WhatsApp Financial Center'}
            </h3>
            <p className="text-xs text-emerald-400/80">
              Pencatatan kas otomatis serba cepat dari chat mobile
            </p>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-emerald-950/80 border border-emerald-900/60">
          <button
            onClick={() => setActivePlatform('telegram')}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all
              ${activePlatform === 'telegram'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-emerald-400/70 hover:text-white'
              }
            `}
          >
            <Bot className="w-4 h-4" />
            <span>Telegram Bot</span>
          </button>

          <button
            onClick={() => setActivePlatform('whatsapp')}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all
              ${activePlatform === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-emerald-400/70 hover:text-white'
              }
            `}
          >
            <MessageSquare className="w-4 h-4 text-emerald-200" />
            <span>WhatsApp Bot</span>
          </button>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-emerald-900/50 pb-2">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'simulator' 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
              : 'text-emerald-500/70 hover:text-emerald-300'
            }
          `}
        >
          <Terminal className="w-4 h-4" />
          <span>Simulator {activePlatform === 'telegram' ? 'Telegram' : 'WhatsApp'}</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${activeTab === 'config' 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
              : 'text-emerald-500/70 hover:text-emerald-300'
            }
          `}
        >
          <Key className="w-4 h-4" />
          <span>Konfigurasi API & Gateway</span>
        </button>
      </div>

      {/* PLATFORM 1: TELEGRAM BOT SIMULATOR & CONFIG */}
      {activePlatform === 'telegram' && activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telegram Chat Box */}
          <div className="lg:col-span-2 rounded-3xl border border-emerald-900/60 bg-[#0E1B13] flex flex-col h-[520px] overflow-hidden shadow-2xl">
            {/* Header Chat */}
            <div className="p-4 bg-[#122419] border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bot Telegram Pulorida</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Output: "Masukan nominal"
                  </span>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                Live Dynamic Sync
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B150F]/80">
              {chatLogs.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`
                    max-w-[80%] p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-md
                    ${msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-[#122419] text-emerald-100 border border-emerald-800/60 rounded-bl-none font-mono'
                    }
                  `}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-emerald-600 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="p-3 bg-[#122419] border-t border-emerald-900/60 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => processCommand('+ Catat Pemasukan')}
                  className="py-2 px-3 rounded-xl bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-800/60"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>+ Catat Pemasukan</span>
                </button>
                <button
                  onClick={() => processCommand('- Catat Pengeluaran')}
                  className="py-2 px-3 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-900/60"
                >
                  <MinusCircle className="w-4 h-4 text-rose-400" />
                  <span>- Catat Pengeluaran</span>
                </button>
              </div>

              {/* Input Command Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  processCommand(commandInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Ketik nominal di sini (contoh: 500000)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>

          {/* Side Instructions */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl border border-emerald-800/60 bg-[#122419] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Respon Super Ringkas!
              </h4>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                Bot Telegram hanya merespon <strong>"Masukan nominal"</strong> saat meminta input nominal tanpa kalimat pengantar panjang.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-800/60 bg-[#122419] space-y-2 font-mono text-xs">
              <span className="text-[10px] text-emerald-500 uppercase tracking-wider block font-bold">Token Telegram Active:</span>
              <p className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 break-all">
                {botConfig.telegramToken}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 2: WHATSAPP BOT SIMULATOR & GATEWAY GUIDE */}
      {activePlatform === 'whatsapp' && activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WhatsApp Chat Box */}
          <div className="lg:col-span-2 rounded-3xl border border-emerald-800/60 bg-[#0B141A] flex flex-col h-[520px] overflow-hidden shadow-2xl">
            {/* Header WhatsApp */}
            <div className="p-4 bg-[#128C7E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bot WhatsApp Pulorida</h4>
                  <span className="text-[10px] text-emerald-100 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    WhatsApp Business Gateway
                  </span>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800">
                Wa-API Ready
              </span>
            </div>

            {/* Chat Body (WhatsApp Styled) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B141A] bg-opacity-95">
              {waChatLogs.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-md
                    ${msg.sender === 'user'
                      ? 'bg-[#005C4B] text-white rounded-br-none font-medium'
                      : 'bg-[#202C33] text-slate-100 border border-emerald-900/40 rounded-bl-none'
                    }
                  `}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                    {msg.time} {msg.sender === 'user' && <span className="text-emerald-400 font-bold">✓✓</span>}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick WhatsApp Action Buttons */}
            <div className="p-3 bg-[#1F2C34] border-t border-emerald-900/60 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => processWaCommand('+ Catat Pemasukan')}
                  className="py-2 px-3 rounded-xl bg-[#005C4B] text-white hover:bg-[#007A63] text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" />
                  <span>+ Catat Pemasukan</span>
                </button>
                <button
                  onClick={() => processWaCommand('- Catat Pengeluaran')}
                  className="py-2 px-3 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900/80 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-900/60"
                >
                  <MinusCircle className="w-4 h-4 text-rose-400" />
                  <span>- Catat Pengeluaran</span>
                </button>
              </div>

              {/* Input Command Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  processWaCommand(commandInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Ketik nominal WhatsApp (contoh: 500rb)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2A3942] border border-emerald-800/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008F70] text-emerald-950 text-xs font-extrabold flex items-center gap-1 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim WA</span>
                </button>
              </form>
            </div>
          </div>

          {/* WhatsApp Integration Steps */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl border border-emerald-800/60 bg-[#122419] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Cara Menghubungkan WhatsApp
              </h4>
              <ol className="text-xs text-emerald-300/80 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Gunakan Simulator WhatsApp untuk menguji pencatatan iuran dan pengeluaran.</li>
                <li>Daftarkan API Key Fonnte/Wablas atau Gateway WhatsApp jika ingin meneruskan pesan secara otomatis.</li>
                <li>Setiap simulasi transaksi akan langsung tersinkronkan dengan Dashboard secara realtime!</li>
              </ol>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-800/60 bg-[#122419] space-y-2 font-mono text-xs">
              <span className="text-[10px] text-emerald-500 uppercase tracking-wider block font-bold">Bot Utama (Telegram Active):</span>
              <p className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300">
                bot_telegram.cjs
              </p>
              <button
                onClick={copyScriptCode}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Disalin!' : 'Salin Kode Telegram Bot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-3xl border border-emerald-800/60 bg-[#122419] space-y-4 max-w-xl">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Pengaturan Token & Webhook API
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                Token Telegram Bot
              </label>
              <input
                type="text"
                value={botConfig.telegramToken}
                onChange={(e) => setBotConfig({ ...botConfig, telegramToken: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                Nomor WhatsApp Business / Gateway
              </label>
              <input
                type="text"
                value={botConfig.waNumber}
                onChange={(e) => setBotConfig({ ...botConfig, waNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                Fonnte / Wablas API Key
              </label>
              <input
                type="text"
                value={botConfig.waApiKey}
                onChange={(e) => setBotConfig({ ...botConfig, waApiKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
