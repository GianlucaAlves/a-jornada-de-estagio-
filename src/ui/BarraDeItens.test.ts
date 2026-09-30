/**
 * A DESCRIÇÃO DE ITEM FECHA — pelos três caminhos (ADR-013).
 *
 * O defeito que isto tranca não era visual, era TEMPORAL: `descricaoDe` era
 * estado local escrito num lugar e apagado só quando o item saía da barra.
 * Sobrevivia a troca de cena, ida ao mapa, diálogo e puzzle — o bloco inteiro.
 * E como ficava numa camada abaixo do diálogo, escondia-se durante a fala e
 * REAPARECIA depois, que era o que dava a sensação de ter grudado. Nada disso
 * aparece num markup: só aparece numa sequência de eventos, e é isso que se
 * exercita aqui.
 *
 * Junto vem o efeito colateral que existia: o mesmo clique chamava
 * `selecionarItem`, que ALTERNA, e `setDescricaoDe`, que era idempotente —
 * clicar duas vezes desselecionava o item e mantinha a descrição. Dois estados
 * para o mesmo gesto, divergindo no segundo clique.
 */
import { ITENS } from '../domain/content';
import type { ItemId } from '../domain/types';
import { espera } from '../styles/tokens';
import { proximaDescricao } from './BarraDeItens';

const IDS = Object.keys(ITENS) as ItemId[];
const PRIMEIRO = IDS[0];
const SEGUNDO = IDS[1];

describe('os três caminhos de fechamento', () => {
  it('há itens no conteúdo para exercitar', () => {
    expect(IDS.length).toBeGreaterThanOrEqual(2);
    expect(PRIMEIRO).toBeDefined();
    expect(SEGUNDO).toBeDefined();
  });

  /** Caminho 1: clique no MESMO item fecha. */
  it('clicar no mesmo item fecha a descrição', () => {
    if (!PRIMEIRO) throw new Error('sem item');
    const aberta = proximaDescricao(null, { tipo: 'clique-item', itemId: PRIMEIRO });
    expect(aberta).toBe(PRIMEIRO);
    expect(proximaDescricao(aberta, { tipo: 'clique-item', itemId: PRIMEIRO })).toBeNull();
  });

  /** Caminho 2: clique em OUTRA COISA fecha. */
  it('clicar fora da barra fecha a descrição', () => {
    if (!PRIMEIRO) throw new Error('sem item');
    expect(proximaDescricao(PRIMEIRO, { tipo: 'clique-fora' })).toBeNull();
  });

  /** Caminho 3: o tempo fecha. */
  it('a descrição fecha sozinha depois de alguns segundos', () => {
    if (!PRIMEIRO) throw new Error('sem item');
    expect(proximaDescricao(PRIMEIRO, { tipo: 'tempo' })).toBeNull();
    // "Alguns segundos" é isto, e não um valor de animação: a janela
    // 600–1200ms de `duracao` vale para movimento, não para texto na tela.
    expect(espera.descricaoDeItemMs).toBeGreaterThanOrEqual(3000);
    expect(espera.descricaoDeItemMs).toBeLessThanOrEqual(10000);
  });

  it('clicar em OUTRO item troca a descrição em vez de fechar', () => {
    if (!PRIMEIRO || !SEGUNDO) throw new Error('sem itens');
    expect(proximaDescricao(PRIMEIRO, { tipo: 'clique-item', itemId: SEGUNDO })).toBe(SEGUNDO);
  });

  /**
   * O caminho que já existia, e que era o ÚNICO: item consumido no meio da
   * leitura não deixa descrição órfã.
   */
  it('item que sai da barra leva a descrição com ele', () => {
    if (!PRIMEIRO || !SEGUNDO) throw new Error('sem itens');
    expect(proximaDescricao(PRIMEIRO, { tipo: 'itens-mudaram', itens: [SEGUNDO] })).toBeNull();
    expect(proximaDescricao(PRIMEIRO, { tipo: 'itens-mudaram', itens: [PRIMEIRO, SEGUNDO] })).toBe(
      PRIMEIRO,
    );
    expect(proximaDescricao(null, { tipo: 'itens-mudaram', itens: IDS })).toBeNull();
  });

  /**
   * A REGRESSÃO EXATA, em uma asserção: dois cliques no mesmo item têm de deixar
   * a tela LIMPA. Antes, o segundo clique desselecionava o item e a descrição
   * ficava.
   */
  it('dois cliques no mesmo item não deixam nada na tela', () => {
    if (!PRIMEIRO) throw new Error('sem item');
    let estado: ItemId | null = null;
    estado = proximaDescricao(estado, { tipo: 'clique-item', itemId: PRIMEIRO });
    estado = proximaDescricao(estado, { tipo: 'clique-item', itemId: PRIMEIRO });
    expect(estado).toBeNull();
  });

  /**
   * Nenhum caminho reabre nada. Uma descrição fechada só volta por clique em
   * item — é o que garante que ela não reapareça depois do diálogo, que era o
   * sintoma mais visível do defeito antigo.
   */
  it('nenhum evento reabre uma descrição já fechada, exceto clicar num item', () => {
    expect(proximaDescricao(null, { tipo: 'clique-fora' })).toBeNull();
    expect(proximaDescricao(null, { tipo: 'tempo' })).toBeNull();
    expect(proximaDescricao(null, { tipo: 'itens-mudaram', itens: IDS })).toBeNull();
    if (PRIMEIRO) {
      expect(proximaDescricao(null, { tipo: 'clique-item', itemId: PRIMEIRO })).toBe(PRIMEIRO);
    }
  });
});
