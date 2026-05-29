'use client';

import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface TopbarProps {
  title: string;
  onAddPost?: () => void;
}

export function Topbar({ title, onAddPost }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent cursor-pointer">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="font-semibold text-base truncate">{title}</h1>
      </div>

      {onAddPost && (
        <Button size="sm" onClick={onAddPost}>
          <Plus size={16} className="mr-1" />
          Post
        </Button>
      )}
    </header>
  );
}
