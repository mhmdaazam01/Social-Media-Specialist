'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSettingsStore } from '@/lib/store/settings-store';
import { usePlatformStore } from '@/lib/store/platform-store';
import { useAccountStore } from '@/lib/store/account-store';
import { usePillarStore } from '@/lib/store/pillar-store';
import { useCompetitorStore } from '@/lib/store/competitor-store';
import { usePostStore } from '@/lib/store/post-store';
import { useGoalStore } from '@/lib/store/goal-store';
import { useIdeaStore } from '@/lib/store/idea-store';
import { useEventStore } from '@/lib/store/event-store';
import { exportToJSON, importFromJSON } from '@/lib/utils/export';
import { createClient } from '@/lib/supabase/client';
import { Trash2Icon, PlusIcon, DownloadIcon, UploadIcon, SunIcon, MoonIcon, CloudDownloadIcon } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { platforms, addPlatform, removePlatform } = usePlatformStore();
  const { accounts, addAccount, removeAccount } = useAccountStore();
  const { pillars, addPillar, removePillar } = usePillarStore();
  const syncPosts = usePostStore(s => s.syncFromSupabase);
  const syncGoals = useGoalStore(s => s.syncFromSupabase);
  const syncIdeas = useIdeaStore(s => s.syncFromSupabase);
  const syncEvents = useEventStore(s => s.syncFromSupabase);
  const syncCompetitors = useCompetitorStore(s => s.syncFromSupabase);
  const syncPlatforms = usePlatformStore(s => s.syncFromSupabase);
  const syncAccounts = useAccountStore(s => s.syncFromSupabase);
  const syncPillars = usePillarStore(s => s.syncFromSupabase);
  const importRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(settings.display_name);
  const [niche, setNiche] = useState(settings.niche);

  const [platformId, setPlatformId] = useState('');
  const [platformName, setPlatformName] = useState('');

  const [accountName, setAccountName] = useState('');

  const [pillarId, setPillarId] = useState('');
  const [pillarLabel, setPillarLabel] = useState('');
  const [pillarColor, setPillarColor] = useState('#3B82F6');

  async function syncProfileToSupabase(overrides?: Partial<typeof settings>) {
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      display_name: displayName,
      niche,
      er_mode: settings.er_mode,
      theme: settings.theme,
      ...overrides,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  }

  async function handleSaveProfile() {
    updateSettings({ display_name: displayName, niche });
    await syncProfileToSupabase();
    toast.success('Profil berhasil diperbarui');
  }

  function handleAddPlatform() {
    if (!platformId.trim() || !platformName.trim()) {
      toast.error('Platform ID dan Nama wajib diisi');
      return;
    }
    addPlatform({ platform_id: platformId, name: platformName, emoji: '' });
    setPlatformId('');
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
    if (!pillarId.trim() || !pillarLabel.trim()) {
      toast.error('Pilar ID dan Label wajib diisi');
      return;
    }
    addPillar({
      pillar_id: pillarId,
      label: pillarLabel,
      emoji: '',
      color: pillarColor,
      bg: pillarColor + '20',
    });
    setPillarId('');
    setPillarLabel('');
    setPillarColor('#3B82F6');
    toast.success('Pilar berhasil ditambahkan');
  }

  function handleExport() {
    const { posts } = usePostStore.getState();
    const { goals } = useGoalStore.getState();
    const { ideas } = useIdeaStore.getState();
    const { events } = useEventStore.getState();
    const { competitors } = useCompetitorStore.getState();

    const data = { posts, goals, ideas, events, competitors };
    exportToJSON(data, 'creatorlytics-data');
    toast.success('Data berhasil diexport');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = (await importFromJSON(file)) as Record<string, unknown>;
      let count = 0;
      if (Array.isArray(data.posts)) {
        usePostStore.getState().importPosts(data.posts as never);
        count += data.posts.length;
      }
      if (Array.isArray(data.goals)) {
        for (const g of data.goals) { useGoalStore.getState().createGoal(g as never); count++; }
      }
      if (Array.isArray(data.ideas)) {
        for (const i of data.ideas) { useIdeaStore.getState().createIdea(i as never); count++; }
      }
      if (Array.isArray(data.events)) {
        for (const e of data.events) { useEventStore.getState().createEvent(e as never); count++; }
      }
      if (Array.isArray(data.competitors)) {
        for (const c of data.competitors) { useCompetitorStore.getState().createCompetitor(c as never); count++; }
      }
      toast.success(`${count} data berhasil diimport`);
    } catch {
      toast.error('Gagal mengimport data. Pastikan file JSON valid.');
    }
    if (importRef.current) importRef.current.value = '';
  }

  async function handleSyncFromCloud() {
    const supabase = createClient();
    if (!supabase) {
      toast.error('Supabase tidak tersedia');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Login dulu untuk sync');
      return;
    }

    const uid = user.id;

    const errors: string[] = [];

    // Push local → Supabase
    const push = async (table: string, rows: unknown[]) => {
      if (!rows.length) return;
      const { error } = await supabase.from(table).upsert(
        (rows as Record<string, unknown>[]).map(r => ({ ...r, user_id: uid })),
        { onConflict: 'id' }
      );
      if (error) errors.push(`Push ${table}: ${error.message}`);
    };

    await Promise.all([
      push('posts', usePostStore.getState().posts),
      push('goals', useGoalStore.getState().goals),
      push('content_ideas', useIdeaStore.getState().ideas),
      push('calendar_events', useEventStore.getState().events),
      push('competitors', useCompetitorStore.getState().competitors),
      push('accounts', useAccountStore.getState().accounts),
      push('platforms', usePlatformStore.getState().platforms),
      push('pillars', usePillarStore.getState().pillars),
    ]);

    // Pull Supabase → local
    const pull = async (name: string, fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (e) {
        errors.push(`Pull ${name}: ${String(e)}`);
      }
    };

    await Promise.all([
      pull('posts', syncPosts),
      pull('goals', syncGoals),
      pull('ideas', syncIdeas),
      pull('events', syncEvents),
      pull('competitors', syncCompetitors),
      pull('platforms', syncPlatforms),
      pull('accounts', syncAccounts),
      pull('pillars', syncPillars),
    ]);

    if (errors.length) {
      toast.error(`Sync gagal:\n${errors.join('\n')}`);
    } else {
      toast.success('Data berhasil disinkron dari cloud');
    }
  }

  return (
    <AppShell title="Pengaturan">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {/* Profil */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Profil</h3>
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="niche">Niche</Label>
              <Input id="niche" value={niche} onChange={e => setNiche(e.target.value)} placeholder="Contoh: Teknologi, Gaming, Kuliner" />
            </div>
            <Button className="self-start" onClick={handleSaveProfile}>Simpan</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Tampilan */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Tampilan</h3>
            <div className="grid gap-2">
              <Label>ER Mode</Label>
              <Select value={settings.er_mode} onValueChange={async v => { updateSettings({ er_mode: v as 'impression' | 'reach' | 'followers' }); await syncProfileToSupabase({ er_mode: v as 'impression' | 'reach' | 'followers' }); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impression">Impression</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    onClick={async () => { updateSettings({ theme: 'dark' }); await syncProfileToSupabase({ theme: 'dark' }); }}
                  >
                    <MoonIcon />
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    onClick={async () => { updateSettings({ theme: 'light' }); await syncProfileToSupabase({ theme: 'light' }); }}
                  >
                    <SunIcon />
                    Light
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Platform */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Platform</h3>
            {platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada platform.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {platforms.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-sm">
                      {p.name} <span className="text-xs text-muted-foreground">({p.platform_id})</span>
                    </span>
                    <Button variant="ghost" size="icon-xs" onClick={() => removePlatform(p.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">Platform ID</Label>
                <Input value={platformId} onChange={e => setPlatformId(e.target.value)} placeholder="ig" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Nama</Label>
                <Input value={platformName} onChange={e => setPlatformName(e.target.value)} placeholder="Instagram" />
              </div>
            </div>
            <Button variant="outline" className="self-start" onClick={handleAddPlatform}>
              <PlusIcon />
              Tambah Platform
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Akun */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Akun</h3>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada akun.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {accounts.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-sm">{a.name}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeAccount(a.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex gap-2">
              <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Nama akun baru" />
              <Button variant="outline" onClick={handleAddAccount}>
                <PlusIcon />
                Tambah
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Pilar Konten */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Pilar Konten</h3>
            {pillars.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pilar konten.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pillars.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm">{p.label}</span>
                      <span className="text-xs text-muted-foreground">({p.pillar_id})</span>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => removePillar(p.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">Pillar ID</Label>
                <Input value={pillarId} onChange={e => setPillarId(e.target.value)} placeholder="educational" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Label</Label>
                <Input value={pillarLabel} onChange={e => setPillarLabel(e.target.value)} placeholder="Edukasi" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Warna</Label>
                <Input type="color" value={pillarColor} onChange={e => setPillarColor(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" className="self-start" onClick={handleAddPillar}>
              <PlusIcon />
              Tambah Pilar
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Data */}
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-medium">Data</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport}>
                <DownloadIcon />
                Export All Data
              </Button>
              <Button variant="outline" onClick={handleSyncFromCloud}>
                <CloudDownloadIcon />
                Sync dari Cloud
              </Button>
              <Button variant="outline" onClick={() => importRef.current?.click()}>
                <UploadIcon />
                Import Data
              </Button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
