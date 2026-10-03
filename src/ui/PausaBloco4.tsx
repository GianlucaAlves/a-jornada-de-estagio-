/**
 * Pausa silenciosa depois da apresentação.
 *
 * O cenário e os apoios repetem a composição de Cena.tsx nas mesmas
 * coordenadas. A plateia sai em três tempos e Ana recua um passo; reconstruir
 * sala, mesa ou projetor com retângulos fazia a geometria saltar no silêncio.
 */
import { useEffect, useRef, useState } from 'react';
import { assetDoCenario, assetDoSprite } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { CANVAS, arte, camada, duracao, easing } from '../styles/tokens';
import { Imagem } from './Imagem';
import { QuadroSTAR } from './QuadroSTAR';

const MARCAS: readonly number[] = [600, 2200, 3800, 5400, 7000];
const ESPERA_DO_AVANCO_MS = (MARCAS[MARCAS.length - 1] ?? 0) + duracao.maxima;

export function PausaBloco4(): JSX.Element {
  const concluirPausaBloco4 = useJogo((s) => s.concluirPausaBloco4);
  const sprite = useJogo((s) => s.sprite);
  const [etapa, setEtapa] = useState(0);
  const [travado, setTravado] = useState(true);
  const temporizadores = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    const liberar = window.setTimeout(() => setTravado(false), ESPERA_DO_AVANCO_MS);
    temporizadores.current.push(liberar);
    const marcas = MARCAS.map((ms, indice) =>
      window.setTimeout(() => setEtapa(indice + 1), ms),
    );
    return () => {
      window.clearTimeout(liberar);
      for (const id of marcas) window.clearTimeout(id);
    };
  }, []);

  const transicao = `opacity ${duracao.maxima}ms ${easing.suave}, transform ${duracao.maxima}ms ${easing.suave}`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: CANVAS.largura,
        height: CANVAS.altura,
        zIndex: camada.pausa,
        overflow: 'hidden',
      }}
    >
      <Imagem
        id={assetDoCenario('sala-reunioes')}
        rotulo="Sala de reuniões"
        largura={CANVAS.largura}
        altura={CANVAS.altura}
        decorativo
        mostrarRotulo={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <div aria-hidden="true" style={{ position: 'absolute', left: '53%', top: '82.4%', transform: 'translate(-50%, -100%)' }}>
        <Imagem id="objeto-plateia-vazia" rotulo="" largura={936} altura={216} decorativo mostrarRotulo={false} />
      </div>

      {/* Os três apoios mantêm os mesmos pontos de contato da cena interativa. */}
      <div style={{ position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%, -50%)' }}>
        <Imagem id="objeto-tv-grande" rotulo="" largura={384} altura={240} decorativo mostrarRotulo={false} />
      </div>
      <QuadroSTAR />
      <div style={{ position: 'absolute', left: '74%', top: '61%', transform: 'translate(-50%, -100%)' }}>
        <Imagem id="objeto-atril" rotulo="" largura={80} altura={160} decorativo mostrarRotulo={false} />
      </div>
      {([0, 1, 2] as const).flatMap((indice) => ([
        { id: 'objeto-plateia', topo: '75%', altura: 136 },
        { id: 'objeto-plateia-frente', topo: '82.4%', altura: 216 },
      ] as const).map((fileira) => (
        <div
          key={`${indice}-${fileira.id}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '53%',
            top: fileira.topo,
            width: 936,
            height: fileira.altura,
            clipPath: `inset(0 ${((2 - indice) / 3) * 100}% 0 ${(indice / 3) * 100}%)`,
            transform: etapa >= indice + 2
              ? `translate(-50%, -100%) translate(${(indice - 1) * 24}px, -24px)`
              : 'translate(-50%, -100%)',
            opacity: etapa >= indice + 2 ? 0 : 1,
            transition: transicao,
          }}
        >
          <Imagem id={fileira.id} rotulo="" largura={936} altura={fileira.altura} decorativo mostrarRotulo={false} />
        </div>
      )))}

      {/* Ana permanece no ponto de apresentação, voltada à sala até o fim. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `calc(${etapa >= 1 ? 63 : 65}% - ${arte.personagem.largura / 2}px)`,
          top: `calc(62% - ${arte.personagem.altura}px)`,
          width: arte.personagem.largura,
          height: arte.personagem.altura,
          transition: `left ${duracao.longa}ms ${easing.suave}`,
        }}
      >
        <Imagem
          id={assetDoSprite(sprite)}
          rotulo=""
          largura={arte.personagem.largura}
          altura={arte.personagem.altura}
          decorativo
          mostrarRotulo={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <button
        type="button"
        aria-label="Continuar após a pausa"
        disabled={travado}
        onClick={() => {
          if (!travado) concluirPausaBloco4();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          cursor: travado ? 'default' : 'pointer',
        }}
      />
    </div>
  );
}

export default PausaBloco4;
