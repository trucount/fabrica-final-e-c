export type CollectionItem = {
  id: string
  name: string
  description: string
  image: string
  items: string
}

export const COLLECTIONS: CollectionItem[] = [
  {
    id: "executive",
    name: "Executive Collection",
    description: "Bold, sophisticated pieces for the modern power dresser. Featuring rich textures and commanding colors.",
    image: "/thudarum-burgundy-evening-suit.jpg",
    items: "12 items",
  },
  {
    id: "heritage",
    name: "Heritage Collection",
    description: "Classic tailoring with timeless appeal. Traditional patterns reimagined for contemporary elegance.",
    image: "/thudarum-green-check-blazer.jpg",
    items: "8 items",
  },
  {
    id: "contemporary",
    name: "Contemporary Collection",
    description: "Modern cuts and innovative styling for the forward-thinking gentleman.",
    image: "/thudarum-sky-blue-blazer.jpg",
    items: "10 items",
  },
  {
    id: "evening",
    name: "Evening Collection",
    description: "Luxurious velvet and satin pieces designed to make a statement at formal occasions.",
    image: "/thudarum-navy-velvet-blazer.jpg",
    items: "6 items",
  },
]
