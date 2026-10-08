/**
 * Ponto único de entrada dos puzzles.
 *
 * Lê `puzzleAberto` da store, resolve a definição em `PUZZLES` e discrimina
 * pelo campo `tipo`. A discriminação é exaustiva: adicionar um sexto tipo de
 * PuzzleDef quebra a compilação aqui, e não na frente da plateia.
 *
 * Os componentes recebem a definição já estreitada por prop — nenhum deles
 * carrega gabarito escrito em código.
 *
 * DUAS MUDANÇAS DA V2 VIVEM AQUI:
 *
 * 1. O RÓTULO ACESSÍVEL SAI DO CONTEÚDO. Havia um `Record` de rótulos escrito à
 *    mão neste arquivo, e um deles era "Desafio: ordenar o log" — vocabulário de
 *    tecnologia que a v2 expurgou (ADR-002), num lugar onde nenhuma revisão de
 *    conteúdo ia olhar. Agora vem de `def.rotulo`, que é o mesmo texto que a
 *    plateia lê no título. Duas fontes de verdade para o nome de um puzzle é uma
 *    fonte a mais do que existe.
 *
 * 2. `aberturasDePuzzle` É A `key` DO CORPO. Sair reinicia o puzzle (ADR-011), e
 *    o progresso parcial mora em estado local dos componentes. Sem trocar a
 *    `key`, reabrir o mesmo puzzle reencontraria o React com a mesma árvore e o
 *    estado local sobreviveria — a pessoa voltaria para metade do puzzle
 *    resolvido, que é pior que não poder sair. A store já mantém o contador
 *    monótono exatamente para isto.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleDef } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { camada, cores, espaco, tipografia } from '../../styles/tokens';

import { AssociarPares } from './AssociarPares';
import { Estruturar } from './Estruturar';
import { Montar } from './Montar';
import { Senha } from './Senha';

function corpo(def: PuzzleDef): JSX.Element {
  switch (def.tipo) {
    case 'senha':
      return <Senha def={def} />;
    case 'associar':
      return <AssociarPares def={def} />;
    case 'estruturar':
      return <Estruturar def={def} />;
    case 'montar':
      return <Montar def={def} />;
    default: {
      const naoTratado: never = def;
      return naoTratado;
    }
  }
}

export function PuzzleAtivo(): JSX.Element | null {
  const puzzleAberto = useJogo((s) => s.puzzleAberto);
  const aberturas = useJogo((s) => s.aberturasDePuzzle);
  if (puzzleAberto === null) return null;

  const def: PuzzleDef | undefined = PUZZLES[puzzleAberto];
  if (!def) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Desafio: ${def.rotulo}`}
      // O puzzle fica por cima de uma cena: clique aqui não é clique na cena.
      onClick={(evento) => evento.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        // Acima dos overlays persistentes e da narração.
        zIndex: camada.narracao + 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: espaco.margem,
        // Opaco de propósito: cena atrás do puzzle só rouba contraste na projeção.
        background: cores.fundo,
        fontSize: tipografia.tamanhos.corpo,
        lineHeight: tipografia.alturaLinha.corpo,
        color: cores.texto,
      }}
    >
      {/* A key força remontagem a cada abertura: ver o item 2 do cabeçalho. */}
      <div key={`${puzzleAberto}-${aberturas}`}>{corpo(def)}</div>
    </div>
  );
}

export default PuzzleAtivo;
