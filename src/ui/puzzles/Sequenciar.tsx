/**
 * Puzzle da FASE 2 — ordenar a semana por impacto no trabalho do time.
 *
 * Veio da fase 3 (ADR-007). O título e as linhas saem do conteúdo: este arquivo
 * tinha "Histórico do erro da madrugada" escrito à mão, que é justamente o
 * vocabulário de nicho que a v2 expurgou (ADR-002).
 *
 * A MECÂNICA FICOU: setas em vez de arrastar. Arrastar ao vivo, num canvas
 * escalado e compartilhado por Teams, é onde a apresentação trava.
 *
 * O QUE MUDOU, e é a mudança mais discutível das cinco: EXISTE UM PASSO DE
 * CONFERIR. Antes o puzzle se resolvia sozinho no instante em que a ordem
 * batia — e por isso não havia momento algum em que se pudesse ERRAR. Sem
 * momento de erro não há como avisar do erro, que é o que o ADR-011 exige, e o
 * próprio conteúdo já assume que ele existe: `textoErro` é "Não é essa a ordem",
 * uma frase que só faz sentido como resposta a alguém que disse "é essa".
 *
 * A alternativa — manter a resolução automática e acrescentar um botão que só
 * produz erro — foi descartada: botão que nunca dá certo é armadilha, e a pessoa
 * aprenderia a não clicar nele.
 *
 * SOBRE O PROGRESSO: a moldura mostra quantas linhas há, não quantas estão no
 * lugar certo. "3 de 5 certas" é um oráculo — com cinco linhas dá para subir o
 * morro por tentativa e acertar sem nunca aplicar o critério, e o critério
 * (primeiro o que destrava o trabalho de outras pessoas) é o assunto da fala da
 * apresentadora. O "onde estou" vem do NÚMERO DE POSIÇÃO em cada linha, que é
 * visível e não revela nada.
 */
import type { CSSProperties } from 'react';
import { useEffect, useReducer } from 'react';

