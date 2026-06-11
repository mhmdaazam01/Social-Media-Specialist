'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon, Pencil } from 'lucide-react';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import type { ContentIdea } from '@/types';

interface IdeaCardProps {
  idea: ContentIdea;
  onView: (idea: ContentIdea) => void;   // klik card → BriefModal (view)
  onEdit: (idea: ContentIdea) => void;   // tombol edit → IdeaModal (edit metadata)
  onDelete: (id: string) => void;
}

export function IdeaCard({ idea, onView, onEdit, onDelete }: IdeaCardProps) {
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();

  const platform = platforms.find(p => p.platform_id === idea.platform);
  const pillar = pillars.find(p => p.pillar_id === idea.pillar);

  const priorityColor: Record<string, string> = {
    high: 'bg-red-500',
    med: 'bg-yellow-500',
    low: 'bg-gray-400',
  };

  return (
    <Card
      size="sm"
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onView(idea)}
    >
      <CardContent className="flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`inline-block mt-0.5 size-2 shrink-0 rounded-full ${priorityColor[idea.priority]}`} />
            <span className="truncate text-sm font-medium">{idea.title}</span>
          </div>
          {/* Action buttons — stop propagation so card click doesn't fire */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={e => { e.stopPropagation(); onEdit(idea); }}
              aria-label="Edit ide"
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={e => { e.stopPropagation(); onDelete(idea.id); }}
              aria-label="Hapus ide"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        {(platform || pillar) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {platform && <Badge variant="secondary" className="text-[10px]">{platform.name}</Badge>}
            {pillar && (
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: pillar.color, color: pillar.color }}>
                {pillar.label}
              </Badge>
            )}
          </div>
        )}

        {/* Status */}
        <div>
          <Badge variant="secondary" className="text-[10px] capitalize">{idea.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
