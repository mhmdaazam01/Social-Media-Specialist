'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { useUser } from '@/lib/hooks/useUser';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePillars } from '@/lib/hooks/usePillars';
import { useData } from '@/lib/context/DataContext';
import { Trash2Icon, PlusIcon, UserIcon, LayoutGridIcon, BellIcon, AlertTriangleIcon, PencilIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Tab = 'profile' | 'platforms' | 'notifications';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  const { platforms, addPlatform, removePlatform, updatePlatform } = usePlatforms();
  const { accounts, addAccount, removeAccount, updateAccount } = useAccounts();
  const { pillars, addPillar, removePillar, updatePillar } = usePillars();
  const { factoryReset } = useData();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [platformName, setPlatformName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pillarLabel, setPillarLabel] = useState('');

  // Edit states
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);

  // Notification settings (persisted in localStorage)
  const [notifGoal, setNotifGoal] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifReport, setNotifReport] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const savedGoal = localStorage.getItem('cly_notif_goal');
      if (savedGoal !== null) setNotifGoal(savedGoal === 'true');
      const savedReminder = localStorage.getItem('cly_notif_reminder');
      if (savedReminder !== null) setNotifReminder(savedReminder === 'true');
      const savedReport = localStorage.getItem('cly_notif_report');
      if (savedReport !== null) setNotifReport(savedReport === 'true');
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleNotifGoal = () => { const next = !notifGoal; setNotifGoal(next); localStorage.setItem('cly_notif_goal', String(next)); };
  const handleNotifReminder = () => { const next = !notifReminder; setNotifReminder(next); localStorage.setItem('cly_notif_reminder', String(next)); };
  const handleNotifReport = () => { const next = !notifReport; setNotifReport(next); localStorage.setItem('cly_notif_report', String(next)); };

  async function handleErModeChange(mode: 'impression' | 'reach' | 'followers') {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ er_mode: mode })
      .eq('id', profile.id);
    if (error) {
      toast.error('Gagal memperbarui ER mode');
    } else {
      await refreshProfile();
      toast.success('ER mode berhasil diperbarui');
    }
  }

  function handleEditPlatform(id: string) {
    const platform = platforms.find(p => p.id === id);
    if (platform) {
      setPlatformName(platform.name);
      setEditingPlatformId(id);
    }
  }

  function handleEditAccount(id: string) {
    const account = accounts.find(a => a.id === id);
    if (account) {
      setAccountName(account.name);
      setEditingAccountId(id);
    }
  }

  function handleEditPillar(id: string) {
    const pillar = pillars.find(p => p.id === id);
    if (pillar) {
      setPillarLabel(pillar.label);
      setEditingPillarId(id);
    }
  }

  function handleAddPlatform() {
    if (!platformName.trim()) {
      toast.error('Nama platform wajib diisi');
      return;
    }
    if (editingPlatformId) {
      // Update existing platform
      updatePlatform(editingPlatformId, { name: platformName });
      setEditingPlatformId(null);
      toast.success('Platform berhasil diperbarui');
    } else {
      // Add new platform
      const platformId = platformName.toLowerCase().replace(/\s+/g, '-');
      addPlatform({ platform_id: platformId, name: platformName, emoji: '' });
      toast.success('Platform berhasil ditambahkan');
    }
    setPlatformName('');
  }

  function handleAddAccount() {
    if (!accountName.trim()) {
      toast.error('Nama akun wajib diisi');
      return;
    }
    if (editingAccountId) {
      // Update existing account
      updateAccount(editingAccountId, { name: accountName });
      setEditingAccountId(null);
      toast.success('Akun berhasil diperbarui');
    } else {
      // Add new account
      addAccount(accountName);
      toast.success('Akun berhasil ditambahkan');
    }
    setAccountName('');
  }

  function handleAddPillar() {
    if (!pillarLabel.trim()) {
      toast.error('Label pilar wajib diisi');
      return;
    }
    
    // Default colors array
    const DEFAULT_COLORS = ['#2F6F45', '#2563A7', '#A15C07', '#B93B32', '#7C4D9D', '#13747C'];
    const pillarColor = DEFAULT_COLORS[pillars.length % DEFAULT_COLORS.length];
    
    if (editingPillarId) {
      // Update existing pillar (keep existing color)
      const existingPillar = pillars.find(p => p.id === editingPillarId);
      updatePillar(editingPillarId, {
        label: pillarLabel,
        color: existingPillar?.color || pillarColor,
        bg: (existingPillar?.color || pillarColor) + '20',
      });
      setEditingPillarId(null);
      toast.success('Pilar berhasil diperbarui');
    } else {
      // Add new pillar with auto color
      const pillarId = pillarLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      addPillar({
        pillar_id: pillarId,
        label: pillarLabel,
        emoji: '',
        color: pillarColor,
        bg: pillarColor + '20',
      });
      toast.success('Pilar berhasil ditambahkan');
    }
    setPillarLabel('');
  }

  async function handleFactoryReset() {
    if (confirm('APAKAH ANDA YAKIN? Semua data Anda akan dihapus permanen!')) {
      await factoryReset();
      toast.success('Semua data berhasil direset');
      await refreshProfile();
    }
  }

  async function handleDeleteAccount() {
    if (confirm('APAKAH ANDA YAKIN? Tindakan ini akan menghapus semua data Anda dan mengeluarkan Anda dari aplikasi secara permanen.')) {
      await factoryReset();
      await supabase.auth.signOut();
      router.push('/login');
    }
  }

  return (
    <AppShell title="Settings">
      <div className="flex flex-col gap-[18px] p-[18px]">
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-[10px] bg-cly-muted p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-cly-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-cly-surface text-cly-text shadow-cly'
                : 'text-cly-text-muted hover:text-cly-text'
            }`}
          >
            <UserIcon className="size-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-cly-sm font-medium transition-all ${
              activeTab === 'platforms'
                ? 'bg-cly-surface text-cly-text shadow-cly'
                : 'text-cly-text-muted hover:text-cly-text'
            }`}
          >
            <LayoutGridIcon className="size-4" />
            Platforms
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-cly-sm font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-cly-surface text-cly-text shadow-cly'
                : 'text-cly-text-muted hover:text-cly-text'
            }`}
          >
            <BellIcon className="size-4" />
            Notifications
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-[18px]">
            {/* ER Mode Selector */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-2 text-cly-base font-semibold text-cly-text">Engagement Rate Mode</h3>
              <p className="mb-4 text-cly-xs text-cly-text-muted">Pilih basis perhitungan ER di seluruh dashboard</p>
              <div className="flex flex-col gap-2">
                {(['impression', 'reach'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleErModeChange(mode)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      profile?.er_mode === mode
                        ? 'border-cly-brand bg-cly-brand/5'
                        : 'border-cly-border bg-cly-surface hover:border-cly-border-hover'
                    }`}
                  >
                    <div
                      className={`size-4 rounded-full border-2 transition-all ${
                        profile?.er_mode === mode
                          ? 'border-cly-brand bg-cly-brand'
                          : 'border-cly-border'
                      }`}
                    >
                      {profile?.er_mode === mode && (
                        <div className="size-full rounded-full bg-white p-0.5">
                          <div className="size-full rounded-full bg-cly-brand" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-cly-sm font-medium capitalize text-cly-text">{mode}</span>
                      <span className="text-cly-xs text-cly-text-muted">
                        {mode === 'impression' && 'ER = (Engagement / Impression) × 100'}
                        {mode === 'reach' && 'ER = (Engagement / Reach) × 100'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zona Berbahaya */}
            <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-[18px]">
              <h3 className="mb-2 flex items-center gap-2 text-cly-base font-semibold text-red-600">
                <AlertTriangleIcon className="size-4" />
                Zona Berbahaya
              </h3>
              <p className="mb-4 text-cly-xs text-red-600/80">
                Menghapus seluruh data (posts, platforms, pillars, dsb) milik Anda dari database. Tindakan ini permanen.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleFactoryReset}
                  className="rounded-lg bg-red-600 px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-red-700 active:scale-95"
                >
                  Hapus Seluruh Data (Factory Reset)
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-lg bg-red-900 px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-red-950 active:scale-95"
                >
                  Hapus Akun Saya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORMS TAB */}
        {activeTab === 'platforms' && (
          <div className="flex flex-col gap-[18px]">
            {/* Platforms */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-4 text-cly-base font-semibold text-cly-text">Platform</h3>
              {platforms.length === 0 ? (
                <p className="mb-4 text-cly-sm text-cly-text-muted">Belum ada platform.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {platforms.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-cly-border bg-cly-muted px-3 py-2.5">
                      <span className="text-cly-sm text-cly-text">{p.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPlatform(p.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-cly-brand"
                          aria-label={`Edit ${p.name}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removePlatform(p.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                          aria-label={`Hapus ${p.name}`}
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPlatform()}
                  className="h-[34px] flex-1 rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                  placeholder="Nama platform (misal: Instagram)"
                />
                <button
                  onClick={handleAddPlatform}
                  className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-3 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:bg-cly-brand hover:text-white active:scale-95"
                >
                  {editingPlatformId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingPlatformId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Accounts */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-4 text-cly-base font-semibold text-cly-text">Akun</h3>
              {accounts.length === 0 ? (
                <p className="mb-4 text-cly-sm text-cly-text-muted">Belum ada akun.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {accounts.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-cly-border bg-cly-muted px-3 py-2.5">
                      <span className="text-cly-sm text-cly-text">{a.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAccount(a.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-cly-brand"
                          aria-label={`Edit ${a.name}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removeAccount(a.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                          aria-label={`Hapus ${a.name}`}
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddAccount()}
                  className="h-[34px] flex-1 rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                  placeholder="Nama akun baru"
                />
                <button
                  onClick={handleAddAccount}
                  className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-3 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:bg-cly-brand hover:text-white active:scale-95"
                >
                  {editingAccountId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingAccountId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Content Pillars */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-4 text-cly-base font-semibold text-cly-text">Pilar Konten</h3>
              {pillars.length === 0 ? (
                <p className="mb-4 text-cly-sm text-cly-text-muted">Belum ada pilar konten.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {pillars.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-cly-border bg-cly-muted px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-cly-sm text-cly-text">{p.label}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPillar(p.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-cly-brand"
                          aria-label={`Edit ${p.label}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removePillar(p.id)}
                          className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                          aria-label={`Hapus ${p.label}`}
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pillarLabel}
                  onChange={e => setPillarLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPillar()}
                  className="h-[34px] flex-1 rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                  placeholder="Label pilar (misal: Edukasi)"
                />
                <button
                  onClick={handleAddPillar}
                  className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-3 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:bg-cly-brand hover:text-white active:scale-95"
                >
                  {editingPillarId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingPillarId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
            <h3 className="mb-2 text-cly-base font-semibold text-cly-text">Preferensi Notifikasi</h3>
            <p className="mb-4 text-cly-xs text-cly-text-muted">Atur notifikasi yang ingin kamu terima</p>
            <div className="flex flex-col gap-3.5">
              {/* Goal Updates */}
              <div className="flex items-center justify-between rounded-lg border border-cly-border p-3">
                <div className="flex flex-col">
                  <span className="text-cly-sm font-medium text-cly-text">Goal Updates</span>
                  <span className="text-cly-xs text-cly-text-muted">Notifikasi saat goal hampir tercapai atau butuh perhatian</span>
                </div>
                <button
                  onClick={handleNotifGoal}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifGoal ? 'bg-cly-brand' : 'bg-cly-muted-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifGoal ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Content Reminders */}
              <div className="flex items-center justify-between rounded-lg border border-cly-border p-3">
                <div className="flex flex-col">
                  <span className="text-cly-sm font-medium text-cly-text">Content Reminders</span>
                  <span className="text-cly-xs text-cly-text-muted">Ingatkan konten yang perlu diposting hari ini</span>
                </div>
                <button
                  onClick={handleNotifReminder}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifReminder ? 'bg-cly-brand' : 'bg-cly-muted-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifReminder ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Monthly Reports */}
              <div className="flex items-center justify-between rounded-lg border border-cly-border p-3">
                <div className="flex flex-col">
                  <span className="text-cly-sm font-medium text-cly-text">Monthly Reports</span>
                  <span className="text-cly-xs text-cly-text-muted">Kirim laporan bulanan otomatis ke email</span>
                </div>
                <button
                  onClick={handleNotifReport}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifReport ? 'bg-cly-brand' : 'bg-cly-muted-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifReport ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
