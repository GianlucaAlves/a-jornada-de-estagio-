/**
 * LIGAR OS PONTOS — a geometria e a TESE, medidas.
 *
 * Esta tela é o momento de maior valor da apresentação e ela é desenhada por
 * aritmética, sem medir DOM: ninguém abre o navegador durante o clímax para
 * conferir se um card caiu atrás do painel de skills. Então o que este arquivo
 * faz é o olhar que a batch não tem:
 *
 * GEOMETRIA — os cinco cards, os slots de origem e a placa do convite cabem na
 * caixa livre, não se sobrepõem, não invadem a faixa da barra nem a do painel, e
 * a placa cai na única célula VAZIA do arranjo. Mais importante: nenhuma das
 * cinco linhas atravessam o card de um lugar que não é o delas — era esse o
 * defeito da versão anterior, onde a linha da barra até o Escritório passava por
 * cima da Sala de Reuniões e a plateia não sabia em qual lugar a razão parava.
 *
 * TESE — depois que a barra sai, sobra UMA coisa acesa, e ela é a competência
 * (ADR-017). Se a plateia não perceber isso, o clímax não entregou nada. Aqui
 * isso é provado duas vezes: na regra pura (`conexaoAcesa`, `lugaresAcesos`) e
 * no HTML de verdade — exatamente um traço em cor de destaque, e ele é o mais
 * grosso da tela.
 *
 * O markup do quadro final só é observável porque o mapa é um componente PURO:
 * fora do navegador o zustand serve o estado inicial, então nenhuma sequência de
 * cliques aparece no HTML renderizado. O quadro entra por prop.
 *
 * Renderiza sem JSX (`createElement`) porque a suíte roda em `.ts`.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { BLOCOS, CONEXOES, ITENS, LUGARES, ORDEM_ITENS, SKILLS } from '../domain/content';
import type { ItemId, LugarId, Ponto, SkillId } from '../domain/types';
import { CANVAS, barra, borda, cores, overlay, tipografia } from '../styles/tokens';
import {
  CAIXA_DO_CONVITE,
  GEOMETRIA_DA_REVELACAO,
  GEOMETRIA_DA_VERSAO_FUTURA,
  MapaDaRevelacao,
  caixaDaOrigem,
  caixaDoCard,
  centroDoCard,
  conexaoAcesa,
  lugaresAcesos,
  partidaDaConexao,
} from './Revelacao';
import type { Caixa, ConexaoNaTela } from './Revelacao';
import { ROTULOS_DOS_ITENS } from './rotulosDosItens';

const IDS = Object.keys(LUGARES) as LugarId[];

/**
 * O estado que a fase 6 declara ter recebido é o estado real desta tela: cinco
 * itens na barra e as nove skills no painel. As coordenadas de partida das
 * cinco origens saem dele, então usar outra coisa aqui testaria uma tela que
 * não existe.
 */
const ASSUMIDO = BLOCOS[6].estadoAssumido;
const SLOTS: readonly ItemId[] = ORDEM_ITENS.filter((id) => ASSUMIDO.itens.includes(id));
const SKILLS_NO_PAINEL: readonly SkillId[] = ASSUMIDO.skills;

const CONEXOES_NA_TELA: readonly ConexaoNaTela[] = CONEXOES.map((conexao) => ({
  conexao,
  partida: partidaDaConexao(conexao, SLOTS, SKILLS_NO_PAINEL),
}));

// ------------------------------------------------------------ ferramentas

function cruza(a: Caixa, b: Caixa): boolean {
  return a.esquerda < b.direita && b.esquerda < a.direita && a.topo < b.base && b.topo < a.base;
}

/** Caixa a partir de um centro — para tratar um ponto como caixa de 1px. */
function caixa(centro: Ponto, largura: number, altura: number): Caixa {
  return {
    esquerda: centro.x - largura / 2,
    direita: centro.x + largura / 2,
    topo: centro.y - altura / 2,
    base: centro.y + altura / 2,
  };
}

