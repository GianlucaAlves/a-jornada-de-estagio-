/**
 * Orçamento de legibilidade, travado antes de qualquer arte.
 *
 * Restrições do spec (docs/spec-apresentacao.md, "Legibilidade"):
 * - Corpo de texto 28px num canvas de 1080p; NADA abaixo de 22px.
 * - Alto contraste obrigatório; proibido cinza sobre cinza.
 * - Proibido detalhe fino: sem linha de 1px, sem gradiente sutil, sem partícula.
 * - Animações amplas e lentas: 600ms a 1200ms.
 * - Margens generosas; quem assiste em notebook perde as bordas.
 *
 * Nenhum componente deve escrever um valor literal que exista aqui.
 */

/** Canvas fixo. Toda coordenada de conteúdo é % deste retângulo. */
export const CANVAS = {
  largura: 1920,
  altura: 1080,
} as const;

/**
 * Paleta escura de alto contraste. Todo par texto/fundo usado na UI fica
 * acima de 7:1 — a compressão do Teams come contraste, então sobra folga.
 */
export const cores = {
  /** Barras do letterbox. Preto puro: nada compete com o canvas. */
  letterbox: '#000000',
  fundo: '#060a12',
  fundoElevado: '#0e1626',
  painel: '#121c2e',
  caixa: '#0a1220',
  /** Véu sólido para overlays. Cor plana, nunca gradiente. */
  veu: 'rgba(0, 0, 0, 0.82)',
  veuLeve: 'rgba(0, 0, 0, 0.58)',

  texto: '#ffffff',
  /** Texto de apoio: ainda claro. Cinza médio é proibido. */
  textoApoio: '#e4ecfa',
  textoInverso: '#06101f',

  destaque: '#ffd43b',
  acao: '#4fa8ff',
  sucesso: '#54e6a0',
  atencao: '#ff8a5c',

  /** Slot de lugar não descoberto: forma escura, sem nome. */
  silhueta: '#18202f',
  silhuetaContorno: '#3b4a67',

  contorno: '#ffffff',
  foco: '#ffd43b',
  sombra: 'rgba(0, 0, 0, 0.85)',
} as const;

/**
 * Escala tipográfica. Valores em px, já pensados para 1080p.
 * `minimo` é o piso absoluto: nada na aplicação usa menos.
 */
export const tipografia = {
  familia:
    "'Segoe UI', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
  /** Piso absoluto do spec. */
  minimo: 22,
  tamanhos: {
    minimo: 22,
    apoio: 24,
    /** Corpo de texto padrão do spec. */
    corpo: 28,
    rotulo: 32,
    subtitulo: 40,
    titulo: 56,
    grande: 80,
    gigante: 120,
  },
  pesos: {
    normal: 500,
    forte: 700,
    maximo: 900,
  },
  alturaLinha: {
    compacta: 1.2,
    corpo: 1.45,
  },
  espacamento: {
    normal: '0em',
    largo: '0.04em',
  },
} as const;

/** Espaçamentos generosos: margens apertadas desaparecem em tela comprimida. */
export const espaco = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 72,
  /** Margem de segurança das bordas do canvas. */
  margem: 64,
} as const;

export const raio = {
  sm: 8,
  md: 16,
  lg: 28,
  redondo: 9999,
} as const;

/**
 * Espessuras de borda. O menor valor é 3px: linha de 1px é proibida porque
 * a compressão de vídeo simplesmente a apaga.
 */
export const borda = {
  fina: 3,
  media: 4,
  grossa: 6,
  maxima: 10,
} as const;

/** Durações em ms. Todo movimento visível fica na janela 600-1200ms. */
export const duracao = {
  minima: 600,
  curta: 600,
  media: 800,
  longa: 1000,
  maxima: 1200,
} as const;

/** Sombras sólidas e deslocadas. Sem desfoque difuso, sem gradiente. */
export const sombra = {
  caixa: `0 ${espaco.xs}px 0 ${cores.sombra}`,
  plana: `0 ${borda.grossa}px 0 ${cores.sombra}`,
} as const;

/** Alvos de clique amplos: o apresentador clica ao vivo, sob pressão. */
export const alvo = {
  minimo: 64,
  confortavel: 88,
} as const;

export const camada = {
  cenario: 1,
  hotspot: 5,
  protagonista: 8,
  overlayPersistente: 20,
  dialogo: 30,
  narracao: 40,
  cartao: 50,
  pausa: 60,
} as const;

export const easing = {
  suave: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  constante: 'linear',
} as const;

/**
 * Famílias por papel. Hoje as duas apontam para a mesma pilha de fontes de
 * sistema: nenhuma webfont é carregada, porque a apresentação precisa rodar
 * offline e idêntica na máquina de quem apresenta. A separação por papel existe
 * para que trocar a face de título depois seja uma linha.
 */
export const fontes = {
  titulo: tipografia.familia,
  corpo: tipografia.familia,
} as const;

/** Alias plural de `duracao`, para leitura em contextos de animação. */
export const duracoes = duracao;

export const tokens = {
  CANVAS,
  cores,
  tipografia,
  fontes,
  espaco,
  raio,
  borda,
  duracao,
  sombra,
  alvo,
  camada,
  easing,
} as const;

/** Açúcar para estilos inline: `px(espaco.lg)`. */
export function px(valor: number): string {
  return `${valor}px`;
}

/** Garante que qualquer duração calculada caia na janela permitida pelo spec. */
export function limitarDuracao(ms: number): number {
  if (ms < duracao.minima) return duracao.minima;
  if (ms > duracao.maxima) return duracao.maxima;
  return Math.round(ms);
}
