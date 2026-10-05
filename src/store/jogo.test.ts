/**
 * A SEAM ÚNICA: a superfície pública da store — ações e seletores — dirigida
 * sem renderizar nada.
 *
 * Nada aqui importa React, testing-library ou componente, e nada aqui olha
 * `pos`/`parada` de hotspot: a arte e o posicionamento vão mudar muito, e uma
 * suíte atrelada a layout seria abandonada na primeira semana.
 *
 * MUDANÇA DE ESTRATÉGIA NA V2, e o motivo importa. A suíte anterior escrevia um
 * roteiro por cena, com os ids de hotspot na mão (`conversar('bianca-cafe')`).
 * Isso funcionava quando uma pessoa escrevia conteúdo e teste no mesmo dia, e
 * quebra agora: as fases 1 a 6 vão ser reescritas por DUAS frentes que não podem
 * tocar este arquivo. Uma suíte que cita id de hotspot reprovaria o trabalho
 * delas sem que elas tivessem como consertar.
 *
 * Então a travessia passou a ser DIRIGIDA PELO CONTEÚDO: `jogarFase` percorre as
 * cenas da fase, aciona o que estiver acionável, resolve o que abrir, e repete
 * até a fase emitir `blocoConcluido`. O que se afirma é o CONTRATO DA STORE —
 * portas, fronteiras, persistência, saída de puzzle — não o roteiro.
 *
 * O que AINDA é afirmado por literal são as duas tabelas de fronteira de fase
 * (inventário e contagem de skills). Ali a duplicação é o teste: comparar a
 * realidade só contra `estadoAssumido` deixaria passar o erro que está NA
 * TABELA, e foi exatamente assim que uma fronteira perdeu três itens em silêncio
 * na v1. As duas tabelas vêm das specs de conteúdo, que dizem item por item e
 * skill por skill o que cada fase concede.
 *
 * A store é um singleton Zustand: `reiniciar()` no `beforeEach` é o que isola
 * os testes uns dos outros.
 */
import {
  BLOCOS,
  CARTOES,
  CENAS,
  CONEXOES,
  DIALOGOS,
  ITENS,
  MENSAGEM_GENERICA,
  PERGUNTAS_FINAIS,
  SKILLS,
} from '../domain/content';
import type {
  BlocoId,
  DialogoId,
  Efeito,
  Hotspot,
  HotspotId,
  ItemId,
  LugarId,
  PuzzleId,
  SkillId,
} from '../domain/types';
import { acharCena, existeProgressoSalvo, progressoSalvo, seletores, useJogo } from './jogo';
import { xpTotal } from '../domain/content/niveis';

// ------------------------------------------------------------------ apoio

const j = () => useJogo.getState();

const TOTAL_SKILLS = Object.keys(SKILLS).length;

const TODOS_ITENS: ItemId[] = Object.keys(ITENS) as ItemId[];

/** Os três itens sem uso aparente até o clímax. Derivado, não hardcoded. */
const ITENS_TARDIOS: ItemId[] = TODOS_ITENS.filter((id) => ITENS[id].tardio);

/** As seis fases, derivadas de BLOCOS. */
const FASES: readonly BlocoId[] = Object.keys(BLOCOS)
  .map(Number)
  .sort((a, b) => a - b) as BlocoId[];

type Fronteira = 2 | 3 | 4 | 5 | 6;

/**
 * Fronteira → inventário esperado, ordenado. Escrito à mão, de propósito.
 *
 * Vem das specs de conteúdo, não do código: fase 1 concede o cartão; fase 2 o
 * certificado e as anotações; fase 3 gasta as anotações e o relatório que ela
 * mesma produz; fase 4 concede o crachá; fases 5 e 6 não concedem item.
 *
 * Comparar o inventário medido só contra `BLOCOS[n].estadoAssumido` deixa passar
 * o erro que está NA TABELA. Aqui a realidade é afirmada contra um literal, e a
 * tabela é afirmada contra o mesmo literal — os dois lados, separadamente.
 */
const INVENTARIO_NA_FRONTEIRA: Record<Fronteira, ItemId[]> = {
  2: ['cartao-rafael'],
  3: ['anotacoes-treinamento', 'cartao-rafael', 'certificado-degree'],
  4: ['cartao-rafael', 'certificado-degree'],
  5: ['cartao-rafael', 'certificado-degree', 'cracha-innovation'],
  6: ['cartao-rafael', 'certificado-degree', 'cracha-innovation'],
};

/** Fronteira → quantas skills o painel deve ter. Literal pelo mesmo motivo. */
const SKILLS_NA_FRONTEIRA: Record<Fronteira, number> = { 2: 2, 3: 5, 4: 7, 5: 8, 6: 9 };

/** Itens renderizáveis na barra, ordenados para comparação estável. */
function itensPresentes(): ItemId[] {
  return [...seletores.itensNaBarra(j())].sort();
}

/** Ids das skills no painel, na ordem em que ela as aprendeu. */
function skillsNoPainel(): SkillId[] {
  return seletores.skillsNoPainel(j()).map((s) => s.id);
}

/** Hotspots da fase, por cena, na ordem em que o conteúdo os declara. */
function cenasDaFase(bloco: BlocoId): { lugarId: LugarId; hotspots: readonly Hotspot[] }[] {
  return CENAS.filter((c) => c.bloco === bloco).map((c) => ({
    lugarId: c.lugarId,
    hotspots: c.hotspots,
  }));
}

/** Primeiro hotspot da fase cujo clique abre este puzzle. */
function hotspotQueAbre(bloco: BlocoId, puzzleId: PuzzleId): Hotspot {
  for (const cena of cenasDaFase(bloco)) {
    for (const h of cena.hotspots) {
      const abre = [...h.efeitos, ...(h.efeitosComItem ?? [])].some(
        (e) => e.tipo === 'abrirPuzzle' && e.puzzleId === puzzleId,
      );
      if (abre) return h;
    }
  }
  throw new Error(`nenhum hotspot da fase ${bloco} abre '${puzzleId}'`);
}

/** A preparação de Marcos abre os próximos beats da reunião antes do puzzle. */
function prepararReuniaoDoBloco4(): void {
  if (j().narracao !== null) j().fecharNarracao();
  const marcos = cenasDaFase(4)
    .flatMap((cena) => cena.hotspots)
    .find((hotspot) => hotspot.id === 'b4-marcos');
  if (!marcos) throw new Error('a fase 4 precisa da conversa de preparação com Marcos');
  j().clicarHotspot(marcos.id);
  concluirDialogo();
  const plateia = cenasDaFase(4)
    .flatMap((cena) => cena.hotspots)
    .find((hotspot) => hotspot.id === 'b4-plateia');
  if (!plateia) throw new Error('a fase 4 precisa do beat da plateia');
  j().clicarHotspot(plateia.id);
  j().fecharNarracao();
}

/**
 * Avança o diálogo ativo até ele terminar, clicando um nó por vez.
 *
 * O número de cliques é LIDO do conteúdo, nunca hardcoded: reescrever falas é a
 * operação mais frequente do projeto e não pode quebrar a suíte. Além de
 * avançar, afirma o contrato de `avancarDialogo`: um clique = um nó, sempre para
 * frente, e todo nó visitado tem fala escrita.
 */
