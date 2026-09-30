/**
 * FASE 6 — LIGAR OS PONTOS, no mapa.
 *
 * A Cláudia acabou de dar a notícia e disse "vem cá, eu te mostro de onde veio
 * cada um" (ADR-029, ADR-030). Esta tela é aquela fala continuando: uma conexão
 * por CLIQUE do apresentador — nunca por timer —, cada uma é uma razão, dita na
 * faixa de fala e desenhada no mapa ao mesmo tempo. Espessura e duração de cada
 * traçado vêm do próprio objeto `Conexao`; nada disso é decidido aqui.
 *
 * O QUE ESTA TELA CONSERTA (v2.1, FRENTE E). Ela era GEOMETRIA ABSTRATA: cinco
 * círculos de raio 44, um círculo de raio 50 no meio e linhas entre círculos,
 * sobre um mapa sintetizado por aritmética própria (`MAPA_X = 80`). A plateia
 * via pontos ligados a pontos, e não COISAS ligadas a coisas — no momento de
 * maior valor da apresentação havia desenho e não havia significado.
 *
 * Agora cada ponta carrega o que ela é:
 *
 *   - a ORIGEM é a arte do próprio item (ou a PALAVRA da competência), e ela
 *     VIAJA da barra de itens / do painel de skills até o lugar. A plateia vê a
 *     coisa que a Ana carregou a apresentação inteira sair do inventário e
 *     pousar no mapa — o que a barra perde, o mapa ganha, no mesmo clique.
 *   - o NÓ DO MEIO é o CENÁRIO do lugar, a mesma miniatura que o mapa mostra a
 *     apresentação toda, com o nome embaixo. "Isto aconteceu ali" passa a ser
 *     uma imagem, não um rótulo.
 *   - o DESTINO é uma placa sólida escrita "O convite", na única célula VAZIA do
 *     arranjo dos cinco lugares: o lugar do mapa onde nunca houve nada. Ela
 *     nasce acesa porque a notícia já foi dada (ADR-029) — o que falta não é o
 *     desfecho, é o porquê.
 *
 * UMA LINHA POR CONEXÃO, E ELAS NÃO SE CRUZAM. Cada conexão era uma polilinha de
 * três pontos: barra → lugar → centro. Com quatro delas, duas atravessavam o nó
 * de um lugar que não tinha nada a ver com a razão sendo contada (linha reta da
 * barra ao Escritório passa por cima da Sala de Reuniões) e ainda cruzavam uma à
 * outra. Agora a linha é o raio lugar → convite, e raios que partem do mesmo
 * ponto não se cruzam nunca. Quem diz "isto veio daqui" é a arte que pousa no
 * card, não um segmento a mais. `Revelacao.test.ts` reprova cruzamento.
 *
 * MEDIR O DOM CONTINUA PROIBIDO, e a decisão é certa: medir sob o transform de
 * escala do canvas é fragilidade que não sobrevive ao palco. Tudo aqui é
 * aritmética sobre tokens. A geometria da barra espelha `BarraDeItens` e a do
 * painel espelha `PainelDeSkills`, para que nada salte de lugar na troca de tela
 * — é de uma linha DESTE painel que a quarta origem sai.
 *
 * E A TESE, que é o motivo de a fase existir: as três primeiras conexões saem de
 * ITENS e SE APAGAM quando a barra sai; a quarta sai da competência
 * `proatividade` e PERMANECE ACESA, sozinha, ligada ao convite (ADR-017). Ver
 * `conexaoAcesa` — a regra mora numa função pura porque é ela que o teste prova.
 *
 * Sem partícula, sem brilho difuso, sem linha fina, sem gradiente, sem animação
 * rápida: traçado grosso, alto contraste, 800–1200ms.
 */
import { useEffect, useRef, useState } from 'react';

import { ASSET_MAPA, assetDoCenario, assetDoItem, assetDoSprite } from '../assets/manifest';
import { CONEXOES, ITENS, LUGARES, SKILLS } from '../domain/content';
import type { Conexao, ItemId, LugarId, Ponto, SkillId } from '../domain/types';
import { useJogo } from '../store/jogo';
import {
  CANVAS,
  arte,
  barra,
  borda,
  camada,
  cores,
  duracao,
  easing,
  espaco,
  overlay,
  raio,
  tipografia,
} from '../styles/tokens';
import { Imagem } from './Imagem';
import {
  GEOMETRIA_DO_PAINEL,
  PASSO_DA_LINHA,
  PRIMEIRA_LINHA_Y,
} from './PainelDeSkills';

// ------------------------------------------------------------ geometria

/**
 * CAIXA LIVRE DO MAPA — o retângulo que nenhum overlay ocupa.
 *
 * Sai dos mesmos tokens que desenham os overlays, e não de números escolhidos a
 * olho: painel de skills na faixa da direita, barra de itens na faixa de baixo.
 * Todo card, toda placa e todo slot de origem cabem aqui dentro, e há teste que
 * reprova quem sair.
 */
const LIVRE_ESQ = espaco.margem;
const LIVRE_DIR = CANVAS.largura - overlay.painelDeSkills - espaco.lg;
const LIVRE_TOPO = espaco.margem;
const LIVRE_BASE = CANVAS.altura - overlay.barraDeItens - espaco.md;

/**
 * FAIXA DE FALA, no alto da tela.
 *
 * Altura FIXA de duas linhas, porque duas conexões já trazem duas linhas no
 * próprio texto e faixa que cresce muda a geometria do mapa embaixo dela. Fica
 * no alto pelo mesmo motivo que a caixa de diálogo (ADR-012): a faixa baixa
 * cruza o corpo de quem está de pé, e aqui cruzaria os dois cards de baixo — era
 * exatamente o que acontecia com a faixa anterior, em y 736.
 *
 * O TAMANHO SAIU DA RÉGUA, NÃO DO GOSTO. Em subtítulo (40px) a linha mais longa
 * do conteúdo — "Na conversa de ontem, duas pessoas da Innovation Week
 * lembravam dela." — mede 1410px contra 1340px de caixa útil: ela quebraria numa
 * terceira linha e a faixa cortaria a fala no clímax. Em rótulo (32px) a mesma
 * linha mede 1128px e sobra folga. Continua maior que o corpo de texto do jogo,
 * que é o que esta faixa tem de ser: é a fala da Cláudia, ampliada.
 */
const FALA_A =
  2 * Math.round(tipografia.tamanhos.rotulo * tipografia.alturaLinha.compacta) + 2 * espaco.md;
const FALA_TOPO = LIVRE_TOPO;
const MAPA_TOPO = FALA_TOPO + FALA_A + espaco.md;

