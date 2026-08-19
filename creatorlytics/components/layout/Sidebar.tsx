'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, Target, FileSpreadsheet,
  ClipboardList, Calendar, Users, Settings, LogOut, Sparkles, Moon, Sun,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { useUser } from '@/lib/hooks/useUser';
import { useTheme } from '@/lib/context/ThemeContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WorkspaceSwitcher } from '@/components/collaboration/WorkspaceSwitcher';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  BarChart3: <BarChart3 size={20} />,
  FileText: <FileText size={20} />,
  Target: <Target size={20} />,
  FileSpreadsheet: <FileSpreadsheet size={20} />,
  ClipboardList: <ClipboardList size={20} />,
  Calendar: <Calendar size={20} />,
  Users: <Users size={20} />,
  Settings: <Settings size={20} />,
};

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const toggleTheme = () => {
    // Cycle through: light -> dark -> light
    if (resolvedTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <aside className={mobile
      ? "flex flex-col w-full h-full bg-cly-surface"
      : "hidden lg:flex lg:flex-col w-[280px] h-screen bg-cly-surface fixed left-0 top-0 z-30 border-r border-cly-border"
    }>
      
      {/* Logo & Brand */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cly-brand to-cly-brand-2 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-cly-text tracking-tight">{APP_NAME}</span>
        </Link>
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-cly-muted to-cly-surface border border-cly-border flex items-center justify-center text-cly-text-2 hover:text-cly-brand hover:shadow-md transition-all active:scale-95"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={18} strokeWidth={2.5} />
          ) : (
            <Moon size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      <WorkspaceSwitcher />

      <div className="h-px bg-gradient-to-r from-transparent via-cly-border to-transparent mx-4 my-2" />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 active:scale-[0.97]',
                isActive
                  ? 'bg-gradient-to-r from-cly-brand/10 to-cly-brand-tint text-cly-brand shadow-sm'
                  : 'text-cly-text-2 hover:bg-cly-muted hover:text-cly-text'
              )}
            >
              <span className={cn(
                "transition-transform",
                isActive && "scale-110"
              )}>
                {iconMap[item.icon]}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-cly-muted to-cly-surface border border-cly-border hover:shadow-md transition-all duration-200 active:scale-[0.98] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cly-brand">
            <Avatar className="h-10 w-10 ring-2 ring-cly-border shadow-sm">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-cly-brand to-cly-brand-2 text-white text-sm font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[15px] font-semibold truncate text-cly-text">{displayName}</p>
              <p className="text-xs text-cly-text-3 truncate">{profile?.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer rounded-lg">
              <LogOut size={16} className="mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer Links */}
      <div className="flex gap-4 px-4 py-3 text-[11px] text-cly-text-3 justify-center border-t border-cly-border bg-gradient-to-b from-transparent to-cly-muted/30">
        <Link href="/legal/privacy" className="hover:text-cly-brand transition-colors font-medium">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-cly-brand transition-colors font-medium">Terms</Link>
      </div>
    </aside>
  );
}
