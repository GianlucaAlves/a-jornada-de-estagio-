/**
 * FASE 4 — saber se vender (apresenta: Gianluca).
 *
 * Lugar único: Sala de Reuniões, que é ONDE A INNOVATION WEEK ACONTECE. Não é
 * laboratório e não é lugar separado: Innovation Week é o nome do evento em que
 * estagiários apresentam o que fizeram e que gerou impacto (ADR-026). Três nomes
 * que eram três lugares viraram um.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ A PAUSA É O BEAT MAIS DELICADO DO JOGO, e é o fecho do laço (ADR-025).   │
 * │                                                                          │
 * │ `b4-entrega` é o único hotspot do projeto que NÃO devolve retorno nenhum: │
 * │ sem narração, sem skill, sem texto. Só concede o crachá e liga a PAUSA.   │
 * │ A ausência de feedback É a mensagem, e ela só funciona porque vem         │
 * │ imediatamente depois do momento de maior satisfação — é por isso que o    │
 * │ `montar` precisa ser gostoso de resolver.                                │
 * │                                                                          │
 * │ NÃO ACRESCENTE NARRAÇÃO AQUI. Qualquer linha destrói a fase.              │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * A ORDEM DOS QUATRO BEATS é presa por porta, não por confiança: apresentar →
 * entregar → silêncio → Cláudia → Bianca. Cada porta tem texto próprio, porque
 * hotspot que responde com silêncio parece travamento no palco.
 *
 * O CRACHÁ É TARDIO e não é sinalizado de forma nenhuma. Ele nasce aqui por ser
 * o crachá de participante do evento, e é justamente por isso que a fase da
 * visibilidade é a que o entrega: a porta que ele abre no clímax conta uma
 * história limpa.
 *
 * A LIÇÃO NÃO ESTÁ NA BOCA DE NINGUÉM. A Cláudia dá quatro palavras e uma
 * instrução, saindo; a Bianca vira a mesa em seis linhas e para. As três coisas
 * de comunicação — contar em termos de quem escuta, contar para quem não estava
 * na sala, escrever onde você quer estar — são fala do apresentador
 * (docs/roteiro/04-bloco-4.md §6). O sistema concede `visibilidade` sem que
 * nenhum NPC a explique, de propósito.
 *
 * O QUE SAIU, e é decisão, não esquecimento: a notificação do Marcos (§7 do
 * roteiro antigo) plantava o mecanismo de mensagem da fase 5 e convidava a Ana
 * para o Innovation Day. Os dois motivos morreram: a Innovation Week É esta sala
 * (ADR-026), então não há para onde convidar, e a fase 5 passou a ter o painel
 * de skills como mecânica (ADR-024), então não há mensagem para plantar.
 *
 * COORDENADAS — a Sala de Reuniões é o cenário mais apertado do projeto, porque
 * a mesa oval cobre o meio inteiro e o corredor da frente só tem piso ABAIXO da
 * barra de itens. A janela válida para figura humana (piso ∩ canvas ∩ overlays)
 * é, em x%: 5,5..18,5 · 19..21,5 · 23,5..30 · 31,5 · 33..35 · 64,5..66,5 ·
 * 69,5..70,5 · 71,5..72,5 — e em quase toda ela o y% para no 62.
 *
 * `b4-bianca` fica em 17%/70% (a porta, à esquerda) e a Ana a atende em 6%/76%:
 * é o único par que respeita ao mesmo tempo a distância mínima de 200px entre
 * figuras, a posição de entrada da Ana e a faixa de piso. Tudo o mais nesta cena
 * é coordenada reusada do conteúdo anterior, já provada contra
 * `docs/arte/chao.json`.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B4: readonly Cena[] = [
  {
    lugarId: 'sala-reunioes',
    bloco: 4,
    aberturaTexto:
      'Um ano. Ela não é mais a estagiária nova; é só a estagiária. ' +
      'Innovation Week: a sala inteira é gente apresentando o que fez. Hoje é a vez dela.',
    ecoTexto: 'A tela continua acesa com a página dela. A sala está vazia.',
    hotspots: [
      {
        id: 'b4-tv',
        rotulo: 'Tela da sala',
        arte: { tipo: 'objeto', assetId: 'objeto-tv-grande', largura: 384, altura: 240 },
        // Coisa de parede: ancora pelo centro, senão a TV assenta no chão.
        ancora: 'centro',
        pos: { x: 50, y: 30 },
        // Cabeceira direita da mesa. Em frente à TV o mapa de piso diz tampo.
        parada: { x: 66, y: 62 },
        // SEM `umaVezSo`: reabrir o puzzle é seguro desde o ADR-011, e precisa
        // ser, porque agora o puzzle tem botão de sair.
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'montar' }],
      },
      {
        // ---------------------------------------------------------------
        // SILÊNCIO ABSOLUTO POR REQUISITO DE SPEC. Não adicionar narração.
        // ---------------------------------------------------------------
        id: 'b4-entrega',
        rotulo: 'Apresentar',
        // A arte é o próprio crachá que ela recebe ao apresentar: "Apresentar"
        // sem objeto visível voltaria a ser placa de texto sobre o cenário.
        arte: { tipo: 'item', itemId: 'cracha-innovation' },
        ancora: 'centro',
        pos: { x: 50, y: 52 },
        parada: { x: 70, y: 61 },
        requerPuzzleResolvido: 'montar',
        bloqueadoTexto: 'A página ainda não está montada. Não tem nada pra mostrar.',
        // `umaVezSo` aqui é obrigatório, e é o único motivo: reclicar
        // reiniciaria a PAUSA no meio da fala do apresentador.
        umaVezSo: true,
        efeitos: [
          { tipo: 'concederItem', itemId: 'cracha-innovation' },
          { tipo: 'iniciarPausaBloco4' },
        ],
      },
      {
        // Depois do silêncio. Ela é a única que ainda não saiu de quadro.
        id: 'b4-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        pos: { x: 34, y: 62 },
        // A Ana fala com ela por cima da mesa, da cabeceira: entre a porta e a
        // Cláudia não cabe uma figura de 200px.
        parada: { x: 65, y: 62 },
        requerHotspotsFeitos: ['b4-entrega'],
        bloqueadoTexto: 'Cláudia está com o notebook aberto, esperando a apresentação começar.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-reconhecimento' }],
      },
      {
        // A virada. Ela não estava na reunião: está na porta, e é por isso que
        // a arte dela pode existir em cena desde o primeiro quadro sem mentir.
        id: 'b4-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 17, y: 70 },
        parada: { x: 6, y: 76 },
        requerHotspotsFeitos: ['b4-claudia'],
        bloqueadoTexto: 'Bianca está na porta, esperando a apresentação acabar.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-virada' }],
      },
    ],
  },
];

export const DIALOGOS_B4: Record<DialogoId, Dialogo> = {
  /**
   * Três nós, e é tudo. Do ponto de vista dela houve feedback e direcionamento;
   * do ponto de vista da Ana foi quase nada. As duas leituras estão certas, e
   * essa distância é o gancho do apresentador — não é fala de NPC.
   */
  'b4-reconhecimento': {
    id: 'b4-reconhecimento',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'Bom trabalho. (já de pé, notebook debaixo do braço)' },
      { tipo: 'fala', quem: 'ana', texto: 'Obrigada.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Manda no canal do time depois, pra quem não estava aqui ver.',
      },
    ],
  },

  /**
   * CALLBACK DO PUZZLE DA FASE 2 — o par `lacuna-reuniao` → `trilha-apresentar`.
   *
   * A plateia identificou a lacuna junto com ela e viu a Ana não fechar essa.
   * A Bianca NÃO explica o callback: se a plateia não lembrar, quem lembra é o
   * apresentador, numa frase, antes de clicar.
   *
   * Seis nós é o teto, e ela usa os seis. Repare no que ela não faz: não ensina
   * a se vender, não consola, não dá três dicas. Ela vira a mesa e sai do
   * caminho, e o painel acende `visibilidade` sem que ninguém a nomeie.
   */
  'b4-virada': {
    id: 'b4-virada',
    nos: [
      { tipo: 'fala', quem: 'bianca', texto: '(da porta) Isso é bom, Ana. Bom de verdade.' },
      { tipo: 'fala', quem: 'ana', texto: 'Ninguém falou nada.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Quem ia falar? Naquela sala só tinha quem já sabia do projeto.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Lembra a sua lista? "Falar numa reunião cheia de gente mais experiente."',
      },
      { tipo: 'fala', quem: 'ana', texto: '(pausa) Eu nunca fiz essa trilha.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Não. Você fez as outras três.' },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'visibilidade' },
      { tipo: 'concluirLugar', lugarId: 'sala-reunioes' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
