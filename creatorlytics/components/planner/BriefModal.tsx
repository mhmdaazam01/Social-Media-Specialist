'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { toast } from 'sonner';
import {
  Pencil, X, Calendar, Smartphone, Target,
  MessageSquare, Video, ImageIcon, Clock, FileText,
  Tag, Link2,
} from 'lucide-react';
import type { ContentIdea, ContentBrief } from '@/types';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';

interface BriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: ContentIdea | null;
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
  repurpose: '',
  ref_visual: '',
  timeline_script: '',
  timeline_shoot: '',
  timeline_edit: '',
  timeline_publish: '',
};

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

export function BriefModal({ open, onOpenChange, idea }: BriefModalProps) {
  const { updateIdea } = useIdeas();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [form, setForm] = useState<ContentBrief>(EMPTY_BRIEF);
  const [saving, setSaving] = useState(false);

  const platform = platforms.find(p => p.platform_id === idea?.platform);
  const pillar = pillars.find(p => p.pillar_id === idea?.pillar);

  useEffect(() => {
    if (!open) { setMode('view'); return; }
    if (idea) setForm(getBrief(idea));
  }, [open, idea]);

  function upd<K extends keyof ContentBrief>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    if (!idea) return;
    setSaving(true);
    try {
      await updateIdea(idea.id, { brief: form });
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

  // check if any brief field has been filled
  const hasBriefData = isBrief(idea.brief) && Object.values(idea.brief).some(v => v !== '');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                📄 Content Brief
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

            {mode === 'view' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setMode('edit')}
                className="shrink-0 gap-1.5 text-xs"
              >
                <Pencil className="size-3.5" />
                {hasBriefData ? 'Edit Brief' : 'Isi Brief'}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* ── VIEW MODE ─────────────────────────────────────────────── */}
        {mode === 'view' && (
          <div className="mt-1 space-y-4 text-sm">

            {/* Deadline (from brief) */}
            {form.deadline && (
              <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>Deadline:</span>
                <span className="font-semibold text-foreground">{form.deadline}</span>
              </div>
            )}

            <hr className="border-border/60" />

            {/* OVERVIEW */}
            <ViewSection emoji="📋" title="Overview">
              <ViewRow label="Judul" value={idea.title} />
              {form.narasi
                ? <ViewRow label="Narasi" value={form.narasi} multiline />
                : idea.description
                  ? <ViewRow label="Deskripsi" value={idea.description} multiline />
                  : null}
              {pillar && <ViewRow label="Content Pillar" value={pillar.label} />}
              {platform && <ViewRow label="Platform" value={platform.name} />}
            </ViewSection>

            {/* TARGET AUDIENCE */}
            {(form.target_usia || form.target_minat || form.target_painpoint) ? (
              <ViewSection emoji="🎯" title="Target Audience">
                {form.target_usia && <ViewRow label="Usia" value={form.target_usia} />}
                {form.target_minat && <ViewRow label="Minat" value={form.target_minat} />}
                {form.target_painpoint && <ViewRow label="Pain point" value={form.target_painpoint} />}
              </ViewSection>
            ) : (
              <ViewSection emoji="🎯" title="Target Audience">
                <p className="text-xs text-muted-foreground/60 italic">Belum diisi — klik "Isi Brief" untuk melengkapi.</p>
              </ViewSection>
            )}

            {/* TONE OF VOICE */}
            <ViewSection emoji="🗣️" title="Tone of Voice">
              {form.tone
                ? <p className="text-sm leading-relaxed">{form.tone}</p>
                : <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>}
            </ViewSection>

            {/* FORMAT */}
            <ViewSection emoji="📱" title="Format Produksi">
              {(form.format_video || form.durasi || form.repurpose || idea.format) ? (
                <>
                  {(form.format_video || idea.format) && (
                    <ViewRow label="Format" value={form.format_video || idea.format} />
                  )}
                  {form.durasi && <ViewRow label="Durasi" value={form.durasi} />}
                  {form.repurpose && <ViewRow label="Repurpose" value={form.repurpose} />}
                </>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>
              )}
            </ViewSection>

            {/* REFERENSI VISUAL */}
            <ViewSection emoji="🖼️" title="Referensi Visual">
              {form.ref_visual || (idea.ref_links && idea.ref_links.filter(Boolean).length > 0) ? (
                <>
                  {form.ref_visual && (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{form.ref_visual}</p>
                  )}
                  {idea.ref_links && idea.ref_links.filter(Boolean).length > 0 && (
                    <div className="space-y-1 mt-1">
                      {idea.ref_links.filter(Boolean).map((link, i) => (
                        <a
                          key={i}
                          href={link}
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
                <p className="text-xs text-muted-foreground/60 italic">Belum ada referensi.</p>
              )}
            </ViewSection>

            {/* TIMELINE */}
            <ViewSection emoji="📅" title="Timeline Produksi">
              {(form.timeline_script || form.timeline_shoot || form.timeline_edit || form.timeline_publish) ? (
                <div className="space-y-2">
                  {form.timeline_script && <TimelineRow label="Draft script" date={form.timeline_script} />}
                  {form.timeline_shoot && <TimelineRow label="Shooting" date={form.timeline_shoot} />}
                  {form.timeline_edit && <TimelineRow label="Editing" date={form.timeline_edit} />}
                  {form.timeline_publish && <TimelineRow label="Publish" date={form.timeline_publish} done />}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>
              )}
            </ViewSection>

            {/* TAGS */}
            {idea.tags && idea.tags.length > 0 && (
              <ViewSection emoji="🏷️" title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      <Tag className="size-2.5" />{tag}
                    </span>
                  ))}
                </div>
              </ViewSection>
            )}
          </div>
        )}

        {/* ── EDIT MODE ─────────────────────────────────────────────── */}
        {mode === 'edit' && (
          <div className="mt-2 space-y-5">

            <EditSection icon={<Calendar className="size-4" />} title="Deadline">
              <Input
                value={form.deadline}
                onChange={e => upd('deadline', e.target.value)}
                placeholder="20 Juli 2025"
              />
            </EditSection>

            <EditSection icon={<FileText className="size-4" />} title="Narasi Konten">
              <Textarea
                value={form.narasi}
                onChange={e => upd('narasi', e.target.value)}
                placeholder="Jelaskan konsep konten, angle cerita, dan tujuan utama..."
                className="min-h-[80px] text-sm"
              />
            </EditSection>

            <EditSection icon={<Target className="size-4" />} title="Target Audience">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rentang usia</Label>
                  <Input value={form.target_usia} onChange={e => upd('target_usia', e.target.value)} placeholder="20–30 tahun" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Minat / interest</Label>
                  <Input value={form.target_minat} onChange={e => upd('target_minat', e.target.value)} placeholder="travel, lifestyle, personal finance" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Pain point</Label>
                  <Input value={form.target_painpoint} onChange={e => upd('target_painpoint', e.target.value)} placeholder="Ingin liburan tapi takut boros" />
                </div>
              </div>
            </EditSection>

            <EditSection icon={<MessageSquare className="size-4" />} title="Tone of Voice">
              <Textarea
                value={form.tone}
                onChange={e => upd('tone', e.target.value)}
                placeholder="Contoh: Fun & Casual — pakai bahasa sehari-hari, relatable, boleh sisipkan humor ringan"
                className="text-sm"
              />
            </EditSection>

            <EditSection icon={<Video className="size-4" />} title="Format Produksi">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Format video</Label>
                  <Input value={form.format_video} onChange={e => upd('format_video', e.target.value)} placeholder="Video vertikal 9:16" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Durasi</Label>
                  <Input value={form.durasi} onChange={e => upd('durasi', e.target.value)} placeholder="30–45 detik" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Repurpose ke platform lain</Label>
                  <Input value={form.repurpose} onChange={e => upd('repurpose', e.target.value)} placeholder="YouTube Shorts, TikTok" />
                </div>
              </div>
            </EditSection>

            <EditSection icon={<ImageIcon className="size-4" />} title="Referensi Visual">
              <Textarea
                value={form.ref_visual}
                onChange={e => upd('ref_visual', e.target.value)}
                placeholder="Deskripsikan referensi visual, mood, tone warna, link Pinterest, akun Instagram, dll..."
                className="text-sm"
              />
            </EditSection>

            <EditSection icon={<Clock className="size-4" />} title="Timeline Produksi">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Draft script</Label>
                  <Input value={form.timeline_script} onChange={e => upd('timeline_script', e.target.value)} placeholder="15 Juli" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Shooting</Label>
                  <Input value={form.timeline_shoot} onChange={e => upd('timeline_shoot', e.target.value)} placeholder="17 Juli" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Editing</Label>
                  <Input value={form.timeline_edit} onChange={e => upd('timeline_edit', e.target.value)} placeholder="19 Juli" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Publish</Label>
                  <Input value={form.timeline_publish} onChange={e => upd('timeline_publish', e.target.value)} placeholder="20 Juli" />
                </div>
              </div>
            </EditSection>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setMode('view')}>
                <X className="size-3.5" />
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

function ViewSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card/60 p-4 space-y-2.5">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {emoji} {title}
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
        <p className="text-sm leading-relaxed">{value}</p>
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

function TimelineRow({ label, date, done }: { label: string; date: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className={`size-2 rounded-full shrink-0 ${done ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={`font-semibold ${done ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{date}</span>
    </div>
  );
}

function EditSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
