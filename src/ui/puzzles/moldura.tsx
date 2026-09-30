/**
 * Moldura comum dos cinco puzzles: título, instrução, progresso, aviso e SAÍDA.
 *
 * Existe porque a auditoria mediu as mesmas cinco faltas em cinco arquivos
 * diferentes (docs/specs/v2/03-puzzles.md §4, §5, §6): instrução só em
 * `aria-label`, progresso em alguns, aviso de erro em nenhum, saída em nenhum.
 * Cinco correções iguais em cinco lugares divergem na primeira manutenção — e
 * divergir aqui significa que a saída muda de canto entre um puzzle e outro, o
 * que ao vivo é pior que não ter saída: o apresentador procura.
 *
 * A SAÍDA FICA NO MESMO CANTO DO BOTÃO DE VOLTAR DA CENA (`Cena.tsx`, canto
 * superior esquerdo, `espaco.margem`). Não é coincidência estética: é a mesma
 * mão indo ao mesmo lugar, e é a única coisa que o apresentador não pode ter de
 * caçar. Escape fecha também, porque quem apresenta tem uma mão no teclado.
 *
 * O ORÇAMENTO DE ALTURA É EXPORTADO como constante e cobrado por teste
 * (`puzzles.tela.test.ts`). A auditoria encontrou o `Estruturar` calculando
 * ~954px contra 952 úteis — dois pixels de estouro que ninguém vê no código e
 * que a plateia vê na tela. Com o orçamento explícito, estourar passa a reprovar
 * a compilação da suíte, não a apresentação.
 */
import type { CSSProperties, ReactNode } from 'react';
import { useEffect } from 'react';

import { useJogo } from '../../store/jogo';
import {
  CANVAS,
  alvo,
  borda,
  cores,
  duracao,
  easing,
  espaco,
  raio,
  tipografia,
} from '../../styles/tokens';

// ---------------------------------------------------------------- orçamento

/**
 * O retângulo que sobra dentro do overlay. `index.tsx` aplica
 * `padding: espaco.margem` nos quatro lados, então a área útil é o canvas menos
 * duas margens — 1792x952. É deste 952 que o `Estruturar` estourava.
 */
export const LARGURA_UTIL = CANVAS.largura - espaco.margem * 2;
export const ALTURA_UTIL = CANVAS.altura - espaco.margem * 2;

/** Cabeçalho: saída à esquerda, progresso à direita. Alto o bastante para o alvo. */
export const ALTURA_CABECALHO = alvo.minimo;
export const ALTURA_TITULO = Math.ceil(
  tipografia.tamanhos.subtitulo * tipografia.alturaLinha.compacta,
);

/**
 * DUAS linhas reservadas para a instrução, mesmo que as cinco caibam em uma.
 *
 * Reservar uma só faria o corpo do puzzle pular para baixo no dia em que a
 * frente de conteúdo escrever uma instrução mais longa — e o corpo pulando para
 * baixo é exatamente o estouro de canvas que já aconteceu uma vez.
 */
export const LINHAS_INSTRUCAO = 2;
export const ALTURA_INSTRUCAO =
  Math.ceil(tipografia.tamanhos.corpo * tipografia.alturaLinha.corpo) * LINHAS_INSTRUCAO;

/** Linha de aviso. A altura é reservada SEMPRE, cheia ou vazia (ver abaixo). */
export const ALTURA_AVISO = Math.ceil(
  tipografia.tamanhos.rotulo * tipografia.alturaLinha.compacta,
);

export const RESPIRO = espaco.md;

/** Quatro respiros: entre as cinco faixas da moldura. */
export const ALTURA_MOLDURA =
  ALTURA_CABECALHO + ALTURA_TITULO + ALTURA_INSTRUCAO + ALTURA_AVISO + RESPIRO * 4;

/** O que sobra para o puzzle em si. Todo corpo declara `GEOMETRIA` e cabe aqui. */
export const ALTURA_CORPO = ALTURA_UTIL - ALTURA_MOLDURA;

// ---------------------------------------------------------------- avisos

/**
 * Uma linha curta, sem julgamento e sem contador (ADR-011). Dois tipos só: deu
 * ou não deu. Cor diferente porque na compressão do Teams a cor chega antes do
 * texto — quem está no fundo da sala vê laranja ou verde antes de ler.
 */
export type Aviso = { tipo: 'erro' | 'acerto'; texto: string } | null;

