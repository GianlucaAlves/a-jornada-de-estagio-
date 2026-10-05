/** O mesmo slide aparece durante a fala e permanece aceso no silêncio. */
import { apresentacao, camada, cores, espaco, tipografia } from '../styles/tokens';

const PASSOS = [
  ['Situação', 'Lotes no papel'],
  ['Tarefa', 'Passar pendências'],
  ['Ação', 'Registro na hora'],
  ['Resultado', 'Turno já informado'],
] as const;

export function QuadroSTAR({ passo }: { passo?: number }): JSX.Element {
  return (
    <div
      aria-label="Apresentação de Ana sobre a passagem de turno"
      style={{
        position: 'absolute',
        left: apresentacao.tela.esquerda,
        top: apresentacao.tela.topo,
        width: apresentacao.tela.largura,
        height: apresentacao.tela.altura,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        background: cores.painel,
        zIndex: camada.hotspot + 1,
        pointerEvents: 'none',
      }}
    >
      {PASSOS.map(([titulo, resumo], indice) => (
        <div
          key={titulo}
          style={{
            padding: `${espaco.xs}px`,
            fontSize: tipografia.tamanhos.minimo,
            lineHeight: tipografia.alturaLinha.compacta,
            color: passo === indice ? cores.textoInverso : cores.texto,
            background: passo === indice ? cores.acao : cores.painel,
          }}
        >
          <strong style={{ color: passo === indice ? cores.textoInverso : cores.destaque }}>{titulo}</strong>
          <br />
          <span>{passo !== undefined && indice <= passo ? resumo : '—'}</span>
        </div>
      ))}
    </div>
  );
}
