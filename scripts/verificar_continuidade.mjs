/** O vídeo revela saltos que uma imagem isolada não consegue denunciar. */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const destino = 'docs/arte/a9-continuidade';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: destino, size: { width: 1920, height: 1080 } } });
const pagina = await contexto.newPage();
const erros = [];
pagina.on('pageerror', e => erros.push(e.message));
const acao = (nome, argumento) => pagina.evaluate(async ([nome, argumento]) => (await import(window.storeAtual)).useJogo.getState()[nome](argumento), [nome, argumento]);
const estado = dados => pagina.evaluate(async dados => (await import(window.storeAtual)).useJogo.setState(dados), dados);
const foto = async nome => { await pagina.screenshot({ path: `${destino}/${nome}.png` }); };
async function preparar(bloco, lugar) {
  await acao('reiniciar'); await acao('entrarNoBloco', bloco);
  await estado({ reflexaoVista: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true } });
  await acao('entrarNoLugar', lugar); await acao('fecharNarracao');
}
async function terminar() {
  // O clique inicia a caminhada da Ana; o diálogo só existe após a chegada.
  await pagina.getByRole('button', { name: /^Avançar diálogo/ }).waitFor();
  while (await pagina.evaluate(async () => Boolean((await import(window.storeAtual)).useJogo.getState().dialogoAtivo))) {
    await pagina.getByRole('button', { name: /^Avançar diálogo/ }).click();
  }
}
try {
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await pagina.evaluate(async () => { window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1]; });
  await pagina.getByRole('button', { name: /Começar/ }).click();
  await preparar(5, 'outra-area');
  const bianca = pagina.locator('[data-presenca-npc="5:outra-area:bianca"]');
  await pagina.evaluate(() => { window.biancaOriginal = document.querySelector('[data-presenca-npc="5:outra-area:bianca"]'); });
  await foto('01-b5-inicial');
  await pagina.getByRole('button', { name: /^Interagir com Bianca/ }).click(); await terminar();
  await foto('02-b5-depois-primeira-conversa');
  const antes = await bianca.boundingBox();
  for (const nome of ['Caderno dela', 'Grade do próximo semestre']) {
    await pagina.getByRole('button', { name: `Interagir com ${nome}`, exact: true }).click();
    await pagina.waitForTimeout(1500); await acao('fecharNarracao');
    assert.equal(await bianca.getAttribute('data-visivel'), 'true');
    assert.deepEqual(await bianca.boundingBox(), antes);
  }
  await foto('03-b5-depois-objetos');
  await pagina.getByRole('button', { name: /^Interagir com Bianca/ }).click();
  await pagina.waitForFunction(() => document.querySelector('[data-presenca-npc="5:outra-area:bianca"]')?.getAttribute('data-movendo') === 'true');
  await pagina.waitForTimeout(450); await foto('04-b5-caminhando');
  const durante = await bianca.boundingBox();
  assert.ok(durante.x > antes.x && durante.x < antes.x + (44 - 30) / 100 * 1920);
  assert.equal(await pagina.getByRole('button', { name: /^Avançar diálogo/ }).count(), 0);
  await pagina.getByRole('button', { name: /^Avançar diálogo/ }).waitFor();
  assert.equal(await pagina.evaluate(() => window.biancaOriginal === document.querySelector('[data-presenca-npc="5:outra-area:bianca"]')), true);
  await foto('05-b5-segunda-conversa'); await terminar();
  const depois = await bianca.boundingBox();
  assert.ok(depois.x > antes.x);
  await acao('voltarAoMapa'); await acao('entrarNoLugar', 'outra-area'); await acao('fecharNarracao');
  assert.deepEqual(await bianca.boundingBox(), depois); await foto('06-b5-revisita');

  await preparar(4, 'sala-reunioes');
  const claudia = pagina.locator('[data-presenca-npc="4:sala-reunioes:claudia"]');
  assert.equal(await claudia.getAttribute('data-visivel'), 'true'); await foto('07-b4-elenco-inicial');
  await pagina.getByRole('button', { name: /^Interagir com Marcos/ }).click(); await terminar();
  await pagina.waitForTimeout(450); await foto('08-b4-marcos-saindo');
  await pagina.waitForTimeout(1200);
  assert.equal(await pagina.locator('[data-presenca-npc="4:sala-reunioes:marcos"]').getAttribute('data-visivel'), 'false');
  await estado({ hotspotsFeitos: ['b4-marcos', 'b4-plateia', 'b4-entrega'], dialogosConcluidos: ['b4-preparacao', 'b4-apresentacao'], pausaBloco4: 'concluida' });
  await pagina.waitForTimeout(1400);
  await pagina.getByRole('button', { name: /^Interagir com Cláudia/ }).click();
  await pagina.getByRole('button', { name: /^Avançar diálogo/ }).waitFor();
  assert.equal(await claudia.getAttribute('data-visivel'), 'true'); await foto('09-b4-claudia-falando'); await terminar();
  await pagina.waitForTimeout(500); await foto('10-b4-claudia-corredor');
  await pagina.waitForTimeout(1400); await foto('11-b4-claudia-saindo');
  await pagina.waitForTimeout(1300);
  assert.equal(await claudia.getAttribute('data-visivel'), 'false');
  await acao('fecharItemRecebido');
  await acao('clicarHotspot', 'b4-claudia');
  assert.equal(await pagina.getByRole('button', { name: /^Avançar diálogo/ }).count(), 0);
  await pagina.waitForTimeout(500); await foto('12-b4-claudia-retornando');
  await pagina.getByRole('button', { name: /^Avançar diálogo/ }).waitFor();
  await foto('13-b4-releitura');
  assert.deepEqual(erros, []);
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ erros, continuidadeBianca: true, revisita: true, claudiaPresenteNaFala: true, entradaESaida: true }, null, 2));
  console.log('Continuidade, movimento intermediário, revisita e espera pelo locutor conferidos no navegador.');
} finally {
  const video = pagina.video(); await contexto.close();
  if (video) await video.saveAs(`${destino}/continuidade.webm`);
  await navegador.close();
}
