import { useEffect, useState } from 'react';
import { assetDoRetratoDaAna, assetDoSprite } from '../assets/manifest';
import { BLOCOS } from '../domain/content';
import { nivelDoBloco, xpTotal } from '../domain/content/niveis';
import { useJogo } from '../store/jogo';
import { arte, borda, camada, cores, duracao, espaco, progressao, tipografia } from '../styles/tokens';
import { Imagem } from './Imagem';
import { PastaDaAna } from './PastaDaAna';

function EfeitosNivel(): JSX.Element {
  return <style>{`
    @keyframes nivel-ganho { from { translate: 0 0; opacity: 1; } to { translate: 0 -${espaco.xl}px; opacity: 0; } }
    @keyframes nivel-brilho { 50% { box-shadow: 0 0 0 ${borda.fina}px ${cores.sucesso}; } }
    @keyframes nivel-particula { to { translate: 0 -${espaco.xxl}px; opacity: 0; } }
    @keyframes nivel-titulo { to { translate: 0 -${espaco.md}px; opacity: 0; } }
    .nivel-ganho { animation: nivel-ganho ${duracao.maxima}ms ease-out forwards; }
    .nivel-barra-cheia { animation: nivel-brilho ${duracao.maxima}ms ease-in-out infinite; }
    .nivel-particula { animation: nivel-particula ${duracao.maxima}ms ease-out infinite; }
    .nivel-titulo-antigo { animation: nivel-titulo ${progressao.inicioNovoTitulo}ms ease-in forwards; }
    @media (prefers-reduced-motion: reduce) {
      .nivel-ganho, .nivel-barra-cheia, .nivel-particula, .nivel-titulo-antigo { animation: none; }
      [role="progressbar"] > div { transition: none !important; }
      .nivel-particula { display: none; }
    }
  `}</style>;
}

function BarraXp({ atual, total }: { atual: number; total: number }): JSX.Element {
  const cheia = total === 0 || atual >= total;
  return <div role="progressbar" aria-label="Experiência de Ana" aria-valuemin={0} aria-valuemax={total || 100} aria-valuenow={total === 0 ? 100 : atual} className={cheia ? 'nivel-barra-cheia' : undefined} style={{ height: progressao.alturaBarra, border: `${borda.fina}px solid ${cheia ? cores.sucesso : cores.contorno}`, background: cores.caixa, overflow: 'hidden' }}>
    <div style={{ width: `${total === 0 ? 100 : Math.min(100, atual / total * 100)}%`, height: '100%', background: cheia ? cores.sucesso : cores.acao, transition: `width ${duracao.media}ms ease-out` }} />
  </div>;
}

export function NivelAna(): JSX.Element | null {
  const nivel = useJogo(s => s.nivel);
  const xp = useJogo(s => s.xpAtual);
  const puzzle = useJogo(s => s.puzzleAberto);
  const tela = useJogo(s => s.tela);
  const ganho = useJogo(s => s.ganhoXp);
  const [ganhoVisivel, setGanhoVisivel] = useState(false);
  useEffect(() => {
    setGanhoVisivel(ganho !== null);
    const timer = window.setTimeout(() => setGanhoVisivel(false), duracao.maxima);
    return () => window.clearTimeout(timer);
  }, [ganho]);
  if (puzzle || (tela.tipo !== 'cena' && tela.tipo !== 'mapa')) return null;
  const def = nivelDoBloco(nivel);
  const total = xpTotal(nivel);
  return <>
    <EfeitosNivel />
    <aside aria-label="Nível de Ana" style={{ position: 'absolute', right: espaco.margem, top: progressao.topoHud, width: progressao.larguraHud, padding: espaco.md, boxSizing: 'border-box', zIndex: camada.overlayPersistente, background: cores.caixa, color: cores.texto, border: `${borda.fina}px solid ${cores.contorno}`, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: espaco.sm }}>
        <Imagem id={assetDoRetratoDaAna(def.spriteAna)} rotulo="Ana" largura={progressao.retrato.largura} altura={progressao.retrato.altura} />
        <strong style={{ fontFamily: tipografia.familiaInterface, fontSize: tipografia.tamanhos.rotulo }}>NÍVEL {nivel}</strong>
      </div>
      <p style={{ margin: `${espaco.sm}px 0`, fontSize: tipografia.minimo, lineHeight: tipografia.alturaLinha.compacta }}>{def.titulo}</p>
      <BarraXp atual={xp} total={total} />
      <p style={{ margin: `${espaco.xs}px 0 0`, fontSize: tipografia.minimo }}>{total === 0 ? 'Experiência completa' : `${xp} / ${total} XP`}</p>
    </aside>
    {ganhoVisivel && ganho && tela.tipo === 'cena' && tela.lugarId === ganho.lugarId ? <span key={ganho.sequencia} role="status" className="nivel-ganho" style={{ position: 'absolute', left: `${ganho.pos.x}%`, top: `${ganho.pos.y}%`, transform: 'translate(-50%, -100%)', zIndex: camada.itemRecebido + 1, background: cores.caixa, color: cores.sucesso, border: `${borda.fina}px solid ${cores.sucesso}`, padding: espaco.sm, fontSize: tipografia.tamanhos.corpo, fontWeight: tipografia.pesos.maximo, pointerEvents: 'none' }}>+{ganho.valor} XP</span> : null}
  </>;
}

