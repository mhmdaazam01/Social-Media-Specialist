'use client';

import { useState, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PlatformBadge } from '@/components/cly';
import { PostModal } from '@/components/posts/PostModal';
import { CSVImport } from '@/components/posts/CSVImport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePosts } from '@/lib/hooks/usePosts';
import { postsToCSV } from '@/lib/utils/export';
import { PlusIcon, DownloadIcon, Search, Pencil, Trash2, Upload } from 'lucide-react';
import { fmt, fmtPercent } from '@/lib/utils/analytics';
import type { Post } from '@/types';

export default function ContentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { posts, loading, deletePost } = usePosts();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const handleImport = useCallback(() => {
    // Refresh after import
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.platform?.toLowerCase().includes(query)
      );
    }
    
    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'reach') return (b.reach || 0) - (a.reach || 0);
      if (sortBy === 'engagement') {
        const aEr = a.impression > 0 ? (a.like + a.comment) / a.impression : 0;
        const bEr = b.impression > 0 ? (b.like + b.comment) / b.impression : 0;
        return bEr - aEr;
      }
      return 0;
    });
    
    return filtered;
  }, [posts, searchQuery, platformFilter, sortBy]);

  const platforms = useMemo(() => {
    const unique = new Set(posts.map(p => p.platform).filter(Boolean));
    return Array.from(unique);
  }, [posts]);

  function confirmDelete(post: Post) {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirmed() {
    if (postToDelete) {
      deletePost(postToDelete.id);
      setPostToDelete(null);
    }
  }

  function handleAddPost() {
    setEditPost(null);
    setModalOpen(true);
  }

  function handleEditPost(post: Post) {
    setEditPost(post);
    setModalOpen(true);
  }

  function handleCloseModal(open: boolean) {
    setModalOpen(open);
    if (!open) setEditPost(null);
  }

  if (loading) {
    return (
      <AppShell title="Konten">
        <div className="flex flex-col gap-[18px]">
          <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-2.5 h-96 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Konten">
      <div className="flex flex-col gap-[18px]">
        {/* Toolbar */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-2.5 grid grid-cols-[minmax(220px,1fr)_auto_auto_auto] gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-cly-text-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, platform..."
              className="w-full h-[34px] pl-8 pr-2.5 border border-cly-border rounded-lg bg-cly-surface text-cly-text text-cly-sm outline-none focus:border-cly-brand transition-colors"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-[34px] px-2.5 pr-7 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
          >
            <option value="all">All platforms</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-[34px] px-2.5 pr-7 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
          >
            <option value="date">Latest first</option>
            <option value="reach">Highest reach</option>
            <option value="engagement">Best engagement</option>
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => postsToCSV(posts)}
              className="h-[34px] px-[13px] rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 text-cly-sm font-semibold hover:bg-cly-muted transition-colors inline-flex items-center gap-2"
            >
              <DownloadIcon size={14} />
              Export
            </button>
            <CSVImport onImport={handleImport} />
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[10px_18px] overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-cly-border">
                <th className="text-center text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3 w-12">
                  #
                </th>
                <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                  Title
                </th>
                <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                  Platform
                </th>
                <th className="text-left text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                  Date
                </th>
                <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                  Reach
                </th>
                <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3">
                  ER
                </th>
                <th className="text-right text-cly-micro font-black text-cly-text-3 uppercase tracking-wider py-3 w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cly-sm text-cly-text-3">
                    {searchQuery || platformFilter !== 'all' 
                      ? 'Tidak ada konten yang cocok dengan filter.'
                      : 'Belum ada konten. Klik tombol "+" untuk menambah.'}
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => {
                  const totalEngagement = (post.like || 0) + (post.comment || 0) + (post.share || 0);
                  const er = post.impression > 0 
                    ? (totalEngagement / post.impression) * 100
                    : 0;
                  
                  return (
                    <tr
                      key={post.id}
                      className={idx < filteredPosts.length - 1 ? 'border-b border-cly-border' : ''}
                    >
                      <td className="py-3 text-center text-cly-sm text-cly-text-3 font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-3 text-cly-sm text-cly-text font-semibold">
                        <div className="max-w-xs truncate">{post.name || 'Untitled'}</div>
                      </td>
                      <td className="py-3">
                        <PlatformBadge platform={post.platform || 'Other'} />
                      </td>
                      <td className="py-3 text-cly-sm text-cly-text-2">
                        {post.date ? new Date(post.date).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="py-3 text-right text-cly-sm text-cly-text-2">
                        {fmt(post.reach || 0)}
                      </td>
                      <td className="py-3 text-right text-cly-sm text-cly-text font-black">
                        {fmtPercent(er)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="w-8 h-8 rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 hover:bg-cly-muted grid place-items-center transition-colors"
                            aria-label="Edit post"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(post)}
                            className="w-8 h-8 rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 hover:bg-cly-red-tint hover:text-cly-red hover:border-cly-red/20 grid place-items-center transition-colors"
                            aria-label="Delete post"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={handleAddPost}
          className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-40 inline-flex items-center justify-center gap-2 h-[44px] w-[44px] rounded-[10px] bg-cly-brand border border-cly-brand text-white shadow-cly-hover hover:shadow-cly transition-all hover:scale-105 active:scale-95"
        >
          <PlusIcon size={20} />
        </button>

        <PostModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          editPost={editPost}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirmed}
          title="Hapus Postingan"
          description={`Apakah Anda yakin ingin menghapus postingan "${postToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          cancelText="Batal"
        />
      </div>
    </AppShell>
  );
}