/**
 * CARD DE LUGAR — miniatura do cenário e nome, como no mapa.
 *
 * 16:9 em números inteiros para que a miniatura não ganhe meia coluna de pixel:
 * o cenário é 1920x1080 e a arte é pixel art de escala única (bíblia §2.1).
 * `ALTURA_NOME` reserva UMA linha sempre, mesmo em card não conectado — altura
 * que depende da métrica da fonte não é geometria confiável, e o card não pode
 * mudar de tamanho no instante em que acende.
 *
 * A LARGURA SAIU DO NOME MAIS LONGO, MEDIDO. "Linha de Produção" mede 219px em
 * 24px negrito; numa miniatura de 192px o nome quebrava em duas linhas e a
 * segunda era cortada pela altura reservada. Com 208px de miniatura o nome
 * dispõe de 232px — a faixa do nome usa a largura inteira de dentro da borda,
 * porque o respiro existe para encostar a imagem, e rótulo centrado não precisa
 * dele.
 */
const MINIATURA_L = 208;
const MINIATURA_A = (MINIATURA_L * 9) / 16;
const ALTURA_NOME = Math.round(tipografia.tamanhos.apoio * tipografia.alturaLinha.compacta);
const CARD_L = MINIATURA_L + 2 * espaco.sm + 2 * borda.grossa;
const CARD_A = MINIATURA_A + espaco.xs + ALTURA_NOME + 2 * espaco.sm + 2 * borda.grossa;
/** A faixa do nome avança sobre o respiro lateral: é ela que precisa da largura. */
const NOME_L = CARD_L - 2 * borda.grossa;

/**
 * SLOT DA ORIGEM, logo acima do card.
 *
 * Mesma altura para os dois tipos, para que a fileira de origens seja uma
 * fileira. A largura é que difere, e a diferença é deliberada: item é um OBJETO
 * (96px de arte na escala única, moldurado) e competência é uma PALAVRA — a
 * quarta conexão tem de ler como sendo de outra natureza antes de qualquer
 * animação acontecer (ADR-017).
 *
 * A moldura não é enfeite: é onde a origem mostra que está acesa ou apagada, e
 * ela mantém a borda em `borda.media` para que os 96px de arte caiam exatos
 * dentro dela (`box-sizing: border-box` é global).
 */
const ORIGEM_A = arte.item.altura + 2 * espaco.xs + 2 * borda.media;
const ORIGEM_ITEM_L = arte.item.largura + 2 * espaco.xs + 2 * borda.media;
const ORIGEM_SKILL_L = CARD_L;

/**
 * CAIXA DOS CENTROS dos cards, encolhida por meio card em cada lado para que a
 * moldura E o nome caibam na caixa livre. As posições relativas declaradas em
 * `LUGARES` (quem é esquerda, centro, direita, cima, baixo) são normalizadas
 * para esta caixa — mesma técnica do `Mapa.tsx`, caixa diferente, porque aqui a
 * faixa de fala substitui o título e os cards são menores para caberem seis
 * elementos (cinco lugares e o convite) num arranjo 3+2+1.
 */
const CENTRO_ESQ = LIVRE_ESQ + CARD_L / 2;
const CENTRO_DIR = LIVRE_DIR - CARD_L / 2;
const CENTRO_TOPO = MAPA_TOPO + ORIGEM_A + espaco.xs + CARD_A / 2;
const CENTRO_BASE = LIVRE_BASE - CARD_A / 2;

/**
 * PLACA DO CONVITE — a célula vazia do arranjo.
 *
 * Cinco lugares em 3+2 (extremos e meio em x, extremos em y) deixam exatamente
 * uma célula livre: meio de baixo. É onde o convite entra, e por isso ele não
 * precisa disputar espaço com lugar nenhum — o destino ocupa o único ponto do
 * mapa onde nunca houve nada. O teste prova que nenhum lugar cai ali.
 *
 * Altura arredondada para PAR de propósito: o centro precisa cair em pixel
 * inteiro, senão a placa fica meio pixel fora da grade e a borda tremeria.
 */
const CONVITE_L = CARD_L + 2 * espaco.xxl;
const CONVITE_A = 128;
const CONVITE_CENTRO: Ponto = { x: (CENTRO_ESQ + CENTRO_DIR) / 2, y: CENTRO_BASE };

/**
 * Quanto sobra de uma IMAGEM apagada — miniatura de cenário, arte de item.
 *
 * Não é zero: a porta existiu e foi usada, e apagá-la por completo deixaria o
 * mapa com um traço só, que lê como "aconteceu uma coisa" em vez de "sobrou uma
 * coisa acesa". Precisa haver algo escuro ao lado do que ficou aceso — é o
 * contraste que carrega a tese.
 *
 * VALE PARA IMAGEM, NÃO PARA TRAÇO. O traçado se apaga trocando de COR, com
 * opacidade cheia: 7px de `silhuetaContorno` a 32% sobre o fundo quase preto
 * compõem para algo em torno de 1,6:1 de contraste, e a compressão do Teams
 * apaga isso por inteiro — as três portas desapareceriam em vez de se apagarem,
 * e a plateia não veria que havia três. Cor cheia mantém o caminho legível como
 * caminho gasto, e ainda fica a uma distância enorme do amarelo do destaque.
 */
const OPACIDADE_APAGADA = 0.35;

// Painel de skills — a MESMA geometria que PainelDeSkills.tsx exporta.
//
// Antes eram números repetidos aqui e lá, e "o painel não salta de lugar quando
// a tela troca" era uma coincidência entre dois literais iguais escritos em
// arquivos diferentes. Quando o painel virou acordeão (ADR-020) a coincidência
// se desfez, e é de uma entrada DESTE painel que a quarta origem do clímax sai.
const PAINEL_L = GEOMETRIA_DO_PAINEL.largura;
const PAINEL_X = GEOMETRIA_DO_PAINEL.esquerda;
const PAINEL_Y = GEOMETRIA_DO_PAINEL.topo;
const PAINEL_A = GEOMETRIA_DO_PAINEL.altura;
const PAINEL_CABECALHO_A = GEOMETRIA_DO_PAINEL.cabecalho.altura;
const PAINEL_LINHA_A = GEOMETRIA_DO_PAINEL.linha.alturaMinima;
const PAINEL_PASSO = PASSO_DA_LINHA;
const PAINEL_PRIMEIRA_LINHA_Y = PRIMEIRA_LINHA_Y;

