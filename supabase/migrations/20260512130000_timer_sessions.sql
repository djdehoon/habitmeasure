-- timer_sessions: one row per run of a template (interval / future types).
-- Status enum: running | paused | completed | cancelled
create table if not exists public.timer_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid not null references public.timer_templates (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  status text not null default 'running'
    check (status in ('running', 'paused', 'completed', 'cancelled'))
);

create index if not exists timer_sessions_user_id_idx on public.timer_sessions (user_id);
create index if not exists timer_sessions_template_id_idx on public.timer_sessions (template_id);

alter table public.timer_sessions enable row level security;

create policy "timer_sessions_select_own"
  on public.timer_sessions for select
  using (auth.uid() = user_id);

create policy "timer_sessions_insert_own"
  on public.timer_sessions for insert
  with check (auth.uid() = user_id);

create policy "timer_sessions_update_own"
  on public.timer_sessions for update
  using (auth.uid() = user_id);

comment on table public.timer_sessions is 'Per-run timer logs; status: running|paused|completed|cancelled.';
