-- Beta invite codes (service role only at runtime; RLS blocks anon/authenticated).
-- user_profiles: create if missing, add is_beta_tester for invite-only /lab access.

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_name text,
  email text NOT NULL,
  is_beta_tester boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_beta_tester boolean NOT NULL DEFAULT false;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- beta_testers (issued invite links; ?code= matches invite_code)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  max_uses integer NOT NULL DEFAULT 1,
  use_count integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT beta_testers_invite_code_unique UNIQUE (invite_code),
  CONSTRAINT beta_testers_max_uses_positive CHECK (max_uses >= 1),
  CONSTRAINT beta_testers_use_count_nonnegative CHECK (use_count >= 0)
);

ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;
-- No policies: JWT roles cannot read/write; service_role bypasses RLS.

-- ---------------------------------------------------------------------------
-- Ops: backfill existing internal testers (run manually in SQL editor):
--   UPDATE public.user_profiles SET is_beta_tester = true WHERE email IN (...);
-- Seed an invite (replace CODE):
--   INSERT INTO public.beta_testers (invite_code, max_uses, note)
--   VALUES ('YOURCODEHERE', 1, 'First beta wave');
-- ---------------------------------------------------------------------------
