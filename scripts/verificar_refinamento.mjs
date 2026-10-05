import { chromium } from 'playwright';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = 'docs/arte/v2-4';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: destino, size: { width: 1280, height: 720 } } });
const pagina = await contexto.newPage();
const erros = [];
const medidas = [];
pagina.on('pageerror', e => erros.push(e.message));
pagina.on('response', resposta => {
  if (/\/assets\/(ambientes|mapa)\/|\/ana-(nivel-\d|celebrando)/.test(resposta.url()) && resposta.status() >= 400) erros.push(`${resposta.status()} ${resposta.url()}`);
});
const estado = dados => pagina.evaluate(async dados => (await import(window.storeAtual)).useJogo.setState(dados), dados);
const acao = (nome, argumento) => pagina.evaluate(async ([nome, argumento]) => (await import(window.storeAtual)).useJogo.getState()[nome](argumento), [nome, argumento]);
const foto = nome => pagina.screenshot({ path: `${destino}/${nome}.png` });
const sobrepoe = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
async function medirHud(nome) {
  const hud = await pagina.getByRole('complementary', { name: 'Nível de Ana' }).boundingBox();
  const botoes = await pagina.locator('button').evaluateAll(elementos => elementos.filter(e => getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width).map(e => ({ nome: e.getAttribute('aria-label') || e.innerText, ...Object.fromEntries(['x','y','width','height'].map(k => [k, e.getBoundingClientRect()[k]])) })));
  const colisoes = botoes.filter(b => sobrepoe(hud, b));
  assert.deepEqual(colisoes, [], `HUD cobre botão em ${nome}`);
  const ganhos = await pagina.getByRole('status').filter({ hasText: /\+\d+ XP/ }).evaluateAll(elementos => elementos.map(e => {
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, opacidade: getComputedStyle(e).opacity };
  }));
  for (const ganho of ganhos) {
    assert.ok(ganho.x >= hud.x && ganho.y >= hud.y && ganho.x + ganho.width <= hud.x + hud.width && ganho.y + ganho.height <= hud.y + hud.height, `Ganho sai da moldura em ${nome}`);
    assert.equal(ganho.opacidade, '1', `Ganho ilegível durante a entrada em ${nome}`);
  }
  medidas.push({ nome, hud, colisoes });
}
try {
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await pagina.evaluate(async () => { window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1]; });
  await pagina.getByRole('button', { name: /Começar/ }).click();
  for (const [bloco, lugar] of [[1,'escritorio'],[2,'cafezinho'],[3,'linha-producao'],[4,'sala-reunioes'],[5,'outra-area'],[6,'cafezinho']]) {
    await acao('reiniciar'); await acao('entrarNoBloco', bloco);
    await estado({ reflexaoVista: {1:true,2:true,3:true,4:true,5:true,6:true}, reflexaoAtiva: null });
    await pagina.waitForTimeout(900);
    await medirHud(`b${bloco}-mapa`);
    await foto(`b${bloco}-mapa`);
    await acao('entrarNoLugar', lugar); await acao('fecharNarracao');
    await pagina.waitForTimeout(1200);
    await medirHud(`b${bloco}-cena`);
    await foto(`b${bloco}-cena`);
    if (bloco < 6 && bloco !== 2) {
      await estado({ blocoConcluido: true });
      await medirHud(`b${bloco}-concluido`);
      const avanco = await pagina.getByRole('button', { name: 'Avançar para o próximo bloco' }).boundingBox();
      const controles = await pagina.getByLabel('Controles e progresso da fase').boundingBox();
      assert.ok(!sobrepoe(avanco, controles), `Avanço cobre controles em B${bloco}`);
      await foto(`b${bloco}-concluido`);
    }
  }
  await acao('reiniciar');
  await estado({ reflexaoVista: {1:true}, reflexaoAtiva: null, narracao: null });
  await acao('clicarHotspot', 'b1-tiago');
  await pagina.waitForTimeout(1500);
  await foto('dialogo');
  await medirHud('dialogo');
  assert.equal(await pagina.getByLabel('Reabrir reflexão de Ana').isVisible(), false);
  while (await pagina.evaluate(async () => Boolean((await import(window.storeAtual)).useJogo.getState().dialogoAtivo))) await acao('avancarDialogo');
  await acao('fecharNarracao');
  while (await pagina.evaluate(async () => (await import(window.storeAtual)).useJogo.getState().itensRecebidos.length)) await acao('fecharItemRecebido');
  await pagina.waitForTimeout(700); await foto('xp');
  assert.equal(await pagina.getByRole('status').filter({ hasText: '+10 XP' }).count(), 1);
  await medirHud('xp-entrada');
  // Duas recompensas no mesmo quadro não podem se substituir, nem expirar
  // atrás de uma narração que o apresentador ainda está lendo.
  await estado({ ganhoXp: null });
  await pagina.evaluate(async () => {
    const { useJogo } = await import(window.storeAtual);
    useJogo.setState({ narracao: 'Verificação da fila de experiência' });
    for (const [sequencia, valor] of [[101, 10], [102, 20]]) useJogo.setState({ xpAtual: useJogo.getState().xpAtual + valor, ganhoXp: { id: `teste-${sequencia}`, valor, lugarId: 'escritorio', pos: {x:50,y:50}, sequencia } });
  });
  await pagina.waitForTimeout(4000);
  assert.equal(await pagina.getByRole('status').filter({ hasText: /\+\d+ XP/ }).count(), 0);
  await acao('fecharNarracao');
  await pagina.waitForTimeout(150);
  assert.equal(await pagina.getByRole('status').filter({ hasText: '+10 XP' }).count(), 1);
  await pagina.waitForTimeout(3650);
  assert.equal(await pagina.getByRole('status').filter({ hasText: '+20 XP' }).count(), 1);
  await medirHud('xp-fila');
  await pagina.waitForTimeout(700);
  await foto('xp-fila');
  await estado({ blocoConcluido: true, xpAtual: 60 });
  await acao('avancarBloco');
  await pagina.waitForTimeout(1600); await foto('evolucao-pose');
  await pagina.waitForTimeout(1000); await foto('evolucao-visual');
  await acao('concluirEvolucao');
  await pagina.waitForTimeout(600); await foto('cartao');
  await acao('entrarNoBloco', 2);
  await estado({ reflexaoVista: {1:true,2:true}, reflexaoAtiva: null });
  await pagina.getByRole('button', { name: 'Entrar em Cafezinho', exact: true }).click();
  await pagina.waitForTimeout(1100);
  assert.equal(await pagina.evaluate(async () => (await import(window.storeAtual)).useJogo.getState().tela.tipo), 'cena');
  await acao('fecharNarracao');
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  const animacoes = await pagina.locator('.jogo-sprite').evaluateAll(el => el.map(e => getComputedStyle(e).animationName));
  assert.ok(animacoes.length > 0 && animacoes.every(n => n === 'none'));
  await acao('voltarAoMapa');
  await pagina.getByRole('button', { name: 'Entrar em Cafezinho', exact: true }).click();
  assert.equal(await pagina.evaluate(async () => (await import(window.storeAtual)).useJogo.getState().tela.tipo), 'cena');
  await acao('fecharNarracao');
  await pagina.setViewportSize({ width: 1280, height: 720 });
  await medirHud('720p'); await foto('720p');
  assert.deepEqual(erros, []);
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ erros, medidas, filaXp: 'dois ganhos preservados após 4s de modal', movimentoReduzido: true, percursoMapa: true }, null, 2));
  console.log(`Verificadas ${medidas.length} composições, fila de XP, evolução, percurso e movimento reduzido.`);
} finally {
  const video = pagina.video();
  await contexto.close();
  if (video) await rename(await video.path(), `${destino}/demonstracao.webm`);
  await navegador.close();
}

