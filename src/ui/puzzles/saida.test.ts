/**
 * SAIR DO PUZZLE NÃO TRAVA PROGRESSÃO NENHUMA — o critério de aceite da spec 03.
 *
 * Testado no `sequenciar`, que é o de maior raio de dano: é ele que gateia o
 * fecho da fase 2 (`b2-bianca` tem `requerPuzzleResolvido: 'sequenciar'`), e era
 * nele que o defeito antigo doía mais. Com o `abrirPuzzle` da v1, que escrevia
 * 'liberado' sem olhar o estado, um botão de sair orfanaria o hotspot para sempre
 * e a fase nunca emitiria `blocoConcluido`.
 *
 * Este arquivo cobra a propriedade pela travessia de verdade, com a store e o
 * conteúdo reais: abrir, sair, reabrir, resolver, e a fase fechar. Ele vive na
 * pasta dos puzzles porque a saída é feature desta frente — a correção da store é
 * de outra, e é justamente por isso que quem depende dela precisa de um teste
 * próprio: se ela regredir, reprova aqui, do lado de quem quebra.
 */
import { CENAS } from '../../domain/content';
import type { Hotspot, LugarId } from '../../domain/types';
import { useJogo } from '../../store/jogo';

const j = () => useJogo.getState();

/**
 * Acha o hotspot que abre um puzzle, pelo CONTEÚDO. Escrever 'b2-notebook' na
 * mão faria este teste reprovar o trabalho da frente de conteúdo quando ela
 * renomear o hotspot — e ela não pode consertar um arquivo meu.
 */
function hotspotQueAbre(puzzleId: string): {
  lugarId: LugarId;
  bloco: number;
  hotspot: Hotspot;
} {
  for (const cena of CENAS) {
    for (const h of cena.hotspots) {
      const abre = h.efeitos.some(
        (e) => e.tipo === 'abrirPuzzle' && e.puzzleId === puzzleId,
      );
      if (abre) return { lugarId: cena.lugarId, bloco: cena.bloco, hotspot: h };
    }
  }
  throw new Error(`nenhum hotspot abre o puzzle '${puzzleId}'`);
}

/**
 * Acha a PORTA do puzzle: o hotspot que só responde depois dele resolvido. É
 * esse que a v1 orfanaria para sempre se houvesse botão de sair — a correção do
 * `abrirPuzzle` existe por causa dele.
 *
 * Procurado pelo conteúdo, em qualquer fase: se a frente de conteúdo mover a
 * porta de lugar, este teste acompanha em vez de reprovar.
 */
function hotspotGateadoPor(
  puzzleId: string,
): { lugarId: LugarId; bloco: number; hotspot: Hotspot } | undefined {
  for (const cena of CENAS) {
    for (const h of cena.hotspots) {
      if (h.requerPuzzleResolvido === puzzleId) {
        return { lugarId: cena.lugarId, bloco: cena.bloco, hotspot: h };
      }
    }
  }
  return undefined;
}

beforeEach(() => {
  j().reiniciar();
});

describe('todo puzzle é alcançável, e nenhum depende de clique único', () => {
  /**
   * O `sequenciar` é o que ESTA frente precisa alcançar, e é o de maior raio de
   * dano. Os outros quatro não são afirmados aqui de propósito: no momento em que
   * escrevo, `estruturar` ainda não tem hotspot — as fases 3 e 5 são esqueletos
   * declarados (ver o cabeçalho de `bloco3.ts`) e o conteúdo é de outra frente.
   * Cobrar aqui reprovaria o trabalho dela num arquivo que ela não pode editar.
   * Quem tem de cobrar alcançabilidade de puzzle é `integridade.test.ts`, que é
   * onde o grafo de conteúdo mora.
   */
  it('o sequenciar tem um hotspot que o abre', () => {
    expect(() => hotspotQueAbre('sequenciar')).not.toThrow();
  });

  /**
   * `umaVezSo` num hotspot que abre puzzle é o que tornava a saída impossível: se
   * o clique só vale uma vez, sair é perder o puzzle e tudo o que depende dele.
   * A correção do `abrirPuzzle` tirou a necessidade; este teste impede que a
   * marcação volte por hábito.
   */
  it('nenhum hotspot que abre puzzle é umaVezSo', () => {
    const presos = CENAS.flatMap((cena) =>
      cena.hotspots
        .filter(
          (h) =>
            h.umaVezSo === true && h.efeitos.some((e) => e.tipo === 'abrirPuzzle'),
        )
        .map((h) => `${cena.lugarId}/B${cena.bloco} '${h.id}'`),
    );
    expect(presos).toEqual([]);
  });
});

