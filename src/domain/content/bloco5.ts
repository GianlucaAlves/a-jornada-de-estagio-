/**
 * FASE 5 — competências, faculdade e incerteza (apresenta: Marianna).
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PENDÊNCIA FECHADA — a fase já acontece em OUTRA ÁREA DA EMPRESA.          │
 * │                                                                           │
 * │ Andar diferente, baias de outro time, outra luz (ADR-031). O lugar dá o   │
 * │ motivo da cena de graça — ela SE DESLOCOU para ter aquela conversa, e     │
 * │ isso já diz que a conversa importava. O Escritório era ANDAIME e saiu     │
 * │ inteiro: ao contrário da fase 3, ele não faz parte nenhuma desta fase.    │
 * │                                                                           │
 * │ O que travava vivia em arquivo de outra frente e já caiu:                 │
 * │ `LUGARES_SEM_CENA_AINDA`, em integridade.test.ts, está VAZIA.             │
 * │                                                                           │
 * │ JANELA VÁLIDA em `outra-area` (piso ∩ canvas ∩ overlays), conferida com   │
 * │ `scripts/_mapa_chao.py` e mantida aqui para quem remexer nas coordenadas: │
 * │   x%  5,5..12 → y 53,5..82   ·  14..18,5 → 64..82  ·  19..24 → 64..77,5   │
 * │   26..33 → 53,5..77,5  ·  33,5..45,5 → 64..77,5  ·  46..48,5 → 60..77,5   │
 * │   50..56 → 60..77,5    ·  57..72,5 → 60..77,5                             │
 * │                                                                           │
 * │ O PAR DA BIANCA E DA ANA continua ESPELHADO (Bianca 44%/70, Ana           │
 * │ 32%/74): a Ana entra em 6% e para à ESQUERDA dela, em vez de atravessar   │
 * │ a figura para depois virar. ~230px entre as duas, e as duas dentro da     │
 * │ janela acima.                                                             │
 * │                                                                           │
 * │ MEDIDO NO CENÁRIO, e corrige o que estava escrito aqui: a ponta DIREITA   │
 * │ do tampo comprido não é a faixa livre — é a mais suja. Varrendo o plano   │
 * │ do tampo (y 520..635 em px de tela) coluna a coluna, só x 1148..1260,     │
 * │ 1284..1316 e 1432..1456 são madeira limpa. Em x 71%, onde a `b5-grade`    │
 * │ morava, o cenário PINTA uma tela sobre a mesa (y 528..599), e a arte      │
 * │ emprestada do monitor cobria justamente ela: duas telas empilhadas que    │
 * │ a prévia não denunciava, porque a de cima escondia a de baixo. Daí a      │
 * │ folha descer para x 62,5%.                                                │
 * │                                                                           │
 * │ OBJETO NÃO É VALIDADO CONTRA PISO — só o olho pega objeto flutuando. E    │
 * │ o olho ainda não pôde ver estes dois: `objeto-caderno` e                  │
 * │ `objeto-grade-curricular` vêm de outra frente e ainda não existem,        │
 * │ então a prévia mostra o placeholder no lugar certo, não a arte. Quando    │
 * │ o PNG chegar, rode `previa_de_cena.py` de novo e confira o apoio.         │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * NENHUM PUZZLE, e isso é desenho: A MECÂNICA DESTA FASE É O PAINEL DE SKILLS.
 * Ele deixa de ser painel e passa a ser o gameplay — a pessoa percorre as nove
 * skills uma por uma, e é assim que ela revisa o estágio. O conteúdo aqui existe
 * para DAR MOTIVO de abrir o painel, não para repetir o que ele diz: `b5-caderno`
 * manda olhar a lista, e a lista é o painel.
 *
 * O TOM É O MAIS DELICADO DO PROJETO, e a linha é FINA: o jogo nunca afirma nem
 * prevê o desfecho (ADR-028) e, ao mesmo tempo, a fase precisa pensar em voz
 * alta o que acontece se a efetivação não vier. A primeira versão errou para o
 * lado do zelo — proteger a cena de AFIRMAR o desfecho deixou de fora a
 * REFLEXÃO, e o dono cobrou de volta: numa plateia de estagiários com contrato
 * de prazo definido, é o gancho mais forte que esta fase tem.
 *
 * Onde a linha passa, em três exemplos:
 *
 *   PROIBIDO  "eu acho que não vou ficar" — é previsão, e mata a fase 6.
 *   PROIBIDO  "se eu não ficar, foi bom mesmo assim" — é consolo antecipado, e
 *             gasta antes da hora aquilo que a fase 6 existe para dar.
 *   É ISSO    "Se eu ficar, eu já sei onde eu sento na segunda. Se não ficar, eu
 *             saio com esse caderno e sem saber o que ele vale lá fora."
 *
 * As duas hipóteses aparecem JUNTAS e SIMÉTRICAS, uma frase cada, e nenhuma é
 * apostada. O que ela construiu não depende do resultado — mas não é ela quem
 * diz isso: a fala dela termina em dúvida (`b5-pivo`, nó 3) e a resposta vem da
 * Bianca, no nó 6. Se a Ana fechasse a própria pergunta, o nó 6 viraria eco e a
 * tese da fase sairia da boca de quem ainda não sabe nada. O que existe aqui é
 * insegurança COM orgulho do que foi construído.
 *
 * A PERGUNTA DA FASE FICA ABERTA de propósito. `b5-grade` põe as competências
 * dela contra a grade da faculdade e não resolve nada: três matérias que ela
 * reconhece, nenhuma que ela usa. Quem responde é a plateia, não o jogo.
 *
 * A BIANCA VOLTA AQUI (ADR-027), e é a fala mais importante desta frente. As
 * duas aparições dela são as pontas do arco de aprendizado: na fase 2 ela diz
 * COMO estudar, na fase 5 ela diz que está tudo bem se o caminho mudar — e a
 * segunda só tem peso porque a primeira existiu. É a ÚNICA exceção autorizada ao
 * expurgo de vocabulário técnico (`b5-pivo`, nó 4), porque a frase depende do
 * contraste entre as duas áreas: tirar a tecnologia da boca dela mataria
 * exatamente o argumento de que dá para pivotar. Para uma plateia de estagiários
 * de áreas diferentes, ela é a figura com quem mais gente vai se identificar.
 *
 * E a ARMADILHA dela é o consolo. A Bianca não promete final feliz, não diz que
 * vai dar tudo certo e não responde à dúvida da Ana com garantia nenhuma: ela
 * conta o que aconteceu com ela — não seguiu o caminho previsto e está bem — e
 * reenquadra de passagem. No minuto em que ela consolar, a fase 5 passa a gastar
 * o que é da fase 6 e a Ana deixa de ser alguém que não sabe.
 *
 * COORDENADAS: remedidas em `outra-area`, contra a janela do cabeçalho. As
 * herdadas do Escritório não valiam mais nada aqui — a parada em 12%/80% era o
 * bolsão à esquerda da mesa DE LÁ, e 80% em y cai debaixo da linha de nome do
 * hotspot neste enquadramento. Os dois objetos apoiam em tampo de cenário e por
 * isso nenhum teste os cobre — agora eles não foram só olhados, foram MEDIDOS
 * contra o PNG do cenário (ver a caixa acima), porque olhar não pega objeto que
 * a arte emprestada cobre.
 *
 * E vale a ressalva de junta: a frente de cenários está revestindo `outra-area`
 * nesta mesma rodada (a sala está lavada e há artefato no chão). Se o
 * mobiliário mudar de lugar, as duas coordenadas de objeto daqui precisam de
 * nova medição — o teste de chão não vai reprovar, porque objeto não é chão.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B5: readonly Cena[] = [
  {
    lugarId: 'outra-area',
    bloco: 5,
    aberturaTexto:
      'Dois anos. O contrato fecha em três semanas e ninguém falou nada sobre isso. ' +
      'Ela pediu meia hora com alguém de outro time, e atravessou o prédio para ter.',
    ecoTexto: 'Aqui ela contou o que aprendeu, e a lista era mais comprida do que ela lembrava.',
    hotspots: [
      {
        /**
         * O motivo de abrir o painel. A narração NÃO lista as skills: listar
         * aqui faria a plateia ler duas vezes a mesma coisa e o painel voltaria
         * a ser enfeite, quando ele é a mecânica desta fase.
         *
         * Apoia na mesa baixa da esquerda, longe do tampo comprido: medida
         * coluna a coluna em x 304..464, ela não tem coisa nenhuma pintada em
         * cima. A parada vai para 8% porque em 12% o ombro dela já cobriria o
         * caderno.
         *
         * A ARTE ERA UM LAPTOP (`objeto-notebook-aberto`) e perdia a discussão
         * com o próprio rótulo: a narração fala de abrir uma página e escrever
         * em cima, e a tela mostrava um equipamento. `objeto-caderno` é papel.
         * A altura cai de 112 para 96px porque papel aberto não tem tela em pé;
         * a LARGURA fica igual de propósito, para que a pegada do objeto na
         * mesa não mude e nada em volta precise de nova medição.
         *
         * E o y desce de 53% para 54%, o que conserta um apoio que a prévia não
         * denunciava: medido no cenário, o tampo da mesa baixa é a faixa clara
         * y 576..587 (o corpo dela começa em 588), e a base em 53% caía em 572 —
         * na aresta de BAIXO do balcão marrom do fundo, ~11px no ar em relação
         * à mesa. Com o laptop desenhado sobre um balcão escuro isso não se via;
         * com uma folha de papel se veria na primeira exibição. 54% = 583px,
         * dentro da faixa do tampo.
         */
        id: 'b5-caderno',
        rotulo: 'Caderno dela',
        arte: { tipo: 'objeto', assetId: 'objeto-caderno', largura: 160, altura: 96 },
        pos: { x: 20, y: 54 },
        parada: { x: 8, y: 76 },
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'Ela abre uma página nova e escreve em cima: o que eu sei fazer hoje. ' +
              'A lista sai maior do que ela esperava, e nenhuma linha dela estava no plano.',
          },
        ],
      },
      {
        /**
         * Competências contra área de estudo. A pergunta da fase inteira, e ela
         * FICA ABERTA: nenhuma linha aqui diz se a faculdade valeu ou não, nem
         * se é esse o caminho. É gancho, e a lição é do apresentador.
         *
         * A ARTE ERA UM MONITOR (`objeto-monitor-ligado`) para uma grade
         * IMPRESSA, e com a troca para `objeto-grade-curricular` caem os dois
         * remendos que o monitor exigia:
         *
         * - a âncora volta a ser `base`, que é o padrão. O monitor precisava de
         *   'centro' para descer a arte até a aresta do tampo, porque o desenho
         *   dele tem pé e tela e a base do recorte não é a base do objeto.
         *   Folha apoia na própria última linha de pixel, e 'centro' aqui só
         *   devolveria o objeto flutuando — que é exatamente o que 'centro'
         *   tinha vindo consertar.
         * - o x sai de 71%. O cenário PINTA uma tela sobre a mesa naquela
         *   coluna (medido: y 528..599), e o monitor emprestado cobria justo
         *   ela. Em 62,5% a folha ocupa x 1152..1248, dentro do trecho de 116px
         *   de madeira limpa (1148..1260), e a base em y 56% (604px) cai entre
         *   a aresta de trás do tampo (520) e a da frente (635).
         *
         * Formato de folha e não de tela: 96x128 é retrato, 24x32 na grade de
         * arte, e é o que deixa caber linha e coluna legíveis em vídeo
         * comprimido. Alvo de clique passa dos 64px nos dois eixos sem folga
         * invisível.
         */
        id: 'b5-grade',
        rotulo: 'Grade do próximo semestre',
        arte: { tipo: 'objeto', assetId: 'objeto-grade-curricular', largura: 96, altura: 128 },
        pos: { x: 62.5, y: 56 },
        // A parada passa para a DIREITA da folha. Com a grade em 62,5%, parar em
        // 60% punha a figura de 200px em cima da arte que o clique acabou de
        // trazer para a conversa — o teste de geometria reprova isso, e é o
        // defeito nº 3 que a frente de interação consertou. Em 71% sobram 15px
        // entre a figura e a folha e 36px entre a figura e o painel de skills.
        parada: { x: 71, y: 74 },
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A grade do próximo semestre, impressa e dobrada no meio. ' +
              'Ela reconhece três matérias pelo nome. Nenhuma das três é o que ela faz todo dia.',
          },
        ],
      },
      {
        /**
         * O fecho da fase, e a fala que sustenta a apresentação para quem está
         * na plateia pensando em mudar de área.
         *
         * Gateado pelos dois beats anteriores porque a resposta dela só tem peso
         * depois de a Ana ter olhado a própria lista e a grade: sem isso a
         * dúvida dos nós 2 e 3 não existe e a Bianca responde no vácuo. O gate
         * também é o que autoriza o nó 3 a dizer "esse caderno" — o objeto já
         * passou pela tela.
         *
         * Ela fica no meio da cena, à esquerda do tampo comprido, e a Ana para à
         * ESQUERDA dela: é o espelho do par que a spec sugeria, e o cabeçalho
         * guarda o motivo.
         */
        id: 'b5-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 44, y: 70 },
        // Ela para à ESQUERDA da Bianca — o lado por onde entra (a posição de
        // entrada é 6%). Parar à direita a fazia passar por dentro da Bianca
        // para depois virar. A parada da grade, que antes disputava essa faixa,
        // mudou para 71% na v2.1 e não pressiona mais esta escolha; a escolha
        // fica porque a leitura de entrar-e-parar continua sendo a melhor.
        parada: { x: 32, y: 74 },
        requerHotspotsFeitos: ['b5-caderno', 'b5-grade'],
        bloqueadoTexto:
          'Bianca está terminando uma coisa. Ela pediu meia hora, e a meia hora é pra conversar — não pra chegar sem pergunta.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b5-pivo' }],
      },
    ],
  },
];