function concluirDialogo(jaVistos: readonly DialogoId[] = []): void {
  const ativo = j().dialogoAtivo;
  if (!ativo) return;
  const dialogo = DIALOGOS[ativo.dialogoId];
  if (!dialogo) throw new Error(`diálogo inexistente: '${ativo.dialogoId}'`);
  // Diálogo que se encadeia em círculo prenderia o apresentador no palco.
  if (jaVistos.includes(dialogo.id)) {
    throw new Error(`ciclo de diálogo: '${[...jaVistos, dialogo.id].join("' → '")}'`);
  }

  const cliquesEsperados = dialogo.nos.length - ativo.indice;
  for (let clique = 1; clique <= cliquesEsperados; clique++) {
    const antes = j().dialogoAtivo;
    if (!antes) throw new Error(`'${dialogo.id}' terminou antes do último nó`);
    const no = dialogo.nos[antes.indice];
    if (!no) throw new Error(`'${dialogo.id}' aponta para o nó ${antes.indice}, que não existe`);
    expect(no.texto.trim(), `'${dialogo.id}' nó ${antes.indice}`).not.toBe('');

    j().avancarDialogo();

    const depois = j().dialogoAtivo;
    if (clique < cliquesEsperados) {
      expect(depois?.dialogoId, `'${dialogo.id}' trocou de diálogo no meio`).toBe(dialogo.id);
      expect(depois?.indice, `'${dialogo.id}' não avançou exatamente um nó`).toBe(
        antes.indice + 1,
      );
    }
  }

  expect(j().dialogoAtivo?.dialogoId, `'${dialogo.id}' não terminou`).not.toBe(dialogo.id);
  if (j().dialogoAtivo) concluirDialogo([...jaVistos, dialogo.id]);
}

/**
 * Aciona um hotspot do jeito que uma pessoa acionaria: se ele aceita um item que
 * está na mão, usa o item; se abre diálogo, lê até o fim; se abre puzzle,
 * resolve; se dispara a PAUSA, espera ela terminar.
 *
 * Resolver o puzzle aqui é legítimo e não esconde nada: a MECÂNICA de cada
 * puzzle é testada na suíte do componente dele. O que interessa à store é que
 * `resolverPuzzle` abre a porta seguinte.
 */
function acionar(h: Hotspot): void {
  if (h.umaVezSo && j().hotspotsFeitos.includes(h.id)) return;
  if (h.aceitaItem && j().itens[h.aceitaItem] === 'presente') {
    j().selecionarItem(h.aceitaItem);
  }
  j().clicarHotspot(h.id);
  j().fecharMensagemFalha();
  if (j().dialogoAtivo) concluirDialogo();
  const aberto = j().puzzleAberto;
  if (aberto) j().resolverPuzzle(aberto);
  if (j().pausaBloco4 === 'rodando') j().concluirPausaBloco4();
  j().fecharNarracao();
}

/**
 * Joga uma fase inteira sem saber nada sobre ela.
 *
 * Várias passadas porque gate de ordem existe: um hotspot que exige outro feito
 * recusa na primeira volta e responde na segunda. O limite de passadas é o que
 * transforma "fase sem saída" em falha rápida em vez de laço infinito — e uma
 * fase que não fecha em três voltas é uma fase que a plateia não vai fechar.
 */
function jogarFase(bloco: BlocoId): void {
  const MAX_PASSADAS = 4;
  for (let passada = 0; passada < MAX_PASSADAS && !j().blocoConcluido; passada += 1) {
    for (const cena of cenasDaFase(bloco)) {
      const estado = j().lugares[cena.lugarId];
      if (estado === 'silhueta' || estado === 'concluido') continue;
      j().entrarNoLugar(cena.lugarId);
      j().fecharNarracao();
      for (const h of cena.hotspots) {
        if (j().lugares[cena.lugarId] === 'concluido') break;
        if (j().tela.tipo !== 'cena') break;
        acionar(h);
      }
    }
  }
  expect(j().blocoConcluido, `a fase ${bloco} não emitiu blocoConcluido`).toBe(true);
}

/**
 * Fronteira de fase: fecho → cartão de transição → estado assumido.
 *
 * O inventário é afirmado nos DOIS lados, e sempre — a única fronteira que não
 * afirmava inventário na v1 foi onde três itens desapareceram em silêncio. Como
 * toda travessia da suíte passa por aqui, nenhuma fronteira fica sem asserção.
 */
function atravessarFronteira(proximo: Fronteira): void {
  const esperado = INVENTARIO_NA_FRONTEIRA[proximo];
  const skillsEsperadas = [...BLOCOS[proximo].estadoAssumido.skills];

  // Lado de saída: o que a fase anterior de fato entrega.
  expect(itensPresentes()).toEqual(esperado);
  expect(skillsNoPainel()).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);
  expect(skillsNoPainel()).toEqual(skillsEsperadas);
  // A tabela da próxima fase tem que declarar a MESMA lista.
  expect([...BLOCOS[proximo].estadoAssumido.itens].sort()).toEqual(esperado);
  expect(BLOCOS[proximo].estadoAssumido.skills).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);

  expect(j().blocoConcluido).toBe(true);
  expect(j().xpAtual, `XP completo da fase ${j().bloco}`).toBe(xpTotal(j().bloco));
  j().avancarBloco();
  expect(j().tela).toEqual({ tipo: 'evolucao', bloco: proximo });
  j().concluirEvolucao();
  expect(j().tela).toEqual({ tipo: 'cartao', bloco: proximo });
  j().entrarNoBloco(proximo);
  expect(j().blocoConcluido).toBe(false);
  expect(j().nivel).toBe(proximo);
  expect(j().xpAtual).toBe(0);
  expect(j().bloco).toBe(proximo);
  expect(j().tela).toEqual({ tipo: 'mapa' });

  // Lado de entrada: nada se perdeu na troca de fase.
  expect(itensPresentes()).toEqual(esperado);
  expect(skillsNoPainel()).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);
  expect(skillsNoPainel()).toEqual(skillsEsperadas);
}

/** A jornada inteira, do primeiro clique até a tela de revelação. */
function jogarTudoAteRevelacao(): void {
  jogarFase(1);
  atravessarFronteira(2);
  jogarFase(2);
  atravessarFronteira(3);
  jogarFase(3);
  atravessarFronteira(4);
  jogarFase(4);
  atravessarFronteira(5);
  jogarFase(5);
  atravessarFronteira(6);
  jogarFase(6);
  expect(j().tela).toEqual({ tipo: 'revelacao' });
}

function dispararTodasAsConexoes(): void {
  for (let i = 0; i < CONEXOES.length; i++) j().dispararConexao();
}

/** Todo Efeito alcançável a partir das cenas das fases dadas. */
function efeitosAlcancaveis(blocos: readonly BlocoId[]): Efeito[] {
  const acc: Efeito[] = [];
  const fila: DialogoId[] = [];
  for (const cena of CENAS) {
    if (!blocos.includes(cena.bloco)) continue;
    for (const h of cena.hotspots) acc.push(...h.efeitos, ...(h.efeitosComItem ?? []));
  }
  for (const e of acc) if (e.tipo === 'dialogo') fila.push(e.dialogoId);
  const vistos = new Set<DialogoId>();
  while (fila.length > 0) {
    const id = fila.pop();
    if (id === undefined || vistos.has(id)) continue;
    vistos.add(id);
    const efeitos = DIALOGOS[id]?.efeitos ?? [];
    acc.push(...efeitos);
    for (const e of efeitos) if (e.tipo === 'dialogo') fila.push(e.dialogoId);
  }
  return acc;
}

