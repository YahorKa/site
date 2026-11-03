// Собирает зацикленный ролик для hero-блока: медленный наезд на каждую работу
// и плавные переходы. Последний кадр = первый, поэтому петля без рывка.
//
// Запуск: node scripts/make-hero-video.mjs

import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/video');

// Порядок показа. Первый кадр повторяется в конце — для бесшовной петли.
const IMAGES = [
  'public/gallery/works/lisenok-zont.jpg',
  'public/gallery/preview2.jpg',
  'public/gallery/works/sova-pismo.jpg',
];

const CLIP_SECONDS = Number(process.env.CLIP ?? 3.5);
const FADE = 0.7;
const FPS = 24;
const W = Number(process.env.W ?? 896);
const H = Number(process.env.H ?? 1120);
const CRF = process.env.CRF ?? '28';
const SKIP_WEBM = process.env.SKIP_WEBM !== '0';

const clips = [...IMAGES, IMAGES[0]];
const framesPerClip = CLIP_SECONDS * FPS;

const inputs = clips.flatMap((img) => ['-loop', '1', '-t', String(CLIP_SECONDS), '-i', path.join(ROOT, img)]);

// Без наезда камеры: zoompan даёт дрожание пикселей и раздувает файл в 30 раз.
const filters = clips.map((_, i) => {
  return (
    `[${i}:v]scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,` +
    `crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p[v${i}]`
  );
});

// Цепочка переходов: offset растёт на длительность клипа минус переход.
let chain = '';
let last = 'v0';
clips.forEach((_, i) => {
  if (i === 0) return;
  const offset = (i * (CLIP_SECONDS - FADE)).toFixed(2);
  const out = `x${i}`;
  chain += `[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset}[${out}];`;
  last = out;
});

const filterGraph = `${filters.join(';')};${chain}`.replace(/;$/, '');

const run = (args, label) =>
  new Promise((resolve, reject) => {
    const p = spawn(ffmpeg.path, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${label}: ffmpeg exit ${code}`))));
  });

await mkdir(OUT_DIR, { recursive: true });

const total = (clips.length * CLIP_SECONDS - (clips.length - 1) * FADE).toFixed(2);
console.log(`Клипов: ${clips.length}, длительность: ${total} с, ${W}×${H} @ ${FPS}fps`);

// MP4 (H.264) — основной формат
await run(
  [
    '-y',
    ...inputs,
    '-filter_complex', filterGraph,
    '-map', `[${last}]`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', CRF,
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    path.join(OUT_DIR, 'hero.mp4'),
  ],
  'mp4',
);
console.log('→ public/video/hero.mp4');

// WebM (VP9) — легче, для поддерживающих браузеров
if (!SKIP_WEBM) await run(
  [
    '-y',
    ...inputs,
    '-filter_complex', filterGraph,
    '-map', `[${last}]`,
    '-c:v', 'libvpx-vp9',
    '-crf', '36',
    '-b:v', '0',
    '-row-mt', '1',
    '-an',
    path.join(OUT_DIR, 'hero.webm'),
  ],
  'webm',
);
console.log('→ public/video/hero.webm');

// Постер — первый кадр
await run(
  ['-y', '-i', path.join(OUT_DIR, 'hero.mp4'), '-vframes', '1', '-q:v', '3', path.join(OUT_DIR, 'hero-poster.jpg')],
  'poster',
);
console.log('→ public/video/hero-poster.jpg');

for (const f of ['hero.mp4', ...(SKIP_WEBM ? [] : ['hero.webm']), 'hero-poster.jpg']) {
  const s = await stat(path.join(OUT_DIR, f));
  console.log(`   ${f}: ${(s.size / 1024 / 1024).toFixed(2)} МБ`);
}
