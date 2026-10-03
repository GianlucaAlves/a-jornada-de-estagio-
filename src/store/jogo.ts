import { create } from 'zustand';
import { REFLEXOES } from '../domain/content/reflexoes';
import {
  BLOCOS,
  CARTOES,
  CENAS,
  CONEXOES,
  DIALOGOS,
  ITENS,
  LUGARES,
  MENSAGEM_GENERICA,
  PERGUNTAS_FINAIS,
  PUZZLES,
  SKILLS,
} from '../domain/content';
import type {
  BlocoId,
  Cena,
  DialogoAtivo,
  DialogoId,
  Efeito,
  EstadoItem,
  EstadoLugar,
  EstadoPuzzle,
  Hotspot,
  HotspotId,
  ItemId,
  LugarId,
  PuzzleId,
  SkillId,
  SpriteId,
  Tela,
} from '../domain/types';

/** Estado da pausa dramática da fase 4 — requisito mecânico, não direção. */
export type PausaBloco4 = 'inativa' | 'rodando' | 'concluida';

export interface EstadoJogo {
  reflexaoVista: Partial<Record<BlocoId, boolean>>;
  reflexaoAtiva: { etapa: 'tempo' | 'falas'; indice: number } | null;
  bloco: BlocoId;
  tela: Tela;
  lugares: Record<LugarId, EstadoLugar>;
  /** Nome revelado no desbloqueio; antes disso o slot é anônimo. */
  nomesRevelados: LugarId[];
  itens: Record<ItemId, EstadoItem>;
  /** Fila visual de conquistas; o inventário já é atualizado no mesmo gesto. */
  itensRecebidos: ItemId[];
  itemSelecionado: ItemId | null;
  /** Ordem de aquisição — o painel preenche na ordem em que ela aprendeu. */
  skills: SkillId[];
  puzzles: Record<PuzzleId, EstadoPuzzle>;
  puzzleAberto: PuzzleId | null;
  /**
   * Quantas vezes um puzzle foi ABERTO nesta sessão. Monótono.
   *
   * Existe para ser usado como `key` de React na tela de puzzle: sair reinicia o
   * puzzle (ADR-011), e o progresso parcial mora em estado local do componente.
   * Se o overlay permanecer montado por qualquer razão, o estado local
   * sobreviveria à saída e a pessoa reencontraria metade do puzzle resolvido —
   * que é pior que não poder sair. Trocar a `key` garante remontagem.
   */
  aberturasDePuzzle: number;
  hotspotsFeitos: HotspotId[];
  dialogoAtivo: DialogoAtivo | null;
  /**
   * Diálogos que já chegaram ao último nó.
   *
   * Existe porque diálogo pode ser RELIDO (ADR-016) e os efeitos de um diálogo
   * NÃO podem valer duas vezes. Sem isto, reler uma conversa que concede item
   * ressuscitaria um item já consumido, e reler a que inicia a PAUSA da fase 4
   * reiniciaria o silêncio no meio da fala do apresentador. A releitura tem de
   * repetir a FALA, não o efeito — quem relê quer a informação que perdeu.
   */
  dialogosConcluidos: DialogoId[];
  narracao: string | null;
  /** Mensagem genérica de falha. Uma só para todas as combinações erradas. */
  mensagemFalha: string | null;
  sprite: SpriteId;
  pausaBloco4: PausaBloco4;
  revelacao: {
    conexoesFeitas: number;
    barraSaiu: boolean;
    versaoFutura: boolean;
    perguntasVisiveis: number;
  };
  /** Fase atual sinalizou que terminou; o cartão pode entrar. */
  blocoConcluido: boolean;
}

export interface AcoesJogo {
  iniciarReflexao: () => void;
  reabrirReflexao: () => void;
  avancarReflexao: () => void;
  pularReflexao: () => void;
  entrarNoLugar: (lugarId: LugarId) => void;
  voltarAoMapa: () => void;
  clicarHotspot: (hotspotId: HotspotId) => void;
  selecionarItem: (itemId: ItemId | null) => void;
  avancarDialogo: () => void;
  resolverPuzzle: (puzzleId: PuzzleId) => void;
  fecharPuzzle: () => void;
  fecharNarracao: () => void;
  fecharItemRecebido: () => void;
  fecharMensagemFalha: () => void;
  concluirPausaBloco4: () => void;
  avancarBloco: () => void;
  entrarNoBloco: (bloco: BlocoId) => void;
  dispararConexao: () => void;
  esvaziarBarra: () => void;
  mostrarVersaoFutura: () => void;
  avancarPergunta: () => void;
  irParaTela: (tela: Tela) => void;
  continuar: () => void;
  reiniciar: () => void;
}

