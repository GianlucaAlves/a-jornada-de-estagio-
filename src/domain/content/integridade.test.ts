/**
 * INTEGRIDADE DO GRAFO DE CONTEÚDO — dirigida pelos dados, não por lista fixa.
 *
 * Boa parte das referências já é garantida em COMPILAÇÃO (ids são uniões de
 * literais). O que sobra, e é o que está aqui, são as referências que o
 * compilador não alcança:
 *
 * - `DialogoId` e `HotspotId` são `string`: um id trocado por engano compila.
 * - Coerência entre partes (gabarito × colunas, gate × hotspot da mesma cena).
 * - Alcançabilidade: um item ou skill que nenhum Efeito concede compila, e só
 *   aparece como buraco no palco.
 * - Invariantes da store que o conteúdo precisa respeitar (p. ex.
 *   `hotspotsFeitos` é global e nunca é limpo entre fases).
 * - VOCABULÁRIO: o expurgo de tecnologia (ADR-002) é uma regra sobre TEXTO, e
 *   texto não tem tipo. Sem teste, ele volta na primeira reescrita.
 *
 * Nada aqui renderiza nada nem toca a store: é leitura do próprio conteúdo.
 */
import chaoJson from '../../../docs/arte/chao.json';
import type {
  BlocoId,
  Dialogo,
  DialogoId,
  Efeito,
  LugarId,
  NpcId,
  PuzzleId,
} from '../types';
import { MANIFEST, assetDaArteDeHotspot, caminhoDoAsset } from '../../assets/manifest';

import {
  BLOCOS,
  CARTOES,
  CENAS,
  CONEXOES,
  DIALOGOS,
  ITENS,
  LUGARES,
  MENSAGEM_GENERICA,
  NPCS,
  PERGUNTAS_FINAIS,
  PUZZLES,
  SKILLS,
} from './index';

// ------------------------------------------------------------------ apoio

/** As seis fases, derivadas de BLOCOS: acrescentar fase não exige editar aqui. */
const TODOS_BLOCOS: readonly BlocoId[] = Object.keys(BLOCOS)
  .map(Number)
  .sort((a, b) => a - b) as BlocoId[];

/** Os cinco lugares, afirmados por literal — ver o teste que usa isto. */
const LUGARES_ESPERADOS: readonly LugarId[] = [
  'escritorio',
  'cafezinho',
  'linha-producao',
  'sala-reunioes',
  'outra-area',
];

/**
 * PENDÊNCIA DECLARADA: lugares que existem no contrato e ainda não têm cena.
 *
 * A LISTA ESTÁ VAZIA, e é aqui que isso fica registrado. Ela guardou
 * `linha-producao` e `outra-area` enquanto os dois eram cenários NOVOS (ADR-009,
 * ADR-031) cuja arte vinha de outra frente: sem mapa de piso em
 * `docs/arte/chao.json`, nenhuma cena podia acontecer lá, porque
 * `Cena.chao.test.ts` reprova figura em lugar sem piso mapeado e uma suíte
 * vermelha bloquearia as frentes que dependiam desta. Os dois têm cenário, mapa
 * de piso e cena agora — a fase 3 abre na Linha de Produção e a fase 5 mora em
 * Outra Área.
 *
 * A lista tinha de ENCOLHER, nunca crescer, e os testes abaixo cobram as duas
 * direções: nada de pôr aqui um lugar que já tem cena, e nada de lugar sem cena
 * fora daqui. Com ela vazia, o segundo teste passa a exigir que TODOS os cinco
 * lugares tenham cena — o que é o estado final desejado, e o que faz qualquer
 * regressão futura (um lugar que perca a cena) falhar de imediato em vez de
 * virar pendência silenciosa.
 *
 * Mantida como constante, e não apagada, de propósito: o lugar novo da próxima
 * versão nasce igual — id declarado antes da arte — e esta é a porta pela qual
 * ele passa sem deixar a suíte vermelha para todo mundo.
 */
const LUGARES_SEM_CENA_AINDA: readonly LugarId[] = [];

/** Mapa de piso gerado por `scripts/exportar_chao.py`. Chave = lugar. */
const CHAO = chaoJson as { cenas: Record<string, unknown> };

type TipoRef = 'dialogo' | 'item' | 'skill' | 'lugar' | 'puzzle';

interface Referencia {
  /** Descrição legível da origem, para a mensagem de falha. */
  onde: string;
  tipo: TipoRef;
  id: string;
}

const EXISTE: Record<TipoRef, (id: string) => boolean> = {
  dialogo: (id) => Object.prototype.hasOwnProperty.call(DIALOGOS, id),
  item: (id) => Object.prototype.hasOwnProperty.call(ITENS, id),
  skill: (id) => Object.prototype.hasOwnProperty.call(SKILLS, id),
  lugar: (id) => Object.prototype.hasOwnProperty.call(LUGARES, id),
  puzzle: (id) => Object.prototype.hasOwnProperty.call(PUZZLES, id),
};

function referenciasDeEfeitos(onde: string, efeitos: readonly Efeito[]): Referencia[] {
  const refs: Referencia[] = [];
  for (const e of efeitos) {
    switch (e.tipo) {
      case 'dialogo':
        refs.push({ onde, tipo: 'dialogo', id: e.dialogoId });
        break;
      case 'abrirPuzzle':
        refs.push({ onde, tipo: 'puzzle', id: e.puzzleId });
        break;
      case 'concederItem':
      case 'consumirItem':
        refs.push({ onde, tipo: 'item', id: e.itemId });
        break;
      case 'concederSkill':
        refs.push({ onde, tipo: 'skill', id: e.skillId });
        break;
      case 'destravarLugar':
      case 'concluirLugar':
        refs.push({ onde, tipo: 'lugar', id: e.lugarId });
        break;
      default:
        break;
    }
  }
  return refs;
}

function nomeDaCena(indice: number): string {
  const cena = CENAS[indice];
  return cena ? `cena ${cena.lugarId}/B${cena.bloco}` : `cena #${indice}`;
}

/** Toda referência por id declarada em cena (hotspot + efeitos) ou em diálogo. */
const REFERENCIAS: Referencia[] = (() => {
  const refs: Referencia[] = [];
  CENAS.forEach((cena, i) => {
    refs.push({ onde: nomeDaCena(i), tipo: 'lugar', id: cena.lugarId });
    for (const h of cena.hotspots) {
      const onde = `${nomeDaCena(i)} hotspot '${h.id}'`;
      refs.push(...referenciasDeEfeitos(onde, h.efeitos));
      refs.push(...referenciasDeEfeitos(`${onde} (uso de item)`, h.efeitosComItem ?? []));
      if (h.requerItemPresente) {
        refs.push({ onde: `${onde}.requerItemPresente`, tipo: 'item', id: h.requerItemPresente });
      }
      if (h.aceitaItem) {
        refs.push({ onde: `${onde}.aceitaItem`, tipo: 'item', id: h.aceitaItem });
      }
      if (h.requerPuzzleResolvido) {
        refs.push({
          onde: `${onde}.requerPuzzleResolvido`,
          tipo: 'puzzle',
          id: h.requerPuzzleResolvido,
        });
      }
    }
  });
  for (const [id, dialogo] of Object.entries(DIALOGOS)) {
    refs.push(...referenciasDeEfeitos(`diálogo '${id}'`, dialogo.efeitos ?? []));
  }
  for (const [id, puzzle] of Object.entries(PUZZLES)) {
    refs.push(...referenciasDeEfeitos(`puzzle '${id}'`, puzzle.efeitosSucesso ?? []));
  }
  for (const c of CONEXOES) {
    refs.push({ onde: `conexão via '${c.viaLugar}'`, tipo: 'lugar', id: c.viaLugar });
  }
  for (const [chave, bloco] of Object.entries(BLOCOS)) {
    const a = bloco.estadoAssumido;
    for (const id of a.lugaresDestravados) {
      refs.push({ onde: `B${chave}.lugaresDestravados`, tipo: 'lugar', id });
    }
    for (const id of a.lugaresConcluidos) {
      refs.push({ onde: `B${chave}.lugaresConcluidos`, tipo: 'lugar', id });
    }
  }
  return refs;
})();

function referenciasQuebradas(tipo: TipoRef): string[] {
  return REFERENCIAS.filter((r) => r.tipo === tipo && !EXISTE[tipo](r.id)).map(
    (r) => `${r.onde} → ${r.tipo} '${r.id}'`,
  );
}

/** Diálogos atingíveis a partir de uma cena, por fechamento transitivo. */
const DIALOGOS_ALCANCAVEIS: ReadonlySet<DialogoId> = (() => {
  const vistos = new Set<DialogoId>();
  const fila: DialogoId[] = [];
  for (const cena of CENAS) {
    for (const h of cena.hotspots) {
      for (const e of [...h.efeitos, ...(h.efeitosComItem ?? [])]) {
        if (e.tipo === 'dialogo') fila.push(e.dialogoId);
        if (e.tipo === 'abrirPuzzle') {
          for (const efeitoDoPuzzle of PUZZLES[e.puzzleId].efeitosSucesso ?? []) {
            if (efeitoDoPuzzle.tipo === 'dialogo') fila.push(efeitoDoPuzzle.dialogoId);
          }
        }
      }
    }
  }
  while (fila.length > 0) {
    const id = fila.pop();
    if (id === undefined || vistos.has(id)) continue;
    vistos.add(id);
    for (const e of DIALOGOS[id]?.efeitos ?? []) {
      if (e.tipo === 'dialogo') fila.push(e.dialogoId);
    }
  }
  return vistos;
})();

