'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { useCollaboration } from '@/lib/context/CollaborationContext';
import type { Post, Goal, Platform, Pillar, ContentIdea, CalendarEvent, Account } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  // Posts
  posts: Post[];
  postsLoading: boolean;
  createPost: (post: Omit<Post, 'id' | 'created_at'>) => Promise<Post | null>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  importPosts: (newPosts: Omit<Post, 'id' | 'created_at'>[]) => Promise<number>;
  getPost: (id: string) => Post | undefined;
  refreshPosts: () => Promise<void>;

  // Goals
  goals: Goal[];
  goalsLoading: boolean;
  createGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;

  // Platforms
  platforms: Platform[];
  platformsLoading: boolean;
  addPlatform: (platform: Omit<Platform, 'id'>) => Promise<Platform | null>;
  updatePlatform: (id: string, updates: Partial<Platform>) => Promise<boolean>;
  removePlatform: (id: string) => Promise<boolean>;

  // Pillars
  pillars: Pillar[];
  pillarsLoading: boolean;
  addPillar: (pillar: Omit<Pillar, 'id'>) => Promise<Pillar | null>;
  updatePillar: (id: string, updates: Partial<Pillar>) => Promise<boolean>;
  removePillar: (id: string) => Promise<boolean>;

  // Ideas
  ideas: ContentIdea[];
  ideasLoading: boolean;
  createIdea: (idea: Omit<ContentIdea, 'id' | 'created_at'>) => Promise<ContentIdea | null>;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => Promise<boolean>;
  deleteIdea: (id: string) => Promise<boolean>;

  // Events
  events: CalendarEvent[];
  eventsLoading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;

  // Accounts
  accounts: Account[];
  accountsLoading: boolean;
  addAccount: (name: string) => Promise<Account | null>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<boolean>;
  removeAccount: (id: string) => Promise<boolean>;

  // Factory Reset
  factoryReset: () => Promise<boolean>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { activeWorkspaceId } = useCollaboration();
  // P0-1: Stable memoized client — never recreated on render
  const supabase = useMemo(() => createClient(), []);

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

  // P1-1: Monotonic load ID — only the most recent load may commit results
  const loadIdRef = useRef(0);

  const fetchAll = useCallback(async (expectedLoadId: number, workspaceId: string) => {
    setPosts([]); setGoals([]); setPlatforms([]); setPillars([]);
    setIdeas([]); setEvents([]); setAccounts([]);
    setPostsLoading(true); setGoalsLoading(true); setPlatformsLoading(true);
    setPillarsLoading(true); setIdeasLoading(true); setEventsLoading(true);
    setAccountsLoading(true);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const [postsRes, goalsRes, platformsRes, pillarsRes, ideasRes, eventsRes, accountsRes] = await Promise.all([
      supabase.from('posts').select('*').eq('user_id', workspaceId).gte('date', oneYearAgoStr).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('platforms').select('*').eq('user_id', workspaceId).order('created_at', { ascending: true }),
      supabase.from('pillars').select('*').eq('user_id', workspaceId).order('created_at', { ascending: true }),
      supabase.from('content_ideas').select('*').eq('user_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').eq('user_id', workspaceId).order('scheduled_date', { ascending: true }),
      supabase.from('accounts').select('*').eq('user_id', workspaceId).order('created_at', { ascending: true }),
    ]);

    // P1-1: Discard stale results if a newer load has started
    if (loadIdRef.current !== expectedLoadId) return;

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
  }, [supabase]);

  useEffect(() => {
    if (user && activeWorkspaceId) {
      // Increment load ID — any in-flight fetch with a lower ID will discard its results
      const myLoadId = ++loadIdRef.current;
      fetchAll(myLoadId, activeWorkspaceId);
    } else if (!user) {
      loadIdRef.current++;
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
  }, [user, activeWorkspaceId, fetchAll]);

  // Posts CRUD
  const createPost = useCallback(async (post: Omit<Post, 'id' | 'created_at'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('posts').insert([{ ...post, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setPosts(prev => [data, ...prev]); return data; }
    toast.error('Gagal menambahkan post');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updatePost = useCallback(async (id: string, updates: Partial<Post>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('posts').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) {
      toast.error('Gagal menyimpan data');
      return false;
    }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('posts').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus post'); return false; }
    setPosts(prev => prev.filter(p => p.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const importPosts = useCallback(async (newPosts: Omit<Post, 'id' | 'created_at'>[]) => {
    if (!user || !activeWorkspaceId) return 0;
    const postsWithUser = newPosts.map(p => ({ ...p, user_id: activeWorkspaceId }));
    const { data, error } = await supabase.from('posts').insert(postsWithUser).select();
    if (!error && data) { setPosts(prev => [...prev, ...data]); return data.length; }
    return 0;
  }, [user, activeWorkspaceId, supabase]);

  const getPost = useCallback((id: string) => posts.find(p => p.id === id), [posts]);

  // P1-8: refreshPosts now filtered to activeWorkspaceId
  const refreshPosts = useCallback(async () => {
    if (!user || !activeWorkspaceId) return;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('posts').select('*')
      .eq('user_id', activeWorkspaceId)
      .gte('date', oneYearAgoStr)
      .order('date', { ascending: false });
    if (!error && data) setPosts(data);
  }, [supabase, user, activeWorkspaceId]);

  // Goals CRUD
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: activeWorkspaceId }]).select().single();
    if (error) { toast.error('Gagal menambahkan goal'); return null; }
    if (data) { setGoals(prev => [data, ...prev]); return data; }
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui goal'); return false; }
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus goal'); return false; }
    setGoals(prev => prev.filter(g => g.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  // Platforms CRUD
  const addPlatform = useCallback(async (platform: Omit<Platform, 'id'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('platforms').insert([{ ...platform, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setPlatforms(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan platform');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updatePlatform = useCallback(async (id: string, updates: Partial<Platform>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('platforms').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui platform'); return false; }
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const removePlatform = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('platforms').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus platform'); return false; }
    setPlatforms(prev => prev.filter(p => p.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  // Pillars CRUD
  const addPillar = useCallback(async (pillar: Omit<Pillar, 'id'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('pillars').insert([{ ...pillar, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setPillars(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan pilar');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updatePillar = useCallback(async (id: string, updates: Partial<Pillar>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('pillars').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui pilar'); return false; }
    setPillars(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const removePillar = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('pillars').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus pilar'); return false; }
    setPillars(prev => prev.filter(p => p.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  // Ideas CRUD
  const createIdea = useCallback(async (idea: Omit<ContentIdea, 'id' | 'created_at'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('content_ideas').insert([{ ...idea, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setIdeas(prev => [data, ...prev]); return data; }
    toast.error('Gagal menambahkan ide');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updateIdea = useCallback(async (id: string, updates: Partial<ContentIdea>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('content_ideas').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui ide'); return false; }
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    return true;
  }, [user, activeWorkspaceId, supabase]);

  const deleteIdea = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('content_ideas').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus ide'); return false; }
    setIdeas(prev => prev.filter(i => i.id !== id));
    return true;
  }, [user, activeWorkspaceId, supabase]);

  // Events CRUD
  const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('calendar_events').insert([{ ...event, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setEvents(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan event');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('calendar_events').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui event'); return false; }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus event'); return false; }
    setEvents(prev => prev.filter(e => e.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  // Accounts CRUD
  const addAccount = useCallback(async (name: string) => {
    if (!user || !activeWorkspaceId) return null;
    const { data, error } = await supabase.from('accounts').insert([{ name, user_id: activeWorkspaceId }]).select().single();
    if (!error && data) { setAccounts(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan akun');
    return null;
  }, [user, activeWorkspaceId, supabase]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('accounts').update(updates).eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal memperbarui akun'); return false; }
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  const removeAccount = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !activeWorkspaceId) return false;
    const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', activeWorkspaceId);
    if (error) { toast.error('Gagal menghapus akun'); return false; }
    setAccounts(prev => prev.filter(a => a.id !== id));
    return true;
  }, [supabase, user, activeWorkspaceId]);

  // P1-3: factoryReset — only clears local state after confirmed DB success
  const factoryReset = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const results = await Promise.all([
      supabase.from('posts').delete().eq('user_id', user.id),
      supabase.from('goals').delete().eq('user_id', user.id),
      supabase.from('platforms').delete().eq('user_id', user.id),
      supabase.from('pillars').delete().eq('user_id', user.id),
      supabase.from('content_ideas').delete().eq('user_id', user.id),
      supabase.from('calendar_events').delete().eq('user_id', user.id),
      supabase.from('accounts').delete().eq('user_id', user.id),
    ]);

    const failed = results.filter(r => r.error);
    if (failed.length > 0) {
      toast.error('Sebagian data gagal dihapus. Coba lagi.');
      return false;
    }

    setPosts([]);
    setGoals([]);
    setPlatforms([]);
    setPillars([]);
    setIdeas([]);
    setEvents([]);
    setAccounts([]);
    return true;
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
