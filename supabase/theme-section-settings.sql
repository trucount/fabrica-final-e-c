-- Theme section settings: run in Supabase SQL editor.
-- Safe to rerun. Adds settings used by Admin > Theme.

alter table public.order_policies
  add column if not exists active_theme_name text not null default 'default',
  add column if not exists show_ticker boolean not null default true,
  add column if not exists section_styles jsonb not null default '{"homeHero":"video"}'::jsonb;

insert into public.order_policies (id, updated_at)
values (true, now())
on conflict (id) do nothing;

update public.order_policies
set
  active_theme_name = coalesce(active_theme_name, 'default'),
  show_ticker = coalesce(show_ticker, true),
  section_styles = coalesce(section_styles, '{"homeHero":"video"}'::jsonb),
  updated_at = now()
where id = true;

insert into public.site_content (id, content, updated_at)
values (
  'home',
  '{
    "heroImageUrls": ["/thudarum-taupe-suit-hero.jpg", "/thudarum-burgundy-evening-suit.jpg", "/thudarum-sky-blue-blazer.jpg", "/thudarum-navy-velvet-blazer.jpg"],
    "heroImageUrlsDesktop": ["/thudarum-taupe-suit-hero.jpg", "/thudarum-burgundy-evening-suit.jpg", "/thudarum-sky-blue-blazer.jpg", "/thudarum-navy-velvet-blazer.jpg"],
    "heroImageUrlsMobile": ["/thudarum-taupe-suit-detail.jpg", "/thudarum-burgundy-suit-detail.jpg", "/thudarum-sky-blue-detail.jpg", "/thudarum-navy-velvet-detail.jpg"]
  }'::jsonb,
  now()
)
on conflict (id) do update
set content = public.site_content.content || excluded.content,
    updated_at = excluded.updated_at;

-- Optional: uncomment to immediately switch the / page hero to IMAGE carousel style.
-- update public.order_policies
-- set section_styles = jsonb_set(section_styles, '{homeHero}', '"image"'::jsonb, true), updated_at = now()
-- where id = true;
