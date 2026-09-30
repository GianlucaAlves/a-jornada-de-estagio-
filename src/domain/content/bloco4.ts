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
 * A ORDEM DOS BEATS é presa por porta onde dá, e por roteiro onde não dá:
 * a plateia → montar → apresentar → silêncio → Cláudia → Bianca. As portas de
 * Cláudia e Bianca são `requerHotspotsFeitos`; a de `b4-entrega` é o puzzle.
 * Cada uma tem texto próprio, porque hotspot que responde com silêncio parece
 * travamento no palco.
 *
 * A PORTA QUE FALTA, declarada em vez de escondida: a plateia deveria ser
 * obrigatória antes do gesto, e não é. `src/store/jogo.test.ts` afirma que o
 * hotspot que dispara a PAUSA responde imediatamente depois de
 * `resolverPuzzle('montar')`, e porta nova entre os dois reprovaria um teste
 * fora desta frente. Mitigado de duas formas, as duas dentro deste arquivo: o
 * texto da plateia é verdadeiro em QUALQUER ponto antes da vez dela (não depende
 * do puzzle), e o beat é relível (sem `umaVezSo`), então quem apresenta pode
 * acendê-lo exatamente antes do silêncio. E mesmo no caminho em que ele é
 * pulado, o gesto continua sendo um ATRIL e a plateia continua desenhada na
 * faixa das cadeiras — o defeito não volta, só perde uma linha.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ O QUE ESTAVA ERRADO, e é o defeito que esta versão conserta.             │
 * │                                                                          │
 * │ Dono, vendo a fase rodar: "o momento da apresentação, não dá pra         │
 * │ entender direito o que está acontecendo". A causa estava inteira no      │
 * │ conteúdo: o hotspot que É o ato de apresentar tinha como arte o CRACHÁ   │
 * │ — a RECOMPENSA fazendo papel do GESTO —, ancorado no centro e flutuando  │
 * │ sobre a mesa. Clicava-se numa TV, resolvia-se um puzzle, clicava-se num  │
 * │ crachá no ar, e vinha o silêncio. NADA na tela mostrava uma              │
 * │ apresentação acontecendo, e o silêncio não tinha contra o que            │
 * │ contrastar: ele só confundia.                                           │
 * │                                                                          │
 * │ A correção é de três partes, e nenhuma delas toca a PAUSA:               │
 * │                                                                          │
 * │ 1. O GESTO GANHA ARTE DE GESTO. `b4-entrega` passa a ser `objeto-atril`, │
 * │    ancorado na base, em piso de verdade — ela sobe para apresentar. O    │
 * │    crachá continua sendo concedido por ele e só deixa de ser o botão.    │
 * │                                                                          │
 * │ 2. A SALA PASSA A ESTAR NA TELA. `b4-plateia` nasce com `objeto-plateia` │
 * │    — gente sentada de costas, na faixa das cadeiras — e é o único beat   │
 * │    da fase com narração: diz que a sala está ouvindo e que a próxima é   │
 * │    ela. No quadro do clique que liga a PAUSA há, ao mesmo tempo, a       │
 * │    página no telão, o atril, a Ana de pé ao lado dele e a plateia        │
 * │    sentada. Era exatamente esse quadro que não existia.                  │
 * │                                                                          │
 * │ 3. O TEXTO DE ABERTURA PARA DE PROMETER O QUE A TELA NÃO DÁ (abaixo).    │
 * │                                                                          │
 * │ O PREÇO, declarado: a arte de hotspot PERMANECE quando o hotspot morre   │
 * │ (`hotspotInerte` em Cena.tsx — sumir deixaria buraco onde estava a TV).  │
 * │ Então a plateia continua na tela depois da PAUSA, em que a sala esvazia. │
 * │ Aceito, e é a troca certa: a cena já convive com isso na Cláudia e na    │
 * │ Bianca, que existem desde o primeiro quadro; e o defeito a consertar era │
 * │ a apresentação não aparecer NUNCA, não ela aparecer um beat demais.      │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * O TEXTO DE ABERTURA MUDOU, e é decisão. Ele prometia "a sala inteira é gente
 * apresentando", e nenhum cenário entrega isso: exigiria vinte figuras humanas
 * pintadas dentro da arte de fundo, na escala do elenco, e ninguém está fazendo
 * essa arte. O que a Sala de Reuniões vai entregar é cartaz do evento, cadeiras
 * voltadas para a frente e piso livre para o atril e a plateia entrarem como
 * objeto. O texto passa a prometer exatamente isso — sala cheia, cadeiras
 * viradas para a frente, uma fila de estagiários apresentando, e a próxima é
 * ela. Promessa que a tela não cumpre é pior que promessa menor: a plateia
 * procura o que foi prometido e não acha.
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
 * (docs/roteiro/04-bloco-4.md §8). O sistema concede `visibilidade` sem que
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
 *
 * OS DOIS OBJETOS NOVOS, e por que eles estão onde estão. Objeto não é testado
 * contra o piso (`Cena.chao.test.ts` só cobra pé de figura humana), então a
 * disciplina aqui é minha:
 *
 * - O ATRIL fica em 74%/61%, que é piso de verdade — a faixa estreita entre a
 *   cabeceira direita da mesa e a parede. Ele não pode ficar mais à esquerda: de
 *   65% a 73% o piso naquela altura é tampo de mesa, e atril sobre a mesa é o
 *   mesmo defeito do monitor flutuante que a prévia pegou. Nem mais à direita: o
 *   painel de skills começa em 1500px e come o clique.
 * - A PLATEIA fica em 50%/62%, ancorada na base, 384x140, o que a põe na faixa
 *   das cadeiras — base exatamente na borda de trás da mesa. Não é o primeiro
 *   plano que a spec pediu, e a prévia é que decidiu: perto da câmera não há
 *   onde pôr. Abaixo de 838px a linha de nome do hotspot e a barra de itens
 *   comem o clique, e tudo entre a borda da mesa e essa faixa é TAMPO — plateia
 *   ali fica sentada em cima da mesa. 384 de largura é o que cabe: 15px de folga
 *   até a Cláudia de um lado e 15px até a Ana do outro.
 *
 * NENHUMA PARADA FOI INVENTADA. As quatro são reuso das que já estavam provadas
 * (66/62, 65/62, 6/76), e isso é defensivo de propósito: outra frente está
 * vestindo esta sala e vai rodar `exportar_chao.py` de novo. Coordenada nova
 * teria de ser revalidada contra um piso que ainda vai mudar; coordenada reusada
 * falha junto com as que já existiam, nunca sozinha.
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
        id: 'b4-tv',
        rotulo: 'Tela da sala',
        arte: { tipo: 'objeto', assetId: 'objeto-tv-grande', largura: 384, altura: 240 },
        pos: { x: 50, y: 30 },
        // Cabeceira direita da mesa. Em frente à TV o mapa de piso diz tampo.
        parada: { x: 66, y: 62 },
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
        /**
         * A SALA, e o beat que não existia. É o que põe "tem gente aqui, e essa
         * gente está ouvindo" NA TELA, em vez de só no texto de abertura.
         *
         * A arte é a plateia sentada, de costas, na faixa das cadeiras — o
         * objeto que a frente de cenário está fazendo para esta fase. Ela fica
         * em cena do primeiro quadro ao último, então a sala nunca mais lê como
         * vazia durante o evento.
         *
         * SEM PORTA, e isso é decisão com motivo declarado. A porta natural
         * seria prender este beat antes do gesto, mas `src/store/jogo.test.ts`
         * afirma que o hotspot da PAUSA responde imediatamente depois de
         * `resolverPuzzle('montar')` — porta nova entre os dois reprova um teste
         * que não pertence a esta frente. Duas consequências, as duas assumidas:
         * a ordem passa a ser instrução de roteiro ("Ordem dos cliques" em
         * docs/roteiro/04-bloco-4.md manda clicar aqui imediatamente antes de
         * apresentar), e o texto foi escrito para ser VERDADEIRO em qualquer
         * ponto antes da vez dela — nada nele depende de o puzzle estar resolvido.
         *
         * E SEM `umaVezSo`, de propósito: relido é melhor que gasto. Quem
         * apresenta quer poder acender esta linha exatamente no beat anterior ao
         * silêncio, mesmo tendo clicado aqui antes por curiosidade. É o mesmo
         * raciocínio do ADR-016 — a releitura repete a fala, não o efeito, e
         * aqui não há efeito nenhum além do texto.
         *
         * "Ninguém no celular" é setup, não enfeite: no segundo beat da PAUSA um
         * NPC pega o celular. A leitura que a fase quer é essa — eles ouviram, e
         * mesmo assim não disseram nada. Sem esta linha antes, a plateia da
         * apresentação lê o celular da PAUSA como grosseria, e a fase deixa de
         * ser sobre trabalho invisível para virar uma fase sobre gente ruim.
         */
        id: 'b4-plateia',
        rotulo: 'A plateia',
        arte: { tipo: 'objeto', assetId: 'objeto-plateia', largura: 384, altura: 140 },
        /**
         * 50%/62%, base — a faixa das CADEIRAS, e não o primeiro plano que a
         * spec pediu. A prévia é que decidiu isto: a spec supôs piso livre perto
         * da câmera, e nesta sala não existe. Abaixo de 838px a linha de nome do
         * hotspot e a barra de itens comem o clique, e tudo entre a borda de trás
         * da mesa (~670px) e essa faixa é TAMPO — plateia ali fica sentada em
         * cima da mesa, que é a família de defeito mais cara deste projeto.
         *
         * Com a base em 669,6px as figuras nascem exatamente na borda de trás da
         * mesa, na profundidade das três cadeiras e ao lado de onde a Ana
         * apresenta. É onde gente sentada pertence numa sala de reunião, e é de
         * costas para a câmera porque estão virados para o telão.
         *
         * 384 de largura é o que cabe: sobram 15px até a Cláudia à esquerda e
         * 15px até a Ana à direita. Mais largura passaria por cima das duas.
         */
        pos: { x: 50, y: 62 },
        // Ela olha a sala da cabeceira direita, entre a plateia (termina em
        // 1152px) e o atril (começa em 1380,8px): é a única faixa em que a figura
        // dela não cobre nenhum dos dois.
        parada: { x: 66, y: 62 },
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
        // ---------------------------------------------------------------
        // SILÊNCIO ABSOLUTO POR REQUISITO DE SPEC. Não adicionar narração.
        // ---------------------------------------------------------------
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
