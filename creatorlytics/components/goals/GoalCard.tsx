'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@/types';

interface GoalCardProps {
  goal: Goal;
  progress: number;
  actual: number;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, progress, actual, onEdit, onDelete }: GoalCardProps) {
  const capped = Math.min(progress, 100);
  const confidenceColor = capped >= 80 ? 'text-cly-green' : capped >= 50 ? 'text-cly-amber' : 'text-cly-red';
  const confidenceBg = capped >= 80 ? 'bg-cly-green-tint' : capped >= 50 ? 'bg-cly-amber-tint' : 'bg-cly-red-tint';

  return (
    <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-cly-md font-bold text-cly-text truncate">{goal.label}</p>
          <p className="text-cly-xs text-cly-text-3 capitalize mt-0.5">
            {goal.metric} · {goal.platform === 'all' ? 'Semua Platform' : goal.platform}
          </p>
        </div>
        <span className={`${confidenceColor} ${confidenceBg} text-cly-xs font-black px-2 py-1 rounded-full shrink-0`}>
          {capped}%
        </span>
      </div>

      {/* Target Info */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-cly-sm">
          <span className="text-cly-text-3">Current</span>
          <span className="text-cly-text font-bold">{actual.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex items-baseline justify-between text-cly-sm">
          <span className="text-cly-text-3">Target</span>
          <span className="text-cly-text-2 font-semibold">{goal.target.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-cly-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            capped >= 80 ? 'bg-cly-green' : capped >= 50 ? 'bg-cly-amber' : 'bg-cly-red'
          }`}
          style={{ width: `${capped}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-cly-border">
        <span className="text-cly-xs text-cly-text-3">
          Due: {new Date(goal.year, goal.month - 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="w-8 h-8 rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 hover:bg-cly-muted grid place-items-center transition-colors"
            aria-label="Edit goal"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="w-8 h-8 rounded-lg border border-cly-border bg-cly-surface text-cly-text-2 hover:bg-cly-red-tint hover:text-cly-red hover:border-cly-red/20 grid place-items-center transition-colors"
            aria-label="Hapus goal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