export type Jogo = EstadoJogo & AcoesJogo;

const TODOS_LUGARES = Object.keys(LUGARES) as LugarId[];
const TODOS_ITENS = Object.keys(ITENS) as ItemId[];
const TODOS_PUZZLES = Object.keys(PUZZLES) as PuzzleId[];

/** A última fase. Derivado de BLOCOS para que acrescentar fase não exija editar aqui. */
const ULTIMO_BLOCO = Math.max(...Object.keys(BLOCOS).map(Number)) as BlocoId;

function lugaresIniciais(): Record<LugarId, EstadoLugar> {
  const r = {} as Record<LugarId, EstadoLugar>;
  for (const id of TODOS_LUGARES) r[id] = 'silhueta';
  return r;
}

function itensIniciais(): Record<ItemId, EstadoItem> {
  const r = {} as Record<ItemId, EstadoItem>;
  for (const id of TODOS_ITENS) r[id] = 'ausente';
  return r;
}

function puzzlesIniciais(): Record<PuzzleId, EstadoPuzzle> {
  const r = {} as Record<PuzzleId, EstadoPuzzle>;
  for (const id of TODOS_PUZZLES) r[id] = 'fechado';
  return r;
}

function estadoInicial(): EstadoJogo {
  return {
    reflexaoVista: {},
    reflexaoAtiva: null,
    bloco: 1,
    // A abertura NÃO é o estado inicial da store: a escolha "Continuar" ou
    // "Começar do início" é decisão da camada de tela, que sabe se há progresso
    // salvo. Quem abre o jogo sem save nenhum não pode ver uma pergunta.
    tela: { tipo: 'cena', lugarId: 'escritorio' },
    lugares: { ...lugaresIniciais(), escritorio: 'destravado' },
    nomesRevelados: ['escritorio'],
    itens: itensIniciais(),
    itensRecebidos: [],
    itemSelecionado: null,
    skills: [],
    puzzles: puzzlesIniciais(),
    puzzleAberto: null,
    aberturasDePuzzle: 0,
    hotspotsFeitos: [],
    dialogoAtivo: null,
    dialogosConcluidos: [],
    narracao: null,
    mensagemFalha: null,
    sprite: 'ana-encolhida',
    pausaBloco4: 'inativa',
    revelacao: {
      conexoesFeitas: 0,
      barraSaiu: false,
      versaoFutura: false,
      perguntasVisiveis: 0,
    },
    blocoConcluido: false,
  };
}

// ------------------------------------------------------------ persistência

/**
 * PROGRESSO SALVO NO NAVEGADOR (ADR-018).
 *
 * Gravado a cada mudança, e recuperado só por ESCOLHA EXPLÍCITA na abertura. O
 * pior defeito possível numa apresentação ao vivo é abrir o jogo e ele começar
 * na fase 4 por causa de um save do ensaio de ontem: retomada silenciosa é
 * rápida e indefensável.
 *
 * A VERSÃO É OBRIGATÓRIA. Um save da v1.1 no navegador de alguém tem
 * `LugarId` e `ItemId` que não existem mais — `sala-treinamento`, `laboratorio`,
 * `senha`. Restaurar isso encheria os Records de chaves fantasma e o mapa
 * mostraria slots que não existem. Save de versão diferente é DESCARTADO em
 * silêncio: avisar a pessoa sobre um formato interno não ajuda ninguém.
 */
const CHAVE_PROGRESSO = 'apresentacao-jogo/progresso';

/** Sobe a cada mudança incompatível de formato. A v2 mudou lugares e itens. */
const VERSAO_PROGRESSO = 2;

interface ProgressoSalvo {
  /** Opcional para ler ensaios salvos antes da introdução dos monólogos. */
  reflexaoVista?: Partial<Record<BlocoId, boolean>>;
  versao: number;
  bloco: BlocoId;
  tela: Tela;
  lugares: Record<LugarId, EstadoLugar>;
  nomesRevelados: LugarId[];
  itens: Record<ItemId, EstadoItem>;
  skills: SkillId[];
  puzzles: Record<PuzzleId, EstadoPuzzle>;
  /**
   * Salvo junto, e não é luxo: `hotspotsFeitos` é o que sustenta todo gate
   * `requerHotspotsFeitos` e todo `umaVezSo`. Sem ele, continuar rearmaria
   * portas já abertas e a pessoa reencontraria hotspots que já tinha resolvido.
   */
  hotspotsFeitos: HotspotId[];
  /**
   * Salvo pelo mesmo motivo de `hotspotsFeitos`: sem ele, continuar faria um
   * diálogo já visto reaplicar os efeitos dele na próxima releitura.
   */
  dialogosConcluidos: DialogoId[];
  sprite: SpriteId;
}

