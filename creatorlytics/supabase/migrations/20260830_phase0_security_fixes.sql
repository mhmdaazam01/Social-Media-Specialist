-- =============================================================================
-- Creatorlytics — Phase 0 Security Fixes
-- Jalankan SELURUH script ini sekaligus di Supabase SQL Editor.
-- Urutan sudah aman: buat RPC baru dulu, BARU drop policy lama.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. RPC: get_share_by_token
--    Pengganti policy "Public read by token" yang terlalu lebar.
--    Hanya return row yang token-nya cocok — tidak bisa di-enumerate.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS SETOF public.planner_shares
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.planner_shares
  WHERE share_token = p_token
    AND public_enabled = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_share_by_token(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. DROP policy lama yang bisa enumerate semua token
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read by token" ON public.planner_shares;

-- ---------------------------------------------------------------------------
-- 3. RPC: claim_workspace_share (versi aman — identitas dari session)
--    Tidak lagi menerima p_collaborator_email / p_collaborator_user_id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_workspace_share(p_share_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_share    record;
  v_existing record;
  v_uid      uuid := auth.uid();
  v_email    text := (SELECT email FROM auth.users WHERE id = auth.uid());
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_share
  FROM public.planner_shares
  WHERE share_token = p_share_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid share token';
  END IF;

  IF v_share.owner_id = v_uid THEN
    RAISE EXCEPTION 'You are the owner of this workspace';
  END IF;

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

  INSERT INTO public.planner_share_members (share_id, collaborator_email, collaborator_user_id)
  VALUES (v_share.id, v_email, v_uid)
  ON CONFLICT (share_id, collaborator_user_id) DO NOTHING;

  RETURN jsonb_build_object('status', 'success', 'source', 'invite_link');
END;
$function$;

GRANT EXECUTE ON FUNCTION public.claim_workspace_share(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. RPC: get_users_info (dengan authorization check)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_users_info(user_ids uuid[])
RETURNS TABLE(id uuid, email text, display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(NULLIF(p.display_name, ''), split_part(u.email, '@', 1)) AS display_name
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

GRANT EXECUTE ON FUNCTION public.get_users_info(uuid[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. RPC: get_public_share_owner
--    Hanya return display_name owner untuk share token yang valid.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_share_owner(p_token text)
RETURNS TABLE(display_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.display_name
  FROM public.profiles p
  JOIN public.planner_shares s ON s.owner_id = p.id
  WHERE s.share_token = p_token
    AND s.public_enabled = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_share_owner(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. DROP policy profiles_public_select (terlalu lebar — expose semua profil)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;

-- Ganti dengan policy scoped: hanya own profile + kolaborator aktif
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_select_own_and_collaborators'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "profiles_select_own_and_collaborators"
      ON public.profiles
      FOR SELECT
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

-- ---------------------------------------------------------------------------
-- 7. Hapus overload 3-parameter yang tidak aman
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.is_active_collaborator(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.is_editor_collaborator(uuid, uuid, text);

-- ---------------------------------------------------------------------------
-- 8. DROP policy "Collaborator claims own invite" (digantikan trigger aman)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Collaborator claims own invite" ON public.planner_collaborators;

-- ---------------------------------------------------------------------------
-- 9. Policy SELECT untuk tabel posts (fix bug share type=content)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'posts'
      AND policyname = 'posts_public_select'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "posts_public_select"
      ON public.posts
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.planner_shares s
          WHERE s.owner_id = posts.user_id
            AND s.public_enabled = true
            AND s.target_type = ANY(ARRAY['content', 'all'])
        )
      );
    $pol$;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'posts'
      AND policyname = 'posts_shared_select'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "posts_shared_select"
      ON public.posts
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.planner_shares s
          JOIN public.planner_share_members m ON m.share_id = s.id
          WHERE s.owner_id = posts.user_id
            AND m.collaborator_user_id = auth.uid()
            AND s.target_type = ANY(ARRAY['content', 'all'])
        )
        OR EXISTS (
          SELECT 1 FROM public.planner_collaborators pc
          WHERE pc.owner_id = posts.user_id
            AND pc.collaborator_user_id = auth.uid()
            AND pc.status = 'active'
        )
      );
    $pol$;
  END IF;
END;
$$;

-- =============================================================================
-- SELESAI. Verifikasi:
-- SELECT policyname, tablename FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- =============================================================================
