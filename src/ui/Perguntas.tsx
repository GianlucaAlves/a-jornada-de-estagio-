/**
 * As três perguntas finais.
 *
 * Uma por clique do apresentador. Fonte grande, centralizada, fundo escuro.
 * As três ficam juntas na tela no fim.
 *
 * Depois da terceira, a camada de clique é DESMONTADA: nenhuma UI sobra na
 * tela — sem créditos, sem botão de reiniciar, sem logo, sem "fim". A última
 * coisa que a plateia vê são as três perguntas dela mesma, e a tela fica
 * parada, em silêncio, até alguém encerrar a chamada.
 * (Reiniciar para o próximo ensaio: recarregar a página.)
 */
import { useEffect, useRef, useState } from 'react';
import { PERGUNTAS_FINAIS } from '../domain/content';
import { assetDoCenario, assetDoSprite } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { CANVAS, borda, camada, cores, espaco, raio, tipografia } from '../styles/tokens';
import { Imagem } from './Imagem';

/**
 * Trava de entrada da camada — mesmo conceito do `travar()` em Revelacao.tsx.
 *
 * A camada monta vinda da revelação e rearma a cada pergunta: sem isso, um
 * duplo-clique atravessa a camada anterior e esta, e duas perguntas aparecem
 * juntas — o fecho é uma por clique, com pausa de fala entre elas.
 */
const TRAVA_DE_ENTRADA_MS = 420;

export function Perguntas(): JSX.Element {
  const visiveis = useJogo((s) => s.revelacao.perguntasVisiveis);
  const avancarPergunta = useJogo((s) => s.avancarPergunta);

  const [travado, setTravado] = useState(true);
  const temporizadores = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  function travar(espera: number): void {
    setTravado(true);
    const id = window.setTimeout(() => setTravado(false), espera);
    temporizadores.current.push(id);
  }

  // Na montagem e a cada pergunta nova.
  useEffect(() => {
    travar(TRAVA_DE_ENTRADA_MS);
  }, [visiveis]);

  const perguntas = PERGUNTAS_FINAIS.slice(0, visiveis);
  const faltamPerguntas = visiveis < PERGUNTAS_FINAIS.length;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: cores.fundo,
        color: cores.texto,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.xxl,
        padding: `0 ${espaco.xxl}px`,
      }}
    >
      <Imagem
        id={assetDoCenario('escritorio')}
        rotulo="Escritório"
        largura={1920}
        altura={1080}
        decorativo
        mostrarRotulo={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: cores.veuLeve }} />
      <Imagem
        id={assetDoSprite('ana-futura-trabalhando')}
        rotulo="Ana no escritório"
        largura={400}
        altura={672}
        decorativo
        mostrarRotulo={false}
        style={{ position: 'absolute', right: 80, bottom: 0 }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: espaco.xxl,
          width: '100%',
          height: '100%',
          padding: `0 ${espaco.xxl}px`,
          paddingRight: CANVAS.largura * 0.28,
        }}
      >
      {perguntas.map((pergunta, indice) => (
        <p
          key={indice}
          className="jogo-aparecer"
          style={{
            textAlign: 'center',
            fontSize: tipografia.tamanhos.subtitulo,
            fontWeight: tipografia.pesos.maximo,
            lineHeight: tipografia.alturaLinha.compacta,
            color: cores.texto,
            width: '100%',
            padding: espaco.lg,
            background: cores.caixa,
            border: `${borda.grossa}px solid ${cores.contorno}`,
            borderRadius: raio.md,
          }}
        >
          {pergunta}
        </p>
      ))}

      {/*
        Camada de avanço. Só existe enquanto há pergunta pra mostrar: depois da
        terceira não sobra nada clicável nem visível na tela.
      */}
      {faltamPerguntas ? (
        <button
          type="button"
          aria-label="Mostrar a próxima pergunta"
          disabled={travado}
          onClick={() => {
            if (travado) return;
            avancarPergunta();
          }}
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
      ) : null}
      </div>
    </div>
  );
}

export default Perguntas;
