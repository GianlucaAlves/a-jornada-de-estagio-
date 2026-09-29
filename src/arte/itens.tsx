/**
 * Ícones de item — arte vetorial desenhada em código.
 *
 * Oito objetos, um por `ItemId`, cada um em viewBox 256x256: objeto isolado,
 * centralizado, vista levemente de cima a três quartos, sombra sólida elíptica
 * embaixo. Fonte de verdade da descrição de cada objeto: docs/prompts.md,
 * seção "Itens — 8 ícones".
 *
 * Restrições do estilo (docs/prompts.md, PREÂMBULO) aplicadas aqui:
 * - No máximo 2 tons por superfície, em degrau. Zero <linearGradient>,
 *   zero <filter>: a compressão do Teams come transição sutil.
 * - Contorno de 3 a 5 px de canvas. Linha de 1px desaparece no vídeo.
 * - "Texto" é sempre bloco ou traço cinza ILEGÍVEL. Nunca letra de verdade.
 *
 * ⚠️ `cartao-rafael`, `certificado-degree` e `cracha-innovation` são os itens
 * TARDIOS da narrativa. Eles usam exatamente o mesmo enquadramento, a mesma
 * sombra, a mesma iluminação e o mesmo nível de detalhe dos cinco imediatos.
 * Nenhum brilho, nenhuma aura, nenhum acento reservado, nenhuma moldura
 * diferente: qualquer distinção visual entregaria o clímax do Bloco 5 quarenta
 * minutos antes dele acontecer. Ao mexer neste arquivo, mexa nos oito juntos.
 *
 * NOTA DE IMPORTAÇÃO: `./index` importa este módulo, então a referência é
 * circular. Por isso `PALETA` só é lida DENTRO de função (ver `tintas()`) e
 * nunca no corpo do módulo — leitura no topo cairia na TDZ de `PALETA`.
 */
import type { ReactElement } from 'react';

import { PALETA } from './paleta';
import type { PropsArte } from './paleta';

/** Lado do quadro de canvas. Todo ícone é desenhado neste sistema. */
const LADO = 256;

/** Espessuras de contorno permitidas. Piso de 3: 1px não sobrevive ao Teams. */
const TRACO = {
  fino: 3,
  medio: 4,
  grosso: 5,
} as const;

/** Sombra de chão. Idêntica nos oito ícones — é o que trava o enquadramento. */
const SOMBRA = {
  cx: 128,
  cy: 214,
  rx: 76,
  ry: 12,
} as const;

/** Papéis de cor deste módulo, todos vindos da PALETA única. */
interface Tintas {
  contorno: string;
  papel: string;
  papelSombra: string;
  postit: string;
  postitSombra: string;
  capa: string;
  capaSombra: string;
  cordao: string;
  /** Bloco/traço que representa texto impresso. Nunca é texto. */
  rabisco: string;
  /** Caneta: rabisco manuscrito sobre papel. */
  tinta: string;
  acento: string;
  sombra: string;
}

/**
 * Resolve os papéis de cor. É função (e não const de módulo) de propósito:
 * ver a NOTA DE IMPORTAÇÃO no topo do arquivo.
 */
function tintas(): Tintas {
  return {
    contorno: PALETA.contorno,
    papel: PALETA.superficie,
    papelSombra: PALETA.superficieSombra,
    postit: PALETA.acento,
    postitSombra: PALETA.acentoSombra,
    capa: PALETA.ambienteClaro,
    capaSombra: PALETA.ambiente,
    cordao: PALETA.ambienteClaro,
    rabisco: PALETA.ambienteClaro,
    tinta: PALETA.ambiente,
    acento: PALETA.acento,
    sombra: PALETA.ambienteClaro,
  };
}

// ---------------------------------------------------------------- imediatos

