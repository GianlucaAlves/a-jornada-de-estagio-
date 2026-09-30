/**
 * Ordem errada AVISA. Antes o puzzle não sinalizava absolutamente nada.
 *
 * A MUTAÇÃO que prova: fazer `conferir` devolver `aviso: null` quando a ordem
 * está errada — que é o comportamento antigo, silêncio. O primeiro `it` do
 * segundo bloco reprova.
 *
 * A segunda mutação, mais interessante, é fazer `naOrdemCerta` comparar só o
 * primeiro elemento: aí "ordem errada" passa a conferir certo e o bloco de
 * acerto reprova junto.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleSequenciar } from '../../domain/types';

import { ALTURA_CORPO, LARGURA_UTIL, TEXTO_ACERTO } from './moldura';
import {
  estadoInicialSequenciar,
  geometriaDe,
  naOrdemCerta,
  reduzirSequenciar,
  type AcaoSequenciar,
  type EstadoSequenciar,
} from './Sequenciar';

const def = PUZZLES.sequenciar as PuzzleSequenciar;

function tocar(estado: EstadoSequenciar, ...acoes: readonly AcaoSequenciar[]): EstadoSequenciar {
  return acoes.reduce((atual, acao) => reduzirSequenciar(def, atual, acao), estado);
}

/**
 * Leva a lista até a ordem correta usando só as setas, que é o único caminho que
 * a pessoa tem. Se a mecânica de mover quebrar, isto não converge e o teste
 * estoura o limite — que é melhor do que um teste que injeta a resposta pronta.
 */
function ordenarPelasSetas(estado: EstadoSequenciar): EstadoSequenciar {
  let atual = estado;
  const alvo = def.ordemCorreta;
  for (let passe = 0; passe < alvo.length * alvo.length; passe += 1) {
    if (naOrdemCerta(def, atual.ordem)) return atual;
    for (let i = 0; i < atual.ordem.length - 1; i += 1) {
      const aqui = alvo.indexOf(atual.ordem[i] ?? '');
      const proximo = alvo.indexOf(atual.ordem[i + 1] ?? '');
      if (aqui > proximo) {
        atual = tocar(atual, { tipo: 'mover', indice: i, direcao: 1 });
      }
    }
  }
  return atual;
}

describe('o conteúdo do sequenciar fecha', () => {
  it('a ordem correta usa exatamente as linhas declaradas', () => {
    expect([...def.ordemCorreta].sort()).toEqual([...def.linhas.map((l) => l.id)].sort());
  });

  /** A ordem de exibição não pode ser a resposta: o puzzle nasceria resolvido. */
  it('a ordem de exibição não é a ordem correta', () => {
    expect(def.linhas.map((l) => l.id)).not.toEqual([...def.ordemCorreta]);
  });

  it('o puzzle não nasce resolvido', () => {
    const inicial = estadoInicialSequenciar(def);
    expect(naOrdemCerta(def, inicial.ordem)).toBe(false);
    expect(inicial.conferencia).toBe('nao');
    expect(inicial.aviso).toBeNull();
  });
});

describe('ordem errada avisa', () => {
  /** A MUTAÇÃO: `aviso: null` no caso errado de `conferir` reprova aqui. */
  it('conferir a ordem inicial produz o texto de erro do conteúdo', () => {
    const estado = tocar(estadoInicialSequenciar(def), { tipo: 'conferir' });
    expect(estado.conferencia).toBe('errada');
    expect(estado.aviso).toEqual({ tipo: 'erro', texto: def.textoErro });
  });

  /**
   * Uma troca a partir da ordem certa também tem de reprovar: se `naOrdemCerta`
   * comparar por conjunto em vez de por posição, isto passa a conferir certo.
   */
  it('a ordem certa com duas linhas trocadas é errada', () => {
    const trocada = [...def.ordemCorreta];
    const a = trocada[0];
    const b = trocada[1];
    if (a === undefined || b === undefined) return;
    trocada[0] = b;
    trocada[1] = a;
    expect(naOrdemCerta(def, trocada)).toBe(false);
  });

  it('mexer depois de errar apaga o aviso: aviso velho parece resposta nova', () => {
    const estado = tocar(
      estadoInicialSequenciar(def),
      { tipo: 'conferir' },
      { tipo: 'mover', indice: 0, direcao: 1 },
    );
    expect(estado.aviso).toBeNull();
    expect(estado.conferencia).toBe('nao');
  });

  it('errar não trava nada: dá para conferir de novo quantas vezes quiser', () => {
    const estado = tocar(
      estadoInicialSequenciar(def),
      { tipo: 'conferir' },
      { tipo: 'conferir' },
      { tipo: 'conferir' },
    );
    expect(estado.conferencia).toBe('errada');
    expect(estado.ordem).toEqual(estadoInicialSequenciar(def).ordem);
  });
});

describe('a ordem certa fecha, e só pelas setas', () => {
  it('as setas levam até a ordem correta e conferir aceita', () => {
    const ordenado = ordenarPelasSetas(estadoInicialSequenciar(def));
    expect(naOrdemCerta(def, ordenado.ordem)).toBe(true);

    const conferido = tocar(ordenado, { tipo: 'conferir' });
    expect(conferido.conferencia).toBe('certa');
    expect(conferido.aviso).toEqual({ tipo: 'acerto', texto: TEXTO_ACERTO });
  });

  /** Seta clicada durante o fecho não pode desmontar a resposta na tela. */
  it('depois de conferir certo, as setas não mexem mais', () => {
    const conferido = tocar(ordenarPelasSetas(estadoInicialSequenciar(def)), {
      tipo: 'conferir',
    });
    const depois = tocar(conferido, { tipo: 'mover', indice: 0, direcao: 1 });
    expect(depois.ordem).toEqual(conferido.ordem);
  });

  it('seta na borda não faz nada: primeira linha não sobe, última não desce', () => {
    const inicial = estadoInicialSequenciar(def);
    expect(tocar(inicial, { tipo: 'mover', indice: 0, direcao: -1 }).ordem).toEqual(
      inicial.ordem,
    );
    expect(
      tocar(inicial, { tipo: 'mover', indice: inicial.ordem.length - 1, direcao: 1 }).ordem,
    ).toEqual(inicial.ordem);
  });
});

describe('o layout cabe na tela', () => {
  it('a área do puzzle cabe no orçamento da moldura', () => {
    const g = geometriaDe(def);
    expect(g.largura).toBeLessThanOrEqual(LARGURA_UTIL);
    expect(g.altura).toBeLessThanOrEqual(ALTURA_CORPO);
  });
});
