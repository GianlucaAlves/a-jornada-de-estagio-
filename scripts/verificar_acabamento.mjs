/** Revisão da junta: texto completo e arte contextual no navegador real. */
import { chromium } from 'playwright';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = 'docs/arte/v2-4/acabamento';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
const falas = [];
const reflexoes = [];
pagina.on('pageerror', erro => erros.push(erro.message));
await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
await pagina.evaluate(async () => {
  window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
});
await pagina.getByRole('button', { name: /Começar/ }).click();
const estado = dados => pagina.evaluate(async dados => (await import(window.storeAtual)).useJogo.setState(dados), dados);
const acao = (nome, argumento) => pagina.evaluate(async ([nome, argumento]) => (await import(window.storeAtual)).useJogo.getState()[nome](argumento), [nome, argumento]);
const sobrepoe = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
async function medirTexto(alvo, nome) {
  const dados = await alvo.evaluate(botao => {
    const texto = botao.lastElementChild;
    const caixa = botao.getBoundingClientRect();
    const faixa = texto.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(texto);
    const conteudo = range.getBoundingClientRect();
    return { caixa: { x: caixa.x, y: caixa.y, width: caixa.width, height: caixa.height }, baseTexto: conteudo.bottom, baseCaixa: caixa.bottom, larguraTexto: faixa.width, fonte: getComputedStyle(texto.lastElementChild ?? texto).fontSize };
  });
  assert.ok(dados.baseTexto <= dados.baseCaixa - 8, `Texto cortado: ${nome} ${JSON.stringify(dados)}`);
  const hud = await pagina.getByRole('complementary', { name: 'Nível de Ana' }).boundingBox();
  assert.ok(!sobrepoe(dados.caixa, hud), `Fala cobre HUD: ${nome}`);
  const slide = pagina.getByLabel('Apresentação de Ana sobre a passagem de turno');
  if (await slide.count()) assert.ok(!sobrepoe(dados.caixa, await slide.boundingBox()), `Fala cobre televisão: ${nome}`);
  const faixa = pagina.getByLabel('Faixa do evento');
  if (await faixa.count()) {
    const textoFaixa = await faixa.evaluate(e => {
      const range = document.createRange(); range.selectNodeContents(e);
      const r = range.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    assert.ok(!sobrepoe(dados.caixa, textoFaixa), `Fala cobre o nome do evento: ${nome}`);
  }
  const pessoas = await pagina.locator('[data-presenca-npc][data-visivel="true"]').evaluateAll(elementos => elementos.map(e => {
    const r = e.getBoundingClientRect();
    return { nome: e.dataset.presencaNpc, x: r.x, y: r.y, width: r.width, height: r.height };
  }));
  assert.deepEqual(pessoas.filter(p => sobrepoe(dados.caixa, p)), [], `Fala cobre pessoa: ${nome}`);
  return { nome, ...dados };
}
try {
  const dialogos = await pagina.evaluate(async () => {
    const { CENAS, DIALOGOS } = await import('/src/domain/content/index.ts');
    return Object.values(DIALOGOS).map(d => {
      const cena = CENAS.find(c => c.hotspots.some(h => [...h.efeitos, ...(h.efeitosComItem ?? [])].some(e => e.tipo === 'dialogo' && e.dialogoId === d.id)));
      return { id: d.id, total: d.nos.length, bloco: cena?.bloco, lugar: cena?.lugarId };
    }).filter(d => d.bloco);
  });
  for (const d of dialogos) {
    await acao('reiniciar'); await acao('entrarNoBloco', d.bloco);
    await estado({ reflexaoVista: {1:true,2:true,3:true,4:true,5:true,6:true}, reflexaoAtiva: null });
    await acao('entrarNoLugar', d.lugar); await acao('fecharNarracao');
    for (let indice = 0; indice < d.total; indice++) {
      await estado({ dialogoAtivo: { dialogoId: d.id, indice } });
      const botao = pagina.getByRole('button', { name: /^Avançar diálogo/ });
      await botao.waitFor();
      falas.push(await medirTexto(botao, `${d.id}:${indice}`));
      if (indice === 0 || (d.id === 'b4-apresentacao' && indice === d.total - 1)) {
        await pagina.waitForTimeout(850);
        await pagina.screenshot({ path: `${destino}/${d.id}-${indice}.png` });
      }
    }
    await estado({ dialogoAtivo: null });
  }
  const cenas = await pagina.evaluate(async () => (await import('/src/domain/content/index.ts')).CENAS.map(c => ({ bloco: c.bloco, lugar: c.lugarId })));
  for (const c of cenas) {
    await acao('reiniciar'); await acao('entrarNoBloco', c.bloco);
    await estado({ reflexaoVista: {1:true,2:true,3:true,4:true,5:true,6:true}, reflexaoAtiva: null });
    await acao('entrarNoLugar', c.lugar); await acao('fecharNarracao');
    const total = await pagina.evaluate(async bloco => (await import('/src/domain/content/reflexoes.ts')).REFLEXOES[bloco].falas.length, c.bloco);
    for (let indice = 0; indice < total; indice++) {
      await estado({ reflexaoAtiva: { etapa: 'falas', indice } });
      const botao = pagina.getByRole('button', { name: 'Avançar pensamento de Ana' });
      await botao.waitFor();
      reflexoes.push(await medirTexto(botao, `b${c.bloco}-${c.lugar}:${indice}`));
    }
    await pagina.screenshot({ path: `${destino}/pensamento-b${c.bloco}-${c.lugar}.png` });
    await estado({ reflexaoAtiva: null });
    // Quatro instantes mostram poses intermediárias, e não só o repouso.
    for (let quadro = 0; quadro < 4; quadro++) {
      await pagina.waitForTimeout(1000);
      await pagina.screenshot({ path: `${destino}/ambiente-b${c.bloco}-${c.lugar}-${quadro}.png` });
    }
  }
  for (let bloco = 1; bloco < 6; bloco++) {
    await acao('entrarNoBloco', bloco);
    await estado({ tela: { tipo: 'evolucao', bloco: bloco + 1 }, reflexaoAtiva: null });
    await pagina.waitForTimeout(1700);
    await pagina.screenshot({ path: `${destino}/pose-nivel-${bloco + 1}.png` });
    await pagina.waitForTimeout(3000);
    assert.equal(await pagina.evaluate(async () => (await import(window.storeAtual)).useJogo.getState().tela.tipo), 'evolucao', 'Evolução saiu antes do clique');
    await pagina.screenshot({ path: `${destino}/visual-nivel-${bloco + 1}.png` });
    await pagina.getByRole('button', { name: 'Pular evolução de Ana' }).click();
  }
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  await acao('entrarNoBloco', 4);
  await estado({ tela: { tipo: 'evolucao', bloco: 5 }, reflexaoAtiva: null });
  await pagina.getByText('Estagiária em transição de carreira', { exact: true }).waitFor();
  await pagina.screenshot({ path: `${destino}/evolucao-movimento-reduzido.png` });
  assert.deepEqual(erros, []);
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ falas, reflexoes, erros, evolucoes: 5, ambientes: cenas.length, movimentoReduzido: true }, null, 2));
  const imagens = (await readdir(destino)).filter(nome => nome.endsWith('.png')).sort();
  const grupo = nome => nome.startsWith('ambiente-') ? 'Ambientes' : nome.startsWith('pensamento-') ? 'Pensamentos' : /^(pose|visual|evolucao)-/.test(nome) ? 'Evolução' : 'Diálogos';
  await writeFile(`${destino}/galeria.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acabamento V2.4 — revisão visual</title><style>body{margin:0;background:#0a1220;color:white;font:22px/1.45 system-ui}main{max-width:1440px;margin:auto;padding:32px}h1{font-size:36px}a{color:#92e8e8}nav{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}button{font:inherit;background:#121c2e;color:white;border:3px solid white;padding:8px 20px;cursor:pointer}button[aria-pressed=true]{color:#ffd43b;border-color:#ffd43b}figure{margin:32px 0;border:3px solid #3b4a67}img{display:block;width:100%;image-rendering:pixelated}figcaption{padding:12px 20px}figure[hidden]{display:none}</style><main><h1>Acabamento V2.4</h1><p>${falas.length} falas, ${reflexoes.length} pensamentos, oito cenas em quatro instantes e cinco passagens de nível. As imagens são capturas do jogo com o HUD e o elenco.</p><p><a href="../galeria.html">Galeria principal e demonstração</a> · <a href="verificacao.json">Medições da revisão</a></p><nav aria-label="Filtrar capturas">${['Todas','Ambientes','Diálogos','Pensamentos','Evolução'].map((g,i) => `<button type="button" aria-pressed="${i === 0}" data-grupo="${g}">${g}</button>`).join('')}</nav>${imagens.map(nome => `<figure data-grupo="${grupo(nome)}"><a href="${nome}"><img loading="lazy" src="${nome}" alt="${grupo(nome)} — ${nome.replace('.png','')}"></a><figcaption>${grupo(nome)} · ${nome.replace('.png','').replaceAll('-',' ')}</figcaption></figure>`).join('')}</main><script>document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('nav button').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));document.querySelectorAll('figure').forEach(f=>f.hidden=b.dataset.grupo!=='Todas'&&f.dataset.grupo!==b.dataset.grupo)}))</script></html>`);
  console.log(`${falas.length} falas e ${reflexoes.length} pensamentos sem corte; ${cenas.length} cenas em quatro instantes; cinco evoluções.`);
} finally {
  await navegador.close();
}
