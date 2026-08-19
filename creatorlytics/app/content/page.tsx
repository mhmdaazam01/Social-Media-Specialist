'use client';

import { useState, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CSVImport } from '@/components/posts/CSVImport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PlatformBadge } from '@/components/cly';
import { usePosts } from '@/lib/hooks/usePosts';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { postsToCSV } from '@/lib/utils/export';
import { getPlatformFromUrl } from '@/lib/utils/thumbnail';
import { 
  Search, FileDown, FileText, 
  Plus, Link as LinkIcon,
  ChevronLeft, ChevronRight, Check, Trash2, Loader2
} from 'lucide-react';
import type { Post } from '@/types';

// Helper to extract a valid URL if the user pasted embed HTML
const getValidHref = (link?: string): string => {
  if (!link) return '#';
  if (link.trim().startsWith('<')) {
    // Try to extract permalink from Instagram embed
    const permalinkMatch = link.match(/data-instgrm-permalink="([^"]+)"/);
    if (permalinkMatch) return permalinkMatch[1];
    // Try to extract src
    const srcMatch = link.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
    // Try to extract href
    const hrefMatch = link.match(/href="([^"]+)"/);
    if (hrefMatch) return hrefMatch[1];
  }
  return link;
};

export default function ContentPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { posts, loading, createPost, updatePost, deletePost } = usePosts();
  const { accounts } = useAccounts();
  const { platforms: userPlatforms } = usePlatforms();
  const { pillars: userPillars } = usePillars();
  
  // Filters
  const [accountFilter, setAccountFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Editing state
  const [editingCell, setEditingCell] = useState<{ postId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  
  // Bulk delete state
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  
  // Thumbnail loading state
  const [fetchingThumbnailIds, setFetchingThumbnailIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleImport = useCallback(() => {
    // Refresh after import
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    if (accountFilter !== 'all') {
      filtered = filtered.filter(p => p.account === accountFilter);
    }
    
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform?.toLowerCase() === platformFilter.toLowerCase());
    }
    
    if (dateFrom) {
      filtered = filtered.filter(p => p.date && p.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(p => p.date && p.date <= dateTo);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.platform?.toLowerCase().includes(query)
      );
    }
    
    // Sorting
    if (sortBy === 'latest') {
      filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (sortBy === 'impression') {
      filtered.sort((a, b) => (b.impression || 0) - (a.impression || 0));
    } else if (sortBy === 'reach') {
      filtered.sort((a, b) => (b.reach || 0) - (a.reach || 0));
    }
    
    return filtered;
  }, [posts, accountFilter, platformFilter, dateFrom, dateTo, searchQuery, sortBy]);

  const platforms = useMemo(() => {
    const unique = new Set(posts.map(p => p.platform).filter(Boolean));
    return Array.from(unique);
  }, [posts]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
  
  function toggleSelectPost(postId: string) {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }
  
  function toggleSelectAll() {
    if (selectedPosts.size === paginatedPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(paginatedPosts.map(p => p.id)));
    }
  }

  async function handleBulkDelete() {
    if (selectedPosts.size === 0) return;
    
    const confirmed = window.confirm(`Hapus ${selectedPosts.size} postingan yang dipilih?`);
    if (!confirmed) return;
    
    for (const postId of selectedPosts) {
      await deletePost(postId);
    }
    setSelectedPosts(new Set());
  }
  
  function toggleBulkSelectMode() {
    setBulkSelectMode(!bulkSelectMode);
    setSelectedPosts(new Set());
  }

  async function handleAddRow() {
    setIsAddingRow(true);
    try {
      const newPost = {
        name: '',
        link: '',
        platform: '',
        account: accountFilter !== 'all' ? accountFilter : '',
        pillar: '',
        format: '',
        date: new Date().toISOString().split('T')[0],
        impression: 0,
        reach: 0,
        like: 0,
        comment: 0,
        share: 0,
        save: 0,
        repost: 0,
        profile_visit: 0,
        followers_gained: 0,
        caption_len: 0,
      };
      await createPost(newPost);
    } finally {
      setIsAddingRow(false);
    }
  }

  function handleExport() {
    postsToCSV(filteredPosts);
  }

  // Editing functions
  function startEdit(postId: string, field: string, value: string | number | undefined) {
    setEditingCell({ postId, field });
    setEditValue(String(value || ''));
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue('');
  }

  async function saveEdit(options?: { reverse?: boolean }) {
    if (!editingCell) return;
    
    const { postId, field } = editingCell;
    let finalValue: string | number = editValue;
    
    if (['impression', 'reach', 'like', 'comment', 'share', 'save', 'repost', 'profile_visit', 'followers_gained'].includes(field)) {
      finalValue = parseInt(editValue) || 0;
    }
    
    // If editing link, fetch thumbnail and auto-detect platform
    if (field === 'link' && finalValue) {
      const linkUrl = String(finalValue);
      
      // Update link first
      updatePost(postId, { link: String(finalValue) });
      
      // Auto-detect platform if not set
      const detectedPlatform = getPlatformFromUrl(linkUrl);
      if (detectedPlatform) {
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost && !currentPost.platform) {
          updatePost(postId, { platform: detectedPlatform });
        }
      }
      
      // Fetch thumbnail via API route (async, with loading indicator)
      setFetchingThumbnailIds(prev => new Set(prev).add(postId));
      try {
        const response = await fetch(`/api/thumbnail?url=${encodeURIComponent(linkUrl)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.thumbnail) {
            // Proxy the thumbnail through our API to avoid CORS issues
            const proxyUrl = `/api/thumbnail/proxy?url=${encodeURIComponent(data.thumbnail)}`;
            updatePost(postId, { thumbnail: proxyUrl });
          }
        }
      } catch (error) {
        console.error('Failed to fetch thumbnail:', error);
      } finally {
        setFetchingThumbnailIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    } else {
      // Normal update for other fields
      updatePost(postId, { [field]: finalValue });
    }
    
    if (options?.reverse !== undefined) {
      moveToNextCell(options.reverse, postId);
    } else {
      setEditingCell(null);
      setEditValue('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit({ reverse: false });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveEdit({ reverse: e.shiftKey });
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  function moveToNextCell(reverse: boolean, postId: string) {
    const fields = ['name', 'date', 'platform', 'pillar', 'link', 'impression', 'reach', 'like', 'comment', 'share', 'save'];
    
    const currentIndex = editingCell ? fields.indexOf(editingCell.field) : -1;
    
    if (currentIndex === -1) return;
    
    const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
    
    if (nextIndex >= 0 && nextIndex < fields.length) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const nextField = fields[nextIndex];
        setTimeout(() => {
          const fieldValue = post[nextField as keyof Post];
          startEdit(postId, nextField, fieldValue as string | number);
        }, 0);
      }
    } else {
      setEditingCell(null);
      setEditValue('');
    }
  }

  // Helper functions
  const getERColor = (er: number) => {
    if (er < 1) return 'text-red-600';
    if (er < 3) return 'text-orange-600';
    return 'text-green-600';
  };

  const getAccountInitial = (account: string) => {
    return account ? account.charAt(0).toUpperCase() : 'U';
  };

  const getAccountColor = (account: string) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
    const index = account ? account.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <AppShell title="Konten">
      <style jsx global>{`
        .content-typography h1,
        .content-typography h2,
        .content-typography h3 {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 700 !important;
        }
        .content-typography th[class*="uppercase"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .content-typography button[class*="font-semibold"],
        .content-typography button[class*="font-bold"],
        .content-typography td[class*="font-medium"],
        .content-typography td[class*="font-bold"] {
          font-family: var(--font-space-grotesk) !important;
          font-weight: 600 !important;
        }
        .content-typography p,
        .content-typography span:not([class*="font-bold"]):not([class*="font-semibold"]):not([class*="font-medium"]),
        .content-typography div[class*="text-xs"],
        .content-typography div[class*="text-sm"]:not([class*="font-bold"]) {
          font-family: var(--font-dm-sans) !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div className="flex flex-col gap-6 content-typography">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cly-text mb-1">Konten Performance</h1>
            <p className="text-sm text-cly-text-3">Pantau performa kontenmu dan temukan insight terbaik.</p>
          </div>
          <div className="grid grid-cols-3 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleExport}
              className="h-8 rounded-lg border border-cly-border bg-white text-cly-text-2 text-xs font-medium hover:bg-cly-muted transition-all flex items-center justify-center gap-1.5 shadow-sm px-1 md:px-4 w-full md:w-auto"
            >
              <FileDown size={14} className="shrink-0" />
              <span className="truncate md:inline">Export</span>
            </button>
            <div className="flex items-center justify-center w-full md:w-auto">
              <CSVImport onImport={handleImport} />
            </div>
            <a
              href="/template-konten.csv"
              download
              className="h-8 rounded-lg bg-cly-brand text-white text-xs font-semibold hover:bg-cly-brand-hover transition-all flex items-center justify-center gap-1.5 shadow-sm px-1 md:px-4 w-full md:w-auto"
            >
              <FileText size={14} className="shrink-0" />
              <span className="truncate md:inline">Template</span>
            </a>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 bg-white dark:bg-cly-surface p-3 md:p-4 rounded-xl md:rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {/* Top Row: Search & Actions */}
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div className="relative w-full md:max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cly-text-3" size={16} />
              <input
                type="text"
                placeholder="Cari judul konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 rounded-lg border border-cly-border bg-white text-xs text-cly-text placeholder:text-cly-text-3 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddRow}
                disabled={isAddingRow}
                className={`h-8 px-4 flex-1 md:flex-none rounded-lg text-white text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-sm ${isAddingRow ? 'bg-cly-brand/70 cursor-not-allowed' : 'bg-cly-brand hover:bg-cly-brand-hover'}`}
              >
                {isAddingRow ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Plus size={16} className="shrink-0" />}
                <span className="truncate">{isAddingRow ? 'Menambahkan...' : 'Tambah Konten'}</span>
              </button>
              <button 
                onClick={toggleBulkSelectMode}
                className={`h-8 w-8 rounded-lg border border-cly-border shrink-0 ${bulkSelectMode ? 'bg-cly-brand text-white' : 'bg-white text-cly-text-2'} hover:bg-cly-muted transition-all inline-flex items-center justify-center shadow-sm`}
              >
                <Check size={16} />
              </button>
              {bulkSelectMode && selectedPosts.size > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="h-8 px-3 rounded-lg bg-gradient-to-br from-[#FFB5A0] to-[#FF9680] shrink-0 text-white text-xs font-semibold hover:shadow-md transition-all inline-flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} className="shrink-0" />
                  <span className="truncate">Hapus ({selectedPosts.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Filter Grid */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap md:items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full md:w-auto h-8 px-2 md:px-3 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full md:w-auto h-8 px-2 md:px-3 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
            />
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full md:w-auto md:min-w-[120px] h-8 px-2 md:px-3 pr-6 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all cursor-pointer truncate"
            >
              <option value="all">Semua Akun</option>
              {accounts.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full md:w-auto md:min-w-[130px] h-8 px-2 md:px-3 pr-6 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all cursor-pointer truncate"
            >
              <option value="all">Semua Platform</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto md:min-w-[140px] h-8 px-2 md:px-3 pr-6 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all cursor-pointer truncate col-span-2 md:col-span-1"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="impression">Highest Impression</option>
              <option value="reach">Highest Reach</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-cly-surface rounded-xl sm:rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible -webkit-overflow-scrolling-touch">
            <table className="w-full border-collapse min-w-[1500px]">
              <thead className="bg-gradient-to-br from-cly-muted to-white">
                <tr className="border-b border-cly-border">
                  {bulkSelectMode && (
                    <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-12">
                      <input
                        type="checkbox"
                        checked={paginatedPosts.length > 0 && selectedPosts.size === paginatedPosts.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer accent-cly-brand"
                      />
                    </th>
                  )}
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-12">No</th>
                  <th className="text-left text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 min-w-[250px]">Judul Konten</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[100px]">Tanggal</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[100px]">Akun</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[100px]">Platform</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[100px]">Pillar</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[100px]">Link Content</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[90px]">Impressions</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[90px]">Reach</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[70px]">Like</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[85px]">Comment</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[70px]">Share</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[70px]">Save</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[70px]">ER</th>
                  <th className="text-center text-xs font-semibold text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={bulkSelectMode ? 16 : 15} className="py-12 text-center text-sm text-cly-text-3 animate-pulse">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={bulkSelectMode ? 16 : 15} className="py-12 text-center text-sm text-cly-text-3">
                      Tidak ada konten ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedPosts.map((post, idx) => {
                    const totalEngagement = (post.like || 0) + (post.comment || 0) + (post.share || 0) + (post.save || 0);
                    const er = post.impression > 0 ? (totalEngagement / post.impression) * 100 : 0;
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                    
                    return (
                      <tr key={post.id} className="border-b border-cly-border hover:bg-cly-muted/30 transition-colors">
                        {bulkSelectMode && (
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedPosts.has(post.id)}
                              onChange={() => toggleSelectPost(post.id)}
                              className="w-4 h-4 cursor-pointer accent-cly-brand"
                            />
                          </td>
                        )}
                        
                        {/* Number */}
                        <td className="py-2 px-3 text-center text-sm text-cly-text-3 font-medium">
                          {globalIdx}
                        </td>

                        {/* Title - EDITABLE with Thumbnail */}
                        <td className="py-2 px-3 cursor-text" onClick={() => startEdit(post.id, 'name', post.name)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'name' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              {fetchingThumbnailIds.has(post.id) ? (
                                <div className="w-10 h-10 rounded bg-cly-muted flex items-center justify-center shrink-0">
                                  <Loader2 size={16} className="animate-spin text-cly-brand" />
                                </div>
                              ) : post.thumbnail ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={post.thumbnail} 
                                  alt={post.name || 'Thumbnail'} 
                                  className="w-10 h-10 rounded object-cover shrink-0"
                                  onError={(e) => {
                                    // Fallback to initial if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                  }}
                                  />
                                </>
                              ) : null}
                              <div 
                                className={`w-10 h-10 rounded bg-cly-muted flex items-center justify-center text-cly-xs font-bold text-cly-text-3 shrink-0 ${post.thumbnail || fetchingThumbnailIds.has(post.id) ? 'hidden' : ''}`}
                              >
                                {post.name ? post.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="text-sm text-cly-text font-medium line-clamp-2">
                                {post.name || 'Untitled'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Date - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'date', post.date)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'date' ? (
                            <input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">
                              {post.date ? new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                          )}
                        </td>

                        {/* Account Badge - Not editable, auto-filled */}
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${getAccountColor(post.account || '')} text-white text-xs font-bold flex items-center justify-center`}>
                              {getAccountInitial(post.account || '')}
                            </div>
                            <span className="text-cly-xs text-cly-text-2">{post.account || '-'}</span>
                          </div>
                        </td>

                        {/* Platform - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-pointer" onClick={() => {
                          if (!(editingCell?.postId === post.id && editingCell?.field === 'platform')) {
                            startEdit(post.id, 'platform', post.platform);
                          }
                        }}>
                          {editingCell?.postId === post.id && editingCell?.field === 'platform' ? (
                            <select
                              value={editValue}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditValue(newValue);
                                updatePost(post.id, { platform: newValue });
                                setEditingCell(null);
                                setEditValue('');
                              }}
                              onBlur={() => cancelEdit()}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text outline-none focus:ring-2 focus:ring-cly-brand/20"
                            >
                              <option value="">-</option>
                              {userPlatforms.map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          ) : (
                            post.platform ? <PlatformBadge platform={post.platform} /> : <span className="text-cly-xs text-cly-text-3">-</span>
                          )}
                        </td>

                        {/* Pillar - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-pointer" onClick={() => {
                          if (!(editingCell?.postId === post.id && editingCell?.field === 'pillar')) {
                            startEdit(post.id, 'pillar', post.pillar);
                          }
                        }}>
                          {editingCell?.postId === post.id && editingCell?.field === 'pillar' ? (
                            <select
                              value={editValue}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setEditValue(newValue);
                                updatePost(post.id, { pillar: newValue });
                                setEditingCell(null);
                                setEditValue('');
                              }}
                              onBlur={() => cancelEdit()}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text outline-none focus:ring-2 focus:ring-cly-brand/20"
                            >
                              <option value="">-</option>
                              {userPillars.map(p => (
                                <option key={p.pillar_id} value={p.pillar_id}>
                                  {p.emoji} {p.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            post.pillar ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                                {userPillars.find(p => p.pillar_id === post.pillar)?.emoji}
                                {userPillars.find(p => p.pillar_id === post.pillar)?.label || post.pillar}
                              </span>
                            ) : (
                              <span className="text-cly-xs text-cly-text-3">-</span>
                            )
                          )}
                        </td>

                        {/* Link Content - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'link', post.link)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'link' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              placeholder="URL"
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : post.link ? (
                            <div className="flex items-center justify-center gap-1">
                              <a
                                href={getValidHref(post.link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-cly-brand hover:text-cly-brand-hover text-xs font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon size={14} />
                                Link
                              </a>
                            </div>
                          ) : (
                            <span className="text-cly-xs text-cly-text-3">-</span>
                          )}
                        </td>

                        {/* Impression - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'impression', post.impression)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'impression' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.impression || 0}</span>
                          )}
                        </td>

                        {/* Reach - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'reach', post.reach)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'reach' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.reach || 0}</span>
                          )}
                        </td>

                        {/* Like - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'like', post.like)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'like' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.like || 0}</span>
                          )}
                        </td>

                        {/* Comment - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'comment', post.comment)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'comment' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.comment || 0}</span>
                          )}
                        </td>

                        {/* Share - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'share', post.share)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'share' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.share || 0}</span>
                          )}
                        </td>

                        {/* Save - EDITABLE */}
                        <td className="py-2 px-3 text-center cursor-text" onClick={() => startEdit(post.id, 'save', post.save)}>
                          {editingCell?.postId === post.id && editingCell?.field === 'save' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit()}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full h-7 px-2 border border-cly-brand rounded-lg bg-white text-xs text-cly-text text-center outline-none focus:ring-2 focus:ring-cly-brand/20"
                            />
                          ) : (
                            <span className="text-sm text-cly-text-2 font-medium">{post.save || 0}</span>
                          )}
                        </td>

                        {/* ER - Auto-calculated, color-coded */}
                        <td className="py-2 px-3 text-center">
                          <span className={`text-sm font-semibold ${getERColor(er)}`}>
                            {er.toFixed(2)}%
                          </span>
                        </td>

                        {/* Delete */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => confirmDelete(post)}
                            className="w-8 h-8 rounded hover:bg-cly-muted transition-colors inline-flex items-center justify-center text-cly-text-3 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredPosts.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-cly-text-3 font-medium">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPosts.length)} dari {filteredPosts.length} data
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-cly-border bg-white text-cly-text-2 hover:bg-cly-muted transition-all inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="w-8 h-8 rounded-lg bg-cly-brand text-white font-semibold inline-flex items-center justify-center text-xs shadow-sm">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-cly-border bg-white text-cly-text-2 hover:bg-cly-muted transition-all inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-3 rounded-lg border border-cly-border bg-white text-xs text-cly-text-2 outline-none cursor-pointer focus:border-cly-brand focus:ring-2 focus:ring-cly-brand/20 transition-all"
              >
                <option value={10}>10 / halaman</option>
                <option value={25}>25 / halaman</option>
                <option value={50}>50 / halaman</option>
                <option value={100}>100 / halaman</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirmed}
        title="Hapus Konten"
        description={`Yakin ingin menghapus "${postToDelete?.name || 'konten ini'}"?`}
      />
    </AppShell>
  );
}