/**
 * O MESMO texto de acerto nos cinco puzzles.
 *
 * Deliberado: o apresentador aprende UM sinal de "acabou", não cinco. O texto de
 * ERRO é por puzzle porque ele explica o que não fechou (`textoErro` vem do
 * conteúdo); o de acerto não explica nada, só encerra.
 *
 * Vive aqui e não em `puzzles.ts` porque `PuzzleBase` não tem `textoAcerto` e o
 * conteúdo é de outra frente nesta rodada. Se um dia virar campo tipado, esta
 * constante é o valor padrão a migrar.
 */
export const TEXTO_ACERTO = 'É isso. Pode seguir.';

export function avisoDeErro(texto: string): Aviso {
  return { tipo: 'erro', texto };
}

export function avisoDeAcerto(): Aviso {
  return { tipo: 'acerto', texto: TEXTO_ACERTO };
}

// ---------------------------------------------------------------- progresso

/**
 * "2 de 4". Formato único nos cinco, porque a auditoria achou progresso em
 * alguns e não em todos, e progresso em formato diferente é progresso que a
 * plateia lê duas vezes.
 */
export function progressoDe(feitos: number, total: number): string {
  return `${feitos} de ${total}`;
}

// ---------------------------------------------------------------- cursor

/**
 * O CONSERTO DO CLIQUE MORTO (spec 03 §3).
 *
 * `global.css` declara `button { cursor: pointer }` para TODO botão, e três
 * puzzles ainda repetiam `cursor: pointer` no estilo inline de botões
 * `disabled`. Numa tela projetada, alvo com mão que não responde parece
 * travamento — e o spec do projeto rejeita hotspot morto por este exato motivo.
 *
 * Toda mão de botão de puzzle passa por aqui, e por isso a regra é verificável:
 * `puzzles.tela.test.ts` extrai todo `<button>` do markup dos cinco e reprova
 * (a) botão sem cursor declarado, que herdaria o ponteiro do CSS global, e
 * (b) botão `disabled` com ponteiro.
 */
export function estiloDeAlvo(habilitado: boolean): CSSProperties {
  return { cursor: habilitado ? 'pointer' : 'default' };
}

// ---------------------------------------------------------------- saída

/**
 * Escape fecha o puzzle.
 *
 * Hook separado porque os cinco corpos não devem saber que isto existe: a saída
 * é da moldura, e um puzzle que registrasse o próprio atalho poderia registrar
 * dois.
 */
function usarEscapeFecha(fechar: () => void): void {
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') fechar();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [fechar]);
}

export interface MolduraDePuzzleProps {
  /** Título curto, do conteúdo. */
  rotulo: string;
  /** O que fazer, em texto VISÍVEL. Não é `aria-label` (spec 03 §6). */
  instrucao: string;
  progresso: string;
  aviso: Aviso;
  children: ReactNode;
}

