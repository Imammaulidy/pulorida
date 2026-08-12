import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  Wallet,
  Eye,
  UserCheck,
  Code
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, orgInfo, isOpen, setIsOpen, userRole }) {
  const allMenuItems = [
    { id: 'overview', label: 'Ringkasan & Transparansi', icon: LayoutDashboard, adminOnly: false },
    { id: 'reports', label: 'Laporan & Cetak', icon: FileText, adminOnly: true },
    { id: 'settings', label: 'Pengaturan Profil', icon: Settings, adminOnly: true }
  ];

  const menuItems = userRole === 'admin' 
    ? allMenuItems 
    : allMenuItems.filter(item => !item.adminOnly);

  return (
    <>
      {/* Mobile Backdrop - High z-index (z-[9998]) so sidebar is ALWAYS ON TOP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] lg:hidden no-print"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer - Always On Top when open (z-[9999]) */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 lg:z-40 w-72 bg-[#0E1B13] border-r border-emerald-900/50 
        flex flex-col transition-transform duration-300 ease-in-out no-print
        ${isOpen ? 'translate-x-0 !z-[9999]' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/40 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#0B150F] rounded-[14px] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-extrabold text-white tracking-wide leading-snug break-words">
              {orgInfo.name}
            </h1>
            <p className="text-[11px] text-emerald-400/80 leading-tight mt-0.5 break-words">
              {orgInfo.subTitle}
            </p>
          </div>
        </div>

        {/* Financial Status & Role Badge */}
        <div className="mx-4 my-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/40">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`flex items-center gap-1 font-bold ${userRole === 'admin' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {userRole === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {userRole === 'admin' ? 'Akses Admin' : 'Mode User (Lihat)'}
            </span>
            <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full font-mono">2026</span>
          </div>
          <p className="text-[11px] text-emerald-300/70">
            {userRole === 'admin' ? 'Hak penuh manajemen kas & bot' : 'Portal transparansi publik anggota'}
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
          <p className="px-3 text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-2">Menu Utama</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 font-bold' 
                    : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/30'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-emerald-400/70 group-hover:text-emerald-300'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer Credits (ALWAYS ON TOP, 100% UNBLOCKED) */}
        <div className="p-4 border-t border-emerald-900/40 text-xs flex flex-col gap-1.5 bg-emerald-950/90 flex-shrink-0 z-10">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-emerald-500/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              ADMIN :
            </span>
            <span className="text-white font-extrabold tracking-wide">AJAY</span>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-emerald-500/60 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3 h-3 text-emerald-400" />
              CREDITED BY :
            </span>
            <span className="text-emerald-300 font-extrabold tracking-widest">IMAM</span>
          </div>
        </div>
      </aside>
    </>
  );
}
