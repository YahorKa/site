// Размеры картинок для атрибутов width/height: без них браузер не знает
// пропорции до загрузки и вёрстка «прыгает» (CLS).
//
// Читаем заголовки файлов напрямую, без внешних библиотек: сборка идёт на Netlify,
// и лишняя зависимость там ни к чему. Поддерживаем JPEG, PNG, WebP и GIF —
// этого хватает для галереи. Любая ошибка не должна ломать сборку: возвращаем null.

import { readFileSync } from 'node:fs';

export type Size = { width: number; height: number };

function pngSize(buf: Buffer): Size | null {
  // Подпись PNG + IHDR: ширина и высота лежат в первых 24 байтах.
  if (buf.length < 24) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf: Buffer): Size | null {
  if (buf.length < 10) return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function webpSize(buf: Buffer): Size | null {
  if (buf.length < 30) return null;
  const kind = buf.toString('ascii', 12, 16);

  if (kind === 'VP8 ') {
    // Простой VP8: размеры в заголовке кадра.
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (kind === 'VP8L') {
    // VP8L: 14 бит на ширину и высоту, упакованы в 4 байта.
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === 'VP8X') {
    // Расширенный формат: 24 бита на каждую сторону, минус единица.
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  return null;
}

function jpegSize(buf: Buffer): Size | null {
  // Идём по маркерам сегментов, пока не встретим SOF (кадр с размерами).
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0..SOF15, кроме DHT (C4), JPG (C8) и DAC (CC) — они не содержат размеров.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    // Маркеры без длины сегмента.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      i += 2;
      continue;
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

export function readImageSize(path: string): Size | null {
  try {
    const buf = readFileSync(path);
    if (buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47) return pngSize(buf);
    if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
    if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      return webpSize(buf);
    }
    if (buf.length > 6 && buf.toString('ascii', 0, 3) === 'GIF') return gifSize(buf);
    return null;
  } catch {
    return null;
  }
}