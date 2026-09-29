/**
 * Cenários e mapa — ilustração vetorial desenhada em código.
 *
 * Não é placeholder. Enquanto não existir PNG no manifest, é ISTO que a
 * plateia vê, então cada lugar tem que ser reconhecível de relance numa tela
 * comprimida de Teams.
 *
 * Gramática comum a todos os cenários (é o que faz os seis parecerem do mesmo
 * prédio):
 *
 *   - Perspectiva de um ponto. A `Caixa` define a parede de fundo; as paredes
 *     laterais e o piso são trapézios que saem dela para as bordas do quadro.
 *   - O piso começa em `yPiso` (~metade do quadro) e o CENTRO-BAIXO fica livre
 *     de mobília: é onde a protagonista caminha.
 *   - Mobília em perspectiva convergente: todo tampo é mais ESTREITO atrás
 *     (`conicidade`), e todo volume tem tampo + borda + pé em três tons.
 *   - UMA fonte de luz dominante por cena. Feixe = polígono sólido claro,
 *     sombra = polígono sólido escuro. Zero gradiente, zero filtro, zero blur.
 *   - Contorno de 3 a 6px. Nada de 1px: a compressão come.
 *   - Zero pessoas (sprites entram por cima) e zero texto legível.
 *
 * Toda cor sai da PALETA por mistura em degraus — nenhum hex solto, exceto os
 * post-its do Innovation, que docs/prompts.md autoriza a saturar.
 *
 * IMPORTANTE: `./index` importa este módulo, então a PALETA NÃO pode ser lida
 * em escopo de módulo aqui (ciclo de import ⇒ TDZ). Todo acesso passa por
 * `tons()`, que resolve na primeira renderização.
 */
import type { ReactElement } from 'react';

import { PALETA } from './paleta';
import type { PropsArte } from './paleta';

// ------------------------------------------------------------------ geometria

const LARGURA_VB = 1920;
const ALTURA_VB = 1080;

/** A caixa de perspectiva de uma sala: onde fica a parede de fundo. */
interface Caixa {
  readonly xEsq: number;
  readonly xDir: number;
  readonly yTopo: number;
  readonly yPiso: number;
}

/** Sala fechada de porte médio. */
const SALA_PADRAO: Caixa = { xEsq: 260, xDir: 1660, yTopo: 110, yPiso: 560 };
/** Planta aberta: parede de fundo mais larga, teto mais baixo. */
const SALA_LARGA: Caixa = { xEsq: 170, xDir: 1750, yTopo: 120, yPiso: 590 };
/** Fundo recuado e teto alto: a sala parece maior do que precisaria. */
const SALA_AMPLA: Caixa = { xEsq: 430, xDir: 1490, yTopo: 55, yPiso: 505 };

/** Monta a lista de pontos de um polígono a partir de pares x,y. */
function pts(...coords: readonly number[]): string {
  const saida: string[] = [];
  for (let i = 0; i + 1 < coords.length; i += 2) {
    saida.push(`${coords[i] ?? 0},${coords[i + 1] ?? 0}`);
  }
  return saida.join(' ');
}

/** Borda esquerda do piso na altura y. */
function pisoEsq(c: Caixa, y: number): number {
  return c.xEsq * (1 - (y - c.yPiso) / (ALTURA_VB - c.yPiso));
}

/** Borda direita do piso na altura y. */
function pisoDir(c: Caixa, y: number): number {
  return c.xDir + (LARGURA_VB - c.xDir) * ((y - c.yPiso) / (ALTURA_VB - c.yPiso));
}

/** Onde uma linha de fuga que nasce em `xFundo` cruza a base do quadro. */
function fugaX(c: Caixa, xFundo: number): number {
  return ((xFundo - c.xEsq) * LARGURA_VB) / (c.xDir - c.xEsq);
}

/**
 * Ponto sobre a parede lateral esquerda.
 * `t` = profundidade (0 = fundo, 1 = borda do quadro); `h` = altura (0 = teto).
 */
function pontoParedeEsq(c: Caixa, t: number, h: number): readonly [number, number] {
  const x = c.xEsq * (1 - t);
  const teto = c.yTopo * (1 - t);
  const base = c.yPiso + (ALTURA_VB - c.yPiso) * t;
  return [x, teto + (base - teto) * h];
}

/** Ponto sobre a parede lateral direita. Mesma convenção de `pontoParedeEsq`. */
function pontoParedeDir(c: Caixa, t: number, h: number): readonly [number, number] {
  const x = c.xDir + (LARGURA_VB - c.xDir) * t;
  const teto = c.yTopo * (1 - t);
  const base = c.yPiso + (ALTURA_VB - c.yPiso) * t;
  return [x, teto + (base - teto) * h];
}

// ---------------------------------------------------------------------- cores

function canal(hex: string, inicio: number): number {
  return parseInt(hex.slice(inicio, inicio + 2), 16);
}

function hex2(v: number): string {
  return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
}

/** Mistura em degrau entre dois tons da paleta. `t` = 0 devolve `a`. */
function mistura(a: string, b: string, t: number): string {
  const p = Math.max(0, Math.min(1, t));
  const r = canal(a, 1) + (canal(b, 1) - canal(a, 1)) * p;
  const g = canal(a, 3) + (canal(b, 3) - canal(a, 3)) * p;
  const bl = canal(a, 5) + (canal(b, 5) - canal(a, 5)) * p;
  return `#${hex2(r)}${hex2(g)}${hex2(bl)}`;
}

interface Tons {
  contorno: string;
  vazio: string;
  ambiente: string;
  ambienteMedio: string;
  ambienteClaro: string;
  claroSuave: string;
  superficie: string;
  superficieSombra: string;
  superficieEscura: string;
  acento: string;
  acentoSombra: string;
  frio: string;
  frioForte: string;
  quente: string;
  quenteForte: string;
  /** Marrom de verdade. Âmbar sobre azul dá oliva; a paleta de pele não. */
  marrom: string;
  madeira: string;
  metal: string;
}

let cacheTons: Tons | null = null;

/** Tons derivados da PALETA. Resolvido tarde por causa do ciclo de import. */
function tons(): Tons {
  if (cacheTons !== null) return cacheTons;
  const p = PALETA;
  const t: Tons = {
    contorno: p.contorno,
    vazio: mistura(p.ambiente, p.contorno, 0.55),
    ambiente: p.ambiente,
    ambienteMedio: mistura(p.ambiente, p.ambienteClaro, 0.5),
    ambienteClaro: p.ambienteClaro,
    claroSuave: mistura(p.ambienteClaro, p.superficie, 0.28),
    superficie: p.superficie,
    superficieSombra: p.superficieSombra,
    superficieEscura: mistura(p.superficieSombra, p.ambienteClaro, 0.42),
    acento: p.acento,
    acentoSombra: p.acentoSombra,
    frio: mistura(p.superficie, p.ambienteClaro, 0.3),
    frioForte: mistura(p.superficie, p.ambienteClaro, 0.06),
    quente: mistura(p.superficie, p.acento, 0.45),
    quenteForte: mistura(p.acento, p.superficie, 0.22),
    marrom: p.peleSombra[2],
    madeira: mistura(p.pele[1], p.contorno, 0.3),
    metal: mistura(p.superficieSombra, p.ambienteClaro, 0.46),
  };
  cacheTons = t;
  return t;
}

// ------------------------------------------------------------- casca da sala

interface PropsCasca {
  caixa: Caixa;
  teto: string;
  parede: string;
  lateralEsq: string;
  lateralDir: string;
  piso: string;
  contorno: string;
}

/**
 * Teto, parede de fundo, duas laterais em diagonal e piso em perspectiva,
 * com as linhas de fuga do piso. É o esqueleto de todos os cenários.
 */
function CascaDeSala({
  caixa,
  teto,
  parede,
  lateralEsq,
  lateralDir,
  piso,
  contorno,
}: PropsCasca): ReactElement {
  const c = caixa;
  const linha = mistura(piso, contorno, 0.34);
  const radiais = [1, 2, 3, 4, 5, 6, 7].map((i) => c.xEsq + ((c.xDir - c.xEsq) * i) / 8);
  const profundidades = [0.1, 0.24, 0.44, 0.72].map(
    (s) => c.yPiso + (ALTURA_VB - c.yPiso) * s,
  );

  return (
    <g>
      <rect x={0} y={0} width={LARGURA_VB} height={ALTURA_VB} fill={parede} />
      {/* teto */}
      <polygon
        points={pts(0, 0, LARGURA_VB, 0, c.xDir, c.yTopo, c.xEsq, c.yTopo)}
        fill={teto}
        stroke={contorno}
        strokeWidth={4}
      />
      {/* parede de fundo */}
      <rect
        x={c.xEsq}
        y={c.yTopo}
        width={c.xDir - c.xEsq}
        height={c.yPiso - c.yTopo}
        fill={parede}
        stroke={contorno}
        strokeWidth={5}
      />
      {/* laterais em diagonal */}
      <polygon
        points={pts(0, 0, c.xEsq, c.yTopo, c.xEsq, c.yPiso, 0, ALTURA_VB)}
        fill={lateralEsq}
        stroke={contorno}
        strokeWidth={5}
      />
      <polygon
        points={pts(c.xDir, c.yTopo, LARGURA_VB, 0, LARGURA_VB, ALTURA_VB, c.xDir, c.yPiso)}
        fill={lateralDir}
        stroke={contorno}
        strokeWidth={5}
      />
      {/* piso */}
      <polygon
        points={pts(c.xEsq, c.yPiso, c.xDir, c.yPiso, LARGURA_VB, ALTURA_VB, 0, ALTURA_VB)}
        fill={piso}
        stroke={contorno}
        strokeWidth={5}
      />
      {radiais.map((xf) => (
        <line
          key={`r${xf}`}
          x1={xf}
          y1={c.yPiso}
          x2={fugaX(c, xf)}
          y2={ALTURA_VB}
          stroke={linha}
          strokeWidth={3}
        />
      ))}
      {profundidades.map((y) => (
        <line
          key={`p${y}`}
          x1={pisoEsq(c, y)}
          y1={y}
          x2={pisoDir(c, y)}
          y2={y}
          stroke={linha}
          strokeWidth={3}
        />
      ))}
      {/* rodapé: reforça o encontro parede/piso */}
      <rect
        x={c.xEsq}
        y={c.yPiso - 18}
        width={c.xDir - c.xEsq}
        height={18}
        fill={mistura(parede, contorno, 0.4)}
      />
    </g>
  );
}

