/**
 * Fase 4: Marcos prepara Ana para apresentar; a sala, o resumo STAR e o elenco
 * visível acompanham a ordem real de interação.
 *
 * Ordem: Marcos -> plateia e puzzle -> apresentação no atril -> pausa silenciosa
 * -> Cláudia -> Bianca. A presença dos NPCs é independente dos assuntos de
 * conversa; `presencas.ts` registra as saídas pela borda depois de cada fala.
 * A apresentação inicia a pausa; o crachá vem no reconhecimento de Cláudia.
 *
 * Coordenadas de personagens, plateia e atril foram revisadas com a prévia
 * composta e os testes de geometria. A sala foi aberta para reservar o palco.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B4: readonly Cena[] = [
  {
    lugarId: 'sala-reunioes',
    bloco: 4,
    totalConversas: 3,
    totalMinigames: 1,
    aberturaTexto:
      'Um ano. Ela não é mais a estagiária nova; é só a estagiária. ' +
      'Innovation Week: as cadeiras viradas para a frente, a sala cheia, ' +
      'uma fila de estagiários mostrando o que fizeram. A próxima é ela.',
    // Eco do que a abertura prometeu, virado do avesso: as mesmas cadeiras, a
    // mesma tela, e ninguém. É a única linha da fase que a plateia lê DEPOIS da
    // PAUSA sem que o apresentador tenha de dizê-la.
    ecoTexto:
      'As cadeiras continuam viradas para a frente. A tela ainda está acesa ' +
      'com a página dela, e não tem mais ninguém na sala.',
    hotspots: [
      {
        id: 'b4-marcos',
        rotulo: 'Marcos',
        arte: { tipo: 'npc', npcId: 'marcos' },
        pos: { x: 86, y: 70 },
        parada: { x: 65.5, y: 62 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-preparacao' }],
      },
      {
        id: 'b4-tv',
        rotulo: 'Tela da sala',
        arte: { tipo: 'objeto', assetId: 'objeto-tv-grande', largura: 384, altura: 240 },
        pos: { x: 50, y: 30 },
        // A parada fica na lateral do palco, em piso livre diante da tela.
        parada: { x: 66, y: 62 },
        requerHotspotsFeitos: ['b4-marcos'],
        bloqueadoTexto: 'Marcos ainda está conversando com Ana sobre como organizar a apresentação.',
        // Coisa de parede: ancora pelo centro, senão a TV assenta no chão.
        // Declarada DEPOIS de `parada`, e dentro dos 600 caracteres seguintes,
        // porque é ali que `previa_de_cena.py` procura — âncora escrita antes,
        // ou longe, sai da janela e a prévia desenha a TV em pé no chão. A
        // prévia é uma das duas defesas desta cena, não um enfeite.
        ancora: 'centro',
        // SEM `umaVezSo`: reabrir o puzzle é seguro desde o ADR-011, e precisa
        // ser, porque agora o puzzle tem botão de sair.
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'montar' }],
      },
      {
        /** O beat narrativo estabelece que a sala está ouvindo antes da fala de Ana. */
        id: 'b4-plateia',
        rotulo: 'A plateia',
        arte: { tipo: 'objeto', assetId: 'objeto-plateia', largura: 936, altura: 136 },
        /** A fileira de trás dá um alvo livre; as nove pessoas seguem visíveis. */
        pos: { x: 53, y: 75 },
        parada: { x: 66, y: 62 },
        requerHotspotsFeitos: ['b4-marcos'],
        bloqueadoTexto: 'A plateia ainda está se acomodando. Ana conversa com Marcos antes de começar.',
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A sala está cheia e as cadeiras estão todas viradas para a frente. ' +
              'Ninguém no celular, ninguém digitando: estão ouvindo quem está na ' +
              'frente da sala. A próxima é ela.',
          },
        ],
      },
      {
        // A pausa silenciosa começa após as duas falas deste diálogo.
        /**
         * O GESTO, e o hotspot mais delicado do jogo.
         *
         * A arte é o ATRIL: quem clica está fazendo a Ana subir para apresentar.
         * Era o CRACHÁ, ancorado no centro e flutuando sobre a mesa — a
         * recompensa fazendo papel do gesto, e a causa inteira de ninguém
         * entender o que estava acontecendo aqui.
         *
         * O crachá continua sendo CONCEDIDO por este hotspot, e só deixou de ser
         * o botão. O id continua `b4-entrega` por dois motivos: a entrega é
         * isto — não o crachá, e sim o que ela entregou à sala — e
         * `hotspotsFeitos` é salvo no navegador (ADR-018), então renomear um id
         * já acionado no ensaio de ontem rearmaria uma porta aberta sem que nada
         * parecesse errado.
         *
         * No quadro deste clique há, ao mesmo tempo: a página no telão, o atril,
         * a Ana de pé ao lado dele e a plateia sentada na faixa das cadeiras.
         * Era exatamente esse quadro que não existia, e é contra ele que o
         * silêncio que vem a seguir tem peso.
         */
        id: 'b4-entrega',
        // O rótulo diz o alvo, não só o verbo: "Apresentar" sozinho não dizia
        // para quem, e era justamente o para-quem que faltava na tela.
        rotulo: 'Apresentar para a sala',
        arte: { tipo: 'objeto', assetId: 'objeto-atril', largura: 80, altura: 160 },
        pos: { x: 74, y: 61 },
        // À ESQUERDA do atril, nunca em cima: a Ana desenha acima da camada de
        // hotspot, e parar sobre o atril esconderia justamente a arte que dá
        // sentido ao clique.
        parada: { x: 65, y: 62 },
        requerPuzzleResolvido: 'montar',
        requerHotspotsFeitos: ['b4-marcos', 'b4-plateia'],
        bloqueadoTexto: 'A página precisa estar montada e a sala pronta para ouvir.',
        // Pode ser relido: a store aplica o crachá e a pausa apenas na primeira
        // conclusão, então salvar durante a fala não perde o gesto.
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-apresentacao' }],
      },
      {
        // Depois do silêncio. Ela é a única que ainda não saiu de quadro.
        id: 'b4-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        pos: { x: 34, y: 62 },
        // A parada preserva espaço entre Cláudia, plateia e palco.
        parada: { x: 65, y: 62 },
        requerHotspotsFeitos: ['b4-entrega'],
        // Vale nas DUAS janelas em que esta porta está fechada: antes de a
        // apresentação começar e enquanto ela está acontecendo. O texto antigo
        // ("esperando a apresentação começar") passou a mentir quando a fase
        // ganhou o beat da plateia — depois dele a sala já está reunida e
        // ouvindo, e a Cláudia não está esperando nada começar.
        bloqueadoTexto:
          'Cláudia está com o notebook aberto, acompanhando a apresentação. Não é hora de interromper.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-reconhecimento' }],
      },
      {
        // Bianca aguarda na porta; liberar a conversa não materializa sua figura.
        id: 'b4-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 11, y: 70 },
        parada: { x: 23, y: 76 },
        requerHotspotsFeitos: ['b4-claudia'],
        bloqueadoTexto: 'Bianca está na porta, esperando a apresentação acabar.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-virada' }],
      },
    ],
  },
];

