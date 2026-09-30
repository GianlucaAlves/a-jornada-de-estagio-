/**
 * Puzzle da FASE 3 — a proposta dela, em três campos.
 *
 * A MECÂNICA FICOU: escolher um trecho e colocar no campo, que é a mesma
 * gramática do "usar item em alvo" do resto do jogo. E OS DOIS DISTRATORES
 * FICAM: estruturar é ESCOLHER, não preencher, e as duas frases que não entram
 * em lugar nenhum são verdadeiras — é exatamente por isso que enganam.
 *
 * O que a auditoria mediu e foi consertado aqui:
 *
 * - TRECHO NO CAMPO ERRADO AVISA. Antes o campo SACUDIA em silêncio. A sacudida
 *   sozinha é ambígua: numa tela comprimida ela lê como falha de render, e a
 *   pessoa não sabe se o clique não pegou ou se a resposta estava errada. Agora
 *   a sacudida vem com `def.textoErro`. O distrator continua com o texto próprio
 *   dele, que é outra coisa: "isso é verdade, mas ninguém consegue fazer nada
 *   com isso" não é um erro de encaixe, é o assunto do puzzle.
 * - O CLIQUE MORTO MORREU. Os três campos ficam `disabled` enquanto nada está
 *   escolhido, e o estilo antigo mantinha `cursor: pointer` neles — três alvos
 *   com mão que não respondem no estado inicial.
 * - A ALTURA FOI MEDIDA. A auditoria calculou ~954px contra 952 úteis, e o
 *   estouro era real: `ALTURA_FRAGMENTO` era `minHeight`, então cada trecho que
 *   quebrasse em duas linhas crescia sem ninguém somar. Agora a altura de cada
 *   faixa é fixa, `geometriaDe` soma tudo, e `puzzles.tela.test.ts` cobra o
 *   total contra o orçamento da moldura.
 */
import { useEffect, useReducer } from 'react';