// ----------------------------------------------------------------- mobiliário

interface PropsMesa {
  cx: number;
  /** y da borda FRONTAL do tampo. */
  y: number;
  largura: number;
  /** Recuo vertical do tampo (quanto de profundidade se vê). */
  profundidade: number;
  /** Fator de largura da borda de trás. < 1 ⇒ converge. */
  conicidade: number;
  espessura: number;
  altura: number;
  cor: string;
  contorno: string;
  /** Balcão: bloco fechado em vez de pernas. */
  corpo?: boolean;
}

/** Mesa/bancada em perspectiva: tampo, borda frontal e pés em três tons. */
function Mesa({
  cx,
  y,
  largura,
  profundidade,
  conicidade,
  espessura,
  altura,
  cor,
  contorno,
  corpo = false,
}: PropsMesa): ReactElement {
  const borda = mistura(cor, contorno, 0.3);
  const pe = mistura(cor, contorno, 0.52);
  const peSombra = mistura(cor, contorno, 0.68);
  const xfe = cx - largura / 2;
  const xfd = cx + largura / 2;
  const lt = largura * conicidade;
  const xte = cx - lt / 2;
  const xtd = cx + lt / 2;
  const yt = y - profundidade;
  const yb = y + espessura;
  const larguraPe = Math.max(14, largura * 0.045);

  return (
    <g>
      {/* pés de trás, atrás do tampo */}
      {!corpo && (
        <g>
          <rect
            x={xte + lt * 0.06}
            y={yt}
            width={larguraPe}
            height={altura * 0.82}
            fill={peSombra}
          />
          <rect
            x={xtd - lt * 0.06 - larguraPe}
            y={yt}
            width={larguraPe}
            height={altura * 0.82}
            fill={peSombra}
          />
        </g>
      )}
      {/* tampo */}
      <polygon
        points={pts(xte, yt, xtd, yt, xfd, y, xfe, y)}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
      />
      {/* borda frontal: a espessura do tampo */}
      <polygon
        points={pts(xfe, y, xfd, y, xfd, yb, xfe, yb)}
        fill={borda}
        stroke={contorno}
        strokeWidth={4}
      />
      {corpo ? (
        <g>
          <polygon
            points={pts(xfe, yb, xfd, yb, xfd, yb + altura, xfe, yb + altura)}
            fill={pe}
            stroke={contorno}
            strokeWidth={4}
          />
          {/* lateral sombreada do corpo */}
          <rect x={xfe} y={yb} width={largura * 0.07} height={altura} fill={peSombra} />
          <line
            x1={cx}
            y1={yb}
            x2={cx}
            y2={yb + altura}
            stroke={mistura(pe, contorno, 0.4)}
            strokeWidth={4}
          />
        </g>
      ) : (
        <g>
          <rect
            x={xfe + largura * 0.05}
            y={yb}
            width={larguraPe}
            height={altura}
            fill={pe}
            stroke={contorno}
            strokeWidth={3}
          />
          <rect
            x={xfd - largura * 0.05 - larguraPe}
            y={yb}
            width={larguraPe}
            height={altura}
            fill={pe}
            stroke={contorno}
            strokeWidth={3}
          />
          {/* travessa baixa: amarra os pés e dá leitura de volume */}
          <rect
            x={xfe + largura * 0.05}
            y={yb + altura * 0.66}
            width={largura * 0.9}
            height={Math.max(8, altura * 0.05)}
            fill={peSombra}
          />
        </g>
      )}
    </g>
  );
}

interface PropsCadeira {
  cx: number;
  /** y da borda frontal do assento. */
  y: number;
  escala: number;
  /** -1 a 1: quanto a cadeira está girada (assento e encosto deslocam). */
  giro: number;
  cor: string;
  contorno: string;
  tipo: 'escritorio' | 'simples';
}

/** Cadeira em perspectiva. `giro` afasta o encosto e enviesa o assento. */
function Cadeira({ cx, y, escala, giro, cor, contorno, tipo }: PropsCadeira): ReactElement {
  const assento = cor;
  const lado = mistura(cor, contorno, 0.34);
  const estrutura = mistura(cor, contorno, 0.55);
  const w = 150 * escala;
  const d = 66 * escala;
  const esp = 14 * escala;
  const hEncosto = 132 * escala;
  const desvio = giro * 40 * escala;
  const yTras = y - d;
  const bx1 = cx - w * 0.4 + desvio;
  const bx2 = cx + w * 0.4 + desvio;
  const topo = yTras - hEncosto;
  const inclina = giro * 18 * escala;

  return (
    <g>
      {/* encosto */}
      <polygon
        points={pts(bx1, yTras, bx2, yTras, bx2 + inclina, topo, bx1 + inclina, topo)}
        fill={assento}
        stroke={contorno}
        strokeWidth={4}
      />
      <polygon
        points={pts(
          bx2,
          yTras,
          bx2 + 14 * escala,
          yTras - 6 * escala,
          bx2 + inclina + 14 * escala,
          topo - 6 * escala,
          bx2 + inclina,
          topo,
        )}
        fill={lado}
        stroke={contorno}
        strokeWidth={3}
      />
      {/* assento */}
      <polygon
        points={pts(
          cx - w / 2,
          y,
          cx + w / 2,
          y,
          cx + w * 0.42 + desvio,
          yTras,
          cx - w * 0.42 + desvio,
          yTras,
        )}
        fill={assento}
        stroke={contorno}
        strokeWidth={4}
      />
      <polygon
        points={pts(cx - w / 2, y, cx + w / 2, y, cx + w / 2, y + esp, cx - w / 2, y + esp)}
        fill={lado}
        stroke={contorno}
        strokeWidth={3}
      />
      {tipo === 'escritorio' ? (
        <g>
          <rect
            x={cx - 11 * escala + desvio * 0.5}
            y={y + esp}
            width={22 * escala}
            height={62 * escala}
            fill={estrutura}
            stroke={contorno}
            strokeWidth={3}
          />
          <g
            stroke={estrutura}
            strokeWidth={13 * escala}
            strokeLinecap="round"
            fill="none"
          >
            <line
              x1={cx + desvio * 0.5}
              y1={y + esp + 62 * escala}
              x2={cx - 62 * escala}
              y2={y + esp + 92 * escala}
            />
            <line
              x1={cx + desvio * 0.5}
              y1={y + esp + 62 * escala}
              x2={cx + 62 * escala}
              y2={y + esp + 92 * escala}
            />
            <line
              x1={cx + desvio * 0.5}
              y1={y + esp + 62 * escala}
              x2={cx + 8 * escala}
              y2={y + esp + 106 * escala}
            />
          </g>
        </g>
      ) : (
        <g stroke={contorno} strokeWidth={3}>
          <rect
            x={cx - w * 0.44}
            y={y + esp}
            width={12 * escala}
            height={78 * escala}
            fill={estrutura}
          />
          <rect
            x={cx + w * 0.44 - 12 * escala}
            y={y + esp}
            width={12 * escala}
            height={78 * escala}
            fill={estrutura}
          />
          <rect
            x={cx - w * 0.34 + desvio}
            y={yTras + esp * 0.6}
            width={11 * escala}
            height={64 * escala}
            fill={mistura(estrutura, contorno, 0.3)}
          />
          <rect
            x={cx + w * 0.26 + desvio}
            y={yTras + esp * 0.6}
            width={11 * escala}
            height={64 * escala}
            fill={mistura(estrutura, contorno, 0.3)}
          />
        </g>
      )}
    </g>
  );
}

interface PropsBanqueto {
  cx: number;
  y: number;
  escala: number;
  cor: string;
  contorno: string;
}

