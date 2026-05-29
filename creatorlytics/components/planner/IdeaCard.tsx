'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';
import { usePillarStore } from '@/lib/store/pillar-store';
import type { ContentIdea } from '@/types';

interface IdeaCardProps {
  idea: ContentIdea;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function IdeaCard({ idea, onClick, onDelete }: IdeaCardProps) {
  const { platforms } = usePlatformStore();
  const { pillars } = usePillarStore();

  const platform = platforms.find(p => p.platform_id === idea.platform);
  const pillar = pillars.find(p => p.pillar_id === idea.pillar);

  const priorityColor: Record<string, string> = {
    high: 'bg-red-500',
    med: 'bg-yellow-500',
    low: 'bg-gray-400',
  };

  return (
    <Card size="sm" className="cursor-pointer" onClick={onClick}>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`inline-block mt-0.5 size-2 shrink-0 rounded-full ${priorityColor[idea.priority]}`} />
            <span className="truncate text-sm font-medium">{idea.title}</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onDelete(idea.id); }}>
            <XIcon />
          </Button>
        </div>
        {(platform || pillar) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {platform && <Badge variant="secondary" className="text-[10px]">{platform.name}</Badge>}
            {pillar && <Badge variant="outline" className="text-[10px]" style={{ borderColor: pillar.color, color: pillar.color }}>{pillar.label}</Badge>}
          </div>
        )}
        <div>
          <Badge variant="secondary" className="text-[10px] capitalize">{idea.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
