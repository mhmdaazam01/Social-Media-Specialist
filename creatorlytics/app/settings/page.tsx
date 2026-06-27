'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { useUser } from '@/lib/hooks/useUser';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePillars } from '@/lib/hooks/usePillars';
import { useData } from '@/lib/context/DataContext';
import { Trash2Icon, PlusIcon, UserIcon, LayoutGridIcon, BellIcon, SunIcon, MoonIcon, AlertTriangleIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Tab = 'profile' | 'platforms' | 'notifications';

export default function SettingsPage() {
  const { profile, refreshProfile, setTheme } = useUser();
  const { platforms, addPlatform, removePlatform } = usePlatforms();
  const { accounts, addAccount, removeAccount } = useAccounts();
  const { pillars, addPillar, removePillar } = usePillars();
  const { factoryReset } = useData();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [niche, setNiche] = useState(profile?.niche || '');

  const [platformName, setPlatformName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pillarLabel, setPillarLabel] = useState('');
  const [pillarColor, setPillarColor] = useState('#3B82F6');

  // Notification settings (persisted in localStorage)
  const [notifGoal, setNotifGoal] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifReport, setNotifReport] = useState(false);

  useEffect(() => {
    const savedGoal = localStorage.getItem('cly_notif_goal');
    if (savedGoal !== null) setNotifGoal(savedGoal === 'true');
    const savedReminder = localStorage.getItem('cly_notif_reminder');
    if (savedReminder !== null) setNotifReminder(savedReminder === 'true');
    const savedReport = localStorage.getItem('cly_notif_report');
    if (savedReport !== null) setNotifReport(savedReport === 'true');
  }, []);

  const handleNotifGoal = () => { const next = !notifGoal; setNotifGoal(next); localStorage.setItem('cly_notif_goal', String(next)); };
  const handleNotifReminder = () => { const next = !notifReminder; setNotifReminder(next); localStorage.setItem('cly_notif_reminder', String(next)); };
  const handleNotifReport = () => { const next = !notifReport; setNotifReport(next); localStorage.setItem('cly_notif_report', String(next)); };

  async function handleSaveProfile() {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, niche })
      .eq('id', profile.id);
    if (error) {
      toast.error('Gagal memperbarui profil');
    } else {
      await refreshProfile();
      toast.success('Profil berhasil diperbarui');
    }
  }

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

  async function handleThemeChange(theme: 'dark' | 'light') {
    await setTheme(theme);
  }

  function handleAddPlatform() {
    if (!platformName.trim()) {
      toast.error('Nama platform wajib diisi');
      return;
    }
    const platformId = platformName.toLowerCase().replace(/\s+/g, '-');
    addPlatform({ platform_id: platformId, name: platformName, emoji: '' });
    setPlatformName('');
    toast.success('Platform berhasil ditambahkan');
  }

  function handleAddAccount() {
    if (!accountName.trim()) {
      toast.error('Nama akun wajib diisi');
      return;
    }
    addAccount(accountName);
    setAccountName('');
    toast.success('Akun berhasil ditambahkan');
  }

  function handleAddPillar() {
    if (!pillarLabel.trim()) {
      toast.error('Label pilar wajib diisi');
      return;
    }
    const pillarId = pillarLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    addPillar({
      pillar_id: pillarId,
      label: pillarLabel,
      emoji: '',
      color: pillarColor,
      bg: pillarColor + '20',
    });
    setPillarLabel('');
    setPillarColor('#3B82F6');
    toast.success('Pilar berhasil ditambahkan');
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
      window.location.href = '/login';
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
            {/* Basic Info */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-4 text-cly-base font-semibold text-cly-text">Informasi Dasar</h3>
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-cly-xs font-medium text-cly-text">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="h-[34px] rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                    placeholder="Nama kamu"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-cly-xs font-medium text-cly-text">Niche</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    className="h-[34px] rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                    placeholder="Contoh: Teknologi, Gaming, Kuliner"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="mt-1 self-start rounded-lg bg-cly-brand px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>

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

            {/* Tampilan / Theme */}
            <div className="rounded-[10px] bg-cly-surface p-[18px] shadow-cly">
              <h3 className="mb-2 text-cly-base font-semibold text-cly-text">Tampilan</h3>
              <p className="mb-4 text-cly-xs text-cly-text-muted">Pilih tema tampilan aplikasi</p>
              <div className="flex flex-col gap-2">
                {([
                  { value: 'light', label: 'Light Mode', desc: 'Tampilan terang, cocok untuk siang hari', Icon: SunIcon },
                  { value: 'dark', label: 'Dark Mode', desc: 'Tampilan gelap, nyaman di mata saat malam', Icon: MoonIcon },
                ] as const).map(({ value, label, desc, Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      profile?.theme === value
                        ? 'border-cly-brand bg-cly-brand/5'
                        : 'border-cly-border bg-cly-surface hover:border-cly-border-strong'
                    }`}
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${
                        profile?.theme === value ? 'bg-cly-brand text-white' : 'bg-cly-muted text-cly-text-muted'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-cly-sm font-medium text-cly-text">{label}</span>
                      <span className="text-cly-xs text-cly-text-muted">{desc}</span>
                    </div>
                    <div
                      className={`ml-auto size-4 rounded-full border-2 transition-all ${
                        profile?.theme === value
                          ? 'border-cly-brand bg-cly-brand'
                          : 'border-cly-border'
                      }`}
                    />
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
                      <button
                        onClick={() => removePlatform(p.id)}
                        className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                        aria-label={`Hapus ${p.name}`}
                      >
                        <Trash2Icon className="size-4" />
                      </button>
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
                  <PlusIcon className="size-4" />
                  Tambah
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
                      <button
                        onClick={() => removeAccount(a.id)}
                        className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                        aria-label={`Hapus ${a.name}`}
                      >
                        <Trash2Icon className="size-4" />
                      </button>
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
                  <PlusIcon className="size-4" />
                  Tambah
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
                      <button
                        onClick={() => removePillar(p.id)}
                        className="rounded-md p-1.5 text-cly-text-muted transition-colors hover:bg-cly-muted-2 hover:text-red-600"
                        aria-label={`Hapus ${p.label}`}
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="text"
                  value={pillarLabel}
                  onChange={e => setPillarLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPillar()}
                  className="h-[34px] rounded-lg border border-cly-border bg-cly-surface px-2.5 text-cly-sm text-cly-text outline-none transition-colors focus:border-cly-brand"
                  placeholder="Label pilar (misal: Edukasi)"
                />
                <input
                  type="color"
                  value={pillarColor}
                  onChange={e => setPillarColor(e.target.value)}
                  className="h-[34px] w-[60px] cursor-pointer rounded-lg border border-cly-border bg-cly-surface"
                />
                <button
                  onClick={handleAddPillar}
                  className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-3 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:bg-cly-brand hover:text-white active:scale-95"
                >
                  <PlusIcon className="size-4" />
                  Tambah Pilar
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
