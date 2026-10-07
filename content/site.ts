// Studio-wide copy & contact details. TODO(client): replace every value marked TODO.
export const site = {
  name: "Pixels by Vinay Kapoor",
  short: "Pixels",
  tagline: "Wedding films & photographs for the couples who never wanted 'traditional'.",
  city: "Faridabad",
  serving: "Faridabad · Delhi NCR · Pan-India · Destination",
  phone: "+91 98XXXXXXXX", // TODO(client)
  whatsapp: "9198XXXXXXXX", // TODO(client) digits only, with country code
  email: "hello@pixelsbyvinaykapoor.com", // TODO(client)
  instagram: "https://www.instagram.com/", // TODO(client)
  instagramHandle: "@pixelsbyvinaykapoor", // TODO(client)
  youtube: "https://www.youtube.com/", // TODO(client)
  address: "Studio address, Sector XX, Faridabad, Haryana", // TODO(client)
  mapsQuery: "Faridabad, Haryana",
  url: "https://pixelsbyvinaykapoor.com", // TODO(client) final domain
};

export const nav = [
  { href: "/portfolio", label: "Portfolio", hi: "कहानियाँ" },
  { href: "/services", label: "Services", hi: "सेवाएँ" },
  { href: "/founders", label: "Founder", hi: "संस्थापक" },
  { href: "/about", label: "About", hi: "हम" },
  { href: "/contact", label: "Contact", hi: "संपर्क" },
];

export const founder = {
  name: "Vinay Kapoor",
  role: "Founder & Lead Cinematographer",
  // TODO(client): replace with a real portrait in /public/founder/vinay.webp
  portrait: "/shoots/vishal-nitika/05.webp",
  bio: [
    "Vinay picked up a camera to tell stories nobody else was noticing — the stolen glance during the pheras, the nani who cries before the bride does, the baraat that refuses to stop dancing.",
    "Years later, that same eye is trusted on the frontlines of India's biggest moments: national political campaigns, high-security events for some of the country's most recognised leaders, and celebrity-scale weddings where there are no second takes.",
    "Pixels is what happens when that level of precision meets a crew of Gen Z storytellers who grew up editing reels at 2am. Discreet when it matters. Loud when it should be.",
  ],
  stats: [
    { value: "500+", label: "weddings & events filmed" }, // TODO(client) confirm
    { value: "10+", label: "years behind the lens" }, // TODO(client) confirm
    { value: "20+", label: "cities across India" }, // TODO(client) confirm
    { value: "∞", label: "cups of chai on set" },
  ],
  credentials: [
    "National political campaigns & rallies",
    "Private events for senior public figures",
    "High-profile & celebrity-scale weddings",
    "Destination weddings across India",
  ],
};

export const testimonials = [
  // TODO(client): replace with real reviews (names with permission)
  {
    quote: "We told them 'no cheesy poses'. They gave us a film that our friends keep sending to each other at midnight.",
    by: "Vishal & Nitika",
  },
  {
    quote: "They were invisible during the pheras and the life of the party at the sangeet. Exactly what we wanted.",
    by: "Jasmine & Neeraj",
  },
  {
    quote: "Every single photo looks like a movie still. Our parents and our friends both loved it — that never happens.",
    by: "Tushar & Nupur",
  },
];

export const team = [
  // TODO(client): real names / roles / photos
  { name: "Vinay Kapoor", role: "Founder · Lead cinematographer" },
  { name: "Team Member", role: "Lead photographer" },
  { name: "Team Member", role: "Film editor & colourist" },
  { name: "Team Member", role: "Candid & reels" },
  { name: "Team Member", role: "Drone & aerials" },
];

export const process = [
  { n: "01", title: "The Chai Call", body: "We meet (or video-call) over chai, hear your story, your vibe, your non-negotiables. No sales pitch." },
  { n: "02", title: "Lock the Date", body: "Pick your package, check our live calendar, and block your dates with a token advance." },
  { n: "03", title: "The Pre-Plan", body: "Shot lists, family lists, timelines, venue recce and a pre-wedding concept built around you." },
  { n: "04", title: "The Wedding", body: "A crew that blends in with the guests and moves like a film unit. You just live it." },
  { n: "05", title: "The Delivery", body: "Sneak peeks within days, reels within a week, the full film and album crafted to last generations." },
];
