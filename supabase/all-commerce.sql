-- Combined Supabase setup for the storefront.
-- Run this once in Supabase SQL editor. It is safe to rerun.
-- It includes editable page content, collections, storage bucket, products,
-- and future-ready commerce tables for users, addresses, policies, coupons, and orders.

create extension if not exists pgcrypto;

-- Shared editable content table ------------------------------------------------
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id, content, updated_at)
values
  (
    'site',
    '{
      "brandName": "THUDARUM",
      "tickerMessages": [
        "FREE SHIPPING ON ORDERS OVER ₹200",
        "30-DAY RETURNS",
        "AUTHENTIC ITALIAN CRAFTSMANSHIP"
      ]
    }'::jsonb,
    now()
  ),
  (
    'home',
    '{
      "heroTitle": "Refined Simplicity",
      "heroSubtitle": "Discover timeless pieces crafted for the modern wardrobe",
      "heroVideoUrl": "https://www.youtube.com/embed/u9FEg5qur14?autoplay=1&mute=1&loop=1&playlist=u9FEg5qur14&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1",
      "collectionsTitle": "Collections",
      "newArrivalsTitle": "New Arrivals",
      "bestSellersTitle": "Best Sellers",
      "footerTagline": "Contemporary fashion for the discerning individual."
    }'::jsonb,
    now()
  ),
  (
    'shop',
    '{"title": "All Products"}'::jsonb,
    now()
  ),
  (
    'collections',
    '{
      "title": "Collections",
      "description": "Explore our curated collections, each telling a unique story of style, craftsmanship, and modern elegance.",
      "featuredTitle": "Crafted for Excellence",
      "featuredDescription": "Each collection is carefully curated to offer distinctive pieces that complement your personal style."
    }'::jsonb,
    now()
  ),
  (
    'about',
    '{
      "heroTitle": "About Thudarum",
      "heroSubtitle": "Crafting timeless elegance for the modern gentleman",
      "heroImageUrl": "/thudarum-burgundy-evening-suit.jpg",
      "storyTitle": "Our Story",
      "storyImageUrl": "/thudarum-taupe-suit-detail.jpg",
      "storyParagraphs": [
        "Founded with a vision to redefine modern menswear, Thudarum represents the perfect marriage of traditional craftsmanship and contemporary design.",
        "Every piece in our collection is meticulously crafted using premium fabrics and refined construction.",
        "Our suits and blazers are designed for the discerning customer who values garments that remain relevant for years."
      ],
      "valuesTitle": "Our Values",
      "values": [
        {"title": "Craftsmanship", "description": "Every garment is constructed with meticulous attention to detail."},
        {"title": "Quality", "description": "We source fine materials for durability and comfort."},
        {"title": "Timelessness", "description": "Our designs transcend fleeting trends."}
      ],
      "ctaTitle": "Experience Thudarum",
      "ctaDescription": "Discover our latest collection of meticulously crafted suits and blazers."
    }'::jsonb,
    now()
  ),
  ('page:shipping', '{"title":"Shipping","description":"Shipping information","body":["Complimentary shipping rules are controlled from Admin Policies."]}'::jsonb, now()),
  ('page:returns', '{"title":"Returns","description":"Returns information","body":["30-day return policy for unworn items."]}'::jsonb, now()),
  ('page:privacy', '{"title":"Privacy Policy","description":"Privacy information","body":["We respect your privacy and protect your data."]}'::jsonb, now()),
  ('page:terms', '{"title":"Terms of Service","description":"Terms information","body":["By using this site, you agree to our terms."]}'::jsonb, now()),
  ('page:contact', '{"title":"Contact","description":"Contact us","body":["Reach out to our support team for help."],"contact":{"instagram":"https://instagram.com/thudarum","whatsapp":"https://wa.me/910000000000","facebook":"https://facebook.com/thudarum","phone":"+91 00000 00000","email":"support@thudarum.com"}}'::jsonb, now())
on conflict (id) do update
set content = excluded.content,
    updated_at = excluded.updated_at;

