'use client';

import { useState } from 'react';
import { Plus, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { useTheme } from '@/lib/context/ThemeContext';

interface TopbarProps {
  title: string;
  onAddPost?: () => void;
}

export function Topbar({ title, onAddPost }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-cly-border bg-cly-surface/95 backdrop-blur supports-[backdrop-filter]:bg-cly-surface/60 lg:hidden">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="flex items-center justify-center size-9 rounded-lg hover:bg-cly-muted active:scale-95 transition-all text-cly-text-2 border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-cly-brand focus-visible:ring-offset-2">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] max-w-[280px] bg-cly-surface border-cly-border overflow-y-auto">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar mobile={true} onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="font-bold text-base truncate text-cly-text tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center size-9 rounded-lg hover:bg-cly-muted active:scale-95 transition-all text-cly-text-2"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={18} strokeWidth={2.5} />
          ) : (
            <Moon size={18} strokeWidth={2.5} />
          )}
        </button>

        {onAddPost && (
          <Button size="sm" onClick={onAddPost} className="bg-cly-brand hover:bg-cly-brand-2 text-white h-9 px-3 text-xs font-bold">
            <Plus size={16} className="mr-1" />
            Post
          </Button>
        )}
      </div>
    </header>
  );
}
