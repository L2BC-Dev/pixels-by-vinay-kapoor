import type { Metadata, Viewport } from "next";
// Self-hosted fonts (no build-time Google Fonts fetch).
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/tiro-devanagari-hindi/devanagari-400.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Wedding Photography & Films, Faridabad`, template: `%s · ${site.name}` },
  description:
    "Cinematic wedding photography and films by a young Gen Z crew led by Vinay Kapoor. Luxury and intimate weddings across Faridabad, Delhi NCR and destination India.",
  keywords: ["wedding photographer Faridabad", "wedding cinematographer Delhi NCR", "candid wedding photography", "luxury Indian wedding films", "Pixels by Vinay Kapoor"],
  openGraph: {
    title: site.name,
    description: site.tagline,
    images: ["/shoots/vishal-nitika/01.webp"],
    locale: "en_IN",
    type: "website",
  },
  icons: { icon: "/brand/mark.png" },
};

export const viewport: Viewport = { themeColor: "#0B0A10" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.tagline,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  address: { "@type": "PostalAddress", addressLocality: "Faridabad", addressRegion: "Haryana", addressCountry: "IN" },
  areaServed: ["Faridabad", "Delhi NCR", "India"],
  founder: { "@type": "Person", name: "Vinay Kapoor" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className="has-cursor">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll />
        <Cursor />
        <Nav />
        <main>{children}</main>
        <Footer />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
