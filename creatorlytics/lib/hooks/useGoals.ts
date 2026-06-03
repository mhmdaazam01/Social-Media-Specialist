'use client';

import { useData } from '@/lib/context/DataContext';

export function useGoals() {
  const {
    goals,
    goalsLoading: loading,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useData();

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