describe('sair e reabrir o sequenciar não trava a fase 2', () => {
  const { lugarId, bloco, hotspot } = hotspotQueAbre('sequenciar');

  it('o conteúdo põe o sequenciar numa cena alcançável', () => {
    expect(bloco).toBeGreaterThan(0);
    expect(lugarId).not.toBe('');
  });

  it('abrir, sair, reabrir e resolver deixa o puzzle resolvido', () => {
    j().entrarNoBloco(bloco as 1 | 2 | 3 | 4 | 5 | 6);
    j().entrarNoLugar(lugarId as 'escritorio');

    j().clicarHotspot(hotspot.id);
    expect(j().puzzleAberto).toBe('sequenciar');
    expect(j().puzzles.sequenciar).toBe('liberado');

    const aberturas = j().aberturasDePuzzle;

    // SAIR. O overlay fecha, o puzzle continua liberado, e o contador muda para
    // que a próxima abertura remonte o componente do zero (ADR-011).
    j().fecharPuzzle();
    expect(j().puzzleAberto).toBeNull();
    expect(j().puzzles.sequenciar).toBe('liberado');
    expect(j().aberturasDePuzzle).toBeGreaterThan(aberturas);

    // REABRIR pelo mesmo hotspot: ele não morreu.
    j().clicarHotspot(hotspot.id);
    expect(j().puzzleAberto).toBe('sequenciar');

    j().resolverPuzzle('sequenciar');
    expect(j().puzzles.sequenciar).toBe('resolvido');
    expect(j().puzzleAberto).toBeNull();
  });

  /**
   * A propriedade da qual a saída depende: reabrir um puzzle RESOLVIDO não o
   * rebaixa. Sem ela, um clique acidental no hotspot depois de resolver desarma
   * a porta seguinte e a fase deixa de fechar.
   */
  it('reabrir depois de resolvido não rebaixa o puzzle', () => {
    j().entrarNoBloco(bloco as 1 | 2 | 3 | 4 | 5 | 6);
    j().entrarNoLugar(lugarId as 'escritorio');
    j().clicarHotspot(hotspot.id);
    j().resolverPuzzle('sequenciar');

    j().clicarHotspot(hotspot.id);
    expect(j().puzzles.sequenciar).toBe('resolvido');

    j().fecharPuzzle();
    expect(j().puzzles.sequenciar).toBe('resolvido');
  });

  /**
   * O TESTE DE RAIO DE DANO, e ele é afirmado sobre o GATE, não sobre o fecho da
   * fase.
   *
   * Afirmar `blocoConcluido` amarraria este arquivo à cadeia inteira que a frente
   * de conteúdo está escrevendo agora — no momento em que escrevo, o fecho da
   * fase 2 passou a ser gateado pelo certificado, que é gateado pelo puzzle, e o
   * `blocoConcluido` mudou para os efeitos de um diálogo. Nada disso é meu, e
   * cada mudança lá reprovaria aqui sem que houvesse defeito.
   *
   * O que é meu é a propriedade: depois de SAIR e VOLTAR, o hotspot que exige o
   * puzzle deixa de estar bloqueado. É esse hotspot que a v1 orfanaria para
   * sempre.
   */
  it('depois de sair e voltar, o hotspot que exige o puzzle destrava', () => {
    const porta = hotspotGateadoPor('sequenciar');
    expect(porta, 'nenhum hotspot exige o sequenciar resolvido').toBeDefined();
    if (!porta) return;

    j().entrarNoBloco(porta.bloco as 1 | 2 | 3 | 4 | 5 | 6);
    j().entrarNoLugar(porta.lugarId);

    // ANTES: bloqueado. O clique não entra e a narração explica por quê.
    j().clicarHotspot(porta.hotspot.id);
    expect(j().hotspotsFeitos).not.toContain(porta.hotspot.id);
    if (porta.hotspot.bloqueadoTexto) {
      expect(j().narracao).toBe(porta.hotspot.bloqueadoTexto);
    }

    // SAIR e VOLTAR no meio do caminho.
    j().entrarNoLugar(lugarId as 'escritorio');
    j().clicarHotspot(hotspot.id);
    j().fecharPuzzle();
    j().clicarHotspot(hotspot.id);
    j().resolverPuzzle('sequenciar');
    expect(j().puzzles.sequenciar).toBe('resolvido');

    // DEPOIS: o mesmo hotspot responde.
    j().entrarNoLugar(porta.lugarId);
    j().clicarHotspot(porta.hotspot.id);
    expect(j().hotspotsFeitos).toContain(porta.hotspot.id);
  });
});