/** Post-it amarelo amassado: três blocos de rabisco separados por dois hífens. */
function iconeSenha(t: Tintas): ReactElement {
  // Base mais larga que o topo: é o que dá a leitura de "visto de cima".
  // Borda de baixo ondulada: papel colado sempre levanta na ponta.
  const corpo = 'M 56 58 L 198 48 L 210 172 C 172 190 106 168 58 188 Z';
  return (
    <g>
      <path d={corpo} fill={t.postit} stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Segundo tom, em degrau: faixa levantada de baixo. */}
      <path
        d="M 57 164 L 209 149 L 210 172 C 172 190 106 168 58 188 Z"
        fill={t.postitSombra}
      />
      {/* Facetas do amassado: plano em degrau, não risco. */}
      <path d="M 56 58 L 98 55 L 64 106 Z" fill={t.postitSombra} />
      <path d="M 198 48 L 208 100 L 172 60 Z" fill={t.postitSombra} />
      <path d={corpo} fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* bloco -- bloco -- bloco. Ilegível de propósito. */}
      <g fill="none" stroke={t.rabisco}>
        <path d="M 74 127 L 100 125" strokeWidth={12} />
        <path d="M 108 124 L 114 124" strokeWidth={5} />
        <path d="M 122 123 L 148 121" strokeWidth={12} />
        <path d="M 156 120 L 162 120" strokeWidth={5} />
        <path d="M 170 119 L 196 117" strokeWidth={12} />
      </g>
    </g>
  );
}

/** Guardanapo de papel dobrado, enrugado, três linhas de rabisco a caneta. */
function iconeGuardanapo(t: Tintas): ReactElement {
  // Bordas em curva: papel macio não tem aresta reta.
  const corpo = 'M 48 70 Q 128 58 204 56 L 212 178 Q 130 192 44 188 Z';
  return (
    <g>
      <path d={corpo} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Metade de baixo da dobra: segundo tom. */}
      <path d="M 46 152 L 211 143 L 212 178 Q 130 192 44 188 Z" fill={t.papelSombra} />
      <path d="M 46 152 L 211 143" fill="none" stroke={t.contorno} strokeWidth={TRACO.fino} />
      {/* Vinco da segunda dobra. O rabisco passa por cima. */}
      <path d="M 128 62 L 130 150" fill="none" stroke={t.papelSombra} strokeWidth={TRACO.fino} />
      {/* Canto dobrado. */}
      <path
        d="M 172 57 L 204 56 L 196 90 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      <path d={corpo} fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Três linhas de caneta. Ondulação = letra, sem virar letra. */}
      <g fill="none" stroke={t.tinta} strokeWidth={6}>
        <path d="M 70 94 q 22 -9 44 1 t 44 -3" />
        <path d="M 70 116 q 20 -8 40 1 t 40 -2" />
        <path d="M 70 138 q 18 -8 36 1" />
      </g>
    </g>
  );
}

