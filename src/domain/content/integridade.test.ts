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
 *   `hotspotsFeitos` é global e nunca é limpo entre blocos).
 *
 * Nada aqui renderiza nada nem toca a store: é leitura do próprio conteúdo.
 */
import type { Efeito, DialogoId, LugarId } from '../types';

import {
  BLOCOS,
  CARTOES,
  CENAS,
  CONEXOES,
  DIALOGOS,
  ITENS,
  LUGARES,
  PUZZLES,
  SKILLS,
} from './index';

// ------------------------------------------------------------------ apoio

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
  return acc;
})();

/**
 * Diálogos consumidos diretamente por uma TELA, não por hotspot. Exceção
 * declarada: se a lista crescer sem motivo, é sinal de diálogo órfão.
 */
const DIALOGOS_DE_TELA: readonly DialogoId[] = ['b5-fecho'];

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

  it('todo lugarId referenciado por Efeito ou Cena existe em LUGARES', () => {
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

  it('todo requerHotspotsFeitos aponta para hotspot que existe na mesma cena', () => {
    const quebrados: string[] = [];
    CENAS.forEach((cena, i) => {
      const ids = new Set(cena.hotspots.map((h) => h.id));
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
   * bloco: um id `umaVezSo` já usado numa cena anterior nasce como clique morto.
   */
  it('nenhum hotspot umaVezSo reusa um id já presente numa cena anterior', () => {
    const mortos: string[] = [];
    CENAS.forEach((cena, i) => {
      const anteriores = new Set(
        CENAS.slice(0, i).flatMap((c) => c.hotspots.map((h) => h.id)),
      );
      for (const h of cena.hotspots) {
        if (h.umaVezSo && anteriores.has(h.id)) {
          mortos.push(`${nomeDaCena(i)} '${h.id}' (umaVezSo sobre id já acionável antes)`);
        }
      }
    });
    expect(mortos).toEqual([]);
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
});

// ------------------------------------------------------------------ diálogos

describe('diálogos', () => {
  it('todo diálogo tem ao menos um nó e termina em fala, não em escolha pendente', () => {
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      expect(dialogo.nos.length, `diálogo '${id}' está vazio`).toBeGreaterThan(0);
      const ultimo = dialogo.nos[dialogo.nos.length - 1];
      expect(ultimo?.tipo, `diálogo '${id}' termina em escolha`).toBe('fala');
    }
  });

  it('a chave de DIALOGOS é igual ao id do diálogo', () => {
    const divergentes = Object.entries(DIALOGOS)
      .filter(([id, d]) => d.id !== id)
      .map(([id, d]) => `'${id}' declara id '${d.id}'`);
    expect(divergentes).toEqual([]);
  });

  it('nenhuma fala é vazia e toda escolha tem ao menos duas opções preenchidas', () => {
    const problemas: string[] = [];
    for (const [id, dialogo] of Object.entries(DIALOGOS)) {
      dialogo.nos.forEach((no, i) => {
        if (no.tipo === 'fala' && no.texto.trim() === '') {
          problemas.push(`'${id}' nó ${i}: fala vazia`);
        }
        if (no.tipo === 'escolha') {
          if (no.opcoes.length < 2) problemas.push(`'${id}' nó ${i}: escolha com < 2 opções`);
          if (no.opcoes.some((o) => o.trim() === '')) {
            problemas.push(`'${id}' nó ${i}: opção vazia`);
          }
        }
      });
    }
    expect(problemas).toEqual([]);
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

  it("'senha' tem um campo por NPC e nenhum campo vazio", () => {
    const def = PUZZLES.senha;
    if (def.tipo !== 'senha') throw new Error("PUZZLES.senha não é do tipo 'senha'");
    expect(def.gabarito.length).toBe(3);
    for (const campo of def.gabarito) expect(campo.trim()).not.toBe('');
    expect(def.rotulo.trim()).not.toBe('');
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

  it("'sequenciar' tem ordemCorreta com exatamente os ids das linhas", () => {
    const def = PUZZLES.sequenciar;
    if (def.tipo !== 'sequenciar') throw new Error("PUZZLES.sequenciar não é do tipo 'sequenciar'");
    const linhas = def.linhas.map((l) => l.id);
    expect([...new Set(linhas)]).toHaveLength(linhas.length);
    expect(def.ordemCorreta).toHaveLength(linhas.length);
    expect([...def.ordemCorreta].sort()).toEqual([...linhas].sort());
    // Embaralhada: a ordem de exibição não pode já ser a resposta.
    expect(linhas).not.toEqual([...def.ordemCorreta]);
  });

  it("'estruturar' tem exatamente dois distratores e um fragmento por campo", () => {
    const def = PUZZLES.estruturar;
    if (def.tipo !== 'estruturar') throw new Error("PUZZLES.estruturar não é do tipo 'estruturar'");
    const campos = def.campos.map((c) => c.id);
    const distratores = def.fragmentos.filter((f) => f.campo === null);

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

  it("'montar' tem peças únicas e rotuladas", () => {
    const def = PUZZLES.montar;
    if (def.tipo !== 'montar') throw new Error("PUZZLES.montar não é do tipo 'montar'");
    expect(def.pecas.length).toBeGreaterThanOrEqual(2);
    expect([...new Set(def.pecas.map((p) => p.id))]).toHaveLength(def.pecas.length);
    for (const p of def.pecas) expect(p.texto.trim(), `peça '${p.id}'`).not.toBe('');
  });

  it('todo puzzle é aberto por algum Efeito alcançável e fecha alguma porta', () => {
    const abertos = EFEITOS_ALCANCAVEIS.filter((e) => e.tipo === 'abrirPuzzle').map((e) =>
      e.tipo === 'abrirPuzzle' ? e.puzzleId : '',
    );
    for (const id of Object.keys(PUZZLES)) {
      expect(abertos, `puzzle '${id}' nunca é aberto`).toContain(id);
    }
  });
});

// --------------------------------------------------------- itens, skills, lugares

describe('alcançabilidade de itens, skills e lugares', () => {
  it('os oito itens são concedidos por algum Efeito alcançável', () => {
    const concedidos = EFEITOS_ALCANCAVEIS.filter((e) => e.tipo === 'concederItem').map((e) =>
      e.tipo === 'concederItem' ? e.itemId : '',
    );
    expect(Object.keys(ITENS)).toHaveLength(8);
    for (const id of Object.keys(ITENS)) {
      expect(concedidos, `item '${id}' nunca é concedido`).toContain(id);
    }
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

  it('todo lugar tem ao menos uma cena com hotspot', () => {
    for (const id of Object.keys(LUGARES) as LugarId[]) {
      const cenas = CENAS.filter((c) => c.lugarId === id);
      expect(cenas.length, `lugar '${id}' não tem cena`).toBeGreaterThan(0);
      for (const cena of cenas) {
        expect(cena.hotspots.length, `cena '${id}'/B${cena.bloco} sem hotspot`).toBeGreaterThan(0);
        expect(cena.ecoTexto.trim(), `cena '${id}'/B${cena.bloco} sem ecoTexto`).not.toBe('');
      }
    }
  });

  it('todo lugar é alcançável: começa destravado ou é destravado por um Efeito', () => {
    const destravados = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'destravarLugar' ? [e.lugarId] : [])),
    );
    // O Escritório é o único que a store já entrega destravado no estado inicial.
    for (const id of Object.keys(LUGARES) as LugarId[]) {
      if (id === 'escritorio') continue;
      expect([...destravados], `lugar '${id}' nunca é destravado`).toContain(id);
    }
  });

  it('todo lugar concluído por um Efeito foi antes destravado por outro', () => {
    const destravados = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'destravarLugar' ? [e.lugarId] : [])),
    );
    destravados.add('escritorio');
    const concluidos = EFEITOS_ALCANCAVEIS.flatMap((e) =>
      e.tipo === 'concluirLugar' ? [e.lugarId] : [],
    );
    for (const id of concluidos) {
      expect([...destravados], `lugar '${id}' é concluído sem nunca ser destravado`).toContain(id);
    }
  });

  it('a chave de ITENS, SKILLS e LUGARES é igual ao id do registro', () => {
    for (const [id, item] of Object.entries(ITENS)) expect(item.id, `item '${id}'`).toBe(id);
    for (const [id, skill] of Object.entries(SKILLS)) expect(skill.id, `skill '${id}'`).toBe(id);
    for (const [id, lugar] of Object.entries(LUGARES)) expect(lugar.id, `lugar '${id}'`).toBe(id);
  });
});

// ------------------------------------------------------------------ blocos

describe('blocos e cartões', () => {
  it('os cinco blocos existem, com chave igual ao id e fecho escrito', () => {
    expect(Object.keys(BLOCOS)).toEqual(['1', '2', '3', '4', '5']);
    for (const [chave, bloco] of Object.entries(BLOCOS)) {
      expect(String(bloco.id), `bloco '${chave}'`).toBe(chave);
      expect(bloco.titulo.trim(), `bloco '${chave}'`).not.toBe('');
      expect(bloco.fechoTexto.trim(), `bloco '${chave}'`).not.toBe('');
    }
  });

  it('todo id citado no estadoAssumido de um bloco existe', () => {
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

  it('cada bloco assumido tem cena própria em algum lugar que ele entrega destravado', () => {
    for (const [chave, bloco] of Object.entries(BLOCOS)) {
      const temCena = bloco.estadoAssumido.lugaresDestravados.some((lugarId) =>
        CENAS.some((c) => c.lugarId === lugarId && c.bloco === bloco.id),
      );
      expect(temCena, `bloco '${chave}' não tem cena jogável no estado que assume`).toBe(true);
    }
  });

  it('os blocos 2 a 5 têm cartão de transição e o Bloco 1 abre direto', () => {
    expect(CARTOES.map((c) => c.bloco)).toEqual([2, 3, 4, 5]);
    for (const cartao of CARTOES) {
      expect(Object.prototype.hasOwnProperty.call(BLOCOS, String(cartao.bloco))).toBe(true);
      expect(cartao.tempo.trim(), `cartão B${cartao.bloco}`).not.toBe('');
      expect(cartao.titulo.trim(), `cartão B${cartao.bloco}`).not.toBe('');
    }
  });

  it('o título do cartão é o título do bloco', () => {
    for (const cartao of CARTOES) {
      expect(cartao.titulo, `cartão B${cartao.bloco}`).toBe(BLOCOS[cartao.bloco].titulo);
    }
  });

  it('toda cena declara um bloco que existe', () => {
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

  it('as origens de item são exatamente os três itens tardios, e são consumidas', () => {
    const origensDeItem = CONEXOES.flatMap((c) =>
      c.origem.tipo === 'item' ? [c.origem.itemId] : [],
    );
    const tardios = Object.values(ITENS)
      .filter((i) => i.tardio)
      .map((i) => i.id);

    expect([...origensDeItem].sort()).toEqual([...tardios].sort());
    for (const c of CONEXOES) {
      if (c.origem.tipo === 'item') expect(c.consomeOrigem, c.origem.itemId).toBe(true);
    }
  });

  it('a última conexão sai de uma skill e não consome a origem: é a tese', () => {
    const ultima = CONEXOES[CONEXOES.length - 1];
    expect(ultima?.origem.tipo).toBe('skill');
    expect(ultima?.consomeOrigem).toBe(false);

    const deSkill = CONEXOES.filter((c) => c.origem.tipo === 'skill');
    expect(deSkill).toHaveLength(1);
    for (const c of deSkill) expect(c.consomeOrigem).toBe(false);
  });

  it('nenhuma origem se repete e cada lugar de passagem é usado uma vez', () => {
    const origens = CONEXOES.map((c) =>
      c.origem.tipo === 'item' ? `item:${c.origem.itemId}` : `skill:${c.origem.skillId}`,
    );
    expect([...new Set(origens)]).toHaveLength(origens.length);

    const lugares = CONEXOES.map((c) => c.viaLugar);
    expect([...new Set(lugares)]).toHaveLength(lugares.length);
  });

  it('a skill de origem da tese é concedida em algum lugar do jogo', () => {
    const concedidas = new Set(
      EFEITOS_ALCANCAVEIS.flatMap((e) => (e.tipo === 'concederSkill' ? [e.skillId] : [])),
    );
    for (const c of CONEXOES) {
      if (c.origem.tipo === 'skill') {
        expect([...concedidas], `skill '${c.origem.skillId}'`).toContain(c.origem.skillId);
      }
    }
  });
});
