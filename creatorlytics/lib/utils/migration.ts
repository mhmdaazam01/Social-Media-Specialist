import { createClient } from '@/lib/supabase/client';

interface LocalStorageData {
  posts?: any[];
  goals?: any[];
  ideas?: any[];
  events?: any[];
  competitors?: any[];
  platforms?: any[];
  pillars?: any[];
  accounts?: any[];
}

export async function migrateLocalStorageToSupabase(userId: string): Promise<number> {
  const supabase = createClient();
  let totalMigrated = 0;

  // Extract data from localStorage
  const data: LocalStorageData = {};
  
  try {
    const postsData = localStorage.getItem('cl-v2:posts');
    if (postsData) {
      const parsed = JSON.parse(postsData);
      data.posts = parsed.state?.posts || [];
    }

    const goalsData = localStorage.getItem('cl-v2:goals');
    if (goalsData) {
      const parsed = JSON.parse(goalsData);
      data.goals = parsed.state?.goals || [];
    }

    const ideasData = localStorage.getItem('cl-v2:ideas');
    if (ideasData) {
      const parsed = JSON.parse(ideasData);
      data.ideas = parsed.state?.ideas || [];
    }

    const eventsData = localStorage.getItem('cl-v2:events');
    if (eventsData) {
      const parsed = JSON.parse(eventsData);
      data.events = parsed.state?.events || [];
    }

    const competitorsData = localStorage.getItem('cl-v2:competitors');
    if (competitorsData) {
      const parsed = JSON.parse(competitorsData);
      data.competitors = parsed.state?.competitors || [];
    }

    const platformsData = localStorage.getItem('cl-v2:platforms');
    if (platformsData) {
      const parsed = JSON.parse(platformsData);
      data.platforms = parsed.state?.platforms || [];
    }

    const pillarsData = localStorage.getItem('cl-v2:pillars');
    if (pillarsData) {
      const parsed = JSON.parse(pillarsData);
      data.pillars = parsed.state?.pillars || [];
    }

    const accountsData = localStorage.getItem('cl-v2:accounts');
    if (accountsData) {
      const parsed = JSON.parse(accountsData);
      data.accounts = parsed.state?.accounts || [];
    }

    // Migrate posts
    if (data.posts && data.posts.length > 0) {
      const postsToInsert = data.posts.map(p => ({
        ...p,
        user_id: userId,
        id: undefined, // Let Supabase generate new IDs
        created_at: undefined,
      }));
      const { data: inserted } = await supabase.from('posts').insert(postsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate goals
    if (data.goals && data.goals.length > 0) {
      const goalsToInsert = data.goals.map(g => ({
        ...g,
        user_id: userId,
        id: undefined,
        created_at: undefined,
      }));
      const { data: inserted } = await supabase.from('goals').insert(goalsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate ideas
    if (data.ideas && data.ideas.length > 0) {
      const ideasToInsert = data.ideas.map(i => ({
        ...i,
        user_id: userId,
        id: undefined,
        created_at: undefined,
      }));
      const { data: inserted } = await supabase.from('content_ideas').insert(ideasToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate events
    if (data.events && data.events.length > 0) {
      const eventsToInsert = data.events.map(e => ({
        ...e,
        user_id: userId,
        id: undefined,
        created_at: undefined,
      }));
      const { data: inserted } = await supabase.from('calendar_events').insert(eventsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate competitors
    if (data.competitors && data.competitors.length > 0) {
      const competitorsToInsert = data.competitors.map(c => ({
        ...c,
        user_id: userId,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      }));
      const { data: inserted } = await supabase.from('competitors').insert(competitorsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate platforms
    if (data.platforms && data.platforms.length > 0) {
      const platformsToInsert = data.platforms.map(p => ({
        ...p,
        user_id: userId,
        id: undefined,
      }));
      const { data: inserted } = await supabase.from('platforms').insert(platformsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate pillars
    if (data.pillars && data.pillars.length > 0) {
      const pillarsToInsert = data.pillars.map(p => ({
        ...p,
        user_id: userId,
        id: undefined,
      }));
      const { data: inserted } = await supabase.from('pillars').insert(pillarsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Migrate accounts
    if (data.accounts && data.accounts.length > 0) {
      const accountsToInsert = data.accounts.map(a => ({
        ...a,
        user_id: userId,
        id: undefined,
        created_at: undefined,
      }));
      const { data: inserted } = await supabase.from('accounts').insert(accountsToInsert).select();
      if (inserted) totalMigrated += inserted.length;
    }

    // Clear localStorage after successful migration
    if (totalMigrated > 0) {
      localStorage.removeItem('cl-v2:posts');
      localStorage.removeItem('cl-v2:goals');
      localStorage.removeItem('cl-v2:ideas');
      localStorage.removeItem('cl-v2:events');
      localStorage.removeItem('cl-v2:competitors');
      localStorage.removeItem('cl-v2:platforms');
      localStorage.removeItem('cl-v2:pillars');
      localStorage.removeItem('cl-v2:accounts');
    }

    return totalMigrated;
  } catch (error) {
    console.error('Migration error:', error);
    return 0;
  }
}

export function hasLocalStorageData(): boolean {
  const keys = [
    'cl-v2:posts',
    'cl-v2:goals',
    'cl-v2:ideas',
    'cl-v2:events',
    'cl-v2:competitors',
    'cl-v2:platforms',
    'cl-v2:pillars',
    'cl-v2:accounts',
  ];

  return keys.some(key => {
    const data = localStorage.getItem(key);
    if (!data) return false;
    try {
      const parsed = JSON.parse(data);
      const items = parsed.state?.posts || parsed.state?.goals || parsed.state?.ideas || 
                    parsed.state?.events || parsed.state?.competitors || parsed.state?.platforms ||
                    parsed.state?.pillars || parsed.state?.accounts || [];
      return items.length > 0;
    } catch {
      return false;
    }
  });
}