/** Caderno de capa dura cinza-azulada, aberto: rabiscos à esquerda, diagrama à direita. */
function iconeCaderno(t: Tintas): ReactElement {
  const capa =
    'M 128 100 C 106 84 60 78 20 88 L 14 188 C 56 178 106 184 128 200 C 150 184 200 178 242 188 L 236 88 C 196 78 150 84 128 100 Z';
  const paginaEsq = 'M 126 108 C 106 95 68 90 32 97 L 26 178 C 62 171 104 176 126 190 Z';
  const paginaDir = 'M 130 108 C 150 95 188 90 224 97 L 230 178 C 194 171 152 176 130 190 Z';
  return (
    <g>
      <path d={capa} fill={t.capa} stroke={t.contorno} strokeWidth={TRACO.grosso} />
      {/* Espessura do miolo: o maço de folhas embaixo de cada página. */}
      <path
        d="M 26 178 C 62 171 104 176 126 190 L 126 196 C 104 182 62 177 26 184 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      <path
        d="M 230 178 C 194 171 152 176 130 190 L 130 196 C 152 182 194 177 230 184 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      <path d={paginaEsq} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      <path d={paginaDir} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Lombada. */}
      <path
        d="M 121 102 L 135 102 L 133 198 L 123 198 Z"
        fill={t.capaSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      {/* Página esquerda: letra apressada. */}
      <g fill="none" stroke={t.rabisco} strokeWidth={5}>
        <path d="M 42 126 q 18 -6 34 -1 t 34 -3" />
        <path d="M 42 146 q 18 -6 34 -1 t 32 -3" />
        <path d="M 42 164 q 16 -6 30 -1 t 28 -3" />
      </g>
      {/* Página direita: duas caixas ligadas por seta grossa. */}
      <g>
        <rect
          x={144}
          y={106}
          width={58}
          height={24}
          rx={3}
          fill={t.papelSombra}
          stroke={t.contorno}
          strokeWidth={TRACO.fino}
        />
        <rect
          x={144}
          y={150}
          width={58}
          height={24}
          rx={3}
          fill={t.papelSombra}
          stroke={t.contorno}
          strokeWidth={TRACO.fino}
        />
        <path d="M 173 130 L 173 144" fill="none" stroke={t.rabisco} strokeWidth={7} />
        <path d="M 173 152 L 165 141 L 181 141 Z" fill={t.rabisco} />
      </g>
    </g>
  );
}

/** Maço de cinco folhas A4 grampeado no canto, em leque. */
function iconeRelatorio(t: Tintas): ReactElement {
  // Todas as folhas giram em torno do grampo: é ele que segura o leque.
  const grampo = '78 54';
  const folha = { x: 70, y: 46, largura: 106, altura: 140 } as const;
  const deBaixo = (angulo: number): ReactElement => (
    <g transform={`rotate(${angulo} ${grampo})`}>
      <rect
        x={folha.x}
        y={folha.y}
        width={folha.largura}
        height={folha.altura}
        rx={4}
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
    </g>
  );
  return (
    <g>
      {deBaixo(8)}
      {deBaixo(4)}
      {deBaixo(-5)}
      {deBaixo(-2)}
      {/* Folha de cima: a única com conteúdo. */}
      <rect
        x={folha.x}
        y={folha.y}
        width={folha.largura}
        height={folha.altura}
        rx={4}
        fill={t.papel}
        stroke={t.contorno}
        strokeWidth={TRACO.medio}
      />
      <g fill={t.rabisco}>
        <rect x={84} y={68} width={64} height={10} />
        <rect x={84} y={88} width={76} height={6} />
        <rect x={84} y={100} width={70} height={6} />
        <rect x={84} y={112} width={76} height={6} />
      </g>
      {/* Gráfico de linha simples. */}
      <path d="M 86 128 L 86 168 L 160 168" fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      <path
        d="M 92 160 L 110 146 L 128 152 L 146 132 L 158 136"
        fill="none"
        stroke={t.rabisco}
        strokeWidth={5}
      />
      {/* Grampo, por cima de tudo. */}
      <g transform="rotate(-45 84 60)">
        <rect
          x={74}
          y={56}
          width={20}
          height={7}
          rx={2}
          fill={t.capaSombra}
          stroke={t.contorno}
          strokeWidth={TRACO.fino}
        />
      </g>
    </g>
  );
}

/** Quatro blocos encaixados, conectados por linhas grossas com acento âmbar. */
function iconeProjeto(t: Tintas): ReactElement {
  const bloco = (x: number, y: number): ReactElement => {
    const largura = 62;
    const altura = 46;
    return (
      <g>
        {/* Profundidade: mesma forma deslocada, um tom abaixo. */}
        <rect x={x + 7} y={y + 7} width={largura} height={altura} rx={5} fill={t.capaSombra} />
        <rect
          x={x}
          y={y}
          width={largura}
          height={altura}
          rx={5}
          fill={t.papel}
          stroke={t.contorno}
          strokeWidth={TRACO.medio}
        />
        <rect x={x + 3} y={y + altura - 15} width={largura - 6} height={11} fill={t.papelSombra} />
        {/* Rótulo do módulo, ilegível como todo "texto" desta camada. */}
        <rect x={x + 16} y={y + 13} width={largura - 32} height={8} fill={t.rabisco} />
        <rect
          x={x}
          y={y}
          width={largura}
          height={altura}
          rx={5}
          fill="none"
          stroke={t.contorno}
          strokeWidth={TRACO.medio}
        />
      </g>
    );
  };
  // Anel fechado: a estrutura é simétrica e completa, e isso é o assunto.
  const conectores = 'M 98 79 L 158 79 M 98 169 L 158 169 M 67 102 L 67 146 M 189 102 L 189 146';
  return (
    <g>
      <path d={conectores} fill="none" stroke={t.contorno} strokeWidth={16} />
      <path d={conectores} fill="none" stroke={t.acento} strokeWidth={9} />
      {bloco(36, 56)}
      {bloco(158, 56)}
      {bloco(36, 146)}
      {bloco(158, 146)}
    </g>
  );
}

// ---------------------------------------------------------------- tardios
//
// Daqui para baixo, mesmo vocabulário visual dos cinco de cima: mesma sombra,
// mesmo papel, mesmos blocos cinza, mesma espessura de contorno. Nada aqui
// pode parecer mais importante — ver o aviso no topo do arquivo.

/** Cartão de visita de pé, levemente inclinado. Dois blocos impressos e um ramal à mão. */
function iconeCartao(t: Tintas): ReactElement {
  const face = 'M 58 74 L 198 74 L 206 168 L 50 168 Z';
  return (
    <g transform="rotate(-5 128 122)">
      {/* Espessura do cartão apoiado. */}
      <path
        d="M 50 168 L 206 168 L 206 180 L 52 180 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      <path d={face} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      <path d="M 53 148 L 203 148 L 206 168 L 50 168 Z" fill={t.papelSombra} />
      <path d={face} fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Vinco da lateral apoiada: dá volume sem mudar a silhueta. */}
      <path d="M 62 80 L 56 162" fill="none" stroke={t.papelSombra} strokeWidth={TRACO.fino} />
      {/* Nome e cargo impressos. */}
      <g fill={t.rabisco}>
        <rect x={72} y={96} width={92} height={13} />
        <rect x={72} y={120} width={64} height={9} />
      </g>
      {/* Ramal escrito à mão no canto de baixo, sublinhado a caneta. */}
      <g fill="none" stroke={t.tinta} strokeWidth={4}>
        <path d="M 126 154 q 8 -9 16 0 t 15 -2 t 15 3 t 13 -3" />
        <path d="M 128 162 L 182 159" />
      </g>
    </g>
  );
}

