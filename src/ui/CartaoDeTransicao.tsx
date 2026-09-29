/**
 * Cartão de transição.
 *
 * Único mecanismo de passagem entre blocos, com três funções: marcador de
 * capítulo, cobertura para a troca de sprite (a plateia nunca vê a mudança
 * acontecer) e respiro para a passagem de bastão entre apresentadores.
 *
 * Tela cheia, fundo escuro, tempo grande. O avanço é por clique: o cartão
 * espera o próximo apresentador, não um timer.
 */
import { useEffect, useRef, useState } from 'react';
import { CARTOES } from '../domain/content';
import type { CartaoTransicao } from '../domain/types';
import { useJogo } from '../store/jogo';
import { CANVAS, camada, cores, espaco, tipografia } from '../styles/tokens';

/**
 * Trava de entrada da camada — mesmo conceito do `travar()` em Revelacao.tsx.
 *
 * O apresentador clica ao vivo e sob pressão: duplo-clique acontece. Uma camada
 * `inset: 0` que monta e aceita clique no mesmo quadro come o segundo clique do
 * duplo — e o cartão de passagem de bastão é engolido antes de ser lido. São
 * quatro passagens de bastão na apresentação: quatro chances de perder o cue.
 */
const TRAVA_DE_ENTRADA_MS = 420;

export function CartaoDeTransicao(): JSX.Element | null {
  const tela = useJogo((s) => s.tela);
  const entrarNoBloco = useJogo((s) => s.entrarNoBloco);

  /** Lido antes de qualquer early return: é a dependência da trava. */
  const blocoDaTela = tela.tipo === 'cartao' ? tela.bloco : null;

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

  // Na montagem e a cada cartão novo: toda entrada de camada nasce travada.
  useEffect(() => {
    travar(TRAVA_DE_ENTRADA_MS);
  }, [blocoDaTela]);

  if (blocoDaTela === null) return null;

  const bloco = blocoDaTela;
  const cartao: CartaoTransicao | undefined = CARTOES.find((c) => c.bloco === bloco);

  const tempo = cartao?.tempo ?? '';
  const titulo = cartao?.titulo ?? '';

  return (
    <button
      type="button"
      className="jogo-surgir"
      aria-label={`Entrar no bloco ${bloco}: ${tempo} ${titulo}. Clique para continuar`}
      disabled={travado}
      onClick={() => {
        if (travado) return;
        entrarNoBloco(bloco);
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: CANVAS.largura,
        height: CANVAS.altura,
        zIndex: camada.cartao,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.xl,
        padding: espaco.margem,
        background: cores.fundo,
        border: 'none',
        cursor: travado ? 'default' : 'pointer',
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: tipografia.tamanhos.corpo,
          fontWeight: tipografia.pesos.forte,
          letterSpacing: tipografia.espacamento.largo,
          textTransform: 'uppercase',
          color: cores.textoApoio,
        }}
      >
        {`Bloco ${bloco}`}
      </span>

      <span
        aria-hidden
        style={{
          fontSize: tipografia.tamanhos.gigante,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          letterSpacing: tipografia.espacamento.largo,
          color: cores.destaque,
          textAlign: 'center',
        }}
      >
        {tempo}
      </span>

      <span
        aria-hidden
        style={{
          fontSize: tipografia.tamanhos.grande,
          fontWeight: tipografia.pesos.forte,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.texto,
          textAlign: 'center',
        }}
      >
        {titulo}
      </span>

      <span
        aria-hidden
        className="jogo-pulso"
        style={{
          marginTop: espaco.xxl,
          fontSize: tipografia.tamanhos.minimo,
          fontWeight: tipografia.pesos.forte,
          color: cores.textoApoio,
        }}
      >
        Clique para continuar ▶
      </span>
    </button>
  );
}

export default CartaoDeTransicao;
