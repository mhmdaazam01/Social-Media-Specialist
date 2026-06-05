'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@/types';

interface GoalCardProps {
  goal: Goal;
  progress: number;
  actual: number;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, progress, actual, onEdit, onDelete }: GoalCardProps) {
  const capped = Math.min(progress, 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{goal.label}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {goal.metric} &middot; {goal.platform === 'all' ? 'Semua Platform' : goal.platform}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(goal)} aria-label="Edit goal">
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(goal.id)} aria-label="Hapus goal">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold">{capped}%</span>
          <span className="text-sm text-muted-foreground">
            {actual.toLocaleString('id-ID')} / {goal.target.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${capped}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
