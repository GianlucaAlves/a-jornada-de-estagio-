/**
 * Manifest central de assets.
 *
 * Substituir arte = dropar um arquivo com o mesmo nome em /public/assets/.
 * Nenhum componente conhece caminho: todos passam por `caminhoDoAsset`.
 *
 * Enquanto o arquivo não existir, a UI cai no placeholder geométrico rotulado
 * (src/assets/Placeholder.tsx). Nunca há imagem quebrada — é o que permite
 * ensaiar e cronometrar a apresentação antes de qualquer arte existir.
 */
import type { ItemId, LugarId, NpcId, SpriteId } from '../domain/types';

const RAIZ = '/assets';

/** id de asset -> caminho. Chaves são ids estáveis, não nomes de arquivo. */
export const MANIFEST: Record<string, string> = {
  // ------------------------------------------------ cenários (1920x1080)
  'cenario-escritorio': `${RAIZ}/cenarios/escritorio.png`,
  'cenario-cafezinho': `${RAIZ}/cenarios/cafezinho.png`,
  'cenario-sala-treinamento': `${RAIZ}/cenarios/sala-treinamento.png`,
  'cenario-laboratorio': `${RAIZ}/cenarios/laboratorio.png`,
  'cenario-innovation': `${RAIZ}/cenarios/innovation.png`,
  'cenario-sala-reunioes': `${RAIZ}/cenarios/sala-reunioes.png`,

  // ------------------------------------------------ mapa
  mapa: `${RAIZ}/mapa/mapa.png`,

  // ------------------------------------------------ protagonista (4 sprites)
  'ana-encolhida': `${RAIZ}/protagonista/ana-encolhida.png`,
  'ana-neutra': `${RAIZ}/protagonista/ana-neutra.png`,
  'ana-confiante': `${RAIZ}/protagonista/ana-confiante.png`,
  'ana-futura': `${RAIZ}/protagonista/ana-futura.png`,

  // ------------------------------------------------ elenco fixo (5 NPCs)
  'npc-rafael': `${RAIZ}/npcs/rafael.png`,
  'npc-claudia': `${RAIZ}/npcs/claudia.png`,
  'npc-tiago': `${RAIZ}/npcs/tiago.png`,
  'npc-bianca': `${RAIZ}/npcs/bianca.png`,
  'npc-marcos': `${RAIZ}/npcs/marcos.png`,

  // ------------------------------------------------ itens (5 imediatos)
  'item-senha': `${RAIZ}/itens/senha.png`,
  'item-indicacao-trilha': `${RAIZ}/itens/indicacao-trilha.png`,
  'item-anotacoes-treinamento': `${RAIZ}/itens/anotacoes-treinamento.png`,
  'item-relatorio': `${RAIZ}/itens/relatorio.png`,
  'item-projeto-entregue': `${RAIZ}/itens/projeto-entregue.png`,

  // ------------------------------------------------ itens (3 tardios)
  // Mesma pasta, mesmo padrão de nome, mesma ordem de leitura: nada aqui
  // pode sugerir que estes três são diferentes dos outros cinco.
  'item-cartao-rafael': `${RAIZ}/itens/cartao-rafael.png`,
  'item-certificado-degree': `${RAIZ}/itens/certificado-degree.png`,
  'item-cracha-innovation': `${RAIZ}/itens/cracha-innovation.png`,
};

/** Caminho do asset, ou null quando não há entrada no manifest. */
export function caminhoDoAsset(id: string): string | null {
  const caminho: string | undefined = MANIFEST[id];
  return caminho ?? null;
}

// ------------------------------------------------------------ ids tipados

export function assetDoCenario(lugarId: LugarId): string {
  return `cenario-${lugarId}`;
}

export function assetDoSprite(spriteId: SpriteId): string {
  return spriteId;
}

export function assetDoNpc(npcId: NpcId): string {
  return `npc-${npcId}`;
}

export function assetDoItem(itemId: ItemId): string {
  return `item-${itemId}`;
}

export const ASSET_MAPA = 'mapa';
