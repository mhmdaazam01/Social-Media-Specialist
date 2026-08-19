'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useIdeas } from '@/lib/hooks/useIdeas';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, X } from 'lucide-react';
import type { ContentIdea } from '@/types';

const FORMAT_OPTIONS = ['Video', 'Carousel', 'Single Post', 'Short-form video'];

interface IdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIdea?: ContentIdea | null;
  readOnly?: boolean;
}

interface FormFields {
  title: string;
  description: string;
  platform: string;
  pillar: string;
  format: string;
  priority: 'low' | 'med' | 'high';
  ref_links: string[];
}

const emptyForm: FormFields = {
  title: '',
  description: '',
  platform: '',
  pillar: '',
  format: '',
  priority: 'med',
  ref_links: [''],
};

export function IdeaModal({ open, onOpenChange, editIdea, readOnly }: IdeaModalProps) {
  const { createIdea, updateIdea } = useIdeas();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (editIdea) {
        setForm({
          title: editIdea.title,
          description: editIdea.description,
          platform: editIdea.platform,
          pillar: editIdea.pillar,
          format: editIdea.format,
          priority: editIdea.priority,
          ref_links: editIdea.ref_links.length > 0 ? editIdea.ref_links : [''],
        });
      } else {
        setForm(emptyForm);
      }
    });
  }, [open, editIdea]);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleRefLinkChange(index: number, value: string) {
    const newLinks = [...form.ref_links];
    newLinks[index] = value;
    update('ref_links', newLinks);
  }

  function addRefLink() {
    update('ref_links', [...form.ref_links, '']);
  }

  function removeRefLink(index: number) {
    if (form.ref_links.length === 1) return;
    update('ref_links', form.ref_links.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        platform: form.platform,
        pillar: form.pillar,
        format: form.format,
        status: editIdea ? editIdea.status : 'idea' as const,
        priority: form.priority,
        tags: [],
        brief: {},
        ref_links: form.ref_links.map(l => l.trim()).filter(Boolean),
      };
      if (editIdea) {
        await updateIdea(editIdea.id, data);
        toast.success('Ide berhasil diperbarui');
      } else {
        await createIdea(data);
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

  // Derive display label for platform
  const platformLabel = form.platform === 'all'
    ? 'Semua Platform'
    : form.platform
      ? platforms.find(p => p.platform_id === form.platform)?.name || form.platform
      : 'Pilih platform';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editIdea ? 'Edit Ide' : 'Ide / Bank Konten'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Judul */}
          <div className="grid gap-2">
            <Label htmlFor="idea-title">Judul</Label>
            <Input
              id="idea-title"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Contoh: Review Produk X"
              readOnly={readOnly}
            />
          </div>

          {/* Link Referensi */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Link Referensi</Label>
              <button
                type="button"
                onClick={addRefLink}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="size-3" />
                Tambah Link
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addRefLink}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="size-3" />
                  Tambah Link
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {form.ref_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={e => handleRefLinkChange(index, e.target.value)}
                    placeholder="https://..."
                    readOnly={readOnly}
                  />
                  {!readOnly && form.ref_links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRefLink(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="idea-description">Deskripsi</Label>
            <RichTextEditor
              value={form.description}
              onValueChange={v => update('description', v)}
              placeholder="Deskripsi singkat ide konten..."
              className="min-h-[120px] text-sm bg-background"
              readOnly={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={v => update('platform', v ?? '')} disabled={readOnly}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih platform">
                    {platformLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  <SelectItem value="all">Semua Platform</SelectItem>
                  {platforms.map(p => (
                    <SelectItem key={p.platform_id} value={p.platform_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Pilar</Label>
              <Select value={form.pillar} onValueChange={v => update('pillar', v ?? '')} disabled={readOnly}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih pilar">
                    {form.pillar
                      ? pillars.find(p => p.pillar_id === form.pillar)?.label || form.pillar
                      : 'Pilih pilar'}
                  </SelectValue>
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
            <Label>Format</Label>
            <Select value={form.format} onValueChange={v => update('format', v ?? '')} disabled={readOnly}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-</SelectItem>
                {FORMAT_OPTIONS.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Prioritas</Label>
            <Select value={form.priority} onValueChange={v => v && update('priority', v as FormFields['priority'])} disabled={readOnly}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {form.priority === 'low' ? 'Rendah' : form.priority === 'med' ? 'Sedang' : 'Tinggi'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="med">Sedang</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!readOnly && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : editIdea ? 'Simpan Perubahan' : 'Tambah Ide'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
