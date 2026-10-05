import type { BlocoId, LugarId } from '../domain/types';
import { arte, camada, duracao } from '../styles/tokens';
import { SpriteAnimado } from './SpriteAnimado';
import regioesGeradas from '../../public/assets/ambientes/manifest.json';

/** Recortes do gerador: a animação preserva a posição e a oclusão do mobiliário. */
const REGIOES: Record<string, [number, number, number, number][]> = Object.fromEntries(
  Object.entries(regioesGeradas).map(([nome, regioes]) => [nome, regioes.map(regiao => {
    const [x, y, largura, altura] = regiao;
    if (x === undefined || y === undefined || largura === undefined || altura === undefined) {
      throw new Error(`Recorte ambiental incompleto: ${nome}`);
    }
    return [x, y, largura, altura] as [number, number, number, number];
  })]),
);

export function VidaDoCenario({ lugar, bloco }: { lugar: LugarId; bloco: BlocoId }): JSX.Element {
  const nome = lugar === 'cafezinho' && bloco === 6 ? 'cafezinho-festa' : lugar;
  return <div aria-hidden="true" style={{ pointerEvents: 'none' }}>{REGIOES[nome]?.map(([x, y, w, h], i) => <SpriteAnimado key={`${nome}-${i}`} id={`ambiente-${nome}-${i}`} rotulo="" estado="estatico" decorativo largura={w * arte.escala} altura={h * arte.escala} style={{ position: 'absolute', left: x * arte.escala, top: y * arte.escala, zIndex: camada.cenario + 1, animationDuration: `${duracao.atividadeAmbiental + i * duracao.media}ms`, animationDelay: `${-i * duracao.media}ms` }} />)}</div>;
}