export function EvolucaoAna(): JSX.Element | null {
  const tela = useJogo(s => s.tela);
  const bloco = useJogo(s => s.bloco);
  const concluir = useJogo(s => s.concluirEvolucao);
  const [decorrido, setDecorrido] = useState(0);
  useEffect(() => {
    const inicio = Date.now();
    const intervalo = window.setInterval(() => setDecorrido(Date.now() - inicio), progressao.intervaloDigitacao);
    const fim = window.setTimeout(concluir, progressao.duracaoEvolucao);
    // Som curto de passagem, sem arquivo externo nem dependência de rede.
    let audio: AudioContext | undefined;
    try {
      audio = new AudioContext();
      const oscilador = audio.createOscillator();
      const volume = audio.createGain();
      oscilador.frequency.value = progressao.frequenciaSom;
      volume.gain.setValueAtTime(progressao.volumeSom, audio.currentTime);
      volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + progressao.duracaoSom);
      oscilador.connect(volume).connect(audio.destination);
      void audio.resume().catch(() => undefined);
      oscilador.start();
      oscilador.stop(audio.currentTime + progressao.duracaoSom);
    } catch { /* Navegador sem áudio mantém o gesto de avanço disponível. */ }
    return () => { window.clearInterval(intervalo); window.clearTimeout(fim); void audio?.close().catch(() => undefined); };
  }, [concluir]);
  if (tela.tipo !== 'evolucao') return null;
  const antigo = nivelDoBloco(bloco);
  const novo = nivelDoBloco(tela.bloco);
  const mudou = decorrido >= progressao.inicioNovoTitulo;
  const letras = Math.max(0, Math.floor((decorrido - progressao.inicioNovoTitulo) / progressao.intervaloDigitacao));
  return <button type="button" aria-label="Pular evolução de Ana" onClick={concluir} className="nivel-evolucao" style={{ position: 'absolute', inset: 0, zIndex: camada.cartao, background: cores.fundo, color: cores.texto, border: 0, fontFamily: tipografia.familia, display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', gap: espaco.md, cursor: 'pointer' }}>
    <EfeitosNivel />
    <p style={{ maxWidth: progressao.larguraEvolucao, fontSize: tipografia.tamanhos.corpo, margin: 0 }}>{BLOCOS[bloco].fechoTexto}</p>
    <strong style={{ color: cores.destaque, fontSize: tipografia.tamanhos.titulo }}>NÍVEL {mudou ? novo.nivel : antigo.nivel}</strong>
    <div style={{ width: arte.personagem.largura, height: arte.personagem.altura, position: 'relative' }}>
      <Imagem key={mudou ? novo.spriteAna : antigo.spriteAna} id={assetDoSprite(mudou ? novo.spriteAna : antigo.spriteAna)} rotulo="Ana" largura={arte.personagem.largura} altura={arte.personagem.altura} />
      <PastaDaAna nivel={mudou ? novo.nivel : antigo.nivel} largura={arte.personagem.largura} altura={arte.personagem.altura} />
      {Array.from({ length: 8 }, (_, indice) => <i key={indice} aria-hidden className="nivel-particula" style={{ position: 'absolute', left: `${indice % 2 ? 110 : -10}%`, top: `${(indice % 4) * 25}%`, width: espaco.sm, height: espaco.sm, background: indice % 2 ? cores.destaque : cores.acao, animationDelay: `${indice * progressao.intervaloDigitacao}ms` }} />)}
    </div>
    <p className={mudou ? undefined : 'nivel-titulo-antigo'} aria-label={mudou ? novo.titulo : antigo.titulo} style={{ margin: 0, height: tipografia.tamanhos.titulo, fontSize: tipografia.tamanhos.subtitulo }}>{mudou ? novo.titulo.slice(0, letras) : antigo.titulo}</p>
    <div style={{ width: progressao.larguraEvolucao }}><BarraXp atual={mudou ? 0 : xpTotal(bloco)} total={mudou ? xpTotal(novo.nivel) : xpTotal(bloco)} /></div>
    <span style={{ fontSize: tipografia.minimo, color: cores.textoApoio }}>Clique para continuar</span>
  </button>;
}
