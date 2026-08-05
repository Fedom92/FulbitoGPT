// Generates PWA/favicon icons and the social-preview image from the source
// branding art in src/assets/. Run after logo.webp or logo_simple.webp change:
//   node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS_DIR = join(ROOT, 'src', 'assets');
const PUBLIC_DIR = join(ROOT, 'public');

const ICON_SOURCE = join(ASSETS_DIR, 'logo_simple.webp'); // icon-only mark, no wordmark
const SOCIAL_SOURCE = join(ASSETS_DIR, 'logo.webp'); // full lockup with wordmark
const BACKGROUND = { r: 0x0b, g: 0x27, b: 0x22 }; // sampled from the mark's own background

mkdirSync(join(PUBLIC_DIR, 'icons'), { recursive: true });

async function writeSquareIcon(destName, size) {
  const dest = join(PUBLIC_DIR, 'icons', destName);
  await sharp(ICON_SOURCE)
    .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`wrote ${dest} (${size}x${size})`);
}

async function writeMaskableIcon(destName, size) {
  const dest = join(PUBLIC_DIR, 'icons', destName);
  const safeZone = Math.round(size * 0.8); // keep artwork inside Android's adaptive-icon safe zone
  const inner = await sharp(ICON_SOURCE)
    .resize(safeZone, safeZone, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: BACKGROUND },
  })
    .composite([{ input: inner, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`wrote ${dest} (${size}x${size}, maskable safe zone)`);
}

async function writeSocialPreview() {
  const dest = join(PUBLIC_DIR, 'social-preview.png');
  const meta = await sharp(SOCIAL_SOURCE).metadata();
  const size = Math.min(meta.width, 1200); // never upscale past the source
  await sharp(SOCIAL_SOURCE)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`wrote ${dest} (${size}x${size})`);
}

await writeSquareIcon('icon-192.png', 192);
await writeSquareIcon('icon-512.png', 512);
await writeMaskableIcon('icon-512-maskable.png', 512);
await writeSquareIcon('apple-touch-icon.png', 180);
await writeSocialPreview();
