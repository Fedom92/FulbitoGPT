// One-off placeholder PWA icon generator. No npm dependencies — only Node built-ins.
// Run manually: node scripts/generate-icons.mjs
// Safe to delete once real branding art replaces these placeholders.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

const PITCH_GREEN = [0x1b, 0x7a, 0x3b];
const PLAYER_ORANGE = [0xf4, 0x80, 0x1e];

function crc32Buffer(buf) {
  return crc32(buf) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32Buffer(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }
  const idat = chunk('IDAT', deflateSync(raw));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function circlePixel(x, y, size, radiusRatio, opaqueBackground = true) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * radiusRatio;
  const dx = x + 0.5 - cx;
  const dy = y + 0.5 - cy;
  if (dx * dx + dy * dy <= r * r) return PLAYER_ORANGE;
  return opaqueBackground ? PITCH_GREEN : PITCH_GREEN;
}

function writeIcon(name, size, radiusRatio) {
  const buf = encodePng(size, size, (x, y) => circlePixel(x, y, size, radiusRatio));
  const path = join(PUBLIC_DIR, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`wrote ${path} (${size}x${size})`);
}

writeIcon('icons/icon-192.png', 192, 0.42);
writeIcon('icons/icon-512.png', 512, 0.42);
writeIcon('icons/icon-512-maskable.png', 512, 0.32); // extra padding for maskable safe zone
writeIcon('icons/apple-touch-icon.png', 180, 0.42);
writeIcon('favicon.png', 48, 0.42);
