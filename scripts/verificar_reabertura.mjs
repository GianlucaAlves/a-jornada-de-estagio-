/** Exercita cancelamento e retorno pela interface, com save real do navegador. */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = 'docs/arte/v2-4/continuidade';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
pagina.on('pageerror', erro => erros.push(erro.message));
async function conectar() {
  await pagina.evaluate(async () => {
    window.storeAtual = (await fetch('/src/App.tsx').then(r => r.text())).match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
  });
}
const acao = (nome, argumento) => pagina.evaluate(async ([nome, argumento]) => (await import(window.storeAtual)).useJogo.getState()[nome](argumento), [nome, argumento]);
const estado = () => pagina.evaluate(async () => {
  const s = (await import(window.storeAtual)).useJogo.getState();
  return { puzzle: s.puzzleAberto, situacao: s.puzzles.estruturar, item: s.itens['anotacoes-treinamento'], xp: s.xpAtual, narracao: s.narracao };
});
try {
  await pagina.goto('http://127.0.0.1:5181', { waitUntil: 'networkidle' });
  await conectar();
  await pagina.getByRole('button', { name: /Começar/ }).click();
  const entradas = [];
  for (let bloco = 1; bloco <= 6; bloco++) {
    await acao('reiniciar');
    await acao('entrarNoBloco', bloco);
    const lugar = await pagina.evaluate(async bloco => (await import('/src/domain/content/reflexoes.ts')).REFLEXOES[bloco].lugarId, bloco);
    await acao('entrarNoLugar', lugar);
    await pagina.getByRole('button', { name: 'Pular reflexão' }).click();
    assert.equal((await estado()).narracao, null, `Introdução redundante após reflexão no bloco ${bloco}`);
    entradas.push(bloco);
  }
  await acao('reiniciar');
  await acao('entrarNoBloco', 3);
  await acao('entrarNoLugar', 'linha-producao');
  await pagina.getByRole('button', { name: 'Pular reflexão' }).click();
  await pagina.getByRole('button', { name: /^Anotações do treinamento\./ }).click();
  await pagina.getByRole('button', { name: 'Usar item selecionado em Números da linha' }).click();
  const sair = pagina.getByRole('button', { name: 'Sair do desafio e voltar para a cena' });
  await sair.waitFor();
  const entrega = await estado();
  assert.equal(entrega.item, 'consumido');
  assert.equal(entrega.puzzle, 'estruturar');
  await sair.click();
  await pagina.getByRole('button', { name: 'Interagir com Números da linha' }).click();
  await sair.waitFor();
  assert.equal((await estado()).puzzle, 'estruturar');
  await pagina.screenshot({ path: `${destino}/reaberto.png` });
  await sair.click();
  await pagina.getByRole('button', { name: 'Voltar ao mapa', exact: true }).click();
  await acao('entrarNoLugar', 'linha-producao');
  await pagina.getByRole('button', { name: 'Interagir com Números da linha' }).click();
  await sair.waitFor();
  assert.equal((await estado()).xp, entrega.xp);
  await sair.click();
  // Recarregar perde todo estado de componente e prova que o acesso é salvo.
  await pagina.reload({ waitUntil: 'networkidle' });
  await conectar();
  await pagina.getByRole('button', { name: /Continuar/ }).click();
  await pagina.getByRole('button', { name: 'Interagir com Números da linha' }).click();
  await sair.waitFor();
  const retomada = await estado();
  assert.equal(retomada.puzzle, 'estruturar');
  assert.equal(retomada.situacao, 'liberado');
  assert.equal(retomada.item, 'consumido');
  assert.equal(retomada.xp, entrega.xp);
  assert.deepEqual(erros, []);
  await pagina.screenshot({ path: `${destino}/retomado.png` });
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ entradas, entrega, retomada, erros }, null, 2));
  console.log('Seis reflexões sem introdução redundante; painel reabre após cancelar, retornar do mapa e retomar save.');
} finally {
  await navegador.close();
}
