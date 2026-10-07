import type { BlocoId, SpriteId } from '../types';

export interface Nivel {
  nivel: BlocoId;
  titulo: string;
  spriteAna: SpriteId;
  pasta?: boolean;
  xpPorInteracao: Readonly<Record<string, number>>;
}

// Lista explícita porque visitar um objeto decorativo não mede aprendizado.
// A abertura de puzzle fica de fora: a recompensa pertence à solução.
export const niveis: readonly Nivel[] = [
  { nivel: 1, titulo: 'Estagiária recém-contratada', spriteAna: 'ana-encolhida', xpPorInteracao: { 'dialogo:b1-tiago': 10, 'dialogo:b1-claudia': 10, 'dialogo:b1-rafael': 10, 'puzzle:senha': 20, 'hotspot:b1-tela': 10 } },
  { nivel: 2, titulo: 'Estagiária em adaptação', spriteAna: 'ana-neutra', xpPorInteracao: { 'dialogo:b2-bianca': 10, 'puzzle:associar': 20, 'dialogo:b2-rafael': 10 } },
  { nivel: 3, titulo: 'Estagiária com autonomia', spriteAna: 'ana-neutra', pasta: true, xpPorInteracao: { 'dialogo:b3-tiago': 10, 'puzzle:estruturar': 20, 'hotspot:b3-relatorio': 10, 'dialogo:b3-claudia': 10 } },
  { nivel: 4, titulo: 'Estagiária de destaque', spriteAna: 'ana-confiante', xpPorInteracao: { 'dialogo:b4-preparacao': 10, 'puzzle:montar': 20, 'hotspot:b4-plateia': 10, 'dialogo:b4-apresentacao': 10, 'dialogo:b4-reconhecimento': 10, 'dialogo:b4-virada': 10 } },
  { nivel: 5, titulo: 'Estagiária em fim de contrato', spriteAna: 'ana-confiante', pasta: true, xpPorInteracao: { 'dialogo:b5-contrato': 10, 'hotspot:b5-caderno': 10, 'hotspot:b5-grade': 10, 'dialogo:b5-pivo': 10 } },
  // A contratação só aparece no clímax: não antecipamos a Ana futura aqui.
  { nivel: 6, titulo: 'Estagiária sênior', spriteAna: 'ana-confiante', xpPorInteracao: {} },
];

export function nivelDoBloco(bloco: BlocoId): Nivel {
  return niveis.find(n => n.nivel === bloco)!;
}

export function xpTotal(bloco: BlocoId): number {
  return Object.values(nivelDoBloco(bloco).xpPorInteracao).reduce((total, peso) => total + peso, 0);
}

export function xpDasInteracoes(bloco: BlocoId, interacoes: readonly string[]): number {
  const pesos = nivelDoBloco(bloco).xpPorInteracao;
  return Math.min(xpTotal(bloco), [...new Set(interacoes)].reduce((total, id) => total + (pesos[id] ?? 0), 0));
}
