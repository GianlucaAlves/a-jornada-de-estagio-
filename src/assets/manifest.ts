/**
 * Manifest central de assets.
 *
 * Substituir arte = dropar um arquivo com o mesmo nome em /public/assets/.
 * Nenhum componente conhece caminho: todos passam por `caminhoDoAsset`.
 *
 * Enquanto o arquivo não existir, a UI cai na arte vetorial de `src/arte` e, se
 * nem ela existir, no placeholder geométrico rotulado (src/assets/Placeholder.tsx).
 * Nunca há imagem quebrada — é o que permite ensaiar e cronometrar a
 * apresentação antes de qualquer arte existir, e é por isso que declarar o id
 * ANTES do arquivo é o fluxo normal daqui, não uma gambiarra.
 */
import type {
  ArteDeHotspot,
  BlocoId,
  ItemId,
  Locutor,
  LugarId,
  NpcId,
  SpriteId,
} from '../domain/types';

const RAIZ = '/assets';

/** id de asset -> caminho. Chaves são ids estáveis, não nomes de arquivo. */
export const MANIFEST: Record<string, string> = {
  // ------------------------------------------------ cenários (1920x1080)
  // Cinco lugares, não seis. `sala-treinamento` e `innovation` deixaram de ser
  // lugares (ADR-026) e o Laboratório virou Linha de Produção (ADR-009). As
  // entradas deles saíram daqui para que nenhum id aponte para lugar que não
  // existe — os ARQUIVOS de arte continuam onde estavam; a spec 05 só para de
  // gerá-los, e o auditório pode ter props reaproveitados pela Sala de Reuniões.
  'cenario-escritorio': `${RAIZ}/cenarios/escritorio.png`,
  'cenario-cafezinho': `${RAIZ}/cenarios/cafezinho.png`,
  'cenario-linha-producao': `${RAIZ}/cenarios/linha-producao.png`,
  'cenario-sala-reunioes': `${RAIZ}/cenarios/sala-reunioes.png`,
  'cenario-outra-area': `${RAIZ}/cenarios/outra-area.png`,

  /**
   * O MESMO Cafezinho, em festa, para a fase 6 (ADR-029).
   *
   * É variação de cenário e não lugar novo: mesma planta baixa, mesma máquina de
   * café, agora com decoração, mesa posta e luz mais quente. O lugar mudou
   * porque ela mudou — é a única coisa no jogo que argumenta isso visualmente.
   */
  'cenario-cafezinho-festa': `${RAIZ}/cenarios/cafezinho-festa.png`,

  // ------------------------------------------------ mapa
  mapa: `${RAIZ}/mapa/mapa.png`,

  // ------------------------------------------------ protagonista (4 sprites)
  'ana-encolhida': `${RAIZ}/protagonista/ana-encolhida.png`,
  'ana-neutra': `${RAIZ}/protagonista/ana-neutra.png`,
  'ana-confiante': `${RAIZ}/protagonista/ana-confiante.png`,
  'ana-futura': `${RAIZ}/protagonista/ana-futura.png`,
  'ana-trabalhando': `${RAIZ}/protagonista/ana-trabalhando.png`,
  'ana-futura-trabalhando': `${RAIZ}/protagonista/ana-futura-trabalhando.png`,

  // ------------------------------------------------ elenco fixo (5 NPCs)
  'npc-rafael': `${RAIZ}/npcs/rafael.png`,
  'npc-claudia': `${RAIZ}/npcs/claudia.png`,
  'npc-tiago': `${RAIZ}/npcs/tiago.png`,
  'npc-bianca': `${RAIZ}/npcs/bianca.png`,
  'npc-marcos': `${RAIZ}/npcs/marcos.png`,

  /**
   * RETRATOS DE ROSTO — nove: 5 NPCs e os 4 estados da Ana (ADR-012).
   *
   * Não é recorte do sprite. A cabeça ocupa 15x20 px de arte na grade de 50x84,
   * e ampliar isso para tamanho de retrato daria blocos de 10px fora da grade —
   * exatamente o defeito que a escala única existe para evitar. É arte própria,
   * na mesma escala 4x, numa grade de rosto maior (~40x48 px de arte).
   *
   * Existem porque a caixa de diálogo encolheu: ela ocupava 1376x340 px, 22,6%
   * do canvas, opaca, e interceptava 22 dos 24 hotspots do jogo — cobrindo
   * justamente quem estava falando. O retrato de corpo inteiro era o que mais
   * custava altura.
   */
  'retrato-npc-rafael': `${RAIZ}/retratos/npc-rafael.png`,
  'retrato-npc-claudia': `${RAIZ}/retratos/npc-claudia.png`,
  'retrato-npc-tiago': `${RAIZ}/retratos/npc-tiago.png`,
  'retrato-npc-bianca': `${RAIZ}/retratos/npc-bianca.png`,
  'retrato-npc-marcos': `${RAIZ}/retratos/npc-marcos.png`,
  'retrato-ana-encolhida': `${RAIZ}/retratos/ana-encolhida.png`,
  'retrato-ana-neutra': `${RAIZ}/retratos/ana-neutra.png`,
  'retrato-ana-confiante': `${RAIZ}/retratos/ana-confiante.png`,
  'retrato-ana-futura': `${RAIZ}/retratos/ana-futura.png`,

  // ------------------------------------------------ itens (5, eram 8)
  // Saíram `senha`, `indicacao-trilha` e `projeto-entregue`: nenhum efeito do
  // jogo os usava (ADR-014, ADR-017).
  'item-anotacoes-treinamento': `${RAIZ}/itens/anotacoes-treinamento.png`,
  'item-relatorio': `${RAIZ}/itens/relatorio.png`,
  // Mesma pasta, mesmo padrão de nome, mesma ordem de leitura: nada aqui pode
  // sugerir que estes três tardios são diferentes dos outros dois.
  'item-cartao-rafael': `${RAIZ}/itens/cartao-rafael.png`,
  'item-certificado-degree': `${RAIZ}/itens/certificado-degree.png`,
  'item-cracha-innovation': `${RAIZ}/itens/cracha-innovation.png`,

  // ------------------------------------------- itens na CENA (contorno duplo)
  // O mesmo objeto precisa de duas artes. Na barra de itens ele aparece sobre
  // fundo escuro e chapado, onde 1px de contorno basta; na cena ele aparece
  // sobre cenário carregado a 96px, onde 1px desaparece. `itens.py` gera a
  // variante com a segunda passada de contorno, e sem estas entradas ela era
  // peso morto: a cena desenhava a arte feita para a barra.
  'item-anotacoes-treinamento-cena': `${RAIZ}/itens/anotacoes-treinamento-cena.png`,
  'item-relatorio-cena': `${RAIZ}/itens/relatorio-cena.png`,
  'item-cartao-rafael-cena': `${RAIZ}/itens/cartao-rafael-cena.png`,
  'item-certificado-degree-cena': `${RAIZ}/itens/certificado-degree-cena.png`,
  'item-cracha-innovation-cena': `${RAIZ}/itens/cracha-innovation-cena.png`,

  // ------------------------------------------------ objetos interativos
  // Objeto que é hotspot precisa de PNG PRÓPRIO, com transparência, e o
  // cenário deixa o lugar dele vazio: só sprite separado pode receber aura no
  // hover. Se o objeto estivesse pintado dentro do cenário, a única forma de
  // destacá-lo seria um retângulo por cima — que é exatamente o que saiu.
  //
  // Os arquivos podem não existir ainda: a cadeia de fallback de Imagem.tsx
  // cobre isso, e a lista pendente está em docs/specs/objetos-pendentes.md.
  'objeto-notebook': `${RAIZ}/objetos/notebook.png`,
  'objeto-notebook-aberto': `${RAIZ}/objetos/notebook-aberto.png`,
  'objeto-monitor-ligado': `${RAIZ}/objetos/monitor-ligado.png`,
  'objeto-maquina-cafe': `${RAIZ}/objetos/maquina-cafe.png`,
  'objeto-quadro-branco': `${RAIZ}/objetos/quadro-branco.png`,
  'objeto-mural-postits': `${RAIZ}/objetos/mural-postits.png`,
  'objeto-tv-grande': `${RAIZ}/objetos/tv-grande.png`,
  /** Esteira da Linha de Produção, com uma etapa visivelmente diferente (ADR-009). */
  'objeto-esteira': `${RAIZ}/objetos/esteira.png`,
  /** Painel de processo da linha: é nele que a etapa lenta fica visível. */
  'objeto-painel-processo': `${RAIZ}/objetos/painel-processo.png`,
  /** Rádio telecom em deslocamento sobre a esteira da fase 3. */
  'objeto-radio-telecom': `${RAIZ}/objetos/radio-telecom.png`,
  /** Carcaça aberta; alterna com unidades montadas para mostrar etapas da produção. */
  'objeto-radio-telecom-aberto': `${RAIZ}/objetos/radio-telecom-aberto.png`,
  /** Poses do mesmo braço: base fixa e alcance sobre a esteira. */
  'objeto-braco-robotico': `${RAIZ}/objetos/braco-robotico.png`,
  'objeto-braco-robotico-estendido': `${RAIZ}/objetos/braco-robotico-estendido.png`,

  // ------------------------------------------------- refinamento da v2.1
  // Estes quatro nascem de defeitos vistos NA TELA, não de escopo novo.
  //
  // A fase 5 emprestava arte que contradizia o próprio rótulo: "Caderno dela"
  // era desenhado com `objeto-notebook-aberto` (um laptop) e "Grade do próximo
  // semestre" com `objeto-monitor-ligado` (um monitor). O conteúdo falava de
  // papel e de grade curricular; a tela mostrava dois equipamentos, e a cena
  // deixava de fazer sentido.
  /** Caderno de PAPEL, aberto, com escrita à mão. Não é laptop. */
  'objeto-caderno': `${RAIZ}/objetos/caderno.png`,
  /** Grade curricular impressa: folha com linhas e colunas, não tela. */
  'objeto-grade-curricular': `${RAIZ}/objetos/grade-curricular.png`,

  // A fase 4 usava o CRACHÁ como botão da ação de apresentar — a recompensa
  // fazendo papel do gesto. Quem assiste não entendia o que estava acontecendo,
  // e o silêncio da PAUSA caía sem que nada tivesse sido mostrado antes.
  /** Atril/púlpito: o lugar de onde se apresenta. É o gesto, não o prêmio. */
  'objeto-atril': `${RAIZ}/objetos/atril.png`,
  /**
   * Plateia sentada, de costas, em primeiro plano. É o que faz a Sala de
   * Reuniões ler como Innovation Week em vez de sala vazia — o texto de
   * abertura promete "a sala inteira é gente apresentando" e o cenário
   * entregava uma sala sem ninguém.
   */
  'objeto-plateia': `${RAIZ}/objetos/plateia.png`,
};

