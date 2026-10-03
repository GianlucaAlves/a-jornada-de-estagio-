/**
 * Contrato de tipos do domínio.
 *
 * Todo id é união de literais de propósito: referência inválida em conteúdo
 * falha na COMPILAÇÃO, não na frente da plateia. Essa é a decisão central do
 * projeto (ver docs/spec-apresentacao.md, "Conteúdo como código").
 *
 * V2 — o que mudou aqui e por quê (docs/decisoes/adr.md):
 * - seis fases em vez de cinco: a sexta é o fim, e o clímax migrou para ela
 *   (ADR-024). No código continua se chamando `bloco`, porque renomear
 *   conteúdo revisado custa mais do que entrega.
 * - cinco lugares em vez de seis: `sala-treinamento` e `innovation` colapsaram
 *   na Sala de Reuniões (ADR-026), o Laboratório virou Linha de Produção
 *   (ADR-009) e a fase 5 trouxe um lugar novo (ADR-031).
 * - cinco itens em vez de oito: `senha`, `indicacao-trilha` e
 *   `projeto-entregue` não eram usados em lugar nenhum (ADR-014, ADR-017).
 * - NPC ganhou perfil com CARGO, porque cargo agora acompanha o nome em toda
 *   ocorrência (ADR-006, ADR-015).
 * - os cinco puzzles ganharam instrução visível e aviso de erro, e `montar`
 *   ganhou gabarito — sem ele não era puzzle nenhum (ADR-010, ADR-011).
 */

export const NOME_PROTAGONISTA = 'Ana';

// ---------------------------------------------------------------- ids

/**
 * Seis fases, em ordem fixa. As cinco primeiras são jogáveis; a sexta é o fim
 * (ADR-024). O nome `Bloco` sobrevive no código de propósito — ver o glossário.
 */
export type BlocoId = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Cinco lugares. Eram seis.
 *
 * `sala-treinamento` e `innovation` não são lugares: Innovation Week é o NOME
 * DO EVENTO que acontece na Sala de Reuniões, e o treinamento foi absorvido
 * junto (ADR-026). `laboratorio` virou `linha-producao`, porque protagonismo
 * fica visível numa esteira em que uma etapa é diferente das outras, e não
 * numa tela de erro que exige vocabulário (ADR-009). `outra-area` é o andar
 * diferente onde a fase 5 acontece (ADR-031).
 */
export type LugarId =
  | 'escritorio'
  | 'cafezinho'
  | 'linha-producao'
  | 'sala-reunioes'
  | 'outra-area';

/**
 * Cinco itens: dois de leva-e-traz e três tardios.
 *
 * Os três que saíram (`senha`, `indicacao-trilha`, `projeto-entregue`) não
 * tinham uso em lugar nenhum — carregar item que nunca é usado ensina à
 * plateia que a barra é decoração, e a barra é o mecanismo do clímax.
 */
export type ItemId =
  // usados no meio do jogo, e consumidos
  | 'anotacoes-treinamento'
  | 'relatorio'
  // tardios: sem uso aparente até a fase 6, quando viram as PORTAS do clímax
  | 'cartao-rafael'
  | 'certificado-degree'
  | 'cracha-innovation';

export type SkillId =
  | 'coragem-perguntar'
  | 'autoconhecimento'
  | 'leitura-mercado'
  | 'aprendizado-continuo'
  | 'competencia-tecnica'
  | 'proatividade'
  | 'protagonismo'
  | 'visibilidade'
  | 'plano-futuro';

export type NpcId = 'rafael' | 'claudia' | 'tiago' | 'bianca' | 'marcos';

export type PuzzleId = 'senha' | 'associar' | 'sequenciar' | 'estruturar' | 'montar';

export type DialogoId = string;
export type HotspotId = string;

/** Quem fala numa linha de diálogo. */
export type Locutor = NpcId | 'ana' | 'ana-futura' | 'narrador' | 'sistema';

// ---------------------------------------------------------------- elenco

/**
 * Perfil de NPC: nome e CARGO.
 *
 * Existe porque o cargo passou a acompanhar o nome em toda ocorrência — linha
 * de foco no rodapé, caixa de diálogo, qualquer lugar (ADR-015). A plateia
 * precisa saber na hora quem é aquela pessoa e por que ela importa, e numa
 * apresentação de vinte minutos não há tempo de deduzir isso da fala.
 *
 * `cargo` é FUNÇÃO, não título de RH: "Líder do time" comunica, "Gerente de
 * Operações Sênior" é ruído. O teste de integridade reprova cargo vazio.
 */