/** Todo Efeito que o jogo consegue de fato disparar. */
const EFEITOS_ALCANCAVEIS: readonly Efeito[] = (() => {
  const acc: Efeito[] = [];
  for (const cena of CENAS) {
    for (const h of cena.hotspots) acc.push(...h.efeitos, ...(h.efeitosComItem ?? []));
  }
  for (const id of DIALOGOS_ALCANCAVEIS) acc.push(...(DIALOGOS[id]?.efeitos ?? []));
  for (const efeito of [...acc]) {
    if (efeito.tipo === 'abrirPuzzle') acc.push(...(PUZZLES[efeito.puzzleId].efeitosSucesso ?? []));
  }
  return acc;
})();

/**
 * Diálogos consumidos diretamente por uma TELA, não por hotspot. Exceção
 * declarada: se a lista crescer sem motivo, é sinal de diálogo órfão.
 */
const DIALOGOS_DE_TELA: readonly DialogoId[] = ['b6-fecho'];

// ------------------------------------------------- limites da forma do diálogo

/**
 * Teto de nós por diálogo. O NPC PLANTA, o apresentador DESENVOLVE: diálogo
 * longo rouba o tempo de fala de quem está no palco e obriga o apresentador a
 * esperar cliques em silêncio. Seis era o tamanho do maior diálogo da versão
 * anterior, e continua sendo o teto para as frentes de conteúdo.
 */
const MAX_NOS_POR_DIALOGO = 7;

/**
 * Teto de caracteres por fala.
 *
 * Medido, não escolhido no ar: a maior fala da versão anterior que motivou a
 * reescrita tinha 245 caracteres e era parede de texto; a maior do conteúdo
 * reescrito tinha 136. O teto de 180 aceita a escrita boa com folga e continua
 * reprovando a volta da parede.
 */
const MAX_CARACTERES_POR_FALA = 180;

/** Quantos nós existem no total. Usado só para impedir teste vácuo. */
const TOTAL_DE_NOS = Object.values(DIALOGOS).reduce((n, d) => n + d.nos.length, 0);

/**
 * Falas que a apresentação inteira depende de ouvir. Não são "falas bonitas":
 * cada uma é setup de algo que acontece depois, em outro arquivo.
 *
 * A lista ENCURTOU na v2, e isso é declarado, não esquecido: as frases das fases
 * 1 a 4 viviam em diálogos que hoje são esqueletos. Quem escrever o conteúdo
 * daquelas fases acrescenta as suas AQUI — a lista é o contrato de que uma
 * reescrita futura não apaga em silêncio o setup de um beat que está em outro
 * arquivo.
 */
const FRASES_ASSINATURA: readonly string[] = [
  // Setup das TRÊS conexões de item do clímax: sem ela, três linhas se acendem
  // no mapa sem pergunta que as peça.
  'Seu nome apareceu em três lugares diferentes na conversa de ontem.',
  // Última fala da apresentação.
  'O que me trouxe até aqui?',
];

/**
 * VOCABULÁRIO BANIDO (ADR-002).
 *
 * A Ana é de apoio a projetos, e a apresentação é sobre SER ESTAGIÁRIO — as
 * atitudes que dão sucesso em qualquer área. Todo termo de nicho sai, porque
 * plateia mista perde o chão na primeira sigla e nunca mais volta.
 *
 * `Data & Transformation` é frase e casa por substring; o resto casa por TOKEN
 * isolado, senão 'log' reprovaria 'diálogo' e 'catálogo'.
 */
const TERMOS_BANIDOS_FRASE: readonly string[] = ['Data & Transformation'];
const TERMOS_BANIDOS_TOKEN: readonly string[] = ['DT7', 'log', 'logs', 'retry', 'timeout', 'Git', 'API'];

/**
 * A ÚNICA EXCEÇÃO AO EXPURGO, e ela é declarada (ADR-027).
 *
 * A Bianca é formada em Letras e trabalha com tecnologia. Essa é a frase mais
 * anti-nicho que este projeto pode dizer, e ela DEPENDE do contraste entre as
 * duas áreas: tirar a tecnologia da boca dela mataria exatamente o argumento de
 * que dá para pivotar. O ADR-002 tira tecnologia do domínio da Ana; aqui ela
 * permanece de propósito, como destino de outra pessoa.
 *
 * A exceção vale para as FALAS dela, não para o cargo nem para narração: legenda
 * de rodapé com jargão devolveria o nicho pela porta de trás.
 */
const LOCUTOR_ISENTO_DO_EXPURGO: NpcId = 'bianca';

/**
 * Fala sem direção de cena e com espaços normalizados. "(pausa)" e
 * "(dá de ombros)" são marcação para quem lê a linha em voz alta, não parte da
 * frase — então mexer na direção não pode reprovar a frase-assinatura.
 */
function semDirecaoDeCena(texto: string): string {
  return texto.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
}

// ----------------------------------------------------- travessia por bloco

/**
 * Tudo o que uma fase alcança a partir das próprias cenas: os diálogos que os
 * hotspots dela disparam (fechamento transitivo) e os efeitos de ambos.
 *
 * Derivado das cenas, não de lista fixa: acrescentar cena ou hotspot numa fase
 * entra aqui sozinho.
 */
function alcancavelDoBloco(bloco: BlocoId): { dialogos: Dialogo[]; efeitos: Efeito[] } {
  const efeitos: Efeito[] = [];
  const fila: DialogoId[] = [];
  for (const cena of CENAS) {
    if (cena.bloco !== bloco) continue;
    for (const h of cena.hotspots) efeitos.push(...h.efeitos, ...(h.efeitosComItem ?? []));
  }
  for (const e of [...efeitos]) {
    if (e.tipo === 'abrirPuzzle') efeitos.push(...(PUZZLES[e.puzzleId].efeitosSucesso ?? []));
  }
  for (const e of efeitos) if (e.tipo === 'dialogo') fila.push(e.dialogoId);
  const vistos = new Set<DialogoId>();
  while (fila.length > 0) {
    const id = fila.pop();
    if (id === undefined || vistos.has(id)) continue;
    vistos.add(id);
    const doDialogo = DIALOGOS[id]?.efeitos ?? [];
    efeitos.push(...doDialogo);
    for (const e of doDialogo) if (e.tipo === 'dialogo') fila.push(e.dialogoId);
  }
  const dialogos = [...vistos].flatMap((id) => (DIALOGOS[id] ? [DIALOGOS[id]] : []));
  return { dialogos, efeitos };
}

/**
 * TODO texto que a plateia pode ler dentro de uma fase: fala, narração, abertura,
 * eco, rótulo e texto de bloqueio.
 *
 * A pista de um puzzle precisa estar em ALGUM desses, não necessariamente numa
 * fala: nos esqueletos as pistas da senha vivem na narração de abertura, e no
 * conteúdo final elas passam para a boca dos NPCs. Cobrar "fala" fecharia a
 * porta para o estado intermediário e deixaria o teste vácuo justamente enquanto
 * ele é mais necessário.
 */
function textosDaFase(bloco: BlocoId): string[] {
  const textos: string[] = [];
  for (const cena of CENAS) {
    if (cena.bloco !== bloco) continue;
    if (cena.aberturaTexto) textos.push(cena.aberturaTexto);
    textos.push(cena.ecoTexto);
    for (const h of cena.hotspots) {
      textos.push(h.rotulo);
      if (h.bloqueadoTexto) textos.push(h.bloqueadoTexto);
      for (const e of [...h.efeitos, ...(h.efeitosComItem ?? [])]) {
        if (e.tipo === 'narrar') textos.push(e.texto);
      }
    }
  }
  for (const d of alcancavelDoBloco(bloco).dialogos) {
    for (const no of d.nos) textos.push(no.texto);
  }
  return textos;
}

/** Em qual fase este puzzle é aberto. Derivado dos efeitos, não declarado. */
function blocoQueAbre(puzzleId: PuzzleId): BlocoId {
  for (const bloco of TODOS_BLOCOS) {
    const abre = alcancavelDoBloco(bloco).efeitos.some(
      (e) => e.tipo === 'abrirPuzzle' && e.puzzleId === puzzleId,
    );
    if (abre) return bloco;
  }
  throw new Error(`nenhuma fase abre o puzzle '${puzzleId}'`);
}

/**
 * O texto contém este trecho como token isolado? Usado para pista de senha e
 * para vocabulário banido: `'12'` não pode passar por casar dentro de `'2012'`,
 * e `'log'` não pode reprovar `'diálogo'`.
 */
