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
  /** Letras de terminal aproximam a nova navegação da grade da arte. */
  familiaInterface: "Consolas, 'Lucida Console', monospace",
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
  /** Exceção da Jornada: molduras secundárias leves, com texto ainda opaco. */
  interface: 2,
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
  /** Reserva os dois quadros de montagem antes de encerrar a caminhada do NPC. */
  atrasoDeEntradaNpc: 80,
  esteira: 8000,
  cicloRobotico: 4000,
} as const;

/** Medidas do ciclo contínuo de produção, em px de canvas. */
export const movimento = { esteira: 304 } as const;

/** Reserva lateral fora do mapa e acima da faixa de personagens. */
export const progressao = {
  larguraHud: 336,
  topoHud: 156,
  retrato: { largura: 64, altura: 76.8 },
  alturaBarra: 24,
  duracaoEvolucao: 3800,
  inicioNovoTitulo: 1200,
  intervaloDigitacao: 40,
  larguraEvolucao: 1000,
  frequenciaSom: 660,
  volumeSom: 0.08,
  duracaoSom: 0.3,
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
  /**
   * EXCEÇÃO DECLARADA ao piso de 64px, e só para LINHA DE LISTA de largura
   * cheia — hoje, o acordeão de skills.
   *
   * A aritmética é que força: o painel tem 750px de altura útil (topo 120,
   * base acima da barra de itens), e na fase 5 ele precisa exibir as NOVE
   * skills com uma delas aberta. Nove linhas de 64px somam 576, mais os vãos e
   * o cabeçalho passam de 720, e sobra menos de uma linha de texto para a
   * entrada aberta — que é justamente o conteúdo. Nove a 64px não cabem, e as
   * saídas eram piores: alargar o painel come cena e muda a faixa que os
   * hotspots têm de evitar; rolagem no meio de apresentação ao vivo é
   * armadilha; truncar o texto tira o que o painel existe para mostrar.
   *
   * Por que 48 não reintroduz o defeito que o piso evita: `alvo.minimo` existe
   * contra caça-ao-pixel em sprite pequeno DENTRO da cena. A linha do acordeão
   * tem 420px de largura — área muito maior que um quadrado de 64 — e o risco
   * numa lista é acertar a vizinha, o que é governado pelo PASSO vertical, não
   * pela altura da linha. 48 + 8 de vão dá 56px de passo.
   */
  linhaDeLista: 48,
  /**
   * Largura mínima de botão de DECISÃO em tela cheia — hoje, os dois botões da
   * abertura. Existe como token porque "Continuar" e "Começar do início" têm de
   * ter o mesmo tamanho: botões de larguras diferentes lado a lado sugerem que
   * um deles é o certo, e a escolha da abertura é deliberadamente neutra.
   */
  botaoLargo: 420,
} as const;

/**
 * Escala da pixel art: 4 px reais por px de arte, em TUDO (bíblia §2.1).
 *
 * Uma escala só. Personagem a 6x e item a 4x na mesma tela fazem cenário e
 * elenco parecerem dois jogos colados, e é o erro de pixel art montada por
 * várias mãos que mais salta aos olhos. Os tamanhos de tela abaixo são a
 * grade de arte da bíblia multiplicada por `escala` — quem for mexer, mexe
 * na grade de arte, não no resultado.
 */
export const arte = {
  escala: 4,
  /** Grade 50x84 da bíblia §5 → 200x336 na tela → 31% da altura do canvas. */
  personagem: { largura: 50 * 4, altura: 84 * 4 },
  /** Grade 24x24 da bíblia §2.1 → 96x96 na tela. */
  item: { largura: 24 * 4, altura: 24 * 4 },
  /**
   * Espessura da aura de hover. Vale exatamente 1 px de arte para que a aura
   * caia na grade: 3px produziria meia coluna de pixel e a borda tremeria.
   */
  aura: 4,
} as const;

/**
 * A CAIXA DE DIÁLOGO, MEDIDA (ADR-012).
 *
 * Os números vivem aqui porque três lados precisam concordar sobre eles: a
 * caixa que os desenha, o teste que mede a área e a interceptação de hotspot, e
 * quem for escrever cena nova e precisar saber qual faixa do canvas está
 * ocupada durante uma fala.
 *
 * O QUE ESTAVA ERRADO. A caixa ocupava 1376x340 px — 22,6% do canvas, opaca,
 * retângulo x 64..1440, y 510..850 — e interceptava 22 dos 24 hotspots do jogo,
 * sete deles inteiros. Pior: cobria justamente quem falava (Bianca 80%, Rafael
 * 75%, Cláudia 73%), porque NPC é ancorado pelos pés no piso e a caixa caía
 * exatamente na faixa do corpo dele. O retrato de CORPO INTEIRO (220x260) era o
 * que mais custava altura.
 *
 * POR QUE NO ALTO DA TELA, E NÃO EMBAIXO. Não é gosto, é geometria: a figura de
 * NPC tem 336px de altura e assenta no piso, então qualquer faixa horizontal
 * abaixo de ~480px de altura cruza o corpo de quem fala. A faixa alta é a única
 * larga o bastante para o texto e livre da faixa das pessoas. É também onde as
 * referências de point-and-click põem a fala (Fate of Atlantis).
 *
 * O balão junto do personagem foi descartado por motivo de apresentação ao
 * vivo: posição variável faz o apresentador não saber onde o texto vai nascer e
 * a plateia procurar. Esta caixa é FIXA.
 *
 * As bordas laterais não são arbitrárias: `esquerda` fica além do botão Voltar
 * (que termina em 448) e `esquerda + largura` fica antes do painel de skills
 * (que começa em 1500). As duas folgas são verificadas em teste.
 */
