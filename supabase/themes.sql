-- SQL to seed additional themes and setup dynamic theme system

-- 1. Ensure themes table exists
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  colors jsonb not null, -- Stores oklch values for background, foreground, primary, etc.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add active_theme_name to order_policies if not exists
alter table public.order_policies 
add column if not exists active_theme_name text not null default 'default',
add column if not exists show_ticker boolean not null default true,
add column if not exists section_styles jsonb not null default '{"homeHero":"video"}'::jsonb;

-- 3. Insert diverse themes
insert into public.themes (name, label, colors)
values 
('default', 'Minimalist White', '{"background": "oklch(0.985 0 0)", "foreground": "oklch(0.145 0 0)", "primary": "oklch(0.205 0 0)", "primary_foreground": "oklch(0.985 0 0)", "secondary": "oklch(0.97 0 0)", "accent": "oklch(0.97 0 0)", "muted": "oklch(0.97 0 0)", "border": "oklch(0.922 0 0)"}'),
('golden', 'Light Golden', '{"background": "oklch(0.98 0.01 70)", "foreground": "oklch(0.25 0.08 50)", "primary": "oklch(0.70 0.18 62)", "primary_foreground": "oklch(0.96 0.12 75)", "secondary": "oklch(0.85 0.12 70)", "accent": "oklch(0.75 0.18 62)", "muted": "oklch(0.88 0.08 70)", "border": "oklch(0.90 0.10 70)"}'),
('peachy', 'Peachy Delight', '{"background": "oklch(0.95 0.01 162)", "foreground": "oklch(0.35 0.03 0)", "primary": "oklch(0.816 0.086 9.042)", "primary_foreground": "oklch(0.98 0.01 0)", "secondary": "oklch(0.888 0.061 5.752)", "accent": "oklch(0.888 0.061 5.752)", "muted": "oklch(0.901 0.012 162.023)", "border": "oklch(0.85 0.02 0)"}'),
('midnight', 'Midnight Dark', '{"background": "oklch(0.15 0.02 240)", "foreground": "oklch(0.98 0.01 240)", "primary": "oklch(0.6 0.15 250)", "primary_foreground": "oklch(0.98 0.01 240)", "secondary": "oklch(0.25 0.05 240)", "accent": "oklch(0.7 0.1 200)", "muted": "oklch(0.2 0.03 240)", "border": "oklch(0.3 0.05 240)"}'),
('forest', 'Forest Nature', '{"background": "oklch(0.97 0.01 140)", "foreground": "oklch(0.2 0.05 140)", "primary": "oklch(0.4 0.1 140)", "primary_foreground": "oklch(0.98 0.01 140)", "secondary": "oklch(0.9 0.05 140)", "accent": "oklch(0.5 0.12 150)", "muted": "oklch(0.92 0.03 140)", "border": "oklch(0.85 0.05 140)"}'),
('lavender', 'Lavender Mist', '{"background": "oklch(0.96 0.02 290)", "foreground": "oklch(0.3 0.08 290)", "primary": "oklch(0.7 0.12 290)", "primary_foreground": "oklch(0.98 0.01 290)", "secondary": "oklch(0.92 0.05 290)", "accent": "oklch(0.75 0.15 300)", "muted": "oklch(0.94 0.03 290)", "border": "oklch(0.88 0.06 290)"}'),
('ocean', 'Ocean Deep', '{"background": "oklch(0.95 0.02 220)", "foreground": "oklch(0.2 0.08 220)", "primary": "oklch(0.5 0.15 220)", "primary_foreground": "oklch(0.98 0.01 220)", "secondary": "oklch(0.85 0.05 220)", "accent": "oklch(0.6 0.12 200)", "muted": "oklch(0.9 0.03 220)", "border": "oklch(0.8 0.06 220)"}'),
('crimson', 'Crimson Elegance', '{"background": "oklch(0.98 0.01 20)", "foreground": "oklch(0.2 0.05 20)", "primary": "oklch(0.5 0.18 25)", "primary_foreground": "oklch(0.98 0.01 20)", "secondary": "oklch(0.95 0.03 20)", "accent": "oklch(0.6 0.15 30)", "muted": "oklch(0.96 0.02 20)", "border": "oklch(0.9 0.05 20)"}')
on conflict (name) do update set colors = excluded.colors, label = excluded.label;

-- 4. Enable RLS and add public read access
alter table public.themes enable row level security;
drop policy if exists "Themes are publicly readable" on public.themes;
create policy "Themes are publicly readable" on public.themes for select using (is_active = true);
drop policy if exists "Themes are anon editable" on public.themes;
create policy "Themes are anon editable" on public.themes for all to anon using (true) with check (true);

-- 5. Ensure order_policies has public read access
alter table public.order_policies enable row level security;
drop policy if exists "Order policies are publicly readable" on public.order_policies;
create policy "Order policies are publicly readable" on public.order_policies for select using (true);
drop policy if exists "Order policies are anon editable" on public.order_policies;
create policy "Order policies are anon editable" on public.order_policies for all to anon using (true) with check (true);
