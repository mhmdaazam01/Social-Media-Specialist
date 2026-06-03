'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import type { Post, Goal, Platform } from '@/types';

interface DataContextType {
  // Posts
  posts: Post[];
  postsLoading: boolean;
  createPost: (post: Omit<Post, 'id' | 'created_at'>) => Promise<Post | null>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  importPosts: (newPosts: Omit<Post, 'id' | 'created_at'>[]) => Promise<number>;
  getPost: (id: string) => Post | undefined;
  refreshPosts: () => Promise<void>;

  // Goals
  goals: Goal[];
  goalsLoading: boolean;
  createGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Platforms
  platforms: Platform[];
  platformsLoading: boolean;
  addPlatform: (platform: Omit<Platform, 'id'>) => Promise<Platform | null>;
  removePlatform: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch all data once when user is available
  useEffect(() => {
    if (user && !hasFetched) {
      fetchAll();
    } else if (!user) {
      setPosts([]);
      setGoals([]);
      setPlatforms([]);
      setPostsLoading(false);
      setGoalsLoading(false);
      setPlatformsLoading(false);
    }
  }, [user, hasFetched]);

  async function fetchAll() {
    const [postsRes, goalsRes, platformsRes] = await Promise.all([
      supabase.from('posts').select('*').order('date', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
      supabase.from('platforms').select('*').order('created_at', { ascending: true }),
    ]);

    if (!postsRes.error && postsRes.data) setPosts(postsRes.data);
    if (!goalsRes.error && goalsRes.data) setGoals(goalsRes.data);
    if (!platformsRes.error && platformsRes.data) setPlatforms(platformsRes.data);

    setPostsLoading(false);
    setGoalsLoading(false);
    setPlatformsLoading(false);
    setHasFetched(true);
  }

  // --- Posts CRUD ---
  const createPost = useCallback(async (post: Omit<Post, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...post, user_id: user.id }])
      .select()
      .single();
    if (!error && data) {
      setPosts(prev => [data, ...prev]);
      return data;
    }
    return null;
  }, [user, supabase]);

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (!error) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  }, [supabase]);

  const deletePost = useCallback(async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  }, [supabase]);

  const importPosts = useCallback(async (newPosts: Omit<Post, 'id' | 'created_at'>[]) => {
    if (!user) return 0;
    const postsWithUser = newPosts.map(p => ({ ...p, user_id: user.id }));
    const { data, error } = await supabase.from('posts').insert(postsWithUser).select();
    if (!error && data) {
      setPosts(prev => [...prev, ...data]);
      return data.length;
    }
    return 0;
  }, [user, supabase]);

  const getPost = useCallback((id: string) => posts.find(p => p.id === id), [posts]);

  const refreshPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setPosts(data);
  }, [supabase]);

  // --- Goals CRUD ---
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single();
    if (!error && data) {
      setGoals(prev => [data, ...prev]);
      return data;
    }
    return null;
  }, [user, supabase]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase.from('goals').update(updates).eq('id', id);
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    }
  }, [supabase]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  }, [supabase]);

  // --- Platforms CRUD ---
  const addPlatform = useCallback(async (platform: Omit<Platform, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('platforms')
      .insert([{ ...platform, user_id: user.id }])
      .select()
      .single();
    if (!error && data) {
      setPlatforms(prev => [...prev, data]);
      return data;
    }
    return null;
  }, [user, supabase]);

  const removePlatform = useCallback(async (id: string) => {
    const { error } = await supabase.from('platforms').delete().eq('id', id);
    if (!error) {
      setPlatforms(prev => prev.filter(p => p.id !== id));
    }
  }, [supabase]);

  return (
    <DataContext.Provider
      value={{
        posts, postsLoading, createPost, updatePost, deletePost, importPosts, getPost, refreshPosts,
        goals, goalsLoading, createGoal, updateGoal, deleteGoal,
        platforms, platformsLoading, addPlatform, removePlatform,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
