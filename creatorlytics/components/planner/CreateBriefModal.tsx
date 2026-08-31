'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useUser } from '@/lib/hooks/useUser';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useEvents } from '@/lib/hooks/useEvents';
import { today } from '@/lib/utils/formatting';
import { createClient } from '@/lib/supabase/client';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, X, Target, MessageSquare, Video, FileText, Flame, Sparkles, BookmarkPlus } from 'lucide-react';
import type { ContentIdea } from '@/types';

export interface BriefPreset {
  id: string;
  name: string;
  target_usia: string;
  target_minat: string;
  target_painpoint: string;
  tone: string;
  format_video: string;
  durasi: string;
  isBuiltIn?: boolean;
}

const DEFAULT_PRESETS: BriefPreset[] = [
  {
    id: 'gen-z-promo',
    name: 'Gen Z & Youth Promo',
    target_usia: '18–24 tahun',
    target_minat: 'Pop culture, tren TikTok, promo/diskon, lifestyle',
    target_painpoint: 'Budget terbatas, suka FOMO, cari produk yang relatable',
    tone: 'Kasual, seru, gaul, emosional, sisipkan tren kata terkini',
    format_video: 'Short-form video',
    durasi: '15–30 detik',
    isBuiltIn: true,
  },
  {
    id: 'millennial-pro',
    name: 'Millennial Professional & Edukasi',
    target_usia: '25–35 tahun',
    target_minat: 'Karir, produktivitas, work-life balance, finansial',
    target_painpoint: 'Waktu terbatas, butuh solusi praktis & to-the-point',
    tone: 'Informatif, lugas, profesional namun tetap ramah',
    format_video: 'Carousel',
    durasi: '5–7 slide',
    isBuiltIn: true,
  },
  {
    id: 'talking-head',
    name: 'Reels / TikTok Talking Head',
    target_usia: '20–30 tahun',
    target_minat: 'Personal storytelling, daily life, tips & tricks',
    target_painpoint: 'Bosan dengan konten jualan langsung, suka konten manusiawi',
    tone: 'Empatis, inspiratif, storytelling personal',
    format_video: 'Video',
    durasi: '30–60 detik',
    isBuiltIn: true,
  },
];

interface CreateBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIdea?: ContentIdea | null;
}

interface BriefFormFields {
  // Identity
  title: string;
  platforms: string[];
  accounts: string[];
  pillar: string;
  // Brief fields
  priority: 'low' | 'med' | 'high';
  deadline: string;
  narasi: string;
  // Target Audience
  target_usia: string;
  target_minat: string;
  target_painpoint: string;
  // Tone
  tone: string;
  // Format Produksi
  format_video: string;
  durasi: string;
  ref_links: string[];
}

const emptyForm: BriefFormFields = {
  title: '',
  platforms: [],
  accounts: [],
  pillar: '',
  priority: 'med',
  deadline: '',
  narasi: '',
  target_usia: '',
  target_minat: '',
  target_painpoint: '',
  tone: '',
  format_video: '',
  durasi: '',
  ref_links: [''],
};

const FORMAT_BRIEF_OPTIONS = ['Video', 'Carousel', 'Single Post', 'Short-form video'];

