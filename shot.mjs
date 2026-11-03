import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const out = 'shots';

const pages = [
  { path: '/', name: 'home', w: 1440, h: 900, full: true },
  { path: '/', name: 'home-mobile', w: 390, h: 844, full: true },
  { path: '/gallery', name: 'gallery', w: 1440, h: 900, full: true },
  { path: '/zayavka', name: 'zayavka', w: 1440, h: 900, full: false },
  { path: '/contacts', name: 'contacts', w: 1440, h: 900, full: true },
  { path: '/about', name: 'about', w: 1440, h: 900, full: true },
  { path: '/services', name: 'services', w: 1440, h: 900, full: true },
];

const browser = await chromium.launch();
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1 });
  await page.route('**yandex**', (route) => route.abort());
  await page.goto(BASE + p.path, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${p.name}.png`, fullPage: p.full });
  console.log('ok', p.name);
  await page.close();
}
await browser.close();
