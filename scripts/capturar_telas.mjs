import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:5174';
const destino = 'docs/arte/screenshots';
await mkdir(destino, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${destino}/01-abertura.png` });

const comTexto = async (texto) => {
  const el = page.getByText(texto, { exact: false }).first();
  if (await el.count()) { await el.click(); await page.waitForTimeout(300); return true; }
  return false;
};
await comTexto('Começar');
await page.screenshot({ path: `${destino}/02-mapa-inicial.png` });
await comTexto('Escritório');
await page.waitForTimeout(500);
await page.screenshot({ path: `${destino}/03-escritorio.png` });
const hotspot = page.locator('button.jogo-hotspot').first();
if (await hotspot.count()) {
  await hotspot.hover();
  await page.screenshot({ path: `${destino}/04-hotspot-destacado.png` });
  await hotspot.click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${destino}/05-dialogo.png` });
  const sair = page.getByRole('button', { name: /Sair do desafio/i });
  if (await sair.count()) {
    await sair.click();
    await page.waitForTimeout(300);
    const npc = page.locator('button.jogo-hotspot').nth(1);
    if (await npc.count()) {
      await npc.click();
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${destino}/06-dialogo-npc.png` });
    }
  }
}
await browser.close();
