import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewCards from './components/OverviewCards';
import TransactionManager from './components/TransactionManager';
import ReportsAndExport from './components/ReportsAndExport';
import SettingsModal from './components/SettingsModal';
import AddTransactionModal from './components/AddTransactionModal';

import {
  initialOrgInfo,
  initialCategories,
  initialPJs
} from './data/initialData';

import { 
  LayoutGrid, 
  Plus,
  FileText
} from 'lucide-react';

const DEFAULT_SAMPLE_TRANSACTIONS = [
  {
    id: "trx-1723186800000",
    date: "2026-08-09",
    type: "expense",
    wallet: "💵 Cash / Tunai",
    category: "Makanan & Minuman",
    description: "Konsumsi & Gathering",
    amount: 100000,
    personInCharge: "BENGO",
    status: "verified"
  },
  {
    id: "trx-1720684800000",
    date: "2026-07-11",
    type: "expense",
    wallet: "💵 Cash / Tunai",
    category: "Makanan & Minuman",
    description: "Konsumsi & Gathering",
    amount: 100000,
    personInCharge: "BENGO",
    status: "verified"
  },
  {
    id: "trx-1720598400001",
    date: "2026-07-10",
    type: "expense",
    wallet: "💵 Cash / Tunai",
    category: "Makanan & Minuman",
    description: "Konsumsi & Gathering",
    amount: 100000,
    personInCharge: "BENGO",
    status: "verified"
  },
  {
    id: "trx-1720598400000",
    date: "2026-07-10",
    type: "income",
    wallet: "💵 Cash / Tunai",
    category: "Pemasukan Kas Umum",
    description: "Kas",
    amount: 100000,
    personInCharge: "BENGO",
    status: "verified"
  },
  {
    id: "trx-1720512000000",
    date: "2026-07-09",
    type: "income",
    wallet: "💵 Cash / Tunai",
    category: "Pemasukan Kas Umum",
    description: "Kas",
    amount: 1000000,
    personInCharge: "BENGO",
    status: "verified"
  }
];

