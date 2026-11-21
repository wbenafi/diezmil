// Run against a production server: `npm run build && npm start`, then `APP_URL=http://localhost:3000 npm run test:pwa`.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.APP_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto(base);
await page.getByRole('button', { name: 'Nueva partida', exact: true }).waitFor();

// Manifest is linked, valid and every icon it lists resolves.
const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
const manifest = await (await page.request.get(new URL(manifestHref, base).href)).json();
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some((i) => i.sizes === '192x192'), 'needs a 192px icon');
assert.ok(manifest.icons.some((i) => i.sizes === '512x512'), 'needs a 512px icon');
assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'), 'needs a maskable icon');
for (const icon of manifest.icons) assert.equal((await page.request.get(new URL(icon.src, base).href)).status(), 200, icon.src);
assert.ok(await page.locator('link[rel="apple-touch-icon"]').count(), 'iOS home screen icon missing');

// Service worker installs and takes control.
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 10000 }).catch(async () => { await page.reload(); });
await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

// The app opens and the hero image renders with no network at all.
await context.setOffline(true);
await page.reload();
await page.getByRole('button', { name: 'Nueva partida', exact: true }).waitFor();
await page.waitForFunction(() => { const img = document.querySelector('.poker-dice-hero'); return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0; });
const inter = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.family.includes('Inter') && f.status === 'loaded'); });
assert.equal(inter, true, 'Inter should load offline');
await browser.close();
console.log('PWA checks passed');
