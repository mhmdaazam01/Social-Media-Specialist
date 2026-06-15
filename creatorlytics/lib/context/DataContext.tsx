'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import type { Post, Goal, Platform, Pillar, ContentIdea, Competitor, CalendarEvent, Account } from '@/types';
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
  removePlatform: (id: string) => Promise<void>;

  // Pillars
  pillars: Pillar[];
  pillarsLoading: boolean;
  addPillar: (pillar: Omit<Pillar, 'id'>) => Promise<Pillar | null>;
  removePillar: (id: string) => Promise<void>;

  // Ideas
  ideas: ContentIdea[];
  ideasLoading: boolean;
  createIdea: (idea: Omit<ContentIdea, 'id' | 'created_at'>) => Promise<ContentIdea | null>;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  // Competitors
  competitors: Competitor[];
  competitorsLoading: boolean;
  createCompetitor: (competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => Promise<Competitor | null>;
  updateCompetitor: (id: string, updates: Partial<Competitor>) => Promise<void>;
  deleteCompetitor: (id: string) => Promise<void>;

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
  removeAccount: (id: string) => Promise<void>;
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
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [hasFetched, setHasFetched] = useState(false);

  const fetchAll = useCallback(async () => {
    const [postsRes, goalsRes, platformsRes, pillarsRes, ideasRes, competitorsRes, eventsRes, accountsRes] = await Promise.all([
      supabase.from('posts').select('*').order('date', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
      supabase.from('platforms').select('*').order('created_at', { ascending: true }),
      supabase.from('pillars').select('*').order('created_at', { ascending: true }),
      supabase.from('content_ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('competitors').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('scheduled_date', { ascending: true }),
      supabase.from('accounts').select('*').order('created_at', { ascending: true }),
    ]);

    if (!postsRes.error && postsRes.data) setPosts(postsRes.data);
    if (!goalsRes.error && goalsRes.data) setGoals(goalsRes.data);
    if (!platformsRes.error && platformsRes.data) setPlatforms(platformsRes.data);
    if (!pillarsRes.error && pillarsRes.data) setPillars(pillarsRes.data);
    if (!ideasRes.error && ideasRes.data) setIdeas(ideasRes.data);
    if (!competitorsRes.error && competitorsRes.data) setCompetitors(competitorsRes.data);
    if (!eventsRes.error && eventsRes.data) setEvents(eventsRes.data);
    if (!accountsRes.error && accountsRes.data) setAccounts(accountsRes.data);

    setPostsLoading(false);
    setGoalsLoading(false);
    setPlatformsLoading(false);
    setPillarsLoading(false);
    setIdeasLoading(false);
    setCompetitorsLoading(false);
    setEventsLoading(false);
    setAccountsLoading(false);

    setHasFetched(true);
  }, [supabase]);

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
        setCompetitors([]); setCompetitorsLoading(false);
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
    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (!error) setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [supabase]);

  const deletePost = useCallback(async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) setPosts(prev => prev.filter(p => p.id !== id));
  }, [supabase]);

  const importPosts = useCallback(async (newPosts: Omit<Post, 'id' | 'created_at'>[]) => {
    if (!user) return 0;
    const postsWithUser = newPosts.map(p => ({ ...p, user_id: user.id }));
    const { data, error } = await supabase.from('posts').insert(postsWithUser).select();
    if (!error && data) { setPosts(prev => [...prev, ...data]); return data.length; }
    return 0;
  }, [user, supabase]);

  const getPost = useCallback((id: string) => posts.find(p => p.id === id), [posts]);

  const refreshPosts = useCallback(async () => {
    const { data, error } = await supabase.from('posts').select('*').order('date', { ascending: false });
    if (!error && data) setPosts(data);
  }, [supabase]);

  // Goals CRUD
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: user.id }]).select().single();
    if (!error && data) { setGoals(prev => [data, ...prev]); return data; }
    return null;
  }, [user, supabase]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase.from('goals').update(updates).eq('id', id);
    if (!error) setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [supabase]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) setGoals(prev => prev.filter(g => g.id !== id));
  }, [supabase]);

  // Platforms CRUD
  const addPlatform = useCallback(async (platform: Omit<Platform, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('platforms').insert([{ ...platform, user_id: user.id }]).select().single();
    if (!error && data) { setPlatforms(prev => [...prev, data]); return data; }
    return null;
  }, [user, supabase]);

  const removePlatform = useCallback(async (id: string) => {
    const { error } = await supabase.from('platforms').delete().eq('id', id);
    if (!error) setPlatforms(prev => prev.filter(p => p.id !== id));
  }, [supabase]);

  // Pillars CRUD
  const addPillar = useCallback(async (pillar: Omit<Pillar, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('pillars').insert([{ ...pillar, user_id: user.id }]).select().single();
    if (!error && data) { setPillars(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan pilar');
    return null;
  }, [user, supabase]);

  const removePillar = useCallback(async (id: string) => {
    const { error } = await supabase.from('pillars').delete().eq('id', id);
    if (!error) setPillars(prev => prev.filter(p => p.id !== id));
    else toast.error('Gagal menghapus pilar');
  }, [supabase]);

  // Ideas CRUD
  const createIdea = useCallback(async (idea: Omit<ContentIdea, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('content_ideas').insert([{ ...idea, user_id: user.id }]).select().single();
    if (!error && data) { setIdeas(prev => [data, ...prev]); return data; }
    toast.error('Gagal menambahkan ide');
    return null;
  }, [user, supabase]);

  const updateIdea = useCallback(async (id: string, updates: Partial<ContentIdea>) => {
    const { error } = await supabase.from('content_ideas').update(updates).eq('id', id);
    if (!error) setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    else toast.error('Gagal memperbarui ide');
  }, [supabase]);

  const deleteIdea = useCallback(async (id: string) => {
    const { error } = await supabase.from('content_ideas').delete().eq('id', id);
    if (!error) setIdeas(prev => prev.filter(i => i.id !== id));
    else toast.error('Gagal menghapus ide');
  }, [supabase]);

  // Competitors CRUD
  const createCompetitor = useCallback(async (competitor: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('competitors').insert([{ ...competitor, user_id: user.id }]).select().single();
    if (!error && data) { setCompetitors(prev => [data, ...prev]); return data; }
    toast.error('Gagal menambahkan kompetitor');
    return null;
  }, [user, supabase]);

  const updateCompetitor = useCallback(async (id: string, updates: Partial<Competitor>) => {
    const { error } = await supabase.from('competitors').update(updates).eq('id', id);
    if (!error) setCompetitors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    else toast.error('Gagal memperbarui kompetitor');
  }, [supabase]);

  const deleteCompetitor = useCallback(async (id: string) => {
    const { error } = await supabase.from('competitors').delete().eq('id', id);
    if (!error) setCompetitors(prev => prev.filter(c => c.id !== id));
    else toast.error('Gagal menghapus kompetitor');
  }, [supabase]);

  // Events CRUD
  const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    if (!user) return null;
    const { data, error } = await supabase.from('calendar_events').insert([{ ...event, user_id: user.id }]).select().single();
    if (!error && data) { setEvents(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan event');
    return null;
  }, [user, supabase]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    const { error } = await supabase.from('calendar_events').update(updates).eq('id', id);
    if (!error) setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    else toast.error('Gagal memperbarui event');
  }, [supabase]);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (!error) setEvents(prev => prev.filter(e => e.id !== id));
    else toast.error('Gagal menghapus event');
  }, [supabase]);

  // Accounts CRUD
  const addAccount = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase.from('accounts').insert([{ name, user_id: user.id }]).select().single();
    if (!error && data) { setAccounts(prev => [...prev, data]); return data; }
    toast.error('Gagal menambahkan akun');
    return null;
  }, [user, supabase]);

  const removeAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) setAccounts(prev => prev.filter(a => a.id !== id));
    else toast.error('Gagal menghapus akun');
  }, [supabase]);

  return (
    <DataContext.Provider
      value={{
        posts, postsLoading, createPost, updatePost, deletePost, importPosts, getPost, refreshPosts,
        goals, goalsLoading, createGoal, updateGoal, deleteGoal,
        platforms, platformsLoading, addPlatform, removePlatform,
        pillars, pillarsLoading, addPillar, removePillar,
        ideas, ideasLoading, createIdea, updateIdea, deleteIdea,
        competitors, competitorsLoading, createCompetitor, updateCompetitor, deleteCompetitor,
        events, eventsLoading, createEvent, updateEvent, deleteEvent,
        accounts, accountsLoading, addAccount, removeAccount,
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
