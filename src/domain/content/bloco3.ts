/**
 * BLOCO 3 — Proatividade e os projetos internos.
 *
 * Três cenas: Laboratório → Escritório (entrega) → Innovation.
 * Falas copiadas de docs/roteiro/03-bloco-3.md.
 *
 * Duas decisões de modelagem que valem registro:
 *
 * 1. O MONITOR DO LABORATÓRIO é a porta mais importante do projeto — o elo
 *    Bloco 2 → Bloco 3. Ele carrega `requerItemPresente: 'anotacoes-treinamento'`
 *    (defesa: se as anotações não estiverem no inventário, o hotspot devolve a
 *    narração de porta trancada em vez de abrir o puzzle) E `aceitaItem` com os
 *    efeitos da descoberta. O clique normal, sem item selecionado, devolve a
 *    mesma narração de porta trancada. Sem `umaVezSo`: marcar o monitor como
 *    feito no primeiro clique mataria silenciosamente o uso do item depois.
 *
 * 2. `abrirPuzzle` vive nos `efeitos` do DIÁLOGO, não do hotspot. A store
 *    aplica os efeitos do diálogo quando ele termina, então o puzzle entra
 *    depois da fala — se entrasse junto, o modal do puzzle cobriria a
 *    descoberta ("Esses dois sistemas não deveriam estar conversando nessa
 *    ordem"), que é justamente a batida que o Bloco 5 vai cobrar.
 */
import { NOME_PROTAGONISTA } from '../types';
import type { Cena, Dialogo, DialogoId } from '../types';

/** Porta trancada do leva-e-traz: clique normal e bloqueio usam o mesmo texto. */
const MONITOR_TRANCADO = `Linhas e linhas de texto. ${NOME_PROTAGONISTA} reconhece umas palavras. Não reconhece o que elas querem dizer juntas. — "Isso aqui não faz sentido nenhum."`;

