-- Run this in the Supabase SQL editor before using /collections or /admin collections.
create table if not exists public.collections (
  id text primary key,
  name text not null,
  description text not null,
  image_url text not null,
  item_count_label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.collections (id, name, description, image_url, item_count_label, sort_order, updated_at)
values
  (
    'executive',
    'Executive Collection',
    'Bold, sophisticated pieces for the modern power dresser. Featuring rich textures and commanding colors.',
    '/thudarum-burgundy-evening-suit.jpg',
    '12 items',
    10,
    now()
  ),
  (
    'heritage',
    'Heritage Collection',
    'Classic tailoring with timeless appeal. Traditional patterns reimagined for contemporary elegance.',
    '/thudarum-green-check-blazer.jpg',
    '8 items',
    20,
    now()
  ),
  (
    'contemporary',
    'Contemporary Collection',
    'Modern cuts and innovative styling for the forward-thinking gentleman.',
    '/thudarum-sky-blue-blazer.jpg',
    '10 items',
    30,
    now()
  ),
  (
    'evening',
    'Evening Collection',
    'Luxurious velvet and satin pieces designed to make a statement at formal occasions.',
    '/thudarum-navy-velvet-blazer.jpg',
    '6 items',
    40,
    now()
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  item_count_label = excluded.item_count_label,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into storage.buckets (id, name, public)
values ('pic', 'pic', true)
on conflict (id) do update
set public = excluded.public;

-- The app uses the Supabase anon key for REST access.
alter table public.collections enable row level security;
drop policy if exists "Collections are anon editable" on public.collections;
create policy "Collections are anon editable"
on public.collections
for all
to anon
using (true)
with check (true);
