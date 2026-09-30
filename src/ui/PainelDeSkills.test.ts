/**
 * O ACORDEÃO DE SKILLS, COM AS NOVE (ADR-020).
 *
 * Testar com as nove não é rigor sobrando: na FASE 5 este painel deixa de ser
 * painel e passa a ser a MECÂNICA da fase — a pessoa percorre as nove uma por
 * uma, ao vivo. Um acordeão que funciona com quatro e estoura com nove falharia
 * exatamente na fase em que ele é o conteúdo.
 *
 * Dois tipos de asserção aqui, e os dois são necessários:
 *
 * GEOMETRIA — as nove CABEM, com uma aberta, sem rolagem e sem corte. O painel
 * tem `overflow: hidden`, então estourar não dá erro nenhum: simplesmente
 * desaparecem as últimas skills, que na fase 5 são as que mais importam. A conta
 * é feita aqui porque em `node` não existe layout para medir.
 *
 * MARKUP — o HTML tem nove entradas clicáveis, exatamente uma expandida, o texto
 * das fechadas não está na tela, e NÃO existe contador. O contador foi rejeitado
 * porque revela o tamanho do caminho: a plateia passa a contar quantas faltam em
 * vez de acompanhar, e o clímax depende de a acumulação parecer conquistada.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SKILLS } from '../domain/content';
import type { Skill, SkillId } from '../domain/types';
import { tipografia } from '../styles/tokens';
import {
  ALTURA_UTIL_DO_PAINEL,
  GEOMETRIA_DO_PAINEL,
  LARGURA_UTIL_DA_LINHA,
  PASSO_DA_LINHA,
  PRIMEIRA_LINHA_Y,
  PainelDeSkillsVisual,
  aberturaAoConquistar,
  proximaAberta,
} from './PainelDeSkills';

const IDS = Object.keys(SKILLS) as SkillId[];
const NOVE: readonly Skill[] = IDS.map((id) => SKILLS[id]);

/**
 * Largura média de glifo assumida, em px por caractere.
 *
 * 0,55em é deliberadamente LARGO para português em caixa mista, pelo mesmo
 * motivo da caixa de diálogo: errar para o largo faz a conta reprovar antes de
 * o texto vazar na tela; errar para o estreito aprova um painel que corta a
 * nona skill no palco.
 */
function larguraDeGlifo(fonte: number): number {
  return fonte * 0.55;
}

function linhasNecessarias(texto: string, fonte: number, largura: number): number {
  const porLinha = Math.max(1, Math.floor(largura / larguraDeGlifo(fonte)));
  return Math.ceil(texto.length / porLinha);
}

function alturaDoTexto(texto: string, fonte: number, largura: number): number {
  return linhasNecessarias(texto, fonte, largura) * fonte * tipografia.alturaLinha.corpo;
}

/** Altura de uma entrada fechada, contando quebra de nome longo. */
function alturaFechada(skill: Skill): number {
  const linhas = linhasNecessarias(
    skill.nome,
    GEOMETRIA_DO_PAINEL.linha.fonte,
    LARGURA_UTIL_DA_LINHA,
  );
  const conteudo =
    linhas * GEOMETRIA_DO_PAINEL.linha.fonte * tipografia.alturaLinha.compacta +
    2 * GEOMETRIA_DO_PAINEL.linha.padding.vertical;
  return Math.max(GEOMETRIA_DO_PAINEL.linha.alturaMinima, Math.ceil(conteudo));
}

describe('orçamento vertical do painel: as nove skills cabem', () => {
  it('há nove skills declaradas (se mudar, esta conta muda com elas)', () => {
    expect(NOVE).toHaveLength(9);
    for (const skill of NOVE) {
      expect(skill.nome.length).toBeGreaterThan(0);
      expect(skill.texto.length).toBeGreaterThan(0);
    }
  });

  /**
   * O pior caso real: as nove fechadas, mais a que precisa de MAIS linhas de
   * texto aberta. Não é o pior caso teórico — é o pior caso que o conteúdo de
   * hoje produz, e é o conteúdo que vai para o palco.
   */
  it('as nove cabem com a mais longa aberta, sem estourar o painel', () => {
    const fechadas = NOVE.map(alturaFechada).reduce((a, b) => a + b, 0);
    const vaos = (NOVE.length - 1) * GEOMETRIA_DO_PAINEL.vao;
    const cabecalho = GEOMETRIA_DO_PAINEL.cabecalho.altura + GEOMETRIA_DO_PAINEL.vao;
    const maiorTexto = Math.max(
      ...NOVE.map((s) =>
        alturaDoTexto(s.texto, GEOMETRIA_DO_PAINEL.texto.fonte, LARGURA_UTIL_DA_LINHA),
      ),
    );
    const aberta = maiorTexto + GEOMETRIA_DO_PAINEL.vao;
    const total = Math.ceil(cabecalho + fechadas + vaos + aberta);

    console.log(
      `\npainel de skills: altura útil ${ALTURA_UTIL_DO_PAINEL}px; ` +
        `pior caso com as nove e uma aberta = ${total}px ` +
        `(cabeçalho ${cabecalho}, fechadas ${Math.ceil(fechadas)}, vãos ${vaos}, aberta +${Math.ceil(aberta)})\n`,
    );

    expect(total).toBeLessThanOrEqual(ALTURA_UTIL_DO_PAINEL);
  });

  it('a geometria do painel não invade a barra de itens nem sai do canvas', () => {
    expect(GEOMETRIA_DO_PAINEL.topo).toBeGreaterThan(0);
    expect(GEOMETRIA_DO_PAINEL.altura).toBeGreaterThan(0);
    expect(PRIMEIRA_LINHA_Y).toBeGreaterThan(GEOMETRIA_DO_PAINEL.topo);
    expect(PASSO_DA_LINHA).toBeGreaterThan(GEOMETRIA_DO_PAINEL.linha.alturaMinima);
    // A última entrada fechada ainda começa dentro do painel.
    const ultimaLinhaY = PRIMEIRA_LINHA_Y + (NOVE.length - 1) * PASSO_DA_LINHA;
    expect(ultimaLinhaY + GEOMETRIA_DO_PAINEL.linha.alturaMinima).toBeLessThanOrEqual(
      GEOMETRIA_DO_PAINEL.topo + GEOMETRIA_DO_PAINEL.altura,
    );
  });

  it('nenhum texto do painel desce abaixo do piso de 22px do spec', () => {
    expect(GEOMETRIA_DO_PAINEL.cabecalho.fonte).toBeGreaterThanOrEqual(tipografia.minimo);
    expect(GEOMETRIA_DO_PAINEL.linha.fonte).toBeGreaterThanOrEqual(tipografia.minimo);
    expect(GEOMETRIA_DO_PAINEL.texto.fonte).toBeGreaterThanOrEqual(tipografia.minimo);
  });
});

