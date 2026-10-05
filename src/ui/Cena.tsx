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
import { CENAS, LUGARES, NPCS, PUZZLES } from '../domain/content';
import { chaveDaPresenca, presencasIniciais } from '../domain/content/presencas';
import { PresencaEmCena } from './PresencaEmCena';
import type { ArteDeHotspot, Hotspot, HotspotId, Lugar } from '../domain/types';
import { assetDaArteDeHotspot, assetDoCenario } from '../assets/manifest';
import { seletores, useJogo } from '../store/jogo';
import {
  CANVAS,
  alvo,
  apresentacao,
  borda,
  camada,
  cores,
  duracao,
  easing,
  espaco,
  movimento,
  overlay,
  raio,
  tipografia,
} from '../styles/tokens';
import { Imagem } from './Imagem';
import { Posicionado } from './Canvas';
import { LinhaDeFoco } from './LinhaDeFoco';
import { Protagonista } from './Protagonista';
import { IconeJornada } from './IconeJornada';
import { VidaDoCenario } from './VidaDoCenario';
import { QuadroSTAR } from './QuadroSTAR';
import type { ComandoDeMovimento } from './Protagonista';
import { SpriteAnimado, atrasoDoId } from './SpriteAnimado';
import { folgaDeAlvo, posicaoDeEntrada, tamanhoDaArte } from './geometriaDeCena';

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
  andando = false,
}: {
  arte: ArteDeHotspot;
  rotulo: string;
  hotspotId: HotspotId;
  andando?: boolean;
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
      estado={arte.tipo === 'npc' ? andando ? 'andando' : 'parado' : 'estatico'}
      atrasoMs={atrasoDoId(hotspotId)}
      decorativo
      className="jogo-hotspot-arte"
    />
  );
}

