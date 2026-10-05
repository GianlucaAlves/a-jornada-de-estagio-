/**
 * Puzzle da FASE 2 — ligar situações a práticas de planejamento e estudo.
 *
 * A MECÂNICA FICOU INTACTA (clique na esquerda, clique na direita, nasce uma
 * linha grossa de alto contraste) porque ela está entre as quatro aprovadas. O
 * que mudou é o que a auditoria mediu que faltava (spec 03 §3 e §4):
 *
 * - PAR ERRADO AVISA. Antes a linha recuava em SILÊNCIO: a tela voltava ao que
 *   era e nada dizia por quê. Ao vivo isso faz o apresentador narrar o próprio
 *   erro. Agora o recuo vem com `def.textoErro` na linha de aviso da moldura.
 * - O CLIQUE MORTO MORREU. A coluna da direita fica `disabled` enquanto nada
 *   está selecionado à esquerda, e o estilo antigo mantinha `cursor: pointer`
 *   nela: quatro alvos com mão que não respondem, no estado INICIAL do puzzle —
 *   o primeiro que a plateia vê. Agora a mão sai por `estiloDeAlvo`.
 *
 * Geometria fixa em px: as âncoras das linhas são calculadas por aritmética, e
 * não medidas do DOM. Medir depende do transform de escala do canvas e é
 * exatamente o tipo de coisa que quebra na projeção.
 *
 * A lógica é um redutor puro, exportado e provado por mutação
 * (`AssociarPares.test.ts`).
 */
import { useEffect, useReducer, useRef, useState } from 'react';

