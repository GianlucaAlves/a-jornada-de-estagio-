/**
 * A SEAM ÚNICA: a superfície pública da store — ações e seletores — dirigida
 * sem renderizar nada.
 *
 * Nada aqui importa React, testing-library ou componente, e nada aqui olha
 * `pos`/`parada` de hotspot: a arte e o posicionamento vão mudar muito, e uma
 * suíte atrelada a layout seria abandonada na primeira semana.
 *
 * Textos esperados são lidos do próprio conteúdo (`bloqueadoTexto`,
 * `ecoTexto`, `aberturaTexto`) em vez de duplicados como string literal — o
 * roteiro ainda vai ser reescrito, e reescrever roteiro não deve quebrar teste.
 *
 * Pela mesma razão, NADA aqui conta nós de diálogo nem depende de um índice
 * específico: `concluirDialogo` avança até `dialogoAtivo` mudar, lendo
 * `DIALOGOS[id].nos.length`, e o "meio do diálogo" é derivado desse tamanho.
 * Diálogos vão encurtar de novo; a suíte não pode encurtar com eles.
 *
 * O que É afirmado por literal são as duas tabelas de fronteira de bloco
 * (inventário e contagem de skills). Ali a duplicação é o teste: comparar a
 * realidade só contra `estadoAssumido` deixaria passar o erro que está NA
 * TABELA.
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
  HotspotId,
  ItemId,
  LugarId,
  SkillId,
} from '../domain/types';
import { seletores, useJogo } from './jogo';
import type { EstadoJogo } from './jogo';

// ------------------------------------------------------------------ apoio

const j = () => useJogo.getState();

const TOTAL_SKILLS = Object.keys(SKILLS).length;

/** Os oito itens do jogo. Base das afirmações sobre o inventário inteiro. */
const TODOS_ITENS: ItemId[] = Object.keys(ITENS) as ItemId[];

/** Os três itens sem uso aparente até o Bloco 5. Derivado, não hardcoded. */
const ITENS_TARDIOS: ItemId[] = (Object.keys(ITENS) as ItemId[]).filter(
  (id) => ITENS[id].tardio,
);

/**
 * Os itens que nenhum efeito do jogo consome. Não são tardios — eles têm uso
 * dramático no bloco em que aparecem — mas continuam na barra depois disso, e
 * só se apagam no fim, pela ação `esvaziarBarra`. Derivado do conteúdo: se
 * alguém acrescentar um `consumirItem` para um deles, a lista muda sozinha.
 */
const ITENS_NUNCA_CONSUMIDOS: ItemId[] = TODOS_ITENS.filter(
  (id) => !ITENS[id].tardio && !itemEhConsumidoPorAlgumEfeito(id),
);

/** Fronteira → inventário esperado, ordenado. Escrito à mão, de propósito.
 *
 * Comparar o inventário medido só contra `BLOCOS[n].estadoAssumido` deixa passar
 * o erro que está NA TABELA: foi exatamente assim que a fronteira B4→B5 perdeu
 * três itens em silêncio. Aqui a realidade é afirmada contra um literal, e a
 * tabela é afirmada contra o mesmo literal — os dois lados, separadamente.
 */
const INVENTARIO_NA_FRONTEIRA: Record<2 | 3 | 4 | 5, ItemId[]> = {
  2: ['cartao-rafael', 'senha'],
  3: [
    'anotacoes-treinamento',
    'cartao-rafael',
    'certificado-degree',
    'indicacao-trilha',
    'senha',
  ],
  4: [
    'cartao-rafael',
    'certificado-degree',
    'cracha-innovation',
    'indicacao-trilha',
    'senha',
  ],
  5: [
    'cartao-rafael',
    'certificado-degree',
    'cracha-innovation',
    'indicacao-trilha',
    'projeto-entregue',
    'senha',
  ],
};

/** Fronteira → quantas skills o painel deve ter. Literal pelo mesmo motivo. */
const SKILLS_NA_FRONTEIRA: Record<2 | 3 | 4 | 5, number> = { 2: 2, 3: 5, 4: 7, 5: 9 };

const ORDEM_DE_DESBLOQUEIO: readonly LugarId[] = [
  'escritorio',
  'cafezinho',
  'sala-treinamento',
  'laboratorio',
  'innovation',
  'sala-reunioes',
];

/** Itens renderizáveis na barra, ordenados para comparação estável. */
function itensPresentes(): ItemId[] {
  return [...seletores.itensNaBarra(j())].sort();
}

/** Ids das skills no painel, na ordem em que ela as aprendeu. */
function skillsNoPainel(): SkillId[] {
  return seletores.skillsNoPainel(j()).map((s) => s.id);
}

/**
 * Hotspot da cena atual. Usado só para ler TEXTO autoral (`bloqueadoTexto`),
 * nunca posição.
 */
function hotspot(id: HotspotId) {
  const h = seletores.cenaAtual(j())?.hotspots.find((x) => x.id === id);
  if (!h) throw new Error(`hotspot '${id}' não existe na cena atual`);
  return h;
}

/**
 * Avança o diálogo ativo até ele terminar, clicando um nó por vez.
 *
 * O número de cliques é LIDO do conteúdo (`DIALOGOS[id].nos.length` menos o nó
 * atual), nunca hardcoded: reescrever falas é a operação mais frequente do
 * projeto e não pode quebrar a suíte.
 *
 * Além de avançar, afirma o contrato de `avancarDialogo`: um clique = um nó,
 * sempre para frente, e todo nó visitado tem fala escrita.
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
    // O nó apontado pelo índice existe e tem fala — é o que a caixa renderiza.
    const no = dialogo.nos[antes.indice];
    if (!no) throw new Error(`'${dialogo.id}' aponta para o nó ${antes.indice}, que não existe`);
    expect(no.texto.trim(), `'${dialogo.id}' nó ${antes.indice}`).not.toBe('');

    j().avancarDialogo();

    const depois = j().dialogoAtivo;
    if (clique < cliquesEsperados) {
      // Um clique = um nó: nem pula, nem fica parado esperando interação.
      expect(depois?.dialogoId, `'${dialogo.id}' trocou de diálogo no meio`).toBe(dialogo.id);
      expect(depois?.indice, `'${dialogo.id}' não avançou exatamente um nó`).toBe(
        antes.indice + 1,
      );
    }
  }

  // Passado o último nó, este diálogo não pode continuar ativo. Um efeito
  // `dialogo` no fim (encadeamento) abre outro id — por isso a checagem é por id.
  expect(j().dialogoAtivo?.dialogoId, `'${dialogo.id}' não terminou`).not.toBe(dialogo.id);
  // Encadeou? Então o próximo também vai até o fim.
  if (j().dialogoAtivo) concluirDialogo([...jaVistos, dialogo.id]);
}

/**
 * Para o diálogo ativo NO MEIO e devolve o índice onde parou.
 *
 * O número de cliques vem do tamanho real do diálogo e é limitado a
 * `nos.length - 1`, então o diálogo nunca termina aqui por acidente — é
 * justamente o estado "no meio" que os testes de abandono precisam.
 */
