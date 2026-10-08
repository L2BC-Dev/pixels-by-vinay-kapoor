import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server writes to its own folder so running `npm run build` alongside it can't corrupt it.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
