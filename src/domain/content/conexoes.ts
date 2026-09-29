/**
 * As quatro conexões do clímax, na ordem em que o apresentador as dispara —
 * uma por clique, nunca por timer.
 *
 * As três primeiras saem de itens tardios e são PORTAS: indicação social,
 * competência, visibilidade. Elas se apagam da barra ao conectar.
 * A quarta sai do painel de skills e é o MOTIVO. Ela permanece acesa — é a tese.
 *
 * Parâmetros contra a compressão do Teams: linha grossa de alto contraste,
 * traçado lento. Fonte de verdade: docs/roteiro/05-bloco-5.md.
 */
import type { Conexao } from '../types';

export const CONEXOES: readonly Conexao[] = [
  {
    origem: { tipo: 'item', itemId: 'cartao-rafael' },
    viaLugar: 'escritorio',
    texto: 'Perguntaram ao Rafael se ele conhecia alguém. Ele disse seu nome.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    origem: { tipo: 'item', itemId: 'certificado-degree' },
    viaLugar: 'sala-treinamento',
    texto: 'A vaga pede Arquitetura de Sistemas. Ela concluiu há um ano e sete meses.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    origem: { tipo: 'item', itemId: 'cracha-innovation' },
    viaLugar: 'innovation',
    texto: 'Na conversa de ontem, duas pessoas do Innovation lembravam dela.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    origem: { tipo: 'skill', skillId: 'proatividade' },
    viaLugar: 'laboratorio',
    texto:
      'Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu.\n' +
      '"Guardei seu nome."',
    // A skill NÃO se apaga. É o que sobra na tela quando a barra sai.
    consomeOrigem: false,
    espessura: 10,
    duracaoMs: 1200,
  },
];
