import { beforeEach, describe, expect, it } from 'vitest';
import { BLOCOS } from '../domain/content';
import { useJogo } from '../store/jogo';
import { iniciarTesteDaFase } from './FasesDev';

describe('salto de fase para desenvolvimento', () => {
  beforeEach(() => useJogo.getState().reiniciar());

  for (const fase of Object.values(BLOCOS)) {
    it(`abre a fase ${fase.id} com o inventário e as habilidades esperados`, () => {
      iniciarTesteDaFase(fase.id);
      const estado = useJogo.getState();
      expect(estado.bloco).toBe(fase.id);
      expect(estado.nivel).toBe(fase.id);
      expect(estado.tela).toEqual({ tipo: 'cena', lugarId: fase.estadoAssumido.lugaresDestravados[0] });
      expect(Object.keys(estado.itens).filter(id => estado.itens[id as keyof typeof estado.itens] === 'presente').sort())
        .toEqual([...fase.estadoAssumido.itens].sort());
      expect(estado.skills).toEqual(fase.estadoAssumido.skills);
      expect(estado.reflexaoVista[fase.id]).toBe(true);
    });
  }

  it('remove resíduos do clímax e overlays ao voltar para uma fase anterior', () => {
    iniciarTesteDaFase(6);
    useJogo.setState(estado => ({
      narracao: 'Uma mensagem do teste anterior',
      blocoConcluido: true,
      hotspotsFeitos: ['teste-anterior'],
      revelacao: { ...estado.revelacao, barraSaiu: true, versaoFutura: true },
    }));
    iniciarTesteDaFase(3);
    const estado = useJogo.getState();
    expect(estado.narracao).toBeNull();
    expect(estado.blocoConcluido).toBe(false);
    expect(estado.hotspotsFeitos).not.toContain('teste-anterior');
    expect(estado.revelacao.barraSaiu).toBe(false);
    expect(estado.revelacao.versaoFutura).toBe(false);
    expect(estado.puzzleAberto).toBeNull();
    expect(estado.dialogoAtivo).toBeNull();
  });
});
