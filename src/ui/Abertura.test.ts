/**
 * A TELA DE ABERTURA: a escolha explícita (ADR-018).
 *
 * O defeito que ela evita é o pior possível numa apresentação ao vivo: abrir o
 * jogo e ele começar na fase 4 por causa de um save do ensaio de ontem. Por isso
 * o que se afirma aqui não é só "os botões aparecem", é:
 *
 * 1. com save, aparecem as DUAS opções, e a tela diz PARA ONDE o "Continuar"
 *    continua — "Continuar" sem dizer a fase é a mesma surpresa com um clique de
 *    atraso;
 * 2. sem save, aparece só o começo, e "Continuar" não existe na tela;
 * 3. "Começar do início" ZERA de verdade e apaga o save — um reinício que deixa
 *    o save antigo no navegador é uma promessa quebrada no próximo F5;
 * 4. entrar na abertura PELA STORE destruiria o save. Isto é um teste de
 *    documentação: prova por que a bandeira da abertura é local em `App` e não
 *    `tela: 'abertura'`, para que ninguém "simplifique" de volta.
 *
 * O armazenamento é falso e instalado em `globalThis`: a suíte roda em `node`,
 * onde `localStorage` não existe, e a store lê o armazenamento PREGUIÇOSAMENTE
 * justamente para permitir isto.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../App';
import { BLOCOS, ITENS, LUGARES, PUZZLES } from '../domain/content';
import type { BlocoId, ItemId, LugarId, PuzzleId } from '../domain/types';
import { existeProgressoSalvo, progressoSalvo, useJogo } from '../store/jogo';
import { Abertura, opcoesDaAbertura } from './Abertura';

/**
 * Espelho da chave e da versão de `src/store/jogo.ts`, que não as exporta.
 *
 * Duplicação consciente e verificada: o primeiro teste abaixo prova que o save
 * montado com estes valores é ACEITO pela store. Se a versão do formato subir, é
 * esse teste que cai — e cair ali é o aviso certo, porque um save da versão
 * anterior tem de ser descartado mesmo.
 */
const CHAVE = 'apresentacao-jogo/progresso';
const VERSAO = 2;

const BLOCO_SALVO: BlocoId = 4;

function armazenamentoFalso(): Storage {
  const mapa = new Map<string, string>();
  return {
    get length(): number {
      return mapa.size;
    },
    clear: () => mapa.clear(),
    getItem: (k: string) => mapa.get(k) ?? null,
    key: (i: number) => [...mapa.keys()][i] ?? null,
    removeItem: (k: string) => {
      mapa.delete(k);
    },
    setItem: (k: string, v: string) => {
      mapa.set(k, v);
    },
  };
}

/** Um save VÁLIDO: as chaves têm de ser exatamente as de hoje, ou a store o descarta. */
function saveDeEnsaio(): string {
  const lugares = {} as Record<LugarId, 'silhueta' | 'destravado' | 'concluido'>;
  for (const id of Object.keys(LUGARES) as LugarId[]) lugares[id] = 'destravado';
  const itens = {} as Record<ItemId, 'ausente' | 'presente' | 'consumido'>;
  for (const id of Object.keys(ITENS) as ItemId[]) itens[id] = 'ausente';
  const puzzles = {} as Record<PuzzleId, 'fechado' | 'liberado' | 'resolvido'>;
  for (const id of Object.keys(PUZZLES) as PuzzleId[]) puzzles[id] = 'fechado';

  return JSON.stringify({
    versao: VERSAO,
    bloco: BLOCO_SALVO,
    tela: { tipo: 'mapa' },
    lugares,
    nomesRevelados: Object.keys(LUGARES),
    itens,
    skills: ['coragem-perguntar'],
    puzzles,
    hotspotsFeitos: ['algum-hotspot'],
    dialogosConcluidos: ['alguma-conversa'],
    sprite: 'ana-confiante',
  });
}

function instalar(comSave: boolean): Storage {
  const armazem = armazenamentoFalso();
  if (comSave) armazem.setItem(CHAVE, saveDeEnsaio());
  (globalThis as { localStorage?: Storage }).localStorage = armazem;
  return armazem;
}

function desinstalar(): void {
  delete (globalThis as { localStorage?: Storage }).localStorage;
}

afterEach(() => {
  desinstalar();
});

describe('o save de ensaio é reconhecido pela store', () => {
  it('a chave e a versão espelhadas aqui são as que a store aceita', () => {
    instalar(true);
    expect(progressoSalvo()).not.toBeNull();
    expect(progressoSalvo()?.bloco).toBe(BLOCO_SALVO);
  });

  it('sem save, não há progresso a retomar', () => {
    instalar(false);
    expect(existeProgressoSalvo()).toBe(false);
  });

  /**
   * Save EXISTE não é a mesma pergunta que ALGO ACONTECEU. O save é gravado a
   * cada mudança, então existe desde o primeiro clique e também logo depois de
   * um reinício — oferecer "Continuar" para voltar ao ponto zero é uma escolha
   * sem sentido.
   */
  it('save de progresso zero não conta como progresso', () => {
    const armazem = instalar(false);
    const zerado = JSON.parse(saveDeEnsaio()) as Record<string, unknown>;
    zerado.bloco = 1;
    zerado.skills = [];
    zerado.hotspotsFeitos = [];
    zerado.dialogosConcluidos = [];
    armazem.setItem(CHAVE, JSON.stringify(zerado));
    expect(existeProgressoSalvo()).toBe(false);
  });
});

