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


  // Find best performing goal for forecast
  const topGoal = items.length > 0 
    ? items.reduce((best, curr) => curr.progress > best.progress ? curr : best)
    : null;

  const estimatedDate = useMemo(() => {
    if (!topGoal || topGoal.actual <= 0) return null;
    const now = new Date();
    const g = topGoal.goal;
    const isCurrentMonth = g.year === now.getFullYear() && g.month === (now.getMonth() + 1);
    
    // Future goals don't have active velocity
    if (g.year > now.getFullYear() || (g.year === now.getFullYear() && g.month > (now.getMonth() + 1))) {
      return null;
    }

    const daysPassed = isCurrentMonth ? now.getDate() : new Date(g.year, g.month, 0).getDate();
    const velocity = topGoal.actual / daysPassed;
    if (velocity <= 0) return null;
    
    const daysNeeded = g.target / velocity;
    const est = new Date(g.year, g.month - 1, 1);
    est.setDate(Math.ceil(daysNeeded));
    return est;
  }, [topGoal]);

  return (
    <AppShell title="Goals">
          <div className="flex-1 p-[18px] lg:p-6 overflow-y-auto">
            {loading ? (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-3.5 h-48 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-cly-surface border border-cly-border rounded-[10px] shadow-cly">
                <div className="w-16 h-16 rounded-full bg-cly-brand-tint text-cly-brand flex items-center justify-center mb-4">
                  <Target size={32} />
                </div>
                <h3 className="text-xl font-bold text-cly-text mb-2">Belum ada Goal 🎯</h3>
                <p className="text-cly-text-2 mb-6 max-w-sm">
                  Tetapkan target reach, engagement, atau follower growth untuk bulan ini agar performa konten lebih terarah.
                </p>
                <button
                  onClick={handleAdd}
                  className="h-10 px-6 rounded-lg bg-cly-brand text-white font-semibold flex items-center gap-2 hover:bg-cly-brand-hover transition-colors shadow-cly"
                >
                  <Plus size={18} />
                  Buat Goal Pertama
                </button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          )}

            {/* AI Forecast Card */}
            {topGoal && topGoal.progress > 0 && (
              <div className="bg-cly-surface border border-cly-border rounded-[10px] shadow-cly p-[18px] mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-[34px] h-[34px] rounded-lg bg-cly-brand-tint text-cly-brand grid place-items-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-cly-sm font-bold text-cly-text-2 mb-1">
                      ✦ AI Forecast
                    </div>
                    <div className="text-cly-base text-cly-text-2 leading-relaxed">
                      {topGoal.progress >= 100 ? (
                        <>
                          Selamat! Target{' '}
                          <strong className="text-cly-text">{topGoal.goal.label}</strong>{' '}
                          sudah <strong className="text-cly-text">tercapai 100%</strong>. 
                          {' '}Pertahankan momentum ini untuk bulan depan! 🎉
                        </>
                      ) : estimatedDate ? (
                        <>
                          Dengan pertumbuhan saat ini, target{' '}
                          <strong className="text-cly-text">{topGoal.goal.label}</strong>{' '}
                          kemungkinan tercapai pada{' '}
                          <strong className="text-cly-text">
                            {estimatedDate.toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </strong>
                          . {topGoal.progress >= 80 ? 'Pertahankan momentum!' : 'Tingkatkan frekuensi posting untuk mempercepat pencapaian.'}
                        </>
                      ) : (
                        <>
                          Target{' '}
                          <strong className="text-cly-text">{topGoal.goal.label}</strong>{' '}
                          saat ini di <strong className="text-cly-text">{topGoal.progress}%</strong>. 
                          {' '}Tingkatkan frekuensi posting untuk mempercepat pencapaian.
                        </>
                      )}
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

        <GoalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editGoal={editGoal}
        />
      </div>
    </AppShell>
  );
}
