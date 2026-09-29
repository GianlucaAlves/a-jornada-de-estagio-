/**
 * Canvas de dimensão fixa 1920x1080.
 *
 * Responsividade real foi rejeitada no spec: não há usuário em celular, há um
 * compartilhamento de tela conhecido. Canvas fixo garante paridade exata entre
 * o monitor de quem constrói e a tela de quem assiste. O que sobra é letterbox
 * preto. Hotspots são posicionados em % deste retângulo.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Ponto } from '../domain/types';
import { CANVAS, cores } from '../styles/tokens';

function escalaAtual(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth / CANVAS.largura, window.innerHeight / CANVAS.altura);
}

export function Canvas({ children }: { children: ReactNode }): JSX.Element {
  const [escala, setEscala] = useState<number>(escalaAtual);

  useEffect(() => {
    const aoRedimensionar = (): void => setEscala(escalaAtual());
    window.addEventListener('resize', aoRedimensionar);
    return () => window.removeEventListener('resize', aoRedimensionar);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: cores.letterbox,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: CANVAS.largura,
          height: CANVAS.altura,
          flex: '0 0 auto',
          background: cores.fundo,
          overflow: 'hidden',
          transform: `scale(${escala})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export type AncoraDoCanvas = 'centro' | 'base' | 'topoEsquerda';

export interface PropsPosicionado {
  /** Coordenada em % do canvas, como vem do conteúdo. */
  pos: Ponto;
  ancora?: AncoraDoCanvas;
  zIndex?: number;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Posiciona um filho por coordenada percentual dentro do canvas.
 * `base` ancora pelos pés — é o que faz personagem e hotspot de chão
 * assentarem no ponto, não flutuarem sobre ele.
 */
export function Posicionado({
  pos,
  ancora = 'centro',
  zIndex,
  style,
  children,
}: PropsPosicionado): JSX.Element {
  const deslocamento =
    ancora === 'centro'
      ? 'translate(-50%, -50%)'
      : ancora === 'base'
        ? 'translate(-50%, -100%)'
        : 'translate(0, 0)';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: deslocamento,
        zIndex,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Canvas;