/**
 * Lido preguiçosamente, nunca capturado em variável de módulo: a suíte roda em
 * ambiente `node`, onde `localStorage` não existe, e os testes de persistência
 * instalam um armazenamento falso no `globalThis`. Capturar na carga do módulo
 * tornaria isso impossível de testar sem jsdom.
 */
function armazenamento(): Storage | null {
  try {
    const alvo = (globalThis as { localStorage?: Storage }).localStorage;
    return alvo ?? null;
  } catch {
    // Navegador com armazenamento bloqueado por política lança no ACESSO.
    return null;
  }
}

/**
 * Telas que não se restauram.
 *
 * Cartão, revelação, perguntas e abertura são momentos com animação e estado
 * próprio, e o estado da revelação de propósito NÃO é salvo — o clímax replica
 * do começo, senão continuar cairia num quadro morto no meio de uma animação
 * que ninguém pode retomar. O mapa é o ponto de retorno honesto: é de onde a
 * pessoa escolhe para onde ir.
 */
function telaRestauravel(tela: Tela): Tela {
  return tela.tipo === 'cena' || tela.tipo === 'mapa' ? tela : { tipo: 'mapa' };
}

function salvar(s: EstadoJogo): void {
  const armazem = armazenamento();
  if (!armazem) return;
  const progresso: ProgressoSalvo = {
    reflexaoVista: s.reflexaoVista,
    versao: VERSAO_PROGRESSO,
    bloco: s.bloco,
    tela: telaRestauravel(s.tela),
    lugares: s.lugares,
    nomesRevelados: s.nomesRevelados,
    itens: s.itens,
    skills: s.skills,
    puzzles: s.puzzles,
    hotspotsFeitos: s.hotspotsFeitos,
    dialogosConcluidos: s.dialogosConcluidos,
    sprite: s.sprite,
  };
  try {
    armazem.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
  } catch {
    // Cota cheia ou modo privado. Perder o save é aceitável; quebrar a
    // apresentação por causa dele não é.
  }
}

function apagarProgresso(): void {
  const armazem = armazenamento();
  if (!armazem) return;
  try {
    armazem.removeItem(CHAVE_PROGRESSO);
  } catch {
    // ver `salvar`
  }
}

/** Lê e VALIDA o save. Qualquer suspeita devolve null e o save é ignorado. */
function lerProgresso(): ProgressoSalvo | null {
  const armazem = armazenamento();
  if (!armazem) return null;
  let bruto: string | null = null;
  try {
    bruto = armazem.getItem(CHAVE_PROGRESSO);
  } catch {
    return null;
  }
  if (bruto === null) return null;
  try {
    const dado = JSON.parse(bruto) as Partial<ProgressoSalvo> | null;
    if (!dado || dado.versao !== VERSAO_PROGRESSO) return null;
    if (!Object.prototype.hasOwnProperty.call(BLOCOS, String(dado.bloco))) return null;
    // Os Records precisam ter exatamente as chaves de hoje: uma chave fantasma
    // de uma versão anterior vazaria para o mapa e para a barra de itens.
    if (!chavesBatem(dado.lugares, TODOS_LUGARES)) return null;
    if (!chavesBatem(dado.itens, TODOS_ITENS)) return null;
    if (!chavesBatem(dado.puzzles, TODOS_PUZZLES)) return null;
    if (!Array.isArray(dado.skills) || !Array.isArray(dado.hotspotsFeitos)) return null;
    if (!Array.isArray(dado.dialogosConcluidos)) return null;
    if (!Array.isArray(dado.nomesRevelados)) return null;
    if (!dado.tela || typeof dado.tela !== 'object') return null;
    if (dado.reflexaoVista !== undefined && (typeof dado.reflexaoVista !== 'object' || dado.reflexaoVista === null || Array.isArray(dado.reflexaoVista) || Object.entries(dado.reflexaoVista).some(([id, visto]) => !Object.prototype.hasOwnProperty.call(BLOCOS, id) || typeof visto !== 'boolean'))) return null;
    return dado as ProgressoSalvo;
  } catch {
    return null;
  }
}

function chavesBatem(alvo: unknown, esperadas: readonly string[]): boolean {
  if (!alvo || typeof alvo !== 'object') return false;
  const chaves = Object.keys(alvo as Record<string, unknown>).sort();
  const alvoEsperado = [...esperadas].sort();
  return chaves.length === alvoEsperado.length && chaves.every((c, i) => c === alvoEsperado[i]);
}

