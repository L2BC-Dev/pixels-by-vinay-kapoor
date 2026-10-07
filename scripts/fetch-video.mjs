// Downloads the promo film master from Drive (streamed, ~1 GB) and cuts a light, muted
// 720p teaser loop for the site with ffmpeg. The full film is embedded via Drive's player.
// Usage: node scripts/fetch-video.mjs <rawCacheDir>
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const cacheDir = process.argv[2] ?? path.join(root, ".cache", "raw");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts", "drive-manifest.json"), "utf8"));
const outDir = path.join(root, "public", "video");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

for (const [key, ids] of Object.entries(manifest)) {
  if (!key.startsWith("_video_")) continue;
  const slug = key.replace("_video_", "");
  const raw = path.join(cacheDir, `${slug}.mp4`);
  if (!fs.existsSync(raw)) {
    const res = await fetch(`https://drive.usercontent.google.com/download?id=${ids[0]}&export=download&confirm=t`);
    if (!res.ok || (res.headers.get("content-type") ?? "").includes("text/html")) throw new Error(`download failed: ${slug}`);
    await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(raw + ".part"));
    fs.renameSync(raw + ".part", raw);
  }
  const ff = process.env.FFMPEG ?? "ffmpeg";
  // 24s muted teaser from 0:20, 720p, ~2.5 Mbps
  execFileSync(ff, ["-y", "-ss", "20", "-t", "24", "-i", raw, "-an", "-vf", "scale=-2:720,fps=24", "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(outDir, `${slug}-teaser.mp4`)], { stdio: "inherit" });
  execFileSync(ff, ["-y", "-ss", "24", "-i", raw, "-frames:v", "1", "-vf", "scale=1600:-2", "-q:v", "3", path.join(outDir, `${slug}-poster.jpg`)], { stdio: "inherit" });
  console.log(`${slug}: teaser done`);
}
