/** Registra os dois quadros do posto com câmera, elenco e HUD reais. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = 'docs/arte/v2-4/posto';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
pagina.on('pageerror', erro => erros.push(erro.message));
try {
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await pagina.evaluate(async () => {
    window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
  });
  await pagina.getByRole('button', { name: /Começar/ }).click();
  for (const [bloco, lugar, recorte] of [[1, 'escritorio', { x: 1420, y: 440, width: 260, height: 220 }], [5, 'outra-area', { x: 1230, y: 320, width: 290, height: 240 }]]) {
    await pagina.evaluate(async ([bloco, lugar]) => {
      const jogo = (await import(window.storeAtual)).useJogo;
      jogo.getState().reiniciar();
      jogo.getState().entrarNoBloco(bloco);
      jogo.setState({ reflexaoVista: { [bloco]: true } });
      jogo.getState().entrarNoLugar(lugar);
    }, [bloco, lugar]);
    const posto = pagina.locator(`[style*="${lugar}-0-idle.png"]`);
    await posto.waitFor();
    await pagina.waitForTimeout(1200);
    await pagina.mouse.move(20, 20);
    for (let quadro = 0; quadro < 2; quadro++) {
      await posto.evaluate((e, quadro) => {
        e.style.animation = 'none';
        e.style.backgroundPositionX = `${-quadro * e.getBoundingClientRect().width}px`;
      }, quadro);
      await pagina.screenshot({ path: `${destino}/${lugar}-${quadro}.png` });
      await pagina.screenshot({ path: `${destino}/${lugar}-${quadro}-detalhe.png`, clip: recorte });
    }
  }
  assert.deepEqual(erros, []);
  console.log('Postos do escritório e da outra área capturados com os dois quadros, elenco e HUD.');
} finally {
  await navegador.close();
}
