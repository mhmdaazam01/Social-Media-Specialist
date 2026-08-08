'use client';

import { useState, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CSVImport } from '@/components/posts/CSVImport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePosts } from '@/lib/hooks/usePosts';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { postsToCSV } from '@/lib/utils/export';
import { PlusIcon, DownloadIcon, Trash2, Search } from 'lucide-react';
import type { Post } from '@/types';

export default function ContentPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { posts, loading, createPost, updatePost, deletePost } = usePosts();
  const { accounts } = useAccounts();
  const { platforms: userPlatforms } = usePlatforms();
  
  // Filters
  const [accountFilter, setAccountFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Editing state
  const [editingCell, setEditingCell] = useState<{ postId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Bulk delete state
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  const handleImport = useCallback(() => {
    // Refresh after import
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(p => p.account === accountFilter);
    }
    
    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }
    
    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(p => p.date && p.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(p => p.date && p.date <= dateTo);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.platform?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'impression') return (b.impression || 0) - (a.impression || 0);
      if (sortBy === 'reach') return (b.reach || 0) - (a.reach || 0);
      return 0;
    });
    
    return filtered;
  }, [posts, accountFilter, platformFilter, dateFrom, dateTo, searchQuery, sortBy]);

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
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
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

  async function handleAddRow() {
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
      followers_gained: 0,
      profile_visit: 0,
      caption_len: 0,
    };
    await createPost(newPost);
  }

  function startEdit(postId: string, field: string, currentValue: any) {
    setEditingCell({ postId, field });
    setEditValue(String(currentValue || ''));
  }

  async function saveEdit(andMoveNext?: { reverse: boolean }) {
    if (!editingCell) return;
    
    const { postId, field } = editingCell;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    let value: any = editValue;
    
    // Convert to number for numeric fields
    if (['impression', 'reach', 'like', 'comment', 'share', 'save'].includes(field)) {
      value = parseInt(editValue) || 0;
    }

    await updatePost(postId, { [field]: value });
    
    // Move to next cell if requested
    if (andMoveNext) {
      moveToNextCell(andMoveNext.reverse, postId);
    } else {
      setEditingCell(null);
      setEditValue('');
    }
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue('');
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
    const fields = ['name', 'date', 'platform', 'link', 'impression', 'reach', 'like', 'comment', 'share', 'save'];
    
    const currentIndex = editingCell ? fields.indexOf(editingCell.field) : -1;
    
    if (currentIndex === -1) return;
    
    const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
    
    if (nextIndex >= 0 && nextIndex < fields.length) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const nextField = fields[nextIndex];
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
          startEdit(postId, nextField, (post as any)[nextField]);
        }, 0);
      }
    } else {
      // End of row, just close
      setEditingCell(null);
      setEditValue('');
    }
  }

  return (
    <AppShell title="Konten">
      <div className="flex flex-col gap-[18px]">
        {/* Toolbar */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-2.5 flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-[280px]">
                <Search size={14} className="absolute left-2.5 top-2.5 text-cly-text-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, platform..."
                  className="w-full h-[34px] pl-8 pr-2.5 border border-cly-border rounded-lg bg-cly-surface text-cly-text text-cly-sm outline-none focus:border-cly-brand transition-colors"
                />
              </div>

              {/* Date From */}
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-[34px] px-2.5 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
                placeholder="Dari"
              />

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-[34px] px-2.5 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
                placeholder="Sampai"
              />

              {/* Account Filter */}
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="h-[34px] px-2.5 pr-7 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
              >
                <option value="all">Semua Akun</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>

              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-[34px] px-2.5 pr-7 border border-cly-border rounded-lg bg-cly-surface text-cly-text-2 text-cly-sm font-semibold outline-none focus:border-cly-brand transition-colors"
              >
                <option value="all">All Platforms</option>
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
                <option value="date">Latest First</option>
                <option value="impression">Highest Impression</option>
                <option value="reach">Highest Reach</option>
              </select>

              <button
                onClick={handleAddRow}
                className="h-[34px] px-[13px] rounded-lg bg-cly-brand text-white text-cly-sm font-semibold hover:bg-cly-brand-hover transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon size={14} />
                Tambah Baris
              </button>
              
              {selectedPosts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="h-[34px] px-[13px] rounded-lg bg-cly-red text-white text-cly-sm font-semibold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Hapus ({selectedPosts.size})
                </button>
              )}
            </div>

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
        </div>

        {/* Spreadsheet Table */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly overflow-x-auto">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead className="sticky top-0 bg-cly-muted z-10">
              <tr>
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-12 bg-cly-muted">
                  <input
                    type="checkbox"
                    checked={filteredPosts.length > 0 && selectedPosts.size === filteredPosts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-cly-brand"
                  />
                </th>
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-12 bg-cly-muted">
                  #
                </th>
                <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border min-w-[180px] bg-cly-muted">
                  Title
                </th>
                <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[100px] bg-cly-muted">
                  Date
                </th>
                {accountFilter === 'all' && (
                  <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[120px] bg-cly-muted">
                    Account
                  </th>
                )}
                <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[110px] bg-cly-muted">
                  Platform
                </th>
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[110px] bg-cly-muted">
                  Link Content
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[100px] bg-cly-muted">
                  Impression
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[90px] bg-cly-muted">
                  Reach
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[80px] bg-cly-muted">
                  Like
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[90px] bg-cly-muted">
                  Comment
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[80px] bg-cly-muted">
                  Share
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[80px] bg-cly-muted">
                  Save
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[70px] bg-cly-muted">
                  ER
                </th>
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[60px] bg-cly-muted">
                  <Trash2 size={14} className="mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={accountFilter === 'all' ? 15 : 14} className="py-12 text-center text-cly-sm text-cly-text-3 animate-pulse">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={accountFilter === 'all' ? 15 : 14} className="py-12 text-center text-cly-sm text-cly-text-3">
                    {accountFilter !== 'all' 
                      ? `Belum ada konten untuk akun "${accountFilter}".`
                      : 'Belum ada konten. Klik "Tambah Baris" untuk mulai.'}
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => {
                  const totalEngagement = (post.like || 0) + (post.comment || 0) + (post.share || 0) + (post.save || 0);
                  const er = post.impression > 0 ? (totalEngagement / post.impression) * 100 : 0;

                  return (
                  <tr
                    key={post.id}
                    className="border-b border-cly-border hover:bg-cly-muted/30 transition-colors"
                  >
                    <td className="py-2 px-3 text-center border-r border-cly-border">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => toggleSelectPost(post.id)}
                        className="w-4 h-4 cursor-pointer accent-cly-brand"
                      />
                    </td>
                    <td className="py-2 px-3 text-center text-cly-sm text-cly-text-3 font-bold border-r border-cly-border">
                      {idx + 1}
                    </td>
                    
                    {/* Title */}
                    <td
                      className="py-2 px-3 border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'name', post.name)}
                    >
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
                        <div className="h-7 flex items-center text-cly-sm text-cly-text">
                          {post.name || '-'}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td
                      className="py-2 px-3 border-r border-cly-brand cursor-text"
                      onClick={() => startEdit(post.id, 'date', post.date)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'date' ? (
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center text-cly-sm text-cly-text-2">
                          {post.date ? new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      )}
                    </td>

                    {/* Account (Conditional - Auto-filled) */}
                    {accountFilter === 'all' && (
                      <td className="py-2 px-3 border-r border-cly-border">
                        <div className="h-7 flex items-center text-cly-sm text-cly-text-2">
                          {post.account || '-'}
                        </div>
                      </td>
                    )}

                    {/* Platform */}
                    <td
                      className="py-2 px-3 border-r border-cly-border cursor-pointer"
                      onClick={() => startEdit(post.id, 'platform', post.platform)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'platform' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text outline-none"
                        >
                          <option value="">-</option>
                          {userPlatforms.map(p => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="h-7 flex items-center text-cly-sm text-cly-text-2">
                          {post.platform || '-'}
                        </div>
                      )}
                    </td>

                    {/* Link Content */}
                    <td className="py-2 px-3 border-r border-cly-border text-center">
                      {editingCell?.postId === post.id && editingCell?.field === 'link' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          placeholder="URL"
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text outline-none"
                        />
                      ) : post.link ? (
                        <div className="flex items-center gap-1 justify-center">
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block h-7 px-3 leading-7 text-cly-xs font-semibold text-white bg-cly-brand rounded hover:bg-cly-brand-hover transition-colors"
                          >
                            Link Content
                          </a>
                          <button
                            onClick={() => startEdit(post.id, 'link', post.link)}
                            className="h-7 w-7 rounded border border-cly-border bg-cly-surface text-cly-text-3 hover:bg-cly-muted hover:text-cly-text transition-colors text-xs"
                            title="Edit link"
                          >
                            ✎
                          </button>
                        </div>
                      ) : (
                        <div
                          className="h-7 flex items-center justify-center cursor-text"
                          onClick={() => startEdit(post.id, 'link', post.link)}
                        >
                          <span className="text-cly-xs text-cly-text-3">-</span>
                        </div>
                      )}
                    </td>

                    {/* Impression */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'impression', post.impression)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'impression' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.impression || 0}
                        </div>
                      )}
                    </td>

                    {/* Reach */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'reach', post.reach)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'reach' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.reach || 0}
                        </div>
                      )}
                    </td>

                    {/* Like */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'like', post.like)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'like' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.like || 0}
                        </div>
                      )}
                    </td>

                    {/* Comment */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'comment', post.comment)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'comment' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.comment || 0}
                        </div>
                      )}
                    </td>

                    {/* Share */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'share', post.share)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'share' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.share || 0}
                        </div>
                      )}
                    </td>

                    {/* Save */}
                    <td
                      className="py-2 px-3 text-right border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'save', post.save)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'save' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text text-right outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text-2">
                          {post.save || 0}
                        </div>
                      )}
                    </td>

                    {/* ER (Auto-calculated) */}
                    <td className="py-2 px-3 text-right border-r border-cly-border">
                      <div className="h-7 flex items-center justify-end text-cly-sm text-cly-text font-bold">
                        {er.toFixed(2)}%
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => confirmDelete(post)}
                        className="w-8 h-7 rounded border border-cly-border bg-cly-surface text-cly-text-2 hover:bg-cly-red-tint hover:text-cly-red hover:border-cly-red/20 grid place-items-center transition-colors mx-auto"
                        aria-label="Delete post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
