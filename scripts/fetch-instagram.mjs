// Собирает фото и подписи постов Instagram в src/data/instagram.json
// и складывает картинки в public/gallery/ig/.
//
// Запуск: node scripts/fetch-instagram.mjs
// Список ссылок: scripts/instagram-posts.txt

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_FILE = path.join(ROOT, 'scripts/instagram-posts.txt');
const OUT_IMG_DIR = path.join(ROOT, 'public/gallery/ig');
const OUT_JSON = path.join(ROOT, 'src/data/instagram.json');

const UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

const MONTHS_RU = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
};

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function meta(html, property) {
  const re = new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? decodeEntities(m[1]) : null;
}

function shortcode(url) {
  const m = url.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

/** «4 likes, 0 comments - izo_studia_zhodino on August 25, 2025: "текст..."» */
function parseDescription(desc) {
  if (!desc) return { caption: '', date: '' };
  let date = '';
  const en = desc.match(/on (\w+) (\d{1,2}), (\d{4})/);
  const ru = desc.match(/(\d{1,2}) (\w+) (\d{4})/);
  if (en) {
    const [, month, day, year] = en;
    const mm = MONTHS[month] ?? 0;
    date = `${year}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } else if (ru) {
    const [, day, month, year] = ru;
    const mm = MONTHS_RU[month.toLowerCase()] ?? 0;
    if (mm) date = `${year}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const colon = desc.indexOf(': "');
  let caption = colon >= 0 ? desc.slice(colon + 3) : '';
  caption = caption
    .replace(/#[^\s#]+/g, ' ')   // убираем хештеги
    .replace(/[\s"„“”«»]+$/g, '') // хвостовые кавычки и пробелы
    .replace(/\s+/g, ' ')
    .replace(/["'»«\s]+$/g, '')
    .replace(/\.+$/g, '')
    .trim();
  if (caption.length > 200) caption = caption.slice(0, 197).trimEnd() + '…';
  return { caption, date };
}

async function fetchPost(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const image = meta(html, 'og:image');
  if (!image) throw new Error('нет og:image');
  const { caption, date } = parseDescription(meta(html, 'og:description'));

  return { image, caption, date };
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

const raw = await readFile(POSTS_FILE, 'utf8');
const urls = raw
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

await mkdir(OUT_IMG_DIR, { recursive: true });

const items = [];
for (const [i, url] of urls.entries()) {
  const code = shortcode(url);
  if (!code) {
    console.warn(`skip (не похоже на ссылку поста): ${url}`);
    continue;
  }

  try {
    const { image, caption, date } = await fetchPost(url);
    const ext = image.includes('.webp') ? 'webp' : 'jpg';
    const file = `${code}.${ext}`;
    const dest = path.join(OUT_IMG_DIR, file);

    let size = 0;
    if (!existsSync(dest)) size = await downloadImage(image, dest);

    items.push({
      src: `/gallery/ig/${file}`,
      href: `https://www.instagram.com/p/${code}/`,
      caption,
      date,
    });
    console.log(
      `${String(i + 1).padStart(2)}. ${code} ✓ ${date || '—'} ${caption ? caption.slice(0, 60) : '(без подписи)'}${size ? ` [${Math.round(size / 1024)} КБ]` : ''}`,
    );
  } catch (err) {
    console.warn(`${String(i + 1).padStart(2)}. ${code} ✗ ${err.message}`);
  }
}

if (!items.length) {
  console.error('Ничего не собрано — проверьте ссылки.');
  process.exit(1);
}

await writeFile(OUT_JSON, JSON.stringify(items, null, 2) + '\n');
items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
console.log(`\nГотово: ${items.length} работ → src/data/instagram.json`);
