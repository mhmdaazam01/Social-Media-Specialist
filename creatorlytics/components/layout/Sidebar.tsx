'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, Target, FileSpreadsheet,
  ClipboardList, Calendar, Users, Settings, Sun, Moon, LogOut,
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
    <aside className="hidden lg:flex lg:flex-col w-64 h-screen border-r bg-card fixed left-0 top-0 z-30">
      <div className="p-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            C
          </div>
          <span className="font-bold text-lg">{APP_NAME}</span>
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
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
              )}
            >
              {iconMap[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 px-3 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-[0.98] cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
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