function contemToken(texto: string, token: string, ignorarCaixa = false): boolean {
  const escapado = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flags = ignorarCaixa ? 'i' : '';
  return new RegExp(`(^|[^0-9A-Za-zÀ-ÿ])${escapado}([^0-9A-Za-zÀ-ÿ]|$)`, flags).test(texto);
}

/**
 * Todo texto do conteúdo, com origem e locutor. A origem entra na mensagem de
 * falha porque "há jargão em algum lugar" não é acionável.
 */
interface TextoDoConteudo {
  onde: string;
  texto: string;
  locutor?: string;
}

const TODOS_OS_TEXTOS: readonly TextoDoConteudo[] = (() => {
  const t: TextoDoConteudo[] = [];
  CENAS.forEach((cena, i) => {
    const nome = nomeDaCena(i);
    if (cena.aberturaTexto) t.push({ onde: `${nome}.aberturaTexto`, texto: cena.aberturaTexto });
    t.push({ onde: `${nome}.ecoTexto`, texto: cena.ecoTexto });
    for (const h of cena.hotspots) {
      t.push({ onde: `${nome} '${h.id}'.rotulo`, texto: h.rotulo });
      if (h.bloqueadoTexto) {
        t.push({ onde: `${nome} '${h.id}'.bloqueadoTexto`, texto: h.bloqueadoTexto });
      }
      for (const e of [...h.efeitos, ...(h.efeitosComItem ?? [])]) {
        if (e.tipo === 'narrar') t.push({ onde: `${nome} '${h.id}' narrar`, texto: e.texto });
      }
    }
  });
  for (const [id, d] of Object.entries(DIALOGOS)) {
    d.nos.forEach((no, i) => {
      t.push({ onde: `diálogo '${id}' nó ${i}`, texto: no.texto, locutor: no.quem });
    });
  }
  for (const item of Object.values(ITENS)) {
    t.push({ onde: `item '${item.id}'.nome`, texto: item.nome });
    t.push({ onde: `item '${item.id}'.descricao`, texto: item.descricao });
  }
  for (const skill of Object.values(SKILLS)) {
    t.push({ onde: `skill '${skill.id}'.nome`, texto: skill.nome });
    t.push({ onde: `skill '${skill.id}'.texto`, texto: skill.texto });
  }
  for (const lugar of Object.values(LUGARES)) {
    t.push({ onde: `lugar '${lugar.id}'.nome`, texto: lugar.nome });
  }
  for (const perfil of Object.values(NPCS)) {
    t.push({ onde: `npc '${perfil.id}'.nome`, texto: perfil.nome });
    t.push({ onde: `npc '${perfil.id}'.cargo`, texto: perfil.cargo });
  }
  for (const def of Object.values(PUZZLES)) {
    t.push({ onde: `puzzle '${def.id}'.rotulo`, texto: def.rotulo });
    t.push({ onde: `puzzle '${def.id}'.instrucao`, texto: def.instrucao });
    t.push({ onde: `puzzle '${def.id}'.textoErro`, texto: def.textoErro });
    switch (def.tipo) {
      case 'senha':
        for (const c of def.campos) t.push({ onde: `senha '${c.id}'.rotulo`, texto: c.rotulo });
        break;
      case 'associar':
        for (const l of [...def.esquerda, ...def.direita]) {
          t.push({ onde: `associar '${l.id}'`, texto: l.texto });
        }
        break;
      case 'estruturar':
        for (const c of def.campos) t.push({ onde: `estruturar campo '${c.id}'`, texto: c.rotulo });
        for (const f of def.fragmentos) {
          t.push({ onde: `estruturar '${f.id}'`, texto: f.texto });
        }
        t.push({ onde: 'estruturar.textoDistrator', texto: def.textoDistrator });
        break;
      case 'montar':
        for (const c of def.campos) t.push({ onde: `montar campo '${c.id}'`, texto: c.rotulo });
        for (const p of def.pecas) t.push({ onde: `montar '${p.id}'`, texto: p.texto });
        break;
    }
  }
  for (const c of CONEXOES) t.push({ onde: `conexão via '${c.viaLugar}'`, texto: c.texto });
  for (const [chave, b] of Object.entries(BLOCOS)) {
    t.push({ onde: `B${chave}.titulo`, texto: b.titulo });
    t.push({ onde: `B${chave}.fechoTexto`, texto: b.fechoTexto });
  }
  for (const c of CARTOES) {
    t.push({ onde: `cartão B${c.bloco}.tempo`, texto: c.tempo });
    t.push({ onde: `cartão B${c.bloco}.titulo`, texto: c.titulo });
    if (c.apresentador) {
      t.push({ onde: `cartão B${c.bloco}.apresentador`, texto: c.apresentador });
    }
  }
  t.push({ onde: 'MENSAGEM_GENERICA', texto: MENSAGEM_GENERICA });
  PERGUNTAS_FINAIS.forEach((p, i) => t.push({ onde: `PERGUNTAS_FINAIS[${i}]`, texto: p }));
  return t;
})();

// ------------------------------------------------------------ referências

describe('referências por id', () => {
  it('todo dialogoId referenciado por um Efeito existe em DIALOGOS', () => {
    expect(referenciasQuebradas('dialogo')).toEqual([]);
  });

  it('todo itemId referenciado por Efeito ou Hotspot existe em ITENS', () => {
    expect(referenciasQuebradas('item')).toEqual([]);
  });

  it('todo skillId referenciado por um Efeito existe em SKILLS', () => {
    expect(referenciasQuebradas('skill')).toEqual([]);
  });

  /**
   * Cobre cena, efeito, conexão e estado assumido de fase. `LugarId` é união de
   * literais, então o compilador já pega quase tudo — o que este teste pega é o
   * que sobra quando alguém remove um lugar de LUGARES mantendo o tipo, ou o
   * contrário.
   */
  it('todo lugarId referenciado por Efeito, Cena, Conexão ou Bloco existe em LUGARES', () => {
    expect(referenciasQuebradas('lugar')).toEqual([]);
  });

  it('todo puzzleId referenciado por Efeito ou Hotspot existe em PUZZLES', () => {
    expect(referenciasQuebradas('puzzle')).toEqual([]);
  });

  it('as referências foram de fato coletadas (o teste não passa por lista vazia)', () => {
    for (const tipo of ['dialogo', 'item', 'skill', 'lugar', 'puzzle'] as TipoRef[]) {
      expect(REFERENCIAS.filter((r) => r.tipo === tipo).length).toBeGreaterThan(0);
    }
  });
});

// ------------------------------------------------------------------- lugares

