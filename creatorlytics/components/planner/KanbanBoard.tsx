'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IdeaCard } from './IdeaCard';
import type { ContentIdea } from '@/types';

interface KanbanBoardProps {
  ideas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
}

const columns = ['idea', 'brief', 'draft', 'ready'] as const;

const columnLabels: Record<string, string> = {
  idea: 'Idea',
  brief: 'Brief',
  draft: 'Draft',
  ready: 'Ready',
};

export function KanbanBoard({ ideas, onEdit, onDelete }: KanbanBoardProps) {
  const grouped = useMemo(() => {
    const map: Record<string, ContentIdea[]> = { idea: [], brief: [], draft: [], ready: [] };
    for (const idea of ideas) {
      if (map[idea.status]) {
        map[idea.status].push(idea);
      }
    }
    return map;
  }, [ideas]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-x-visible">
      {columns.map(status => (
        <div key={status} className="flex min-w-[260px] flex-1 flex-col gap-3 lg:min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium capitalize">{columnLabels[status]}</h3>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
              {grouped[status].length}
            </span>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="flex flex-col gap-2 pr-3">
              {grouped[status].length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Belum ada ide</p>
              ) : (
                grouped[status].map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={() => onEdit(idea)}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
