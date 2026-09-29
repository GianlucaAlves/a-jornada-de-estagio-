/**
 * Paleta e tipos da camada de arte.
 *
 * Módulo FOLHA de propósito: não importa nada de dentro de src/arte. A arte
 * (personagens, cenários, itens) importa daqui, e `index.tsx` importa da arte.
 * Se a paleta morasse em `index.tsx`, o ciclo faria `PALETA` ser `undefined`
 * no momento em que os módulos de arte avaliassem o escopo de módulo, e a
 * camada inteira estouraria em runtime sem o typecheck acusar nada.
 *
 * Estilo travado (o mesmo de docs/prompts.md): flat vector, poucos tons, alto
 * contraste, zero gradiente e zero detalhe fino — restrições da compressão de
 * vídeo do Teams.
 */

export const PALETA = {
  ambiente: '#16242e',
  ambienteClaro: '#2e4654',
  superficie: '#eef2f4',
  superficieSombra: '#c3ced4',
  acento: '#ffd43b',
  acentoSombra: '#c9a521',
  contorno: '#0b141b',
  pele: ['#f0c9a6', '#c98d62', '#8d5a3b', '#5a3524'],
  peleSombra: ['#d3a781', '#a86f49', '#6e422a', '#40241a'],
  cabelo: ['#2b2018', '#4a3526', '#141414', '#8a8580'],
} as const;

export interface PropsArte {
  /** Largura de referência do quadro em px de canvas. */
  largura?: number;
  altura?: number;
  className?: string;
}
