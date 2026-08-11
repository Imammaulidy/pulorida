import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ChevronDown, 
  ArrowDownLeft, 
  ArrowUpRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatIDR } from '../utils/formatters';

export default function OverviewCards({ 
  totalBalance, 
  totalIncome, 
  totalExpense,
  showBalance = true,
  setShowBalance
}) {
  const isDeficit = totalBalance < 0;
  const currentMonthYear = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="space-y-4">
      {/* NET CASHFLOW HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl p-6 border border-emerald-900/60 bg-gradient-to-br from-[#122419] via-[#0E1B13] to-[#0A140E] shadow-2xl">
        {/* Background Glow Accent */}
        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isDeficit ? 'bg-rose-500/15' : 'bg-emerald-500/15'}`} />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-emerald-400/90 uppercase">
            <span>NET CASHFLOW / SALDO KAS</span>
            <span>·</span>
            <span>{currentMonthYear}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-500/80 cursor-pointer hover:text-emerald-400 transition-colors" />
          </div>

          {setShowBalance && (
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:text-white transition-colors"
              title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Amount & Status Badge */}
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isDeficit ? 'bg-rose-950/90 text-rose-400 border border-rose-800/80' : 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'}`}>
              {isDeficit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-bold ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {totalBalance < 0 ? '-Rp' : 'Rp'}
                </span>
                <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans ${isDeficit ? 'text-rose-400' : 'text-white'}`}>
                  {showBalance ? Math.abs(totalBalance).toLocaleString('id-ID') : '••••••••'}
                </span>
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isDeficit 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {isDeficit ? 'Defisit' : 'Surplus'}
          </span>
        </div>

        {/* Sub Income & Expense Summary Bar */}
        <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-emerald-900/40">
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/30">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Pemasukan</span>
              <span className="text-sm font-bold text-emerald-400 truncate block">
                {showBalance ? formatIDR(totalIncome) : '••••••••'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-rose-950/30 border border-rose-900/30">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">Pengeluaran</span>
              <span className="text-sm font-bold text-rose-400 truncate block">
                {showBalance ? formatIDR(totalExpense) : '••••••••'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
