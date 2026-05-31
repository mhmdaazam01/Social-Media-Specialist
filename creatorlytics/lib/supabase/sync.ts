import { createClient } from './client';

console.log('[sync] module loaded');

export function createSync<T extends { id: string }>(table: string) {
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

        console.log(`[sync:${table}] auth.uid =`, userId);
        console.log(`[sync:${table}] rows[0] raw =`, JSON.stringify(rows[0]));
        console.log(`[sync:${table}] upserting ${rows.length} rows...`);

        const rowsWithUser = rows.map(r => ({ ...r, user_id: userId }));
        const { error, count } = await supabase
          .from(table)
          .upsert(rowsWithUser, { onConflict: 'id', count: 'exact' });

        if (error) {
          console.error(`[sync:${table}] ❌ Upsert error:`, JSON.stringify(error, null, 2));
          return;
        }

        if (count === 0) {
          console.warn(`[sync:${table}] ⚠️ Upsert count=0 — possible RLS rejection or no matching rows`);
        } else {
          console.log(`[sync:${table}] ✅ ${count} rows upserted`);
        }
      } catch (e) {
        console.error(`[sync:${table}] upsert catch:`, e);
      }
    },

    async remove(ids: string[]) {
      if (!ids.length) return;
      try {
        const userId = await uidOrThrow();
        const supabase = createClient()!;
        const { error, count } = await supabase
          .from(table)
          .delete({ count: 'exact' })
          .in('id', ids)
          .eq('user_id', userId);

        if (error) {
          console.error(`[sync:${table}] ❌ Delete error:`, error);
        } else if (count === 0) {
          console.warn(`[sync:${table}] ⚠️ Delete count=0 — row not found or RLS rejected`);
        } else {
          console.log(`[sync:${table}] ✅ Deleted ${count} rows`);
        }
      } catch (e) {
        console.error(`[sync:${table}] remove catch:`, e);
      }
    },

    async loadAll(): Promise<T[]> {
      try {
        const userId = await uidOrThrow();
        const supabase = createClient()!;
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`[sync:${table}] ❌ Load error:`, error);
          return [];
        }

        console.log(`[sync:${table}] ✅ Loaded ${data?.length ?? 0} rows`);
        return (data ?? []) as T[];
      } catch {
        return [];
      }
    },
  };
}
