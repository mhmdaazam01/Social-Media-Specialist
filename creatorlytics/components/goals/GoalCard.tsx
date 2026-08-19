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
  const confidenceColor = capped >= 80 ? 'text-[#6ECDB0]' : capped >= 50 ? 'text-[#8EC5FC]' : 'text-[#FFB5A0]';
  const confidenceBg = capped >= 80 ? 'bg-gradient-to-br from-[#A8E6CF] to-[#6ECDB0]' : capped >= 50 ? 'bg-gradient-to-br from-[#8EC5FC] to-[#6BA3E8]' : 'bg-gradient-to-br from-[#FFB5A0] to-[#FF9680]';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-cly-text truncate capitalize">{goal.metric}</p>
          <p className="text-xs text-cly-text-3 capitalize mt-0.5 font-medium">
            {goal.platform === 'all' ? 'Semua Platform' : goal.platform}
            {goal.account && goal.account !== 'all' && ` · ${goal.account}`}
          </p>
        </div>
        <span className={`${confidenceBg} text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0 shadow-sm`}>
          {capped}%
        </span>
      </div>

      {/* Target Info */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-cly-text-3 font-medium">Current</span>
          <span className="text-cly-text font-bold">{actual.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-cly-text-3 font-medium">Target</span>
          <span className="text-cly-text-2 font-semibold">{goal.target.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-cly-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            capped >= 80 ? 'bg-gradient-to-r from-[#A8E6CF] to-[#6ECDB0]' : capped >= 50 ? 'bg-gradient-to-r from-[#8EC5FC] to-[#6BA3E8]' : 'bg-gradient-to-r from-[#FFB5A0] to-[#FF9680]'
          }`}
          style={{ width: `${capped}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-cly-border">
        <span className="text-xs text-cly-text-3 font-medium">
          Due: {new Date(goal.year, goal.month - 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="w-8 h-8 rounded-lg border border-cly-border bg-white text-cly-text-2 hover:bg-cly-muted grid place-items-center transition-all shadow-sm"
            aria-label="Edit goal"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="w-8 h-8 rounded-lg border border-cly-border bg-white text-cly-text-2 hover:bg-gradient-to-br hover:from-[#FFB5A0] hover:to-[#FF9680] hover:text-white hover:border-transparent grid place-items-center transition-all shadow-sm"
            aria-label="Hapus goal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
