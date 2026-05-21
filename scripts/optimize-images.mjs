/**
 * Compresse les photos avant déploiement (Netlify build).
 * Réduit le poids (~30 Mo → quelques Mo) sans changer les noms de fichiers.
 */
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "..", "images");
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;
const SKIP_FILES = new Set(["CC-Logo.png", "CC.png"]);

async function optimizeFile(filePath) {
  const base = path.basename(filePath);
  if (SKIP_FILES.has(base)) return;

  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;

  const before = (await fs.stat(filePath)).size;
  const pipeline = sharp(filePath)
    .rotate()
    .resize(MAX_WIDTH, MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    });

  let buffer;
  if (ext === ".png") {
    buffer = await pipeline
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();
  } else {
    buffer = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  }

  await fs.writeFile(filePath, buffer);

  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
  await sharp(filePath).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  const after = (await fs.stat(filePath)).size;
  console.log(
    `  ${base}: ${Math.round(before / 1024)} Ko → ${Math.round(after / 1024)} Ko`
  );
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "logos") continue;
      await walk(full);
    } else {
      await optimizeFile(full);
    }
  }
}

console.log("Optimisation des images…");
await walk(IMAGES_DIR);
console.log("Terminé.");
