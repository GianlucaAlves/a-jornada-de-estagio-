import { create } from 'zustand';
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

/** Estado da pausa dramática do Bloco 4 — requisito mecânico, não direção. */
export type PausaBloco4 = 'inativa' | 'rodando' | 'concluida';

export interface EstadoJogo {
  bloco: BlocoId;
  tela: Tela;
  lugares: Record<LugarId, EstadoLugar>;
  /** Nome revelado no desbloqueio; antes disso o slot é anônimo. */
  nomesRevelados: LugarId[];
  itens: Record<ItemId, EstadoItem>;
  itemSelecionado: ItemId | null;
  /** Ordem de aquisição — o painel preenche na ordem em que ela aprendeu. */
  skills: SkillId[];
  puzzles: Record<PuzzleId, EstadoPuzzle>;
  puzzleAberto: PuzzleId | null;
  hotspotsFeitos: HotspotId[];
  dialogoAtivo: DialogoAtivo | null;
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
  /** Bloco atual sinalizou que terminou; o cartão pode entrar. */
  blocoConcluido: boolean;
}

export interface AcoesJogo {
  entrarNoLugar: (lugarId: LugarId) => void;
  voltarAoMapa: () => void;
  clicarHotspot: (hotspotId: HotspotId) => void;
  selecionarItem: (itemId: ItemId | null) => void;
  avancarDialogo: () => void;
  escolherOpcao: (indice: number) => void;
  resolverPuzzle: (puzzleId: PuzzleId) => void;
  fecharNarracao: () => void;
  fecharMensagemFalha: () => void;
  concluirPausaBloco4: () => void;
  avancarBloco: () => void;
  entrarNoBloco: (bloco: BlocoId) => void;
  dispararConexao: () => void;
  esvaziarBarra: () => void;
  mostrarVersaoFutura: () => void;
  avancarPergunta: () => void;
  reiniciar: () => void;
}

export type Jogo = EstadoJogo & AcoesJogo;

const TODOS_LUGARES = Object.keys(LUGARES) as LugarId[];
const TODOS_ITENS = Object.keys(ITENS) as ItemId[];
const TODOS_PUZZLES = Object.keys(PUZZLES) as PuzzleId[];

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
    bloco: 1,
    tela: { tipo: 'cena', lugarId: 'escritorio' },
    lugares: { ...lugaresIniciais(), escritorio: 'destravado' },
    nomesRevelados: ['escritorio'],
    itens: itensIniciais(),
    itemSelecionado: null,
    skills: [],
    puzzles: puzzlesIniciais(),
    puzzleAberto: null,
    hotspotsFeitos: [],
    dialogoAtivo: null,
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

/** Uma cena é um (lugar, bloco). Escritório é base recorrente. */
export function acharCena(lugarId: LugarId, bloco: BlocoId): Cena | undefined {
  const exata = CENAS.find((c) => c.lugarId === lugarId && c.bloco === bloco);
  if (exata) return exata;
  // Lugar de bloco anterior, revisitado em estado concluído.
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
          set({
            dialogoAtivo: { dialogoId: efeito.dialogoId, indice: 0, escolhaFeita: null },
          });
          break;

        case 'abrirPuzzle':
          set((s) => ({
            puzzles: { ...s.puzzles, [efeito.puzzleId]: 'liberado' },
            puzzleAberto: efeito.puzzleId,
          }));
          break;

        case 'concederItem':
          set((s) => ({ itens: { ...s.itens, [efeito.itemId]: 'presente' } }));
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

    entrarNoLugar: (lugarId) => {
      const s = get();
      if (s.lugares[lugarId] === 'silhueta') return;
      const cena = acharCena(lugarId, s.bloco);
      set({ tela: { tipo: 'cena', lugarId }, itemSelecionado: null, narracao: null });
      // Lugar concluído: linha de eco, sem puzzle e sem repetir diálogo.
      if (s.lugares[lugarId] === 'concluido' && cena) {
        set({ narracao: cena.ecoTexto });
      } else if (cena?.aberturaTexto && !s.hotspotsFeitos.includes(`abertura:${lugarId}:${s.bloco}`)) {
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
     * e o bloco fecharia com o painel errado. Diálogo sempre termina por clique,
     * então recusar nunca prende o apresentador.
     */
    voltarAoMapa: () => {
      const s = get();
      if (s.dialogoAtivo || s.puzzleAberto || s.pausaBloco4 === 'rodando') return;
      set({
        tela: { tipo: 'mapa' },
        itemSelecionado: null,
        narracao: null,
        mensagemFalha: null,
      });
    },

    clicarHotspot: (hotspotId) => {
      const s = get();
      if (s.dialogoAtivo || s.puzzleAberto || s.pausaBloco4 === 'rodando') return;
      const cena = cenaAtual();
      const h = cena?.hotspots.find((x) => x.id === hotspotId);
      if (!h) return;
      if (s.lugares[cena!.lugarId] === 'concluido') return;

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
      if (itemId && s.itens[itemId] !== 'presente') return;
      set({ itemSelecionado: s.itemSelecionado === itemId ? null : itemId });
    },

    avancarDialogo: () => {
      const s = get();
      if (!s.dialogoAtivo) return;
      const dialogo = DIALOGOS[s.dialogoAtivo.dialogoId];
      if (!dialogo) return;
      const no = dialogo.nos[s.dialogoAtivo.indice];
      // Numa escolha, espera a seleção do apresentador.
      if (no?.tipo === 'escolha' && s.dialogoAtivo.escolhaFeita === null) return;

      const proximo = s.dialogoAtivo.indice + 1;
      if (proximo >= dialogo.nos.length) {
        set({ dialogoAtivo: null });
        if (dialogo.efeitos) aplicar(dialogo.efeitos);
        return;
      }
      set({ dialogoAtivo: { ...s.dialogoAtivo, indice: proximo, escolhaFeita: null } });
    },

    escolherOpcao: (indice) => {
      const s = get();
      if (!s.dialogoAtivo) return;
      const dialogo = DIALOGOS[s.dialogoAtivo.dialogoId];
      const no = dialogo?.nos[s.dialogoAtivo.indice];
      if (no?.tipo !== 'escolha') return;
      if (indice < 0 || indice >= no.opcoes.length) return;
      // Todas convergem: a escolha é registrada, a progressão não muda.
      set({ dialogoAtivo: { ...s.dialogoAtivo, escolhaFeita: indice } });
    },

    resolverPuzzle: (puzzleId) => {
      const s = get();
      if (s.puzzles[puzzleId] !== 'liberado') return;
      set((st) => ({
        puzzles: { ...st.puzzles, [puzzleId]: 'resolvido' },
        puzzleAberto: null,
      }));
    },

    fecharNarracao: () => set({ narracao: null }),
    fecharMensagemFalha: () => set({ mensagemFalha: null }),

    concluirPausaBloco4: () => {
      if (get().pausaBloco4 !== 'rodando') return;
      set({ pausaBloco4: 'concluida' });
    },

    avancarBloco: () => {
      const s = get();
      if (s.bloco >= 5) return;
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
     * Entra no bloco aplicando o estado que ele declara ter recebido.
     * É o que torna cada bloco construível e ensaiável isoladamente.
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

    reiniciar: () => set(estadoInicial()),
  };
});

// ------------------------------------------------------------ seletores

export const seletores = {
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

  terminou: (s: EstadoJogo) =>
    s.revelacao.perguntasVisiveis === PERGUNTAS_FINAIS.length,
};