describe('o que a abertura oferece', () => {
  it('sem progresso: nenhuma escolha a fazer', () => {
    const opcoes = opcoesDaAbertura(null);
    expect(opcoes.temProgresso).toBe(false);
    expect(opcoes.bloco).toBeNull();
    expect(opcoes.tituloDoBloco).toBe('');
  });

  it('com progresso: diz a fase e o título dela', () => {
    const opcoes = opcoesDaAbertura({ bloco: BLOCO_SALVO });
    expect(opcoes.temProgresso).toBe(true);
    expect(opcoes.bloco).toBe(BLOCO_SALVO);
    expect(opcoes.tituloDoBloco).toBe(BLOCOS[BLOCO_SALVO].titulo);
    expect(opcoes.tituloDoBloco.length).toBeGreaterThan(0);
  });
});

describe('a abertura na tela', () => {
  it('com save: as duas opções, e a fase salva escrita por extenso', () => {
    instalar(true);
    const html = renderToStaticMarkup(
      createElement(Abertura, { aoEntrar: () => undefined }),
    );
    expect(html).toContain('Continuar');
    expect(html).toContain('Começar do início');
    expect(html).toContain(BLOCOS[BLOCO_SALVO].titulo);
    expect(html).toContain(`fase ${BLOCO_SALVO}`);
  });

  it('sem save: só começa, e "Continuar" não existe na tela', () => {
    instalar(false);
    const html = renderToStaticMarkup(
      createElement(Abertura, { aoEntrar: () => undefined }),
    );
    expect(html).toContain('Começar');
    expect(html).not.toContain('Continuar');
    expect(html).not.toContain('progresso salvo');
  });

  it('nenhum texto da abertura desce abaixo do piso de 22px', () => {
    instalar(true);
    const html = renderToStaticMarkup(
      createElement(Abertura, { aoEntrar: () => undefined }),
    );
    const tamanhos = [...html.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]));
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(22);
  });

  /**
   * Os dois botões com a mesma largura: botões de tamanhos diferentes lado a
   * lado sugerem que um deles é o certo, e a escolha é deliberadamente neutra —
   * continuar não é melhor que recomeçar, depende do que o apresentador quer.
   */
  it('as duas opções têm a mesma largura mínima', () => {
    instalar(true);
    const html = renderToStaticMarkup(
      createElement(Abertura, { aoEntrar: () => undefined }),
    );
    const larguras = [...html.matchAll(/min-width:(\d+)px/g)].map((m) => Number(m[1]));
    expect(larguras.length).toBeGreaterThanOrEqual(2);
    expect(new Set(larguras).size).toBe(1);
  });
});

describe('toda carga de página cai na abertura', () => {
  /** F5 é o caminho de reinício durante a apresentação. */
  it('o App monta a abertura, e nada do jogo por trás', () => {
    instalar(true);
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain('aria-label="Abertura"');
    // Nenhum overlay persistente montado: um efeito de montagem que escrevesse
    // na store apagaria o save antes da escolha.
    expect(html).not.toContain('aria-label="Itens"');
    expect(html).not.toContain('aria-label="O que eu aprendi"');
    expect(html).not.toContain('aria-label="Voltar ao mapa"');
  });
});

describe('"Começar do início" zera de verdade', () => {
  it('reiniciar apaga o save e devolve o estado inicial', () => {
    instalar(true);
    expect(existeProgressoSalvo()).toBe(true);

    useJogo.getState().reiniciar();

    expect(existeProgressoSalvo()).toBe(false);
    const estado = useJogo.getState();
    expect(estado.bloco).toBe(1);
    expect(estado.skills).toEqual([]);
    expect(estado.hotspotsFeitos).toEqual([]);
    expect(estado.dialogosConcluidos).toEqual([]);
    expect(estado.sprite).toBe('ana-encolhida');
    expect(Object.values(estado.itens).every((e) => e === 'ausente')).toBe(true);
    expect(Object.values(estado.puzzles).every((e) => e === 'fechado')).toBe(true);
  });

  it('"Continuar" retoma a fase salva', () => {
    instalar(true);
    useJogo.getState().reiniciar();
    // `reiniciar` apagou o save; reinstala para provar a retomada.
    instalar(true);

    useJogo.getState().continuar();

    expect(useJogo.getState().bloco).toBe(BLOCO_SALVO);
    expect(useJogo.getState().sprite).toBe('ana-confiante');
    expect(useJogo.getState().dialogosConcluidos).toEqual(['alguma-conversa']);
  });
});

/**
 * TESTE DE DOCUMENTAÇÃO — por que a abertura não passa pela store.
 *
 * A store grava a cada mudança e, na carga da página, o estado é o inicial. O
 * primeiro `set` — qualquer um, inclusive trocar a tela para 'abertura' —
 * sobrescreve o progresso salvo com zero progresso, e `continuar()`, que relê o
 * armazenamento, deixa de ter o que ler. Se este teste passar a falhar porque a
 * store mudou, a bandeira local em `App` pode ser revista; enquanto ele passar,
 * ela é obrigatória.
 */
describe('entrar na abertura pela store destruiria o save', () => {
  it('um único set na carga da página apaga o progresso', () => {
    instalar(true);
    expect(existeProgressoSalvo()).toBe(true);

    // O estado da store é o inicial nesta altura da carga da página.
    useJogo.setState({ bloco: 1, skills: [], hotspotsFeitos: [], dialogosConcluidos: [] });
    useJogo.getState().irParaTela({ tipo: 'abertura' });

    expect(existeProgressoSalvo()).toBe(false);
  });
});
