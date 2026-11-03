import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const routes = ['/', '/about', '/services', '/gallery', '/contacts', '/zayavka', '/spasibo'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console: ${m.text()}`);
});
page.on('response', (r) => {
  if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
});

for (const route of routes) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 20000 }).catch((e) => problems.push(`goto ${route}: ${e.message}`));
  await page.waitForTimeout(400);
}

// mobile menu toggle
await page.goto(BASE + '/', { waitUntil: 'load' });
const menu = page.locator('#mobile-menu');
const before = await menu.isVisible();
await page.locator('#menu-toggle').click();
const after = await menu.isVisible();
console.log('mobile menu: before=', before, 'after=', after);

// form validation
await page.goto(BASE + '/zayavka', { waitUntil: 'load' });
await page.locator('button[type="submit"]').click();
const invalid = await page.evaluate(() => document.querySelectorAll('form :invalid').length);
console.log('form invalid fields on empty submit:', invalid);

console.log('problems:', problems.length ? [...new Set(problems)] : 'none');
await browser.close();
