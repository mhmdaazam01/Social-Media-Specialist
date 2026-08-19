'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClipboardListIcon, FileText, Lightbulb, LogIn, Loader2, Lock, Eye, Edit3, AlertTriangle } from 'lucide-react';
import { Badge, PlatformBadge } from '@/components/cly';
import { GuestBriefModal } from '@/components/planner/GuestBriefModal';
import { toast } from 'sonner';
import type { ContentIdea, PostStatus } from '@/types';

interface GuestData {
  share: {
    id: string;
    share_token: string;
    public_enabled: boolean;
    target_type: string;
    default_role: 'viewer' | 'editor';
  };
  owner: {
    id: string;
    display_name: string;
  };
  ideas: ContentIdea[] | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  isCollaborator: boolean;
}

export default function SharePlannerGuestPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/collab/guest?token=${token}&type=planner`)
      .then(async res => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? 'Gagal memuat konten');
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat konten. Coba lagi.');
        setLoading(false);
      });
  }, [token]);

  const handleClaimAccess = async () => {
    if (data?.isOwner || data?.isCollaborator) {
      router.push('/planner');
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch('/api/collab/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_token: token }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Berhasil bergabung dengan workspace!');
        router.push('/planner');
      } else if (json.error === 'Unauthorized') {
        // Not logged in — redirect to login with return URL
        router.push(`/login?next=/share/planner/${token}`);
      } else if (json.error === 'You are the owner of this workspace') {
        router.push('/planner');
      } else {
        toast.error(json.error || 'Gagal bergabung dengan workspace');
        setClaiming(false);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
      setClaiming(false);
    }
  };

  const columns: Record<PostStatus, ContentIdea[]> = useMemo(() => ({
    idea: data?.ideas?.filter(i => i.status === 'idea') ?? [],
    brief: data?.ideas?.filter(i => i.status === 'brief') ?? [],
  }), [data]);

  const columnConfig = [
    { key: 'idea' as PostStatus, label: 'Idea Bank', color: '#94A3B8' },
    { key: 'brief' as PostStatus, label: 'Brief', color: '#60A5FA' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cly-bg">
        <Loader2 className="size-8 animate-spin text-cly-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cly-bg p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
          {error.includes('log in') || error.includes('Unauthorized')
            ? <Lock className="size-7 text-red-400" />
            : <AlertTriangle className="size-7 text-red-400" />
          }
        </div>
        <h1 className="text-cly-lg font-semibold text-cly-text">Link Tidak Valid</h1>
        <p className="max-w-sm text-cly-sm text-cly-text-muted">{error}</p>
        {(error.includes('log in') || error.includes('Unauthorized')) && (
          <button
            onClick={() => router.push(`/login?next=/share/planner/${token}`)}
            className="flex items-center gap-2 rounded-lg bg-cly-brand px-6 py-2.5 text-cly-sm font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95"
          >
            <LogIn className="size-4" />
            Login untuk Akses
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-cly-bg">
      {/* Guest Banner */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cly-border bg-cly-brand/10 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {data.share.default_role === 'editor' ? (
            <Edit3 className="size-4 text-cly-brand" />
          ) : (
            <Eye className="size-4 text-cly-brand" />
          )}
          <span className="text-cly-xs font-medium text-cly-text">
            Melihat Content Planner milik <strong>{data.owner?.display_name || 'Pengguna'}</strong> — Mode {data.share.default_role === 'editor' ? 'Editor' : 'Read-Only'}
          </span>
        </div>
        <button
          onClick={handleClaimAccess}
          disabled={claiming}
          className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-4 py-1.5 text-cly-xs font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95 disabled:opacity-60"
        >
          {claiming ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : data.isOwner ? (
            <>Buka Workspace</>
          ) : data.isCollaborator ? (
            <>Buka Workspace</>
          ) : data.isLoggedIn ? (
            <><LogIn className="size-3.5" /> Gabung Workspace</>
          ) : (
            <><LogIn className="size-3.5" /> Login untuk Bergabung</>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-[18px] p-[18px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-cly-lg font-semibold text-cly-text">Content Planner</h1>
            <p className="text-cly-xs text-cly-text-muted">Workspace: {data.owner?.display_name || 'Pengguna'}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-cly-border bg-cly-surface px-3 py-1.5">
            {data.share.default_role === 'editor' ? (
              <>
                <Edit3 className="size-3 text-cly-brand" />
                <span className="text-[10px] font-medium text-cly-brand">Editor</span>
              </>
            ) : (
              <>
                <Eye className="size-3 text-cly-text-muted" />
                <span className="text-[10px] font-medium text-cly-text-muted">Read Only</span>
              </>
            )}
          </div>
        </div>

        {/* Kanban */}
        {(!data.ideas || data.ideas.length === 0) ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[10px] bg-cly-surface py-20 shadow-cly">
            <ClipboardListIcon className="size-10 text-cly-text-muted" />
            <p className="text-cly-sm text-cly-text-muted">Workspace ini belum memiliki konten.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {columnConfig.map(col => {
              const colIdeas = columns[col.key];
              return (
                <div key={col.key} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-[10px] bg-cly-surface px-4 py-3 shadow-cly">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-cly-sm font-semibold text-cly-text">{col.label}</span>
                    </div>
                    <span className="text-cly-xs font-medium text-cly-text-muted">{colIdeas.length}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {colIdeas.map(idea => (
                      <button
                        key={idea.id}
                        onClick={() => {
                          setSelectedIdea(idea);
                          setIsModalOpen(true);
                        }}
                        className="group relative rounded-[10px] border-t-4 bg-cly-surface p-3.5 shadow-cly transition-all hover:shadow-cly-hover text-left"
                        style={{ borderTopColor: col.color }}
                      >
                        <h4 className="mb-2 text-cly-sm font-semibold text-cly-text">
                          {idea.title || <span className="italic text-cly-text-muted">Tanpa judul</span>}
                        </h4>
                        {idea.description && (
                          <p className="mb-2 line-clamp-2 text-cly-xs text-cly-text-muted">{idea.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {idea.platform && <PlatformBadge platform={idea.platform} />}
                          {idea.pillar && <Badge tone="neutral">{idea.pillar}</Badge>}
                          {idea.format && <Badge tone="neutral">{idea.format}</Badge>}
                          {idea.priority === 'high' && <Badge tone="red">High</Badge>}
                          {idea.priority === 'med' && <Badge tone="amber">Med</Badge>}
                        </div>
                      </button>
                    ))}
                    {colIdeas.length === 0 && (
                      <div className="rounded-[10px] border border-dashed border-cly-border py-6 text-center">
                        {col.key === 'idea'
                          ? <Lightbulb className="mx-auto mb-1 size-5 text-cly-text-muted" />
                          : <FileText className="mx-auto mb-1 size-5 text-cly-text-muted" />
                        }
                        <p className="text-cly-xs text-cly-text-muted">Belum ada {col.label}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GuestBriefModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        idea={selectedIdea}
      />
    </div>
  );
}