export const CENAS_B3: readonly Cena[] = [
  // ------------------------------------------------------------ CENA A
  {
    lugarId: 'laboratorio',
    bloco: 3,
    aberturaTexto: 'Seis meses. Ela tem tarefas de verdade agora. Nenhuma delas é essa.',
    ecoTexto:
      'O log da madrugada continua rolando nos dois monitores. Agora ela sabe o que está lendo.',
    hotspots: [
      {
        id: 'monitor',
        rotulo: 'Monitor do log',
        pos: { x: 34, y: 42 },
        parada: { x: 34, y: 70 },
        // O elo. Sem as anotações, é só uma parede com texto.
        requerItemPresente: 'anotacoes-treinamento',
        bloqueadoTexto: MONITOR_TRANCADO,
        aceitaItem: 'anotacoes-treinamento',
        efeitosComItem: [
          { tipo: 'dialogo', dialogoId: 'b3-monitor-anotacoes' },
          { tipo: 'consumirItem', itemId: 'anotacoes-treinamento' },
        ],
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b3-monitor' }],
      },
      {
        id: 'tiago',
        rotulo: 'Tiago',
        pos: { x: 62, y: 46 },
        parada: { x: 56, y: 72 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b3-tiago' }],
      },
      {
        id: 'quadro-branco',
        rotulo: 'Quadro branco',
        pos: { x: 84, y: 40 },
        parada: { x: 79, y: 74 },
        requerPuzzleResolvido: 'sequenciar',
        bloqueadoTexto: 'Um quadro branco vazio. Ela ainda não tem o que escrever nele.',
        // Concessão única: o Relatório é consumido pela Cláudia na cena
        // seguinte, e sem `umaVezSo` um reclique aqui o ressuscitaria na barra.
        umaVezSo: true,
        efeitos: [
          { tipo: 'dialogo', dialogoId: 'b3-quadro-branco' },
          { tipo: 'concederItem', itemId: 'relatorio' },
          { tipo: 'concederSkill', skillId: 'proatividade' },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ CENA B
  // Base recorrente: leva-e-traz de alcance curto, ela volta à própria mesa.
  {
    lugarId: 'escritorio',
    bloco: 3,
    ecoTexto: 'Cláudia está de volta ao monitor. O relatório ficou na mesa dela.',
    hotspots: [
      {
        id: 'claudia',
        rotulo: 'Cláudia',
        pos: { x: 66, y: 44 },
        parada: { x: 60, y: 72 },
        aceitaItem: 'relatorio',
        efeitosComItem: [
          { tipo: 'dialogo', dialogoId: 'b3-claudia' },
          { tipo: 'concederSkill', skillId: 'protagonismo' },
          { tipo: 'consumirItem', itemId: 'relatorio' },
          { tipo: 'destravarLugar', lugarId: 'innovation' },
        ],
        efeitos: [
          {
            tipo: 'narrar',
            texto: 'Cláudia está na mesa dela, teclando. Ela não levanta a cabeça.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ CENA C
  {
    lugarId: 'innovation',
    bloco: 3,
    aberturaTexto:
      'Espaço aberto, post-its na parede, mesas redondas, gente em pé. Energia oposta à do Laboratório.',
    ecoTexto: 'Os post-its continuam na parede. A proposta dela entrou no registro do Innovation.',
    hotspots: [
      {
        id: 'marcos',
        rotulo: 'Marcos',
        pos: { x: 38, y: 45 },
        parada: { x: 38, y: 72 },
        // O diálogo termina em `abrirPuzzle`, que escreve 'liberado'. Sem
        // `umaVezSo`, um reclique depois de resolvido rebaixaria 'estruturar'
        // e desarmaria a porta do `mural` (requerPuzzleResolvido).
        umaVezSo: true,
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b3-marcos' }],
      },
      {
        id: 'mural',
        rotulo: 'Mural de post-its',
        pos: { x: 72, y: 36 },
        parada: { x: 69, y: 70 },
        requerPuzzleResolvido: 'estruturar',
        bloqueadoTexto: 'Post-its de outras pessoas, todos preenchidos. O dela está em branco.',
        efeitos: [
          { tipo: 'dialogo', dialogoId: 'b3-mural' },
          { tipo: 'concederItem', itemId: 'cracha-innovation' },
        ],
      },
      {
        // Reaparição 3. Último hotspot do bloco: fecha o Laboratório e o
        // Innovation e destrava a Sala de Reuniões (ver DIALOGOS_B3['b3-rafael']).
        id: 'rafael',
        rotulo: 'Rafael',
        pos: { x: 86, y: 48 },
        parada: { x: 80, y: 74 },
        requerHotspotsFeitos: ['mural'],
        bloqueadoTexto: 'Rafael está no fundo, de costas, conversando com outras duas pessoas.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b3-rafael' }],
      },
    ],
  },
];

export const DIALOGOS_B3: Record<DialogoId, Dialogo> = {
  // Clique normal no monitor: a porta trancada.
  'b3-monitor': {
    id: 'b3-monitor',
    nos: [
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: `Linhas e linhas de texto. ${NOME_PROTAGONISTA} reconhece umas palavras. Não reconhece o que elas querem dizer juntas.`,
      },
      { tipo: 'fala', quem: 'ana', texto: 'Isso aqui não faz sentido nenhum.' },
    ],
  },

  'b3-tiago': {
    id: 'b3-tiago',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Esse erro aí? Deixa. Ele aparece toda madrugada há uns oito meses.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'E ninguém olha?' },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto:
          'A gente reprocessa na mão de manhã e segue o jogo. (dá de ombros) Entrou no orçamento da rotina.',
      },
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: `${NOME_PROTAGONISTA} pede acesso ao histórico completo.`,
      },
      { tipo: 'fala', quem: 'tiago', texto: 'Pra quê? Ninguém pediu isso pra você.' },
      { tipo: 'fala', quem: 'ana', texto: 'Ninguém pediu pra eu não olhar também.' },
      { tipo: 'fala', quem: 'tiago', texto: '(pausa, depois ri) Tá liberado.' },
    ],
  },

  // O elo. O puzzle abre no fim desta fala, não junto com ela.
  'b3-monitor-anotacoes': {
    id: 'b3-monitor-anotacoes',
    nos: [
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: `${NOME_PROTAGONISTA} abre o caderno na página de fluxo entre serviços. Olha o log. Olha o caderno. Olha o log de novo.`,
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'Espera. Esses dois sistemas não deveriam estar conversando nessa ordem.',
      },
    ],
    efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'sequenciar' }],
  },

  'b3-quadro-branco': {
    id: 'b3-quadro-branco',
    nos: [
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: `${NOME_PROTAGONISTA} escreve cinco páginas num domingo à noite. Ninguém pediu. Ninguém vai cobrar. Ninguém sabe que ela está fazendo.`,
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: '(pra si mesma) E se ela achar que eu tô passando por cima de alguém?',
      },
    ],
  },

  'b3-claudia': {
    id: 'b3-claudia',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'O que é isso?' },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'É o erro da madrugada. Aquele que a gente reprocessa na mão.',
      },
      { tipo: 'fala', quem: 'claudia', texto: '(folheando) Quem te pediu isso?' },
      { tipo: 'fala', quem: 'ana', texto: 'Ninguém.' },
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: 'Cláudia continua folheando. Chega na última página. Fecha.',
      },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'O retry não é idempotente. Oito meses. (olha pra ela) Ninguém tinha pedido isso.',
      },
      { tipo: 'fala', quem: 'claudia', texto: 'Guardei seu nome.' },
      { tipo: 'fala', quem: 'narrador', texto: 'Ela volta pro monitor. A conversa acabou.' },
    ],
  },

  'b3-marcos': {
    id: 'b3-marcos',
    nos: [
      { tipo: 'fala', quem: 'marcos', texto: 'Você é a do relatório do retry!' },
      { tipo: 'fala', quem: 'ana', texto: '(desconcertada) Como você...' },
      {
        tipo: 'fala',
        quem: 'marcos',
        texto:
          'A Cláudia comentou numa reunião. (sorri) Olha, achar o problema é metade. Você quer que alguém conserte?',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Quero.' },
      {
        tipo: 'fala',
        quem: 'marcos',
        texto: 'Então você não precisa de um relatório. Precisa de uma proposta. É diferente.',
      },
    ],
    efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'estruturar' }],
  },

  'b3-mural': {
    id: 'b3-mural',
    nos: [
      {
        tipo: 'fala',
        quem: 'marcos',
        texto: 'Pronto. Agora é uma proposta. Antes era uma reclamação bem pesquisada.',
      },
    ],
  },

  'b3-rafael': {
    id: 'b3-rafael',
    nos: [
      { tipo: 'fala', quem: 'rafael', texto: 'Não acredito que você tá aqui.' },
      { tipo: 'fala', quem: 'ana', texto: 'Eu também não.' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: '(aponta o crachá dela) Guarda esse. Eu tenho os meus três.',
      },
    ],
    efeitos: [
      {
        tipo: 'narrar',
        texto:
          'Ela entrou no Laboratório pra não olhar um erro. Saiu com um relatório, uma proposta registrada, e um crachá de cordão torto.',
      },
      { tipo: 'destravarLugar', lugarId: 'sala-reunioes' },
      { tipo: 'concluirLugar', lugarId: 'laboratorio' },
      { tipo: 'concluirLugar', lugarId: 'innovation' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
