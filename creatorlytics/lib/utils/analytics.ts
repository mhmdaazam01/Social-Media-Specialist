import type { Post } from '@/types';
import type { ErMode } from '@/types';

export function isPostInMonth(post: Post, year: number, month: number): boolean {
  if (!post.date) return false;
  // Format is typically "YYYY-MM-DD"
  const py = parseInt(post.date.substring(0, 4), 10);
  const pm = parseInt(post.date.substring(5, 7), 10);
  return py === year && pm === month;
}

export function calcER(post: Post, mode: ErMode): number {
  const interactions = (post.like || 0) + (post.comment || 0) + (post.save || 0) + (post.share || 0);
  if (mode === 'reach') return post.reach > 0 ? (interactions / post.reach) * 100 : 0;
  return post.impression > 0 ? (interactions / post.impression) * 100 : 0;
}

export function calcTotalER(posts: Post[], mode: ErMode): number {
  const totalInteractions = posts.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0);
  const totalBase = mode === 'reach'
    ? posts.reduce((s, p) => s + (p.reach || 0), 0)
    : posts.reduce((s, p) => s + (p.impression || 0), 0);
  return totalBase > 0 ? (totalInteractions / totalBase) * 100 : 0;
}


export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`;
  return n.toLocaleString('id-ID');
}

export function fmtPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function aggregateByPlatform(posts: Post[], erMode: ErMode = 'impression') {
  const grouped: Record<string, Post[]> = {};
  for (const p of posts) {
    if (!grouped[p.platform]) grouped[p.platform] = [];
    grouped[p.platform].push(p);
  }
  return Object.entries(grouped).map(([platform, items]) => ({
    platform,
    count: items.length,
    totalReach: items.reduce((s, p) => s + (p.reach || 0), 0),
    totalImpression: items.reduce((s, p) => s + (p.impression || 0), 0),
    totalEngagement: items.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0),
    totalInteractions: items.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0),
    avgER: items.length > 0 ? calcTotalER(items, erMode) : 0,
  }));
}

export function aggregateByPillar(posts: Post[], erMode: ErMode = 'impression') {
  const grouped: Record<string, Post[]> = {};
  for (const p of posts) {
    if (!grouped[p.pillar]) grouped[p.pillar] = [];
    grouped[p.pillar].push(p);
  }
  return Object.entries(grouped).map(([pillar, items]) => ({
    pillar,
    count: items.length,
    totalReach: items.reduce((s, p) => s + (p.reach || 0), 0),
    avgER: items.length > 0 ? calcTotalER(items, erMode) : 0,
  }));
}

export function aggregateByMonth(posts: Post[], erMode: ErMode = 'impression') {
  const grouped: Record<string, Post[]> = {};
  for (const p of posts) {
    const month = p.date ? p.date.substring(0, 7) : 'unknown';
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(p);
  }
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, items]) => ({
    month,
    count: items.length,
    totalReach: items.reduce((s, p) => s + (p.reach || 0), 0),
    totalImpression: items.reduce((s, p) => s + (p.impression || 0), 0),
    totalInteractions: items.reduce((s, p) => s + (p.like || 0) + (p.comment || 0) + (p.save || 0) + (p.share || 0), 0),
    avgER: items.length > 0 ? calcTotalER(items, erMode) : 0,
    followersGained: items.reduce((s, p) => s + (p.followers_gained || 0), 0),
  }));
}
