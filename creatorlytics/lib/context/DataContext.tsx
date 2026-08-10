'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import type { Post, Goal, Platform, Pillar, ContentIdea, CalendarEvent, Account } from '@/types';
import { toast } from 'sonner';

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
  updatePlatform: (id: string, updates: Partial<Platform>) => Promise<void>;
  removePlatform: (id: string) => Promise<void>;

  // Pillars
  pillars: Pillar[];
  pillarsLoading: boolean;
  addPillar: (pillar: Omit<Pillar, 'id'>) => Promise<Pillar | null>;
  updatePillar: (id: string, updates: Partial<Pillar>) => Promise<void>;
  removePillar: (id: string) => Promise<void>;

  // Ideas
  ideas: ContentIdea[];
  ideasLoading: boolean;
  createIdea: (idea: Omit<ContentIdea, 'id' | 'created_at'>) => Promise<ContentIdea | null>;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  // Events
  events: CalendarEvent[];
  eventsLoading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Accounts
  accounts: Account[];
  accountsLoading: boolean;
  addAccount: (name: string) => Promise<Account | null>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;

  // Factory Reset
  factoryReset: () => Promise<void>;
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
  
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(true);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [hasFetched, setHasFetched] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const [postsRes, goalsRes, platformsRes, pillarsRes, ideasRes, eventsRes, accountsRes] = await Promise.all([
      supabase.from('posts').select('*').eq('user_id', user.id).gte('date', oneYearAgoStr).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('platforms').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('pillars').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('content_ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').eq('user_id', user.id).order('scheduled_date', { ascending: true }),
      supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);

    if (!postsRes.error && postsRes.data) setPosts(postsRes.data);
    if (!goalsRes.error && goalsRes.data) setGoals(goalsRes.data);
    if (!platformsRes.error && platformsRes.data) setPlatforms(platformsRes.data);
    if (!pillarsRes.error && pillarsRes.data) setPillars(pillarsRes.data);
    if (!ideasRes.error && ideasRes.data) setIdeas(ideasRes.data);
    if (!eventsRes.error && eventsRes.data) setEvents(eventsRes.data);
    if (!accountsRes.error && accountsRes.data) setAccounts(accountsRes.data);

    setPostsLoading(false);
    setGoalsLoading(false);
    setPlatformsLoading(false);
    setPillarsLoading(false);
    setIdeasLoading(false);
    setEventsLoading(false);
    setAccountsLoading(false);

    setHasFetched(true);
  }, [supabase, user]);

  useEffect(() => {
    if (user && !hasFetched) {
      queueMicrotask(() => {
        fetchAll();
      });
    } else if (!user) {
      queueMicrotask(() => {
        setPosts([]); setPostsLoading(false);
        setGoals([]); setGoalsLoading(false);
        setPlatforms([]); setPlatformsLoading(false);
        setPillars([]); setPillarsLoading(false);
        setIdeas([]); setIdeasLoading(false);
        setEvents([]); setEventsLoading(false);
        setAccounts([]); setAccountsLoading(false);
      });
    }
  }, [user, hasFetched, fetchAll]);

  // Posts CRUD
  const createPost = useCallback(async (post: Omit<Post, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('posts').insert([{ ...post, user_id: user.id }]).select().single();
    if (!error && data) { setPosts(prev => [data, ...prev]); return data; }
    return null;
  }, [user, supabase]);

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    if (!user) return;
    const { error } = await supabase.from('posts').update(updates).eq('id', id).eq('user_id', user.id);
    if (error) {
      console.error('Failed to update post:', error);
      toast.error(`Gagal menyimpan data: ${error.message}`);
    } else {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  }, [supabase, user]);

  const deletePost = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('posts').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setPosts(prev => prev.filter(p => p.id !== id));
  }, [supabase, user]);

  const importPosts = useCallback(async (newPosts: Omit<Post, 'id' | 'created_at'>[]) => {
    if (!user) return 0;
    const postsWithUser = newPosts.map(p => ({ ...p, user_id: user.id }));
    const { data, error } = await supabase.from('posts').insert(postsWithUser).select();
    if (!error && data) { setPosts(prev => [...prev, ...data]); return data.length; }
    return 0;
  }, [user, supabase]);

  const getPost = useCallback((id: string) => posts.find(p => p.id === id), [posts]);

  const refreshPosts = useCallback(async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
    const { data, error } = await supabase.from('posts').select('*').gte('date', oneYearAgoStr).order('date', { ascending: false });
    if (!error && data) setPosts(data);
  }, [supabase]);

  // Goals CRUD
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: user.id }]).select().single();
    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }
    if (data) { 
      setGoals(prev => [data, ...prev]); 
      return data; 
    }
    return null;
  }, [user, supabase]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    const { error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', user.id);
    if (error) {
      console.error('Error updating goal:', error);
      return;
    }
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [supabase, user]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setGoals(prev => prev.filter(g => g.id !== id));
  }, [supabase, user]);

  // Platforms CRUD
  const addPlatform = useCallback(async (platform: Omit<Platform, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('platforms').insert([{ ...platform, user_id: user.id }]).select().single();
    if (!error && data) { setPlatforms(prev => [...prev, data]); return data; }
    return null;
  }, [user, supabase]);

  const updatePlatform = useCallback(async (id: string, updates: Partial<Platform>) => {
    if (!user) return;
    const { error } = await supabase.from('platforms').update(updates).eq('id', id).eq('user_id', user.id);
    if (!error) setPlatforms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [supabase, user]);

  const removePlatform = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('platforms').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setPlatforms(prev => prev.filter(p => p.id !== id));
  }, [supabase, user]);

  // Pillars CRUD
  const addPillar = useCallback(async (pillar: Omit<Pillar, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('pillars').insert([{ ...pillar, user_id: user.id }]).select().single();
    if (!error && data) { setPillars(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan pilar');
    return null;
  }, [user, supabase]);

  const updatePillar = useCallback(async (id: string, updates: Partial<Pillar>) => {
    if (!user) return;
    const { error } = await supabase.from('pillars').update(updates).eq('id', id).eq('user_id', user.id);
    if (!error) setPillars(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [supabase, user]);

  const removePillar = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('pillars').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setPillars(prev => prev.filter(p => p.id !== id));
    else toast.error('Gagal menghapus pilar');
  }, [supabase, user]);

  // Ideas CRUD
  const createIdea = useCallback(async (idea: Omit<ContentIdea, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('content_ideas').insert([{ ...idea, user_id: user.id }]).select().single();
    if (!error && data) { setIdeas(prev => [data, ...prev]); return data; }
    toast.error('Gagal menambahkan ide');
    return null;
  }, [user, supabase]);

  const updateIdea = useCallback(async (id: string, updates: Partial<ContentIdea>) => {
    if (!user) return;
    const { error } = await supabase.from('content_ideas').update(updates).eq('id', id).eq('user_id', user.id);
    if (!error) setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    else toast.error('Gagal memperbarui ide');
  }, [supabase, user]);

  const deleteIdea = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('content_ideas').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setIdeas(prev => prev.filter(i => i.id !== id));
    else toast.error('Gagal menghapus ide');
  }, [supabase, user]);

  // Events CRUD
  const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('calendar_events').insert([{ ...event, user_id: user.id }]).select().single();
    if (!error && data) { setEvents(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan event');
    return null;
  }, [user, supabase]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;
    const { error } = await supabase.from('calendar_events').update(updates).eq('id', id).eq('user_id', user.id);
    if (!error) setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    else toast.error('Gagal memperbarui event');
  }, [supabase, user]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setEvents(prev => prev.filter(e => e.id !== id));
    else toast.error('Gagal menghapus event');
  }, [supabase, user]);

  // Accounts CRUD
  const addAccount = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase.from('accounts').insert([{ name, user_id: user.id }]).select().single();
    if (!error && data) { setAccounts(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan akun');
    return null;
  }, [user, supabase]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    if (!user) return;
    const { error } = await supabase.from('accounts').update(updates).eq('id', id).eq('user_id', user.id);
    if (!error) setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [supabase, user]);

  const removeAccount = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setAccounts(prev => prev.filter(a => a.id !== id));
    else toast.error('Gagal menghapus akun');
  }, [supabase, user]);

  const factoryReset = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      supabase.from('posts').delete().eq('user_id', user.id),
      supabase.from('goals').delete().eq('user_id', user.id),
      supabase.from('platforms').delete().eq('user_id', user.id),
      supabase.from('pillars').delete().eq('user_id', user.id),
      supabase.from('content_ideas').delete().eq('user_id', user.id),
      supabase.from('calendar_events').delete().eq('user_id', user.id),
      supabase.from('accounts').delete().eq('user_id', user.id),
    ]);
    // Refresh all states
    setPosts([]);
    setGoals([]);
    setPlatforms([]);
    setPillars([]);
    setIdeas([]);
    setEvents([]);
    setAccounts([]);
    toast.success('Seluruh data berhasil dihapus');
  }, [supabase, user]);

  return (
    <DataContext.Provider
      value={{
        posts, postsLoading, createPost, updatePost, deletePost, importPosts, getPost, refreshPosts,
        goals, goalsLoading, createGoal, updateGoal, deleteGoal,
        platforms, platformsLoading, addPlatform, updatePlatform, removePlatform,
        pillars, pillarsLoading, addPillar, updatePillar, removePillar,
        ideas, ideasLoading, createIdea, updateIdea, deleteIdea,
        events, eventsLoading, createEvent, updateEvent, deleteEvent,
        accounts, accountsLoading, addAccount, updateAccount, removeAccount,
        factoryReset,
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
