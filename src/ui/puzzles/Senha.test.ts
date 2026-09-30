/**
 * A senha avisa quando não abre, e o foco não engole mais caractere.
 *
 * Dois defeitos medidos (spec 03 §2), e os dois são testáveis sem navegador
 * porque as duas regras são funções puras:
 *
 * 1. `avaliarSenha` — antes não havia veredito nenhum para senha errada: a tela
 *    ficava idêntica. A MUTAÇÃO que prova: fazer `avaliarSenha` devolver 'certa'
 *    quando só o primeiro campo bate, ou nunca devolver 'errada'.
 *
 * 2. `focoPorTecla` — o bug antigo movia o foco dentro do `onChange` sempre que o
 *    valor batia com o gabarito, e a tecla seguinte caía no campo que estava
 *    perdendo o foco. A MUTAÇÃO que prova: fazer `focoPorTecla` avançar em
 *    qualquer tecla. O teste abaixo fixa que caractere NENHUM move o foco.
 *
 * Não há teste de digitação de verdade aqui e é honesto dizer por quê: a suíte
 * roda em `environment: 'node'`, sem DOM, e nenhuma biblioteca de interação está
 * instalada. O que se afirma é a regra que o componente usa — e ele não tem outra
 * fonte de decisão além dela.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleSenha } from '../../domain/types';

import { TEXTO_ACERTO } from './moldura';
import {
  avaliarSenha,
  avisoDaSenha,
  contarPreenchidos,
  focoPorTecla,
  geometriaDe,
} from './Senha';
import { ALTURA_CORPO, LARGURA_UTIL } from './moldura';

const def = PUZZLES.senha as PuzzleSenha;
const CERTA = [...def.gabarito];

describe('o conteúdo da senha diz o que cada campo espera', () => {
  it('há um campo por pedaço do gabarito', () => {
    expect(def.campos).toHaveLength(def.gabarito.length);
  });

  /**
   * A comparação é por ÍNDICE, e a auditoria apontou isso como sensibilidade à
   * ordem. O rótulo visível é o que torna a ordem justa: se um campo perder o
   * rótulo, a pessoa volta a ter de adivinhar em que ordem os pedaços entram.
   */
  it('todo campo tem rótulo visível não vazio', () => {
    for (const campo of def.campos) {
      expect(campo.rotulo.trim(), `campo '${campo.id}'`).not.toBe('');
    }
  });
});

describe('senha errada AVISA', () => {
  /** A MUTAÇÃO: qualquer relaxamento em `avaliarSenha` reprova aqui. */
  it('um pedaço trocado dá errada, não certa', () => {
    const errada = [...CERTA];
    errada[1] = 'nada-a-ver';
    expect(avaliarSenha(errada, def.gabarito)).toBe('errada');
  });

  it('todos os pedaços trocados dá errada', () => {
    expect(avaliarSenha(def.gabarito.map(() => 'x'), def.gabarito)).toBe('errada');
  });

  it('errada produz o texto de erro do conteúdo, e certa produz o de acerto', () => {
    const errada = [...CERTA];
    errada[0] = 'x';
    expect(avisoDaSenha(avaliarSenha(errada, def.gabarito), def.textoErro)).toEqual({
      tipo: 'erro',
      texto: def.textoErro,
    });
    expect(avisoDaSenha(avaliarSenha(CERTA, def.gabarito), def.textoErro)).toEqual({
      tipo: 'acerto',
      texto: TEXTO_ACERTO,
    });
  });

  /**
   * O aviso NÃO aparece no meio da digitação. Se aparecesse, o apresentador
   * aprenderia a ignorar a linha de aviso — e ela é a linha em que os cinco
   * puzzles passaram a confiar.
   */
  it('campo em branco é incompleta, não errada: quem está digitando não errou', () => {
    const meio = CERTA.map((v, i) => (i === CERTA.length - 1 ? '' : v));
    expect(avaliarSenha(meio, def.gabarito)).toBe('incompleta');
    expect(avisoDaSenha('incompleta', def.textoErro)).toBeNull();
  });

  it('a senha certa abre', () => {
    expect(avaliarSenha(CERTA, def.gabarito)).toBe('certa');
  });

  it('caixa e espaço em volta não reprovam quem digitou certo', () => {
    const bagunçada = CERTA.map((v) => ` ${v.toUpperCase()} `);
    expect(avaliarSenha(bagunçada, def.gabarito)).toBe('certa');
  });

  it('o progresso conta campos preenchidos, não acertos', () => {
    expect(contarPreenchidos(['x', '', ' '])).toBe(1);
    expect(contarPreenchidos(CERTA)).toBe(def.gabarito.length);
  });
});

describe('o foco não anda por conteúdo: é isso que engolia caractere', () => {
  const total = def.campos.length;

  /**
   * A MUTAÇÃO: fazer `focoPorTecla` avançar quando o valor bate com o gabarito
   * (o comportamento antigo) reprova este bloco inteiro.
   */
  it('tecla de caractere nenhuma move o foco', () => {
    for (const tecla of ['N', 'O', 'V', '1', '2', '0', '3', 'a', ' ', 'Backspace', 'Shift']) {
      expect(focoPorTecla(tecla, 0, total), `tecla '${tecla}'`).toBeNull();
    }
  });

  it('seta não move o foco: dentro de um campo de texto ela é do cursor', () => {
    expect(focoPorTecla('ArrowRight', 0, total)).toBeNull();
    expect(focoPorTecla('ArrowLeft', 1, total)).toBeNull();
  });

  it('Enter avança um campo, e só', () => {
    expect(focoPorTecla('Enter', 0, total)).toBe(1);
    expect(focoPorTecla('Enter', 1, total)).toBe(2);
  });

  it('Enter no último campo não sai da tela', () => {
    expect(focoPorTecla('Enter', total - 1, total)).toBeNull();
  });
});

describe('o layout cabe na tela', () => {
  it('a área do puzzle cabe no orçamento da moldura', () => {
    const g = geometriaDe(def);
    expect(g.largura).toBeLessThanOrEqual(LARGURA_UTIL);
    expect(g.altura).toBeLessThanOrEqual(ALTURA_CORPO);
  });
});