// Barra de itens — as mesmas métricas que BarraDeItens.tsx usa, por token.
//
// UMA COISA AQUI NÃO É ESPELHO, E É DE PROPÓSITO: a altura do slot. Os três
// nomes que a fase 6 carrega não cabem numa linha — "Certificado de conclusão"
// mede 282px contra 178px de caixa útil —, então os três quebram em DUAS. A
// barra de verdade resolve isso crescendo (`minHeight` no slot e na faixa); aqui
// crescer não é opção, porque a faixa é a base da caixa livre do mapa e do
// painel de skills. Então a segunda linha é RESERVADA e o slot é centrado na
// faixa: nada é cortado na borda do canvas, e a coordenada do ícone — de onde a
// arte do item parte — continua exata, incluindo a borda no cálculo.
const BARRA_A = overlay.barraDeItens;
const BARRA_Y = CANVAS.altura - BARRA_A;
const BARRA_ROTULO_L = barra.larguraDoRotulo;
const ITEM_L = barra.item.largura;
const ICONE = barra.icone;
const ITEM_X = espaco.margem + BARRA_ROTULO_L + espaco.md;
const ITEM_PASSO = ITEM_L + espaco.md;
const ITEM_A =
  2 * borda.media + 2 * espaco.sm + ICONE + espaco.xs + 2 * ALTURA_NOME;
const ITEM_Y = BARRA_Y + Math.round((BARRA_A - ITEM_A) / 2);

/** ~5s de sustentação da versão futura apontando o mapa, sem texto. */
const SUSTENTACAO_MS = 5000;
/** A pergunta fica visível e sai: o gesto é que responde. */
const PERGUNTA_VISIVEL_MS = 2000;

/**
 * A última frase da apresentação, ecoada na faixa de fala.
 *
 * A versão canônica mora em `b6-fecho` e é cobrada por `integridade.test.ts`;
 * aqui aparece sozinha, sem a moldura da citação, porque na tela ela é a
 * pergunta sendo feita e não a Ana contando que a fez.
 */
const PERGUNTA_FINAL = 'Eu fui efetivada?';

/**
 * A DUPLA DA VERSÃO FUTURA, e o gesto.
 *
 * Elas ficam na faixa que a barra de itens acabou de desocupar — a barra só sai
 * depois da quarta conexão, então este espaço existe exatamente neste momento e
 * não antes. À esquerda, longe da placa do convite e da única corrente que
 * ficou acesa: a versão futura aponta para o convite, e não pode estar em cima
 * dele quando aponta.
 */
const ANA_ESQ = espaco.margem;
const ANA_TOPO = CANVAS.altura - arte.personagem.altura;
const ANA_FUTURA_ESQ = ANA_ESQ + arte.personagem.largura + espaco.sm;
const ANA_FUTURA_TOPO = ANA_TOPO - espaco.xl;
/** Sai da altura da mão dela e termina embaixo da placa, apontando para cima. */
const GESTO_DE: Ponto = {
  x: ANA_FUTURA_ESQ + arte.personagem.largura - espaco.md,
  y: ANA_FUTURA_TOPO + arte.personagem.altura - espaco.xxl,
};
const GESTO_PARA: Ponto = {
  x: CONVITE_CENTRO.x,
  y: CONVITE_CENTRO.y + CONVITE_A / 2 + espaco.md,
};
/** O gesto é a resposta: mais grosso que qualquer borda da tela. */
const ESPESSURA_GESTO = borda.maxima + borda.media;
const PONTA_COMPRIMENTO = espaco.xl;
const PONTA_LARGURA = espaco.md;

/** Caixa em px de canvas. Existe para o teste de geometria poder cruzar tudo. */
export interface Caixa {
  esquerda: number;
  direita: number;
  topo: number;
  base: number;
}

function caixa(centro: Ponto, largura: number, altura: number): Caixa {
  return {
    esquerda: centro.x - largura / 2,
    direita: centro.x + largura / 2,
    topo: centro.y - altura / 2,
    base: centro.y + altura / 2,
  };
}

/** Geometria desta tela, exportada porque é dela que o teste mede. */
export const GEOMETRIA_DA_REVELACAO = {
  livre: { esquerda: LIVRE_ESQ, direita: LIVRE_DIR, topo: LIVRE_TOPO, base: LIVRE_BASE },
  fala: { topo: FALA_TOPO, altura: FALA_A },
  mapa: { topo: MAPA_TOPO },
  card: {
    largura: CARD_L,
    altura: CARD_A,
    nome: NOME_L,
    miniatura: { largura: MINIATURA_L, altura: MINIATURA_A },
  },
  origem: { altura: ORIGEM_A, larguraItem: ORIGEM_ITEM_L, larguraSkill: ORIGEM_SKILL_L },
  convite: { largura: CONVITE_L, altura: CONVITE_A, centro: CONVITE_CENTRO },
  painel: { esquerda: PAINEL_X },
  barra: { topo: BARRA_Y, slot: { topo: ITEM_Y, altura: ITEM_A } },
} as const;

/** Extremos declarados em LUGARES: normalizar por eles usa a caixa toda. */
const EXTREMOS = (() => {
  const lugares = Object.values(LUGARES);
  const xs = lugares.map((l) => l.pos.x);
  const ys = lugares.map((l) => l.pos.y);
  return {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };
})();

function interpolar(
  valor: number,
  min: number,
  max: number,
  inicio: number,
  fim: number,
): number {
  // Todos no mesmo eixo: sem escala possível, centraliza em vez de dividir por 0.
  if (max <= min) return (inicio + fim) / 2;
  return inicio + ((valor - min) / (max - min)) * (fim - inicio);
}

/** Centro do card de um lugar, em px de canvas. */
export function centroDoCard(lugarId: LugarId): Ponto {
  const pos = LUGARES[lugarId].pos;
  return {
    x: interpolar(pos.x, EXTREMOS.xMin, EXTREMOS.xMax, CENTRO_ESQ, CENTRO_DIR),
    y: interpolar(pos.y, EXTREMOS.yMin, EXTREMOS.yMax, CENTRO_TOPO, CENTRO_BASE),
  };
}

/** Centro do slot de origem daquele lugar: logo acima do card. */
export function centroDaOrigem(lugarId: LugarId): Ponto {
  const centro = centroDoCard(lugarId);
  return { x: centro.x, y: centro.y - CARD_A / 2 - espaco.xs - ORIGEM_A / 2 };
}

export function caixaDoCard(lugarId: LugarId): Caixa {
  return caixa(centroDoCard(lugarId), CARD_L, CARD_A);
}

export function caixaDaOrigem(lugarId: LugarId, tipo: 'item' | 'skill'): Caixa {
  return caixa(
    centroDaOrigem(lugarId),
    tipo === 'item' ? ORIGEM_ITEM_L : ORIGEM_SKILL_L,
    ORIGEM_A,
  );
}

export const CAIXA_DO_CONVITE: Caixa = caixa(CONVITE_CENTRO, CONVITE_L, CONVITE_A);

