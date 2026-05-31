import { createClient } from './client';

export function createSync<T>(table: string) {
  async function getUserId() {
    const supabase = createClient();
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
      try {
        const userId = await uidOrThrow();
        const supabase = createClient()!;
        const rowsWithUser = rows.map(r => ({ ...r, user_id: userId }));
        const { error } = await supabase.from(table).upsert(rowsWithUser, { onConflict: 'id' });
        if (error) console.error(`sync:${table} upsert`, error);
      } catch (e) {
        console.error(`sync:${table} upsert`, e);
      }
    },

    async remove(ids: string[]) {
      if (!ids.length) return;
      try {
        await uidOrThrow();
        const supabase = createClient()!;
        const { error } = await supabase.from(table).delete().in('id', ids);
        if (error) console.error(`sync:${table} delete`, error);
      } catch (e) {
        console.error(`sync:${table} remove`, e);
      }
    },

    async loadAll(): Promise<T[]> {
      try {
        await uidOrThrow();
        const supabase = createClient()!;
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