/** Caminho do asset, ou null quando não há entrada no manifest. */
export function caminhoDoAsset(id: string): string | null {
  const caminho: string | undefined = MANIFEST[id];
  return caminho ?? null;
}

// ------------------------------------------------------------ ids tipados

/**
 * Cenário de uma cena.
 *
 * `bloco` é OPCIONAL porque só um par (lugar, bloco) tem arte própria hoje: o
 * Cafezinho da fase 6, que está em festa. Sem o parâmetro, devolve o cenário
 * normal do lugar — que é o que toda chamada existente quer. Quem desenha a
 * cena passa o bloco e recebe a variação de graça, sem precisar conhecer o id
 * do arquivo nem a regra.
 */
export function assetDoCenario(lugarId: LugarId, bloco?: BlocoId): string {
  if (lugarId === 'cafezinho' && bloco === 6) return 'cenario-cafezinho-festa';
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

export function assetDoRetratoDeNpc(npcId: NpcId): string {
  return `retrato-npc-${npcId}`;
}

export function assetDoRetratoDaAna(spriteId: SpriteId): string {
  return `retrato-${spriteId}`;
}

/**
 * Retrato de quem está falando, ou null quando não há rosto.
 *
 * `narrador` e `sistema` NÃO têm rosto de propósito: eles não são pessoas, e
 * inventar um retrato para eles faria a plateia procurar quem falou. `ana-futura`
 * tem retrato próprio porque a versão futura dela é um quarto estado, não uma
 * variação de expressão.
 *
 * Existe aqui, e não na caixa de diálogo, para que a decisão de quem tem rosto
 * viva no mesmo lugar que a convenção de id.
 */
export function assetDoRetrato(locutor: Locutor, spriteDaAna: SpriteId): string | null {
  if (locutor === 'narrador' || locutor === 'sistema') return null;
  if (locutor === 'ana') return assetDoRetratoDaAna(spriteDaAna);
  if (locutor === 'ana-futura') return assetDoRetratoDaAna('ana-futura');
  return assetDoRetratoDeNpc(locutor);
}

/**
 * Item desenhado DENTRO da cena, não na barra de itens.
 *
 * Arte diferente, não tamanho diferente: a versão de cena tem a segunda passada
 * de contorno, porque 1px de borda desaparece a 96px sobre cenário carregado —
 * e a versão da barra foi feita para fundo escuro e chapado.
 */
export function assetDoItemEmCena(itemId: ItemId): string {
  return `item-${itemId}-cena`;
}

/**
 * Id de asset da arte de um hotspot. Um lugar só decide isso, para que
 * conteúdo não escreva id de arquivo e a troca de convenção seja uma linha.
 */
export function assetDaArteDeHotspot(arte: ArteDeHotspot): string {
  switch (arte.tipo) {
    case 'npc':
      return assetDoNpc(arte.npcId);
    case 'item':
      // hotspot de item vive na cena, então usa a arte de contorno duplo
      return assetDoItemEmCena(arte.itemId);
    case 'objeto':
      return arte.assetId;
  }
}

/**
 * Caminho da tira de quadros de um asset, no padrão da bíblia §6.4:
 * `<id>.png` é o quadro parado, `<id>-idle.png` e `<id>-andando.png` são as
 * tiras. O manifest continua apontando para o quadro parado — a tira é asset
 * ADICIONAL, escolhida pela UI conforme o estado, e pode não existir.
 */
export function caminhoDaTira(id: string, sufixo: 'idle' | 'andando'): string | null {
  const caminho = caminhoDoAsset(id);
  if (caminho === null) return null;
  return caminho.replace(/\.png$/, `-${sufixo}.png`);
}

export const ASSET_MAPA = 'mapa';
