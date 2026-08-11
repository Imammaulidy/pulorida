import React from 'react';
import { Printer, Download } from 'lucide-react';
import { formatIDR, formatDateID, exportToCSV } from '../utils/formatters';

export default function ReportsAndExport({ 
  orgInfo, 
  transactions, 
  totalBalance, 
  totalIncome, 
  totalExpense 
}) {
  const netSurplus = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  const handleExportFullCSV = () => {
    const headers = ['ID Transaksi', 'Tanggal', 'Jenis Transaksi', 'Dompet / Kas', 'Kategori', 'Keterangan', 'Nominal (Rp)', 'Penanggung Jawab'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'Debet (Pemasukan)' : 'Kredit (Pengeluaran)',
      t.wallet ? t.wallet.replace(/^[^\w\s]+/, '').trim() : 'Cash / Tunai',
      t.category || 'Kas',
      t.description || 'Transaksi',
      t.amount,
      t.personInCharge || '-'
    ]);
    exportToCSV(`Laporan_Lengkap_Keuangan_${orgInfo.name.replace(/\s+/g, '_')}.csv`, rows, headers);
  };

  // Group transactions by Month (e.g., "AGUSTUS 2026", "JULI 2026")
  const getMonthYearLabel = (dateStr) => {
    if (!dateStr) return 'LAINNYA';
    const parts = dateStr.split('-');
    if (parts.length < 2) return 'LAINNYA';
    const year = parts[0];
    const month = parts[1];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex < 0 || monthIndex > 11) return 'LAINNYA';
    return `${monthNames[monthIndex].toUpperCase()} ${year}`;
  };

  const groupedByMonth = transactions.reduce((acc, trx) => {
    const label = getMonthYearLabel(trx.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(trx);
    return acc;
  }, {});

  const monthLabels = Object.keys(groupedByMonth);

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/60 bg-[#122419] flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div>
          <h3 className="text-base font-bold text-white">Laporan Keuangan Resmi & Cetak Dokumen</h3>
          <p className="text-xs text-emerald-400/80">Siap dicetak sebagai PDF resmi lengkap dengan pemisah per bulan.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportFullCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800/80 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="glass-panel print-container rounded-2xl p-4 sm:p-8 border border-emerald-900/60 bg-[#0E1B13] text-slate-100 shadow-2xl space-y-6">
        {/* Official Header Organisasi */}
        <div className="border-b-2 border-emerald-900/60 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-emerald-400/40 flex-shrink-0">
              {orgInfo.logoText || 'PFC'}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase m-0 p-0 leading-tight">
                {orgInfo.name}
              </h1>
              <p className="text-xs text-emerald-400/80 font-semibold">{orgInfo.subTitle}</p>
              <p className="text-[11px] text-emerald-500/70">{orgInfo.address} | Kontak: {orgInfo.contactPhone}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              DOKUMEN RESMI
            </span>
            <p className="text-[10px] text-emerald-500/70 mt-1.5">Dicetak: {formatDateID(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider underline decoration-emerald-500 underline-offset-8">
            LAPORAN REKAPITULASI SURPLUS / DEFISIT KEUANGAN
          </h2>
          <p className="text-xs text-emerald-400/70">{orgInfo.period}</p>
        </div>

        {/* Summary Executive Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-emerald-950/80 border border-emerald-900/80">
          <div>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 uppercase font-bold block">Saldo Awal Kas:</span>
            <p className="text-xs sm:text-sm font-extrabold text-slate-200">{formatIDR(orgInfo.initialBalance)}</p>
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 uppercase font-bold block">Total Debet:</span>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-400">{formatIDR(totalIncome)}</p>
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 uppercase font-bold block">Total Kredit:</span>
            <p className="text-xs sm:text-sm font-extrabold text-rose-400">{formatIDR(totalExpense)}</p>
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-emerald-500 uppercase font-bold block">Surplus Bersih:</span>
            <p className={`text-xs sm:text-sm font-extrabold ${netSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIDR(netSurplus)}
            </p>
          </div>
        </div>

        {/* Transaction Detail Breakdown Section */}
        <div className="space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
            Rincian Transaksi Keuangan (Dikelompokkan Per Bulan)
          </h3>

          {/* DESKTOP TABLE VIEW (With Month Headers) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-emerald-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-950 text-emerald-300 font-bold uppercase text-[10px] border-b border-emerald-900/80">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kategori & Uraian</th>
                  <th className="py-2.5 px-3">PJ</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan</th>
                  <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/80 text-slate-200">
                {monthLabels.map((monthLabel) => {
                  const monthTrxs = groupedByMonth[monthLabel];
                  return (
                    <React.Fragment key={monthLabel}>
                      {/* MONTH SEPARATOR ROW DESKTOP */}
                      <tr className="bg-emerald-950/90 text-emerald-300 font-bold text-xs border-y border-emerald-800/60">
                        <td colSpan="6" className="py-2 px-3 uppercase tracking-wider font-extrabold">
                          📅 PERIODE: {monthLabel} ({monthTrxs.length} TRANSAKSI)
                        </td>
                      </tr>

                      {monthTrxs.map((trx, idx) => {
                        const isIncome = trx.type === 'income';
                        return (
                          <tr key={trx.id} className="hover:bg-emerald-900/20">
                            <td className="py-2 px-3 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-[11px]">{formatDateID(trx.date)}</td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-white block text-xs">{trx.description || 'Transaksi'}</span>
                              <span className="text-[10px] text-emerald-400/70">{trx.wallet || '💵 Cash / Tunai'}</span>
                            </td>
                            <td className="py-2 px-3 text-[11px]">{trx.personInCharge}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-400 text-xs">
                              {isIncome ? formatIDR(trx.amount) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-rose-400 text-xs">
                              {!isIncome ? formatIDR(trx.amount) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-950/90 font-extrabold text-white text-xs border-t-2 border-emerald-900">
                  <td colSpan="4" className="py-2.5 px-3 text-right uppercase">Total Akumulasi:</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{formatIDR(totalIncome)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{formatIDR(totalExpense)}</td>
                </tr>
                <tr className="bg-emerald-900/40 font-extrabold text-white text-xs">
                  <td colSpan="4" className="py-2.5 px-3 text-right uppercase">Saldo Kas Akhir:</td>
                  <td colSpan="2" className="py-2.5 px-3 text-right text-emerald-300 text-sm">
                    {formatIDR(totalBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* MOBILE COMPACT CARD VIEW (GROUPED BY MONTH SEPARATOR BANNERS) */}
          <div className="block sm:hidden space-y-4">
            {monthLabels.map((monthLabel) => {
              const monthTrxs = groupedByMonth[monthLabel];
              return (
                <div key={monthLabel} className="space-y-2">
                  {/* MOBILE MONTH SEPARATOR BANNER */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-950 border border-emerald-800/80 text-xs font-extrabold text-emerald-300 tracking-wider">
                    <span className="flex items-center gap-1.5 uppercase">
                      <span>📅</span>
                      <span>{monthLabel}</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      {monthTrxs.length} Transaksi
                    </span>
                  </div>

                  {/* Transactions inside this Month */}
                  <div className="rounded-2xl border border-emerald-900/60 bg-[#122419] divide-y divide-emerald-950/90 overflow-hidden">
                    {monthTrxs.map((trx, idx) => {
                      const isIncome = trx.type === 'income';
                      return (
                        <div key={trx.id} className="p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-emerald-400/80 font-mono">
                            <span>#{idx + 1} · {formatDateID(trx.date)}</span>
                            <span className="text-white font-bold">PJ: {trx.personInCharge}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div>
                              <h4 className="font-bold text-white text-xs">{trx.description || 'Transaksi'}</h4>
                              <span className="text-[10px] text-emerald-500/80">{trx.wallet || '💵 Cash / Tunai'}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-bold block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isIncome ? '+' : '-'}{formatIDR(trx.amount)}
                              </span>
                              <span className="text-[9px] text-emerald-500 uppercase font-semibold">{isIncome ? 'DEBET' : 'KREDIT'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Mobile Total Summary Cards */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-800/70 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-400">
                <span>Total Debet (Pemasukan):</span>
                <span className="font-bold">{formatIDR(totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-rose-400">
                <span>Total Kredit (Pengeluaran):</span>
                <span className="font-bold">{formatIDR(totalExpense)}</span>
              </div>
              <div className="pt-2 border-t border-emerald-900/80 flex items-center justify-between text-white font-extrabold">
                <span>Saldo Kas Akhir:</span>
                <span className="text-emerald-300 text-sm">{formatIDR(totalBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
