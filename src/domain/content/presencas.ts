/** A pessoa persiste; os hotspots são apenas os assuntos disponíveis com ela. */
import { CENAS, DIALOGOS } from './index';
import type { BlocoId, LugarId, NpcId, Ponto } from '../types';

export interface PresencaNpc {
  posicaoAtual: Ponto;
  visivel: boolean;
  movimento?: { origem: Ponto; destino: Ponto; proximos?: Ponto[]; visivelAoChegar: boolean };
}
export type PresencasNpcs = Record<string, PresencaNpc>;
export const chaveDaPresenca = (bloco: BlocoId, lugar: LugarId, npc: NpcId): string => `${bloco}:${lugar}:${npc}`;

export function presencasIniciais(): PresencasNpcs {
  const resultado: PresencasNpcs = {};
  for (const cena of CENAS) for (const hotspot of cena.hotspots) {
    if (hotspot.arte.tipo !== 'npc') continue;
    const chave = chaveDaPresenca(cena.bloco, cena.lugarId, hotspot.arte.npcId);
    // Dois assuntos da Bianca não significam duas Biancas no mesmo escritório.
    resultado[chave] ??= { posicaoAtual: hotspot.pos, visivel: true };
  }
  return resultado;
}

interface MarcaDeDialogo { inicial: Ponto; final: Ponto; visivelAoFinal: boolean; via?: Ponto[] }
const marcas: Record<string, Partial<Record<NpcId, MarcaDeDialogo>>> = {
  'b4-preparacao': { marcos: { inicial: { x: 86, y: 70 }, final: { x: 106, y: 70 }, visivelAoFinal: false } },
  // A fileira de cadeiras impede uma saída horizontal no y do palco.
  'b4-reconhecimento': { claudia: { inicial: { x: 34, y: 62 }, final: { x: -6, y: 70 }, via: [{ x: 34, y: 70 }], visivelAoFinal: false } },
  'b4-virada': { bianca: { inicial: { x: 11, y: 70 }, final: { x: -6, y: 70 }, visivelAoFinal: false } },
  'b5-pivo': { bianca: { inicial: { x: 44, y: 70 }, final: { x: 44, y: 70 }, visivelAoFinal: true } },
};

/** Cada diálogo registra entrada e saída mesmo quando a pessoa fica no lugar. */
export const POSICOES_DOS_DIALOGOS = Object.fromEntries(Object.values(DIALOGOS).map(dialogo => {
  const cena = CENAS.find(c => c.hotspots.some(h => [...h.efeitos, ...(h.efeitosComItem ?? [])].some(e => e.tipo === 'dialogo' && e.dialogoId === dialogo.id)));
  const presencas = presencasIniciais();
  const npcs = [...new Set(dialogo.nos.map(no => no.quem).filter((id): id is NpcId => ['rafael', 'claudia', 'tiago', 'bianca', 'marcos'].includes(id)))];
  return [dialogo.id, cena ? npcs.map(npcId => {
    const chave = chaveDaPresenca(cena.bloco, cena.lugarId, npcId);
    const pos = presencas[chave]?.posicaoAtual;
    if (!pos) throw new Error(`Fala de ${npcId} sem presença na cena de ${dialogo.id}`);
    return { chave, npcId, ...(marcas[dialogo.id]?.[npcId] ?? { inicial: pos, final: pos, visivelAoFinal: true }) };
  }) : []];
}));

export function marcarDialogo(presencas: PresencasNpcs, dialogoId: string, etapa: 'inicial' | 'final'): PresencasNpcs {
  const resultado = { ...presencas };
  for (const marca of POSICOES_DOS_DIALOGOS[dialogoId] ?? []) {
    const atual = resultado[marca.chave] ?? { posicaoAtual: marca.inicial, visivel: true };
    const destino = marca[etapa];
    const visivelAoChegar = etapa === 'inicial' || marca.visivelAoFinal;
    if (atual.visivel === visivelAoChegar && atual.posicaoAtual.x === destino.x && atual.posicaoAtual.y === destino.y && !atual.movimento) continue;
    const percurso = etapa === 'final' ? [...(marca.via ?? []), destino] : !atual.visivel ? [...(marca.via ?? []).slice().reverse(), destino] : [destino];
    resultado[marca.chave] = { posicaoAtual: atual.posicaoAtual, visivel: true, movimento: { origem: atual.posicaoAtual, destino: percurso[0]!, proximos: percurso.slice(1), visivelAoChegar } };
  }
  return resultado;
}

/** A troca de cena cobre o fim de uma caminhada; a revisita não reabre a entrada. */
export function assentarPresencas(presencas: PresencasNpcs): PresencasNpcs {
  return Object.fromEntries(Object.entries(presencas).map(([chave, p]) => [chave, p.movimento ? { posicaoAtual: p.movimento.proximos?.[p.movimento.proximos.length - 1] ?? p.movimento.destino, visivel: p.movimento.visivelAoChegar } : p]));
}
