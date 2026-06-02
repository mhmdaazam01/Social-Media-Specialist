'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useIdeaStore } from '@/lib/store/idea-store';
import { usePlatformStore } from '@/lib/store/platform-store';
import { usePillarStore } from '@/lib/store/pillar-store';
import type { ContentIdea } from '@/types';

interface IdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIdea?: ContentIdea | null;
}

interface FormFields {
  title: string;
  description: string;
  platform: string;
  pillar: string;
  format: string;
  status: 'idea' | 'brief' | 'draft' | 'ready';
  priority: 'low' | 'med' | 'high';
  tags: string;
  ref_links: string;
}

const emptyForm: FormFields = {
  title: '',
  description: '',
  platform: '',
  pillar: '',
  format: '',
  status: 'idea',
  priority: 'med',
  tags: '',
  ref_links: '',
};

export function IdeaModal({ open, onOpenChange, editIdea }: IdeaModalProps) {
  const { createIdea, updateIdea } = useIdeaStore();
  const { platforms } = usePlatformStore();
  const { pillars } = usePillarStore();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editIdea) {
      setForm({
        title: editIdea.title,
        description: editIdea.description,
        platform: editIdea.platform,
        pillar: editIdea.pillar,
        format: editIdea.format,
        status: editIdea.status,
        priority: editIdea.priority,
        tags: editIdea.tags.join(', '),
        ref_links: editIdea.ref_links.join(', '),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editIdea]);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        platform: form.platform,
        pillar: form.pillar,
        format: form.format,
        status: form.status,
        priority: form.priority,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        brief: {},
        ref_links: form.ref_links.split(',').map(l => l.trim()).filter(Boolean),
      };
      if (editIdea) {
        updateIdea(editIdea.id, data);
        toast.success('Ide berhasil diperbarui');
      } else {
        createIdea(data);
        toast.success('Ide berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan ide');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editIdea ? 'Edit Ide' : 'Ide Baru'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Contoh: Review Produk X" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Deskripsi singkat..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={form.platform} onValueChange={v => update('platform', v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {platforms.map(p => (
                    <SelectItem key={p.platform_id} value={p.platform_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pillar">Pilar</Label>
              <Select value={form.pillar} onValueChange={v => update('pillar', v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih pilar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {pillars.map(p => (
                    <SelectItem key={p.pillar_id} value={p.pillar_id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Input id="format" value={form.format} onChange={e => update('format', e.target.value)} placeholder="Reels / Carousel / Static" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={v => v && update('status', v as FormFields['status'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioritas</Label>
              <Select value={form.priority} onValueChange={v => v && update('priority', v as FormFields['priority'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="med">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input id="tags" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="tips, tutorial, edukasi" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ref_links">Link Referensi (pisahkan dengan koma)</Label>
            <Input id="ref_links" value={form.ref_links} onChange={e => update('ref_links', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : editIdea ? 'Simpan Perubahan' : 'Tambah Ide'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
