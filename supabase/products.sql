-- Products table for Shop, Product detail pages, and Home product sections.
-- Run this in Supabase SQL editor after supabase/collections.sql.

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  main_image_url text not null,
  gallery_image_urls text[] not null default '{}',
  category_label text,
  description text not null,
  details text[] not null default '{}',
  sizes text[] not null default '{}',
  section text not null default 'general' check (section in ('general', 'new_arrivals', 'best_sellers')),
  collection_ids text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_section_sort_idx on public.products (section, sort_order, name);
create index if not exists products_active_sort_idx on public.products (is_active, sort_order, name);
create index if not exists products_collection_ids_idx on public.products using gin (collection_ids);
create index if not exists products_search_idx on public.products using gin (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category_label, ''))
);

create or replace function public.validate_product_collection_ids()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from unnest(new.collection_ids) as collection_id
    where not exists (select 1 from public.collections c where c.id = collection_id)
  ) then
    raise exception 'Every product collection_id must exist in public.collections.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_home_product_section_limit()
returns trigger
language plpgsql
as $$
declare
  product_count integer;
begin
  if new.is_active and new.section in ('new_arrivals', 'best_sellers') then
    select count(*) into product_count
    from public.products
    where section = new.section
      and is_active = true
      and id <> new.id;

    if product_count >= 4 then
      raise exception 'Only 4 active products are allowed in section %.', new.section;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists validate_product_collection_ids_trigger on public.products;
create trigger validate_product_collection_ids_trigger
before insert or update on public.products
for each row execute function public.validate_product_collection_ids();

drop trigger if exists enforce_home_product_section_limit_trigger on public.products;
create trigger enforce_home_product_section_limit_trigger
before insert or update on public.products
for each row execute function public.enforce_home_product_section_limit();

drop trigger if exists set_products_updated_at_trigger on public.products;
create trigger set_products_updated_at_trigger
before update on public.products
for each row execute function public.set_products_updated_at();

alter table public.products enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
on public.products
for select
using (is_active = true);

-- Admin writes are performed by the service role key used by the Next.js server actions.