/**
 * Acumula todo item que passou pelo estado 'consumido' em qualquer ponto da
 * execução.
 *
 * `entrarNoBloco` reconstrói o mapa de itens do zero a partir do
 * `estadoAssumido`, então o estado FINAL não guarda memória dos dois itens de
 * leva-e-traz gastos na fase 3: eles voltam a 'ausente' na fase seguinte, que
 * não os declara. A tese "tudo o que ela carregou, ela usou" só é verificável
 * acompanhando as transições — daí a assinatura na store, não um instantâneo.
 */
function rastrearItensConsumidos(): { vistos: () => ItemId[]; parar: () => void } {
  const vistos = new Set<ItemId>();
  const registrar = (): void => {
    const s = j();
    for (const id of TODOS_ITENS) if (s.itens[id] === 'consumido') vistos.add(id);
  };
  registrar();
  const parar = useJogo.subscribe(registrar);
  return { vistos: () => [...vistos].sort(), parar };
}

/** Instantâneo de tudo o que é narrativamente observável. */
function instantaneo() {
  const s = j();
  return {
    bloco: s.bloco,
    tela: s.tela,
    lugares: { ...s.lugares },
    nomesRevelados: [...s.nomesRevelados],
    itens: { ...s.itens },
    skills: [...s.skills],
    puzzles: { ...s.puzzles },
    puzzleAberto: s.puzzleAberto,
    hotspotsFeitos: [...s.hotspotsFeitos],
    dialogoAtivo: s.dialogoAtivo,
    dialogosConcluidos: [...s.dialogosConcluidos],
    narracao: s.narracao,
    sprite: s.sprite,
    pausaBloco4: s.pausaBloco4,
    revelacao: { ...s.revelacao },
    blocoConcluido: s.blocoConcluido,
  };
}

// ---------------------------------------------------- armazenamento de teste

/**
 * `localStorage` falso.
 *
 * A suíte roda em ambiente `node`, onde `localStorage` não existe — e é por isso
 * que a store o lê PREGUIÇOSAMENTE do `globalThis` em vez de capturá-lo na carga
 * do módulo. Instalar um falso aqui é o que permite testar persistência sem
 * arrastar jsdom para o projeto por causa de um recurso só.
 */
function criarArmazenamentoFalso(): Storage & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  return {
    dados,
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (k: string) => dados.get(k) ?? null,
    key: (i: number) => [...dados.keys()][i] ?? null,
    removeItem: (k: string) => {
      dados.delete(k);
    },
    setItem: (k: string, v: string) => {
      dados.set(k, v);
    },
  } as unknown as Storage & { dados: Map<string, string> };
}

type GlobalComArmazenamento = { localStorage?: Storage };

function instalarArmazenamento(): Storage & { dados: Map<string, string> } {
  const falso = criarArmazenamentoFalso();
  (globalThis as GlobalComArmazenamento).localStorage = falso;
  return falso;
}

function desinstalarArmazenamento(): void {
  delete (globalThis as GlobalComArmazenamento).localStorage;
}

/** A única chave que a store usa. Lida, não duplicada como literal solto. */
function chaveDoSave(armazem: Storage & { dados: Map<string, string> }): string {
  const chaves = [...armazem.dados.keys()];
  expect(chaves.length, 'a store deveria ter gravado exatamente uma chave').toBe(1);
  return chaves[0] as string;
}

beforeEach(() => {
  desinstalarArmazenamento();
  useJogo.getState().reiniciar();
});

// ------------------------------------------------------------------ testes

describe('playthrough completo das seis fases', () => {
  /**
   * `atravessarFronteira` é o único caminho da suíte entre fases, e ele afirma
   * inventário e skills nos dois lados. Este teste garante que a cobertura é
   * TOTAL: se uma sétima fase aparecer com cartão próprio, a tabela de fronteira
   * não vai ter entrada para ela e isto falha antes de o playthrough passar por
   * cima da fronteira nova sem afirmar nada.
   */
  it('existe tabela de inventário e de skills para toda fronteira de fase', () => {
    const fronteiras = FASES.filter((b) => b > 1);
    expect(fronteiras).toEqual([2, 3, 4, 5, 6]);
    expect(Object.keys(INVENTARIO_NA_FRONTEIRA).map(Number)).toEqual([...fronteiras]);
    expect(Object.keys(SKILLS_NA_FRONTEIRA).map(Number)).toEqual([...fronteiras]);
    for (const bloco of fronteiras) {
      const chave = bloco as Fronteira;
      expect([...BLOCOS[chave].estadoAssumido.itens].sort()).toEqual(
        INVENTARIO_NA_FRONTEIRA[chave],
      );
      expect(BLOCOS[chave].estadoAssumido.skills).toHaveLength(SKILLS_NA_FRONTEIRA[chave]);
    }
  });

  /**
   * A mecânica de ESCOLHA de fala foi removida: diálogo é linear e a resposta da
   * protagonista é escrita, não opção do apresentador. Esta é a tripwire do lado
   * da STORE — `integridade.test.ts` guarda o lado do conteúdo. Reintroduzir a
   * ação de escolha exige apagar este teste, e apagar este teste é uma decisão
   * consciente, não um merge distraído.
   */
  it('a store não expõe ação de escolher opção de diálogo', () => {
    const acoes = j() as unknown as Record<string, unknown>;
    expect('escolherOpcao' in acoes).toBe(false);
  });

  it('joga do primeiro clique até as três perguntas finais, afirmando cada fronteira', () => {
    // ------------------------------------------------ estado zero
    expect(j().bloco).toBe(1);
    expect(j().lugares).toEqual({
      escritorio: 'destravado',
      cafezinho: 'silhueta',
      'linha-producao': 'silhueta',
      'sala-reunioes': 'silhueta',
      'outra-area': 'silhueta',
    });
    expect(itensPresentes()).toEqual([]);
    expect(skillsNoPainel()).toEqual([]);
    expect(j().sprite).toBe('ana-encolhida');
    // Os cinco slots existem no mapa desde o início; só o Escritório tem nome.
    const slots = seletores.slotsDoMapa(j());
    expect(slots).toHaveLength(5);
    expect(slots.filter((s) => s.nome !== null).map((s) => s.id)).toEqual(['escritorio']);

    jogarTudoAteRevelacao();

    // ------------------------------------------------ clímax
    for (let i = 0; i < CONEXOES.length; i++) {
      j().dispararConexao();
      expect(seletores.conexoesFeitas(j())).toEqual(CONEXOES.slice(0, i + 1));
    }
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');

    j().esvaziarBarra();
    expect(seletores.itensNaBarra(j())).toEqual([]);
    expect(Object.values(j().itens)).not.toContain('presente');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);

    j().mostrarVersaoFutura();
    expect(j().sprite).toBe('ana-futura');

    for (let i = 0; i < PERGUNTAS_FINAIS.length; i++) {
      j().avancarPergunta();
      expect(seletores.perguntasVisiveis(j())).toEqual(PERGUNTAS_FINAIS.slice(0, i + 1));
    }
    expect(j().tela).toEqual({ tipo: 'perguntas' });
    expect(seletores.terminou(j())).toBe(true);
  });

  it('as seis fases são jogáveis em sequência, e a sexta é a última', () => {
    jogarTudoAteRevelacao();
    expect(j().bloco).toBe(6);
    // Não existe fase 7: `avancarBloco` para na última.
    const antes = j().tela;
    j().avancarBloco();
    expect(j().bloco).toBe(6);
    expect(j().tela).toEqual(antes);
  });

  it('a tese: os cinco itens foram consumidos e as nove skills continuam no painel', () => {
    expect(TODOS_ITENS).toHaveLength(5);
    const rastro = rastrearItensConsumidos();
    try {
      jogarTudoAteRevelacao();
      dispararTodasAsConexoes();
      j().esvaziarBarra();

      // Consumidos, não escondidos: o estado é lido direto, sem passar pelo
      // seletor que zera a barra quando `barraSaiu`.
      expect(Object.values(j().itens)).not.toContain('presente');
      expect(j().itemSelecionado).toBeNull();
      // Os CINCO passaram por 'consumido' ao longo da jornada — incluindo os dois
      // de leva-e-traz, gastos antes de a fase seguinte recriar o inventário.
      expect(rastro.vistos()).toEqual([...TODOS_ITENS].sort());
      // Nada do que ela aprendeu se gastou.
      expect(skillsNoPainel()).toEqual([...BLOCOS[6].estadoAssumido.skills]);
      expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
      expect(skillsNoPainel()).toContain('proatividade');
    } finally {
      rastro.parar();
    }
  });

  it('nenhum efeito alcançável nas fases 1 a 5 consome um item tardio', () => {
    const consumidos = efeitosAlcancaveis([1, 2, 3, 4, 5])
      .filter((e): e is Extract<Efeito, { tipo: 'consumirItem' }> => e.tipo === 'consumirItem')
      .map((e) => e.itemId);

    for (const id of ITENS_TARDIOS) expect(consumidos).not.toContain(id);
    // Só os dois itens de leva-e-traz são gastos no caminho.
    expect([...new Set(consumidos)].sort()).toEqual(['anotacoes-treinamento', 'relatorio']);
  });
});

