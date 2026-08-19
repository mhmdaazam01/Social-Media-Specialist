'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import type {
  PlannerShare,
  PlannerCollaborator,
  CollabRole,
  CollabTargetType,
} from '@/types';

// ── Types ──────────────────────────────────────────────────────

/** One entry in the list of workspaces shared WITH the current user */
export interface SharedWorkspace {
  collaboratorRow: PlannerCollaborator;
  /** Display name of the owner of the workspace */
  ownerName: string;
  ownerEmail: string;
  ownerId: string;
  /** Which parts of the workspace are shared: 'planner' | 'calendar' | 'all' */
  targetTypes: string[];
}

interface CollaborationContextType {
  // Shares the current user has CREATED (as owner)
  myShares: PlannerShare[];
  mySharesLoading: boolean;
  upsertShare: (targetType: CollabTargetType, publicEnabled: boolean, defaultRole?: 'viewer' | 'editor') => Promise<PlannerShare | null>;
  deleteShare: (id: string) => Promise<void>;

  // Collaborators for the current user's workspaces (as owner)
  collaborators: PlannerCollaborator[];
  collaboratorsLoading: boolean;
  inviteCollaborator: (email: string, role: 'viewer' | 'editor') => Promise<PlannerCollaborator | null>;
  updateCollaboratorRole: (id: string, role: 'viewer' | 'editor') => Promise<void>;
  removeCollaborator: (id: string) => Promise<void>;

  // Workspaces shared WITH the current user (as collaborator)
  sharedWithMe: SharedWorkspace[];
  sharedWithMeLoading: boolean;
  leaveWorkspace: (ownerId: string) => Promise<void>;

  /**
   * The role of the current user in the context of a specific owner's workspace.
   * Returns 'owner' if ownerId === user.id.
   * Returns 'editor' | 'viewer' if user is an active collaborator.
   * Returns null if user has no access.
   */
  getRoleInWorkspace: (ownerId: string) => CollabRole | null;

  /** Convenience: share link URL for a given share token */
  getShareUrl: (token: string, type: CollabTargetType) => string;

  // Active Workspace State
  activeWorkspaceId: string | null;
  activeWorkspace: SharedWorkspace | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [myShares, setMyShares] = useState<PlannerShare[]>([]);
  const [mySharesLoading, setMySharesLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<PlannerCollaborator[]>([]);
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(true);
  const [sharedWithMe, setSharedWithMe] = useState<SharedWorkspace[]>([]);
  const [sharedWithMeLoading, setSharedWithMeLoading] = useState(true);

  // Active Workspace State
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);

  // When user logs in or changes, if no active workspace is set, set it to their own ID.
  useEffect(() => {
    if (user && !activeWorkspaceId) {
      setActiveWorkspaceIdState(user.id);
    }
  }, [user, activeWorkspaceId]);

  const setActiveWorkspaceId = useCallback((id: string | null) => {
    setActiveWorkspaceIdState(id);
  }, []);

  const activeWorkspace = useMemo(() => {
    if (!activeWorkspaceId || activeWorkspaceId === user?.id) return null;
    return sharedWithMe.find(w => w.ownerId === activeWorkspaceId) || null;
  }, [activeWorkspaceId, user?.id, sharedWithMe]);

  // ── Fetch helpers ─────────────────────────────────────────────

