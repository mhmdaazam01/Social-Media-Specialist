-- ============================================================================
-- CREATORLYTICS SECURITY HARDENING MIGRATION SCRIPT
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. HARDENING PROFILES TABLE (Tutup User Directory / Email Dump)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_public_select ON public.profiles;

CREATE POLICY profiles_public_select ON public.profiles
FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.planner_shares
    WHERE planner_shares.owner_id = profiles.id
      AND planner_shares.public_enabled = true
  )
);

-- Column-level security: batasi field yang bisa dibaca role anon
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, display_name, avatar_url) ON public.profiles TO anon;


-- 2. HAPUS POLICY PRIVILEGE ESCALATION PADA PLANNER_COLLABORATORS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Collaborator claims own invite" ON public.planner_collaborators;


-- 3. HARDENING PLANNER_SHARES (Mencegah Harvesting Share Token)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read by token" ON public.planner_shares;

CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS SETOF public.planner_shares
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.planner_shares
  WHERE share_token = p_token
    AND (
      public_enabled = true
      OR owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.planner_collaborators pc
        WHERE pc.owner_id = planner_shares.owner_id 
          AND pc.collaborator_user_id = auth.uid() 
          AND pc.status = 'active'
      )
      OR EXISTS (
        SELECT 1 FROM public.planner_share_members psm
        WHERE psm.share_id = planner_shares.id 
          AND psm.collaborator_user_id = auth.uid()
      )
    );
$$;


-- 4. HARDENING RPC FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_workspace_share(p_share_token text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text := auth.jwt()->>'email';
  v_share public.planner_shares%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_share FROM public.planner_shares 
  WHERE share_token = p_share_token AND public_enabled = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or disabled share link';
  END IF;

  INSERT INTO public.planner_share_members (share_id, collaborator_user_id, collaborator_email)
  VALUES (v_share.id, v_user_id, v_user_email)
  ON CONFLICT (share_id, collaborator_user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'share_id', v_share.id, 'owner_id', v_share.owner_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_users_info(p_user_ids uuid[])
RETURNS TABLE(id uuid, email text, display_name text, avatar_url text)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.email, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(p_user_ids)
    AND (
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.planner_collaborators pc
        WHERE (pc.owner_id = auth.uid() AND pc.collaborator_user_id = p.id)
           OR (pc.owner_id = p.id AND pc.collaborator_user_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.planner_share_members psm
        JOIN public.planner_shares ps ON ps.id = psm.share_id
        WHERE (ps.owner_id = auth.uid() AND psm.collaborator_user_id = p.id)
           OR (ps.owner_id = p.id AND psm.collaborator_user_id = auth.uid())
      )
    );
$$;
