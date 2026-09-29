/**
 * Caixa de diálogo.
 *
 * Linear: retrato + nome + fala, um nó por clique. Nunca por timer — o
 * apresentador fala por cima e precisa controlar o ritmo.
 *
 * A caixa inteira é o botão de avanço: o alvo é a tela toda daquela região,
 * impossível de errar com o mouse durante a apresentação.
 *
 * A caixa é dimensionada com folga: nome longo + fala longa não podem
 * empurrar texto para fora nem reduzir corpo abaixo de 28px.
 */
import { DIALOGOS } from '../domain/content';
import { NOME_PROTAGONISTA } from '../domain/types';
import type { Dialogo as DialogoDef, Locutor, NoDialogo, NpcId } from '../domain/types';
import { assetDoNpc } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import {
  borda,
  camada,
  cores,
  espaco,
  raio,
  sombra,
  tipografia,
} from '../styles/tokens';
import { Imagem } from './Imagem';

const NOMES_DE_LOCUTOR: Record<Locutor, string> = {
  rafael: 'Rafael',
  claudia: 'Cláudia',
  tiago: 'Tiago',
  bianca: 'Bianca',
  marcos: 'Marcos',
  ana: NOME_PROTAGONISTA,
  'ana-futura': NOME_PROTAGONISTA,
  narrador: '',
  sistema: 'Sistema',
};

const NPCS: readonly NpcId[] = ['rafael', 'claudia', 'tiago', 'bianca', 'marcos'];

function ehNpc(locutor: Locutor): locutor is NpcId {
  return (NPCS as readonly string[]).includes(locutor);
}

const LARGURA_RETRATO = 220;
const ALTURA_RETRATO = 260;

export function Dialogo(): JSX.Element | null {
  const dialogoAtivo = useJogo((s) => s.dialogoAtivo);
  const avancarDialogo = useJogo((s) => s.avancarDialogo);

  if (dialogoAtivo === null) return null;

  const definicao: DialogoDef | undefined = DIALOGOS[dialogoAtivo.dialogoId];
  if (definicao === undefined) return null;

  const no: NoDialogo | undefined = definicao.nos[dialogoAtivo.indice];
  if (no === undefined) return null;

  const nome = NOMES_DE_LOCUTOR[no.quem];

  return (
    <button
      type="button"
      className="jogo-aparecer"
      aria-label={`Avançar diálogo. ${nome.length > 0 ? `${nome}: ` : ''}${no.texto}`}
      onClick={avancarDialogo}
      style={{
        position: 'absolute',
        left: espaco.margem,
        right: 480,
        bottom: 230,
        zIndex: camada.dialogo,
        display: 'flex',
        gap: espaco.lg,
        alignItems: 'flex-start',
        minHeight: 340,
        background: cores.caixa,
        border: `${borda.grossa}px solid ${cores.contorno}`,
        borderRadius: raio.lg,
        boxShadow: sombra.caixa,
        padding: espaco.xl,
        textAlign: 'left',
        color: cores.texto,
        cursor: 'pointer',
      }}
    >
      {ehNpc(no.quem) ? (
        <Imagem
          id={assetDoNpc(no.quem)}
          rotulo={nome}
          largura={LARGURA_RETRATO}
          altura={ALTURA_RETRATO}
          mostrarRotulo={false}
          decorativo
          style={{ flex: '0 0 auto', borderRadius: raio.md }}
        />
      ) : null}

      <span style={{ display: 'block', flex: '1 1 auto' }}>
        {nome.length > 0 ? (
          <span
            style={{
              display: 'block',
              marginBottom: espaco.md,
              fontSize: tipografia.tamanhos.rotulo,
              fontWeight: tipografia.pesos.maximo,
              letterSpacing: tipografia.espacamento.largo,
              color: cores.destaque,
            }}
          >
            {nome}
          </span>
        ) : null}

        <span
          style={{
            display: 'block',
            fontSize: tipografia.tamanhos.rotulo,
            lineHeight: tipografia.alturaLinha.corpo,
            fontWeight: tipografia.pesos.normal,
            color: cores.texto,
          }}
        >
          {no.texto}
        </span>

        <span
          className="jogo-pulso"
          aria-hidden
          style={{
            display: 'block',
            marginTop: espaco.md,
            fontSize: tipografia.tamanhos.minimo,
            fontWeight: tipografia.pesos.forte,
            color: cores.textoApoio,
          }}
        >
          Clique para continuar ▶
        </span>
      </span>
    </button>
  );
}

export default Dialogo;