function avancarAteOMeioDoDialogo(): number {
  const ativo = j().dialogoAtivo;
  if (!ativo) throw new Error('nenhum diálogo ativo');
  const total = DIALOGOS[ativo.dialogoId]?.nos.length ?? 0;
  const cliques = Math.min(Math.max(1, Math.floor(total / 2)), total - 1);
  for (let i = 0; i < cliques; i++) j().avancarDialogo();
  const indice = j().dialogoAtivo?.indice;
  if (indice === undefined) throw new Error(`'${ativo.dialogoId}' terminou antes do meio`);
  return indice;
}

/** Clica e leva a conversa até o fim (os efeitos do diálogo saem no último nó). */
function conversar(hotspotId: HotspotId): void {
  j().clicarHotspot(hotspotId);
  concluirDialogo();
}

/**
 * Fronteira de bloco: fecho → cartão de transição → estado assumido.
 *
 * O inventário é afirmado nos DOIS lados da fronteira, e sempre — a única
 * fronteira que não afirmava inventário (B4→B5) foi onde três itens imediatos
 * desapareceram em silêncio. Como toda travessia da suíte passa por aqui,
 * nenhuma fronteira fica sem asserção.
 */
function atravessarCartao(proximo: 2 | 3 | 4 | 5): void {
  const esperado = INVENTARIO_NA_FRONTEIRA[proximo];
  const skillsEsperadas = [...BLOCOS[proximo].estadoAssumido.skills];

  // Lado de saída: o que o bloco anterior de fato entrega.
  expect(itensPresentes()).toEqual(esperado);
  expect(skillsNoPainel()).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);
  // Não só a contagem: as skills certas, na ordem em que ela as aprendeu.
  expect(skillsNoPainel()).toEqual(skillsEsperadas);
  // A tabela do próximo bloco tem que declarar a MESMA lista.
  expect([...BLOCOS[proximo].estadoAssumido.itens].sort()).toEqual(esperado);
  expect(BLOCOS[proximo].estadoAssumido.skills).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);

  expect(j().blocoConcluido).toBe(true);
  j().avancarBloco();
  expect(j().tela).toEqual({ tipo: 'cartao', bloco: proximo });
  expect(j().blocoConcluido).toBe(false);
  j().entrarNoBloco(proximo);
  expect(j().bloco).toBe(proximo);
  expect(j().tela).toEqual({ tipo: 'mapa' });

  // Lado de entrada: nada se perdeu na troca de bloco.
  expect(itensPresentes()).toEqual(esperado);
  expect(skillsNoPainel()).toHaveLength(SKILLS_NA_FRONTEIRA[proximo]);
  expect(skillsNoPainel()).toEqual(skillsEsperadas);
}

/**
 * Todo Efeito alcançável a partir das cenas dos blocos dados, incluindo os
 * efeitos dos diálogos que essas cenas disparam (fechamento transitivo).
 */
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

/** Algum efeito do conteúdo, em qualquer bloco, consome este item? */
function itemEhConsumidoPorAlgumEfeito(itemId: ItemId): boolean {
  return efeitosAlcancaveis([1, 2, 3, 4, 5]).some(
    (e) => e.tipo === 'consumirItem' && e.itemId === itemId,
  );
}

/**
 * Acumula todo item que passou pelo estado 'consumido' em qualquer ponto da
 * execução.
 *
 * `entrarNoBloco` reconstrói o mapa de itens do zero, então o estado final NÃO
 * guarda memória dos dois itens de leva-e-traz gastos no Bloco 3. A tese "tudo
 * o que ela carregou, ela usou" só é verificável acompanhando as transições —
 * daí a assinatura na store, não um instantâneo.
 */
function rastrearItensConsumidos(): { vistos: () => ItemId[]; parar: () => void } {
  const vistos = new Set<ItemId>();
  const registrar = (s: EstadoJogo): void => {
    for (const id of TODOS_ITENS) if (s.itens[id] === 'consumido') vistos.add(id);
  };
  registrar(j());
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
    narracao: s.narracao,
    sprite: s.sprite,
    pausaBloco4: s.pausaBloco4,
    revelacao: { ...s.revelacao },
    blocoConcluido: s.blocoConcluido,
  };
}

// -------------------------------------------------- roteiros jogáveis por cena

/** Bloco 1 — o puzzle é social: o notebook só abre depois das três conversas. */
function jogarBloco1(): void {
  j().entrarNoLugar('escritorio');
  conversar('tiago');
  conversar('claudia');
  conversar('rafael');
  j().clicarHotspot('notebook');
  expect(j().puzzleAberto).toBe('senha');
  j().resolverPuzzle('senha');
  j().clicarHotspot('notebook-aberto');
}

/** Bloco 2, Cafezinho — é a Bianca que destrava a Sala de Treinamento. */
function jogarBloco2Cafezinho(): void {
  j().entrarNoLugar('cafezinho');
  conversar('bianca-cafe');
}

function jogarBloco2SalaTreinamento(): void {
  j().entrarNoLugar('sala-treinamento');
  conversar('bianca-trilha');
  j().clicarHotspot('notebook-trilha');
  expect(j().puzzleAberto).toBe('associar');
  j().resolverPuzzle('associar');
  conversar('conclusao-trilha');
}

/** Bloco 3, Laboratório — a porta central: anotações usadas no monitor. */
function jogarBloco3Laboratorio(): void {
  j().entrarNoLugar('laboratorio');
  j().selecionarItem('anotacoes-treinamento');
  j().clicarHotspot('monitor');
  concluirDialogo();
  expect(j().puzzleAberto).toBe('sequenciar');
  j().resolverPuzzle('sequenciar');
  conversar('quadro-branco');
}

/** Bloco 3, Escritório — leva-e-traz de alcance curto: o relatório à Cláudia. */
function jogarBloco3Escritorio(): void {
  j().entrarNoLugar('escritorio');
  j().selecionarItem('relatorio');
  j().clicarHotspot('claudia');
  concluirDialogo();
}

function jogarBloco3Innovation(): void {
  j().entrarNoLugar('innovation');
  conversar('marcos');
  expect(j().puzzleAberto).toBe('estruturar');
  j().resolverPuzzle('estruturar');
  conversar('mural');
  conversar('rafael');
}

function jogarBloco4(): void {
  j().entrarNoLugar('sala-reunioes');
  j().clicarHotspot('tv');
  expect(j().puzzleAberto).toBe('montar');
  j().resolverPuzzle('montar');
  j().clicarHotspot('entrega');
  j().concluirPausaBloco4();
  conversar('claudia');
  conversar('bianca');
  conversar('notebook');
}

