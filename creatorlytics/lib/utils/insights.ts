import type { Post, Goal } from '@/types';
import type { ErMode } from '@/types';
import { calcER } from './analytics';

export interface Insight {
  type: 'tip' | 'achievement' | 'warning' | 'trend';
  title: string;
  description: string;
}

/** Shared goal progress calculator — single source of truth */
export function calcGoalProgress(goal: Goal, posts: Post[]): number {
  const filtered = posts.filter(p => {
    if (!p.date) return false;
    const [py, pm] = p.date.split('-').map(Number);
    if (py !== goal.year || pm !== goal.month) return false;
    if (goal.platform !== 'all' && p.platform !== goal.platform) return false;
    return true;
  });

  switch (goal.metric) {
    case 'followers':
    case 'followers_gained':
      return filtered.reduce((s, p) => s + p.followers_gained, 0);
    case 'reach':
      return filtered.reduce((s, p) => s + p.reach, 0);
    case 'impression':
      return filtered.reduce((s, p) => s + p.impression, 0);
    case 'engagement':
    case 'interactions':
      return filtered.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
    case 'posts':
    case 'post':
      return filtered.length;
    case 'likes':
      return filtered.reduce((s, p) => s + p.like, 0);
    case 'comments':
      return filtered.reduce((s, p) => s + p.comment, 0);
    default:
      return 0;
  }
}

export function generateInsights(posts: Post[], goals: Goal[], erMode: ErMode): Insight[] {
  const insights: Insight[] = [];
  if (posts.length === 0) {
    insights.push({
      type: 'tip',
      title: 'Belum ada data',
      description: 'Mulai dengan menambahkan postingan pertama kamu!',
    });
    return insights;
  }

  const totalER = posts.reduce((s, p) => s + calcER(p, erMode), 0) / posts.length;
  const latestPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const recent = latestPosts.slice(0, Math.min(10, posts.length));
  const recentER = recent.reduce((s, p) => s + calcER(p, erMode), 0) / recent.length;

  if (recentER > totalER) {
    insights.push({
      type: 'trend',
      title: 'ER meningkat!',
      description: `Engagement rate 10 post terakhir (${recentER.toFixed(1)}%) lebih tinggi dari rata-rata (${totalER.toFixed(1)}%). Pertahankan!`,
    });
  } else if (recentER < totalER * 0.8) {
    insights.push({
      type: 'warning',
      title: 'ER menurun',
      description: `Engagement rate 10 post terakhir (${recentER.toFixed(1)}%) lebih rendah dari rata-rata (${totalER.toFixed(1)}%). Coba variasi konten baru.`,
    });
  }

  const bestPost = [...posts].sort((a, b) => calcER(b, erMode) - calcER(a, erMode))[0];
  if (bestPost && bestPost.name) {
    insights.push({
      type: 'achievement',
      title: 'Post Terbaik',
      description: `"${bestPost.name}" punya ER ${calcER(bestPost, erMode).toFixed(1)}% — analisa apa yang bikin performa bagus.`,
    });
  }

  const platformEngagement: Record<string, number[]> = {};
  for (const p of posts) {
    if (!platformEngagement[p.platform]) platformEngagement[p.platform] = [];
    platformEngagement[p.platform].push(calcER(p, erMode));
  }
  const bestPlatform = Object.entries(platformEngagement)
    .map(([platform, ers]) => ({ platform, avgER: ers.reduce((s, e) => s + e, 0) / ers.length }))
    .sort((a, b) => b.avgER - a.avgER)[0];
  if (bestPlatform) {
    insights.push({
      type: 'tip',
      title: 'Platform Terbaik',
      description: `Rata-rata ER tertinggi di ${bestPlatform.platform.toUpperCase()} (${bestPlatform.avgER.toFixed(1)}%). Fokus di sini!`,
    });
  }

  const totalInteractions = posts.reduce((s, p) => s + p.like + p.comment + p.save + p.share, 0);
  if (totalInteractions > 0) {
    const commentRatio = posts.reduce((s, p) => s + p.comment, 0) / totalInteractions;
    if (commentRatio < 0.05) {
      insights.push({
        type: 'tip',
        title: 'Tingkatkan Komentar',
        description: 'Rasio komentar masih rendah. Coba tambahkan pertanyaan di caption untuk dorong diskusi.',
      });
    }
  }

  if (goals.length > 0) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const activeGoals = goals.filter(g => g.year === currentYear && g.month === currentMonth);
    if (activeGoals.length === 0) {
      insights.push({
        type: 'tip',
        title: 'Buat Goals Baru',
        description: 'Kamu tidak punya goals untuk bulan ini. Yuk atur target!',
      });
    }
  }

  return insights.slice(0, 5);
}