export default function App() {
  // Role State: 'admin' (hak penuh) vs 'user' (hanya lihat)
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('pulorida_user_role');
    return saved || 'user';
  });

  // Admin PIN State (Default: '0000')
  const [adminPin, setAdminPin] = useState('0000');

  // Balance Visibility Toggle
  const [showBalance, setShowBalance] = useState(true);

  // Data States
  const [isLoading, setIsLoading] = useState(true);
  const [orgInfo, setOrgInfo] = useState(initialOrgInfo);
  const [categories, setCategories] = useState(initialCategories);
  const [pjs, setPjs] = useState(initialPJs);
  const [transactions, setTransactions] = useState([]);

  // Fetch initial data from server
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.orgInfo) setOrgInfo(data.orgInfo);
        if (data.categories) setCategories(data.categories);
        if (data.pjs) setPjs(data.pjs);
        if (data.transactions) setTransactions(data.transactions);
        if (data.adminPin !== undefined) setAdminPin(data.adminPin);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data dari server:", err);
        // Fallback to sample if server is down (for safety)
        setTransactions(DEFAULT_SAMPLE_TRANSACTIONS);
        setIsLoading(false);
      });
  }, []);

  // UI Control States
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTrxModalOpen, setIsAddTrxModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);

  // Sync state changes to localStorage for Auth only
  useEffect(() => {
    localStorage.setItem('pulorida_user_role', userRole);
    if (userRole === 'user' && ['reports', 'settings'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [userRole, activeTab]);

  // Sync data changes to Server
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isLoading) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgInfo, categories, pjs, transactions, adminPin })
      }).catch(err => console.error("Gagal menyimpan data ke server:", err));
    }
  }, [orgInfo, categories, pjs, transactions, adminPin, isLoading]);

  // Financial Calculations (DYNAMIC & ACCURATE)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalBalance = (Number(orgInfo.initialBalance) || 0) + totalIncome - totalExpense;

  // Handlers for Category state
  const handleAddCategory = (newCat) => {
    if (!categories.some(c => c.name.toLowerCase() === newCat.name.toLowerCase())) {
      const updated = [...categories, newCat];
      setCategories(updated);
    }
  };

  const handleDeleteCategory = (catId) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
  };

  // Handlers for PJ state
  const handleAddPJ = (newPJ) => {
    if (newPJ && !pjs.includes(newPJ)) {
      const updated = [...pjs, newPJ];
      setPjs(updated);
    }
  };

  const handleDeletePJ = (pjName) => {
    const updated = pjs.filter(p => p !== pjName);
    setPjs(updated);
  };

  // Handlers for Transactions (STRICT PERMANENT DISK SAVES VIA SERVER)
  const handleAddTransaction = (newTrx) => {
    const updated = [newTrx, ...transactions];
    setTransactions(updated);

    if (newTrx.personInCharge && !pjs.includes(newTrx.personInCharge)) {
      handleAddPJ(newTrx.personInCharge);
    }
  };

  const handleUpdateTransaction = (updatedTrx) => {
    const updated = transactions.map(t => t.id === updatedTrx.id ? updatedTrx : t);
    setTransactions(updated);
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua data ke sampel awal? Data perubahan Anda akan di-reset.')) {
      setOrgInfo(initialOrgInfo);
      setCategories(initialCategories);
      setPjs(initialPJs);
      setTransactions(DEFAULT_SAMPLE_TRANSACTIONS);
      setAdminPin('0000');
      setUserRole('user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B150F] flex items-center justify-center">
        <div className="text-emerald-500 font-bold animate-pulse">Menghubungkan ke Server...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B150F] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-white pb-24 lg:pb-8">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orgInfo={orgInfo}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userRole={userRole}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          userRole={userRole}
          setUserRole={setUserRole}
          adminPin={adminPin}
          showBalance={showBalance}
          setShowBalance={setShowBalance}
          totalBalance={totalBalance}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* NET CASHFLOW HERO CARD (Overview Tab) */}
          {activeTab === 'overview' && (
            <OverviewCards
              totalBalance={totalBalance}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              showBalance={showBalance}
              setShowBalance={setShowBalance}
            />
          )}

          {/* OVERVIEW MAIN TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <TransactionManager
                transactions={transactions}
                categories={categories}
                pjs={pjs}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddPJ={handleAddPJ}
                onDeletePJ={handleDeletePJ}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isAddModalOpen={isAddTrxModalOpen}
                setIsAddModalOpen={setIsAddTrxModalOpen}
                userRole={userRole}
                showBalance={showBalance}
                setEditingTrx={setEditingTrx}
              />
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && userRole === 'admin' && (
            <div>
              <ReportsAndExport
                orgInfo={orgInfo}
                transactions={transactions}
                categories={categories}
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
              />
            </div>
          )}

          {/* SETTINGS TAB (Admin Only) */}
          {activeTab === 'settings' && userRole === 'admin' && (
            <div>
              <SettingsModal
                orgInfo={orgInfo}
                onSaveOrgInfo={(updated) => setOrgInfo(updated)}
                onResetData={handleResetData}
                userRole={userRole}
                adminPin={adminPin}
                onSaveAdminPin={(newPin) => setAdminPin(newPin)}
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                transactions={transactions}
                totalBalance={totalBalance}
                onAddTransaction={handleAddTransaction}
                pjs={pjs}
              />
            </div>
          )}
        </main>
      </div>

      {/* STANDALONE ADD/EDIT TRANSACTION MODAL */}
      <AddTransactionModal
        isOpen={isAddTrxModalOpen}
        onClose={() => {
          setIsAddTrxModalOpen(false);
          setEditingTrx(null);
        }}
        editingTrx={editingTrx}
        categories={categories}
        pjs={pjs}
        onAddPJ={handleAddPJ}
        onDeletePJ={handleDeletePJ}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={handleUpdateTransaction}
      />

      {/* FLOATING BOTTOM NAVIGATION DOCK (ALWAYS VISIBLE AT BOTTOM, z-50) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 no-print transition-all duration-300">
        {userRole === 'admin' ? (
          /* ADMIN MODE: 3-COLUMN GRID (Home - Plus - Laporan) */
          <div className="bottom-dock rounded-3xl py-2 px-3 grid grid-cols-3 items-center justify-items-center w-[92vw] max-w-xs">
            {/* Column 1: Home Tab */}
            <button
              onClick={() => {
                setIsAddTrxModalOpen(false);
                setEditingTrx(null);
                setActiveTab('overview');
              }}
              className={`
                flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all py-1.5 px-3 rounded-2xl w-full
                ${activeTab === 'overview'
                  ? 'text-emerald-300 font-extrabold bg-emerald-950/90 border border-emerald-800/80 shadow-md'
                  : 'text-emerald-500/70 hover:text-emerald-300'
                }
              `}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Home</span>
            </button>

            {/* Column 2: Center Floating Big Add Button */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setEditingTrx(null);
                setIsAddTrxModalOpen(!isAddTrxModalOpen);
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-emerald-950 flex items-center justify-center shadow-xl emerald-btn-glow hover:scale-105 active:scale-95 transition-all border-2 border-[#0B150F] flex-shrink-0"
              title="Tambah Transaksi Baru"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>

            {/* Column 3: Laporan & Cetak Tab */}
            <button
              onClick={() => {
                setIsAddTrxModalOpen(false);
                setEditingTrx(null);
                setActiveTab('reports');
              }}
              className={`
                flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all py-1.5 px-3 rounded-2xl w-full
                ${activeTab === 'reports'
                  ? 'text-emerald-300 font-extrabold bg-emerald-950/90 border border-emerald-800/80 shadow-md'
                  : 'text-emerald-500/70 hover:text-emerald-300'
                }
              `}
            >
              <FileText className="w-5 h-5" />
              <span>Laporan</span>
            </button>
          </div>
        ) : (
          /* USER MODE: NARROWED COMPACT CENTERED SINGLE BUTTON DOCK */
          <div className="bottom-dock rounded-3xl py-2 px-4 flex items-center justify-center shadow-xl">
            <button
              onClick={() => {
                setIsAddTrxModalOpen(false);
                setEditingTrx(null);
                setActiveTab('overview');
              }}
              className="flex items-center gap-2 text-xs font-extrabold text-emerald-300 py-2 px-5 rounded-2xl bg-emerald-950/90 border border-emerald-800/80 shadow-md"
            >
              <LayoutGrid className="w-5 h-5 text-emerald-400" />
              <span>Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
