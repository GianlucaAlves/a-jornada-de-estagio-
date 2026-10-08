/**
 * Puzzle da FASE 4 — uma página para o gestor.
 *
 * ESTE ARQUIVO ERA O DEFEITO CENTRAL DA V1, e vale registrar o que ele era para
 * que ninguém o reconstrua: `PuzzleMontar` não tinha gabarito, `clicarEspaco`
 * aceitava qualquer peça em qualquer espaço vazio sem comparar nada, e o
 * comentário do próprio arquivo admitia "Não existe encaixe errado". Os quatro
 * alvos eram retângulos tracejados cujo ÚNICO texto era `aria-label`, e o miolo
 * do diagrama era um `<rect>` sem texto dentro de um `svg aria-hidden`. Havia
 * 400px de vazio entre as fileiras. O dono disse que não entendeu o que era para
 * fazer — não havia o que entender (ADR-010, spec 03 §1).
 *
 * As três coisas que faltavam, e onde estão agora:
 * 1. GABARITO — `def.pecas[].campo`, comparado em `reduzirMontar`. Peça na casa
 *    errada é RECUSADA, com aviso.
 * 2. RÓTULO VISÍVEL — cada alvo exibe `campo.rotulo` como texto na tela, numa
 *    coluna própria à esquerda do alvo. Não é `aria-label`.
 * 3. LAYOUT COMPACTO — o vazio de 400px e o núcleo sem texto saíram. O que
 *    sobrou é a metáfora que o conteúdo já declara: uma página com quatro
 *    seções nomeadas, e uma bandeja de peças ao lado.
 *
 * O QUE FICOU: a mecânica (escolher peça, encaixar em alvo) e a satisfação — a
 * peça VIAJA da bandeja até a seção com snap firme, e a página inteira acende no
 * fim. Resolver conduz direto à apresentação automática de Ana, então a
 * conclusão precisa ser clara sem interromper o fluxo.
 *
 * A LÓGICA INTEIRA É UM REDUTOR PURO, exportado e testado por mutação
 * (`Montar.test.ts`). O componente é casca: `useReducer` e coordenadas. Se o
 * redutor voltar a aceitar qualquer peça em qualquer campo, a suíte reprova — que
 * é a defesa que não existia quando este arquivo mentia no próprio comentário.
 */
import { useEffect, useReducer, useState } from 'react';

