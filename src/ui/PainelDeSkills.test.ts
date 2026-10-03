import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SKILLS } from '../domain/content';
import { barra, borda, CANVAS, espaco, overlay, tipografia } from '../styles/tokens';
import { aberturaNaFase, aberturaAoConquistar, PainelDeSkillsVisual, proximaAberta } from './PainelDeSkills';

const skills = Object.values(SKILLS);
function renderizar(aberta: typeof skills[number]['id'] | null, vazio = false): string {
  return renderToStaticMarkup(createElement(PainelDeSkillsVisual, { skills: vazio ? [] : skills, aberta, aoAlternar: () => undefined }));
}
describe('habilidades na barra inferior', () => {
  it('reserva slots vazios desde o início', () => {
    expect(renderizar(null, true).match(/Espaço vazio de habilidade/g)).toHaveLength(barra.slotsHabilidades);
  });
  it('as nove habilidades são clicáveis e não arrastáveis', () => {
    const html = renderizar(null);
    expect(html.match(/<button/g)).toHaveLength(skills.length);
    expect(html.match(/draggable="false"/g)).toHaveLength(skills.length);
    for (const skill of skills) expect(html).toContain(skill.nome);
  });
  it('a descrição ocupa a mesma zona, sem posição absoluta sobre a cena', () => {
    for (const skill of skills) {
      const html = renderizar(skill.id);
      expect(html).toContain(skill.texto.replace(/'/g, '&#x27;'));
      expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
      expect(html).not.toContain('position:absolute');
      for (const outra of skills) if (outra !== skill) expect(html).not.toContain(outra.texto);
    }
  });
  it('as três fileiras cabem e a barra ocupa menos de 14% da tela', () => {
    const altura = 3 * barra.alturaSelo + 2 * borda.fina + tipografia.minimo * tipografia.alturaLinha.compacta + 2 * espaco.xs + borda.grossa;
    expect(altura).toBeLessThanOrEqual(overlay.barraDeItens);
    expect(overlay.barraDeItens / CANVAS.altura).toBeLessThanOrEqual(0.14);
  });
  it('respeita o piso tipográfico', () => {
    const tamanhos = [...renderizar(null).matchAll(/font-size:(\d+)px/g)].map(m => Number(m[1]));
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(tipografia.minimo);
  });
  it('abre uma por vez e fecha ao repetir o clique', () => {
    expect(proximaAberta(null, 'proatividade')).toBe('proatividade');
    expect(proximaAberta('proatividade', 'visibilidade')).toBe('visibilidade');
    expect(proximaAberta('visibilidade', 'visibilidade')).toBeNull();
  });
  it('a retrospectiva começa no caderno', () => {
    const ids = skills.map(s => s.id);
    expect(aberturaAoConquistar([])).toBeNull();
    expect(aberturaNaFase(5, false, ids)).toBeNull();
    expect(aberturaNaFase(5, true, ids)).toBe(ids[ids.length - 1]);
  });
});
