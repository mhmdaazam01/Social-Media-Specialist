'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useEvents } from '@/lib/hooks/useEvents';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { usePillars } from '@/lib/hooks/usePillars';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { today, formatDateWithDay } from '@/lib/utils/formatting';
import { FORMAT_OPTIONS } from '@/lib/constants';
import type { CalendarEvent } from '@/types';
import { Pencil, Calendar } from 'lucide-react';

interface CalEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEvent?: CalendarEvent | null;
  defaultDate?: string;
  onDelete?: (event: CalendarEvent) => void;
  readOnly?: boolean;
}

interface FormFields {
  title: string;
  platform: string[];
  account: string[];
  pillar: string;
  format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'idea' | 'scheduled' | 'published' | 'cancelled';
  notes: string;
}

const emptyForm: FormFields = {
  title: '',
  platform: [],
  account: [],
  pillar: '',
  format: '',
  scheduled_date: today(),
  scheduled_time: '',
  status: 'idea',
  notes: '',
};

function ViewRow({ label, value, multiline }: { label: string; value: React.ReactNode; multiline?: boolean }) {
  if (multiline) {
    return (
      <div className="space-y-0.5">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export function CalEventModal({ open, onOpenChange, editEvent, defaultDate, onDelete, readOnly }: CalEventModalProps) {
  const { createEvent, updateEvent } = useEvents();
  const { platforms } = usePlatforms();
  const { pillars } = usePillars();
  const { accounts } = useAccounts();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (editEvent) {
        setMode('view');
        setForm({
          title: editEvent.title,
          platform: editEvent.platform ? editEvent.platform.split(',').map(s => s.trim()).filter(Boolean) : [],
          account: editEvent.account ? editEvent.account.split(',').map(s => s.trim()).filter(Boolean) : [],
          pillar: editEvent.pillar,
          format: editEvent.format,
          scheduled_date: editEvent.scheduled_date,
          scheduled_time: editEvent.scheduled_time,
          status: editEvent.status,
          notes: editEvent.notes,
        });
      } else {
        setMode('create');
        setForm({ ...emptyForm, scheduled_date: defaultDate || today() });
      }
    });
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
        platform: form.platform.join(', '),
        account: form.account.join(', '),
        pillar: form.pillar,
        format: form.format,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        status: form.status,
        notes: form.notes,
        idea_id: editEvent?.idea_id ?? null,
      };
      if (editEvent) {
        const ok = await updateEvent(editEvent.id, data);
        if (ok) {
          toast.success('Event berhasil diperbarui');
          onOpenChange(false);
        }
      } else {
        const created = await createEvent(data);
        if (created) {
          toast.success('Event berhasil ditambahkan');
          onOpenChange(false);
        }
      }
    } catch {
      toast.error('Gagal menyimpan event');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setForm(emptyForm);
      setMode('create');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>
            {mode === 'view' ? 'Detail Event' : mode === 'edit' ? 'Edit Event' : 'Event Baru'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' && editEvent ? (
          // ── VIEW MODE ──
          <div className="grid gap-6">
            <div className="grid gap-1">
              <h2 className="text-xl font-bold">{editEvent.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="size-4" />
                <span>
                  {formatDateWithDay(editEvent.scheduled_date)} {editEvent.scheduled_time ? `• ${editEvent.scheduled_time}` : ''}
                </span>
                <span className="text-border px-1">•</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                   editEvent.status === 'idea' ? 'bg-slate-100 text-slate-600' : 
                   editEvent.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 
                   editEvent.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 
                   'bg-red-100 text-red-600'
                }`}>
                  {editEvent.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <ViewRow 
                label="Platform" 
                value={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editEvent.platform ? editEvent.platform.split(',').map(p => (
                      <span key={p} className="bg-muted text-foreground px-2 py-0.5 rounded-md text-xs border">
                        {p.trim() === 'Semua Platform' ? 'Semua Platform' : platforms.find(x => x.platform_id === p.trim())?.name || p.trim()}
                      </span>
                    )) : '-'}
                  </div>
                } 
              />
              <ViewRow 
                label="Akun" 
                value={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editEvent.account ? editEvent.account.split(',').map(a => (
                      <span key={a} className="bg-muted text-foreground px-2 py-0.5 rounded-md text-xs border">
                        {a.trim()}
                      </span>
                    )) : '-'}
                  </div>
                } 
              />
              <ViewRow label="Pilar" value={pillars.find(p => p.pillar_id === editEvent.pillar)?.label || editEvent.pillar || '-'} />
              <ViewRow label="Format" value={editEvent.format || '-'} />
            </div>

            {editEvent.notes && (
              <div className="border-t pt-4">
                <ViewRow label="Catatan" value={editEvent.notes} multiline />
              </div>
            )}

            {!readOnly && (
              <DialogFooter className="sm:justify-between mt-4">
                {onDelete ? (
                  <Button type="button" variant="destructive" onClick={() => onDelete(editEvent)}>
                    Hapus
                  </Button>
                ) : (
                  <div />
                )}
                <Button onClick={() => setMode('edit')} className="gap-1.5">
                  <Pencil className="size-3.5" />
                  Edit Event
                </Button>
              </DialogFooter>
            )}
          </div>
        ) : (
          // ── EDIT / CREATE MODE ──
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Contoh: Launching Produk" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        update('platform', form.platform.includes('Semua Platform') 
                          ? form.platform.filter(x => x !== 'Semua Platform') 
                          : [...form.platform, 'Semua Platform']
                        );
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        form.platform.includes('Semua Platform') 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      Semua Platform
                    </button>
                    {platforms.map(p => {
                      const isSelected = form.platform.includes(p.platform_id);
                      return (
                        <button
                          key={p.platform_id}
                          type="button"
                          onClick={() => {
                            update('platform', isSelected 
                              ? form.platform.filter(x => x !== p.platform_id) 
                              : [...form.platform, p.platform_id]
                            );
                          }}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background hover:bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Akun</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        update('account', form.account.includes('Semua Akun') 
                          ? form.account.filter(x => x !== 'Semua Akun') 
                          : [...form.account, 'Semua Akun']
                        );
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        form.account.includes('Semua Akun') 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      Semua Akun
                    </button>
                    {accounts.map(a => {
                      const isSelected = form.account.includes(a.name);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            update('account', isSelected 
                              ? form.account.filter(x => x !== a.name) 
                              : [...form.account, a.name]
                            );
                          }}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background hover:bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="pillar">Pilar</Label>
                  <Select value={form.pillar} onValueChange={v => update('pillar', v ?? '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih pilar">
                        {form.pillar ? pillars.find(p => p.pillar_id === form.pillar)?.label || form.pillar : 'Pilih pilar'}
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
                <div className="grid gap-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={form.format} onValueChange={v => update('format', v ?? '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih format">
                        {form.format || 'Pilih format'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-</SelectItem>
                      {FORMAT_OPTIONS.map(f => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <SelectValue>
                      {form.status === 'idea' ? 'Idea' : 
                       form.status === 'scheduled' ? 'Terjadwal' : 
                       form.status === 'published' ? 'Terbit' : 
                       form.status === 'cancelled' ? 'Dibatalkan' : form.status}
                    </SelectValue>
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

            <DialogFooter className="sm:justify-between mt-4">
              {mode === 'edit' && onDelete ? (
                <Button type="button" variant="destructive" onClick={() => onDelete(editEvent!)}>
                  Hapus
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                {mode === 'edit' ? (
                  <Button variant="outline" onClick={() => setMode('view')}>
                    Batal
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleOpenChange(false)}>
                    Batal
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Event'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
