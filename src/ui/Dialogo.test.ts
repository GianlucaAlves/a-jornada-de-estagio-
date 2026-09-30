/**
 * O QUE A CAIXA DE DIÁLOGO DIZ: cargo junto do nome, e fala que pode ser relida.
 *
 * Nenhum destes dois é observável em markup. A suíte roda sem navegador, e o
 * zustand serve o estado INICIAL ao renderizar fora dele — então um teste de
 * HTML nunca chega a um diálogo aberto, muito menos a um diálogo aberto pela
 * segunda vez. O que se testa aqui é a função pura que resolve o que vai na tela
 * (`falaNaTela`) e a store dirigida pelo CONTEÚDO, sem id escrito à mão: as
 * fases estão sendo escritas por outras frentes, e um teste que cite
 * `conversar('bianca-cafe')` reprovaria o trabalho delas sem que elas tivessem
 * como consertar.
 */
import { CENAS, DIALOGOS, NPCS } from '../domain/content';
import type { Cena, Hotspot, NpcId } from '../domain/types';
import { assetDoRetrato } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { ehNpc, falaNaTela, identidadeDoLocutor, linhaDeNome } from './Dialogo';

const IDS_DE_NPC = Object.keys(NPCS) as NpcId[];

describe('cargo acompanha o nome em toda ocorrência', () => {
  it('os cinco NPCs têm cargo, e a identidade sai do registro', () => {
    expect(IDS_DE_NPC).toHaveLength(5);
    for (const id of IDS_DE_NPC) {
      const identidade = identidadeDoLocutor(id);
      expect(identidade, `npc '${id}'`).not.toBeNull();
      expect(identidade?.nome).toBe(NPCS[id].nome);
      expect(identidade?.cargo).toBe(NPCS[id].cargo);
      expect(identidade?.cargo.trim(), `npc '${id}' sem cargo`).not.toBe('');
    }
  });

  it('a linha de nome de um NPC traz nome E cargo', () => {
    for (const id of IDS_DE_NPC) {
      const identidade = identidadeDoLocutor(id);
      if (identidade === null) throw new Error(`npc '${id}' sem identidade`);
      const linha = linhaDeNome(identidade);
      expect(linha, `npc '${id}'`).toContain(NPCS[id].nome);
      expect(linha, `npc '${id}'`).toContain(NPCS[id].cargo);
    }
  });

  /**
   * A Ana e o sistema NÃO ganham cargo: a Ana é quem a plateia acompanha, e
   * "Ana · Estagiária" na caixa de diálogo diria à plateia o que ela já sabe,
   * gastando a linha que existe para apresentar quem ela ainda não conhece.
   */
  it('a protagonista e o sistema aparecem sem cargo, e o narrador sem nome', () => {
    expect(identidadeDoLocutor('ana')?.cargo).toBe('');
    expect(identidadeDoLocutor('ana-futura')?.cargo).toBe('');
    expect(identidadeDoLocutor('sistema')?.cargo).toBe('');
    expect(identidadeDoLocutor('narrador')).toBeNull();
  });

  /**
   * A varredura do conteúdo real: toda fala de NPC que existe hoje produz uma
   * linha com cargo. É o que impede o cargo de estar em uma cena e faltar noutra.
   */
  it('toda fala de NPC no conteúdo produz linha de nome com cargo', () => {
    const semCargo: string[] = [];
    let falasDeNpc = 0;
    for (const dialogo of Object.values(DIALOGOS)) {
      for (const [indice, no] of dialogo.nos.entries()) {
        if (!ehNpc(no.quem)) continue;
        falasDeNpc += 1;
        const fala = falaNaTela({ dialogoId: dialogo.id, indice }, 'ana-neutra');
        const identidade = fala?.identidade;
        const linha = identidade === undefined || identidade === null ? '' : linhaDeNome(identidade);
        if (!linha.includes(NPCS[no.quem].cargo)) {
          semCargo.push(`'${dialogo.id}' nó ${indice + 1} (${no.quem}): "${linha}"`);
        }
      }
    }
    expect(semCargo).toEqual([]);
    expect(falasDeNpc, 'nenhuma fala de NPC no conteúdo: o teste passaria vazio').toBeGreaterThan(0);
  });
});