  const fetchMyShares = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('planner_shares')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setMyShares(data as PlannerShare[]);
    setMySharesLoading(false);
  }, [supabase, user]);

  const fetchCollaborators = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('planner_collaborators')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setCollaborators(data as PlannerCollaborator[]);
    setCollaboratorsLoading(false);
  }, [supabase, user]);

  const fetchSharedWithMe = useCallback(async () => {
    if (!user) return;
    
    // Auto-accept any pending invites for this user's email
    await supabase.rpc('auto_accept_invites');

    // SOURCE 1: Direct Access (planner_collaborators)
    const { data: directData } = await supabase
      .from('planner_collaborators')
      .select('*')
      .eq('collaborator_user_id', user.id)
      .eq('status', 'active');

    // SOURCE 2: Invite Link Membership (planner_share_members → planner_shares)
    const { data: linkData, error: linkErr } = await supabase
      .from('planner_share_members')
      .select('*, planner_shares!inner(id, owner_id, target_type, default_role, public_enabled)')
      .eq('collaborator_user_id', user.id);

    if (linkErr) {
      console.error('Error fetching linkData:', linkErr);
    }
    console.log('Direct Data:', directData);
    console.log('Link Data:', linkData);

    // Build a unified map of owner_id → { role, targetTypes, source }
    // Direct access takes priority over link access
    const ownerMap = new Map<string, { role: string; targetTypes: string[]; source: 'direct' | 'link'; collaboratorRow?: any }>();

    // Process direct access first
    (directData ?? []).forEach((c: any) => {
      ownerMap.set(c.owner_id, {
        role: c.role,
        targetTypes: [],
        source: 'direct',
        collaboratorRow: c,
      });
    });

    // Process link access (don't overwrite direct access)
    (linkData ?? []).forEach((lm: any) => {
      const share = lm.planner_shares;
      if (!share) return;
      const ownerId = share.owner_id;
      if (ownerId === user.id) return; // skip own workspace
      
      if (!ownerMap.has(ownerId)) {
        // Only link access exists → create a synthetic collaborator row for SharedWorkspace
        ownerMap.set(ownerId, {
          role: share.default_role,
          targetTypes: [],
          source: 'link',
          collaboratorRow: {
            id: lm.id,
            owner_id: ownerId,
            collaborator_email: lm.collaborator_email,
            collaborator_user_id: lm.collaborator_user_id,
            role: share.default_role,
            status: 'active',
            created_at: lm.created_at,
          },
        });
      }
    });

    const ownerIds = [...ownerMap.keys()];
    if (ownerIds.length === 0) {
      setSharedWithMe([]);
      setSharedWithMeLoading(false);
      return;
    }

    // Use RPC to get real email + display_name from auth.users
    type UserInfo = { id: string; email: string; display_name: string };
    const { data: usersInfoRaw } = await supabase
      .rpc('get_users_info', { user_ids: ownerIds });
    const usersInfo = (usersInfoRaw ?? []) as UserInfo[];
    const userInfoMap = new Map(usersInfo.map((u) => [u.id, u]));

    // Fetch planner_shares to know which target_types each owner shared
    const { data: shares } = await supabase
      .from('planner_shares')
      .select('owner_id, target_type')
      .in('owner_id', ownerIds)
      .eq('public_enabled', true);

    const shareMap = new Map<string, string[]>();
    (shares ?? []).forEach((s: { owner_id: string; target_type: string }) => {
      const existing = shareMap.get(s.owner_id) ?? [];
      if (!existing.includes(s.target_type)) existing.push(s.target_type);
      shareMap.set(s.owner_id, existing);
    });

    const workspaces: SharedWorkspace[] = ownerIds.map((ownerId) => {
      const entry = ownerMap.get(ownerId)!;
      const info = userInfoMap.get(ownerId);
      const rawTargets = shareMap.get(ownerId) ?? ['all'];
      const targetTypes = rawTargets.includes('all') ? ['planner', 'calendar'] : rawTargets;
      return {
        collaboratorRow: entry.collaboratorRow as PlannerCollaborator,
        ownerName: info?.display_name || 'Unknown',
        ownerEmail: info?.email ?? '',
        ownerId,
        targetTypes,
      };
    });

    setSharedWithMe(workspaces);
    setSharedWithMeLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setMyShares([]);
        setCollaborators([]);
        setSharedWithMe([]);
        setMySharesLoading(false);
        setCollaboratorsLoading(false);
        setSharedWithMeLoading(false);
      });
      return;
    }
    fetchMyShares();
    fetchCollaborators();
    fetchSharedWithMe();
  }, [user, fetchMyShares, fetchCollaborators, fetchSharedWithMe]);

  // ── Realtime ──────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return undefined;
    const channel = supabase
      .channel('collab-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planner_collaborators' }, () => {
        fetchCollaborators();
        fetchSharedWithMe();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planner_share_members' }, () => {
        fetchSharedWithMe();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planner_shares' }, () => {
        fetchMyShares();
        fetchSharedWithMe();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, user, fetchCollaborators, fetchMyShares, fetchSharedWithMe]);

  // ── Actions ───────────────────────────────────────────────────

  const upsertShare = useCallback(async (
    targetType: CollabTargetType,
    publicEnabled: boolean,
    defaultRole: 'viewer' | 'editor' = 'viewer',
  ): Promise<PlannerShare | null> => {
    const res = await fetch('/api/collab/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: targetType, default_role: defaultRole, public_enabled: publicEnabled }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('API Error:', json);
      throw new Error(json.error || 'Failed to upsert share');
    }
    const share = json.data as PlannerShare;
    setMyShares(prev => {
      const idx = prev.findIndex(s => s.id === share.id);
      return idx >= 0 ? prev.map(s => s.id === share.id ? share : s) : [...prev, share];
    });
    return share;
  }, []);

  const deleteShare = useCallback(async (id: string) => {
    await fetch(`/api/collab/shares?id=${id}`, { method: 'DELETE' });
    setMyShares(prev => prev.filter(s => s.id !== id));
  }, []);

  const inviteCollaborator = useCallback(async (email: string, role: 'viewer' | 'editor'): Promise<PlannerCollaborator | null> => {
    const res = await fetch('/api/collab/collaborators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    if (!res.ok) return null;
    const collab = json.data as PlannerCollaborator;
    setCollaborators(prev => {
      const idx = prev.findIndex(c => c.id === collab.id);
      return idx >= 0 ? prev.map(c => c.id === collab.id ? collab : c) : [...prev, collab];
    });
    return collab;
  }, []);

  const updateCollaboratorRole = useCallback(async (id: string, role: 'viewer' | 'editor') => {
    await fetch(`/api/collab/collaborators?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setCollaborators(prev => prev.map(c => c.id === id ? { ...c, role } : c));
  }, []);

  const removeCollaborator = useCallback(async (id: string) => {
    await fetch(`/api/collab/collaborators?id=${id}`, { method: 'DELETE' });
    setCollaborators(prev => prev.filter(c => c.id !== id));
  }, []);

  const leaveWorkspace = useCallback(async (ownerId: string) => {
    if (!user) return;
    const workspace = sharedWithMe.find(w => w.ownerId === ownerId);
    if (!workspace) return;
    const { error } = await supabase
      .from('planner_collaborators')
      .delete()
      .eq('id', workspace.collaboratorRow.id)
      .eq('collaborator_user_id', user.id);
    if (!error) {
      setSharedWithMe(prev => prev.filter(w => w.ownerId !== ownerId));
      // If currently viewing that workspace, switch back to own
      if (activeWorkspaceId === ownerId) {
        setActiveWorkspaceIdState(user.id);
      }
    }
  }, [supabase, user, sharedWithMe, activeWorkspaceId]);

  // ── Helpers ───────────────────────────────────────────────────

  const getRoleInWorkspace = useCallback((ownerId: string): CollabRole | null => {
    if (!user) return null;
    if (ownerId === user.id) return 'owner';
    const collab = sharedWithMe.find(w => w.ownerId === ownerId);
    if (!collab) return null;
    // The collaboratorRow.role is already resolved correctly:
    // - For direct access: the explicit role from planner_collaborators
    // - For link access: the share's default_role (set during fetchSharedWithMe)
    return collab.collaboratorRow.role as CollabRole;
  }, [user, sharedWithMe]);

  const getShareUrl = useCallback((token: string, type: CollabTargetType): string => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/share/${type}/${token}`;
  }, []);

  return (
    <CollaborationContext.Provider
      value={{
        myShares,
        mySharesLoading,
        upsertShare,
        deleteShare,
        collaborators,
        collaboratorsLoading,
        inviteCollaborator,
        updateCollaboratorRole,
        removeCollaborator,
        sharedWithMe,
        sharedWithMeLoading,
        leaveWorkspace,
        getRoleInWorkspace,
        getShareUrl,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const ctx = useContext(CollaborationContext);
  if (!ctx) throw new Error('useCollaboration must be used within CollaborationProvider');
  return ctx;
}