export const caixaDeDialogo = {
  esquerda: 500,
  topo: espaco.margem,
  largura: 940,
  /**
   * A altura é o MÍNIMO que o retrato de rosto permite: 192 de retrato, mais o
   * respiro interno e as bordas. Não sobra folga, e é isso que se quer — cada
   * pixel de altura a mais desce a base da caixa em direção à cabeça de quem
   * está de pé na cena, e há NPC no conteúdo com o topo da figura a 323px.
   */
  altura: 244,
  /**
   * Retrato de ROSTO, na escala única de 4x: grade de arte de 40x48 px
   * (manifest), que é a grade de rosto da bíblia — não recorte do sprite de
   * corpo, cuja cabeça tem 15x20 px de arte e produziria blocos de 10px fora
   * da grade se ampliada.
   */
  retrato: { largura: 40 * 4, altura: 48 * 4 },
  /**
   * Quantas linhas de texto a caixa comporta no tamanho de corpo. É o teto que
   * o teste usa para reprovar nó de diálogo que não caberia — nó longo demais
   * se resolve partindo em dois nós, que é a unidade do diálogo (um clique, um
   * nó), não esticando a caixa de volta ao tamanho antigo.
   */
  linhasDeTexto: 3,
} as const;

/**
 * Esperas de INTERFACE, em ms. Não são animação e por isso não passam por
 * `limitarDuracao`: a janela 600–1200ms existe para movimento que a compressão
 * de vídeo destrói, e um texto que fica na tela seis segundos não é movimento.
 */
export const espera = {
  /**
   * Quanto tempo a descrição de item permanece antes de se fechar sozinha
   * (ADR-013). Antes ela era estado local apagado só quando o item saía da
   * barra: sobrevivia a troca de cena, ida ao mapa, diálogo e puzzle — o bloco
   * inteiro. Seis segundos é tempo de ler duas linhas em voz alta e sobra.
   */
  descricaoDeItemMs: 6000,
} as const;

/**
 * Faixas que os overlays persistentes ocupam no canvas.
 *
 * Existem como token porque três arquivos precisam concordar sobre elas: a
 * barra de itens que as desenha, a linha de foco que se empilha em cima, e o
 * teste de geometria que prova que nenhum hotspot nasce debaixo delas —
 * hotspot coberto por overlay é clique morto, e clique morto no palco parece
 * bug do apresentador.
 */
export const overlay = {
  /** Altura da barra de itens, ancorada na base do canvas. */
  barraDeItens: 151,
  /** Largura do painel de skills, ancorado na direita. */
  painelDeSkills: 420,
  /**
   * Topo do painel de skills: logo abaixo da faixa do botão Avançar, que ocupa
   * y 0..120 no canto direito. Existia como literal em dois componentes e num
   * teste de geometria; virou token quando o painel passou a ser acordeão e a
   * altura útil dele deixou de ser folga e passou a ser orçamento — nove skills
   * com uma aberta usam quase tudo o que há entre este topo e a barra de itens.
   */
  painelTopo: 120,
  /** Altura da linha de nome do hotspot, empilhada logo acima da barra. */
  linhaDeFoco: 52,
} as const;

/**
 * Métricas internas da barra de itens.
 *
 * Existem como token porque DOIS arquivos precisam concordar sobre elas: a
 * barra que as desenha e a tela de revelação, que redesenha a barra do zero
 * para que as três primeiras linhas do clímax saiam do centro do ícone de cada
 * item. Enquanto eram literais nos dois lados, "o ícone do item" era uma
 * coincidência de dois números iguais escritos em lugares diferentes.
 */
export const barra = {
  zonaItens: 826,
  slotsItens: 3,
  slotsHabilidades: 9,
  colunasHabilidades: 3,
  alturaSelo: 32,
  larguraSelo: 340,
  larguraDoRotulo: 120,
  /** Slot de item: moldura + ícone + nome. */
  item: { largura: 210, altura: 112 },
  /** Lado do ícone dentro do slot. */
  icone: 64,
  /** Teto de largura da descrição de item, que nasce acima da barra. */
  larguraDaDescricao: 1180,
} as const;

/**
 * Taxa de quadro de sprite. EXCEÇÃO DELIBERADA à janela 600–1200ms de
 * `duracao`, registrada na bíblia §6.1: a janela vale para transição e entrada
 * de elemento, onde movimento rápido é o que a compressão de vídeo destrói.
 * Ciclo de caminhada a 600ms por quadro não lê como caminhada, lê como
 * defeito. Sprite fica em 110–180ms por quadro.
 */
export const quadro = {
  /** Respiração: 2 quadros, ~450ms cada. */
  idleMs: 900,
  /** Caminhada: 4 quadros a 140ms. */
  andandoMs: 560,
  /**
   * Teto do atraso sorteado por figura. NPCs respirando no mesmo compasso
   * parecem uma engrenagem; o atraso é o que os torna pessoas paradas.
   */
  atrasoMaximoMs: 800,
} as const;

export const camada = {
  cenario: 1,
  hotspot: 5,
  protagonista: 8,
  overlayPersistente: 20,
  dialogo: 30,
  narracao: 40,
  cartao: 50,
  itemRecebido: 55,
  pausa: 60,
  /**
   * A tela de abertura fica ACIMA de tudo (ADR-018). Ela é a porta de entrada e
   * o caminho de reinício durante a apresentação — F5 leva a ela —, e nada do
   * jogo pode aparecer por trás enquanto a escolha "Continuar" ou "Começar do
   * início" estiver na tela.
   */
  abertura: 70,
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
  arte,
  caixaDeDialogo,
  espera,
  overlay,
  barra,
  quadro,
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
