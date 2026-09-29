/**
 * GEOMETRIA DO MAPA — o enquadramento dos seis slots, verificado por aritmética.
 *
 * O defeito que este teste tranca: as posições de LUGARES são % do canvas
 * CHEIO, e o canvas cheio não está livre. Aplicadas direto, duas slots ficam
 * atrás do painel de skills e uma tem o rótulo cortado pela barra de itens.
 * `posicaoEnquadrada` mapeia as coordenadas para a área livre; aqui se prova
 * que o retângulo inteiro de cada slot (moldura e rótulo) cai dentro dela, que
 * nenhum par de slots se sobrepõe, e que a ordem relativa dos lugares é a
 * declarada no conteúdo.
 *
 * Nada aqui renderiza: é a mesma função que a tela usa, medida em px de canvas.
 */
import { LUGARES } from '../domain/content';
import type { LugarId } from '../domain/types';
import { CANVAS } from '../styles/tokens';
import { ENQUADRAMENTO, posicaoEnquadrada } from './Mapa';

const IDS = Object.keys(LUGARES) as LugarId[];

interface Retangulo {
  id: LugarId;
  cx: number;
  cy: number;
  esquerda: number;
  direita: number;
  topo: number;
  base: number;
}

/** Retângulo do slot em px de canvas, ancorado pelo centro. */
function retangulo(id: LugarId): Retangulo {
  const pos = posicaoEnquadrada(LUGARES[id].pos);
  const cx = (pos.x / 100) * CANVAS.largura;
  const cy = (pos.y / 100) * CANVAS.altura;
  const { largura, altura } = ENQUADRAMENTO.slot;
  return {
    id,
    cx,
    cy,
    esquerda: cx - largura / 2,
    direita: cx + largura / 2,
    topo: cy - altura / 2,
    base: cy + altura / 2,
  };
}

const RETANGULOS: readonly Retangulo[] = IDS.map(retangulo);

/** Faixas dos overlays persistentes: PainelDeSkills.tsx e BarraDeItens.tsx. */
const PAINEL_ESQUERDA = CANVAS.largura - 420;
const BARRA_TOPO = CANVAS.altura - 190;

describe('enquadramento dos slots do mapa', () => {
  it('os seis lugares são enquadrados', () => {
    expect(RETANGULOS).toHaveLength(6);
  });

  it('nenhum slot invade a faixa do painel de skills', () => {
    const invasores = RETANGULOS.filter((r) => r.direita > PAINEL_ESQUERDA).map((r) => r.id);
    expect(invasores).toEqual([]);
  });

  it('nenhum slot invade a faixa da barra de itens', () => {
    const invasores = RETANGULOS.filter((r) => r.base > BARRA_TOPO).map((r) => r.id);
    expect(invasores).toEqual([]);
  });

  it('todo slot cabe inteiro dentro da caixa livre declarada', () => {
    const { esquerda, direita, topo, base } = ENQUADRAMENTO.livre;
    const fora = RETANGULOS.filter(
      (r) => r.esquerda < esquerda || r.direita > direita || r.topo < topo || r.base > base,
    ).map((r) => r.id);
    expect(fora).toEqual([]);
  });

  it('a caixa livre exclui de fato as duas faixas', () => {
    expect(ENQUADRAMENTO.livre.direita).toBeLessThanOrEqual(PAINEL_ESQUERDA);
    expect(ENQUADRAMENTO.livre.base).toBeLessThanOrEqual(BARRA_TOPO);
  });

  it('nenhum par de slots se sobrepõe', () => {
    const sobrepostos: string[] = [];
    for (let i = 0; i < RETANGULOS.length; i += 1) {
      for (let j = i + 1; j < RETANGULOS.length; j += 1) {
        const a = RETANGULOS[i];
        const b = RETANGULOS[j];
        if (!a || !b) continue;
        const cruzaX = a.esquerda < b.direita && b.esquerda < a.direita;
        const cruzaY = a.topo < b.base && b.topo < a.base;
        if (cruzaX && cruzaY) sobrepostos.push(`${a.id} × ${b.id}`);
      }
    }
    expect(sobrepostos).toEqual([]);
  });

  it('o enquadramento preserva a ordem relativa declarada em LUGARES', () => {
    const porX = [...IDS].sort((a, b) => LUGARES[a].pos.x - LUGARES[b].pos.x);
    const porY = [...IDS].sort((a, b) => LUGARES[a].pos.y - LUGARES[b].pos.y);
    const enquadradoPorX = [...RETANGULOS].sort((a, b) => a.cx - b.cx).map((r) => r.id);
    const enquadradoPorY = [...RETANGULOS].sort((a, b) => a.cy - b.cy).map((r) => r.id);
    expect(enquadradoPorX).toEqual(porX);
    expect(enquadradoPorY).toEqual(porY);
  });

  it('o enquadramento usa a caixa inteira: há slot em cada extremo', () => {
    const { esquerda, direita, topo, base } = ENQUADRAMENTO.livre;
    expect(Math.min(...RETANGULOS.map((r) => r.esquerda))).toBeCloseTo(esquerda, 6);
    expect(Math.max(...RETANGULOS.map((r) => r.direita))).toBeCloseTo(direita, 6);
    expect(Math.min(...RETANGULOS.map((r) => r.topo))).toBeCloseTo(topo, 6);
    expect(Math.max(...RETANGULOS.map((r) => r.base))).toBeCloseTo(base, 6);
  });
});