describe('os cinco lugares', () => {
  /**
   * A contagem é afirmada por LITERAL de propósito.
   *
   * `Record<LugarId, Lugar>` já obriga a completude em compilação, mas o teste
   * existe porque o conjunto de lugares é o contrato de cinco frentes ao mesmo
   * tempo: arte, chão, mapa, conteúdo e clímax. Remover um lugar aqui tem de
   * quebrar algo que RODA, não só algo que compila — quem mexe em conteúdo roda
   * a suíte muito mais vezes do que roda o typecheck.
   */
  it('LUGARES declara exatamente os cinco lugares da v2', () => {
    expect((Object.keys(LUGARES) as LugarId[]).sort()).toEqual([...LUGARES_ESPERADOS].sort());
    expect(Object.keys(LUGARES)).toHaveLength(5);
  });

  it('os lugares que morreram na v2 não voltaram por nenhuma porta', () => {
    const mortos = ['sala-treinamento', 'laboratorio', 'innovation'];
    const vivos = Object.keys(LUGARES);
    for (const morto of mortos) expect(vivos).not.toContain(morto);
    // E nenhuma referência de conteúdo os cita: o compilador pegaria, mas o
    // nome pode reaparecer como texto de cenário em `assetId`, que é `string`.
    const emAssets = CENAS.flatMap((c) => c.hotspots)
      .filter((h) => h.arte.tipo === 'objeto')
      .map((h) => (h.arte.tipo === 'objeto' ? h.arte.assetId : ''))
      .filter((id) => mortos.some((m) => id.includes(m)));
    expect(emAssets).toEqual([]);
  });

  it('a chave de LUGARES é igual ao id, e todo lugar tem nome', () => {
    for (const [id, lugar] of Object.entries(LUGARES)) {
      expect(lugar.id, `lugar '${id}'`).toBe(id);
      expect(lugar.nome.trim(), `lugar '${id}'`).not.toBe('');
    }
  });

  /**
   * A JUNTA onde os bugs moram: cenário × coordenada.
   *
   * O defeito mais caro deste projeto foram 21 figuras em pé SOBRE o mobiliário,
   * e ele vivia na junta — o cenário nunca viu as coordenadas e os testes de
   * geometria nunca viram o cenário. `Cena.chao.test.ts` fechou metade da junta.
   * Esta é a outra metade, um passo antes: cena em lugar cujo piso NEM FOI
   * MAPEADO não pode ser validada por ninguém, e hoje reprova lá com uma
   * mensagem que não explica a causa. Aqui a causa fica dita.
   */
  it('nenhuma cena acontece em lugar sem mapa de piso', () => {
    const semPiso = CENAS.filter(
      (c) => !Object.prototype.hasOwnProperty.call(CHAO.cenas, c.lugarId),
    ).map((c) => `${c.lugarId}/B${c.bloco}`);
    expect(semPiso).toEqual([]);
  });

  it('todo lugar sem cena está na lista de pendências declarada', () => {
    const semCena = (Object.keys(LUGARES) as LugarId[]).filter(
      (id) => !CENAS.some((c) => c.lugarId === id),
    );
    expect(semCena.sort()).toEqual([...LUGARES_SEM_CENA_AINDA].sort());
  });

  it('a lista de pendências não guarda lugar que já tem cena', () => {
    const jaTem = LUGARES_SEM_CENA_AINDA.filter((id) => CENAS.some((c) => c.lugarId === id));
    expect(jaTem).toEqual([]);
  });

  it('todo lugar COM cena tem hotspot e ecoTexto em todas as cenas dele', () => {
    for (const id of Object.keys(LUGARES) as LugarId[]) {
      const cenas = CENAS.filter((c) => c.lugarId === id);
      if (LUGARES_SEM_CENA_AINDA.includes(id)) continue;
      expect(cenas.length, `lugar '${id}' não tem cena`).toBeGreaterThan(0);
      for (const cena of cenas) {
        expect(cena.hotspots.length, `cena '${id}'/B${cena.bloco} sem hotspot`).toBeGreaterThan(0);
        expect(cena.ecoTexto.trim(), `cena '${id}'/B${cena.bloco} sem ecoTexto`).not.toBe('');
      }
    }
  });

  it('todo lugar com cena é alcançável: começa destravado ou é destravado por um Efeito', () => {
    const destravados = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'destravarLugar' ? [e.lugarId] : [])),
    );
    // O Escritório é o único que a store já entrega destravado no estado inicial.
    destravados.add('escritorio');
    // E o que uma fase entrega destravado no `estadoAssumido` também conta: é
    // assim que o Cafezinho volta a abrir para a festa da fase 6.
    for (const bloco of Object.values(BLOCOS)) {
      for (const id of bloco.estadoAssumido.lugaresDestravados) destravados.add(id);
    }
    for (const id of Object.keys(LUGARES) as LugarId[]) {
      if (LUGARES_SEM_CENA_AINDA.includes(id)) continue;
      expect([...destravados], `lugar '${id}' nunca é destravado`).toContain(id);
    }
  });

  it('todo lugar concluído por um Efeito foi antes destravado por outro', () => {
    const destravados = new Set<string>(['escritorio']);
    for (const e of EFEITOS_ALCANCAVEIS) {
      if (e.tipo === 'destravarLugar') destravados.add(e.lugarId);
    }
    for (const bloco of Object.values(BLOCOS)) {
      for (const id of bloco.estadoAssumido.lugaresDestravados) destravados.add(id);
    }
    const concluidos = EFEITOS_ALCANCAVEIS.flatMap((e) =>
      e.tipo === 'concluirLugar' ? [e.lugarId] : [],
    );
    for (const id of concluidos) {
      expect([...destravados], `lugar '${id}' é concluído sem nunca ser destravado`).toContain(id);
    }
  });
});

// ---------------------------------------------------------------------- elenco

describe('perfis de NPC', () => {
  /**
   * CARGO JUNTO DO NOME, sempre (ADR-006, ADR-015).
   *
   * A plateia tem vinte minutos e não pode gastar dois deduzindo quem é a
   * Cláudia. Cargo vazio é a falha silenciosa: a legenda renderiza o nome
   * sozinho, ninguém nota no ensaio, e ao vivo a fala perde o peso porque nada
   * diz por que aquela pessoa importa.
   */
  it('os cinco NPCs têm nome e cargo preenchidos', () => {
    expect(Object.keys(NPCS)).toHaveLength(5);
    for (const [id, perfil] of Object.entries(NPCS)) {
      expect(perfil.id, `npc '${id}'`).toBe(id);
      expect(perfil.nome.trim(), `npc '${id}' sem nome`).not.toBe('');
      expect(perfil.cargo.trim(), `npc '${id}' sem cargo`).not.toBe('');
    }
  });

  it('todo NPC usado como arte de hotspot tem perfil com cargo não vazio', () => {
    const problemas: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        if (h.arte.tipo !== 'npc') continue;
        const perfil = NPCS[h.arte.npcId];
        const onde = `${nomeDaCena(i)} '${h.id}' → npc '${h.arte.npcId}'`;
        if (!perfil) problemas.push(`${onde}: sem perfil em NPCS`);
        else if (perfil.cargo.trim() === '') problemas.push(`${onde}: cargo vazio`);
      }
    });
    expect(problemas).toEqual([]);
    // Não passa por vacuidade: há NPC em cena.
    const comNpc = CENAS.flatMap((c) => c.hotspots).filter((h) => h.arte.tipo === 'npc');
    expect(comNpc.length).toBeGreaterThan(0);
  });

  it('todo locutor de fala que é NPC tem perfil, e todo dono de pista de senha também', () => {
    const problemas: string[] = [];
    for (const [id, d] of Object.entries(DIALOGOS)) {
      d.nos.forEach((no, i) => {
        const quem = no.quem;
        // Comparações diretas para o compilador estreitar `Locutor` até `NpcId`:
        // narrador e sistema não são pessoas, e a Ana não é NPC.
        if (
          quem === 'ana' ||
          quem === 'ana-futura' ||
          quem === 'narrador' ||
          quem === 'sistema'
        ) {
          return;
        }
        if (!NPCS[quem]) problemas.push(`'${id}' nó ${i}: locutor '${quem}' sem perfil`);
      });
    }
    const senha = PUZZLES.senha;
    if (senha.tipo === 'senha') {
      for (const campo of senha.campos) {
        if (!NPCS[campo.npcId]) problemas.push(`senha '${campo.id}': npc sem perfil`);
      }
    }
    expect(problemas).toEqual([]);
  });

  it('nenhum nome de NPC colide com o nome de um apresentador', () => {
    const apresentadores = CARTOES.flatMap((c) => (c.apresentador ? [c.apresentador] : []));
    const nomes = Object.values(NPCS).map((p) => p.nome);
    const colisoes = nomes.filter((n) => apresentadores.includes(n));
    expect(colisoes).toEqual([]);
    expect(apresentadores.length).toBeGreaterThan(0);
  });
});

// ------------------------------------------------------------------ hotspots