function dentro(interna: Caixa, externa: Caixa): boolean {
  return (
    interna.esquerda >= externa.esquerda &&
    interna.direita <= externa.direita &&
    interna.topo >= externa.topo &&
    interna.base <= externa.base
  );
}

/** Liang–Barsky: o segmento toca a caixa? */
function segmentoCruzaCaixa(a: Ponto, b: Ponto, c: Caixa): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - c.esquerda, c.direita - a.x, a.y - c.topo, c.base - a.y];
  for (let i = 0; i < 4; i += 1) {
    const pi = p[i] ?? 0;
    const qi = q[i] ?? 0;
    if (pi === 0) {
      if (qi < 0) return false;
      continue;
    }
    const r = qi / pi;
    if (pi < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t0 <= t1;
}

interface Polilinha {
  stroke: string;
  largura: number;
}

function polilinhas(html: string): Polilinha[] {
  return [...html.matchAll(/<polyline[^>]*>/g)].map((achado) => {
    const tag = achado[0];
    return {
      stroke: /stroke="([^"]+)"/.exec(tag)?.[1] ?? '',
      largura: Number(/stroke-width="(\d+)"/.exec(tag)?.[1] ?? 0),
    };
  });
}

const LIVRE: Caixa = {
  esquerda: GEOMETRIA_DA_REVELACAO.livre.esquerda,
  direita: GEOMETRIA_DA_REVELACAO.livre.direita,
  topo: GEOMETRIA_DA_REVELACAO.mapa.topo,
  base: GEOMETRIA_DA_REVELACAO.livre.base,
};

// ------------------------------------------------------------ geometria

describe('a caixa livre respeita os dois overlays persistentes', () => {
  it('nada do mapa entra na faixa do painel de skills nem na da barra', () => {
    expect(GEOMETRIA_DA_REVELACAO.livre.direita).toBeLessThanOrEqual(
      CANVAS.largura - overlay.painelDeSkills,
    );
    expect(GEOMETRIA_DA_REVELACAO.livre.base).toBeLessThanOrEqual(
      CANVAS.altura - overlay.barraDeItens,
    );
    expect(GEOMETRIA_DA_REVELACAO.painel.esquerda).toBe(
      barra.zonaItens,
    );
    expect(GEOMETRIA_DA_REVELACAO.barra.topo).toBe(CANVAS.altura - overlay.barraDeItens);
  });

  it('a faixa de fala fica ACIMA do mapa e não morde nenhum card', () => {
    const fala = GEOMETRIA_DA_REVELACAO.fala;
    expect(fala.topo + fala.altura).toBeLessThanOrEqual(GEOMETRIA_DA_REVELACAO.mapa.topo);
    // Duas linhas de subtítulo caberem é o requisito: duas conexões trazem '\n'.
    const duasLinhas = 2 * tipografia.tamanhos.subtitulo * tipografia.alturaLinha.compacta;
    expect(fala.altura).toBeGreaterThanOrEqual(duasLinhas);
    const comDuasLinhas = CONEXOES.filter((c) => c.texto.includes('\n'));
    expect(comDuasLinhas.length).toBeGreaterThan(0);
  });
});

