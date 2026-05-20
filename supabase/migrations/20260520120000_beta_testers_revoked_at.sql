-- Ensure beta_testers has columns expected by lib/beta/verifyInvite.ts (prod may predate full migration).
ALTER TABLE public.beta_testers
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE public.beta_testers
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

ALTER TABLE public.beta_testers
  ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 1;

ALTER TABLE public.beta_testers
  ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;
