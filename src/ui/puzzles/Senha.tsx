/**
 * Puzzle da FASE 1 — a senha temporária de primeiro acesso.
 *
 * É o único dos cinco que NÃO se resolve com o mouse, e isso é decisão do dono,
 * não descuido: a senha continua digitada (ADR-016). O remédio para "a resposta
 * não está na tela quando é pedida" é a releitura de diálogo, que é de outra
 * frente. Aqui foram consertadas as três coisas que eram minhas (spec 03 §2).
 *
 * 1. O AUTO-AVANÇO DE FOCO SAIU. O código antigo chamava `focus()` no campo
 *    seguinte assim que o valor digitado batia com o gabarito, dentro do próprio
 *    `onChange`. Quem digita a senha corrida perde caractere: a tecla que chega
 *    entre o `focus()` e o commit do React é entregue ao campo que está perdendo
 *    o foco, e "12" + "0" virava "120" no campo 2 com o campo 3 vazio. Avanço por
 *    CONTEÚDO é uma corrida que não tem como ganhar — agora o foco só anda por
 *    intenção explícita: Enter, ou Tab, que é nativo. Ver `focoPorTecla`.
 *
 * 2. O ERRO FICOU VISÍVEL. Antes não havia sinal nenhum de senha errada: a tela
 *    ficava idêntica, e ao vivo isso faz o apresentador começar a explicar o que
 *    não devia. Agora o aviso aparece quando os campos estão TODOS preenchidos e
 *    a combinação não abre — errar antes de terminar de digitar não é errar.
 *
 * 3. A TELA DIZ QUANTOS CAMPOS HÁ E O QUE CADA UM ESPERA. Cada campo mostra o
 *    `rotulo` que o conteúdo declara ("Prefixo (igual para todo mundo)", "Código
 *    do time (2 dígitos)"). Isto também resolve a sensibilidade à ordem que a
 *    auditoria apontou: a comparação é por índice, e agora cada índice está
 *    nomeado na tela — não há ordem a adivinhar.
 *
 * O QUE SAIU DE PROPÓSITO: o realce por campo a cada tecla. Ele acendia o campo
 * no instante em que o pedaço ficava certo, o que é um oráculo — dava para achar
 * cada pedaço por tentativa sem nunca falar com as três pessoas, e o puzzle é
 * SOCIAL. Agora o veredito é do conjunto: ou abre, ou avisa.
 */
import { useEffect, useRef, useState } from 'react';

import type { PuzzleSenha } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import {
  borda,
  cores,
  duracao,
  easing,
  espaco,
  raio,
  tipografia,
} from '../../styles/tokens';

import {
  type Aviso,
  avisoDeAcerto,
  avisoDeErro,
  estiloRotuloDeCampo,
  MolduraDePuzzle,
  progressoDe,
} from './moldura';

// ---------------------------------------------------------------- geometria

const LARGURA_CAMPO = 420;
const ALTURA_ENTRADA = 104;
/** Duas linhas: "Dia em que você entrou (2 dígitos)" encosta na largura do campo. */
const ALTURA_ROTULO =
  Math.ceil(tipografia.tamanhos.apoio * tipografia.alturaLinha.corpo) * 2;
/** Hífen entre os campos, com respiro dos dois lados. */
const LARGURA_SEPARADOR = espaco.lg * 2 + 24;

/** Tempo com a senha aberta na tela antes de fechar o puzzle. */
const ESPERA_CONCLUSAO_MS = 900;

export function geometriaDe(def: PuzzleSenha): { largura: number; altura: number } {
  const n = Math.max(1, def.campos.length);
  return {
    largura: n * LARGURA_CAMPO + (n - 1) * LARGURA_SEPARADOR,
    altura: ALTURA_ROTULO + espaco.sm + ALTURA_ENTRADA,
  };
}

// ---------------------------------------------------------------- regras

export type ResultadoSenha = 'incompleta' | 'errada' | 'certa';

/** Caixa e espaço em volta não contam: ninguém decora uma senha em maiúscula. */
function normalizar(valor: string): string {
  return valor.trim().toLowerCase();
}

export function contarPreenchidos(valores: readonly string[]): number {
  return valores.filter((v) => normalizar(v).length > 0).length;
}

/**
 * O veredito do CONJUNTO.
 *
 * 'incompleta' existe para que o aviso não apareça no meio da digitação: quem
 * está no terceiro caractere do primeiro campo não errou nada, e um aviso ali
 * treinaria o apresentador a ignorar a linha de aviso — que é a linha em que a
 * apresentação toda passou a confiar.
 */
export function avaliarSenha(
  valores: readonly string[],
  gabarito: readonly string[],
): ResultadoSenha {
  if (gabarito.length === 0) return 'incompleta';
  if (contarPreenchidos(valores) < gabarito.length) return 'incompleta';
  const certo = gabarito.every((esperado, i) => normalizar(valores[i] ?? '') === normalizar(esperado));
  return certo ? 'certa' : 'errada';
}