describe('os cinco lugares e o convite no mapa do clímax', () => {
  it('há cinco lugares, e é deles que o arranjo sai', () => {
    expect(IDS).toHaveLength(5);
  });

  it('todo card e todo slot de origem cabem inteiros na caixa livre', () => {
    for (const id of IDS) {
      expect(dentro(caixaDoCard(id), LIVRE), `card '${id}' vazou da caixa livre`).toBe(true);
      expect(
        dentro(caixaDaOrigem(id, 'item'), LIVRE),
        `origem de item em '${id}' vazou`,
      ).toBe(true);
      expect(
        dentro(caixaDaOrigem(id, 'skill'), LIVRE),
        `placa de competência em '${id}' vazou`,
      ).toBe(true);
    }
  });

  it('a placa do convite cabe na caixa livre', () => {
    expect(dentro(CAIXA_DO_CONVITE, LIVRE)).toBe(true);
  });

  it('nenhum par de cards se sobrepõe', () => {
    const sobrepostos: string[] = [];
    for (let i = 0; i < IDS.length; i += 1) {
      for (let j = i + 1; j < IDS.length; j += 1) {
        const a = IDS[i];
        const b = IDS[j];
        if (!a || !b) continue;
        if (cruza(caixaDoCard(a), caixaDoCard(b))) sobrepostos.push(`${a} × ${b}`);
      }
    }
    expect(sobrepostos).toEqual([]);
  });

  /**
   * A placa cai na ÚNICA célula vazia do arranjo 3+2: o meio de baixo. Se algum
   * dia LUGARES ganhar um sexto lugar ali, esta asserção reprova antes de a
   * placa nascer por cima dele.
   */
  it('o convite ocupa a célula vazia: nenhum lugar encosta nele', () => {
    const encostam = IDS.filter((id) => cruza(caixaDoCard(id), CAIXA_DO_CONVITE));
    expect(encostam).toEqual([]);
  });

  it('nenhum slot de origem encosta em card, em outro slot ou na placa', () => {
    const conflitos: string[] = [];
    for (const id of IDS) {
      const origem = caixaDaOrigem(id, 'skill');
      if (cruza(origem, CAIXA_DO_CONVITE)) conflitos.push(`origem ${id} × convite`);
      for (const outro of IDS) {
        if (cruza(origem, caixaDoCard(outro))) conflitos.push(`origem ${id} × card ${outro}`);
        if (outro !== id && cruza(origem, caixaDaOrigem(outro, 'skill'))) {
          conflitos.push(`origem ${id} × origem ${outro}`);
        }
      }
    }
    expect(conflitos).toEqual([]);
  });

  it('o arranjo preserva a ordem relativa declarada em LUGARES', () => {
    const porX = [...IDS].sort((a, b) => LUGARES[a].pos.x - LUGARES[b].pos.x);
    const porY = [...IDS].sort((a, b) => LUGARES[a].pos.y - LUGARES[b].pos.y);
    const noMapaPorX = [...IDS].sort((a, b) => centroDoCard(a).x - centroDoCard(b).x);
    const noMapaPorY = [...IDS].sort((a, b) => centroDoCard(a).y - centroDoCard(b).y);
    expect(noMapaPorX).toEqual(porX);
    expect(noMapaPorY).toEqual(porY);
  });
});

describe('as cinco linhas não atravessam o que não é delas', () => {
  /**
   * O DEFEITO QUE ESTE TESTE TRANCA. A versão anterior traçava barra → lugar →
   * convite, e a perna de baixo cruzava nós de lugares que não tinham nada a ver
   * com a razão sendo contada. Agora a linha é o raio lugar → convite: raios que
   * partem do mesmo ponto não se cruzam, e nenhum passa por card alheio.
   */
  it('cada linha só toca o card do próprio lugar', () => {
    const invasoes: string[] = [];
    for (const conexao of CONEXOES) {
      const de = centroDoCard(conexao.viaLugar);
      for (const id of IDS) {
        if (id === conexao.viaLugar) continue;
        if (segmentoCruzaCaixa(de, GEOMETRIA_DA_REVELACAO.convite.centro, caixaDoCard(id))) {
          invasoes.push(`${conexao.viaLugar} → convite atravessa '${id}'`);
        }
      }
    }
    expect(invasoes).toEqual([]);
  });

  it('nenhuma linha atravessa slot de origem alheio', () => {
    const invasoes: string[] = [];
    for (const conexao of CONEXOES) {
      const de = centroDoCard(conexao.viaLugar);
      for (const id of IDS) {
        if (id === conexao.viaLugar) continue;
        if (
          segmentoCruzaCaixa(
            de,
            GEOMETRIA_DA_REVELACAO.convite.centro,
            caixaDaOrigem(id, 'skill'),
          )
        ) {
          invasoes.push(`${conexao.viaLugar} → convite atravessa a origem de '${id}'`);
        }
      }
    }
    expect(invasoes).toEqual([]);
  });

  /** Traço curto não lê como ligação: cada linha tem de ter comprimento. */
  it('nenhuma linha nasce como um toco', () => {
    for (const conexao of CONEXOES) {
      const de = centroDoCard(conexao.viaLugar);
      const para = GEOMETRIA_DA_REVELACAO.convite.centro;
      const comprimento = Math.hypot(para.x - de.x, para.y - de.y);
      expect(comprimento, `conexão via '${conexao.viaLugar}'`).toBeGreaterThan(
        GEOMETRIA_DA_REVELACAO.card.largura,
      );
    }
  });
});