import type { PuzzleSequenciar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import {
  alvo,
  borda,
  cores,
  duracao,
  easing,
  espaco,
  raio,
  tipografia,
} from '../../styles/tokens';

import {
  ALTURA_CORPO,
  type Aviso,
  avisoDeAcerto,
  avisoDeErro,
  estiloDeAlvo,
  LARGURA_UTIL,
  MolduraDePuzzle,
} from './moldura';

// ---------------------------------------------------------------- geometria

const LARGURA = 1600;
const ALTURA_LINHA = 92;
const ESPACO_LINHA = espaco.md;
const LARGURA_POSICAO = 56;
const LARGURA_SETA = alvo.minimo + espaco.sm;
/** Faixa do botão de conferir, embaixo da lista. */
const ALTURA_CONFERIR = alvo.minimo;
/** Segura a lista acesa antes de fechar: é o beat do "era isso mesmo". */
const ESPERA_CONCLUSAO_MS = 1500;

export function geometriaDe(def: PuzzleSequenciar): { largura: number; altura: number } {
  const n = Math.max(1, def.linhas.length);
  return {
    largura: LARGURA,
    // O respiro extra é o gap entre a lista e o botão: ele é altura de verdade,
    // e foi somar errado desse tipo que fez o `Estruturar` estourar o canvas.
    altura: n * ALTURA_LINHA + (n - 1) * ESPACO_LINHA + ESPACO_LINHA + ALTURA_CONFERIR,
  };
}

// ---------------------------------------------------------------- regras

export interface EstadoSequenciar {
  ordem: readonly string[];
  /** 'nao' = ainda não conferiu desde o último movimento. */
  conferencia: 'nao' | 'errada' | 'certa';
  aviso: Aviso;
}

export type AcaoSequenciar =
  | { tipo: 'mover'; indice: number; direcao: -1 | 1 }
  | { tipo: 'conferir' };

export function estadoInicialSequenciar(def: PuzzleSequenciar): EstadoSequenciar {
  // A ordem inicial é a ordem em que o conteúdo declara as linhas — já
  // embaralhada lá, de propósito, porque a ordem de exibição não pode ser a
  // resposta. Não reembaralho aqui: a ordem declarada é escolha do autor do
  // texto, e reembaralhar tiraria dele o controle de qual erro é o mais tentador.
  return { ordem: def.linhas.map((l) => l.id), conferencia: 'nao', aviso: null };
}

export function naOrdemCerta(def: PuzzleSequenciar, ordem: readonly string[]): boolean {
  return (
    ordem.length === def.ordemCorreta.length &&
    ordem.every((id, i) => id === def.ordemCorreta[i])
  );
}

/**
 * O redutor.
 *
 * Mover depois de conferir CERTO não faz nada: a lista está acesa e o puzzle
 * está fechando. Sem esta trava, uma seta clicada durante a animação de fecho
 * desmontaria a resposta na frente da plateia.
 */
export function reduzirSequenciar(
  def: PuzzleSequenciar,
  estado: EstadoSequenciar,
  acao: AcaoSequenciar,
): EstadoSequenciar {
  switch (acao.tipo) {
    case 'mover': {
      if (estado.conferencia === 'certa') return estado;
      const destino = acao.indice + acao.direcao;
      if (destino < 0 || destino >= estado.ordem.length) return estado;
      const copia = [...estado.ordem];
      const a = copia[acao.indice];
      const b = copia[destino];
      if (a === undefined || b === undefined) return estado;
      copia[acao.indice] = b;
      copia[destino] = a;
      // Mexeu: a conferência anterior não vale mais, e o aviso sai da tela.
      // Deixar "Não é essa a ordem" pendurado enquanto a pessoa mexe faria o
      // aviso parecer resposta ao movimento novo.
      return { ordem: copia, conferencia: 'nao', aviso: null };
    }

    case 'conferir': {
      if (estado.conferencia === 'certa') return estado;
      if (naOrdemCerta(def, estado.ordem)) {
        return { ...estado, conferencia: 'certa', aviso: avisoDeAcerto() };
      }
      return { ...estado, conferencia: 'errada', aviso: avisoDeErro(def.textoErro) };
    }

    default: {
      const naoTratado: never = acao;
      return naoTratado;
    }
  }
}

// ---------------------------------------------------------------- componente

export interface SequenciarProps {
  def: PuzzleSequenciar;
}

export function Sequenciar({ def }: SequenciarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [estado, despachar] = useReducer(
    (atual: EstadoSequenciar, acao: AcaoSequenciar) => reduzirSequenciar(def, atual, acao),
    def,
    estadoInicialSequenciar,
  );

  const resolvido = estado.conferencia === 'certa';
  const geometria = geometriaDe(def);

  useEffect(() => {
    if (!resolvido) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('sequenciar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [resolvido, resolverPuzzle]);

  const textoPorId = new Map(def.linhas.map((l) => [l.id, l.texto]));

  return (
    <MolduraDePuzzle
      rotulo={def.rotulo}
      instrucao={def.instrucao}
      // Quantas linhas, não quantas certas. Ver o cabeçalho deste arquivo.
      progresso={`${def.linhas.length} linhas`}
      aviso={estado.aviso}
    >
      <div
        style={{
          width: geometria.largura,
          maxWidth: LARGURA_UTIL,
          height: geometria.altura,
          maxHeight: ALTURA_CORPO,
          display: 'flex',
          flexDirection: 'column',
          gap: ESPACO_LINHA,
        }}
      >
        <ol
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: ESPACO_LINHA,
          }}
        >
          {estado.ordem.map((id, indice) => {
            const texto = textoPorId.get(id) ?? id;
            // Tudo acende junto quando a ordem é conferida e está certa. Antes
            // só as duas últimas acendiam, porque o conteúdo era causa e
            // consequência de um erro; o conteúdo novo é uma semana, e numa
            // semana priorizada não há duas linhas mais importantes que as
            // outras — a ordem inteira é a resposta.
            const acesa = resolvido;
            return (
              <li
                key={id}
                style={{
                  height: ALTURA_LINHA,
                  display: 'flex',
                  alignItems: 'center',
                  gap: espaco.md,
                  padding: `0 ${espaco.md}px 0 ${espaco.lg}px`,
                  textAlign: 'left',
                  fontSize: tipografia.tamanhos.corpo,
                  fontWeight: tipografia.pesos.forte,
                  lineHeight: tipografia.alturaLinha.compacta,
                  color: acesa ? cores.textoInverso : cores.texto,
                  background: acesa ? cores.destaque : cores.caixa,
                  border: `${acesa ? borda.grossa : borda.media}px solid ${
                    acesa ? cores.destaque : cores.contorno
                  }`,
                  borderRadius: raio.md,
                  transition: `background ${duracao.media}ms ${easing.suave}, color ${duracao.media}ms ${easing.suave}, border-color ${duracao.media}ms ${easing.suave}`,
                }}
              >
                {/* O NÚMERO DE POSIÇÃO é o indicador de "onde estou" deste
                    puzzle: diz em que lugar a linha está sem dizer se está
                    certa. É o que substitui o "2 de 4" dos outros quatro. */}
                <span
                  aria-hidden="true"
                  style={{
                    flex: '0 0 auto',
                    width: LARGURA_POSICAO,
                    fontSize: tipografia.tamanhos.rotulo,
                    fontWeight: tipografia.pesos.maximo,
                    color: acesa ? cores.textoInverso : cores.destaque,
                  }}
                >
                  {indice + 1}
                </span>

                <span style={{ flex: '1 1 auto' }}>{texto}</span>

                <span style={{ flex: '0 0 auto', display: 'flex', gap: espaco.sm }}>
                  <BotaoDeSeta
                    rotulo={`Mover para a posição ${indice} : ${texto}`}
                    seta="▲"
                    acesa={acesa}
                    habilitado={indice > 0 && !resolvido}
                    aoClicar={() => despachar({ tipo: 'mover', indice, direcao: -1 })}
                  />
                  <BotaoDeSeta
                    rotulo={`Mover para a posição ${indice + 2} : ${texto}`}
                    seta="▼"
                    acesa={acesa}
                    habilitado={indice < estado.ordem.length - 1 && !resolvido}
                    aoClicar={() => despachar({ tipo: 'mover', indice, direcao: 1 })}
                  />
                </span>
              </li>
            );
          })}
        </ol>

        <div
          style={{
            height: ALTURA_CONFERIR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            className="jogo-botao"
            aria-label="Conferir a ordem"
            disabled={resolvido}
            onClick={() => despachar({ tipo: 'conferir' })}
            style={{
              ...estiloDeAlvo(!resolvido),
              minWidth: 360,
              minHeight: alvo.minimo,
              opacity: resolvido ? 0.4 : 1,
              transition: `opacity ${duracao.curta}ms ${easing.suave}`,
            }}
          >
            Conferir a ordem
          </button>
        </div>
      </div>
    </MolduraDePuzzle>
  );
}

/** Extraído para que a regra do cursor valha nas duas setas sem repetição. */
function BotaoDeSeta({
  rotulo,
  seta,
  acesa,
  habilitado,
  aoClicar,
}: {
  rotulo: string;
  seta: string;
  acesa: boolean;
  habilitado: boolean;
  aoClicar: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={!habilitado}
      onClick={aoClicar}
      style={estiloSeta(acesa, habilitado)}
    >
      <span aria-hidden="true">{seta}</span>
    </button>
  );
}

/**
 * ESTE ERA O CLIQUE MORTO MAIS SORRATEIRO DOS TRÊS: o estilo antigo não declarava
 * cursor nenhum, então as setas herdavam `button { cursor: pointer }` do
 * `global.css` — inclusive as duas que estão sempre `disabled` (a de subir da
 * primeira linha e a de descer da última). Não havia `cursor: pointer` escrito em
 * lugar nenhum para achar por busca; a mão vinha de fora do arquivo.
 */
function estiloSeta(acesa: boolean, habilitado: boolean): CSSProperties {
  return {
    ...estiloDeAlvo(habilitado),
    width: LARGURA_SETA,
    height: alvo.minimo,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tipografia.tamanhos.rotulo,
    lineHeight: tipografia.alturaLinha.compacta,
    color: acesa ? cores.textoInverso : cores.texto,
    background: 'transparent',
    border: `${borda.media}px solid ${acesa ? cores.textoInverso : cores.contorno}`,
    borderRadius: raio.sm,
    opacity: habilitado ? 1 : 0.35,
  };
}

export default Sequenciar;
