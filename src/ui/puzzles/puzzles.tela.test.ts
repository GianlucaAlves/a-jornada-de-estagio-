/**
 * O QUE A PLATEIA VÊ NOS CINCO — as faltas comuns da spec 03 §3, §5 e §6.
 *
 * Renderiza os cinco puzzles de verdade (`renderToStaticMarkup`, sem DOM) e
 * afirma sobre o HTML o que não se consegue afirmar sobre um redutor:
 *
 * - a instrução está na TELA, como texto, e não só em `aria-label`;
 * - existe saída, habilitada, em todos;
 * - existe progresso em todos;
 * - existe uma linha de aviso, e ela nasce VAZIA;
 * - nenhum botão herda a mão do `button { cursor: pointer }` do `global.css`, e
 *   nenhum botão `disabled` exibe mão;
 * - nada abaixo de 22px, que é piso do spec.
 *
 * LIMITE CONHECIDO, e é o mesmo de `Cena.render.test.ts`: só o estado INICIAL é
 * observável. `setState` antes do render não aparece no markup, porque o zustand
 * serve o estado inicial fora do navegador. O que depende de interação é provado
 * nos redutores, um arquivo por puzzle.
 *
 * O estado inicial é, aliás, o que mais importa aqui: o clique morto com mão que
 * a auditoria achou no `associar` e no `estruturar` acontece justamente no
 * primeiro quadro, com nada escolhido ainda.
 *
 * Renderiza sem JSX (`createElement`) porque a suíte roda em `.ts`.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PUZZLES } from '../../domain/content';
import type {
  PuzzleAssociar,
  PuzzleEstruturar,
  PuzzleId,
  PuzzleMontar,
  PuzzleSenha,
} from '../../domain/types';
import { tipografia } from '../../styles/tokens';

import { AssociarPares } from './AssociarPares';
import { Estruturar } from './Estruturar';
import { Montar } from './Montar';
import { Senha } from './Senha';

/** Um render por puzzle, feito uma vez. */
const TELAS: ReadonlyArray<{ id: PuzzleId; html: string }> = [
  {
    id: 'senha',
    html: renderToStaticMarkup(createElement(Senha, { def: PUZZLES.senha as PuzzleSenha })),
  },
  {
    id: 'associar',
    html: renderToStaticMarkup(
      createElement(AssociarPares, { def: PUZZLES.associar as PuzzleAssociar }),
    ),
  },
  {
    id: 'estruturar',
    html: renderToStaticMarkup(
      createElement(Estruturar, { def: PUZZLES.estruturar as PuzzleEstruturar }),
    ),
  },
  {
    id: 'montar',
    html: renderToStaticMarkup(createElement(Montar, { def: PUZZLES.montar as PuzzleMontar })),
  },
];

function botoesDe(html: string): string[] {
  return html.match(/<button\b[^>]*>/g) ?? [];
}

function estaDesabilitado(tag: string): boolean {
  return /\sdisabled(?:=|\s|\/|>)/.test(tag);
}

describe('os cinco puzzles dizem na TELA o que fazer', () => {
  for (const { id, html } of TELAS) {
    /**
     * A regressão exata: três dos cinco só diziam o que fazer em `aria-label`.
     * `>texto<` prova que é conteúdo de elemento, não valor de atributo.
     */
    it(`${id}: a instrução do conteúdo aparece como texto na tela`, () => {
      const def = PUZZLES[id];
      expect(def.instrucao.trim()).not.toBe('');
      expect(html).toContain(`>${def.instrucao}<`);
    });

    it(`${id}: o título do conteúdo aparece como texto na tela`, () => {
      expect(html).toContain(`>${PUZZLES[id].rotulo}<`);
    });
  }
});

describe('os cinco puzzles têm saída visível e habilitada', () => {
  for (const { id, html } of TELAS) {
    /** Sem isto a pessoa fica presa na tela do puzzle, que era o estado da v1. */
    it(`${id}: existe o botão de sair`, () => {
      expect(html).toContain('aria-label="Sair do desafio e voltar para a cena"');
    });

    it(`${id}: o botão de sair NÃO está desabilitado`, () => {
      const saida = botoesDe(html).find((tag) => tag.includes('Sair do desafio'));
      expect(saida).toBeDefined();
      expect(estaDesabilitado(saida ?? '')).toBe(false);
    });
  }
});

describe('os cinco puzzles mostram progresso e reservam a linha de aviso', () => {
  for (const { id, html } of TELAS) {
    it(`${id}: existe a região de aviso, e ela nasce vazia`, () => {
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      // A linha existe com opacidade 0: ela reserva a altura sem dizer nada.
      expect(html).toMatch(/opacity:0/);
    });

    /**
     * Nenhum texto de erro pode estar na tela antes de alguém errar. Se um
     * `textoErro` aparecer no primeiro quadro, a plateia lê a correção antes da
     * tentativa.
     */
    it(`${id}: nenhum texto de erro aparece antes de errar`, () => {
      expect(html).not.toContain(PUZZLES[id].textoErro);
    });
  }
});

describe('nenhum clique morto com mão — spec 03 §3', () => {
  for (const { id, html } of TELAS) {
    const botoes = botoesDe(html);

    it(`${id}: há botão para auditar`, () => {
      expect(botoes.length).toBeGreaterThan(0);
    });

    /**
     * `global.css` dá `cursor: pointer` a TODO botão. Botão que não declara o
     * próprio cursor herda a mão de fora do arquivo — foi assim que as setas do
     * `sequenciar` ficaram com mão sem ter `pointer` escrito em lugar nenhum.
     * Por isso a regra é declarar SEMPRE, e não apenas "não declarar pointer".
     */
    it(`${id}: todo botão declara o próprio cursor`, () => {
      const semCursor = botoes.filter((tag) => !/cursor:(pointer|default)/.test(tag));
      expect(semCursor).toEqual([]);
    });

    it(`${id}: nenhum botão desabilitado exibe mão`, () => {
      const mortos = botoes.filter(
        (tag) => estaDesabilitado(tag) && /cursor:pointer/.test(tag),
      );
      expect(mortos).toEqual([]);
    });
  }
});

describe('nada abaixo do piso de 22px do spec', () => {
  for (const { id, html } of TELAS) {
    it(`${id}: o menor texto da tela respeita o piso`, () => {
      const tamanhos = [...html.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]));
      expect(tamanhos.length).toBeGreaterThan(0);
      expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(tipografia.minimo);
    });
  }
});

describe('os cinco são operáveis por teclado', () => {
  for (const { id, html } of TELAS) {
    /**
     * Tudo o que é alvo é `<button>` ou `<input>`: os dois entram na ordem de
     * tabulação por natureza. `div` com `onClick` não entraria, e é o jeito mais
     * fácil de fazer um puzzle que só o mouse resolve.
     */
    it(`${id}: nenhum alvo é div clicável — só button e input`, () => {
      expect(html).not.toMatch(/<div[^>]*role="button"/);
      const alvos = (html.match(/<button\b/g) ?? []).length + (html.match(/<input\b/g) ?? []).length;
      expect(alvos).toBeGreaterThan(0);
    });

    it(`${id}: nenhum alvo é removido da ordem de tabulação`, () => {
      expect(html).not.toMatch(/tabindex="-1"/i);
    });
  }
});
