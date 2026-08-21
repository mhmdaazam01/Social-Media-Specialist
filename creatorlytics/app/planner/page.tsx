'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EditIcon, Trash2Icon, ClipboardListIcon, FileText, Lightbulb, Link2, CopyIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const IdeaModal = dynamic(() => import('@/components/planner/IdeaModal').then(m => m.IdeaModal), { ssr: false });
const BriefModal = dynamic(() => import('@/components/planner/BriefModal').then(m => m.BriefModal), { ssr: false });
const CreateBriefModal = dynamic(() => import('@/components/planner/CreateBriefModal').then(m => m.CreateBriefModal), { ssr: false });
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { Badge, PlatformBadge } from '@/components/cly';
import { ShareButton } from '@/components/collaboration/ShareButton';
import { useUser } from '@/lib/hooks/useUser';
import { useCollaboration } from '@/lib/context/CollaborationContext';
import type { ContentIdea, PostStatus } from '@/types';

export default function PlannerPage() {
  const { ideas, createIdea, deleteIdea } = useIdeas();
  const { user } = useUser();
  const { sharedWithMe, activeWorkspaceId, activeWorkspace, getRoleInWorkspace } = useCollaboration();

  // Determine role dynamically:
  // - If activeWorkspaceId === user.id → owner (can do everything)
  // - If on someone else's workspace → check their role (viewer/editor)
  const isOwnWorkspace = !activeWorkspaceId || activeWorkspaceId === user?.id;
  const roleInActiveWorkspace = isOwnWorkspace ? 'owner' : getRoleInWorkspace(activeWorkspaceId ?? '');
  const isViewer = !isOwnWorkspace && roleInActiveWorkspace === 'viewer';
  const isEditor = !isOwnWorkspace && roleInActiveWorkspace === 'editor';

  // Brief modal (view/edit brief) — opened by clicking the card
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefIdea, setBriefIdea] = useState<ContentIdea | null>(null);
  const [briefInitialMode, setBriefInitialMode] = useState<'view' | 'edit'>('view');

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
    setBriefInitialMode('view');
    setBriefIdea(idea);
    setBriefOpen(true);
  }

  // Pencil button → IdeaModal for Ideas, BriefModal for Briefs (in edit mode)
  function handleEdit(idea: ContentIdea) {
    if (idea.status === 'brief') {
      setBriefInitialMode('edit');
      setBriefIdea(idea);
      setBriefOpen(true);
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
      <style jsx global>{`
        .planner-typography h1,
        .planner-typography h2,
        .planner-typography h3,
        .planner-typography h4,
        .planner-typography button[class*="font-bold"],
        .planner-typography span[class*="font-bold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .planner-typography button[class*="font-semibold"],
        .planner-typography button[class*="font-medium"],
        .planner-typography span[class*="uppercase"][class*="tracking"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .planner-typography p,
        .planner-typography span:not([class*="font-bold"]):not([class*="font-semibold"]):not([class*="font-medium"]),
        .planner-typography div[class*="text-xs"]:not([class*="font-bold"]):not([class*="font-semibold"]):not([class*="font-medium"]),
        .planner-typography a {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-[18px] p-[18px] planner-typography">
        
        {/* Active Workspace Banner */}
        {activeWorkspace && (
          <div className="flex items-center gap-2 rounded-xl border border-cly-brand/30 bg-gradient-to-br from-cly-brand/10 to-white px-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-center size-6 rounded-lg bg-gradient-to-br from-[#A8E6CF] to-[#6ECDB0] text-white">
              <Eye className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-cly-text truncate">
                Melihat workspace milik <span className="font-bold">{activeWorkspace.ownerName}</span>
              </p>
              <p className="text-[10px] text-cly-text-3 truncate">{activeWorkspace.ownerEmail}</p>
            </div>
            <span className="rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#6ECDB0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {roleInActiveWorkspace}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-cly-lg font-bold text-cly-text">Content Planner</h2>
            {sharedWithMe.length > 0 && isOwnWorkspace && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-br from-[#8EC5FC] to-[#6BA3E8] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Eye className="size-3" />
                {sharedWithMe.length} Shared
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOwnWorkspace && <ShareButton targetType="planner" />}
            {(isOwnWorkspace || isEditor) && (
              <>
                <button
                  onClick={handleAddBrief}
                  className="flex items-center gap-1.5 rounded-lg bg-white border border-cly-border px-4 py-2 text-xs font-semibold text-cly-text transition-all hover:shadow-md hover:border-[#8EC5FC] hover:text-[#8EC5FC] active:scale-95 shadow-sm"
                >
                  <FileText className="size-4" />
                  Buat Brief
                </button>
                <button
                  onClick={handleAddIdea}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95 shadow-md"
                >
                  <Lightbulb className="size-4" />
                  Buat Ide
                </button>
              </>
            )}
          </div>
        </div>

        {/* Empty State */}
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-cly-muted to-white py-20 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-[#C5B9E8] to-[#A899D8] shadow-lg">
              <ClipboardListIcon className="size-8 text-white" />
            </div>
            <p className="text-sm text-cly-text-2 font-medium">Belum ada konten. Yuk mulai!</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBrief}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-cly-border px-4 py-2 text-xs font-semibold text-cly-text transition-all hover:shadow-md hover:border-[#8EC5FC] hover:text-[#8EC5FC] shadow-sm"
              >
                <FileText className="size-4" />
                Buat Brief
              </button>
              <button
                onClick={handleAddIdea}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cly-brand to-cly-brand-2 px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-lg shadow-md"
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
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-sm font-bold text-cly-text">{col.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-cly-text-2">{colIdeas.length}</span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex flex-col gap-2.5">
                    {colIdeas.map(idea => {
                      const priorityColor =
                        idea.priority === 'high' ? 'red' : idea.priority === 'med' ? 'amber' : 'neutral';
                      return (
                        <div
                          key={idea.id}
                          className="group relative rounded-xl border-t-4 bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                          style={{ borderTopColor: col.color }}
                        >
                          {/* Card Click → Opens Brief Modal */}
                          <button
                            onClick={() => handleView(idea)}
                            className="w-full text-left"
                          >
                            <h4 className="mb-2 text-sm font-bold text-cly-text">{idea.title || <span className="text-cly-text-2 italic font-medium">Tanpa judul</span>}</h4>
                            {idea.description && (
                              <p className="mb-3 line-clamp-2 text-xs text-cly-text-2">
                                {idea.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {idea.platform ? (
                                idea.platform.split(',').filter(Boolean).map(plat => (
                                  <PlatformBadge key={plat} platform={plat.trim()} />
                                ))
                              ) : (
                                <PlatformBadge platform="" />
                              )}
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
                                  className="flex items-center gap-1.5 text-xs text-[#8EC5FC] hover:text-[#6BA3E8] hover:underline truncate font-medium"
                                >
                                  <Link2 className="size-3 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons — hidden for viewers */}
                          {!isViewer && (
                            <div className="mt-3 flex items-center gap-1 border-t border-cly-border pt-2.5 opacity-0 transition-all group-hover:opacity-100">
                              <button
                                onClick={() => handleEdit(idea)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cly-text-2 font-medium transition-all hover:bg-gradient-to-br hover:from-[#8EC5FC] hover:to-[#6BA3E8] hover:text-white"
                              >
                                <EditIcon className="size-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDuplicate(idea)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cly-text-2 font-medium transition-all hover:bg-gradient-to-br hover:from-[#A8E6CF] hover:to-[#6ECDB0] hover:text-white"
                                title="Duplikat brief/ide ini"
                              >
                                <CopyIcon className="size-3" />
                                Duplikat
                              </button>
                              <button
                                onClick={() => confirmDelete(idea.id)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-cly-text-2 font-medium transition-all hover:bg-gradient-to-br hover:from-[#FFB5A0] hover:to-[#FF9680] hover:text-white ml-auto"
                              >
                                <Trash2Icon className="size-3" />
                                Hapus
                              </button>
                            </div>
                          )}
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
          readOnly={isViewer}
          initialMode={briefInitialMode}
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
          readOnly={isViewer}
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
