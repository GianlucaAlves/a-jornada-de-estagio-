import { CENAS, DIALOGOS } from '../../domain/content';
import { useJogo } from '../../store/jogo';

const j = () => useJogo.getState();
beforeEach(() => j().reiniciar());

function terminarDialogo(): void {
  while (j().dialogoAtivo !== null) j().avancarDialogo();
}

function fecharItensRecebidos(): void {
  while (j().itensRecebidos.length > 0) j().fecharItemRecebido();
}

function entrarNoLugar(lugarId: 'cafezinho' | 'escritorio'): void {
  j().voltarAoMapa();
  j().entrarNoLugar(lugarId);
  if (j().narracao !== null) j().fecharNarracao();
}

describe('fluxo do Bloco 2', () => {
  it('mantém o laço Cafezinho → Escritório → Cafezinho e um único minigame no Escritório', () => {
    const cenas = CENAS.filter((c) => c.bloco === 2);
    expect(cenas.map((c) => c.lugarId)).toEqual(['cafezinho', 'escritorio']);
    expect(cenas.every((c) => c.totalConversas === 2 && c.totalMinigames === 1)).toBe(true);
    expect(cenas[0]?.hotspots.some((h) => h.id === 'b2-notebook')).toBe(false);
    expect(cenas[1]?.hotspots.find((h) => h.id === 'b2-notebook')?.efeitos).toContainEqual({
      tipo: 'abrirPuzzle',
      puzzleId: 'associar',
    });
    expect(DIALOGOS['b2-bianca']?.nos).toHaveLength(6);
    expect(DIALOGOS['b2-rafael']?.nos).toHaveLength(6);
  });

  it('libera o notebook após Bianca e permite sair e reabrir o puzzle', () => {
    j().entrarNoBloco(2);
    j().entrarNoLugar('escritorio');
    j().clicarHotspot('b2-notebook');
    expect(j().narracao).toBe('Notebook: Ainda não sei o que procurar aqui.');
    j().fecharNarracao();
    entrarNoLugar('cafezinho');
    j().clicarHotspot('b2-bianca');
    terminarDialogo();
    fecharItensRecebidos();
    entrarNoLugar('escritorio');
    j().clicarHotspot('b2-notebook');
    expect(j().puzzleAberto).toBe('associar');
    j().fecharPuzzle();
    j().clicarHotspot('b2-notebook');
    expect(j().puzzleAberto).toBe('associar');
  });

  it('entrega o Certificado no Escritório e só conclui após Rafael no Cafezinho', () => {
    j().entrarNoBloco(2);
    j().entrarNoLugar('cafezinho');
    j().clicarHotspot('b2-bianca');
    terminarDialogo();
    fecharItensRecebidos();
    entrarNoLugar('escritorio');
    j().clicarHotspot('b2-notebook');
    j().resolverPuzzle('associar');
    expect(j().itens['certificado-degree']).toBe('presente');
    expect(j().skills).toContain('aprendizado-continuo');
    expect(j().skills).toContain('competencia-tecnica');
    fecharItensRecebidos();

    entrarNoLugar('cafezinho');
    j().clicarHotspot('b2-rafael');
    terminarDialogo();
    fecharItensRecebidos();
    expect(j().itens['anotacoes-treinamento']).toBe('presente');
    expect(j().lugares.cafezinho).toBe('concluido');
    expect(j().blocoConcluido).toBe(true);
  });
});
