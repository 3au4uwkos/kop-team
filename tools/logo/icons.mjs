// ================================================================
// icons.mjs — PNG-иконки из SVG эмблемы (после make_logo.py):
//   node tools/logo/icons.mjs
// favicon-16/32 и apple-touch-icon — из favicon.svg; для iOS фон
// заливается, прозрачные углы там выглядят как дыры.
//
// Для поисковиков (иконка рядом с сайтом в выдаче):
//   favicon-192 — Google берёт иконки со стороной, кратной 48 px;
//   favicon-120 — размер, который рекомендует Яндекс;
//   /favicon.ico (16+32+48) — его по умолчанию запрашивают Яндекс
//   и другие роботы, даже без <link rel="icon">.
// ================================================================
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ICONS = join(ROOT, 'public/assets/icons');
const fav = join(ICONS, 'favicon.svg');

for (const [size, name] of [[16, 'favicon-16.png'], [32, 'favicon-32.png']]) {
    await sharp(fav, { density: 384 }).resize(size, size).png().toFile(join(ICONS, name));
}
for (const [size, name] of [[120, 'favicon-120.png'], [192, 'favicon-192.png']]) {
    await sharp(fav, { density: 768 }).resize(size, size).png().toFile(join(ICONS, name));
}

// ICO с PNG внутри (поддерживается всеми браузерами с Vista/IE9):
// заголовок 6 байт, по 16 байт на каждую картинку, затем сами PNG.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((size) =>
    sharp(fav, { density: 384 }).resize(size, size).png().toBuffer()));
const head = Buffer.alloc(6 + 16 * pngs.length);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(pngs.length, 4);
let offset = head.length;
pngs.forEach((png, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(icoSizes[i], e);
    head.writeUInt8(icoSizes[i], e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(png.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += png.length;
});
writeFileSync(join(ROOT, 'public/favicon.ico'), Buffer.concat([head, ...pngs]));

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