describe('hotspots', () => {
  it('os ids de hotspot são únicos dentro de cada cena', () => {
    const duplicados: string[] = [];
    CENAS.forEach((cena, i) => {
      const vistos = new Set<string>();
      for (const h of cena.hotspots) {
        if (vistos.has(h.id)) duplicados.push(`${nomeDaCena(i)} → '${h.id}'`);
        vistos.add(h.id);
      }
    });
    expect(duplicados).toEqual([]);
  });

  it('todo requerHotspotsFeitos aponta para hotspot da mesma fase', () => {
    const quebrados: string[] = [];
    CENAS.forEach((cena, i) => {
      const ids = new Set(CENAS.filter((outra) => outra.bloco === cena.bloco).flatMap((outra) => outra.hotspots.map((h) => h.id)));
      for (const h of cena.hotspots) {
        for (const dep of h.requerHotspotsFeitos ?? []) {
          if (!ids.has(dep)) quebrados.push(`${nomeDaCena(i)} '${h.id}' → '${dep}'`);
          if (dep === h.id) quebrados.push(`${nomeDaCena(i)} '${h.id}' depende de si mesmo`);
        }
      }
    });
    expect(quebrados).toEqual([]);
  });

  /**
   * `hotspotsFeitos` é uma lista global que a store NUNCA limpa na troca de
   * fase: um id `umaVezSo` já usado numa cena anterior nasce como clique morto.
   */
  it('nenhum hotspot umaVezSo reusa um id já presente numa cena anterior', () => {
    const mortos: string[] = [];
    CENAS.forEach((cena, i) => {
      const anteriores = new Set(CENAS.slice(0, i).flatMap((c) => c.hotspots.map((h) => h.id)));
      for (const h of cena.hotspots) {
        if (h.umaVezSo && anteriores.has(h.id)) {
          mortos.push(`${nomeDaCena(i)} '${h.id}' (umaVezSo sobre id já acionável antes)`);
        }
      }
    });
    expect(mortos).toEqual([]);
  });

  /**
   * DIÁLOGO TEM DE PODER SER RELIDO (ADR-016).
   *
   * Hotspot de diálogo marcado `umaVezSo` é exatamente o que impede a releitura:
   * o clique seguinte cai no ramo silencioso e a fala perdida fica perdida para
   * sempre. O caso grave é a senha — as pistas só existem no que as pessoas
   * dizem, e com o jogo no ar não há apresentador para relembrar.
   *
   * É seguro não marcar porque a store aplica `Dialogo.efeitos` só na PRIMEIRA
   * conclusão: reler repete a FALA, não o efeito. Sem essa garantia na store,
   * este teste seria um convite a ressuscitar item já consumido.
   */
  it('nenhum hotspot que dispara diálogo é umaVezSo', () => {
    const travados: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        if (!h.umaVezSo) continue;
        if (h.efeitos.some((e) => e.tipo === 'dialogo')) {
          travados.push(`${nomeDaCena(i)} '${h.id}'`);
        }
      }
    });
    expect(travados).toEqual([]);
  });

  /** A store marca a abertura da cena com um id sintético `abertura:lugar:bloco`. */
  it('nenhum id de hotspot colide com os ids sintéticos de abertura de cena', () => {
    const colisoes = CENAS.flatMap((c) => c.hotspots)
      .map((h) => h.id)
      .filter((id) => id.startsWith('abertura:'));
    expect(colisoes).toEqual([]);
  });

  it('todo hotspot que aceita item declara os efeitos desse uso, e vice-versa', () => {
    const inconsistentes: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        const onde = `${nomeDaCena(i)} '${h.id}'`;
        if (h.aceitaItem && (h.efeitosComItem ?? []).length === 0) {
          inconsistentes.push(`${onde}: aceitaItem sem efeitosComItem`);
        }
        if (!h.aceitaItem && (h.efeitosComItem ?? []).length > 0) {
          inconsistentes.push(`${onde}: efeitosComItem sem aceitaItem`);
        }
      }
    });
    expect(inconsistentes).toEqual([]);
  });

  /** Falha genérica é para combinação errada de item, não para porta fechada. */
  it('todo hotspot com porta declara o próprio texto de bloqueio', () => {
    const semTexto: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        const temPorta =
          h.requerItemPresente !== undefined ||
          h.requerPuzzleResolvido !== undefined ||
          (h.requerHotspotsFeitos ?? []).length > 0;
        if (temPorta && !h.bloqueadoTexto) semTexto.push(`${nomeDaCena(i)} '${h.id}'`);
      }
    });
    expect(semTexto).toEqual([]);
  });

  it('todo hotspot tem rótulo e ao menos um efeito de clique', () => {
    const vazios: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        if (h.rotulo.trim() === '') vazios.push(`${nomeDaCena(i)} '${h.id}': rótulo vazio`);
        if (h.efeitos.length === 0) vazios.push(`${nomeDaCena(i)} '${h.id}': sem efeitos`);
      }
    });
    expect(vazios).toEqual([]);
  });

  /**
   * ARTE DECLARADA — a regressão central que a frente de interação consertou.
   *
   * Hotspot era um `<button>` com `minWidth: 260` e o rótulo dentro: NPC e item
   * não existiam visualmente, e não se sabia com quem se estava falando até
   * clicar. O campo `arte` é obrigatório no tipo, então o compilador já pega a
   * ausência; este teste pega o que o compilador não alcança — `arte` presente
   * mas vazia por dentro (assetId em branco, tamanho zero ou negativo), que
   * renderiza uma caixa de 0px e volta a ser hotspot invisível.
   */
  it('todo hotspot declara arte utilizável', () => {
    const problemas: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        const onde = `${nomeDaCena(i)} '${h.id}'`;
        const arte = h.arte as unknown as Record<string, unknown> | undefined;
        if (arte === undefined || arte === null) {
          problemas.push(`${onde}: sem arte`);
          continue;
        }
        if (h.arte.tipo === 'npc' && !h.arte.npcId) problemas.push(`${onde}: npc sem id`);
        if (h.arte.tipo === 'item' && !h.arte.itemId) problemas.push(`${onde}: item sem id`);
        if (h.arte.tipo === 'objeto') {
          if (h.arte.assetId.trim() === '') problemas.push(`${onde}: objeto sem assetId`);
          if (h.arte.largura <= 0 || h.arte.altura <= 0) {
            problemas.push(`${onde}: objeto com tamanho ${h.arte.largura}x${h.arte.altura}`);
          }
          // Escala única de 4x (bíblia §2.1): tamanho de tela é sempre múltiplo
          // de 4, senão o objeto sai meio pixel de arte fora da grade.
          if (h.arte.largura % 4 !== 0 || h.arte.altura % 4 !== 0) {
            problemas.push(`${onde}: objeto fora da grade de 4px`);
          }
        }
      }
    });
    expect(problemas).toEqual([]);
    // Não passa por vacuidade.
    expect(CENAS.flatMap((c) => c.hotspots).length).toBeGreaterThan(0);
  });

  /**
   * Todo `assetId` de objeto existe no MANIFEST.
   *
   * `assetId` é `string` — o compilador não tem como ligá-lo ao manifest. Id
   * fora do manifest faz `caminhoDoAsset` devolver null, e o objeto cai direto
   * no placeholder geométrico para sempre: a arte nova nunca aparece, e ninguém
   * descobre por que, porque não há erro em lugar nenhum.
   */
  it('todo assetId de objeto existe no MANIFEST', () => {
    const forasteiros: string[] = [];
    CENAS.forEach((cena, i) => {
      for (const h of cena.hotspots) {
        if (h.arte.tipo !== 'objeto') continue;
        if (!Object.prototype.hasOwnProperty.call(MANIFEST, h.arte.assetId)) {
          forasteiros.push(`${nomeDaCena(i)} '${h.id}' → '${h.arte.assetId}'`);
        }
      }
    });
    expect(forasteiros).toEqual([]);
    // O id de NPC e de item também precisa resolver, e resolve por convenção.
    const semCaminho = CENAS.flatMap((cena, i) =>
      cena.hotspots
        .filter((h) => caminhoDoAsset(assetDaArteDeHotspot(h.arte)) === null)
        .map((h) => `${nomeDaCena(i)} '${h.id}'`),
    );
    expect(semCaminho).toEqual([]);
  });

  /**
   * DISTÂNCIA MÍNIMA entre hotspots da mesma cena.
   *
   * Com retângulo de texto, dois hotspots juntos já se sobrepunham; com sprite,
   * um cobre o outro e o NPC de baixo simplesmente não existe na tela. 6% do
   * canvas é o piso grosseiro que o spec fixou — a prova fina, retângulo contra
   * retângulo com o tamanho real da arte, está em `src/ui/Cena.geometria.test.ts`.
   */
  it('dois hotspots da mesma cena não ficam a menos de 6% de distância', () => {
    const DISTANCIA_MINIMA = 6;
    const juntos: string[] = [];
    CENAS.forEach((cena, i) => {
      const hs = cena.hotspots;
      for (let a = 0; a < hs.length; a += 1) {
        for (let b = a + 1; b < hs.length; b += 1) {
          const x = hs[a];
          const y = hs[b];
          if (!x || !y) continue;
          const d = Math.hypot(x.pos.x - y.pos.x, x.pos.y - y.pos.y);
          if (d < DISTANCIA_MINIMA) {
            juntos.push(`${nomeDaCena(i)} '${x.id}' × '${y.id}' = ${d.toFixed(1)}%`);
          }
        }
      }
    });
    expect(juntos).toEqual([]);
  });
});

// ------------------------------------------------------------------ diálogos

describe('diálogos', () => {
  it('todo diálogo tem ao menos um nó, e todo nó é uma fala', () => {
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      expect(dialogo.nos.length, `diálogo '${id}' está vazio`).toBeGreaterThan(0);
      const ultimo = dialogo.nos[dialogo.nos.length - 1];
      expect(ultimo?.tipo, `diálogo '${id}' não termina em fala`).toBe('fala');
    }
  });

  /**
   * A mecânica de ESCOLHA foi removida do projeto: diálogo é linear, um clique
   * = um nó, e a resposta da protagonista é fala escrita, não opção do
   * apresentador. Este teste é o que impede a volta por acidente — por um `as`
   * no conteúdo, por um merge antigo, ou por alguém reintroduzindo a união em
   * `NoDialogo`. Olha o DADO em runtime, não o tipo: é o único jeito de pegar
   * um nó que burlou o compilador.
   */
  it('nenhum nó de diálogo tem tipo diferente de fala nem campo de opções', () => {
    const intrusos: string[] = [];
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      dialogo.nos.forEach((no, i) => {
        const bruto = no as unknown as Record<string, unknown>;
        if (bruto.tipo !== 'fala') intrusos.push(`'${id}' nó ${i}: tipo '${String(bruto.tipo)}'`);
        if ('opcoes' in bruto) intrusos.push(`'${id}' nó ${i}: tem 'opcoes'`);
        if (typeof bruto.quem !== 'string' || (bruto.quem as string).trim() === '') {
          intrusos.push(`'${id}' nó ${i}: sem locutor`);
        }
        if (typeof bruto.texto !== 'string') intrusos.push(`'${id}' nó ${i}: sem texto`);
      });
    }
    expect(intrusos).toEqual([]);
    // Não passa por vacuidade: o conteúdo tem diálogo e tem nó.
    expect(Object.keys(DIALOGOS).length).toBeGreaterThan(0);
    expect(TOTAL_DE_NOS).toBeGreaterThan(0);
  });

  it('a chave de DIALOGOS é igual ao id do diálogo', () => {
    const divergentes = Object.entries(DIALOGOS)
      .filter(([id, d]) => d.id !== id)
      .map(([id, d]) => `'${id}' declara id '${d.id}'`);
    expect(divergentes).toEqual([]);
  });

  it('nenhuma fala é vazia', () => {
    const vazias: string[] = [];
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      dialogo.nos.forEach((no, i) => {
        if (no.texto.trim() === '') vazias.push(`'${id}' nó ${i}`);
      });
    }
    expect(vazias).toEqual([]);
  });

  it(`nenhum diálogo passa de ${MAX_NOS_POR_DIALOGO} nós`, () => {
    const inchados = Object.entries(DIALOGOS)
      .filter(([, d]) => d.nos.length > MAX_NOS_POR_DIALOGO)
      .map(([id, d]) => `'${id}': ${d.nos.length} nós`);
    expect(inchados).toEqual([]);
  });

  it(`nenhuma fala passa de ${MAX_CARACTERES_POR_FALA} caracteres`, () => {
    const longas: string[] = [];
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      dialogo.nos.forEach((no, i) => {
        if (no.texto.length > MAX_CARACTERES_POR_FALA) {
          longas.push(`'${id}' nó ${i}: ${no.texto.length} caracteres`);
        }
      });
    }
    expect(longas).toEqual([]);
  });

  it('as frases-assinatura continuam no conteúdo', () => {
    const falas = Object.values(DIALOGOS).flatMap((d) =>
      d.nos.map((no) => semDirecaoDeCena(no.texto)),
    );
    const ausentes = FRASES_ASSINATURA.filter((frase) => {
      const alvo = semDirecaoDeCena(frase);
      return !falas.some((fala) => fala.includes(alvo));
    });
    expect(ausentes).toEqual([]);
    expect(FRASES_ASSINATURA.length).toBeGreaterThan(0);
  });

  it('todo diálogo é alcançável de alguma cena, salvo os consumidos por tela', () => {
    const orfaos = Object.keys(DIALOGOS).filter(
      (id) => !DIALOGOS_ALCANCAVEIS.has(id) && !DIALOGOS_DE_TELA.includes(id),
    );
    expect(orfaos).toEqual([]);
  });

  it('os diálogos declarados como de tela existem e não são disparados por hotspot', () => {
    for (const id of DIALOGOS_DE_TELA) {
      expect(Object.prototype.hasOwnProperty.call(DIALOGOS, id), `'${id}'`).toBe(true);
      expect(DIALOGOS_ALCANCAVEIS.has(id), `'${id}' também é disparado por hotspot`).toBe(false);
    }
  });
});