export interface PerfilNpc {
  id: NpcId;
  nome: string;
  cargo: string;
}

// ---------------------------------------------------------------- itens e skills

export interface Item {
  id: ItemId;
  nome: string;
  /**
   * Descrição factual. Itens tardios NUNCA insinuam uso futuro — qualquer
   * marcação anunciaria o clímax.
   */
  descricao: string;
  /** Tardio = sem uso aparente até a fase 6. Metadado interno; a UI NÃO diferencia. */
  tardio: boolean;
}

export interface Skill {
  id: SkillId;
  nome: string;
  texto: string;
  bloco: BlocoId;
}

// ---------------------------------------------------------------- efeitos

/**
 * Tudo o que um hotspot, diálogo ou puzzle pode causar no estado.
 * Declarativo de propósito: conteúdo não contém funções, então o grafo
 * inteiro é inspecionável e testável sem executar a UI.
 */
export type Efeito =
  | { tipo: 'narrar'; texto: string }
  | { tipo: 'dialogo'; dialogoId: DialogoId }
  | { tipo: 'abrirPuzzle'; puzzleId: PuzzleId }
  | { tipo: 'concederItem'; itemId: ItemId }
  | { tipo: 'consumirItem'; itemId: ItemId }
  | { tipo: 'concederSkill'; skillId: SkillId }
  | { tipo: 'destravarLugar'; lugarId: LugarId }
  | { tipo: 'concluirLugar'; lugarId: LugarId }
  | { tipo: 'trocarSprite'; sprite: SpriteId }
  | { tipo: 'iniciarPausaBloco4' }
  | { tipo: 'irParaMapa' }
  | { tipo: 'irParaRevelacao' }
  | { tipo: 'blocoConcluido' };

// ---------------------------------------------------------------- hotspots

export interface Ponto {
  x: number;
  y: number;
}

/**
 * Qual arte representa este hotspot DENTRO da cena.
 *
 * Existe porque o hotspot deixou de ser um retângulo com o nome escrito e
 * passou a ser a própria arte (bíblia §7). Antes disso, NPC e item não
 * existiam visualmente: a cena era um cenário vazio com placas de texto por
 * cima, e não se sabia com quem se estava falando até clicar.
 *
 * NPC e item não declaram tamanho: ele sai da escala única da bíblia (§2.1),
 * em `arte` nos tokens. Só `objeto` declara, porque um rack e um notebook não
 * têm o mesmo recorte.
 */
export type ArteDeHotspot =
  | { tipo: 'npc'; npcId: NpcId }
  | { tipo: 'item'; itemId: ItemId }
  /** Objeto de cenário interativo (notebook, rack, quadro...). Tamanho em px de tela. */
  | { tipo: 'objeto'; assetId: string; largura: number; altura: number };

export interface Hotspot {
  id: HotspotId;
  rotulo: string;
  /** Posição do alvo clicável, em % do canvas 1920x1080. */
  pos: Ponto;
  /**
   * OBRIGATÓRIO: hotspot sem arte é hotspot invisível, e isso é bug.
   *
   * Sem `?` de propósito. A regressão que estamos consertando é justamente um
   * hotspot que não se vê, então a ausência tem de quebrar a COMPILAÇÃO — não
   * a apresentação, na frente da plateia.
   */
  arte: ArteDeHotspot;
  /**
   * Como a arte se ancora em `pos`. 'base' assenta no chão (padrão) e é o que
   * impede coisa de chão de flutuar; 'centro' é para coisa de parede (monitor,
   * quadro, TV), que não toca o piso.
   */
  ancora?: 'base' | 'centro';
  /** Onde a protagonista para antes de agir. Sem pathfinding: linha reta. */
  parada: Ponto;
  /**
   * Leva-e-traz: o hotspot só responde se este item estiver PRESENTE no
   * inventário. Sem ele, o hotspot dá a narração de `bloqueadoTexto`.
   */
  requerItemPresente?: ItemId;
  bloqueadoTexto?: string;
  /** Só responde depois deste puzzle estar resolvido. */
  requerPuzzleResolvido?: PuzzleId;
  /** Só responde depois de todos estes hotspots já terem sido acionados. */
  requerHotspotsFeitos?: HotspotId[];
  /**
   * Uso de item em alvo: acionar com este item SELECIONADO dispara
   * `efeitosComItem` e consome a seleção.
   */
  aceitaItem?: ItemId;
  efeitosComItem?: Efeito[];
  /** Efeitos do clique normal. */
  efeitos: Efeito[];
  /** Se true, só pode ser acionado uma vez. */
  umaVezSo?: boolean;
}

