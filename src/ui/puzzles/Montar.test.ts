/**
 * `montar` É UM PUZZLE — a asserção que a v1 não podia fazer.
 *
 * Este arquivo existe por causa de um comentário. `Montar.tsx` dizia, em código
 * de produção, "Não existe encaixe errado", e estava dizendo a verdade: não havia
 * gabarito, e `clicarEspaco` punha qualquer peça em qualquer espaço vazio sem
 * comparar nada. Os quatro alvos eram retângulos tracejados cujo único texto era
 * `aria-label`. O dono disse que não entendeu o que era para fazer (ADR-010).
 *
 * O teste ataca exatamente aquela linha ausente. A mutação que o prova é apagar
 * a comparação `peca.campo !== acao.id` de `reduzirMontar`: sem ela, o primeiro
 * `it` abaixo passa a colocar a peça errada e reprova.
 *
 * Roda contra o CONTEÚDO REAL (`PUZZLES.montar`), não contra um fixture. Um
 * fixture provaria que o redutor funciona; isto prova que o puzzle que a plateia
 * vai ver funciona — inclusive que o conteúdo declara gabarito coerente.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleMontar } from '../../domain/types';

import {
  campoDaPeca,
  estadoInicialMontar,
  geometriaDe,
  montarCompleto,
  reduzirMontar,
  type AcaoMontar,
  type EstadoMontar,
} from './Montar';
import { ALTURA_CORPO, LARGURA_UTIL, TEXTO_ACERTO } from './moldura';

const def = PUZZLES.montar as PuzzleMontar;

function tocar(estado: EstadoMontar, ...acoes: readonly AcaoMontar[]): EstadoMontar {
  return acoes.reduce((atual, acao) => reduzirMontar(def, atual, acao), estado);
}

/** Um campo que NÃO é o da peça. É a casa errada que o puzzle tem de recusar. */
function campoErradoPara(pecaId: string): string {
  const peca = def.pecas.find((p) => p.id === pecaId);
  const outro = def.campos.find((c) => c.id !== peca?.campo);
  if (!outro) throw new Error('o conteúdo do montar precisa de dois campos para haver casa errada');
  return outro.id;
}

describe('o conteúdo do montar tem gabarito de verdade', () => {
  it('cada peça aponta para um campo que existe', () => {
    const ids = new Set(def.campos.map((c) => c.id));
    for (const peca of def.pecas) {
      expect(ids.has(peca.campo), `peça '${peca.id}' aponta para '${peca.campo}'`).toBe(true);
    }
  });

  /**
   * Duas peças no mesmo campo fariam uma delas não ter casa, e o puzzle ficaria
   * insolúvel com a tela cheia — o pior defeito possível ao vivo.
   */
  it('cada campo tem exatamente uma peça: nenhuma peça fica sem casa', () => {
    const porCampo = new Map<string, string[]>();
    for (const peca of def.pecas) {
      porCampo.set(peca.campo, [...(porCampo.get(peca.campo) ?? []), peca.id]);
    }
    for (const campo of def.campos) {
      expect(porCampo.get(campo.id) ?? [], `campo '${campo.id}'`).toHaveLength(1);
    }
    expect(def.pecas).toHaveLength(def.campos.length);
  });

  it('todo alvo tem rótulo visível não vazio: era só aria-label', () => {
    for (const campo of def.campos) {
      expect(campo.rotulo.trim(), `campo '${campo.id}'`).not.toBe('');
    }
  });
});

describe('peça na casa errada é RECUSADA', () => {
  const primeira = def.pecas[0];

  it('o conteúdo tem peça para testar', () => {
    expect(primeira).toBeDefined();
  });

  /** A MUTAÇÃO: apagar `peca.campo !== acao.id` de `reduzirMontar` reprova aqui. */
  it('a peça não entra no campo errado, e o aviso aparece', () => {
    if (!primeira) return;
    const errado = campoErradoPara(primeira.id);
    const estado = tocar(
      estadoInicialMontar(),
      { tipo: 'clicarPeca', id: primeira.id },
      { tipo: 'clicarCampo', id: errado },
    );

    expect(estado.colocadas[errado]).toBeUndefined();
    expect(campoDaPeca(estado, primeira.id)).toBeNull();
    expect(estado.aviso).toEqual({ tipo: 'erro', texto: def.textoErro });
    expect(estado.recusou).toBe(errado);
  });

  it('recusar não gasta a peça: ela continua na mão e entra na casa certa depois', () => {
    if (!primeira) return;
    const estado = tocar(
      estadoInicialMontar(),
      { tipo: 'clicarPeca', id: primeira.id },
      { tipo: 'clicarCampo', id: campoErradoPara(primeira.id) },
      { tipo: 'clicarCampo', id: primeira.campo },
    );

    expect(estado.colocadas[primeira.campo]).toBe(primeira.id);
    expect(estado.aviso).toBeNull();
  });

  it('nenhuma peça entra em campo nenhum sem ser escolhida antes', () => {
    const estado = tocar(estadoInicialMontar(), {
      tipo: 'clicarCampo',
      id: def.campos[0]?.id ?? '',
    });
    expect(estado.colocadas).toEqual({});
  });

  it('campo já preenchido não aceita troca', () => {
    if (!primeira) return;
    const outra = def.pecas.find((p) => p.id !== primeira.id);
    if (!outra) return;
    const estado = tocar(
      estadoInicialMontar(),
      { tipo: 'clicarPeca', id: primeira.id },
      { tipo: 'clicarCampo', id: primeira.campo },
      { tipo: 'clicarPeca', id: outra.id },
      { tipo: 'clicarCampo', id: primeira.campo },
    );
    expect(estado.colocadas[primeira.campo]).toBe(primeira.id);
  });
});

describe('a página se monta e avisa que fechou', () => {
  it('as quatro peças nas quatro casas certas completam o puzzle', () => {
    let estado = estadoInicialMontar();
    for (const peca of def.pecas) {
      estado = tocar(
        estado,
        { tipo: 'clicarPeca', id: peca.id },
        { tipo: 'clicarCampo', id: peca.campo },
      );
    }
    expect(montarCompleto(def, estado)).toBe(true);
    expect(estado.aviso).toEqual({ tipo: 'acerto', texto: TEXTO_ACERTO });
  });

  /**
   * O contrapositivo do defeito: se qualquer peça puder ir a qualquer casa, uma
   * distribuição trocada também "completa". Aqui ela não pode nem começar.
   */
  it('a ordem trocada NÃO completa o puzzle', () => {
    const pecas = [...def.pecas];
    const campos = def.campos.map((c) => c.id);
    let estado = estadoInicialMontar();
    pecas.forEach((peca, i) => {
      // Desloca uma casa: toda peça cai na casa da peça seguinte.
      const casa = campos[(i + 1) % campos.length];
      if (casa === undefined) return;
      estado = tocar(
        estado,
        { tipo: 'clicarPeca', id: peca.id },
        { tipo: 'clicarCampo', id: casa },
      );
    });
    expect(montarCompleto(def, estado)).toBe(false);
    expect(Object.keys(estado.colocadas)).toHaveLength(0);
  });
});

describe('o layout compacto cabe na tela', () => {
  /** Havia 400px de vazio entre as fileiras (`ESPACO_LINHA`). Não voltam. */
  it('a área do puzzle cabe no orçamento da moldura', () => {
    const g = geometriaDe(def);
    expect(g.largura).toBeLessThanOrEqual(LARGURA_UTIL);
    expect(g.altura).toBeLessThanOrEqual(ALTURA_CORPO);
  });
});