describe('de onde a arte de cada origem parte', () => {
  it('as cinco origens existem no estado que a fase 6 assume', () => {
    for (const conexao of CONEXOES) {
      if (conexao.origem.tipo === 'item') {
        expect(SLOTS, `item '${conexao.origem.itemId}' fora da barra`).toContain(
          conexao.origem.itemId,
        );
      } else {
        expect(
          SKILLS_NO_PAINEL,
          `skill '${conexao.origem.skillId}' fora do painel`,
        ).toContain(conexao.origem.skillId);
      }
    }
  });

  it('origem de item parte de DENTRO da faixa da barra de itens', () => {
    for (const { conexao, partida } of CONEXOES_NA_TELA) {
      if (conexao.origem.tipo !== 'item') continue;
      expect(partida.y, `item '${conexao.origem.itemId}'`).toBeGreaterThan(
        GEOMETRIA_DA_REVELACAO.barra.topo,
      );
      expect(partida.y).toBeLessThan(CANVAS.altura);
    }
  });

  /**
   * A placa da competência sai AO LADO da linha do painel, nunca por cima: ela
   * tem largura de card e, centrada na linha, apagaria as skills vizinhas no
   * primeiro quadro — a origem precisa sair do painel, não cobri-lo.
   */
  it('não há placas de skills: todas as conexões partem de itens', () => {
    const daSkill = CONEXOES_NA_TELA.filter((c) => c.conexao.origem.tipo === 'skill');
    expect(daSkill).toHaveLength(0);
  });

  it('cada arte de origem pousa no slot do lugar da própria conexão', () => {
    for (const conexao of CONEXOES) {
      const tipo = conexao.origem.tipo === 'item' ? 'item' : 'skill';
      const slot = caixaDaOrigem(conexao.viaLugar, tipo);
      const card = caixaDoCard(conexao.viaLugar);
      // Diretamente ACIMA do card, e sem tocá-lo.
      expect(slot.base).toBeLessThanOrEqual(card.topo);
      expect(cruza(slot, card)).toBe(false);
    }
  });
});

// ------------------------------------------------------------ a tese

