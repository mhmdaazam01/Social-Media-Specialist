'use client';

import { useState, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CSVImport } from '@/components/posts/CSVImport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePosts } from '@/lib/hooks/usePosts';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { postsToCSV } from '@/lib/utils/export';
import { PlusIcon, DownloadIcon, Trash2 } from 'lucide-react';
import type { Post } from '@/types';

export default function ContentPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { posts, loading, createPost, updatePost, deletePost } = usePosts();
  const { accounts } = useAccounts();
  
  // Filters
  const [accountFilter, setAccountFilter] = useState('all');

  // Editing state
  const [editingCell, setEditingCell] = useState<{ postId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleImport = useCallback(() => {
    // Refresh after import
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(p => p.account === accountFilter);
    }
    
    // Sort by date desc
    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    return filtered;
  }, [posts, accountFilter]);

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

  async function saveEdit() {
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
    setEditingCell(null);
    setEditValue('');
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  return (
    <AppShell title="Konten">
      <div className="flex flex-col gap-[18px]">
        {/* Toolbar */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-2.5 flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
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

            <button
              onClick={handleAddRow}
              className="h-[34px] px-[13px] rounded-lg bg-cly-brand text-white text-cly-sm font-semibold hover:bg-cly-brand-hover transition-colors inline-flex items-center gap-2"
            >
              <PlusIcon size={14} />
              Tambah Baris
            </button>
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

        {/* Spreadsheet Table */}
        <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly overflow-x-auto">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead className="sticky top-0 bg-cly-muted z-10">
              <tr>
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-12 bg-cly-muted">
                  #
                </th>
                <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border min-w-[200px] bg-cly-muted">
                  Title
                </th>
                <th className="text-left text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border min-w-[180px] bg-cly-muted">
                  Link Content
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[100px] bg-cly-muted">
                  Impression
                </th>
                <th className="text-right text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 border-r border-cly-border w-[100px] bg-cly-muted">
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
                <th className="text-center text-cly-xs font-black text-cly-text-3 uppercase tracking-wider py-3 px-3 w-[60px] bg-cly-muted">
                  <Trash2 size={14} className="mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-cly-sm text-cly-text-3 animate-pulse">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-cly-sm text-cly-text-3">
                    {accountFilter !== 'all' 
                      ? `Belum ada konten untuk akun "${accountFilter}".`
                      : 'Belum ada konten. Klik "Tambah Baris" untuk mulai.'}
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => (
                  <tr
                    key={post.id}
                    className="border-b border-cly-border hover:bg-cly-muted/30 transition-colors"
                  >
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
                          onBlur={saveEdit}
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

                    {/* Link */}
                    <td
                      className="py-2 px-3 border-r border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'link', post.link)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'link' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-7 px-2 border border-cly-brand rounded bg-cly-surface text-cly-sm text-cly-text outline-none"
                        />
                      ) : (
                        <div className="h-7 flex items-center text-cly-sm text-cly-text-2 truncate">
                          {post.link || '-'}
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
                          onBlur={saveEdit}
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
                          onBlur={saveEdit}
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
                      className="py-2 px-3 text-right border-cly-border cursor-text"
                      onClick={() => startEdit(post.id, 'like', post.like)}
                    >
                      {editingCell?.postId === post.id && editingCell?.field === 'like' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
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
                          onBlur={saveEdit}
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
                          onBlur={saveEdit}
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
                          onBlur={saveEdit}
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
                ))
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