export function MolduraDePuzzle({
  rotulo,
  instrucao,
  progresso,
  aviso,
  children,
}: MolduraDePuzzleProps): JSX.Element {
  const fecharPuzzle = useJogo((s) => s.fecharPuzzle);
  usarEscapeFecha(fecharPuzzle);

  return (
    <div
      style={{
        width: LARGURA_UTIL,
        height: ALTURA_UTIL,
        display: 'flex',
        flexDirection: 'column',
        gap: RESPIRO,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          height: ALTURA_CABECALHO,
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: espaco.lg,
        }}
      >
        <button
          type="button"
          className="jogo-botao"
          aria-label="Sair do desafio e voltar para a cena"
          onClick={fecharPuzzle}
          style={{
            ...estiloDeAlvo(true),
            minHeight: alvo.minimo,
            flex: '0 0 auto',
          }}
        >
          <span aria-hidden>◀</span> Sair do desafio
        </button>

        <span
          style={{
            flex: '0 0 auto',
            fontSize: tipografia.tamanhos.rotulo,
            fontWeight: tipografia.pesos.maximo,
            lineHeight: tipografia.alturaLinha.compacta,
            color: cores.textoApoio,
          }}
        >
          {progresso}
        </span>
      </div>

      <h2
        style={{
          height: ALTURA_TITULO,
          flex: '0 0 auto',
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.texto,
        }}
      >
        {rotulo}
      </h2>

      <p
        style={{
          height: ALTURA_INSTRUCAO,
          flex: '0 0 auto',
          margin: '0 auto',
          maxWidth: LARGURA_UTIL,
          fontSize: tipografia.tamanhos.corpo,
          lineHeight: tipografia.alturaLinha.corpo,
          color: cores.textoApoio,
        }}
      >
        {instrucao}
      </p>

      <div
        style={{
          height: ALTURA_CORPO,
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {/**
       * A ALTURA É RESERVADA SEMPRE, cheia ou vazia.
       *
       * Se a linha aparecesse só quando há aviso, o corpo do puzzle subiria e
       * desceria a cada erro. Layout que pula ao errar é a coisa que mais
       * parece defeito numa tela projetada — e aqui o erro é justamente o
       * momento em que a plateia está olhando.
       */}
      <p
        role="status"
        aria-live="polite"
        style={{
          height: ALTURA_AVISO,
          flex: '0 0 auto',
          fontSize: tipografia.tamanhos.rotulo,
          fontWeight: tipografia.pesos.forte,
          lineHeight: tipografia.alturaLinha.compacta,
          color: aviso?.tipo === 'acerto' ? cores.sucesso : cores.atencao,
          opacity: aviso ? 1 : 0,
          transition: `opacity ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        {aviso?.texto ?? ''}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- peças comuns

/**
 * Caixa de texto clicável: a unidade de quase tudo nos cinco puzzles (lacuna,
 * trilha, fragmento, peça, linha de log). Centralizada para que o par
 * contraste/borda seja o mesmo nos cinco — e porque `aceso` tem de trocar o
 * texto para `textoInverso`, que é o erro de contraste mais fácil de cometer.
 */
export function estiloCaixaClicavel(opcoes: {
  largura: number | string;
  altura: number;
  aceso: boolean;
  selecionado: boolean;
  habilitado: boolean;
  tracejado?: boolean;
  apagado?: boolean;
}): CSSProperties {
  const { largura, altura, aceso, selecionado, habilitado, tracejado, apagado } = opcoes;
  const realcado = aceso || selecionado;
  return {
    ...estiloDeAlvo(habilitado),
    width: largura,
    height: altura,
    padding: `0 ${espaco.lg}px`,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    fontSize: tipografia.tamanhos.corpo,
    fontWeight: tipografia.pesos.forte,
    lineHeight: tipografia.alturaLinha.compacta,
    color: aceso ? cores.textoInverso : cores.texto,
    background: aceso ? cores.destaque : cores.caixa,
    border: `${realcado ? borda.grossa : borda.media}px ${tracejado ? 'dashed' : 'solid'} ${
      realcado ? cores.destaque : cores.contorno
    }`,
    borderRadius: raio.md,
    opacity: apagado ? 0.25 : 1,
    transition: `background ${duracao.curta}ms ${easing.suave}, border-color ${duracao.curta}ms ${easing.suave}, opacity ${duracao.curta}ms ${easing.suave}`,
  };
}

/** Rótulo de campo: caixa alta, cor de destaque. Visível, nunca só em aria-label. */
export function estiloRotuloDeCampo(largura?: number): CSSProperties {
  return {
    width: largura,
    display: 'block',
    fontSize: tipografia.tamanhos.corpo,
    fontWeight: tipografia.pesos.maximo,
    lineHeight: tipografia.alturaLinha.compacta,
    letterSpacing: tipografia.espacamento.largo,
    textTransform: 'uppercase',
    color: cores.destaque,
  };
}

// ---------------------------------------------------------------- embaralhar

/** Hash estável (FNV-1a). Sem Math.random: a ordem é a mesma no ensaio e no palco. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Reordena uma lista de forma determinística, garantindo que a ordem MUDE.
 *
 * Existe porque o conteúdo declara peça e campo na mesma ordem — `peca-situacao`
 * antes de `peca-acao`, e `situacao` antes de `acao`. Exibir na ordem declarada
 * transformaria o puzzle em "ligue cada linha na da frente", que é precisamente
 * o que o `montar` era antes de ter gabarito. Se o hash devolver a ordem
 * original, a lista é rotacionada em uma posição: melhor uma ordem previsível
 * que a ordem da resposta.
 *
 * Determinístico de propósito: `Math.random` faria o ensaio e a apresentação
 * serem dois puzzles diferentes, e quem apresenta ensaia para não hesitar.
 */
export function embaralharEstavel<T extends { id: string }>(lista: readonly T[]): readonly T[] {
  const ordenada = [...lista].sort((a, b) => hash(a.id) - hash(b.id));
  const igual = ordenada.every((item, i) => item.id === lista[i]?.id);
  const primeiro = ordenada[0];
  if (igual && ordenada.length > 1 && primeiro) {
    return [...ordenada.slice(1), primeiro];
  }
  return ordenada;
}
