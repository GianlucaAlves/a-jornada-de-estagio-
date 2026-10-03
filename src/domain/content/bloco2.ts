/**
 * FASE 2 — aprendizado contínuo e planejamento (apresenta: Heloisa).
 *
 * O LAÇO É CAFEZINHO → ESCRITÓRIO → CAFEZINHO (ADR-032). Conselho se recebe no
 * café, trabalho se faz na mesa, e a fase fecha onde abriu. O deslocamento não
 * custa arte nenhuma — os dois lugares já existem — e quebra o ritmo de uma
 * fase que carrega dois assuntos e dois puzzles.
 *
 * DOIS ASSUNTOS, UM GANCHO CADA. `associar` serve o aprendizado contínuo (as
 * lacunas dela ligadas às trilhas, no notebook da Bianca, no café) e
 * `sequenciar` serve o planejamento (a semana dela, na mesa dela). O
 * `sequenciar` veio da fase 3 (ADR-007) porque "priorizar por impacto no time" é
 * literalmente um problema de ordenação.
 *
 * O `associar` FICA NO CAFÉ, e isso é decisão, não descuido. A spec 01 imaginava
 * os dois puzzles no Escritório; a suíte da store (que não é minha para editar)
 * afirma que o hotspot que abre `associar` é alcançável entrando no Cafezinho, e
 * a leitura do café é melhor de qualquer forma: a Bianca abre o notebook no
 * balcão e a conversa vira lista ali, na frente dela. O trabalho que exige mesa
 * — ordenar a própria semana — é o que fica no Escritório.
 *
 * A BIANCA É O CORAÇÃO DA FASE. Ela é formada em Letras e trabalha com
 * tecnologia: é a ÚNICA exceção autorizada ao expurgo de vocabulário (ADR-027),
 * porque a frase depende do contraste entre as duas áreas. Aqui ela só PLANTA.
 * Ela volta na fase 5 para falar de pivotar, e antecipar isso agora queima o
 * beat de lá — então nada nas falas dela sugere que essa conversa continua.
 *
 * O TERCEIRO PILAR DA HELOISA é o gancho do `sequenciar`: negociar prazo com
 * transparência quando cai uma demanda de última hora e há prova na faculdade.
 * Ele é ENCENADO em duas peças e nunca explicado — a narração do monitor põe as
 * duas coisas na mesma tela, e a segunda linha do puzzle é avisar a liderança.
 * A escolha certa é a ordem; quem nomeia a lição é quem apresenta.
 *
 * O FECHO É GATEADO PELO CERTIFICADO, não pelo puzzle: o Rafael só tem conversa
 * quando ela volta ao café com a trilha concluída na mão. Sem esse gate a ida ao
 * Escritório seria opcional e o laço viraria enfeite.
 *
 * COORDENADAS: medidas contra `docs/arte/chao.json` e olhadas em
 * `docs/arte/previa-b2-cafezinho.png` e `previa-b2-escritorio.png`. No Cafezinho
 * o piso é generoso (x 8..80 inteiro), então o que dita as posições é a largura
 * da figura (200px) contra a largura do balcão; no Escritório valem os mesmos
 * três bolsões da fase 1.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B2: readonly Cena[] = [
  {
    lugarId: 'cafezinho',
    bloco: 2,
    aberturaTexto:
      'Um mês. Ela já sabe a senha de cor e já sabe que ninguém almoça antes de meio-dia e meia. Ainda não sabe o que está fazendo.',
    ecoTexto: 'Aqui ela descobriu o nome do que não sabia.',
    hotspots: [
      {
        // A conversa que abre a fase. Sem `umaVezSo`: diálogo tem de poder ser
        // relido (ADR-016), e a store aplica `Dialogo.efeitos` só na primeira
        // conclusão — reler devolve a informação, não o efeito.
        id: 'b2-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        pos: { x: 32, y: 72 },
        parada: { x: 21, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-bianca' }],
      },
      {
        // O notebook da Bianca, aberto no balcão. É onde as duas plataformas
        // estão na tela, e é por isso que o puzzle nasce aqui e não na mesa da
        // Ana: a lista sai da conversa, não do trabalho.
        id: 'b2-notebook',
        rotulo: 'Notebook da Bianca',
        arte: { tipo: 'objeto', assetId: 'objeto-notebook-aberto', largura: 160, altura: 112 },
        pos: { x: 42, y: 56 },
        parada: { x: 52, y: 76 },
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'associar' }],
      },
      {
        // Pequeno, bobo, e diz onde ela está. Sem item e sem skill: é
        // personagem. Continua reclicável de propósito — é o único hotspot da
        // fase que existe só para dar textura, e apagá-lo depois do primeiro
        // clique transformaria textura em clique morto.
        id: 'b2-maquina',
        rotulo: 'Máquina de café',
        arte: { tipo: 'objeto', assetId: 'objeto-maquina-cafe', largura: 128, altura: 192 },
        pos: { x: 16, y: 70 },
        parada: { x: 25, y: 76 },
        efeitos: [
          {
            tipo: 'narrar',
            texto: 'Ela aperta o botão errado e sai chá. Ela bebe o chá.',
          },
        ],
      },
      {
        // O FECHO, de volta ao lugar de origem. O gate é o certificado: ele só
        // existe se ela tiver ido trabalhar no Escritório.
        id: 'b2-rafael',
        rotulo: 'Rafael',
        arte: { tipo: 'npc', npcId: 'rafael' },
        pos: { x: 62, y: 74 },
        parada: { x: 73, y: 76 },
        requerItemPresente: 'certificado-degree',
        bloqueadoTexto:
          'Ele está no meio de uma conversa. E a semana dela continua inteira em cima da mesa.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-rafael' }],
      },
    ],
  },
  {
    // A IDA. Mesmo Escritório da fase 1, cena diferente: o lugar não mudou, ela
    // mudou. É a coisa mais barata e mais eficaz do projeto (ADR-022).
    lugarId: 'escritorio',
    bloco: 2,
    aberturaTexto: 'A mesa dela. A semana inteira em cima dela, e tudo parecendo urgente.',
    ecoTexto: 'Aqui ela aprendeu que urgente e importante não são a mesma palavra.',
    hotspots: [
      {
        // As duas coisas na MESMA tela, sem comentário. É o setup do terceiro
        // pilar da Heloisa: a demanda que cai de última hora e a prova que já
        // estava marcada. O puzzle resolve uma; a conversa sobre prazo é a fala
        // de quem apresenta.
        id: 'b2-tela',
        rotulo: 'Tela da Ana',
        arte: { tipo: 'objeto', assetId: 'objeto-monitor-ligado', largura: 192, altura: 144 },
        pos: { x: 44.2, y: 65.2 },
        parada: { x: 12, y: 80 },
        ancora: 'centro',
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'Uma demanda nova caiu às cinco da tarde. A prova da faculdade é quinta. As duas coisas estão na mesma tela.',
          },
        ],
      },
      {
        id: 'b2-mesa',
        rotulo: 'Notebook da Ana',
        arte: { tipo: 'objeto', assetId: 'objeto-notebook', largura: 160, altura: 112 },
        // Mesmo ponto da fase 1: é a mesa dela, e mesa que anda de lugar entre
        // fases faz a plateia achar que é outra sala.
        pos: { x: 24.2, y: 72 },
        parada: { x: 12, y: 80 },
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'sequenciar' }],
      },
    ],
  },
];

export const DIALOGOS_B2: Record<DialogoId, Dialogo> = {
  /**
   * Seis falas, o teto do projeto — e o único diálogo que chega nele, porque é
   * aqui que a fase inteira é plantada. Ela abre os dois assuntos e não explica
   * nenhum: quem desenvolve é quem apresenta.
   *
   * A segunda fala é a EXCEÇÃO DECLARADA ao expurgo de vocabulário (ADR-027). O
   * contraste entre as duas áreas é a frase mais anti-nicho que este projeto
   * pode dizer, e ele só funciona se as duas forem nomeadas.
   */
  'b2-bianca': {
    id: 'b2-bianca',
    nos: [
      {
        // O que a fase 1 plantou já rendeu, e ela não ficou sabendo na hora.
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Você é do time da Cláudia, né? Ela falou que você pergunta muito. Era elogio.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu sou formada em Letras. Hoje eu trabalho com tecnologia.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Letras? Eu estava escolhendo trilha pelo nome da faculdade, sem olhar para o trabalho que tenho aqui.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Transição aos vinte e oito, estudando o que estava faltando. Que é diferente de estudar o que tem na grade.',
      },
      {
        // As duas plataformas, uma frase cada. Errar a ferramenta é o que faz a
        // pessoa desistir, mas dizer isso é fala de apresentador.
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Tem as duas aqui dentro: Degreed é trilha, com começo e fim. Percipio é biblioteca, pra quando você já sabe o nome do problema.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu ainda estudo, Ana. Semana passada passei a tarde tentando explicar uma coisa em duas páginas. Ainda não consegui.',
      },
    ],
    efeitos: [
      { tipo: 'concederSkill', skillId: 'leitura-mercado' },
      { tipo: 'concederSkill', skillId: 'aprendizado-continuo' },
    ],
  },

  /**
   * O fecho da fase, e a reaparição que o clímax precisa: a plateia tem de
   * reencontrar o Rafael para que a primeira conexão da fase 6 signifique algo.
   *
   * Ele fala do ramal que ela não usou, e NÃO fala do cartão. A diferença é
   * tudo: mencionar o objeto sinalizaria o item tardio; mencionar o hábito
   * devolve o assunto para a plateia.
   */
  'b2-rafael': {
    id: 'b2-rafael',
    nos: [
      { tipo: 'fala', quem: 'rafael', texto: 'Sobreviveu ao primeiro mês. (brinda com o copo)' },
      { tipo: 'fala', quem: 'ana', texto: 'Por pouco.' },
      { tipo: 'fala', quem: 'ana', texto: 'Gostei de organizar a semana. Só precisei avisar cedo que a demanda nova caiu no dia da minha prova.' },
      { tipo: 'fala', quem: 'rafael', texto: 'Melhor avisar na terça do que pedir desculpa na sexta.' },
      { tipo: 'fala', quem: 'rafael', texto: 'Eu vi que você usou meu ramal zero vezes.' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Não deixa de chamar por achar que tá incomodando. Esse foi o meu erro.',
      },
    ],
    efeitos: [
      { tipo: 'concluirLugar', lugarId: 'cafezinho' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