// ------------------------------------------------- correção de corretude

describe('abrirPuzzle não rebaixa puzzle já resolvido (ADR-011)', () => {
  /**
   * A correção central da v2, e o defeito que ela conserta é o mais caro possível:
   * `abrirPuzzle` escrevia 'liberado' sem olhar o estado atual. Reclicar
   * rebaixava um puzzle 'resolvido' e DESARMAVA a porta seguinte. Era por isso
   * que todo hotspot que abria puzzle precisava ser `umaVezSo` — e com `umaVezSo`
   * obrigatório, um botão de sair do puzzle órfãnaria o hotspot para sempre.
   */
  it('reabrir um puzzle resolvido mantém o estado resolvido e não desarma a porta', () => {
    const abre = hotspotQueAbre(1, 'senha');
    j().entrarNoLugar('escritorio');
    j().fecharNarracao();

    j().clicarHotspot(abre.id);
    expect(j().puzzleAberto).toBe('senha');
    expect(j().puzzles.senha).toBe('liberado');

    j().resolverPuzzle('senha');
    expect(j().puzzles.senha).toBe('resolvido');
    expect(j().puzzleAberto).toBeNull();

    // Reabre. Antes da correção, esta linha rebaixava para 'liberado'.
    j().clicarHotspot(abre.id);
    expect(j().puzzleAberto).toBe('senha');
    expect(j().puzzles.senha).toBe('resolvido');

    j().fecharPuzzle();
    expect(j().puzzles.senha).toBe('resolvido');

    // E a porta que dependia dele continua armada: a fase ainda fecha.
    jogarFase(1);
    expect(j().blocoConcluido).toBe(true);
  });

  it('resolver um puzzle reaberto fecha o overlay em vez de prender o apresentador', () => {
    const abre = hotspotQueAbre(1, 'senha');
    j().entrarNoLugar('escritorio');
    j().clicarHotspot(abre.id);
    j().resolverPuzzle('senha');

    j().clicarHotspot(abre.id);
    expect(j().puzzleAberto).toBe('senha');
    j().resolverPuzzle('senha');

    expect(j().puzzleAberto).toBeNull();
    expect(j().puzzles.senha).toBe('resolvido');
  });

  it('resolverPuzzle não responde a puzzle que nem está em jogo', () => {
    expect(j().puzzles.montar).toBe('fechado');
    j().resolverPuzzle('montar');
    expect(j().puzzles.montar).toBe('fechado');
  });
});

describe('sair do puzzle reinicia o puzzle (ADR-011)', () => {
  it('o painel da fase 3 reabre sem o item consumido, inclusive depois de sair para o mapa', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('linha-producao');
    j().selecionarItem('anotacoes-treinamento');
    j().clicarHotspot('b3-monitor');
    expect(j().itens['anotacoes-treinamento']).toBe('consumido');
    expect(j().puzzleAberto).toBe('estruturar');
    const pontuacao = j().xpAtual;
    j().fecharPuzzle();
    j().voltarAoMapa();
    j().entrarNoLugar('linha-producao');
    j().clicarHotspot('b3-monitor');
    expect(j().puzzleAberto).toBe('estruturar');
    expect(j().xpAtual).toBe(pontuacao);
    expect(j().itens['anotacoes-treinamento']).toBe('consumido');
    j().resolverPuzzle('estruturar');
    j().clicarHotspot('b3-monitor');
    expect(j().puzzleAberto).toBe('estruturar');
    expect(j().puzzles.estruturar).toBe('resolvido');
  });
  it('fecharPuzzle fecha o overlay, mantém liberado e permite reabrir', () => {
    const abre = hotspotQueAbre(1, 'senha');
    j().entrarNoLugar('escritorio');
    j().clicarHotspot(abre.id);
    const aberturasApos1 = j().aberturasDePuzzle;
    expect(aberturasApos1).toBeGreaterThan(0);

    j().fecharPuzzle();
    expect(j().puzzleAberto).toBeNull();
    expect(j().puzzles.senha).toBe('liberado');
    // A chave de remontagem mudou: é ela que garante que o progresso parcial do
    // componente morra junto com a saída.
    expect(j().aberturasDePuzzle).toBeGreaterThan(aberturasApos1);

    j().clicarHotspot(abre.id);
    expect(j().puzzleAberto).toBe('senha');
    expect(j().aberturasDePuzzle).toBeGreaterThan(aberturasApos1 + 1);
  });

  it('fecharPuzzle não faz nada quando não há puzzle aberto', () => {
    const antes = instantaneo();
    j().fecharPuzzle();
    expect(instantaneo()).toEqual(antes);
  });

  /**
   * O cenário de maior raio de dano: sair de cada puzzle da fase antes de
   * resolver, e só então jogar a fase. Se sair órfãnasse hotspot, a fase nunca
   * emitiria `blocoConcluido` — e isso aconteceria no palco, sem erro visível.
   */
  it('sair de todos os puzzles de uma fase não trava a progressão dela', () => {
    for (const bloco of FASES) {
      j().reiniciar();
      j().entrarNoBloco(bloco);
      for (const cena of cenasDaFase(bloco)) {
        if (j().lugares[cena.lugarId] !== 'destravado') continue;
        j().entrarNoLugar(cena.lugarId);
        for (const h of cena.hotspots) {
          const abrePuzzle = h.efeitos.some((e) => e.tipo === 'abrirPuzzle');
          if (!abrePuzzle) continue;
          j().clicarHotspot(h.id);
          if (j().puzzleAberto) j().fecharPuzzle();
        }
      }
      jogarFase(bloco);
    }
  });
});

// ------------------------------------------------------------ persistência