export function CreateBriefModal({ open, onOpenChange, editIdea }: CreateBriefModalProps) {
  const { createIdea, updateIdea } = useIdeas();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const { profile } = useUser();
  const { accounts: accountList } = useAccounts();
  const { createEvent } = useEvents();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<BriefFormFields>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<BriefPreset[]>(DEFAULT_PRESETS);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(today());

  // Fetch presets from Supabase (with fallback to localStorage)
  const fetchPresets = useCallback(async () => {
    if (profile?.id) {
      try {
        const { data, error } = await supabase
          .from('brief_presets')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const customFromDb: BriefPreset[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            target_usia: d.target_usia || '',
            target_minat: d.target_minat || '',
            target_painpoint: d.target_painpoint || '',
            tone: d.tone || '',
            format_video: d.format_video || '',
            durasi: d.durasi || '',
            isBuiltIn: false,
          }));
          setPresets([...DEFAULT_PRESETS, ...customFromDb]);
          return;
        }
      } catch {
        // Table might not exist yet; fall back to localStorage
      }
    }

    // Fallback to localStorage
    const storageKey = `cly_brief_presets_${profile?.id || 'guest'}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPresets([...DEFAULT_PRESETS, ...JSON.parse(saved)]);
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    } catch {
      setPresets(DEFAULT_PRESETS);
    }
  }, [profile?.id, supabase]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPresets();
    }
  }, [open, fetchPresets]);

  function handleApplyPreset(presetId: string | null) {
    if (!presetId) return;
    const found = presets.find(p => p.id === presetId);
    if (found) {
      setForm(prev => ({
        ...prev,
        target_usia: found.target_usia || prev.target_usia,
        target_minat: found.target_minat || prev.target_minat,
        target_painpoint: found.target_painpoint || prev.target_painpoint,
        tone: found.tone || prev.tone,
        format_video: found.format_video || prev.format_video,
        durasi: found.durasi || prev.durasi,
      }));
      toast.success(`Preset "${found.name}" berhasil diterapkan!`);
    }
  }

  async function handleSaveAsPreset() {
    const name = prompt('Masukkan nama untuk Preset Brief ini (Target Audience, Tone, & Format):');
    if (!name || !name.trim()) return;

    if (profile?.id) {
      try {
        const { data, error } = await supabase
          .from('brief_presets')
          .insert({
            user_id: profile.id,
            name: name.trim(),
            target_usia: form.target_usia,
            target_minat: form.target_minat,
            target_painpoint: form.target_painpoint,
            tone: form.tone,
            format_video: form.format_video,
            durasi: form.durasi,
          })
          .select()
          .single();

        if (!error && data) {
          toast.success(`Preset "${name}" berhasil disimpan!`);
          fetchPresets();
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Fallback if DB table not yet created
    const storageKey = `cly_brief_presets_${profile?.id || 'guest'}`;
    const newPreset: BriefPreset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      target_usia: form.target_usia,
      target_minat: form.target_minat,
      target_painpoint: form.target_painpoint,
      tone: form.tone,
      format_video: form.format_video,
      durasi: form.durasi,
      isBuiltIn: false,
    };
    const customOnly = presets.filter(p => !p.isBuiltIn);
    const updatedCustom = [...customOnly, newPreset];
    localStorage.setItem(storageKey, JSON.stringify(updatedCustom));
    setPresets([...DEFAULT_PRESETS, ...updatedCustom]);
    toast.success(`Preset "${name}" berhasil disimpan!`);
  }

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (editIdea) {
        const brief = (editIdea.brief && typeof editIdea.brief === 'object') ? editIdea.brief as Record<string, unknown> : {};
        setForm({
          title: editIdea.title ?? '',
          platforms: editIdea.platform ? editIdea.platform.split(',').filter(Boolean) : [],
          accounts: Array.isArray(brief.accounts) ? (brief.accounts as string[]) : [],
          pillar: editIdea.pillar ?? '',
          priority: editIdea.priority ?? 'med',
          deadline: (brief.deadline as string) ?? '',
          narasi: (brief.narasi as string) ?? editIdea.description ?? '',
          target_usia: (brief.target_usia as string) ?? '',
          target_minat: (brief.target_minat as string) ?? '',
          target_painpoint: (brief.target_painpoint as string) ?? '',
          tone: (brief.tone as string) ?? '',
          format_video: (brief.format_video as string) ?? editIdea.format ?? '',
          durasi: (brief.durasi as string) ?? '',
          ref_links: editIdea.ref_links?.length > 0 ? editIdea.ref_links : [''],
        });
        setAddToCalendar(false);
        setScheduleDate(today());
      } else {
        setForm(emptyForm);
        setAddToCalendar(false);
        setScheduleDate(today());
      }
    });
  }, [open, editIdea]);

  function update<K extends keyof BriefFormFields>(key: K, value: BriefFormFields[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleRefLinkChange(index: number, value: string) {
    const newLinks = [...form.ref_links];
    newLinks[index] = value;
    update('ref_links', newLinks);
  }

  function addRefLink() {
    update('ref_links', [...form.ref_links, '']);
  }

  function removeRefLink(index: number) {
    if (form.ref_links.length === 1) return;
    update('ref_links', form.ref_links.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const briefData = {
        deadline: form.deadline,
        narasi: form.narasi,
        target_usia: form.target_usia,
        target_minat: form.target_minat,
        target_painpoint: form.target_painpoint,
        tone: form.tone,
        format_video: form.format_video,
        durasi: form.durasi,
        ref_visual: '',
        accounts: form.accounts,
        platforms: form.platforms,
      };

      const data = {
        title: form.title,
        description: form.narasi,
        platform: form.platforms.join(','),
        pillar: form.pillar,
        format: form.format_video,
        status: 'brief' as const,
        priority: form.priority,
        tags: [],
        brief: briefData,
        ref_links: form.ref_links.map(l => l.trim()).filter(Boolean),
      };

      if (editIdea) {
        const ok = await updateIdea(editIdea.id, data);
        if (ok) {
          toast.success('Brief berhasil diperbarui');
          onOpenChange(false);
        }
      } else {
        const createdIdea = await createIdea(data);
        if (createdIdea) {
          if (addToCalendar && scheduleDate) {
            await createEvent({
              title: form.title,
              platform: form.platforms.join(','),
              account: form.accounts.join(','),
              pillar: form.pillar,
              format: form.format_video,
              scheduled_date: scheduleDate,
              scheduled_time: '12:00',
              status: 'scheduled',
              idea_id: createdIdea.id,
              notes: form.narasi,
            });
          }
          toast.success('Brief berhasil dibuat');
          onOpenChange(false);
        }
      }
    } catch {
      toast.error('Gagal menyimpan brief');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Content Brief
            </span>
          </div>
          <DialogTitle>{editIdea ? 'Edit Content Brief' : 'Buat Content Brief'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-1">

          {/* ── Judul + Platform */}
          <FormSection>
            <div className="grid gap-2">
              <Label htmlFor="brief-title">Judul Konten <span className="text-red-500">*</span></Label>
              <Input
                id="brief-title"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="Contoh: Review Produk X — 5 Alasan Wajib Coba"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Platform (Bisa lebih dari 1)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {platforms.map(p => (
                    <label key={p.platform_id} className="flex items-center gap-2 text-xs text-cly-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(p.platform_id)}
                        onChange={e => {
                          if (e.target.checked) update('platforms', [...form.platforms, p.platform_id]);
                          else update('platforms', form.platforms.filter(id => id !== p.platform_id));
                        }}
                        className="size-3.5 rounded border-cly-border text-cly-brand focus:ring-cly-brand"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Akun (Bisa lebih dari 1)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {accountList.map(a => (
                    <label key={a.id} className="flex items-center gap-2 text-xs text-cly-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.accounts.includes(a.name)}
                        onChange={e => {
                          if (e.target.checked) update('accounts', [...form.accounts, a.name]);
                          else update('accounts', form.accounts.filter(name => name !== a.name));
                        }}
                        className="size-3.5 rounded border-cly-border text-cly-brand focus:ring-cly-brand"
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 col-span-2 sm:col-span-1">
                <Label>Pilar</Label>
                <Select value={form.pillar} onValueChange={v => update('pillar', v ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih pilar">
                      {form.pillar
                        ? pillars.find(p => p.pillar_id === form.pillar)?.label || form.pillar
                        : 'Pilih pilar'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {pillars.map(p => (
                      <SelectItem key={p.pillar_id} value={p.pillar_id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          {/* ── Prioritas + Deadline */}
          <SectionBlock icon={<Flame className="size-4" />} title="Prioritas & Deadline">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs">Prioritas</Label>
                <Select value={form.priority} onValueChange={v => v && update('priority', v as BriefFormFields['priority'])}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {form.priority === 'low' ? 'Rendah' : form.priority === 'med' ? 'Sedang' : 'Tinggi'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="med">Sedang</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Deadline</Label>
                <Input
                  value={form.deadline}
                  onChange={e => update('deadline', e.target.value)}
                  placeholder="Contoh: 20 Agustus 2026"
                />
              </div>
            </div>
            
            {!editIdea && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-cly-border bg-cly-muted/30 p-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-cly-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToCalendar}
                    onChange={e => setAddToCalendar(e.target.checked)}
                    className="size-4 rounded border-cly-border text-cly-brand focus:ring-cly-brand"
                  />
                  Jadwalkan otomatis di Kalender
                </label>
                {addToCalendar && (
                  <div className="grid gap-1.5 pl-6">
                    <Label className="text-xs text-cly-text-2">Pilih Tanggal</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </SectionBlock>

          {/* ── Narasi Konten */}
          <SectionBlock icon={<FileText className="size-4" />} title="Narasi Konten">
            <RichTextEditor
              value={form.narasi}
              onValueChange={v => update('narasi', v)}
              placeholder="Jelaskan konsep konten, angle cerita, dan tujuan utama konten ini..."
              className="min-h-[120px] text-sm bg-background"
            />
          </SectionBlock>

          {/* ── Preset Brief Bar */}
          <div className="rounded-xl border border-cly-brand/30 bg-gradient-to-br from-cly-brand/10 to-white p-3.5 space-y-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cly-brand">
                <Sparkles className="size-4" />
                <span>Preset Brief (Audience, Tone & Format)</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-cly-brand/30 text-cly-brand hover:bg-cly-brand/10 font-semibold"
                onClick={handleSaveAsPreset}
                title="Simpan Target Audience, Tone, & Format saat ini sebagai Preset baru"
              >
                <BookmarkPlus className="size-3.5" />
                Simpan Preset Ini
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select value="" onValueChange={handleApplyPreset}>
                <SelectTrigger className="w-full h-8 text-xs bg-background">
                  <SelectValue placeholder="⚡ Terapkan Preset Brief (Pilih Preset...)" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-medium">{p.name}</span>
                      {p.isBuiltIn && <span className="text-[10px] text-muted-foreground ml-2">(Bawaan)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Target Audience */}
          <SectionBlock icon={<Target className="size-4" />} title="Target Audience">
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Rentang Usia</Label>
                <Input
                  value={form.target_usia}
                  onChange={e => update('target_usia', e.target.value)}
                  placeholder="Contoh: 18–28 tahun"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Minat / Interest</Label>
                <Input
                  value={form.target_minat}
                  onChange={e => update('target_minat', e.target.value)}
                  placeholder="Contoh: fashion, lifestyle, self-improvement"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Pain Point</Label>
                <Input
                  value={form.target_painpoint}
                  onChange={e => update('target_painpoint', e.target.value)}
                  placeholder="Contoh: Mau tampil stylish tapi budget terbatas"
                />
              </div>
            </div>
          </SectionBlock>

          {/* ── Tone of Voice */}
          <SectionBlock icon={<MessageSquare className="size-4" />} title="Tone of Voice">
            <Textarea
              value={form.tone}
              onChange={e => update('tone', e.target.value)}
              placeholder="Contoh: Fun & Casual — bahasa sehari-hari, relatable, boleh sisipkan humor ringan"
              className="text-sm"
            />
          </SectionBlock>

          {/* ── Format Produksi */}
          <SectionBlock icon={<Video className="size-4" />} title="Format Produksi">
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Format</Label>
                <Select value={form.format_video} onValueChange={v => update('format_video', v ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {FORMAT_BRIEF_OPTIONS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Durasi</Label>
                <Input
                  value={form.durasi}
                  onChange={e => update('durasi', e.target.value)}
                  placeholder="Contoh: 30–60 detik"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Link Referensi</Label>
                  <button
                    type="button"
                    onClick={addRefLink}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3" />
                    Tambah Link
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {form.ref_links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link}
                        onChange={e => handleRefLinkChange(index, e.target.value)}
                        placeholder="https://..."
                      />
                      {form.ref_links.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRefLink(index)}
                          className="shrink-0"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionBlock>

        </div>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : editIdea ? 'Simpan Brief' : 'Buat Brief'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Helper sub-components ───────────────────────────────────────────────── */

function SectionBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-cly-border bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-sm font-bold text-cly-text">
        <span className="text-cly-text-2">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function FormSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
