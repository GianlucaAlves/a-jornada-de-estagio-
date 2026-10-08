/**
 * FASE 3 — protagonismo (apresenta: João). A fase mais importante da tese.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PENDÊNCIA FECHADA — a fase já acontece na LINHA DE PRODUÇÃO.              │
 * │                                                                          │
 * │ O laço é LINHA DE PRODUÇÃO → Escritório (ADR-021, ADR-025): ela vê na     │
 * │ linha uma etapa que ninguém pediu para ela olhar, estrutura o que viu,    │
 * │ escreve, e leva ao Escritório — que é a IDA.                              │
 * │                                                                          │
 * │ O que travava era mecânico e não de desenho: `docs/arte/chao.json` não     │
 * │ tinha mapa de piso para `linha-producao`, e duas defesas reprovam cena em │
 * │ lugar sem piso (`Cena.chao.test.ts` e o guard de integridade). O cenário  │
 * │ e o mapa de piso existem agora, `LUGARES_SEM_CENA_AINDA` está vazia, e    │
 * │ `b3-tiago`, `b3-monitor` e `b3-relatorio` migraram para a cena nova.      │
 * │                                                                          │
 * │ O LAÇO NÃO FECHA ONDE ABRIU, e isso é DECLARADO, não esquecido. O         │
 * │ ADR-025 pede que a produção seja origem E destino; a Cláudia é a líder e  │
 * │ recebe no Escritório, então o último beat da fase cai lá. Voltar o último │
 * │ beat para a produção exigiria mudar QUEM recebe o relatório, o que é      │
 * │ decisão de história e não de coordenada — fica anotado para quem escreve. │
 * │                                                                          │
 * │ PENDÊNCIA QUE SOBROU, e é de ARTE, não daqui: `objeto-painel-processo`    │
 * │ está no manifest mas não tem PNG em `public/assets/objetos/` nem grade em │
 * │ `cenarios._objetos()`, que gera sete objetos e não inclui este. Até a     │
 * │ frente de cenários gerá-lo, o hotspot cai na cadeia de fallback de        │
 * │ `Imagem.tsx` e a plateia vê o placeholder rotulado — que é o fluxo normal │
 * │ daqui (id antes do arquivo), mas é o único beat da fase sem arte.         │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * A DIREÇÃO DO LAÇO JÁ ESTAVA CORRIGIDA antes da mudança de lugar. Antes o
 * relatório nascia na produção e era entregue no Escritório sem que a produção
 * fosse origem de nada; a ordem aqui é a nova — ver, estruturar, produzir,
 * entregar — e o que mudou foi só o lugar de cada beat.
 *
 * O `anotacoes-treinamento` É CONSUMIDO AQUI. É a única porta de leva-e-traz que
 * atravessa duas fases, e é o que prova à plateia que a barra de itens não é
 * decoração. NÃO comente o elo durante a cena: se o apresentador disser "viu, o
 * estudo dela serviu", gasta aqui o efeito que a fase 6 precisa.
 *
 * A `proatividade` É CONCEDIDA NO RELATÓRIO, não na entrega — e essa distinção é
 * a tese inteira. Ela é a única skill que permanece acesa no clímax quando todo
 * o resto se apaga (ADR-017), e o momento que ela marca é o das três páginas
 * escritas sem ninguém pedir, ANTES de qualquer retorno. Se fosse concedida na
 * entrega, a mensagem viraria "proatividade é o que alguém reconhece"; concedida
 * na escrita, ela é o que ela fez quando ninguém estava olhando. O
 * `protagonismo` vem depois, na entrega, porque assumir é um segundo ato.
 *
 * O TIAGO NÃO É VILÃO. Ele é uma pessoa razoável protegendo o próprio dia, e a
 * fala dele é o bloco inteiro em uma frase — mas a frase não diz a lição. Qual
 * "orçamento da rotina" existe no time de quem está assistindo é pergunta do
 * apresentador (docs/roteiro/03-bloco-3.md).
 *
 * COORDENADAS: remedidas contra `docs/arte/chao.json` depois da mudança de
 * lugar. As da Linha de Produção saíram da faixa de piso de lá (`_mapa_chao.py`)
 * cruzada com o que os overlays deixam livre — o painel de skills come x>73% e a
 * linha de nome do hotspot come y>77,6% na faixa central. As da `b3-claudia`
 * são as mesmas de antes, porque ela não saiu do Escritório. Olhadas em
 * `docs/arte/previa-b3-linha-producao.png` e `previa-b3-escritorio.png`.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B3: readonly Cena[] = [
  {
    // A ORIGEM DA FASE. Vem primeiro no array de propósito: é a ordem em que a
    // travessia da store percorre as cenas, e é a ordem em que os gates abrem —
    // o relatório só existe depois do puzzle, e a Cláudia só recebe depois dele.
    lugarId: 'linha-producao',
    bloco: 3,
    totalConversas: 2,
    totalMinigames: 1,
    aberturaTexto: 'Seis meses. Ela tem tarefas de verdade agora. Nenhuma delas é essa.',
    ecoTexto: 'Aqui ela escreveu três páginas que ninguém tinha pedido.',
    hotspots: [
      {
        // O veterano do operacional. Ele explica por que a coisa é assim e não
        // se defende — e é ele que diz "ninguém pediu pra você olhar", que é a
        // frase que a Ana vira do avesso.
        //
        // Ele fica no bolsão de piso à esquerda da linha (faixa x 20..24% →
        // y 63..84,1%), e a Ana para mais à esquerda ainda: parar à direita dele
        // a poria entre a plateia e o painel, que é o beat seguinte.
        id: 'b3-tiago',
        rotulo: 'Tiago',
        arte: { tipo: 'npc', npcId: 'tiago' },
        pos: { x: 24, y: 76 },
        parada: { x: 12, y: 78 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b3-tiago' }],
      },
      {
        // Antes da entrega, clique seco devolve a pista. Depois de usar as
        // anotações, o painel permanece liberado, inclusive ao cancelar o puzzle.
        //
        // Era `objeto-monitor-ligado` numa mesa do Escritório, ancorado pelo
        // centro. Aqui fica fixado na parede sobre a célula de inspeção; o
        // cenário reserva esse retângulo para o PNG, sem tela duplicada atrás.
        id: 'b3-monitor',
        rotulo: 'Números da linha',
        arte: { tipo: 'objeto', assetId: 'objeto-painel-processo', largura: 192, altura: 144 },
        pos: { x: 30, y: 29.6 },
        // Ela para à DIREITA do painel: à esquerda ela encostaria no Tiago, que
        // continua em cena enquanto ela mexe no painel.
        parada: { x: 52, y: 72 },
        ancora: 'centro',
        aceitaItem: 'anotacoes-treinamento',
        // Sem narração antes do puzzle de propósito: a narração desenha acima do
        // puzzle e o primeiro gesto da pessoa seria dispensar um véu.
        efeitosComItem: [
          { tipo: 'consumirItem', itemId: 'anotacoes-treinamento' },
          { tipo: 'abrirPuzzle', puzzleId: 'estruturar' },
        ],
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'Os números da linha, do jeito que chegam: escritos à mão e digitados no fim do turno. Ela já olhou isso três vezes esta semana.',
          },
        ],
      },
      {
        // A arte é o próprio item que o hotspot concede.
        id: 'b3-relatorio',
        rotulo: 'Relatório',
        arte: { tipo: 'item', itemId: 'relatorio' },
        pos: { x: 61, y: 62.2 },
        // A única parada da cena à direita do alvo: à esquerda dele a Ana
        // cobriria o próprio relatório, que é a arte que o clique traz à tona.
        // 61%/62,2% apoia o item no topo da caixa aberta à frente da linha, e sobram
        // 24px de cada lado — à esquerda a Ana que olha o painel, à direita esta.
        parada: { x: 70, y: 72 },
        requerPuzzleResolvido: 'estruturar',
        bloqueadoTexto: 'Problema, solução e impacto ainda estão embaralhados. Não há relatório.',
        umaVezSo: true,
        efeitos: [
          { tipo: 'concederItem', itemId: 'relatorio' },
          { tipo: 'concederSkill', skillId: 'proatividade' },
        ],
      },
    ],
  },
  {
    // A IDA. Um hotspot só, e é isso que a torna leitura de um gesto: ela
    // atravessa o prédio para entregar, e não há mais nada para fazer lá.
    lugarId: 'escritorio',
    bloco: 3,
    totalConversas: 2,
    totalMinigames: 1,
    aberturaTexto:
      'Ela atravessou o prédio com três páginas na mão. A mesa é a mesma de seis meses atrás.',
    ecoTexto: 'Aqui ela entregou um relatório que ninguém tinha pedido.',
    hotspots: [
      {
        // A ENTREGA. Diferente da fase 1: aqui ela PARA. Mesmo cenário, mesma
        // pessoa, comportamento diferente — é o argumento visual do projeto.
        //
        // Par de coordenadas intocado: é o mesmo do Escritório de antes, já
        // provado contra o mapa de piso e olhado na prévia.
        id: 'b3-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        pos: { x: 52, y: 70 },
        parada: { x: 63, y: 76 },
        aceitaItem: 'relatorio',
        efeitosComItem: [
          { tipo: 'dialogo', dialogoId: 'b3-claudia' },
        ],
        efeitos: [
          {
            tipo: 'narrar',
            texto: 'Cláudia está entre duas reuniões. Chegar de mãos vazias não é conversa.',
          },
        ],
      },
    ],
  },
];

export const DIALOGOS_B3: Record<DialogoId, Dialogo> = {
  /**
   * "Quando eu cheguei já era assim" carrega a inércia sem transformar Tiago em
   * vilão: ele está ocupado e nunca teve motivo para questionar a rotina. Toda
   * equipe tem processos que continuam por hábito, mesmo quando poderiam mudar.
   *
   * As falas tornam visível o custo da rotina entre turnos e deixam Ana propor
   * uma verificação prática, sem transformar Tiago em obstáculo.
   */
  'b3-tiago': {
    id: 'b3-tiago',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Cada lote passa por essa conferência. A gente anota no papel e só lança tudo na planilha no fim do turno.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'E até lá o próximo turno não consegue ver o que ficou pendente?' },
      { tipo: 'fala', quem: 'tiago', texto: 'Isso. Às vezes o pessoal chega e espera a gente terminar de lançar, ou vem perguntar lote por lote.' },
      { tipo: 'fala', quem: 'ana', texto: 'Será que dá pra registrar cada lote na planilha enquanto a conferência acontece?' },
      { tipo: 'fala', quem: 'tiago', texto: '(dá de ombros) Eu peguei o processo assim e fui seguindo. Ninguém me pediu pra rever.' },
      { tipo: 'fala', quem: 'ana', texto: 'Posso estudar um jeito de fazer isso sem atrasar a linha?' },
      { tipo: 'fala', quem: 'tiago', texto: '(pausa, depois ri) Pode. Ninguém pediu, mas eu quero ver se funciona.' },
    ],
  },

  /**
   * Uma pessoa ocupada reconhece o que Ana fez: não há promoção, bônus nem
   * aplauso. "Guardei seu nome" tem de ficar NO AR — ela
   * volta pro monitor e a conversa acaba seca, sem despedida.
   *
   * É o setup da fase 6, onde a Cláudia diz que o nome da Ana apareceu em três
   * lugares diferentes. Se esta fala mudar, aquela perde o chão.
   */
  'b3-claudia': {
    id: 'b3-claudia',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'O que é isso?' },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'A conferência da linha, lembra? Aquela que só vai pra planilha no fim do turno.',
      },
      { tipo: 'fala', quem: 'claudia', texto: '(folheando) Quem te pediu isso?' },
      { tipo: 'fala', quem: 'ana', texto: 'Ninguém.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Peraí... seis meses fazendo isso à mão e ninguém tinha juntado por escrito?',
      },
      { tipo: 'fala', quem: 'claudia', texto: 'Guardei seu nome. É bom ver alguém que percebe um problema e tenta melhorar o processo.' },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'protagonismo' },
      { tipo: 'destravarLugar', lugarId: 'sala-reunioes' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