const imagens = [
  ['b1-cena', 'Escritório: HUD em coluna e colega no notebook'],
  ['b2-cena', 'Cafezinho: sofá livre e rotina no balcão'],
  ['b3-cena', 'Produção: braços articulados e esteira'],
  ['b4-cena', 'Apresentação: faixa, TV e plateia'],
  ['b5-cena', 'Outra área: posto ocupado, painel e amostra apoiada'],
  ['b6-cena', 'Encerramento: luzes e decoração do cafezinho'],
  ['b6-mapa', 'Campus com destinos descobertos'],
  ['dialogo', 'Diálogo sem sobrepor o nível ou os controles'],
  ['xp-fila', 'Ganho de XP preservado após modal'],
  ['evolucao-pose', 'Pose de conquista'],
  ['evolucao-visual', 'Novo visual da Ana'],
  ['cartao', 'Próximo capítulo'],
  ['720p', 'Composição em 1280 × 720'],
];
await writeFile(`${destino}/galeria.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Jornada • refinamento v2.4</title><style>body{margin:32px;background:#0a1220;color:white;font:22px/1.5 system-ui}main{max-width:1440px;margin:auto}h1{color:#ffd43b}figure{margin:40px 0}img,video{width:100%;border:3px solid #3b4a67;image-rendering:pixelated}a{color:#54e6a0}figcaption{padding:12px 0}</style><main><h1>Jornada • refinamento v2.4</h1><p>Inspeção no navegador, com HUD e personagens. <a href="../../specs/v2-4/00-refinamento.md">Specs</a> · <a href="../../specs/v2-4/01-acabamento-e-correcao.md">Correções e critérios</a> · <a href="verificacao.json">Verificações</a> · <a href="acabamento/galeria.html">Todas as cenas, diálogos e evoluções</a></p><video controls preload="metadata" src="demonstracao.webm"></video>${imagens.map(([nome, titulo]) => `<figure><a href="${nome}.png"><img loading="lazy" src="${nome}.png" alt="${titulo}"></a><figcaption>${titulo}</figcaption></figure>`).join('')}</main></html>`);
