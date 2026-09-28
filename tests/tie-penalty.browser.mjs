import {chromium, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

await mkdir('.impeccable/review', {recursive: true});
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const save = async points => {
 await page.getByLabel('Puntaje del turno').fill(String(points));
 await page.getByRole('button', {name: `Guardar ${new Intl.NumberFormat('de-DE').format(points)}`, exact: true}).click();
};
const openRules = async () => {
 await page.getByRole('button', {name: 'Opciones de partida'}).click();
 await page.getByRole('button', {name: 'Reglas de partida'}).click();
};
const capture = async name => {
 for (const [size, width, height] of [['mobile',390,844], ['desktop',1440,900]]) {
  await page.setViewportSize({width,height});
  await page.evaluate(() => window.scrollTo(0,0));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({path: `.impeccable/review/tie-${name}-${size}.png`, fullPage: true});
 }
 await page.setViewportSize({width:390,height:844});
};
try {
 await page.goto(process.env.APP_URL || 'http://localhost:3000');
 await page.getByRole('button', {name: 'Nueva partida', exact: true}).click();
 for (const name of ['Ana', 'Bruno']) {
  await page.locator('#player-name').fill(name);
  await page.getByRole('button', {name: 'Agregar jugador', exact: true}).click();
 }
 await page.locator('.rules-menu summary').click();
 await expect(page.getByRole('checkbox', {name: /Penalización por empate/})).toBeChecked();
 await page.getByRole('checkbox', {name: /Penalización por empate/}).check();
 await expect(page.getByText('3 reglas activas', {exact: true})).toBeVisible();
 await page.getByRole('button', {name: 'Empezar partida'}).click();
 await save(1000); await save(0); await save(500);
 await page.getByLabel('Puntaje del turno').fill('1500');
 await expect(page.locator('.tie-preview')).toContainText('Empatás a Ana');
 await expect(page.locator('.tie-preview')).toContainText('−500');
 await expect(page.locator('.tie-preview')).toContainText('1.500 → 1.000 puntos');
 await expect(page.locator('.score-total strong').first()).toHaveText('1.500');
 await capture('preview');
 await page.getByRole('button', {name: 'Guardar 1.500', exact: true}).click();
 await expect(page.locator('.score-total strong').first()).toHaveText('1.000');
 await expect(page.locator('.tie-deduction')).toHaveText('−500 por empate');
 await expect(page.locator('.last-turn .tie-effects')).toContainText('Empate con Ana');
 await capture('result');
 await page.reload();
 await expect(page.locator('.tie-deduction')).toHaveText('−500 por empate');
 await page.getByRole('button', {name: 'Ver historial de Ana, 1.000 puntos'}).click();
 await expect(page.locator('.player-history-heading .muted')).toHaveText('2 turnos · 1.000 puntos');
 await expect(page.locator('.player-turn-list li').first()).toContainText('Empate provocado por Bruno');
 await expect(page.locator('.player-turn-list li').first()).toContainText('−500 por empate');
 await expect(page.locator('.is-at-risk')).toContainText('+1.000');
 await capture('history');
 await page.getByRole('button', {name: 'Cerrar historial'}).click();
 await openRules();
 await page.getByRole('checkbox', {name: /Penalización por empate/}).uncheck();
 await capture('rules');
 await page.getByRole('button', {name: 'Cerrar reglas'}).click();
 await page.reload();
 await expect(page.locator('.score-total strong').first()).toHaveText('1.000');
 await page.getByRole('button', {name: 'Opciones de partida'}).click();
 await page.getByRole('button', {name: 'Ver historial', exact: true}).click();
 await expect(page.locator('.history-entry').first()).toContainText('Empate con Ana');
 await page.getByRole('button', {name: 'Deshacer último turno'}).click();
 await expect(page.locator('.score-total strong').first()).toHaveText('1.500');
 await expect(page.locator('.score-total strong').nth(1)).toHaveText('0');
 await expect(page.getByLabel('Puntaje del turno')).toHaveValue('1500');
 await expect(page.locator('.tie-deduction')).toHaveCount(0);
 await expect(page.locator('.tie-preview')).toHaveCount(0);
 await openRules();
 await page.getByRole('checkbox', {name: /Penalización por empate/}).check();
 await page.getByRole('button', {name: 'Cerrar reglas'}).click();
 await expect(page.locator('.tie-preview')).toContainText('−500');
 await page.setViewportSize({width:320,height:640});
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await page.screenshot({path:'.impeccable/review/tie-preview-narrow.png',fullPage:true});
 assert.deepEqual(errors, []);
 console.log('Tie UI passed: enabled by default, live preview, deduction, both histories, persistence, rule changes, undo, 320/390/1440px layouts, no runtime errors.');
} finally {
 await browser.close();
}
