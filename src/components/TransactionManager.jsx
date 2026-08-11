import React, { useState } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { formatIDR, formatDateWithDayName, exportToCSV } from '../utils/formatters';

export default function TransactionManager({
  transactions = [],
  categories = [],
  pjs = [],
  onAddCategory,
  onDeleteCategory,
  onAddPJ,
  onDeletePJ,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  searchQuery,
  setSearchQuery,
  isAddModalOpen,
  setIsAddModalOpen,
  userRole,
  showBalance = true,
  setEditingTrx
}) {
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('all');

  const walletOptions = [
    '💵 Cash / Tunai',
    '💳 Bank BCA',
    '📱 E-Wallet (GoPay/Shopee)'
  ];

  const openModalForEdit = (trx) => {
    if (userRole === 'user') return;
    if (setEditingTrx) setEditingTrx(trx);
    setIsAddModalOpen(true);
  };

  // Category Icon Lookup Helper
  const getCategoryIcon = (catName) => {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('makan') || lower.includes('roti') || lower.includes('konsumsi')) return '🍔';
    if (lower.includes('hiburan') || lower.includes('rokok') || lower.includes('game')) return '🎮';
    if (lower.includes('transp') || lower.includes('bensin') || lower.includes('ojek')) return '🚗';
    if (lower.includes('tagihan') || lower.includes('listrik') || lower.includes('wifi')) return '🏠';
    if (lower.includes('gaji') || lower.includes('kas') || lower.includes('pemasukan')) return '💼';
    if (lower.includes('sosial') || lower.includes('donasi')) return '🎁';
    return '📦';
  };

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.description || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (t.category || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (t.personInCharge || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    const matchesWallet = selectedWalletFilter === 'all' || (t.wallet || '💵 Cash / Tunai') === selectedWalletFilter;

    return matchesSearch && matchesWallet;
  });

  // Group transactions by date
  const groupedByDate = filteredTransactions.reduce((acc, trx) => {
    const dateKey = trx.date || 'Lainnya';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(trx);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH ROW */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Wallet Dropdown Filter */}
        <div className="relative">
          <select
            value={selectedWalletFilter}
            onChange={(e) => setSelectedWalletFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs font-semibold text-emerald-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Waktu & Dompet</option>
            {walletOptions.map((w, idx) => (
              <option key={idx} value={w}>{w}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs text-white placeholder-emerald-500/60 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* CSV Export Button */}
        <button
          onClick={() => {
            const rows = filteredTransactions.map(t => [
              t.date,
              t.type === 'income' ? 'Pemasukan (Debet)' : 'Pengeluaran (Kredit)',
              t.wallet ? t.wallet.replace(/^[^\w\s]+/, '').trim() : 'Cash / Tunai',
              t.category || 'Kas',
              t.description || 'Transaksi',
              t.amount,
              t.personInCharge || '-'
            ]);
            exportToCSV(`Laporan_Transaksi_Pulorida_${Date.now()}.csv`, rows, ['Tanggal', 'Jenis Transaksi', 'Dompet / Kas', 'Kategori', 'Keterangan', 'Nominal (Rp)', 'Penanggung Jawab']);
          }}
          className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:text-white transition-colors"
          title="Ekspor CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      </div>

      {/* GROUPED TRANSACTION LIST BY DATE */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-px bg-emerald-900/60 flex-1" />
          <span className="text-[10px] font-bold text-emerald-500/70 tracking-widest uppercase">SUDAH TERJADI</span>
          <div className="h-px bg-emerald-900/60 flex-1" />
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-emerald-500/60 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-emerald-800" />
            <p className="text-xs font-semibold">Belum ada catatan transaksi yang cocok.</p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dayTrxs = groupedByDate[dateStr];
            
            // Calculate total day expense
            const dayTotalExpense = dayTrxs
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-bold text-emerald-300/90 tracking-wider">
                    {formatDateWithDayName(dateStr)}
                  </span>
                  {dayTotalExpense > 0 && (
                    <span className="font-bold text-rose-400">
                      {showBalance ? `-Rp ${dayTotalExpense.toLocaleString('id-ID')}` : '••••••'}
                    </span>
                  )}
                </div>

                {/* Date Group Items Card */}
                <div className="rounded-2xl border border-emerald-900/50 bg-[#122419]/90 divide-y divide-emerald-950/80 overflow-hidden shadow-lg">
                  {dayTrxs.map((trx) => {
                    const icon = getCategoryIcon(trx.category);
                    const isExpense = trx.type === 'expense';

                    return (
                      <div 
                        key={trx.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-900/20 transition-colors group"
                      >
                        {/* Icon & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-lg flex-shrink-0">
                            {icon}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                              {trx.description || 'Transaksi'}
                            </h4>
                            <p className="text-[11px] text-emerald-400/70 truncate">
                              {trx.wallet || '💵 Cash / Tunai'}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <div>
                            <span className={`text-xs font-bold block ${isExpense ? 'text-white' : 'text-emerald-400'}`}>
                              {isExpense ? '-' : '+'}{showBalance ? formatIDR(trx.amount) : '••••••'}
                            </span>
                            <span className="text-[10px] text-emerald-500/70 block">
                              PJ: {trx.personInCharge ? trx.personInCharge.split(',')[0] : 'Admin'}
                            </span>
                          </div>

                          {userRole === 'admin' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openModalForEdit(trx)}
                                className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Hapus transaksi ini?')) {
                                    onDeleteTransaction(trx.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
