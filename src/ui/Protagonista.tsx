/**
 * A protagonista.
 *
 * Sprite ÚNICO que desliza até o ponto alvo por transition de transform, com
 * bob/inclinação sutil por CSS enquanto se move. Decisões do spec:
 *
 * - Sem frames de ciclo de caminhada: manter rosto e proporção consistentes
 *   entre frames é onde arte gerada por IA falha mais visivelmente. Trocar por
 *   sprite multi-frame depois é substituição de asset, sem mudar código.
 * - Sem pathfinding: linha reta até o ponto de parada do hotspot.
 * - Clicar de novo durante a caminhada TELEPORTA ao destino.
 */
import { useEffect, useRef, useState } from 'react';
import { NOME_PROTAGONISTA } from '../domain/types';
import type { Ponto, SpriteId } from '../domain/types';
import { assetDoSprite } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { CANVAS, camada, duracao, easing, limitarDuracao } from '../styles/tokens';
import { Imagem } from './Imagem';

/**
 * Uma ordem de movimento. `seq` existe para que a mesma coordenada possa ser
 * comandada duas vezes (e para que um teleporte seja distinguível de uma
 * caminhada até o mesmo ponto).
 */
export interface ComandoDeMovimento {
  alvo: Ponto;
  instantaneo: boolean;
  seq: number;
}

export interface PropsProtagonista {
  comando: ComandoDeMovimento;
  /** Chamado ao encostar no ponto de parada — inclusive quando teleporta. */
  onChegar?: () => void;
  /** Sobrepõe o sprite da store (usado por telas de fecho). */
  sprite?: SpriteId;
  altura?: number;
  largura?: number;
}

/** Velocidade travada em px de canvas por segundo; a duração é sempre clampada. */
const VELOCIDADE = 1100;

function duracaoDaCaminhada(deltaXPercent: number, deltaYPercent: number): number {
  const dx = (deltaXPercent / 100) * CANVAS.largura;
  const dy = (deltaYPercent / 100) * CANVAS.altura;
  const distancia = Math.sqrt(dx * dx + dy * dy);
  return limitarDuracao((distancia / VELOCIDADE) * 1000);
}

export function Protagonista({
  comando,
  onChegar,
  sprite,
  altura = 520,
  largura = 260,
}: PropsProtagonista): JSX.Element {
  const spriteDaStore = useJogo((s) => s.sprite);
  const spriteAtivo: SpriteId = sprite ?? spriteDaStore;

  const [pos, setPos] = useState<Ponto>(comando.alvo);
  const [msTransicao, setMsTransicao] = useState<number>(0);
  const [movendo, setMovendo] = useState(false);

  const posRef = useRef<Ponto>(comando.alvo);
  const temporizador = useRef<number | null>(null);
  const onChegarRef = useRef<(() => void) | undefined>(onChegar);
  onChegarRef.current = onChegar;

  useEffect(() => {
    if (temporizador.current !== null) {
      window.clearTimeout(temporizador.current);
      temporizador.current = null;
    }

    const de = posRef.current;
    const ms = comando.instantaneo ? 0 : duracaoDaCaminhada(comando.alvo.x - de.x, comando.alvo.y - de.y);
    const parado = Math.abs(comando.alvo.x - de.x) < 0.2 && Math.abs(comando.alvo.y - de.y) < 0.2;

    posRef.current = comando.alvo;
    setMsTransicao(ms);
    setPos(comando.alvo);

    if (comando.instantaneo || parado) {
      setMovendo(false);
      onChegarRef.current?.();
      return;
    }

    setMovendo(true);
    temporizador.current = window.setTimeout(() => {
      temporizador.current = null;
      setMovendo(false);
      onChegarRef.current?.();
    }, ms);

    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
        temporizador.current = null;
      }
    };
  }, [comando]);

  const x = (pos.x / 100) * CANVAS.largura - largura / 2;
  const y = (pos.y / 100) * CANVAS.altura - altura;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: largura,
        height: altura,
        zIndex: camada.protagonista,
        pointerEvents: 'none',
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: `transform ${msTransicao}ms ${easing.suave}`,
      }}
    >
      {/* O bob vive num nó interno: o transform de deslocamento fica livre. */}
      <div
        className={movendo ? 'jogo-bob' : undefined}
        style={{
          width: '100%',
          height: '100%',
          // Assentamento lento ao parar, na janela de animação do spec.
          transition: `transform ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        <Imagem
          id={assetDoSprite(spriteAtivo)}
          rotulo={NOME_PROTAGONISTA}
          largura={largura}
          altura={altura}
          forma="retangulo"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default Protagonista;
