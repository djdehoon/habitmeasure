-- Lab overview grouping and order (v1.9.0).
alter table public.timer_templates
  add column if not exists group_name text not null default 'General',
  add column if not exists sort_order integer not null default 0;

create index if not exists timer_templates_user_group_sort_idx
  on public.timer_templates (user_id, group_name, sort_order);

comment on column public.timer_templates.group_name is 'Overview section label; default General.';
comment on column public.timer_templates.sort_order is 'Order within group_name (ascending).';
