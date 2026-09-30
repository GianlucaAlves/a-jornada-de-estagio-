/**
 * Distrator avisa, e campo errado passou a avisar também.
 *
 * O distrator já tinha texto — era a única mensagem de erro de todo o jogo. O que
 * faltava era o outro caso: trecho CERTO na casa ERRADA sacudia o campo em
 * silêncio, e sacudida sozinha lê como falha de render numa tela comprimida.
 *
 * As MUTAÇÕES que provam este arquivo:
 * - tirar `avisoDeErro(def.textoDistrator)` do caso `campo === null` → reprova o
 *   primeiro bloco;
 * - tirar `avisoDeErro(def.textoErro)` do caso `campo !== acao.id` → reprova o
 *   segundo, que é o defeito novo consertado aqui;
 * - apagar a comparação `fragmento.campo !== acao.id` → o trecho entra em
 *   qualquer campo e o terceiro bloco reprova.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleEstruturar } from '../../domain/types';

import {
  estadoInicialEstruturar,
  estruturarCompleto,
  geometriaDe,
  reduzirEstruturar,
  type AcaoEstruturar,
  type EstadoEstruturar,
} from './Estruturar';
import { ALTURA_CORPO, LARGURA_UTIL, TEXTO_ACERTO } from './moldura';

const def = PUZZLES.estruturar as PuzzleEstruturar;

function tocar(estado: EstadoEstruturar, ...acoes: readonly AcaoEstruturar[]): EstadoEstruturar {
  return acoes.reduce((atual, acao) => reduzirEstruturar(def, atual, acao), estado);
}

const DISTRATORES = def.fragmentos.filter((f) => f.campo === null);
const REAIS = def.fragmentos.filter((f) => f.campo !== null);

describe('o conteúdo do estruturar fecha', () => {
  /** Tirar os distratores transformaria o puzzle em formulário. */
  it('existe pelo menos um distrator, e ele não aponta para campo nenhum', () => {
    expect(DISTRATORES.length).toBeGreaterThan(0);
  });

  it('todo trecho com campo aponta para um campo que existe', () => {
    const ids = new Set(def.campos.map((c) => c.id));
    for (const f of REAIS) {
      expect(ids.has(f.campo ?? ''), `trecho '${f.id}'`).toBe(true);
    }
  });

  it('há exatamente um trecho real por campo: nenhum campo fica sem resposta', () => {
    for (const campo of def.campos) {
      expect(REAIS.filter((f) => f.campo === campo.id), `campo '${campo.id}'`).toHaveLength(1);
    }
  });

  it('os campos e o distrator têm texto visível não vazio', () => {
    for (const campo of def.campos) expect(campo.rotulo.trim()).not.toBe('');
    expect(def.textoDistrator.trim()).not.toBe('');
    expect(def.textoErro.trim()).not.toBe('');
  });
});

describe('o distrator avisa, e não entra em lugar nenhum', () => {
  const distrator = DISTRATORES[0];
  const campo = def.campos[0];

  /** A MUTAÇÃO: remover o aviso do caso `campo === null` reprova aqui. */
  it('tentar colocar o distrator dá o texto do distrator, não o de erro comum', () => {
    if (!distrator || !campo) return;
    const estado = tocar(
      estadoInicialEstruturar(),
      { tipo: 'clicarTrecho', id: distrator.id },
      { tipo: 'clicarCampo', id: campo.id },
    );
    expect(estado.aviso).toEqual({ tipo: 'erro', texto: def.textoDistrator });
    expect(estado.colocados).toEqual({});
  });

  it('o distrator não entra em NENHUM dos campos', () => {
    if (!distrator) return;
    for (const c of def.campos) {
      const estado = tocar(
        estadoInicialEstruturar(),
        { tipo: 'clicarTrecho', id: distrator.id },
        { tipo: 'clicarCampo', id: c.id },
      );
      expect(estado.colocados[c.id], `campo '${c.id}'`).toBeUndefined();
    }
  });

  it('o distrator é solto da mão: não faz sentido procurar a casa dele', () => {
    if (!distrator || !campo) return;
    const estado = tocar(
      estadoInicialEstruturar(),
      { tipo: 'clicarTrecho', id: distrator.id },
      { tipo: 'clicarCampo', id: campo.id },
    );
    expect(estado.selecionado).toBeNull();
  });
});

describe('trecho certo em campo errado avisa — o defeito novo consertado aqui', () => {
  const real = REAIS[0];

  /** A MUTAÇÃO: `aviso: null` no caso `campo !== acao.id` reprova aqui. */
  it('o campo errado recusa com o texto de erro do conteúdo', () => {
    if (!real) return;
    const errado = def.campos.find((c) => c.id !== real.campo);
    if (!errado) return;

    const estado = tocar(
      estadoInicialEstruturar(),
      { tipo: 'clicarTrecho', id: real.id },
      { tipo: 'clicarCampo', id: errado.id },
    );
    expect(estado.aviso).toEqual({ tipo: 'erro', texto: def.textoErro });
    expect(estado.colocados[errado.id]).toBeUndefined();
    expect(estado.sacudindo).toBe(errado.id);
  });

  it('o trecho fica na mão: quem errou a casa não perdeu a frase', () => {
    if (!real) return;
    const errado = def.campos.find((c) => c.id !== real.campo);
    if (!errado || real.campo === null) return;

    const estado = tocar(
      estadoInicialEstruturar(),
      { tipo: 'clicarTrecho', id: real.id },
      { tipo: 'clicarCampo', id: errado.id },
      { tipo: 'clicarCampo', id: real.campo },
    );
    expect(estado.colocados[real.campo]).toBe(real.id);
  });
});

describe('a proposta se estrutura', () => {
  it('os três trechos reais nos três campos completam e avisam o acerto', () => {
    let estado = estadoInicialEstruturar();
    for (const f of REAIS) {
      if (f.campo === null) continue;
      estado = tocar(
        estado,
        { tipo: 'clicarTrecho', id: f.id },
        { tipo: 'clicarCampo', id: f.campo },
      );
    }
    expect(estruturarCompleto(def, estado)).toBe(true);
    expect(estado.aviso).toEqual({ tipo: 'acerto', texto: TEXTO_ACERTO });
  });

  it('os trechos deslocados uma casa não completam nada', () => {
    const casas = def.campos.map((c) => c.id);
    let estado = estadoInicialEstruturar();
    REAIS.forEach((f, i) => {
      const casa = casas[(i + 1) % casas.length];
      if (casa === undefined) return;
      estado = tocar(
        estado,
        { tipo: 'clicarTrecho', id: f.id },
        { tipo: 'clicarCampo', id: casa },
      );
    });
    expect(estruturarCompleto(def, estado)).toBe(false);
  });
});

describe('o layout cabe na tela — a auditoria mediu ~954px contra 952 úteis', () => {
  it('a área do puzzle cabe no orçamento da moldura', () => {
    const g = geometriaDe(def);
    expect(g.largura).toBeLessThanOrEqual(LARGURA_UTIL);
    expect(g.altura).toBeLessThanOrEqual(ALTURA_CORPO);
  });
});
