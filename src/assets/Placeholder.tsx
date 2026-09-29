/**
 * Placeholder geométrico rotulado.
 *
 * Todo asset ausente cai aqui em vez de virar imagem quebrada. É o que torna a
 * apresentação navegável, cronometrável e ensaiável antes de existir arte.
 *
 * Sem detalhe fino: forma cheia, contorno grosso, rótulo em texto grande.
 */
import type { CSSProperties } from 'react';
import { borda, cores, tipografia } from '../styles/tokens';

export type FormaPlaceholder = 'retangulo' | 'elipse';

export interface PropsPlaceholder {
  /** Id do asset. Define a cor, para que o mesmo asset seja sempre a mesma cor. */
  id: string;
  rotulo: string;
  largura: number;
  altura: number;
  forma?: FormaPlaceholder;
  /** Falso onde texto na tela é proibido (ex.: a pausa do Bloco 4). */
  mostrarRotulo?: boolean;
  /** Decorativo: some da árvore de acessibilidade. */
  decorativo?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Matiz derivado do id: cor estável por asset, sem tabela para manter. */
function matizDoId(id: string): number {
  let acumulado = 0;
  for (let i = 0; i < id.length; i += 1) {
    acumulado = (acumulado * 31 + id.charCodeAt(i)) % 360;
  }
  return acumulado;
}

function quebrarEmLinhas(texto: string, maxCaracteres: number, maxLinhas: number): string[] {
  const palavras = texto.split(/\s+/).filter((p) => p.length > 0);
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of palavras) {
    const candidata = atual.length === 0 ? palavra : `${atual} ${palavra}`;
    if (candidata.length <= maxCaracteres || atual.length === 0) {
      atual = candidata;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual.length > 0) linhas.push(atual);
  if (linhas.length <= maxLinhas) return linhas;
  const cortadas = linhas.slice(0, maxLinhas);
  const ultimaPosicao = maxLinhas - 1;
  const ultima: string | undefined = cortadas[ultimaPosicao];
  if (ultima !== undefined) cortadas[ultimaPosicao] = `${ultima}…`;
  return cortadas;
}

export function Placeholder({
  id,
  rotulo,
  largura,
  altura,
  forma = 'retangulo',
  mostrarRotulo = true,
  decorativo = false,
  className,
  style,
}: PropsPlaceholder): JSX.Element {
  const matiz = matizDoId(id);
  const preenchimento = `hsl(${matiz} 40% 18%)`;
  const contorno = `hsl(${matiz} 92% 70%)`;

  const menorLado = Math.min(largura, altura);
  const tamanhoFonte = Math.max(
    tipografia.tamanhos.minimo,
    Math.min(tipografia.tamanhos.subtitulo, Math.round(menorLado / 6)),
  );
  const espessura = Math.max(borda.media, Math.round(menorLado / 36));

  const linhas = mostrarRotulo
    ? quebrarEmLinhas(rotulo, Math.max(8, Math.floor(largura / (tamanhoFonte * 0.58))), 4)
    : [];
  const alturaLinha = Math.round(tamanhoFonte * tipografia.alturaLinha.compacta);
  const alturaBloco = alturaLinha * linhas.length;
  const topoBloco = Math.round(altura / 2 - alturaBloco / 2);

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${largura} ${altura}`}
      className={className}
      style={style}
      role={decorativo ? undefined : 'img'}
      aria-label={decorativo ? undefined : rotulo}
      aria-hidden={decorativo ? true : undefined}
    >
      {forma === 'elipse' ? (
        <ellipse
          cx={largura / 2}
          cy={altura / 2}
          rx={Math.max(1, largura / 2 - espessura)}
          ry={Math.max(1, altura / 2 - espessura)}
          fill={preenchimento}
          stroke={contorno}
          strokeWidth={espessura}
        />
      ) : (
        <rect
          x={espessura / 2}
          y={espessura / 2}
          width={Math.max(1, largura - espessura)}
          height={Math.max(1, altura - espessura)}
          rx={Math.min(28, menorLado / 8)}
          fill={preenchimento}
          stroke={contorno}
          strokeWidth={espessura}
        />
      )}

      {linhas.length > 0 ? (
        <>
          {/* Faixa sólida atrás do texto: garante contraste sobre qualquer matiz. */}
          <rect
            x={0}
            y={topoBloco - Math.round(alturaLinha * 0.3)}
            width={largura}
            height={alturaBloco + Math.round(alturaLinha * 0.6)}
            fill={cores.caixa}
            opacity={0.88}
          />
          <text
            x={largura / 2}
            y={topoBloco + Math.round(alturaLinha * 0.75)}
            textAnchor="middle"
            fontFamily={tipografia.familia}
            fontSize={tamanhoFonte}
            fontWeight={tipografia.pesos.maximo}
            fill={cores.texto}
          >
            {linhas.map((linha, indice) => (
              <tspan key={linha + String(indice)} x={largura / 2} dy={indice === 0 ? 0 : alturaLinha}>
                {linha}
              </tspan>
            ))}
          </text>
        </>
      ) : null}
    </svg>
  );
}

export default Placeholder;
