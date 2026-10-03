/** O monólogo tem sequência própria: não aciona os efeitos dos diálogos. */
import { useEffect, useRef, useState } from 'react';
import { REFLEXOES } from '../domain/content/reflexoes';
import { assetDoRetratoDaAna } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { alvo, borda, camada, caixaDeDialogo, cores, duracao, espaco, tipografia } from '../styles/tokens';
import { Imagem } from './Imagem';

export function Reflexao(): JSX.Element | null {
  const bloco = useJogo(s => s.bloco);
  const ativa = useJogo(s => s.reflexaoAtiva);
  const sprite = useJogo(s => s.sprite);
  const avancar = useJogo(s => s.avancarReflexao);
  const pular = useJogo(s => s.pularReflexao);
  const [ganchoVisivel, setGanchoVisivel] = useState(false);
  const regiao = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ativa) regiao.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [ativa?.etapa]);
  useEffect(() => {
    if (ativa?.indice === 0) setGanchoVisivel(false);
    if (ativa?.etapa !== 'tempo') return undefined;
    const id = window.setTimeout(avancar, duracao.maxima);
    return () => window.clearTimeout(id);
  }, [ativa?.etapa, ativa?.indice, avancar]);
  useEffect(() => {
    if (!ativa) return undefined;
    const aoTeclar = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
      if (e.key === 'Escape') { e.preventDefault(); pular(); }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [ativa, avancar, pular]);
  if (!ativa) return null;
  const dados = REFLEXOES[bloco];
  return <div role="dialog" aria-modal="true" aria-label={ativa.etapa === 'tempo' ? 'Entrada do bloco' : 'Ana · pensando'}
    ref={regiao} onKeyDown={evento => {
      // Tab não pode levar o foco a um NPC que a reflexão ainda bloqueia.
      if (evento.key !== 'Tab') return;
      const botoes = [...(regiao.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
      const indice = botoes.indexOf(document.activeElement as HTMLButtonElement);
      const proximo = (indice + (evento.shiftKey ? -1 : 1) + botoes.length) % botoes.length;
      evento.preventDefault();
      botoes[proximo]?.focus();
    }}
    style={{ position: 'absolute', inset: 0, zIndex: camada.pausa }}>
    {ativa.etapa === 'tempo' ? <button className="jogo-botao" onClick={avancar} style={{ position: 'absolute', left: '25%', right: '25%', top: '30%', background: cores.caixa, color: cores.texto, fontSize: tipografia.tamanhos.titulo }}>
      Bloco {bloco} · {dados.tempo}
    </button> : <>
      <button type="button" onClick={avancar} aria-label="Avançar pensamento de Ana" style={{ position: 'absolute', left: caixaDeDialogo.esquerda, top: caixaDeDialogo.topo, width: caixaDeDialogo.largura + caixaDeDialogo.retrato.largura, minHeight: caixaDeDialogo.altura, padding: espaco.md, display: 'flex', alignItems: 'center', gap: espaco.md, border: `${borda.media}px dashed ${cores.destaque}`, background: cores.veu, color: cores.texto, textAlign: 'left' }}>
        <Imagem id={assetDoRetratoDaAna(sprite)} rotulo="Ana pensando" largura={caixaDeDialogo.retrato.largura} altura={caixaDeDialogo.retrato.altura} mostrarRotulo={false} decorativo />
        <span>
          <strong style={{ display: 'block', color: cores.destaque, fontSize: tipografia.tamanhos.corpo }}>Ana · pensando</strong>
          <em style={{ fontSize: tipografia.tamanhos.corpo, lineHeight: tipografia.alturaLinha.corpo }}>{ganchoVisivel ? dados.gancho : dados.falas[ativa.indice]}</em>
          <span aria-hidden style={{ display: 'block', textAlign: 'right', color: cores.destaque }}>▶</span>
        </span>
      </button>
      {ativa.indice === dados.falas.length - 1 && !ganchoVisivel ? <button type="button" className="jogo-botao" onClick={() => setGanchoVisivel(true)} style={{ position: 'absolute', left: espaco.margem, bottom: espaco.md, minHeight: alvo.minimo, background: cores.caixa, fontSize: tipografia.tamanhos.apoio }}>Pergunta para a conversa</button> : null}
    </>}
    <button type="button" className="jogo-botao" onClick={pular} style={{ position: 'absolute', right: espaco.margem, bottom: espaco.md, minHeight: alvo.minimo, background: cores.caixa, fontSize: tipografia.tamanhos.apoio }}>Pular reflexão</button>
  </div>;
}
