/**
 * BLOCO 5 — A chance aparece.
 *
 * Uma cena: Escritório, enquadramento idêntico ao do Bloco 1 de propósito — a
 * única coisa diferente é a postura dela. Falas copiadas de
 * docs/roteiro/05-bloco-5.md.
 *
 * O diálogo 'b5-notebook' termina em `irParaRevelacao`: é a ÚNICA transição
 * automática da apresentação inteira, e acontece no fim do diálogo (a store
 * aplica `Dialogo.efeitos` quando o último nó passa), nunca por timer.
 *
 * 'b5-fecho' não é disparado por hotspot: a tela de revelação o usa depois da
 * quarta conexão, quando `ana-futura` entra. A versão futura não responde e
 * não há nó de narração depois da pergunta — o gesto de apontar pro mapa é da
 * tela, e o roteiro pede "sem texto" nos 5 segundos de sustentação.
 *
 * Falas curtas por decisão: o NPC PLANTA, o apresentador DESENVOLVE. O corpo do
 * e-mail cabe em duas linhas, e a linha dos "três lugares" fica intacta porque
 * é o setup das três conexões da revelação.
 */
import { NOME_PROTAGONISTA } from '../types';
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B5: readonly Cena[] = [
  {
    lugarId: 'escritorio',
    bloco: 5,
    aberturaTexto: 'Dois anos. O contrato fecha em três semanas. Ninguém falou nada sobre isso.',
    ecoTexto:
      'Mesma mesa. Mesmo notebook. Mesmo enquadramento. A única coisa diferente é a postura dela.',
    hotspots: [
      {
        id: 'notebook',
        rotulo: 'Notebook',
        pos: { x: 46, y: 52 },
        parada: { x: 44, y: 74 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b5-notebook' }],
      },
    ],
  },
];

export const DIALOGOS_B5: Record<DialogoId, Dialogo> = {
  'b5-notebook': {
    id: 'b5-notebook',
    nos: [
      {
        // Dois segundos que dizem dois anos.
        tipo: 'fala',
        quem: 'narrador',
        texto: `${NOME_PROTAGONISTA} senta. A tela abre sem senha — ela digita de cor, sem olhar.`,
      },
      {
        tipo: 'fala',
        quem: 'sistema',
        texto: 'De: Cláudia Reis · Assunto: Vaga — Engenharia de Plataforma',
      },
      {
        tipo: 'fala',
        quem: 'sistema',
        texto: 'Abriu uma posição no time de Plataforma. É efetivação, não é estágio.',
      },
      {
        // A linha dos "três lugares" é o setup das três conexões do clímax.
        tipo: 'fala',
        quem: 'sistema',
        texto:
          'Seu nome apareceu em três lugares diferentes na conversa de ontem. Você tem interesse?',
      },
      { tipo: 'fala', quem: 'ana', texto: '(baixo) Três lugares?' },
    ],
    // A cena dissolve e o mapa entra. Única transição automática da apresentação.
    efeitos: [{ tipo: 'irParaRevelacao' }],
  },

  // Fecho: usado pela tela de revelação, não por hotspot.
  'b5-fecho': {
    id: 'b5-fecho',
    nos: [{ tipo: 'fala', quem: 'ana', texto: 'Eu fui efetivada?' }],
  },
};
