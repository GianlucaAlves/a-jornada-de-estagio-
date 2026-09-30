/**
 * FASE 6 — efetivação e fim. O clímax.
 *
 * A ORDEM CANÔNICA (ADR-029, ADR-030) é esta, e é fixa:
 *
 *   cartão de transição (salto de tempo)
 *         ↓
 *   um personagem conta como o que ela fez a levou até ali, CONECTANDO TUDO
 *      — as quatro conexões são traçadas no mapa ENQUANTO ele fala
 *         ↓
 *   corta para a festa: o elenco inteiro comemorando no Cafezinho
 *         ↓
 *   perguntas finais
 *
 * QUEM NARRA É A CLÁUDIA, e não é escolha de gosto. Ela é o critério: tem poder
 * de decisão, estava na conversa de ontem, e é dela a frase que a quarta conexão
 * cita de volta — "Guardei seu nome", da fase 3. Nenhum outro personagem poderia
 * saber as quatro razões. O Rafael é uma das razões, e estar na sala enquanto a
 * linha dele acende vale mais do que ele narrando.
 *
 * AS QUATRO CONEXÕES NÃO ESTÃO NESTE ARQUIVO, e isso é de propósito: elas vivem
 * em `conexoes.ts`, uma por clique do apresentador, e o texto de cada uma É a
 * fala da Cláudia continuando — cada conexão é uma razão, dita e desenhada ao
 * mesmo tempo. O que este arquivo escreve é a fala que as ENTREGA: o nó 5 de
 * `b6-noticia` ("três lugares e um motivo") é a espinha do clímax inteiro, porque
 * é ele que anuncia a forma três-portas-mais-um-motivo sem explicar a moral, e o
 * nó 6 é o que passa a palavra para o mapa.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PENDÊNCIA DECLARADA — A FESTA SÓ PODE SER JOGADA ANTES DAS CONEXÕES.      │
 * │                                                                          │
 * │ `irParaRevelacao` é caminho de mão única na máquina de estado: a tela de   │
 * │ revelação vai de conexões → barra esvazia → versão futura → perguntas, e   │
 * │ nunca volta para uma cena. Os dois arquivos que decidem isso — a store e   │
 * │ `src/ui/Revelacao.tsx` — não são desta frente.                            │
 * │                                                                          │
 * │ Consequência: o conteúdo aqui DECLARA a ordem canônica (a Cláudia é o      │
 * │ primeiro hotspot da lista), mas hoje o apresentador que quiser as quatro   │
 * │ falas da festa tem de clicá-las ANTES de clicar nela. Por isso os quatro   │
 * │ beats de festa NÃO são gateados: gateá-los na Cláudia deixaria quatro      │
 * │ hotspots mortos, e neste projeto hotspot que não responde é bug.           │
 * │                                                                          │
 * │ Para fechar o laço, uma linha em `Revelacao.tsx`: depois de `esvaziarBarra`│
 * │ (ou depois das perguntas), chamar `irParaTela({ tipo: 'cena', lugarId:     │
 * │ 'cafezinho' })`. A ação já existe na store exatamente para isso.           │
 * │                                                                          │
 * │ O que NÃO se perde enquanto isso: a festa é o CENÁRIO, não uma sequência   │
 * │ de beats. Ao entrar no Cafezinho a plateia vê as seis figuras, o bolo e a  │
 * │ luz quente — `assetDoCenario('cafezinho', 6)` devolve o cenário de festa   │
 * │ automaticamente. O corte do cartão cai numa sala que já está comemorando,  │
 * │ que é o que o ADR-029 pede quando diz que não há suspense aqui.            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * PERDA DECLARADA, NÃO A CONSERTE. O retorno ao Escritório do primeiro dia —
 * "mesma cadeira, mesmo notebook, mesma tela de login que ela não sabia abrir" —
 * saiu do clímax por decisão do dono (ADR-029). A festa ganha em calor e o
 * espelho se perde. Não o reintroduza.
 *
 * O CAFEZINHO NÃO É CONCLUÍDO por nenhum efeito, e isso é deliberado: lugar
 * concluído recusa clique de hotspot e devolve só o eco. Deixá-lo destravado é o
 * que permite a festa continuar jogável no minuto em que o laço acima fechar.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ COORDENADAS — O CASO MAIS DIFÍCIL DO PROJETO: SEIS FIGURAS NO MESMO PISO. │
 * │                                                                          │
 * │ A conta que manda: uma figura ocupa 200x336 px, então dois pés a menos de │
 * │ 10,42% de distância em x produzem sprites que se cruzam, e `Cena.geometria│
 * │ .test.ts` reprova. Separar por y não salva: a janela vertical inteira do   │
 * │ Cafezinho tem 21 pontos percentuais (230px) e a figura tem 336px de alto,  │
 * │ logo QUALQUER par se sobrepõe verticalmente. A separação é só horizontal.  │
 * │                                                                          │
 * │ A janela útil é menor que a tela: o painel de skills come tudo à direita   │
 * │ de 72,9%, e a posição de entrada da Ana (6%/76%) proíbe figura à esquerda  │
 * │ de 16,4% — nascer materializada dentro de um NPC é defeito do primeiro     │
 * │ segundo da cena. Sobram 56,5 pontos para cinco figuras que precisam de     │
 * │ 41,7. A folga é 15.                                                      │
 * │                                                                          │
 * │ SOLUÇÃO: dois grupos e um VÃO no meio. Trio à esquerda (17/28/39), dupla à │
 * │ direita (61/72), e o vão de 22 pontos entre 39 e 61 é onde a Ana para —    │
 * │ 50%, a 11 pontos de cada vizinho. É o único x do cenário em que ela não    │
 * │ cobre NINGUÉM, e num elenco desse tamanho isso não é luxo: a alternativa   │
 * │ era ela apagar metade de um colega em toda conversa. O grupo abrir espaço  │
 * │ no meio para ela é, de brinde, a composição certa para quem é a homenageada│
 * │ da festa.                                                                │
 * │                                                                          │
 * │ Os y% (66..76) NÃO são só profundidade, e é aqui que a prévia pagou o seu   │
 * │ preço. Duas restrições que teste nenhum vigia:                             │
 * │                                                                          │
 * │ 1. O BALCÃO. Ele ocupa x 22..50% e sua aresta inferior fica em y 73%, e o   │
 * │    mapa de piso NÃO SABE: ele declara piso desde 56,5% na coluna inteira.   │
 * │    A Bianca em 39%/58% passava em `Cena.chao.test.ts` e em                 │
 * │    `Cena.geometria.test.ts` e aparecia EM PÉ SOBRE O BALCÃO. Quem está na   │
 * │    faixa dele precisa de pé abaixo de 73%. Foi a prévia que pegou, e é      │
 * │    exatamente a classe de defeito que ela existe para pegar.               │
 * │ 2. A CAIXA DE DIÁLOGO nova (ADR-012) mora no ALTO da tela e sua base fica   │
 * │    em y=324px, então figura cujo topo suba acima disso é coberta justamente │
 * │    enquanto fala. Topo de figura = y% · 1080 − 336, logo todo NPC aqui      │
 * │    precisa de y% ≥ 61,2.                                                   │
 * │                                                                          │
 * │ Sobrou, então: faixa do balcão (17/28/39) presa entre 61,2% e 73%, e canto  │
 * │ direito livre (61/72) podendo subir para ganhar a única profundidade que a  │
 * │ cena tem. Cláudia em 66% fica ATRÁS da mesa alta e dos banquinhos.          │
 * │                                                                          │
 * │ O mapa de piso de `cafezinho` e o de `cafezinho-festa` são IDÊNTICOS —      │
 * │ verificado, e é o que permite validar contra um e desenhar com o outro      │
 * │ sem que a junta minta.                                                    │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B6: readonly Cena[] = [
  {
    lugarId: 'cafezinho',
    bloco: 6,
    aberturaTexto:
      'Três semanas. O Cafezinho está cheio, alguém trouxe bolo e ninguém está trabalhando. ' +
      'O time inteiro está aqui, e é por causa dela.',
    ecoTexto: 'Ninguém voltou pra mesa depois disso.',
    hotspots: [
      {
        /**
         * A NOTÍCIA E AS QUATRO CONEXÕES. Primeiro da lista porque é a ordem
         * canônica da fase, e o último clique da apresentação antes do mapa.
         *
         * SEM `umaVezSo`: diálogo tem de poder ser RELIDO (ADR-016), e hotspot
         * de diálogo marcado `umaVezSo` é exatamente o que impede isso. Repetir
         * é seguro porque a store aplica `Dialogo.efeitos` só na PRIMEIRA
         * conclusão — reler devolve a informação, não o efeito.
         */
        id: 'b6-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        // À direita e destacada do grupo: é ela que puxa a Ana de lado. O y NÃO
        // é escolha de profundidade — em 66% e em 72% ela aparecia EM PÉ SOBRE a
        // mesa alta do canto (tampo em y 735..755px), e o mapa de piso não sabe
        // que a mesa existe. Pé em 76% cai abaixo do tampo e ela lê como estando
        // NA FRENTE dela. Visto na prévia, duas vezes.
        pos: { x: 72, y: 76 },
        parada: { x: 50, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b6-noticia' }],
      },
      {
        // A FESTA. Quatro falas curtas, cada uma um callback, nenhuma com moral.
        //
        // OS y% DESTES QUATRO SAÍRAM DA PRÉVIA, NÃO DO MAPA DE PISO. O balcão do
        // Cafezinho ocupa x 22..50% e a aresta INFERIOR dele fica em y 73%, e o
        // mapa de piso não sabe disso: ele declara piso a partir de 56,5% na
        // coluna inteira, então Bianca em 58% passava em todos os testes e
        // aparecia EM PÉ SOBRE O BALCÃO. Quem está na faixa do balcão precisa de
        // pé abaixo de 73% para ler como "de pé na frente dele"; quem está fora
        // dela (Marcos e Cláudia, à direita) pode subir e ganhar profundidade.
        id: 'b6-tiago',
        rotulo: 'Tiago',
        arte: { tipo: 'npc', npcId: 'tiago' },
        pos: { x: 17, y: 76 },
        parada: { x: 50, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b6-tiago-pergunta' }],
      },
      {
        id: 'b6-rafael',
        rotulo: 'Rafael',
        arte: { tipo: 'npc', npcId: 'rafael' },
        pos: { x: 28, y: 74 },
        parada: { x: 50, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b6-rafael-ramal' }],
      },
      {
        id: 'b6-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 39, y: 76 },
        parada: { x: 50, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b6-bianca-mudanca' }],
      },
      {
        id: 'b6-marcos',
        rotulo: 'Marcos',
        arte: { tipo: 'npc', npcId: 'marcos' },
        pos: { x: 61, y: 70 },
        parada: { x: 50, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b6-marcos-proximo' }],
      },
    ],
  },
];

export const DIALOGOS_B6: Record<DialogoId, Dialogo> = {
  /**
   * A FALA QUE NARRA AS QUATRO CONEXÕES. O texto de maior peso da fase.
   *
   * Nó 1 — a notícia, em duas frases e sem adjetivo. Cláudia não elogia por
   * educação, e o suspense já foi gasto na fase 5: a festa acontecendo é a
   * resposta, então dizê-la aqui é confirmação, não revelação.
   *
   * Nó 3 — FRASE-ASSINATURA, cobrada por `integridade.test.ts`. É o setup das
   * três conexões de item: sem ela, três linhas acendem no mapa sem que nenhuma
   * pergunta as tenha pedido. Não pode ser cortada nem parafraseada — a plateia
   * precisa carregar o número "três" até o mapa.
   *
   * Nó 5 — A ESPINHA. "Três lugares e um motivo" declara a forma do clímax:
   * três portas que se apagam e um motivo que fica aceso. Repare no que ela NÃO
   * diz: que as portas abriram para muita gente e que ela foi escolhida pelo
   * domingo à noite em que escreveu cinco páginas que ninguém pediu. Isso é fala
   * do apresentador (docs/roteiro/06-bloco-6.md), e é a razão de existir da
   * apresentação — pôr na boca da Cláudia seria roubar o palco de quem apresenta.
   *
   * Nó 6 — passa a palavra para o mapa. As quatro conexões que vêm depois são
   * esta fala continuando: ela diz de onde veio cada um, e o mapa desenha.
   */
  'b6-noticia': {
    id: 'b6-noticia',
    nos: [
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Assinaram hoje de manhã. É efetivação, não é mais estágio.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Eu não sei o que dizer.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Seu nome apareceu em três lugares diferentes na conversa de ontem.',
      },
      { tipo: 'fala', quem: 'ana', texto: '(baixo) Três lugares?' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Três lugares e um motivo. Os três abriram a porta. O motivo é por que era você.',
      },
      { tipo: 'fala', quem: 'claudia', texto: 'Vem cá. Eu te mostro de onde veio cada um.' },
    ],
    efeitos: [
      { tipo: 'blocoConcluido' },
      // A cena dissolve e o mapa entra. Única transição automática da
      // apresentação inteira, e ela acontece no fim do diálogo — nunca por timer.
      { tipo: 'irParaRevelacao' },
    ],
  },

  /**
   * Callback do primeiro dia: ele escreveu o ramal à mão, atrás do cartão. Ele
   * NÃO conta aqui que disse o nome dela — essa é a primeira conexão, e dizê-la
   * antes do mapa queimaria a linha que vai acender.
   */
  'b6-rafael-ramal': {
    id: 'b6-rafael-ramal',
    nos: [
      { tipo: 'fala', quem: 'rafael', texto: 'Anotei o seu ramal. Só pra ficar justo.' },
      { tipo: 'fala', quem: 'ana', texto: '(ri) Não tem cartão aqui pra escrever atrás.' },
    ],
  },

  /** Callback do vocabulário que ela não entendia no primeiro dia. */
  'b6-tiago-pergunta': {
    id: 'b6-tiago-pergunta',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Dois anos e você ainda pergunta as coisas. Isso aqui é raro.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Eu ainda não entendo metade do que você fala.' },
      { tipo: 'fala', quem: 'tiago', texto: 'Nem eu. A gente descobre junto.' },
    ],
  },

  /**
   * Callback da fase 5 sem repeti-la: a Bianca cobra a própria fala do pivô, e a
   * Ana responde que mudou de ideia quatro vezes sem sair do lugar. A resposta
   * dela é o que sobra do medo da fase anterior.
   */
  'b6-bianca-mudanca': {
    id: 'b6-bianca-mudanca',
    nos: [
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu te disse que dava pra mudar de ideia no meio do caminho.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Mudei umas quatro vezes. Só não mudei de lugar.' },
    ],
  },

  /** O facilitador do evento, fazendo pergunta em vez de dar resposta. */
  'b6-marcos-proximo': {
    id: 'b6-marcos-proximo',
    nos: [
      {
        tipo: 'fala',
        quem: 'marcos',
        texto: 'Ano que vem você apresenta de novo? Do outro lado da mesa.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Pode ser.' },
    ],
  },

  /**
   * Fecho: usado pela TELA de revelação, não por hotspot — está declarado em
   * `DIALOGOS_DE_TELA` no teste de integridade. Última fala da apresentação, e
   * frase-assinatura.
   *
   * A pergunta mudou de tempo verbal, não de texto. Antes ela era feita em
   * tempo real, porque a notícia vinha depois; agora a notícia vem primeiro
   * (ADR-029), então ela é a pergunta que a Ana carregou pelas três semanas do
   * cartão. A frase literal é cobrada pelo teste e permanece intacta dentro da
   * citação — e continua sem resposta em palavra nenhuma: quem responde é o mapa
   * com as nove skills acesas e a barra de itens vazia.
   */
  'b6-fecho': {
    id: 'b6-fecho',
    nos: [
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'Eu passei três semanas com uma pergunta na cabeça. "Eu fui efetivada?"',
      },
    ],
  },
};