/**
 * Há progresso que valha a pena retomar?
 *
 * Não basta existir um save: o save é gravado a cada mudança, então ele existe
 * desde o primeiro clique — e também existe logo depois de `reiniciar()`. Se
 * "existe save" fosse a pergunta, a tela de abertura ofereceria "Continuar" para
 * levar a pessoa de volta ao ponto zero, o que é uma escolha sem sentido.
 * A pergunta certa é se ALGO ACONTECEU.
 */
export function progressoSalvo(): { bloco: BlocoId } | null {
  const salvo = lerProgresso();
  if (!salvo) return null;
  const algoAconteceu =
    Object.values(salvo.reflexaoVista ?? {}).some(Boolean) ||
    salvo.bloco > 1 ||
    salvo.skills.length > 0 ||
    salvo.hotspotsFeitos.length > 0 ||
    salvo.dialogosConcluidos.length > 0 ||
    TODOS_ITENS.some((id) => salvo.itens[id] !== 'ausente') ||
    TODOS_PUZZLES.some((id) => salvo.puzzles[id] !== 'fechado');
  return algoAconteceu ? { bloco: salvo.bloco } : null;
}

export function existeProgressoSalvo(): boolean {
  return progressoSalvo() !== null;
}

/** Uma cena é um (lugar, bloco). Escritório é base recorrente. */
export function acharCena(lugarId: LugarId, bloco: BlocoId): Cena | undefined {
  const exata = CENAS.find((c) => c.lugarId === lugarId && c.bloco === bloco);
  if (exata) return exata;
  // Lugar de fase anterior, revisitado em estado concluído.
  return [...CENAS].reverse().find((c) => c.lugarId === lugarId && c.bloco < bloco);
}