/**
 * O CONSERTO DO BUG DE FOCO, em forma testável.
 *
 * Retorna o índice que deve receber o foco, ou `null` para não mexer. A regra
 * inteira é: só Enter anda. Nenhuma tecla de caractere anda, e é por isso que
 * caractere nenhum se perde — o campo só muda por decisão da pessoa.
 *
 * Não trato seta nem Backspace de propósito: dentro de um campo de texto elas
 * pertencem ao cursor de edição, e roubá-las conserta um bug criando outro.
 */
export function focoPorTecla(tecla: string, indice: number, total: number): number | null {
  if (tecla !== 'Enter') return null;
  return indice + 1 < total ? indice + 1 : null;
}

export function avisoDaSenha(resultado: ResultadoSenha, textoErro: string): Aviso {
  if (resultado === 'certa') return avisoDeAcerto();
  if (resultado === 'errada') return avisoDeErro(textoErro);
  return null;
}

// ---------------------------------------------------------------- componente

export interface SenhaProps {
  def: PuzzleSenha;
}

export function Senha({ def }: SenhaProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [valores, setValores] = useState<string[]>(() => def.campos.map(() => ''));
  const campos = useRef<Array<HTMLInputElement | null>>([]);

  const resultado = avaliarSenha(valores, def.gabarito);
  const geometria = geometriaDe(def);

  // Foco no primeiro campo: o apresentador começa a digitar sem clicar.
  useEffect(() => {
    campos.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resultado !== 'certa') return undefined;
    const id = window.setTimeout(() => resolverPuzzle('senha'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [resultado, resolverPuzzle]);

  function aoTeclar(indice: number, tecla: string): void {
    const destino = focoPorTecla(tecla, indice, def.campos.length);
    if (destino === null) return;
    campos.current[destino]?.focus();
  }

  return (
    <MolduraDePuzzle
      rotulo={def.rotulo}
      instrucao={def.instrucao}
      progresso={progressoDe(contarPreenchidos(valores), def.campos.length)}
      aviso={avisoDaSenha(resultado, def.textoErro)}
    >
      <div
        style={{
          width: geometria.largura,
          height: geometria.altura,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {def.campos.map((campo, indice) => {
          const aberta = resultado === 'certa';
          return (
            <div key={campo.id} style={{ display: 'flex', alignItems: 'flex-end' }}>
              {indice > 0 ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: LARGURA_SEPARADOR,
                    height: ALTURA_ENTRADA,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tipografia.tamanhos.titulo,
                    fontWeight: tipografia.pesos.maximo,
                    lineHeight: tipografia.alturaLinha.compacta,
                    color: cores.texto,
                  }}
                >
                  -
                </span>
              ) : null}

              <div style={{ width: LARGURA_CAMPO }}>
                {/* O RÓTULO VISÍVEL. É o que diz quantos campos há e o que cada
                    um espera — e o que torna a comparação por índice justa. */}
                <label
                  htmlFor={`pz-senha-${campo.id}`}
                  style={{
                    ...estiloRotuloDeCampo(LARGURA_CAMPO),
                    height: ALTURA_ROTULO,
                    marginBottom: espaco.sm,
                    fontSize: tipografia.tamanhos.apoio,
                    lineHeight: tipografia.alturaLinha.corpo,
                    textAlign: 'center',
                    textTransform: 'none',
                  }}
                >
                  {campo.rotulo}
                </label>

                <input
                  id={`pz-senha-${campo.id}`}
                  ref={(el) => {
                    campos.current[indice] = el;
                  }}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`${campo.rotulo}. Campo ${indice + 1} de ${def.campos.length}.`}
                  value={valores[indice] ?? ''}
                  onChange={(evento) => {
                    const valor = evento.target.value;
                    setValores((atual) => atual.map((v, i) => (i === indice ? valor : v)));
                  }}
                  onKeyDown={(evento) => aoTeclar(indice, evento.key)}
                  style={{
                    width: LARGURA_CAMPO,
                    height: ALTURA_ENTRADA,
                    padding: `0 ${espaco.md}px`,
                    textAlign: 'center',
                    fontSize: tipografia.tamanhos.titulo,
                    fontWeight: tipografia.pesos.forte,
                    lineHeight: tipografia.alturaLinha.compacta,
                    color: aberta ? cores.textoInverso : cores.texto,
                    background: aberta ? cores.sucesso : cores.caixa,
                    border: `${aberta ? borda.grossa : borda.media}px solid ${
                      aberta ? cores.sucesso : cores.contorno
                    }`,
                    borderRadius: raio.md,
                    transition: `background ${duracao.curta}ms ${easing.suave}, color ${duracao.curta}ms ${easing.suave}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </MolduraDePuzzle>
  );
}

export default Senha;
