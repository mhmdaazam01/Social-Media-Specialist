'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { CompetitorCard } from '@/components/competitor/CompetitorCard';
import { CompetitorModal } from '@/components/competitor/CompetitorModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCompetitors } from '@/lib/hooks/useCompetitors';
import { PlusIcon, UsersIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Competitor } from '@/types';

export default function CompetitorPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCompetitor, setEditCompetitor] = useState<Competitor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [competitorToDelete, setCompetitorToDelete] = useState<Competitor | null>(null);
  const { competitors, loading: competitorsLoading, deleteCompetitor } = useCompetitors();

  function handleAdd() {
    setEditCompetitor(null);
    setModalOpen(true);
  }

  function handleEdit(c: Competitor) {
    setEditCompetitor(c);
    setModalOpen(true);
  }

  function confirmDelete(competitor: Competitor) {
    setCompetitorToDelete(competitor);
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirmed() {
    if (competitorToDelete) {
      deleteCompetitor(competitorToDelete.id);
      setCompetitorToDelete(null);
    }
  }

  function handleCloseModal(open: boolean) {
    setModalOpen(open);
    if (!open) setEditCompetitor(null);
  }

  return (
    <AppShell title="Kompetitor">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Daftar Kompetitor</h2>
          <Button onClick={handleAdd}>
            <PlusIcon />
            Tambah Kompetitor
          </Button>
        </div>

        {competitorsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : competitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UsersIcon className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Belum ada kompetitor. Pantau kompetitormu di sini!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.map(c => (
              <CompetitorCard
                key={c.id}
                competitor={c}
                onEdit={handleEdit}
                onDelete={() => confirmDelete(c)}
              />
            ))}
          </div>
        )}

        <CompetitorModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          editCompetitor={editCompetitor}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirmed}
          title="Hapus Kompetitor"
          description={`Apakah Anda yakin ingin menghapus "${competitorToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          cancelText="Batal"
        />
      </div>
    </AppShell>
  );
}
