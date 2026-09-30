/**
 * A CAIXA DE DIÁLOGO, MEDIDA (ADR-012).
 *
 * Este arquivo existe porque o defeito que ele tranca foi descoberto por
 * MEDIÇÃO, não por olhar: a caixa antiga ocupava 1376x340 px — 22,6% do canvas,
 * opaca — e interceptava 22 dos 24 hotspots do jogo, sete deles inteiros,
 * cobrindo justamente quem estava falando (Bianca 80%, Rafael 75%, Cláudia 73%).
 * Nada disso aparece lendo o código, e aparece pouco demais olhando a tela: um
 * NPC meio coberto durante uma fala parece composição, não defeito.
 *
 * O que se afirma aqui, e por quê:
 *
 * 1. A ÁREA encolheu de verdade, em px e em % do canvas. Área é o número que o
 *    critério de aceite pede, e é o único que não depende do conteúdo.
 * 2. NENHUM hotspot de NPC é interceptado. Esta é a asserção que importa: o
 *    defeito do ADR não é "a caixa é grande", é "a caixa cobre quem fala". Ela é
 *    estrutural, não circunstancial — NPC tem 336px de altura e assenta no piso,
 *    então a faixa alta da tela é livre dele por construção.
 * 3. Nenhum hotspot de ITEM em cena é interceptado. Item em cena tem 96px e é
 *    alvo pequeno; cobri-lo durante uma fala é o mesmo defeito em miniatura.
 * 4. A caixa não invade as faixas de UI vizinhas (botão de voltar, painel de
 *    skills), que já são território proibido para hotspot.
 * 5. Todo nó de diálogo do conteúdo CABE. A caixa deixou de ter altura de sobra,
 *    então texto longo passou a ser um defeito possível — e o remédio é partir o
 *    nó em dois, que é a unidade do diálogo, não devolver altura à caixa.
 *
 * A contagem de hotspots é a do conteúdo de HOJE, e o conteúdo está sendo
 * escrito em paralelo. Por isso o relatório imprime a contagem junto: comparar
 * 22 de 24 com um número medido contra outro conteúdo seria comparar nada. A
 * caixa antiga é medida contra o MESMO conteúdo, lado a lado.
 */
import { CENAS, DIALOGOS } from '../domain/content';
import type { Cena, Hotspot } from '../domain/types';
import { CANVAS, caixaDeDialogo } from '../styles/tokens';
import {
  FAIXAS_DE_OVERLAY,
  intersectam,
  retanguloDoHotspot,
} from './geometriaDeCena';
import type { Retangulo } from './geometriaDeCena';
import { CAPACIDADE_DE_TEXTO, RETANGULO_ANTIGO, RETANGULO_DA_CAIXA, cabeNaCaixa } from './Dialogo';

const AREA_DO_CANVAS = CANVAS.largura * CANVAS.altura;

function area(r: Retangulo | typeof RETANGULO_DA_CAIXA): number {
  return (r.direita - r.esquerda) * (r.base - r.topo);
}

function porcentoDoCanvas(r: Retangulo | typeof RETANGULO_DA_CAIXA): number {
  return (area(r) / AREA_DO_CANVAS) * 100;
}

interface HotspotEmCena {
  cena: Cena;
  hotspot: Hotspot;
  retangulo: Retangulo;
}

const TODOS: readonly HotspotEmCena[] = CENAS.flatMap((cena) =>
  cena.hotspots.map((hotspot) => ({ cena, hotspot, retangulo: retanguloDoHotspot(hotspot) })),
);

function nome(h: HotspotEmCena): string {
  return `${h.cena.lugarId}/B${h.cena.bloco} '${h.hotspot.id}' [${h.hotspot.arte.tipo}]`;
}

function interceptados(caixa: Retangulo | typeof RETANGULO_DA_CAIXA): readonly HotspotEmCena[] {
  return TODOS.filter((h) => intersectam(h.retangulo, caixa as Retangulo));
}