import type { PuzzleEstruturar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { cores, duracao, easing, espaco, tipografia } from '../../styles/tokens';

import {
  ALTURA_CORPO,
  type Aviso,
  avisoDeAcerto,
  avisoDeErro,
  estiloCaixaClicavel,
  estiloRotuloDeCampo,
  LARGURA_UTIL,
  MolduraDePuzzle,
  progressoDe,
} from './moldura';

// ---------------------------------------------------------------- geometria

const LARGURA_TRECHOS = 860;
const LARGURA_CAMPOS = 700;
const ESPACO_COLUNAS = espaco.xxl;
const ALTURA_TRECHO = 104;
const ESPACO_TRECHO = espaco.sm;
const ALTURA_CAMPO = 120;
const ESPACO_CAMPO = espaco.lg;
const ALTURA_ROTULO = Math.ceil(
  tipografia.tamanhos.corpo * tipografia.alturaLinha.compacta,
);
/** Faixa do cabeçalho de coluna. */
const ALTURA_CABECA = ALTURA_ROTULO + espaco.sm;

const ESPERA_CONCLUSAO_MS = 1200;
/** Tempo da sacudida. Curto: é um susto, não uma animação. */
const ESPERA_SACUDIDA_MS = duracao.curta;

const CSS = `
@keyframes pz-est-sacudir {
  0% { transform: translateX(0); }
  25% { transform: translateX(-16px); }
  50% { transform: translateX(16px); }
  75% { transform: translateX(-8px); }
  100% { transform: translateX(0); }
}
.pz-est-sacudir { animation: pz-est-sacudir ${duracao.curta}ms ${easing.suave} 1; }
`;

export function geometriaDe(def: PuzzleEstruturar): { largura: number; altura: number } {
  const trechos = Math.max(1, def.fragmentos.length);
  const campos = Math.max(1, def.campos.length);
  const colunaTrechos = trechos * ALTURA_TRECHO + (trechos - 1) * ESPACO_TRECHO;
  const colunaCampos =
    campos * (ALTURA_ROTULO + espaco.xs + ALTURA_CAMPO) + (campos - 1) * ESPACO_CAMPO;
  return {
    largura: LARGURA_TRECHOS + ESPACO_COLUNAS + LARGURA_CAMPOS,
    altura: ALTURA_CABECA + Math.max(colunaTrechos, colunaCampos),
  };
}

// ---------------------------------------------------------------- regras

export interface EstadoEstruturar {
  /** campoId -> fragmentoId */
  colocados: Readonly<Record<string, string>>;
  selecionado: string | null;
  aviso: Aviso;
  /** Campo que acabou de recusar, para sacudir junto com o texto. */
  sacudindo: string | null;
}

export type AcaoEstruturar =
  | { tipo: 'clicarTrecho'; id: string }
  | { tipo: 'clicarCampo'; id: string }
  | { tipo: 'pararSacudida' };

export function estadoInicialEstruturar(): EstadoEstruturar {
  return { colocados: {}, selecionado: null, aviso: null, sacudindo: null };
}

export function estruturarCompleto(
  def: PuzzleEstruturar,
  estado: EstadoEstruturar,
): boolean {
  return def.campos.length > 0 && Object.keys(estado.colocados).length === def.campos.length;
}

/**
 * O redutor. Três respostas possíveis a um encaixe, e só uma é silenciosa:
 *
 * - DISTRATOR (`campo: null`): `textoDistrator`. É o assunto do puzzle, não um
 *   erro de pontaria, e por isso tem texto próprio. A seleção é solta — o
 *   distrator não vai entrar em lugar nenhum, e manter a frase na mão faria a
 *   pessoa procurar a casa dela.
 * - CAMPO ERRADO: `textoErro` e sacudida. A seleção PERMANECE, porque o trecho
 *   tem casa e quem errou só errou a casa.
 * - CERTO: encaixa.
 */
export function reduzirEstruturar(
  def: PuzzleEstruturar,
  estado: EstadoEstruturar,
  acao: AcaoEstruturar,
): EstadoEstruturar {
  switch (acao.tipo) {
    case 'clicarTrecho': {
      if (Object.values(estado.colocados).includes(acao.id)) return estado;
      return {
        ...estado,
        selecionado: estado.selecionado === acao.id ? null : acao.id,
        aviso: null,
        sacudindo: null,
      };
    }

    case 'clicarCampo': {
      const fragId = estado.selecionado;
      if (fragId === null) return estado;
      if (estado.colocados[acao.id] !== undefined) return estado;

      const fragmento = def.fragmentos.find((f) => f.id === fragId);
      if (!fragmento) return estado;

      if (fragmento.campo === null) {
        return {
          ...estado,
          selecionado: null,
          aviso: avisoDeErro(def.textoDistrator),
          sacudindo: acao.id,
        };
      }

      if (fragmento.campo !== acao.id) {
        return {
          ...estado,
          aviso: avisoDeErro(def.textoErro),
          sacudindo: acao.id,
        };
      }

      const colocados = { ...estado.colocados, [acao.id]: fragId };
      const completo = Object.keys(colocados).length === def.campos.length;
      return {
        colocados,
        selecionado: null,
        aviso: completo ? avisoDeAcerto() : null,
        sacudindo: null,
      };
    }

    case 'pararSacudida':
      return estado.sacudindo === null ? estado : { ...estado, sacudindo: null };

    default: {
      const naoTratado: never = acao;
      return naoTratado;
    }
  }
}

// ---------------------------------------------------------------- componente

export interface EstruturarProps {
  def: PuzzleEstruturar;
}

export function Estruturar({ def }: EstruturarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [estado, despachar] = useReducer(
    (atual: EstadoEstruturar, acao: AcaoEstruturar) => reduzirEstruturar(def, atual, acao),
    undefined,
    estadoInicialEstruturar,
  );

  const completo = estruturarCompleto(def, estado);
  const geometria = geometriaDe(def);

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('estruturar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  useEffect(() => {
    if (estado.sacudindo === null) return undefined;
    const id = window.setTimeout(
      () => despachar({ tipo: 'pararSacudida' }),
      ESPERA_SACUDIDA_MS,
    );
    return () => window.clearTimeout(id);
  }, [estado.sacudindo]);

  const usados = new Set(Object.values(estado.colocados));
  const textoPorFragmento = new Map(def.fragmentos.map((f) => [f.id, f.texto]));

  return (
    <MolduraDePuzzle
      rotulo={def.rotulo}
      instrucao={def.instrucao}
      progresso={progressoDe(Object.keys(estado.colocados).length, def.campos.length)}
      aviso={estado.aviso}
    >
      <style>{CSS}</style>

      <div
        style={{
          width: geometria.largura,
          maxWidth: LARGURA_UTIL,
          height: geometria.altura,
          maxHeight: ALTURA_CORPO,
          display: 'flex',
          gap: ESPACO_COLUNAS,
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ width: LARGURA_TRECHOS }}>
          <span
            style={{
              ...estiloRotuloDeCampo(LARGURA_TRECHOS),
              height: ALTURA_CABECA,
              textAlign: 'left',
            }}
          >
            Trechos
          </span>

          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: ESPACO_TRECHO,
            }}
          >
            {def.fragmentos.map((fragmento) => {
              const colocado = usados.has(fragmento.id);
              const ativo = estado.selecionado === fragmento.id;
              return (
                <li key={fragmento.id} style={{ height: ALTURA_TRECHO }}>
                  <button
                    type="button"
                    aria-label={`Trecho: ${fragmento.texto}${colocado ? ' (já usado)' : ''}`}
                    aria-pressed={ativo}
                    disabled={colocado}
                    onClick={() => despachar({ tipo: 'clicarTrecho', id: fragmento.id })}
                    style={estiloCaixaClicavel({
                      largura: LARGURA_TRECHOS,
                      altura: ALTURA_TRECHO,
                      aceso: false,
                      selecionado: ativo,
                      habilitado: !colocado,
                      apagado: colocado,
                    })}
                  >
                    {fragmento.texto}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ width: LARGURA_CAMPOS }}>
          <span
            style={{
              ...estiloRotuloDeCampo(LARGURA_CAMPOS),
              height: ALTURA_CABECA,
              textAlign: 'left',
            }}
          >
            A proposta
          </span>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: ESPACO_CAMPO,
            }}
          >
            {def.campos.map((campo) => {
              const fragId = estado.colocados[campo.id];
              const texto = fragId === undefined ? undefined : textoPorFragmento.get(fragId);
              const preenchido = texto !== undefined;
              const habilitado = !preenchido && estado.selecionado !== null;
              return (
                <div key={campo.id} style={{ textAlign: 'left' }}>
                  <span
                    style={{
                      ...estiloRotuloDeCampo(LARGURA_CAMPOS),
                      height: ALTURA_ROTULO,
                      marginBottom: espaco.xs,
                    }}
                  >
                    {campo.rotulo}
                  </span>
                  <button
                    type="button"
                    className={estado.sacudindo === campo.id ? 'pz-est-sacudir' : undefined}
                    aria-label={
                      preenchido
                        ? `${campo.rotulo}: ${texto}`
                        : `Colocar o trecho escolhido em ${campo.rotulo}`
                    }
                    disabled={!habilitado}
                    onClick={() => despachar({ tipo: 'clicarCampo', id: campo.id })}
                    style={{
                      ...estiloCaixaClicavel({
                        largura: LARGURA_CAMPOS,
                        altura: ALTURA_CAMPO,
                        aceso: preenchido,
                        selecionado: habilitado,
                        habilitado,
                        tracejado: !preenchido,
                      }),
                      // Recusou: a borda vira cor de atenção junto com a
                      // sacudida e com o texto. Três sinais para o mesmo fato,
                      // porque um só não sobrevive à compressão de vídeo.
                      borderColor:
                        estado.sacudindo === campo.id ? cores.atencao : undefined,
                    }}
                  >
                    {texto ?? ''}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MolduraDePuzzle>
  );
}

export default Estruturar;
