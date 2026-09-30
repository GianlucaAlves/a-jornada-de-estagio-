/**
 * A tira de quadros anda para DENTRO do elemento.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * Os NPCs piscavam na tela — apareciam e desapareciam. A causa: o keyframe
 * deslocava `background-position-x` para `-200%` (tira de 2) e `-400%` (tira
 * de 4). Em `background-position`, porcentagem resolve contra
 * (largura do elemento − largura da imagem); com a tira sendo N vezes maior
 * que a caixa, essa diferença é NEGATIVA, então porcentagem negativa empurra a
 * imagem para a DIREITA, fora do elemento. Metade do ciclo o sprite não estava
 * em lugar nenhum.
 *
 * Havia um segundo defeito escondido atrás do primeiro: mesmo com o sinal
 * certo, os quadros de uma tira de N caem em 0%, 100/(N−1)%, … 100%. Com N=2,
 * `steps(2)` de 0% a 100% entrega 0% e 50% — meio quadro. Porcentagem é a
 * unidade errada aqui; pixel é exato.
 *
 * O ponto cego que deixou isso passar: `SpriteAnimado` sonda a tira com
 * `Image()` e, fora do navegador, a sondagem devolve `false`. Todo teste de
 * render exercitava o ramo SEM tira, e o estilo da tira nunca entrava no
 * markup. Por isso o que se testa aqui é a função pura `estiloDaTira`, e não o
 * componente.
 */
import { readFileSync } from 'node:fs';

import { arte, quadro } from '../styles/tokens';
import { atrasoDoId, estiloDaTira } from './SpriteAnimado';

/**
 * O CSS é lido do disco, não importado com `?raw`.
 *
 * `?raw` foi a primeira tentativa e devolveu string VAZIA sob o vitest (o
 * plugin de CSS atende a extensão antes da query), o que fez o guard de
 * regressão passar contra nada — verde falso, que é pior que teste ausente.
 * Ler o arquivo é chato e é honesto.
 */
const cssGlobal = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf-8');

describe('a tira de quadros desloca em pixel, para dentro do elemento', () => {
  it('o fim da tira é negativo e vale exatamente N x a largura do quadro', () => {
    const largura = arte.personagem.largura;
    for (const n of [2, 4]) {
      const estilo = estiloDaTira('/assets/x-idle.png', n, largura, arte.personagem.altura) as Record<
        string,
        unknown
      >;
      expect(estilo['--tira-fim']).toBe(`${-n * largura}px`);
    }
  });

  it('a tira é esticada em N x 100%, para o quadro casar com a caixa', () => {
    const estilo = estiloDaTira('/assets/x-idle.png', 4, 200, 336);
    expect(estilo.backgroundSize).toBe('400% 100%');
    expect(estilo.width).toBe(200);
    expect(estilo.height).toBe(336);
  });

  it('o deslocamento cresce com o número de quadros, nunca encolhe', () => {
    const l = 200;
    const dois = Number(String((estiloDaTira('/a.png', 2, l, 1) as Record<string, unknown>)['--tira-fim']).replace('px', ''));
    const quatro = Number(String((estiloDaTira('/a.png', 4, l, 1) as Record<string, unknown>)['--tira-fim']).replace('px', ''));
    expect(dois).toBeLessThan(0);
    expect(quatro).toBeLessThan(dois);
  });

  /**
   * Guard direto contra a regressão: nenhum keyframe pode voltar a mover
   * `background-position` por porcentagem NEGATIVA. É a assinatura exata do
   * bug e custa uma expressão regular.
   */
  it('nenhum keyframe move background-position por porcentagem negativa', () => {
    // prova que o arquivo foi lido: um guard contra string vazia passa sempre
    expect(cssGlobal.length).toBeGreaterThan(1000);
    const ofensas = cssGlobal.match(/background-position[^;]*:\s*-[\d.]+%/g) ?? [];
    expect(ofensas).toEqual([]);
  });

  it('o keyframe da tira usa a variável de deslocamento em pixel', () => {
    expect(cssGlobal).toContain('var(--tira-fim');
  });
});

describe('o atraso por id dessincroniza sem sortear', () => {
  it('é estável para o mesmo id', () => {
    expect(atrasoDoId('npc-rafael')).toBe(atrasoDoId('npc-rafael'));
  });

  it('cai dentro do máximo declarado em tokens', () => {
    for (const id of ['npc-rafael', 'npc-claudia', 'npc-tiago', 'npc-bianca', 'npc-marcos']) {
      const ms = atrasoDoId(id);
      expect(ms).toBeGreaterThanOrEqual(0);
      expect(ms).toBeLessThanOrEqual(quadro.atrasoMaximoMs);
    }
  });

  it('dá valores diferentes para os cinco NPCs, senão eles respiram em bloco', () => {
    const atrasos = ['npc-rafael', 'npc-claudia', 'npc-tiago', 'npc-bianca', 'npc-marcos'].map(
      atrasoDoId,
    );
    expect(new Set(atrasos).size).toBe(atrasos.length);
  });
});
