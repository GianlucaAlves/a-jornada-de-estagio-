/**
 * Raiz da apresentação.
 *
 * Sem router: a tela é função do estado, não de URL. O canvas é montado uma
 * única vez; o que troca é o conteúdo dentro dele. Barra de itens e painel de
 * skills são overlays persistentes — estarem sempre no mesmo lugar é o que
 * permite que a revelação do bloco final funcione sem explicação.
 *
 * SEIS FASES (ADR-024). As cinco primeiras são jogáveis; a sexta é o fim, e o
 * clímax migrou para ela. O cue de avanço pára na ÚLTIMA fase, e qual é a última
 * sai de `BLOCOS` — não de um número escrito aqui. O `bloco < 5` que existia
 * antes era a aritmética de cinco fases, e teria travado a passagem para a
 * sexta sem nenhum sintoma além do botão que não aparece.
 */
import { useState } from 'react';
import { BLOCOS } from './domain/content';
import type { BlocoId } from './domain/types';
import { useJogo } from './store/jogo';
import { Abertura } from './ui/Abertura';
import { Canvas } from './ui/Canvas';
import { Cena } from './ui/Cena';
import { Mapa } from './ui/Mapa';
import { CartaoDeTransicao } from './ui/CartaoDeTransicao';
import { Dialogo } from './ui/Dialogo';
import { Reflexao } from './ui/Reflexao';
import { Narracao } from './ui/Narracao';
import { ItemRecebido } from './ui/ItemRecebido';
import { BarraDeItens } from './ui/BarraDeItens';
import { PausaBloco4 } from './ui/PausaBloco4';
import { PuzzleAtivo } from './ui/puzzles';
import { Revelacao } from './ui/Revelacao';
import { Perguntas } from './ui/Perguntas';
import { camada, cores, espaco, tipografia } from './styles/tokens';

/**
 * A última fase, derivada do conteúdo. Acrescentar fase não exige editar aqui —
 * foi o que custou a migração de cinco para seis.
 */
export const ULTIMO_BLOCO = Math.max(...Object.keys(BLOCOS).map(Number)) as BlocoId;

function TelaAtual(): JSX.Element | null {
  const tela = useJogo((s) => s.tela);

  switch (tela.tipo) {
    case 'cena':
      return <Cena />;
    case 'mapa':
      return <Mapa />;
    case 'cartao':
      return <CartaoDeTransicao />;
    case 'revelacao':
      return <Revelacao />;
    case 'perguntas':
      return <Perguntas />;
    /**
     * A abertura NÃO é servida daqui, e a variante existe no tipo de propósito:
     * entrar nela pela store apagaria o save que ela oferece para retomar (ver
     * o cabeçalho de Abertura.tsx). Quem decide é a bandeira local abaixo.
     */
    case 'abertura':
      return null;
    default:
      return null;
  }
}

export function App(): JSX.Element {
  const tela = useJogo((s) => s.tela);
  const bloco = useJogo((s) => s.bloco);
  const blocoConcluido = useJogo((s) => s.blocoConcluido);
  const pausaBloco4 = useJogo((s) => s.pausaBloco4);
  const barraSaiu = useJogo((s) => s.revelacao.barraSaiu);
  const avancarBloco = useJogo((s) => s.avancarBloco);
  const reflexaoAtiva = useJogo(s => s.reflexaoAtiva);

  /**
   * Toda carga de página começa na abertura (ADR-018) — é o que faz F5 ser o
   * caminho de reinício durante a apresentação.
   *
   * Bandeira LOCAL, e não `tela` na store: a store grava a cada mudança, então
   * qualquer `set` antes da escolha sobrescreveria o progresso salvo com o
   * estado inicial e "Continuar" não teria mais o que continuar. Enquanto esta
   * bandeira estiver ligada, NADA do jogo é montado — nem overlay, nem cena —
   * para que nenhum efeito de montagem escreva na store por tabela.
   */
  const [naAbertura, setNaAbertura] = useState(true);

  if (naAbertura) {
    return (
      <Canvas>
        <Abertura aoEntrar={() => setNaAbertura(false)} />
      </Canvas>
    );
  }

  /**
   * Overlays persistentes valem para cena e mapa. Cartão e perguntas ficam
   * limpos (o cartão é respiro de passagem de bastão; o fecho não tem nenhuma
   * UI). A revelação desenha a própria barra e o próprio painel, porque lá os
   * dois são atores da animação — montar os daqui duplicaria a tela.
   */
  const overlaysVisiveis = tela.tipo === 'cena' || tela.tipo === 'mapa';

  // A barra sai de cena depois da quarta conexão. O painel de skills fica.
  const mostrarBarra = overlaysVisiveis && !barraSaiu;
  const mostrarAvanco =
    overlaysVisiveis && blocoConcluido && bloco < ULTIMO_BLOCO && pausaBloco4 !== 'rodando';

  return (
    <Canvas>
      <TelaAtual />

      {mostrarBarra ? <BarraDeItens /> : null}

      <Dialogo />
      <Reflexao />
      {/* A abertura narrativa espera o pensamento: dois canais simultâneos
          escureciam Ana e obrigavam a plateia a escolher qual texto ler. */}
      {reflexaoAtiva === null ? <Narracao /> : null}
      {reflexaoAtiva === null ? <ItemRecebido /> : null}

      {/* Puzzle: overlay opaco e modal, acima dos overlays persistentes e
          abaixo da pausa da fase 4. Dirigido por `puzzleAberto` na store. */}
      <PuzzleAtivo />

      {/* Cue de passagem de bastão: o bloco sinalizou fim, o cartão pode entrar. */}
      {mostrarAvanco ? (
        <button
          type="button"
          className="jogo-botao"
          aria-label="Avançar para o próximo bloco"
          onClick={avancarBloco}
          style={{
            position: 'absolute',
            right: espaco.margem,
            top: espaco.md,
            zIndex: camada.overlayPersistente + 1,
            minWidth: 300,
            background: cores.acao,
            color: cores.textoInverso,
            fontWeight: tipografia.pesos.maximo,
          }}
        >
          Avançar ▶
        </button>
      ) : null}

      {pausaBloco4 === 'rodando' ? <PausaBloco4 /> : null}
    </Canvas>
  );
}

export default App;