// ------------------------------------------------------------------ puzzles

describe('puzzles', () => {
  it('a chave de PUZZLES é igual ao id e ao tipo do puzzle', () => {
    for (const [id, def] of Object.entries(PUZZLES)) {
      expect(def.id, `chave '${id}'`).toBe(id);
      expect(def.tipo, `chave '${id}'`).toBe(id);
    }
  });

  /**
   * INSTRUÇÃO E AVISO DE ERRO em todos os cinco (ADR-011).
   *
   * Três dos cinco só diziam o que fazer em `aria-label` — a plateia vê a tela,
   * não o leitor de telas. E nenhum avisava quando se errava: silêncio ao vivo
   * faz o apresentador explicar o que não devia, e quem joga sozinho não tem
   * ninguém para dizer isso.
   */
  it('todo puzzle tem rótulo, instrução visível e aviso de erro', () => {
    for (const [id, def] of Object.entries(PUZZLES)) {
      expect(def.rotulo.trim(), `puzzle '${id}' sem rótulo`).not.toBe('');
      expect(def.instrucao.trim(), `puzzle '${id}' sem instrução`).not.toBe('');
      expect(def.textoErro.trim(), `puzzle '${id}' sem aviso de erro`).not.toBe('');
    }
    expect(Object.keys(PUZZLES)).toHaveLength(4);
  });

  it("'senha' tem um campo por pessoa, três pessoas distintas, e nenhum campo vazio", () => {
    const def = PUZZLES.senha;
    if (def.tipo !== 'senha') throw new Error("PUZZLES.senha não é do tipo 'senha'");
    expect(def.gabarito.length).toBe(3);
    // `campos` e `gabarito` são paralelos: campos[i] é respondido por gabarito[i].
    expect(def.campos.length).toBe(def.gabarito.length);
    for (const campo of def.gabarito) expect(campo.trim()).not.toBe('');
    for (const campo of def.campos) {
      expect(campo.id.trim(), 'campo sem id').not.toBe('');
      expect(campo.rotulo.trim(), `campo '${campo.id}' sem rótulo visível`).not.toBe('');
    }
    expect([...new Set(def.campos.map((c) => c.id))]).toHaveLength(def.campos.length);
    // O PUZZLE É SOCIAL: três pedaços, três pessoas. Dois campos do mesmo NPC
    // fariam uma pessoa saber dois terços da senha, e a fase deixaria de ser
    // sobre ter coragem de falar com três pessoas diferentes.
    expect([...new Set(def.campos.map((c) => c.npcId))]).toHaveLength(3);
  });

  /**
   * A resposta da senha não está na tela: está no que as pessoas dizem. Se uma
   * reescrita tirar um pedaço de cena, o puzzle fica INSOLÚVEL ao vivo — e o erro
   * só aparece com a plateia olhando, porque o compilador não tem como ligar uma
   * string de gabarito a um texto de conteúdo.
   *
   * Casa por token isolado, não por substring: `'12'` não pode passar de graça
   * por aparecer dentro de `'2012'`.
   *
   * Vale para QUALQUER texto alcançável da fase, não só fala — ver `textosDaFase`.
   */
  it('cada campo do gabarito da senha é dito em algum texto alcançável da fase do puzzle', () => {
    const def = PUZZLES.senha;
    if (def.tipo !== 'senha') throw new Error("PUZZLES.senha não é do tipo 'senha'");
    const bloco = blocoQueAbre('senha');
    const textos = textosDaFase(bloco);
    expect(textos.length, `fase ${bloco} não tem texto nenhum`).toBeGreaterThan(0);

    const mudos = def.gabarito.filter((campo) => !textos.some((t) => contemToken(t, campo)));
    expect(mudos).toEqual([]);
  });

  it("'associar' tem gabarito bijetor entre as duas colunas", () => {
    const def = PUZZLES.associar;
    if (def.tipo !== 'associar') throw new Error("PUZZLES.associar não é do tipo 'associar'");
    const esquerda = def.esquerda.map((l) => l.id);
    const direita = def.direita.map((l) => l.id);
    const pares = Object.entries(def.gabarito);

    // Uma entrada por lacuna, e nenhuma lacuna de fora.
    expect(pares.map(([k]) => k).sort()).toEqual([...esquerda].sort());
    // Todo destino existe na coluna da direita.
    for (const [lacuna, trilha] of pares) {
      expect(direita, `gabarito de '${lacuna}'`).toContain(trilha);
    }
    // Nenhuma trilha usada duas vezes: o puzzle tem solução única.
    const destinos = pares.map(([, v]) => v);
    expect([...new Set(destinos)]).toHaveLength(destinos.length);
    expect(esquerda).toHaveLength(4);
    expect(direita).toHaveLength(4);
    expect([...new Set(esquerda)]).toHaveLength(esquerda.length);
    expect([...new Set(direita)]).toHaveLength(direita.length);
  });

  /** As quatro associações ensinam duas práticas de planejamento e duas de estudo. */
  it("'associar' liga planejamento a planejamento e estudo a estudo", () => {
    const def = PUZZLES.associar;
    if (def.tipo !== 'associar') throw new Error("PUZZLES.associar não é do tipo 'associar'");
    expect(def.direita.map((l) => l.texto)).toEqual([
      'Anoto na hora o prazo, quem pediu e o que preciso entregar.',
      'Avalio urgência e esforço; deixo a tarefa mais pesada para a manhã.',
      'Faço um curso curto da ferramenta e já pratico no trabalho.',
      'Estudo inglês para entender documentos e participar das conversas.',
    ]);
    expect(def.gabarito).toEqual({
      'situacao-pedidos': 'pratica-anotar',
      'situacao-prazos': 'pratica-priorizar',
      'situacao-ferramenta': 'pratica-curso',
      'situacao-idioma': 'pratica-ingles',
    });
  });

  it("'estruturar' tem exatamente dois distratores e um fragmento por campo", () => {
    const def = PUZZLES.estruturar;
    if (def.tipo !== 'estruturar') throw new Error("PUZZLES.estruturar não é do tipo 'estruturar'");
    const campos = def.campos.map((c) => c.id);
    const distratores = def.fragmentos.filter((f) => f.campo === null);

    // DOIS distratores, não zero: estruturar é ESCOLHER, não preencher. Sem eles
    // o puzzle vira formulário e o tema da fase se perde.
    expect(distratores).toHaveLength(2);
    expect(def.textoDistrator.trim()).not.toBe('');
    for (const f of def.fragmentos) {
      if (f.campo !== null) expect(campos, `fragmento '${f.id}'`).toContain(f.campo);
      expect(f.texto.trim(), `fragmento '${f.id}'`).not.toBe('');
    }
    // Todo campo tem exatamente um fragmento certo: sem campo insolúvel.
    for (const campo of campos) {
      expect(
        def.fragmentos.filter((f) => f.campo === campo),
        `campo '${campo}'`,
      ).toHaveLength(1);
    }
    expect([...new Set(def.fragmentos.map((f) => f.id))]).toHaveLength(def.fragmentos.length);
  });

  /**
   * `montar` PASSOU A SER UM PUZZLE (ADR-010).
   *
   * Antes não tinha gabarito e qualquer peça encaixava em qualquer espaço; os
   * quatro alvos eram retângulos tracejados cujo único texto era `aria-label`.
   * O dono disse que não entendeu o que era para fazer, e não havia o que
   * entender. Este teste é o que garante que o gabarito não desapareça de novo.
   */
  it("'montar' tem campos rotulados e uma peça por campo — tem gabarito", () => {
    const def = PUZZLES.montar;
    if (def.tipo !== 'montar') throw new Error("PUZZLES.montar não é do tipo 'montar'");
    const campos = def.campos.map((c) => c.id);

    expect(campos.length).toBeGreaterThanOrEqual(2);
    expect([...new Set(campos)]).toHaveLength(campos.length);
    for (const c of def.campos) {
      // Rótulo VISÍVEL: era exatamente o que faltava nos quatro alvos.
      expect(c.rotulo.trim(), `campo '${c.id}' sem rótulo`).not.toBe('');
    }
    expect([...new Set(def.pecas.map((p) => p.id))]).toHaveLength(def.pecas.length);
    for (const p of def.pecas) {
      expect(p.texto.trim(), `peça '${p.id}'`).not.toBe('');
      expect(campos, `peça '${p.id}' aponta para campo inexistente`).toContain(p.campo);
    }
    // Um campo por peça e uma peça por campo: sem isso há alvo insolúvel ou
    // duas peças disputando a mesma casa, e o aviso de erro fica arbitrário.
    expect(def.pecas).toHaveLength(campos.length);
    for (const campo of campos) {
      expect(
        def.pecas.filter((p) => p.campo === campo),
        `campo '${campo}'`,
      ).toHaveLength(1);
    }
  });

  it('todo puzzle é aberto por algum Efeito alcançável', () => {
    const abertos = EFEITOS_ALCANCAVEIS.filter((e) => e.tipo === 'abrirPuzzle').map((e) =>
      e.tipo === 'abrirPuzzle' ? e.puzzleId : '',
    );
    for (const id of Object.keys(PUZZLES)) {
      expect(abertos, `puzzle '${id}' nunca é aberto`).toContain(id);
    }
  });

  /**
   * Cada puzzle é GANCHO da fala do apresentador da fase dele (ADR-004), e as
   * fases são fixas: senha na 1, associar na 2, estruturar na 3,
   * montar na 4. A fase 5 nasce sem puzzle de propósito — a mecânica dela é o
   * painel de skills (ADR-024).
   */
  it('cada puzzle é aberto na fase a que ele serve de gancho', () => {
    const esperado: Record<PuzzleId, BlocoId> = {
      senha: 1,
      associar: 2,
      estruturar: 3,
      montar: 4,
    };
    for (const [id, bloco] of Object.entries(esperado) as [PuzzleId, BlocoId][]) {
      expect(blocoQueAbre(id), `puzzle '${id}'`).toBe(bloco);
    }
  });
});

