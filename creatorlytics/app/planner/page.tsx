'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { KanbanBoard } from '@/components/planner/KanbanBoard';
import { IdeaModal } from '@/components/planner/IdeaModal';
import { useIdeas } from '@/lib/hooks/useIdeas';
import type { ContentIdea } from '@/types';

export default function PlannerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState<ContentIdea | null>(null);
  const { ideas, deleteIdea } = useIdeas();

  function handleAdd() {
    setEditIdea(null);
    setModalOpen(true);
  }

  function handleEdit(idea: ContentIdea) {
    setEditIdea(idea);
    setModalOpen(true);
  }

  function handleClose(open: boolean) {
    setModalOpen(open);
    if (!open) setEditIdea(null);
  }

  return (
    <AppShell title="Planner">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Content Planner</h2>
          <Button onClick={handleAdd}>
            <PlusIcon />
            Ide Baru
          </Button>
        </div>

        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-muted-foreground">Belum ada ide konten. Yuk mulai brainstorm!</p>
            <Button variant="outline" onClick={handleAdd}>Buat Ide Pertama</Button>
          </div>
        ) : (
          <KanbanBoard
            ideas={ideas}
            onEdit={handleEdit}
            onDelete={deleteIdea}
          />
        )}

        <IdeaModal
          open={modalOpen}
          onOpenChange={handleClose}
          editIdea={editIdea}
        />
      </div>
    </AppShell>
  );
}
