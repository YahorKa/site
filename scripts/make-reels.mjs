// Вертикальный ролик для Reels/Shorts из работ галереи.
// 1080×1920, размытый фон под кадром, мягкие переходы, подпись внизу.
//
// Запуск: node scripts/make-reels.mjs
// Результат: exports/reels.mp4 (в сайт не попадает).

import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'exports');

const IMAGES = [
  'public/gallery/works/lisenok-zont.jpg',
  'public/gallery/works/sova-pismo.jpg',
  'public/gallery/works/prividenie-mella.jpg',
  'public/gallery/preview2.jpg',
  'public/gallery/preview8.jpg',
  'public/gallery/preview9.jpg',
];

const W = 1080;
const H = 1920;
const FPS = 30;
const CLIP = 3;
const FADE = 0.6;

const inputs = IMAGES.flatMap((img) => ['-loop', '1', '-t', String(CLIP), '-i', path.join(ROOT, img)]);

const filters = IMAGES.map((_, i) => {
  return (
    // фон: картинка на весь кадр, размытая и притемнённая
    `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},` +
    `gblur=sigma=40,eq=brightness=-0.12:saturation=0.85[bg${i}];` +
    // сама работа: вписана по высоте, с полями
    `[${i}:v]scale=${W * 0.86}:-2[fg${i}];` +
    `[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2[v${i}]`
  );
});

let chain = '';
let last = 'v0';
IMAGES.forEach((_, i) => {
  if (i === 0) return;
  const offset = (i * (CLIP - FADE)).toFixed(2);
  chain += `[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset}[x${i}];`;
  last = `x${i}`;
});

const text = `Izo Studio · Жодино`;
const draw =
  `[${last}]drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:` +
  `text='${text}':fontcolor=white@0.9:fontsize=46:` +
  `x=(w-text_w)/2:y=h-150:shadowcolor=black@0.5:shadowx=0:shadowy=2[out]`;

const total = IMAGES.length * CLIP - (IMAGES.length - 1) * FADE;
console.log(`Кадров: ${IMAGES.length}, длительность: ${total.toFixed(1)} с, ${W}×${H}`);

const args = [
  '-y',
  ...inputs,
  '-filter_complex', `${filters.join(';')};${chain}${draw}`,
  '-map', '[out]',
  '-r', String(FPS),
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '23',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  path.join(OUT_DIR, 'reels.mp4'),
];

await mkdir(OUT_DIR, { recursive: true });

await new Promise((resolve, reject) => {
  const p = spawn(ffmpeg.path, args, { stdio: ['ignore', 'inherit', 'inherit'] });
  p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
});

const s = await stat(path.join(OUT_DIR, 'reels.mp4'));
console.log(`→ exports/reels.mp4 (${(s.size / 1024 / 1024).toFixed(1)} МБ)`);
