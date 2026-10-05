import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { PresencaNpc } from '../domain/content/presencas';
import { CANVAS, camada, duracao, easing } from '../styles/tokens';
import { useJogo } from '../store/jogo';
import { Posicionado } from './Canvas';

/** O mesmo nó atravessa os assuntos do NPC; remontar apagaria a caminhada. */
export function PresencaEmCena({ chave, presenca, children }: { chave: string; presenca: PresencaNpc; children: ReactNode }): JSX.Element {
  const [destinoAtivo, setDestinoAtivo] = useState(false);
  const concluir = useJogo(s => s.concluirMovimentoNpc);
  const movimento = presenca.movimento;
  useEffect(() => {
    setDestinoAtivo(false);
    if (!movimento) return;
    // Dois quadros separam a entrada na borda do destino; sem isso o navegador
    // agrupa os estilos e materializa o sprite diretamente no fim do caminho.
    let segundo = 0;
    const primeiro = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setDestinoAtivo(true));
    });
    const timer = window.setTimeout(() => concluir(chave), duracao.maxima + duracao.atrasoDeEntradaNpc);
    return () => { cancelAnimationFrame(primeiro); cancelAnimationFrame(segundo); window.clearTimeout(timer); };
  }, [movimento, chave, concluir]);
  const pos = movimento ? (destinoAtivo ? movimento.destino : movimento.origem) : presenca.posicaoAtual;
  return <Posicionado pos={{ x: 0, y: 0 }} ancora="base" zIndex={camada.hotspot} style={{
    transform: `translate3d(${pos.x / 100 * CANVAS.largura}px, ${pos.y / 100 * CANVAS.altura}px, 0) translate(-50%, -100%)`,
    visibility: presenca.visivel ? 'visible' : 'hidden',
    pointerEvents: movimento || !presenca.visivel ? 'none' : undefined,
    transition: movimento ? `transform ${duracao.maxima}ms ${easing.constante}` : undefined,
  }}><div data-presenca-npc={chave} data-visivel={presenca.visivel} data-movendo={Boolean(movimento)}>{children}</div></Posicionado>;
}
