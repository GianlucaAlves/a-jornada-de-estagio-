/**
 * GEOMETRIA DA CENA — a prova de que o hotspot virou arte sem virar bagunça.
 *
 * O teste de integridade do conteúdo garante o piso grosseiro (6% de distância
 * entre hotspots). Aqui a conta é a de verdade: cada hotspot vira o RETÂNGULO
 * que o sprite realmente ocupa na tela, com o tamanho da arte e a âncora
 * declarada, e nenhum par pode se cruzar.
 *
 * Isso importa porque a regressão que a frente consertou tinha três sintomas, e
 * só o primeiro era visível na leitura do código:
 *
 * 1. hotspot era retângulo de texto, então o NPC não existia na tela;
 * 2. os retângulos se sobrepunham — com sprite, o de trás desaparece;
 * 3. a Ana parava EM CIMA do que acabou de clicar, e a arte que a plateia
 *    precisava ver ficava atrás dela justamente no momento do clique.
 *
 * Nada aqui renderiza React: é a mesma aritmética que `Cena.tsx` usa para
 * posicionar, medida em px do canvas 1920x1080.
 */
import { CENAS } from '../domain/content';
import type { Cena, Hotspot } from '../domain/types';
import { CANVAS, alvo } from '../styles/tokens';
import {
  POSICAO_DE_ENTRADA,
  dentroDoCanvas,
  faixaQueCobre,
  folgaDeAlvo,
  intersectam,
  retanguloDaProtagonista,
  retanguloDoHotspot,
  tamanhoDaArte,
} from './geometriaDeCena';

function nomeDaCena(cena: Cena): string {
  return `${cena.lugarId}/B${cena.bloco}`;
}

const TODOS: readonly { cena: Cena; hotspot: Hotspot }[] = CENAS.flatMap((cena) =>
  cena.hotspots.map((hotspot) => ({ cena, hotspot })),
);

