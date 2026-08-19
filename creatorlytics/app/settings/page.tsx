'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { useUser } from '@/lib/hooks/useUser';
import { useTheme } from '@/lib/context/ThemeContext';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePillars } from '@/lib/hooks/usePillars';
import { useData } from '@/lib/context/DataContext';
import { Trash2Icon, PlusIcon, UserIcon, LayoutGridIcon, BellIcon, AlertTriangleIcon, PencilIcon, PaletteIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Tab = 'profile' | 'platforms' | 'appearance' | 'notifications';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  const { theme: currentTheme, setTheme: setThemeContext } = useTheme();
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

  // Notification settings (synced to Supabase profiles)
  const [notifGoal, setNotifGoal] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [notifCollab, setNotifCollab] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);

  // Appearance settings
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [dateFormat, setDateFormat] = useState<'DD/MM/YYYY' | 'MM/DD/YYYY'>('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState<'1,000' | '1.000'>('1.000');

  // Load notification prefs from profile (Supabase)
  useEffect(() => {
    if (!profile) return;
    const p = profile as unknown as Record<string, unknown>;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p.notif_goal !== undefined && p.notif_goal !== null) setNotifGoal(p.notif_goal as boolean);
    if (p.notif_reminder !== undefined && p.notif_reminder !== null) setNotifReminder(p.notif_reminder as boolean);
    if (p.notif_report !== undefined && p.notif_report !== null) setNotifReport(p.notif_report as boolean);
    if (p.notif_collab !== undefined && p.notif_collab !== null) setNotifCollab(p.notif_collab as boolean);
    if (p.notif_digest !== undefined && p.notif_digest !== null) setNotifDigest(p.notif_digest as boolean);
    
    // Load appearance prefs (theme is handled by ThemeContext)
    if (p.language !== undefined && p.language !== null) setLanguage(p.language as 'id' | 'en');
    if (p.date_format !== undefined && p.date_format !== null) setDateFormat(p.date_format as 'DD/MM/YYYY' | 'MM/DD/YYYY');
    if (p.number_format !== undefined && p.number_format !== null) setNumberFormat(p.number_format as '1,000' | '1.000');
  }, [profile]);

  async function updateNotifPref(field: string, value: boolean) {
    if (!profile) return;
    await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id);
    await refreshProfile();
  }

  async function updateAppearancePref(field: string, value: string) {
    if (!profile) return;
    await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id);
    await refreshProfile();
    toast.success('Pengaturan berhasil disimpan');
  }

  const handleNotifGoal = async () => { const next = !notifGoal; setNotifGoal(next); await updateNotifPref('notif_goal', next); };
  const handleNotifReminder = async () => { const next = !notifReminder; setNotifReminder(next); await updateNotifPref('notif_reminder', next); };
  const handleNotifReport = async () => { const next = !notifReport; setNotifReport(next); await updateNotifPref('notif_report', next); };
  const handleNotifCollab = async () => { const next = !notifCollab; setNotifCollab(next); await updateNotifPref('notif_collab', next); };
  const handleNotifDigest = async () => { const next = !notifDigest; setNotifDigest(next); await updateNotifPref('notif_digest', next); };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => { 
    await setThemeContext(newTheme);
    toast.success('Tema berhasil disimpan');
  };
  const handleLanguageChange = async (newLang: 'id' | 'en') => { 
    setLanguage(newLang); 
    await updateAppearancePref('language', newLang);
  };
  const handleDateFormatChange = async (format: 'DD/MM/YYYY' | 'MM/DD/YYYY') => { 
    setDateFormat(format); 
    await updateAppearancePref('date_format', format);
  };
  const handleNumberFormatChange = async (format: '1,000' | '1.000') => { 
    setNumberFormat(format); 
    await updateAppearancePref('number_format', format);
  };

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
      <style jsx global>{`
        .settings-typography h1,
        .settings-typography h2,
        .settings-typography h3,
        .settings-typography div[class*="font-bold"][class*="text-"],
        .settings-typography button[class*="font-bold"],
        .settings-typography button[class*="font-semibold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .settings-typography label[class*="font-medium"],
        .settings-typography span[class*="uppercase"][class*="tracking"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .settings-typography p,
        .settings-typography span:not([class*="font-bold"]):not([class*="font-semibold"]):not([class*="font-medium"]):not([class*="uppercase"]),
        .settings-typography div[class*="text-xs"]:not([class*="font-bold"]):not([class*="font-semibold"]),
        .settings-typography li {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-[18px] p-[18px] settings-typography">
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gradient-to-br from-cly-muted to-white p-1 border border-cly-border rounded-xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-cly-text shadow-sm'
                : 'bg-transparent text-cly-text-2 hover:text-cly-text'
            }`}
          >
            <UserIcon className="size-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'platforms'
                ? 'bg-white text-cly-text shadow-sm'
                : 'bg-transparent text-cly-text-2 hover:text-cly-text'
            }`}
          >
            <LayoutGridIcon className="size-4" />
            Platforms
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'appearance'
                ? 'bg-white text-cly-text shadow-sm'
                : 'bg-transparent text-cly-text-2 hover:text-cly-text'
            }`}
          >
            <PaletteIcon className="size-4" />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-white text-cly-text shadow-sm'
                : 'bg-transparent text-cly-text-2 hover:text-cly-text'
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
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 text-base font-bold text-cly-text">Engagement Rate Mode</h3>
              <p className="mb-4 text-xs text-cly-text-2">Pilih basis perhitungan ER di seluruh dashboard</p>
              <div className="flex flex-col gap-2">
                {(['impression', 'reach'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleErModeChange(mode)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      profile?.er_mode === mode
                        ? 'border-cly-brand bg-gradient-to-br from-cly-brand/10 to-white shadow-sm'
                        : 'border-cly-border bg-white hover:border-cly-brand/50 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full border-2 transition-all ${
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
                      <span className="text-sm font-bold capitalize text-cly-text">{mode}</span>
                      <span className="text-xs text-cly-text-2">
                        {mode === 'impression' && 'ER = (Engagement / Impression) × 100'}
                        {mode === 'reach' && 'ER = (Engagement / Reach) × 100'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zona Berbahaya */}
            <div className="rounded-2xl border-2 border-[#FFB5A0] bg-gradient-to-br from-[#FFB5A0]/10 to-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-[#B93B32]">
                <AlertTriangleIcon className="size-5" />
                Zona Berbahaya
              </h3>
              <p className="mb-4 text-xs text-[#B93B32]/80">
                Menghapus seluruh data (posts, platforms, pillars, dsb) milik Anda dari database. Tindakan ini permanen.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleFactoryReset}
                  className="rounded-lg bg-gradient-to-br from-[#FFB5A0] to-[#FF9680] px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
                >
                  Hapus Seluruh Data (Factory Reset)
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-lg bg-gradient-to-br from-[#B93B32] to-[#992B23] px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
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
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 text-base font-bold text-cly-text">Platform</h3>
              {platforms.length === 0 ? (
                <p className="mb-4 text-sm text-cly-text-2">Belum ada platform.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {platforms.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-cly-border bg-gradient-to-br from-cly-muted to-white px-3.5 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-cly-text">{p.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPlatform(p.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#8EC5FC] hover:to-[#6BA3E8] hover:text-white"
                          aria-label={`Edit ${p.name}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removePlatform(p.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#FFB5A0] hover:to-[#FF9680] hover:text-white"
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
                  className="h-9 flex-1 rounded-lg border border-cly-border bg-white px-3 text-sm text-cly-text outline-none transition-all focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20"
                  placeholder="Nama platform (misal: Instagram)"
                />
                <button
                  onClick={handleAddPlatform}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
                >
                  {editingPlatformId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingPlatformId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Accounts */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 text-base font-bold text-cly-text">Akun</h3>
              {accounts.length === 0 ? (
                <p className="mb-4 text-sm text-cly-text-2">Belum ada akun.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {accounts.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl border border-cly-border bg-gradient-to-br from-cly-muted to-white px-3.5 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-cly-text">{a.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAccount(a.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#8EC5FC] hover:to-[#6BA3E8] hover:text-white"
                          aria-label={`Edit ${a.name}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removeAccount(a.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#FFB5A0] hover:to-[#FF9680] hover:text-white"
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
                  className="h-9 flex-1 rounded-lg border border-cly-border bg-white px-3 text-sm text-cly-text outline-none transition-all focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20"
                  placeholder="Nama akun baru"
                />
                <button
                  onClick={handleAddAccount}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
                >
                  {editingAccountId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingAccountId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Content Pillars */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 text-base font-bold text-cly-text">Pilar Konten</h3>
              {pillars.length === 0 ? (
                <p className="mb-4 text-sm text-cly-text-2">Belum ada pilar konten.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {pillars.map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-cly-border bg-gradient-to-br from-cly-muted to-white px-3.5 py-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-sm font-semibold text-cly-text">{p.label}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPillar(p.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#8EC5FC] hover:to-[#6BA3E8] hover:text-white"
                          aria-label={`Edit ${p.label}`}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removePillar(p.id)}
                          className="rounded-lg p-2 text-cly-text-2 transition-all hover:bg-gradient-to-br hover:from-[#FFB5A0] hover:to-[#FF9680] hover:text-white"
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
                  className="h-9 flex-1 rounded-lg border border-cly-border bg-white px-3 text-sm text-cly-text outline-none transition-all focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20"
                  placeholder="Label pilar (misal: Edukasi)"
                />
                <button
                  onClick={handleAddPillar}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
                >
                  {editingPillarId ? <PencilIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  {editingPillarId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-[18px]">
            {/* Theme Mode */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 text-base font-bold text-cly-text">Theme Mode</h3>
              <p className="mb-4 text-xs text-cly-text-2">Pilih tema tampilan aplikasi</p>
              <div className="flex flex-col gap-2">
                {(['light', 'dark', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleThemeChange(mode)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      currentTheme === mode
                        ? 'border-cly-brand bg-gradient-to-br from-cly-brand/10 to-white shadow-sm'
                        : 'border-cly-border bg-white hover:border-cly-brand/50 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full border-2 transition-all ${
                        currentTheme === mode
                          ? 'border-cly-brand bg-cly-brand'
                          : 'border-cly-border'
                      }`}
                    >
                      {currentTheme === mode && (
                        <div className="size-full rounded-full bg-white p-0.5">
                          <div className="size-full rounded-full bg-cly-brand" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold capitalize text-cly-text">
                        {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto (System)'}
                      </span>
                      <span className="text-xs text-cly-text-2">
                        {mode === 'light' && 'Tampilan terang untuk siang hari'}
                        {mode === 'dark' && 'Tampilan gelap untuk malam hari'}
                        {mode === 'auto' && 'Ikuti pengaturan sistem'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 text-base font-bold text-cly-text">Language</h3>
              <p className="mb-4 text-xs text-cly-text-2">Pilih bahasa tampilan aplikasi</p>
              <div className="flex flex-col gap-2">
                {(['id', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      language === lang
                        ? 'border-cly-brand bg-gradient-to-br from-cly-brand/10 to-white shadow-sm'
                        : 'border-cly-border bg-white hover:border-cly-brand/50 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full border-2 transition-all ${
                        language === lang
                          ? 'border-cly-brand bg-cly-brand'
                          : 'border-cly-border'
                      }`}
                    >
                      {language === lang && (
                        <div className="size-full rounded-full bg-white p-0.5">
                          <div className="size-full rounded-full bg-cly-brand" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-cly-text">
                        {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
                      </span>
                      <span className="text-xs text-cly-text-2">
                        {lang === 'id' && 'Tampilan dalam Bahasa Indonesia'}
                        {lang === 'en' && 'Display in English'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Number Formats */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h3 className="mb-2 text-base font-bold text-cly-text">Date & Number Formats</h3>
              <p className="mb-4 text-xs text-cly-text-2">Atur format tampilan tanggal dan angka</p>
              
              {/* Date Format */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold text-cly-text">Format Tanggal</label>
                <div className="flex flex-col gap-2">
                  {(['DD/MM/YYYY', 'MM/DD/YYYY'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => handleDateFormatChange(format)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        dateFormat === format
                          ? 'border-cly-brand bg-gradient-to-br from-cly-brand/10 to-white shadow-sm'
                          : 'border-cly-border bg-white hover:border-cly-brand/50 hover:shadow-sm'
                      }`}
                    >
                      <div
                        className={`size-4 rounded-full border-2 transition-all ${
                          dateFormat === format
                            ? 'border-cly-brand bg-cly-brand'
                            : 'border-cly-border'
                        }`}
                      >
                        {dateFormat === format && (
                          <div className="size-full rounded-full bg-white p-0.5">
                            <div className="size-full rounded-full bg-cly-brand" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-cly-text">{format}</span>
                        <span className="text-xs text-cly-text-2">
                          {format === 'DD/MM/YYYY' && 'Contoh: 15/08/2026'}
                          {format === 'MM/DD/YYYY' && 'Contoh: 08/15/2026'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Format */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-cly-text">Format Angka</label>
                <div className="flex flex-col gap-2">
                  {(['1,000', '1.000'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => handleNumberFormatChange(format)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        numberFormat === format
                          ? 'border-cly-brand bg-gradient-to-br from-cly-brand/10 to-white shadow-sm'
                          : 'border-cly-border bg-white hover:border-cly-brand/50 hover:shadow-sm'
                      }`}
                    >
                      <div
                        className={`size-4 rounded-full border-2 transition-all ${
                          numberFormat === format
                            ? 'border-cly-brand bg-cly-brand'
                            : 'border-cly-border'
                        }`}
                      >
                        {numberFormat === format && (
                          <div className="size-full rounded-full bg-white p-0.5">
                            <div className="size-full rounded-full bg-cly-brand" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-cly-text">{format}</span>
                        <span className="text-xs text-cly-text-2">
                          {format === '1,000' && 'Contoh: 1,000,000'}
                          {format === '1.000' && 'Contoh: 1.000.000'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <h3 className="mb-2 text-base font-bold text-cly-text">Preferensi Notifikasi</h3>
            <p className="mb-4 text-xs text-cly-text-2">Atur notifikasi yang ingin kamu terima</p>
            <div className="flex flex-col gap-3">
              {/* Goal Updates */}
              <div className="flex items-center justify-between rounded-xl border border-cly-border p-3.5 hover:border-cly-brand/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-cly-text">Goal Updates</span>
                  <span className="text-xs text-cly-text-2">Notifikasi saat goal hampir tercapai atau butuh perhatian</span>
                </div>
                <button
                  onClick={handleNotifGoal}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifGoal ? 'bg-gradient-to-br from-cly-brand to-cly-brand-2' : 'bg-cly-muted'
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
              <div className="flex items-center justify-between rounded-xl border border-cly-border p-3.5 hover:border-cly-brand/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-cly-text">Content Reminders</span>
                  <span className="text-xs text-cly-text-2">Ingatkan konten yang perlu diposting hari ini</span>
                </div>
                <button
                  onClick={handleNotifReminder}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifReminder ? 'bg-gradient-to-br from-cly-brand to-cly-brand-2' : 'bg-cly-muted'
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
              <div className="flex items-center justify-between rounded-xl border border-cly-border p-3.5 hover:border-cly-brand/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-cly-text">Monthly Reports</span>
                  <span className="text-xs text-cly-text-2">Kirim laporan bulanan otomatis ke email</span>
                </div>
                <button
                  onClick={handleNotifReport}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifReport ? 'bg-gradient-to-br from-cly-brand to-cly-brand-2' : 'bg-cly-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifReport ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Collaboration Notifications */}
              <div className="flex items-center justify-between rounded-xl border border-cly-border p-3.5 hover:border-cly-brand/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-cly-text">Collaboration Notifications</span>
                  <span className="text-xs text-cly-text-2">Notifikasi saat ada yang membagikan workspace dengan Anda</span>
                </div>
                <button
                  onClick={handleNotifCollab}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifCollab ? 'bg-gradient-to-br from-cly-brand to-cly-brand-2' : 'bg-cly-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifCollab ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Daily Digest */}
              <div className="flex items-center justify-between rounded-xl border border-cly-border p-3.5 hover:border-cly-brand/50 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-cly-text">Daily Digest</span>
                  <span className="text-xs text-cly-text-2">Ringkasan harian performa kemarin dikirim setiap pagi</span>
                </div>
                <button
                  onClick={handleNotifDigest}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifDigest ? 'bg-gradient-to-br from-cly-brand to-cly-brand-2' : 'bg-cly-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifDigest ? 'translate-x-5' : 'translate-x-0.5'
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