-- Collections -----------------------------------------------------------------
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
  ('executive', 'Executive Collection', 'Bold, sophisticated pieces for the modern power dresser. Featuring rich textures and commanding colors.', '/thudarum-burgundy-evening-suit.jpg', '12 items', 10, now()),
  ('heritage', 'Heritage Collection', 'Classic tailoring with timeless appeal. Traditional patterns reimagined for contemporary elegance.', '/thudarum-green-check-blazer.jpg', '8 items', 20, now()),
  ('contemporary', 'Contemporary Collection', 'Modern cuts and innovative styling for the forward-thinking gentleman.', '/thudarum-sky-blue-blazer.jpg', '10 items', 30, now()),
  ('evening', 'Evening Collection', 'Luxurious velvet and satin pieces designed to make a statement at formal occasions.', '/thudarum-navy-velvet-blazer.jpg', '6 items', 40, now())
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    item_count_label = excluded.item_count_label,
    sort_order = excluded.sort_order,
    updated_at = excluded.updated_at;

insert into storage.buckets (id, name, public)
values ('pic', 'pic', true)
on conflict (id) do update
set public = excluded.public;

-- Products --------------------------------------------------------------------
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

create or replace function public.set_updated_at()
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
for each row execute function public.set_updated_at();

insert into public.products (id, name, price, main_image_url, gallery_image_urls, category_label, description, details, sizes, section, collection_ids, sort_order, is_active, updated_at)
values
  ('classic-taupe-double-breasted-suit', 'Classic Taupe Double-Breasted Suit', 1289.00, '/thudarum-taupe-suit-hero.jpg', array['/thudarum-taupe-suit-detail.jpg', '/thudarum-taupe-suit-side.jpg'], 'Suits', 'An impeccably tailored double-breasted suit in refined taupe wool with peak lapels and matching trousers.', array['100% Italian wool', 'Double-breasted closure', 'Peak lapels', 'Complete with trousers'], array['38', '40', '42', '44', '46', '48'], 'new_arrivals', array['executive', 'contemporary'], 10, true, now()),
  ('heritage-green-check-blazer', 'Heritage Green Check Blazer', 895.00, '/thudarum-green-check-blazer.jpg', array['/thudarum-green-check-detail.jpg', '/thudarum-green-check-side.jpg'], 'Blazers', 'A distinguished houndstooth blazer with classic green patterning, refined tailoring, and gold-tone buttons.', array['Premium wool houndstooth', 'Double-breasted design', 'Gold-tone buttons', 'Made in England'], array['38', '40', '42', '44', '46', '48'], 'new_arrivals', array['heritage'], 20, true, now()),
  ('luxe-burgundy-evening-suit', 'Luxe Burgundy Evening Suit', 1545.00, '/thudarum-burgundy-evening-suit.jpg', array['/thudarum-burgundy-suit-detail.jpg', '/thudarum-burgundy-suit-side.jpg'], 'Suits', 'A sophisticated burgundy suit designed for elevated evening occasions with a timeless tailored silhouette.', array['Fine Italian wool', 'Double-breasted style', 'Tone-on-tone buttons', 'Full suit ensemble'], array['38', '40', '42', '44', '46', '48'], 'new_arrivals', array['executive', 'evening'], 30, true, now()),
  ('sky-blue-textured-blazer', 'Sky Blue Textured Blazer', 795.00, '/thudarum-sky-blue-blazer.jpg', array['/thudarum-sky-blue-detail.jpg', '/thudarum-sky-blue-side.jpg'], 'Blazers', 'A contemporary sky blue blazer with subtle texture, sharp tailoring, and distinctive button details.', array['Textured wool blend', 'Double-breasted cut', 'Gold button details', 'Made in Italy'], array['38', '40', '42', '44', '46', '48'], 'new_arrivals', array['contemporary'], 40, true, now()),
  ('burgundy-blazer-cream-trousers', 'Burgundy Blazer with Cream Trousers', 985.00, '/thudarum-burgundy-blazer-combo.jpg', array['/thudarum-burgundy-combo-detail.jpg', '/thudarum-burgundy-combo-side.jpg'], 'Separates', 'A striking burgundy blazer combination with cream trousers for a polished statement look.', array['Premium wool construction', 'Double-breasted design', 'Gold-tone buttons', 'Tailored separates'], array['38', '40', '42', '44', '46', '48'], 'best_sellers', array['executive', 'evening'], 10, true, now()),
  ('navy-velvet-double-breasted-jacket', 'Navy Velvet Double-Breasted Jacket', 1195.00, '/thudarum-navy-velvet-blazer.jpg', array['/thudarum-navy-velvet-detail.jpg', '/thudarum-navy-velvet-side.jpg'], 'Blazers', 'A luxurious navy velvet jacket with elevated texture and refined eveningwear presence.', array['Italian cotton velvet', 'Double-breasted style', 'Silver-tone buttons', 'Evening-ready finish'], array['38', '40', '42', '44', '46', '48'], 'best_sellers', array['evening'], 20, true, now()),
  ('refined-gray-double-breasted-suit', 'Refined Gray Double-Breasted Suit', 1345.00, '/thudarum-gray-suit-refined.jpg', array['/thudarum-gray-suit-detail.jpg', '/thudarum-gray-suit-side.jpg'], 'Suits', 'A modern gray double-breasted suit with a clean profile and professional finish.', array['Super 120s wool', 'Double-breasted closure', 'Peak lapels', 'Complete suit'], array['38', '40', '42', '44', '46', '48'], 'best_sellers', array['executive', 'contemporary'], 30, true, now()),
  ('modern-slate-blazer-set', 'Modern Slate Blazer Set', 1095.00, '/thudarum-slate-blazer-set.jpg', array['/thudarum-slate-blazer-detail.jpg', '/thudarum-slate-blazer-side.jpg'], 'Separates', 'A sophisticated slate blazer set that blends timeless tailoring with modern styling.', array['Premium wool blend', 'Double-breasted design', 'Classic buttons', 'Made in England'], array['38', '40', '42', '44', '46', '48'], 'best_sellers', array['contemporary'], 40, true, now()),
  ('minimalist-white-linen-shirt', 'Minimalist White Linen Shirt', 245.00, '/minimalist-white-linen-shirt-fashion.jpg', array['/ivory-silk-blouse-minimal.jpg'], 'Shirts', 'A clean white linen shirt designed for effortless layering and warm-weather polish.', array['Premium linen', 'Relaxed tailored fit', 'Breathable finish'], array['S', 'M', 'L', 'XL'], 'general', array['contemporary'], 10, true, now()),
  ('camel-trench-coat', 'Camel Trench Coat', 645.00, '/camel-trench-coat-elegant.jpg', array['/minimalist-fashion-studio-elegant-clothing.jpg'], 'Outerwear', 'A refined camel trench coat with a versatile silhouette for smart everyday dressing.', array['Water-resistant cotton blend', 'Belted waist', 'Classic storm flap'], array['S', 'M', 'L', 'XL'], 'general', array['heritage', 'contemporary'], 20, true, now()),
  ('elegant-black-wool-trousers', 'Elegant Black Wool Trousers', 325.00, '/elegant-black-wool-trousers.jpg', array[]::text[], 'Trousers', 'A foundational black wool trouser with a sharp line and versatile formal appeal.', array['Wool blend', 'Pressed front crease', 'Tailored waistband'], array['30', '32', '34', '36', '38'], 'general', array[]::text[], 30, true, now())
