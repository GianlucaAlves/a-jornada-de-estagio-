/**
 * Uma cena = (lugar, bloco).
 *
 * Renderiza cenário, hotspots da cena, a protagonista e o botão de voltar —
 * que é sempre visível, porque hub-and-spoke sem saída trava a apresentação.
 *
 * Fluxo de clique: a protagonista caminha até o `parada` do hotspot e só então
 * o efeito é aplicado. Clicar durante a caminhada teleporta (convenção do spec).
 */
import { useEffect, useRef, useState } from 'react';
import { LUGARES } from '../domain/content';
import type { Hotspot, HotspotId, Lugar, Ponto } from '../domain/types';
import { assetDoCenario } from '../assets/manifest';
import { seletores, useJogo } from '../store/jogo';
import {
  CANVAS,
  alvo,
  borda,
  camada,
  cores,
  duracao,
  easing,
  espaco,
  raio,
  tipografia,
} from '../styles/tokens';
import { Imagem } from './Imagem';
import { Posicionado } from './Canvas';
import { Protagonista } from './Protagonista';
import type { ComandoDeMovimento } from './Protagonista';

/** Onde a Ana entra em qualquer cena. Sem pathfinding: só um ponto de partida. */
const POSICAO_DE_ENTRADA: Ponto = { x: 16, y: 82 };

export function Cena(): JSX.Element | null {
  const tela = useJogo((s) => s.tela);
  const cena = useJogo(seletores.cenaAtual);
  const clicarHotspot = useJogo((s) => s.clicarHotspot);
  const voltarAoMapa = useJogo((s) => s.voltarAoMapa);
  const itemSelecionado = useJogo((s) => s.itemSelecionado);
  const dialogoAtivo = useJogo((s) => s.dialogoAtivo);
  const puzzleAberto = useJogo((s) => s.puzzleAberto);
  const narracao = useJogo((s) => s.narracao);
  const mensagemFalha = useJogo((s) => s.mensagemFalha);
  const pausaBloco4 = useJogo((s) => s.pausaBloco4);
  const lugares = useJogo((s) => s.lugares);

  const lugarId = tela.tipo === 'cena' ? tela.lugarId : null;

  const [comando, setComando] = useState<ComandoDeMovimento>({
    alvo: POSICAO_DE_ENTRADA,
    instantaneo: true,
    seq: 0,
  });
  const [pendente, setPendente] = useState<HotspotId | null>(null);
  const [movendo, setMovendo] = useState(false);
  /** Impede que a mesma ordem de movimento resolva duas vezes. */
  const resolvido = useRef<number>(-1);

  // Trocar de lugar recoloca a Ana na entrada, sem animação de travessia.
  useEffect(() => {
    setPendente(null);
    setMovendo(false);
    setComando((c) => ({ alvo: POSICAO_DE_ENTRADA, instantaneo: true, seq: c.seq + 1 }));
  }, [lugarId]);

  if (lugarId === null) return null;

  const lugar: Lugar | undefined = LUGARES[lugarId];
  const bloqueado =
    dialogoAtivo !== null || puzzleAberto !== null || narracao !== null || mensagemFalha !== null || pausaBloco4 === 'rodando';

  /**
   * Lugar concluído NÃO renderiza hotspot nenhum.
   *
   * `clicarHotspot` recusa o clique quando o lugar está 'concluido', e hotspot
   * que não responde parece bug quando projetado (o spec rejeitou isso
   * explicitamente). Revisita é só cenário + linha de eco (que vem por
   * `narracao`, posta por `entrarNoLugar`) + botão de voltar.
   */
  const lugarConcluido = lugares[lugarId] === 'concluido';

  /**
   * Saída recusada pela store enquanto há diálogo, puzzle ou a pausa do Bloco 4.
   * Mesmo raciocínio do hotspot morto: botão visível que não responde parece
   * bug. A caixa de diálogo não cobre o canto do botão, então ele fica à vista —
   * por isso `disabled` com aria-label que diz o motivo, em vez de esconder: o
   * botão nunca muda de lugar, e o apresentador vê que a saída é só temporária.
   */
  const saidaBloqueada =
    dialogoAtivo !== null || puzzleAberto !== null || pausaBloco4 === 'rodando';
  const rotuloDaSaida =
    pausaBloco4 === 'rodando'
      ? 'Voltar ao mapa. Indisponível durante a pausa.'
      : puzzleAberto !== null
        ? 'Voltar ao mapa. Indisponível com um desafio aberto: termine o desafio primeiro.'
        : dialogoAtivo !== null
          ? 'Voltar ao mapa. Indisponível durante a conversa: termine a conversa primeiro.'
          : 'Voltar ao mapa';

  function acionar(hotspot: Hotspot): void {
    if (bloqueado) return;
    // Clique durante a caminhada TELEPORTA ao destino em vez de enfileirar.
    const teleportar = movendo;
    setPendente(hotspot.id);
    setComando((c) => ({ alvo: hotspot.parada, instantaneo: teleportar, seq: c.seq + 1 }));
    setMovendo(!teleportar);
  }

  function aoChegar(): void {
    if (resolvido.current === comando.seq) return;
    resolvido.current = comando.seq;
    setMovendo(false);
    if (pendente !== null) {
      clicarHotspot(pendente);
      setPendente(null);
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: camada.cenario }}>
      <Imagem
        id={assetDoCenario(lugarId)}
        rotulo={lugar?.nome ?? 'Cenário'}
        largura={CANVAS.largura}
        altura={CANVAS.altura}
        decorativo
        mostrarRotulo={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <h1
        style={{
          position: 'absolute',
          left: '50%',
          top: espaco.margem,
          transform: 'translateX(-50%)',
          zIndex: camada.hotspot,
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.maximo,
          color: cores.texto,
          background: cores.veuLeve,
          padding: `${espaco.sm}px ${espaco.lg}px`,
          borderRadius: raio.md,
          whiteSpace: 'nowrap',
        }}
      >
        {lugar?.nome ?? 'Lugar'}
      </h1>

      <button
        type="button"
        className="jogo-botao"
        aria-label={rotuloDaSaida}
        disabled={saidaBloqueada}
        onClick={voltarAoMapa}
        style={{
          position: 'absolute',
          left: espaco.margem,
          top: espaco.margem,
          zIndex: camada.hotspot + 1,
          minWidth: 320,
          opacity: saidaBloqueada ? 0.4 : 1,
          transition: `opacity ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        <span aria-hidden>◀</span> Voltar ao mapa
      </button>

      {lugarConcluido
        ? null
        : cena?.hotspots.map((hotspot) => (
            <Posicionado key={hotspot.id} pos={hotspot.pos} ancora="centro" zIndex={camada.hotspot}>
              <button
                type="button"
                className="jogo-botao"
                aria-label={
                  itemSelecionado === null
                    ? `Interagir com ${hotspot.rotulo}`
                    : `Usar item selecionado em ${hotspot.rotulo}`
                }
                onClick={() => acionar(hotspot)}
                style={{
                  minHeight: alvo.confortavel,
                  minWidth: 260,
                  maxWidth: 520,
                  background: cores.veu,
                  border: `${itemSelecionado === null ? borda.media : borda.grossa}px solid ${
                    itemSelecionado === null ? cores.contorno : cores.acao
                  }`,
                  borderRadius: raio.lg,
                  textAlign: 'center',
                  transition: `border-color ${duracao.curta}ms ${easing.suave}`,
                }}
              >
                {hotspot.rotulo}
              </button>
            </Posicionado>
          ))}

      <Protagonista comando={comando} onChegar={aoChegar} />
    </div>
  );
}

export default Cena;
