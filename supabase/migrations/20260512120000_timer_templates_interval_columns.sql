-- Interval timer columns (v1.6.3). Nullable for existing countdown rows.
alter table public.timer_templates
  add column if not exists work_seconds integer,
  add column if not exists rest_seconds integer,
  add column if not exists rounds integer;

comment on column public.timer_templates.work_seconds is 'Work interval length in seconds (interval timers only).';
comment on column public.timer_templates.rest_seconds is 'Rest interval length in seconds (interval timers only).';
comment on column public.timer_templates.rounds is 'Number of work periods (interval timers only).';