describe('progresso salvo no navegador (ADR-018)', () => {
  afterEach(() => {
    desinstalarArmazenamento();
  });

  it('sem armazenamento nenhum, a store funciona e nada explode', () => {
    desinstalarArmazenamento();
    expect(existeProgressoSalvo()).toBe(false);
    expect(progressoSalvo()).toBeNull();
    jogarFase(1);
    expect(j().blocoConcluido).toBe(true);
  });

  it('grava a cada mudança e a chave aparece no primeiro clique', () => {
    const armazem = instalarArmazenamento();
    expect(armazem.dados.size).toBe(0);
    j().entrarNoLugar('escritorio');
    expect(armazem.dados.size).toBe(1);
  });

  /**
   * A pergunta da tela de abertura não é "existe save" — é "aconteceu algo".
   * O save é gravado a cada mudança, então ele existe desde o primeiro clique e
   * também logo depois de `reiniciar()`. Oferecer "Continuar" para levar a pessoa
   * ao ponto zero é uma escolha sem sentido na frente da plateia.
   */
  it('estado de ponto zero não conta como progresso retomável', () => {
    instalarArmazenamento();
    j().irParaTela({ tipo: 'mapa' });
    expect(existeProgressoSalvo()).toBe(false);

    j().entrarNoLugar('escritorio');
    // Entrar na cena já marca a abertura como vista: isso É progresso.
    expect(existeProgressoSalvo()).toBe(true);
    expect(progressoSalvo()?.bloco).toBe(1);
  });

  it('continuar devolve fase, lugares, itens, skills, puzzles e hotspots feitos', () => {
    const armazem = instalarArmazenamento();
    jogarFase(1);
    atravessarFronteira(2);
    jogarFase(2);
    atravessarFronteira(3);

    const esperado = {
      bloco: j().bloco,
      lugares: { ...j().lugares },
      itens: { ...j().itens },
      skills: [...j().skills],
      puzzles: { ...j().puzzles },
      hotspotsFeitos: [...j().hotspotsFeitos],
      dialogosConcluidos: [...j().dialogosConcluidos],
      nomesRevelados: [...j().nomesRevelados],
      sprite: j().sprite,
    };
    expect(progressoSalvo()?.bloco).toBe(3);

    /**
     * Simula abrir o navegador de novo. O save é guardado ANTES de mexer no
     * estado e reposto depois: a store grava a cada mudança, então zerar o
     * estado para simular uma sessão nova sobrescreveria justamente o save que
     * o teste quer retomar.
     */
    const chave = chaveDoSave(armazem);
    const bruto = armazem.getItem(chave) ?? '';
    j().reiniciar();
    armazem.setItem(chave, bruto);

    j().continuar();

    expect(j().bloco).toBe(esperado.bloco);
    expect(j().lugares).toEqual(esperado.lugares);
    expect(j().itens).toEqual(esperado.itens);
    expect(j().skills).toEqual(esperado.skills);
    expect(j().puzzles).toEqual(esperado.puzzles);
    expect(j().hotspotsFeitos).toEqual(esperado.hotspotsFeitos);
    expect(j().dialogosConcluidos).toEqual(esperado.dialogosConcluidos);
    expect(j().nomesRevelados).toEqual(esperado.nomesRevelados);
    expect(j().sprite).toBe(esperado.sprite);
  });

  /**
   * O que não é salvo volta ao inicial de propósito: retomar no meio de uma fala
   * seria retomar num quadro que ninguém pode dispensar, e retomar dentro da
   * revelação cairia num frame de animação cujo estado não existe mais.
   */
  it('continuar nunca retoma dentro de diálogo, puzzle, cartão ou revelação', () => {
    instalarArmazenamento();
    jogarFase(1);
    atravessarFronteira(2);
    // Deixa a store num estado sujo: cartão na tela e puzzle aberto.
    j().entrarNoLugar('cafezinho');
    j().clicarHotspot(cenasDaFase(2).flatMap(c => c.hotspots).find(h => h.id === 'b2-bianca')!.id);
    concluirDialogo();
    j().entrarNoLugar('escritorio');
    j().clicarHotspot(hotspotQueAbre(2, 'associar').id);
    expect(j().puzzleAberto).not.toBeNull();

    j().continuar();

    expect(j().puzzleAberto).toBeNull();
    expect(j().dialogoAtivo).toBeNull();
    expect(j().narracao).toBeNull();
    expect(j().revelacao).toEqual({
      conexoesFeitas: 0,
      barraSaiu: false,
      versaoFutura: false,
      perguntasVisiveis: 0,
    });
    expect(['cena', 'mapa']).toContain(j().tela.tipo);
  });

  it('a tela salva nunca é cartão, revelação, perguntas nem abertura', () => {
    const armazem = instalarArmazenamento();
    jogarTudoAteRevelacao();
    expect(j().tela.tipo).toBe('revelacao');

    const bruto = armazem.getItem(chaveDoSave(armazem));
    const salvo = JSON.parse(bruto ?? '{}') as { tela?: { tipo?: string } };
    expect(['cena', 'mapa']).toContain(salvo.tela?.tipo);
  });

  /**
   * UM SAVE DA V1.1 TEM LUGAR E ITEM QUE NÃO EXISTEM MAIS.
   *
   * `sala-treinamento`, `laboratorio`, `senha`. Restaurar isso encheria os
   * Records de chaves fantasma, o mapa mostraria slot inexistente e a barra
   * renderizaria item sem arte. Save de versão diferente é descartado em
   * SILÊNCIO: avisar a pessoa sobre um formato interno não ajuda ninguém.
   */
  it('save de versão diferente é descartado em silêncio', () => {
    const armazem = instalarArmazenamento();
    j().entrarNoLugar('escritorio');
    const chave = chaveDoSave(armazem);
    const salvo = JSON.parse(armazem.getItem(chave) ?? '{}') as Record<string, unknown>;

    armazem.setItem(chave, JSON.stringify({ ...salvo, versao: 1 }));
    expect(progressoSalvo()).toBeNull();
    expect(existeProgressoSalvo()).toBe(false);

    const antes = instantaneo();
    j().continuar();
    expect(instantaneo()).toEqual(antes);
  });

  it('save com lugar que não existe mais é descartado', () => {
    const armazem = instalarArmazenamento();
    jogarFase(1);
    const chave = chaveDoSave(armazem);
    const salvo = JSON.parse(armazem.getItem(chave) ?? '{}') as {
      lugares: Record<string, string>;
    };
    // Exatamente o que um save da v1.1 traria.
    armazem.setItem(
      chave,
      JSON.stringify({ ...salvo, lugares: { ...salvo.lugares, laboratorio: 'silhueta' } }),
    );
    expect(progressoSalvo()).toBeNull();
  });

  it('save corrompido é descartado', () => {
    const armazem = instalarArmazenamento();
    j().entrarNoLugar('escritorio');
    armazem.setItem(chaveDoSave(armazem), '{isso não é json');
    expect(progressoSalvo()).toBeNull();
  });

  /**
   * `reiniciar()` era CÓDIGO MORTO: nenhum componente a chamava. Passa a ser o
   * "Começar do início" da tela de abertura, e é o caminho de reinício durante a
   * apresentação — F5 leva à escolha. Deixar o save antigo no navegador seria uma
   * promessa quebrada no próximo F5.
   */
  it('reiniciar zera o estado e apaga o save', () => {
    instalarArmazenamento();
    jogarFase(1);
    atravessarFronteira(2);
    expect(existeProgressoSalvo()).toBe(true);

    j().reiniciar();

    expect(j().bloco).toBe(1);
    expect(itensPresentes()).toEqual([]);
    expect(skillsNoPainel()).toEqual([]);
    expect(j().hotspotsFeitos).toEqual([]);
    expect(j().puzzles.senha).toBe('fechado');
    expect(existeProgressoSalvo()).toBe(false);
  });
});

