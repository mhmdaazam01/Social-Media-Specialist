'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PlusIcon, EditIcon, Trash2Icon, ClipboardListIcon } from 'lucide-react';
import { IdeaModal } from '@/components/planner/IdeaModal';
import { BriefModal } from '@/components/planner/BriefModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { Badge, PlatformBadge } from '@/components/cly';
import type { ContentIdea, PostStatus } from '@/types';

export default function PlannerPage() {
  const { ideas, loading: ideasLoading, deleteIdea } = useIdeas();

  // Brief modal (view/edit brief) — opened by clicking the card
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefIdea, setBriefIdea] = useState<ContentIdea | null>(null);

  // Idea modal (edit metadata) — opened by the pencil button on card
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState<ContentIdea | null>(null);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<ContentIdea | null>(null);

  // Group ideas by status (Kanban columns)
  const columns: Record<PostStatus, ContentIdea[]> = useMemo(() => {
    return {
      idea: ideas.filter(i => i.status === 'idea'),
      brief: ideas.filter(i => i.status === 'brief'),
      draft: ideas.filter(i => i.status === 'draft'),
      ready: ideas.filter(i => i.status === 'ready'),
    };
  }, [ideas]);

  const columnConfig: Array<{ key: PostStatus; label: string; color: string }> = [
    { key: 'idea', label: 'Idea', color: '#94A3B8' },
    { key: 'brief', label: 'Brief', color: '#60A5FA' },
    { key: 'draft', label: 'Draft', color: '#FBBF24' },
    { key: 'ready', label: 'Ready', color: '#34D399' },
  ];

  function handleAdd() {
    setEditIdea(null);
    setModalOpen(true);
  }

  // Klik card → BriefModal (view mode)
  function handleView(idea: ContentIdea) {
    setBriefIdea(idea);
    setBriefOpen(true);
  }

  // Pencil button → IdeaModal (edit metadata)
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

  function handleModalClose(open: boolean) {
    setModalOpen(open);
    if (!open) setEditIdea(null);
  }

  return (
    <AppShell title="Planner">
      <div className="flex flex-col gap-[18px] p-[18px]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-cly-lg font-semibold text-cly-text">Content Planner</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
          >
            <PlusIcon className="size-4" />
            Ide Baru
          </button>
        </div>

        {/* Empty State */}
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] bg-cly-surface py-20 shadow-cly">
            <ClipboardListIcon className="size-10 text-cly-text-muted" />
            <p className="text-cly-sm text-cly-text-muted">Belum ada ide konten. Yuk mulai brainstorm!</p>
            <button
              onClick={handleAdd}
              className="rounded-lg border border-cly-border bg-cly-surface px-4 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:bg-cly-brand hover:text-white"
            >
              Buat Ide Pertama
            </button>
          </div>
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-4">
            {columnConfig.map(col => {
              const colIdeas = columns[col.key];
              return (
                <div key={col.key} className="flex flex-col gap-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between rounded-[10px] bg-cly-surface px-4 py-3 shadow-cly">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-cly-sm font-semibold text-cly-text">{col.label}</span>
                    </div>
                    <span className="text-cly-xs font-medium text-cly-text-muted">{colIdeas.length}</span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex flex-col gap-2.5">
                    {colIdeas.map(idea => {
                      const priorityColor =
                        idea.priority === 'high' ? 'red' : idea.priority === 'med' ? 'amber' : 'neutral';
                      return (
                        <div
                          key={idea.id}
                          className="group relative rounded-[10px] border-t-4 bg-cly-surface p-3.5 shadow-cly transition-all hover:shadow-cly-hover"
                          style={{ borderTopColor: col.color }}
                        >
                          {/* Card Click → Opens Brief Modal */}
                          <button
                            onClick={() => handleView(idea)}
                            className="w-full text-left"
                          >
                            <h4 className="mb-2 text-cly-sm font-semibold text-cly-text">{idea.title}</h4>
                            {idea.description && (
                              <p className="mb-3 line-clamp-2 text-cly-xs text-cly-text-muted">{idea.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              <PlatformBadge platform={idea.platform} />
                              <Badge tone={priorityColor}>{idea.priority}</Badge>
                              {idea.pillar && <Badge tone="blue">{idea.pillar}</Badge>}
                            </div>
                          </button>

                          {/* Action Buttons (Edit/Delete) */}
                          <div className="mt-3 flex items-center gap-1 border-t border-cly-border pt-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleEdit(idea)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-cly-xs text-cly-text-muted transition-colors hover:bg-cly-muted hover:text-cly-text"
                            >
                              <EditIcon className="size-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(idea.id)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-cly-xs text-cly-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2Icon className="size-3" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Brief modal — view/edit content brief */}
        <BriefModal
          open={briefOpen}
          onOpenChange={setBriefOpen}
          idea={briefIdea}
        />

        {/* Idea modal — edit metadata (title, platform, status, etc.) */}
        <IdeaModal
          open={modalOpen}
          onOpenChange={handleModalClose}
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
