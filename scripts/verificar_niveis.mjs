import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = 'docs/arte/a13-niveis';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: destino, size: { width: 1920, height: 1080 } } });
const pagina = await contexto.newPage();
const erros = [];
pagina.on('pageerror', e => erros.push(e.message));
const acao = (nome, argumento) => pagina.evaluate(async ([nome, argumento]) => (await import(window.storeAtual)).useJogo.getState()[nome](argumento), [nome, argumento]);
const estado = dados => pagina.evaluate(async dados => (await import(window.storeAtual)).useJogo.setState(dados), dados);
const foto = nome => pagina.screenshot({ path: `${destino}/${nome}.png` });
const medidas = [];
async function medir(nome) {
  await pagina.waitForTimeout(850);
  const hud = pagina.getByRole('complementary', { name: 'Nível de Ana' });
  const caixa = await hud.boundingBox();
  const alvos = await pagina.locator('button').evaluateAll(botoes => botoes.filter(b => b.getBoundingClientRect().width && getComputedStyle(b).visibility !== 'hidden').map(b => ({ nome: b.getAttribute('aria-label') || b.innerText, ...Object.fromEntries(['x','y','width','height'].map(chave => [chave, b.getBoundingClientRect()[chave]])) })));
  const colisoes = alvos.filter(b => caixa.x < b.x + b.width && caixa.x + caixa.width > b.x && caixa.y < b.y + b.height && caixa.y + caixa.height > b.y);
  assert.deepEqual(colisoes, [], `HUD cobre alvo em ${nome}`);
  const fonteMinima = await hud.evaluate(el => Math.min(...[...el.querySelectorAll('p,strong')].map(e => parseFloat(getComputedStyle(e).fontSize))));
  assert.ok(fonteMinima >= 22);
  medidas.push({ nome, caixa, fonteMinima, colisoes });
  await foto(nome);
}
try {
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await pagina.evaluate(async () => { window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1]; });
  await pagina.getByRole('button', { name: /Começar/ }).click();
  for (const [bloco, lugar] of [[1,'escritorio'],[2,'cafezinho'],[2,'escritorio'],[3,'linha-producao'],[3,'escritorio'],[4,'sala-reunioes'],[5,'outra-area'],[6,'cafezinho']]) {
    await acao('reiniciar'); await acao('entrarNoBloco', bloco);
    await estado({ reflexaoVista: { 1:true,2:true,3:true,4:true,5:true,6:true } });
    await medir(`b${bloco}-${lugar}-mapa`);
    await acao('entrarNoLugar', lugar); await acao('fecharNarracao');
    await pagina.waitForTimeout(120);
    await medir(`b${bloco}-${lugar}-cena`);
  }
  await acao('reiniciar'); await estado({ reflexaoVista: {1:true}, reflexaoAtiva: null });
  await acao('clicarHotspot', 'b1-tiago');
  await pagina.getByRole('button', { name: /^Avançar diálogo/ }).waitFor();
  assert.equal(await pagina.getByRole('progressbar', { name: 'Experiência de Ana' }).getAttribute('aria-valuenow'), '0');
  while (await pagina.evaluate(async () => Boolean((await import(window.storeAtual)).useJogo.getState().dialogoAtivo))) await pagina.getByRole('button', { name: /^Avançar diálogo/ }).click();
  assert.equal(await pagina.getByRole('progressbar', { name: 'Experiência de Ana' }).getAttribute('aria-valuenow'), '10');
  await foto('ganho-xp');
  await acao('clicarHotspot', 'b1-notebook');
  assert.equal(await pagina.getByRole('complementary', { name: 'Nível de Ana' }).count(), 0);
  await foto('minigame-sem-hud'); await acao('fecharPuzzle');
  await estado({ blocoConcluido: true, xpAtual: 60 });
  await pagina.getByRole('button', { name: 'Avançar para o próximo bloco' }).click();
  await foto('evolucao-fecho');
  await pagina.waitForTimeout(2100); await foto('evolucao-novo-titulo');
  await pagina.getByRole('button', { name: 'Pular evolução de Ana' }).click();
  assert.equal(await pagina.getByRole('button', { name: 'Pular evolução de Ana' }).count(), 0);
  await foto('cartao-depois-evolucao');
  await acao('entrarNoBloco', 2);
  assert.equal(await pagina.getByRole('progressbar', { name: 'Experiência de Ana' }).getAttribute('aria-valuenow'), '0');
  await foto('nivel-2-barra-zerada');
  await estado({ evolucoesVistas: [], blocoConcluido: true, xpAtual: 40 });
  // Mede no navegador: chamadas ao driver não fazem parte da animação.
  const evolucaoAutomaticaMs = await pagina.evaluate(async () => {
    const { useJogo } = await import(window.storeAtual);
    return new Promise(resolve => {
      const inicio = performance.now();
      const cancelar = useJogo.subscribe(s => {
        if (s.tela.tipo === 'cartao') { cancelar(); resolve(performance.now() - inicio); }
      });
      useJogo.getState().avancarBloco();
    });
  });
  assert.ok(evolucaoAutomaticaMs < 4000);
  assert.deepEqual(erros, []);
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ medidas, evolucaoAutomaticaMs, erros }, null, 2));
  console.log(`Verificadas ${medidas.length} telas, ganho de XP, ocultação no puzzle e evolução manual/automática.`);
} finally {
  await contexto.close();
  if (pagina.video()) await pagina.video().saveAs(`${destino}/niveis.webm`);
  await navegador.close();
}
