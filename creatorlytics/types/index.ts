export type Theme = 'light' | 'dark' | 'auto';
export type ErMode = 'impression' | 'reach' | 'followers';
export type PostStatus = 'idea' | 'brief';
export type Priority = 'low' | 'med' | 'high';
export type EventStatus = 'idea' | 'scheduled' | 'published' | 'cancelled';

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
  thumbnail?: string; // URL to thumbnail image
  created_at: string;
}

export interface Goal {
  id: string;
  label: string;
  emoji: string;
  target: number;
  platform: string;
  account?: string; // account name or 'all' for all accounts
  metric: string;
  month: number;
  year: number;
  created_at: string;
}

export interface ContentBrief {
  deadline: string;
  narasi: string;
  target_usia: string;
  target_minat: string;
  target_painpoint: string;
  tone: string;
  format_video: string;
  durasi: string;
  ref_visual: string;
  accounts?: string[];
  platforms?: string[];
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  platform: string;
  pillar: string;
  format: string;
  status: PostStatus;
  priority: Priority;
  tags: string[];
  brief: ContentBrief | Record<string, unknown>;
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
  theme: 'light' | 'dark' | 'auto';
  language: 'id' | 'en';
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  number_format: '1,000' | '1.000';
  notif_goal: boolean;
  notif_reminder: boolean;
  notif_report: boolean;
  notif_collab: boolean;
  notif_digest: boolean;
}

// ── Collaboration ─────────────────────────────────────────────
export type CollabRole = 'owner' | 'editor' | 'viewer';
export type CollabStatus = 'pending' | 'active';
export type CollabTargetType = 'planner' | 'calendar' | 'all';

export interface PlannerShare {
  id: string;
  owner_id: string;
  share_token: string;
  target_type: CollabTargetType;
  default_role: 'viewer' | 'editor';
  public_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannerCollaborator {
  id: string;
  owner_id: string;
  collaborator_email: string;
  collaborator_user_id: string | null;
  role: 'viewer' | 'editor';
  status: CollabStatus;
  created_at: string;
}


/** Context value describing the current user's role in a workspace */
export interface WorkspaceAccess {
  /** UUID of the owner of this workspace */
  ownerId: string;
  /** Display name of the owner (from profiles table) */
  ownerName: string;
  /** Current user's role */
  role: CollabRole;
}