/** Bloco 5 — o e-mail. Única transição automática, no fim do diálogo. */
function jogarBloco5AteRevelacao(): void {
  j().entrarNoLugar('escritorio');
  conversar('notebook');
  expect(j().tela).toEqual({ tipo: 'revelacao' });
}

function dispararTodasAsConexoes(): void {
  for (let i = 0; i < CONEXOES.length; i++) j().dispararConexao();
}

/** A jornada inteira, do primeiro clique até a tela de revelação. */
function jogarTudoAteRevelacao(): void {
  jogarBloco1();
  atravessarCartao(2);
  jogarBloco2Cafezinho();
  jogarBloco2SalaTreinamento();
  atravessarCartao(3);
  jogarBloco3Laboratorio();
  jogarBloco3Escritorio();
  jogarBloco3Innovation();
  atravessarCartao(4);
  jogarBloco4();
  atravessarCartao(5);
  jogarBloco5AteRevelacao();
}

beforeEach(() => {
  useJogo.getState().reiniciar();
});

// ------------------------------------------------------------------ testes

describe('playthrough completo', () => {
  /**
   * `atravessarCartao` é o único caminho da suíte entre blocos, e ele afirma
   * inventário e skills nos dois lados. Este teste garante que a cobertura é
   * TOTAL: se um sexto bloco aparecer com cartão próprio, a tabela de fronteira
   * não vai ter entrada para ele e isto falha antes de o playthrough passar por
   * cima da fronteira nova sem afirmar nada.
   */
  it('existe tabela de inventário e de skills para toda fronteira de bloco', () => {
    const fronteiras = CARTOES.map((c) => c.bloco);
    expect(fronteiras).toEqual([2, 3, 4, 5]);
    expect(Object.keys(INVENTARIO_NA_FRONTEIRA).map(Number)).toEqual(fronteiras);
    expect(Object.keys(SKILLS_NA_FRONTEIRA).map(Number)).toEqual(fronteiras);
    // E cada tabela concorda com o estado que o bloco declara assumir.
    for (const bloco of fronteiras) {
      const chave = bloco as 2 | 3 | 4 | 5;
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
    // O diálogo ativo também não carrega estado de escolha pendente.
    j().entrarNoBloco(1);
    j().entrarNoLugar('escritorio');
    j().clicarHotspot('tiago');
    expect(Object.keys(j().dialogoAtivo ?? {}).sort()).toEqual(['dialogoId', 'indice']);
  });

  it('joga do primeiro clique até as três perguntas finais, com estado afirmado em cada fronteira de bloco', () => {
    // ------------------------------------------------ estado zero
    expect(j().bloco).toBe(1);
    expect(j().lugares).toEqual({
      escritorio: 'destravado',
      cafezinho: 'silhueta',
      'sala-treinamento': 'silhueta',
      laboratorio: 'silhueta',
      innovation: 'silhueta',
      'sala-reunioes': 'silhueta',
    });
    expect(itensPresentes()).toEqual([]);
    expect(skillsNoPainel()).toEqual([]);
    expect(j().sprite).toBe('ana-encolhida');
    // Os seis slots existem no mapa desde o início; só o Escritório tem nome.
    const slots = seletores.slotsDoMapa(j());
    expect(slots).toHaveLength(6);
    expect(slots.filter((s) => s.nome !== null).map((s) => s.id)).toEqual(['escritorio']);

    // ------------------------------------------------ BLOCO 1
    j().entrarNoLugar('escritorio');
    expect(seletores.cenaAtual(j())?.bloco).toBe(1);
    expect(j().narracao).toBe(seletores.cenaAtual(j())?.aberturaTexto);

    // O notebook é porta social: não abre antes das três conversas.
    j().clicarHotspot('notebook');
    expect(j().narracao).toBe(hotspot('notebook').bloqueadoTexto);
    expect(j().puzzles.senha).toBe('fechado');
    expect(j().puzzleAberto).toBeNull();

    jogarBloco1();
    expect(j().puzzles.senha).toBe('resolvido');
    expect(itensPresentes()).toEqual(['cartao-rafael', 'senha']);
    expect(skillsNoPainel()).toEqual(['coragem-perguntar', 'autoconhecimento']);
    expect(j().lugares.cafezinho).toBe('destravado');
    expect(j().nomesRevelados).toContain('cafezinho');
    // A fronteira entrega exatamente o que o Bloco 2 declara assumir.
    expect(itensPresentes()).toEqual([...BLOCOS[2].estadoAssumido.itens].sort());
    expect(skillsNoPainel()).toEqual([...BLOCOS[2].estadoAssumido.skills]);

    atravessarCartao(2);
    expect(j().sprite).toBe('ana-neutra');

    // ------------------------------------------------ BLOCO 2
    expect(j().lugares['sala-treinamento']).toBe('silhueta');
    jogarBloco2Cafezinho();
    expect(j().lugares['sala-treinamento']).toBe('destravado');
    expect(j().itens['indicacao-trilha']).toBe('presente');

    // O Cartão do Rafael não serve pra nada aqui — e não é consumido.
    j().selecionarItem('cartao-rafael');
    j().clicarHotspot('rafael-cafe');
    expect(j().itens['cartao-rafael']).toBe('presente');
    expect(j().mensagemFalha).toBeNull();

    jogarBloco2SalaTreinamento();
    expect(j().puzzles.associar).toBe('resolvido');
    expect(j().lugares.laboratorio).toBe('destravado');
    expect(j().lugares.cafezinho).toBe('concluido');
    expect(j().lugares['sala-treinamento']).toBe('concluido');
    expect(itensPresentes()).toEqual([...BLOCOS[3].estadoAssumido.itens].sort());
    expect(skillsNoPainel()).toEqual([...BLOCOS[3].estadoAssumido.skills]);

    atravessarCartao(3);

    // ------------------------------------------------ BLOCO 3
    // Clique seco no monitor: parede de texto, nenhum puzzle.
    j().entrarNoLugar('laboratorio');
    j().clicarHotspot('monitor');
    concluirDialogo();
    expect(j().puzzles.sequenciar).toBe('fechado');

    jogarBloco3Laboratorio();
    expect(j().itens['anotacoes-treinamento']).toBe('consumido');
    expect(j().itens.relatorio).toBe('presente');
    expect(skillsNoPainel()).toContain('proatividade');

    expect(j().lugares.innovation).toBe('silhueta');
    jogarBloco3Escritorio();
    expect(j().itens.relatorio).toBe('consumido');
    expect(j().lugares.innovation).toBe('destravado');
    expect(skillsNoPainel()).toContain('protagonismo');

    expect(j().lugares['sala-reunioes']).toBe('silhueta');
    jogarBloco3Innovation();
    expect(j().itens['cracha-innovation']).toBe('presente');
    expect(j().lugares['sala-reunioes']).toBe('destravado');
    expect(j().lugares.laboratorio).toBe('concluido');
    expect(j().lugares.innovation).toBe('concluido');
    expect(itensPresentes()).toEqual([...BLOCOS[4].estadoAssumido.itens].sort());
    expect(skillsNoPainel()).toEqual([...BLOCOS[4].estadoAssumido.skills]);

    atravessarCartao(4);
    expect(j().sprite).toBe('ana-confiante');

    // ------------------------------------------------ BLOCO 4
    j().entrarNoLugar('sala-reunioes');
    expect(seletores.cenaAtual(j())?.bloco).toBe(4);

    // A entrega não existe antes do diagrama montado.
    j().clicarHotspot('entrega');
    expect(j().narracao).toBe(hotspot('entrega').bloqueadoTexto);
    expect(j().itens['projeto-entregue']).toBe('ausente');
    j().fecharNarracao();

    j().clicarHotspot('tv');
    expect(j().puzzleAberto).toBe('montar');
    j().resolverPuzzle('montar');
    const skillsAntesDaEntrega = skillsNoPainel();
    j().clicarHotspot('entrega');
    expect(j().itens['projeto-entregue']).toBe('presente');
    expect(j().pausaBloco4).toBe('rodando');
    // O silêncio é o requisito: nem narração, nem diálogo, nem skill.
    expect(j().narracao).toBeNull();
    expect(j().dialogoAtivo).toBeNull();
    expect(skillsNoPainel()).toEqual(skillsAntesDaEntrega);

    // Durante a pausa o palco não responde a clique nenhum.
    j().clicarHotspot('claudia');
    expect(j().dialogoAtivo).toBeNull();
    j().concluirPausaBloco4();
    expect(j().pausaBloco4).toBe('concluida');

    conversar('claudia');
    conversar('bianca');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
    conversar('notebook');
    expect(j().lugares['sala-reunioes']).toBe('concluido');
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('presente');
    // A fronteira B4→B5 era a única sem asserção de inventário — e foi por isso
    // que três itens imediatos desapareceram nela em silêncio. Seis itens
    // chegam ao clímax: nenhum efeito do jogo consome 'senha',
    // 'indicacao-trilha' nem 'projeto-entregue'.
    expect(itensPresentes()).toEqual(INVENTARIO_NA_FRONTEIRA[5]);
    expect(itensPresentes()).toHaveLength(6);
    for (const id of ITENS_NUNCA_CONSUMIDOS) expect(j().itens[id]).toBe('presente');
    // A fronteira entrega as nove skills na ordem em que ela as aprendeu.
    expect(skillsNoPainel()).toEqual([...BLOCOS[5].estadoAssumido.skills]);

    atravessarCartao(5);

    // ------------------------------------------------ BLOCO 5
    expect(itensPresentes()).toEqual(INVENTARIO_NA_FRONTEIRA[5]);
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('presente');
    expect(skillsNoPainel()).toEqual([...BLOCOS[5].estadoAssumido.skills]);
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);

    j().entrarNoLugar('escritorio');
    expect(seletores.cenaAtual(j())?.bloco).toBe(5);
    jogarBloco5AteRevelacao();

    for (let i = 0; i < CONEXOES.length; i++) {
      j().dispararConexao();
      expect(seletores.conexoesFeitas(j())).toEqual(CONEXOES.slice(0, i + 1));
    }
    j().esvaziarBarra();
    expect(seletores.itensNaBarra(j())).toEqual([]);
    // Consumidos de verdade, não apenas escondidos pelo seletor.
    for (const id of INVENTARIO_NA_FRONTEIRA[5]) expect(j().itens[id]).toBe('consumido');
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
});

describe('portas de leva-e-traz', () => {
  it('o monitor do Laboratório não libera o puzzle sequenciar num clique sem usar as anotações', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');
    expect(j().itens['anotacoes-treinamento']).toBe('presente');

    j().clicarHotspot('monitor');
    concluirDialogo();

    expect(j().puzzles.sequenciar).toBe('fechado');
    expect(j().puzzleAberto).toBeNull();
    expect(j().itens['anotacoes-treinamento']).toBe('presente');
  });

  it('o monitor libera o puzzle sequenciar quando as anotações são usadas nele', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');
    j().selecionarItem('anotacoes-treinamento');
    expect(j().itemSelecionado).toBe('anotacoes-treinamento');

    j().clicarHotspot('monitor');
    // A descoberta vem primeiro: o puzzle só sobe no fim da fala, nunca por cima.
    expect(j().dialogoAtivo?.dialogoId).toBe('b3-monitor-anotacoes');
    expect(j().puzzles.sequenciar).toBe('fechado');
    expect(j().itemSelecionado).toBeNull();

    concluirDialogo();
    expect(j().puzzles.sequenciar).toBe('liberado');
    expect(j().puzzleAberto).toBe('sequenciar');
    expect(j().itens['anotacoes-treinamento']).toBe('consumido');
  });

  it('o monitor volta a ser parede de texto depois de as anotações serem consumidas', () => {
    j().entrarNoBloco(3);
    jogarBloco3Laboratorio();
    j().fecharNarracao();

    j().clicarHotspot('monitor');

    expect(j().narracao).toBe(hotspot('monitor').bloqueadoTexto);
    expect(j().dialogoAtivo).toBeNull();
    expect(j().puzzles.sequenciar).toBe('resolvido');
    expect(j().puzzleAberto).toBeNull();
  });

  it('o item errado não abre a porta do monitor', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');
    j().selecionarItem('certificado-degree');

    j().clicarHotspot('monitor');

    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);
    expect(j().puzzles.sequenciar).toBe('fechado');
    expect(j().itens['anotacoes-treinamento']).toBe('presente');
    expect(j().itens['certificado-degree']).toBe('presente');
  });

  it('a Sala de Treinamento não está destravada antes do diálogo da Bianca no Cafezinho', () => {
    jogarBloco1();
    atravessarCartao(2);

    expect(j().lugares['sala-treinamento']).toBe('silhueta');
    j().entrarNoLugar('sala-treinamento');
    expect(j().tela).toEqual({ tipo: 'mapa' });

    j().entrarNoLugar('cafezinho');
    j().clicarHotspot('maquina-cafe');
    expect(j().lugares['sala-treinamento']).toBe('silhueta');

    conversar('bianca-cafe');
    expect(j().itens['indicacao-trilha']).toBe('presente');
    expect(j().lugares['sala-treinamento']).toBe('destravado');

    j().entrarNoLugar('sala-treinamento');
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'sala-treinamento' });
    expect(seletores.cenaAtual(j())?.bloco).toBe(2);
  });

  it('a Cláudia do Bloco 3 só destrava o Innovation com o relatório na mão', () => {
    j().entrarNoBloco(3);
    jogarBloco3Laboratorio();
    j().entrarNoLugar('escritorio');

    // Clique sem item: narração neutra, nenhuma porta.
    j().clicarHotspot('claudia');
    expect(j().dialogoAtivo).toBeNull();
    expect(j().lugares.innovation).toBe('silhueta');
    expect(j().itens.relatorio).toBe('presente');

    j().selecionarItem('relatorio');
    j().clicarHotspot('claudia');
    concluirDialogo();
    expect(j().lugares.innovation).toBe('destravado');
    expect(j().itens.relatorio).toBe('consumido');
    expect(skillsNoPainel()).toContain('protagonismo');
  });
});

