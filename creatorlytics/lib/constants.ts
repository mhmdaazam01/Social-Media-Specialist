export const APP_NAME = 'Creatorlytics';
export const APP_TAGLINE = 'Analytics dashboard untuk kreator Indonesia';
export const STORAGE_PREFIX = 'cl-v2';

export const DEFAULT_PLATFORMS = [
  { platform_id: 'ig', name: 'Instagram', emoji: '' },
  { platform_id: 'tt', name: 'TikTok', emoji: '' },
  { platform_id: 'yt', name: 'YouTube', emoji: '' },
  { platform_id: 'fb', name: 'Facebook', emoji: '' },
  { platform_id: 'tw', name: 'Twitter', emoji: '' },
  { platform_id: 'ln', name: 'LinkedIn', emoji: '' },
];

export const DEFAULT_PILLARS = [
  { pillar_id: 'educational', label: 'Edukasi', emoji: '', color: '#3B82F6', bg: '#EFF6FF' },
  { pillar_id: 'entertainment', label: 'Hiburan', emoji: '', color: '#F59E0B', bg: '#FFFBEB' },
  { pillar_id: 'promotion', label: 'Promosi', emoji: '', color: '#EF4444', bg: '#FEF2F2' },
  { pillar_id: 'storytelling', label: 'Storytelling', emoji: '', color: '#8B5CF6', bg: '#F5F3FF' },
  { pillar_id: 'behind_scenes', label: 'Behind the Scenes', emoji: '', color: '#EC4899', bg: '#FDF2F8' },
  { pillar_id: 'other', label: 'Lainnya', emoji: '', color: '#6B7280', bg: '#F9FAFB' },
];

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Konten', href: '/content', icon: 'FileText' },
  { label: 'Goals', href: '/goals', icon: 'Target' },
  { label: 'Report', href: '/report', icon: 'FileSpreadsheet' },
  { label: 'Planner', href: '/planner', icon: 'ClipboardList' },
  { label: 'Kalender', href: '/calendar', icon: 'Calendar' },
  { label: 'Kompetitor', href: '/competitor', icon: 'Users' },
  { label: 'Pengaturan', href: '/settings', icon: 'Settings' },
];
