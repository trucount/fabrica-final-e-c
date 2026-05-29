-- Run this in the Supabase SQL editor to add editable Home, Shop, and Collections content.
-- It is safe to run more than once; existing rows are updated with these seed values.
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id, content, updated_at)
values
  (
    'home',
    '{
      "heroTitle": "Refined Simplicity",
      "heroSubtitle": "Discover timeless pieces crafted for the modern wardrobe",
      "collectionsTitle": "Collections",
      "newArrivalsTitle": "New Arrivals",
      "bestSellersTitle": "Best Sellers",
      "footerTagline": "Contemporary fashion for the discerning individual."
    }'::jsonb,
    now()
  ),
  (
    'shop',
    '{
      "title": "All Products"
    }'::jsonb,
    now()
  ),
  (
    'collections',
    '{
      "title": "Collections",
      "description": "Explore our curated collections, each telling a unique story of style, craftsmanship, and modern elegance.",
      "featuredTitle": "Crafted for Excellence",
      "featuredDescription": "Each collection is carefully curated to offer a distinct aesthetic while maintaining the exceptional quality and attention to detail that defines Thudarum. From boardroom to ballroom, we have the perfect piece for every occasion."
    }'::jsonb,
    now()
  )
on conflict (id) do update
set
  content = excluded.content,
  updated_at = excluded.updated_at;

alter table public.site_content enable row level security;