export const DIALOGOS_B4: Record<DialogoId, Dialogo> = {
  'b4-preparacao': {
    id: 'b4-preparacao',
    nos: [
      { tipo: 'fala', quem: 'marcos', texto: 'Antes de entrar: se alguém perguntar o que mudou com esse projeto, o que você conta?' },
      { tipo: 'fala', quem: 'ana', texto: 'Que eu participei. Mas... não sei se ficou claro o que eu fiz.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Então conta em quatro passos: situação, tarefa, ação e resultado. Como tava, o que cabia a você, o que fez e no que deu.' },
      { tipo: 'fala', quem: 'ana', texto: 'Aí mostro a minha parte sem apagar o trabalho do time.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Isso. E depois dá pra contar essa história num post profissional. Tem gente que não tava na sala.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Só confere o que pode sair pra fora, tá? Fala do que aprendeu sem mostrar dado interno.' },
    ],
  },
  'b4-apresentacao': {
    id: 'b4-apresentacao',
    nos: [
      { tipo: 'fala', quem: 'ana', texto: 'Antes, a gente anotava a conferência no papel e só passava pra planilha no fim do turno. Quem chegava depois perguntava o que faltava.' },
      { tipo: 'fala', quem: 'ana', texto: 'Minha parte era deixar isso claro pro turno seguinte.' },
      { tipo: 'fala', quem: 'ana', texto: 'Passei a registrar na planilha compartilhada, ali na hora. Depois conferi com o pessoal da linha se tava funcionando.' },
      { tipo: 'fala', quem: 'ana', texto: 'Agora o outro turno já começa sabendo o que falta. Eu gosto de resolver essa passagem... ainda fico nervosa falando aqui na frente.' },
    ],
    efeitos: [{ tipo: 'iniciarPausaBloco4' }],
  },
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
        texto: 'Depois manda no canal do time, pra quem não veio ver também.',
      },
    ],
    efeitos: [{ tipo: 'concederItem', itemId: 'cracha-innovation' }],
  },

  /**
   * A Bianca reconhece o esforço da Ana sem transformar o momento em uma lista
   * de conselhos; as reações curtas deixam o reconhecimento aparecer na pausa.
   *
   * Seis nós é o teto, e ela usa os seis. A cena confirma que Ana ainda sente
   * nervosismo, mas já consegue falar do próprio trabalho.
   */
  'b4-virada': {
    id: 'b4-virada',
    nos: [
      { tipo: 'fala', quem: 'bianca', texto: '(da porta) Foi muito bom, Ana. Sério.' },
      { tipo: 'fala', quem: 'ana', texto: 'Mas ninguém falou nada.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu sei. Tava cheia de gente que já conhecia o projeto, né?',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Mas eles ouviram você contar o que mudou. Isso conta.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Nossa, eu tava tremendo por dentro. Ainda não sei se acostumo.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Nem precisa decidir agora. Hoje você fez mesmo assim.' },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'visibilidade' },
      { tipo: 'concluirLugar', lugarId: 'sala-reunioes' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
