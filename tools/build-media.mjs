// ================================================================
// build-media.mjs — сборка фото и видео сайта из выгрузки VK.
//
//   npm run media                 # всё по tools/media.config.mjs
//   npm run media -- camps        # только ключи, начинающиеся с camps
//   VK_MEDIA=D:/archive npm run media
//
// Нужны sharp (ставится вместе с Astro) и ffmpeg в PATH.
// Метаданные (EXIF, геометки) из фото не переносятся: sharp пишет
// файлы без них.
//
// Обработка — одна «плёнка» на весь сайт, чтобы кадры с разных
// телефонов смотрелись одной серией:
//   * тусклые кадры растягиваются по яркости (normalise);
//   * лёгкий контраст и насыщенность;
//   * резкость после уменьшения — сильнее для мягких исходников;
//   * кадр из видео — самый резкий в окне ±0,4 с вокруг `t`
//     (смаз движения — главная беда стоп-кадров), с шумоподавлением.
// ================================================================
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { IMAGES, VIDEOS } from './media.config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, process.env.VK_MEDIA ?? 'vk-media');
const IMG_OUT = join(ROOT, 'public/assets/img');
const VID_OUT = join(ROOT, 'public/assets/video');
const META_PATH = join(ROOT, 'src/data/media.json');

