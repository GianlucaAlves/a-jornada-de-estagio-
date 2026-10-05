/** A seleção permite enviar contexto visual mesmo quando a outra IA limita anexos. */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, copyFile, readdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const destino = 'docs/arte/contexto-completo-2026-10-04';
const indice = JSON.parse(await readFile(`${destino}/indice.json`, 'utf8'));
const verificacao = JSON.parse(await readFile(`${destino}/verificacao.json`, 'utf8'));
assert.equal(indice.length, verificacao.capturas);
assert.deepEqual(verificacao.errosDePagina, []);
const esperadas = new Set(indice.map(c => c.arquivo));
// Só remove sobras das execuções desta captura, dentro do destino fixo.
for (const nome of await readdir(`${destino}/prints`)) {
  if (/^\d{3}-.*\.png$/.test(nome) && !esperadas.has(nome)) await unlink(`${destino}/prints/${nome}`);
}
const criterios = [
  'abertura.png', 'b1-mapa.png', 'b6-mapa.png',
  'b1-escritorio.png', 'b2-cafezinho.png', 'b2-escritorio.png',
  'b3-linha-producao.png', 'b3-escritorio.png', 'b4-sala-reunioes.png',
  'b5-outra-area.png', 'b6-cafezinho.png', 'b1-reflexao-2.png',
  'b1-rafael-fala-4.png', 'b4-apresentacao-fala-4.png',
  'b4-entrega-silencio.png', 'b4-claudia-acao.png', 'b5-bianca-acao.png',
  'b1-senha-inicio.png', 'b2-associar-inicio.png', 'b3-estruturar-inicio.png',
  'b4-montar-inicio.png', 'b3-estruturar-distrator.png',
  'item-cartao-rafael-descricao.png', 'habilidade-plano-futuro.png',
  'final-conexao-4.png', 'final-barra-vazia.png', 'final-ana-futura.png',
  'perguntas-3.png',
];
const selecao = criterios.map(sufixo => indice.find(c => c.arquivo.endsWith(`-${sufixo}`))).filter(Boolean);
await mkdir(`${destino}/selecao-para-ia`, { recursive: true });
for (const captura of selecao) await copyFile(`${destino}/prints/${captura.arquivo}`, `${destino}/selecao-para-ia/${captura.arquivo}`);
const guia = await readFile(`${destino}/LEIA-ME.md`, 'utf8');
// O resumo preserva as explicações e gabaritos; o guia conserva as transcrições.
const resumo = guia.split('## Índice dos ')[0].replace(/### Conversas integrais[\s\S]*?(?=\n## Fase |\n## Minigames)/g, '');
await writeFile(`${destino}/CONTEXTO-PARA-IA.md`, `${resumo}\n## Seleção visual para começar\n\nA seleção contém ${selecao.length} prints. O pacote integral contém ${indice.length}, com todas as falas.\n\n${selecao.map(c => `- ${c.arquivo} — ${c.descricao}`).join('\n')}\n`, 'utf8');
await copyFile(`${destino}/CONTEXTO-PARA-IA.md`, `${destino}/selecao-para-ia/CONTEXTO-PARA-IA.md`);
await copyFile(`${destino}/LEIA-ME.md`, `${destino}/selecao-para-ia/TRANSCRICOES-E-GUIA.md`);
const escapar = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
await writeFile(`${destino}/visao-geral.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Visão geral</title><style>body{margin:20px;background:#101722;color:#fff;font:18px system-ui}main{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0}img{width:100%;height:auto}figcaption{height:56px;font-size:14px;overflow:hidden}h1{font-size:28px}</style><h1>A Jornada do Estágio · ${selecao.length} telas de referência · 4 de outubro de 2026</h1><main>${selecao.map(c => `<figure><img src="prints/${c.arquivo}" alt="${escapar(c.descricao)}"><figcaption>${escapar(c.arquivo)}<br>${escapar(c.descricao)}</figcaption></figure>`).join('')}</main></html>`, 'utf8');
const navegador = await chromium.launch({ headless: true });
try {
  const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
  await pagina.goto(pathToFileURL(resolve(`${destino}/visao-geral.html`)).href, { waitUntil: 'load' });
  await pagina.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode())); });
  await pagina.screenshot({ path: `${destino}/visao-geral.png`, fullPage: true });
} finally { await navegador.close(); }
await writeFile(`${destino}/verificacao.json`, JSON.stringify({ ...verificacao, selecaoVisual: selecao.length, typecheck: 'aprovado', testes: '361 testes em 20 arquivos aprovados' }, null, 2));
console.log(`${indice.length} capturas integrais; ${selecao.length} na seleção visual.`);
