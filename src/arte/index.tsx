/**
 * Camada de arte vetorial.
 *
 * Ilustração SVG desenhada em código. É o que a apresentação mostra por
 * padrão — não é placeholder. Se um PNG existir em /public/assets, ele tem
 * precedência (ver src/ui/Imagem.tsx); a arte vetorial é o piso de qualidade,
 * não um remendo.
 *
 * A paleta e os tipos vivem em './paleta', um módulo folha. Este arquivo
 * importa a arte, e a arte importa a paleta — nunca este arquivo. Ver o
 * comentário em paleta.ts para o motivo.
 */
import type { ReactElement } from 'react';

import { ArteDeCenario, ArteDeMapa } from './cenarios';
import { ArteDeItem } from './itens';
import { ArteDeNpc, ArteDeProtagonista } from './personagens';
import type { PropsArte } from './paleta';

export { PALETA } from './paleta';
export type { PropsArte } from './paleta';
export { ArteDeCenario, ArteDeMapa } from './cenarios';
export { ArteDeItem } from './itens';
export { ArteDeNpc, ArteDeProtagonista } from './personagens';

/**
 * Resolve o id de asset do manifest para a ilustração correspondente.
 * Retorna null quando não há arte vetorial para o id.
 */
export function ArteDoAsset({
  id,
  ...props
}: PropsArte & { id: string }): ReactElement | null {
  if (id.startsWith('cenario-')) {
    return <ArteDeCenario lugar={id.slice('cenario-'.length)} {...props} />;
  }
  if (id === 'mapa') {
    return <ArteDeMapa {...props} />;
  }
  if (id.startsWith('ana-')) {
    return <ArteDeProtagonista sprite={id} {...props} />;
  }
  if (id.startsWith('npc-')) {
    return <ArteDeNpc npc={id.slice('npc-'.length)} {...props} />;
  }
  if (id.startsWith('item-')) {
    return <ArteDeItem item={id.slice('item-'.length)} {...props} />;
  }
  return null;
}
