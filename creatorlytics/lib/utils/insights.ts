import type { Post, Goal } from '@/types';
import { calcER } from './analytics';

export interface Insight {
  type: 'tip' | 'achievement' | 'warning' | 'trend';
  icon: string;
  title: string;
  description: string;
}

export function generateInsights(posts: Post[], goals: Goal[], erMode: 'impression' | 'reach' | 'followers'): Insight[] {
  const insights: Insight[] = [];
  if (posts.length === 0) {
    insights.push({
      type: 'tip',
      icon: 'Lightbulb',
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
      icon: 'TrendingUp',
      title: 'ER meningkat!',
      description: `Engagement rate 10 post terakhir (${recentER.toFixed(1)}%) lebih tinggi dari rata-rata (${totalER.toFixed(1)}%). Pertahankan!`,
    });
  } else if (recentER < totalER * 0.8) {
    insights.push({
      type: 'warning',
      icon: 'AlertTriangle',
      title: 'ER menurun',
      description: `Engagement rate 10 post terakhir (${recentER.toFixed(1)}%) lebih rendah dari rata-rata (${totalER.toFixed(1)}%). Coba variasi konten baru.`,
    });
  }

  const bestPost = [...posts].sort((a, b) => calcER(b, erMode) - calcER(a, erMode))[0];
  if (bestPost && bestPost.name) {
    insights.push({
      type: 'achievement',
      icon: 'Trophy',
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
      icon: 'BarChart3',
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
        icon: 'MessageSquare',
        title: 'Tingkatkan Komentar',
        description: 'Rasio komentar masih rendah. Coba tambahkan pertanyaan di caption untuk dorong diskusi.',
      });
    }
  }

  if (goals.length > 0) {
    const activeGoals = goals.filter(g => {
      const now = new Date();
      return g.year === now.getFullYear() && g.month >= now.getMonth() + 1;
    });
    if (activeGoals.length === 0) {
      insights.push({
        type: 'tip',
        icon: 'Target',
        title: 'Buat Goals Baru',
        description: 'Kamu tidak punya goals untuk bulan ini. Yuk atur target!',
      });
    }
  }

  return insights.slice(0, 5);
}