// --------------------------------------------------------- itens e skills

describe('alcançabilidade de itens e skills', () => {
  it('os cinco itens são concedidos por algum Efeito alcançável', () => {
    const concedidos = EFEITOS_ALCANCAVEIS.filter((e) => e.tipo === 'concederItem').map((e) =>
      e.tipo === 'concederItem' ? e.itemId : '',
    );
    expect(Object.keys(ITENS)).toHaveLength(6);
    for (const id of Object.keys(ITENS)) {
      expect(concedidos, `item '${id}' nunca é concedido`).toContain(id);
    }
  });

  /**
   * TODO ITEM CONCEDIDO É USADO — e a exceção dos tardios é EXPLÍCITA.
   *
   * Foi a falta desta exceção explícita que deixou três itens mortos passarem na
   * v1: `senha`, `indicacao-trilha` e `projeto-entregue` entravam na barra e
   * nunca saíam, e ninguém percebeu porque "item sem uso" já parecia normal —
   * afinal os três tardios também não têm uso aparente.
   *
   * A diferença é que nos tardios isso é O DESENHO: eles são as PORTAS do
   * clímax, e é lá que se gastam. Então a regra passa a ser: item não tardio tem
   * de ser consumido por algum efeito do jogo; item tardio tem de ser origem de
   * uma conexão. Nenhum item pode ficar fora das duas listas.
   */
  it('todo item concedido é usado: os não tardios são consumidos, os tardios são portas do clímax', () => {
    const consumidos = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'consumirItem' ? [e.itemId] : [])),
    );
    const origensDeConexao = new Set(
      CONEXOES.flatMap((c) => (c.origem.tipo === 'item' ? [c.origem.itemId] : [])),
    );
    const semUso: string[] = [];
    for (const item of Object.values(ITENS)) {
      if (item.tardio) {
        if (!origensDeConexao.has(item.id)) {
          semUso.push(`'${item.id}' é tardio e não é origem de nenhuma conexão`);
        }
      } else if (item.id !== 'relatorio' && !consumidos.has(item.id)) {
        semUso.push(`'${item.id}' é concedido e nunca consumido`);
      }
    }
    expect(semUso).toEqual([]);
    // Não passa por vacuidade: existem itens das duas naturezas.
    expect(Object.values(ITENS).filter((i) => i.tardio)).toHaveLength(4);
    expect(Object.values(ITENS).filter((i) => !i.tardio)).toHaveLength(2);
  });

  it('as nove skills são concedidas por algum Efeito alcançável', () => {
    const concedidas = EFEITOS_ALCANCAVEIS.filter((e) => e.tipo === 'concederSkill').map((e) =>
      e.tipo === 'concederSkill' ? e.skillId : '',
    );
    expect(Object.keys(SKILLS)).toHaveLength(9);
    for (const id of Object.keys(SKILLS)) {
      expect(concedidas, `skill '${id}' nunca é concedida`).toContain(id);
    }
  });

  /**
   * A fase que a skill declara é a fase em que ela é de fato concedida. Divergir
   * aqui faz o painel contar uma história diferente da que a plateia acabou de
   * ver — e o painel é o que sobra na tela no clímax.
   */
  it('cada skill é concedida na fase que ela declara', () => {
    const divergentes: string[] = [];
    for (const skill of Object.values(SKILLS)) {
      const fases = TODOS_BLOCOS.filter((bloco) =>
        alcancavelDoBloco(bloco).efeitos.some(
          (e) => e.tipo === 'concederSkill' && e.skillId === skill.id,
        ),
      );
      if (!fases.includes(skill.bloco)) {
        divergentes.push(`'${skill.id}' declara B${skill.bloco}, é concedida em ${fases.join('/')}`);
      }
    }
    expect(divergentes).toEqual([]);
  });

  it('nenhum item é consumido sem antes ser concedido', () => {
    const concedidos = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'concederItem' ? [e.itemId] : [])),
    );
    const consumidos = EFEITOS_ALCANCAVEIS.flatMap((e) =>
      e.tipo === 'consumirItem' ? [e.itemId] : [],
    );
    for (const id of consumidos) {
      expect([...concedidos], `item '${id}' é consumido e nunca concedido`).toContain(id);
    }
  });

  it('a chave de ITENS e SKILLS é igual ao id do registro', () => {
    for (const [id, item] of Object.entries(ITENS)) expect(item.id, `item '${id}'`).toBe(id);
    for (const [id, skill] of Object.entries(SKILLS)) expect(skill.id, `skill '${id}'`).toBe(id);
  });
});

// ------------------------------------------------------------------ blocos

