/**
 * A protagonista.
 *
 * Desliza até o ponto alvo por transition de transform. Decisões do spec:
 *
 * - Sem pathfinding: linha reta até o ponto de parada do hotspot.
 * - Clicar de novo durante a caminhada TELEPORTA ao destino.
 *
 * O que MUDOU: o `jogo-bob` saiu. Ele balançava o sprite inteiro com rotação, e
 * era literalmente a "folha de papel arrastando pelo cenário" que o dono do
 * projeto apontou — nada dentro da figura mexia, então o olho lia um decalque
 * sendo empurrado. No lugar entrou `SpriteAnimado`: tira de 2 quadros parada,
 * tira de 4 quadros andando, e queda para uma respiração aproximada por CSS
 * enquanto as tiras não existem (ver a bíblia §6.2 e §6.3).
 *
 * O tamanho vem de `arte.personagem`, que é a grade 50x84 da bíblia na escala
 * única de 4x — 336px, 31% da altura. Os 520px anteriores eram 6x: a Ana ocupava
 * 48% da tela e parecia boneco colado em maquete, e pior, NPC em cena na escala
 * certa ao lado dela leria como dois jogos colados.
 */
import { useEffect, useRef, useState } from 'react';
import { NOME_PROTAGONISTA } from '../domain/types';
import type { Ponto, SpriteId } from '../domain/types';
import { assetDoSprite } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { CANVAS, arte, camada, easing, limitarDuracao } from '../styles/tokens';
import { SpriteAnimado } from './SpriteAnimado';
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
  apresentando?: boolean;
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
  apresentando = false,
  altura = arte.personagem.altura,
  largura = arte.personagem.largura,
}: PropsProtagonista): JSX.Element {
  const spriteDaStore = useJogo((s) => s.sprite);
  const nivel = useJogo(s => s.nivel);
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
      {/* O ciclo de quadros vive num nó interno: o transform de deslocamento
          fica livre, e a animação do sprite não briga com ele. */}
      {apresentando && !movendo ? (
        <Imagem id="ana-apresentando" rotulo={NOME_PROTAGONISTA} largura={largura} altura={altura} />
      ) : (
        <SpriteAnimado
          id={sprite === undefined && !spriteAtivo.includes('futura') && !spriteAtivo.includes('trabalhando') ? `ana-nivel-${nivel}` : assetDoSprite(spriteAtivo)}
          rotulo={NOME_PROTAGONISTA}
          largura={largura}
          altura={altura}
          estado={movendo ? 'andando' : 'parado'}
        />
      )}
    </div>
  );
}

export default Protagonista;