describe('a tese: quatro portas se apagam, um motivo permanece', () => {
  it('há cinco conexões, e exatamente uma não se consome', () => {
    expect(CONEXOES).toHaveLength(5);
    const permanentes = CONEXOES.filter((c) => !c.consomeOrigem);
    expect(permanentes).toHaveLength(1);
    const unica = permanentes[0];
    expect(unica?.origem).toEqual({ tipo: 'item', itemId: 'relatorio' });
  });

  it('com a barra em cena, tudo o que foi traçado está aceso', () => {
    for (const conexao of CONEXOES) {
      expect(conexaoAcesa(conexao, false)).toBe(true);
    }
    expect(lugaresAcesos(CONEXOES, false)).toHaveLength(CONEXOES.length);
  });

  it('quando a barra sai, sobra UMA conexão acesa: o relatório', () => {
    const acesas = CONEXOES.filter((c) => conexaoAcesa(c, true));
    expect(acesas).toHaveLength(1);
    expect(acesas[0]?.origem).toEqual({ tipo: 'item', itemId: 'relatorio' });
  });

  it('e sobra UM lugar aceso: o lugar onde ela agiu sem ninguém pedir', () => {
    const acesos = lugaresAcesos(CONEXOES, true);
    expect(acesos).toHaveLength(1);
    const doRelatorio = CONEXOES.find((c) => c.origem.tipo === 'item' && c.origem.itemId === 'relatorio');
    expect(acesos[0]).toBe(doRelatorio?.viaLugar);
  });

  /** O motivo também é o traço mais grosso: a diferença é de natureza. */
  it('a conexão que permanece é a mais grossa e a mais lenta das cinco', () => {
    const permanente = CONEXOES.find((c) => !c.consomeOrigem);
    expect(permanente).toBeDefined();
    if (!permanente) return;
    for (const outra of CONEXOES) {
      if (outra === permanente) continue;
      expect(permanente.espessura).toBeGreaterThan(outra.espessura);
      expect(permanente.duracaoMs).toBeGreaterThan(outra.duracaoMs);
    }
  });

  /** Os cinco lugares são distintos: cinco linhas num slot só não leem como cinco razões. */
  it('as cinco conexões passam por cinco lugares diferentes', () => {
    const lugares = new Set(CONEXOES.map((c) => c.viaLugar));
    expect(lugares.size).toBe(CONEXOES.length);
  });
});

// ------------------------------------------------------- o texto que cabe

/**
 * Largura média de glifo assumida, em px por caractere.
 *
 * 0,55em é a mesma convenção deliberadamente LARGA que `PainelDeSkills.test.ts`
 * e a caixa de diálogo usam: errar para o largo faz a conta reprovar ANTES de o
 * texto vazar na tela. Medido em Segoe UI Bold o fator real fica perto de 0,50,
 * então quem passar aqui passa no palco com folga.
 */
function larguraDeGlifo(fonte: number): number {
  return fonte * 0.55;
}

function linhas(texto: string, fonte: number, largura: number): number {
  const porLinha = Math.max(1, Math.floor(largura / larguraDeGlifo(fonte)));
  return Math.ceil(texto.length / porLinha);
}

describe('o texto do clímax cabe onde ele é desenhado', () => {
  /**
   * O DEFEITO QUE ISTO TRANCA, e ele foi visto no quadro montado: "Linha de
   * Produção" mede 219px em 24px negrito, e numa caixa de 192px quebrava em duas
   * linhas com a segunda cortada pela altura reservada — no card de um dos
   * lugares que o clímax acende.
   */
  it('todo nome de lugar cabe em UMA linha no card', () => {
    const util = GEOMETRIA_DA_REVELACAO.card.nome;
    for (const id of IDS) {
      expect(
        linhas(LUGARES[id].nome, tipografia.tamanhos.apoio, util),
        `nome de '${id}' não cabe em uma linha`,
      ).toBe(1);
    }
  });

  it('o nome da competência cabe na placa que sai do painel', () => {
    const util =
      GEOMETRIA_DA_REVELACAO.origem.larguraSkill - 2 * 12 - 2 * 6; // padding sm + borda grossa
    for (const conexao of CONEXOES) {
      if (conexao.origem.tipo !== 'skill') continue;
      expect(
        linhas(SKILLS[conexao.origem.skillId].nome, tipografia.tamanhos.corpo, util),
      ).toBe(1);
    }
  });

  /**
   * A faixa de fala reserva DUAS linhas, então nenhuma linha do texto de uma
   * conexão pode quebrar: a que quebrasse viraria a terceira e seria cortada
   * durante a fala da Cláudia, ao vivo. Foi por isso que a faixa desceu de 40px
   * para 32px — em 40px a conexão do crachá já não caberia.
   */
  it('cada linha de cada conexão cabe em uma linha da faixa de fala', () => {
    const util =
      GEOMETRIA_DA_REVELACAO.livre.direita -
      GEOMETRIA_DA_REVELACAO.livre.esquerda -
      2 * 32; // padding lg
    for (const conexao of CONEXOES) {
      const partes = conexao.texto.split('\n');
      expect(partes.length).toBeLessThanOrEqual(2);
      for (const parte of partes) {
        expect(
          linhas(parte, tipografia.tamanhos.rotulo, util),
          `"${parte.slice(0, 32)}..." quebra na faixa de fala`,
        ).toBe(1);
      }
    }
  });

  /**
   * Os três nomes de item da fase 6 QUEBRAM em duas linhas — "Certificado de
   * conclusão" mede 282px contra 178px de caixa útil — e a barra desta tela não
   * pode crescer. Duas linhas são reservadas; três não caberiam.
   */
  it('o rótulo de cada item na barra cabe nas duas linhas reservadas', () => {
    const util = barra.item.larguraCompacta - 2 * borda.media - 2 * borda.fina;
    for (const id of SLOTS) {
      expect(linhas(ROTULOS_DOS_ITENS[id], tipografia.minimo, util)).toBeLessThanOrEqual(2);
    }
    const slot = GEOMETRIA_DA_REVELACAO.barra.slot;
    expect(slot.topo).toBeGreaterThanOrEqual(GEOMETRIA_DA_REVELACAO.barra.topo);
    expect(slot.topo + slot.altura).toBeLessThanOrEqual(CANVAS.altura);
  });
});