describe('retrato de quem fala', () => {
  /**
   * `narrador` e `sistema` não têm rosto de propósito: eles não são pessoas, e
   * inventar um retrato para eles faria a plateia procurar quem falou.
   */
  it('NPC e as duas Anas têm retrato; narrador e sistema não', () => {
    for (const id of IDS_DE_NPC) {
      expect(assetDoRetrato(id, 'ana-neutra'), `npc '${id}'`).not.toBeNull();
    }
    expect(assetDoRetrato('ana', 'ana-neutra')).not.toBeNull();
    expect(assetDoRetrato('ana-futura', 'ana-neutra')).not.toBeNull();
    expect(assetDoRetrato('narrador', 'ana-neutra')).toBeNull();
    expect(assetDoRetrato('sistema', 'ana-neutra')).toBeNull();
  });

  it('o retrato da Ana acompanha a postura dela', () => {
    const encolhida = assetDoRetrato('ana', 'ana-encolhida');
    const confiante = assetDoRetrato('ana', 'ana-confiante');
    expect(encolhida).not.toBe(confiante);
    expect(encolhida).toContain('encolhida');
    expect(confiante).toContain('confiante');
  });

  /**
   * O caminho de verdade: o que a caixa resolve a partir do estado. Varre o
   * conteúdo e cobra que toda fala com dono tenha rosto, e que narração não
   * tenha nenhum.
   */
  it('falaNaTela devolve retrato para quem tem dono e nenhum para narração', () => {
    const problemas: string[] = [];
    let nos = 0;
    for (const dialogo of Object.values(DIALOGOS)) {
      for (const [indice, no] of dialogo.nos.entries()) {
        nos += 1;
        const fala = falaNaTela({ dialogoId: dialogo.id, indice }, 'ana-neutra');
        if (fala === null) {
          problemas.push(`'${dialogo.id}' nó ${indice + 1}: falaNaTela devolveu null`);
          continue;
        }
        const deveTerRosto = no.quem !== 'narrador' && no.quem !== 'sistema';
        if (deveTerRosto && fala.retratoId === null) {
          problemas.push(`'${dialogo.id}' nó ${indice + 1} (${no.quem}): sem retrato`);
        }
        if (!deveTerRosto && fala.retratoId !== null) {
          problemas.push(`'${dialogo.id}' nó ${indice + 1} (${no.quem}): ganhou retrato`);
        }
      }
    }
    expect(problemas).toEqual([]);
    expect(nos).toBeGreaterThan(0);
  });

  it('estado sem diálogo não desenha caixa nenhuma', () => {
    expect(falaNaTela(null, 'ana-neutra')).toBeNull();
    // Diálogo inexistente e índice fora de faixa também devolvem nada, em vez
    // de uma caixa vazia na tela.
    expect(falaNaTela({ dialogoId: 'nao-existe', indice: 0 }, 'ana-neutra')).toBeNull();
    const algum = Object.values(DIALOGOS)[0];
    if (algum) {
      expect(falaNaTela({ dialogoId: algum.id, indice: algum.nos.length }, 'ana-neutra')).toBeNull();
    }
  });
});

// ------------------------------------------------------------ releitura

/**
 * Um hotspot de diálogo sem nenhuma porta na frente, escolhido pelo conteúdo.
 *
 * Nada aqui é literal de propósito: as seis fases estão sendo reescritas em
 * paralelo, e um teste que cite id de hotspot reprovaria a frente de conteúdo
 * por um motivo que não é dela.
 */
function acharConversaLivre():
  | { cena: Cena; hotspot: Hotspot; dialogoId: string }
  | undefined {
  for (const cena of CENAS) {
    for (const hotspot of cena.hotspots) {
      if (hotspot.umaVezSo) continue;
      if (hotspot.requerItemPresente || hotspot.requerPuzzleResolvido) continue;
      if (hotspot.requerHotspotsFeitos && hotspot.requerHotspotsFeitos.length > 0) continue;
      const efeito = hotspot.efeitos.find((e) => e.tipo === 'dialogo');
      if (efeito && efeito.tipo === 'dialogo') {
        return { cena, hotspot, dialogoId: efeito.dialogoId };
      }
    }
  }
  return undefined;
}

/** Percorre um diálogo do começo ao fim, devolvendo o que a tela mostrou. */
function lerAteOFim(): string[] {
  const lidas: string[] = [];
  for (let passo = 0; passo < 200; passo += 1) {
    const estado = useJogo.getState();
    const fala = falaNaTela(estado.dialogoAtivo, estado.sprite);
    if (fala === null) break;
    lidas.push(`${fala.identidade === null ? '' : linhaDeNome(fala.identidade)}|${fala.no.texto}`);
    estado.avancarDialogo();
  }
  return lidas;
}

describe('diálogo pode ser relido (ADR-016)', () => {
  beforeEach(() => {
    useJogo.getState().reiniciar();
  });

  it('há conversa livre no conteúdo para exercitar', () => {
    expect(acharConversaLivre()).toBeDefined();
  });

  /**
   * O caso grave é a senha: as pistas só existem nas falas, e quem não decorou
   * não resolve. Antes, qualquer fala perdida era perdida para sempre.
   */
  it('clicar de novo no NPC mostra exatamente as mesmas falas', () => {
    const alvo = acharConversaLivre();
    if (alvo === undefined) throw new Error('conteúdo sem conversa livre');

    const jogo = useJogo.getState();
    jogo.entrarNoBloco(alvo.cena.bloco);
    useJogo.getState().entrarNoLugar(alvo.cena.lugarId);

    useJogo.getState().clicarHotspot(alvo.hotspot.id);
    const primeiraLeitura = lerAteOFim();

    useJogo.getState().clicarHotspot(alvo.hotspot.id);
    const segundaLeitura = lerAteOFim();

    expect(primeiraLeitura.length).toBeGreaterThan(0);
    expect(segundaLeitura).toEqual(primeiraLeitura);
  });

  /**
   * A caixa mostra um nó por clique, e a contagem de nós é a do conteúdo. Se
   * isto divergir, `falaNaTela` está devolvendo nó fora de faixa e a última
   * fala do diálogo não chega à tela.
   */
  it('a caixa percorre todos os nós do diálogo, nem um a menos', () => {
    const alvo = acharConversaLivre();
    if (alvo === undefined) throw new Error('conteúdo sem conversa livre');
    const definicao = DIALOGOS[alvo.dialogoId];
    expect(definicao).toBeDefined();

    useJogo.getState().entrarNoBloco(alvo.cena.bloco);
    useJogo.getState().entrarNoLugar(alvo.cena.lugarId);
    useJogo.getState().clicarHotspot(alvo.hotspot.id);

    expect(lerAteOFim()).toHaveLength(definicao?.nos.length ?? -1);
  });
});
