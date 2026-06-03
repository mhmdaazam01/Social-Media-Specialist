'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalModal } from '@/components/goals/GoalModal';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/lib/hooks/useGoals';
import { usePosts } from '@/lib/hooks/usePosts';
import { Plus, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { parseDateParts } from '@/lib/utils/formatting';
import type { Goal, Post } from '@/types';

function calcActual(goal: Goal, posts: Post[]): number {
  const filtered = posts.filter(p => {
    if (!p.date) return false;
    const parts = parseDateParts(p.date);
    if (!parts) return false;
    if (parts.year !== goal.year || parts.month !== goal.month) return false;
    if (goal.platform !== 'all' && p.platform !== goal.platform) return false;
    return true;
  });

  switch (goal.metric) {
    case 'followers':
      return filtered.reduce((s, p) => s + p.followers_gained, 0);
    case 'reach':
      return filtered.reduce((s, p) => s + p.reach, 0);
    case 'impression':
      return filtered.reduce((s, p) => s + p.impression, 0);
    case 'engagement':
      return filtered.reduce((s, p) => s + p.like + p.comment + p.share + p.save, 0);
    case 'posts':
      return filtered.length;
    case 'likes':
      return filtered.reduce((s, p) => s + p.like, 0);
    case 'comments':
      return filtered.reduce((s, p) => s + p.comment, 0);
    default:
      return 0;
  }
}

export default function GoalsPage() {
  const { goals, loading: goalsLoading, deleteGoal } = useGoals();
  const { posts, loading: postsLoading } = usePosts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const loading = goalsLoading || postsLoading;

  const items = useMemo(() => {
    return goals.map(goal => {
      const actual = calcActual(goal, posts);
      const progress = goal.target > 0 ? Math.round((actual / goal.target) * 100) : 0;
      return { goal, progress };
    });
  }, [goals, posts]);

  if (loading) {
    return (
      <AppShell title="Goals">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-3.5 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

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

  return (
    <AppShell title="Goals">
      <div className="flex flex-col gap-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada goals. Buat target pertamamu!</p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="size-4" />
              Buat Goal
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ goal, progress }) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={progress}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <Button className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-40 shadow-lg" size="lg" onClick={handleAdd}>
              <Plus className="size-5" />
              Goal Baru
            </Button>
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
