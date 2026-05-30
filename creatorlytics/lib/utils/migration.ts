import { createClient } from '@/lib/supabase/client';

export async function migrateFromV1(userId: string): Promise<{
  success: boolean;
  postCount: number;
  error?: string;
}> {
  const supabase = createClient();
  if (!supabase) return { success: false, postCount: 0, error: 'Supabase not available' };

  try {
    const alreadyMigrated = localStorage.getItem('cl-v1-migrated');
    if (alreadyMigrated) return { success: true, postCount: 0 };

    const raw = localStorage.getItem('smanalytics:v7');
    if (!raw) return { success: true, postCount: 0 };

    const v1Data = JSON.parse(raw);
    if (!v1Data.months?.length) return { success: true, postCount: 0 };

    const posts: Array<{
      user_id: string;
      account: string;
      platform: string;
      date: string;
      name: string;
      reach: number;
      impression: number;
      like: number;
      comment: number;
      share: number;
      save: number;
      repost: number;
      followers_gained: number;
      profile_visit: number;
      pillar: string;
      format: string;
      caption_len: number;
      link: string;
    }> = [];

    for (const month of v1Data.months) {
      for (const week of month.weeks || []) {
        for (const account of v1Data.accounts || []) {
          const accData = week.data?.[account];
          if (!accData) continue;

          const platformMap = [
            { key: 'ttPosts', id: 'tt' },
            { key: 'igPosts', id: 'ig' },
            { key: 'ytPosts', id: 'yt' },
            { key: 'fbPosts', id: 'fb' },
            { key: 'twPosts', id: 'tw' },
            { key: 'lnPosts', id: 'ln' },
          ];

          for (const { key, id: platformId } of platformMap) {
            for (const p of accData[key] || []) {
              posts.push({
                user_id: userId,
                account,
                platform: platformId,
                date: p.date || '',
                name: p.name || p.caption || '',
                reach: p.reach || 0,
                impression: p.impression || 0,
                like: p.like || 0,
                comment: p.comment || 0,
                share: p.share || 0,
                save: p.save || 0,
                repost: p.repost || 0,
                followers_gained: p.followersGained || 0,
                profile_visit: 0,
                pillar: p.pillar || 'other',
                format: p.format || '',
                caption_len: p.captionLen || 0,
                link: p.link || '',
              });
            }
          }
        }
      }
    }

    if (!posts.length) return { success: true, postCount: 0 };

    const batchSize = 500;
    for (let i = 0; i < posts.length; i += batchSize) {
      const { error } = await supabase
        .from('posts')
        .insert(posts.slice(i, i + batchSize));
      if (error) throw error;
    }

    localStorage.setItem('cl-v1-migrated', 'true');
    return { success: true, postCount: posts.length };

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, postCount: 0, error: message };
  }
}