/** Folha de certificado com borda fina, canto enrolado e selo circular discreto. */
function iconeCertificado(t: Tintas): ReactElement {
  const folha = 'M 42 60 L 216 60 L 216 142 L 182 182 L 42 182 Z';
  return (
    <g transform="rotate(-3 128 122)">
      <path d={folha} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Degrau na faixa de baixo. */}
      <path d="M 42 172 L 186 172 L 182 182 L 42 182 Z" fill={t.papelSombra} />
      <path d={folha} fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      {/* Canto enrolado. */}
      <path
        d="M 216 142 C 204 150 192 164 182 182 C 204 178 214 162 216 142 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      {/* Borda fina — fina para o objeto, nunca 1px na tela. */}
      <path
        d="M 56 74 L 202 74 L 202 140 L 176 168 L 56 168 Z"
        fill="none"
        stroke={t.rabisco}
        strokeWidth={TRACO.fino}
      />
      <g fill={t.rabisco}>
        <rect x={80} y={88} width={112} height={12} />
        <rect x={88} y={110} width={96} height={7} />
        <rect x={96} y={126} width={80} height={7} />
      </g>
      {/* Selo: dois círculos concêntricos, sem âmbar e sem brilho. */}
      <circle cx={78} cy={148} r={15} fill={t.papelSombra} stroke={t.contorno} strokeWidth={TRACO.medio} />
      <circle cx={78} cy={148} r={8} fill="none" stroke={t.rabisco} strokeWidth={TRACO.fino} />
      {/* Assinatura. */}
      <path d="M 116 152 q 10 -10 20 0 t 18 -2 t 18 3" fill="none" stroke={t.tinta} strokeWidth={4} />
    </g>
  );
}

