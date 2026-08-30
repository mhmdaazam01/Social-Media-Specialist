'use client';

import { useState, useCallback } from 'react';
import {
  Link2,
  Check,
  ChevronDown,
  Trash2,
  Globe,
  Lock,
  X,
  Loader2,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useCollaboration } from '@/lib/context/CollaborationContext';
import { useUser } from '@/lib/context/UserContext';
import type { CollabTargetType, PlannerShare } from '@/types';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  targetType: CollabTargetType;
}

export function ShareModal({ open, onClose, targetType }: ShareModalProps) {
  const { user, profile } = useUser();
  const {
    myShares,
    collaborators,
    collaboratorsLoading,
    upsertShare,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    getShareUrl,
  } = useCollaboration();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);

  // Derive share for this target_type
  const share: PlannerShare | undefined = myShares.find(
    s => s.target_type === targetType
  );

  const shareUrl = share ? getShareUrl(share.share_token, targetType) : '';
  const isPublic = share?.public_enabled ?? false;
  const publicRole = share?.default_role ?? 'viewer';

  const handleTogglePublic = useCallback(async (enable: boolean) => {
    setTogglingPublic(true);
    try {
      const result = await upsertShare(targetType, enable, publicRole);
      if (!result) {
        toast.error('Gagal mengubah pengaturan link publik. Silakan coba lagi.');
      } else {
        toast.success(result.public_enabled ? 'Akses umum diubah ke Publik' : 'Akses umum dibatasi');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah pengaturan link publik';
      console.error('Toggle public error:', err);
      toast.error(msg);
    }
    setTogglingPublic(false);
  }, [upsertShare, targetType, publicRole]);

  const handleLinkRoleChange = useCallback(async (newRole: 'viewer' | 'editor') => {
    setTogglingPublic(true);
    try {
      const result = await upsertShare(targetType, isPublic, newRole);
      if (!result) {
        toast.error('Gagal mengubah peran link publik. Silakan coba lagi.');
      } else {
        toast.success(`Peran link publik diubah menjadi ${newRole === 'editor' ? 'Editor' : 'Pelihat'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah peran link publik';
      console.error('Change link role error:', err);
      toast.error(msg);
    }
    setTogglingPublic(false);
  }, [upsertShare, targetType, isPublic]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (!shareUrl) {
        // Create the share first if it doesn't exist
        const newShare = await upsertShare(targetType, isPublic, publicRole);
        if (newShare) {
          const url = getShareUrl(newShare.share_token, targetType);
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast.success('Link berhasil disalin!');
        } else {
          toast.error('Gagal membuat link share. Silakan coba lagi.');
        }
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link berhasil disalin!');
    } catch (err) {
      console.error('Copy link error:', err);
      toast.error('Gagal menyalin link ke clipboard');
    }
  }, [shareUrl, upsertShare, targetType, getShareUrl, isPublic, publicRole]);

  const handleInvite = useCallback(async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast.error('Masukkan email yang valid');
      return;
    }
    setInviting(true);
    const result = await inviteCollaborator(email, inviteRole);
    if (result) {
      toast.success(`Undangan berhasil dikirim ke ${email}!`);
      setInviteEmail('');
    } else {
      toast.error('Gagal mengirim undangan. Email mungkin sudah diundang.');
    }
    setInviting(false);
  }, [inviteEmail, inviteRole, inviteCollaborator]);

  const handleRoleChange = useCallback(async (id: string, role: 'viewer' | 'editor') => {
    await updateCollaboratorRole(id, role);
    toast.success('Role berhasil diperbarui');
  }, [updateCollaboratorRole]);

  const handleRemove = useCallback(async (id: string, email: string) => {
    await removeCollaborator(id);
    toast.success(`${email} berhasil dihapus dari kolaborator`);
  }, [removeCollaborator]);

  if (!open) return null;

  const sectionLabel =
    targetType === 'planner'
      ? 'Content Planner'
      : targetType === 'calendar'
      ? 'Calendar'
      : 'Konten Performance';

  // Helper for generating initials
  const getInitials = (name: string, email: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card - Google Drive Style */}
      <div className="relative z-10 w-full max-w-[560px] rounded-[24px] bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-[22px] text-gray-800">Bagikan &ldquo;{sectionLabel}&rdquo;</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-2 flex-1 custom-scrollbar">
          {/* Invite Input Box */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] px-3 py-1.5 transition-shadow">
            <UserPlus className="size-5 text-gray-400 shrink-0 ml-1" />
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="Tambahkan email pengguna..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
            {inviteEmail.trim() && (
              <>
                <div className="relative shrink-0">
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as 'viewer' | 'editor')}
                    className="appearance-none rounded hover:bg-gray-100 bg-transparent pl-3 pr-8 py-2 text-sm text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value="viewer">Pelihat</option>
                    <option value="editor">Editor</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
                <button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="shrink-0 rounded-[18px] bg-[#0b57d0] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0842a0] disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="size-4 animate-spin" /> : 'Kirim'}
                </button>
              </>
            )}
          </div>

          {/* Access List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Orang yang memiliki akses</h3>
            <div className="flex flex-col gap-1">
              
              {/* Owner Row */}
              <div className="flex items-center justify-between py-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-medium text-white uppercase">
                    {getInitials(profile?.display_name || '', user?.email || '')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="truncate text-sm text-gray-800">
                      {profile?.display_name || user?.email?.split('@')[0]} <span className="text-gray-500">(Anda)</span>
                    </p>
                    <p className="truncate text-[12px] text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 italic pr-2 shrink-0">Pemilik</span>
              </div>

              {/* Collaborators */}
              {collaboratorsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-gray-400" />
                </div>
              ) : (
                collaborators.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 rounded hover:bg-gray-50 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8710a] text-sm font-medium text-white uppercase">
                        {c.collaborator_email[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="truncate text-sm text-gray-800">{c.collaborator_email}</p>
                        <span className={`text-[12px] ${c.status === 'active' ? 'text-gray-500' : 'text-amber-600'}`}>
                          {c.status === 'active' ? 'Bergabung' : 'Menunggu persetujuan...'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <select
                          value={c.role}
                          onChange={e => handleRoleChange(c.id, e.target.value as 'viewer' | 'editor')}
                          className="appearance-none rounded hover:bg-gray-200 bg-transparent pl-2 pr-7 py-1.5 text-sm text-gray-700 cursor-pointer focus:outline-none"
                        >
                          <option value="viewer">Pelihat</option>
                          <option value="editor">Editor</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-500" />
                      </div>
                      <button
                        onClick={() => handleRemove(c.id, c.collaborator_email)}
                        className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                        title="Hapus akses"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* General Access */}
          <div className="mt-6 mb-2">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Akses umum</h3>
            <div className="flex items-start gap-3 py-2">
              <div className={`flex size-10 mt-1 shrink-0 items-center justify-center rounded-full ${isPublic ? 'bg-[#e6f4ea]' : 'bg-gray-100'}`}>
                {isPublic ? <Globe className="size-5 text-[#137333]" /> : <Lock className="size-5 text-gray-600" />}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="relative inline-block w-fit">
                  <select
                    value={isPublic ? 'public' : 'restricted'}
                    onChange={e => handleTogglePublic(e.target.value === 'public')}
                    disabled={togglingPublic}
                    className="appearance-none rounded hover:bg-gray-100 bg-transparent pr-8 py-1 text-sm font-medium text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="restricted">Dibatasi</option>
                    <option value="public">Siapa saja yang memiliki link</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
                </div>
                
                {isPublic ? (
                  <p className="text-[12px] text-gray-600 mt-0.5">
                    Siapa saja di internet yang memiliki link dapat melihat
                  </p>
                ) : (
                  <p className="text-[12px] text-gray-600 mt-0.5">
                    Hanya orang yang memiliki akses yang dapat membuka link ini
                  </p>
                )}
              </div>
              
              {isPublic && (
                <div className="relative shrink-0 mt-1">
                  <select
                    value={publicRole}
                    onChange={e => handleLinkRoleChange(e.target.value as 'viewer' | 'editor')}
                    disabled={togglingPublic}
                    className="appearance-none rounded hover:bg-gray-100 bg-transparent pl-3 pr-8 py-1 text-sm text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value="viewer">Pelihat</option>
                    <option value="editor">Editor</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 mt-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#f0f4f9] transition-colors"
          >
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
            {copied ? 'Link disalin' : 'Salin link'}
          </button>
          
          <button
            onClick={onClose}
            className="rounded-full bg-[#0b57d0] px-6 py-2 text-sm font-medium text-white hover:bg-[#0842a0] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
