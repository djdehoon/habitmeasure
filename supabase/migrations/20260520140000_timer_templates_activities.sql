-- Multi-activity interval templates (v1.8.0). Legacy work/rest/rounds columns remain for synthesis.
alter table public.timer_templates
  add column if not exists activities jsonb not null default '[]'::jsonb;

comment on column public.timer_templates.activities is 'Ordered interval activities: id, name, duration (sec), color, type (warmup|work|rest).';
