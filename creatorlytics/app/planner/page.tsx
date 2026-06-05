'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { KanbanBoard } from '@/components/planner/KanbanBoard';
import { IdeaModal } from '@/components/planner/IdeaModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { ClipboardListIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentIdea } from '@/types';

export default function PlannerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState<ContentIdea | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<ContentIdea | null>(null);
  const { ideas, loading: ideasLoading, deleteIdea } = useIdeas();

  function handleAdd() {
    setEditIdea(null);
    setModalOpen(true);
  }

  function handleEdit(idea: ContentIdea) {
    setEditIdea(idea);
    setModalOpen(true);
  }

  function confirmDelete(id: string) {
    const idea = ideas.find(i => i.id === id) ?? null;
    setIdeaToDelete(idea);
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirmed() {
    if (ideaToDelete) {
      deleteIdea(ideaToDelete.id);
      setIdeaToDelete(null);
    }
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

        {ideasLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <ClipboardListIcon className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada ide konten. Yuk mulai brainstorm!</p>
            <Button variant="outline" onClick={handleAdd}>Buat Ide Pertama</Button>
          </div>
        ) : (
          <KanbanBoard
            ideas={ideas}
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        )}

        <IdeaModal
          open={modalOpen}
          onOpenChange={handleClose}
          editIdea={editIdea}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirmed}
          title="Hapus Ide"
          description={`Apakah Anda yakin ingin menghapus ide "${ideaToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          cancelText="Batal"
        />
      </div>
    </AppShell>
  );
}