if (!existsSync(SRC)) {
    console.error(`Нет каталога с исходниками: ${SRC}`);
    process.exit(1);
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/** Резкость по Лапласиану на приведённом размере — чтобы сравнивать разные исходники. */
async function sharpness(input) {
    const s = await sharp(input).rotate().resize({ width: 720 }).stats();
    return s.sharpness;
}

/**
 * Кадр видео в PNG. ffmpeg сам учитывает поворот из метаданных.
 * Берём кадры с шагом 0,1 с в окне ±window вокруг t и оставляем самый
 * резкий. Узкое окно — когда важна поза (лицо в кадре), а не резкость.
 */
async function videoFrame(file, t, window = 0.4) {
    let best = null;
    const n = Math.round(window * 10);
    for (let i = -n; i <= n; i++) {
        const at = Math.max(0, t + i * 0.1);
        const png = execFileSync('ffmpeg', [
            '-v', 'error', '-ss', at.toFixed(2), '-i', file,
            '-frames:v', '1', '-vf', 'hqdn3d=2:1.5:3:3',
            '-f', 'image2pipe', '-vcodec', 'png', '-',
        ], { maxBuffer: 64 * 1024 * 1024 });
        const s = await sharpness(png);
        if (!best || s > best.s) best = { png, s };
    }
    return best.png;
}

/** Самый большой кадр нужных пропорций вокруг точки (fx, fy); zoom > 1 — крупнее. */
function cropBox(w, h, [rw, rh], fx = 0.5, fy = 0.5, zoom = 1) {
    let cw = w;
    let ch = Math.round(w * rh / rw);
    if (ch > h) {
        ch = h;
        cw = Math.round(h * rw / rh);
    }
    cw = Math.round(cw / zoom);
    ch = Math.round(ch / zoom);
    return {
        left: Math.round(clamp(fx * w - cw / 2, 0, w - cw)),
        top: Math.round(clamp(fy * h - ch / 2, 0, h - ch)),
        width: cw,
        height: ch,
    };
}

/** Ширины для srcset: исходник не растягиваем, но и не теряем его максимум. */
function targetWidths(widths, cropW) {
    const ws = widths.filter((w) => w <= cropW);
    const max = Math.max(...widths);
    if (cropW < max && (!ws.length || cropW - ws[ws.length - 1] > 40)) ws.push(cropW);
    return ws;
}

/** Единая «плёнка». Мягким кадрам резкости больше, чётким — почти ничего. */
function grade(img, { soft, stretch }) {
    let g = img;
    if (stretch) g = g.normalise({ lower: 0.5, upper: 99.6 });
    return g
        .modulate({ saturation: 1.07 })
        .linear(1.05, -6)
        .sharpen({ sigma: soft ? 1.1 : 0.6, m1: soft ? 1.2 : 0.6, m2: 2.5 });
}

async function buildImage(item) {
    const input = item.video
        ? await videoFrame(join(SRC, item.video), item.t, item.window)
        : join(SRC, item.src);
    // rotate() без аргументов разворачивает по EXIF — дальше работаем
    // уже в «правильных» пикселях.
    const { data, info } = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    const stats = await sharp(data).stats();
    // Тусклый кадр: яркость кучкуется в середине — растягиваем.
    const spread = stats.channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0) / 3;
    const stretch = item.stretch ?? spread < 52;
    const soft = item.soft ?? (Boolean(item.video) || (await sharpness(data)) < 2.5);

    const box = cropBox(info.width, info.height, item.ratio, item.fx, item.fy, item.zoom);
    const widths = targetWidths(item.widths, box.width);
    const width = widths[widths.length - 1];
    const base = join(IMG_OUT, item.key);
    mkdirSync(dirname(base), { recursive: true });

    for (const w of widths) {
        const h = Math.round(w * item.ratio[1] / item.ratio[0]);
        const img = grade(
            sharp(data).extract(box).resize(w, h, { fit: 'fill', kernel: 'lanczos3' }),
            { soft, stretch },
        );
        const jobs = [
            img.clone().avif({ quality: item.quality ?? 48, effort: 6 }).toFile(`${base}-${w}.avif`),
            img.clone().webp({ quality: 74, effort: 5 }).toFile(`${base}-${w}.webp`),
        ];
        // JPEG — только запасной src для браузеров без WebP/AVIF: одна,
        // самая малая ширина, чтобы не раздувать репозиторий.
        if (w === widths[0]) {
            jobs.push(img.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${base}-${w}.jpg`));
        }
        await Promise.all(jobs);
    }
    return {
        widths,
        width,
        height: Math.round(width * item.ratio[1] / item.ratio[0]),
        fallback: widths[0],
    };
}

function buildVideo(v) {
    const [rw, rh] = v.ratio;
    const args = ['-v', 'error', '-y'];
    const chains = [];
    v.clips.forEach((c, i) => {
        args.push('-ss', String(c.from), '-to', String(c.to), '-i', join(SRC, c.src));
        const fx = c.fx ?? 0.5;
        const fy = c.fy ?? 0.5;
        const zoom = c.zoom ?? 1;
        chains.push(
            `[${i}:v]crop=w='min(iw,ih*${rw}/${rh})/${zoom}':h='ow*${rh}/${rw}'` +
            `:x='max(0,min(iw-ow,iw*${fx}-ow/2))':y='max(0,min(ih-oh,ih*${fy}-oh/2))',` +
            `scale=${v.width}:-2:flags=lanczos,fps=30,setsar=1,` +
            // Та же «плёнка», что у фото: шум, контраст, цвет, резкость.
            'hqdn3d=1.5:1.5:4:4,eq=contrast=1.05:saturation=1.08,unsharp=5:5:0.5' +
            (v.gray ? ',hue=s=0' : '') + `[v${i}]`,
        );
    });
    const n = v.clips.length;
    const filter = n > 1
        ? `${chains.join(';')};${v.clips.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0[out]`
        : chains[0].replace('[v0]', '[out]');
    mkdirSync(VID_OUT, { recursive: true });
    execFileSync('ffmpeg', [
        ...args,
        '-filter_complex', filter, '-map', '[out]', '-an',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', String(v.crf ?? 26),
        '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        join(VID_OUT, `${v.out}.mp4`),
    ]);
}

function writeSources() {
    const rows = [
        ...IMAGES.map((i) => `| \`/assets/img/${i.key}-*\` | ${i.post} | \`${i.src ?? `${i.video} @ ${i.t} c`}\` |`),
        ...VIDEOS.map((v) => `| \`/assets/video/${v.out}.mp4\` | ${v.post} | ${v.clips.map((c) => `\`${c.src}\` ${c.from}–${c.to} c`).join('<br>')} |`),
    ];
    const md = [
        '# Откуда взяты фото и видео',
        '',
        'Файл собирается командой `npm run media` из `tools/media.config.mjs` —',
        'руками не правится. Кадры взяты из архива `vk-media/` (в репозиторий',
        'не входит): посты со страницы тренера во ВКонтакте, выгрузка его',
        'Telegram (`photo_N@…`) и исходники роликов с телефона (`IMG_….MOV`).',
        '',
        'Все кадры проходят одну обработку (`tools/build-media.mjs`): кадр из',
        'видео — самый резкий в окне ±0,4 с, шумоподавление, выравнивание',
        'яркости у тусклых снимков, лёгкие контраст, цвет и резкость.',
        '',
        'Перед публикацией убедитесь, что есть согласие на съёмку людей в кадре,',
        'в первую очередь — родителей детей и спортсменов из «Легенд ковра».',
        '',
        '| Файл на сайте | Что это | Исходник в `vk-media/` |',
        '|---|---|---|',
        ...rows,
        '',
    ].join('\n');
    writeFileSync(join(ROOT, 'docs/media-sources.md'), md);
}

// Необязательный фильтр по началу ключа: пересобрать только часть кадров.
const only = process.argv[2];
const meta = only && existsSync(META_PATH) ? JSON.parse(readFileSync(META_PATH, 'utf8')) : {};
for (const item of IMAGES) {
    if (only && !item.key.startsWith(only)) continue;
    meta[item.key] = await buildImage(item);
    console.log(`img   ${item.key}  ${meta[item.key].widths.join(', ')}`);
}
for (const v of VIDEOS) {
    if (only && !v.out.startsWith(only)) continue;
    buildVideo(v);
    console.log(`video ${v.out}`);
}
// В media.json — только то, что сейчас есть в конфиге.
const sorted = Object.fromEntries(
    Object.entries(meta)
        .filter(([k]) => IMAGES.some((i) => i.key === k))
        .sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(META_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
writeSources();
