/**
 * GEOMETRIA DA CENA — onde cada hotspot ocupa espaço, em px de canvas.
 *
 * Módulo separado (e sem JSX) por um motivo prático: `Cena.tsx` usa isto para
 * desenhar e `Cena.geometria.test.ts` usa isto para PROVAR que o desenho não
 * se atropela. Se a conta vivesse dentro do componente, o teste precisaria
 * renderizar React em ambiente `node` só para medir dois retângulos.
 *
 * O defeito que estas contas trancam é o da versão anterior: hotspot era um
 * `<button>` com `minWidth: 260` e o rótulo dentro, e três deles se
 * sobrepunham em cena. Com retângulo de texto isso já era ruim; com sprite, um
 * cobrindo o outro significa NPC invisível — e NPC invisível é a regressão que
 * esta frente existe para consertar.
 */
import type { ArteDeHotspot, Hotspot, Ponto } from '../domain/types';
import { CANVAS, alvo, arte, espaco, overlay } from '../styles/tokens';

export interface Retangulo {
  esquerda: number;
  direita: number;
  topo: number;
  base: number;
}

export interface Tamanho {
  largura: number;
  altura: number;
}

/**
 * Onde a Ana entra em qualquer cena. Sem pathfinding: só um ponto de partida.
 *
 * Vive aqui, e não em `Cena.tsx`, porque é geometria como qualquer hotspot: o
 * teste precisa provar que a Ana não nasce materializada dentro de um NPC, e
 * esse defeito só aparece no primeiro segundo da cena — ou seja, na frente da
 * plateia, porque quem ensaia já clicou antes de olhar.
 */
export const POSICAO_DE_ENTRADA: Ponto = { x: 6, y: 76 };

/** % do canvas → px de canvas. Conteúdo fala em %, a tela fala em px. */
export function paraPx(pos: Ponto): Ponto {
  return {
    x: (pos.x / 100) * CANVAS.largura,
    y: (pos.y / 100) * CANVAS.altura,
  };
}

/**
 * Tamanho da arte de um hotspot.
 *
 * NPC e item saem da escala única da bíblia §2.1; só objeto declara o próprio
 * recorte. Escala misturada na mesma tela é o erro de pixel art que mais
 * salta aos olhos, então esta função é o único lugar que decide tamanho.
 */
export function tamanhoDaArte(a: ArteDeHotspot): Tamanho {
  switch (a.tipo) {
    case 'npc':
      return { largura: arte.personagem.largura, altura: arte.personagem.altura };
    case 'item':
      return { largura: arte.item.largura, altura: arte.item.altura };
    case 'objeto':
      return { largura: a.largura, altura: a.altura };
  }
}

/**
 * Folga invisível em volta da arte para que o alvo de clique nunca fique
 * abaixo de `alvo.minimo`.
 *
 * É padding, NUNCA sprite esticado: a apresentação é ao vivo e sob pressão,
 * então alvo apertado é bug — mas arte de 24px inflada a 64px é papa borrada.
 */
export function folgaDeAlvo(tamanho: Tamanho): number {
  const faltaX = alvo.minimo - tamanho.largura;
  const faltaY = alvo.minimo - tamanho.altura;
  const falta = Math.max(faltaX, faltaY);
  return falta <= 0 ? 0 : Math.ceil(falta / 2);
}

/** Retângulo que uma arte ocupa, dada a âncora do conteúdo. */
export function retangulo(pos: Ponto, tamanho: Tamanho, ancora: 'base' | 'centro'): Retangulo {
  const { x, y } = paraPx(pos);
  const topo = ancora === 'base' ? y - tamanho.altura : y - tamanho.altura / 2;
  return {
    esquerda: x - tamanho.largura / 2,
    direita: x + tamanho.largura / 2,
    topo,
    base: topo + tamanho.altura,
  };
}

/** Retângulo do hotspot na tela. */
export function retanguloDoHotspot(h: Hotspot): Retangulo {
  return retangulo(h.pos, tamanhoDaArte(h.arte), h.ancora ?? 'base');
}

/**
 * Retângulo da protagonista parada num ponto. Ela ancora pelos pés — o
 * `Protagonista` posiciona por rodapé, e é isso que faz o elenco assentar no
 * piso em vez de flutuar sobre ele.
 */
export function retanguloDaProtagonista(pos: Ponto): Retangulo {
  return retangulo(pos, arte.personagem, 'base');
}

export function intersectam(a: Retangulo, b: Retangulo): boolean {
  return (
    a.esquerda < b.direita && b.esquerda < a.direita && a.topo < b.base && b.topo < a.base
  );
}

export function dentroDoCanvas(r: Retangulo): boolean {
  return r.esquerda >= 0 && r.topo >= 0 && r.direita <= CANVAS.largura && r.base <= CANVAS.altura;
}

/**
 * Faixas que a UI fixa ocupa por cima da cena.
 *
 * Todas desenham ACIMA da camada de hotspot, e as três primeiras também
 * comem o clique. Hotspot debaixo de qualquer uma delas é clique morto — e
 * "hotspot que não responde é considerado bug" é regra do projeto, não gosto.
 *
 * As larguras são folgadas de propósito: o título e os botões dimensionam por
 * conteúdo, e medir texto aqui seria inventar precisão que não temos. Errar
 * para o lado de proibir área demais custa nada; errar para menos devolve o
 * clique morto.
 */
export const FAIXAS_DE_OVERLAY: readonly { nome: string; area: Retangulo }[] = [
  {
    nome: 'botão Voltar ao mapa',
    area: { esquerda: espaco.margem, direita: espaco.margem + 384, topo: espaco.margem, base: 160 },
  },
  {
    nome: 'título do lugar',
    area: {
      esquerda: CANVAS.largura / 2 - 450,
      direita: CANVAS.largura / 2 + 450,
      topo: espaco.margem,
      base: 160,
    },
  },
  {
    nome: 'botão Avançar',
    area: { esquerda: CANVAS.largura - 400, direita: CANVAS.largura, topo: 0, base: 120 },
  },
  {
    nome: 'painel de skills',
    area: {
      esquerda: CANVAS.largura - overlay.painelDeSkills,
      direita: CANVAS.largura,
      topo: 120,
      base: CANVAS.altura - overlay.barraDeItens - espaco.md,
    },
  },
  {
    nome: 'barra de itens',
    area: {
      esquerda: 0,
      direita: CANVAS.largura,
      topo: CANVAS.altura - overlay.barraDeItens,
      base: CANVAS.altura,
    },
  },
  {
    // Não come o clique (`pointerEvents: none`), mas cobre a arte: é legenda.
    nome: 'linha de nome do hotspot',
    area: {
      esquerda: CANVAS.largura / 2 - 500,
      direita: CANVAS.largura / 2 + 500,
      topo: CANVAS.altura - overlay.barraDeItens - overlay.linhaDeFoco,
      base: CANVAS.altura - overlay.barraDeItens,
    },
  },
];

/** Qual faixa de overlay cobre este retângulo, se alguma. */
export function faixaQueCobre(r: Retangulo): string | null {
  for (const faixa of FAIXAS_DE_OVERLAY) {
    if (intersectam(r, faixa.area)) return faixa.nome;
  }
  return null;
}
