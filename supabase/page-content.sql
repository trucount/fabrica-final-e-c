-- Run this in the Supabase SQL editor to add editable site, Home, Shop, Collections, and info-page content.
-- It is safe to run more than once; existing rows are updated with these seed values.
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
        "FREE SHIPPING ON ORDERS OVER $200",
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
      "heroImageUrls": ["/thudarum-taupe-suit-hero.jpg", "/thudarum-burgundy-evening-suit.jpg", "/thudarum-sky-blue-blazer.jpg", "/thudarum-navy-velvet-blazer.jpg"],
      "heroImageUrlsDesktop": ["/thudarum-taupe-suit-hero.jpg", "/thudarum-burgundy-evening-suit.jpg", "/thudarum-sky-blue-blazer.jpg", "/thudarum-navy-velvet-blazer.jpg"],
      "heroImageUrlsMobile": ["/thudarum-taupe-suit-detail.jpg", "/thudarum-burgundy-suit-detail.jpg", "/thudarum-sky-blue-detail.jpg", "/thudarum-navy-velvet-detail.jpg"],
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
  ),
  (
    'page:contact',
    '{
      "title": "Contact",
      "description": "We are here to help with product questions, styling guidance, and order support.",
      "body": [
        "Reach out to the Thudarum team for assistance with sizing, fabric details, availability, or order questions.",
        "Our support team will respond as quickly as possible with thoughtful guidance tailored to your needs."
      ],
      "contact": {
        "instagram": "https://instagram.com/thudarum",
        "whatsapp": "https://wa.me/910000000000",
        "facebook": "https://facebook.com/thudarum",
        "phone": "+91 00000 00000",
        "email": "support@thudarum.com"
      }
    }'::jsonb,
    now()
  ),
  (
    'page:shipping',
    '{
      "title": "Shipping",
      "description": "Learn more about how your Thudarum pieces are prepared and delivered.",
      "body": [
        "Each order is carefully packed to protect the structure and finish of every garment.",
        "Shipping timelines may vary based on destination, product availability, and carrier service levels."
      ]
    }'::jsonb,
    now()
  ),
  (
    'page:returns',
    '{
      "title": "Returns",
      "description": "We want every Thudarum piece to feel right from the moment it arrives.",
      "body": [
        "If your order is not suitable, contact support for return guidance before sending items back.",
        "Returned garments should be unworn, unaltered, and in their original condition with packaging and tags intact."
      ]
    }'::jsonb,
    now()
  ),
  (
    'page:privacy',
    '{
      "title": "Privacy",
      "description": "Your privacy matters to us, and we handle your information with care.",
      "body": [
        "We collect only the information needed to provide our store experience, process orders, and support customers.",
        "We do not sell your personal information, and we use trusted services to help operate the website securely."
      ]
    }'::jsonb,
    now()
  ),
  (
    'page:terms',
    '{
      "title": "Terms",
      "description": "These terms outline the basic rules for using the Thudarum website and services.",
      "body": [
        "By using this website, you agree to use it responsibly and provide accurate information when placing orders.",
        "Product details, availability, pricing, and policies may be updated as the store evolves."
      ]
    }'::jsonb,
    now()
  )
on conflict (id) do update
set
  content = excluded.content,
  updated_at = excluded.updated_at;

alter table public.site_content enable row level security;
