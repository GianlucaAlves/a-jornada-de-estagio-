/**
 * Imagem com três níveis de fallback.
 *
 * 1. PNG do manifest, se o arquivo existir em /public/assets. Tem precedência:
 *    é como o dono do projeto substitui arte sem tocar em código.
 * 2. Ilustração vetorial de src/arte. É o que a apresentação mostra por padrão
 *    enquanto não há PNG — arte de verdade, não remendo.
 * 3. Placeholder geométrico rotulado, só para id sem arte vetorial.
 *
 * Imagem quebrada nunca aparece.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { caminhoDoAsset } from '../assets/manifest';
import { Placeholder } from '../assets/Placeholder';
import type { FormaPlaceholder } from '../assets/Placeholder';
import { ArteDoAsset } from '../arte';

/**
 * Ids cujo PNG já falhou nesta sessão. Sem esse cache, cada remontagem
 * tentaria o mesmo arquivo inexistente de novo — 24 requisições 404 por cena e
 * um piscar antes da arte entrar.
 */
const pngIndisponivel = new Set<string>();

export interface PropsImagem {
  id: string;
  /** Rótulo do placeholder e texto alternativo. Sempre em português. */
  rotulo: string;
  largura: number;
  altura: number;
  forma?: FormaPlaceholder;
  /** Falso onde texto na tela é proibido (ex.: a pausa do Bloco 4). */
  mostrarRotulo?: boolean;
  decorativo?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Imagem({
  id,
  rotulo,
  largura,
  altura,
  forma = 'retangulo',
  mostrarRotulo = true,
  decorativo = false,
  className,
  style,
}: PropsImagem): JSX.Element {
  const caminho = caminhoDoAsset(id);
  const [falhou, setFalhou] = useState(() => pngIndisponivel.has(id));

  // Trocar de asset reabre a chance de carregar, salvo se já sabemos que falha.
  useEffect(() => {
    setFalhou(pngIndisponivel.has(id));
  }, [id]);

  if (caminho === null || falhou) {
    const arte = ArteDoAsset({ id, largura, altura, className });
    if (arte !== null) {
      return (
        <div
          className={className}
          style={{ width: largura, height: altura, ...style }}
          aria-hidden={decorativo ? true : undefined}
          role={decorativo ? undefined : 'img'}
          aria-label={decorativo ? undefined : rotulo}
        >
          {arte}
        </div>
      );
    }
    return (
      <Placeholder
        id={id}
        rotulo={rotulo}
        largura={largura}
        altura={altura}
        forma={forma}
        mostrarRotulo={mostrarRotulo}
        decorativo={decorativo}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={caminho}
      alt={decorativo ? '' : rotulo}
      aria-hidden={decorativo ? true : undefined}
      width={largura}
      height={altura}
      draggable={false}
      onError={() => {
        pngIndisponivel.add(id);
        setFalhou(true);
      }}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  );
}

export default Imagem;
