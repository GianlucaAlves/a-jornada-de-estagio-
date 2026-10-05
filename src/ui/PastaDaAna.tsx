import type { BlocoId } from '../domain/types';
import { nivelDoBloco } from '../domain/content/niveis';
import { arte, espaco } from '../styles/tokens';
import { Imagem } from './Imagem';

/** Reusa a folha existente como pasta de trabalho: detalhe visual sem item novo. */
export function PastaDaAna({ nivel, largura, altura }: { nivel: BlocoId; largura: number; altura: number }): JSX.Element | null {
  if (!nivelDoBloco(nivel).pasta) return null;
  return <div aria-hidden style={{ position: 'absolute', left: espaco.lg * largura / arte.personagem.largura, top: altura * 0.4, width: arte.item.largura, height: arte.item.altura, pointerEvents: 'none' }}>
    <Imagem id="item-relatorio" rotulo="Pasta de trabalho de Ana" largura={arte.item.largura} altura={arte.item.altura} decorativo mostrarRotulo={false} />
  </div>;
}
