/**
 * Uma cena = (lugar, bloco).
 *
 * Renderiza cenário, hotspots da cena, a protagonista e o botão de voltar —
 * que é sempre visível, porque hub-and-spoke sem saída trava a apresentação.
 *
 * Fluxo de clique: a protagonista caminha até o `parada` do hotspot e só então
 * o efeito é aplicado. Clicar durante a caminhada teleporta (convenção do spec).
 *
 * O HOTSPOT É A ARTE. Até aqui cada hotspot era um `<button className="jogo-botao">`
 * com `minWidth: 260` e o rótulo dentro; consequência: NPC e item não existiam
 * visualmente, a cena era um cenário vazio com placas de texto por cima, e não
 * se sabia com quem se estava falando até clicar. Agora o botão é NU e envolve
 * o sprite; o que indica que ali há interação é a aura no hover e no foco, e o
 * nome aparece numa linha única no rodapé (ver LinhaDeFoco).
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { LUGARES, NPCS } from '../domain/content';
import type { ArteDeHotspot, Hotspot, HotspotId, Lugar } from '../domain/types';
import { assetDaArteDeHotspot, assetDoCenario } from '../assets/manifest';
import { seletores, useJogo } from '../store/jogo';
import {
  CANVAS,
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
import { LinhaDeFoco } from './LinhaDeFoco';
import { Protagonista } from './Protagonista';
import type { ComandoDeMovimento } from './Protagonista';
import { SpriteAnimado, atrasoDoId } from './SpriteAnimado';
import { POSICAO_DE_ENTRADA, folgaDeAlvo, tamanhoDaArte } from './geometriaDeCena';

/**
 * Hotspot `umaVezSo` já acionado: a store devolve silêncio, então o botão seria
 * um alvo com aura que não responde — o defeito que o spec chama de bug.
 *
 * Função exportada, e não expressão dentro do map, porque é a única regra de
 * "este alvo ainda está vivo?" do projeto e precisa ser testável sem render: em
 * SSR o zustand serve `getInitialState`, então nenhum teste de markup consegue
 * chegar a um estado com hotspot já acionado.
 */
export function hotspotInerte(hotspot: Hotspot, hotspotsFeitos: readonly HotspotId[]): boolean {
  return hotspot.umaVezSo === true && hotspotsFeitos.includes(hotspot.id);
}

/**
 * O nome que a plateia lê, com CARGO junto (ADR-015).
 *
 * Cargo acompanha o nome em TODA ocorrência, e esta é uma delas: a linha de
 * status do rodapé é onde a plateia descobre com quem a Ana vai falar antes de
 * ela falar. O cargo vem do registro `NPCS`, nunca do rótulo escrito no
 * conteúdo — o registro é a única fonte de verdade, e é o que garante que o
 * cargo não possa faltar em uma cena e estar presente em outra.
 *
 * A composição é defensiva de propósito: se o rótulo do conteúdo já traz o nome,
 * ele é preservado (o conteúdo pode querer dizer "Bianca, no celular"); se não
 * traz, o nome do registro entra. Em nenhum caminho o resultado sai sem nome e
 * sem cargo, e é por isso que esta função não pode reprovar conteúdo alheio.
 */
export function rotuloComCargo(rotulo: string, arte: ArteDeHotspot): string {
  if (arte.tipo !== 'npc') return rotulo;
  const perfil = NPCS[arte.npcId];
  const base = rotulo.includes(perfil.nome) ? rotulo : perfil.nome;
  return base.includes(perfil.cargo) ? base : `${base} · ${perfil.cargo}`;
}

