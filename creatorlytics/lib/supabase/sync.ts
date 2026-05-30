import { createClient } from './client';

export function createSync<T>(table: string) {
  const getSupabase = () => createClient();

  async function getUserId() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  }

  async function uidOrThrow() {
    const id = await getUserId();
    if (!id) throw new Error('Not authenticated');
    return id;
  }

  return {
    async upsert(rows: T[]) {
      if (!rows.length) return;
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        const userId = await uidOrThrow();
        const rowsWithUser = rows.map(r => ({ ...r, user_id: userId }));
        const { error } = await supabase.from(table).upsert(rowsWithUser, { onConflict: 'id' });
        if (error) console.error(`sync:${table} upsert`, error);
      } catch (e) {
        console.error(`sync:${table} upsert`, e);
      }
    },

    async remove(ids: string[]) {
      if (!ids.length) return;
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        await uidOrThrow();
        const { error } = await supabase.from(table).delete().in('id', ids);
        if (error) console.error(`sync:${table} delete`, error);
      } catch (e) {
        console.error(`sync:${table} remove`, e);
      }
    },

    async loadAll(): Promise<T[]> {
      const supabase = getSupabase();
      if (!supabase) return [];
      try {
        await uidOrThrow();
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.error(`sync:${table} load`, error);
          return [];
        }
        return (data ?? []) as T[];
      } catch {
        return [];
      }
    },
  };
}
