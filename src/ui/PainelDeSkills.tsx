/** Selos na barra: a retrospectiva continua clicável sem cobrir o elenco. */
import { useEffect, useRef, useState } from 'react';
import { SKILLS } from '../domain/content';
import type { Skill, SkillId } from '../domain/types';
import { useJogo } from '../store/jogo';
import { barra, borda, cores, duracao, espaco, tipografia } from '../styles/tokens';

/** Rótulos curtos para exposição; os nomes canônicos permanecem no contexto. */
export const NOMES_DOS_SELOS: Record<SkillId, string> = {
  'coragem-perguntar': 'Coragem de perguntar', autoconhecimento: 'Autoconhecimento',
  'leitura-mercado': 'Leitura do trabalho', 'aprendizado-continuo': 'Aprendizado contínuo',
  'competencia-tecnica': 'Conhecimento aplicado', proatividade: 'Proatividade',
  protagonismo: 'Protagonismo', visibilidade: 'Visibilidade', 'plano-futuro': 'Plano de futuro',
};
const SIMBOLOS = ['?', '◎', '◈', '↗', '⚒', '⚡', '★', '◉', '➜'];
export function proximaAberta(atual: SkillId | null, clicada: SkillId): SkillId | null {
  return atual === clicada ? null : clicada;
}
export function aberturaAoConquistar(skills: readonly SkillId[]): SkillId | null {
  return skills[skills.length - 1] ?? null;
}
export function aberturaNaFase(bloco: number, cadernoVisto: boolean, skills: readonly SkillId[]): SkillId | null {
  return bloco === 5 && !cadernoVisto ? null : aberturaAoConquistar(skills);
}
export interface PropsPainelDeSkills {
  skills: readonly Skill[];
  aberta: SkillId | null;
  aoAlternar: (id: SkillId) => void;
  destaque?: boolean;
  nova?: SkillId | null;
}
export function PainelDeSkillsVisual({ skills, aberta, aoAlternar, destaque, nova }: PropsPainelDeSkills): JSX.Element {
  const descricao = skills.find((s) => s.id === aberta);
  return <section aria-label="Habilidades" style={{ flex: 1, minWidth: 0, borderLeft: `${borda.media}px solid ${cores.contorno}`, paddingLeft: espaco.md }}>
    <h2 style={{ fontSize: tipografia.minimo, lineHeight: tipografia.alturaLinha.compacta, color: cores.destaque }}>Habilidades</h2>
    {descricao ? <button type="button" className="jogo-botao-nu" aria-expanded="true" onClick={() => aoAlternar(descricao.id)}
      style={{ width: '100%', height: barra.item.altura, background: cores.caixa, color: cores.texto, padding: espaco.sm, textAlign: 'left', fontFamily: tipografia.familia, fontSize: tipografia.tamanhos.corpo }}>
      <strong style={{ color: cores.destaque }}>{descricao.nome} · </strong>{descricao.texto}
      <span style={{ display: 'block', fontSize: tipografia.minimo, color: cores.textoApoio }}>Clique para voltar aos selos ◀</span>
    </button> : <ul style={{ display: 'grid', gridTemplateColumns: `repeat(${barra.colunasHabilidades}, 1fr)`, gap: borda.fina }}>
      {Array.from({ length: barra.slotsHabilidades }, (_, indice) => {
        const skill = skills[indice];
        return <li key={indice} style={{ height: barra.alturaSelo }}>
          {skill ? <button type="button" className={`jogo-botao-nu${nova === skill.id ? ' jogo-selo-pousa' : ''}`} draggable={false}
            aria-expanded="false" aria-label={`${skill.nome}. Abrir para ler.`} title={skill.nome}
            onClick={() => aoAlternar(skill.id)} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: espaco.xs, background: cores.caixa, color: destaque ? cores.destaque : cores.texto, fontSize: tipografia.minimo, textAlign: 'left' }}>
            <span aria-hidden style={{ display: 'inline-flex', flexShrink: 0, justifyContent: 'center', alignItems: 'center', width: barra.alturaSelo, height: barra.alturaSelo, border: `${borda.interface}px solid ${cores.destaque}`, borderRadius: '50%', color: cores.destaque }}>{SIMBOLOS[indice]}</span>
            {NOMES_DOS_SELOS[skill.id]}
          </button> : <span aria-label="Espaço vazio de habilidade" style={{ display: 'block', height: '100%', border: `${borda.interface}px dashed ${cores.silhuetaContorno}`, borderRadius: barra.alturaSelo }} />}
        </li>;
      })}
    </ul>}
  </section>;
}
export function PainelDeSkills(): JSX.Element {
  const ids = useJogo((s) => s.skills);
  const cadernoVisto = useJogo((s) => s.bloco === 5 && s.hotspotsFeitos.includes('b5-caderno'));
  const [aberta, setAberta] = useState<SkillId | null>(null);
  const anteriores = useRef(ids);
  const [nova, setNova] = useState<SkillId | null>(null);
  useEffect(() => {
    const ganhou = ids.length > anteriores.current.length;
    anteriores.current = ids;
    if (!ganhou) return undefined;
    setNova(aberturaAoConquistar(ids));
    const id = window.setTimeout(() => setNova(null), duracao.maxima);
    return () => window.clearTimeout(id);
  }, [ids]);
  useEffect(() => {
    setAberta(cadernoVisto ? aberturaAoConquistar(ids) : null);
  }, [cadernoVisto]);
  return <PainelDeSkillsVisual skills={ids.map((id) => SKILLS[id])} aberta={aberta} nova={nova}
    aoAlternar={(id) => setAberta((atual) => proximaAberta(atual, id))} />;
}
