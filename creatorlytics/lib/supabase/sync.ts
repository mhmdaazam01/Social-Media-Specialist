import { createClient } from './client';

export function createSync<T>(table: string) {
  let supabase = createClient();

  async function ensureAuth() {
    if (!supabase) {
      supabase = createClient();
    }
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  }

  return {
    async upsert(rows: T[]) {
      if (!rows.length) return;
      const user = await ensureAuth();
      if (!user) return;
      const rowsWithUser = rows.map(r => ({ ...r, user_id: user.id }));
      const { error } = await supabase!.from(table).upsert(rowsWithUser, { onConflict: 'id' });
      if (error) console.error(`sync:${table} upsert`, error);
    },

    async remove(ids: string[]) {
      if (!ids.length) return;
      const user = await ensureAuth();
      if (!user) return;
      const { error } = await supabase!.from(table).delete().in('id', ids);
      if (error) console.error(`sync:${table} delete`, error);
    },

    async loadAll(): Promise<T[]> {
      const user = await ensureAuth();
      if (!user) return [];
      const { data, error } = await supabase!.from(table).select('*');
      if (error) {
        console.error(`sync:${table} load`, error);
        return [];
      }
      return (data ?? []) as T[];
    },
  };
}
