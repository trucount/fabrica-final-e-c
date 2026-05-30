-- Run this in the Supabase SQL editor before using /edit/about.
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id, content)
values (
  'about',
  '{
    "heroTitle": "About Thudarum",
    "heroSubtitle": "Crafting timeless elegance for the modern gentleman",
    "heroImageUrl": "/thudarum-burgundy-evening-suit.jpg",
    "storyTitle": "Our Story",
    "storyImageUrl": "/thudarum-taupe-suit-detail.jpg",
    "storyParagraphs": [
      "Founded with a vision to redefine modern menswear, Thudarum represents the perfect marriage of traditional craftsmanship and contemporary design. Our name, derived from the Tamil word meaning \"continuation,\" embodies our commitment to carrying forward the legacy of fine tailoring into the modern era.",
      "Every piece in our collection is meticulously crafted using premium Italian fabrics and constructed by master tailors who have honed their craft over decades. We believe that true luxury lies not in excess, but in the perfect balance of form, function, and timeless style.",
      "Our double-breasted suits and blazers are designed for the discerning gentleman who appreciates quality, understands elegance, and values garments that will remain relevant for years to come."
    ],
    "valuesTitle": "Our Values",
    "values": [
      {
        "title": "Craftsmanship",
        "description": "Every garment is constructed with meticulous attention to detail by skilled artisans who take pride in their work."
      },
      {
        "title": "Quality",
        "description": "We source only the finest materials from renowned Italian mills, ensuring durability and comfort in every piece."
      },
      {
        "title": "Timelessness",
        "description": "Our designs transcend fleeting trends, offering styles that remain elegant and relevant season after season."
      }
    ],
    "ctaTitle": "Experience Thudarum",
    "ctaDescription": "Discover our latest collection of meticulously crafted suits and blazers designed for the modern gentleman."
  }'::jsonb
)
on conflict (id) do nothing;

-- Keep reads/writes private. The Next.js server uses SUPABASE_SERVICE_ROLE_KEY,
-- so no public RLS policy is required for this table.
alter table public.site_content enable row level security;