describe('a versão futura não cobre a resposta que ela aponta', () => {
  const acesa = CONEXOES.find((c) => !c.consomeOrigem);

  it('nenhuma das duas figuras encosta na corrente acesa nem no convite', () => {
    expect(acesa).toBeDefined();
    if (!acesa) return;
    const proibidas: Caixa[] = [
      caixaDoCard(acesa.viaLugar),
      caixaDaOrigem(acesa.viaLugar, acesa.origem.tipo),
      CAIXA_DO_CONVITE,
    ];
    for (const [nome, figura] of [
      ['ana', GEOMETRIA_DA_VERSAO_FUTURA.ana],
      ['ana futura', GEOMETRIA_DA_VERSAO_FUTURA.futura],
    ] as const) {
      for (const alvo of proibidas) {
        expect(cruza(figura, alvo), `${nome} cobre a corrente acesa`).toBe(false);
      }
    }
  });

  it('as duas figuras ficam dentro do canvas', () => {
    for (const figura of [GEOMETRIA_DA_VERSAO_FUTURA.ana, GEOMETRIA_DA_VERSAO_FUTURA.futura]) {
      expect(figura.esquerda).toBeGreaterThanOrEqual(0);
      expect(figura.base).toBeLessThanOrEqual(CANVAS.altura);
      expect(figura.topo).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * O gesto aponta para a placa do convite: a ponta encosta nela por fora, e o
   * corpo da flecha não a atravessa — flecha que termina no meio de uma placa
   * lê como risco sobre ela, não como dedo apontando.
   */
  it('o gesto termina junto da placa do convite, sem atravessá-la', () => {
    const { de, para } = GEOMETRIA_DA_VERSAO_FUTURA.gesto;
    expect(cruza(caixa(para, 1, 1), CAIXA_DO_CONVITE)).toBe(false);
    expect(para.y - CAIXA_DO_CONVITE.base).toBeLessThanOrEqual(48);
    expect(para.y).toBeGreaterThan(CAIXA_DO_CONVITE.base);
    expect(para.x).toBeGreaterThanOrEqual(CAIXA_DO_CONVITE.esquerda);
    expect(para.x).toBeLessThanOrEqual(CAIXA_DO_CONVITE.direita);
    // Comprimento: gesto curto não lê como gesto numa tela de 1920.
    expect(Math.hypot(para.x - de.x, para.y - de.y)).toBeGreaterThan(200);
  });
});

// ------------------------------------------------------------ markup
describe('o mapa do clímax, no HTML', () => {
  const VAZIO = renderToStaticMarkup(
    createElement(MapaDaRevelacao, { conexoes: [], barraSaiu: false }),
  );
  const DURANTE = renderToStaticMarkup(
    createElement(MapaDaRevelacao, { conexoes: CONEXOES_NA_TELA, barraSaiu: false }),
  );
  const FINAL = renderToStaticMarkup(
    createElement(MapaDaRevelacao, { conexoes: CONEXOES_NA_TELA, barraSaiu: true }),
  );

  it('o primeiro quadro é o mapa: cinco lugares nomeados, o convite, e nenhuma linha', () => {
    for (const id of IDS) {
      expect(VAZIO, `lugar '${id}' não aparece no mapa`).toContain(LUGARES[id].nome);
    }
    expect(VAZIO).toContain('O convite');
    expect(polilinhas(VAZIO)).toHaveLength(0);
  });

  it('as cinco conexões traçadas são cinco linhas, todas acesas', () => {
    const linhas = polilinhas(DURANTE);
    expect(linhas).toHaveLength(5);
    expect(linhas.every((l) => l.stroke === cores.destaque)).toBe(true);
  });

  /**
   * A ASSERÇÃO QUE VALE A TELA. Depois que a barra sai: UM traço aceso, três
   * apagados, e o aceso é o mais grosso. Se um dia isto virar dois acesos, a
   * plateia deixa de ver que sobrou UMA coisa, e o clímax não entrega nada.
   */
  it('depois que a barra sai, exatamente um traço continua aceso', () => {
    const linhas = polilinhas(FINAL);
    expect(linhas).toHaveLength(5);
    const acesas = linhas.filter((l) => l.stroke === cores.destaque);
    const apagadas = linhas.filter((l) => l.stroke === cores.silhuetaContorno);
    expect(acesas).toHaveLength(1);
    expect(apagadas).toHaveLength(4);
    expect(acesas[0]?.largura).toBe(Math.max(...linhas.map((l) => l.largura)));
  });

  it('o relatório que permanece é nomeado na tela', () => {
    const doRelatorio = CONEXOES.find((c) => c.origem.tipo === 'item' && c.origem.itemId === 'relatorio');
    expect(doRelatorio).toBeDefined();
    expect(FINAL).toContain(ITENS.relatorio.nome);
    expect(FINAL).toContain(LUGARES[doRelatorio!.viaLugar].nome);
  });

  it('acender menos coisas no fim: o quadro final tem menos destaque que o anterior', () => {
    const contar = (html: string, agulha: string): number =>
      html.split(agulha).length - 1;
    expect(contar(FINAL, cores.destaque)).toBeLessThan(contar(DURANTE, cores.destaque));
    expect(contar(FINAL, cores.silhuetaContorno)).toBeGreaterThan(
      contar(DURANTE, cores.silhuetaContorno),
    );
  });

  it('nenhum texto do mapa desce abaixo do piso de 22px do spec', () => {
    for (const html of [VAZIO, DURANTE, FINAL]) {
      const tamanhos = [...html.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]));
      expect(tamanhos.length).toBeGreaterThan(0);
      expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(tipografia.minimo);
    }
  });

  /** Sem gradiente, sem brilho difuso, sem linha fina: o vídeo comprimido come os três. */
  it('não há gradiente, desfoque nem traço abaixo de 3px', () => {
    for (const html of [VAZIO, DURANTE, FINAL]) {
      expect(html).not.toMatch(/gradient/);
      expect(html).not.toMatch(/blur/);
    }
    for (const linha of polilinhas(DURANTE)) {
      expect(linha.largura).toBeGreaterThanOrEqual(3);
    }
    const bordas = [...FINAL.matchAll(/border(?:-left)?:(\d+)px/g)].map((m) => Number(m[1]));
    expect(bordas.length).toBeGreaterThan(0);
    expect(Math.min(...bordas)).toBeGreaterThanOrEqual(3);
  });
});
