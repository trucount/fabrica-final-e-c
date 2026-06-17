-- Theme section settings: run in Supabase SQL editor.
-- Safe to rerun. Adds settings used by Admin > Theme.

alter table public.order_policies
  add column if not exists active_theme_name text not null default 'default',
  add column if not exists show_ticker boolean not null default true,
  add column if not exists section_styles jsonb not null default '{"homeHero":"video"}'::jsonb;

update public.order_policies
set
  show_ticker = coalesce(show_ticker, true),
  section_styles = coalesce(section_styles, '{"homeHero":"video"}'::jsonb),
  updated_at = now()
where id = true;

update public.site_content
set content = jsonb_set(
    content,
    '{heroImageUrls}',
    '["/thudarum-taupe-suit-hero.jpg","/thudarum-burgundy-evening-suit.jpg","/thudarum-sky-blue-blazer.jpg","/thudarum-navy-velvet-blazer.jpg"]'::jsonb,
    true
  ),
  updated_at = now()
where id = 'home';

-- Optional: uncomment to immediately switch the / page hero to IMAGE carousel style.
-- update public.order_policies
-- set section_styles = jsonb_set(section_styles, '{homeHero}', '"image"'::jsonb, true), updated_at = now()
-- where id = true;
