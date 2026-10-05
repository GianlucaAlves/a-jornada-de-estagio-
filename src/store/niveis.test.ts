import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CENAS, DIALOGOS, PUZZLES } from '../domain/content';
import { niveis, xpDasInteracoes, xpTotal } from '../domain/content/niveis';
import { useJogo } from './jogo';

const j = () => useJogo.getState();
function terminar(): void { while (j().dialogoAtivo) j().avancarDialogo(); }
beforeEach(() => j().reiniciar());
afterEach(() => vi.unstubAllGlobals());

describe('experiência e evolução de Ana', () => {
  it('pontua a conversa só na última fala e não pontua releitura', () => {
    j().clicarHotspot('b1-tiago');
    expect(j().xpAtual).toBe(0);
    j().avancarDialogo(); expect(j().xpAtual).toBe(0);
    terminar(); expect(j().xpAtual).toBe(10);
    j().clicarHotspot('b1-tiago'); terminar();
    expect(j().xpAtual).toBe(10);
    expect(j().interacoesPontuadas).toEqual(['dialogo:b1-tiago']);
  });

  it('abrir e abandonar puzzle não dá XP; resolver e ensaiar não duplica', () => {
    j().clicarHotspot('b1-notebook'); expect(j().xpAtual).toBe(0);
    j().fecharPuzzle(); expect(j().xpAtual).toBe(0);
    j().clicarHotspot('b1-notebook'); j().resolverPuzzle('senha');
    expect(j().xpAtual).toBe(20);
    j().ensaiarPuzzle('senha'); j().resolverPuzzle('senha');
    expect(j().xpAtual).toBe(20);
  });

  it('ignora café opcional, uso errado de item e conversa ainda bloqueada', () => {
    j().entrarNoBloco(2); j().entrarNoLugar('cafezinho');
    j().clicarHotspot('b2-maquina'); j().clicarHotspot('b2-rafael');
    expect(j().xpAtual).toBe(0);
    j().selecionarItem('cartao-rafael'); j().clicarHotspot('b2-bianca');
    expect(j().xpAtual).toBe(0);
  });

  it('última ação fecha exatamente a barra e cada fase tem apenas referências válidas', () => {
    expect(niveis.map(n => xpTotal(n.nivel))).toEqual([60, 40, 50, 70, 40, 0]);
    for (const def of niveis) for (const [id, peso] of Object.entries(def.xpPorInteracao)) {
      expect(peso).toBeGreaterThan(0);
      const [tipo, referencia] = id.split(':');
      const hotspots = CENAS.filter(c => c.bloco === def.nivel).flatMap(c => c.hotspots);
      if (tipo === 'hotspot') expect(hotspots.some(h => h.id === referencia)).toBe(true);
      if (tipo === 'dialogo') expect(Object.keys(DIALOGOS)).toContain(referencia);
      if (tipo === 'puzzle') expect(Object.keys(PUZZLES)).toContain(referencia);
    }
    j().entrarNoBloco(5); j().entrarNoLugar('outra-area');
    j().clicarHotspot('b5-bianca-inicial'); terminar();
    j().clicarHotspot('b5-caderno'); j().clicarHotspot('b5-grade');
    expect(j().xpAtual).toBe(30);
    j().clicarHotspot('b5-bianca'); expect(j().xpAtual).toBe(30); terminar();
    expect(j().xpAtual).toBe(40); expect(j().blocoConcluido).toBe(true);
    expect(xpDasInteracoes(5, [...j().interacoesPontuadas, ...j().interacoesPontuadas, 'qualquer'])).toBe(40);
  });

  it('evolução pode ser pulada, não repete e fase 6 não avança', () => {
    useJogo.setState({ blocoConcluido: true });
    j().avancarBloco(); expect(j().tela).toEqual({ tipo: 'evolucao', bloco: 2 });
    j().avancarBloco(); expect(j().tela).toEqual({ tipo: 'evolucao', bloco: 2 });
    j().concluirEvolucao(); expect(j().tela).toEqual({ tipo: 'cartao', bloco: 2 });
    j().irParaTela({ tipo: 'mapa' }); j().avancarBloco();
    expect(j().tela).toEqual({ tipo: 'cartao', bloco: 2 });
    j().entrarNoBloco(6); expect(j().nivel).toBe(6);
    j().avancarBloco(); expect(j().tela).toEqual({ tipo: 'mapa' });
  });

  it('restaura XP sem duplicar e migra save antigo por interações terminadas', () => {
    const dados = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => dados.get(k) ?? null, setItem: (k: string, v: string) => dados.set(k, v), removeItem: (k: string) => dados.delete(k) });
    j().clicarHotspot('b1-tiago'); terminar(); j().clicarHotspot('b1-claudia');
    const salvo = dados.get('apresentacao-jogo/progresso')!;
    j().reiniciar(); dados.set('apresentacao-jogo/progresso', salvo); j().continuar();
    expect(j().nivel).toBe(1); expect(j().xpAtual).toBe(10);
    j().clicarHotspot('b1-tiago'); terminar(); expect(j().xpAtual).toBe(10);
    const antigo = JSON.parse(salvo);
    delete antigo.nivel; delete antigo.xpAtual; delete antigo.interacoesPontuadas; delete antigo.evolucoesVistas;
    j().reiniciar(); dados.set('apresentacao-jogo/progresso', JSON.stringify(antigo)); j().continuar();
    expect(j().xpAtual).toBe(10);
    const invalido = { ...antigo, xpAtual: 10000 };
    j().reiniciar(); dados.set('apresentacao-jogo/progresso', JSON.stringify(invalido)); j().continuar();
    expect(j().xpAtual).toBe(0);
  });
});