// ---------------------------------------------------------------- diálogos

/**
 * Uma linha de diálogo. Só existe um formato: fala.
 *
 * O campo `tipo` permanece como discriminante fixo para manter a forma
 * explícita no conteúdo e deixar espaço para variações futuras sem que
 * todo o conteúdo precise mudar.
 */
export type NoDialogo = { tipo: 'fala'; quem: Locutor; texto: string };

export interface Dialogo {
  id: DialogoId;
  nos: NoDialogo[];
  efeitos?: Efeito[];
}

// ---------------------------------------------------------------- puzzles

/**
 * O que TODO puzzle declara, e que a v1 não tinha.
 *
 * `instrucao` existe porque três dos cinco puzzles só diziam o que fazer em
 * `aria-label`: a plateia vê a tela, não o leitor de telas. `textoErro` existe
 * porque nenhum dos cinco avisava quando se errava, e silêncio ao vivo faz o
 * apresentador explicar o que não devia — "acho que não foi isso, deixa eu
 * tentar" (ADR-011). Uma linha curta, sem julgamento, sem contador.
 */
export interface PuzzleBase {
  /** Título curto: o que é isto. */
  rotulo: string;
  /** O que fazer, em texto visível na tela. Não é `aria-label`. */
  instrucao: string;
  /** Aviso de erro. Curto e sem julgamento. */
  textoErro: string;
  /** Recompensa entregue no acerto, sem um segundo clique num objeto de cena. */
  efeitosSucesso?: readonly Efeito[];
}

/**
 * Um campo da senha. Cada campo pertence a UM NPC: o puzzle é social, e nenhuma
 * pessoa tem a resposta inteira.
 *
 * `rotulo` é visível: sem ele a pessoa não sabe quantos campos há nem o que
 * cada um espera. `npcId` é o contrato com o conteúdo das falas — a frente de
 * conteúdo escreve a pista na boca DESTE NPC, e o teste de integridade cobra
 * que a pista apareça literalmente na fala dele.
 */
export interface CampoDeSenha {
  id: string;
  rotulo: string;
  npcId: NpcId;
}

export interface PuzzleSenha extends PuzzleBase {
  id: 'senha';
  tipo: 'senha';
  /**
   * Um campo por NPC, na ordem em que a senha é digitada. Paralelo a
   * `gabarito`: `campos[i]` é o campo cujo valor correto é `gabarito[i]`.
   */
  campos: readonly CampoDeSenha[];
  /** A resposta, campo por campo. */
  gabarito: readonly string[];
}

export interface PuzzleAssociar extends PuzzleBase {
  id: 'associar';
  tipo: 'associar';
  esquerda: readonly { id: string; texto: string }[];
  direita: readonly { id: string; texto: string }[];
  /** id da esquerda -> id da direita */
  gabarito: Readonly<Record<string, string>>;
}

export interface PuzzleSequenciar extends PuzzleBase {
  id: 'sequenciar';
  tipo: 'sequenciar';
  linhas: readonly { id: string; texto: string }[];
  ordemCorreta: readonly string[];
}

export interface PuzzleEstruturar extends PuzzleBase {
  id: 'estruturar';
  tipo: 'estruturar';
  campos: readonly { id: string; rotulo: string }[];
  /** `campo: null` = distrator, não encaixa em lugar nenhum. */
  fragmentos: readonly { id: string; texto: string; campo: string | null }[];
  textoDistrator: string;
}

/**
 * `montar` — o único dos cinco que NÃO era um puzzle.
 *
 * A auditoria mediu: não havia gabarito, `clicarEspaco` aceitava qualquer peça
 * em qualquer espaço sem comparar nada, e o comentário do próprio arquivo
 * admitia "não existe encaixe errado". Os quatro alvos eram retângulos
 * tracejados cujo único texto era `aria-label`. Não havia o que entender ali, e
 * o dono disse exatamente isso (ADR-010).
 *
 * `campos` dá RÓTULO VISÍVEL a cada alvo e `pecas[].campo` dá o gabarito: cada
 * peça pertence a um campo nomeado, e peça na casa errada passa a ser recusada.
 */
