/** O mesmo slide aparece durante a fala e permanece aceso no silêncio. */
import { borda, camada, cores, espaco, tipografia } from '../styles/tokens';

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
        left: '40.6%',
        top: '28.5%',
        width: 360,
        height: 136,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        background: cores.painel,
        border: `${borda.fina}px solid ${cores.contorno}`,
        zIndex: camada.dialogo + 1,
        pointerEvents: 'none',
      }}
    >
      {PASSOS.map(([titulo, resumo], indice) => (
        <div
          key={titulo}
          style={{
            padding: `0 ${espaco.xs}px`,
            fontSize: tipografia.tamanhos.minimo,
            lineHeight: 1,
            color: cores.texto,
            background: passo === indice ? cores.acao : cores.painel,
          }}
        >
          <strong style={{ color: passo === indice ? cores.textoInverso : cores.destaque }}>{titulo}</strong>
          <br />
          {resumo}
        </div>
      ))}
    </div>
  );
}
