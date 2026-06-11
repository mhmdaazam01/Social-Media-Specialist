'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon, FileText } from 'lucide-react';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import type { ContentIdea } from '@/types';

interface IdeaCardProps {
  idea: ContentIdea;
  onClick: () => void;
  onDelete: (id: string) => void;
  onBrief: (idea: ContentIdea) => void;
}

export function IdeaCard({ idea, onClick, onDelete, onBrief }: IdeaCardProps) {
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();

  const platform = platforms.find(p => p.platform_id === idea.platform);
  const pillar = pillars.find(p => p.pillar_id === idea.pillar);

  const priorityColor: Record<string, string> = {
    high: 'bg-red-500',
    med: 'bg-yellow-500',
    low: 'bg-gray-400',
  };

  const hasBrief = typeof idea.brief === 'object' &&
    idea.brief !== null &&
    'deadline' in idea.brief &&
    Object.values(idea.brief as Record<string, string>).some(v => v !== '');

  return (
    <Card size="sm" className="cursor-pointer" onClick={onClick}>
      <CardContent className="flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`inline-block mt-0.5 size-2 shrink-0 rounded-full ${priorityColor[idea.priority]}`} />
            <span className="truncate text-sm font-medium">{idea.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={e => { e.stopPropagation(); onDelete(idea.id); }}
            aria-label="Hapus ide"
          >
            <XIcon />
          </Button>
        </div>

        {/* Badges */}
        {(platform || pillar) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {platform && <Badge variant="secondary" className="text-[10px]">{platform.name}</Badge>}
            {pillar && (
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: pillar.color, color: pillar.color }}>
                {pillar.label}
              </Badge>
            )}
          </div>
        )}

        {/* Bottom row: status + brief button */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <Badge variant="secondary" className="text-[10px] capitalize">{idea.status}</Badge>
          <Button
            type="button"
            variant={hasBrief ? 'default' : 'outline'}
            size="icon-xs"
            onClick={e => { e.stopPropagation(); onBrief(idea); }}
            aria-label="Buka brief"
            className={`h-6 px-2 gap-1 text-[10px] font-semibold ${hasBrief ? 'bg-indigo-600 hover:bg-indigo-700 border-0 text-white' : ''}`}
          >
            <FileText className="size-3 shrink-0" />
            Brief
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