describe('portas que não podem se desarmar', () => {
  it('reclicar a TV depois de montar o diagrama não reabre o puzzle nem desarma a entrega', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    j().clicarHotspot('tv');
    j().resolverPuzzle('montar');

    j().clicarHotspot('tv');

    expect(j().puzzles.montar).toBe('resolvido');
    expect(j().puzzleAberto).toBeNull();
    j().clicarHotspot('entrega');
    expect(j().itens['projeto-entregue']).toBe('presente');
    expect(j().pausaBloco4).toBe('rodando');
  });

  it('reclicar o Marcos depois de estruturar a proposta não reabre o puzzle nem desarma o mural', () => {
    j().entrarNoBloco(3);
    jogarBloco3Laboratorio();
    jogarBloco3Escritorio();
    j().entrarNoLugar('innovation');
    conversar('marcos');
    j().resolverPuzzle('estruturar');

    conversar('marcos');

    expect(j().puzzles.estruturar).toBe('resolvido');
    expect(j().puzzleAberto).toBeNull();
    conversar('mural');
    expect(j().itens['cracha-innovation']).toBe('presente');
  });

  it('reclicar o quadro branco não ressuscita o relatório já entregue', () => {
    j().entrarNoBloco(3);
    jogarBloco3Laboratorio();
    jogarBloco3Escritorio();
    expect(j().itens.relatorio).toBe('consumido');

    j().entrarNoLugar('laboratorio');
    conversar('quadro-branco');

    expect(j().itens.relatorio).toBe('consumido');
    expect(seletores.itensNaBarra(j())).not.toContain('relatorio');
  });
});

