/**
 * Agregador de conteúdo. Cada bloco vive num arquivo próprio para que cada
 * frente possa reescrever a própria fase sem tocar nas outras — e para que
 * várias mãos trabalhem em paralelo sem conflito de escrita.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

import { CENAS_B1, DIALOGOS_B1 } from './bloco1';
import { CENAS_B2, DIALOGOS_B2 } from './bloco2';
import { CENAS_B3, DIALOGOS_B3 } from './bloco3';
import { CENAS_B4, DIALOGOS_B4 } from './bloco4';
import { CENAS_B5, DIALOGOS_B5 } from './bloco5';
import { CENAS_B6, DIALOGOS_B6 } from './bloco6';

export {
  ITENS,
  SKILLS,
  LUGARES,
  NPCS,
  MENSAGEM_GENERICA,
  PERGUNTAS_FINAIS,
} from './base';
export { BLOCOS, CARTOES } from './blocos';
export { PUZZLES } from './puzzles';
export { CONEXOES } from './conexoes';

export const CENAS: readonly Cena[] = [
  ...CENAS_B1,
  ...CENAS_B2,
  ...CENAS_B3,
  ...CENAS_B4,
  ...CENAS_B5,
  ...CENAS_B6,
];

export const DIALOGOS: Record<DialogoId, Dialogo> = {
  ...DIALOGOS_B1,
  ...DIALOGOS_B2,
  ...DIALOGOS_B3,
  ...DIALOGOS_B4,
  ...DIALOGOS_B5,
  ...DIALOGOS_B6,
};
