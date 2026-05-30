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
  if new.section in ('new_arrivals', 'best_sellers') then
    select count(*) into product_count
    from public.products
    where section = new.section
      and id <> new.id;

    if product_count >= 4 then
      raise exception 'Only 4 products are allowed in section %.', new.section;
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