on conflict (id) do update
set name = excluded.name,
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

-- Commerce tables -------------------------------------------------------------
-- Current app code stores these client-side today; these tables are ready for
-- moving users, addresses, policies, coupons, and orders fully into Supabase.

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  last_name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  label text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  address text not null,
  apartment text,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_addresses_user_idx on public.saved_addresses(user_id);

create or replace function public.enforce_max_three_addresses()
returns trigger
language plpgsql
as $$
declare
  address_count integer;
begin
  select count(*) into address_count
  from public.saved_addresses
  where user_id = new.user_id
    and id <> new.id;

  if address_count >= 3 then
    raise exception 'Each user can save a maximum of 3 addresses.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_max_three_addresses_trigger on public.saved_addresses;
create trigger enforce_max_three_addresses_trigger
before insert or update on public.saved_addresses
for each row execute function public.enforce_max_three_addresses();

drop trigger if exists set_saved_addresses_updated_at_trigger on public.saved_addresses;
create trigger set_saved_addresses_updated_at_trigger
before update on public.saved_addresses
for each row execute function public.set_updated_at();

create table if not exists public.order_policies (
  id boolean primary key default true check (id),
  shipping_amount numeric(10, 2) not null default 15 check (shipping_amount >= 0),
  free_shipping_threshold numeric(10, 2) not null default 200 check (free_shipping_threshold >= 0),
  tax_rate numeric(5, 2) not null default 8 check (tax_rate >= 0),
  automatic_shipping_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.order_policies
  add column if not exists automatic_shipping_enabled boolean not null default false;

insert into public.order_policies (id, shipping_amount, free_shipping_threshold, tax_rate, automatic_shipping_enabled, updated_at)
values (true, 15, 200, 8, false, now())
on conflict (id) do update
set shipping_amount = excluded.shipping_amount,
    free_shipping_threshold = excluded.free_shipping_threshold,
    tax_rate = excluded.tax_rate,
    automatic_shipping_enabled = public.order_policies.automatic_shipping_enabled,
    updated_at = excluded.updated_at;

create table if not exists public.coupons (
  code text primary key,
  label text not null,
  coupon_type text not null check (coupon_type in ('universal', 'one_time')),
  discount_type text not null check (discount_type in ('percent', 'amount')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.coupons (code, label, coupon_type, discount_type, discount_value, active, updated_at)
values
  ('WELCOME10', 'Welcome 10%', 'universal', 'percent', 10, true, now())
on conflict (code) do update
set label = excluded.label,
    coupon_type = excluded.coupon_type,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    active = excluded.active,
    updated_at = excluded.updated_at;

delete from public.coupons
where code in ('SAVE20', 'LUXURY15');

create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.app_users(id) on delete set null,
  user_email text not null,
  status text not null default 'placed' check (status in ('placed', 'packed', 'in_transit', 'delivered')),
  payment_method text not null check (payment_method in ('cod', 'razorpay')),
  payment_verified boolean not null default false,
  razorpay_payment_id text,
  coupon_code text references public.coupons(code) on delete set null,
  shipping_address jsonb not null,
  totals jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_email_idx on public.orders(user_email);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  size text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.consume_one_time_coupon_after_paid_order()
returns trigger
language plpgsql
as $$
begin
  if new.payment_verified and new.coupon_code is not null then
    delete from public.coupons
    where code = new.coupon_code
      and coupon_type = 'one_time';
  end if;

  return new;
end;
$$;

drop trigger if exists consume_one_time_coupon_after_paid_order_trigger on public.orders;
create trigger consume_one_time_coupon_after_paid_order_trigger
after insert on public.orders
for each row execute function public.consume_one_time_coupon_after_paid_order();

drop trigger if exists set_orders_updated_at_trigger on public.orders;
create trigger set_orders_updated_at_trigger
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_coupons_updated_at_trigger on public.coupons;
create trigger set_coupons_updated_at_trigger
before update on public.coupons
for each row execute function public.set_updated_at();

drop trigger if exists set_order_policies_updated_at_trigger on public.order_policies;
create trigger set_order_policies_updated_at_trigger
before update on public.order_policies
for each row execute function public.set_updated_at();

drop trigger if exists set_app_users_updated_at_trigger on public.app_users;
create trigger set_app_users_updated_at_trigger
before update on public.app_users
for each row execute function public.set_updated_at();

-- RLS -------------------------------------------------------------------------
alter table public.site_content enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.app_users enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.order_policies enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
on public.products
for select
using (is_active = true);

drop policy if exists "Site content is publicly readable" on public.site_content;
create policy "Site content is publicly readable"
on public.site_content
for select
using (true);

drop policy if exists "Collections are publicly readable" on public.collections;
create policy "Collections are publicly readable"
on public.collections
for select
using (true);

-- Commerce writes are performed by Next.js API routes with SUPABASE_SERVICE_ROLE_KEY
-- so admin policy changes, orders, order items, users, and addresses persist even
-- while row-level security protects those tables from direct anonymous writes.
