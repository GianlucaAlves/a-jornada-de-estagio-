/**
 * Os cinco puzzles. Cada mecânica é metáfora do tema da sua fase, todas
 * resolvíveis em menos de 40 segundos e legíveis sem tutorial.
 *
 * AS MECÂNICAS FICARAM; O RECHEIO É NOVO (ADR-004). Mecânica já foi escolhida
 * para ser metáfora e testada quanto ao tempo — isso é o caro. Recheio é texto,
 * e o texto todo saiu de tecnologia (ADR-002): nada de fila de integração, log,
 * retry, timeout nem versionamento. A Ana é de apoio a projetos, e o que ela
 * resolve é planilha, prazo, reunião, relatório e cobrança de status.
 *
 * CADA PUZZLE TEM DE SER GANCHO DA FALA DO APRESENTADOR daquela fase — o puzzle
 * não é entretenimento, é o trampolim (ADR-004). Onde o gancho é menos óbvio,
 * está anotado no comentário do puzzle. Os ganchos NÃO são campo tipado: eles
 * vivem nos roteiros e no roteiro pessoal de quem apresenta (ADR-008).
 *
 * Três coisas novas em todos os cinco, porque a auditoria mediu que faltavam:
 * `instrucao` visível (três só diziam o que fazer em `aria-label`), `textoErro`
 * (nenhum avisava quando se errava) e, no `montar`, GABARITO — sem ele não
 * havia o que entender ali (ADR-010, ADR-011).
 */
import type { PuzzleDef, PuzzleId } from '../types';

