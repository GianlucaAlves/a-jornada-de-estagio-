/**
 * Puzzle do Bloco 4 — montar o diagrama da entrega.
 *
 * Deliberadamente o mais satisfatório dos quatro: peças grandes, encaixe com
 * snap firme, conector acendendo a cada peça, e o diagrama inteiro alinhado e
 * aceso no fim. A plateia precisa sentir competência aqui, porque é o silêncio
 * logo depois que dói.
 *
 * Não existe encaixe errado: `PuzzleMontar` não tem gabarito. Qualquer peça
 * entra em qualquer espaço vazio — a satisfação é o movimento, não o acerto.
 */
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import type { PuzzleMontar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { borda, cores, duracao, espaco, raio, tipografia } from '../../styles/tokens';

const PECA_L = 420;
const PECA_A = 140;
const ESPACO_COLUNA = 120;
const ESPACO_LINHA = 400;
const COLUNAS = 2;
const ESPACO_BANDEJA = 120;
const ESPACO_PILHA = 36;

const NUCLEO_L = 400;
const NUCLEO_A = 140;

/** Snap com ponta de overshoot. Dentro do orçamento: nada abaixo de 600ms. */
const SNAP = `cubic-bezier(0.2, 0.9, 0.2, 1.06)`;
const ATRASO_ACENDER_MS = 260;
/** Segura o diagrama completo e aceso antes de fechar. */
const ESPERA_CONCLUSAO_MS = 1600;

interface Ponto {
  x: number;
  y: number;
}

function posicaoEspaco(indice: number): Ponto {
  const coluna = indice % COLUNAS;
  const linha = Math.floor(indice / COLUNAS);
  return {
    x: coluna * (PECA_L + ESPACO_COLUNA),
    y: linha * (PECA_A + ESPACO_LINHA),
  };
}

function posicaoBandeja(indice: number): Ponto {
  return {
    x: COLUNAS * PECA_L + (COLUNAS - 1) * ESPACO_COLUNA + ESPACO_BANDEJA,
    y: indice * (PECA_A + ESPACO_PILHA),
  };
}

export interface MontarProps {
  def: PuzzleMontar;
}

export function Montar({ def }: MontarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  /** índice do espaço -> id da peça */
  const [encaixes, setEncaixes] = useState<Record<number, string>>({});
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [aceso, setAceso] = useState(false);

  const total = def.pecas.length;
  const espacos = def.pecas.map((_, i) => i);
  const linhas = Math.max(1, Math.ceil(total / COLUNAS));
  const larguraDiagrama = COLUNAS * PECA_L + (COLUNAS - 1) * ESPACO_COLUNA;
  const alturaDiagrama = linhas * PECA_A + (linhas - 1) * ESPACO_LINHA;
  const alturaArea = Math.max(alturaDiagrama, total * PECA_A + (total - 1) * ESPACO_PILHA);
  const larguraArea = posicaoBandeja(0).x + PECA_L;

  const nucleo = {
    x: larguraDiagrama / 2 - NUCLEO_L / 2,
    y: alturaDiagrama / 2 - NUCLEO_A / 2,
  };
  const centro: Ponto = { x: nucleo.x + NUCLEO_L / 2, y: nucleo.y + NUCLEO_A / 2 };

  const colocadas = Object.keys(encaixes).length;
  const completo = total > 0 && colocadas === total;

  useEffect(() => {
    if (!completo) return undefined;
    const acender = window.setTimeout(() => setAceso(true), ATRASO_ACENDER_MS);
    const fechar = window.setTimeout(
      () => resolverPuzzle('montar'),
      ATRASO_ACENDER_MS + ESPERA_CONCLUSAO_MS,
    );
    return () => {
      window.clearTimeout(acender);
      window.clearTimeout(fechar);
    };
  }, [completo, resolverPuzzle]);

  function espacoDaPeca(id: string): number | null {
    for (const [indice, pecaId] of Object.entries(encaixes)) {
      if (pecaId === id) return Number(indice);
    }
    return null;
  }

  function clicarPeca(id: string): void {
    if (espacoDaPeca(id) !== null) return;
    setSelecionada((atual) => (atual === id ? null : id));
  }

  function clicarEspaco(indice: number): void {
    const id = selecionada;
    if (!id || encaixes[indice]) return;
    setEncaixes((atual) => ({ ...atual, [indice]: id }));
    setSelecionada(null);
  }

  /** Conector do espaço até o canto do núcleo, no lado em que ele está. */
  function conector(indice: number): { x1: number; y1: number; x2: number; y2: number } {
    const base = posicaoEspaco(indice);
    const meioX = base.x + PECA_L / 2;
    const acima = base.y + PECA_A / 2 < centro.y;
    return {
      x1: meioX,
      y1: acima ? base.y + PECA_A : base.y,
      x2: meioX < centro.x ? nucleo.x : nucleo.x + NUCLEO_L,
      y2: acima ? nucleo.y : nucleo.y + NUCLEO_A,
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
        A entrega
      </h2>
      <p
        style={{
          marginTop: espaco.md,
          marginBottom: espaco.xl,
          fontSize: tipografia.tamanhos.corpo,
          color: cores.textoApoio,
        }}
      >
        Escolha uma peça e encaixe no diagrama. {colocadas} de {total}.
      </p>

      <div
        style={{
          position: 'relative',
          width: larguraArea,
          height: alturaArea,
          margin: '0 auto',
        }}
      >
        <svg
          aria-hidden="true"
          width={larguraArea}
          height={alturaArea}
          viewBox={`0 0 ${larguraArea} ${alturaArea}`}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        >
          {espacos.map((indice) => {
            const { x1, y1, x2, y2 } = conector(indice);
            const ligado = Boolean(encaixes[indice]);
            return (
              <line
                key={`conector-${indice}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={ligado ? cores.destaque : cores.contorno}
                strokeWidth={aceso ? borda.maxima : borda.grossa}
                strokeLinecap="round"
                opacity={ligado ? 1 : 0.4}
                style={{
                  transition: `stroke ${duracao.curta}ms ease-out, stroke-width ${duracao.curta}ms ease-out, opacity ${duracao.curta}ms ease-out`,
                }}
              />
            );
          })}

          <rect
            x={nucleo.x}
            y={nucleo.y}
            width={NUCLEO_L}
            height={NUCLEO_A}
            rx={raio.lg}
            fill={aceso ? cores.destaque : cores.caixa}
            stroke={aceso ? cores.destaque : cores.contorno}
            strokeWidth={aceso ? borda.maxima : borda.grossa}
            opacity={aceso ? 1 : 0.55}
            style={{
              transition: `fill ${duracao.curta}ms ease-out, stroke ${duracao.curta}ms ease-out, opacity ${duracao.curta}ms ease-out`,
            }}
          />
        </svg>

        {espacos.map((indice) => {
          const ocupado = Boolean(encaixes[indice]);
          const { x, y } = posicaoEspaco(indice);
          const alvoAtivo = !ocupado && selecionada !== null;
          return (
            <button
              key={`espaco-${indice}`}
              type="button"
              className={alvoAtivo ? 'jogo-pulso' : undefined}
              aria-label={`Encaixar a peça selecionada no espaço ${indice + 1} do diagrama`}
              disabled={ocupado || selecionada === null}
              onClick={() => clicarEspaco(indice)}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: PECA_L,
                height: PECA_A,
                background: 'transparent',
                border: `${borda.grossa}px dashed ${alvoAtivo ? cores.destaque : cores.contorno}`,
                borderRadius: raio.lg,
                opacity: ocupado ? 0 : alvoAtivo ? 1 : 0.45,
                cursor: alvoAtivo ? 'pointer' : 'default',
                zIndex: 1,
              }}
            />
          );
        })}

        {def.pecas.map((peca, indice) => {
          const encaixadaEm = espacoDaPeca(peca.id);
          const destino = encaixadaEm === null ? posicaoBandeja(indice) : posicaoEspaco(encaixadaEm);
          const ativa = selecionada === peca.id;
          return (
            <button
              key={peca.id}
              type="button"
              aria-label={`Peça: ${peca.texto}${encaixadaEm === null ? '' : ' (encaixada)'}`}
              aria-pressed={ativa}
              disabled={encaixadaEm !== null}
              onClick={() => clicarPeca(peca.id)}
              style={{
                ...estiloPeca(encaixadaEm !== null, ativa, aceso),
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translate(${destino.x}px, ${destino.y}px) scale(${ativa ? 1.04 : 1})`,
                transition: `transform ${duracao.media}ms ${SNAP}, background ${duracao.curta}ms ease-out, color ${duracao.curta}ms ease-out, border-color ${duracao.curta}ms ease-out`,
                zIndex: 2,
              }}
            >
              {peca.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function estiloPeca(encaixada: boolean, ativa: boolean, aceso: boolean): CSSProperties {
  const iluminada = encaixada && aceso;
  return {
    width: PECA_L,
    height: PECA_A,
    padding: `0 ${espaco.lg}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: tipografia.tamanhos.corpo,
    fontWeight: tipografia.pesos.forte,
    lineHeight: tipografia.alturaLinha.compacta,
    color: iluminada ? cores.textoInverso : cores.texto,
    background: iluminada ? cores.destaque : cores.fundoElevado,
    border: `${ativa || iluminada ? borda.maxima : borda.grossa}px solid ${
      ativa || encaixada ? cores.destaque : cores.contorno
    }`,
    borderRadius: raio.lg,
    cursor: encaixada ? 'default' : 'pointer',
  };
}

export default Montar;
