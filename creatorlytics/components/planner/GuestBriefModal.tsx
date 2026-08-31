'use client';

import { getValidHref } from '@/lib/utils/link';
import { sanitizeHtml } from '@/lib/utils/sanitizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge, PlatformBadge } from '@/components/cly';
import { Calendar, Target, ClipboardList, Link2, Megaphone, Smartphone } from 'lucide-react';
import type { ContentIdea, ContentBrief } from '@/types';

interface GuestBriefModalProps {
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
  ref_visual: '',
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

export function GuestBriefModal({ open, onOpenChange, idea }: GuestBriefModalProps) {
  if (!idea) return null;

  const brief = getBrief(idea);
  const priority = idea.priority || 'med';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Content Brief
              </p>
              <DialogTitle className="text-lg font-bold leading-snug">{idea.title || 'Tanpa judul'}</DialogTitle>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {idea.platform && (
                  <PlatformBadge platform={idea.platform} />
                )}
                {idea.pillar && (
                  <Badge tone="blue">{idea.pillar}</Badge>
                )}
                {idea.format && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {idea.format}
                  </span>
                )}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[priority]}`}>
                  Prioritas {PRIORITY_LABEL[priority]}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── VIEW MODE ─────────────────────────────────────────────── */}
        <div className="mt-1 space-y-4 text-sm">
          {/* Deadline */}
          {brief.deadline && (
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>Deadline:</span>
              <span className="font-semibold text-foreground">{brief.deadline}</span>
            </div>
          )}

          {brief.deadline && <hr className="border-border/60" />}

          {/* OVERVIEW */}
          <ViewSection icon={<ClipboardList className="size-3.5" />} title="Overview">
            <ViewRow label="Judul" value={idea.title || 'Tanpa judul'} />
            {brief.narasi
              ? <ViewRow label="Narasi" value={brief.narasi} multiline />
              : idea.description
                ? <ViewRow label="Deskripsi" value={idea.description} multiline />
                : null}
            {idea.pillar && <ViewRow label="Content Pillar" value={idea.pillar} />}
            {idea.platform && <ViewRow label="Platform" value={idea.platform} />}
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
              <p className="text-xs text-muted-foreground/60 italic">Belum diisi.</p>
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
            {(brief.format_video || brief.durasi || idea.format || (idea.ref_links && idea.ref_links.length > 0)) ? (
              <>
                {(brief.format_video || idea.format) && (
                  <ViewRow label="Format" value={brief.format_video || idea.format || ''} />
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
      </DialogContent>
    </Dialog>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ViewSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card/60 p-4 space-y-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        <span className="text-muted-foreground">{icon}</span> {title}
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
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
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
