-- =============================================================================
-- Creatorlytics — Consolidated Remediation Migration
-- Addresses: P0-2, P0-4, P1-4, P1-5 (Audit 30 Aug 2026)
--
-- SAFE TO RE-RUN: Uses IF EXISTS / OR REPLACE throughout.
-- Run this ENTIRE script at once in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Drop ALL legacy/conflicting function overloads first
--         This is required before recreating with different return types.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_users_info(uuid[]);
DROP FUNCTION IF EXISTS public.get_users_info(p_user_ids uuid[]);
DROP FUNCTION IF EXISTS public.claim_workspace_share(text);
DROP FUNCTION IF EXISTS public.claim_workspace_share(text, uuid, text);
DROP FUNCTION IF EXISTS public.claim_workspace_share(text, text, uuid);
DROP FUNCTION IF EXISTS public.claim_workspace_share(p_share_token text);
DROP FUNCTION IF EXISTS public.get_share_by_token(text);
DROP FUNCTION IF EXISTS public.get_share_by_token(p_token text);
DROP FUNCTION IF EXISTS public.get_public_share_owner(text);
DROP FUNCTION IF EXISTS public.get_public_share_owner(p_token text);
DROP FUNCTION IF EXISTS public.is_active_collaborator(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_active_collaborator(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.is_editor_collaborator(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_editor_collaborator(uuid, uuid, text);

-- ---------------------------------------------------------------------------
-- STEP 2: Rebuild get_share_by_token
--   - Returns ONLY enabled public shares matching the exact token
--   - search_path = '' (fully qualified) prevents search_path injection
--   - REVOKE from PUBLIC; GRANT only to intended roles
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS SETOF public.planner_shares
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT *
  FROM public.planner_shares
  WHERE share_token = p_token
    AND public_enabled = true;
$$;

REVOKE EXECUTE ON FUNCTION public.get_share_by_token(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_share_by_token(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- STEP 3: Rebuild claim_workspace_share
--   - Identity sourced exclusively from auth.uid() / auth.jwt()
--   - Requires public_enabled = true (disabled links not claimable)
--   - Prevents owner from claiming their own workspace
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_workspace_share(p_share_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_share    public.planner_shares%ROWTYPE;
  v_existing public.planner_collaborators%ROWTYPE;
  v_uid      uuid := auth.uid();
  v_email    text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get email from auth.users (server-side only)
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  -- Lookup share — must be enabled
  SELECT * INTO v_share
  FROM public.planner_shares
  WHERE share_token = p_share_token
    AND public_enabled = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or disabled share link';
  END IF;

  -- Prevent owner from claiming their own workspace
  IF v_share.owner_id = v_uid THEN
    RAISE EXCEPTION 'You are the owner of this workspace';
  END IF;

  -- Activate any pending direct invite matched by email
  SELECT * INTO v_existing
  FROM public.planner_collaborators
  WHERE owner_id = v_share.owner_id
    AND collaborator_email = v_email;

  IF FOUND THEN
    UPDATE public.planner_collaborators
    SET status = 'active',
        collaborator_user_id = v_uid
    WHERE id = v_existing.id;
  END IF;

  -- Record link membership (idempotent)
  INSERT INTO public.planner_share_members (share_id, collaborator_email, collaborator_user_id)
  VALUES (v_share.id, v_email, v_uid)
  ON CONFLICT (share_id, collaborator_user_id) DO NOTHING;

  RETURN jsonb_build_object('status', 'success', 'owner_id', v_share.owner_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.claim_workspace_share(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.claim_workspace_share(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- STEP 4: Rebuild get_users_info — 4-column signature (no drift)
--   - Only returns users who are active collaborators with the caller
--     or the caller themselves
--   - search_path = '' prevents schema injection
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_users_info(user_ids uuid[])
RETURNS TABLE(id uuid, email text, display_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(NULLIF(p.display_name, ''), split_part(u.email, '@', 1)) AS display_name,
    p.avatar_url
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = ANY(user_ids)
    AND (
      u.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.planner_collaborators pc
        WHERE pc.status = 'active'
          AND (
            (pc.owner_id = auth.uid() AND pc.collaborator_user_id = u.id)
            OR
            (pc.collaborator_user_id = auth.uid() AND pc.owner_id = u.id)
          )
      )
    );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_users_info(uuid[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_users_info(uuid[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- STEP 5: Rebuild get_public_share_owner
--   - Only returns display_name for enabled public share tokens
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_share_owner(p_token text)
RETURNS TABLE(display_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.display_name
  FROM public.profiles p
  JOIN public.planner_shares s ON s.owner_id = p.id
  WHERE s.share_token = p_token
    AND s.public_enabled = true;
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_share_owner(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_public_share_owner(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- STEP 6: Drop broad public table read policies that allow
--         unauthenticated enumeration of workspace data.
--         Token-scoped reads are handled by RPC functions above.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_public_select"              ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_and_collaborators" ON public.profiles;
DROP POLICY IF EXISTS "Public read by token"                ON public.planner_shares;
DROP POLICY IF EXISTS "posts_public_select"                 ON public.posts;
DROP POLICY IF EXISTS "posts_shared_select"                 ON public.posts;
DROP POLICY IF EXISTS "Collaborator claims own invite"      ON public.planner_collaborators;

-- Profiles: own row + active direct collaborators only (no anon access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_select_own_and_collaborators_v2'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "profiles_select_own_and_collaborators_v2"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.planner_collaborators pc
          WHERE pc.status = 'active'
            AND (
              (pc.owner_id = auth.uid() AND pc.collaborator_user_id = profiles.id)
              OR
              (pc.collaborator_user_id = auth.uid() AND pc.owner_id = profiles.id)
            )
        )
      );
    $pol$;
  END IF;
END;
$$;

-- Posts: owner or active direct collaborator only
-- (guest views use server route + RPC — not direct table SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'posts'
      AND policyname = 'posts_select_owner_or_collaborator'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "posts_select_owner_or_collaborator"
      ON public.posts
      FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.planner_collaborators pc
          WHERE pc.status = 'active'
            AND pc.owner_id = posts.user_id
            AND pc.collaborator_user_id = auth.uid()
        )
      );
    $pol$;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- STEP 7: Verify — run these queries after applying to confirm results
-- ---------------------------------------------------------------------------
-- SELECT p.oid::regprocedure, p.prosecdef, p.proconfig,
--        pg_get_function_result(p.oid) AS result_type
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'get_users_info','claim_workspace_share','get_share_by_token',
--     'get_public_share_owner','is_active_collaborator','is_editor_collaborator'
--   )
-- ORDER BY 1;
--
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- SELECT routine_name, grantee, privilege_type
-- FROM information_schema.routine_privileges
-- WHERE routine_schema = 'public'
-- ORDER BY routine_name, grantee;
-- =============================================================================