describe('ordem de desbloqueio', () => {
  it('os seis lugares destravam na ordem esperada', () => {
    const ordem: LugarId[] = [];
    const registrar = (): void => {
      const s = j();
      for (const id of Object.keys(s.lugares) as LugarId[]) {
        if (s.lugares[id] !== 'silhueta' && !ordem.includes(id)) ordem.push(id);
      }
    };

    registrar();
    expect(ordem).toEqual(['escritorio']);

    jogarBloco1();
    registrar();
    expect(ordem).toEqual(['escritorio', 'cafezinho']);

    atravessarCartao(2);
    registrar();
    expect(ordem).toEqual(['escritorio', 'cafezinho']);

    jogarBloco2Cafezinho();
    registrar();
    expect(ordem).toEqual(['escritorio', 'cafezinho', 'sala-treinamento']);

    jogarBloco2SalaTreinamento();
    registrar();
    expect(ordem).toEqual(['escritorio', 'cafezinho', 'sala-treinamento', 'laboratorio']);

    atravessarCartao(3);
    jogarBloco3Laboratorio();
    registrar();
    expect(ordem).toHaveLength(4);

    jogarBloco3Escritorio();
    registrar();
    expect(ordem[4]).toBe('innovation');

    jogarBloco3Innovation();
    registrar();
    expect(ordem).toEqual([...ORDEM_DE_DESBLOQUEIO]);
  });

  it('nenhum lugar fica inalcançável: todos os seis abrem uma cena com conteúdo', () => {
    j().entrarNoBloco(4);
    for (const id of ORDEM_DE_DESBLOQUEIO) {
      expect(j().lugares[id]).not.toBe('silhueta');
      j().entrarNoLugar(id);
      expect(j().tela).toEqual({ tipo: 'cena', lugarId: id });
      const cena = seletores.cenaAtual(j());
      expect(cena).toBeDefined();
      expect(cena?.lugarId).toBe(id);
      expect(cena?.hotspots.length).toBeGreaterThan(0);
    }
  });

  it('lugar em silhueta não pode ser visitado', () => {
    expect(j().lugares.laboratorio).toBe('silhueta');
    j().entrarNoLugar('laboratorio');
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'escritorio' });
  });
});

describe('sobrevivência dos itens tardios', () => {
  it('os três itens tardios chegam ao Bloco 5 com estado presente', () => {
    jogarBloco1();
    expect(j().itens['cartao-rafael']).toBe('presente');

    atravessarCartao(2);
    jogarBloco2Cafezinho();
    jogarBloco2SalaTreinamento();
    expect(j().itens['cartao-rafael']).toBe('presente');
    expect(j().itens['certificado-degree']).toBe('presente');

    atravessarCartao(3);
    jogarBloco3Laboratorio();
    jogarBloco3Escritorio();
    jogarBloco3Innovation();
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('presente');

    atravessarCartao(4);
    jogarBloco4();
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('presente');

    atravessarCartao(5);
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('presente');
    // E eles não chegam sozinhos: a barra do clímax tem seis itens.
    expect(itensPresentes()).toEqual(INVENTARIO_NA_FRONTEIRA[5]);
  });

  it('nenhum efeito alcançável nos blocos 1 a 4 consome um item tardio', () => {
    const consumidos = efeitosAlcancaveis([1, 2, 3, 4])
      .filter((e): e is Extract<Efeito, { tipo: 'consumirItem' }> => e.tipo === 'consumirItem')
      .map((e) => e.itemId);

    for (const id of ITENS_TARDIOS) expect(consumidos).not.toContain(id);
    // Só os dois itens de leva-e-traz são gastos no caminho.
    expect([...new Set(consumidos)].sort()).toEqual(['anotacoes-treinamento', 'relatorio']);
  });

  it('o Cartão do Rafael sobrevive a ser usado no próprio Rafael', () => {
    jogarBloco1();
    atravessarCartao(2);
    j().entrarNoLugar('cafezinho');
    j().fecharNarracao();

    j().selecionarItem('cartao-rafael');
    j().clicarHotspot('rafael-cafe');

    expect(j().itens['cartao-rafael']).toBe('presente');
    expect(j().mensagemFalha).toBeNull();
    // A piada é entregue como narração, não como falha genérica.
    expect(j().narracao).not.toBeNull();
    expect(j().narracao).not.toBe(MENSAGEM_GENERICA);
  });
});

