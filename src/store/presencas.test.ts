import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CENAS, DIALOGOS } from '../domain/content';
import { assentarPresencas, chaveDaPresenca, POSICOES_DOS_DIALOGOS, presencasIniciais } from '../domain/content/presencas';
import { useJogo } from './jogo';
import chao from '../../docs/arte/chao.json';

const j = () => useJogo.getState();
function terminarConversa(): void { for (let i = 0; i < 30 && j().dialogoAtivo; i++) j().avancarDialogo(); }
function entrar(bloco: 4 | 5, lugar: 'sala-reunioes' | 'outra-area'): void {
  j().entrarNoBloco(bloco); j().entrarNoLugar(lugar); j().fecharNarracao();
}
beforeEach(() => j().reiniciar());
afterEach(() => vi.unstubAllGlobals());

describe('continuidade física dos NPCs', () => {
  it('continuar restaura a última posição e migra saves anteriores pelas conversas', () => {
    const dados = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => dados.get(k) ?? null, setItem: (k: string, v: string) => dados.set(k, v), removeItem: (k: string) => dados.delete(k) });
    entrar(5, 'outra-area');
    useJogo.setState({ hotspotsFeitos: ['b5-bianca-inicial', 'b5-caderno', 'b5-grade'] });
    j().clicarHotspot('b5-bianca');
    const chave = chaveDaPresenca(5, 'outra-area', 'bianca');
    j().concluirMovimentoNpc(chave); terminarConversa();
    const salvo = dados.get('apresentacao-jogo/progresso')!;
    j().reiniciar(); dados.set('apresentacao-jogo/progresso', salvo); j().continuar();
    expect(j().presencasNpcs[chave]).toEqual({ posicaoAtual: { x: 44, y: 70 }, visivel: true });
    const antigo = JSON.parse(salvo); delete antigo.presencasNpcs;
    j().reiniciar(); dados.set('apresentacao-jogo/progresso', JSON.stringify(antigo)); j().continuar();
    expect(j().presencasNpcs[chave]).toEqual({ posicaoAtual: { x: 44, y: 70 }, visivel: true });
  });
  it('Bianca não some ao terminar a primeira conversa nem ao examinar objetos', () => {
    entrar(5, 'outra-area');
    const chave = chaveDaPresenca(5, 'outra-area', 'bianca');
    const inicial = j().presencasNpcs[chave];
    j().clicarHotspot('b5-bianca-inicial'); terminarConversa();
    expect(j().presencasNpcs[chave]).toEqual(inicial);
    for (const id of ['b5-caderno', 'b5-grade']) {
      j().clicarHotspot(id); j().fecharNarracao();
      expect(j().presencasNpcs[chave]).toEqual(inicial);
    }
    j().clicarHotspot('b5-bianca');
    expect(j().presencasNpcs[chave]).toMatchObject({ visivel: true, posicaoAtual: { x: 30, y: 70 }, movimento: { destino: { x: 44, y: 70 } } });
    j().concluirMovimentoNpc(chave); terminarConversa();
    expect(j().presencasNpcs[chave]).toEqual({ posicaoAtual: { x: 44, y: 70 }, visivel: true });
    j().voltarAoMapa(); j().entrarNoLugar('outra-area');
    expect(j().presencasNpcs[chave]).toEqual({ posicaoAtual: { x: 44, y: 70 }, visivel: true });
  });

  it('Cláudia já está visível na sala; depois da fala sai andando antes de desaparecer', () => {
    entrar(4, 'sala-reunioes');
    const chave = chaveDaPresenca(4, 'sala-reunioes', 'claudia');
    expect(j().presencasNpcs[chave]?.visivel).toBe(true);
    useJogo.setState({ hotspotsFeitos: ['b4-entrega'], dialogosConcluidos: ['b4-apresentacao'], pausaBloco4: 'concluida' });
    j().clicarHotspot('b4-claudia'); terminarConversa();
    expect(j().presencasNpcs[chave]).toMatchObject({ visivel: true, movimento: { destino: { x: 34, y: 70 }, proximos: [{ x: -6, y: 70 }], visivelAoChegar: false } });
    j().concluirMovimentoNpc(chave);
    j().concluirMovimentoNpc(chave);
    expect(j().presencasNpcs[chave]?.visivel).toBe(false);
    // Reler traz a mesma pessoa da borda, sem recriar o sprite no meio da sala.
    j().clicarHotspot('b4-claudia');
    expect(j().presencasNpcs[chave]).toMatchObject({ visivel: true, movimento: { origem: { x: -6, y: 70 }, destino: { x: 34, y: 70 }, proximos: [{ x: 34, y: 62 }] } });
  });

  it('cada locutor de NPC tem posição inicial e final configuradas na sua cena', () => {
    for (const cena of CENAS) for (const h of cena.hotspots) for (const e of [...h.efeitos, ...(h.efeitosComItem ?? [])]) {
      if (e.tipo !== 'dialogo') continue;
      for (const no of DIALOGOS[e.dialogoId]!.nos) {
        if (!['rafael', 'claudia', 'tiago', 'bianca', 'marcos'].includes(no.quem)) continue;
        expect(POSICOES_DOS_DIALOGOS[e.dialogoId]?.some(m => m.npcId === no.quem && m.inicial && m.final), `${e.dialogoId}: ${no.quem}`).toBe(true);
      }
    }
  });

  it('os percursos configurados mantêm os pés sobre o piso enquanto estão no canvas', () => {
    const mapas = chao.cenas as Record<string, { topo: number[]; base: number[] }>;
    const iniciais = presencasIniciais();
    for (const marcas of Object.values(POSICOES_DOS_DIALOGOS)) for (const marca of marcas) {
      const [, lugar] = marca.chave.split(':');
      const mapa = mapas[lugar!];
      const caminho = [marca.inicial, ...(marca.via ?? []), marca.final];
      for (const [origem, destino] of [[iniciais[marca.chave]!.posicaoAtual, marca.inicial], ...caminho.slice(1).map((p, i) => [caminho[i], p])]) {
        for (let passo = 0; passo <= 100; passo++) {
          const x = Math.round((origem!.x + (destino!.x - origem!.x) * passo / 100) / 100 * chao.largura);
          const y = Math.round((origem!.y + (destino!.y - origem!.y) * passo / 100) / 100 * chao.altura);
          if (x < 0 || x >= chao.largura) continue;
          expect(y, `${marca.chave}, coluna ${x}`).toBeGreaterThanOrEqual(mapa!.topo[x]!);
          expect(y, `${marca.chave}, coluna ${x}`).toBeLessThanOrEqual(mapa!.base[x]!);
        }
      }
    }
  });

  it('trocar de cena preserva o destino e a visibilidade final de uma saída pendente', () => {
    const chave = chaveDaPresenca(4, 'sala-reunioes', 'marcos');
    entrar(4, 'sala-reunioes'); j().clicarHotspot('b4-marcos'); terminarConversa();
    const assentadas = assentarPresencas(j().presencasNpcs);
    expect(assentadas[chave]).toEqual({ posicaoAtual: { x: 106, y: 70 }, visivel: false });
    j().voltarAoMapa(); j().entrarNoLugar('sala-reunioes');
    expect(j().presencasNpcs[chave]).toEqual(assentadas[chave]);
  });
});
