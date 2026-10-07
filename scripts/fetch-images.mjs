// Downloads the shoot photos listed in drive-manifest.json from the public Drive folder,
// then writes web-optimised WebP versions + blur placeholders into public/shoots/<slug>/.
// Usage: node scripts/fetch-images.mjs <rawCacheDir>
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const cacheDir = process.argv[2] ?? path.join(root, ".cache", "raw");
const manifest = JSON.parse(await fs.readFile(path.join(root, "scripts", "drive-manifest.json"), "utf8"));

const url = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

async function download(id, dest) {
  try {
    await fs.access(dest);
    return;
  } catch {}
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url(id));
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && !type.includes("text/html")) {
      await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      return;
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(`download failed: ${id}`);
}

async function pool(items, size, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}

const out = {};
for (const [slug, ids] of Object.entries(manifest)) {
  // Videos are ~1 GB masters: handled by scripts/fetch-video.mjs (download + ffmpeg teaser).
  if (slug.startsWith("_video_")) continue;
  const rawDir = path.join(cacheDir, slug);
  const webDir = path.join(root, "public", "shoots", slug);
  await fs.mkdir(rawDir, { recursive: true });
  await fs.mkdir(webDir, { recursive: true });
  const photos = [];
  await pool(ids.map((id, i) => [id, i]), 6, async ([id, i]) => {
    const raw = path.join(rawDir, id);
    await download(id, raw);
    const name = String(i + 1).padStart(2, "0");
    const img = sharp(raw, { failOn: "none" }).rotate();
    const meta = await img.clone().resize({ width: 2000, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
    await sharp(meta.data).webp({ quality: 78 }).toFile(path.join(webDir, `${name}.webp`));
    await sharp(meta.data).resize({ width: 900 }).webp({ quality: 72 }).toFile(path.join(webDir, `${name}-sm.webp`));
    const blur = await sharp(meta.data).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    photos[i] = {
      src: `/shoots/${slug}/${name}.webp`,
      sm: `/shoots/${slug}/${name}-sm.webp`,
      w: meta.info.width,
      h: meta.info.height,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    process.stdout.write(".");
  });
  out[slug] = photos;
  console.log(`\n${slug}: ${photos.length}`);
}

await fs.writeFile(path.join(root, "content", "photos.generated.json"), JSON.stringify(out, null, 1));
console.log("done");