describe('estado concluído', () => {
  it('revisitar lugar concluído mostra o ecoTexto, não reabre puzzle, não repete diálogo e não altera itens nem skills', () => {
    jogarBloco1();
    atravessarCartao(2);
    jogarBloco2Cafezinho();
    jogarBloco2SalaTreinamento();
    atravessarCartao(3);

    const itensAntes = itensPresentes();
    const skillsAntes = skillsNoPainel();
    const puzzlesAntes = { ...j().puzzles };
    expect(puzzlesAntes.associar).toBe('resolvido');

    j().entrarNoLugar('cafezinho');
    expect(j().lugares.cafezinho).toBe('concluido');
    expect(j().narracao).toBe(seletores.cenaAtual(j())?.ecoTexto);
    expect(j().narracao).not.toBe(seletores.cenaAtual(j())?.aberturaTexto);
    expect(j().dialogoAtivo).toBeNull();
    j().clicarHotspot('bianca-cafe');
    expect(j().dialogoAtivo).toBeNull();

    j().entrarNoLugar('sala-treinamento');
    expect(j().narracao).toBe(seletores.cenaAtual(j())?.ecoTexto);
    j().clicarHotspot('notebook-trilha');
    expect(j().puzzleAberto).toBeNull();
    j().clicarHotspot('conclusao-trilha');
    expect(j().dialogoAtivo).toBeNull();

    expect(itensPresentes()).toEqual(itensAntes);
    expect(skillsNoPainel()).toEqual(skillsAntes);
    expect(j().puzzles).toEqual(puzzlesAntes);
  });

  it('o Escritório é base recorrente: nunca fica concluído dentro de um bloco que o usa', () => {
    jogarBloco1();
    expect(j().lugares.escritorio).toBe('destravado');

    j().entrarNoBloco(3);
    expect(j().lugares.escritorio).toBe('destravado');
    jogarBloco3Laboratorio();
    jogarBloco3Escritorio();
    expect(j().lugares.escritorio).toBe('destravado');
    expect(seletores.cenaAtual(j())?.bloco).toBe(3);

    j().entrarNoBloco(5);
    expect(j().lugares.escritorio).toBe('destravado');
  });
});

describe('uso de item em alvo errado', () => {
  it('devolve a mensagem genérica e não altera nenhum outro estado', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');
    j().fecharNarracao();
    const antes = instantaneo();

    j().selecionarItem('certificado-degree');
    j().clicarHotspot('tiago');

    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);
    expect(j().itemSelecionado).toBeNull();
    // Tudo o que é narrativamente observável continua idêntico.
    expect(instantaneo()).toEqual(antes);

    j().fecharMensagemFalha();
    expect(j().mensagemFalha).toBeNull();
  });

  it('a mensagem é a mesma para qualquer combinação errada', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');

    // Alvo sem porta nenhuma.
    j().selecionarItem('senha');
    j().clicarHotspot('tiago');
    const primeira = j().mensagemFalha;
    j().fecharMensagemFalha();

    // Alvo que aceita item, mas não esse.
    j().selecionarItem('cartao-rafael');
    j().clicarHotspot('monitor');
    const segunda = j().mensagemFalha;

    expect(primeira).toBe(MENSAGEM_GENERICA);
    expect(segunda).toBe(MENSAGEM_GENERICA);
    expect(j().puzzles.sequenciar).toBe('fechado');
  });

  it('item ausente não pode ser selecionado', () => {
    j().entrarNoBloco(3);
    j().selecionarItem('projeto-entregue');
    expect(j().itemSelecionado).toBeNull();
  });
});

describe('a tese assertada', () => {
  /**
   * "Tudo o que ela carregou, ela usou; tudo o que ela aprendeu, ela é."
   *
   * Afirmação sobre ESTADO, não sobre o seletor: `esvaziarBarra` marca os itens
   * restantes como 'consumido', não só os esconde da barra. E a jornada inteira
   * é jogada, porque os dois itens de leva-e-traz são gastos no Bloco 3 e
   * `entrarNoBloco(5)` reconstrói o mapa de itens do zero — atalhar pelo Bloco 5
   * tornaria a afirmação sobre os oito itens impossível de fazer.
   */
  it('ao fim da jornada os oito itens foram consumidos e as nove skills continuam no painel', () => {
    expect(TODOS_ITENS).toHaveLength(8);
    const rastro = rastrearItensConsumidos();
    try {
      jogarTudoAteRevelacao();

      // As três conexões gastam os três tardios, um por clique.
      dispararTodasAsConexoes();
      expect(j().revelacao.conexoesFeitas).toBe(CONEXOES.length);
      for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');
      // Os três que nenhum efeito consome ainda estão na mão dela.
      expect(itensPresentes()).toEqual([...ITENS_NUNCA_CONSUMIDOS].sort());
      expect([...ITENS_NUNCA_CONSUMIDOS].sort()).toEqual([
        'indicacao-trilha',
        'projeto-entregue',
        'senha',
      ]);

      j().esvaziarBarra();
      expect(j().revelacao.barraSaiu).toBe(true);
      // Consumidos, não escondidos: o estado é lido direto, sem passar pelo
      // seletor que zera a barra quando `barraSaiu`.
      for (const id of ITENS_NUNCA_CONSUMIDOS) expect(j().itens[id]).toBe('consumido');
      expect(Object.values(j().itens)).not.toContain('presente');
      expect(j().itemSelecionado).toBeNull();

      // Os OITO itens passaram por 'consumido' ao longo da jornada — incluindo
      // os dois de leva-e-traz, gastos antes de o Bloco 5 recriar o mapa.
      expect(rastro.vistos()).toEqual([...TODOS_ITENS].sort());

      // Nada do que ela aprendeu se gastou.
      expect(skillsNoPainel()).toEqual([...BLOCOS[5].estadoAssumido.skills]);
      expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
      expect(skillsNoPainel()).toContain('proatividade');
    } finally {
      rastro.parar();
    }
  });
});

