'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { usePosts } from '@/lib/hooks/usePosts';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { today } from '@/lib/utils/formatting';
import type { Post } from '@/types';

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPost?: Post | null;
}

interface FormFields {
  account: string;
  platform: string;
  date: string;
  name: string;
  reach: number;
  impression: number;
  like: number;
  comment: number;
  share: number;
  save: number;
  repost: number;
  followers_gained: number;
  profile_visit: number;
  pillar: string;
  format: string;
  caption_len: number;
  link: string;
}

const emptyForm: FormFields = {
  account: '',
  platform: '',
  date: today(),
  name: '',
  reach: 0,
  impression: 0,
  like: 0,
  comment: 0,
  share: 0,
  save: 0,
  repost: 0,
  followers_gained: 0,
  profile_visit: 0,
  pillar: '',
  format: '',
  caption_len: 0,
  link: '',
};

export function PostModal({ open, onOpenChange, editPost }: PostModalProps) {
  const { createPost, updatePost } = usePosts();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const { accounts } = useAccounts();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editPost) {
      setForm({
        account: editPost.account,
        platform: editPost.platform,
        date: editPost.date,
        name: editPost.name,
        reach: editPost.reach,
        impression: editPost.impression,
        like: editPost.like,
        comment: editPost.comment,
        share: editPost.share,
        save: editPost.save,
        repost: editPost.repost,
        followers_gained: editPost.followers_gained,
        profile_visit: editPost.profile_visit,
        pillar: editPost.pillar,
        format: editPost.format,
        caption_len: editPost.caption_len,
        link: editPost.link,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editPost]);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleNumber(key: keyof FormFields, raw: string) {
    const val = raw === '' ? 0 : Number(raw);
    update(key, val as never);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      if (editPost) {
        updatePost(editPost.id, form);
        toast.success('Postingan berhasil diperbarui');
      } else {
        createPost(form);
        toast.success('Postingan berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan postingan');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editPost ? 'Edit Postingan' : 'Tambah Postingan'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="account">Akun</Label>
            <Select value={form.account} onValueChange={v => update('account', v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={form.platform} onValueChange={v => update('platform', v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(p => (
                  <SelectItem key={p.platform_id} value={p.platform_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" value={form.date} onChange={e => update('date', e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nama Postingan</Label>
            <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Contoh: Review Produk X" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="reach">Reach</Label>
              <Input id="reach" type="number" min={0} value={form.reach || ''} onChange={e => handleNumber('reach', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="impression">Impression</Label>
              <Input id="impression" type="number" min={0} value={form.impression || ''} onChange={e => handleNumber('impression', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="like">Like</Label>
              <Input id="like" type="number" min={0} value={form.like || ''} onChange={e => handleNumber('like', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Input id="comment" type="number" min={0} value={form.comment || ''} onChange={e => handleNumber('comment', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="share">Share</Label>
              <Input id="share" type="number" min={0} value={form.share || ''} onChange={e => handleNumber('share', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="save">Save</Label>
              <Input id="save" type="number" min={0} value={form.save || ''} onChange={e => handleNumber('save', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="repost">Repost</Label>
              <Input id="repost" type="number" min={0} value={form.repost || ''} onChange={e => handleNumber('repost', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="followers_gained">Followers Gained</Label>
              <Input id="followers_gained" type="number" min={0} value={form.followers_gained || ''} onChange={e => handleNumber('followers_gained', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pillar">Pilar Konten</Label>
            <Select value={form.pillar} onValueChange={v => update('pillar', v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih pilar" />
              </SelectTrigger>
              <SelectContent>
                {pillars.map(p => (
                  <SelectItem key={p.pillar_id} value={p.pillar_id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="format">Format</Label>
              <Input id="format" value={form.format} onChange={e => update('format', e.target.value)} placeholder="Reels/Carousel/Static" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="caption_len">Panjang Caption</Label>
              <Input id="caption_len" type="number" min={0} value={form.caption_len || ''} onChange={e => handleNumber('caption_len', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="link">Link</Label>
            <Input id="link" value={form.link} onChange={e => update('link', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : editPost ? 'Simpan Perubahan' : 'Tambah Postingan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
