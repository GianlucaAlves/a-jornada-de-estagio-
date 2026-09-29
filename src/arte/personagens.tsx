/**
 * Personagens em SVG desenhado à mão, em código.
 *
 * Não é placeholder: é a arte final do elenco até existirem PNGs. Toda figura
 * é humana de corpo inteiro, montada em camadas (sombra → pernas → sapatos →
 * tronco → roupa → braços → pescoço → cabeça → cabelo → rosto → objeto).
 *
 * Restrições de estilo herdadas de docs/prompts.md (compressão do Teams):
 * flat vector, no máximo dois tons por superfície em degrau visível, contorno
 * sempre grosso (3–5px de canvas), ZERO <linearGradient>, rosto de traços
 * simples de propósito.
 *
 * Canvas único de 300x500 para todo mundo, então a escala relativa entre
 * personagens é consistente quando dois aparecem lado a lado.
 */
import type { ReactElement, ReactNode } from 'react';

import { PALETA } from './paleta';
import type { PropsArte } from './paleta';

// ---------------------------------------------------------------- constantes

const PELE = PALETA.pele;
const PELE_SOMBRA = PALETA.peleSombra;
const CABELO = PALETA.cabelo;
const CONTORNO = PALETA.contorno;

/** Traço padrão. Nunca menos de 3: linha de 1px desaparece no Teams. */
const TRACO = {
  stroke: CONTORNO,
  strokeWidth: 4,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

const TRACO_FINO = {
  stroke: CONTORNO,
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

/**
 * Cores de roupa. A PALETA cobre ambiente, pele e cabelo; o guarda-roupa do
 * elenco vive aqui, cada peça com exatamente um tom de sombra (o degrau).
 */
const ROUPA = {
  camisetaAna: '#4a6a7c',
  camisetaAnaSombra: '#35505f',
  jeansEscuro: '#2c3f52',
  jeansEscuroSombra: '#1d2d3c',
  jeansMedio: '#3b5975',
  jeansMedioSombra: '#2a4157',
  poloVerde: '#1f5c47',
  poloVerdeSombra: '#123f2f',
  blazerCinza: '#2e4654',
  blazerCinzaSombra: '#1c303b',
  pretoCamiseta: '#20262b',
  pretoCamisetaSombra: '#13181c',
  cargoCinza: '#5c6770',
  cargoCinzaSombra: '#434d55',
  alfaiatariaEscura: '#232f38',
  alfaiatariaEscuraSombra: '#151e25',
  blazerPetroleo: '#1d4a58',
  blazerPetroleoSombra: '#11313c',
  xadrezAzul: '#31618c',
  xadrezAzulSombra: '#1f4366',
  tenisBranco: PALETA.superficie,
  tenisBrancoSombra: PALETA.superficieSombra,
  tenisEscuro: '#2b3238',
  tenisEscuroSombra: '#191e22',
  sapatoPreto: '#1c2227',
  sapatoPretoSombra: '#0f1418',
  linhoOffWhite: PALETA.superficie,
  linhoOffWhiteSombra: PALETA.superficieSombra,
  cordao: '#1b3a63',
  metal: '#9aa7b0',
  metalSombra: '#78868f',
} as const;

// ---------------------------------------------------------------- primitivas

/** Moldura comum: mesmo viewBox e mesmo alinhamento de chão para todos. */
function Quadro({
  largura,
  altura,
  className,
  children,
}: PropsArte & { children: ReactNode }): ReactElement {
  return (
    <svg
      viewBox="0 0 300 500"
      width={largura ?? 300}
      height={altura ?? 500}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Sombra sólida no chão: ancora a figura, sem nenhum desfoque. */
function SombraDeChao({ rx = 74 }: { rx?: number }): ReactElement {
  return <ellipse cx={150} cy={484} rx={rx} ry={12} fill={PALETA.ambiente} opacity={0.55} />;
}

/**
 * Membro com articulação: uma polilinha grossa desenhada duas vezes, o
 * contorno por baixo e a cor por cima. Garante cotovelo/joelho arredondado e
 * contorno de espessura constante sem calcular offsets à mão.
 */
function Membro({
  d,
  cor,
  espessura = 19,
}: {
  d: string;
  cor: string;
  espessura?: number;
}): ReactElement {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={CONTORNO}
        strokeWidth={espessura + 8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={cor}
        strokeWidth={espessura}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Mão: bolinha de pele na ponta do braço. */
function Mao({ cx, cy, cor }: { cx: number; cy: number; cor: string }): ReactElement {
  return <ellipse cx={cx} cy={cy} rx={11} ry={12} fill={cor} {...TRACO} />;
}

/** Sapato em três retângulos arredondados: bico, corpo e sola em degrau. */
function Sapato({
  cx,
  cor,
  sombra,
}: {
  cx: number;
  cor: string;
  sombra: string;
}): ReactElement {
  return (
    <g>
      <rect x={cx + 4} y={464} width={30} height={16} rx={8} fill={cor} {...TRACO} />
      <rect x={cx - 20} y={454} width={44} height={26} rx={11} fill={cor} {...TRACO} />
      <rect x={cx - 20} y={472} width={54} height={9} rx={4} fill={sombra} {...TRACO_FINO} />
    </g>
  );
}

/** Tronco trapezoidal com ombro arredondado, cintura e quadril. */
function troncoPath(ombro: number, cintura: number, quadril: number): string {
  return [
    `M${150 - ombro} 148`,
    'q1 -18 18 -20',
    `h${ombro * 2 - 36}`,
    'q17 2 18 20',
    `L${150 + cintura} 230`,
    `L${150 + quadril} 264`,
    `L${150 - quadril} 264`,
    `L${150 - cintura} 230`,
    'Z',
  ].join(' ');
}

/** Pernas: coxa → joelho → tornozelo, uma de cada lado, sempre separadas. */
function Pernas({
  cor,
  sombra,
  abertura = 0,
}: {
  cor: string;
  sombra: string;
  abertura?: number;
}): ReactElement {
  const e = 128 - abertura;
  const d = 172 + abertura;
  return (
    <g>
      <Membro d={`M${e} 244 L${e - 4} 350 L${e - 2} 452`} cor={cor} espessura={34} />
      <Membro d={`M${d} 244 L${d + 6} 350 L${d + 4} 452`} cor={cor} espessura={34} />
      {/* degrau único de sombra na perna de trás */}
      <Membro d={`M${d + 4} 300 L${d + 6} 350 L${d + 4} 440`} cor={sombra} espessura={18} />
    </g>
  );
}


// ---------------------------------------------------------------- cabelo

/** Silhueta de cabelo. É o que identifica cada personagem de longe. */
type Penteado = 'ondulado' | 'bob' | 'coque' | 'crespo' | 'longoLiso' | 'curtoRebelde' | 'curtoLiso';

const MASSA_ATRAS: Readonly<Record<Penteado, readonly string[]>> = {
  ondulado: [
    'M118 62 C102 96 102 130 106 158 C110 170 124 170 128 158 C122 130 122 96 132 70 Z',
    'M182 62 C198 96 198 130 194 158 C190 170 176 170 172 158 C178 130 178 96 168 70 Z',
  ],
  bob: [
    'M118 62 C106 86 104 110 108 128 C112 138 124 138 128 128 C124 106 124 84 132 68 Z',
    'M182 62 C194 86 196 110 192 128 C188 138 176 138 172 128 C176 106 176 84 168 68 Z',
  ],
  coque: ['M86 113 a20 19 0 1 0 40 0 a20 19 0 1 0 -40 0 Z'],
  crespo: [],
  longoLiso: [
    'M116 62 C100 110 102 168 106 210 C112 222 126 222 130 210 C124 166 122 108 130 68 Z',
    'M184 62 C200 110 198 168 194 210 C188 222 174 222 170 210 C176 166 178 108 170 68 Z',
  ],
  curtoRebelde: [],
  curtoLiso: [],
};

const CAP_FRENTE: Readonly<Record<Penteado, string>> = {
  ondulado:
    'M116 94 C114 44 128 34 150 34 C172 34 186 44 184 94 C180 74 172 62 160 60 C152 66 146 66 138 60 C126 62 120 74 116 94 Z',
  bob: 'M116 94 C114 44 128 34 150 34 C172 34 186 44 184 94 C176 70 168 62 150 62 C132 62 124 70 116 94 Z',
  coque:
    'M118 92 C118 44 130 36 150 36 C170 36 182 44 182 92 C176 66 166 56 150 56 C134 56 124 66 118 92 Z',
  crespo:
    'M114 90 C114 40 128 32 150 32 C172 32 186 40 186 90 C184 76 180 68 174 66 q-6 9 -12 0 q-6 9 -12 0 q-6 9 -12 0 q-6 9 -12 0 C120 68 116 76 114 90 Z',
  longoLiso:
    'M116 92 C116 44 128 36 150 36 C172 36 184 44 184 92 C176 70 166 60 150 60 C134 60 124 70 116 92 Z',
  curtoRebelde:
    'M116 90 C114 46 126 28 138 40 C142 26 156 28 158 42 C166 28 178 34 184 52 C186 68 184 80 184 90 C178 70 166 60 150 60 C134 60 122 70 116 90 Z',
  curtoLiso:
    'M118 92 C118 48 130 40 150 40 C170 40 182 48 182 92 C176 66 164 58 150 60 C136 58 124 66 118 92 Z',
};

/** Volume de crânio atrás da cabeça, para o cabelo contornar o rosto. */
const CRANIO: Readonly<Record<Penteado, { rx: number; ry: number; cy: number }>> = {
  ondulado: { rx: 41, ry: 45, cy: 78 },
  bob: { rx: 40, ry: 43, cy: 78 },
  coque: { rx: 37, ry: 41, cy: 78 },
  crespo: { rx: 37, ry: 36, cy: 74 },
  longoLiso: { rx: 40, ry: 43, cy: 78 },
  curtoRebelde: { rx: 38, ry: 37, cy: 74 },
  curtoLiso: { rx: 37, ry: 38, cy: 76 },
};

function CabeloAtras({ penteado, cor }: { penteado: Penteado; cor: string }): ReactElement {
  const cranio = CRANIO[penteado];
  return (
    <g>
      <ellipse cx={150} cy={cranio.cy} rx={cranio.rx} ry={cranio.ry} fill={cor} {...TRACO} />
      {MASSA_ATRAS[penteado].map((d, i) => (
        <path key={i} d={d} fill={cor} {...TRACO} />
      ))}
    </g>
  );
}

function CabeloFrente({
  penteado,
  cor,
  brilho,
}: {
  penteado: Penteado;
  cor: string;
  brilho: string;
}): ReactElement {
  return (
    <g>
      <path d={CAP_FRENTE[penteado]} fill={cor} {...TRACO} />
      {penteado === 'crespo' ? (
        <>
          <ellipse cx={164} cy={48} rx={11} ry={7} fill={brilho} />
          <ellipse cx={142} cy={44} rx={8} ry={5} fill={brilho} />
        </>
      ) : (
        <ellipse cx={162} cy={52} rx={15} ry={8} fill={brilho} transform="rotate(-18 162 52)" />
      )}
    </g>
  );
}

// ---------------------------------------------------------------- rosto

/**
 * Rosto de baixo detalhe, de propósito: dois olhos, duas sobrancelhas, nariz
 * sugerido e uma boca. `desvio` desloca as feições para o lado que a pessoa
 * encara (positivo = virada para a direita).
 */
function Rosto({
  peleSombra,
  boca,
  desvio,
  oculos = false,
}: {
  peleSombra: string;
  boca: string;
  desvio: number;
  oculos?: boolean;
}): ReactElement {
  const d = desvio;
  return (
    <g>
      {/* degrau de sombra no queixo e no lado oposto à luz */}
      <path d="M132 106 q18 13 36 0 q-5 13 -18 13 q-13 0 -18 -13 Z" fill={peleSombra} />
      <path d="M126 70 q-7 22 2 38 q-8 -10 -8 -26 q0 -8 6 -12 Z" fill={peleSombra} />
      <ellipse cx={141 + d} cy={85} rx={3.8} ry={4.8} fill={CONTORNO} />
      <ellipse cx={162 + d} cy={85} rx={3.8} ry={4.8} fill={CONTORNO} />
      <path d={`M${135 + d} 72 q6 -4 13 -1`} fill="none" {...TRACO_FINO} />
      <path d={`M${155 + d} 71 q7 -3 13 1`} fill="none" {...TRACO_FINO} />
      <path
        d={`M${151 + d} 86 q6 9 -3 11`}
        fill="none"
        stroke={peleSombra}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <path d={boca} fill="none" {...TRACO} />
      {oculos ? (
        <g>
          <rect x={130 + d} y={75} width={21} height={17} rx={5} fill="none" {...TRACO} />
          <rect x={152 + d} y={75} width={21} height={17} rx={5} fill="none" {...TRACO} />
          <path d={`M${151 + d} 82 h1`} fill="none" {...TRACO} />
          <path d={`M${130 + d} 79 l-10 -3`} fill="none" {...TRACO_FINO} />
        </g>
      ) : null}
    </g>
  );
}

// ---------------------------------------------------------------- figura

interface Bracos {
  /** Polilinha ombro → cotovelo → mão. O vértice do meio é a articulação. */
  esq: string;
  dir: string;
  /** Trecho do braço coberto por tecido (manga curta = trecho curto). */
  mangaEsq: string;
  mangaDir: string;
  maoEsq: readonly [number, number];
  maoDir: readonly [number, number];
}

interface PropsFigura {
  pele: string;
  peleSombra: string;
  cabelo: string;
  cabeloBrilho: string;
  penteado: Penteado;
  barba?: string | null;
  oculos?: boolean;
  topo: string;
  topoSombra: string;
  /** Cor da manga quando a peça externa cobre o braço. Default: `topo`. */
  corManga?: string;
  gola: 'redonda' | 'polo' | 'camisa';
  calca: string;
  calcaSombra: string;
  sapato: string;
  sapatoSombra: string;
  ombro: number;
  cintura: number;
  quadril: number;
  bracos: Bracos;
  boca: string;
  desvio: number;
  rotacaoCabeca: number;
  deslocaCabeca: number;
  /** Inclinação do crachá em graus, ou null para quem não usa. */
  cracha: number | null;
  aberturaPernas?: number;
  /** Peça externa (blazer, camisa aberta) desenhada sobre o tronco. */
  sobreRoupa?: ReactNode;
  /** Objeto na mão, desenhado por último. */
  objeto?: ReactNode;
}

function Gola({
  gola,
  topo,
  topoSombra,
}: {
  gola: 'redonda' | 'polo' | 'camisa';
  topo: string;
  topoSombra: string;
}): ReactElement {
  if (gola === 'polo') {
    return (
      <g>
        <path d="M131 128 q19 17 38 0 Z" fill={topoSombra} {...TRACO_FINO} />
        <path d="M137 130 L147 150 L163 150 L173 130" fill={topo} {...TRACO_FINO} />
        <path d="M145 150 v20" fill="none" {...TRACO_FINO} />
      </g>
    );
  }
  if (gola === 'camisa') {
    return (
      <g>
        <path d="M133 127 L150 154 L128 148 Z" fill={topo} {...TRACO_FINO} />
        <path d="M167 127 L150 154 L172 148 Z" fill={topo} {...TRACO_FINO} />
        <path d="M150 154 v78" fill="none" {...TRACO_FINO} />
      </g>
    );
  }
  return <path d="M131 128 q19 19 38 0 Z" fill={topoSombra} {...TRACO_FINO} />;
}

function Cracha({ inclinacao }: { inclinacao: number }): ReactElement {
  return (
    <g transform={`rotate(${inclinacao} 150 190)`}>
      <path d="M130 132 L150 188" fill="none" stroke={ROUPA.cordao} strokeWidth={6} />
      <path d="M170 132 L150 188" fill="none" stroke={ROUPA.cordao} strokeWidth={6} />
      <rect x={137} y={186} width={27} height={35} rx={4} fill={PALETA.superficie} {...TRACO_FINO} />
      <rect x={141} y={192} width={19} height={11} rx={2} fill={PALETA.superficieSombra} />
      <rect x={141} y={208} width={19} height={4} rx={2} fill={PALETA.superficieSombra} />
    </g>
  );
}

/**
 * Monta a pessoa. Toda a diferença entre os nove personagens está nos
 * argumentos — a anatomia é a mesma, então eles pertencem ao mesmo mundo.
 */
function Figura({
  props,
  figura,
}: {
  props: PropsArte;
  figura: PropsFigura;
}): ReactElement {
  const f = figura;
  const abertura = f.aberturaPernas ?? 0;
  const [mex, mey] = f.bracos.maoEsq;
  const [mdx, mdy] = f.bracos.maoDir;
  return (
    <Quadro {...props}>
      <SombraDeChao />

      <Pernas cor={f.calca} sombra={f.calcaSombra} abertura={abertura} />
      <Sapato cx={124 - abertura} cor={f.sapato} sombra={f.sapatoSombra} />
      <Sapato cx={180 + abertura} cor={f.sapato} sombra={f.sapatoSombra} />

      {/* tronco: base, sombra lateral e barra da peça */}
      <path d={troncoPath(f.ombro, f.cintura, f.quadril)} fill={f.topo} {...TRACO} />
      <path
        d={`M${150 - f.ombro} 148 q1 -18 18 -20 h8 L${150 - f.cintura + 20} 230 L${
          150 - f.quadril + 18
        } 250 L${150 - f.quadril} 250 L${150 - f.cintura} 230 Z`}
        fill={f.topoSombra}
      />
      <path
        d={`M${150 - f.quadril + 1} 248 L${150 + f.quadril - 1} 248 L${150 + f.quadril - 1} 263 L${
          150 - f.quadril + 1
        } 263 Z`}
        fill={f.topoSombra}
        {...TRACO_FINO}
      />

      {/* braços: pele primeiro, tecido por cima */}
      <Membro d={f.bracos.esq} cor={f.pele} />
      <Membro d={f.bracos.dir} cor={f.pele} />
      <Membro d={f.bracos.mangaEsq} cor={f.corManga ?? f.topo} espessura={25} />
      <Membro d={f.bracos.mangaDir} cor={f.corManga ?? f.topo} espessura={25} />

      <Gola gola={f.gola} topo={f.topo} topoSombra={f.topoSombra} />
      {f.sobreRoupa}

      <Mao cx={mex} cy={mey} cor={f.pele} />
      <Mao cx={mdx} cy={mdy} cor={f.pele} />

      {f.cracha === null ? null : <Cracha inclinacao={f.cracha} />}

      {/* pescoço */}
      <path d="M136 98 h28 v34 h-28 Z" fill={f.pele} {...TRACO} />
      <path d="M137 99 h26 v11 h-26 Z" fill={f.peleSombra} />

      {/* cabeça */}
      <g transform={`translate(0 ${f.deslocaCabeca}) rotate(${f.rotacaoCabeca} 150 118)`}>
        <CabeloAtras penteado={f.penteado} cor={f.cabelo} />
        <ellipse cx={119} cy={92} rx={7} ry={10} fill={f.pele} {...TRACO_FINO} />
        <ellipse cx={181} cy={92} rx={7} ry={10} fill={f.pele} {...TRACO_FINO} />
        <ellipse cx={150} cy={82} rx={30} ry={36} fill={f.pele} {...TRACO} />
        <CabeloFrente penteado={f.penteado} cor={f.cabelo} brilho={f.cabeloBrilho} />
        {f.barba == null ? null : (
          <path
            d="M125 94 q3 36 25 36 q22 0 25 -36 q-7 24 -25 24 q-18 0 -25 -24 Z"
            fill={f.barba}
            {...TRACO_FINO}
          />
        )}
        <Rosto peleSombra={f.peleSombra} boca={f.boca} desvio={f.desvio} oculos={f.oculos ?? false} />
      </g>

      {f.objeto}
    </Quadro>
  );
}

// ---------------------------------------------------------------- Ana

/**
 * Identidade da Ana, travada (docs/prompts.md): mulher brasileira de 21 anos,
 * pele morena clara, cabelo castanho escuro ondulado na altura dos ombros,
 * camiseta cinza-azulada, jeans escuro, tênis branco, crachá em cordão azul.
 *
 * Só o que está em `Postura` muda entre os sprites. É essa restrição que faz
 * os três primeiros serem visivelmente a MESMA pessoa.
 */
const ANA_IDENTIDADE = {
  pele: PELE[1],
  peleSombra: PELE_SOMBRA[1],
  cabelo: CABELO[0],
  cabeloBrilho: CABELO[1],
  penteado: 'ondulado',
  topo: ROUPA.camisetaAna,
  topoSombra: ROUPA.camisetaAnaSombra,
  gola: 'redonda',
  calca: ROUPA.jeansEscuro,
  calcaSombra: ROUPA.jeansEscuroSombra,
  sapato: ROUPA.tenisBranco,
  sapatoSombra: ROUPA.tenisBrancoSombra,
  cintura: 45,
  quadril: 50,
  cracha: 0,
} as const;

interface Postura {
  /** Meia-largura do ombro: fechado quando encolhida, aberto quando confiante. */
  ombro: number;
  rotacaoCabeca: number;
  deslocaCabeca: number;
  desvio: number;
  boca: string;
  bracos: Bracos;
  aberturaPernas?: number;
  objeto?: ReactNode;
}

/** Bolsa cruzada: a alça sobe até a mão que a segura contra o peito. */
function Bolsa(): ReactElement {
  return (
    <g>
      <path
        d="M114 140 L192 252"
        fill="none"
        stroke={ROUPA.alfaiatariaEscura}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <rect
        x={178}
        y={248}
        width={48}
        height={44}
        rx={7}
        fill={ROUPA.alfaiatariaEscura}
        {...TRACO}
      />
      <rect x={178} y={248} width={48} height={15} rx={6} fill={ROUPA.alfaiatariaEscuraSombra} />
      <rect x={196} y={258} width={13} height={9} rx={3} fill={ROUPA.metal} {...TRACO_FINO} />
    </g>
  );
}

/** Caderno sob o braço. */
function Caderno(): ReactElement {
  return (
    <g transform="rotate(9 206 220)">
      <rect x={194} y={190} width={26} height={66} rx={4} fill={PALETA.superficie} {...TRACO} />
      <rect x={194} y={190} width={9} height={66} rx={4} fill={PALETA.superficieSombra} />
      <rect x={207} y={186} width={7} height={12} rx={3} fill={PALETA.acento} {...TRACO_FINO} />
    </g>
  );
}

function CorpoDaAna({
  props,
  postura,
}: {
  props: PropsArte;
  postura: Postura;
}): ReactElement {
  return (
    <Figura
      props={props}
      figura={{
        ...ANA_IDENTIDADE,
        ombro: postura.ombro,
        rotacaoCabeca: postura.rotacaoCabeca,
        deslocaCabeca: postura.deslocaCabeca,
        desvio: postura.desvio,
        boca: postura.boca,
        bracos: postura.bracos,
        aberturaPernas: postura.aberturaPernas ?? 0,
        objeto: postura.objeto,
      }}
    />
  );
}

const POSTURAS: Readonly<Record<'ana-encolhida' | 'ana-neutra' | 'ana-confiante', Postura>> = {
  // ombros para dentro, cabeça baixa, mão segurando a alça contra o peito
  'ana-encolhida': {
    ombro: 52,
    rotacaoCabeca: 6,
    deslocaCabeca: 5,
    desvio: 2,
    boca: 'M141 105 q9 -6 18 -1',
    bracos: {
      esq: 'M104 158 L96 206 L118 230',
      dir: 'M196 158 L202 208 L190 240',
      mangaEsq: 'M104 158 L99 186',
      mangaDir: 'M196 158 L200 188',
      maoEsq: [120, 234],
      maoDir: [189, 245],
    },
    objeto: <Bolsa />,
  },
  // coluna ereta, ombros naturais, caderno sob o braço
  'ana-neutra': {
    ombro: 58,
    rotacaoCabeca: 0,
    deslocaCabeca: 0,
    desvio: 4,
    boca: 'M141 103 h18',
    bracos: {
      esq: 'M98 158 L92 210 L96 254',
      dir: 'M202 158 L208 210 L200 250',
      mangaEsq: 'M98 158 L94 190',
      mangaDir: 'M202 158 L206 190',
      maoEsq: [96, 260],
      maoDir: [199, 257],
    },
    objeto: <Caderno />,
  },
  // ombros abertos e para trás, queixo erguido, uma mão no bolso
  'ana-confiante': {
    ombro: 64,
    rotacaoCabeca: -4,
    deslocaCabeca: -3,
    desvio: 5,
    boca: 'M140 100 q10 9 20 -1',
    bracos: {
      esq: 'M94 156 L86 208 L106 238',
      dir: 'M206 156 L212 210 L204 250',
      mangaEsq: 'M94 156 L89 188',
      mangaDir: 'M206 156 L210 188',
      maoEsq: [108, 242],
      maoDir: [203, 256],
    },
    aberturaPernas: 5,
  },
};

/**
 * Peça externa aberta (blazer ou camisa): dois painéis frontais com lapela,
 * deixando a peça de baixo visível no meio do peito.
 */
function PecaExterna({
  cor,
  sombra,
  ombro,
  cintura,
  quadril,
  xadrez = false,
}: {
  cor: string;
  sombra: string;
  ombro: number;
  cintura: number;
  quadril: number;
  xadrez?: boolean;
}): ReactElement {
  return (
    <g>
      <path
        d={`M${150 - ombro} 148 q1 -18 18 -20 L148 160 L142 264 L${150 - quadril} 264 L${
          150 - cintura
        } 230 Z`}
        fill={cor}
        {...TRACO}
      />
      <path
        d={`M${150 + ombro} 148 q-1 -18 -18 -20 L152 160 L158 264 L${150 + quadril} 264 L${
          150 + cintura
        } 230 Z`}
        fill={cor}
        {...TRACO}
      />
      {xadrez ? (
        <g fill={sombra}>
          <rect x={96} y={166} width={48} height={11} />
          <rect x={154} y={166} width={48} height={11} />
          <rect x={100} y={198} width={44} height={11} />
          <rect x={156} y={198} width={44} height={11} />
          <rect x={106} y={230} width={36} height={11} />
          <rect x={158} y={230} width={36} height={11} />
          <rect x={116} y={158} width={11} height={92} />
          <rect x={172} y={158} width={11} height={92} />
        </g>
      ) : (
        <path
          d={`M${150 - ombro + 2} 238 L142 238 L142 258 L${150 - quadril + 4} 258 Z`}
          fill={sombra}
        />
      )}
      <path d="M133 128 L150 160 L147 129 Z" fill={sombra} {...TRACO_FINO} />
      <path d="M167 128 L150 160 L153 129 Z" fill={sombra} {...TRACO_FINO} />
    </g>
  );
}

export function ArteDeProtagonista({
  sprite,
  largura,
  altura,
  className,
}: PropsArte & { sprite: string }): ReactElement {
  const props: PropsArte = { largura, altura, className };

  if (sprite === 'ana-futura') {
    // mesma mulher, 31 anos: mesmo tom de pele e cabelo, corte mais curto,
    // blazer azul-petróleo sobre blusa off-white, sem crachá, virada à esquerda
    return (
      <Figura
        props={props}
        figura={{
          pele: PELE[1],
          peleSombra: PELE_SOMBRA[1],
          cabelo: CABELO[0],
          cabeloBrilho: CABELO[1],
          penteado: 'bob',
          topo: PALETA.superficie,
          topoSombra: PALETA.superficieSombra,
          corManga: ROUPA.blazerPetroleo,
          gola: 'redonda',
          calca: ROUPA.alfaiatariaEscura,
          calcaSombra: ROUPA.alfaiatariaEscuraSombra,
          sapato: ROUPA.sapatoPreto,
          sapatoSombra: ROUPA.sapatoPretoSombra,
          ombro: 60,
          cintura: 46,
          quadril: 50,
          bracos: {
            esq: 'M96 158 L90 210 L96 252',
            dir: 'M204 156 L214 202 L196 220',
            mangaEsq: 'M96 158 L91 226',
            mangaDir: 'M204 156 L213 200',
            maoEsq: [97, 258],
            maoDir: [192, 224],
          },
          boca: 'M140 101 q10 7 20 -2',
          desvio: -4,
          rotacaoCabeca: -2,
          deslocaCabeca: -2,
          cracha: null,
          aberturaPernas: 2,
          sobreRoupa: (
            <PecaExterna
              cor={ROUPA.blazerPetroleo}
              sombra={ROUPA.blazerPetroleoSombra}
              ombro={60}
              cintura={46}
              quadril={50}
            />
          ),
        }}
      />
    );
  }

  const postura =
    sprite === 'ana-encolhida'
      ? POSTURAS['ana-encolhida']
      : sprite === 'ana-confiante'
        ? POSTURAS['ana-confiante']
        : POSTURAS['ana-neutra'];

  // id desconhecido cai na postura neutra: nunca deixa buraco na tela
  return <CorpoDaAna props={props} postura={postura} />;
}

// ---------------------------------------------------------------- objetos

/** Copo de café descartável — Rafael. */
function CopoDeCafe(): ReactElement {
  return (
    <g>
      <path d="M180 190 L214 190 L209 232 L185 232 Z" fill={PALETA.superficie} {...TRACO} />
      <rect x={185} y={204} width={24} height={13} fill={PALETA.superficieSombra} />
      <rect x={176} y={181} width={42} height={12} rx={4} fill={ROUPA.pretoCamiseta} {...TRACO_FINO} />
    </g>
  );
}

/** Notebook fechado debaixo do braço — Cláudia. */
function NotebookFechado(): ReactElement {
  return (
    <g transform="rotate(-8 90 228)">
      <rect x={72} y={194} width={34} height={70} rx={5} fill={ROUPA.blazerCinzaSombra} {...TRACO} />
      <rect x={72} y={194} width={34} height={13} rx={5} fill={ROUPA.metal} />
      <rect x={78} y={216} width={22} height={6} rx={3} fill={ROUPA.metalSombra} />
    </g>
  );
}

/** Cabo de rede enrolado — Tiago. */
function CaboDeRede(): ReactElement {
  return (
    <g>
      <path
        d="M214 250 q14 8 12 26"
        fill="none"
        stroke={CONTORNO}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <path
        d="M214 250 q14 8 12 26"
        fill="none"
        stroke="#2f6f8a"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <rect x={217} y={272} width={17} height={22} rx={4} fill={ROUPA.metal} {...TRACO_FINO} />
      <ellipse cx={204} cy={246} rx={23} ry={25} fill="none" stroke={CONTORNO} strokeWidth={14} />
      <ellipse cx={204} cy={246} rx={23} ry={25} fill="none" stroke="#2f6f8a" strokeWidth={7} />
      <ellipse cx={204} cy={246} rx={11} ry={13} fill="none" stroke={CONTORNO} strokeWidth={13} />
      <ellipse cx={204} cy={246} rx={11} ry={13} fill="none" stroke="#2f6f8a" strokeWidth={7} />
    </g>
  );
}

/** Caneca de cerâmica — Bianca. */
function CanecaDeCeramica(): ReactElement {
  return (
    <g>
      <path
        d="M211 198 q13 3 13 12 q0 9 -13 12"
        fill="none"
        stroke={CONTORNO}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <path
        d="M211 198 q13 3 13 12 q0 9 -13 12"
        fill="none"
        stroke={PALETA.acento}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path d="M182 192 L213 192 L210 228 L185 228 Z" fill={PALETA.acento} {...TRACO} />
      <rect x={185} y={214} width={25} height={13} fill={PALETA.acentoSombra} />
    </g>
  );
}

/** Prancheta e canetão — Marcos. */
function Prancheta(): ReactElement {
  return (
    <g>
      <g transform="rotate(-11 94 226)">
        <rect x={70} y={194} width={48} height={64} rx={4} fill={ROUPA.cargoCinza} {...TRACO} />
        <rect x={76} y={202} width={36} height={50} rx={2} fill={PALETA.superficie} {...TRACO_FINO} />
        <rect x={82} y={212} width={24} height={6} fill={PALETA.superficieSombra} />
        <rect x={82} y={226} width={24} height={6} fill={PALETA.superficieSombra} />
        <rect x={84} y={189} width={20} height={10} rx={3} fill={ROUPA.metal} {...TRACO_FINO} />
      </g>
      <rect
        x={232}
        y={114}
        width={12}
        height={28}
        rx={4}
        fill={PALETA.acento}
        transform="rotate(20 238 128)"
        {...TRACO_FINO}
      />
    </g>
  );
}

// ---------------------------------------------------------------- NPCs

/**
 * Elenco fixo. Cada um é reconhecível de longe por duas coisas: silhueta de
 * cabelo e cor de roupa. Eles reaparecem ao longo de dois anos de história.
 */
const NPCS: Readonly<Record<string, PropsFigura>> = {
  // 26 anos, engenheiro de dados. Pele negra retinta, crespo curto, barba
  // aparada, polo verde-escura. Copo de café na mão.
  rafael: {
    pele: PELE[3],
    peleSombra: PELE_SOMBRA[3],
    cabelo: CABELO[2],
    cabeloBrilho: '#3c3c3e',
    penteado: 'crespo',
    barba: CABELO[2],
    topo: ROUPA.poloVerde,
    topoSombra: ROUPA.poloVerdeSombra,
    gola: 'polo',
    calca: ROUPA.jeansMedio,
    calcaSombra: ROUPA.jeansMedioSombra,
    sapato: ROUPA.tenisEscuro,
    sapatoSombra: ROUPA.tenisEscuroSombra,
    ombro: 66,
    cintura: 50,
    quadril: 54,
    bracos: {
      esq: 'M92 158 L86 210 L92 252',
      dir: 'M208 156 L218 198 L200 212',
      mangaEsq: 'M92 158 L88 192',
      mangaDir: 'M208 156 L216 188',
      maoEsq: [92, 258],
      maoDir: [197, 216],
    },
    boca: 'M140 101 q10 8 20 -1',
    desvio: 4,
    rotacaoCabeca: -2,
    deslocaCabeca: 0,
    cracha: 0,
    aberturaPernas: 0,
    objeto: <CopoDeCafe />,
  },

  // 40 anos, tech lead. Pele clara, castanho claro liso em coque baixo,
  // óculos, blazer cinza-azulado. Em trânsito, notebook sob o braço.
  claudia: {
    pele: PELE[0],
    peleSombra: PELE_SOMBRA[0],
    cabelo: CABELO[1],
    cabeloBrilho: '#6b5039',
    penteado: 'coque',
    oculos: true,
    topo: PALETA.superficie,
    topoSombra: PALETA.superficieSombra,
    corManga: ROUPA.blazerCinza,
    gola: 'redonda',
    calca: ROUPA.alfaiatariaEscura,
    calcaSombra: ROUPA.alfaiatariaEscuraSombra,
    sapato: ROUPA.sapatoPreto,
    sapatoSombra: ROUPA.sapatoPretoSombra,
    ombro: 56,
    cintura: 44,
    quadril: 50,
    bracos: {
      esq: 'M100 158 L94 208 L106 236',
      dir: 'M200 158 L208 208 L202 248',
      mangaEsq: 'M100 158 L94 208 L104 232',
      mangaDir: 'M200 158 L208 208 L202 242',
      maoEsq: [108, 240],
      maoDir: [202, 254],
    },
    boca: 'M141 103 h18',
    desvio: 4,
    rotacaoCabeca: 7,
    deslocaCabeca: 3,
    cracha: null,
    aberturaPernas: 13,
    sobreRoupa: (
      <PecaExterna
        cor={ROUPA.blazerCinza}
        sombra={ROUPA.blazerCinzaSombra}
        ombro={56}
        cintura={44}
        quadril={50}
      />
    ),
    objeto: <NotebookFechado />,
  },

  // 30 anos, suporte de TI. Pele morena, castanho curto desalinhado, camiseta
  // preta, calça cargo, crachá torto. Cabo de rede enrolado na mão.
  tiago: {
    pele: PELE[2],
    peleSombra: PELE_SOMBRA[2],
    cabelo: CABELO[0],
    cabeloBrilho: CABELO[1],
    penteado: 'curtoRebelde',
    topo: ROUPA.pretoCamiseta,
    topoSombra: ROUPA.pretoCamisetaSombra,
    gola: 'redonda',
    calca: ROUPA.cargoCinza,
    calcaSombra: ROUPA.cargoCinzaSombra,
    sapato: ROUPA.tenisEscuro,
    sapatoSombra: ROUPA.tenisEscuroSombra,
    ombro: 62,
    cintura: 50,
    quadril: 54,
    bracos: {
      esq: 'M96 160 L88 212 L94 252',
      dir: 'M204 160 L214 206 L202 226',
      mangaEsq: 'M96 160 L91 192',
      mangaDir: 'M204 160 L212 192',
      maoEsq: [94, 258],
      maoDir: [200, 230],
    },
    boca: 'M138 99 q12 11 24 -2',
    desvio: 3,
    rotacaoCabeca: -6,
    deslocaCabeca: 2,
    cracha: -15,
    aberturaPernas: 8,
    objeto: <CaboDeRede />,
  },

  // 34 anos, documentação técnica. Pele parda, cabelo preto longo liso, camisa
  // de linho off-white de manga enrolada. Caneca de cerâmica na mão.
  bianca: {
    pele: PELE[2],
    peleSombra: PELE_SOMBRA[2],
    cabelo: CABELO[2],
    cabeloBrilho: '#3c3c3e',
    penteado: 'longoLiso',
    topo: ROUPA.linhoOffWhite,
    topoSombra: ROUPA.linhoOffWhiteSombra,
    gola: 'camisa',
    calca: ROUPA.alfaiatariaEscura,
    calcaSombra: ROUPA.alfaiatariaEscuraSombra,
    sapato: ROUPA.sapatoPreto,
    sapatoSombra: ROUPA.sapatoPretoSombra,
    ombro: 54,
    cintura: 44,
    quadril: 50,
    bracos: {
      esq: 'M102 158 L94 208 L104 242',
      dir: 'M198 156 L208 196 L196 206',
      mangaEsq: 'M102 158 L95 204',
      mangaDir: 'M198 156 L207 193',
      maoEsq: [106, 246],
      maoDir: [193, 210],
    },
    boca: 'M141 102 q9 5 18 -1',
    desvio: 4,
    rotacaoCabeca: 2,
    deslocaCabeca: 0,
    cracha: null,
    aberturaPernas: 2,
    objeto: <CanecaDeCeramica />,
  },

  // 38 anos, facilitador de inovação. Pele clara, grisalho curto, barba
  // grisalha, camisa xadrez azul arregaçada sobre camiseta. Prancheta e
  // canetão, mão livre gesticulando.
  marcos: {
    pele: PELE[0],
    peleSombra: PELE_SOMBRA[0],
    cabelo: CABELO[3],
    cabeloBrilho: '#b3aea8',
    penteado: 'curtoLiso',
    barba: '#77726d',
    topo: PALETA.superficie,
    topoSombra: PALETA.superficieSombra,
    corManga: ROUPA.xadrezAzul,
    gola: 'redonda',
    calca: ROUPA.jeansMedio,
    calcaSombra: ROUPA.jeansMedioSombra,
    sapato: ROUPA.tenisEscuro,
    sapatoSombra: ROUPA.tenisEscuroSombra,
    ombro: 68,
    cintura: 54,
    quadril: 56,
    bracos: {
      esq: 'M90 158 L84 208 L96 230',
      dir: 'M210 156 L228 186 L236 142',
      mangaEsq: 'M90 158 L85 200',
      mangaDir: 'M210 156 L226 182',
      maoEsq: [98, 234],
      maoDir: [238, 136],
    },
    boca: 'M137 98 q13 14 26 -2',
    desvio: 5,
    rotacaoCabeca: -4,
    deslocaCabeca: -1,
    cracha: null,
    aberturaPernas: 10,
    sobreRoupa: (
      <PecaExterna
        cor={ROUPA.xadrezAzul}
        sombra={ROUPA.xadrezAzulSombra}
        ombro={68}
        cintura={54}
        quadril={56}
        xadrez
      />
    ),
    objeto: <Prancheta />,
  },
};

/** Figura de reserva para id desconhecido: pessoa de escritório, nunca buraco. */
const NPC_NEUTRO: PropsFigura = {
  pele: PELE[1],
  peleSombra: PELE_SOMBRA[1],
  cabelo: CABELO[0],
  cabeloBrilho: CABELO[1],
  penteado: 'curtoLiso',
  topo: PALETA.ambienteClaro,
  topoSombra: PALETA.ambiente,
  gola: 'redonda',
  calca: ROUPA.alfaiatariaEscura,
  calcaSombra: ROUPA.alfaiatariaEscuraSombra,
  sapato: ROUPA.sapatoPreto,
  sapatoSombra: ROUPA.sapatoPretoSombra,
  ombro: 58,
  cintura: 46,
  quadril: 52,
  bracos: {
    esq: 'M98 158 L92 210 L96 252',
    dir: 'M202 158 L208 210 L202 250',
    mangaEsq: 'M98 158 L94 190',
    mangaDir: 'M202 158 L206 190',
    maoEsq: [96, 258],
    maoDir: [202, 256],
  },
  boca: 'M141 103 h18',
  desvio: 3,
  rotacaoCabeca: 0,
  deslocaCabeca: 0,
  cracha: 0,
  aberturaPernas: 3,
};

export function ArteDeNpc({
  npc,
  largura,
  altura,
  className,
}: PropsArte & { npc: string }): ReactElement {
  const figura = NPCS[npc] ?? NPC_NEUTRO;
  return <Figura props={{ largura, altura, className }} figura={figura} />;
}