import type { PuzzleAssociar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { cores, duracao, espaco } from '../../styles/tokens';

import {
  ALTURA_CORPO,
  type Aviso,
  avisoDeAcerto,
  avisoDeErro,
  embaralharEstavel,
  estiloCaixaClicavel,
  LARGURA_UTIL,
  MolduraDePuzzle,
  progressoDe,
} from './moldura';

// ---------------------------------------------------------------- geometria

const LARGURA_COLUNA = 640;
const ALTURA_LINHA = 120;
const ESPACO_LINHA = espaco.lg;
const ESQUERDA_X = 0;
const DIREITA_X = 1120;

/** Grossa de propósito: linha fina desaparece na compressão do Teams. */
const ESPESSURA = 8;
/**
 * Espera antes do recuo: a linha errada completa o traçado, a plateia vê a
 * tentativa, e só então ela volta. Não é animação, é tempo de leitura.
 */
const ESPERA_ANTES_DO_RECUO_MS = duracao.curta + 200;
const ESPERA_CONCLUSAO_MS = 1100;

function centroDaLinha(indice: number): number {
  return indice * (ALTURA_LINHA + ESPACO_LINHA) + ALTURA_LINHA / 2;
}

export function geometriaDe(def: PuzzleAssociar): { largura: number; altura: number } {
  const linhas = Math.max(1, def.esquerda.length, def.direita.length);
  return {
    largura: DIREITA_X + LARGURA_COLUNA,
    altura: linhas * ALTURA_LINHA + (linhas - 1) * ESPACO_LINHA,
  };
}

// ---------------------------------------------------------------- regras

export interface EstadoAssociar {
  /** id da esquerda -> id da direita, só os pares CERTOS. */
  ligacoes: Readonly<Record<string, string>>;
  selecionada: string | null;
  /** Par errado em exibição, para a linha aparecer e recuar. */
  erro: { esqId: string; dirId: string } | null;
  aviso: Aviso;
}

export type AcaoAssociar =
  | { tipo: 'clicarEsquerda'; id: string }
  | { tipo: 'clicarDireita'; id: string }
  | { tipo: 'recolherErro' };

export function estadoInicialAssociar(): EstadoAssociar {
  return { ligacoes: {}, selecionada: null, erro: null, aviso: null };
}

export function associarCompleto(def: PuzzleAssociar, estado: EstadoAssociar): boolean {
  const total = Object.keys(def.gabarito).length;
  return total > 0 && Object.keys(estado.ligacoes).length === total;
}

/**
 * O redutor.
 *
 * Enquanto `erro` não é recolhido, clique nenhum entra: a linha errada está
 * atravessando a tela e aceitar outro clique em cima dela produziria duas linhas
 * disputando a mesma âncora. É a única trava, e ela dura o tempo de leitura.
 */
export function reduzirAssociar(
  def: PuzzleAssociar,
  estado: EstadoAssociar,
  acao: AcaoAssociar,
): EstadoAssociar {
  switch (acao.tipo) {
    case 'clicarEsquerda': {
      if (estado.erro !== null) return estado;
      if (estado.ligacoes[acao.id] !== undefined) return estado;
      return {
        ...estado,
        selecionada: estado.selecionada === acao.id ? null : acao.id,
        aviso: null,
      };
    }

    case 'clicarDireita': {
      if (estado.erro !== null) return estado;
      const esqId = estado.selecionada;
      if (esqId === null) return estado;
      if (Object.values(estado.ligacoes).includes(acao.id)) return estado;

      if (def.gabarito[esqId] !== acao.id) {
        // O par errado: a linha nasce, o aviso aparece, e o componente agenda o
        // recuo. Nada no estado de acerto muda — errar não custa progresso.
        return {
          ...estado,
          erro: { esqId, dirId: acao.id },
          aviso: avisoDeErro(def.textoErro),
        };
      }

      const ligacoes = { ...estado.ligacoes, [esqId]: acao.id };
      const completo = Object.keys(ligacoes).length === Object.keys(def.gabarito).length;
      return {
        ligacoes,
        selecionada: null,
        erro: null,
        aviso: completo ? avisoDeAcerto() : null,
      };
    }

    case 'recolherErro':
      // O AVISO FICA. Só a linha recua: o texto some no próximo clique, porque
      // quem errou precisa de tempo para ler, e a linha já disse o resto.
      return estado.erro === null ? estado : { ...estado, erro: null, selecionada: null };

    default: {
      const naoTratado: never = acao;
      return naoTratado;
    }
  }
}

// ---------------------------------------------------------------- traço

interface Traco {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function Linha({ traco, recuando }: { traco: Traco; recuando: boolean }): JSX.Element {
  const comprimento = Math.hypot(traco.x2 - traco.x1, traco.y2 - traco.y1);
  const [desenhada, setDesenhada] = useState(false);

  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setDesenhada(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  return (
    <line
      x1={traco.x1}
      y1={traco.y1}
      x2={traco.x2}
      y2={traco.y2}
      // A linha errada é LARANJA e a certa é amarela. A cor chega antes do
      // texto na compressão de vídeo: quem está no fundo da sala já sabe.
      stroke={recuando ? cores.atencao : cores.destaque}
      strokeWidth={ESPESSURA}
      strokeLinecap="round"
      strokeDasharray={comprimento}
      strokeDashoffset={desenhada && !recuando ? 0 : comprimento}
      style={{ transition: `stroke-dashoffset ${duracao.curta}ms ease-out` }}
    />
  );
}

// ---------------------------------------------------------------- componente

export interface AssociarParesProps {
  def: PuzzleAssociar;
}

export function AssociarPares({ def }: AssociarParesProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [estado, despachar] = useReducer(
    (atual: EstadoAssociar, acao: AcaoAssociar) => reduzirAssociar(def, atual, acao),
    undefined,
    estadoInicialAssociar,
  );
  const [direita] = useState(() => embaralharEstavel(def.direita));
  const [recuando, setRecuando] = useState(false);
  const temporizadores = useRef<number[]>([]);

  const total = Object.keys(def.gabarito).length;
  const feitas = Object.keys(estado.ligacoes).length;
  const completo = associarCompleto(def, estado);
  const geometria = geometriaDe(def);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('associar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  // O recuo em dois tempos: a linha completa o traçado, inverte, e só então o
  // estado volta. Fica no componente porque é tempo de tela, não regra.
  useEffect(() => {
    if (estado.erro === null) {
      setRecuando(false);
      return undefined;
    }
    const idRecuar = window.setTimeout(() => setRecuando(true), ESPERA_ANTES_DO_RECUO_MS);
    const idLimpar = window.setTimeout(
      () => despachar({ tipo: 'recolherErro' }),
      ESPERA_ANTES_DO_RECUO_MS + duracao.curta,
    );
    temporizadores.current.push(idRecuar, idLimpar);
    return () => {
      window.clearTimeout(idRecuar);
      window.clearTimeout(idLimpar);
    };
  }, [estado.erro]);

  function tracoEntre(esqId: string, dirId: string): Traco | null {
    const iEsq = def.esquerda.findIndex((item) => item.id === esqId);
    const iDir = direita.findIndex((item) => item.id === dirId);
    if (iEsq < 0 || iDir < 0) return null;
    return {
      x1: ESQUERDA_X + LARGURA_COLUNA,
      y1: centroDaLinha(iEsq),
      x2: DIREITA_X,
      y2: centroDaLinha(iDir),
    };
  }

  const tracoDoErro = estado.erro ? tracoEntre(estado.erro.esqId, estado.erro.dirId) : null;

  return (
    <MolduraDePuzzle
      rotulo={def.rotulo}
      instrucao={def.instrucao}
      progresso={progressoDe(feitas, total)}
      aviso={estado.aviso}
    >
      <div
        style={{
          position: 'relative',
          width: geometria.largura,
          height: geometria.altura,
          maxWidth: LARGURA_UTIL,
          maxHeight: ALTURA_CORPO,
        }}
      >
        <svg
          aria-hidden="true"
          width={geometria.largura}
          height={geometria.altura}
          viewBox={`0 0 ${geometria.largura} ${geometria.altura}`}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        >
          {Object.entries(estado.ligacoes).map(([esqId, dirId]) => {
            const traco = tracoEntre(esqId, dirId);
            return traco ? (
              <Linha key={`${esqId}->${dirId}`} traco={traco} recuando={false} />
            ) : null;
          })}

          {estado.erro && tracoDoErro ? (
            <Linha
              key={`erro-${estado.erro.esqId}-${estado.erro.dirId}`}
              traco={tracoDoErro}
              recuando={recuando}
            />
          ) : null}
        </svg>

        {def.esquerda.map((item, indice) => {
          const ligado = estado.ligacoes[item.id] !== undefined;
          const selecionado = estado.selecionada === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="jogo-botao-nu"
              aria-label={`Situação: ${item.texto}${ligado ? ' (já ligada)' : ''}`}
              aria-pressed={selecionado}
              disabled={ligado}
              onClick={() => despachar({ tipo: 'clicarEsquerda', id: item.id })}
              style={{
                ...estiloCaixaClicavel({
                  largura: LARGURA_COLUNA,
                  altura: ALTURA_LINHA,
                  aceso: ligado,
                  selecionado,
                  habilitado: !ligado,
                }),
                position: 'absolute',
                left: ESQUERDA_X,
                top: indice * (ALTURA_LINHA + ESPACO_LINHA),
              }}
            >
              {item.texto}
            </button>
          );
        })}

        {direita.map((item, indice) => {
          const ligado = Object.values(estado.ligacoes).includes(item.id);
          // A coluna da direita só responde com algo escolhido à esquerda. Este
          // era o clique morto com mão: quatro alvos assim no estado inicial.
          const habilitado = !ligado && estado.selecionada !== null && estado.erro === null;
          return (
            <button
              key={item.id}
              type="button"
              className="jogo-botao-nu"
              aria-label={`Prática: ${item.texto}${ligado ? ' (já ligada)' : ''}`}
              disabled={!habilitado}
              onClick={() => despachar({ tipo: 'clicarDireita', id: item.id })}
              style={{
                ...estiloCaixaClicavel({
                  largura: LARGURA_COLUNA,
                  altura: ALTURA_LINHA,
                  aceso: ligado,
                  selecionado: habilitado,
                  habilitado,
                }),
                position: 'absolute',
                left: DIREITA_X,
                top: indice * (ALTURA_LINHA + ESPACO_LINHA),
              }}
            >
              {item.texto}
            </button>
          );
        })}
      </div>
    </MolduraDePuzzle>
  );
}

export default AssociarPares;
