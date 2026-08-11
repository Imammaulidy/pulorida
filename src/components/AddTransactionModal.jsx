import React, { useState, useEffect } from 'react';
import { X, UserPlus, ChevronDown, Trash2 } from 'lucide-react';

export default function AddTransactionModal({
  isOpen,
  onClose,
  editingTrx,
  categories = [],
  pjs = [],
  onAddPJ,
  onDeletePJ,
  onAddTransaction,
  onUpdateTransaction
}) {
  const [isCreatingNewPJ, setIsCreatingNewPJ] = useState(false);
  const [customPJInput, setCustomPJInput] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    wallet: '💵 Cash / Tunai',
    category: categories[0]?.name || 'Kas',
    description: '',
    amount: '',
    personInCharge: pjs[0] || 'Ahmad Rizky, S.E.',
    status: 'verified'
  });

  const walletOptions = [
    '💵 Cash / Tunai',
    '💳 Bank BCA',
    '📱 E-Wallet (GoPay/Shopee)'
  ];

  const formatSmartNominal = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('id-ID');
  };

  const parseRawDigits = (raw) => {
    if (!raw) return 0;
    const digits = String(raw).replace(/\D/g, '');
    return Number(digits) || 0;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (editingTrx) {
        setIsCreatingNewPJ(false);
        setCustomPJInput('');
        setFormData({
          date: editingTrx.date,
          type: editingTrx.type,
          wallet: editingTrx.wallet || '💵 Cash / Tunai',
          category: editingTrx.category || categories[0]?.name || 'Kas',
          description: editingTrx.description || '',
          amount: formatSmartNominal(editingTrx.amount),
          personInCharge: editingTrx.personInCharge || pjs[0] || 'Ahmad Rizky, S.E.',
          status: editingTrx.status || 'verified'
        });
      } else {
        setIsCreatingNewPJ(false);
        setCustomPJInput('');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          wallet: '💵 Cash / Tunai',
          category: categories[0]?.name || 'Kas',
          description: '',
          amount: '',
          personInCharge: pjs[0] || 'Ahmad Rizky, S.E.',
          status: 'verified'
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, editingTrx]);

  if (!isOpen) return null;

  const handlePJSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__CREATE_NEW_PJ__') {
      setIsCreatingNewPJ(true);
      setCustomPJInput('');
    } else {
      setIsCreatingNewPJ(false);
      setFormData({ ...formData, personInCharge: val });
    }
  };

  const handleSaveCustomPJ = () => {
    const trimmed = customPJInput.trim();
    if (trimmed) {
      onAddPJ(trimmed);
      setFormData({ ...formData, personInCharge: trimmed });
      setIsCreatingNewPJ(false);
      setCustomPJInput('');
    }
  };

  const handleDeleteCurrentPJ = () => {
    const targetPJ = formData.personInCharge;
    if (!targetPJ) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus PJ "${targetPJ}" dari daftar?`)) {
      onDeletePJ(targetPJ);
      const remaining = pjs.filter(p => p !== targetPJ);
      if (remaining.length > 0) {
        setFormData({ ...formData, personInCharge: remaining[0] });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseRawDigits(formData.amount);
    if (!numAmount || numAmount <= 0) {
      alert('Silakan masukkan jumlah nominal transaksi yang valid.');
      return;
    }

    let finalPJ = formData.personInCharge;
    if (isCreatingNewPJ && customPJInput.trim()) {
      finalPJ = customPJInput.trim();
      onAddPJ(finalPJ);
    }

    const payload = {
      id: editingTrx ? editingTrx.id : `trx-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      wallet: formData.wallet,
      category: formData.category || 'Kas',
      description: formData.description.trim() || (formData.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      amount: numAmount,
      personInCharge: finalPJ || 'Ahmad Rizky, S.E.',
      status: formData.status || 'verified'
    };

    if (editingTrx) {
      onUpdateTransaction(payload);
    } else {
      onAddTransaction(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-3 pt-16 pb-[85px] bg-black/80 backdrop-blur-sm animate-fade-in overflow-hidden">
      {/* Backdrop Overlay Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card Window - Pinned at Top (Overlaps Net Cashflow Card, High Above Bottom Dock) */}
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500/80 bg-[#122419] p-4 sm:p-5 shadow-2xl space-y-3 animate-slide-up max-h-[calc(100vh-150px)] flex flex-col z-10 my-0">
        
        {/* 1. Modal Drag Handle & Fixed Header */}
        <div className="flex-shrink-0 border-b border-emerald-900/60 pb-2.5">
          <div className="w-12 h-1 rounded-full bg-emerald-800/60 mx-auto mb-2 sm:hidden" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTrx ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h3>
              <p className="text-xs text-emerald-300/80">
                Catat pengeluaran atau pemasukan baru
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Form Fields (Middle) */}
        <form id="root-trx-form" onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1 pr-1 py-1">
          {/* Type Switcher Segment */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-emerald-950/90 border border-emerald-900/80">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`
                py-2 rounded-xl text-xs font-bold transition-all border
                ${formData.type === 'expense'
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-md'
                  : 'text-emerald-400/60 border-transparent hover:text-emerald-200'
                }
              `}
            >
              Pengeluaran
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`
                py-2 rounded-xl text-xs font-bold transition-all border
                ${formData.type === 'income'
                  ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500/50 shadow-md'
                  : 'text-emerald-400/60 border-transparent hover:text-emerald-200'
                }
              `}
            >
              Pemasukan
            </button>
          </div>

          {/* Field 1: DOMPET */}
          <div>
            <label className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block mb-1">
              DOMPET
            </label>
            <div className="relative">
              <select
                value={formData.wallet}
                onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {walletOptions.map((w, idx) => (
                  <option key={idx} value={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Field 2: JUMLAH (RP) */}
          <div>
            <label className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block mb-1">
              JUMLAH (RP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="25.000"
                value={formData.amount}
                onChange={(e) => {
                  const formatted = formatSmartNominal(e.target.value);
                  setFormData({ ...formData, amount: formatted });
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-sm font-bold text-white placeholder-emerald-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Field 3: KETERANGAN */}
          <div>
            <label className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block mb-1">
              KETERANGAN
            </label>
            <input
              type="text"
              placeholder="Kopi Starbucks, Gaji, Transfer..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Field 4: TANGGAL */}
          <div>
            <label className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block mb-1">
              TANGGAL
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Field 5: PENANGGUNG JAWAB (PJ) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                PENANGGUNG JAWAB (PJ)
              </label>
              {!isCreatingNewPJ && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewPJ(true)}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-200 flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Tambah Nama Baru</span>
                </button>
              )}
            </div>

            {isCreatingNewPJ ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Masukkan nama PJ baru..."
                  value={customPJInput}
                  onChange={(e) => setCustomPJInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-xs text-white placeholder-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomPJ}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewPJ(false)}
                  className="p-2 rounded-xl bg-emerald-950 text-emerald-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={formData.personInCharge}
                    onChange={handlePJSelectChange}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {pjs.map((pj, idx) => (
                      <option key={idx} value={pj}>{pj}</option>
                    ))}
                    <option value="__CREATE_NEW_PJ__" className="font-bold text-emerald-400">
                      ➕ Tambah Nama Baru...
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {pjs.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentPJ}
                    className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-900/60 text-rose-400 hover:text-rose-300 hover:bg-rose-900/60 transition-colors flex-shrink-0"
                    title={`Hapus PJ "${formData.personInCharge}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        {/* 3. FIXED FOOTER ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-emerald-900/80 flex-shrink-0 bg-[#122419]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/70 text-xs font-bold text-emerald-300 hover:bg-emerald-900 transition-all text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            form="root-trx-form"
            className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-emerald-950 shadow-lg shadow-emerald-500/25 transition-all text-center"
          >
            {editingTrx ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>

      </div>
    </div>
  );
}