-- Mock products using the same style of image URLs as collection cards.
-- Main image is a single URL. Gallery images are multiple URLs displayed on product detail pages.
insert into public.products (
  id,
  name,
  price,
  main_image_url,
  gallery_image_urls,
  category_label,
  description,
  details,
  sizes,
  section,
  collection_ids,
  sort_order,
  is_active,
  updated_at
)
values
  (
    'classic-taupe-double-breasted-suit',
    'Classic Taupe Double-Breasted Suit',
    1289.00,
    '/thudarum-taupe-suit-hero.jpg',
    array['/thudarum-taupe-suit-detail.jpg', '/thudarum-taupe-suit-side.jpg'],
    'Suits',
    'An impeccably tailored double-breasted suit in refined taupe wool with peak lapels and matching trousers.',
    array['100% Italian wool', 'Double-breasted closure', 'Peak lapels', 'Complete with trousers'],
    array['38', '40', '42', '44', '46', '48'],
    'new_arrivals',
    array['executive', 'contemporary'],
    10,
    true,
    now()
  ),
  (
    'heritage-green-check-blazer',
    'Heritage Green Check Blazer',
    895.00,
    '/thudarum-green-check-blazer.jpg',
    array['/thudarum-green-check-detail.jpg', '/thudarum-green-check-side.jpg'],
    'Blazers',
    'A distinguished houndstooth blazer with classic green patterning, refined tailoring, and gold-tone buttons.',
    array['Premium wool houndstooth', 'Double-breasted design', 'Gold-tone buttons', 'Made in England'],
    array['38', '40', '42', '44', '46', '48'],
    'new_arrivals',
    array['heritage'],
    20,
    true,
    now()
  ),
  (
    'luxe-burgundy-evening-suit',
    'Luxe Burgundy Evening Suit',
    1545.00,
    '/thudarum-burgundy-evening-suit.jpg',
    array['/thudarum-burgundy-suit-detail.jpg', '/thudarum-burgundy-suit-side.jpg'],
    'Suits',
    'A sophisticated burgundy suit designed for elevated evening occasions with a timeless tailored silhouette.',
    array['Fine Italian wool', 'Double-breasted style', 'Tone-on-tone buttons', 'Full suit ensemble'],
    array['38', '40', '42', '44', '46', '48'],
    'new_arrivals',
    array['executive', 'evening'],
    30,
    true,
    now()
  ),
  (
    'sky-blue-textured-blazer',
    'Sky Blue Textured Blazer',
    795.00,
    '/thudarum-sky-blue-blazer.jpg',
    array['/thudarum-sky-blue-detail.jpg', '/thudarum-sky-blue-side.jpg'],
    'Blazers',
    'A contemporary sky blue blazer with subtle texture, sharp tailoring, and distinctive button details.',
    array['Textured wool blend', 'Double-breasted cut', 'Gold button details', 'Made in Italy'],
    array['38', '40', '42', '44', '46', '48'],
    'new_arrivals',
    array['contemporary'],
    40,
    true,
    now()
  ),
  (
    'burgundy-blazer-cream-trousers',
    'Burgundy Blazer with Cream Trousers',
    985.00,
    '/thudarum-burgundy-blazer-combo.jpg',
    array['/thudarum-burgundy-combo-detail.jpg', '/thudarum-burgundy-combo-side.jpg'],
    'Separates',
    'A striking burgundy blazer combination with cream trousers for a polished statement look.',
    array['Premium wool construction', 'Double-breasted design', 'Gold-tone buttons', 'Tailored separates'],
    array['38', '40', '42', '44', '46', '48'],
    'best_sellers',
    array['executive', 'evening'],
    10,
    true,
    now()
  ),
  (
    'navy-velvet-double-breasted-jacket',
    'Navy Velvet Double-Breasted Jacket',
    1195.00,
    '/thudarum-navy-velvet-blazer.jpg',
    array['/thudarum-navy-velvet-detail.jpg', '/thudarum-navy-velvet-side.jpg'],
    'Blazers',
    'A luxurious navy velvet jacket with elevated texture and refined eveningwear presence.',
    array['Italian cotton velvet', 'Double-breasted style', 'Silver-tone buttons', 'Evening-ready finish'],
    array['38', '40', '42', '44', '46', '48'],
    'best_sellers',
    array['evening'],
    20,
    true,
    now()
  ),
  (
    'refined-gray-double-breasted-suit',
    'Refined Gray Double-Breasted Suit',
    1345.00,
    '/thudarum-gray-suit-refined.jpg',
    array['/thudarum-gray-suit-detail.jpg', '/thudarum-gray-suit-side.jpg'],
    'Suits',
    'A modern gray double-breasted suit with a clean profile and professional finish.',
    array['Super 120s wool', 'Double-breasted closure', 'Peak lapels', 'Complete suit'],
    array['38', '40', '42', '44', '46', '48'],
    'best_sellers',
    array['executive', 'contemporary'],
    30,
    true,
    now()
  ),
  (
    'modern-slate-blazer-set',
    'Modern Slate Blazer Set',
    1095.00,
    '/thudarum-slate-blazer-set.jpg',
    array['/thudarum-slate-blazer-detail.jpg', '/thudarum-slate-blazer-side.jpg'],
    'Separates',
    'A sophisticated slate blazer set that blends timeless tailoring with modern styling.',
    array['Premium wool blend', 'Double-breasted design', 'Classic buttons', 'Made in England'],
    array['38', '40', '42', '44', '46', '48'],
    'best_sellers',
    array['contemporary'],
    40,
    true,
    now()
  ),
  (
    'minimalist-white-linen-shirt',
    'Minimalist White Linen Shirt',
    245.00,
    '/minimalist-white-linen-shirt-fashion.jpg',
    array['/ivory-silk-blouse-minimal.jpg'],
    'Shirts',
    'A clean white linen shirt designed for effortless layering and warm-weather polish.',
    array['Premium linen', 'Relaxed tailored fit', 'Breathable finish'],
    array['S', 'M', 'L', 'XL'],
    'general',
    array['contemporary'],
    10,
    true,
    now()
  ),
  (
    'camel-trench-coat',
    'Camel Trench Coat',
    645.00,
    '/camel-trench-coat-elegant.jpg',
    array['/minimalist-fashion-studio-elegant-clothing.jpg'],
    'Outerwear',
    'A refined camel trench coat with a versatile silhouette for smart everyday dressing.',
    array['Water-resistant cotton blend', 'Belted waist', 'Classic storm flap'],
    array['S', 'M', 'L', 'XL'],
    'general',
    array['heritage', 'contemporary'],
    20,
    true,
    now()
  ),
  (
    'elegant-black-wool-trousers',
    'Elegant Black Wool Trousers',
    325.00,
    '/elegant-black-wool-trousers.jpg',
    array[]::text[],
    'Trousers',
    'A foundational black wool trouser with a sharp line and versatile formal appeal.',
    array['Wool blend', 'Pressed front crease', 'Tailored waistband'],
    array['30', '32', '34', '36', '38'],
    'general',
    array[]::text[],
    30,
    true,
    now()
  )
on conflict (id) do update
set
  name = excluded.name,
  price = excluded.price,
  main_image_url = excluded.main_image_url,
  gallery_image_urls = excluded.gallery_image_urls,
  category_label = excluded.category_label,
  description = excluded.description,
  details = excluded.details,
  sizes = excluded.sizes,
  section = excluded.section,
  collection_ids = excluded.collection_ids,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = excluded.updated_at;