// -------------------------------------------------------- releitura de fala

describe('diálogo pode ser relido (ADR-016)', () => {
  /**
   * Conserta uma classe de problema, não um caso: antes, qualquer fala perdida
   * era perdida para sempre. O caso grave é a senha — as pistas só existem no que
   * as pessoas dizem, e com o jogo no ar não há apresentador para relembrar.
   *
   * O que torna a releitura segura é os EFEITOS valerem uma vez só. Sem isso,
   * reler uma conversa que concede item ressuscitaria item já consumido, e reler
   * a que inicia a PAUSA reiniciaria o silêncio no meio da fala do apresentador.
   */
  it('reler um diálogo repete a fala e NÃO repete os efeitos', () => {
    j().entrarNoBloco(6);
    const cena = acharCena('cafezinho', 6);
    const comDialogo = cena?.hotspots.find((h) =>
      h.efeitos.some((e) => e.tipo === 'dialogo'),
    );
    expect(comDialogo, 'a fase 6 precisa de um hotspot de diálogo').toBeDefined();
    if (!comDialogo) return;

    j().entrarNoLugar('cafezinho');
    j().fecharNarracao();
    j().clicarHotspot(comDialogo.id);
    const dialogoId = j().dialogoAtivo?.dialogoId;
    expect(dialogoId).toBeDefined();
    concluirDialogo();

    expect(j().dialogosConcluidos).toEqual([dialogoId]);
    const depoisDaPrimeira = instantaneo();

    // Volta para a cena e clica de novo: a fala recomeça do primeiro nó.
    j().irParaTela({ tipo: 'cena', lugarId: 'cafezinho' });
    j().clicarHotspot(comDialogo.id);
    expect(j().dialogoAtivo?.dialogoId).toBe(dialogoId);
    expect(j().dialogoAtivo?.indice).toBe(0);
    concluirDialogo();

    // Concluído uma vez só, e nenhum efeito foi reaplicado.
    expect(j().dialogosConcluidos).toEqual([dialogoId]);
    expect(j().itens).toEqual(depoisDaPrimeira.itens);
    expect(j().skills).toEqual(depoisDaPrimeira.skills);
    expect(j().lugares).toEqual(depoisDaPrimeira.lugares);
    expect(j().pausaBloco4).toEqual(depoisDaPrimeira.pausaBloco4);
  });
});

// --------------------------------------------------------- portas e recusas

describe('uso de item em alvo errado', () => {
  it('devolve a mensagem genérica e não altera nenhum outro estado', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('escritorio');
    j().fecharNarracao();
    const antes = instantaneo();

    j().selecionarItem('certificado-degree');
    // Um alvo que existe na cena e não aceita este item.
    const alvo = acharCena('escritorio', 3)?.hotspots.find(
      (h) => h.aceitaItem !== 'certificado-degree',
    );
    expect(alvo).toBeDefined();
    if (!alvo) return;
    j().clicarHotspot(alvo.id);

    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);
    expect(j().itemSelecionado).toBeNull();
    // Tudo o que é narrativamente observável continua idêntico.
    expect(instantaneo()).toEqual(antes);

    j().fecharMensagemFalha();
    expect(j().mensagemFalha).toBeNull();
  });

  it('item ausente não pode ser selecionado', () => {
    j().entrarNoBloco(1);
    j().selecionarItem('cracha-innovation');
    expect(j().itemSelecionado).toBeNull();
  });

  it('a porta de leva-e-traz não abre sem o item, e abre com ele', () => {
    j().entrarNoBloco(3);
    // A PORTA É PROCURADA, não declarada. Ela morava no Escritório enquanto a
    // fase 3 inteira morava lá; hoje a fase abre na Linha de Produção e a porta
    // foi com ela (ADR-021, ADR-025). Amarrar o teste a um lugar fazia esta
    // asserção reprovar por causa de uma mudança de cenário — e reprovar
    // apontando para 'ausente', que não diz nada sobre a causa.
    const cena = cenasDaFase(3).find((c) => c.hotspots.some((h) => h.aceitaItem !== undefined));
    expect(cena, 'a fase 3 precisa de uma porta de leva-e-traz').toBeDefined();
    if (!cena) return;
    const porta = cena.hotspots.find((h) => h.aceitaItem !== undefined);
    if (!porta || !porta.aceitaItem) return;
    // E o item da porta tem de estar na barra no começo da fase, senão o que
    // este teste mede é outra coisa.
    expect(j().itens[porta.aceitaItem], `'${porta.id}' abre com item que a fase não tem`).toBe(
      'presente',
    );

    j().entrarNoLugar(cena.lugarId);
    j().fecharNarracao();

    // Clique seco: narração, nenhum efeito do uso de item.
    j().clicarHotspot(porta.id);
    expect(j().puzzleAberto).toBeNull();
    expect(j().itens[porta.aceitaItem]).toBe('presente');
    j().fecharNarracao();

    j().selecionarItem(porta.aceitaItem);
    j().clicarHotspot(porta.id);
    expect(j().itens[porta.aceitaItem]).toBe('consumido');
    expect(j().itemSelecionado).toBeNull();
  });
});

describe('lugar bloqueado e lugar concluído', () => {
  it('lugar em silhueta não pode ser visitado', () => {
    expect(j().lugares['sala-reunioes']).toBe('silhueta');
    j().entrarNoLugar('sala-reunioes');
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'escritorio' });
  });

  it('revisitar lugar concluído mostra o eco e não altera itens, skills nem puzzles', () => {
    jogarFase(1);
    atravessarFronteira(2);
    jogarFase(2);
    atravessarFronteira(3);

    const itensAntes = itensPresentes();
    const skillsAntes = skillsNoPainel();
    const puzzlesAntes = { ...j().puzzles };
    expect(j().lugares.cafezinho).toBe('concluido');

    j().entrarNoLugar('cafezinho');
    const cena = seletores.cenaAtual(j());
    expect(j().narracao).toBe(cena?.ecoTexto);
    expect(j().dialogoAtivo).toBeNull();
    for (const h of cena?.hotspots ?? []) j().clicarHotspot(h.id);

    expect(j().puzzleAberto).toBeNull();
    expect(j().dialogoAtivo).toBeNull();
    expect(itensPresentes()).toEqual(itensAntes);
    expect(skillsNoPainel()).toEqual(skillsAntes);
    expect(j().puzzles).toEqual(puzzlesAntes);
  });

  it('o Escritório é base recorrente: nunca fica concluído dentro de uma fase que o usa', () => {
    jogarFase(1);
    expect(j().lugares.escritorio).toBe('destravado');
    j().entrarNoBloco(3);
    jogarFase(3);
    expect(j().lugares.escritorio).toBe('destravado');
  });
});

