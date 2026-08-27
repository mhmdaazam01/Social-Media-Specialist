'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
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
  Sparkles,
  User,
  X,
} from 'lucide-react';

// --- Preset data ---
const PRESET_NICHES = [
  'Lifestyle', 'Fashion & Beauty', 'Food & Kuliner', 'Travel',
  'Edukasi', 'Teknologi', 'Bisnis & Finansial', 'Kesehatan & Fitness',
  'Gaming', 'Seni & Desain', 'Parenting', 'Otomotif',
];

const PRESET_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', emoji: '📸' },
  { id: 'tiktok', name: 'TikTok', emoji: '🎵' },
  { id: 'x', name: 'X (Twitter)', emoji: '𝕏' },
  { id: 'threads', name: 'Threads', emoji: '🧵' },
  { id: 'facebook', name: 'Facebook', emoji: '📘' },
  { id: 'youtube', name: 'YouTube', emoji: '🎥' },
  { id: 'linkedin', name: 'LinkedIn', emoji: '💼' },
];

const PILLAR_COLORS = [
  { color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const TOTAL_STEPS = 3;

export function OnboardingWizard() {
  const { user, profile, refreshProfile } = useUser();
  const { addPillar } = usePillars();
  const { addAccount } = useAccounts();
  const { addPlatform } = usePlatforms();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Profile
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [niche, setNiche] = useState(profile?.niche || '');
  const [customNiche, setCustomNiche] = useState('');

  // Step 2 — Account & Platform
  const [accountName, setAccountName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  // Step 3 — Pillars
  const [pillars, setPillars] = useState<{ label: string; emoji: string }[]>([]);
  const [pillarInput, setPillarInput] = useState('');

  // -------- helpers --------
  const addPillarItem = () => {
    const label = pillarInput.trim();
    if (!label) return;
    if (pillars.length >= 6) { toast.error('Maksimal 6 pilar konten'); return; }
    if (pillars.some(p => p.label.toLowerCase() === label.toLowerCase())) {
      toast.error('Pilar sudah ada'); return;
    }
    setPillars(prev => [...prev, { label, emoji: '📌' }]);
    setPillarInput('');
  };

  const removePillarItem = (label: string) => {
    setPillars(prev => prev.filter(p => p.label !== label));
  };

  // -------- navigation --------
  const canNext = () => {
    // Step 1: displayName is mandatory, niche is optional
    if (step === 1) return displayName.trim().length > 0;
    // Step 2: accountName and selecting 1 platform are mandatory
    if (step === 2) return accountName.trim().length > 0 && selectedPlatform.trim().length > 0;
    return true; // step 3 (pillars) is optional
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

      // 2. Add account
      if (accountName.trim()) {
        await addAccount(accountName.trim());
      }

      // 3. Add selected platform
      if (selectedPlatform.trim()) {
        const platInfo = PRESET_PLATFORMS.find(p => p.id === selectedPlatform) || {
          id: selectedPlatform.toLowerCase().replace(/\s+/g, '-'),
          name: selectedPlatform,
          emoji: '📱'
        };
        await addPlatform({
          platform_id: platInfo.id,
          name: platInfo.name,
          emoji: platInfo.emoji,
        });
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
            {step === 2 && <StepHeader icon={<BarChart3 className="size-5" />} title="Akun & Platform" desc="Tentukan akun dan platform utama tempat kamu mempublikasikan konten." />}
            {step === 3 && <StepHeader icon={<Layers className="size-5" />} title="Pilar konten kamu (opsional)" desc="Kategori konten yang sering kamu buat. Bisa ditambah nanti di Settings." />}
          </div>

          {/* Step content */}
          <div className="min-h-[220px]">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nama tampilan <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Misal: Budi Kreator"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Niche konten <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_NICHES.map(n => {
                      const isSelected = niche === n && !customNiche;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNiche('');
                            } else {
                              setNiche(n);
                              setCustomNiche('');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-semibold'
                              : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <Input
                    placeholder="Atau ketik niche sendiri (opsional)..."
                    value={customNiche}
                    onChange={e => { setCustomNiche(e.target.value); setNiche(''); }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Username atau nama akun <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Misal: @budikreator"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pilih Platform Utama <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_PLATFORMS.map(p => {
                      const isSelected = selectedPlatform === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold scale-[1.02]'
                              : 'bg-muted/40 border-border text-foreground hover:border-primary/50 hover:bg-muted/60'
                          }`}
                        >
                          <span className="text-base">{p.emoji}</span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Pilih platform utama akun ini. Kamu bisa menambah akun dan platform lain kapan saja di menu Settings.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="flex gap-2">
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
                            className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"
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

          {step === 3 && (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors cursor-pointer"
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
