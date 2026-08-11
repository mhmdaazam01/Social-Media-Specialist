'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EditIcon, Trash2Icon, ClipboardListIcon, FileText, Lightbulb, Link2, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const IdeaModal = dynamic(() => import('@/components/planner/IdeaModal').then(m => m.IdeaModal), { ssr: false });
const BriefModal = dynamic(() => import('@/components/planner/BriefModal').then(m => m.BriefModal), { ssr: false });
const CreateBriefModal = dynamic(() => import('@/components/planner/CreateBriefModal').then(m => m.CreateBriefModal), { ssr: false });
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { Badge, PlatformBadge } from '@/components/cly';
import type { ContentIdea, PostStatus } from '@/types';

export default function PlannerPage() {
  const { ideas, createIdea, deleteIdea } = useIdeas();

  // Brief modal (view/edit brief) — opened by clicking the card
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefIdea, setBriefIdea] = useState<ContentIdea | null>(null);

  // Idea modal (edit metadata) — opened by the pencil button on card
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState<ContentIdea | null>(null);

  // Create Brief modal — opened by "Buat Brief" button
  const [createBriefOpen, setCreateBriefOpen] = useState(false);
  const [editBriefIdea, setEditBriefIdea] = useState<ContentIdea | null>(null);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<ContentIdea | null>(null);

  // Group ideas by status (Kanban columns)
  const columns: Record<PostStatus, ContentIdea[]> = useMemo(() => {
    return {
      idea: ideas.filter(i => i.status === 'idea'),
      brief: ideas.filter(i => i.status === 'brief'),
    };
  }, [ideas]);

  const columnConfig: Array<{ key: PostStatus; label: string; color: string }> = [
    { key: 'idea', label: 'Idea Bank', color: '#94A3B8' },
    { key: 'brief', label: 'Brief', color: '#60A5FA' },
  ];

  function handleAddIdea() {
    setEditIdea(null);
    setModalOpen(true);
  }

  function handleAddBrief() {
    setEditBriefIdea(null);
    setCreateBriefOpen(true);
  }

  // Klik card → BriefModal (view mode)
  function handleView(idea: ContentIdea) {
    setBriefIdea(idea);
    setBriefOpen(true);
  }

  // Pencil button → IdeaModal for Ideas, CreateBriefModal for Briefs
  function handleEdit(idea: ContentIdea) {
    if (idea.status === 'brief') {
      setEditBriefIdea(idea);
      setCreateBriefOpen(true);
    } else {
      setEditIdea(idea);
      setModalOpen(true);
    }
  }

  async function handleDuplicate(idea: ContentIdea) {
    try {
      const briefData = idea.brief && typeof idea.brief === 'object' ? { ...idea.brief } : {};
      const newTitle = `${idea.title || 'Konten'} (Salinan)`;
      
      await createIdea({
        title: newTitle,
        description: idea.description,
        platform: idea.platform,
        pillar: idea.pillar,
        format: idea.format,
        status: idea.status,
        priority: idea.priority,
        tags: idea.tags || [],
        brief: briefData,
        ref_links: idea.ref_links || [],
      });
      toast.success(`"${newTitle}" berhasil diduplikat!`);
    } catch {
      toast.error('Gagal menduplikat');
    }
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

  function handleCreateBriefClose(open: boolean) {
    setCreateBriefOpen(open);
    if (!open) setEditBriefIdea(null);
  }

  return (
    <AppShell title="Planner">
      <div className="flex flex-col gap-[18px] p-[18px]">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-cly-lg font-semibold text-cly-text">Content Planner</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddBrief}
              className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-4 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:text-cly-brand active:scale-95"
            >
              <FileText className="size-4" />
              Buat Brief
            </button>
            <button
              onClick={handleAddIdea}
              className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
            >
              <Lightbulb className="size-4" />
              Buat Ide
            </button>
          </div>
        </div>

        {/* Empty State */}
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[10px] bg-cly-surface py-20 shadow-cly">
            <ClipboardListIcon className="size-10 text-cly-text-muted" />
            <p className="text-cly-sm text-cly-text-muted">Belum ada konten. Yuk mulai!</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBrief}
                className="flex items-center gap-1.5 rounded-lg border border-cly-border bg-cly-surface px-4 py-2 text-cly-sm font-medium text-cly-text transition-all hover:border-cly-brand hover:text-cly-brand"
              >
                <FileText className="size-4" />
                Buat Brief
              </button>
              <button
                onClick={handleAddIdea}
                className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-2 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover"
              >
                <Lightbulb className="size-4" />
                Buat Ide
              </button>
            </div>
          </div>
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
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
                            <h4 className="mb-2 text-cly-sm font-semibold text-cly-text">{idea.title || <span className="text-cly-text-muted italic">Tanpa judul</span>}</h4>
                            {idea.description && (
                              <p className="mb-3 line-clamp-2 text-cly-xs text-cly-text-muted">{idea.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              <PlatformBadge platform={idea.platform} />
                              <Badge tone={priorityColor}>{idea.priority}</Badge>
                              {idea.pillar && <Badge tone="blue">{idea.pillar}</Badge>}
                            </div>
                          </button>

                          {/* Ref Links */}
                          {idea.ref_links && idea.ref_links.filter(Boolean).length > 0 && (
                            <div className="mt-2.5 flex flex-col gap-1">
                              {idea.ref_links.filter(Boolean).map((link, i) => (
                                <a
                                  key={i}
                                  href={link.startsWith('http') ? link : `https://${link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1.5 text-cly-xs text-blue-500 hover:text-blue-600 hover:underline truncate"
                                >
                                  <Link2 className="size-3 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons (Edit/Duplicate/Delete) */}
                          <div className="mt-3 flex items-center gap-1 border-t border-cly-border pt-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleEdit(idea)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-cly-xs text-cly-text-muted transition-colors hover:bg-cly-muted hover:text-cly-text"
                            >
                              <EditIcon className="size-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicate(idea)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-cly-xs text-cly-text-muted transition-colors hover:bg-cly-muted hover:text-cly-brand"
                              title="Duplikat brief/ide ini"
                            >
                              <CopyIcon className="size-3" />
                              Duplikat
                            </button>
                            <button
                              onClick={() => confirmDelete(idea.id)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-cly-xs text-cly-text-muted transition-colors hover:bg-red-50 hover:text-red-600 ml-auto"
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

        {/* Create Brief modal — dedicated creation form */}
        <CreateBriefModal
          open={createBriefOpen}
          onOpenChange={handleCreateBriefClose}
          editIdea={editBriefIdea}
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
