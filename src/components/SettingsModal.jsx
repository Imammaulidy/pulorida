import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Building, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  Tag, 
  Trash2, 
  Plus,
  Bot,
  Sliders
} from 'lucide-react';
import BotHub from './BotHub';

export default function SettingsModal({ 
  orgInfo, 
  onSaveOrgInfo, 
  onResetData, 
  userRole, 
  adminPin, 
  onSaveAdminPin,
  categories = [],
  onAddCategory,
  onDeleteCategory,
  transactions = [],
  totalBalance = 0,
  onAddTransaction,
  pjs = []
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'bot'
  const [formData, setFormData] = useState({ ...orgInfo });
  const [pinValue, setPinValue] = useState(adminPin || '0000');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userRole === 'user') return;
    onSaveOrgInfo({
      ...formData,
      initialBalance: Number(formData.initialBalance)
    });
    if (onSaveAdminPin) {
      onSaveAdminPin(pinValue);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (onAddCategory) {
      onAddCategory({
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
        type: 'expense',
        color: '#22c55e'
      });
    }
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6">
      {/* TABS SWITCHER INSIDE SETTINGS */}
      <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all
            ${activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-emerald-400/70 hover:text-white bg-emerald-950/60'
            }
          `}
        >
          <Sliders className="w-4 h-4" />
          <span>Pengaturan Profil & PIN</span>
        </button>

        <button
          onClick={() => setActiveTab('bot')}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all
            ${activeTab === 'bot'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-emerald-400/70 hover:text-white bg-emerald-950/60'
            }
          `}
        >
          <Bot className="w-4 h-4 text-emerald-200" />
          <span>Bot Telegram & WA Automation</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & ADMIN SETTINGS */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 border border-emerald-800/60 bg-[#122419] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  Pengaturan Profil Organisasi & Keuangan
                </h3>
                <p className="text-xs text-emerald-300/80">Identitas organisasi, PIN Admin, dan saldo awal</p>
              </div>

              {userRole === 'user' ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hanya Admin yang dapat mengubah profil</span>
                </span>
              ) : isSaved ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 animate-fade-in">
                  ✓ Pengaturan Berhasil Disimpan!
                </span>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">Nama Organisasi</label>
                  <input
                    type="text"
                    required
                    disabled={userRole === 'user'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white focus:outline-none focus:border-emerald-500 font-bold disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">Sub-judul / Tagline</label>
                  <input
                    type="text"
                    required
                    disabled={userRole === 'user'}
                    value={formData.subTitle}
                    onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">Alamat Lengkap Sekretariat</label>
                  <input
                    type="text"
                    disabled={userRole === 'user'}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">Kontak Telepon / WhatsApp</label>
                  <input
                    type="text"
                    disabled={userRole === 'user'}
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">PIN Mode Admin</label>
                  <input
                    type="text"
                    maxLength="6"
                    disabled={userRole === 'user'}
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">Saldo Kas Awal Organisasi (RP)</label>
                  <input
                    type="number"
                    disabled={userRole === 'user'}
                    value={formData.initialBalance || 0}
                    onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="pt-3 border-t border-emerald-900/60 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onResetData}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold flex items-center gap-2 border border-rose-800/80 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Data Sampel</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: BOT TELEGRAM & WHATSAPP AUTOMATION (EMBEDDED INSIDE SETTINGS) */}
      {activeTab === 'bot' && (
        <div className="animate-fade-in">
          <BotHub
            onAddTransaction={onAddTransaction}
            totalBalance={totalBalance}
            transactions={transactions}
            categories={categories}
            pjs={pjs}
            orgInfo={orgInfo}
            userRole={userRole}
          />
        </div>
      )}
    </div>
  );
}
