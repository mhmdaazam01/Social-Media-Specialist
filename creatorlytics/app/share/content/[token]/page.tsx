'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  LogIn, Loader2, Lock, Eye, Edit3, AlertTriangle, 
  Search, Link as LinkIcon
} from 'lucide-react';
import { PlatformBadge } from '@/components/cly';
import { toast } from 'sonner';
import type { Post } from '@/types';
import { getValidHref } from '@/lib/utils/link';
import { formatDate } from '@/lib/utils/formatting';

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
  posts: Post[] | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  isCollaborator: boolean;
}



export default function ShareContentGuestPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/collab/guest?token=${token}&type=content`)
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
      router.push('/content');
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
        router.push('/content');
      } else if (json.error === 'Unauthorized') {
        router.push(`/login?next=/share/content/${token}`);
      } else if (json.error === 'You are the owner of this workspace') {
        router.push('/content');
      } else {
        toast.error(json.error || 'Gagal bergabung dengan workspace');
        setClaiming(false);
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan');
      setClaiming(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const posts = data?.posts;
    if (!posts) return [];
    return posts.filter(p => {
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.account.toLowerCase().includes(search.toLowerCase()) ||
        (p.pillar && p.pillar.toLowerCase().includes(search.toLowerCase()));
      const matchesPlatform = selectedPlatform === 'all' || p.platform.toLowerCase() === selectedPlatform.toLowerCase();
      return matchesSearch && matchesPlatform;
    });
  }, [data, search, selectedPlatform]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const posts = data?.posts || [];
    const totalPosts = posts.length;
    const totalImpressions = posts.reduce((acc, p) => acc + (p.impression || 0), 0);
    const totalReach = posts.reduce((acc, p) => acc + (p.reach || 0), 0);
    const totalEngagements = posts.reduce((acc, p) => acc + ((p.like || 0) + (p.comment || 0) + (p.share || 0) + (p.save || 0)), 0);
    const avgEr = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

    return { totalPosts, totalImpressions, totalReach, avgEr };
  }, [data?.posts]);

  // Unique platforms for filter
  const platforms = useMemo(() => {
    const set = new Set<string>();
    data?.posts?.forEach(p => { if (p.platform) set.add(p.platform); });
    return Array.from(set);
  }, [data?.posts]);

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
            onClick={() => router.push(`/login?next=/share/content/${token}`)}
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
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-cly-border bg-cly-brand/10 px-4 sm:px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {data.share.default_role === 'editor' ? (
            <Edit3 className="size-4 text-cly-brand shrink-0" />
          ) : (
            <Eye className="size-4 text-cly-brand shrink-0" />
          )}
          <span className="text-cly-xs font-medium text-cly-text truncate">
            Melihat Konten Performance milik <strong>{data.owner?.display_name || 'Pengguna'}</strong> — Mode {data.share.default_role === 'editor' ? 'Editor' : 'Read-Only'}
          </span>
        </div>
        <button
          onClick={handleClaimAccess}
          disabled={claiming}
          className="flex items-center gap-1.5 rounded-lg bg-cly-brand px-3 sm:px-4 py-1.5 text-cly-xs font-medium text-white transition-all hover:bg-cly-brand-hover active:scale-95 disabled:opacity-60 shrink-0"
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

      <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cly-text">Konten Performance</h1>
            <p className="text-sm text-cly-text-3">Workspace: {data.owner?.display_name || 'Pengguna'}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-cly-border bg-cly-surface px-3 py-1.5 self-start sm:self-auto shadow-xs">
            {data.share.default_role === 'editor' ? (
              <>
                <Edit3 className="size-3 text-cly-brand" />
                <span className="text-[11px] font-medium text-cly-brand">Editor</span>
              </>
            ) : (
              <>
                <Eye className="size-3 text-cly-text-3" />
                <span className="text-[11px] font-medium text-cly-text-3">Read Only</span>
              </>
            )}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-cly-surface p-4 rounded-xl border border-cly-border shadow-xs">
            <p className="text-xs text-cly-text-3 font-medium">Total Konten</p>
            <p className="text-xl sm:text-2xl font-bold text-cly-text mt-1">{metrics.totalPosts.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white dark:bg-cly-surface p-4 rounded-xl border border-cly-border shadow-xs">
            <p className="text-xs text-cly-text-3 font-medium">Total Impressions</p>
            <p className="text-xl sm:text-2xl font-bold text-cly-text mt-1">{metrics.totalImpressions.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white dark:bg-cly-surface p-4 rounded-xl border border-cly-border shadow-xs">
            <p className="text-xs text-cly-text-3 font-medium">Total Reach</p>
            <p className="text-xl sm:text-2xl font-bold text-cly-text mt-1">{metrics.totalReach.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white dark:bg-cly-surface p-4 rounded-xl border border-cly-border shadow-xs">
            <p className="text-xs text-cly-text-3 font-medium">Rata-rata ER</p>
            <p className="text-xl sm:text-2xl font-bold text-cly-brand mt-1">{metrics.avgEr.toFixed(2)}%</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-cly-surface p-3 rounded-xl border border-cly-border shadow-xs">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cly-text-3" size={15} />
            <input
              type="text"
              placeholder="Cari judul, akun, atau pilar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs bg-cly-muted rounded-lg border border-cly-border text-cly-text placeholder:text-cly-text-3 outline-none focus:ring-2 focus:ring-cly-brand/20"
            />
          </div>
          {platforms.length > 0 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedPlatform === 'all'
                    ? 'bg-cly-brand text-white'
                    : 'bg-cly-muted text-cly-text-2 hover:bg-cly-border'
                }`}
              >
                Semua Platform
              </button>
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedPlatform === p
                      ? 'bg-cly-brand text-white'
                      : 'bg-cly-muted text-cly-text-2 hover:bg-cly-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table View */}
        <div className="bg-white dark:bg-cly-surface rounded-xl border border-cly-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead className="bg-cly-muted/60 border-b border-cly-border text-xs text-cly-text-3 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3 text-left min-w-[220px]">Judul Konten</th>
                  <th className="py-3 px-3 text-center w-[110px]">Tanggal</th>
                  <th className="py-3 px-3 text-center w-[110px]">Akun</th>
                  <th className="py-3 px-3 text-center w-[110px]">Platform</th>
                  <th className="py-3 px-3 text-center w-[110px]">Pillar</th>
                  <th className="py-3 px-3 text-center w-[90px]">Link</th>
                  <th className="py-3 px-3 text-center w-[100px]">Impressions</th>
                  <th className="py-3 px-3 text-center w-[90px]">Reach</th>
                  <th className="py-3 px-3 text-center w-[80px]">Like</th>
                  <th className="py-3 px-3 text-center w-[90px]">Comment</th>
                  <th className="py-3 px-3 text-center w-[80px]">Share</th>
                  <th className="py-3 px-3 text-center w-[80px]">Save</th>
                  <th className="py-3 px-3 text-center w-[80px]">ER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cly-border text-xs text-cly-text">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-sm text-cly-text-3">
                      Tidak ada postingan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post, idx) => {
                    const eng = (post.like || 0) + (post.comment || 0) + (post.share || 0) + (post.save || 0);
                    const er = post.impression && post.impression > 0 ? ((eng / post.impression) * 100).toFixed(2) : '0.00';

                    return (
                      <tr key={post.id} className="hover:bg-cly-muted/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-cly-text-3 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-cly-text">{post.name || 'Untitled'}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">
                          {post.date ? formatDate(post.date) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{post.account || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {post.platform ? <PlatformBadge platform={post.platform} /> : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {post.pillar ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-medium">
                              {post.pillar}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {post.link ? (
                            <a
                              href={getValidHref(post.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-cly-brand hover:underline font-medium"
                            >
                              <LinkIcon size={12} />
                              Link
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.impression || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.reach || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.like || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.comment || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.share || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center text-cly-text-2">{(post.save || 0).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-cly-brand">{er}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
