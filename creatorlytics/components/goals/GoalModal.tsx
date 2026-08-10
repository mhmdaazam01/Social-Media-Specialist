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
import { useGoals } from '@/lib/hooks/useGoals';
import { usePlatforms } from '@/lib/hooks/usePlatforms';
import { useAccounts } from '@/lib/hooks/useAccounts';
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
  target: string;
  metric: string;
  platform: string;
  account: string;
  month: string;
  year: string;
}

const initialState: FormState = {
  target: '',
  metric: 'followers',
  platform: 'all',
  account: 'all',
  month: String(currentMonth()),
  year: String(currentYear()),
};

export function GoalModal({ open, onOpenChange, editGoal }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoals();
  const { platforms } = usePlatforms();
  const { accounts } = useAccounts();

  const [form, setForm] = useState<FormState>(initialState);

  const reset = useCallback(() => {
    if (editGoal) {
      setForm({
        target: String(editGoal.target),
        metric: editGoal.metric,
        platform: editGoal.platform,
        account: editGoal.account || 'all',
        month: String(editGoal.month),
        year: String(editGoal.year),
      });
    } else {
      setForm(initialState);
    }
  }, [editGoal]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        reset();
      });
    }
  }, [open, reset]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const target = parseInt(form.target, 10);
    if (isNaN(target) || target <= 0) {
      toast.error('Target harus berupa angka positif');
      return;
    }
    const month = parseInt(form.month, 10);
    const year = parseInt(form.year, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      toast.error('Bulan harus antara 1–12');
      return;
    }
    if (isNaN(year) || year < 2020 || year > 2100) {
      toast.error('Tahun tidak valid');
      return;
    }

    // Generate auto label based on metric, target, and month
    const metricLabel = form.metric.charAt(0).toUpperCase() + form.metric.slice(1);
    const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long' });
    const autoLabel = `${metricLabel} ${target.toLocaleString('id-ID')} - ${monthName} ${year}`;

    const goalData: Omit<Goal, 'id' | 'created_at'> = {
      label: autoLabel,
      emoji: '',
      target,
      metric: form.metric,
      platform: form.platform,
      account: form.account === 'all' ? 'all' : form.account,
      month,
      year,
    };

    try {
      if (editGoal) {
        await updateGoal(editGoal.id, goalData);
        toast.success('Goal berhasil diperbarui');
      } else {
        const result = await createGoal(goalData);
        if (result) {
          toast.success('Goal berhasil dibuat');
        } else {
          toast.error('Gagal membuat goal. Periksa console browser untuk detail error (tekan F12).');
          return;
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Gagal menyimpan goal. Periksa console untuk detail error.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Edit Goal' : 'Buat Goal Baru'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="target">Target</Label>
            <Input id="target" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="10000" />
          </div>
          <div className="grid gap-2">
            <Label>Metrik</Label>
            <Select value={form.metric} onValueChange={v => set('metric', v ?? 'followers')}>
              <SelectTrigger>
                <SelectValue>
                  {form.metric.charAt(0).toUpperCase() + form.metric.slice(1)}
                </SelectValue>
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
                <SelectValue>
                  {form.platform === 'all' ? 'Semua Platform' : platforms.find(p => p.platform_id === form.platform)?.name || form.platform}
                </SelectValue>
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
          <div className="grid gap-2">
            <Label>Akun</Label>
            <Select value={form.account} onValueChange={v => set('account', v ?? 'all')}>
              <SelectTrigger>
                <SelectValue>
                  {form.account === 'all' ? 'Semua Akun' : accounts.find(a => a.name === form.account)?.name || form.account}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Akun</SelectItem>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.name}>
                    {a.name}
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
