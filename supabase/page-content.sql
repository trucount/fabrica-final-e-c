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
      "collections": [
        {
          "id": "executive",
          "name": "Executive Collection",
          "description": "Bold, sophisticated pieces for the modern power dresser. Featuring rich textures and commanding colors.",
          "image": "/thudarum-burgundy-evening-suit.jpg",
          "items": "12 items"
        },
        {
          "id": "heritage",
          "name": "Heritage Collection",
          "description": "Classic tailoring with timeless appeal. Traditional patterns reimagined for contemporary elegance.",
          "image": "/thudarum-green-check-blazer.jpg",
          "items": "8 items"
        },
        {
          "id": "contemporary",
          "name": "Contemporary Collection",
          "description": "Modern cuts and innovative styling for the forward-thinking gentleman.",
          "image": "/thudarum-sky-blue-blazer.jpg",
          "items": "10 items"
        },
        {
          "id": "evening",
          "name": "Evening Collection",
          "description": "Luxurious velvet and satin pieces designed to make a statement at formal occasions.",
          "image": "/thudarum-navy-velvet-blazer.jpg",
          "items": "6 items"
        }
      ],
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