describe('saída do palco com interação em curso', () => {
  /** Leva o Bloco 4 até o ponto em que a Bianca pode ser abordada. */
  function bloco4AtePosPausa(): void {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    j().clicarHotspot('tv');
    j().resolverPuzzle('montar');
    j().clicarHotspot('entrega');
    j().concluirPausaBloco4();
  }

  /**
   * `clicarHotspot` marca o hotspot em `hotspotsFeitos` NA HORA, mas os efeitos
   * de um hotspot de diálogo só são aplicados no último nó. Se `voltarAoMapa`
   * aceitasse sair pelo meio, o gate seguinte ('notebook' depende de 'bianca')
   * abriria sem que as skills da Bianca tivessem sido concedidas, e o Bloco 4
   * fecharia com o painel errado na frente da plateia.
   */
  it('recusa sair no meio de um diálogo que concede skill, e libera depois do fim', () => {
    bloco4AtePosPausa();

    j().clicarHotspot('bianca');
    expect(j().dialogoAtivo?.dialogoId).toBe('b4-bianca');
    // O hotspot já conta como feito — é isso que torna a fuga perigosa.
    expect(j().hotspotsFeitos).toContain('bianca');
    expect(skillsNoPainel()).not.toContain('visibilidade');
    expect(skillsNoPainel()).not.toContain('plano-futuro');

    // Meio do diálogo, não a primeira linha — quantos cliques é derivado do
    // tamanho real de 'b4-bianca', então encurtar a fala da Bianca não quebra isto.
    // A virada da Bianca não pode ser um nó só: é ela que concede as duas
    // últimas skills, e a fuga pelo meio só existe se houver meio.
    expect(DIALOGOS['b4-bianca']?.nos.length, "'b4-bianca' tem que ter meio").toBeGreaterThan(1);
    const indiceNoMeio = avancarAteOMeioDoDialogo();
    expect(indiceNoMeio).toBeGreaterThan(0);

    j().voltarAoMapa();

    // A tela continua sendo a cena e o diálogo continua ativo, no mesmo nó.
    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'sala-reunioes' });
    expect(j().dialogoAtivo?.dialogoId).toBe('b4-bianca');
    expect(j().dialogoAtivo?.indice).toBe(indiceNoMeio);

    concluirDialogo();
    expect(j().dialogoAtivo).toBeNull();
    expect(skillsNoPainel()).toContain('visibilidade');
    expect(skillsNoPainel()).toContain('plano-futuro');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);

    // Terminado o diálogo, sair volta a funcionar.
    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });

  it('recusa sair com puzzle aberto, e libera depois de resolvido', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    j().clicarHotspot('tv');
    expect(j().puzzleAberto).toBe('montar');

    j().voltarAoMapa();

    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'sala-reunioes' });
    expect(j().puzzleAberto).toBe('montar');

    j().resolverPuzzle('montar');
    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });

  it('recusa sair durante a pausa do Bloco 4, e libera depois de concluída', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    j().clicarHotspot('tv');
    j().resolverPuzzle('montar');
    j().clicarHotspot('entrega');
    expect(j().pausaBloco4).toBe('rodando');

    j().voltarAoMapa();

    expect(j().tela).toEqual({ tipo: 'cena', lugarId: 'sala-reunioes' });
    expect(j().pausaBloco4).toBe('rodando');

    j().concluirPausaBloco4();
    j().voltarAoMapa();
    expect(j().tela).toEqual({ tipo: 'mapa' });
  });
});

describe('narração pendente não atravessa troca de tela', () => {
  /**
   * Narração pendente na entrada da revelação viraria um véu indismissível
   * sobre o clímax: a tela de revelação não tem como fechá-la.
   */
  it('a entrada na revelação limpa narração e mensagem de falha', () => {
    j().entrarNoBloco(5);
    j().entrarNoLugar('escritorio');
    // A abertura da cena deixa narração na tela.
    expect(j().narracao).toBe(seletores.cenaAtual(j())?.aberturaTexto);
    expect(j().narracao).not.toBeNull();

    // ...e um item em alvo errado deixa a mensagem de falha junto.
    j().selecionarItem('cartao-rafael');
    j().clicarHotspot('notebook');
    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);
    expect(j().dialogoAtivo).toBeNull();
    expect(j().narracao).not.toBeNull();

    // O diálogo do notebook termina em `irParaRevelacao`.
    conversar('notebook');

    expect(j().tela).toEqual({ tipo: 'revelacao' });
    expect(j().narracao).toBeNull();
    expect(j().mensagemFalha).toBeNull();
  });

  it('voltarAoMapa limpa narração e mensagem de falha', () => {
    j().entrarNoBloco(3);
    j().entrarNoLugar('laboratorio');
    expect(j().narracao).not.toBeNull();
    j().selecionarItem('certificado-degree');
    j().clicarHotspot('tiago');
    expect(j().mensagemFalha).toBe(MENSAGEM_GENERICA);

    j().voltarAoMapa();

    expect(j().tela).toEqual({ tipo: 'mapa' });
    expect(j().narracao).toBeNull();
    expect(j().mensagemFalha).toBeNull();
  });
});

