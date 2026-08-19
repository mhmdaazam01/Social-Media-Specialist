'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, FileText, Target, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardList, FileSpreadsheet, Settings, Users } from 'lucide-react';

const mainNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Konten', href: '/content', icon: FileText },
  { label: 'Goals', href: '/goals', icon: Target },
];

const moreNavItems = [
  { label: 'Report', href: '/report', icon: FileSpreadsheet },
  { label: 'Planner', href: '/planner', icon: ClipboardList },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  
  const isMoreActive = moreNavItems.some(item => pathname === item.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cly-border bg-cly-surface lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 safe-bottom">
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 active:scale-95',
                isActive 
                  ? 'text-cly-brand' 
                  : 'text-cly-text-3 active:text-cly-text-2'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                isActive ? 'bg-cly-brand/10' : ''
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="truncate px-1">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex-1 h-full flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 active:scale-95 outline-none border-none bg-transparent',
              isMoreActive 
                ? 'text-cly-brand' 
                : 'text-cly-text-3 active:text-cly-text-2'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              isMoreActive ? 'bg-cly-brand/10' : ''
            )}>
              <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 2} />
            </div>
            <span>Lainnya</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 mb-2 rounded-xl border border-cly-border bg-cly-surface"
            sideOffset={8}
          >
            {moreNavItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <DropdownMenuItem key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer w-full',
                      isActive 
                        ? 'text-cly-brand bg-cly-brand/10 font-semibold' 
                        : 'text-cly-text-2 hover:bg-cly-muted'
                    )}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

