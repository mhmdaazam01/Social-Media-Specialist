'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fmt, fmtPercent } from '@/lib/utils/analytics';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import type { Competitor } from '@/types';

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit: (c: Competitor) => void;
  onDelete: (id: string) => void;
}

export function CompetitorCard({ competitor, onEdit, onDelete }: CompetitorCardProps) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{competitor.name}</p>
              {competitor.platform && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {competitor.platform}
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">Followers:</span>
              <span>{fmt(competitor.followers)}</span>
              <span className="text-muted-foreground">Avg Reach:</span>
              <span>{fmt(competitor.avg_reach)}</span>
              <span className="text-muted-foreground">Avg ER:</span>
              <span>{fmtPercent(competitor.avg_er)}</span>
              <span className="text-muted-foreground">Post/minggu:</span>
              <span>{competitor.post_freq}</span>
            </div>
            {competitor.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                {competitor.notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(competitor)}>
              <PencilIcon />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(competitor.id)}>
              <Trash2Icon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