export const DIALOGOS_B5: Record<DialogoId, Dialogo> = {
  /**
   * A FALA DO PIVÔ (ADR-027, ADR-028). Seis nós, e cada um está no limite de
   * alguma regra do projeto — vale ler as cinco que governam este diálogo:
   *
   * 1. O nó 2 diz a incerteza como NÃO SABER, nunca como previsão. "Eu não sei
   *    se eu fico" é honesto; "eu acho que não vou ficar" seria o jogo afirmando
   *    o desfecho, e mataria a fase 6.
   * 2. O NÓ 3 É O PASSO DO MEIO, e ele FALTAVA (v2.1). Sem ele a fase ia de "não
   *    sei se fico" direto para "o que você aprendeu é seu", e a plateia nunca
   *    via a Ana pensar no que acontece se a efetivação não vier — que é o
   *    gancho que o dono cobrou. As duas hipóteses entram juntas e simétricas,
   *    uma frase cada, e nenhuma é apostada. Repare no que o nó NÃO faz: não se
   *    consola, não conclui nada, e termina sem resposta. É a dúvida que o nó 6
   *    responde, e é por isso que ela tem de ficar aberta aqui.
   * 3. O nó 4 é a EXCEÇÃO DECLARADA ao expurgo de vocabulário técnico. Ela é
   *    formada em Letras e trabalha com tecnologia, e a frase só funciona com as
   *    duas coisas nomeadas de verdade: sem o contraste, "dá para mudar de área"
   *    vira conselho genérico de cartaz.
   * 4. O nó 5 é a fala que o projeto inteiro existe para poder dizer. Ela não
   *    aconselha, não consola e não promete nada: conta o que aconteceu com ela
   *    e reenquadra de passagem. "Parar de chamar isso de desvio" é o pivô sem a
   *    palavra pivô, e sem prometer final feliz a ninguém.
   * 5. O nó 6 é o que sobra de qualquer jeito — a tese da fase, e a rima com o
   *    clímax, onde os itens se apagam e as skills ficam. Repare que ele não
   *    fala de ficar nem de sair: fala de propriedade. E ele responde ao nó 3
   *    palavra por palavra: a Ana não sabe o que a lista dela vale fora daqui, e
   *    a resposta é que a lista é dela em qualquer um dos dois cenários.
   *
   * O QUE ESTE DIÁLOGO PERDEU PARA CABER: a pergunta da Ana "E era isso que você
   * queria?", que era o nó 4 até a v2.1. O teto é de seis nós (o NPC planta, o
   * apresentador desenvolve — integridade.test.ts cobra), e entre aquela
   * pergunta e a reflexão sobre as duas hipóteses a reflexão vale mais. O nó 5
   * continua de pé sem ela: "isso" aponta para o trabalho que a Bianca acabou de
   * descrever no nó 4, não para uma pergunta da Ana.
   *
   * A LIÇÃO NÃO ESTÁ AQUI. Que pivotar não é erro, que a experiência adquirida é
   * o que mais importa, e o que fazer com isso na segunda-feira — tudo isso é
   * fala da Marianna (docs/roteiro/05-bloco-5.md).
   */
  'b5-pivo': {
    id: 'b5-pivo',
    nos: [
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Você está com cara de quem está fazendo uma conta que não fecha.',
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'Eu não sei se eu fico. E não sei se é isso que eu quero fazer.',
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto:
          'Se eu ficar, eu já sei onde eu sento na segunda. ' +
          'Se não ficar, eu saio com esse caderno e sem saber o que ele vale lá fora.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu desenho API e escrevo documentação técnica. Sou formada em Letras.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu nem sabia que isso existia. Levei um tempo pra parar de chamar isso de desvio.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'O que você aprendeu a fazer aqui é seu. Isso não fica com a empresa.',
      },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'plano-futuro' },
      // Conclui OUTRA ÁREA, não o Escritório: a fase mudou de lugar e concluir
      // um lugar em que ela não esteve apagaria do mapa um slot que a fase 6
      // ainda precisa nomear.
      { tipo: 'concluirLugar', lugarId: 'outra-area' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
