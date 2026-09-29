/**
 * Raiz da apresentação.
 *
 * Sem router: a tela é função do estado, não de URL. O canvas é montado uma
 * única vez; o que troca é o conteúdo dentro dele. Barra de itens e painel de
 * skills são overlays persistentes — estarem sempre no mesmo lugar é o que
 * permite que a revelação do Bloco 5 funcione sem explicação.
 */
import { useJogo } from './store/jogo';
import { Canvas } from './ui/Canvas';
import { Cena } from './ui/Cena';
import { Mapa } from './ui/Mapa';
import { CartaoDeTransicao } from './ui/CartaoDeTransicao';
import { Dialogo } from './ui/Dialogo';
import { Narracao } from './ui/Narracao';
import { BarraDeItens } from './ui/BarraDeItens';
import { PainelDeSkills } from './ui/PainelDeSkills';
import { PausaBloco4 } from './ui/PausaBloco4';
import { PuzzleAtivo } from './ui/puzzles';
import { Revelacao } from './ui/Revelacao';
import { Perguntas } from './ui/Perguntas';
import { camada, cores, espaco, tipografia } from './styles/tokens';

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
    overlaysVisiveis && blocoConcluido && bloco < 5 && pausaBloco4 !== 'rodando';

  return (
    <Canvas>
      <TelaAtual />

      {mostrarBarra ? <BarraDeItens /> : null}
      {overlaysVisiveis ? <PainelDeSkills /> : null}

      <Dialogo />
      <Narracao />

      {/* Puzzle: overlay opaco e modal, acima dos overlays persistentes e
          abaixo da pausa do Bloco 4. Dirigido por `puzzleAberto` na store. */}
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