export function Cena(): JSX.Element | null {
  const presencasNpcs = useJogo(s => s.presencasNpcs);
  const tela = useJogo((s) => s.tela);
  const cena = useJogo(seletores.cenaAtual);
  const clicarHotspot = useJogo((s) => s.clicarHotspot);
  const voltarAoMapa = useJogo((s) => s.voltarAoMapa);
  const itemSelecionado = useJogo((s) => s.itemSelecionado);
  const dialogoAtivo = useJogo((s) => s.dialogoAtivo);
  const puzzleAberto = useJogo((s) => s.puzzleAberto);
  const narracao = useJogo((s) => s.narracao);
  const itensRecebidos = useJogo((s) => s.itensRecebidos);
  const mensagemFalha = useJogo((s) => s.mensagemFalha);
  const pausaBloco4 = useJogo((s) => s.pausaBloco4);
  const lugares = useJogo((s) => s.lugares);
  const hotspotsFeitos = useJogo((s) => s.hotspotsFeitos);
  const dialogosConcluidos = useJogo((s) => s.dialogosConcluidos);
  const bloco = useJogo(s => s.bloco);
  const reflexaoAtiva = useJogo(s => s.reflexaoAtiva);
  const iniciarReflexao = useJogo(s => s.iniciarReflexao);
  const reabrirReflexao = useJogo(s => s.reabrirReflexao);
  const progresso = useJogo(seletores.progressoDeConversas);
  const progressoMinigames = useJogo(seletores.progressoDeMinigames);
  const fasePronta = useJogo((s) => s.blocoConcluido);
  const mostrarMensagemConclusao = useJogo((s) => s.mostrarMensagemConclusao);
  const ensaiarPuzzle = useJogo((s) => s.ensaiarPuzzle);
  const puzzles = useJogo((s) => s.puzzles);
  useEffect(() => { iniciarReflexao(); }, [bloco, tela.tipo === 'cena' ? tela.lugarId : null, iniciarReflexao]);

  const lugarId = tela.tipo === 'cena' ? tela.lugarId : null;
  const entrada = posicaoDeEntrada(cena ?? null);
  useEffect(() => useJogo.getState().fecharMensagemConclusao(), [lugarId, cena?.bloco]);

  const [comando, setComando] = useState<ComandoDeMovimento>({
    alvo: entrada,
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
    setComando((c) => ({ alvo: entrada, instantaneo: true, seq: c.seq + 1 }));
  }, [lugarId, cena?.bloco]);

  useEffect(() => {
    if (dialogoAtivo?.dialogoId !== 'b4-apresentacao') return;
    // Cada passo do STAR desloca Ana entre atril e telão. A fala passa a ter
    // ação visível, e o avanço manual mantém o ritmo nas mãos de quem apresenta.
    const pontos = [
      { x: 65, y: 62 },
      { x: 59, y: 62 },
      { x: 67, y: 62 },
      { x: 61, y: 62 },
    ];
    const alvo = pontos[dialogoAtivo.indice] ?? { x: 65, y: 62 };
    setPendente(null);
    setComando((atual) => ({ alvo, instantaneo: false, seq: atual.seq + 1 }));
  }, [dialogoAtivo?.dialogoId, dialogoAtivo?.indice]);

  if (lugarId === null) return null;

  const lugar: Lugar | undefined = LUGARES[lugarId];
  const npcEmMovimento = Object.entries(presencasNpcs).some(([chave, p]) => chave.startsWith(`${cena?.bloco}:${lugarId}:`) && Boolean(p.movimento));
  const bloqueado = npcEmMovimento ||
    reflexaoAtiva !== null || dialogoAtivo !== null || puzzleAberto !== null || narracao !== null || mensagemFalha !== null || itensRecebidos.length > 0 || pausaBloco4 === 'rodando';

  /**
   * Lugar concluído deixa de oferecer interações, mas conserva o elenco.
   *
   * `clicarHotspot` recusa o clique quando o lugar está 'concluido', e hotspot
   * que não responde parece bug quando projetado (o spec rejeitou isso
   * explicitamente). Presença física é independente da disponibilidade do
   * botão: tirar o NPC ao concluir o lugar fazia a pessoa evaporar ao vivo.
   */
  const lugarConcluido = lugares[lugarId] === 'concluido';
  const hotspotsVisiveis = cena?.hotspots.filter((hotspot) => {
    if (lugarId === 'outra-area' && cena?.bloco === 5) {
      if (hotspot.id === 'b5-bianca-inicial') return !hotspotsFeitos.includes('b5-bianca-inicial');
      if (hotspot.id === 'b5-bianca') {
        return hotspotsFeitos.includes('b5-bianca-inicial');
      }
    }
    return true;
  });
  const dialogasDaCenaConcluidas = (() => {
    const ids = [...new Set(CENAS.filter((c) => c.bloco === cena?.bloco).flatMap((c) => c.hotspots).flatMap((h) =>
      [...h.efeitos, ...(h.efeitosComItem ?? [])].flatMap((e) =>
        e.tipo === 'dialogo' ? [e.dialogoId] : [],
      ),
    ))];
    return ids.length > 0 && ids.every((id) => dialogosConcluidos.includes(id));
  })();
  const minigamesDaCenaConcluidos = (() => {
    // O contador é da fase; o mesmo minigame aparece nas duas cenas do Bloco 2.
    const ids = [...new Set(CENAS.filter((c) => c.bloco === cena?.bloco).flatMap((c) => c.hotspots).flatMap((h) =>
      [...h.efeitos, ...(h.efeitosComItem ?? [])].flatMap((e) =>
        e.tipo === 'abrirPuzzle' ? [e.puzzleId] : [],
      ),
    ))];
    return ids.length > 0 && ids.every((id) => puzzles[id] === 'resolvido');
  })();

  /**
   * Saída recusada pela store enquanto há diálogo, puzzle ou a pausa do Bloco 4.
   * Mesmo raciocínio do hotspot morto: botão visível que não responde parece
   * bug. A caixa de diálogo não cobre o canto do botão, então ele fica à vista —
   * por isso `disabled` com aria-label que diz o motivo, em vez de esconder: o
   * botão nunca muda de lugar, e o apresentador vê que a saída é só temporária.
   */
  const saidaBloqueada =
    reflexaoAtiva !== null || dialogoAtivo !== null || puzzleAberto !== null || pausaBloco4 === 'rodando';
  const rotuloDaSaida =
    pausaBloco4 === 'rodando'
      ? 'Voltar ao mapa. Indisponível durante a pausa.'
      : puzzleAberto !== null
        ? 'Voltar ao mapa. Indisponível com um desafio aberto: termine o desafio primeiro.'
        : dialogoAtivo !== null
          ? 'Voltar ao mapa. Indisponível durante a conversa: termine a conversa primeiro.'
          : 'Voltar ao mapa';

  function acionar(hotspot: Hotspot, shiftAtivo = false): void {
    if (bloqueado) return;
    const efeitos = [...hotspot.efeitos, ...(hotspot.efeitosComItem ?? [])];
    const puzzle = efeitos.find((efeito) => efeito.tipo === 'abrirPuzzle');
    const puzzleId = puzzle?.tipo === 'abrirPuzzle' ? puzzle.puzzleId : null;
    const puzzleResolvido = puzzleId !== null && puzzles[puzzleId] === 'resolvido';
    const acaoConcluida = hotspot.mensagemConcluido !== undefined && hotspotsFeitos.includes(hotspot.id);
    if (puzzleResolvido || acaoConcluida) {
      if (shiftAtivo && puzzleResolvido && puzzleId !== null) {
        ensaiarPuzzle(puzzleId);
      } else {
        mostrarMensagemConclusao(hotspot.mensagemConcluido ?? (puzzleId === null ? '' : PUZZLES[puzzleId].mensagemConcluido));
      }
      return;
    }
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
    <div style={{ position: 'absolute', inset: 0, bottom: overlay.barraDeItens, overflow: 'hidden', zIndex: camada.cenario }}>
    <div style={{ position: 'absolute', width: CANVAS.largura, height: CANVAS.altura }}>
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

      {lugarId === 'sala-reunioes' && cena?.bloco === 4 ? (
        <>
          <span aria-label="Faixa do evento" style={{ position: 'absolute', left: apresentacao.faixa.esquerda, top: apresentacao.faixa.topo, width: apresentacao.faixa.largura, height: apresentacao.faixa.altura, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cores.texto, fontSize: tipografia.tamanhos.rotulo, fontWeight: tipografia.pesos.forte }}>Innovation Week</span>
          <div aria-hidden="true" style={{ position: 'absolute', left: '53%', top: '85.4%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', zIndex: camada.cenario + 1 }}>
            <Imagem id="objeto-plateia-vazia" rotulo="" largura={936} altura={256} decorativo mostrarRotulo={false} />
          </div>
            <div aria-hidden="true" style={{ position: 'absolute', left: dialogosConcluidos.includes('b4-apresentacao') ? '-60%' : '53%', transition: `left ${duracao.maxima}ms ${easing.constante}`, top: '85.4%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', zIndex: camada.hotspot - 1 }}>
              <Imagem id="objeto-plateia-frente" rotulo="" largura={936} altura={256} decorativo mostrarRotulo={false} />
            </div>
        </>
      ) : null}

      {lugarId === 'cafezinho' ? (
        <div
          aria-hidden="true"
          className="jogo-vapor"
          style={{
            position: 'absolute',
            // A máquina fica em x=77 no cenário (escala 4); vapor no notebook
            // do balcão parecia outro objeto flutuando.
            left: '15.5%',
            top: '47%',
            width: 72,
            height: 64,
            pointerEvents: 'none',
            zIndex: camada.cenario + 1,
            ['--jogo-vapor-subida' as string]: `${-espaco.sm}px`,
          }}
        >
          {[0, 1, 2].map((fio) => (
            <span
              key={fio}
              style={{
                position: 'absolute',
                left: fio * 20,
                top: 22,
                width: 4,
                height: 28,
                background: cores.textoApoio,
                animation: `jogo-vapor ${duracao.cicloRobotico}ms ease-in-out infinite`,
                animationDelay: `${fio * -(duracao.cicloRobotico / 3)}ms`,
              }}
            />
          ))}
        </div>
      ) : null}

      <VidaDoCenario lugar={lugarId} bloco={bloco} />

      {lugarId === 'sala-reunioes' && cena?.bloco === 4 ? <QuadroSTAR passo={dialogoAtivo?.dialogoId === 'b4-apresentacao' ? dialogoAtivo.indice : dialogosConcluidos.includes('b4-apresentacao') ? 3 : undefined} /> : null}

      {lugarId === 'linha-producao' && cena?.bloco === 3 ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 48 * 4,
            top: 145 * 4 - 96,
            width: 248 * 4,
            height: 96,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: camada.cenario + 1,
          }}
        >
          <div
            className="jogo-esteira"
            style={{
              position: 'absolute',
              left: -64,
              top: 0,
              display: 'flex',
              gap: movimento.esteira - 64,
              animationDuration: `${duracao.esteira}ms`,
              ['--jogo-esteira-fim' as string]: `${movimento.esteira}px`,
            }}
          >
            {Array.from({ length: 7 }, (_, unidade) => (
              <Imagem
                key={unidade}
                id={unidade % 2 === 0 ? 'objeto-radio-telecom' : 'objeto-radio-telecom-aberto'}
                rotulo={unidade % 2 === 0 ? 'Rádio montado' : 'Rádio em montagem'}
                largura={64}
                altura={96}
                decorativo
                mostrarRotulo={false}
              />
            ))}
          </div>
        </div>
      ) : null}

      {lugarId === 'linha-producao' && cena?.bloco === 3
        ? ([134, 210] as const).map((centro, indice) => {
            // O passo das estações acompanha os 304 px entre rádios. O pequeno
            // atraso conserva gestos diferentes sem trabalhar sobre o vazio.
            const atraso = indice === 0 ? 0 : -duracao.minima;
            const estilo = {
              position: 'absolute' as const,
              left: centro * 4 - 48,
              top: (142 - 50) * 4,
              pointerEvents: 'none' as const,
              zIndex: camada.cenario + 2,
            };
            return (
              <div key={centro} aria-hidden="true" style={estilo}>
                <SpriteAnimado
                  id="objeto-braco-robotico"
                  rotulo="Braço robótico montando um rádio"
                  largura={96}
                  altura={200}
                  estado="andando"
                  decorativo
                  style={{ animationDuration: `${duracao.cicloRobotico}ms`, animationDelay: `${atraso}ms` }}
                />
              </div>
            );
          })
        : null}

      <div aria-label="Controles e progresso da fase" style={{ visibility: dialogoAtivo || reflexaoAtiva ? 'hidden' : 'visible', position: 'absolute', left: espaco.margem, top: espaco.xs, zIndex: camada.hotspot + 1, display: 'flex', alignItems: 'center', gap: espaco.sm, padding: espaco.xs, background: cores.caixa, border: `${borda.interface}px solid ${cores.contorno}`, borderRadius: raio.sm }}>
        <button type="button" className="jogo-botao" aria-label={rotuloDaSaida} disabled={saidaBloqueada} onClick={voltarAoMapa} style={{ visibility: 'visible', minWidth: 0, minHeight: alvo.minimo, padding: `${espaco.sm}px ${espaco.md}px`, fontSize: tipografia.minimo, fontFamily: tipografia.familiaInterface, fontWeight: tipografia.pesos.normal, background: cores.caixa, color: fasePronta ? cores.sucesso : cores.textoApoio, borderColor: fasePronta ? cores.sucesso : cores.silhuetaContorno, borderWidth: borda.interface, borderRadius: raio.sm, opacity: saidaBloqueada ? 0.4 : 1, transition: `opacity ${duracao.curta}ms ${easing.suave}` }}>
          <span aria-hidden>◀</span> Voltar ao mapa
        </button>
        <button type="button" className="jogo-botao-nu" aria-label="Reabrir reflexão de Ana" disabled={bloqueado} onClick={reabrirReflexao} style={{ minHeight: alvo.minimo, fontSize: tipografia.minimo, fontFamily: tipografia.familiaInterface, color: cores.textoApoio, background: cores.painel, border: `${borda.interface}px solid ${cores.silhuetaContorno}`, borderRadius: raio.sm, padding: `0 ${espaco.md}px` }}><IconeJornada tipo="pensamento" /> Pensamento</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: espaco.xs }}>
          <small aria-label="Progresso das conversas do bloco" style={{ display: 'flex', alignItems: 'center', gap: espaco.sm, minHeight: alvo.minimo, color: dialogasDaCenaConcluidas ? cores.sucesso : cores.textoApoio, background: cores.painel, border: `${borda.interface}px solid ${cores.silhuetaContorno}`, borderRadius: raio.sm, padding: `0 ${espaco.sm}px`, fontSize: tipografia.minimo, whiteSpace: 'nowrap' }}><IconeJornada tipo="conversa" /> {progresso}{dialogasDaCenaConcluidas ? ' ✓' : ''}</small>
          {progressoMinigames !== null ? <small aria-label="Progresso dos minigames do bloco" style={{ display: 'flex', alignItems: 'center', gap: espaco.sm, minHeight: alvo.minimo, color: minigamesDaCenaConcluidos ? cores.sucesso : cores.textoApoio, background: cores.painel, border: `${borda.interface}px solid ${cores.silhuetaContorno}`, borderRadius: raio.sm, padding: `0 ${espaco.sm}px`, fontSize: tipografia.minimo, whiteSpace: 'nowrap' }}><IconeJornada tipo="minigame" /> {progressoMinigames}{minigamesDaCenaConcluidos ? ' ✓' : ''}</small> : null}
        </div>
      </div>

      {hotspotsVisiveis?.filter(h => !lugarConcluido || h.arte.tipo === 'npc').map((hotspot) => {
            const ancora = hotspot.ancora ?? 'base';
            const folga = folgaDeAlvo(tamanhoDaArte(hotspot.arte));

            /**
             * A arte FICA quando o hotspot morre (ela é parte do cenário:
             * sumir deixaria um buraco onde estava a TV), mas deixa de ser
             * botão. Ver `hotspotInerte`.
             */
            const efeitosDoHotspot = [...hotspot.efeitos, ...(hotspot.efeitosComItem ?? [])];
            const puzzleDoHotspot = efeitosDoHotspot.find((efeito) => efeito.tipo === 'abrirPuzzle');
            const puzzleConcluido = puzzleDoHotspot?.tipo === 'abrirPuzzle' && puzzles[puzzleDoHotspot.puzzleId] === 'resolvido';
            const acaoConcluida = hotspot.mensagemConcluido !== undefined && hotspotsFeitos.includes(hotspot.id);
            const concluido = puzzleConcluido || acaoConcluida;
            const inerte = lugarConcluido || (hotspot.id === 'b4-plateia' && dialogosConcluidos.includes('b4-apresentacao')) || hotspotInerte(hotspot, hotspotsFeitos) && !concluido;

            /** Nome com cargo: o leitor de telas ouve o mesmo que a plateia lê. */
            const rotulo = rotuloComCargo(hotspot.rotulo, hotspot.arte);
            const chave = hotspot.arte.tipo === 'npc' ? chaveDaPresenca(cena!.bloco, lugarId, hotspot.arte.npcId) : null;
            const presenca = chave ? presencasNpcs[chave] ?? presencasIniciais()[chave] : null;

            const arte = (
              <ArteDoHotspot arte={hotspot.arte} rotulo={rotulo} hotspotId={hotspot.id} andando={Boolean(presenca?.movimento)} />
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
              '--aura': concluido ? 'transparent' : itemSelecionado === null ? cores.destaque : cores.acao,
              padding: folga,
              margin: -folga,
              position: 'relative',
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

            const conteudo = (
              <>
                {inerte ? (
                  arte
                ) : (
                  <button
                    type="button"
                    className={`jogo-botao-nu jogo-hotspot${concluido ? ' jogo-concluido' : ''}${hotspot.id === 'b3-relatorio' ? ' jogo-clipboard' : ''}`}
                    disabled={bloqueado}
                    aria-label={
                      concluido
                        ? `Concluído. Mostrar resultado de ${rotulo}. Shift e clique para refazer o minigame.`
                        : itemSelecionado === null
                        ? `Interagir com ${rotulo}`
                        : `Usar item selecionado em ${rotulo}`
                    }
                    onClick={(evento) => acionar(hotspot, evento.shiftKey)}
                    onMouseEnter={() => setEmFoco(hotspot.id)}
                    onMouseLeave={() => setEmFoco((atual) => (atual === hotspot.id ? null : atual))}
                    onFocus={() => setEmFoco(hotspot.id)}
                    onBlur={() => setEmFoco((atual) => (atual === hotspot.id ? null : atual))}
                    style={estiloDoBotao}
                  >
                    {arte}
                    {concluido ? <span aria-hidden style={{ position: 'absolute', right: folga, top: folga, display: 'grid', placeItems: 'center', width: alvo.minimo / 2, height: alvo.minimo / 2, borderRadius: raio.redondo, border: `${borda.interface}px solid ${cores.caixa}`, background: cores.sucesso, color: cores.textoInverso, fontSize: tipografia.minimo, fontWeight: tipografia.pesos.forte }}>✓</span> : null}
                    {hotspot.id === 'b3-relatorio' ? <span style={{ position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)', padding: espaco.xs, background: cores.caixa, color: cores.destaque, fontSize: tipografia.minimo, whiteSpace: 'nowrap' }}>Clipboard · Relatório</span> : null}
                  </button>
                )}
              </>
            );
            return chave && presenca
              ? <PresencaEmCena key={chave} chave={chave} presenca={presenca}>{conteudo}</PresencaEmCena>
              : <Posicionado key={hotspot.id} pos={hotspot.id === 'b4-plateia' && dialogosConcluidos.includes('b4-apresentacao') ? { ...hotspot.pos, x: -60 } : hotspot.pos} ancora={ancora} zIndex={camada.hotspot} style={hotspot.id === 'b4-plateia' ? { transition: `left ${duracao.maxima}ms ${easing.constante}` } : undefined}>{conteudo}</Posicionado>;
          })}

      <Protagonista comando={comando} onChegar={aoChegar} apresentando={dialogoAtivo?.dialogoId === 'b4-apresentacao' && dialogoAtivo.indice % 2 === 1} />

      {reflexaoAtiva ? <div aria-hidden style={{ position: 'absolute', inset: 0, background: cores.veuLeve, zIndex: camada.protagonista - 1, pointerEvents: 'none' }} /> : null}
      {/* Uma linha, sempre no mesmo lugar, com o nome do que está sob o
          ponteiro. É o que substituiu os retângulos de texto. */}
      <LinhaDeFoco rotulo={rotuloEmFoco} comItem={itemSelecionado !== null} />
    </div>
    </div>
  );
}

export default Cena;
