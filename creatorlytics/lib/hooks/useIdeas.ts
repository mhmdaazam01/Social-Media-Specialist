'use client';
import { useData } from '@/lib/context/DataContext';

export function useIdeas() {
  const { ideas, ideasLoading, createIdea, updateIdea, deleteIdea } = useData();
  return { ideas, loading: ideasLoading, createIdea, updateIdea, deleteIdea };
}
