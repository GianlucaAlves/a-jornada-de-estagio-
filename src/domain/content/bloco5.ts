/**
 * FASE 5 — competências, faculdade e incerteza (apresenta: Marianna).
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PENDÊNCIA FECHADA — a fase já acontece em OUTRA ÁREA DA EMPRESA.          │
 * │                                                                          │
 * │ Andar diferente, baias de outro time, outra luz (ADR-031). O lugar dá o   │
 * │ motivo da cena de graça — ela SE DESLOCOU para ter aquela conversa, e     │
 * │ isso já diz que a conversa importava. O Escritório era ANDAIME e saiu     │
 * │ inteiro: ao contrário da fase 3, ele não faz parte nenhuma desta fase.    │
 * │                                                                          │
 * │ O que travava vivia em arquivo de outra frente e já caiu:                 │
 * │ `LUGARES_SEM_CENA_AINDA`, em integridade.test.ts, está VAZIA.             │
 * │                                                                          │
 * │ JANELA VÁLIDA em `outra-area` (piso ∩ canvas ∩ overlays), conferida com   │
 * │ `scripts/_mapa_chao.py` e mantida aqui para quem remexer nas coordenadas: │
 * │   x%  5,5..12 → y 53,5..82   ·  14..18,5 → 64..82  ·  19..24 → 64..77,5   │
 * │   26..33 → 53,5..77,5  ·  33,5..45,5 → 64..77,5  ·  46..48,5 → 60..77,5   │
 * │   50..56 → 60..77,5    ·  57..72,5 → 60..77,5                             │
 * │                                                                          │
 * │ O PAR DA BIANCA E DA ANA É O ESPELHO DO PAR SUGERIDO, e a troca é         │
 * │ obrigada pelo cenário, não gosto: a única faixa livre do tampo comprido   │
 * │ é a ponta DIREITA (o resto já tem monitor, cadeira e papel pintados no    │
 * │ cenário), então a `b5-grade` tem de morar em x 71%. Com a Bianca em 57%,   │
 * │ toda parada legal para a grade caía a ~480px da tela que a Ana está       │
 * │ olhando — figura de 200px não passa entre a Bianca e o monitor. Espelhado │
 * │ (Bianca 44%/70, Ana 32%/74), as duas leituras ficam perto do alvo, a Ana  │
 * │ para do lado por onde entra, e os dois valores continuam dentro da janela │
 * │ acima. A distância entre as figuras é a mesma do par sugerido: ~230px.    │
 * │                                                                          │
 * │ OS DOIS OBJETOS foram olhados em `docs/arte/previa-b5-outra-area.png`:    │
 * │ objeto não é validado contra piso, então só o olho pega monitor           │
 * │ flutuando.                                                               │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * NENHUM PUZZLE, e isso é desenho: A MECÂNICA DESTA FASE É O PAINEL DE SKILLS.
 * Ele deixa de ser painel e passa a ser o gameplay — a pessoa percorre as nove
 * skills uma por uma, e é assim que ela revisa o estágio. O conteúdo aqui existe
 * para DAR MOTIVO de abrir o painel, não para repetir o que ele diz: `b5-caderno`
 * manda olhar a lista, e a lista é o painel.
 *
 * O TOM É O MAIS DELICADO DO PROJETO, e a regra é negativa: o jogo NUNCA afirma
 * o desfecho aqui (ADR-028). Ela não sabe se fica — e por não saber, poderia ser
 * que não fosse. Não existe nesta fase uma linha que diga que ela pode não ser
 * efetivada, e não existe consolo antecipado: afirmar o desfecho destrói esta
 * fase, e consolar antes destrói a fase 6. O que existe é insegurança COM
 * orgulho do que foi construído.
 *
 * A PERGUNTA DA FASE FICA ABERTA de propósito. `b5-grade` põe as competências
 * dela contra a grade da faculdade e não resolve nada: três matérias que ela
 * reconhece, nenhuma que ela usa. Quem responde é a plateia, não o jogo.
 *
 * A BIANCA VOLTA AQUI (ADR-027), e é a fala mais importante desta frente. As
 * duas aparições dela são as pontas do arco de aprendizado: na fase 2 ela diz
 * COMO estudar, na fase 5 ela diz que está tudo bem se o caminho mudar — e a
 * segunda só tem peso porque a primeira existiu. É a ÚNICA exceção autorizada ao
 * expurgo de vocabulário técnico (`b5-pivo`, nó 3), porque a frase depende do
 * contraste entre as duas áreas: tirar a tecnologia da boca dela mataria
 * exatamente o argumento de que dá para pivotar. Para uma plateia de estagiários
 * de áreas diferentes, ela é a figura com quem mais gente vai se identificar.
 *
 * COORDENADAS: remedidas em `outra-area`, contra a janela do cabeçalho. As
 * herdadas do Escritório não valiam mais nada aqui — a parada em 12%/80% era o
 * bolsão à esquerda da mesa DE LÁ, e 80% em y cai debaixo da linha de nome do
 * hotspot neste enquadramento. Os dois objetos apoiam em tampo de cenário e por
 * isso nenhum teste os cobre: eles foram conferidos com o olho na prévia.
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
         * Apoia na mesa baixa da esquerda, longe do tampo comprido: é a única
         * superfície do cenário que não tem coisa pintada em cima. A parada vai
         * para 8% porque em 12% o ombro dela já cobriria o caderno.
         */
        id: 'b5-caderno',
        rotulo: 'Caderno dela',
        arte: { tipo: 'objeto', assetId: 'objeto-notebook-aberto', largura: 160, altura: 112 },
        pos: { x: 20, y: 53 },
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
         */
        id: 'b5-grade',
        rotulo: 'Grade do próximo semestre',
        arte: { tipo: 'objeto', assetId: 'objeto-monitor-ligado', largura: 192, altura: 144 },
        // Coisa de mesa: ancora pelo centro para a base cair na aresta do tampo.
        // Ancorado pela base ele flutuaria — já foi visto na prévia.
        ancora: 'centro',
        // Ponta DIREITA do tampo comprido: é o único trecho dele sem monitor,
        // cadeira ou papel já pintado no cenário. Em x 71% a borda direita da
        // arte para em 1459px, 41px antes do painel de skills.
        pos: { x: 71, y: 47 },
        parada: { x: 60, y: 74 },
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A grade do próximo semestre aberta na tela. Ela reconhece três matérias pelo nome. ' +
              'Nenhuma das três é o que ela faz todo dia.',
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
         * pergunta do nó 2 não existe e a Bianca responde no vácuo.
         *
         * Ela fica à ESQUERDA do tampo e a Ana para à direita dela — ver o
         * cabeçalho: é o espelho do par sugerido, e o espelho existe porque a
         * grade ocupa a ponta direita da mesa.
         */
        id: 'b5-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 44, y: 70 },
        // Ela para à ESQUERDA da Bianca — o lado por onde entra (a posição de
        // entrada é 6%). Parar à direita a fazia passar por dentro da Bianca
        // para depois virar, e na prévia colava com a parada da grade: as duas
        // únicas paradas legais à direita caem na mesma faixa de 128px.
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
   * alguma regra do projeto — vale ler as quatro que governam este diálogo:
   *
   * 1. O nó 2 é o único lugar da fase em que a incerteza é dita, e ela é dita
   *    como NÃO SABER, nunca como previsão. "Eu não sei se eu fico" é honesto;
   *    "eu acho que não vou ficar" seria o jogo afirmando o desfecho, e mataria
   *    a fase 6.
   * 2. O nó 3 é a EXCEÇÃO DECLARADA ao expurgo de vocabulário técnico. Ela é
   *    formada em Letras e trabalha com tecnologia, e a frase só funciona com as
   *    duas coisas nomeadas de verdade: sem o contraste, "dá para mudar de área"
   *    vira conselho genérico de cartaz.
   * 3. O nó 5 é a fala que o projeto inteiro existe para poder dizer. Ela não
   *    aconselha, não consola e não promete nada: conta o que aconteceu com ela
   *    e reenquadra de passagem. "Parar de chamar isso de desvio" é o pivô sem a
   *    palavra pivô, e sem prometer final feliz a ninguém.
   * 4. O nó 6 é o que sobra de qualquer jeito — a tese da fase, e a rima com o
   *    clímax, onde os itens se apagam e as skills ficam. Repare que ele não
   *    fala de ficar nem de sair: fala de propriedade.
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
        quem: 'bianca',
        texto: 'Eu desenho API e escrevo documentação técnica. Sou formada em Letras.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'E era isso que você queria?' },
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
