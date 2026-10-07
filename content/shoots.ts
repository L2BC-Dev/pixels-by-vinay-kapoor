import photos from "./photos.generated.json";

export type Photo = { src: string; sm: string; w: number; h: number; blur: string };

export type Shoot = {
  slug: string;
  title: string;
  couple: string;
  chapter: string; // Haldi · Mehendi · Sangeet · Pheras · Vidaai
  place: string; // TODO(client): real venues
  line: string;
  cover: number; // index into photos
  photos: Photo[];
  video?: string;
};

const all = photos as Record<string, Photo[]>;

const meta: Omit<Shoot, "photos">[] = [
  {
    slug: "vishal-nitika",
    title: "Vishal × Nitika",
    couple: "Vishal & Nitika",
    chapter: "Pheras",
    place: "Delhi NCR",
    line: "Seventy frames of a wedding that felt like a festival.",
    cover: 0,
  },
  {
    slug: "brides-of-pixels",
    title: "Brides of Pixels",
    couple: "Our brides",
    chapter: "Shringaar",
    place: "Across India",
    line: "Portraits of the women who made our lenses look good.",
    cover: 0,
  },
  {
    slug: "jasmine-neeraj",
    title: "Jasmine × Neeraj",
    couple: "Jasmine & Neeraj",
    chapter: "Sangeet",
    place: "Faridabad",
    line: "Two families, one dance floor, zero chill.",
    cover: 0,
  },
  {
    slug: "tushar-nupur",
    title: "Tushar × Nupur",
    couple: "Tushar & Nupur",
    chapter: "Mehendi",
    place: "Delhi NCR",
    line: "Soft light, loud laughter, henna-stained hands.",
    cover: 0,
  },
  {
    slug: "vishal-sakshi",
    title: "Vishal × Sakshi",
    couple: "Vishal & Sakshi",
    chapter: "Vidaai",
    place: "Haryana",
    line: "One frame. The whole feeling.",
    cover: 0,
  },
];

export const shoots: Shoot[] = meta
  .filter((m) => all[m.slug]?.length)
  .map((m) => ({ ...m, photos: all[m.slug].filter(Boolean) }));

// Full film is a ~1 GB master on Drive, so it plays through Drive's embed player.
// TODO(client): upload to YouTube/Vimeo and swap `embed` for a faster player.
export const promoFilm = {
  teaser: "/video/mohit-cheshta-teaser.mp4",
  poster: "/video/mohit-cheshta-poster.jpg",
  embed: "https://drive.google.com/file/d/1yprCS_LdvvFcDhtfzU4PVL9Kd5a0DoQY/preview",
  title: "Mohit × Cheshta — The Promo",
};

export const getShoot = (slug: string) => shoots.find((s) => s.slug === slug);

// A flat, interleaved list of photos for hero/marquees.
export function featuredPhotos(n = 10): Photo[] {
  const out: Photo[] = [];
  for (let i = 0; out.length < n && i < 40; i++) {
    for (const s of shoots) {
      const p = s.photos[(i * 5 + 2) % s.photos.length];
      if (p && !out.includes(p)) out.push(p);
      if (out.length >= n) break;
    }
  }
  return out;
}
