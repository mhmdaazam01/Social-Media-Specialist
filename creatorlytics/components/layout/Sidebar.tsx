'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, Target, FileSpreadsheet,
  ClipboardList, Calendar, Users, Settings, Sun, Moon,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { useSettingsStore } from '@/lib/store/settings-store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { settings, updateSettings } = useSettingsStore();
  const displayName = settings.display_name || 'Kreator';

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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {iconMap[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent cursor-pointer">
              {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateSettings({ theme: 'light' })}>
                <Sun size={16} className="mr-2" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSettings({ theme: 'dark' })}>
                <Moon size={16} className="mr-2" /> Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
