/**
 * Fase 4: Marcos prepara Ana para apresentar; a sala, o resumo STAR e o elenco
 * visível acompanham a ordem real de interação.
 *
 * Ordem: Marcos -> plateia e puzzle -> apresentação no atril -> pausa silenciosa
 * -> Cláudia -> Bianca. A cena oculta plateia e NPCs quando saem da narrativa;
 * `Cena.tsx` aplica essa composição usando os hotspots concluídos e o estado da
 * pausa. A conclusão da apresentação concede o crachá e inicia a pausa.
 *
 * Coordenadas de personagens, plateia e atril foram revisadas com a prévia
 * composta e os testes de geometria. A sala foi aberta para reservar o palco.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B4: readonly Cena[] = [
  {
    lugarId: 'sala-reunioes',
    bloco: 4,
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
        pos: { x: 23, y: 75 },
        parada: { x: 35, y: 76 },
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
        arte: { tipo: 'objeto', assetId: 'objeto-plateia', largura: 368, altura: 192 },
        /** Arte sentada e virada para o telão; a faixa do palco fica livre para Ana. */
        pos: { x: 50, y: 62 },
        // Ela olha a sala da cabeceira direita, entre a plateia (termina em
        // 1152px) e o atril (começa em 1380,8px): é a única faixa em que a figura
        // dela não cobre nenhum dos dois.
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
        // A virada depois de Cláudia; Cena mantém Bianca oculta até esse beat.
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
      { tipo: 'fala', quem: 'marcos', texto: 'Antes de começar: quem vai te ouvir sabe o que você fez?' },
      { tipo: 'fala', quem: 'ana', texto: 'Sabe que eu participei. Não sei se sabe o que mudou com o meu trabalho.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Conta pelo STAR: situação, tarefa, ação e resultado. Qual era o problema, o que era sua responsabilidade, o que você fez e o que mudou.' },
      { tipo: 'fala', quem: 'ana', texto: 'Assim eu mostro a minha parte sem diminuir a do time.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Se vender é dar clareza ao seu trabalho. Um post no LinkedIn também pode contar essa história para quem não estava aqui.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Compartilhe só o que pode ser público. Dá para falar do aprendizado sem expor dados internos.' },
    ],
  },
  'b4-apresentacao': {
    id: 'b4-apresentacao',
    nos: [
      { tipo: 'fala', quem: 'ana', texto: 'O turno seguinte já começa sabendo o que ficou pendente. Eu organizei a conferência para que a informação chegasse a tempo.' },
      { tipo: 'fala', quem: 'ana', texto: 'Agora vale testar o mesmo formato nas outras linhas.' },
    ],
    efeitos: [
      { tipo: 'concederItem', itemId: 'cracha-innovation' },
      { tipo: 'iniciarPausaBloco4' },
    ],
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
