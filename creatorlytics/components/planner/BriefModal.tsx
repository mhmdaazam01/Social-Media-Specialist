'use client';

import { useState, useEffect } from 'react';
import { sanitizeHtml } from '@/lib/utils/sanitizer';
import { getValidHref } from '@/lib/utils/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { toast } from 'sonner';
import {
  Pencil, X, Calendar, Target,
  MessageSquare, Video, FileText,
  Link2, ClipboardList, Megaphone, Smartphone, Flame, Plus, Copy,
} from 'lucide-react';
import type { ContentIdea, ContentBrief } from '@/types';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useEvents } from '@/lib/hooks/useEvents';
import { today } from '@/lib/utils/formatting';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface BriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: ContentIdea | null;
  readOnly?: boolean;
  initialMode?: 'view' | 'edit';
}

const EMPTY_BRIEF: ContentBrief = {
  deadline: '',
  narasi: '',
  target_usia: '',
  target_minat: '',
  target_painpoint: '',
  tone: '',
  format_video: '',
  durasi: '',
  ref_visual: '',
};

const FORMAT_BRIEF_OPTIONS = ['Video', 'Carousel', 'Single Post', 'Short-form video'];

function isBrief(b: ContentIdea['brief']): b is ContentBrief {
  return typeof b === 'object' && b !== null && 'deadline' in b;
}

function getBrief(idea: ContentIdea): ContentBrief {
  return isBrief(idea.brief) ? { ...EMPTY_BRIEF, ...idea.brief } : EMPTY_BRIEF;
}

const PRIORITY_LABEL: Record<string, string> = { high: 'Tinggi', med: 'Sedang', low: 'Rendah' };
const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
  med: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  low: 'bg-muted text-muted-foreground',
};

interface EditForm {
  title: string;
  pillar: string;
  priority: 'low' | 'med' | 'high';
  deadline: string;
  narasi: string;
  target_usia: string;
  target_minat: string;
  target_painpoint: string;
  tone: string;
  format_video: string;
  durasi: string;
  ref_links: string[];
  platforms: string[];
  accounts: string[];
}

