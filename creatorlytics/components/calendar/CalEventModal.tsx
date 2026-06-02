'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useEventStore } from '@/lib/store/event-store';
import { usePlatformStore } from '@/lib/store/platform-store';
import { usePillarStore } from '@/lib/store/pillar-store';
import { useAccountStore } from '@/lib/store/account-store';
import { today } from '@/lib/utils/formatting';
import type { CalendarEvent } from '@/types';

interface CalEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEvent?: CalendarEvent | null;
  defaultDate?: string;
}

interface FormFields {
  title: string;
  platform: string;
  account: string;
  pillar: string;
  format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'idea' | 'scheduled' | 'published' | 'cancelled';
  notes: string;
}

const emptyForm: FormFields = {
  title: '',
  platform: '',
  account: '',
  pillar: '',
  format: '',
  scheduled_date: today(),
  scheduled_time: '',
  status: 'idea',
  notes: '',
};

export function CalEventModal({ open, onOpenChange, editEvent, defaultDate }: CalEventModalProps) {
  const { createEvent, updateEvent } = useEventStore();
  const { platforms } = usePlatformStore();
  const { pillars } = usePillarStore();
  const { accounts } = useAccountStore();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      setForm({
        title: editEvent.title,
        platform: editEvent.platform,
        account: editEvent.account,
        pillar: editEvent.pillar,
        format: editEvent.format,
        scheduled_date: editEvent.scheduled_date,
        scheduled_time: editEvent.scheduled_time,
        status: editEvent.status,
        notes: editEvent.notes,
      });
    } else {
      setForm({ ...emptyForm, scheduled_date: defaultDate || today() });
    }
  }, [open, editEvent, defaultDate]);

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
        platform: form.platform,
        account: form.account,
        pillar: form.pillar,
        format: form.format,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        status: form.status,
        notes: form.notes,
        idea_id: editEvent?.idea_id ?? null,
      };
      if (editEvent) {
        updateEvent(editEvent.id, data);
        toast.success('Event berhasil diperbarui');
      } else {
        createEvent(data);
        toast.success('Event berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch {
      toast.error('Gagal menyimpan event');
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
          <DialogTitle>{editEvent ? 'Edit Event' : 'Event Baru'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Contoh: Launching Produk" />
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
              <Label htmlFor="account">Akun</Label>
              <Select value={form.account} onValueChange={v => update('account', v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="grid gap-2">
              <Label htmlFor="format">Format</Label>
              <Input id="format" value={form.format} onChange={e => update('format', e.target.value)} placeholder="Reels / Carousel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="scheduled_date">Tanggal</Label>
              <Input id="scheduled_date" type="date" value={form.scheduled_date} onChange={e => update('scheduled_date', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scheduled_time">Waktu</Label>
              <Input id="scheduled_time" type="time" value={form.scheduled_time} onChange={e => update('scheduled_time', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={v => v && update('status', v as FormFields['status'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="scheduled">Terjadwal</SelectItem>
                <SelectItem value="published">Terbit</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
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
            {loading ? 'Menyimpan...' : editEvent ? 'Simpan Perubahan' : 'Tambah Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
