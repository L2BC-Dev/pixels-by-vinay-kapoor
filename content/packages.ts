// TODO(client): replace with the real packages, inclusions and prices.
// Each package belongs to a "scale": intimate (average-size) or luxury.
export type Package = {
  id: string;
  scale: "intimate" | "luxury";
  name: string;
  hi: string; // Hindi accent word
  price: string; // shown as-is, e.g. "₹1,50,000" or "On request"
  days: string;
  blurb: string;
  includes: string[];
  featured?: boolean;
};

export const packages: Package[] = [
  {
    id: "shagun",
    scale: "intimate",
    name: "Shagun",
    hi: "शगुन",
    price: "On request",
    days: "1 day · 1 event",
    blurb: "For the intimate wedding or the single big day that deserves to be told beautifully.",
    includes: ["Candid + traditional photography", "Cinematic highlight film", "Instagram reel", "Online gallery"],
  },
  {
    id: "phere",
    scale: "intimate",
    name: "Saat Phere",
    hi: "सात फेरे",
    price: "On request",
    days: "2 days · up to 3 events",
    blurb: "Haldi to pheras — the complete story for weddings that keep it close and real.",
    includes: ["Candid + traditional photography", "Cinematic film + teaser", "2 Instagram reels", "Premium photo album", "Online gallery"],
    featured: true,
  },
  {
    id: "shahi",
    scale: "luxury",
    name: "Shahi",
    hi: "शाही",
    price: "On request",
    days: "3 days · all events",
    blurb: "A full film unit for the big fat wedding: multi-cam, drone and same-day edits.",
    includes: ["Multi-camera film crew", "Drone & aerial coverage", "Same-day edit reel", "Feature film + documentary edit", "Luxury heirloom albums"],
    featured: true,
  },
  {
    id: "maharaja",
    scale: "luxury",
    name: "Destination",
    hi: "यात्रा",
    price: "On request",
    days: "Custom · anywhere",
    blurb: "Udaipur palaces, Goa beaches, Himalayan sunsets — we travel with the whole crew.",
    includes: ["Dedicated creative director", "Pre-wedding film shoot", "Full crew travel", "Live streaming for family abroad", "Everything in Shahi"],
  },
];

export const addons = [
  "Pre-wedding shoot",
  "Drone coverage",
  "Same-day edit",
  "Live streaming",
  "Extra reels",
  "Parent albums",
];