/** Banqueto alto: assento redondo, coluna e anel de apoio. */
function Banqueto({ cx, y, escala, cor, contorno }: PropsBanqueto): ReactElement {
  const lado = mistura(cor, contorno, 0.34);
  const metal = mistura(cor, contorno, 0.56);
  const rx = 62 * escala;
  const ry = 22 * escala;
  const alturaColuna = 168 * escala;
  return (
    <g>
      <rect
        x={cx - 13 * escala}
        y={y}
        width={26 * escala}
        height={alturaColuna}
        fill={metal}
        stroke={contorno}
        strokeWidth={3}
      />
      <ellipse
        cx={cx}
        cy={y + alturaColuna}
        rx={rx * 0.62}
        ry={ry * 0.5}
        fill={metal}
        stroke={contorno}
        strokeWidth={3}
      />
      <ellipse
        cx={cx}
        cy={y + alturaColuna * 0.62}
        rx={rx * 0.5}
        ry={ry * 0.34}
        fill="none"
        stroke={metal}
        strokeWidth={5}
      />
      <path
        d={`M ${cx - rx} ${y} A ${rx} ${ry} 0 0 0 ${cx + rx} ${y} L ${cx + rx} ${y - 14 * escala} L ${cx - rx} ${y - 14 * escala} Z`}
        fill={lado}
        stroke={contorno}
        strokeWidth={3}
      />
      <ellipse
        cx={cx}
        cy={y - 14 * escala}
        rx={rx}
        ry={ry}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
      />
    </g>
  );
}

interface PropsMesaRedonda {
  cx: number;
  /** y do centro do tampo. */
  cy: number;
  rx: number;
  ry: number;
  altura: number;
  cor: string;
  contorno: string;
  pedestais: 1 | 2;
}