describe('colisão de id de hotspot entre cenas', () => {
  /**
   * `hotspotsFeitos` é global e a store NUNCA a limpa na troca de bloco. Este é
   * o motivo pelo qual id repetido entre cenas é perigoso.
   */
  it('hotspotsFeitos sobrevive à troca de bloco', () => {
    jogarBloco1();
    expect(j().hotspotsFeitos).toContain('rafael');

    atravessarCartao(2);
    expect(j().hotspotsFeitos).toContain('rafael');

    j().entrarNoBloco(4);
    expect(j().hotspotsFeitos).toContain('rafael');
  });

  /**
   * Espelho do teste de `umaVezSo` em integridade: se um gate
   * `requerHotspotsFeitos` apontasse para um id que também existe numa cena
   * ANTERIOR, o gate nasceria pré-satisfeito. A porta abriria sem que o hotspot
   * deste bloco tivesse sido clicado — em silêncio, no palco, e o bloco
   * fecharia sem os efeitos daquele hotspot.
   */
  it('nenhum requerHotspotsFeitos aponta para um id que já existe em cena anterior', () => {
    const preSatisfeitos: string[] = [];
    CENAS.forEach((cena, i) => {
      const anteriores = new Set(
        CENAS.slice(0, i).flatMap((c) => c.hotspots.map((h) => h.id)),
      );
      for (const h of cena.hotspots) {
        for (const dep of h.requerHotspotsFeitos ?? []) {
          if (anteriores.has(dep)) {
            preSatisfeitos.push(`bloco ${cena.bloco} / ${cena.lugarId}: '${h.id}' → '${dep}'`);
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

  /** Prova de comportamento: o gate de fato responde a `hotspotsFeitos`. */
  it('um gate de requerHotspotsFeitos só abre depois do hotspot do próprio bloco', () => {
    j().entrarNoBloco(4);
    j().entrarNoLugar('sala-reunioes');
    j().fecharNarracao();
    expect(j().hotspotsFeitos).not.toContain('entrega');

    j().clicarHotspot('claudia');
    expect(j().dialogoAtivo).toBeNull();
    expect(j().narracao).toBe(hotspot('claudia').bloqueadoTexto);
    j().fecharNarracao();

    j().clicarHotspot('tv');
    j().resolverPuzzle('montar');
    j().clicarHotspot('entrega');
    j().concluirPausaBloco4();

    j().clicarHotspot('claudia');
    expect(j().dialogoAtivo?.dialogoId).toBe('b4-claudia');
  });
});

describe('sequência da revelação', () => {
  it('conexão não avança fora da tela de revelação', () => {
    j().entrarNoBloco(5);
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(0);

    j().entrarNoLugar('escritorio');
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(0);
  });

  it('as conexões avançam uma por disparo explícito e apenas na ordem declarada', () => {
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
    expect(seletores.conexoesFeitas(j())).toEqual([]);

    for (let i = 0; i < CONEXOES.length; i++) {
      j().dispararConexao();
      expect(j().revelacao.conexoesFeitas).toBe(i + 1);
      expect(seletores.conexoesFeitas(j())).toEqual(CONEXOES.slice(0, i + 1));
    }

    // Depois da última, disparo não faz nada.
    j().dispararConexao();
    expect(j().revelacao.conexoesFeitas).toBe(CONEXOES.length);
  });

  it('as três primeiras conexões apagam o item de origem, uma por vez', () => {
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
    const naBarraAntes = seletores.itensNaBarra(j()).length;
    expect(naBarraAntes).toBe(BLOCOS[5].estadoAssumido.itens.length);

    for (let i = 0; i < 3; i++) {
      const conexao = CONEXOES[i];
      expect(conexao?.consomeOrigem).toBe(true);
      const origem = conexao?.origem;
      if (origem?.tipo !== 'item') throw new Error(`conexão ${i} não sai de um item`);
      expect(j().itens[origem.itemId]).toBe('presente');

      j().dispararConexao();

      // A origem daquela conexão, e só ela, sai da barra.
      expect(j().itens[origem.itemId]).toBe('consumido');
      expect(seletores.itensNaBarra(j())).toHaveLength(naBarraAntes - (i + 1));
    }

    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');
    // O resto da barra continua lá: nenhuma conexão os toca.
    expect(itensPresentes()).toEqual([...ITENS_NUNCA_CONSUMIDOS].sort());
  });

  it('a quarta conexão sai da skill proatividade e não consome a origem', () => {
    const quarta = CONEXOES[CONEXOES.length - 1];
    expect(quarta?.origem).toEqual({ tipo: 'skill', skillId: 'proatividade' });
    expect(quarta?.consomeOrigem).toBe(false);

    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
    dispararTodasAsConexoes();

    expect(skillsNoPainel()).toContain('proatividade');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
  });

  it('esvaziarBarra não responde antes das quatro conexões', () => {
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
    j().dispararConexao();
    j().dispararConexao();
    j().dispararConexao();

    j().esvaziarBarra();

    expect(j().revelacao.barraSaiu).toBe(false);
  });

  it('a versão futura só entra depois de a barra sair', () => {
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
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
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
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

describe('estado assumido por bloco', () => {
  /**
   * NÃO afirma a tabela contra si mesma. O que importa do estado assumido do
   * Bloco 5 é a CONSEQUÊNCIA: a revelação inteira tem que ser executável a
   * partir dele, sem jogar nada antes. Se faltar um item de origem, a conexão
   * daquele item não tem o que apagar; se faltar a skill, a quarta não tem
   * motivo. Um item a menos na tabela é um ensaio do clímax que mente.
   */
  it('entrarNoBloco(5) entrega um estado do qual a revelação roda de ponta a ponta', () => {
    j().entrarNoBloco(5);
    expect(j().bloco).toBe(5);
    expect(j().lugares.escritorio).toBe('destravado');
    // Todo item de origem das conexões tem que estar na mão dela.
    for (const conexao of CONEXOES) {
      if (conexao.origem.tipo === 'item') {
        expect(j().itens[conexao.origem.itemId]).toBe('presente');
      } else {
        expect(skillsNoPainel()).toContain(conexao.origem.skillId);
      }
    }

    jogarBloco5AteRevelacao();

    // 1. As quatro conexões disparam, uma por clique, na ordem declarada.
    expect(CONEXOES).toHaveLength(4);
    for (let i = 0; i < CONEXOES.length; i++) {
      j().dispararConexao();
      expect(j().revelacao.conexoesFeitas).toBe(i + 1);
      expect(seletores.conexoesFeitas(j())).toEqual(CONEXOES.slice(0, i + 1));
    }

    // 2. As três primeiras gastaram os três itens tardios.
    for (const id of ITENS_TARDIOS) expect(j().itens[id]).toBe('consumido');

    // 3. A quarta sai do painel de skills e NÃO consome a origem.
    expect(CONEXOES[3]?.origem).toEqual({ tipo: 'skill', skillId: 'proatividade' });
    expect(CONEXOES[3]?.consomeOrigem).toBe(false);
    expect(skillsNoPainel()).toContain('proatividade');
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);

    // 4. A barra sai, a versão futura entra, e as três perguntas chegam ao fim.
    j().esvaziarBarra();
    expect(j().revelacao.barraSaiu).toBe(true);
    expect(seletores.itensNaBarra(j())).toEqual([]);
    j().mostrarVersaoFutura();
    expect(j().sprite).toBe('ana-futura');
    for (let i = 0; i < PERGUNTAS_FINAIS.length; i++) j().avancarPergunta();
    expect(seletores.perguntasVisiveis(j())).toEqual(PERGUNTAS_FINAIS);
    expect(seletores.terminou(j())).toBe(true);
    expect(j().tela).toEqual({ tipo: 'perguntas' });
  });

  it('a revelação é ensaiável isoladamente, sem jogar os blocos anteriores', () => {
    j().entrarNoBloco(5);
    jogarBloco5AteRevelacao();
    dispararTodasAsConexoes();
    j().esvaziarBarra();
    j().mostrarVersaoFutura();
    for (let i = 0; i < PERGUNTAS_FINAIS.length; i++) j().avancarPergunta();

    expect(seletores.terminou(j())).toBe(true);
    expect(seletores.itensNaBarra(j())).toEqual([]);
    expect(skillsNoPainel()).toHaveLength(TOTAL_SKILLS);
  });

  it('cada bloco assume um estado que a store reproduz e que tem cena própria pra jogar', () => {
    for (const bloco of [1, 2, 3, 4, 5] as BlocoId[]) {
      j().reiniciar();
      j().entrarNoBloco(bloco);

      const assumido = BLOCOS[bloco].estadoAssumido;
      expect(itensPresentes()).toEqual([...assumido.itens].sort());
      expect(skillsNoPainel()).toEqual([...assumido.skills]);
      for (const id of assumido.lugaresDestravados) expect(j().lugares[id]).toBe('destravado');
      for (const id of assumido.lugaresConcluidos) expect(j().lugares[id]).toBe('concluido');

      // Pelo menos um lugar destravado tem cena DESTE bloco: é o que torna o
      // bloco ensaiável isoladamente.
      let temCenaPropria = false;
      for (const id of assumido.lugaresDestravados) {
        j().entrarNoLugar(id);
        if (seletores.cenaAtual(j())?.bloco === bloco) temCenaPropria = true;
      }
      expect(temCenaPropria).toBe(true);
    }
  });
});