/**
 * A VERSÃO FUTURA, em caixas — exportada porque tem uma regra a cumprir.
 *
 * As duas figuras ficam por cima do mapa, e isso é certo: elas estão na frente
 * dele. Mas o que elas NÃO podem cobrir é a corrente que ficou acesa, porque é
 * ela a resposta que o gesto aponta. As duas ficam do lado esquerdo, em cima do
 * card apagado da fileira de baixo; a corrente acesa da fase 6 está na coluna
 * da direita e a placa do convite no meio, e o teste cobra as duas folgas.
 */
export const GEOMETRIA_DA_VERSAO_FUTURA = {
  ana: {
    esquerda: ANA_ESQ,
    direita: ANA_ESQ + arte.personagem.largura,
    topo: ANA_TOPO,
    base: ANA_TOPO + arte.personagem.altura,
  } as Caixa,
  futura: {
    esquerda: ANA_FUTURA_ESQ,
    direita: ANA_FUTURA_ESQ + arte.personagem.largura,
    topo: ANA_FUTURA_TOPO,
    base: ANA_FUTURA_TOPO + arte.personagem.altura,
  } as Caixa,
  gesto: { de: GESTO_DE, para: GESTO_PARA },
} as const;

/** Centro do ícone do item na barra — de onde a arte do item PARTE. */
function centroDoIcone(indice: number): Ponto {
  return {
    x: ITEM_X + indice * ITEM_PASSO + ITEM_L / 2,
    y: ITEM_Y + borda.media + espaco.sm + ICONE / 2,
  };
}

/** Entrada do painel de skills — de onde a placa da competência PARTE. */
function entradaDaSkill(indice: number): Ponto {
  return {
    x: PAINEL_X,
    y: PAINEL_PRIMEIRA_LINHA_Y + indice * PAINEL_PASSO + PAINEL_LINHA_A / 2,
  };
}

/**
 * Onde a arte da origem NASCE, antes de viajar até o card.
 *
 * Item: no centro do próprio ícone na barra — a plateia viu aquele ícone ali a
 * apresentação inteira, e é isso que torna a viagem uma frase ("essa coisa que
 * ela carregava").
 *
 * Competência: AO LADO da linha dela no painel, não por cima. A placa tem
 * largura de card e, centrada na linha, cobriria as skills vizinhas no primeiro
 * quadro — a origem tem de sair do painel, não apagá-lo.
 */
export function partidaDaConexao(
  conexao: Conexao,
  slots: readonly ItemId[],
  skills: readonly SkillId[],
): Ponto {
  if (conexao.origem.tipo === 'item') {
    const indice = slots.indexOf(conexao.origem.itemId);
    return indice >= 0 ? centroDoIcone(indice) : { x: ITEM_X, y: ITEM_Y };
  }
  const indice = skills.indexOf(conexao.origem.skillId);
  const linha = indice >= 0 ? entradaDaSkill(indice) : { x: PAINEL_X, y: PAINEL_Y };
  return { x: PAINEL_X - ORIGEM_SKILL_L / 2, y: linha.y };
}

/**
 * A TESE, EM UMA FUNÇÃO.
 *
 * Enquanto a barra está em cena, tudo o que foi traçado está aceso. Quando a
 * barra sai, as PORTAS se apagam — item é coisa que se gasta — e o MOTIVO
 * permanece: uma corrente acesa (competência → lugar → convite) sozinha no
 * mapa. É o argumento inteiro do projeto (ADR-017): não foi o que ela entregou,
 * foi o que ela se tornou.
 *
 * A regra lê `consomeOrigem`, e não `origem.tipo`, porque é `consomeOrigem` que
 * o domínio declara para dizer "esta se gasta" — no conteúdo de hoje as duas
 * leituras coincidem, e o teste cobra que continuem coincidindo: exatamente uma
 * conexão sobrevive, e ela é a da skill.
 *
 * É função pura e exportada porque isto é a coisa mais importante da tela, e
 * markup de estado inicial não alcança: fora do navegador o zustand serve o
 * estado inicial, então nenhuma sequência de cliques é observável no HTML.
 */
export function conexaoAcesa(conexao: Conexao, barraSaiu: boolean): boolean {
  return !barraSaiu || !conexao.consomeOrigem;
}

/**
 * Quais LUGARES ficam acesos, dada a lista de conexões já traçadas.
 *
 * Mora aqui, e não dentro do componente, porque é a forma verificável da tese:
 * com a barra em cena, todo lugar tocado está aceso; depois que ela sai, sobra
 * exatamente UM — e o teste cobra que seja o do motivo.
 */
export function lugaresAcesos(
  conexoes: readonly Conexao[],
  barraSaiu: boolean,
): readonly LugarId[] {
  const acesos: LugarId[] = [];
  for (const conexao of conexoes) {
    if (conexaoAcesa(conexao, barraSaiu) && !acesos.includes(conexao.viaLugar)) {
      acesos.push(conexao.viaLugar);
    }
  }
  return acesos;
}

/** Ponta da flecha do gesto, calculada da direção — nada de triângulo fixo. */
function pontaDeFlecha(de: Ponto, para: Ponto): string {
  const dx = para.x - de.x;
  const dy = para.y - de.y;
  const comprimento = Math.hypot(dx, dy) || 1;
  const ux = dx / comprimento;
  const uy = dy / comprimento;
  const base = {
    x: para.x - ux * PONTA_COMPRIMENTO,
    y: para.y - uy * PONTA_COMPRIMENTO,
  };
  const px = -uy * PONTA_LARGURA;
  const py = ux * PONTA_LARGURA;
  return [
    `${Math.round(para.x)},${Math.round(para.y)}`,
    `${Math.round(base.x + px)},${Math.round(base.y + py)}`,
    `${Math.round(base.x - px)},${Math.round(base.y - py)}`,
  ].join(' ');
}

const CSS = `
.rev-avancar:focus-visible { outline: ${borda.grossa}px solid ${cores.foco}; outline-offset: -16px; }
@keyframes rev-pulso {
  0% { transform: scale(1); }
  45% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
/* Um pulso, amplo e lento. O item avisa que é dele que a arte vai sair. */
.rev-pulso { animation: rev-pulso 800ms ${easing.suave} 1; }
`;

// ------------------------------------------------------------ peças do mapa

/**
 * Conexão traçada: do card do lugar até a placa do convite.
 *
 * DOIS pontos, não três. O terceiro ponto era a barra de itens, e ele fazia a
 * linha atravessar nós de lugares que nada tinham a ver com a razão sendo
 * contada. O trabalho de dizer de onde aquilo veio passou para a arte que pousa
 * no card — que é onde ele sempre devia estar, porque arte diz e segmento só
 * aponta.
 *
 * O traçado nasce NO LUGAR e cresce até o convite: é a direção da causa.
 */