describe('geometria dos hotspots em cena', () => {
  it('há hotspot para medir (o teste não passa por lista vazia)', () => {
    expect(TODOS.length).toBeGreaterThan(0);
  });

  it('todo hotspot cabe inteiro dentro do canvas', () => {
    const fora = TODOS.filter(({ hotspot }) => !dentroDoCanvas(retanguloDoHotspot(hotspot))).map(
      ({ cena, hotspot }) => `${nomeDaCena(cena)} '${hotspot.id}'`,
    );
    expect(fora).toEqual([]);
  });

  /** O sintoma 2: sprite sobre sprite = NPC que não existe na tela. */
  it('nenhum par de hotspots da mesma cena se sobrepõe', () => {
    const sobrepostos: string[] = [];
    for (const cena of CENAS) {
      const hs = cena.hotspots;
      for (let a = 0; a < hs.length; a += 1) {
        for (let b = a + 1; b < hs.length; b += 1) {
          const x = hs[a];
          const y = hs[b];
          if (!x || !y) continue;
          if (intersectam(retanguloDoHotspot(x), retanguloDoHotspot(y))) {
            sobrepostos.push(`${nomeDaCena(cena)} '${x.id}' × '${y.id}'`);
          }
        }
      }
    }
    expect(sobrepostos).toEqual([]);
  });

  /**
   * Hotspot debaixo de overlay fixo é clique morto — e "hotspot que não
   * responde é considerado bug" é regra do projeto. O painel de skills e a
   * barra de itens desenham acima da camada de hotspot e comem o ponteiro; o
   * título e o botão de voltar, idem, no alto da tela.
   */
  it('nenhum hotspot nasce debaixo de um overlay fixo', () => {
    const cobertos: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      const faixa = faixaQueCobre(retanguloDoHotspot(hotspot));
      if (faixa !== null) cobertos.push(`${nomeDaCena(cena)} '${hotspot.id}' sob ${faixa}`);
    }
    expect(cobertos).toEqual([]);
  });

  /**
   * O sintoma 3. A Ana desenha ACIMA dos hotspots (camada.protagonista >
   * camada.hotspot), então parar sobre o alvo esconde exatamente a arte que o
   * clique acabou de trazer para a conversa. A parada tem de ser lateral ou à
   * frente — nunca em cima.
   */
  it('a Ana não cobre o hotspot que acabou de acionar', () => {
    const cobertos: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      const dela = retanguloDaProtagonista(hotspot.parada);
      if (intersectam(dela, retanguloDoHotspot(hotspot))) {
        cobertos.push(`${nomeDaCena(cena)} '${hotspot.id}'`);
      }
    }
    expect(cobertos).toEqual([]);
  });

  it('todo ponto de parada mantém a Ana inteira na tela e fora dos overlays', () => {
    const problemas: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      const dela = retanguloDaProtagonista(hotspot.parada);
      const onde = `${nomeDaCena(cena)} '${hotspot.id}'`;
      if (!dentroDoCanvas(dela)) problemas.push(`${onde}: parada corta a Ana`);
      const faixa = faixaQueCobre(dela);
      if (faixa !== null) problemas.push(`${onde}: parada põe a Ana sob ${faixa}`);
    }
    expect(problemas).toEqual([]);
  });

  /**
   * A Ana entra em toda cena no mesmo ponto, sem travessia. Nascer materializada
   * dentro de um NPC é defeito do primeiro segundo da cena — ou seja, aparece
   * na frente da plateia e não em ensaio, porque quem ensaia já clicou antes de
   * olhar.
   */
  it('a posição de entrada não nasce sobre nenhum hotspot', () => {
    const dela = retanguloDaProtagonista(POSICAO_DE_ENTRADA);
    expect(dentroDoCanvas(dela)).toBe(true);
    expect(faixaQueCobre(dela)).toBeNull();

    const colisoes = TODOS.filter(({ hotspot }) =>
      intersectam(dela, retanguloDoHotspot(hotspot)),
    ).map(({ cena, hotspot }) => `${nomeDaCena(cena)} '${hotspot.id}'`);
    expect(colisoes).toEqual([]);
  });

  /**
   * Escala única de 4x em tudo (bíblia §2.1). Escalas diferentes na mesma tela
   * fazem cenário e elenco parecerem dois jogos colados, e é o erro mais
   * visível de pixel art montada por várias mãos.
   */
  it('toda arte de hotspot está na grade de 4px', () => {
    const fora: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      const t = tamanhoDaArte(hotspot.arte);
      if (t.largura % 4 !== 0 || t.altura % 4 !== 0) {
        fora.push(`${nomeDaCena(cena)} '${hotspot.id}': ${t.largura}x${t.altura}`);
      }
    }
    expect(fora).toEqual([]);
  });

  /**
   * Alvo de clique nunca abaixo de `alvo.minimo`. A apresentação é ao vivo e
   * sob pressão: alvo apertado é bug. A folga entra como área invisível em
   * volta, nunca como sprite esticado.
   */
  it(`todo hotspot tem alvo de clique de pelo menos ${alvo.minimo}px nos dois eixos`, () => {
    const apertados: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      const t = tamanhoDaArte(hotspot.arte);
      const folga = folgaDeAlvo(t);
      const largura = t.largura + folga * 2;
      const altura = t.altura + folga * 2;
      if (largura < alvo.minimo || altura < alvo.minimo) {
        apertados.push(`${nomeDaCena(cena)} '${hotspot.id}': ${largura}x${altura}`);
      }
    }
    expect(apertados).toEqual([]);
  });

  it('as coordenadas de conteúdo são percentuais válidas do canvas', () => {
    const fora: string[] = [];
    for (const { cena, hotspot } of TODOS) {
      for (const [nome, p] of [
        ['pos', hotspot.pos],
        ['parada', hotspot.parada],
      ] as const) {
        if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) {
          fora.push(`${nomeDaCena(cena)} '${hotspot.id}'.${nome}`);
        }
      }
    }
    expect(fora).toEqual([]);
    // Guarda contra alguém trocar o canvas e esquecer a geometria.
    expect(CANVAS.largura / CANVAS.altura).toBeCloseTo(16 / 9, 6);
  });
});