describe('saída do palco com interação em curso', () => {
  /**
   * `clicarHotspot` marca o hotspot em `hotspotsFeitos` NA HORA, mas os efeitos
   * de um hotspot de diálogo só são aplicados no último nó. Se `voltarAoMapa`
   * aceitasse sair pelo meio, um gate seguinte abriria sem que os efeitos
   * tivessem sido concedidos, e a fase fecharia com o painel errado.
   */
  it('recusa sair no meio de um diálogo, e libera depois do fim', () => {
    j().entrarNoBloco(6);
    j().entrarNoLugar('cafezinho');
    const comDialogo = acharCena('cafezinho', 6)?.hotspots.find((h) =>
      h.efeitos.some((e) => e.tipo === 'dialogo'),
    );
    expect(comDialogo).toBeDefined();
    if (!comDialogo) return;

    j().clicarHotspot(comDialogo.id);
    const ativo = j().dialogoAtivo;
    expect(ativo).not.toBeNull();
    // Um passo, sem terminar: é justamente o estado "no meio".
    const total = DIALOGOS[ativo?.dialogoId ?? '']?.nos.length ?? 0;
    expect(total, 'o diálogo precisa ter meio').toBeGreaterThan(1);
    j().avancarDialogo();
    const indiceNoMeio = j().dialogoAtivo?.indice;
    expect(indiceNoMeio).toBe(1);

    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'cafezinho' });
    expect(j().dialogoAtivo?.indice).toBe(indiceNoMeio);

    concluirDialogo();
    // A fase 6 termina indo para a revelação; o diálogo terminou de verdade.
    expect(j().dialogoAtivo).toBeNull();
  });

  it('recusa sair com puzzle aberto, e libera depois de resolvido', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    prepararReuniaoDoBloco4();
    const abre = hotspotQueAbre(4, 'montar');
    j().clicarHotspot(abre.id);
    expect(j().puzzleAberto).toBe('montar');

    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'sala-reunioes' });
    expect(j().puzzleAberto).toBe('montar');

    j().resolverPuzzle('montar');
    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });

  /**
   * Sair PELO BOTÃO DO PUZZLE é permitido e reinicia; sair para o mapa com
   * puzzle aberto continua recusado. São dois gestos com semânticas diferentes, e
   * misturá-los faria o apresentador não saber o que perdeu.
   */
  it('fecharPuzzle libera a saída para o mapa que estava recusada', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    prepararReuniaoDoBloco4();
    j().clicarHotspot(hotspotQueAbre(4, 'montar').id);
    j().voltarAoMapa();
    expect(j().tela.tipo).toBe('cena');

    j().fecharPuzzle();
    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });

  it('recusa sair durante a pausa da fase 4, e libera depois de concluída', () => {
    j().entrarNoBloco(4);
    jogarFase(4);
    // A pausa já foi concluída por `jogarFase`; refaz o estado à mão.
    j().reiniciar();
    instalarArmazenamento();
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    // A abertura da cena deixa narração na tela, e ela não tem nada a ver com a
    // PAUSA: dispensar antes é o que torna a asserção de silêncio honesta.
    j().fecharNarracao();
    prepararReuniaoDoBloco4();
    j().clicarHotspot(hotspotQueAbre(4, 'montar').id);
    j().resolverPuzzle('montar');
    const cena = acharCena('sala-reunioes', 4);
    const apresentar = cena?.hotspots.find((h) => h.id === 'b4-entrega');
    expect(apresentar, 'a fase 4 precisa do hotspot de apresentação').toBeDefined();
    if (!apresentar) return;
    j().clicarHotspot(apresentar.id);
    expect(j().pausaBloco4).not.toBe('rodando');
    // Diálogo em andamento não é persistido; ao retomar, o atril precisa
    // continuar disponível para repetir a fala e só então disparar a pausa.
    j().continuar();
    expect(j().dialogoAtivo).toBeNull();
    j().clicarHotspot(apresentar.id);
    expect(j().dialogoAtivo?.dialogoId).toBe('b4-apresentacao');
    concluirDialogo();
    expect(j().pausaBloco4).toBe('rodando');

    // O SILÊNCIO É O REQUISITO: nem narração, nem diálogo, nem skill.
    expect(j().narracao).toBeNull();
    expect(j().dialogoAtivo).toBeNull();

    j().voltarAoMapa();
    expect(j().tela.tipo).toBe('cena');
    // Durante a pausa o palco não responde a clique nenhum.
    const outro = cena?.hotspots.find((h) => h.id !== apresentar.id);
    if (outro) {
      j().clicarHotspot(outro.id);
      expect(j().dialogoAtivo).toBeNull();
    }

    j().concluirPausaBloco4();
    const crachaDepoisDaPrimeiraApresentacao = j().itens['cracha-innovation'];
    j().clicarHotspot(apresentar.id);
    expect(j().dialogoAtivo?.dialogoId).toBe('b4-apresentacao');
    concluirDialogo();
    expect(j().pausaBloco4).toBe('concluida');
    expect(j().itens['cracha-innovation']).toBe(crachaDepoisDaPrimeiraApresentacao);

    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });
});

describe('narração pendente não atravessa troca de tela', () => {
  it('voltarAoMapa limpa narração e mensagem de falha', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('escritorio');
    // A entrada não narra mais: o texto pendente nasce de uma pista acionada.
    j().clicarHotspot('b3-claudia');
    expect(j().narracao).not.toBeNull();
    j().selecionarItem('certificado-degree');
    const alvo = acharCena('escritorio', 3)?.hotspots.find(
      (h) => h.aceitaItem !== 'certificado-degree',
    );
    if (alvo) j().clicarHotspot(alvo.id);
    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);

    j().voltarAoMapa();

    expect(j().tela).toEqual({ tipo: 'mapa' });
    expect(j().narracao).toBeNull();
    expect(j().mensagemFalha).toBeNull();
  });

  it('a entrada na revelação limpa narração e mensagem de falha', () => {
    jogarTudoAteRevelacao();
    expect(j().tela).toEqual({ tipo: 'revelacao' });
    expect(j().narracao).toBeNull();
    expect(j().mensagemFalha).toBeNull();
  });
});

describe('colisão de id de hotspot entre cenas', () => {
  /**
   * `hotspotsFeitos` é global e a store NUNCA a limpa na troca de fase. Este é
   * o motivo pelo qual id repetido entre cenas é perigoso.
   */
  it('hotspotsFeitos sobrevive à troca de fase', () => {
    jogarFase(1);
    const algum = j().hotspotsFeitos.find((id) => !id.startsWith('abertura:'));
    expect(algum).toBeDefined();
    atravessarFronteira(2);
    expect(j().hotspotsFeitos).toContain(algum);
    j().entrarNoBloco(4);
    expect(j().hotspotsFeitos).toContain(algum);
  });

  /** Gates podem ligar cenas da mesma fase, mas nunca devem herdar um clique da fase passada. */
  it('nenhum requerHotspotsFeitos aponta para um id de fase anterior', () => {
    const preSatisfeitos: string[] = [];
    CENAS.forEach((cena) => {
      const anteriores = new Set(CENAS.filter((c) => c.bloco < cena.bloco).flatMap((c) => c.hotspots.map((h) => h.id)));
      for (const h of cena.hotspots) {
        for (const dep of h.requerHotspotsFeitos ?? []) {
          if (anteriores.has(dep)) {
            preSatisfeitos.push(`fase ${cena.bloco} / ${cena.lugarId}: '${h.id}' → '${dep}'`);
          }
        }
      }
    });
    expect(preSatisfeitos).toEqual([]);
  });

  it('o teste acima não passa por vacuidade: existem gates de hotspot no conteúdo', () => {
    const comGate = CENAS.flatMap((c) => c.hotspots).filter(
      (h) => (h.requerHotspotsFeitos ?? []).length > 0,
    );
    expect(comGate.length).toBeGreaterThan(0);
  });

  it('um gate de requerHotspotsFeitos só abre depois do hotspot da própria fase', () => {
    const comGate = CENAS.flatMap((cena) =>
      cena.hotspots
        .filter((h) => (h.requerHotspotsFeitos ?? []).length > 0)
        .map((h) => ({ cena, h })),
    )[0];
    expect(comGate).toBeDefined();
    if (!comGate) return;

    j().entrarNoBloco(comGate.cena.bloco);
    j().entrarNoLugar(comGate.cena.lugarId);
    j().fecharNarracao();
    const dependencia = (comGate.h.requerHotspotsFeitos ?? [])[0] as HotspotId;
    expect(j().hotspotsFeitos).not.toContain(dependencia);

    j().clicarHotspot(comGate.h.id);
    expect(j().narracao).toBe(comGate.h.bloqueadoTexto);
    expect(j().dialogoAtivo).toBeNull();
  });
});

