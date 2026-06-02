'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCompetitors } from '@/lib/hooks/useCompetitors';
import type { Competitor } from '@/types';

interface CompetitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCompetitor?: Competitor | null;
}

interface FormFields {
  name: string;
  platform: string;
  followers: number;
  avg_reach: number;
  avg_er: number;
  post_freq: number;
  notes: string;
}

const emptyForm: FormFields = {
  name: '',
  platform: '',
  followers: 0,
  avg_reach: 0,
  avg_er: 0,
  post_freq: 0,
  notes: '',
};

export function CompetitorModal({ open, onOpenChange, editCompetitor }: CompetitorModalProps) {
  const { createCompetitor, updateCompetitor } = useCompetitors();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editCompetitor) {
      setForm({
        name: editCompetitor.name,
        platform: editCompetitor.platform,
        followers: editCompetitor.followers,
        avg_reach: editCompetitor.avg_reach,
        avg_er: editCompetitor.avg_er,
        post_freq: editCompetitor.post_freq,
        notes: editCompetitor.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editCompetitor]);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleNumber(key: keyof FormFields, raw: string) {
    const val = raw === '' ? 0 : Number(raw);
    update(key, val as never);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Nama kompetitor wajib diisi');
      return;
    }
    setLoading(true);
    try {
      if (editCompetitor) {
        updateCompetitor(editCompetitor.id, form);
        toast.success('Kompetitor berhasil diperbarui');
      } else {
        createCompetitor(form);
        toast.success('Kompetitor berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan kompetitor');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editCompetitor ? 'Edit Kompetitor' : 'Tambah Kompetitor'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama *</Label>
            <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nama kompetitor" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" value={form.platform} onChange={e => update('platform', e.target.value)} placeholder="Instagram / TikTok / YouTube" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="followers">Followers</Label>
              <Input id="followers" type="number" min={0} value={form.followers || ''} onChange={e => handleNumber('followers', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avg_reach">Avg Reach</Label>
              <Input id="avg_reach" type="number" min={0} value={form.avg_reach || ''} onChange={e => handleNumber('avg_reach', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="avg_er">Avg ER (%)</Label>
              <Input id="avg_er" type="number" min={0} step="0.01" value={form.avg_er || ''} onChange={e => handleNumber('avg_er', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post_freq">Post/minggu</Label>
              <Input id="post_freq" type="number" min={0} value={form.post_freq || ''} onChange={e => handleNumber('post_freq', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Catatan tambahan..." />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : editCompetitor ? 'Simpan Perubahan' : 'Tambah Kompetitor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