/** Mesa redonda/oval: tampo elíptico, faixa de espessura e pedestal. */
function MesaRedonda({
  cx,
  cy,
  rx,
  ry,
  altura,
  cor,
  contorno,
  pedestais,
}: PropsMesaRedonda): ReactElement {
  const lado = mistura(cor, contorno, 0.32);
  const pe = mistura(cor, contorno, 0.54);
  const esp = Math.max(16, ry * 0.26);
  const colunas = pedestais === 2 ? [cx - rx * 0.45, cx + rx * 0.45] : [cx];
  const larguraColuna = pedestais === 2 ? rx * 0.12 : rx * 0.2;
  return (
    <g>
      {/* sombra de contato no piso */}
      <ellipse
        cx={cx}
        cy={cy + altura + esp}
        rx={rx * 0.9}
        ry={ry * 0.5}
        fill={mistura(contorno, cor, 0.18)}
        opacity={0.5}
      />
      {colunas.map((x) => (
        <g key={`col${x}`}>
          <rect
            x={x - larguraColuna / 2}
            y={cy}
            width={larguraColuna}
            height={altura}
            fill={pe}
            stroke={contorno}
            strokeWidth={4}
          />
          <ellipse
            cx={x}
            cy={cy + altura}
            rx={larguraColuna * 1.5}
            ry={larguraColuna * 0.42}
            fill={mistura(pe, contorno, 0.3)}
            stroke={contorno}
            strokeWidth={4}
          />
        </g>
      ))}
      <path
        d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy} L ${cx + rx} ${cy - esp} L ${cx - rx} ${cy - esp} Z`}
        fill={lado}
        stroke={contorno}
        strokeWidth={4}
      />
      <ellipse
        cx={cx}
        cy={cy - esp}
        rx={rx}
        ry={ry}
        fill={cor}
        stroke={contorno}
        strokeWidth={5}
      />
    </g>
  );
}

interface PropsMonitor {
  x: number;
  y: number;
  w: number;
  h: number;
  aceso: boolean;
  cor: string;
  brilho: string;
  contorno: string;
}

/** Monitor de bancada com pé. Aceso = blocos abstratos, nunca texto. */
function Monitor({ x, y, w, h, aceso, cor, brilho, contorno }: PropsMonitor): ReactElement {
  const lado = mistura(cor, contorno, 0.4);
  const tela = aceso ? brilho : mistura(cor, contorno, 0.62);
  const traco = aceso ? mistura(brilho, contorno, 0.45) : mistura(cor, contorno, 0.74);
  const cx = x + w / 2;
  const m = 16;
  return (
    <g>
      <polygon
        points={pts(x + w, y, x + w + 16, y + 10, x + w + 16, y + h + 10, x + w, y + h)}
        fill={lado}
        stroke={contorno}
        strokeWidth={3}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={cor}
        stroke={contorno}
        strokeWidth={5}
      />
      <rect x={x + m} y={y + m} width={w - m * 2} height={h - m * 2.4} fill={tela} />
      {aceso && (
        <g fill={traco}>
          <rect x={x + m + 14} y={y + m + 16} width={(w - m * 2) * 0.46} height={16} />
          <rect x={x + m + 14} y={y + m + 46} width={(w - m * 2) * 0.72} height={12} />
          <rect x={x + m + 14} y={y + m + 72} width={(w - m * 2) * 0.3} height={12} />
          <rect
            x={x + m + 14}
            y={y + h - m * 2.4 - 18}
            width={(w - m * 2) * 0.58}
            height={20}
          />
        </g>
      )}
      <polygon
        points={pts(cx - 20, y + h, cx + 20, y + h, cx + 34, y + h + 48, cx - 34, y + h + 48)}
        fill={lado}
        stroke={contorno}
        strokeWidth={4}
      />
      <ellipse
        cx={cx}
        cy={y + h + 54}
        rx={64}
        ry={15}
        fill={mistura(cor, contorno, 0.28)}
        stroke={contorno}
        strokeWidth={4}
      />
    </g>
  );
}

interface PropsTela {
  x: number;
  y: number;
  w: number;
  h: number;
  acesa: boolean;
  cor: string;
  brilho: string;
  contorno: string;
}

/** TV de parede. Acesa = diagrama de blocos ligados por linhas grossas. */
function TelaDeParede({ x, y, w, h, acesa, cor, brilho, contorno }: PropsTela): ReactElement {
  const moldura = mistura(cor, contorno, 0.45);
  const tela = acesa ? mistura(brilho, contorno, 0.55) : mistura(cor, contorno, 0.6);
  const bloco = acesa ? brilho : mistura(cor, contorno, 0.7);
  const linha = acesa ? mistura(brilho, contorno, 0.25) : mistura(cor, contorno, 0.68);
  const bw = w * 0.2;
  const bh = h * 0.2;
  const col1 = x + w * 0.12;
  const col2 = x + w * 0.42;
  const col3 = x + w * 0.7;
  const lin1 = y + h * 0.2;
  const lin2 = y + h * 0.56;
  return (
    <g>
      <rect
        x={x - 12}
        y={y - 12}
        width={w + 24}
        height={h + 24}
        rx={10}
        fill={moldura}
        stroke={contorno}
        strokeWidth={5}
      />
      <rect x={x} y={y} width={w} height={h} fill={tela} />
      {acesa && (
        <g>
          <g stroke={linha} strokeWidth={13} strokeLinecap="round" fill="none">
            <line x1={col1 + bw} y1={lin1 + bh / 2} x2={col2} y2={lin1 + bh / 2} />
            <line x1={col2 + bw} y1={lin1 + bh / 2} x2={col3} y2={lin1 + bh / 2} />
            <line x1={col2 + bw / 2} y1={lin1 + bh} x2={col2 + bw / 2} y2={lin2} />
            <line x1={col1 + bw / 2} y1={lin2 + bh / 2} x2={col2 + bw / 2} y2={lin2 + bh / 2} />
            <line x1={col2 + bw} y1={lin2 + bh / 2} x2={col3 + bw / 2} y2={lin2 + bh / 2} />
            <line x1={col3 + bw / 2} y1={lin1 + bh} x2={col3 + bw / 2} y2={lin2} />
          </g>
          <g fill={bloco} stroke={contorno} strokeWidth={4}>
            <rect x={col1} y={lin1} width={bw} height={bh} rx={6} />
            <rect x={col2} y={lin1} width={bw} height={bh} rx={6} />
            <rect x={col3} y={lin1} width={bw} height={bh} rx={6} />
            <rect x={col1} y={lin2} width={bw} height={bh} rx={6} />
            <rect x={col2} y={lin2} width={bw} height={bh} rx={6} />
            <rect x={col3} y={lin2} width={bw} height={bh} rx={6} />
          </g>
        </g>
      )}
      {/* suporte de parede */}
      <rect x={x + w / 2 - 40} y={y + h + 12} width={80} height={18} fill={moldura} />
    </g>
  );
}

interface PropsRack {
  x: number;
  /** y do topo do rack. */
  y: number;
  w: number;
  h: number;
  /** Deslocamento da face de fundo (profundidade aparente). */
  recuo: number;
  /** De que lado a lateral aparece: objetos à direita do centro mostram a esquerda. */
  lado: 'esquerda' | 'direita';
  cor: string;
  contorno: string;
  slots: number;
  luz: string;
  luzAlt: string;
}

/** Rack alto: corpo com volume, slots horizontais e pontos de luz indicadora. */
function Rack({
  x,
  y,
  w,
  h,
  recuo,
  lado,
  cor,
  contorno,
  slots,
  luz,
  luzAlt,
}: PropsRack): ReactElement {
  const frente = cor;
  const lateral = mistura(cor, contorno, 0.5);
  const topo = mistura(cor, contorno, 0.24);
  const slot = mistura(cor, contorno, 0.62);
  const dx = lado === 'esquerda' ? -recuo : recuo;
  const dy = -recuo * 0.34;
  const lista = Array.from({ length: slots }, (_, i) => i);
  const alturaSlot = (h * 0.86) / slots;
  return (
    <g>
      {/* lateral */}
      <polygon
        points={pts(x + (lado === 'esquerda' ? 0 : w), y, x + (lado === 'esquerda' ? 0 : w) + dx, y + dy, x + (lado === 'esquerda' ? 0 : w) + dx, y + h + dy * 1.6, x + (lado === 'esquerda' ? 0 : w), y + h)}
        fill={lateral}
        stroke={contorno}
        strokeWidth={4}
      />
      {/* topo */}
      <polygon
        points={pts(x, y, x + w, y, x + w + dx, y + dy, x + dx, y + dy)}
        fill={topo}
        stroke={contorno}
        strokeWidth={4}
      />
      {/* frente */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={frente}
        stroke={contorno}
        strokeWidth={5}
      />
      {lista.map((i) => {
        const sy = y + h * 0.07 + i * alturaSlot;
        return (
          <g key={`slot${i}`}>
            <rect
              x={x + w * 0.08}
              y={sy}
              width={w * 0.84}
              height={alturaSlot * 0.62}
              fill={slot}
              stroke={contorno}
              strokeWidth={3}
            />
            <circle
              cx={x + w * 0.18}
              cy={sy + alturaSlot * 0.31}
              r={Math.max(5, alturaSlot * 0.12)}
              fill={i % 3 === 0 ? luzAlt : luz}
            />
            <circle
              cx={x + w * 0.3}
              cy={sy + alturaSlot * 0.31}
              r={Math.max(5, alturaSlot * 0.12)}
              fill={i % 2 === 0 ? luz : luzAlt}
            />
            <rect
              x={x + w * 0.56}
              y={sy + alturaSlot * 0.2}
              width={w * 0.28}
              height={alturaSlot * 0.22}
              fill={mistura(slot, contorno, 0.4)}
            />
          </g>
        );
      })}
    </g>
  );
}

interface PropsDivisoria {
  x1: number;
  x2: number;
  /** y do topo do painel na frente. */
  y: number;
  altura: number;
  /** Recuo do topo: dá a diagonal de perspectiva. */
  recuo: number;
  cor: string;
  contorno: string;
}

/** Divisória baixa de baia. */
function Divisoria({ x1, x2, y, altura, recuo, cor, contorno }: PropsDivisoria): ReactElement {
  return (
    <g>
      <polygon
        points={pts(x1, y, x2, y - recuo, x2, y - recuo + altura, x1, y + altura)}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
      />
      <polygon
        points={pts(x1, y, x2, y - recuo, x2, y - recuo + 14, x1, y + 14)}
        fill={mistura(cor, contorno, 0.38)}
      />
    </g>
  );
}

interface PropsJanela {
  x: number;
  y: number;
  w: number;
  h: number;
  vidro: string;
  moldura: string;
  contorno: string;
}

/** Janela grande de parede de fundo, com peitoril e caixilhos grossos. */
function Janela({ x, y, w, h, vidro, moldura, contorno }: PropsJanela): ReactElement {
  const sombra = mistura(moldura, contorno, 0.4);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={moldura}
        stroke={contorno}
        strokeWidth={5}
      />
      <rect x={x + 16} y={y + 16} width={w - 32} height={h - 32} fill={vidro} />
      <g fill={moldura} stroke={contorno} strokeWidth={3}>
        <rect x={x + w / 3 - 8} y={y + 16} width={16} height={h - 32} />
        <rect x={x + (w * 2) / 3 - 8} y={y + 16} width={16} height={h - 32} />
        <rect x={x + 16} y={y + h * 0.54} width={w - 32} height={16} />
      </g>
      <rect x={x - 12} y={y + h} width={w + 24} height={18} fill={sombra} />
    </g>
  );
}

interface PropsPufe {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  cor: string;
  contorno: string;
}

/** Pufe: volume mole em dois tons. */
function Pufe({ cx, cy, rx, ry, cor, contorno }: PropsPufe): ReactElement {
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy + ry * 0.5}
        rx={rx}
        ry={ry * 0.95}
        fill={mistura(cor, contorno, 0.4)}
        stroke={contorno}
        strokeWidth={4}
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx * 0.94}
        ry={ry * 0.66}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
      />
    </g>
  );
}

interface PropsFlipChart {
  x: number;
  y: number;
  w: number;
  h: number;
  papel: string;
  contorno: string;
}

/** Flip chart de papel em branco sobre tripé. */
function FlipChart({ x, y, w, h, papel, contorno }: PropsFlipChart): ReactElement {
  const perna = mistura(papel, contorno, 0.6);
  const sombra = mistura(papel, contorno, 0.24);
  return (
    <g>
      <g stroke={perna} strokeWidth={12} strokeLinecap="round">
        <line x1={x + w * 0.2} y1={y + h} x2={x + w * 0.02} y2={y + h + 230} />
        <line x1={x + w * 0.8} y1={y + h} x2={x + w * 0.95} y2={y + h + 212} />
        <line x1={x + w * 0.5} y1={y + h} x2={x + w * 0.56} y2={y + h + 180} />
      </g>
      <polygon
        points={pts(x, y, x + w, y + 16, x + w, y + h + 16, x, y + h)}
        fill={papel}
        stroke={contorno}
        strokeWidth={5}
      />
      <polygon points={pts(x, y, x + w, y + 16, x + w, y + 40, x, y + 24)} fill={sombra} />
    </g>
  );
}

interface PropsCaneca {
  cx: number;
  y: number;
  escala: number;
  cor: string;
  contorno: string;
}

/** Caneca: cilindro curto com alça. */
function Caneca({ cx, y, escala, cor, contorno }: PropsCaneca): ReactElement {
  const r = 22 * escala;
  const h = 46 * escala;
  return (
    <g stroke={contorno} strokeWidth={4}>
      <ellipse
        cx={cx + r + 10 * escala}
        cy={y - h * 0.5}
        rx={12 * escala}
        ry={14 * escala}
        fill="none"
        strokeWidth={9}
      />
      <path
        d={`M ${cx - r} ${y - h} L ${cx - r} ${y - r * 0.3} A ${r} ${r * 0.42} 0 0 0 ${cx + r} ${y - r * 0.3} L ${cx + r} ${y - h} Z`}
        fill={cor}
      />
      <ellipse
        cx={cx}
        cy={y - h}
        rx={r}
        ry={r * 0.42}
        fill={mistura(cor, contorno, 0.3)}
      />
    </g>
  );
}

interface PropsNotebook {
  cx: number;
  y: number;
  escala: number;
  aberto: boolean;
  cor: string;
  contorno: string;
}

/** Notebook sobre um tampo. Fechado = bloco baixo; aberto = base + tela. */
function Notebook({ cx, y, escala, aberto, cor, contorno }: PropsNotebook): ReactElement {
  const w = 190 * escala;
  const lado = mistura(cor, contorno, 0.34);
  const tela = mistura(cor, contorno, 0.62);
  return (
    <g>
      <polygon
        points={pts(cx - w / 2, y, cx + w / 2, y, cx + w * 0.4, y - 52 * escala, cx - w * 0.4, y - 52 * escala)}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
      />
      <polygon
        points={pts(cx - w / 2, y, cx + w / 2, y, cx + w / 2, y + 14 * escala, cx - w / 2, y + 14 * escala)}
        fill={lado}
        stroke={contorno}
        strokeWidth={3}
      />
      {aberto && (
        <g>
          <polygon
            points={pts(
              cx - w * 0.4,
              y - 52 * escala,
              cx + w * 0.4,
              y - 52 * escala,
              cx + w * 0.46,
              y - 172 * escala,
              cx - w * 0.34,
              y - 172 * escala,
            )}
            fill={cor}
            stroke={contorno}
            strokeWidth={4}
          />
          <polygon
            points={pts(
              cx - w * 0.33,
              y - 62 * escala,
              cx + w * 0.33,
              y - 62 * escala,
              cx + w * 0.38,
              y - 162 * escala,
              cx - w * 0.28,
              y - 162 * escala,
            )}
            fill={tela}
          />
        </g>
      )}
    </g>
  );
}

// -------------------------------------------------------------- 1. escritório

/** Planta aberta, início de manhã, luz fria em diagonal pelas janelas. */
function Escritorio(): ReactElement {
  const t = tons();
  const c = SALA_LARGA;
  const parede = mistura(t.ambienteClaro, t.frio, 0.2);
  const piso = mistura(t.superficieSombra, t.ambienteClaro, 0.46);
  const luz = mistura(piso, t.frioForte, 0.66);
  const sombra = mistura(piso, t.contorno, 0.44);
  const tampo = t.superficie;
  const janelas = [
    { x: 300, y: 172, w: 360, h: 286 },
    { x: 780, y: 172, w: 360, h: 286 },
    { x: 1260, y: 172, w: 360, h: 286 },
  ] as const;

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambiente, t.contorno, 0.28)}
        parede={parede}
        lateralEsq={mistura(t.ambienteClaro, t.contorno, 0.36)}
        lateralDir={mistura(t.ambienteClaro, t.contorno, 0.14)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* luminárias de teto, em perspectiva */}
      <g fill={mistura(t.ambienteClaro, t.superficie, 0.2)} stroke={t.contorno} strokeWidth={3}>
        <polygon points={pts(520, 34, 1400, 34, 1310, 74, 610, 74)} />
        <polygon points={pts(700, 86, 1220, 86, 1180, 110, 740, 110)} />
      </g>

      {janelas.map((j) => (
        <Janela
          key={`jan${j.x}`}
          x={j.x}
          y={j.y}
          w={j.w}
          h={j.h}
          vidro={t.frioForte}
          moldura={mistura(t.ambienteClaro, t.contorno, 0.2)}
          contorno={t.contorno}
        />
      ))}

      {/* feixes: uma só direção, manhã entrando pela esquerda das janelas */}
      {janelas.map((j) => (
        <polygon
          key={`feixe${j.x}`}
          points={pts(
            j.x,
            j.y + j.h,
            j.x + j.w,
            j.y + j.h,
            j.x + j.w + 500,
            ALTURA_VB,
            j.x + 230,
            ALTURA_VB,
          )}
          fill={luz}
          opacity={0.42}
        />
      ))}

      {/* sombras longas, na mesma direção dos feixes */}
      <polygon points={pts(700, 900, 1250, 1010, 1150, 1080, 240, 1080)} fill={sombra} opacity={0.72} />
      <polygon points={pts(1520, 790, 1920, 900, 1920, 1080, 1290, 1080)} fill={sombra} opacity={0.6} />

      {/* baias do fundo: divisória visível acima dos tampos, mesas em fileira */}
      <Divisoria x1={250} x2={800} y={566} altura={112} recuo={18} cor={mistura(t.superficieSombra, t.ambienteClaro, 0.42)} contorno={t.contorno} />
      <Divisoria x1={1180} x2={1740} y={550} altura={112} recuo={-18} cor={mistura(t.superficieSombra, t.ambienteClaro, 0.42)} contorno={t.contorno} />

      <Mesa cx={566} y={694} largura={310} profundidade={68} conicidade={0.84} espessura={12} altura={80} cor={tampo} contorno={t.contorno} />
      <Mesa cx={1392} y={688} largura={310} profundidade={68} conicidade={0.84} espessura={12} altura={80} cor={tampo} contorno={t.contorno} />
      <Mesa cx={1580} y={806} largura={430} profundidade={110} conicidade={0.81} espessura={15} altura={120} cor={tampo} contorno={t.contorno} />
      <Monitor x={1466} y={600} w={196} h={128} aceso={false} cor={mistura(t.ambiente, t.ambienteClaro, 0.2)} brilho={t.frio} contorno={t.contorno} />

      {/* rack de rede à direita */}
      <Rack
        x={1610}
        y={392}
        w={200}
        h={366}
        recuo={92}
        lado="esquerda"
        cor={mistura(t.ambiente, t.ambienteClaro, 0.34)}
        contorno={t.contorno}
        slots={7}
        luz={t.acento}
        luzAlt={t.frio}
      />
      <g stroke={mistura(t.ambiente, t.contorno, 0.3)} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d="M 1630 470 C 1560 520 1560 600 1616 640" />
        <path d="M 1640 512 C 1578 556 1578 616 1622 652" />
      </g>

      {/* posto em primeiro plano, à esquerda */}
      <Cadeira cx={276} y={790} escala={0.84} giro={0.12} cor={mistura(t.ambienteClaro, t.contorno, 0.1)} contorno={t.contorno} tipo="escritorio" />
      <Mesa cx={310} y={948} largura={580} profundidade={200} conicidade={0.79} espessura={20} altura={190} cor={tampo} contorno={t.contorno} />
      <Monitor x={170} y={700} w={226} h={146} aceso={false} cor={mistura(t.ambiente, t.ambienteClaro, 0.2)} brilho={t.frio} contorno={t.contorno} />
      <Notebook cx={430} y={900} escala={0.9} aberto={false} cor={mistura(t.ambienteClaro, t.contorno, 0.08)} contorno={t.contorno} />
      <Caneca cx={562} y={924} escala={1} cor={t.superficie} contorno={t.contorno} />
    </g>
  );
}

// --------------------------------------------------------------- 2. cafezinho

/** Copa pequena. Pendente âmbar sobre a mesa alta: o oposto do laboratório. */
function Cafezinho(): ReactElement {
  const t = tons();
  const c = SALA_PADRAO;
  // Âmbar puro sobre azul dá verde-oliva. O quente aqui passa pelo marrom.
  const parede = mistura(t.marrom, t.ambienteClaro, 0.4);
  const piso = mistura(t.superficieSombra, t.marrom, 0.38);
  const luz = mistura(piso, t.quenteForte, 0.62);
  const madeira = t.madeira;
  const bancada = mistura(t.superficie, t.acento, 0.1);

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambiente, t.marrom, 0.3)}
        parede={parede}
        lateralEsq={mistura(parede, t.contorno, 0.32)}
        lateralDir={mistura(parede, t.contorno, 0.14)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* cone do pendente: fonte única e quente */}
      <polygon points={pts(646, 300, 764, 300, 1060, ALTURA_VB, 372, ALTURA_VB)} fill={luz} opacity={0.5} />
      <polygon points={pts(668, 300, 742, 300, 906, ALTURA_VB, 520, ALTURA_VB)} fill={t.quenteForte} opacity={0.32} />

      {/* armários suspensos na parede de fundo */}
      <g>
        <rect x={960} y={228} width={600} height={168} fill={madeira} stroke={t.contorno} strokeWidth={5} />
        <rect x={960} y={396} width={600} height={20} fill={mistura(madeira, t.contorno, 0.45)} />
        <g stroke={t.contorno} strokeWidth={4}>
          <line x1={1160} y1={228} x2={1160} y2={396} />
          <line x1={1360} y1={228} x2={1360} y2={396} />
        </g>
        <g fill={mistura(bancada, t.contorno, 0.2)}>
          <rect x={1120} y={356} width={80} height={12} rx={6} />
          <rect x={1320} y={356} width={80} height={12} rx={6} />
        </g>
      </g>

      {/* bancada com pia */}
      <Mesa cx={1120} y={764} largura={660} profundidade={150} conicidade={0.87} espessura={26} altura={216} cor={bancada} contorno={t.contorno} corpo />
      <g>
        <rect x={1046} y={664} width={196} height={72} rx={12} fill={mistura(t.metal, t.contorno, 0.28)} stroke={t.contorno} strokeWidth={4} />
        <rect x={1068} y={682} width={152} height={42} rx={8} fill={mistura(t.metal, t.contorno, 0.5)} />
        <path d="M 1256 664 L 1256 606 C 1256 586 1214 586 1214 612" fill="none" stroke={t.metal} strokeWidth={11} strokeLinecap="round" />
      </g>

      {/* máquina de café encostada na parede à direita */}
      <g>
        <polygon points={pts(1556, 396, 1476, 430, 1476, 846, 1556, 892)} fill={mistura(t.ambiente, t.contorno, 0.2)} stroke={t.contorno} strokeWidth={4} />
        <polygon points={pts(1556, 396, 1806, 396, 1726, 430, 1476, 430)} fill={mistura(t.ambienteClaro, t.contorno, 0.3)} stroke={t.contorno} strokeWidth={4} />
        <rect x={1556} y={396} width={250} height={496} fill={mistura(t.ambienteClaro, t.contorno, 0.12)} stroke={t.contorno} strokeWidth={5} />
        <rect x={1592} y={430} width={178} height={96} rx={8} fill={mistura(t.ambiente, t.contorno, 0.35)} stroke={t.contorno} strokeWidth={4} />
        <g fill={t.acento} stroke={t.contorno} strokeWidth={3}>
          <circle cx={1620} cy={572} r={22} />
          <circle cx={1682} cy={572} r={22} />
        </g>
        <circle cx={1744} cy={572} r={14} fill={t.quenteForte} />
        <rect x={1596} y={620} width={170} height={110} fill={mistura(t.ambiente, t.contorno, 0.3)} stroke={t.contorno} strokeWidth={4} />
        <rect x={1640} y={620} width={82} height={34} fill={mistura(t.metal, t.contorno, 0.3)} />
        <rect x={1586} y={748} width={190} height={26} rx={6} fill={t.metal} stroke={t.contorno} strokeWidth={4} />
      </g>

      {/* pendente */}
      <g>
        <rect x={696} y={110} width={14} height={142} fill={mistura(t.ambiente, t.contorno, 0.2)} />
        <polygon points={pts(636, 300, 770, 300, 736, 246, 670, 246)} fill={mistura(t.ambiente, t.contorno, 0.1)} stroke={t.contorno} strokeWidth={5} />
        <ellipse cx={703} cy={300} rx={67} ry={16} fill={t.acento} stroke={t.contorno} strokeWidth={4} />
      </g>

      {/* mesa alta redonda e banquetos, centro-esquerda */}
      <Banqueto cx={470} y={792} escala={1.05} cor={mistura(t.ambienteClaro, t.marrom, 0.34)} contorno={t.contorno} />
      <MesaRedonda cx={703} cy={668} rx={178} ry={64} altura={262} cor={bancada} contorno={t.contorno} pedestais={1} />
      <Banqueto cx={906} y={766} escala={1} cor={mistura(t.ambienteClaro, t.marrom, 0.34)} contorno={t.contorno} />
      <Caneca cx={760} y={628} escala={0.9} cor={t.superficie} contorno={t.contorno} />
    </g>
  );
}

// -------------------------------------------------------- 3. sala-treinamento

/** Sala pequena, fim de tarde, luz baixa e lateral por uma única janela. */
function SalaTreinamento(): ReactElement {
  const t = tons();
  const c = SALA_PADRAO;
  const parede = mistura(t.ambienteClaro, t.marrom, 0.26);
  const piso = mistura(t.superficieEscura, t.marrom, 0.26);
  const luz = mistura(piso, t.quente, 0.62);
  const tampo = mistura(t.superficie, t.acento, 0.06);

  const j1 = pontoParedeEsq(c, 0.2, 0.3);
  const j2 = pontoParedeEsq(c, 0.7, 0.3);
  const j3 = pontoParedeEsq(c, 0.7, 0.74);
  const j4 = pontoParedeEsq(c, 0.2, 0.74);
  const m1 = pontoParedeEsq(c, 0.45, 0.3);
  const m2 = pontoParedeEsq(c, 0.45, 0.74);

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambiente, t.contorno, 0.34)}
        parede={parede}
        lateralEsq={mistura(parede, t.contorno, 0.3)}
        lateralDir={mistura(parede, t.contorno, 0.44)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* janela lateral: única fonte */}
      <polygon
        points={pts(j1[0], j1[1], j2[0], j2[1], j3[0], j3[1], j4[0], j4[1])}
        fill={t.quente}
        stroke={t.contorno}
        strokeWidth={6}
      />
      <line x1={m1[0]} y1={m1[1]} x2={m2[0]} y2={m2[1]} stroke={mistura(parede, t.contorno, 0.3)} strokeWidth={14} />
      <line x1={j1[0]} y1={(j1[1] + j4[1]) / 2} x2={j2[0]} y2={(j2[1] + j3[1]) / 2} stroke={mistura(parede, t.contorno, 0.3)} strokeWidth={12} />

      {/* feixe rasante de fim de tarde */}
      <polygon points={pts(j4[0], j4[1], 1460, 690, 1330, 1010, j3[0], j3[1])} fill={luz} opacity={0.5} />
      <polygon points={pts(j4[0], j4[1] + 40, 1240, 742, 1160, 916, j3[0], j3[1] - 30)} fill={t.quente} opacity={0.22} />

      {/* TV apagada e mesa longa */}
      <TelaDeParede x={742} y={196} w={520} h={296} acesa={false} cor={mistura(t.ambiente, t.ambienteClaro, 0.22)} brilho={t.frio} contorno={t.contorno} />

      <Cadeira cx={772} y={700} escala={0.78} giro={0} cor={mistura(t.ambienteClaro, t.contorno, 0.05)} contorno={t.contorno} tipo="simples" />
      <Cadeira cx={1036} y={696} escala={0.78} giro={0.1} cor={mistura(t.ambienteClaro, t.contorno, 0.05)} contorno={t.contorno} tipo="simples" />
      <Mesa cx={900} y={836} largura={700} profundidade={186} conicidade={0.78} espessura={20} altura={196} cor={tampo} contorno={t.contorno} />
      <Notebook cx={900} y={790} escala={0.95} aberto cor={mistura(t.ambienteClaro, t.contorno, 0.06)} contorno={t.contorno} />
      <Cadeira cx={476} y={846} escala={0.92} giro={-0.34} cor={mistura(t.ambienteClaro, t.contorno, 0.05)} contorno={t.contorno} tipo="simples" />
      <Cadeira cx={1326} y={828} escala={0.92} giro={0.3} cor={mistura(t.ambienteClaro, t.contorno, 0.05)} contorno={t.contorno} tipo="simples" />

      {/* flip chart no canto */}
      <FlipChart x={1418} y={330} w={216} h={286} papel={mistura(t.superficie, t.acento, 0.08)} contorno={t.contorno} />

      {/* sombra da mesa, afastando-se da janela */}
      <polygon points={pts(1256, 1040, 1620, 940, 1780, ALTURA_VB, 1300, ALTURA_VB)} fill={mistura(piso, t.contorno, 0.44)} opacity={0.6} />
    </g>
  );
}

// ------------------------------------------------------------- 4. laboratório

/** Sem janela. Só a luz fria dos monitores contra a penumbra. */
function Laboratorio(): ReactElement {
  const t = tons();
  const c = SALA_PADRAO;
  const parede = mistura(t.ambiente, t.contorno, 0.28);
  const piso = mistura(t.ambiente, t.ambienteClaro, 0.4);
  const luz = mistura(piso, t.frio, 0.58);
  const corRack = mistura(t.ambiente, t.ambienteClaro, 0.2);
  const racks = [
    { x: 430, lado: 'direita' as const },
    { x: 668, lado: 'direita' as const },
    { x: 906, lado: 'direita' as const },
    { x: 1144, lado: 'esquerda' as const },
  ];

  const q1 = pontoParedeEsq(c, 0.18, 0.24);
  const q2 = pontoParedeEsq(c, 0.68, 0.24);
  const q3 = pontoParedeEsq(c, 0.68, 0.7);
  const q4 = pontoParedeEsq(c, 0.18, 0.7);

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambiente, t.contorno, 0.6)}
        parede={parede}
        lateralEsq={mistura(t.ambiente, t.contorno, 0.46)}
        lateralDir={mistura(t.ambiente, t.contorno, 0.52)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* quadro branco vazio na parede esquerda */}
      <polygon
        points={pts(q1[0], q1[1], q2[0], q2[1], q3[0], q3[1], q4[0], q4[1])}
        fill={mistura(t.superficie, t.ambienteClaro, 0.24)}
        stroke={t.contorno}
        strokeWidth={6}
      />
      <polygon
        points={pts(q4[0], q4[1], q3[0], q3[1], q3[0], q3[1] + 26, q4[0], q4[1] + 30)}
        fill={mistura(t.superficieSombra, t.contorno, 0.34)}
        stroke={t.contorno}
        strokeWidth={4}
      />

      {/* racks de servidor ao fundo */}
      {racks.map((r) => (
        <Rack
          key={`rk${r.x}`}
          x={r.x}
          y={214}
          w={210}
          h={404}
          recuo={54}
          lado={r.lado}
          cor={corRack}
          contorno={t.contorno}
          slots={9}
          luz={t.frio}
          luzAlt={t.acento}
        />
      ))}

      {/* penumbra: metade esquerda do quadro abafada */}
      <polygon points={pts(0, 0, 420, 0, 300, ALTURA_VB, 0, ALTURA_VB)} fill={t.contorno} opacity={0.34} />
      <polygon points={pts(0, 620, 380, 620, 200, ALTURA_VB, 0, ALTURA_VB)} fill={t.contorno} opacity={0.2} />

      {/* feixes dos dois monitores: fonte dominante */}
      <polygon points={pts(1180, 640, 1460, 640, 1120, ALTURA_VB, 560, ALTURA_VB)} fill={luz} opacity={0.4} />
      <polygon points={pts(1490, 630, 1770, 630, 1920, ALTURA_VB, 1300, ALTURA_VB)} fill={luz} opacity={0.34} />

      {/* bancada com dois monitores acesos */}
      <Cadeira cx={1050} y={1004} escala={1.02} giro={0.22} cor={mistura(t.ambienteClaro, t.contorno, 0.34)} contorno={t.contorno} tipo="escritorio" />
      <Mesa cx={1450} y={892} largura={700} profundidade={196} conicidade={0.8} espessura={18} altura={188} cor={mistura(t.superficieSombra, t.ambienteClaro, 0.3)} contorno={t.contorno} />
      <Monitor x={1146} y={600} w={296} h={188} aceso cor={mistura(t.ambiente, t.contorno, 0.1)} brilho={t.frio} contorno={t.contorno} />
      <Monitor x={1478} y={586} w={296} h={188} aceso cor={mistura(t.ambiente, t.contorno, 0.1)} brilho={t.frio} contorno={t.contorno} />
    </g>
  );
}

// -------------------------------------------------------------- 5. innovation

/** Cores saturadas nos post-its: docs/prompts.md abre a paleta só aqui. */
const POSTITS = ['#f2c400', '#e8622a', '#e0325f', '#2fa8a0', '#3f7fd6'] as const;

function corPostit(i: number): string {
  return POSTITS[i % POSTITS.length] ?? POSTITS[0];
}

/** Espaço aberto, iluminação ampla, parede de post-its em blocos de cor. */
function Innovation(): ReactElement {
  const t = tons();
  const c = SALA_LARGA;
  const parede = mistura(t.ambienteClaro, t.superficie, 0.44);
  const piso = mistura(t.superficieSombra, t.superficie, 0.38);
  const luz = mistura(piso, t.superficie, 0.55);
  const cortica = t.madeira;

  const blocos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
    const col = i % 4;
    const lin = Math.floor(i / 4);
    return { i, x: 262 + col * 196, y: 190 + lin * 122 };
  });

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambienteClaro, t.superficie, 0.3)}
        parede={parede}
        lateralEsq={mistura(parede, t.contorno, 0.16)}
        lateralDir={mistura(parede, t.contorno, 0.08)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* luz ampla de teto: chapada, sem drama */}
      <g fill={mistura(t.superficie, t.ambienteClaro, 0.1)} stroke={t.contorno} strokeWidth={3}>
        <polygon points={pts(360, 22, 1560, 22, 1450, 70, 470, 70)} />
        <polygon points={pts(600, 82, 1320, 82, 1268, 112, 652, 112)} />
      </g>
      <polygon points={pts(300, 592, 1620, 592, 1920, ALTURA_VB, 0, ALTURA_VB)} fill={luz} opacity={0.4} />

      {/* parede de post-its em blocos de cor */}
      {blocos.map((b) => (
        <g key={`pi${b.i}`} transform={`rotate(${((b.i % 3) - 1) * 3} ${b.x + 78} ${b.y + 46})`}>
          <rect x={b.x} y={b.y} width={76} height={76} fill={corPostit(b.i)} stroke={t.contorno} strokeWidth={4} />
          <rect x={b.x + 84} y={b.y + 8} width={76} height={76} fill={corPostit(b.i + 2)} stroke={t.contorno} strokeWidth={4} />
          <rect x={b.x + 40} y={b.y + 88} width={76} height={76} fill={corPostit(b.i + 4)} stroke={t.contorno} strokeWidth={4} />
        </g>
      ))}

      {/* painel de cortiça */}
      <g>
        <rect x={1200} y={200} width={470} height={310} fill={cortica} stroke={t.contorno} strokeWidth={6} />
        <rect x={1226} y={226} width={418} height={258} fill={mistura(cortica, t.superficie, 0.16)} />
        <g fill={mistura(cortica, t.contorno, 0.4)}>
          <rect x={1266} y={266} width={120} height={80} />
          <rect x={1430} y={296} width={160} height={60} />
          <rect x={1300} y={386} width={200} height={54} />
        </g>
      </g>

      {/* mesas redondas baixas e pufes, deixando o centro livre */}
      <Pufe cx={250} cy={962} rx={92} ry={62} cor={corPostit(3)} contorno={t.contorno} />
      <Pufe cx={700} cy={904} rx={84} ry={56} cor={corPostit(1)} contorno={t.contorno} />
      <Pufe cx={1290} cy={968} rx={94} ry={62} cor={corPostit(4)} contorno={t.contorno} />
      <Pufe cx={1700} cy={886} rx={86} ry={58} cor={corPostit(0)} contorno={t.contorno} />
      <MesaRedonda cx={470} cy={806} rx={208} ry={76} altura={148} cor={t.superficie} contorno={t.contorno} pedestais={1} />
      <MesaRedonda cx={1510} cy={738} rx={176} ry={64} altura={132} cor={t.superficie} contorno={t.contorno} pedestais={1} />
    </g>
  );
}

// ----------------------------------------------------------- 6. sala-reuniões

/**
 * O cenário do Bloco 4. A sala é maior do que precisa ser: fundo recuado, teto
 * alto, piso largo e duas cadeiras afastadas e giradas. O vazio é o assunto.
 */
function SalaReunioes(): ReactElement {
  const t = tons();
  const c = SALA_AMPLA;
  const parede = mistura(t.ambienteClaro, t.superficie, 0.2);
  const piso = mistura(t.superficieEscura, t.ambienteClaro, 0.16);
  const luz = mistura(piso, t.superficie, 0.34);
  const vidro = mistura(t.ambienteClaro, t.frio, 0.42);
  const corCadeira = mistura(t.ambienteClaro, t.contorno, 0.06);

  const trilhos = [0.16, 0.4, 0.64, 0.88];
  const p1 = pontoParedeDir(c, 0.14, 0.2);
  const p2 = pontoParedeDir(c, 0.5, 0.2);
  const p3 = pontoParedeDir(c, 0.5, 0.62);
  const p4 = pontoParedeDir(c, 0.14, 0.62);

  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambienteClaro, t.superficie, 0.08)}
        parede={parede}
        lateralEsq={vidro}
        lateralDir={mistura(parede, t.contorno, 0.18)}
        piso={piso}
        contorno={t.contorno}
      />

      {/* parede de vidro à esquerda: corredor vazio atrás, em duas faixas */}
      <polygon
        points={pts(
          pontoParedeEsq(c, 0, 0.3)[0],
          pontoParedeEsq(c, 0, 0.3)[1],
          pontoParedeEsq(c, 1, 0.3)[0],
          pontoParedeEsq(c, 1, 0.3)[1],
          pontoParedeEsq(c, 1, 0.62)[0],
          pontoParedeEsq(c, 1, 0.62)[1],
          pontoParedeEsq(c, 0, 0.62)[0],
          pontoParedeEsq(c, 0, 0.62)[1],
        )}
        fill={mistura(t.ambienteClaro, t.contorno, 0.32)}
      />
      <polygon
        points={pts(
          pontoParedeEsq(c, 0, 0.62)[0],
          pontoParedeEsq(c, 0, 0.62)[1],
          pontoParedeEsq(c, 1, 0.62)[0],
          pontoParedeEsq(c, 1, 0.62)[1],
          pontoParedeEsq(c, 1, 1)[0],
          pontoParedeEsq(c, 1, 1)[1],
          pontoParedeEsq(c, 0, 1)[0],
          pontoParedeEsq(c, 0, 1)[1],
        )}
        fill={mistura(t.ambiente, t.contorno, 0.2)}
      />
      {trilhos.map((tt) => {
        const a = pontoParedeEsq(c, tt, 0.04);
        const b = pontoParedeEsq(c, tt, 0.98);
        return (
          <line
            key={`mul${tt}`}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke={t.metal}
            strokeWidth={13}
          />
        );
      })}
      <line
        x1={pontoParedeEsq(c, 0.02, 0.26)[0]}
        y1={pontoParedeEsq(c, 0.02, 0.26)[1]}
        x2={pontoParedeEsq(c, 0.98, 0.26)[0]}
        y2={pontoParedeEsq(c, 0.98, 0.26)[1]}
        stroke={t.metal}
        strokeWidth={11}
      />
      <line
        x1={pontoParedeEsq(c, 0.02, 0.62)[0]}
        y1={pontoParedeEsq(c, 0.02, 0.62)[1]}
        x2={pontoParedeEsq(c, 0.98, 0.62)[0]}
        y2={pontoParedeEsq(c, 0.98, 0.62)[1]}
        stroke={mistura(t.metal, t.contorno, 0.25)}
        strokeWidth={11}
      />

      {/* painel acústico na parede direita: ajuda a ler a profundidade */}
      <polygon
        points={pts(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1])}
        fill={mistura(parede, t.contorno, 0.3)}
        stroke={t.contorno}
        strokeWidth={4}
      />

      {/* luz de teto: quatro painéis distribuídos, sem drama */}
      <g fill={mistura(t.superficie, t.ambienteClaro, 0.06)} stroke={t.contorno} strokeWidth={3}>
        <polygon points={pts(540, 0, 900, 0, 880, 30, 574, 30)} />
        <polygon points={pts(1020, 0, 1380, 0, 1346, 30, 1040, 30)} />
        <polygon points={pts(676, 62, 936, 62, 922, 86, 700, 86)} />
        <polygon points={pts(984, 62, 1244, 62, 1220, 86, 998, 86)} />
      </g>
      <polygon points={pts(c.xEsq, c.yPiso, c.xDir, c.yPiso, LARGURA_VB, ALTURA_VB, 0, ALTURA_VB)} fill={luz} opacity={0.3} />

      {/* TV acesa com diagrama de blocos */}
      <TelaDeParede x={770} y={132} w={480} h={276} acesa cor={mistura(t.ambiente, t.contorno, 0.1)} brilho={t.frio} contorno={t.contorno} />

      {/* três cadeiras do lado de lá, ainda encostadas: a base fica visível
          atrás da borda da mesa, senão elas viram caixas flutuando */}
      <Cadeira cx={758} y={552} escala={0.72} giro={0} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />
      <Cadeira cx={960} y={540} escala={0.72} giro={0.06} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />
      <Cadeira cx={1162} y={552} escala={0.72} giro={-0.06} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />

      {/* mesa oval grande */}
      <MesaRedonda cx={960} cy={772} rx={480} ry={132} altura={172} cor={t.superficie} contorno={t.contorno} pedestais={2} />
      <Caneca cx={1252} y={706} escala={0.85} cor={t.superficie} contorno={t.contorno} />

      {/* a sexta cadeira na ponta, e as duas afastadas e giradas */}
      <Cadeira cx={476} y={784} escala={0.88} giro={-0.3} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />
      <Cadeira cx={636} y={982} escala={1} giro={-0.5} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />
      <Cadeira cx={1372} y={942} escala={1} giro={0.54} cor={corCadeira} contorno={t.contorno} tipo="escritorio" />
    </g>
  );
}

// ------------------------------------------------------------------- 7. neutro

/** Nunca devolver buraco: id desconhecido cai numa sala genérica coerente. */
function CenarioNeutro(): ReactElement {
  const t = tons();
  const c = SALA_PADRAO;
  const parede = t.ambienteClaro;
  const piso = mistura(t.superficieEscura, t.ambienteClaro, 0.24);
  return (
    <g>
      <CascaDeSala
        caixa={c}
        teto={mistura(t.ambiente, t.contorno, 0.3)}
        parede={parede}
        lateralEsq={mistura(parede, t.contorno, 0.3)}
        lateralDir={mistura(parede, t.contorno, 0.16)}
        piso={piso}
        contorno={t.contorno}
      />
      <g fill={mistura(t.superficie, t.ambienteClaro, 0.1)} stroke={t.contorno} strokeWidth={3}>
        <polygon points={pts(700, 30, 1220, 30, 1170, 70, 750, 70)} />
      </g>
      <polygon points={pts(760, 80, 1160, 80, 1330, ALTURA_VB, 560, ALTURA_VB)} fill={mistura(piso, t.superficie, 0.4)} opacity={0.34} />
      {/* porta na parede de fundo */}
      <g>
        <rect x={1300} y={244} width={210} height={316} fill={mistura(parede, t.contorno, 0.38)} stroke={t.contorno} strokeWidth={5} />
        <circle cx={1470} cy={404} r={13} fill={t.metal} stroke={t.contorno} strokeWidth={3} />
      </g>
      <Cadeira cx={700} y={706} escala={0.8} giro={0.1} cor={mistura(parede, t.contorno, 0.06)} contorno={t.contorno} tipo="simples" />
      <Mesa cx={720} y={846} largura={560} profundidade={170} conicidade={0.8} espessura={18} altura={184} cor={t.superficie} contorno={t.contorno} />
    </g>
  );
}

// ----------------------------------------------------------------------- mapa

/** Projeção isométrica suave: comprime a vertical e enviesa com a profundidade. */
function projMapa(x: number, y: number): readonly [number, number] {
  return [960 + (x - 960) * 0.9 + (y - 540) * 0.11, 540 + (y - 540) * 0.8];
}

interface PropsBlocoMapa {
  x: number;
  y: number;
  w: number;
  h: number;
  altura: number;
  topo: string;
  contorno: string;
  /** Linhas internas que sugerem subdivisões sem desenhar mobília. */
  divisoes: readonly number[];
}

/** Bloco de ambiente extrudado: duas faces laterais e um topo. */
function BlocoMapa({
  x,
  y,
  w,
  h,
  altura,
  topo,
  contorno,
  divisoes,
}: PropsBlocoMapa): ReactElement {
  const a = projMapa(x, y);
  const b = projMapa(x + w, y);
  const cc = projMapa(x + w, y + h);
  const d = projMapa(x, y + h);
  const sobe = (p: readonly [number, number]): readonly [number, number] => [p[0], p[1] - altura];
  const a2 = sobe(a);
  const b2 = sobe(b);
  const c2 = sobe(cc);
  const d2 = sobe(d);
  const sul = mistura(topo, contorno, 0.55);
  const leste = mistura(topo, contorno, 0.38);
  return (
    <g stroke={contorno} strokeWidth={4}>
      <polygon points={pts(d2[0], d2[1], c2[0], c2[1], cc[0], cc[1], d[0], d[1])} fill={sul} />
      <polygon points={pts(b2[0], b2[1], c2[0], c2[1], cc[0], cc[1], b[0], b[1])} fill={leste} />
      <polygon points={pts(a2[0], a2[1], b2[0], b2[1], c2[0], c2[1], d2[0], d2[1])} fill={topo} />
      {divisoes.map((f) => {
        const s = projMapa(x + w * f, y);
        const e = projMapa(x + w * f, y + h);
        return (
          <line
            key={`dv${f}`}
            x1={s[0]}
            y1={s[1] - altura}
            x2={e[0]}
            y2={e[1] - altura}
            stroke={mistura(topo, contorno, 0.42)}
            strokeWidth={4}
          />
        );
      })}
    </g>
  );
}

// ------------------------------------------------------------------- públicos

function conteudoDoLugar(lugar: string): ReactElement {
  switch (lugar) {
    case 'escritorio':
      return <Escritorio />;
    case 'cafezinho':
      return <Cafezinho />;
    case 'sala-treinamento':
      return <SalaTreinamento />;
    case 'laboratorio':
      return <Laboratorio />;
    case 'innovation':
      return <Innovation />;
    case 'sala-reunioes':
      return <SalaReunioes />;
    default:
      return <CenarioNeutro />;
  }
}

/** Cenário de um lugar. Id desconhecido devolve sala neutra, nunca null. */
export function ArteDeCenario({
  lugar,
  largura = LARGURA_VB,
  altura = ALTURA_VB,
  className,
}: PropsArte & { lugar: string }): ReactElement {
  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${LARGURA_VB} ${ALTURA_VB}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {conteudoDoLugar(lugar)}
    </svg>
  );
}

/**
 * Fundo do mapa: planta baixa em isometria suave, escura e dessaturada.
 * Fica atrás de seis ícones e das linhas âmbar da revelação — por isso nenhum
 * acento, nenhum contraste alto e vinheta em degraus nas bordas.
 */
export function ArteDeMapa({
  largura = LARGURA_VB,
  altura = ALTURA_VB,
  className,
}: PropsArte): ReactElement {
  const t = tons();
  const fundo = mistura(t.ambiente, t.contorno, 0.68);
  const corredor = mistura(t.ambiente, t.contorno, 0.26);
  const laje = mistura(t.ambiente, t.ambienteClaro, 0.34);
  const contorno = mistura(t.contorno, t.ambiente, 0.2);

  // Seis ambientes maiores, com dois blocos de serviço para quebrar a grade.
  const blocos = [
    { x: 150, y: 130, w: 430, h: 330, altura: 30, divisoes: [0.55] },
    { x: 720, y: 160, w: 490, h: 300, altura: 26, divisoes: [0.34, 0.68] },
    { x: 1350, y: 130, w: 440, h: 330, altura: 30, divisoes: [0.5] },
    { x: 150, y: 640, w: 400, h: 300, altura: 34, divisoes: [0.42] },
    { x: 690, y: 660, w: 520, h: 290, altura: 24, divisoes: [0.3, 0.64] },
    { x: 1310, y: 620, w: 480, h: 330, altura: 34, divisoes: [0.58] },
    { x: 150, y: 490, w: 150, h: 90, altura: 20, divisoes: [] },
    { x: 1620, y: 490, w: 170, h: 90, altura: 20, divisoes: [] },
  ];

  const pisoPlanta = [
    projMapa(100, 90),
    projMapa(1840, 90),
    projMapa(1840, 990),
    projMapa(100, 990),
  ];

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${LARGURA_VB} ${ALTURA_VB}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x={0} y={0} width={LARGURA_VB} height={ALTURA_VB} fill={fundo} />

      {/* laje do andar */}
      <polygon
        points={pts(
          pisoPlanta[0]?.[0] ?? 0,
          pisoPlanta[0]?.[1] ?? 0,
          pisoPlanta[1]?.[0] ?? 0,
          pisoPlanta[1]?.[1] ?? 0,
          pisoPlanta[2]?.[0] ?? 0,
          pisoPlanta[2]?.[1] ?? 0,
          pisoPlanta[3]?.[0] ?? 0,
          pisoPlanta[3]?.[1] ?? 0,
        )}
        fill={corredor}
        stroke={contorno}
        strokeWidth={5}
      />

      {/* eixos de corredor, só como sulcos escuros */}
      <g stroke={mistura(corredor, t.contorno, 0.45)} strokeWidth={6}>
        <line
          x1={projMapa(120, 540)[0]}
          y1={projMapa(120, 540)[1]}
          x2={projMapa(1820, 540)[0]}
          y2={projMapa(1820, 540)[1]}
        />
        <line
          x1={projMapa(650, 110)[0]}
          y1={projMapa(650, 110)[1]}
          x2={projMapa(650, 970)[0]}
          y2={projMapa(650, 970)[1]}
        />
        <line
          x1={projMapa(1280, 110)[0]}
          y1={projMapa(1280, 110)[1]}
          x2={projMapa(1280, 970)[0]}
          y2={projMapa(1280, 970)[1]}
        />
      </g>

      {blocos.map((b) => (
        <BlocoMapa
          key={`bl${b.x}-${b.y}`}
          x={b.x}
          y={b.y}
          w={b.w}
          h={b.h}
          altura={b.altura}
          topo={laje}
          contorno={contorno}
          divisoes={b.divisoes}
        />
      ))}

      {/* vinheta em três degraus: nada de gradiente */}
      <g fill={t.contorno} fillRule="evenodd">
        <path d={`M0 0H${LARGURA_VB}V${ALTURA_VB}H0Z M300 190H1620V890H300Z`} opacity={0.3} />
        <path d={`M0 0H${LARGURA_VB}V${ALTURA_VB}H0Z M170 110H1750V970H170Z`} opacity={0.3} />
        <path d={`M0 0H${LARGURA_VB}V${ALTURA_VB}H0Z M60 40H1860V1040H60Z`} opacity={0.4} />
      </g>
    </svg>
  );
}