describe('sequência da revelação', () => {
  /** Atalha até a revelação a partir do estado assumido da fase 6. */
  function atalharAteRevelacao(): void {
    j().entrarNoBloco(6);
    jogarFase(6);
    expect(j().tela).toEqual({ tipo: 'revelacao' });
  }

  it('conexão não avança fora da tela de revelação', () => {
    j().entrarNoBloco(6);
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(0);
    j().entrarNoLugar('cafezinho');
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(0);
  });

  it('as conexões avançam uma por disparo explícito e param na última', () => {
    atalharAteRevelacao();
    expect(seletores.conexoesFeitas(j())).toEqual([]);
    for (let i = 0; i < CONEXOES.length; i++) {
      j().dispararConexao();
      expect(j().revelacao.conexoesFeitas).toBe(i + 1);
      expect(seletores.conexoesFeitas(j())).toEqual(CONEXOES.slice(0, i + 1));
    }
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(CONEXOES.length);
  });

  it('as três primeiras conexões apagam o item de origem, uma por vez', () => {
    atalharAteRevelacao();
    const naBarraAntes = seletores.itensNaBarra(j()).length;
    expect(naBarraAntes).toBe(BLOCOS[6].estadoAssumido.itens.length);

    for (let i = 0; i < 3; i++) {
      const conexao = CONEXOES[i];
      expect(conexao?.consomeOrigem).toBe(true);
      const origem = conexao?.origem;
      if (origem?.tipo !== 'item') throw new Error(`conexão ${i} não sai de um item`);
      expect(j().itens[origem.itemId]).toBe('presente');

      j().dispararConexao();

      expect(j().itens[origem.itemId]).toBe('consumido');
      expect(seletores.itensNaBarra(j())).toHaveLength(naBarraAntes - (i + 1));
    }
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');
  });

  it('a quarta conexão sai da skill proatividade e não consome a origem', () => {
    const quarta = CONEXOES[CONEXOES.length - 1];
    expect(quarta?.origem).toEqual({ tipo: 'skill', skillId: 'proatividade' });
    expect(quarta?.consomeOrigem).toBe(false);

    atalharAteRevelacao();
    dispararTodasAsConexoes();

    expect(skillsNoPainel()).toContain('proatividade');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
  });

  it('esvaziarBarra não responde antes das quatro conexões', () => {
    atalharAteRevelacao();
    j().dispararConexao();
    j().esvaziarBarra();
    expect(j().revelacao.barraSaiu).toBe(false);
  });

  it('a versão futura só entra depois de a barra sair', () => {
    atalharAteRevelacao();
    dispararTodasAsConexoes();

    j().mostrarVersaoFutura();
    expect(j().revelacao.versaoFutura).toBe(false);
    expect(j().sprite).not.toBe('ana-futura');

    j().esvaziarBarra();
    j().mostrarVersaoFutura();
    expect(j().revelacao.versaoFutura).toBe(true);
    expect(j().sprite).toBe('ana-futura');
  });

  it('as perguntas finais só avançam depois da versão futura, uma por clique, e param em três', () => {
    atalharAteRevelacao();
    dispararTodasAsConexoes();
    j().esvaziarBarra();

    j().avancarPergunta();
    expect(seletores.perguntasVisiveis(j())).toEqual([]);
    expect(j().tela).toEqual({ tipo: 'revelacao' });

    j().mostrarVersaoFutura();
    for (let i = 0; i < PERGUNTAS_FINAIS.length; i++) {
      j().avancarPergunta();
      expect(seletores.perguntasVisiveis(j())).toEqual(PERGUNTAS_FINAIS.slice(0, i + 1));
    }
    j().avancarPergunta();
    expect(seletores.perguntasVisiveis(j())).toEqual(PERGUNTAS_FINAIS);
    expect(PERGUNTAS_FINAIS).toHaveLength(3);
    expect(seletores.terminou(j())).toBe(true);
  });
});

describe('estado assumido por fase', () => {
  /**
   * NÃO afirma a tabela contra si mesma. O que importa do estado assumido da
   * fase 6 é a CONSEQUÊNCIA: a revelação inteira tem que ser executável a partir
   * dele, sem jogar nada antes. Se faltar um item de origem, a conexão daquele
   * item não tem o que apagar; se faltar a skill, a quarta não tem motivo. Um
   * item a menos na tabela é um ensaio do clímax que mente.
   */
  it('entrarNoBloco(6) entrega um estado do qual a revelação roda de ponta a ponta', () => {
    j().entrarNoBloco(6);
    expect(j().bloco).toBe(6);
    expect(j().lugares.cafezinho).toBe('destravado');
    for (const conexao of CONEXOES) {
      if (conexao.origem.tipo === 'item') {
        expect(j().itens[conexao.origem.itemId]).toBe('presente');
      } else {
        expect(skillsNoPainel()).toContain(conexao.origem.skillId);
      }
    }

    jogarFase(6);
    expect(CONEXOES).toHaveLength(4);
    dispararTodasAsConexoes();
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');

    j().esvaziarBarra();
    j().mostrarVersaoFutura();
    for (let i = 0; i < PERGUNTAS_FINAIS.length; i++) j().avancarPergunta();
    expect(seletores.terminou(j())).toBe(true);
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
  });

  it('cada uma das seis fases é ensaiável isoladamente e fecha por conta própria', () => {
    for (const bloco of FASES) {
      j().reiniciar();
      j().entrarNoBloco(bloco);

      const assumido = BLOCOS[bloco].estadoAssumido;
      expect(itensPresentes(), `fase ${bloco}`).toEqual([...assumido.itens].sort());
      expect(skillsNoPainel(), `fase ${bloco}`).toEqual([...assumido.skills]);
      for (const id of assumido.lugaresDestravados) expect(j().lugares[id]).toBe('destravado');
      for (const id of assumido.lugaresConcluidos) expect(j().lugares[id]).toBe('concluido');

      // Pelo menos um lugar destravado tem cena DESTA fase, e a fase fecha.
      const temCenaPropria = assumido.lugaresDestravados.some(
        (id) => acharCena(id, bloco)?.bloco === bloco,
      );
      expect(temCenaPropria, `fase ${bloco} não tem cena própria`).toBe(true);
      jogarFase(bloco);
    }
  });

  it('o cartão de cada fase declara o sprite que a store assume ao entrar nela', () => {
    for (const bloco of FASES) {
      const cartao = CARTOES.find((c) => c.bloco === bloco);
      expect(cartao, `fase ${bloco} sem cartão`).toBeDefined();
      j().reiniciar();
      j().entrarNoBloco(bloco);
      expect(j().sprite, `fase ${bloco}`).toBe(cartao?.sprite);
    }
  });
});
