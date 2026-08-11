import React, { useState } from 'react';
import { 
  Menu, 
  Shield, 
  Bell, 
  X,
  KeyRound,
  Wallet
} from 'lucide-react';
import { formatIDR } from '../utils/formatters';

export default function Header({
  activeTab,
  setSidebarOpen,
  userRole,
  setUserRole,
  adminPin = '0000',
  showBalance = true,
  setShowBalance,
  totalBalance = 0
}) {
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const titles = {
    overview: 'Transaksi',
    reports: 'Laporan Keuangan',
    settings: 'Pengaturan Profil'
  };

  const handleAdminRoleClick = () => {
    if (userRole === 'admin') return;
    setInputPin('');
    setPinError(false);
    setIsAdminPinModalOpen(true);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (inputPin === adminPin) {
      setUserRole('admin');
      setIsAdminPinModalOpen(false);
      setInputPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B150F]/90 backdrop-blur-xl border-b border-emerald-950/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 no-print">
      {/* Left: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-emerald-950/60 text-emerald-300 hover:text-white border border-emerald-900/50 transition-colors lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
            {titles[activeTab] || 'Transaksi'}
          </h2>
        </div>
      </div>

      {/* Right: Live Balance Badge, Role Switcher & Notification */}
      <div className="flex items-center gap-2.5">
        {/* Live Total Balance Badge in Top Header */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-800/60 text-xs font-bold shadow-inner">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400/80 text-[10px] uppercase tracking-wider font-semibold">Sisa Saldo:</span>
          <span className={`font-extrabold font-sans ${totalBalance >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {showBalance ? formatIDR(totalBalance) : '••••••••'}
          </span>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center gap-1 p-1 bg-emerald-950/80 rounded-xl border border-emerald-900/60 text-xs font-semibold">
          <button
            onClick={handleAdminRoleClick}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all
              ${userRole === 'admin' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold' 
                : 'text-emerald-400/80 hover:text-emerald-200'
              }
            `}
            title="Mode Admin"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={() => setUserRole('user')}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all
              ${userRole === 'user' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold' 
                : 'text-emerald-400/80 hover:text-emerald-200'
              }
            `}
            title="Mode User / Anggota"
          >
            <span>User</span>
          </button>
        </div>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl bg-emerald-950/60 text-emerald-300 hover:text-white border border-emerald-900/50 relative transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      </div>

      {/* ADMIN PIN MODAL */}
      {isAdminPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-800/60 bg-[#122419] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Verifikasi PIN Admin</h3>
              </div>
              <button 
                onClick={() => setIsAdminPinModalOpen(false)}
                className="p-1 rounded-lg text-emerald-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-emerald-300/80">
              Masukkan 4 digit PIN Admin untuk membuka hak akses penuh manajemen kas & bot.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength="6"
                  autoFocus
                  placeholder="• • • •"
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setPinError(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-center text-lg tracking-widest font-mono font-bold rounded-xl bg-emerald-950 border text-white focus:outline-none transition-colors
                    ${pinError ? 'border-rose-500 text-rose-300' : 'border-emerald-800 focus:border-emerald-500'}
                  `}
                />
                {pinError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 text-center font-semibold">
                    PIN Salah! Default PIN: 0000
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-bold transition-all text-center border border-emerald-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all text-center"
                >
                  Masuk Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
