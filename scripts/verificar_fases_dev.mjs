/** Confere o atalho e as seis entradas com o HUD real no navegador. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
pagina.on('pageerror', erro => erros.push(erro.message));
try {
  await mkdir('docs/arte/v2-4/fases-dev', { recursive: true });
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await pagina.keyboard.press('F8');
  const painel = pagina.getByRole('dialog', { name: 'Fases para desenvolvimento' });
  await painel.waitFor();
  await pagina.screenshot({ path: 'docs/arte/v2-4/fases-dev/seletor.png' });
  for (let fase = 1; fase <= 6; fase++) {
    if (fase > 1) await pagina.keyboard.press('F8');
    await painel.getByRole('button', { name: new RegExp(`^${fase} ·`) }).click();
    await pagina.getByText(`Bloco ${fase} ·`, { exact: false }).waitFor();
    await pagina.getByRole('button', { name: 'Reabrir reflexão de Ana' }).waitFor();
  }
  await pagina.getByRole('button', { name: 'Trocar fase para teste (F8)' }).click();
  await pagina.keyboard.press('Escape');
  assert.equal(await painel.count(), 0);
  assert.deepEqual(erros, []);
  console.log('F8, seis fases, entrada pela abertura, botão e Escape aprovados.');
} finally {
  await navegador.close();
}
