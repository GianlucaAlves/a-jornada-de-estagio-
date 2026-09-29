/**
 * BLOCO 4 — Mostrar o que fez.
 *
 * Uma cena: Sala de Reuniões. Falas copiadas de docs/roteiro/04-bloco-4.md.
 *
 * O hotspot 'entrega' é o único do projeto que NÃO dá retorno nenhum: concede
 * o item e dispara `iniciarPausaBloco4`, e nada mais. Sem narração, sem skill,
 * sem texto. A ausência de feedback É a mensagem — qualquer linha aqui destrói
 * o bloco (spec: "A pausa do Bloco 4", requisito mecânico, não direção).
 * Por isso também é o único hotspot com `umaVezSo`: reclicar reiniciaria a
 * pausa no meio da fala do apresentador.
 *
 * Os gates por `requerHotspotsFeitos` mantêm a ordem do roteiro
 * (entrega → silêncio → Cláudia → Bianca → mensagem do Marcos). `hotspotsFeitos`
 * não é zerado entre blocos, então cada gate aponta para um id exclusivo deste
 * bloco quando isso importa.
 */
import { NOME_PROTAGONISTA } from '../types';
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B4: readonly Cena[] = [
  {
    lugarId: 'sala-reunioes',
    bloco: 4,
    aberturaTexto:
      'Um ano. Ela não é mais a estagiária nova. É só a estagiária. E hoje é a entrega dela.',
    ecoTexto: 'A TV continua acesa com o diagrama completo. A sala está vazia.',
    hotspots: [
      {
        id: 'tv',
        rotulo: 'TV / apresentação',
        pos: { x: 50, y: 32 },
        parada: { x: 44, y: 66 },
        // `umaVezSo` é obrigatório em quem abre puzzle: `abrirPuzzle` escreve
        // 'liberado', então um reclique depois de resolvido REBAIXARIA o puzzle
        // e desarmaria a porta de `entrega` (requerPuzzleResolvido: 'montar').
        umaVezSo: true,
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'montar' }],
      },
      {
        // Silêncio absoluto por requisito. Não adicionar narração aqui.
        id: 'entrega',
        rotulo: 'Entregar',
        pos: { x: 58, y: 42 },
        parada: { x: 52, y: 68 },
        requerPuzzleResolvido: 'montar',
        bloqueadoTexto: 'O diagrama ainda não está completo. Não tem nada pra mostrar.',
        umaVezSo: true,
        efeitos: [
          { tipo: 'concederItem', itemId: 'projeto-entregue' },
          { tipo: 'iniciarPausaBloco4' },
        ],
      },
      {
        id: 'claudia',
        rotulo: 'Cláudia',
        pos: { x: 26, y: 50 },
        parada: { x: 30, y: 74 },
        requerHotspotsFeitos: ['entrega'],
        bloqueadoTexto: 'Cláudia está com o notebook aberto, esperando a apresentação começar.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-claudia' }],
      },
      {
        id: 'bianca',
        rotulo: 'Bianca',
        pos: { x: 11, y: 48 },
        parada: { x: 19, y: 76 },
        requerHotspotsFeitos: ['entrega'],
        bloqueadoTexto: 'A porta está vazia.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-bianca' }],
      },
      {
        // Último hotspot do bloco: fecha a Sala de Reuniões (ver DIALOGOS_B4).
        id: 'notebook',
        rotulo: 'Notebook',
        pos: { x: 72, y: 58 },
        parada: { x: 68, y: 76 },
        requerHotspotsFeitos: ['bianca'],
        bloqueadoTexto: 'O notebook aberto na mesa. Nenhuma notificação nova.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-notebook' }],
      },
    ],
  },
];

export const DIALOGOS_B4: Record<DialogoId, Dialogo> = {
  'b4-claudia': {
    id: 'b4-claudia',
    nos: [
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Bom trabalho. (já de pé, notebook debaixo do braço)',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Obrigada.' },
      { tipo: 'fala', quem: 'claudia', texto: 'Manda no canal do time depois, pra galera ver.' },
      { tipo: 'fala', quem: 'narrador', texto: 'E sai.' },
    ],
  },

  'b4-bianca': {
    id: 'b4-bianca',
    nos: [
      { tipo: 'fala', quem: 'bianca', texto: 'Ouvi que era hoje. Como foi?' },
      { tipo: 'fala', quem: 'ana', texto: 'Foi bem. Acho.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: `(entra, olha o diagrama) Isso é bom, ${NOME_PROTAGONISTA}. Isso é bom de verdade.`,
      },
      { tipo: 'fala', quem: 'ana', texto: 'Ninguém falou nada.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Quem ia falar?' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Quem tava naquela sala? Quatro pessoas que já sabiam do projeto. Quem não tava? Todo mundo que decide alguma coisa sobre você.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ela senta na beirada da mesa.' },
      {
        // Callback do par nº 3 do puzzle do Bloco 2.
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Lembra o dia que você ligou as quatro trilhas no guardanapo? Você mesma escreveu que não sabia explicar o que fazia pra quem não é técnico. Isso foi um ano atrás.',
      },
      { tipo: 'fala', quem: 'ana', texto: '(pausa) Eu nunca fiz essa trilha.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Não. Você fez as outras três.' },
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: `Bianca lista, e ${NOME_PROTAGONISTA} anota.`,
      },
      { tipo: 'fala', quem: 'bianca', texto: 'Três coisas, e nenhuma delas é se vender.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Um: conta o que você fez em termos de quem escuta. Não "implementei verificação de idempotência". "Cliente não é mais cobrado duas vezes."',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Dois: conta pra quem não estava na sala. O canal do time, o fórum, a pessoa que te perguntou no café. Não é puxar o saco de ninguém — é deixar rastro.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Três: escreve onde você quer estar em dois anos. (pausa) Porque se você não escrever, alguém escreve pra você.',
      },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'visibilidade' },
      { tipo: 'concederSkill', skillId: 'plano-futuro' },
    ],
  },

  // Planta o mecanismo do Bloco 5: é a primeira vez que o notebook recebe algo.
  'b4-notebook': {
    id: 'b4-notebook',
    nos: [
      { tipo: 'fala', quem: 'narrador', texto: 'Uma notificação discreta no canto da tela.' },
      {
        tipo: 'fala',
        quem: 'marcos',
        texto: `${NOME_PROTAGONISTA}! Vi o que você postou no canal. Isso resolve o problema do retry inteiro? Posso levar pro Innovation Day de novembro como caso?`,
      },
    ],
    efeitos: [
      {
        tipo: 'narrar',
        texto:
          'O trabalho era o mesmo antes e depois do parágrafo que ela escreveu. O que mudou foi quanta gente sabia que ele existia.',
      },
      { tipo: 'concluirLugar', lugarId: 'sala-reunioes' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
