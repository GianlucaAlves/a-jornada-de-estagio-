/**
 * Linha de nome do hotspot — a linha de status do SCUMM.
 *
 * Substitui o retângulo de texto que cada hotspot carregava. O problema do
 * retângulo não era o texto, era a QUANTIDADE: um por hotspot, sempre visível,
 * `minWidth: 260`, cobrindo a cena e escondendo justamente a arte que a plateia
 * precisava ver. Aqui é UM elemento na tela, fixo, e só com conteúdo quando o
 * ponteiro ou o foco está sobre algo.
 *
 * Fixo importa: legenda que se move junto com o ponteiro obriga o olho a
 * caçá-la. Sempre no mesmo lugar, ela é lida de relance ou ignorada.
 *
 * O elemento permanece montado mesmo vazio e só muda de opacidade. Montar e
 * desmontar faria a barra pular a cada passagem de ponteiro, e o piso de 22px
 * do spec vale aqui como em qualquer outro lugar: discreto é POSIÇÃO e PESO,
 * nunca fonte menor.
 */
import {
  camada,
  cores,
  duracao,
  easing,
  espaco,
  overlay,
  raio,
  tipografia,
} from '../styles/tokens';

export interface PropsLinhaDeFoco {
  /** Rótulo do hotspot sob o ponteiro ou com foco. `null` = nada em foco. */
  rotulo: string | null;
  /** Há item selecionado: o gesto é "usar em", e a cor acompanha a aura. */
  comItem?: boolean;
}

export function LinhaDeFoco({ rotulo, comItem = false }: PropsLinhaDeFoco): JSX.Element {
  const visivel = rotulo !== null && rotulo.trim() !== '';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        // Empilhada logo acima da barra de itens: o rodapé livre da cena.
        bottom: overlay.barraDeItens,
        height: overlay.linhaDeFoco,
        zIndex: camada.overlayPersistente,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // CRÍTICO: a faixa atravessa o canvas inteiro. Sem isto ela engoliria o
        // clique de qualquer hotspot que caísse no rodapé.
        pointerEvents: 'none',
      }}
    >
      {/* `aria-hidden`: o mesmo texto já vai no `aria-label` do botão do
          hotspot, e anunciar duas vezes atrapalha quem navega por teclado. */}
      <span
        aria-hidden
        style={{
          maxWidth: '70%',
          padding: `${espaco.xs}px ${espaco.md}px`,
          background: cores.caixa,
          borderRadius: raio.sm,
          fontSize: tipografia.tamanhos.minimo,
          fontWeight: tipografia.pesos.normal,
          lineHeight: tipografia.alturaLinha.compacta,
          letterSpacing: tipografia.espacamento.largo,
          color: comItem ? cores.acao : cores.textoApoio,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: visivel ? 1 : 0,
          transition: `opacity ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        {rotulo ?? ''}
      </span>
    </div>
  );
}

export default LinhaDeFoco;
