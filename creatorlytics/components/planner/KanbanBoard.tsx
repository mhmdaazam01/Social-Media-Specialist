'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IdeaCard } from './IdeaCard';
import { useIdeas } from '@/lib/hooks/useIdeas';
import type { ContentIdea } from '@/types';
import type { PostStatus } from '@/types';

/* ── Types ──────────────────────────────────────────────────────────────── */
interface KanbanBoardProps {
  ideas: ContentIdea[];
  onView: (idea: ContentIdea) => void;
  onEdit: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: PostStatus[] = ['idea', 'brief', 'draft', 'ready'];

const COLUMN_LABELS: Record<PostStatus, string> = {
  idea: 'Idea',
  brief: 'Brief',
  draft: 'Draft',
  ready: 'Ready',
};

const COLUMN_COLORS: Record<PostStatus, string> = {
  idea: 'bg-slate-400',
  brief: 'bg-amber-400',
  draft: 'bg-blue-400',
  ready: 'bg-emerald-400',
};

/* ── Sortable card wrapper ───────────────────────────────────────────────── */
function SortableIdeaCard({
  idea,
  onView,
  onEdit,
  onDelete,
}: {
  idea: ContentIdea;
  onView: (idea: ContentIdea) => void;
  onEdit: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: { idea },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* listeners on a drag handle div so card click still works */}
      <div {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <IdeaCard
          idea={idea}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

/* ── Column ──────────────────────────────────────────────────────────────── */
function KanbanColumn({
  status,
  ideas,
  onView,
  onEdit,
  onDelete,
}: {
  status: PostStatus;
  ideas: ContentIdea[];
  onView: (idea: ContentIdea) => void;
  onEdit: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
}) {
  const ids = ideas.map(i => i.id);

  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-3 lg:min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full shrink-0 ${COLUMN_COLORS[status]}`} />
        <h3 className="text-sm font-medium">{COLUMN_LABELS[status]}</h3>
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
          {ideas.length}
        </span>
      </div>

      {/* Drop zone */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 pr-3 min-h-[80px]">
            {ideas.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border/40 py-8 text-xs text-muted-foreground/50">
                Drag ide ke sini
              </div>
            ) : (
              ideas.map(idea => (
                <SortableIdeaCard
                  key={idea.id}
                  idea={idea}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

/* ── Main Board ──────────────────────────────────────────────────────────── */
export function KanbanBoard({ ideas, onView, onEdit, onDelete }: KanbanBoardProps) {
  const { updateIdea } = useIdeas();

  // Local optimistic state — mirror ideas prop but track drag changes immediately
  const [localIdeas, setLocalIdeas] = useState<ContentIdea[]>(ideas);
  const [activeIdea, setActiveIdea] = useState<ContentIdea | null>(null);

  // Sync when parent ideas prop changes (new idea added, deleted, etc.)
  useMemo(() => {
    setLocalIdeas(ideas);
  }, [ideas]);

  const grouped = useMemo(() => {
    const map: Record<PostStatus, ContentIdea[]> = { idea: [], brief: [], draft: [], ready: [] };
    for (const idea of localIdeas) {
      if (map[idea.status]) map[idea.status].push(idea);
    }
    return map;
  }, [localIdeas]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // require 8px move before drag starts
    })
  );

  function handleDragStart({ active }: DragStartEvent) {
    const idea = localIdeas.find(i => i.id === active.id);
    setActiveIdea(idea ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeIdea = localIdeas.find(i => i.id === activeId);
    if (!activeIdea) return;

    // Determine target column — over could be a card id or a column id
    const overIsColumn = COLUMNS.includes(overId as PostStatus);
    const targetStatus: PostStatus = overIsColumn
      ? (overId as PostStatus)
      : (localIdeas.find(i => i.id === overId)?.status ?? activeIdea.status);

    if (activeIdea.status === targetStatus) return;

    // Optimistic update
    setLocalIdeas(prev =>
      prev.map(i => i.id === activeId ? { ...i, status: targetStatus } : i)
    );
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveIdea(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const movedIdea = localIdeas.find(i => i.id === activeId);
    if (!movedIdea) return;

    const overIsColumn = COLUMNS.includes(overId as PostStatus);
    const targetStatus: PostStatus = overIsColumn
      ? (overId as PostStatus)
      : (localIdeas.find(i => i.id === overId)?.status ?? movedIdea.status);

    // Persist if status changed
    if (movedIdea.status !== targetStatus) {
      await updateIdea(activeId, { status: targetStatus });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-x-visible">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            ideas={grouped[status]}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Drag overlay — ghost card while dragging */}
      <DragOverlay>
        {activeIdea && (
          <div className="rotate-1 scale-105 opacity-90 shadow-xl">
            <IdeaCard
              idea={activeIdea}
              onView={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