/** Quanto da área do hotspot a caixa cobre, em %. */
function coberturaDe(h: HotspotEmCena, caixa: Retangulo | typeof RETANGULO_DA_CAIXA): number {
  const largura = Math.min(h.retangulo.direita, caixa.direita) - Math.max(h.retangulo.esquerda, caixa.esquerda);
  const altura = Math.min(h.retangulo.base, caixa.base) - Math.max(h.retangulo.topo, caixa.topo);
  if (largura <= 0 || altura <= 0) return 0;
  return ((largura * altura) / area(h.retangulo)) * 100;
}

const NOVOS = interceptados(RETANGULO_DA_CAIXA);
const ANTIGOS = interceptados(RETANGULO_ANTIGO);

describe('a caixa de diálogo, medida', () => {
  it('há hotspot para medir (o teste não passa por lista vazia)', () => {
    expect(TODOS.length).toBeGreaterThan(0);
    expect(Object.keys(DIALOGOS).length).toBeGreaterThan(0);
  });

  /**
   * Não é asserção: é o RELATÓRIO. O critério de aceite pede o número em px e em
   * % do canvas, e um número que só existe dentro de uma expectativa não é
   * relatado a ninguém.
   */
  it('imprime o relatório de medição', () => {
    const l = RETANGULO_DA_CAIXA.direita - RETANGULO_DA_CAIXA.esquerda;
    const a = RETANGULO_DA_CAIXA.base - RETANGULO_DA_CAIXA.topo;
    const lAntiga = RETANGULO_ANTIGO.direita - RETANGULO_ANTIGO.esquerda;
    const aAntiga = RETANGULO_ANTIGO.base - RETANGULO_ANTIGO.topo;

    const linhas = [
      '',
      '=== CAIXA DE DIÁLOGO — MEDIÇÃO ===',
      `ANTES  ${lAntiga}x${aAntiga} px = ${area(RETANGULO_ANTIGO).toLocaleString('pt-BR')} px²` +
        ` = ${porcentoDoCanvas(RETANGULO_ANTIGO).toFixed(2)}% do canvas` +
        `  [x ${RETANGULO_ANTIGO.esquerda}..${RETANGULO_ANTIGO.direita}, y ${RETANGULO_ANTIGO.topo}..${RETANGULO_ANTIGO.base}]`,
      `AGORA  ${l}x${a} px = ${area(RETANGULO_DA_CAIXA).toLocaleString('pt-BR')} px²` +
        ` = ${porcentoDoCanvas(RETANGULO_DA_CAIXA).toFixed(2)}% do canvas` +
        `  [x ${RETANGULO_DA_CAIXA.esquerda}..${RETANGULO_DA_CAIXA.direita}, y ${RETANGULO_DA_CAIXA.topo}..${RETANGULO_DA_CAIXA.base}]`,
      `redução de área: ${(100 - (area(RETANGULO_DA_CAIXA) / area(RETANGULO_ANTIGO)) * 100).toFixed(1)}%`,
      '',
      `hotspots no conteúdo medido: ${TODOS.length}`,
      `interceptados ANTES: ${ANTIGOS.length} de ${TODOS.length}` +
        ` (${((ANTIGOS.length / TODOS.length) * 100).toFixed(0)}%)`,
      `interceptados AGORA: ${NOVOS.length} de ${TODOS.length}` +
        ` (${((NOVOS.length / TODOS.length) * 100).toFixed(0)}%)`,
      ...NOVOS.map((h) => `   ainda interceptado: ${nome(h)} — ${coberturaDe(h, RETANGULO_DA_CAIXA).toFixed(0)}% coberto`),
      `NPCs interceptados AGORA: ${NOVOS.filter((h) => h.hotspot.arte.tipo === 'npc').length}` +
        ` (antes: ${ANTIGOS.filter((h) => h.hotspot.arte.tipo === 'npc').length})`,
      `retrato: ${caixaDeDialogo.retrato.largura}x${caixaDeDialogo.retrato.altura} px (rosto), era 220x260 (corpo inteiro)`,
      '===================================',
      '',
    ];
    console.log(linhas.join('\n'));
    expect(NOVOS.length).toBeLessThan(ANTIGOS.length);
  });

  it('a caixa cabe no canvas e é drasticamente menor que a antiga', () => {
    expect(RETANGULO_DA_CAIXA.esquerda).toBeGreaterThanOrEqual(0);
    expect(RETANGULO_DA_CAIXA.topo).toBeGreaterThanOrEqual(0);
    expect(RETANGULO_DA_CAIXA.direita).toBeLessThanOrEqual(CANVAS.largura);
    expect(RETANGULO_DA_CAIXA.base).toBeLessThanOrEqual(CANVAS.altura);

    // Menos da metade da área antiga, e abaixo de 13% do canvas.
    expect(area(RETANGULO_DA_CAIXA)).toBeLessThan(area(RETANGULO_ANTIGO) / 2);
    expect(porcentoDoCanvas(RETANGULO_DA_CAIXA)).toBeLessThan(13);
  });

  /**
   * A ASSERÇÃO QUE IMPORTA. O ADR-012 não reclama do tamanho: reclama de a caixa
   * cobrir quem está falando. Se isto reprovar, a caixa voltou para cima do
   * elenco — ou alguém posicionou um NPC dentro da faixa alta da tela, que está
   * declarada em `caixaDeDialogo` nos tokens.
   */
  it('a caixa não cobre NENHUM hotspot de NPC', () => {
    const cobertos = NOVOS.filter((h) => h.hotspot.arte.tipo === 'npc').map(
      (h) =>
        `${nome(h)} — topo da figura em ${Math.round(h.retangulo.topo)}px, ` +
        `e a caixa vai até ${RETANGULO_DA_CAIXA.base}px`,
    );
    expect(
      cobertos,
      'a caixa de diálogo voltou a cobrir quem fala, que é o defeito do ADR-012. ' +
        `A faixa da caixa é y ${RETANGULO_DA_CAIXA.topo}..${RETANGULO_DA_CAIXA.base}, ` +
        `x ${RETANGULO_DA_CAIXA.esquerda}..${RETANGULO_DA_CAIXA.direita}, e está declarada em ` +
        'tokens.ts (`caixaDeDialogo`). Conserto: baixar o `pos.y` do NPC para que o topo ' +
        'da figura fique abaixo da base da caixa. A figura tem 336px de altura e ancora ' +
        'pelos pés, então pos.y precisa ficar acima de ' +
        `${(((RETANGULO_DA_CAIXA.base + 336) / CANVAS.altura) * 100).toFixed(1)}% do canvas.`,
    ).toEqual([]);
  });

  it('a caixa não cobre nenhum item em cena, que é alvo pequeno', () => {
    const cobertos = NOVOS.filter((h) => h.hotspot.arte.tipo === 'item').map(nome);
    expect(cobertos).toEqual([]);
  });

  /**
   * Guard de regressão com margem, não com igualdade. A contagem exata depende
   * do conteúdo, que está sendo escrito em paralelo; o que não pode voltar é a
   * ORDEM DE GRANDEZA — a caixa antiga interceptava 92% dos hotspots.
   */
  it('a caixa intercepta uma fração pequena dos hotspots', () => {
    const fracao = NOVOS.length / TODOS.length;
    const fracaoAntiga = ANTIGOS.length / TODOS.length;
    expect(fracao).toBeLessThanOrEqual(0.25);
    expect(fracao).toBeLessThan(fracaoAntiga / 3);
  });

  /**
   * Quanto falta para a caixa encostar no NPC mais alto de todo o conteúdo.
   *
   * Não é decoração: é a folga que separa "nunca cobre quem fala" de "não cobre
   * hoje". Imprimir o número faz a fragilidade ser vista antes de virar defeito,
   * e quem mexer em coordenada de NPC vê no relatório quanto espaço tem.
   */
  it('imprime a folga até o NPC mais alto do conteúdo', () => {
    const npcs = TODOS.filter((h) => h.hotspot.arte.tipo === 'npc');
    if (npcs.length === 0) {
      console.log('nenhum NPC no conteúdo medido');
      expect(npcs.length).toBe(0);
      return;
    }
    const maisAlto = npcs.reduce((a, b) => (a.retangulo.topo <= b.retangulo.topo ? a : b));
    const folga = maisAlto.retangulo.topo - RETANGULO_DA_CAIXA.base;
    console.log(
      `folga da caixa (base ${RETANGULO_DA_CAIXA.base}) até o NPC mais alto ` +
        `(${nome(maisAlto)}, topo ${Math.round(maisAlto.retangulo.topo)}): ${Math.round(folga)} px`,
    );
    expect(folga).toBeGreaterThan(0);
  });

  /**
   * A caixa é vizinha de duas faixas que já são território proibido para
   * hotspot: o botão de voltar (que fica visível durante a fala de propósito) e
   * o painel de skills. Encostar em qualquer das duas é sobreposição de UI, que
   * é o mesmo defeito uma camada acima.
   */
  it('a caixa não invade o botão de voltar nem o painel de skills', () => {
    const proibidas = FAIXAS_DE_OVERLAY.filter(
      (f) => f.nome === 'botão Voltar ao mapa' || f.nome === 'painel de skills',
    );
    expect(proibidas).toHaveLength(2);
    const invadidas = proibidas
      .filter((f) => intersectam(RETANGULO_DA_CAIXA as Retangulo, f.area))
      .map((f) => f.nome);
    expect(invadidas).toEqual([]);
  });

  /**
   * O retrato é de ROSTO, e na escala única de 4x (bíblia §2.1).
   *
   * O de corpo inteiro tinha 220x260 e era o que mais custava altura. A grade de
   * rosto é 40x48 px de arte; qualquer tamanho que não seja múltiplo de 4 põe a
   * arte fora da grade e devolve o borrão que `image-rendering: pixelated`
   * existe para evitar.
   */
  it('o retrato cabe na caixa e está na grade de 4px', () => {
    expect(caixaDeDialogo.retrato.largura % 4).toBe(0);
    expect(caixaDeDialogo.retrato.altura % 4).toBe(0);
    expect(caixaDeDialogo.retrato.altura).toBeLessThan(caixaDeDialogo.altura);
    // Menor que o retrato de corpo inteiro que saiu.
    expect(caixaDeDialogo.retrato.largura * caixaDeDialogo.retrato.altura).toBeLessThan(220 * 260);
  });
});

