/**
 * Imagem com fallback obrigatório.
 *
 * Tenta o caminho do manifest; se o asset não existe no manifest ou falha ao
 * carregar, entra o placeholder geométrico. Imagem quebrada nunca aparece.
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { caminhoDoAsset } from '../assets/manifest';
import { Placeholder } from '../assets/Placeholder';
import type { FormaPlaceholder } from '../assets/Placeholder';

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
  const [falhou, setFalhou] = useState(false);

  // Trocar de asset reabre a chance de carregar.
  useEffect(() => {
    setFalhou(false);
  }, [id]);

  if (caminho === null || falhou) {
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
      onError={() => setFalhou(true)}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  );
}

export default Imagem;
