/**
 * Par errado AVISA. Antes a linha recuava em silêncio.
 *
 * A MUTAÇÃO que prova: trocar o `avisoDeErro(def.textoErro)` do caso
 * `clicarDireita` por `aviso: null` — que é literalmente o comportamento antigo,
 * "a linha aparece, recua, e o estado volta ao que era". O primeiro `it` do
 * segundo bloco reprova.
 *
 * Roda contra o conteúdo real: `PUZZLES.associar`.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleAssociar } from '../../domain/types';

import {
  associarCompleto,
  estadoInicialAssociar,
  geometriaDe,
  reduzirAssociar,
  type AcaoAssociar,
  type EstadoAssociar,
} from './AssociarPares';
import { ALTURA_CORPO, embaralharEstavel, LARGURA_UTIL, TEXTO_ACERTO } from './moldura';

const def = PUZZLES.associar as PuzzleAssociar;

function tocar(estado: EstadoAssociar, ...acoes: readonly AcaoAssociar[]): EstadoAssociar {
  return acoes.reduce((atual, acao) => reduzirAssociar(def, atual, acao), estado);
}

const PARES = Object.entries(def.gabarito);

describe('o conteúdo do associar fecha', () => {
  it('todo par do gabarito aponta para ids que existem nas duas colunas', () => {
    const esq = new Set(def.esquerda.map((i) => i.id));
    const dir = new Set(def.direita.map((i) => i.id));
    for (const [e, d] of PARES) {
      expect(esq.has(e), `esquerda '${e}'`).toBe(true);
      expect(dir.has(d), `direita '${d}'`).toBe(true);
    }
  });

  /**
   * A coluna da direita é reordenada por hash. Se ela fosse exibida na ordem
   * declarada, o puzzle viraria "ligue cada linha na da frente".
   */
  it('a coluna da direita não é exibida na ordem que resolve o puzzle', () => {
    const exibida = embaralharEstavel(def.direita).map((i) => i.id);
    const resposta = def.esquerda.map((i) => def.gabarito[i.id]);
    expect(exibida).not.toEqual(resposta);
  });
});

describe('par errado avisa', () => {
  const par = PARES[0];

  it('o conteúdo tem par para testar', () => {
    expect(par).toBeDefined();
  });

  /** A MUTAÇÃO: devolver `aviso: null` no par errado reprova aqui. */
  it('ligar na trilha errada produz o texto de erro do conteúdo', () => {
    if (!par) return;
    const [esqId] = par;
    const erradoId = def.direita.find((d) => d.id !== def.gabarito[esqId])?.id;
    expect(erradoId).toBeDefined();
    if (!erradoId) return;

    const estado = tocar(
      estadoInicialAssociar(),
      { tipo: 'clicarEsquerda', id: esqId },
      { tipo: 'clicarDireita', id: erradoId },
    );

    expect(estado.aviso).toEqual({ tipo: 'erro', texto: def.textoErro });
    expect(estado.erro).toEqual({ esqId, dirId: erradoId });
    // E nada de progresso: errar não liga nada.
    expect(estado.ligacoes).toEqual({});
  });

  it('o par errado não consome a lacuna: ela liga certo depois', () => {
    if (!par) return;
    const [esqId, certoId] = par;
    const erradoId = def.direita.find((d) => d.id !== certoId)?.id;
    if (!erradoId) return;

    const estado = tocar(
      estadoInicialAssociar(),
      { tipo: 'clicarEsquerda', id: esqId },
      { tipo: 'clicarDireita', id: erradoId },
      { tipo: 'recolherErro' },
      { tipo: 'clicarEsquerda', id: esqId },
      { tipo: 'clicarDireita', id: certoId },
    );

    expect(estado.ligacoes[esqId]).toBe(certoId);
  });

  /**
   * Enquanto a linha errada atravessa a tela, clique nenhum entra. Duas linhas
   * disputando a mesma âncora é o defeito visual que isto evita.
   */
  it('durante o erro em exibição, a tela não aceita clique', () => {
    if (!par) return;
    const [esqId, certoId] = par;
    const erradoId = def.direita.find((d) => d.id !== certoId)?.id;
    if (!erradoId) return;

    const estado = tocar(
      estadoInicialAssociar(),
      { tipo: 'clicarEsquerda', id: esqId },
      { tipo: 'clicarDireita', id: erradoId },
      { tipo: 'clicarDireita', id: certoId },
    );
    expect(estado.ligacoes).toEqual({});
  });

  it('clique na direita sem nada escolhido à esquerda não faz nada', () => {
    const algum = def.direita[0]?.id;
    if (!algum) return;
    const estado = tocar(estadoInicialAssociar(), { tipo: 'clicarDireita', id: algum });
    expect(estado).toEqual(estadoInicialAssociar());
  });

  it('trilha já ligada não aceita segunda lacuna', () => {
    const primeiro = PARES[0];
    const segundo = PARES[1];
    if (!primeiro || !segundo) return;
    const estado = tocar(
      estadoInicialAssociar(),
      { tipo: 'clicarEsquerda', id: primeiro[0] },
      { tipo: 'clicarDireita', id: primeiro[1] },
      { tipo: 'clicarEsquerda', id: segundo[0] },
      { tipo: 'clicarDireita', id: primeiro[1] },
    );
    expect(estado.ligacoes[segundo[0]]).toBeUndefined();
  });
});

describe('os quatro pares certos fecham o puzzle', () => {
  it('ligar tudo certo completa e avisa o acerto', () => {
    let estado = estadoInicialAssociar();
    for (const [esqId, dirId] of PARES) {
      estado = tocar(
        estado,
        { tipo: 'clicarEsquerda', id: esqId },
        { tipo: 'clicarDireita', id: dirId },
      );
    }
    expect(associarCompleto(def, estado)).toBe(true);
    expect(estado.aviso).toEqual({ tipo: 'acerto', texto: TEXTO_ACERTO });
  });
});

describe('o layout cabe na tela', () => {
  it('a área do puzzle cabe no orçamento da moldura', () => {
    const g = geometriaDe(def);
    expect(g.largura).toBeLessThanOrEqual(LARGURA_UTIL);
    expect(g.altura).toBeLessThanOrEqual(ALTURA_CORPO);
  });
});