export const PUZZLES: Record<PuzzleId, PuzzleDef> = {
  /**
   * FASE 1 — timidez e insegurança. O puzzle é SOCIAL, não lógico: nenhuma das
   * três pessoas tem a senha inteira, e a única forma de montá-la é falar com
   * as três. Continua digitado por decisão do dono (ADR-016).
   *
   * A senha é NOVO1203, em três pedaços universais de primeiro acesso:
   * prefixo fixo da empresa (Tiago), código do time (Cláudia) e o dia em que
   * ela entrou (Rafael). Saíram `ERI`/`DT7`/`01`, que carregavam o nome do
   * squad de tecnologia junto.
   *
   * `npcId` em cada campo é o CONTRATO com a frente de conteúdo: a pista tem de
   * ser dita de forma literal e inequívoca na fala daquele NPC, senão o puzzle
   * fica insolúvel ao vivo — e o teste de integridade cobra isso token por
   * token, não por substring, para que `12` não passe de graça dentro de `2012`.
   */
  senha: {
    id: 'senha',
    tipo: 'senha',
    rotulo: 'Senha temporária de primeiro acesso',
    instrucao:
      'Três campos, três pessoas. Cada uma sabe um pedaço; ninguém sabe a senha inteira.',
    textoErro: 'A senha não abriu. Confira os três campos.',
    campos: [
      // Tiago é veterano do operacional: a parte que é igual pra todo mundo é
      // justamente a que quem está há anos na casa responde sem pensar.
      { id: 'prefixo', rotulo: 'Prefixo (igual para todo mundo)', npcId: 'tiago' },
      // Só a líder sabe o código do próprio time — e é a deixa para ela
      // perguntar "o que te trouxe pra cá", que planta o autoconhecimento.
      { id: 'time', rotulo: 'Código do time (2 dígitos)', npcId: 'claudia' },
      // O Rafael entrega o último pedaço E o cartão. É a ponte social: o item
      // tardio nº 1 nasce de uma conversa que ela precisou ter.
      { id: 'dia', rotulo: 'Dia em que você entrou (2 dígitos)', npcId: 'rafael' },
    ],
    gabarito: ['NOVO', '12', '03'],
  },

  /**
   * FASE 2 — aprendizado contínuo. Quatro lacunas ligadas a quatro trilhas, em
   * Degreed e Percipio (ADR-005; o código escrevia `Degree`, que estava errado).
   *
   * As lacunas são as que qualquer estagiário reconhece: organizar a semana,
   * falar em reunião, escrever e-mail que a pessoa responde, montar planilha
   * que alguém entende. Nenhuma pede vocabulário de área.
   *
   * PLANTIO: a lacuna da reunião é exatamente a que falta nela na fase 4, onde o
   * tema é saber se vender. Não comentar durante o puzzle — o callback é da
   * frente de conteúdo, e antecipá-lo aqui queima o beat.
   */
  associar: {
    id: 'associar',
    tipo: 'associar',
    rotulo: 'O que falta, e onde aprender',
    instrucao: 'Ligue cada lacuna à trilha que fecha ela.',
    textoErro: 'Essa trilha não fecha essa lacuna.',
    esquerda: [
      { id: 'lacuna-semana', texto: 'Organizar a semana quando tudo parece urgente' },
      { id: 'lacuna-reuniao', texto: 'Falar numa reunião cheia de gente mais experiente' },
      { id: 'lacuna-email', texto: 'Escrever um e-mail que a pessoa responde' },
      { id: 'lacuna-planilha', texto: 'Montar uma planilha que outra pessoa entende' },
    ],
    direita: [
      { id: 'trilha-prioridades', texto: 'Degreed · Prioridades e gestão do próprio tempo (8h)' },
      { id: 'trilha-apresentar', texto: 'Percipio · Falar em público e conduzir reunião' },
      { id: 'trilha-escrita', texto: 'Percipio · Escrita profissional no trabalho' },
      { id: 'trilha-planilhas', texto: 'Degreed · Planilhas: montar, revisar, apresentar' },
    ],
    gabarito: {
      'lacuna-semana': 'trilha-prioridades',
      'lacuna-reuniao': 'trilha-apresentar',
      'lacuna-email': 'trilha-escrita',
      'lacuna-planilha': 'trilha-planilhas',
    },
  },

  /**
   * FASE 2 — planejamento. Veio da fase 3 (ADR-007), porque "priorizar por
   * impacto no time" é literalmente um problema de ordenação, e porque a fase 3
   * carregava dois puzzles seguidos e era a mais longa.
   *
   * O critério da ordem é UM e é dito na instrução: primeiro o que destrava o
   * trabalho de outras pessoas. A planilha de horas vem antes de tudo porque
   * três pessoas estão paradas por causa dela; a pasta do projeto vem por
   * último porque ninguém está esperando por ela.
   *
   * GANCHO — é o mais universal do projeto: a segunda linha é a demanda que cai
   * no mesmo dia da prova da faculdade, e a escolha certa é avisar cedo, com
   * transparência. Nem aceitar e entregar mal, nem dizer um não seco. O puzzle
   * ENCENA; quem apresenta é que nomeia (docs/roteiro/02-bloco-2.md).
   *
   * `linhas` já está embaralhada: a ordem de exibição não pode ser a resposta.
   */
  sequenciar: {
    id: 'sequenciar',
    tipo: 'sequenciar',
    rotulo: 'A semana dela',
    instrucao: 'Ordene de cima para baixo: primeiro o que destrava o trabalho do time.',
    textoErro: 'Não é essa a ordem.',
    linhas: [
      { id: 'seq-ata', texto: 'Enviar a ata da reunião de ontem para quem faltou' },
      {
        id: 'seq-planilha',
        texto: 'Corrigir a planilha de horas: três pessoas não conseguem lançar as delas',
      },
      { id: 'seq-pasta', texto: 'Organizar a pasta do projeto, que ninguém abre há um mês' },
      {
        id: 'seq-status',
        texto: 'Cobrar o status das duas frentes que a reunião de amanhã vai pedir',
      },
      {
        id: 'seq-prazo',
        texto: 'Avisar a liderança que a demanda nova cai no dia da prova da faculdade',
      },
    ],
    ordemCorreta: ['seq-planilha', 'seq-prazo', 'seq-status', 'seq-ata', 'seq-pasta'],
  },

  /**
   * FASE 3 — protagonismo. O conteúdo é a oportunidade que ela viu na linha de
   * produção: a conferência dos lotes é anotada no papel e só digitada no fim do
   * turno, então o turno seguinte começa no escuro (ADR-009).
   *
   * Uma etapa visivelmente mais lenta que as outras é compreensível para
   * plateia de qualquer área — ao contrário da tela de erro com timeout que
   * estava aqui antes, que exigia vocabulário para a pessoa saber que havia um
   * problema.
   *
   * OS DOIS DISTRATORES FICAM. Estruturar é ESCOLHER, não preencher: as duas
   * frases que não entram em lugar nenhum são verdadeiras, e é exatamente por
   * isso que enganam. Tirar os distratores transformaria o puzzle em formulário.
   */
  estruturar: {
    id: 'estruturar',
    tipo: 'estruturar',
    rotulo: 'A proposta dela, em três campos',
    instrucao:
      'Cada trecho vai num campo. Dois não entram em lugar nenhum — estruturar é escolher.',
    textoErro: 'Esse trecho não responde o que o campo pergunta.',
    campos: [
      { id: 'problema', rotulo: 'Problema' },
      { id: 'solucao', rotulo: 'Solução' },
      { id: 'impacto', rotulo: 'Impacto' },
    ],
    fragmentos: [
      {
        id: 'frag-papel',
        texto: 'A conferência de cada lote é anotada no papel e só digitada no fim do turno.',
        campo: 'problema',
      },
      {
        id: 'frag-planilha',
        texto: 'Conferir direto na planilha compartilhada, no momento da conferência.',
        campo: 'solucao',
      },
      {
        id: 'frag-turno',
        texto: 'O turno seguinte começa sabendo o que ficou pendente, sem esperar a digitação.',
        campo: 'impacto',
      },
      {
        id: 'frag-antigo',
        texto: 'O processo é antigo e já era assim antes de eu entrar.',
        campo: null,
      },
      {
        id: 'frag-ninguem',
        texto: 'Ninguém tinha reclamado disso até agora.',
        campo: null,
      },
    ],
    textoDistrator: 'Isso é verdade. Mas ninguém consegue fazer nada com isso.',
  },

  /**
   * FASE 4 — saber se vender. Quatro peças montam o resumo de UMA PÁGINA que vai
   * ao gestor: situação, o que ela fez, resultado, próximo passo.
   *
   * ANTES ISTO NÃO ERA UM PUZZLE. Não havia gabarito, qualquer peça encaixava em
   * qualquer espaço e os quatro alvos eram retângulos tracejados cujo único
   * texto era `aria-label` (ADR-010). Agora cada alvo tem RÓTULO VISÍVEL e cada
   * peça pertence a um campo — peça na casa errada é recusada com aviso.
   *
   * É o mesmo caso da fase 3, agora contado para cima. Isso é deliberado: o tema
   * da fase é que trabalho que ninguém sabe que existe não vira oportunidade, e
   * a plateia precisa reconhecer a mesma história dita de outro jeito.
   *
   * Deliberadamente o mais satisfatório dos cinco: a PAUSA que vem depois só
   * funciona se resolver isto tiver sido gostoso.
   */
  montar: {
    id: 'montar',
    tipo: 'montar',
    rotulo: 'Uma página para o gestor',
    instrucao: 'Quatro campos, quatro peças. Cada peça pertence a um campo.',
    textoErro: 'Essa peça não é desse campo.',
    campos: [
      { id: 'situacao', rotulo: 'Situação' },
      { id: 'tarefa', rotulo: 'Tarefa' },
      { id: 'acao', rotulo: 'Ação' },
      { id: 'resultado', rotulo: 'Resultado' },
    ],
    pecas: [
      {
        id: 'peca-situacao',
        texto: 'A conferência dos lotes só era digitada no fim do turno.',
        campo: 'situacao',
      },
      {
        id: 'peca-tarefa',
        texto: 'Garantir que as pendências chegassem claras ao turno seguinte.',
        campo: 'tarefa',
      },
      {
        id: 'peca-resultado',
        texto: 'O turno seguinte já começa sabendo o que ficou pendente.',
        campo: 'resultado',
      },
      {
        id: 'peca-acao',
        texto: 'Passei a conferência para a planilha compartilhada, na hora.',
        campo: 'acao',
      },
    ],
  },
};