export interface PuzzleMontar extends PuzzleBase {
  id: 'montar';
  tipo: 'montar';
  /** Os alvos, com rótulo visível. */
  campos: readonly { id: string; rotulo: string }[];
  /** Cada peça pertence a exatamente um campo. É o gabarito. */
  pecas: readonly { id: string; texto: string; campo: string }[];
}

export type PuzzleDef =
  | PuzzleSenha
  | PuzzleAssociar
  | PuzzleSequenciar
  | PuzzleEstruturar
  | PuzzleMontar;

// ---------------------------------------------------------------- lugares e cenas

export interface Lugar {
  id: LugarId;
  nome: string;
  /** Aparece no mapa desde o início, silhuetado e anônimo. */
  pos: Ponto;
}

/**
 * Uma cena é um (lugar, bloco). O Escritório é base recorrente: mesmo lugar,
 * conteúdo diferente por bloco — zero arte nova, e entrega o argumento visual
 * de que a pessoa mudou e o lugar não (ADR-022).
 */
export interface Cena {
  lugarId: LugarId;
  bloco: BlocoId;
  aberturaTexto?: string;
  hotspots: readonly Hotspot[];
  /** Mostrado ao revisitar em estado concluído. */
  ecoTexto: string;
}

// ---------------------------------------------------------------- blocos

export interface CartaoTransicao {
  bloco: BlocoId;
  /** Números redondos: o cartão é lido de relance numa tela comprimida. */
  tempo: string;
  titulo: string;
  sprite: SpriteId;
  /**
   * Nome do humano que apresenta esta fase ao vivo.
   *
   * OPCIONAL porque a fase 6 não tem apresentador: ela é o fim, e o fecho é
   * conduzido por quem estiver no palco naquele momento — atribuir um nome ali
   * criaria uma sexta pessoa que a apresentação não tem (ADR-001 fixa cinco
   * apresentadores, um por fase jogável).
   *
   * É o ÚNICO lugar em que o jogo conhece os apresentadores. Eles não são
   * personagens: o elenco de NPCs é separado, e é a recorrência dele que
   * sustenta o clímax.
   */
  apresentador?: string;
}

export interface Bloco {
  id: BlocoId;
  titulo: string;
  /**
   * Estado que o bloco assume ter recebido. Torna cada bloco construível,
   * testável e ensaiável isoladamente — é o que permite ensaiar a fase 4 sem
   * jogar as três anteriores, e é por isso que ele não pode ser "derivado".
   */
  estadoAssumido: {
    itens: readonly ItemId[];
    skills: readonly SkillId[];
    lugaresDestravados: readonly LugarId[];
    lugaresConcluidos: readonly LugarId[];
  };
  fechoTexto: string;
}

// ---------------------------------------------------------------- protagonista

export type SpriteId =
  | 'ana-encolhida'
  | 'ana-neutra'
  | 'ana-confiante'
  | 'ana-futura'
  | 'ana-trabalhando'
  | 'ana-futura-trabalhando';

// ---------------------------------------------------------------- revelação

/**
 * Uma conexão do clímax. As três primeiras saem de itens tardios e são
 * PORTAS; a quarta sai do painel de skills e é o MOTIVO.
 */
export interface Conexao {
  origem: { tipo: 'item'; itemId: ItemId } | { tipo: 'skill'; skillId: SkillId };
  viaLugar: LugarId;
  texto: string;
  /** Itens se apagam ao conectar. Skills permanecem — é a tese. */
  consomeOrigem: boolean;
  espessura: number;
  duracaoMs: number;
}

// ---------------------------------------------------------------- estado

export type EstadoLugar = 'silhueta' | 'destravado' | 'concluido';
export type EstadoItem = 'ausente' | 'presente' | 'consumido';
export type EstadoPuzzle = 'fechado' | 'liberado' | 'resolvido';

/**
 * A tela ativa.
 *
 * `abertura` é a escolha "Continuar" ou "Começar do início" (ADR-018). A store
 * NUNCA entra nela sozinha: o estado inicial continua sendo a cena da fase 1,
 * porque retomada silenciosa é o pior defeito possível ao vivo e a decisão de
 * mostrar a escolha é da camada de tela, que sabe se há progresso salvo.
 */
export type Tela =
  | { tipo: 'abertura' }
  | { tipo: 'cena'; lugarId: LugarId }
  | { tipo: 'mapa' }
  | { tipo: 'cartao'; bloco: BlocoId }
  | { tipo: 'revelacao' }
  | { tipo: 'perguntas' };

export interface DialogoAtivo {
  dialogoId: DialogoId;
  indice: number;
}