import type { PuzzleMontar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { borda, cores, duracao, espaco, raio, tipografia } from '../../styles/tokens';

import {
  ALTURA_CORPO,
  LARGURA_UTIL,
  type Aviso,
  avisoDeAcerto,
  avisoDeErro,
  embaralharEstavel,
  estiloCaixaClicavel,
  estiloRotuloDeCampo,
  MolduraDePuzzle,
  progressoDe,
} from './moldura';

// ---------------------------------------------------------------- geometria

const LARGURA_ROTULO = 260;
const LARGURA_PECA = 680;
const ALTURA_PECA = 112;
const ESPACO_ENTRE = espaco.md;
const ESPACO_COLUNAS = espaco.xxl;
/** Faixa do cabeçalho de coluna ("A página" / "Peças"). */
const ALTURA_CABECA = 40 + espaco.md;

const X_ALVO = LARGURA_ROTULO + espaco.md;
const X_BANDEJA = X_ALVO + LARGURA_PECA + ESPACO_COLUNAS;

/** Snap com ponta de overshoot: a peça chega e assenta. */
const SNAP = 'cubic-bezier(0.2, 0.9, 0.2, 1.06)';
const ATRASO_ACENDER_MS = 260;
/** Segura a página completa e acesa antes de fechar. */
const ESPERA_CONCLUSAO_MS = 1600;
/** Tempo com a borda do alvo recusando, antes de voltar ao normal. */
const ESPERA_RECUSA_MS = duracao.curta;

function linhaY(indice: number): number {
  return ALTURA_CABECA + indice * (ALTURA_PECA + ESPACO_ENTRE);
}

/**
 * Cobrado por `puzzles.tela.test.ts` contra o orçamento da moldura. O estouro de
 * dois pixels que a auditoria achou no `Estruturar` não tem como voltar em
 * silêncio: aqui ele reprova a suíte.
 *
 * Deriva do CONTEÚDO, não de um 4 escrito à mão: são quatro peças hoje, e um
 * quinto campo não pode passar a estourar a tela sem a suíte perceber.
 */
export function geometriaDe(def: PuzzleMontar): { largura: number; altura: number } {
  const linhas = Math.max(1, def.campos.length, def.pecas.length);
  return {
    largura: X_BANDEJA + LARGURA_PECA,
    altura: ALTURA_CABECA + linhas * ALTURA_PECA + (linhas - 1) * ESPACO_ENTRE,
  };
}

// ---------------------------------------------------------------- regras

export interface EstadoMontar {
  /** campoId -> pecaId. O gabarito é `def.pecas[].campo`; isto é o que a pessoa fez. */
  colocadas: Readonly<Record<string, string>>;
  selecionada: string | null;
  aviso: Aviso;
  /** Campo que acabou de recusar uma peça, para a borda avisar junto do texto. */
  recusou: string | null;
}

export type AcaoMontar =
  | { tipo: 'clicarPeca'; id: string }
  | { tipo: 'clicarCampo'; id: string }
  | { tipo: 'pararRecusa' };

export function estadoInicialMontar(): EstadoMontar {
  return { colocadas: {}, selecionada: null, aviso: null, recusou: null };
}

export function campoDaPeca(estado: EstadoMontar, pecaId: string): string | null {
  for (const [campoId, id] of Object.entries(estado.colocadas)) {
    if (id === pecaId) return campoId;
  }
  return null;
}

export function montarCompleto(def: PuzzleMontar, estado: EstadoMontar): boolean {
  return def.campos.length > 0 && Object.keys(estado.colocadas).length === def.campos.length;
}

/**
 * O redutor. É AQUI que `montar` passa a ser um puzzle.
 *
 * A comparação que não existia: `peca.campo !== acao.id` recusa. Sem esta linha
 * o arquivo volta a ser o que era, e é ela que `Montar.test.ts` derruba por
 * mutação.
 *
 * Peça já encaixada não volta para a bandeja de propósito: desencaixar daria à
 * pessoa um jeito de varrer as quatro casas sem pensar, e o puzzle é sobre
 * saber a que seção cada frase responde. Errar não custa nada — a peça
 * simplesmente continua selecionável.
 */
export function reduzirMontar(
  def: PuzzleMontar,
  estado: EstadoMontar,
  acao: AcaoMontar,
): EstadoMontar {
  switch (acao.tipo) {
    case 'clicarPeca': {
      // Peça já na página não é mais alvo: clicar nela não faz nada.
      if (campoDaPeca(estado, acao.id) !== null) return estado;
      return {
        ...estado,
        selecionada: estado.selecionada === acao.id ? null : acao.id,
        aviso: null,
        recusou: null,
      };
    }

    case 'clicarCampo': {
      const pecaId = estado.selecionada;
      if (pecaId === null) return estado;
      if (estado.colocadas[acao.id] !== undefined) return estado;

      const peca = def.pecas.find((p) => p.id === pecaId);
      if (!peca) return estado;

      if (peca.campo !== acao.id) {
        // RECUSA. A peça permanece selecionada: quem errou o campo sabe qual
        // peça tem na mão, e obrigar a reselecionar castiga sem ensinar.
        return { ...estado, aviso: avisoDeErro(def.textoErro), recusou: acao.id };
      }

      const colocadas = { ...estado.colocadas, [acao.id]: pecaId };
      const completo = Object.keys(colocadas).length === def.campos.length;
      return {
        colocadas,
        selecionada: null,
        aviso: completo ? avisoDeAcerto() : null,
        recusou: null,
      };
    }

    case 'pararRecusa':
      return estado.recusou === null ? estado : { ...estado, recusou: null };

    default: {
      const naoTratado: never = acao;
      return naoTratado;
    }
  }
}

// ---------------------------------------------------------------- componente

export interface MontarProps {
  def: PuzzleMontar;
}

export function Montar({ def }: MontarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [estado, despachar] = useReducer(
    (atual: EstadoMontar, acao: AcaoMontar) => reduzirMontar(def, atual, acao),
    undefined,
    estadoInicialMontar,
  );
  /**
   * A bandeja NÃO segue a ordem declarada no conteúdo, que é a ordem dos campos.
   * Ver `embaralharEstavel`: sem isto, encaixar de cima para baixo resolveria o
   * puzzle sem ler nada — que é o estado anterior deste arquivo com outro nome.
   */
  const [bandeja] = useState(() => embaralharEstavel(def.pecas));

  const completo = montarCompleto(def, estado);
  const [aceso, setAceso] = useState(false);

  useEffect(() => {
    if (!completo) return undefined;
    const idAcender = window.setTimeout(() => setAceso(true), ATRASO_ACENDER_MS);
    const idFechar = window.setTimeout(
      () => resolverPuzzle('montar'),
      ATRASO_ACENDER_MS + ESPERA_CONCLUSAO_MS,
    );
    return () => {
      window.clearTimeout(idAcender);
      window.clearTimeout(idFechar);
    };
  }, [completo, resolverPuzzle]);

  // A borda de recusa volta ao normal sozinha; o texto do aviso fica até o
  // próximo clique. O visual é o susto, o texto é a explicação.
  useEffect(() => {
    if (estado.recusou === null) return undefined;
    const id = window.setTimeout(() => despachar({ tipo: 'pararRecusa' }), ESPERA_RECUSA_MS);
    return () => window.clearTimeout(id);
  }, [estado.recusou]);

  const textoPorPeca = new Map(def.pecas.map((p) => [p.id, p.texto]));
  const geometria = geometriaDe(def);

  return (
    <MolduraDePuzzle
      rotulo={def.rotulo}
      instrucao={def.instrucao}
      progresso={progressoDe(Object.keys(estado.colocadas).length, def.campos.length)}
      aviso={estado.aviso}
    >
      <div
        style={{
          position: 'relative',
          width: geometria.largura,
          height: geometria.altura,
          maxWidth: LARGURA_UTIL,
          maxHeight: ALTURA_CORPO,
        }}
      >
        <span
          style={{
            ...estiloRotuloDeCampo(),
            position: 'absolute',
            left: 0,
            top: 0,
            width: LARGURA_ROTULO + espaco.md + LARGURA_PECA,
            textAlign: 'left',
          }}
        >
          A página
        </span>
        <span
          style={{
            ...estiloRotuloDeCampo(),
            position: 'absolute',
            left: X_BANDEJA,
            top: 0,
            width: LARGURA_PECA,
            textAlign: 'left',
          }}
        >
          Peças
        </span>

        {def.campos.map((campo, indice) => {
          const pecaId = estado.colocadas[campo.id];
          const ocupado = pecaId !== undefined;
          const recusando = estado.recusou === campo.id;
          const y = linhaY(indice);
          const podeReceber = !ocupado && estado.selecionada !== null;

          return (
            <div key={campo.id}>
              {/* O RÓTULO VISÍVEL. Era só aria-label; é isso que fazia a tela
                  ser quatro retângulos tracejados sem sentido nenhum. */}
              <span
                style={{
                  ...estiloRotuloDeCampo(LARGURA_ROTULO),
                  position: 'absolute',
                  left: 0,
                  top: y,
                  height: ALTURA_PECA,
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                }}
              >
                {campo.rotulo}
              </span>

              <button
                type="button"
                className={podeReceber ? 'jogo-pulso' : undefined}
                aria-label={
                  ocupado
                    ? `${campo.rotulo}: ${textoPorPeca.get(pecaId) ?? ''}`
                    : `Colocar a peça escolhida em ${campo.rotulo}`
                }
                disabled={ocupado || estado.selecionada === null}
                onClick={() => despachar({ tipo: 'clicarCampo', id: campo.id })}
                style={{
                  ...estiloCaixaClicavel({
                    largura: LARGURA_PECA,
                    altura: ALTURA_PECA,
                    aceso: false,
                    selecionado: podeReceber,
                    habilitado: podeReceber,
                    tracejado: true,
                  }),
                  position: 'absolute',
                  left: X_ALVO,
                  top: y,
                  // Recusou: a borda vira cor de atenção junto com o texto do
                  // aviso. Sem o par cor+texto, quem está no fundo da sala vê
                  // um clique que não fez nada.
                  borderColor: recusando ? cores.atencao : undefined,
                  borderStyle: recusando ? 'solid' : undefined,
                  borderWidth: recusando ? borda.maxima : undefined,
                  // Zero quando ocupado: a peça encaixada cobre o alvo.
                  opacity: ocupado ? 0 : podeReceber ? 1 : 0.5,
                }}
              />
            </div>
          );
        })}

        {bandeja.map((peca, indice) => {
          const campoId = campoDaPeca(estado, peca.id);
          const encaixada = campoId !== null;
          const indiceCampo = encaixada
            ? def.campos.findIndex((c) => c.id === campoId)
            : -1;
          const destino = encaixada
            ? { x: X_ALVO, y: linhaY(indiceCampo) }
            : { x: X_BANDEJA, y: linhaY(indice) };
          const ativa = estado.selecionada === peca.id;

          return (
            <button
              key={peca.id}
              type="button"
              aria-label={`Peça: ${peca.texto}${encaixada ? ' (encaixada)' : ''}`}
              aria-pressed={ativa}
              disabled={encaixada}
              onClick={() => despachar({ tipo: 'clicarPeca', id: peca.id })}
              style={{
                ...estiloCaixaClicavel({
                  largura: LARGURA_PECA,
                  altura: ALTURA_PECA,
                  aceso: encaixada && aceso,
                  selecionado: ativa || encaixada,
                  habilitado: !encaixada,
                }),
                position: 'absolute',
                left: 0,
                top: 0,
                // A viagem da bandeja até a seção: é o que torna isto gostoso.
                transform: `translate(${destino.x}px, ${destino.y}px) scale(${ativa ? 1.03 : 1})`,
                transition: `transform ${duracao.media}ms ${SNAP}, background ${duracao.curta}ms ease-out, color ${duracao.curta}ms ease-out, border-color ${duracao.curta}ms ease-out`,
                borderRadius: raio.md,
                fontSize: tipografia.tamanhos.corpo,
                zIndex: 2,
              }}
            >
              {peca.texto}
            </button>
          );
        })}
      </div>
    </MolduraDePuzzle>
  );
}

export default Montar;