function LinhaConexao({
  pontos,
  espessura,
  duracaoMs,
  aceso,
}: {
  pontos: readonly Ponto[];
  espessura: number;
  duracaoMs: number;
  aceso: boolean;
}): JSX.Element {
  const [tracada, setTracada] = useState(false);

  let comprimento = 0;
  for (let i = 1; i < pontos.length; i += 1) {
    const a = pontos[i - 1];
    const b = pontos[i];
    if (a && b) comprimento += Math.hypot(b.x - a.x, b.y - a.y);
  }

  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setTracada(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  return (
    <polyline
      points={pontos.map((p) => `${p.x},${p.y}`).join(' ')}
      fill="none"
      /**
       * Apagada NÃO é cinza sobre cinza por descuido: aqui a baixa legibilidade
       * é o conteúdo. A proibição de contraste baixo existe para TEXTO; um traço
       * que precisa ler como "gasto" tem de sair da frente do que ficou aceso, e
       * `silhuetaContorno` é a cor que este projeto já usa para forma apagada.
       *
       * E apaga por COR, com opacidade CHEIA: baixar a opacidade de um traço
       * sobre fundo quase preto o remove da tela, e o que se quer é um caminho
       * gasto — se as três portas desaparecerem, a plateia não vê que havia três
       * e "sobrou uma acesa" deixa de ser uma comparação.
       */
      stroke={aceso ? cores.destaque : cores.silhuetaContorno}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={comprimento}
      strokeDashoffset={tracada ? 0 : comprimento}
      style={{
        transition:
          `stroke-dashoffset ${duracaoMs}ms ease-out, ` + `stroke ${duracao.longa}ms ease-out`,
      }}
    />
  );
}

/** Um lugar do mapa: o cenário dele e o nome. Acende quando é razão. */
function CardDoLugar({ lugarId, aceso }: { lugarId: LugarId; aceso: boolean }): JSX.Element {
  const lugar = LUGARES[lugarId];
  const centro = centroDoCard(lugarId);
  return (
    <div
      style={{
        position: 'absolute',
        left: centro.x - CARD_L / 2,
        top: centro.y - CARD_A / 2,
        width: CARD_L,
        height: CARD_A,
        padding: espaco.sm,
        background: cores.painel,
        // Espessura CONSTANTE: acender troca a cor, não a borda. Borda que
        // engrossa come o espaço interno e a miniatura sairia da grade.
        border: `${borda.grossa}px solid ${aceso ? cores.destaque : cores.silhuetaContorno}`,
        borderRadius: raio.md,
        transition: `border-color ${duracao.longa}ms ease-out`,
      }}
    >
      <Imagem
        /**
         * O cenário do lugar COMO ELE ERA na jornada, não a versão de festa do
         * Cafezinho: as quatro conexões falam do passado, e a festa é o presente
         * que espera do outro lado desta tela.
         */
        id={assetDoCenario(lugarId)}
        rotulo={lugar.nome}
        largura={MINIATURA_L}
        altura={MINIATURA_A}
        decorativo
        mostrarRotulo={false}
        style={{
          display: 'block',
          width: MINIATURA_L,
          height: MINIATURA_A,
          borderRadius: raio.sm,
          opacity: aceso ? 1 : OPACIDADE_APAGADA,
          transition: `opacity ${duracao.longa}ms ease-out`,
        }}
      />
      <span
        style={{
          display: 'block',
          // Avança sobre o respiro lateral: o nome mais longo do conteúdo mede
          // 219px e a caixa da miniatura tem 208. Uma linha, sempre.
          marginLeft: -espaco.sm,
          marginRight: -espaco.sm,
          marginTop: espaco.xs,
          width: NOME_L,
          height: ALTURA_NOME,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
          fontSize: tipografia.tamanhos.apoio,
          lineHeight: tipografia.alturaLinha.compacta,
          fontWeight: aceso ? tipografia.pesos.maximo : tipografia.pesos.forte,
          // Nome de lugar apagado continua BRANCO: a diferença que a plateia
          // tem de ler é "amarelo é o que sobrou aceso", e para isso o resto
          // precisa continuar legível em vez de virar cinza sobre cinza.
          color: aceso ? cores.destaque : cores.texto,
          transition: `color ${duracao.longa}ms ease-out`,
        }}
      >
        {lugar.nome}
      </span>
    </div>
  );
}

/** O destino. Sólido, alto contraste, na célula vazia do arranjo. */
function PlacaDoConvite(): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        left: CONVITE_CENTRO.x - CONVITE_L / 2,
        top: CONVITE_CENTRO.y - CONVITE_A / 2,
        width: CONVITE_L,
        height: CONVITE_A,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // A única superfície CHAPADA de destaque na tela: é o que ela ganhou.
        background: cores.destaque,
        border: `${borda.maxima}px solid ${cores.contorno}`,
        borderRadius: raio.lg,
        fontSize: tipografia.tamanhos.titulo,
        fontWeight: tipografia.pesos.maximo,
        letterSpacing: tipografia.espacamento.largo,
        color: cores.textoInverso,
      }}
    >
      O convite
    </div>
  );
}

/**
 * A ORIGEM DE UMA CONEXÃO, viajando da barra/painel até o lugar.
 *
 * A viagem é uma transição de posição entre duas coordenadas conhecidas — nada
 * de medir DOM — e dura o mesmo que o traçado da linha, porque as duas coisas
 * são o mesmo clique. O padrão do `requestAnimationFrame` é o mesmo da linha: o
 * primeiro quadro desenha na partida, o seguinte manda para o destino.
 *
 * Ela não desmonta quando a barra sai: só troca de estado e se apaga no lugar.
 */
