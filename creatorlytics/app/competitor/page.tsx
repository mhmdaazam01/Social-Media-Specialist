'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { CompetitorCard } from '@/components/competitor/CompetitorCard';
import { CompetitorModal } from '@/components/competitor/CompetitorModal';
import { useCompetitorStore } from '@/lib/store/competitor-store';
import { PlusIcon, UsersIcon } from 'lucide-react';
import type { Competitor } from '@/types';

export default function CompetitorPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCompetitor, setEditCompetitor] = useState<Competitor | null>(null);
  const { competitors, deleteCompetitor } = useCompetitorStore();

  function handleAdd() {
    setEditCompetitor(null);
    setModalOpen(true);
  }

  function handleEdit(c: Competitor) {
    setEditCompetitor(c);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    deleteCompetitor(id);
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

        {competitors.length === 0 ? (
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
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <CompetitorModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          editCompetitor={editCompetitor}
        />
      </div>
    </AppShell>
  );
}
