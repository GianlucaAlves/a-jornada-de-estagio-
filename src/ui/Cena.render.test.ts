/**
 * A CENA RENDERIZA ARTE — não placa de texto.
 *
 * Quem desenha por coordenada não vê o que fez, e este projeto roda em batch:
 * não há navegador aberto para conferir. Este teste é o substituto honesto do
 * olhar. Renderiza a cena de verdade (`renderToStaticMarkup`, sem DOM) e afirma
 * sobre o HTML as três coisas que a frente prometeu:
 *
 * 1. cada hotspot é um botão NU envolvendo arte, com `aria-label` intacto;
 * 2. o rótulo NÃO está dentro do botão — saiu para a linha do rodapé;
 * 3. a linha do rodapé existe UMA vez, e nasce vazia.
 *
 * LIMITE CONHECIDO: só o ESTADO INICIAL é observável aqui. O zustand serve
 * `api.getServerState || api.getInitialState` ao renderizar fora do navegador
 * (`node_modules/zustand/esm/index.mjs`), então `setState` antes do render não
 * aparece no markup — e uma asserção que dependa disso passaria por coincidência
 * ou falharia por motivo errado. O que depende de estado é testado como função
 * pura (`hotspotInerte`) ou na suíte da store.
 *
 * O estado inicial é, aliás, o quadro que mais importa: é o primeiro segundo do
 * Escritório no Bloco 1, a primeira coisa que a plateia vê.
 *
 * Renderiza sem JSX (`createElement`) porque a suíte roda em `.ts`.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CENAS, NPCS } from '../domain/content';
import type { Hotspot } from '../domain/types';
import { Cena, hotspotInerte, rotuloComCargo } from './Cena';

/** A cena de abertura: Escritório no Bloco 1, que é o estado inicial da store. */
const ABERTURA = CENAS.find((c) => c.lugarId === 'escritorio' && c.bloco === 1);

const HTML: string = renderToStaticMarkup(createElement(Cena));

function contar(agulha: RegExp): number {
  return HTML.match(agulha)?.length ?? 0;
}