describe('as seis fases e os seis cartões', () => {
  it('as seis fases existem, com chave igual ao id e fecho escrito', () => {
    expect(Object.keys(BLOCOS)).toEqual(['1', '2', '3', '4', '5', '6']);
    for (const [chave, bloco] of Object.entries(BLOCOS)) {
      expect(String(bloco.id), `fase '${chave}'`).toBe(chave);
      expect(bloco.titulo.trim(), `fase '${chave}'`).not.toBe('');
      expect(bloco.fechoTexto.trim(), `fase '${chave}'`).not.toBe('');
    }
  });

  /**
   * CADA FASE TEM DE PODER TERMINAR. Uma fase sem caminho que emita
   * `blocoConcluido` não mostra o botão de avançar, e a apresentação para no
   * palco sem que nada pareça errado — o pior tipo de defeito que este projeto
   * pode ter.
   */
  it('cada uma das seis fases tem ao menos um caminho que emite blocoConcluido', () => {
    const semSaida: string[] = [];
    for (const bloco of TODOS_BLOCOS) {
      const conclui = alcancavelDoBloco(bloco).efeitos.some((e) => e.tipo === 'blocoConcluido');
      if (!conclui) semSaida.push(`B${bloco}`);
    }
    expect(semSaida).toEqual([]);
    expect(TODOS_BLOCOS).toHaveLength(6);
  });

  it('todo id citado no estadoAssumido de uma fase existe', () => {
    const quebrados: string[] = [];
    for (const [chave, bloco] of Object.entries(BLOCOS)) {
      const a = bloco.estadoAssumido;
      for (const id of a.itens) if (!EXISTE.item(id)) quebrados.push(`B${chave} item '${id}'`);
      for (const id of a.skills) if (!EXISTE.skill(id)) quebrados.push(`B${chave} skill '${id}'`);
      for (const id of a.lugaresDestravados) {
        if (!EXISTE.lugar(id)) quebrados.push(`B${chave} destravado '${id}'`);
      }
      for (const id of a.lugaresConcluidos) {
        if (!EXISTE.lugar(id)) quebrados.push(`B${chave} concluído '${id}'`);
      }
      // Um lugar não pode ser declarado destravado e concluído ao mesmo tempo:
      // a store aplica concluído por último e o destravado sumiria em silêncio.
      for (const id of a.lugaresDestravados) {
        if (a.lugaresConcluidos.includes(id)) {
          quebrados.push(`B${chave} '${id}' é destravado e concluído`);
        }
      }
    }
    expect(quebrados).toEqual([]);
  });

  it('cada fase tem cena própria em algum lugar que ela entrega destravado', () => {
    for (const [chave, bloco] of Object.entries(BLOCOS)) {
      const temCena = bloco.estadoAssumido.lugaresDestravados.some((lugarId) =>
        CENAS.some((c) => c.lugarId === lugarId && c.bloco === bloco.id),
      );
      expect(temCena, `fase '${chave}' não tem cena jogável no estado que assume`).toBe(true);
    }
  });

  /**
   * O cartão é o ÚNICO lugar em que o jogo conhece os apresentadores (ADR-001).
   * Sem cartão na fase 1 o Pedro nunca aparece; com apresentador na fase 6
   * inventaríamos uma sexta pessoa que a apresentação não tem.
   */
  it('as seis fases têm cartão, e só a sexta não tem apresentador', () => {
    expect(CARTOES.map((c) => c.bloco)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const cartao of CARTOES) {
      expect(Object.prototype.hasOwnProperty.call(BLOCOS, String(cartao.bloco))).toBe(true);
      expect(cartao.tempo.trim(), `cartão B${cartao.bloco}`).not.toBe('');
      expect(cartao.titulo.trim(), `cartão B${cartao.bloco}`).not.toBe('');
      if (cartao.bloco === 6) {
        expect(cartao.apresentador ?? '', 'a fase 6 não tem apresentador').toBe('');
      } else {
        expect((cartao.apresentador ?? '').trim(), `cartão B${cartao.bloco}`).not.toBe('');
      }
    }
    const apresentadores = CARTOES.flatMap((c) => (c.apresentador ? [c.apresentador] : []));
    expect(apresentadores).toHaveLength(5);
    expect([...new Set(apresentadores)]).toHaveLength(5);
  });

  it('o título do cartão é o título da fase', () => {
    for (const cartao of CARTOES) {
      expect(cartao.titulo, `cartão B${cartao.bloco}`).toBe(BLOCOS[cartao.bloco].titulo);
    }
  });

  it('toda cena declara uma fase que existe', () => {
    for (const cena of CENAS) {
      expect(
        Object.prototype.hasOwnProperty.call(BLOCOS, String(cena.bloco)),
        `cena ${cena.lugarId}/B${cena.bloco}`,
      ).toBe(true);
    }
  });
});

// ------------------------------------------------------------------ conexões

describe('conexões da revelação', () => {
  it('toda origem e todo lugar de passagem existem', () => {
    for (const c of CONEXOES) {
      const rotulo = `conexão via '${c.viaLugar}'`;
      expect(EXISTE.lugar(c.viaLugar), rotulo).toBe(true);
      if (c.origem.tipo === 'item') expect(EXISTE.item(c.origem.itemId), rotulo).toBe(true);
      else expect(EXISTE.skill(c.origem.skillId), rotulo).toBe(true);
      expect(c.texto.trim(), rotulo).not.toBe('');
      expect(c.espessura, rotulo).toBeGreaterThan(0);
      expect(c.duracaoMs, rotulo).toBeGreaterThan(0);
    }
  });

  it('as origens de item incluem os quatro itens tardios e o relatório persistente', () => {
    const origensDeItem = CONEXOES.flatMap((c) =>
      c.origem.tipo === 'item' ? [c.origem.itemId] : [],
    );
    const tardios = Object.values(ITENS)
      .filter((i) => i.tardio)
      .map((i) => i.id);

    expect([...origensDeItem].sort()).toEqual([...tardios, 'relatorio'].sort());
    for (const c of CONEXOES) {
      if (c.origem.tipo === 'item' && c.origem.itemId !== 'relatorio') expect(c.consomeOrigem, c.origem.itemId).toBe(true);
    }
  });

  it('a última conexão sai do relatório e o preserva como evidência de protagonismo', () => {
    const ultima = CONEXOES[CONEXOES.length - 1];
    expect(ultima?.origem).toEqual({ tipo: 'item', itemId: 'relatorio' });
    expect(ultima?.consomeOrigem).toBe(false);
  });

  it('nenhuma origem se repete e cada lugar de passagem é usado uma vez', () => {
    const origens = CONEXOES.map((c) =>
      c.origem.tipo === 'item' ? `item:${c.origem.itemId}` : `skill:${c.origem.skillId}`,
    );
    expect([...new Set(origens)]).toHaveLength(origens.length);

    const lugares = CONEXOES.map((c) => c.viaLugar);
    expect([...new Set(lugares)]).toHaveLength(lugares.length);
  });

  it('a origem persistente é concedida em algum lugar do jogo', () => {
    const concedidas = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'concederItem' ? [e.itemId] : [])),
    );
    for (const c of CONEXOES) {
      if (c.origem.tipo === 'item') expect([...concedidas], `item '${c.origem.itemId}'`).toContain(c.origem.itemId);
    }
  });

  /**
   * ADR-023: o texto do certificado trocou de eixo, de "o que ela estudou" para
   * "quanto, e por conta de quem". Nomear o curso era o nicho voltando pela
   * frase mais importante da apresentação.
   */
  it('a conexão do certificado fala de esforço, não de matéria', () => {
    const doCertificado = CONEXOES.find(
      (c) => c.origem.tipo === 'item' && c.origem.itemId === 'certificado-degree',
    );
    expect(doCertificado, 'a conexão do certificado desapareceu').toBeDefined();
    expect(doCertificado?.texto).toContain('quarenta horas');
    expect(doCertificado?.texto.toLowerCase()).not.toContain('arquitetura');
  });
});

// -------------------------------------------------------------- vocabulário

describe('vocabulário universal', () => {
  /**
   * O EXPURGO (ADR-002), com a exceção declarada da Bianca (ADR-027).
   *
   * Este é o único teste do projeto que olha o TEXTO em vez da estrutura, e ele
   * existe porque texto não tem tipo: o jargão não quebra compilação, não quebra
   * geometria, e volta silenciosamente na primeira reescrita de diálogo.
   */
  it('nenhum texto de conteúdo usa vocabulário de nicho, exceto nas falas da Bianca', () => {
    const achados: string[] = [];
    for (const { onde, texto, locutor } of TODOS_OS_TEXTOS) {
      const isento = locutor === LOCUTOR_ISENTO_DO_EXPURGO;
      if (isento) continue;
      for (const frase of TERMOS_BANIDOS_FRASE) {
        if (texto.toLowerCase().includes(frase.toLowerCase())) {
          achados.push(`${onde}: '${frase}'`);
        }
      }
      for (const token of TERMOS_BANIDOS_TOKEN) {
        // API nomeia o campo específico da Bianca; os demais cargos continuam
        // sem o jargão que a audiência geral não precisa ver.
        if (onde === "npc 'bianca'.cargo" && token === 'API') continue;
        if (contemToken(texto, token, true)) achados.push(`${onde}: '${token}'`);
      }
    }
    expect(achados).toEqual([]);
    // Não passa por vacuidade: há texto de sobra para varrer.
    expect(TODOS_OS_TEXTOS.length).toBeGreaterThan(40);
  });

  /**
   * A exceção é DECLARADA, não acidental. Se um dia ninguém mais precisar dela,
   * este teste é o lugar onde isso fica registrado — e enquanto ela existir, ela
   * vale para as falas e para o título profissional explicitamente solicitado,
   * nunca para narração ou para os outros cargos.
   */
  it('a linguagem técnica da Bianca fica restrita às falas e ao cargo declarado', () => {
    const cargo = NPCS[LOCUTOR_ISENTO_DO_EXPURGO].cargo;
    // API é o título profissional declarado para Bianca; a isenção de jargão
    // permanece vedada para todo o resto dos cargos.
    for (const token of TERMOS_BANIDOS_TOKEN.filter(token => token !== 'API')) {
      expect(contemToken(cargo, token, true), `cargo da Bianca usa '${token}'`).toBe(false);
    }
    expect(contemToken(cargo, 'API', true)).toBe(true);
    // E a isenção é de UM locutor só: duas isenções deixariam de ser exceção.
    expect(LOCUTOR_ISENTO_DO_EXPURGO).toBe('bianca');
  });
});
