// ================================================================
// icons.mjs — PNG-иконки из SVG эмблемы (после make_logo.py):
//   node tools/logo/icons.mjs
// favicon-16/32 и apple-touch-icon — из favicon.svg; для iOS фон
// заливается, прозрачные углы там выглядят как дыры.
// ================================================================
import sharp from 'sharp';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ICONS = join(ROOT, 'public/assets/icons');
const fav = join(ICONS, 'favicon.svg');

for (const [size, name] of [[16, 'favicon-16.png'], [32, 'favicon-32.png']]) {
    await sharp(fav, { density: 384 }).resize(size, size).png().toFile(join(ICONS, name));
}
await sharp(fav, { density: 768 })
    .resize(180, 180)
    .flatten({ background: '#C8102E' })
    .png()
    .toFile(join(ICONS, 'apple-touch-icon.png'));
// Белая эмблема для OG-картинки (её дорисовывает tools/og/make_og.py).
await sharp(join(ROOT, 'public/assets/brand/kopteam-emblem-white.svg'), { density: 300 })
    .resize(220, 220)
    .png()
    .toFile(join(ROOT, 'tools/og/emblem-white.png'));
console.log('ok');
