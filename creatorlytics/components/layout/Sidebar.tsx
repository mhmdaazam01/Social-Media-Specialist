'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, Target, FileSpreadsheet,
  ClipboardList, Calendar, Users, Settings, LogOut,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useUser();
  const displayName = profile?.display_name || 'Kreator';

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen border-r border-cly-border bg-cly-rail fixed left-0 top-0 z-30">
      <div className="p-5 border-b border-cly-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cly-brand flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="font-bold text-lg text-cly-text">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer',
                isActive
                  ? 'bg-cly-brand-tint text-cly-brand border-l-2 border-cly-brand'
                  : 'text-cly-text-2 hover:bg-cly-muted hover:text-cly-text'
              )}
            >
              {iconMap[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-cly-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 px-3 py-3 rounded-lg bg-cly-muted hover:bg-cly-muted-2 transition-all duration-200 active:scale-[0.98] cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-cly-brand-tint text-cly-brand text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate text-cly-text">{displayName}</p>
              <p className="text-xs text-cly-text-3 truncate">{profile?.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
              <LogOut size={16} className="mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