export function BriefModal({ open, onOpenChange, idea, readOnly, initialMode = 'view' }: BriefModalProps) {
  const { createIdea, updateIdea } = useIdeas();

  async function handleDuplicateInModal() {
    if (!idea) return;
    try {
      const briefData = idea.brief && typeof idea.brief === 'object' ? { ...idea.brief } : {};
      const newTitle = `${idea.title || 'Konten'} (Salinan)`;

      await createIdea({
        title: newTitle,
        description: idea.description,
        platform: idea.platform,
        pillar: idea.pillar,
        format: idea.format,
        status: idea.status,
        priority: idea.priority,
        tags: idea.tags || [],
        brief: briefData,
        ref_links: idea.ref_links || [],
      });
      toast.success(`Brief "${newTitle}" berhasil diduplikat!`);
      onOpenChange(false);
    } catch {
      toast.error('Gagal menduplikat brief');
    }
  }
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const { accounts: accountList } = useAccounts();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [brief, setBrief] = useState<ContentBrief>(EMPTY_BRIEF);
  const [form, setForm] = useState<EditForm>({
    title: '',
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
    platforms: [],
    accounts: [],
  });
  const [saving, setSaving] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(today());
  const [initialEventLoaded, setInitialEventLoaded] = useState(false);

  const platform = platforms.find(p => p.platform_id === idea?.platform);
  const pillar = pillars.find(p => p.pillar_id === idea?.pillar);

  useEffect(() => {
    queueMicrotask(() => {
      if (!open) {
        setMode(initialMode);
        setInitialEventLoaded(false);
        return;
      }
      if (idea) {
        const b = getBrief(idea);
        setBrief(b);
        setForm({
          title: idea.title ?? '',
          pillar: idea.pillar ?? '',
          priority: idea.priority ?? 'med',
          deadline: b.deadline ?? '',
          narasi: b.narasi ?? idea.description ?? '',
          target_usia: b.target_usia ?? '',
          target_minat: b.target_minat ?? '',
          target_painpoint: b.target_painpoint ?? '',
          tone: b.tone ?? '',
          format_video: b.format_video ?? idea.format ?? '',
          durasi: b.durasi ?? '',
          ref_links: idea.ref_links?.length > 0 ? idea.ref_links : [''],
          platforms: idea.platform ? idea.platform.split(',').filter(Boolean) : [],
          accounts: b.accounts ?? [],
        });
      }
    });
  }, [open, idea, initialMode]);

  useEffect(() => {
    if (open && idea && !initialEventLoaded) {
      const linked = events.find(e => e.idea_id === idea.id);
      queueMicrotask(() => {
        if (linked) {
          setAddToCalendar(true);
          setScheduleDate(linked.scheduled_date);
        } else {
          setAddToCalendar(false);
          setScheduleDate(today());
        }
        setInitialEventLoaded(true);
      });
    }
  }, [open, idea, events, initialEventLoaded]);

  function upd<K extends keyof EditForm>(key: K, val: EditForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleRefLinkChange(index: number, value: string) {
    const newLinks = [...form.ref_links];
    newLinks[index] = value;
    upd('ref_links', newLinks);
  }

  function addRefLink() {
    upd('ref_links', [...form.ref_links, '']);
  }

  function removeRefLink(index: number) {
    if (form.ref_links.length === 1) return;
    upd('ref_links', form.ref_links.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!idea) return;
    setSaving(true);
    try {
      const briefData: ContentBrief = {
        deadline: form.deadline,
        narasi: form.narasi,
        target_usia: form.target_usia,
        target_minat: form.target_minat,
        target_painpoint: form.target_painpoint,
        tone: form.tone,
        format_video: form.format_video,
        durasi: form.durasi,
        ref_visual: brief.ref_visual ?? '',
      };
      const ok = await updateIdea(idea.id, {
        title: form.title,
        pillar: form.pillar,
        priority: form.priority,
        format: form.format_video,
        description: form.narasi,
        platform: form.platforms.join(','),
        ref_links: form.ref_links.map(l => l.trim()).filter(Boolean),
        brief: briefData,
      });

      if (!ok) {
        return;
      }

      const linkedEvent = events.find(e => e.idea_id === idea.id);
      if (addToCalendar && scheduleDate) {
        const eventPayload = {
          title: form.title,
          platform: form.platforms.join(','),
          account: form.accounts.join(','),
          pillar: form.pillar,
          format: form.format_video,
          scheduled_date: scheduleDate,
          scheduled_time: linkedEvent?.scheduled_time || '12:00',
          status: linkedEvent?.status || 'scheduled',
          idea_id: idea.id,
          notes: form.narasi,
        };
        if (linkedEvent) {
          await updateEvent(linkedEvent.id, eventPayload);
        } else {
          await createEvent(eventPayload);
        }
      } else if (!addToCalendar && linkedEvent) {
        await deleteEvent(linkedEvent.id);
      }

      setBrief(briefData);
      toast.success('Brief berhasil disimpan');
      setMode('view');
    } catch {
      toast.error('Gagal menyimpan brief');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setMode('view');
    onOpenChange(false);
  }

  if (!idea) return null;

  const hasBriefData = isBrief(idea.brief) && Object.values(idea.brief).some(v => v !== '');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Content Brief
              </p>
              <DialogTitle className="text-lg font-bold leading-snug">{idea.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {platform && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {platform.name}
                  </span>
                )}
                {pillar && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${pillar.color}18`, color: pillar.color }}
                  >
                    {pillar.label}
                  </span>
                )}
                {idea.format && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {idea.format}
                  </span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[idea.priority]}`}>
                  Prioritas {PRIORITY_LABEL[idea.priority]}
                </span>
              </div>
            </div>

            {mode === 'view' && !readOnly && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicateInModal}
                  className="gap-1 text-xs"
                  title="Duplikat brief ini"
                >
                  <Copy className="size-3.5" />
                  Duplikat
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setMode('edit')}
                  className="gap-1.5 text-xs"
                >
                  <Pencil className="size-3.5" />
                  {hasBriefData ? 'Edit Brief' : 'Isi Brief'}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* ── VIEW MODE ─────────────────────────────────────────────── */}
        {mode === 'view' && (
          <div className="mt-1 space-y-4 text-sm">

            {/* Deadline */}
            {brief.deadline && (
              <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>Deadline:</span>
                <span className="font-semibold text-foreground">{brief.deadline}</span>
              </div>
            )}

            <hr className="border-border/60" />

            {/* OVERVIEW */}
            <ViewSection icon={<ClipboardList className="size-3.5" />} title="Overview">
              <ViewRow label="Judul" value={idea.title} />
              {brief.narasi
                ? <ViewRow label="Narasi" value={brief.narasi} multiline />
                : idea.description
                  ? <ViewRow label="Deskripsi" value={idea.description} multiline />
                  : null}
              {pillar && <ViewRow label="Content Pillar" value={pillar.label} />}
              {platform && <ViewRow label="Platform" value={platform.name} />}
            </ViewSection>

            {/* TARGET AUDIENCE */}
            {(brief.target_usia || brief.target_minat || brief.target_painpoint) ? (
              <ViewSection icon={<Target className="size-3.5" />} title="Target Audience">
                {brief.target_usia && <ViewRow label="Usia" value={brief.target_usia} />}
                {brief.target_minat && <ViewRow label="Minat" value={brief.target_minat} />}
                {brief.target_painpoint && <ViewRow label="Pain point" value={brief.target_painpoint} />}
              </ViewSection>
            ) : (
              <ViewSection icon={<Target className="size-3.5" />} title="Target Audience">
                <p className="text-xs text-muted-foreground/60 italic">Belum diisi — klik &quot;Isi Brief&quot; untuk melengkapi.</p>
              </ViewSection>
            )}

            {/* TONE OF VOICE */}
            <ViewSection icon={<Megaphone className="size-3.5" />} title="Tone of Voice">
              {brief.tone
                ? <p className="text-sm leading-relaxed">{brief.tone}</p>
                : <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>}
            </ViewSection>

            {/* FORMAT PRODUKSI */}
            <ViewSection icon={<Smartphone className="size-3.5" />} title="Format Produksi">
              {(brief.format_video || brief.durasi || idea.format) ? (
                <>
                  {(brief.format_video || idea.format) && (
                    <ViewRow label="Format" value={brief.format_video || idea.format} />
                  )}
                  {brief.durasi && <ViewRow label="Durasi" value={brief.durasi} />}
                  {idea.ref_links && idea.ref_links.filter(Boolean).length > 0 && (
                    <div className="space-y-1 mt-1">
                      <span className="text-[11px] text-muted-foreground">Link Referensi</span>
                      {idea.ref_links.filter(Boolean).map((link, i) => (
                        <a
                          key={i}
                          href={getValidHref(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"
                        >
                          <Link2 className="size-3 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>
              )}
            </ViewSection>

          </div>
        )}

        {/* ── EDIT MODE ─────────────────────────────────────────────── */}
        {mode === 'edit' && (
          <div className="mt-2 space-y-4">

            {/* Informasi Dasar */}
            <SectionBlock icon={<FileText className="size-4" />} title="Informasi Dasar">
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Judul Konten <span className="text-red-500">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={e => upd('title', e.target.value)}
                    placeholder="Contoh: Review Produk X"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs">Platform</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {platforms.map(p => (
                      <label key={p.platform_id} className="flex items-center gap-2 text-xs text-cly-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.platforms.includes(p.platform_id)}
                          onChange={e => {
                            if (e.target.checked) upd('platforms', [...form.platforms, p.platform_id]);
                            else upd('platforms', form.platforms.filter(id => id !== p.platform_id));
                          }}
                          className="size-3.5 rounded border-cly-border text-cly-brand focus:ring-cly-brand"
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5 mt-2">
                  <Label className="text-xs">Akun</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {accountList.map(a => (
                      <label key={a.id} className="flex items-center gap-2 text-xs text-cly-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.accounts.includes(a.name)}
                          onChange={e => {
                            if (e.target.checked) upd('accounts', [...form.accounts, a.name]);
                            else upd('accounts', form.accounts.filter(name => name !== a.name));
                          }}
                          className="size-3.5 rounded border-cly-border text-cly-brand focus:ring-cly-brand"
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5 mt-2">
                  <Label className="text-xs">Pilar</Label>
                  <Select value={form.pillar} onValueChange={v => upd('pillar', v ?? '')}>
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
            </SectionBlock>

            {/* Prioritas + Deadline */}
            <SectionBlock icon={<Flame className="size-4" />} title="Prioritas & Deadline">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Prioritas</Label>
                  <Select value={form.priority} onValueChange={v => v && upd('priority', v as EditForm['priority'])}>
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
                <div className="grid gap-1.5">
                  <Label className="text-xs">Deadline</Label>
                  <Input
                    value={form.deadline}
                    onChange={e => upd('deadline', e.target.value)}
                    placeholder="Contoh: 20 Agustus 2026"
                  />
                </div>
              </div>
              
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
            </SectionBlock>

            {/* Narasi Konten */}
            <SectionBlock icon={<FileText className="size-4" />} title="Narasi Konten">
              <RichTextEditor
                value={form.narasi}
                onValueChange={v => upd('narasi', v)}
                placeholder="Jelaskan konsep konten, angle cerita, dan tujuan utama konten ini..."
                className="min-h-[120px] text-sm bg-background"
              />
            </SectionBlock>

            {/* Target Audience */}
            <SectionBlock icon={<Target className="size-4" />} title="Target Audience">
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Rentang Usia</Label>
                  <Input
                    value={form.target_usia}
                    onChange={e => upd('target_usia', e.target.value)}
                    placeholder="Contoh: 18–28 tahun"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Minat / Interest</Label>
                  <Input
                    value={form.target_minat}
                    onChange={e => upd('target_minat', e.target.value)}
                    placeholder="Contoh: fashion, lifestyle, self-improvement"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Pain Point</Label>
                  <Input
                    value={form.target_painpoint}
                    onChange={e => upd('target_painpoint', e.target.value)}
                    placeholder="Contoh: Mau tampil stylish tapi budget terbatas"
                  />
                </div>
              </div>
            </SectionBlock>

            {/* Tone of Voice */}
            <SectionBlock icon={<MessageSquare className="size-4" />} title="Tone of Voice">
              <Textarea
                value={form.tone}
                onChange={e => upd('tone', e.target.value)}
                placeholder="Contoh: Fun & Casual — bahasa sehari-hari, relatable, boleh sisipkan humor ringan"
                className="text-sm"
              />
            </SectionBlock>

            {/* Format Produksi */}
            <SectionBlock icon={<Video className="size-4" />} title="Format Produksi">
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Format</Label>
                  <Select value={form.format_video} onValueChange={v => upd('format_video', v ?? '')}>
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
                    onChange={e => upd('durasi', e.target.value)}
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setMode('view')}>
                <X className="size-3.5 mr-1" />
                Batal
              </Button>
              <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Brief'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ViewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cly-border bg-white p-4 space-y-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-cly-text-2 uppercase tracking-wider">
        <span className="text-cly-text-3">{icon}</span> {title}
      </p>
      {children}
    </div>
  );
}

function ViewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  if (multiline) {
    return (
      <div className="space-y-0.5">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <div
          className="text-sm leading-relaxed max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_b]:font-bold [&_i]:italic"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(value)
          }}
        />
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="font-medium flex-1">{value}</span>
    </div>
  );
}

function SectionBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
