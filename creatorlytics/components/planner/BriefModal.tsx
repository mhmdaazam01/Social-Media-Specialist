'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { toast } from 'sonner';
import { Pencil, X, Calendar, Smartphone, Target, MessageSquare, Video, Image, Clock, FileText } from 'lucide-react';
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
    if (idea && isBrief(idea.brief)) {
      setForm({ ...EMPTY_BRIEF, ...idea.brief });
    } else {
      setForm(EMPTY_BRIEF);
    }
  }, [open, idea]);

  function upd<K extends keyof ContentBrief>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const hasBrief = idea && isBrief(idea.brief) && Object.values(idea.brief).some(v => v !== '');

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug">{idea.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {platform && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {platform.name}
                  </span>
                )}
                {pillar && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${pillar.color}18`, color: pillar.color }}>
                    {pillar.label}
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                  {idea.format || 'Format belum dipilih'}
                </span>
              </div>
            </div>
            {mode === 'view' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setMode('edit')}
                className="shrink-0"
              >
                <Pencil className="size-3.5" />
                {hasBrief ? 'Edit Brief' : 'Buat Brief'}
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* ── VIEW MODE ─────────────────────────────────────────────── */}
        {mode === 'view' && (
          <div className="mt-2">
            {!hasBrief ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Brief belum dibuat</p>
                <p className="text-xs text-muted-foreground/70">Klik "Buat Brief" untuk mulai menulis content brief yang terstruktur.</p>
                <Button size="sm" variant="outline" onClick={() => setMode('edit')}>
                  <Pencil className="size-3.5" />
                  Buat Brief Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-5 text-sm">

                {/* Header block */}
                <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">📄 Content Brief</p>
                  {form.deadline && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-semibold">{form.deadline}</span>
                    </div>
                  )}
                  {platform && (
                    <div className="flex items-center gap-2 text-xs">
                      <Smartphone className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="font-semibold">{platform.name}</span>
                    </div>
                  )}
                </div>

                {/* Overview */}
                {(idea.description || form.narasi || pillar) && (
                  <BriefSection title="📋 Overview">
                    {idea.description && <BriefRow label="Judul" value={idea.title} />}
                    {form.narasi && <BriefRow label="Narasi" value={form.narasi} multiline />}
                    {pillar && <BriefRow label="Content Pillar" value={pillar.label} />}
                  </BriefSection>
                )}

                {/* Target Audience */}
                {(form.target_usia || form.target_minat || form.target_painpoint) && (
                  <BriefSection title="🎯 Target Audience">
                    {form.target_usia && <BriefRow label="Usia" value={form.target_usia} />}
                    {form.target_minat && <BriefRow label="Minat" value={form.target_minat} />}
                    {form.target_painpoint && <BriefRow label="Pain point" value={form.target_painpoint} />}
                  </BriefSection>
                )}

                {/* Tone */}
                {form.tone && (
                  <BriefSection title="🗣️ Tone of Voice">
                    <p className="text-sm leading-relaxed">{form.tone}</p>
                  </BriefSection>
                )}

                {/* Format */}
                {(form.format_video || form.durasi || form.repurpose) && (
                  <BriefSection title="📱 Format">
                    {form.format_video && <BriefRow label="Format video" value={form.format_video} />}
                    {form.durasi && <BriefRow label="Durasi" value={form.durasi} />}
                    {form.repurpose && <BriefRow label="Repurpose" value={form.repurpose} />}
                  </BriefSection>
                )}

                {/* Referensi Visual */}
                {(form.ref_visual || (idea.ref_links && idea.ref_links.length > 0)) && (
                  <BriefSection title="🖼️ Referensi Visual">
                    {form.ref_visual && <p className="text-sm leading-relaxed whitespace-pre-line">{form.ref_visual}</p>}
                    {idea.ref_links && idea.ref_links.filter(Boolean).length > 0 && (
                      <div className="space-y-1 mt-2">
                        {idea.ref_links.filter(Boolean).map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                            className="block text-xs text-indigo-500 hover:underline truncate">
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                  </BriefSection>
                )}

                {/* Timeline */}
                {(form.timeline_script || form.timeline_shoot || form.timeline_edit || form.timeline_publish) && (
                  <BriefSection title="📅 Timeline">
                    <div className="space-y-1.5">
                      {form.timeline_script && <TimelineRow label="Draft script" date={form.timeline_script} />}
                      {form.timeline_shoot && <TimelineRow label="Shooting" date={form.timeline_shoot} />}
                      {form.timeline_edit && <TimelineRow label="Editing" date={form.timeline_edit} />}
                      {form.timeline_publish && <TimelineRow label="Publish" date={form.timeline_publish} done />}
                    </div>
                  </BriefSection>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── EDIT MODE ─────────────────────────────────────────────── */}
        {mode === 'edit' && (
          <div className="mt-2 space-y-5">
            {/* Deadline */}
            <EditSection icon={<Calendar className="size-4" />} title="Deadline & Platform">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Deadline</Label>
                  <Input value={form.deadline} onChange={e => upd('deadline', e.target.value)} placeholder="20 Juli 2025" />
                </div>
                <div className="space-y-1.5 opacity-60">
                  <Label className="text-xs">Platform</Label>
                  <Input value={platform?.name || '-'} disabled />
                </div>
              </div>
            </EditSection>

            {/* Overview */}
            <EditSection icon={<FileText className="size-4" />} title="Overview / Narasi">
              <Textarea
                value={form.narasi}
                onChange={e => upd('narasi', e.target.value)}
                placeholder="Jelaskan konsep konten, angle, dan tujuan utama..."
                className="min-h-[80px] text-sm"
              />
            </EditSection>

            {/* Target Audience */}
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

            {/* Tone */}
            <EditSection icon={<MessageSquare className="size-4" />} title="Tone of Voice">
              <Textarea
                value={form.tone}
                onChange={e => upd('tone', e.target.value)}
                placeholder="Contoh: Fun & Casual — pakai bahasa sehari-hari, relatable, boleh sisipkan humor ringan"
                className="text-sm"
              />
            </EditSection>

            {/* Format Video */}
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
                  <Label className="text-xs">Repurpose ke</Label>
                  <Input value={form.repurpose} onChange={e => upd('repurpose', e.target.value)} placeholder="YouTube Shorts, TikTok" />
                </div>
              </div>
            </EditSection>

            {/* Referensi Visual */}
            <EditSection icon={<Image className="size-4" />} title="Referensi Visual">
              <Textarea
                value={form.ref_visual}
                onChange={e => upd('ref_visual', e.target.value)}
                placeholder="Deskripsikan referensi visual, link Pinterest, akun Instagram, dll..."
                className="text-sm"
              />
            </EditSection>

            {/* Timeline */}
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

            {/* Footer */}
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

function BriefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2.5">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function BriefRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={`flex ${multiline ? 'flex-col gap-0.5' : 'items-start gap-2'}`}>
      <span className="text-xs text-muted-foreground shrink-0 w-28">{label}:</span>
      <span className={`text-xs font-medium leading-relaxed ${multiline ? '' : 'flex-1'}`}>{value}</span>
    </div>
  );
}

function TimelineRow({ label, date, done }: { label: string; date: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className={`size-2 rounded-full shrink-0 ${done ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
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
