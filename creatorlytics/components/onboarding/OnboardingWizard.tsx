'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { useData } from '@/lib/context/DataContext';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layers,
  Plus,
  Smartphone,
  Sparkles,
  User,
  X,
} from 'lucide-react';

// --- Preset data ---
const PRESET_PLATFORMS = [
  { platform_id: 'instagram', name: 'Instagram', emoji: '📸' },
  { platform_id: 'tiktok', name: 'TikTok', emoji: '🎵' },
  { platform_id: 'youtube', name: 'YouTube', emoji: '▶️' },
  { platform_id: 'twitter', name: 'Twitter / X', emoji: '🐦' },
  { platform_id: 'linkedin', name: 'LinkedIn', emoji: '💼' },
  { platform_id: 'facebook', name: 'Facebook', emoji: '📘' },
  { platform_id: 'threads', name: 'Threads', emoji: '🧵' },
];

const PRESET_NICHES = [
  'Lifestyle', 'Fashion & Beauty', 'Food & Kuliner', 'Travel',
  'Edukasi', 'Teknologi', 'Bisnis & Finansial', 'Kesehatan & Fitness',
  'Gaming', 'Seni & Desain', 'Parenting', 'Otomotif',
];

const PILLAR_COLORS = [
  { color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const { user, profile, refreshProfile } = useUser();
  const { addPlatform } = useData();
  const { addPillar } = usePillars();
  const { addAccount } = useAccounts();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Profile
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [niche, setNiche] = useState(profile?.niche || '');
  const [customNiche, setCustomNiche] = useState('');

  // Step 2 — Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Step 3 — Account name
  const [accountName, setAccountName] = useState('');

  // Step 4 — Pillars
  const [pillars, setPillars] = useState<{ label: string; emoji: string }[]>([]);
  const [pillarInput, setPillarInput] = useState('');
  const [pillarEmoji, setPillarEmoji] = useState('');

  // -------- helpers --------
  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addPillarItem = () => {
    const label = pillarInput.trim();
    if (!label) return;
    if (pillars.length >= 6) { toast.error('Maksimal 6 pilar konten'); return; }
    if (pillars.some(p => p.label.toLowerCase() === label.toLowerCase())) {
      toast.error('Pilar sudah ada'); return;
    }
    setPillars(prev => [...prev, { label, emoji: pillarEmoji || '📌' }]);
    setPillarInput('');
    setPillarEmoji('');
  };

  const removePillarItem = (label: string) => {
    setPillars(prev => prev.filter(p => p.label !== label));
  };

  // -------- navigation --------
  const canNext = () => {
    if (step === 1) return displayName.trim().length > 0 && (niche.trim().length > 0 || customNiche.trim().length > 0);
    if (step === 2) return selectedPlatforms.length > 0;
    if (step === 3) return accountName.trim().length > 0;
    return true; // step 4 (pillars) is optional
  };

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); };
  const back = () => { if (step > 1) setStep(s => s - 1); };

  // -------- finish --------
  const finish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const finalNiche = customNiche.trim() || niche;

      // 1. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim(), niche: finalNiche, is_onboarded: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Add selected platforms (skip if already exists — DataContext handles optimistic)
      await Promise.all(
        selectedPlatforms.map(id => {
          const preset = PRESET_PLATFORMS.find(p => p.platform_id === id);
          if (!preset) return Promise.resolve();
          return addPlatform({ platform_id: preset.platform_id, name: preset.name, emoji: preset.emoji });
        })
      );

      // 3. Add account
      if (accountName.trim()) {
        await addAccount(accountName.trim());
      }

      // 4. Add pillars
      await Promise.all(
        pillars.map((p, i) => {
          const c = PILLAR_COLORS[i % PILLAR_COLORS.length];
          return addPillar({
            pillar_id: p.label.toLowerCase().replace(/\s+/g, '-'),
            label: p.label,
            emoji: p.emoji,
            color: c.color,
            bg: c.bg,
          });
        })
      );

      // 5. Refresh profile so OnboardingGuard sees is_onboarded = true
      await refreshProfile();
      toast.success('Selamat datang di Creatorlytics!');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan, coba lagi');
      setSaving(false);
    }
  };

  // -------- render --------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Langkah {step} dari {TOTAL_STEPS}
            </p>
            {step === 1 && <StepHeader icon={<User className="size-5" />} title="Siapa kamu?" desc="Biar dashboard bisa disesuaikan buat kamu." />}
            {step === 2 && <StepHeader icon={<Smartphone className="size-5" />} title="Platform mana yang kamu pakai?" desc="Pilih semua platform tempat kamu aktif berkreasi." />}
            {step === 3 && <StepHeader icon={<BarChart3 className="size-5" />} title="Nama akun sosmedmu?" desc="Ini akan jadi akun default saat kamu input data konten." />}
            {step === 4 && <StepHeader icon={<Layers className="size-5" />} title="Pilar konten kamu (opsional)" desc="Kategori konten yang sering kamu buat. Bisa ditambah nanti di Settings." />}
          </div>

          {/* Step content */}
          <div className="min-h-[220px]">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nama tampilan</Label>
                  <Input
                    placeholder="Misal: Budi Kreator"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Niche konten</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_NICHES.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => { setNiche(n); setCustomNiche(''); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          niche === n && !customNiche
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Atau ketik niche sendiri..."
                    value={customNiche}
                    onChange={e => { setCustomNiche(e.target.value); setNiche(''); }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PLATFORMS.map(p => (
                  <button
                    key={p.platform_id}
                    type="button"
                    onClick={() => togglePlatform(p.platform_id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedPlatforms.includes(p.platform_id)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span>{p.name}</span>
                    {selectedPlatforms.includes(p.platform_id) && (
                      <CheckCircle2 className="size-4 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Username atau nama akun</Label>
                  <Input
                    placeholder="Misal: @budikreator"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Kalau kamu punya beberapa akun, tenang — bisa ditambah lagi nanti di Settings.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Emoji"
                    value={pillarEmoji}
                    onChange={e => setPillarEmoji(e.target.value)}
                    className="w-20 text-center"
                    maxLength={2}
                  />
                  <Input
                    placeholder="Nama pilar, misal: Edukasi"
                    value={pillarInput}
                    onChange={e => setPillarInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addPillarItem()}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addPillarItem}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                {pillars.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pillars.map((p, i) => {
                      const c = PILLAR_COLORS[i % PILLAR_COLORS.length];
                      return (
                        <span
                          key={p.label}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}
                        >
                          {p.emoji} {p.label}
                          <button
                            type="button"
                            onClick={() => removePillarItem(p.label)}
                            className="ml-1 opacity-60 hover:opacity-100"
                            aria-label={`Hapus pilar ${p.label}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ada pilar. Bisa skip dan tambah nanti.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={back} disabled={step === 1} size="sm">
              <ChevronLeft className="size-4" />
              Kembali
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={next} disabled={!canNext()} size="sm">
                Lanjut
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={saving} size="sm">
                {saving ? (
                  <>
                    <Sparkles className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Mulai Pakai
                  </>
                )}
              </Button>
            )}
          </div>

          {step === 4 && (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
            >
              Lewati, setup nanti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