/** Crachá de participante pendurado num cordão azul escuro que cai torto e enrolado. */
function iconeCracha(t: Tintas): ReactElement {
  // A laçada cai por cima do canto do crachá. É o que torna o cordão legível:
  // fita escura contra papel claro, sem inventar brilho para ele.
  const cordao = 'M 44 38 C 86 30 116 58 98 84 C 78 112 48 94 70 74 C 98 48 122 64 128 88';
  return (
    <g>
      <g transform="rotate(5 128 148)">
        <rect
          x={78}
          y={94}
          width={100}
          height={98}
          rx={6}
          fill={t.papel}
          stroke={t.contorno}
          strokeWidth={TRACO.medio}
        />
        <rect x={81} y={176} width={94} height={13} fill={t.papelSombra} />
        <rect
          x={78}
          y={94}
          width={100}
          height={98}
          rx={6}
          fill="none"
          stroke={t.contorno}
          strokeWidth={TRACO.medio}
        />
        {/* Furo do cordão. */}
        <rect
          x={118}
          y={104}
          width={20}
          height={8}
          rx={4}
          fill={t.capaSombra}
          stroke={t.contorno}
          strokeWidth={TRACO.fino}
        />
        {/* Nome e evento impressos. */}
        <g fill={t.rabisco}>
          <rect x={94} y={128} width={68} height={13} />
          <rect x={94} y={152} width={46} height={9} />
        </g>
      </g>
      <path d={cordao} fill="none" stroke={t.contorno} strokeWidth={21} />
      <path d={cordao} fill="none" stroke={t.cordao} strokeWidth={15} />
      {/* Segundo tom da fita, no meio do vinco. */}
      <path d={cordao} fill="none" stroke={t.papelSombra} strokeWidth={4} />
      {/* Presilha por cima: o cordão passa por dentro dela. */}
      <g transform="rotate(5 128 148)">
        <rect
          x={116}
          y={80}
          width={24}
          height={16}
          rx={3}
          fill={t.papelSombra}
          stroke={t.contorno}
          strokeWidth={TRACO.fino}
        />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------- fallback

/**
 * Objeto neutro para id desconhecido. Existe para que a barra de itens nunca
 * tenha buraco na tela durante uma apresentação ao vivo.
 */
function iconeNeutro(t: Tintas): ReactElement {
  const face = 'M 74 54 L 184 54 L 192 196 L 64 196 Z';
  return (
    <g>
      <path d={face} fill={t.papel} stroke={t.contorno} strokeWidth={TRACO.medio} />
      <path d="M 66 172 L 190 172 L 192 196 L 64 196 Z" fill={t.papelSombra} />
      <path d={face} fill="none" stroke={t.contorno} strokeWidth={TRACO.medio} />
      <path
        d="M 184 54 L 160 54 L 182 82 Z"
        fill={t.papelSombra}
        stroke={t.contorno}
        strokeWidth={TRACO.fino}
      />
      <g fill={t.rabisco}>
        <rect x={88} y={102} width={78} height={11} />
        <rect x={88} y={126} width={62} height={8} />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------- despacho

/** Um switch, não um Record: id desconhecido cai no neutro sem checagem extra. */
function desenhoDoItem(item: string, t: Tintas): ReactElement {
  switch (item) {
    case 'senha':
      return iconeSenha(t);
    case 'indicacao-trilha':
      return iconeGuardanapo(t);
    case 'anotacoes-treinamento':
      return iconeCaderno(t);
    case 'relatorio':
      return iconeRelatorio(t);
    case 'projeto-entregue':
      return iconeProjeto(t);
    case 'cartao-rafael':
      return iconeCartao(t);
    case 'certificado-degree':
      return iconeCertificado(t);
    case 'cracha-innovation':
      return iconeCracha(t);
    default:
      return iconeNeutro(t);
  }
}

/**
 * Ícone de um item. `item` é o id do manifest já sem o prefixo `item-`
 * (ver `ArteDoAsset` em ./index).
 *
 * Decorativo por contrato: quem renderiza já expõe nome e descrição do item em
 * texto, então o SVG fica fora da árvore de acessibilidade.
 */
export function ArteDeItem({
  item,
  largura = LADO,
  altura = LADO,
  className,
}: PropsArte & { item: string }): ReactElement {
  const t = tintas();
  return (
    <svg
      viewBox={`0 0 ${LADO} ${LADO}`}
      width={largura}
      height={altura}
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx={SOMBRA.cx} cy={SOMBRA.cy} rx={SOMBRA.rx} ry={SOMBRA.ry} fill={t.sombra} />
        {desenhoDoItem(item, t)}
      </g>
    </svg>
  );
}

export default ArteDeItem;