function OrigemDaConexao({
  conexao,
  partida,
  aceso,
}: {
  conexao: Conexao;
  partida: Ponto;
  aceso: boolean;
}): JSX.Element {
  const [pousou, setPousou] = useState(false);

  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setPousou(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  const ehItem = conexao.origem.tipo === 'item';
  const largura = ehItem ? ORIGEM_ITEM_L : ORIGEM_SKILL_L;
  const centro = pousou ? centroDaOrigem(conexao.viaLugar) : partida;

  return (
    <div
      style={{
        position: 'absolute',
        left: centro.x - largura / 2,
        top: centro.y - ORIGEM_A / 2,
        width: largura,
        height: ORIGEM_A,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: ehItem ? espaco.xs : espaco.sm,
        background: cores.fundoElevado,
        border: `${ehItem ? borda.media : borda.grossa}px solid ${
          aceso ? cores.destaque : cores.silhuetaContorno
        }`,
        borderRadius: raio.md,
        opacity: aceso ? 1 : OPACIDADE_APAGADA,
        transition:
          `left ${conexao.duracaoMs}ms ${easing.suave}, ` +
          `top ${conexao.duracaoMs}ms ${easing.suave}, ` +
          `opacity ${duracao.longa}ms ease-out, border-color ${duracao.longa}ms ease-out`,
      }}
    >
      {conexao.origem.tipo === 'item' ? (
        <Imagem
          /**
           * A arte da BARRA, não a de cena: é a mesma imagem que estava no slot
           * um instante antes, e trocar de variante no meio da viagem seria uma
           * troca visível de objeto.
           */
          id={assetDoItem(conexao.origem.itemId)}
          rotulo={ITENS[conexao.origem.itemId].nome}
          largura={arte.item.largura}
          altura={arte.item.altura}
          mostrarRotulo={false}
          decorativo
        />
      ) : (
        <span
          style={{
            // PALAVRA, não objeto: é a diferença de natureza da quarta conexão,
            // visível antes de qualquer animação (ADR-017).
            fontSize: tipografia.tamanhos.corpo,
            fontWeight: tipografia.pesos.maximo,
            lineHeight: tipografia.alturaLinha.compacta,
            whiteSpace: 'nowrap',
            color: aceso ? cores.destaque : cores.texto,
            transition: `color ${duracao.longa}ms ease-out`,
          }}
        >
          {SKILLS[conexao.origem.skillId].nome}
        </span>
      )}
    </div>
  );
}

/** Uma conexão já traçada, com a coordenada de onde a arte dela partiu. */
export interface ConexaoNaTela {
  conexao: Conexao;
  partida: Ponto;
}

export interface PropsMapaDaRevelacao {
  /** Conexões já disparadas, na ordem dos cliques. */
  conexoes: readonly ConexaoNaTela[];
  /** A barra saiu de cena: as portas se apagam, o motivo permanece. */
  barraSaiu: boolean;
}

/**
 * O MAPA DO CLÍMAX, separado da tela que lê a store.
 *
 * A separação não é gosto de arquitetura: é a única forma de PROVAR a tese. O
 * teste precisa do quadro em que as quatro conexões existem e a barra já saiu, e
 * por store isso é inalcançável fora do navegador — o zustand serve o estado
 * inicial ao renderizar em `node`. Aqui o quadro entra por prop.
 */
export function MapaDaRevelacao({ conexoes, barraSaiu }: PropsMapaDaRevelacao): JSX.Element {
  const acesos = new Set<LugarId>(lugaresAcesos(conexoes.map((c) => c.conexao), barraSaiu));

  return (
    <>
      {/*
        Linhas ABAIXO dos cards e da placa: cada traço entra por baixo das duas
        pontas, então o que a plateia vê é um traço LIGANDO duas coisas, e não um
        traço passando por cima delas.
      */}
      <svg
        aria-hidden="true"
        width={CANVAS.largura}
        height={CANVAS.altura}
        viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: camada.cenario + 1,
          pointerEvents: 'none',
        }}
      >
        {conexoes.map(({ conexao }, indice) => (
          <LinhaConexao
            key={`conexao-${indice}`}
            pontos={[centroDoCard(conexao.viaLugar), CONVITE_CENTRO]}
            espessura={conexao.espessura}
            duracaoMs={conexao.duracaoMs}
            aceso={conexaoAcesa(conexao, barraSaiu)}
          />
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.cenario + 2,
          pointerEvents: 'none',
        }}
      >
        {(Object.keys(LUGARES) as LugarId[]).map((lugarId) => (
          <CardDoLugar key={lugarId} lugarId={lugarId} aceso={acesos.has(lugarId)} />
        ))}
        <PlacaDoConvite />
      </div>

      {/*
        As origens ficam ACIMA dos overlays persistentes: elas partem de dentro
        da barra de itens e de junto do painel de skills, e uma arte que nasce
        atrás do overlay não tem de onde sair.
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.overlayPersistente + 1,
          pointerEvents: 'none',
        }}
      >
        {conexoes.map(({ conexao, partida }, indice) => (
          <OrigemDaConexao
            key={`origem-${indice}`}
            conexao={conexao}
            partida={partida}
            aceso={conexaoAcesa(conexao, barraSaiu)}
          />
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------ tela

type Fase = 'conexoes' | 'esvaziar' | 'futura' | 'perguntas';

const ROTULO_AVANCO: Record<Fase, string> = {
  conexoes: 'Traçar a próxima conexão',
  esvaziar: 'Esvaziar a barra de itens',
  futura: 'Mostrar a versão futura',
  perguntas: 'Ir para as perguntas finais',
};

export function Revelacao(): JSX.Element {
  const conexoesFeitas = useJogo((s) => s.revelacao.conexoesFeitas);
  const barraSaiu = useJogo((s) => s.revelacao.barraSaiu);
  const versaoFutura = useJogo((s) => s.revelacao.versaoFutura);
  const itens = useJogo((s) => s.itens);
  const skills = useJogo((s) => s.skills);
  const dispararConexao = useJogo((s) => s.dispararConexao);
  const esvaziarBarra = useJogo((s) => s.esvaziarBarra);
  const mostrarVersaoFutura = useJogo((s) => s.mostrarVersaoFutura);
  const avancarPergunta = useJogo((s) => s.avancarPergunta);

  /**
   * Slots da barra congelados na entrada, na mesma ordem da BarraDeItens: os
   * itens se apagam ao conectar, mas a coordenada de partida da arte tem que
   * permanecer — ela é lida no clique, depois de o item já estar consumido.
   */
  const [slots] = useState<ItemId[]>(() =>
    (Object.keys(itens) as ItemId[]).filter((id) => itens[id] === 'presente'),
  );

  const [travado, setTravado] = useState(false);
  const [perguntaVisivel, setPerguntaVisivel] = useState(false);
  const temporizadores = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    if (!versaoFutura) return undefined;
    setPerguntaVisivel(true);
    const id = window.setTimeout(() => setPerguntaVisivel(false), PERGUNTA_VISIVEL_MS);
    return () => window.clearTimeout(id);
  }, [versaoFutura]);

  const fase: Fase =
    conexoesFeitas < CONEXOES.length
      ? 'conexoes'
      : !barraSaiu
        ? 'esvaziar'
        : !versaoFutura
          ? 'futura'
          : 'perguntas';

  function travar(espera: number): void {
    setTravado(true);
    const id = window.setTimeout(() => setTravado(false), espera);
    temporizadores.current.push(id);
  }

  function avancar(): void {
    if (travado) return;
    switch (fase) {
      case 'conexoes': {
        const proxima = CONEXOES[conexoesFeitas];
        dispararConexao();
        // Trava pelo tempo do traçado, que é também o tempo da viagem da arte:
        // dois cliques colados atropelariam as duas coisas de uma vez.
        travar((proxima?.duracaoMs ?? duracao.media) + 250);
        break;
      }
      case 'esvaziar':
        esvaziarBarra();
        travar(duracao.longa);
        break;
      case 'futura':
        mostrarVersaoFutura();
        // Os ~5s de sustentação contam DEPOIS que a pergunta sai de cena.
        // Travar aqui é de propósito: o gesto sem texto é o conteúdo.
        travar(PERGUNTA_VISIVEL_MS + SUSTENTACAO_MS);
        break;
      case 'perguntas':
        avancarPergunta();
        break;
    }
  }

  const feitas = CONEXOES.slice(0, conexoesFeitas);
  const ultima: Conexao | undefined = CONEXOES[conexoesFeitas - 1];
  const conexoesNaTela: ConexaoNaTela[] = feitas.map((conexao) => ({
    conexao,
    partida: partidaDaConexao(conexao, slots, skills),
  }));
  const skillsConectadas = new Set<SkillId>();
  for (const conexao of feitas) {
    if (conexao.origem.tipo === 'skill') skillsConectadas.add(conexao.origem.skillId);
  }
  /** Item que acabou de conectar: é ele que pulsa uma vez na barra. */
  const itemQuePulsa: ItemId | null =
    ultima && ultima.origem.tipo === 'item' ? ultima.origem.itemId : null;

  /**
   * A faixa de fala é UM canal, usado por uma voz de cada vez: a Cláudia
   * enquanto as conexões acontecem, a Ana quando pergunta. Antes a pergunta
   * nascia ao lado das duas figuras, no meio do mapa, onde ela cobria o card de
   * um lugar; aqui ela cai onde toda fala desta tela já cai, e a plateia não
   * precisa procurar de onde veio o texto.
   */
  const falaVisivel = versaoFutura ? perguntaVisivel : Boolean(ultima) && !barraSaiu;
  const fala = versaoFutura ? PERGUNTA_FINAL : (ultima?.texto ?? '');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: cores.fundo,
        color: cores.texto,
      }}
    >
      <style>{CSS}</style>

      {/* ----------------------------------------------- fundo: o mapa, escuro */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.cenario,
        }}
      >
        <Imagem
          id={ASSET_MAPA}
          rotulo="Mapa da jornada"
          largura={CANVAS.largura}
          altura={CANVAS.altura}
          decorativo
          mostrarRotulo={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            /**
             * Fundo, e só fundo: os cards são as coisas da tela. Foi medido
             * olhando o quadro montado — a 30% a planta do prédio tem blocos
             * coloridos o bastante para competir com os traços e com as
             * miniaturas, e o mapa deixava de ser fundo. A 18% ele continua
             * lendo como planta e para de disputar. Escurece mais quando a
             * versão futura entra, e NÃO leva a corrente acesa com ele — é ela
             * a resposta que o gesto aponta.
             */
            opacity: versaoFutura ? 0.1 : 0.18,
            transition: `opacity ${duracao.maxima}ms ease-out`,
          }}
        />
      </div>

      {/* ----------------------------------------- o mapa do clímax, em peças */}
      <MapaDaRevelacao conexoes={conexoesNaTela} barraSaiu={barraSaiu} />

      {/* ------------------------------------------------- painel de skills */}
      <section
        aria-label="O que eu aprendi"
        style={{
          position: 'absolute',
          left: PAINEL_X,
          top: PAINEL_Y,
          width: PAINEL_L,
          height: PAINEL_A,
          zIndex: camada.overlayPersistente,
          background: cores.veuLeve,
          overflow: 'hidden',
        }}
      >
        <h2
          style={{
            position: 'absolute',
            left: GEOMETRIA_DO_PAINEL.padding.horizontal,
            top: GEOMETRIA_DO_PAINEL.padding.vertical,
            height: PAINEL_CABECALHO_A,
            fontSize: GEOMETRIA_DO_PAINEL.cabecalho.fonte,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.destaque,
          }}
        >
          O que eu aprendi
        </h2>

        {skills.map((skillId, indice) => {
          const skill = SKILLS[skillId];
          const conectada = skillsConectadas.has(skillId);
          return (
            <span
              key={skillId}
              style={{
                position: 'absolute',
                left: GEOMETRIA_DO_PAINEL.padding.horizontal,
                top: PAINEL_PRIMEIRA_LINHA_Y - PAINEL_Y + indice * PAINEL_PASSO,
                width: PAINEL_L - 2 * GEOMETRIA_DO_PAINEL.padding.horizontal,
                height: PAINEL_LINHA_A,
                display: 'flex',
                alignItems: 'center',
                /**
                 * A marca da esquerda é reservada em TODAS as linhas, mesmo
                 * transparente: é a mesma linguagem que o acordeão usa para a
                 * entrada aberta, e reservar impede que a linha escorregue no
                 * instante em que acende — a partida da quarta origem é ancorada
                 * nesta coordenada.
                 */
                borderLeft: `${borda.maxima}px solid ${
                  conectada ? cores.destaque : 'transparent'
                }`,
                paddingLeft: espaco.sm,
                /**
                 * UMA linha por entrada, com reticências como rede. No painel
                 * de verdade (fase 5) a entrada CRESCE quando o nome quebra;
                 * aqui ela não pode, porque o passo uniforme é o que ancora a
                 * partida da quarta origem — nome que quebrasse empurraria as
                 * linhas de baixo para fora do lugar de onde a arte sai.
                 */
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                /**
                 * 22px — o piso do spec — e NÃO os 24 do painel de verdade.
                 * Desvio declarado, e medido: o nome mais longo ("Competência
                 * que ela foi buscar") mede 364px em 24px contra 358px de caixa
                 * útil depois de reservada a marca da esquerda, e ganharia
                 * reticências justamente no clímax. Em 22px mede 329px e sobra
                 * folga. A POSIÇÃO da linha não muda — só o corpo da letra —,
                 * então nada salta de lugar na troca de tela.
                 */
                fontSize: tipografia.minimo,
                fontWeight: conectada ? tipografia.pesos.maximo : tipografia.pesos.forte,
                lineHeight: tipografia.alturaLinha.compacta,
                /**
                 * SÓ A CONECTADA ACENDE. Antes, quando a barra saía, as nove
                 * ficavam em destaque — e nove amarelos afogam justamente o
                 * único que deveria sobrar. O painel PERMANECER (contra a barra,
                 * que sai) continua sendo metade da tese; a outra metade é haver
                 * UMA coisa acesa, e duas coisas não podem ser uma (ADR-017).
                 */
                color: conectada ? cores.destaque : cores.texto,
                transition: `color ${duracao.longa}ms ease-out`,
              }}
            >
              {skill.nome}
            </span>
          );
        })}
      </section>

      {/* --------------------------------------------------- barra de itens */}
      <section
        aria-label="Itens"
        style={{
          position: 'absolute',
          left: 0,
          top: BARRA_Y,
          width: CANVAS.largura,
          height: BARRA_A,
          zIndex: camada.overlayPersistente,
          background: cores.painel,
          borderTop: `${borda.grossa}px solid ${cores.contorno}`,
          // Depois da quarta conexão a barra se recolhe e sai de cena.
          transform: barraSaiu ? `translateY(${BARRA_A + 40}px)` : 'translateY(0)',
          opacity: barraSaiu ? 0 : 1,
          transition: `transform ${duracao.longa}ms ease-out, opacity ${duracao.longa}ms ease-out`,
        }}
      >
        <h2
          style={{
            position: 'absolute',
            left: espaco.margem,
            top: (BARRA_A - 30) / 2,
            width: BARRA_ROTULO_L,
            fontSize: tipografia.tamanhos.apoio,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.textoApoio,
            textTransform: 'uppercase',
          }}
        >
          Itens
        </h2>

        {slots.map((itemId, indice) => {
          const consumido = itens[itemId] === 'consumido';
          const item = ITENS[itemId];
          const pulsando = itemQuePulsa === itemId;
          return (
            <span
              key={itemId}
              style={{
                position: 'absolute',
                left: ITEM_X + indice * ITEM_PASSO,
                top: ITEM_Y - BARRA_Y,
                width: ITEM_L,
                height: ITEM_A,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: espaco.xs,
                padding: espaco.sm,
                background: cores.fundoElevado,
                border: `${borda.media}px solid ${cores.contorno}`,
                borderRadius: raio.md,
                // O slot esvazia quando a arte dele sai para o mapa.
                opacity: consumido ? 0.12 : 1,
                transition: `opacity ${duracao.media}ms ease-out`,
              }}
            >
              {/* Wrapper próprio para o pulso: remontar o ícone não pode
                  interromper a transição de opacidade do slot. */}
              <span
                key={`icone-${itemId}-${pulsando ? conexoesFeitas : 0}`}
                className={pulsando ? 'rev-pulso' : undefined}
                style={{ display: 'block', width: ICONE, height: ICONE }}
              >
                <Imagem
                  id={assetDoItem(itemId)}
                  rotulo={item.nome}
                  largura={ICONE}
                  altura={ICONE}
                  mostrarRotulo={false}
                  decorativo
                />
              </span>
              <span
                style={{
                  // Duas linhas RESERVADAS: os três nomes da fase 6 quebram, e
                  // altura que depende da métrica da fonte não é geometria.
                  height: 2 * ALTURA_NOME,
                  overflow: 'hidden',
                  fontSize: tipografia.tamanhos.apoio,
                  fontWeight: tipografia.pesos.forte,
                  lineHeight: tipografia.alturaLinha.compacta,
                  textAlign: 'center',
                  color: cores.texto,
                }}
              >
                {item.nome}
              </span>
            </span>
          );
        })}
      </section>

      {/* ------------------------------------------------------ faixa de fala */}
      <p
        aria-live="polite"
        style={{
          position: 'absolute',
          left: LIVRE_ESQ,
          top: FALA_TOPO,
          width: LIVRE_DIR - LIVRE_ESQ,
          height: FALA_A,
          zIndex: camada.narracao,
          margin: 0,
          padding: `${espaco.md}px ${espaco.lg}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: cores.veu,
          borderRadius: raio.md,
          textAlign: 'center',
          fontSize: tipografia.tamanhos.rotulo,
          fontWeight: tipografia.pesos.forte,
          lineHeight: tipografia.alturaLinha.compacta,
          // Duas conexões trazem duas linhas no próprio texto.
          whiteSpace: 'pre-line',
          color: cores.texto,
          opacity: falaVisivel ? 1 : 0,
          transition: `opacity ${duracao.media}ms ease-out`,
        }}
      >
        {fala}
      </p>

      {/*
        A TESE EM IMAGEM, e ela não tem legenda de propósito. Depois da quarta
        conexão a faixa de fala se apaga: o que fica é a barra saindo vazia, as
        três portas apagadas e UMA corrente acesa — competência, lugar, convite.
        Qualquer parágrafo aqui competiria com a imagem que ele deveria deixar
        falar. O apresentador diz a tese em voz alta; está no roteiro como gancho.
      */}

      {/* ----------------------------------------------------- versão futura */}
      {versaoFutura ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            // Acima dos cards e das origens: as duas figuras ficam NA FRENTE do
            // mapa, e o que elas cobrem é a metade apagada dele.
            zIndex: camada.overlayPersistente + 2,
            pointerEvents: 'none',
          }}
        >
          {/* As duas na mesma tela: mesma pessoa, dez anos de distância. */}
          <div
            className="jogo-surgir"
            style={{ position: 'absolute', left: ANA_ESQ, top: ANA_TOPO }}
          >
            <Imagem
              id={assetDoSprite('ana-confiante')}
              rotulo="Ana"
              largura={arte.personagem.largura}
              altura={arte.personagem.altura}
            />
          </div>
          <div
            className="jogo-surgir"
            style={{ position: 'absolute', left: ANA_FUTURA_ESQ, top: ANA_FUTURA_TOPO }}
          >
            <Imagem
              id={assetDoSprite('ana-futura')}
              rotulo="Ana, dez anos depois"
              largura={arte.personagem.largura}
              altura={arte.personagem.altura}
            />
          </div>

          {/*
            Ela não responde: aponta para o convite. Sustentado sem texto e sem
            movimento até o apresentador clicar — a pergunta já saiu de cena, e é
            o silêncio com o gesto que responde.
          */}
          {perguntaVisivel ? null : (
            <svg
              aria-hidden="true"
              className="jogo-surgir"
              width={CANVAS.largura}
              height={CANVAS.altura}
              viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`}
              style={{ position: 'absolute', left: 0, top: 0 }}
            >
              <line
                x1={GESTO_DE.x}
                y1={GESTO_DE.y}
                x2={GESTO_PARA.x}
                y2={GESTO_PARA.y}
                stroke={cores.destaque}
                strokeWidth={ESPESSURA_GESTO}
                strokeLinecap="round"
              />
              <polygon points={pontaDeFlecha(GESTO_DE, GESTO_PARA)} fill={cores.destaque} />
            </svg>
          )}
        </div>
      ) : null}

      {/* --------------------------------------------------- avanço por clique */}
      <button
        type="button"
        className="rev-avancar"
        aria-label={ROTULO_AVANCO[fase]}
        disabled={travado}
        onClick={avancar}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.cartao,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: travado ? 'default' : 'pointer',
        }}
      />
    </div>
  );
}

export default Revelacao;
