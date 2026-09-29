/**
 * Puzzle do Bloco 3 (Laboratório) — sequenciar o log.
 *
 * Cinco linhas embaralhadas (a ordem inicial é a ordem em que o conteúdo as
 * declara) e duas setas por linha. Setas em vez de drag: drag ao vivo, num
 * canvas escalado e compartilhado por Teams, é onde a apresentação trava.
 *
 * Quando a ordem bate com `ordemCorreta`, as DUAS ÚLTIMAS linhas acendem
 * juntas — o sistema não revela a causa, a ordem revela.
 */
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import type { PuzzleSequenciar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import {
  alvo,
  borda,
  cores,
  duracao,
  easing,
  espaco,
  raio,
  tipografia,
} from '../../styles/tokens';

const LARGURA = 1500;
const ALTURA_LINHA = 104;
/** Segura o par aceso na tela antes de fechar: é o beat do "funcionou duas". */
const ESPERA_CONCLUSAO_MS = 1500;

export interface SequenciarProps {
  def: PuzzleSequenciar;
}

export function Sequenciar({ def }: SequenciarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [ordem, setOrdem] = useState<string[]>(() => def.linhas.map((l) => l.id));
  const [mexeu, setMexeu] = useState(false);

  const naOrdem =
    ordem.length === def.ordemCorreta.length && ordem.every((id, i) => id === def.ordemCorreta[i]);
  // Só conta como resolvido depois de um movimento: se o conteúdo declarar as
  // linhas já ordenadas, o puzzle não se resolve sozinho ao abrir.
  const completo = mexeu && naOrdem;

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('sequenciar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  function mover(indice: number, direcao: -1 | 1): void {
    const destino = indice + direcao;
    if (destino < 0 || destino >= ordem.length) return;
    setOrdem((atual) => {
      const copia = [...atual];
      const a = copia[indice];
      const b = copia[destino];
      if (a === undefined || b === undefined) return atual;
      copia[indice] = b;
      copia[destino] = a;
      return copia;
    });
    setMexeu(true);
  }

  const textoPorId = new Map(def.linhas.map((l) => [l.id, l.texto]));

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
        Histórico do erro da madrugada
      </h2>
      <p
        style={{
          marginTop: espaco.md,
          marginBottom: espaco.xl,
          fontSize: tipografia.tamanhos.corpo,
          color: cores.textoApoio,
        }}
      >
        Coloque as linhas na ordem em que aconteceram.
      </p>

      <ol
        style={{
          width: LARGURA,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: espaco.md,
        }}
      >
        {ordem.map((id, indice) => {
          const texto = textoPorId.get(id) ?? id;
          // As duas últimas acendem juntas: a causa e a consequência.
          const acesa = completo && indice >= ordem.length - 2;
          return (
            <li
              key={id}
              style={{
                height: ALTURA_LINHA,
                display: 'flex',
                alignItems: 'center',
                gap: espaco.md,
                padding: `0 ${espaco.md}px 0 ${espaco.lg}px`,
                textAlign: 'left',
                fontSize: tipografia.tamanhos.corpo,
                fontWeight: tipografia.pesos.forte,
                lineHeight: tipografia.alturaLinha.compacta,
                color: acesa ? cores.textoInverso : cores.texto,
                background: acesa ? cores.destaque : cores.caixa,
                border: `${acesa ? borda.grossa : borda.media}px solid ${
                  acesa ? cores.destaque : cores.contorno
                }`,
                borderRadius: raio.md,
                transition: `background ${duracao.media}ms ${easing.suave}, color ${duracao.media}ms ${easing.suave}, border-color ${duracao.media}ms ${easing.suave}`,
              }}
            >
              <span style={{ flex: '1 1 auto' }}>{texto}</span>

              <span style={{ flex: '0 0 auto', display: 'flex', gap: espaco.sm }}>
                <button
                  type="button"
                  aria-label={`Mover para cima: ${texto}`}
                  disabled={indice === 0 || completo}
                  onClick={() => mover(indice, -1)}
                  style={estiloSeta(acesa)}
                >
                  <span aria-hidden="true">▲</span>
                </button>
                <button
                  type="button"
                  aria-label={`Mover para baixo: ${texto}`}
                  disabled={indice === ordem.length - 1 || completo}
                  onClick={() => mover(indice, 1)}
                  style={estiloSeta(acesa)}
                >
                  <span aria-hidden="true">▼</span>
                </button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function estiloSeta(acesa: boolean): CSSProperties {
  return {
    width: alvo.minimo + espaco.sm,
    height: alvo.minimo,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tipografia.tamanhos.rotulo,
    lineHeight: tipografia.alturaLinha.compacta,
    color: acesa ? cores.textoInverso : cores.texto,
    background: 'transparent',
    border: `${borda.media}px solid ${acesa ? cores.textoInverso : cores.contorno}`,
    borderRadius: raio.sm,
  };
}

export default Sequenciar;
