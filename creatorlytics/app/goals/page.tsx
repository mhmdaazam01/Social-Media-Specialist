'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalModal } from '@/components/goals/GoalModal';
import { useGoals } from '@/lib/hooks/useGoals';
import { usePosts } from '@/lib/hooks/usePosts';
import { Plus, Target, Sparkles } from 'lucide-react';
import { calcGoalProgress } from '@/lib/utils/insights';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const { goals, loading: goalsLoading, deleteGoal } = useGoals();
  const { posts, loading: postsLoading } = usePosts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const loading = goalsLoading || postsLoading;

  const items = useMemo(() => {
    return goals.map(goal => {
      const actual = calcGoalProgress(goal, posts);
      const progress = goal.target > 0 ? Math.round((actual / goal.target) * 100) : 0;
      return { goal, progress, actual };
    });
  }, [goals, posts]);

  function handleEdit(goal: Goal) {
    setEditGoal(goal);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditGoal(null);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    deleteGoal(id);
  }

  if (loading) {
    return (
      <AppShell title="Goals">
        <div className="flex flex-col gap-[18px]">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // Find best performing goal for forecast
  const topGoal = items.length > 0 
    ? items.reduce((best, curr) => curr.progress > best.progress ? curr : best)
    : null;

  return (
    <AppShell title="Goals">
      <div className="flex flex-col gap-[18px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-cly-surface border border-cly-border rounded-[10px] shadow-cly">
            <Target className="size-12 text-cly-text-3 mb-4" />
            <p className="text-cly-md text-cly-text-2 mb-1">Belum ada goals</p>
            <p className="text-cly-sm text-cly-text-3 mb-4">Buat target pertamamu untuk tracking progress!</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 h-[34px] px-3.5 rounded-lg bg-cly-brand border border-cly-brand text-white text-cly-sm font-bold hover:bg-cly-brand-2 transition-colors"
            >
              <Plus size={16} />
              Buat Goal
            </button>
          </div>
        ) : (
          <>
            {/* Goal Cards Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ goal, progress, actual }) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={progress}
                  actual={actual}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* AI Forecast Card */}
            {topGoal && topGoal.progress > 0 && (
              <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px]">
                <div className="flex items-start gap-3">
                  <div className="w-[34px] h-[34px] rounded-lg bg-cly-brand-tint text-cly-brand grid place-items-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-cly-sm font-bold text-cly-text-2 mb-1">
                      ✦ AI Forecast
                    </div>
                    <div className="text-cly-base text-cly-text-2 leading-relaxed">
                      Dengan pertumbuhan saat ini, target{' '}
                      <strong className="text-cly-text">{topGoal.goal.label}</strong>{' '}
                      kemungkinan tercapai pada{' '}
                      <strong className="text-cly-text">
                        {new Date(topGoal.goal.year, topGoal.goal.month - 1).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </strong>
                      . {topGoal.progress >= 80 ? 'Pertahankan momentum!' : 'Tingkatkan frekuensi posting untuk mempercepat pencapaian.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Add Button */}
            <button
              onClick={handleAdd}
              className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-40 inline-flex items-center justify-center gap-2 h-[44px] px-4 rounded-[10px] bg-cly-brand border border-cly-brand text-white text-cly-base font-bold shadow-cly-hover hover:shadow-cly transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Goal Baru
            </button>
          </>
        )}

        <GoalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editGoal={editGoal}
        />
      </div>
    </AppShell>
  );
}
