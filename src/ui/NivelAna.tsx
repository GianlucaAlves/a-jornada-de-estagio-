import { useEffect, useState } from 'react';
import { assetDoRetratoDaAna, assetDoSprite } from '../assets/manifest';
import { BLOCOS, LUGARES } from '../domain/content';
import { REFLEXOES } from '../domain/content/reflexoes';
import { nivelDoBloco, xpTotal } from '../domain/content/niveis';
import { useJogo } from '../store/jogo';
import { arte, borda, camada, cores, duracao, espaco, progressao, tipografia } from '../styles/tokens';
import { Imagem } from './Imagem';

function EfeitosNivel(): JSX.Element {
  return <style>{`
    @keyframes nivel-ganho { from { transform: scale(.9); } to { transform: scale(1); } }
    @keyframes nivel-pose { 0% { transform: translateY(${espaco.md}px); } 45% { transform: translateY(-${espaco.md}px); } 100% { transform: translateY(0); } }
    @keyframes nivel-raios { from { transform: scale(.75); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .nivel-raios { animation: nivel-raios ${duracao.maxima}ms steps(6) both; }
    .nivel-pose { animation: nivel-pose ${duracao.maxima}ms steps(6) both; }
    @keyframes nivel-brilho { 50% { box-shadow: 0 0 0 ${borda.fina}px ${cores.sucesso}; } }
    @keyframes nivel-particula { to { translate: 0 -${espaco.xxl}px; opacity: 0; } }
    @keyframes nivel-titulo { to { translate: 0 -${espaco.md}px; opacity: 0; } }
    .nivel-ganho { animation: nivel-ganho ${duracao.curta}ms steps(4) forwards; }
    .nivel-barra-cheia { animation: nivel-brilho ${duracao.maxima}ms ease-in-out infinite; }
    .nivel-particula { animation: nivel-particula ${duracao.maxima}ms ease-out infinite; }
    .nivel-titulo-antigo { animation: nivel-titulo ${progressao.inicioNovoTitulo}ms ease-in forwards; }
    @media (prefers-reduced-motion: reduce) {
      .nivel-raios, .nivel-pose, .nivel-ganho, .nivel-barra-cheia, .nivel-particula, .nivel-titulo-antigo { animation: none; }
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
  const ocupado = useJogo(s => Boolean(s.dialogoAtivo || s.reflexaoAtiva || s.narracao || s.mensagemFalha || s.itensRecebidos.length || s.puzzleAberto || s.mensagemConclusao || s.pausaBloco4 === 'rodando'));
  type Ganho = NonNullable<ReturnType<typeof useJogo.getState>['ganhoXp']>;
  const [fila, setFila] = useState<Ganho[]>([]);
  // A assinatura captura também ganhos consecutivos no mesmo quadro React.
  // O relógio só começa quando a plateia tem uma tela livre para enxergá-los.
  useEffect(() => useJogo.subscribe((atual, anterior) => {
    if (atual.bloco !== anterior.bloco || (atual.ganhoXp === null && anterior.ganhoXp !== null)) setFila([]);
    else if (atual.ganhoXp !== anterior.ganhoXp) setFila(f => [...f, atual.ganhoXp!]);
  }), []);
  const ganho = fila[0];
  useEffect(() => {
    if (ocupado || !ganho) return;
    const timer = window.setTimeout(() => setFila(f => f.slice(1)), progressao.leituraGanho);
    return () => window.clearTimeout(timer);
  }, [ganho, ocupado]);
  if (puzzle || (tela.tipo !== 'cena' && tela.tipo !== 'mapa')) return null;
  const def = nivelDoBloco(nivel);
  const total = xpTotal(nivel);
  return <>
    <EfeitosNivel />
    <aside aria-label="Nível de Ana" style={{ position: 'absolute', right: espaco.margem, top: progressao.topoHud, width: progressao.larguraHud, padding: espaco.md, boxSizing: 'border-box', zIndex: camada.overlayPersistente, background: cores.caixa, color: cores.texto, border: `${borda.fina}px solid ${cores.contorno}`, pointerEvents: 'none' }}>
      <h1 style={{ margin: 0, fontFamily: tipografia.familiaInterface, fontSize: tipografia.tamanhos.rotulo, lineHeight: tipografia.alturaLinha.compacta }}>{tela.tipo === 'cena' ? LUGARES[tela.lugarId].nome : 'Mapa da jornada'}</h1>
      <p style={{ margin: `${espaco.xs}px 0 ${espaco.sm}px`, color: cores.textoApoio, fontSize: tipografia.minimo }}>Bloco {nivel} · {REFLEXOES[nivel].tempo}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: espaco.sm }}>
        <Imagem id={assetDoRetratoDaAna(def.spriteAna)} rotulo="Ana" largura={progressao.retrato.largura} altura={progressao.retrato.altura} />
        <strong style={{ fontFamily: tipografia.familiaInterface, fontSize: tipografia.tamanhos.rotulo }}>NÍVEL {nivel}</strong>
      </div>
      <p style={{ margin: `${espaco.sm}px 0`, fontSize: tipografia.minimo, lineHeight: tipografia.alturaLinha.compacta }}>{def.titulo}</p>
      <BarraXp atual={xp} total={total} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: espaco.xl, marginTop: espaco.xs, fontSize: tipografia.minimo }}><span>{total === 0 ? 'Experiência completa' : `${xp} / ${total} XP`}</span>
      {ganho && !ocupado ? <strong key={ganho.sequencia} role="status" className="nivel-ganho" style={{ padding: espaco.xs, background: cores.sucesso, color: cores.textoInverso }}>+{ganho.valor} XP</strong> : null}</div>
    </aside>
  </>;
}

export function EvolucaoAna(): JSX.Element | null {
  const tela = useJogo(s => s.tela);
  const bloco = useJogo(s => s.bloco);
  const concluir = useJogo(s => s.concluirEvolucao);
  const [decorrido, setDecorrido] = useState(0);
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    const inicio = Date.now();
    const intervalo = window.setInterval(() => setDecorrido(Date.now() - inicio), progressao.intervaloDigitacao);
    // O apresentador decide quando sair: temporizar a saída cortava a leitura
    // dos títulos longos e a observação do figurino recém-revelado.
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
    return () => { window.clearInterval(intervalo); void audio?.close().catch(() => undefined); };
  }, [concluir]);
  if (tela.tipo !== 'evolucao') return null;
  const antigo = nivelDoBloco(bloco);
  const novo = nivelDoBloco(tela.bloco);
  const mudou = reduzido || decorrido >= progressao.inicioNovoTitulo;
  const letras = Math.max(0, Math.floor((decorrido - progressao.inicioNovoTitulo) / progressao.intervaloDigitacao));
  return <button type="button" aria-label="Pular evolução de Ana" onClick={concluir} className="nivel-evolucao" style={{ position: 'absolute', inset: 0, zIndex: camada.cartao, background: cores.fundo, color: cores.texto, border: 0, fontFamily: tipografia.familia, display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', gap: espaco.md, cursor: 'pointer' }}>
    <EfeitosNivel />
    <p style={{ maxWidth: progressao.larguraEvolucao, fontSize: tipografia.tamanhos.corpo, margin: 0 }}>{BLOCOS[bloco].fechoTexto}</p>
    <strong style={{ color: cores.destaque, fontSize: tipografia.tamanhos.titulo }}>NÍVEL {mudou ? novo.nivel : antigo.nivel}</strong>
    <div style={{ width: progressao.palco, height: arte.personagem.altura + espaco.lg, position: 'relative', display: 'flex', justifyContent: 'center', borderBottom: `${borda.grossa}px solid ${cores.acao}` }}>
      <svg key={mudou ? 'novo' : 'antigo'} className="nivel-raios" aria-hidden="true" viewBox="0 0 440 368" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <path d="M220 6L354 76V244L220 330L86 244V76Z" fill={cores.painel} stroke={mudou ? cores.destaque : cores.acao} strokeWidth={borda.grossa} />
        {mudou ? <g fill={cores.acao}><path d="M64 20L104 76L80 88L34 38Z M376 20L336 76L360 88L406 38Z M16 158H70V178H16Z M370 158H424V178H370Z M40 274L86 238L100 256L54 294Z M400 274L354 238L340 256L386 294Z" /></g> : null}
        <path d="M88 338H352L388 356H52Z" fill={cores.silhuetaContorno} />
      </svg>
      <div key={mudou ? 'conquista' : 'preparacao'} className={mudou ? 'nivel-pose' : undefined} style={{ position: 'relative', width: arte.personagem.largura }}>
      <Imagem id={mudou ? !reduzido && decorrido < progressao.revelarVisual ? 'ana-celebrando' : `ana-nivel-${novo.nivel}` : assetDoSprite(antigo.spriteAna)} rotulo="Ana celebrando a evolução" largura={arte.personagem.largura} altura={arte.personagem.altura} />
      </div>
      {Array.from({ length: 8 }, (_, indice) => <i key={indice} aria-hidden className="nivel-particula" style={{ position: 'absolute', left: `${indice % 2 ? 110 : -10}%`, top: `${(indice % 4) * 25}%`, width: espaco.sm, height: espaco.sm, background: indice % 2 ? cores.destaque : cores.acao, animationDelay: `${indice * progressao.intervaloDigitacao}ms` }} />)}
    </div>
    <p className={mudou ? undefined : 'nivel-titulo-antigo'} aria-label={mudou ? novo.titulo : antigo.titulo} style={{ margin: 0, minHeight: tipografia.tamanhos.titulo, maxWidth: progressao.larguraEvolucao, fontSize: tipografia.tamanhos.subtitulo }}>{mudou ? reduzido ? novo.titulo : novo.titulo.slice(0, letras) : antigo.titulo}</p>
    <div style={{ width: progressao.larguraEvolucao }}><BarraXp atual={mudou ? 0 : xpTotal(bloco)} total={mudou ? xpTotal(novo.nivel) : xpTotal(bloco)} /></div>
    <span style={{ fontSize: tipografia.minimo, color: cores.textoApoio }}>Clique para continuar</span>
  </button>;
}