/** Rende a arte de um hotspot conforme o tipo declarado no conteúdo. */
function ArteDoHotspot({
  arte,
  rotulo,
  hotspotId,
}: {
  arte: ArteDeHotspot;
  rotulo: string;
  hotspotId: HotspotId;
}): JSX.Element {
  const tamanho = tamanhoDaArte(arte);

  return (
    <SpriteAnimado
      id={assetDaArteDeHotspot(arte)}
      rotulo={rotulo}
      largura={tamanho.largura}
      altura={tamanho.altura}
      // NPC respira sempre — é o item de maior retorno da bíblia §6.2: figura
      // que respira deixa de ser adesivo. Objeto e item ficam 'estatico': só se
      // movem se a arte trouxer tira de ambiente (cursor piscando, vapor da
      // caneca). Monitor que respira lê como erro, não como vida.
      estado={arte.tipo === 'npc' ? 'parado' : 'estatico'}
      atrasoMs={atrasoDoId(hotspotId)}
      decorativo
      className="jogo-hotspot-arte"
    />
  );
}

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
  const hotspotsFeitos = useJogo((s) => s.hotspotsFeitos);

  const lugarId = tela.tipo === 'cena' ? tela.lugarId : null;

  const [comando, setComando] = useState<ComandoDeMovimento>({
    alvo: POSICAO_DE_ENTRADA,
    instantaneo: true,
    seq: 0,
  });
  const [pendente, setPendente] = useState<HotspotId | null>(null);
  const [movendo, setMovendo] = useState(false);
  /** Hotspot sob o ponteiro ou com foco. Alimenta a linha de nome do rodapé. */
  const [emFoco, setEmFoco] = useState<HotspotId | null>(null);
  /** Impede que a mesma ordem de movimento resolva duas vezes. */
  const resolvido = useRef<number>(-1);

  // Trocar de lugar recoloca a Ana na entrada, sem animação de travessia.
  useEffect(() => {
    setPendente(null);
    setMovendo(false);
    setEmFoco(null);
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

  /**
   * Nome mostrado no rodapé. Zerado quando a cena está bloqueada: se o ponteiro
   * parou sobre um NPC e um diálogo abriu, o nome dele ficaria pendurado no
   * rodapé durante a fala inteira, sem que nada na tela o explicasse.
   */
  const rotuloEmFoco =
    bloqueado || emFoco === null
      ? null
      : (() => {
          const hotspot = cena?.hotspots.find((h) => h.id === emFoco);
          return hotspot === undefined ? null : rotuloComCargo(hotspot.rotulo, hotspot.arte);
        })();

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: camada.cenario }}>
      {/* O bloco vai junto porque o mesmo lugar pode ter vestimenta por fase:
          `assetDoCenario('cafezinho', 6)` devolve a versão de FESTA. Sem passar
          o bloco, o cenário de festa existia no manifest e na pasta de arte e
          nunca chegava à tela — o mesmo defeito que já deixou a arte de item em
          cena como peso morto. */}
      <Imagem
        id={assetDoCenario(lugarId, cena?.bloco)}
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
        : cena?.hotspots.map((hotspot) => {
            const ancora = hotspot.ancora ?? 'base';
            const folga = folgaDeAlvo(tamanhoDaArte(hotspot.arte));

            /**
             * A arte FICA quando o hotspot morre (ela é parte do cenário:
             * sumir deixaria um buraco onde estava a TV), mas deixa de ser
             * botão. Ver `hotspotInerte`.
             */
            const inerte = hotspotInerte(hotspot, hotspotsFeitos);

            /** Nome com cargo: o leitor de telas ouve o mesmo que a plateia lê. */
            const rotulo = rotuloComCargo(hotspot.rotulo, hotspot.arte);

            const arte = (
              <ArteDoHotspot arte={hotspot.arte} rotulo={rotulo} hotspotId={hotspot.id} />
            );

            /**
             * Cast necessário: `--aura` é variável CSS, e `CSSProperties` não
             * tem assinatura de índice. É o jeito suportado de passar custom
             * property por estilo inline — e ela precisa vir daqui porque o CSS
             * não importa `tokens.ts`.
             *
             * `padding` com `margin` negativa de mesmo valor: a caixa do botão
             * cresce para FORA e a arte continua exatamente onde a âncora a pôs.
             * Inflar o sprite resolveria o alvo e estragaria a arte.
             */
            const estiloDoBotao = {
              '--aura': itemSelecionado === null ? cores.destaque : cores.acao,
              padding: folga,
              margin: -folga,
              cursor: 'pointer',
              /**
               * Cena bloqueada (fala, puzzle, narração, pausa do Bloco 4):
               * `acionar` já recusa o clique, mas sem isto o hotspot ainda
               * acenderia a aura ao passar o ponteiro — prometendo uma resposta
               * que não vem. A caixa de diálogo não cobre a tela inteira, então
               * dá para alcançar hotspot acima dela durante a fala.
               */
              pointerEvents: bloqueado ? 'none' : 'auto',
            } as CSSProperties;

            return (
              <Posicionado
                key={hotspot.id}
                pos={hotspot.pos}
                ancora={ancora}
                zIndex={camada.hotspot}
              >
                {inerte ? (
                  arte
                ) : (
                  <button
                    type="button"
                    className="jogo-botao-nu jogo-hotspot"
                    aria-label={
                      itemSelecionado === null
                        ? `Interagir com ${rotulo}`
                        : `Usar item selecionado em ${rotulo}`
                    }
                    onClick={() => acionar(hotspot)}
                    onMouseEnter={() => setEmFoco(hotspot.id)}
                    onMouseLeave={() => setEmFoco((atual) => (atual === hotspot.id ? null : atual))}
                    onFocus={() => setEmFoco(hotspot.id)}
                    onBlur={() => setEmFoco((atual) => (atual === hotspot.id ? null : atual))}
                    style={estiloDoBotao}
                  >
                    {arte}
                  </button>
                )}
              </Posicionado>
            );
          })}

      <Protagonista comando={comando} onChegar={aoChegar} />

      {/* Uma linha, sempre no mesmo lugar, com o nome do que está sob o
          ponteiro. É o que substituiu os retângulos de texto. */}
      <LinhaDeFoco rotulo={rotuloEmFoco} comItem={itemSelecionado !== null} />
    </div>
  );
}

export default Cena;