export const useJogo = create<Jogo>((set, get) => {
  /** Aplica efeitos em sequência. Único caminho de mutação narrativa. */
  function aplicar(efeitos: readonly Efeito[]): void {
    for (const efeito of efeitos) {
      switch (efeito.tipo) {
        case 'narrar':
          set({ narracao: efeito.texto });
          break;

        case 'dialogo':
          set({ dialogoAtivo: { dialogoId: efeito.dialogoId, indice: 0 } });
          break;

        case 'abrirPuzzle':
          /**
           * NÃO REBAIXA PUZZLE JÁ RESOLVIDO (ADR-011).
           *
           * Antes isto escrevia 'liberado' sem olhar o estado atual, e era por
           * isso que TODO hotspot que abre puzzle precisava ser `umaVezSo`:
           * reclicar rebaixava um puzzle 'resolvido' e desarmava a porta
           * seguinte. Com a correção, reabrir é seguro — e reabrir precisa ser
           * seguro, porque o puzzle passou a ter botão de sair. Sem isto, o
           * botão de sair órfãnaria hotspots para sempre: no `sequenciar` da
           * versão anterior seriam cinco, e a fase nunca emitiria
           * `blocoConcluido`.
           */
          set((s) => ({
            puzzles:
              s.puzzles[efeito.puzzleId] === 'resolvido'
                ? s.puzzles
                : { ...s.puzzles, [efeito.puzzleId]: 'liberado' },
            puzzleAberto: efeito.puzzleId,
            aberturasDePuzzle: s.aberturasDePuzzle + 1,
          }));
          break;

        case 'concederItem':
          set((s) =>
            s.itens[efeito.itemId] === 'presente'
              ? s
              : {
                  itens: { ...s.itens, [efeito.itemId]: 'presente' },
                  itensRecebidos: [...s.itensRecebidos, efeito.itemId],
                },
          );
          break;

        case 'consumirItem':
          set((s) => ({
            itens: { ...s.itens, [efeito.itemId]: 'consumido' },
            itemSelecionado: s.itemSelecionado === efeito.itemId ? null : s.itemSelecionado,
          }));
          break;

        case 'concederSkill':
          set((s) =>
            s.skills.includes(efeito.skillId) ? s : { skills: [...s.skills, efeito.skillId] },
          );
          break;

        case 'destravarLugar':
          set((s) => ({
            lugares:
              s.lugares[efeito.lugarId] === 'silhueta'
                ? { ...s.lugares, [efeito.lugarId]: 'destravado' }
                : s.lugares,
            nomesRevelados: s.nomesRevelados.includes(efeito.lugarId)
              ? s.nomesRevelados
              : [...s.nomesRevelados, efeito.lugarId],
          }));
          break;

        case 'concluirLugar':
          set((s) => ({ lugares: { ...s.lugares, [efeito.lugarId]: 'concluido' } }));
          break;

        case 'trocarSprite':
          set({ sprite: efeito.sprite });
          break;

        case 'iniciarPausaBloco4':
          // Sem texto, sem som, sem item, sem skill. A ausência é a mensagem.
          set({ pausaBloco4: 'rodando' });
          break;

        case 'irParaMapa':
          set({
            tela: { tipo: 'mapa' },
            itemSelecionado: null,
            narracao: null,
            mensagemFalha: null,
          });
          break;

        case 'irParaRevelacao':
          // Narração pendente aqui viraria um véu indismissível sobre o clímax.
          set({ tela: { tipo: 'revelacao' }, narracao: null, mensagemFalha: null });
          break;

        case 'blocoConcluido':
          set({ blocoConcluido: true });
          break;
      }
    }
  }

  function cenaAtual(): Cena | undefined {
    const { tela, bloco } = get();
    if (tela.tipo !== 'cena') return undefined;
    return acharCena(tela.lugarId, bloco);
  }

  function hotspotBloqueado(h: Hotspot): string | null {
    const s = get();
    if (h.umaVezSo && s.hotspotsFeitos.includes(h.id)) return '';
    if (h.requerItemPresente && s.itens[h.requerItemPresente] !== 'presente') {
      return h.bloqueadoTexto ?? MENSAGEM_GENERICA;
    }
    if (h.requerPuzzleResolvido && s.puzzles[h.requerPuzzleResolvido] !== 'resolvido') {
      return h.bloqueadoTexto ?? MENSAGEM_GENERICA;
    }
    if (h.requerHotspotsFeitos?.some((id) => !s.hotspotsFeitos.includes(id))) {
      return h.bloqueadoTexto ?? MENSAGEM_GENERICA;
    }
    return null;
  }

  return {
    ...estadoInicial(),

    iniciarReflexao: () => {
      const s = get();
      if (s.tela.tipo !== 'cena' || s.tela.lugarId !== REFLEXOES[s.bloco].lugarId || s.reflexaoVista[s.bloco] || s.reflexaoAtiva || s.dialogoAtivo || s.puzzleAberto) return;
      set({ reflexaoAtiva: { etapa: 'tempo', indice: 0 }, itemSelecionado: null });
    },
    reabrirReflexao: () => {
      const s = get();
      if (s.tela.tipo !== 'cena' || s.dialogoAtivo || s.puzzleAberto || s.narracao || s.itensRecebidos.length || s.pausaBloco4 === 'rodando') return;
      set({ reflexaoAtiva: { etapa: 'falas', indice: 0 }, itemSelecionado: null });
    },
    avancarReflexao: () => {
      const s = get();
      if (!s.reflexaoAtiva) return;
      if (s.reflexaoAtiva.etapa === 'tempo') {
        set({ reflexaoAtiva: { etapa: 'falas', indice: 0 } });
      } else if (s.reflexaoAtiva.indice + 1 < REFLEXOES[s.bloco].falas.length) {
        set({ reflexaoAtiva: { etapa: 'falas', indice: s.reflexaoAtiva.indice + 1 } });
      } else get().pularReflexao();
    },
    pularReflexao: () => {
      if (!get().reflexaoAtiva) return;
      set(s => ({ reflexaoAtiva: null, reflexaoVista: { ...s.reflexaoVista, [s.bloco]: true } }));
    },

    entrarNoLugar: (lugarId) => {
      const s = get();
      if (s.lugares[lugarId] === 'silhueta') return;
      const cena = acharCena(lugarId, s.bloco);
      set({ tela: { tipo: 'cena', lugarId }, itemSelecionado: null, narracao: null });
      // Lugar concluído: linha de eco, sem puzzle e sem repetir diálogo.
      if (s.lugares[lugarId] === 'concluido' && cena) {
        set({ narracao: cena.ecoTexto });
      } else if (
        cena?.aberturaTexto &&
        !s.hotspotsFeitos.includes(`abertura:${lugarId}:${s.bloco}`)
      ) {
        set((st) => ({
          narracao: cena.aberturaTexto ?? null,
          hotspotsFeitos: [...st.hotspotsFeitos, `abertura:${lugarId}:${st.bloco}`],
        }));
      }
    },

    /**
     * Sair para o mapa é RECUSADO enquanto há diálogo ou puzzle aberto.
     *
     * Causa raiz: `clicarHotspot` marca o hotspot em `hotspotsFeitos` na hora,
     * mas os efeitos de um hotspot de diálogo só são aplicados no fim do
     * diálogo. Abandonar pelo meio abriria o gate seguinte SEM conceder a skill,
     * e a fase fecharia com o painel errado. Diálogo sempre termina por clique,
     * então recusar nunca prende o apresentador.
     *
     * O puzzle tem saída própria (`fecharPuzzle`), que reinicia. Sair para o
     * mapa com puzzle aberto continua recusado de propósito: seriam duas saídas
     * com semânticas diferentes para o mesmo gesto.
     */
    voltarAoMapa: () => {
      const s = get();
      if (s.reflexaoAtiva || s.dialogoAtivo || s.puzzleAberto || s.pausaBloco4 === 'rodando') return;
      set({
        tela: { tipo: 'mapa' },
        itemSelecionado: null,
        narracao: null,
        mensagemFalha: null,
      });
    },

    clicarHotspot: (hotspotId) => {
      const s = get();
      if (s.reflexaoAtiva || s.dialogoAtivo || s.puzzleAberto || s.pausaBloco4 === 'rodando') return;
      const cena = cenaAtual();
      const h = cena?.hotspots.find((x) => x.id === hotspotId);
      if (!h || !cena) return;
      if (s.lugares[cena.lugarId] === 'concluido') return;

      const bloqueio = hotspotBloqueado(h);
      if (bloqueio !== null) {
        if (bloqueio !== '') set({ narracao: bloqueio });
        return;
      }

      // Uso de item em alvo.
      if (s.itemSelecionado) {
        if (h.aceitaItem === s.itemSelecionado && h.efeitosComItem) {
          set((st) => ({
            hotspotsFeitos: [...st.hotspotsFeitos, h.id],
            itemSelecionado: null,
          }));
          aplicar(h.efeitosComItem);
          return;
        }
        // Falha genérica única. Não altera estado.
        set({ mensagemFalha: MENSAGEM_GENERICA, itemSelecionado: null });
        return;
      }

      set((st) => ({ hotspotsFeitos: [...st.hotspotsFeitos, h.id] }));
      aplicar(h.efeitos);
    },

    selecionarItem: (itemId) => {
      const s = get();
      if (s.reflexaoAtiva) return;
      if (itemId && s.itens[itemId] !== 'presente') return;
      set({ itemSelecionado: s.itemSelecionado === itemId ? null : itemId });
    },

    /**
     * Um clique = um nó. Diálogo é linear: não há estado intermediário para
     * esperar, então todo clique avança.
     *
     * Diálogo pode ser RELIDO (ADR-016): quem reclica no NPC vê a fala de novo,
     * e isso acontece de graça aqui — o hotspot dispara `dialogo` outra vez e o
     * índice volta a zero. Conserta uma classe de problema, não um caso: antes,
     * qualquer fala perdida era perdida para sempre, e as pistas da senha só
     * existem nas falas.
     */
    avancarDialogo: () => {
      const s = get();
      if (!s.dialogoAtivo) return;
      const dialogo = DIALOGOS[s.dialogoAtivo.dialogoId];
      if (!dialogo) return;

      const proximo = s.dialogoAtivo.indice + 1;
      if (proximo >= dialogo.nos.length) {
        // Efeitos do diálogo só valem no fim — ver o guard de `voltarAoMapa` —
        // e só na PRIMEIRA vez, para que reler a fala não repita o efeito.
        const jaConcluido = s.dialogosConcluidos.includes(dialogo.id);
        set((st) => ({
          dialogoAtivo: null,
          dialogosConcluidos: jaConcluido
            ? st.dialogosConcluidos
            : [...st.dialogosConcluidos, dialogo.id],
        }));
        if (!jaConcluido && dialogo.efeitos) aplicar(dialogo.efeitos);
        return;
      }
      set({ dialogoAtivo: { ...s.dialogoAtivo, indice: proximo } });
    },

    /**
     * Resolveu: marca 'resolvido' e fecha o overlay.
     *
     * Aceita ser chamado com o puzzle já 'resolvido' porque REABRIR é permitido:
     * se isto exigisse 'liberado', resolver um puzzle reaberto não fecharia a
     * tela e o apresentador ficaria preso no overlay. Só 'fechado' é ignorado —
     * aí o puzzle não está em jogo.
     */
    resolverPuzzle: (puzzleId) => {
      if (get().puzzles[puzzleId] === 'fechado') return;
      const primeiraResolucao = get().puzzles[puzzleId] !== 'resolvido';
      set((st) => ({
        puzzles: { ...st.puzzles, [puzzleId]: 'resolvido' },
        puzzleAberto: st.puzzleAberto === puzzleId ? null : st.puzzleAberto,
      }));
      // A recompensa pertence ao puzzle. Reabri-lo para rever a resposta não
      // concede certificado nem reapresenta a animação.
      if (primeiraResolucao) aplicar(PUZZLES[puzzleId].efeitosSucesso ?? []);
    },

    /**
     * SAIR DO PUZZLE (ADR-011). Fecha o overlay e reinicia o puzzle.
     *
     * O progresso parcial NÃO é preservado, e é isso que "reinicia" quer dizer:
     * o que estava montado pela metade mora em estado local do componente, e
     * `aberturasDePuzzle` muda para que a próxima abertura force remontagem.
     *
     * O estado do puzzle na store não é rebaixado: 'liberado' continua
     * 'liberado' (pode reabrir) e 'resolvido' continua 'resolvido' (a porta
     * seguinte não se desarma). Um `fecharPuzzle` que rebaixasse 'resolvido'
     * seria a mesma classe de defeito que o ADR-011 veio consertar.
     */
    fecharPuzzle: () => {
      if (!get().puzzleAberto) return;
      set((st) => ({
        puzzleAberto: null,
        aberturasDePuzzle: st.aberturasDePuzzle + 1,
      }));
    },

    fecharNarracao: () => set({ narracao: null }),
    fecharItemRecebido: () => set((s) => ({ itensRecebidos: s.itensRecebidos.slice(1) })),
    fecharMensagemFalha: () => set({ mensagemFalha: null }),

    concluirPausaBloco4: () => {
      if (get().pausaBloco4 !== 'rodando') return;
      set({ pausaBloco4: 'concluida' });
    },

    avancarBloco: () => {
      const s = get();
      if (s.reflexaoAtiva) return;
      if (s.bloco >= ULTIMO_BLOCO) return;
      const proximo = (s.bloco + 1) as BlocoId;
      const cartao = CARTOES.find((c) => c.bloco === proximo);
      set({
        tela: { tipo: 'cartao', bloco: proximo },
        blocoConcluido: false,
        itemSelecionado: null,
        narracao: null,
        // A troca de postura acontece escondida atrás do cartão.
        sprite: cartao?.sprite ?? s.sprite,
      });
    },

    /**
     * Entra na fase aplicando o estado que ela declara ter recebido.
     * É o que torna cada fase construível e ensaiável isoladamente.
     */
    entrarNoBloco: (bloco) => {
      const def = BLOCOS[bloco];
      const itens = itensIniciais();
      for (const id of def.estadoAssumido.itens) itens[id] = 'presente';
      const lugares = lugaresIniciais();
      for (const id of def.estadoAssumido.lugaresDestravados) lugares[id] = 'destravado';
      for (const id of def.estadoAssumido.lugaresConcluidos) lugares[id] = 'concluido';
      const cartao = CARTOES.find((c) => c.bloco === bloco);
      set({
        bloco,
        reflexaoAtiva: null,
        tela: { tipo: 'mapa' },
        itens,
        lugares,
        nomesRevelados: [
          ...def.estadoAssumido.lugaresDestravados,
          ...def.estadoAssumido.lugaresConcluidos,
        ],
        skills: [...def.estadoAssumido.skills],
        itemSelecionado: null,
        narracao: null,
        blocoConcluido: false,
        sprite: cartao?.sprite ?? 'ana-neutra',
      });
    },

    dispararConexao: () => {
      const s = get();
      if (s.tela.tipo !== 'revelacao') return;
      const proxima = CONEXOES[s.revelacao.conexoesFeitas];
      if (!proxima) return;
      // Itens se apagam ao conectar. Skills permanecem — é a tese.
      const origem = proxima.origem;
      if (proxima.consomeOrigem && origem.tipo === 'item') {
        const itemId = origem.itemId;
        set((st) => ({ itens: { ...st.itens, [itemId]: 'consumido' } }));
      }
      set((st) => ({
        revelacao: { ...st.revelacao, conexoesFeitas: st.revelacao.conexoesFeitas + 1 },
      }));
    },

    /**
     * Fim das conexões: a barra se recolhe e sai de cena.
     *
     * Os itens restantes são marcados como consumidos de verdade, não apenas
     * escondidos. "Tudo o que ela carregou, ela usou" passa a ser uma afirmação
     * sobre o estado, então o teste da tese deixa de ser tautológico.
     */
    esvaziarBarra: () => {
      const s = get();
      if (s.revelacao.conexoesFeitas < CONEXOES.length) return;
      const itens = { ...s.itens };
      for (const id of TODOS_ITENS) {
        if (itens[id] === 'presente') itens[id] = 'consumido';
      }
      set({ itens, itemSelecionado: null, revelacao: { ...s.revelacao, barraSaiu: true } });
    },

    mostrarVersaoFutura: () => {
      if (!get().revelacao.barraSaiu) return;
      set((st) => ({
        revelacao: { ...st.revelacao, versaoFutura: true },
        sprite: 'ana-futura',
      }));
    },

    avancarPergunta: () => {
      const s = get();
      if (!s.revelacao.versaoFutura) return;
      if (s.revelacao.perguntasVisiveis >= PERGUNTAS_FINAIS.length) return;
      set((st) => ({
        tela: { tipo: 'perguntas' },
        revelacao: { ...st.revelacao, perguntasVisiveis: st.revelacao.perguntasVisiveis + 1 },
      }));
    },

    /**
     * Troca de tela sem efeito narrativo, para a camada de tela.
     *
     * Existe por causa da abertura: a tela de escolha precisa entrar e sair sem
     * que isso signifique nada no grafo de conteúdo. Não substitui
     * `entrarNoLugar` nem `voltarAoMapa`, que carregam regra.
     */
    irParaTela: (tela) => set({ tela }),

    /**
     * Retoma o progresso salvo. Só a tela de abertura chama isto, e só quando a
     * pessoa escolhe "Continuar" — nunca automaticamente (ADR-018).
     *
     * O que não está no save volta ao inicial de propósito: diálogo pendente,
     * puzzle aberto, narração e o estado da revelação. Retomar no meio de uma
     * fala seria retomar num quadro que ninguém pode dispensar.
     */
    continuar: () => {
      const salvoAgora = lerProgresso();
      if (!salvoAgora) return;
      set({
        ...estadoInicial(),
        reflexaoVista: { ...(salvoAgora.reflexaoVista ?? {}) },
        bloco: salvoAgora.bloco,
        tela: telaRestauravel(salvoAgora.tela),
        lugares: { ...salvoAgora.lugares },
        nomesRevelados: [...salvoAgora.nomesRevelados],
        itens: { ...salvoAgora.itens },
        skills: [...salvoAgora.skills],
        puzzles: { ...salvoAgora.puzzles },
        hotspotsFeitos: [...salvoAgora.hotspotsFeitos],
        dialogosConcluidos: [...salvoAgora.dialogosConcluidos],
        sprite: salvoAgora.sprite,
      });
    },

    /**
     * Começar do início. Era CÓDIGO MORTO: nenhum componente chamava
     * `reiniciar()`. Passa a ser acionada pela tela de abertura, e é o caminho
     * de reinício durante a apresentação — F5 leva à escolha.
     *
     * Apaga o save junto: "Começar do início" que deixa o save antigo no
     * navegador é uma promessa quebrada no próximo F5.
     */
    reiniciar: () => {
      apagarProgresso();
      set(estadoInicial());
    },
  };
});

