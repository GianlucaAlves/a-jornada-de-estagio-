/**
 * Tela de abertura — a escolha explícita entre continuar e começar de novo
 * (ADR-018).
 *
 * POR QUE A ESCOLHA É EXPLÍCITA. O pior defeito possível numa apresentação ao
 * vivo é abrir o jogo e ele começar na fase 4 por causa de um save do ensaio de
 * ontem. Retomada silenciosa é rápida e indefensável. Esta tela também é o
 * caminho de reinício durante a apresentação: F5 leva a ela.
 *
 * `reiniciar()` era CÓDIGO MORTO — nenhum componente a chamava. É daqui que ela
 * passa a ser acionada, e é ela que apaga o save junto: "Começar do início" que
 * deixa o save antigo no navegador é uma promessa quebrada no próximo F5.
 *
 * ESTA TELA NÃO PASSA PELA STORE, e isso não é atalho — é correção.
 *
 * `Tela` tem a variante `{ tipo: 'abertura' }` e a store tem `irParaTela`, mas
 * entrar na abertura por ali DESTRUIRIA o save que a tela está oferecendo para
 * retomar: a store grava a cada mudança (`useJogo.subscribe(salvar)`), e na
 * carga da página o estado é o inicial — bloco 1, barra vazia, painel vazio.
 * O primeiro `set` sobrescreveria o progresso com zero progresso, e aí
 * `continuar()`, que relê o armazenamento, não teria mais o que ler. A escolha
 * tem de acontecer ANTES de qualquer escrita na store, então quem decide é uma
 * bandeira local em `App`. Há teste que prova essa destruição, para que ninguém
 * "simplifique" isto de volta.
 */
import { useEffect, useRef, useState } from 'react';
import { BLOCOS } from '../domain/content';
import { NOME_PROTAGONISTA } from '../domain/types';
import type { BlocoId } from '../domain/types';
import { progressoSalvo, useJogo } from '../store/jogo';
import {
  CANVAS,
  alvo,
  borda,
  camada,
  cores,
  espaco,
  raio,
  sombra,
  tipografia,
} from '../styles/tokens';

export interface OpcoesDaAbertura {
  temProgresso: boolean;
  bloco: BlocoId | null;
  /** Título da fase salva, para o apresentador ver O QUE vai retomar. */
  tituloDoBloco: string;
}

/**
 * O que a abertura oferece, dado o que há salvo.
 *
 * Pura e exportada: é a única regra desta tela, e o que ela decide (mostrar ou
 * não o botão "Continuar") é justamente o que não pode falhar em silêncio.
 *
 * O título da fase entra de propósito. A decisão do ADR-018 é sobre o
 * apresentador não ser surpreendido pelo save de ontem — e "Continuar" sem dizer
 * para ONDE continua é a mesma surpresa com um clique de atraso.
 */
export function opcoesDaAbertura(progresso: { bloco: BlocoId } | null): OpcoesDaAbertura {
  if (progresso === null) {
    return { temProgresso: false, bloco: null, tituloDoBloco: '' };
  }
  return {
    temProgresso: true,
    bloco: progresso.bloco,
    tituloDoBloco: BLOCOS[progresso.bloco].titulo,
  };
}

export interface PropsAbertura {
  /** Chamada depois de a escolha ser aplicada na store. */
  aoEntrar: () => void;
}

export function Abertura({ aoEntrar }: PropsAbertura): JSX.Element {
  const continuar = useJogo((s) => s.continuar);
  const reiniciar = useJogo((s) => s.reiniciar);

  /**
   * Lido UMA vez, no primeiro render, e nunca de novo.
   *
   * Tem de ser aqui e não num efeito: o valor precisa existir antes de qualquer
   * escrita na store, e um efeito rodaria depois do primeiro render — cedo o
   * bastante nesta tela, mas frágil contra qualquer `set` que venha a acontecer
   * na montagem de outro componente.
   */
  const [opcoes] = useState<OpcoesDaAbertura>(() => opcoesDaAbertura(progressoSalvo()));

  const primeiro = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    primeiro.current?.focus();
  }, []);

  function comecarDoInicio(): void {
    reiniciar();
    aoEntrar();
  }

  function retomar(): void {
    continuar();
    aoEntrar();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Abertura"
      style={{
        position: 'absolute',
        inset: 0,
        width: CANVAS.largura,
        height: CANVAS.altura,
        zIndex: camada.abertura,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.xxl,
        padding: espaco.margem,
        // Opaca: nada do jogo pode aparecer por trás da escolha.
        background: cores.fundo,
      }}
    >
      <h1
        style={{
          fontSize: tipografia.tamanhos.titulo,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          letterSpacing: tipografia.espacamento.largo,
          color: cores.destaque,
          textAlign: 'center',
        }}
      >
        {`A história da ${NOME_PROTAGONISTA}`}
      </h1>

      {opcoes.temProgresso ? (
        <div
          className="jogo-caixa"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: espaco.lg,
          }}
        >
          <p
            style={{
              fontSize: tipografia.tamanhos.corpo,
              lineHeight: tipografia.alturaLinha.corpo,
              color: cores.textoApoio,
              textAlign: 'center',
            }}
          >
            {`Há progresso salvo neste navegador: fase ${opcoes.bloco} — ${opcoes.tituloDoBloco}.`}
          </p>

          <div style={{ display: 'flex', gap: espaco.lg, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              ref={primeiro}
              type="button"
              className="jogo-botao"
              aria-label={`Continuar da fase ${opcoes.bloco}: ${opcoes.tituloDoBloco}`}
              onClick={retomar}
              style={{
                minWidth: alvo.botaoLargo,
                background: cores.acao,
                color: cores.textoInverso,
                fontWeight: tipografia.pesos.maximo,
              }}
            >
              Continuar ▶
            </button>

            <button
              type="button"
              className="jogo-botao"
              aria-label="Começar do início, apagando o progresso salvo"
              onClick={comecarDoInicio}
              style={{ minWidth: alvo.botaoLargo }}
            >
              Começar do início
            </button>
          </div>

          <p
            style={{
              fontSize: tipografia.tamanhos.minimo,
              lineHeight: tipografia.alturaLinha.corpo,
              color: cores.textoApoio,
              textAlign: 'center',
            }}
          >
            Começar do início apaga o progresso salvo.
          </p>
        </div>
      ) : (
        <button
          ref={primeiro}
          type="button"
          className="jogo-botao"
          aria-label="Começar"
          onClick={comecarDoInicio}
          style={{
            minWidth: alvo.botaoLargo,
            background: cores.acao,
            color: cores.textoInverso,
            fontWeight: tipografia.pesos.maximo,
            boxShadow: sombra.caixa,
            border: `${borda.grossa}px solid ${cores.contorno}`,
            borderRadius: raio.md,
          }}
        >
          Começar ▶
        </button>
      )}
    </div>
  );
}

export default Abertura;
