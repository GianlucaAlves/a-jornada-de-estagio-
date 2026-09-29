/**
 * Puzzle do Bloco 2 — associar pares.
 *
 * Clique na esquerda, clique na direita: nasce uma linha grossa de alto
 * contraste. Par errado, a linha recua e nada acontece — sem mensagem, sem
 * punição, sem estado alterado.
 *
 * Geometria fixa em px: as âncoras das linhas são calculadas por aritmética, e
 * não medidas do DOM. Medir depende do transform de escala do canvas e é
 * exatamente o tipo de coisa que quebra na projeção.
 */
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { PuzzleAssociar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { borda, cores, duracao, easing, espaco, raio, tipografia } from '../../styles/tokens';

const LARGURA_COLUNA = 560;
const ALTURA_LINHA = 132;
const ESPACO_LINHA = espaco.lg;
const ESQUERDA_X = 0;
const DIREITA_X = 1000;
const LARGURA_AREA = DIREITA_X + LARGURA_COLUNA;

/** Grossa de propósito: linha fina desaparece na compressão do Teams. */
const ESPESSURA = 8;
/**
 * Espera antes do recuo: a linha errada completa o traçado, a plateia vê a
 * tentativa, e só então ela volta. Não é animação, é tempo de leitura.
 */
const ESPERA_ANTES_DO_RECUO_MS = duracao.curta + 200;
const ESPERA_CONCLUSAO_MS = 1100;

function centroDaLinha(indice: number): number {
  return indice * (ALTURA_LINHA + ESPACO_LINHA) + ALTURA_LINHA / 2;
}

/** Hash estável (FNV-1a). Sem Math.random: a ordem é a mesma no ensaio e no palco. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Reordena a coluna da direita de forma determinística. Sem isso, um gabarito
 * escrito em paralelo viraria "ligue cada linha na da frente" e o puzzle
 * deixaria de ser um puzzle.
 */
function ordenarDireita(direita: PuzzleAssociar['direita']): PuzzleAssociar['direita'] {
  const ordenada = [...direita].sort((a, b) => hash(a.id) - hash(b.id));
  const igual = ordenada.every((item, i) => item.id === direita[i]?.id);
  const primeiro = ordenada[0];
  if (igual && ordenada.length > 1 && primeiro) {
    return [...ordenada.slice(1), primeiro];
  }
  return ordenada;
}

interface Traco {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function Linha({ traco, recuando }: { traco: Traco; recuando: boolean }): JSX.Element {
  const comprimento = Math.hypot(traco.x2 - traco.x1, traco.y2 - traco.y1);
  const [desenhada, setDesenhada] = useState(false);

  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setDesenhada(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  return (
    <line
      x1={traco.x1}
      y1={traco.y1}
      x2={traco.x2}
      y2={traco.y2}
      stroke={cores.destaque}
      strokeWidth={ESPESSURA}
      strokeLinecap="round"
      strokeDasharray={comprimento}
      strokeDashoffset={desenhada && !recuando ? 0 : comprimento}
      style={{ transition: `stroke-dashoffset ${duracao.curta}ms ease-out` }}
    />
  );
}

export interface AssociarParesProps {
  def: PuzzleAssociar;
}

export function AssociarPares({ def }: AssociarParesProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [direita] = useState(() => ordenarDireita(def.direita));
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [ligacoes, setLigacoes] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<{ esqId: string; dirId: string; recuando: boolean } | null>(
    null,
  );
  const temporizadores = useRef<number[]>([]);

  const total = Object.keys(def.gabarito).length;
  const feitas = Object.keys(ligacoes).length;
  const completo = total > 0 && feitas === total;

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('associar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  function agendar(acao: () => void, atraso: number): void {
    const id = window.setTimeout(acao, atraso);
    temporizadores.current.push(id);
  }

  function clicarEsquerda(id: string): void {
    if (erro || ligacoes[id]) return;
    setSelecionada((atual) => (atual === id ? null : id));
  }

  function clicarDireita(dirId: string): void {
    if (erro) return;
    const esqId = selecionada;
    if (!esqId) return;
    if (Object.values(ligacoes).includes(dirId)) return;

    if (def.gabarito[esqId] === dirId) {
      setLigacoes((atual) => ({ ...atual, [esqId]: dirId }));
      setSelecionada(null);
      return;
    }

    // Errado: a linha aparece, recua, e o estado volta ao que era.
    setErro({ esqId, dirId, recuando: false });
    agendar(() => setErro({ esqId, dirId, recuando: true }), ESPERA_ANTES_DO_RECUO_MS);
    agendar(() => {
      setErro(null);
      setSelecionada(null);
    }, ESPERA_ANTES_DO_RECUO_MS + duracao.curta);
  }

  function tracoEntre(esqId: string, dirId: string): Traco | null {
    const iEsq = def.esquerda.findIndex((item) => item.id === esqId);
    const iDir = direita.findIndex((item) => item.id === dirId);
    if (iEsq < 0 || iDir < 0) return null;
    return {
      x1: ESQUERDA_X + LARGURA_COLUNA,
      y1: centroDaLinha(iEsq),
      x2: DIREITA_X,
      y2: centroDaLinha(iDir),
    };
  }

  const alturaArea =
    centroDaLinha(Math.max(def.esquerda.length, direita.length) - 1) + ALTURA_LINHA / 2;

  function estiloItem(estado: 'normal' | 'selecionado' | 'ligado'): CSSProperties {
    const ligado = estado === 'ligado';
    const aceso = ligado || estado === 'selecionado';
    return {
      width: LARGURA_COLUNA,
      height: ALTURA_LINHA,
      padding: `0 ${espaco.lg}px`,
      display: 'flex',
      alignItems: 'center',
      textAlign: 'left',
      fontSize: tipografia.tamanhos.corpo,
      fontWeight: tipografia.pesos.forte,
      lineHeight: tipografia.alturaLinha.compacta,
      color: ligado ? cores.textoInverso : cores.texto,
      background: ligado ? cores.destaque : cores.caixa,
      border: `${aceso ? borda.grossa : borda.media}px solid ${
        aceso ? cores.destaque : cores.contorno
      }`,
      borderRadius: raio.md,
      cursor: ligado ? 'default' : 'pointer',
      transition: `background ${duracao.curta}ms ${easing.suave}, border-color ${duracao.curta}ms ${easing.suave}`,
    };
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2
        style={{
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.texto,
        }}
      >
        Apareceu na minha frente e eu não soube resolver
      </h2>
      <p
        style={{
          marginTop: espaco.md,
          marginBottom: espaco.xl,
          fontSize: tipografia.tamanhos.corpo,
          color: cores.textoApoio,
        }}
      >
        Ligue cada lacuna à trilha que fecha ela. {feitas} de {total}.
      </p>

      <div
        style={{
          position: 'relative',
          width: LARGURA_AREA,
          height: alturaArea,
          margin: '0 auto',
        }}
      >
        <svg
          aria-hidden="true"
          width={LARGURA_AREA}
          height={alturaArea}
          viewBox={`0 0 ${LARGURA_AREA} ${alturaArea}`}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        >
          {Object.entries(ligacoes).map(([esqId, dirId]) => {
            const traco = tracoEntre(esqId, dirId);
            return traco ? <Linha key={`${esqId}->${dirId}`} traco={traco} recuando={false} /> : null;
          })}

          {erro ? <LinhaDeErro erro={erro} tracoEntre={tracoEntre} /> : null}
        </svg>

        {def.esquerda.map((item, indice) => {
          const ligado = Boolean(ligacoes[item.id]);
          const selecionado = selecionada === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="jogo-botao-nu"
              aria-label={`Lacuna: ${item.texto}${ligado ? ' (já ligada)' : ''}`}
              aria-pressed={selecionado}
              disabled={ligado}
              onClick={() => clicarEsquerda(item.id)}
              style={{
                ...estiloItem(ligado ? 'ligado' : selecionado ? 'selecionado' : 'normal'),
                position: 'absolute',
                left: ESQUERDA_X,
                top: indice * (ALTURA_LINHA + ESPACO_LINHA),
              }}
            >
              {item.texto}
            </button>
          );
        })}

        {direita.map((item, indice) => {
          const ligado = Object.values(ligacoes).includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className="jogo-botao-nu"
              aria-label={`Trilha: ${item.texto}${ligado ? ' (já ligada)' : ''}`}
              disabled={ligado || selecionada === null}
              onClick={() => clicarDireita(item.id)}
              style={{
                ...estiloItem(ligado ? 'ligado' : 'normal'),
                position: 'absolute',
                left: DIREITA_X,
                top: indice * (ALTURA_LINHA + ESPACO_LINHA),
              }}
            >
              {item.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Extraída para que a linha errada remonte (e reanime) a cada tentativa. */
function LinhaDeErro({
  erro,
  tracoEntre,
}: {
  erro: { esqId: string; dirId: string; recuando: boolean };
  tracoEntre: (esqId: string, dirId: string) => Traco | null;
}): JSX.Element | null {
  const traco = tracoEntre(erro.esqId, erro.dirId);
  if (!traco) return null;
  return <Linha key={`erro-${erro.esqId}-${erro.dirId}`} traco={traco} recuando={erro.recuando} />;
}

export default AssociarPares;
