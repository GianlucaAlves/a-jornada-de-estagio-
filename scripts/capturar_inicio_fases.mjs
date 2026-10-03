import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:5174';
const destino = 'docs/arte/screenshots';
await mkdir(destino, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: 'networkidle' });
const comTexto = async (texto) => {
  const el = page.getByText(texto, { exact: false }).first();
  if (await el.count()) { await el.click(); await page.waitForTimeout(500); return true; }
  return false;
};
await comTexto(/Come./i);
const chave = 'apresentacao-jogo/progresso';
const salvo = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), chave);
const fases = [
  [1, 'escritorio', '01-inicio-fase-1-escritorio.png'],
  [2, 'cafezinho', '02-inicio-fase-2-cafezinho.png'],
  [3, 'linha-producao', '03-inicio-fase-3-linha-producao.png'],
  [4, 'sala-reunioes', '04-inicio-fase-4-reuniao.png'],
  [5, 'outra-area', '05-inicio-fase-5-outra-area.png'],
  [6, 'cafezinho', '06-inicio-fase-6-cafezinho.png'],
];
for (const [bloco, lugarId, arquivo] of fases) {
  const estado = structuredClone(salvo);
  estado.bloco = bloco;
  estado.tela = { tipo: 'cena', lugarId };
  estado.nomesRevelados = [...new Set([...(estado.nomesRevelados ?? []), lugarId])];
  await page.evaluate(([k, valor]) => localStorage.setItem(k, JSON.stringify(valor)), [chave, estado]);
  await page.reload({ waitUntil: 'networkidle' });
  const continuar = page.getByRole('button', { name: /Continuar/i });
  if (await continuar.count()) await continuar.click();
  else if (await page.getByRole('button', { name: /Come./i }).count()) await page.getByRole('button', { name: /Come./i }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${destino}/${arquivo}` });
}
await browser.close();

