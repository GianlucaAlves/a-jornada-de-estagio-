/**
 * Contrato de tipos do domínio.
 *
 * Todo id é união de literais de propósito: referência inválida em conteúdo
 * falha na COMPILAÇÃO, não na frente da plateia. Essa é a decisão central do
 * projeto (ver docs/spec-apresentacao.md, "Conteúdo como código").
 */

export const NOME_PROTAGONISTA = 'Ana';

// ---------------------------------------------------------------- ids

export type BlocoId = 1 | 2 | 3 | 4 | 5;

export type LugarId =
  | 'escritorio'
  | 'cafezinho'
  | 'sala-treinamento'
  | 'laboratorio'
  | 'innovation'
  | 'sala-reunioes';

export type ItemId =
  // imediatos
  | 'senha'
  | 'indicacao-trilha'
  | 'anotacoes-treinamento'
  | 'relatorio'
  | 'projeto-entregue'
  // tardios
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

// ---------------------------------------------------------------- itens e skills

export interface Item {
  id: ItemId;
  nome: string;
  /**
   * Descrição factual. Itens tardios NUNCA insinuam uso futuro — qualquer
   * marcação anunciaria o clímax.
   */
  descricao: string;
  /** Tardio = sem uso aparente até o Bloco 5. Metadado interno; a UI NÃO diferencia. */
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

export interface Hotspot {
  id: HotspotId;
  rotulo: string;
  /** Posição do alvo clicável, em % do canvas 1920x1080. */
  pos: Ponto;
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

export type NoDialogo =
  | { tipo: 'fala'; quem: Locutor; texto: string }
  /** Escolhas da protagonista. Todas convergem — nenhuma altera progressão. */
  | { tipo: 'escolha'; opcoes: string[] };

export interface Dialogo {
  id: DialogoId;
  nos: NoDialogo[];
  efeitos?: Efeito[];
}

// ---------------------------------------------------------------- puzzles

export interface PuzzleSenha {
  id: 'senha';
  tipo: 'senha';
  rotulo: string;
  /** Um campo por NPC. Nenhum NPC tem a resposta inteira. */
  gabarito: readonly string[];
}

export interface PuzzleAssociar {
  id: 'associar';
  tipo: 'associar';
  esquerda: readonly { id: string; texto: string }[];
  direita: readonly { id: string; texto: string }[];
  /** id da esquerda -> id da direita */
  gabarito: Readonly<Record<string, string>>;
}

export interface PuzzleSequenciar {
  id: 'sequenciar';
  tipo: 'sequenciar';
  linhas: readonly { id: string; texto: string }[];
  ordemCorreta: readonly string[];
}

export interface PuzzleEstruturar {
  id: 'estruturar';
  tipo: 'estruturar';
  campos: readonly { id: string; rotulo: string }[];
  /** `campo: null` = distrator, não encaixa em lugar nenhum. */
  fragmentos: readonly { id: string; texto: string; campo: string | null }[];
  textoDistrator: string;
}

export interface PuzzleMontar {
  id: 'montar';
  tipo: 'montar';
  pecas: readonly { id: string; texto: string }[];
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
 * conteúdo diferente por bloco.
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
}

export interface Bloco {
  id: BlocoId;
  titulo: string;
  /**
   * Estado que o bloco assume ter recebido. Torna cada bloco construível,
   * testável e ensaiável isoladamente.
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

export type SpriteId = 'ana-encolhida' | 'ana-neutra' | 'ana-confiante' | 'ana-futura';

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

export type Tela =
  | { tipo: 'cena'; lugarId: LugarId }
  | { tipo: 'mapa' }
  | { tipo: 'cartao'; bloco: BlocoId }
  | { tipo: 'revelacao' }
  | { tipo: 'perguntas' };

export interface DialogoAtivo {
  dialogoId: DialogoId;
  indice: number;
  escolhaFeita: number | null;
}