/**
 * Grava a cada mudança (ADR-018).
 *
 * Assinatura de módulo, não `middleware persist`: o que se salva é um
 * SUBCONJUNTO escolhido do estado, com versão e com telas transitórias
 * normalizadas, e isso é regra de domínio — não configuração de biblioteca.
 */
useJogo.subscribe(salvar);

// ------------------------------------------------------------ seletores

export const seletores = {
  progressoDeConversas: (s: EstadoJogo): string => {
    const conversas = [...new Set(CENAS.filter(c => c.bloco === s.bloco).flatMap(c => c.hotspots.filter(h => h.arte.tipo === 'npc').flatMap(h => [...h.efeitos, ...(h.efeitosComItem ?? [])].flatMap(e => e.tipo === 'dialogo' ? [e.dialogoId] : []))))];
    return `${conversas.filter(id => s.dialogosConcluidos.includes(id)).length}/${conversas.length} conversas`;
  },
  /** Itens renderizáveis na barra. Tardios NÃO são diferenciados. */
  itensNaBarra: (s: EstadoJogo): ItemId[] =>
    s.revelacao.barraSaiu
      ? []
      : (Object.keys(s.itens) as ItemId[]).filter((id) => s.itens[id] === 'presente'),

  skillsNoPainel: (s: EstadoJogo) => s.skills.map((id) => SKILLS[id]),

  /** Slots do mapa: todos visíveis desde o início, nome só se revelado. */
  slotsDoMapa: (s: EstadoJogo) =>
    (Object.keys(LUGARES) as LugarId[]).map((id) => ({
      id,
      pos: LUGARES[id].pos,
      estado: s.lugares[id],
      nome: s.nomesRevelados.includes(id) ? LUGARES[id].nome : null,
    })),

  cenaAtual: (s: EstadoJogo): Cena | undefined =>
    s.tela.tipo === 'cena' ? acharCena(s.tela.lugarId, s.bloco) : undefined,

  perguntasVisiveis: (s: EstadoJogo) =>
    PERGUNTAS_FINAIS.slice(0, s.revelacao.perguntasVisiveis),

  conexoesFeitas: (s: EstadoJogo) => CONEXOES.slice(0, s.revelacao.conexoesFeitas),

  terminou: (s: EstadoJogo) => s.revelacao.perguntasVisiveis === PERGUNTAS_FINAIS.length,
};
