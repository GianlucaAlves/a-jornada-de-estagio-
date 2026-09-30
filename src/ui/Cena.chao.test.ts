/**
 * O elenco pisa no chão, e não sobre o mobiliário.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * A revisão da conversão para pixel art encontrou oito figuras em pé SOBRE
 * móveis: a Ana sobre a mesa de reunião, a Ana e a Bianca sobre a mesa longa da
 * sala de treinamento. Nenhum teste pegou, e o motivo não foi desatenção —
 * foi uma lacuna estrutural. `Cena.geometria.test.ts` valida hotspot contra
 * hotspot e contra overlay, mas nunca viu o CENÁRIO; o gerador de cenário nunca
 * viu as coordenadas do conteúdo. Cada lado estava internamente coerente e o
 * defeito vivia exatamente na junta.
 *
 * COMO FUNCIONA
 * `scripts/exportar_chao.py` percorre a grade de cada cenário e escreve, por
 * coluna de pixel, a maior faixa contígua de piso disponível
 * (`docs/arte/chao.json`). Aqui convertemos cada coordenada de conteúdo (que é
 * % do canvas) para pixel de arte e exigimos que o pé caia dentro da faixa.
 *
 * Depois de mexer em cenário, rode o exportador de novo — senão este teste está
 * validando contra um piso que não existe mais.
 */
import { describe, expect, it } from 'vitest';

import chaoJson from '../../docs/arte/chao.json';
import { CENAS } from '../domain/content';
import type { Hotspot } from '../domain/types';
import { CANVAS } from '../styles/tokens';

interface MapaDeChao {
  largura: number;
  altura: number;
  cenas: Record<string, { topo: number[]; base: number[] }>;
}

/**
 * Importado como JSON e não lido por `fs`: o tsconfig restringe `types` a
 * `vitest/globals`, então `node:fs` não existe para o typecheck, e adicionar
 * `@types/node` só para um teste é imposto caro. `resolveJsonModule` já está
 * ligado.
 */
const CHAO = chaoJson as MapaDeChao;

/** % do canvas -> pixel da grade de arte do cenário. */
function paraArte(pos: { x: number; y: number }, mapa: MapaDeChao): { x: number; y: number } {
  return {
    x: Math.round((pos.x / 100) * mapa.largura),
    y: Math.round((pos.y / 100) * mapa.altura),
  };
}

function faixaEm(cena: string, x: number): { topo: number; base: number } | null {
  const m = CHAO.cenas[cena];
  if (!m) return null;
  const i = Math.min(Math.max(x, 0), CHAO.largura - 1);
  const topo = m.topo[i];
  const base = m.base[i];
  if (topo === undefined || base === undefined || topo < 0) return null;
  return { topo, base };
}

/**
 * Pontos em que uma FIGURA HUMANA apoia os pés numa cena.
 *
 * Objeto de cenário fica de fora de propósito: notebook apoiado em mesa de
 * madeira está correto, e exigir piso para ele daria falso positivo em todo
 * objeto que existe justamente porque há uma mesa ali.
 */
function pesHumanos(cena: (typeof CENAS)[number]): { rotulo: string; pos: { x: number; y: number } }[] {
  const pontos: { rotulo: string; pos: { x: number; y: number } }[] = [];
  for (const h of cena.hotspots as readonly Hotspot[]) {
    // a Ana caminha até `parada` e fica de pé lá, em qualquer hotspot
    pontos.push({ rotulo: `Ana em '${h.id}'`, pos: h.parada });
    // NPC é desenhado no próprio `pos`, ancorado pela base
    if (h.arte.tipo === 'npc' && (h.ancora ?? 'base') === 'base') {
      pontos.push({ rotulo: `NPC ${h.arte.npcId} ('${h.id}')`, pos: h.pos });
    }
  }
  return pontos;
}

describe('o elenco pisa no chão', () => {
  /**
   * O que importa não é QUANTAS cenas o mapa de chão tem, é que ele cubra todas
   * as que o conteúdo usa.
   *
   * Aqui havia a lista dos seis lugares da v1 escrita à mão, e ela reprovava por
   * aritmética antiga: a v2 tem cinco lugares, dois deles novos
   * (`linha-producao` e `outra-area`, ADR-009 e ADR-031), e o Cafezinho ganhou a
   * variação de festa da fase 6. Contagem fixa aqui também era o dono errado —
   * quantos lugares existem é contrato de conteúdo e está afirmado em
   * `src/domain/content/integridade.test.ts`. O que este arquivo tem de cobrar é
   * COBERTURA: cena sem mapa de piso não tem como ser validada, e uma figura em
   * pé sobre o mobiliário passaria em silêncio.
   *
   * Chave sobrando no mapa não reprova: o exportador pode gerar piso para
   * cenário que o conteúdo ainda não usa, e isso não fere ninguém.
   */
  it('o mapa de chão cobre todo lugar usado pelo conteúdo e casa com o canvas', () => {
    const doMapa = Object.keys(CHAO.cenas);
    expect(doMapa.length).toBeGreaterThan(0);

    const usados = [...new Set(CENAS.map((c) => c.lugarId))].sort();
    expect(usados.length).toBeGreaterThan(0);
    const semPiso = usados.filter((lugar) => !doMapa.includes(lugar));
    expect(semPiso, 'lugar com cena e sem mapa de piso: rode scripts/exportar_chao.py').toEqual(
      [],
    );

    // a grade de arte tem de ser o canvas dividido pela escala de 4x da bíblia
    expect(CHAO.largura * 4).toBe(CANVAS.largura);
    expect(CHAO.altura * 4).toBe(CANVAS.altura);
  });

  for (const cena of CENAS) {
    const nome = `${cena.lugarId} / B${cena.bloco}`;

    it(`${nome}: nenhuma figura de pé sobre móvel`, () => {
      const faltas: string[] = [];
      for (const { rotulo, pos } of pesHumanos(cena)) {
        const arte = paraArte(pos, CHAO);
        const faixa = faixaEm(cena.lugarId, arte.x);
        if (faixa === null) {
          faltas.push(`${rotulo}: coluna x=${arte.x} sem piso nenhum`);
          continue;
        }
        if (arte.y < faixa.topo) {
          faltas.push(
            `${rotulo}: pé em y=${arte.y} está ACIMA do piso ` +
              `(faixa ${faixa.topo}..${faixa.base}) — em pé sobre móvel ou no ar. ` +
              `Menor y válido: ${((faixa.topo / CHAO.altura) * 100).toFixed(1)}%`,
          );
        } else if (arte.y > faixa.base) {
          faltas.push(
            `${rotulo}: pé em y=${arte.y} está ABAIXO do piso ` +
              `(faixa ${faixa.topo}..${faixa.base}) — atrás do plano de frente. ` +
              `Maior y válido: ${((faixa.base / CHAO.altura) * 100).toFixed(1)}%`,
          );
        }
      }
      expect(faltas).toEqual([]);
    });
  }
});
