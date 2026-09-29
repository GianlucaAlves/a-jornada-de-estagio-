/**
 * Ponto único de entrada dos puzzles.
 *
 * Lê `puzzleAberto` da store, resolve a definição em `PUZZLES` e discrimina
 * pelo campo `tipo`. A discriminação é exaustiva: adicionar um sexto tipo de
 * PuzzleDef quebra a compilação aqui, e não na frente da plateia.
 *
 * Os componentes recebem a definição já estreitada por prop — nenhum deles
 * carrega gabarito escrito em código.
 */
import { PUZZLES } from '../../domain/content';
import type { PuzzleDef } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { camada, cores, espaco, tipografia } from '../../styles/tokens';

import { AssociarPares } from './AssociarPares';
import { Estruturar } from './Estruturar';
import { Montar } from './Montar';
import { Senha } from './Senha';
import { Sequenciar } from './Sequenciar';

/** Rótulo acessível do diálogo modal, por mecânica. */
const ROTULOS: Record<PuzzleDef['tipo'], string> = {
  senha: 'Desafio: compor a senha',
  associar: 'Desafio: ligar lacunas e trilhas',
  sequenciar: 'Desafio: ordenar o log',
  estruturar: 'Desafio: estruturar a proposta',
  montar: 'Desafio: montar o diagrama da entrega',
};

function corpo(def: PuzzleDef): JSX.Element {
  switch (def.tipo) {
    case 'senha':
      return <Senha def={def} />;
    case 'associar':
      return <AssociarPares def={def} />;
    case 'sequenciar':
      return <Sequenciar def={def} />;
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
  if (puzzleAberto === null) return null;

  const def: PuzzleDef | undefined = PUZZLES[puzzleAberto];
  if (!def) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ROTULOS[def.tipo]}
      // O puzzle fica por cima de uma cena: clique aqui não é clique na cena.
      onClick={(evento) => evento.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        // Acima dos overlays persistentes e da narração, abaixo da pausa do B4.
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
      {corpo(def)}
    </div>
  );
}

export default PuzzleAtivo;
