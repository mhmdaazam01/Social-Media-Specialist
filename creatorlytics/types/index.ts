export type Theme = 'dark' | 'light';
export type ErMode = 'impression' | 'reach' | 'followers';
export type PostStatus = 'idea' | 'brief' | 'draft' | 'ready';
export type Priority = 'low' | 'med' | 'high';
export type EventStatus = 'idea' | 'scheduled' | 'published' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  niche: string;
  er_mode: ErMode;
  theme: Theme;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export interface Account {
  id: string;
  name: string;
  created_at: string;
}

export interface Platform {
  id: string;
  platform_id: string;
  name: string;
  emoji: string;
}

export interface Post {
  id: string;
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
  created_at: string;
}

export interface Goal {
  id: string;
  label: string;
  emoji: string;
  target: number;
  platform: string;
  metric: string;
  month: number;
  year: number;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  desc: string;
  platform: string;
  pillar: string;
  format: string;
  status: PostStatus;
  priority: Priority;
  tags: string[];
  brief: Record<string, unknown>;
  ref_links: string[];
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  platform: string;
  account: string;
  pillar: string;
  format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: EventStatus;
  idea_id: string | null;
  notes: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  name: string;
  platform: string;
  followers: number;
  avg_reach: number;
  avg_er: number;
  post_freq: number;
  notes: string;
  updated_at: string;
  created_at: string;
}

export interface Pillar {
  id: string;
  pillar_id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

export interface Settings {
  display_name: string;
  niche: string;
  er_mode: ErMode;
  theme: Theme;
}
