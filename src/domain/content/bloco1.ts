/**
 * BLOCO 1 — O PRIMEIRO DIA
 *
 * Lugar único: Escritório (base recorrente — NUNCA concluído, porque a Ana
 * volta aqui nos Blocos 3 e 5).
 *
 * Desenho da cena: o puzzle da senha é SOCIAL, não lógico. O notebook só
 * responde depois dos três NPCs conversados; antes disso devolve a narração
 * de senha inválida do roteiro. Nenhum NPC tem a resposta inteira.
 *
 * `notebook` abre o puzzle; `notebook-aberto` é o depois — só responde com o
 * puzzle 'senha' resolvido, e é ele que concede senha, skills e o Cafezinho.
 * Os dois são `umaVezSo` para que um clique repetido não reabra (e portanto
 * não rebaixe de 'resolvido' para 'liberado') o puzzle no meio da fala.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B1: readonly Cena[] = [
  {
    lugarId: 'escritorio',
    bloco: 1,
    aberturaTexto:
      'Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está olhando.',
    ecoTexto: 'Aqui eu falei com três pessoas pra digitar onze caracteres.',
    hotspots: [
      {
        id: 'notebook',
        rotulo: 'Notebook',
        pos: { x: 29, y: 74 },
        parada: { x: 33, y: 84 },
        requerHotspotsFeitos: ['tiago', 'claudia', 'rafael'],
        bloqueadoTexto:
          'Senha inválida. Ana olha em volta. Ninguém vai resolver isso pra ela.',
        umaVezSo: true,
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'senha' }],
      },
      {
        id: 'tiago',
        rotulo: 'Tiago',
        pos: { x: 14, y: 45 },
        parada: { x: 19, y: 56 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-tiago' }],
      },
      {
        id: 'claudia',
        rotulo: 'Cláudia',
        pos: { x: 52, y: 41 },
        parada: { x: 56, y: 53 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-claudia' }],
      },
      {
        id: 'rafael',
        rotulo: 'Rafael',
        pos: { x: 79, y: 49 },
        parada: { x: 74, y: 61 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-rafael' }],
      },
      {
        id: 'notebook-aberto',
        rotulo: 'Tela aberta',
        pos: { x: 36, y: 65 },
        parada: { x: 33, y: 84 },
        requerPuzzleResolvido: 'senha',
        bloqueadoTexto: 'A tela de login continua ali, esperando os três campos.',
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A tela abre. É só uma área de trabalho vazia. E ainda assim é a coisa mais importante que aconteceu hoje.',
          },
          { tipo: 'concederItem', itemId: 'senha' },
          { tipo: 'concederSkill', skillId: 'coragem-perguntar' },
          { tipo: 'concederSkill', skillId: 'autoconhecimento' },
          { tipo: 'destravarLugar', lugarId: 'cafezinho' },
          { tipo: 'blocoConcluido' },
        ],
      },
    ],
  },
];

/**
 * Os três diálogos são curtos de propósito: o NPC entrega a PISTA e um gancho,
 * e para. O tema (medo de perguntar, vocabulário, rede) é desenvolvido pelo
 * apresentador — ver os blocos "Gancho de fala" em docs/roteiro/01-bloco-1.md.
 *
 * Cada NPC ainda diz a pista dele de forma literal e inequívoca (`ERI`, `DT7`,
 * `01`), senão o puzzle da senha fica insolúvel ao vivo.
 */
export const DIALOGOS_B1: Record<DialogoId, Dialogo> = {
  /** Tiago resolve um terço e passa a bola pra Cláudia. Pista: ERI. */
  'b1-tiago': {
    id: 'b1-tiago',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Ah, a nova! Senha de primeiro acesso tá no e-mail de boas-vindas.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Eu não consigo abrir o e-mail sem a senha.' },
      { tipo: 'fala', quem: 'tiago', texto: '(pausa) É. Todo mundo cai nessa.' },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto:
          'O prefixo é fixo: ERI, pra todo mundo. O do meio é o código do teu time — isso é com a Cláudia, tua líder.',
      },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'E o último é o dia que você entrou. (volta pro rack) Ninguém chega sabendo.',
      },
    ],
  },

  /** Cláudia para, mas por pouco tempo. A diferença com o Bloco 3 é o ponto. Pista: DT7. */
  'b1-claudia': {
    id: 'b1-claudia',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'Oi, você é a estagiária nova. Cláudia.' },
      { tipo: 'fala', quem: 'ana', texto: 'Ana. Preciso do código do time, pra senha.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'DT7 — Data & Transformation, sétimo squad. (para, volta meio metro) O que te trouxe pra cá?',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Queria ver como é na prática. A faculdade é muito teórica.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Hm. (anota mentalmente e sai) Bom primeiro dia.',
      },
    ],
  },

  /** Rafael: a ponte social. Deixa o cartão — item tardio nº 1. Pista: 01. */
  'b1-rafael': {
    id: 'b1-rafael',
    nos: [
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Você tá há quarenta minutos naquela tela, né? Relaxa, eu fiquei uma hora e vinte.',
      },
      { tipo: 'fala', quem: 'ana', texto: '(constrangida) Tanto assim?' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Rafael, Dados. O último campo é o dia que você entrou: hoje, dia 01, dois dígitos.',
      },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: '(escreve o ramal atrás de um cartão) Qualquer coisa que travar, me chama. Sério.',
      },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Primeiro dia é sobre conhecer gente, não sobre produzir nada.',
      },
    ],
    efeitos: [{ tipo: 'concederItem', itemId: 'cartao-rafael' }],
  },
};
