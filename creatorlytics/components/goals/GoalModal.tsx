'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useGoalStore } from '@/lib/store/goal-store';
import { usePlatformStore } from '@/lib/store/platform-store';
import { currentMonth, currentYear } from '@/lib/utils/formatting';
import { toast } from 'sonner';
import type { Goal } from '@/types';

const METRICS = ['followers', 'reach', 'impression', 'engagement', 'posts', 'likes', 'comments'] as const;

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGoal?: Goal | null;
}

interface FormState {
  label: string;
  target: string;
  metric: string;
  platform: string;
  month: string;
  year: string;
}

const initialState: FormState = {
  label: '',
  target: '',
  metric: 'followers',
  platform: 'all',
  month: String(currentMonth()),
  year: String(currentYear()),
};

export function GoalModal({ open, onOpenChange, editGoal }: GoalModalProps) {
  const createGoal = useGoalStore(s => s.createGoal);
  const updateGoal = useGoalStore(s => s.updateGoal);
  const platforms = usePlatformStore(s => s.platforms);

  const [form, setForm] = useState<FormState>(initialState);

  const reset = useCallback(() => {
    if (editGoal) {
      setForm({
        label: editGoal.label,
        target: String(editGoal.target),
        metric: editGoal.metric,
        platform: editGoal.platform,
        month: String(editGoal.month),
        year: String(editGoal.year),
      });
    } else {
      setForm(initialState);
    }
  }, [editGoal]);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.label.trim()) {
      toast.error('Label goal harus diisi');
      return;
    }
    const target = parseInt(form.target, 10);
    if (isNaN(target) || target <= 0) {
      toast.error('Target harus berupa angka positif');
      return;
    }
    const month = parseInt(form.month, 10);
    const year = parseInt(form.year, 10);

    const data = {
      label: form.label.trim(),
      emoji: '',
      target,
      metric: form.metric,
      platform: form.platform,
      month,
      year,
    };

    if (editGoal) {
      updateGoal(editGoal.id, data);
      toast.success('Goal berhasil diperbarui');
    } else {
      createGoal(data);
      toast.success('Goal berhasil dibuat');
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Edit Goal' : 'Buat Goal Baru'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Contoh: Raih 10rb Followers" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target">Target</Label>
            <Input id="target" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="10000" />
          </div>
          <div className="grid gap-2">
            <Label>Metrik</Label>
            <Select value={form.metric} onValueChange={v => set('metric', v ?? 'followers')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={v => set('platform', v ?? 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Platform</SelectItem>
                {platforms.map(p => (
                  <SelectItem key={p.id} value={p.platform_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Bulan</Label>
              <Input id="month" type="number" min={1} max={12} value={form.month} onChange={e => set('month', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Tahun</Label>
              <Input id="year" type="number" value={form.year} onChange={e => set('year', e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            {editGoal ? 'Simpan' : 'Buat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
