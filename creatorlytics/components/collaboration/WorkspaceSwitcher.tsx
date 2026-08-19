'use client';

import { useUser } from '@/lib/hooks/useUser';
import { useCollaboration } from '@/lib/context/CollaborationContext';
import { usePathname } from 'next/navigation';
import { Check, ChevronsUpDown, Building2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Which app page maps to which targetType
const PAGE_TARGET_MAP: Record<string, string> = {
  '/planner': 'planner',
  '/calendar': 'calendar',
};

export function WorkspaceSwitcher() {
  const { user } = useUser();
  const { sharedWithMe, activeWorkspaceId, setActiveWorkspaceId, leaveWorkspace } = useCollaboration();
  const pathname = usePathname();

  // Detect which target page we're on
  const currentTarget = Object.entries(PAGE_TARGET_MAP).find(
    ([page]) => pathname === page || pathname.startsWith(page + '/')
  )?.[1];

  // Only show on /planner or /calendar
  if (!user || !currentTarget) return null;

  // Filter workspaces that are valid for the current page
  const validWorkspaces = sharedWithMe.filter(w => w.targetTypes.includes(currentTarget));

  // No shared workspaces for this page → hide
  if (validWorkspaces.length === 0) return null;

  const activeWorkspace = validWorkspaces.find(w => w.ownerId === activeWorkspaceId);
  const currentLabel = activeWorkspaceId === user.id || !activeWorkspace
    ? 'Workspace Saya'
    : activeWorkspace.ownerName;

  // If currently viewing a workspace not valid for this page, auto-switch to own
  if (activeWorkspaceId !== user.id && !activeWorkspace) {
    setActiveWorkspaceId(user.id);
  }

  return (
    <div className="px-3 pb-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg bg-cly-surface border border-cly-border hover:border-cly-brand/50 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cly-brand group">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center size-6 rounded-md bg-cly-brand/10 text-cly-brand">
              <Building2 size={12} />
            </div>
            <span className="text-xs font-semibold truncate text-cly-text group-hover:text-cly-brand transition-colors">
              {currentLabel}
            </span>
          </div>
          <ChevronsUpDown size={14} className="text-cly-text-3 flex-shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[230px]">
          {/* Own workspace option */}
          <DropdownMenuItem
            onClick={() => setActiveWorkspaceId(user.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium">Workspace Saya</span>
              <span className="text-[10px] text-cly-text-3 truncate">{user.email}</span>
            </div>
            {(activeWorkspaceId === user.id || !activeWorkspace) && (
              <Check size={14} className="text-cly-brand flex-shrink-0 ml-2" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Shared workspaces valid for this page */}
          {validWorkspaces.map(workspace => (
            <div key={workspace.ownerId}>
              <DropdownMenuItem
                onClick={() => setActiveWorkspaceId(workspace.ownerId)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-medium truncate">{workspace.ownerName}</span>
                  <span className="text-[10px] text-cly-text-3 truncate">{workspace.ownerEmail}</span>
                </div>
                {activeWorkspaceId === workspace.ownerId && (
                  <Check size={14} className="text-cly-brand flex-shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
              {/* Leave button — only for OTHER people's workspaces, never own */}
              {workspace.ownerId !== user.id && (
                <DropdownMenuItem
                  onClick={() => leaveWorkspace(workspace.ownerId)}
                  className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 ml-2 text-[11px]"
                >
                  <LogOut size={12} />
                  <span>Keluar dari workspace ini</span>
                </DropdownMenuItem>
              )}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