describe('capacidade de texto da caixa', () => {
  it('a conta de capacidade é conservadora e não degenerou', () => {
    expect(CAPACIDADE_DE_TEXTO.caracteresPorLinha).toBeGreaterThan(30);
    expect(CAPACIDADE_DE_TEXTO.linhas).toBeGreaterThanOrEqual(3);
    expect(CAPACIDADE_DE_TEXTO.caracteresMaximos).toBeGreaterThan(120);
  });

  /**
   * Todo nó de diálogo do conteúdo cabe.
   *
   * Se isto reprovar, o remédio é PARTIR o nó em dois — um clique, um nó é a
   * unidade do diálogo — e não devolver altura à caixa, que acabou de sair da
   * frente de quem fala.
   */
  it('todo nó de diálogo cabe na caixa', () => {
    const grandes: string[] = [];
    for (const dialogo of Object.values(DIALOGOS)) {
      for (const [indice, no] of dialogo.nos.entries()) {
        if (!cabeNaCaixa(no.texto)) {
          grandes.push(
            `'${dialogo.id}' nó ${indice + 1}: ${no.texto.length} caracteres ` +
              `(teto ${CAPACIDADE_DE_TEXTO.caracteresMaximos}) — parta em dois nós`,
          );
        }
      }
    }
    expect(grandes).toEqual([]);
  });
});