describe('a regra do acordeão', () => {
  it('clicar numa fechada abre; clicar na aberta fecha', () => {
    const primeira = IDS[0];
    const segunda = IDS[1];
    if (!primeira || !segunda) throw new Error('skills insuficientes');
    expect(proximaAberta(null, primeira)).toBe(primeira);
    expect(proximaAberta(primeira, primeira)).toBeNull();
  });

  /** Abrir uma fecha a anterior — consequência de haver um slot só. */
  it('abrir outra fecha a anterior', () => {
    for (let i = 0; i < IDS.length - 1; i += 1) {
      const atual = IDS[i];
      const proxima = IDS[i + 1];
      if (!atual || !proxima) continue;
      expect(proximaAberta(atual, proxima)).toBe(proxima);
    }
  });

  /**
   * As nove, uma por uma, como na fase 5: abrir, ler, fechar, seguir. Se em
   * algum passo sobrassem duas abertas, o painel estouraria a altura.
   */
  it('percorrer as nove uma por uma nunca deixa duas abertas', () => {
    let aberta: SkillId | null = null;
    for (const id of IDS) {
      aberta = proximaAberta(aberta, id);
      expect(aberta).toBe(id);
      aberta = proximaAberta(aberta, id);
      expect(aberta).toBeNull();
    }
  });

  it('a recém-conquistada é a que abre sozinha', () => {
    expect(aberturaAoConquistar([])).toBeNull();
    for (let n = 1; n <= IDS.length; n += 1) {
      const conquistadas = IDS.slice(0, n);
      expect(aberturaAoConquistar(conquistadas)).toBe(conquistadas[n - 1]);
    }
  });
});

describe('o markup do painel com as nove', () => {
  const abertaNoTeste = IDS[5];
  const HTML: string = renderToStaticMarkup(
    createElement(PainelDeSkillsVisual, {
      skills: NOVE,
      aberta: abertaNoTeste ?? null,
      aoAlternar: () => undefined,
    }),
  );

  function contar(agulha: RegExp): number {
    return HTML.match(agulha)?.length ?? 0;
  }

  it('há nove entradas, todas clicáveis', () => {
    expect(contar(/<button/g)).toBe(9);
    for (const skill of NOVE) {
      expect(HTML, `skill '${skill.id}'`).toContain(skill.nome);
    }
  });

  it('exatamente uma está expandida', () => {
    expect(contar(/aria-expanded="true"/g)).toBe(1);
    expect(contar(/aria-expanded="false"/g)).toBe(8);
  });

  /**
   * O texto das fechadas não está na tela. É metade do acordeão: se o texto
   * ficasse renderizado e apenas escondido por CSS, nove parágrafos ocupariam
   * altura e o painel cortaria as últimas skills.
   */
  it('só o texto da aberta aparece na tela', () => {
    const aberta = abertaNoTeste === undefined ? undefined : SKILLS[abertaNoTeste];
    expect(aberta).toBeDefined();
    if (aberta) expect(HTML).toContain(aberta.texto);
    for (const skill of NOVE) {
      if (skill.id === abertaNoTeste) continue;
      // O texto pode aparecer no aria-label da aberta, nunca no corpo das outras.
      expect(HTML, `texto de '${skill.id}' vazou fechado`).not.toContain(`>${skill.texto}<`);
    }
  });

  /** SEM CONTADOR (ADR-020). Nem "4 de 9", nem "9", nem fração. */
  it('não existe contador em nenhuma forma', () => {
    expect(HTML).not.toMatch(/\d+\s*(de|\/)\s*9/);
    // Nenhum elemento cujo conteúdo seja só um número.
    expect(HTML).not.toMatch(/>\s*\d+\s*</);
  });

  it('nenhum texto do painel desce abaixo de 22px', () => {
    const tamanhos = [...HTML.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]));
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(tipografia.minimo);
  });

  it('painel vazio não desenha nada: sem skill, sem moldura na tela', () => {
    const vazio = renderToStaticMarkup(
      createElement(PainelDeSkillsVisual, {
        skills: [],
        aberta: null,
        aoAlternar: () => undefined,
      }),
    );
    expect(vazio).toBe('');
  });
});
