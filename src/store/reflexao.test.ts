import { REFLEXOES } from '../domain/content/reflexoes';
import { useJogo } from './jogo';
import type { BlocoId } from '../domain/types';

beforeEach(() => useJogo.getState().reiniciar());
describe('entrada e retomada dos monólogos', () => {
  it.each([1, 2, 3, 4, 5, 6] as BlocoId[])('bloco %i: selo, falas, liberação e releitura', bloco => {
    const dados = REFLEXOES[bloco];
    useJogo.getState().entrarNoBloco(bloco);
    useJogo.getState().entrarNoLugar(dados.lugarId);
    useJogo.getState().iniciarReflexao();
    expect(useJogo.getState().reflexaoAtiva?.etapa).toBe('tempo');
    const antes = [...useJogo.getState().hotspotsFeitos];
    useJogo.getState().clicarHotspot(`b${bloco}-marcos`);
    useJogo.getState().voltarAoMapa();
    expect(useJogo.getState().hotspotsFeitos).toEqual(antes);
    expect(useJogo.getState().tela.tipo).toBe('cena');
    useJogo.getState().avancarReflexao();
    expect(useJogo.getState().reflexaoAtiva?.etapa).toBe('falas');
    for (let i = 0; i < dados.falas.length; i++) useJogo.getState().avancarReflexao();
    expect(useJogo.getState().reflexaoAtiva).toBeNull();
    expect(useJogo.getState().reflexaoVista[bloco]).toBe(true);
    useJogo.getState().voltarAoMapa();
    useJogo.getState().entrarNoLugar(dados.lugarId);
    useJogo.getState().iniciarReflexao();
    expect(useJogo.getState().reflexaoAtiva).toBeNull();
    useJogo.getState().fecharNarracao();
    useJogo.getState().reabrirReflexao();
    expect(useJogo.getState().reflexaoAtiva?.indice).toBe(0);
    useJogo.getState().pularReflexao();
    expect(useJogo.getState().reflexaoVista[bloco]).toBe(true);
  });
  it('cada bloco tem falas próprias e uma pergunta opcional', () => {
    const primeiras = Object.values(REFLEXOES).map(r => r.falas[0]);
    expect(new Set(primeiras).size).toBe(6);
    for (const dados of Object.values(REFLEXOES)) {
      expect(dados.falas.length).toBeGreaterThanOrEqual(2);
      expect(dados.falas.length).toBeLessThanOrEqual(4);
      expect(dados.gancho).toContain('?');
    }
  });
  it('retoma as flags salvas e aceita saves anteriores sem elas', () => {
    const dados = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => dados.get(k) ?? null, setItem: (k: string, v: string) => dados.set(k, v), removeItem: (k: string) => dados.delete(k) });
    try {
      useJogo.getState().reiniciar();
      useJogo.getState().iniciarReflexao();
      useJogo.getState().pularReflexao();
      const chave = 'apresentacao-jogo/progresso';
      const salvo = dados.get(chave);
      expect(salvo).toBeDefined();
      useJogo.getState().reiniciar();
      dados.set(chave, salvo!);
      useJogo.getState().continuar();
      expect(useJogo.getState().reflexaoVista[1]).toBe(true);
      useJogo.getState().iniciarReflexao();
      expect(useJogo.getState().reflexaoAtiva).toBeNull();
      const antigo = JSON.parse(salvo!);
      delete antigo.reflexaoVista;
      dados.set(chave, JSON.stringify(antigo));
      useJogo.getState().continuar();
      expect(useJogo.getState().reflexaoVista).toEqual({});
      useJogo.getState().iniciarReflexao();
      expect(useJogo.getState().reflexaoAtiva?.etapa).toBe('tempo');
    } finally { vi.unstubAllGlobals(); }
  });
});
