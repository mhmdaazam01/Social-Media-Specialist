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
import { useUser } from '@/lib/hooks/useUser';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePillars } from '@/lib/hooks/usePillars';
import { Trash2Icon, PlusIcon, SunIcon, MoonIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { profile, refreshProfile } = useUser();
  const { platforms, addPlatform, removePlatform } = usePlatforms();
  const { accounts, addAccount, removeAccount } = useAccounts();
  const { pillars, addPillar, removePillar } = usePillars();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [niche, setNiche] = useState(profile?.niche || '');

  const [platformName, setPlatformName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pillarLabel, setPillarLabel] = useState('');
  const [pillarColor, setPillarColor] = useState('#3B82F6');

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

  async function handleErModeChange(v: string) {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ er_mode: v as 'impression' | 'reach' | 'followers' })
      .eq('id', profile.id);
    if (error) {
      toast.error('Gagal memperbarui ER mode');
    } else {
      await refreshProfile();
      toast.success('ER mode berhasil diperbarui');
    }
  }

  async function handleThemeChange(theme: 'dark' | 'light') {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', profile.id);
    if (error) {
      toast.error('Gagal memperbarui tema');
    } else {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
      await refreshProfile();
      toast.success('Tema berhasil diperbarui');
    }
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
              <Select value={profile?.er_mode || 'impression'} onValueChange={handleErModeChange}>
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
              <Label>Tema</Label>
              <div className="flex gap-2">
                <Button
                  variant={profile?.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                >
                  <MoonIcon />
                  Dark
                </Button>
                <Button
                  variant={profile?.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
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
                    <span className="text-sm">{p.name}</span>
                    <Button variant="ghost" size="icon-xs" aria-label={`Hapus ${p.name}`} onClick={() => removePlatform(p.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex gap-2">
              <Input
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                placeholder="Nama platform (misal: Instagram)"
                onKeyDown={e => e.key === 'Enter' && handleAddPlatform()}
              />
              <Button variant="outline" onClick={handleAddPlatform}>
                <PlusIcon />
                Tambah
              </Button>
            </div>
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
                    <Button variant="ghost" size="icon-xs" aria-label={`Hapus ${a.name}`} onClick={() => removeAccount(a.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex gap-2">
              <Input
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Nama akun baru"
                onKeyDown={e => e.key === 'Enter' && handleAddAccount()}
              />
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
                    </div>
                    <Button variant="ghost" size="icon-xs" aria-label={`Hapus ${p.label}`} onClick={() => removePillar(p.id)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={pillarLabel}
                  onChange={e => setPillarLabel(e.target.value)}
                  placeholder="Edukasi"
                  onKeyDown={e => e.key === 'Enter' && handleAddPillar()}
                />
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
      </div>
    </AppShell>
  );
}