describe('a cena renderiza arte, não retângulo de texto', () => {
  it('a cena de abertura existe e tem hotspot', () => {
    expect(ABERTURA).toBeDefined();
    expect(ABERTURA?.hotspots.length).toBeGreaterThan(0);
  });

  it('há um botão de hotspot por hotspot da cena, e todos nus', () => {
    expect(contar(/class="jogo-botao-nu jogo-hotspot"/g)).toBe(ABERTURA?.hotspots.length ?? 0);
  });

  /**
   * A regressão em uma asserção: o hotspot era `class="jogo-botao"` com
   * `min-width: 260px` e o rótulo dentro. Nenhuma das duas coisas pode voltar.
   */
  it('nenhum hotspot voltou a ser botão com moldura', () => {
    expect(HTML).not.toMatch(/class="jogo-botao"[^>]*aria-label="Interagir com/);
    expect(HTML).not.toMatch(/aria-label="Interagir com[^>]*min-width/);
  });

  it('todo hotspot carrega a arte com a classe que recebe a aura', () => {
    expect(contar(/jogo-hotspot-arte/g)).toBeGreaterThanOrEqual(ABERTURA?.hotspots.length ?? 0);
  });

  it('a acessibilidade não regrediu: cada hotspot mantém o aria-label', () => {
    for (const h of ABERTURA?.hotspots ?? []) {
      expect(HTML, `hotspot '${h.id}'`).toContain(
        `aria-label="Interagir com ${rotuloComCargo(h.rotulo, h.arte)}"`,
      );
    }
  });

  /**
   * CARGO JUNTO DO NOME, também aqui (ADR-015).
   *
   * A linha de status do rodapé e o `aria-label` do hotspot são duas ocorrências
   * do nome, e "toda ocorrência" inclui as duas. Antes o rótulo vinha cru do
   * conteúdo, e o cargo existia só na caixa de diálogo — ou seja, a plateia só
   * descobria quem era a pessoa DEPOIS de clicar nela, que é justamente quando a
   * informação deixa de ajudar a decidir se vale clicar.
   */
  it('todo hotspot de NPC anuncia nome E cargo', () => {
    const npcs = (ABERTURA?.hotspots ?? []).filter((h) => h.arte.tipo === 'npc');
    expect(npcs.length, 'a cena de abertura não tem NPC: o teste passaria vazio').toBeGreaterThan(
      0,
    );
    for (const h of npcs) {
      if (h.arte.tipo !== 'npc') continue;
      const perfil = NPCS[h.arte.npcId];
      const rotulo = rotuloComCargo(h.rotulo, h.arte);
      expect(rotulo, `hotspot '${h.id}'`).toContain(perfil.nome);
      expect(rotulo, `hotspot '${h.id}'`).toContain(perfil.cargo);
      expect(HTML, `hotspot '${h.id}' sem cargo no aria-label`).toContain(perfil.cargo);
    }
  });

  /** Objeto e item não ganham cargo: eles não são pessoas. */
  it('hotspot que não é NPC mantém o rótulo do conteúdo, intacto', () => {
    for (const h of ABERTURA?.hotspots ?? []) {
      if (h.arte.tipo === 'npc') continue;
      expect(rotuloComCargo(h.rotulo, h.arte)).toBe(h.rotulo);
    }
  });

  it('nenhum rótulo de hotspot é texto dentro da cena', () => {
    for (const h of ABERTURA?.hotspots ?? []) {
      expect(HTML, `rótulo '${h.rotulo}' vazou para dentro da cena`).not.toContain(
        `>${h.rotulo}<`,
      );
    }
  });

  it('a linha de nome existe uma vez e nasce vazia', () => {
    // Um único elemento com opacidade 0: a legenda do rodapé, sem rótulo ainda.
    expect(contar(/opacity:0/g)).toBe(1);
    expect(contar(/pointer-events:none/g)).toBeGreaterThanOrEqual(1);
  });

  it('nenhum texto da cena desce abaixo do piso de 22px do spec', () => {
    const tamanhos = [...HTML.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]));
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(22);
  });

  it('o botão de voltar ao mapa continua na tela e habilitado', () => {
    expect(HTML).toContain('aria-label="Voltar ao mapa"');
    expect(HTML).not.toMatch(/aria-label="Voltar ao mapa"[^>]*disabled/);
  });
});

describe('hotspot inerte', () => {
  const comUmaVez: Hotspot = {
    id: 'notebook',
    rotulo: 'Notebook',
    arte: { tipo: 'objeto', assetId: 'objeto-notebook', largura: 160, altura: 112 },
    pos: { x: 24, y: 72 },
    parada: { x: 36, y: 76 },
    umaVezSo: true,
    efeitos: [{ tipo: 'narrar', texto: 'x' }],
  };
  const repetivel: Hotspot = { ...comUmaVez, id: 'tiago', umaVezSo: undefined };

  it('umaVezSo já acionado fica inerte: alvo com aura que não responde é bug', () => {
    expect(hotspotInerte(comUmaVez, ['notebook'])).toBe(true);
  });

  it('umaVezSo ainda não acionado continua clicável', () => {
    expect(hotspotInerte(comUmaVez, [])).toBe(false);
    expect(hotspotInerte(comUmaVez, ['tiago'])).toBe(false);
  });

  it('hotspot repetível nunca fica inerte, nem depois de acionado', () => {
    expect(hotspotInerte(repetivel, ['tiago'])).toBe(false);
  });

  /**
   * Os ids de `umaVezSo` do conteúdo real: se algum deles ficasse inerte por
   * engano numa cena onde ainda não foi acionado, o bloco travaria no palco.
   */
  it('nenhum hotspot do conteúdo nasce inerte com a lista vazia', () => {
    const nascemMortos = CENAS.flatMap((cena) =>
      cena.hotspots.filter((h) => hotspotInerte(h, [])).map((h) => `${cena.lugarId} '${h.id}'`),
    );
    expect(nascemMortos).toEqual([]);
  });
});
