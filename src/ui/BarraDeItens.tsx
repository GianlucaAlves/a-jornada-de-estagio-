/**
 * Barra de itens — sempre visível, sempre no mesmo lugar.
 *
 * CRÍTICO: itens tardios NÃO recebem nenhuma diferenciação. Nem cor, nem
 * moldura, nem ordem, nem área separada, nem tooltip. Este componente NÃO LÊ
 * o campo `tardio` em nenhuma hipótese — qualquer marcação aqui anunciaria o
 * clímax do bloco final uma hora antes dele acontecer.
 *
 * O peso visual é deliberadamente "de objeto": ícone + moldura. O painel de
 * skills é o oposto, de propósito.
 *
 * A DESCRIÇÃO DE ITEM AGORA FECHA (ADR-013).
 *
 * O que estava errado: `descricaoDe` era estado local escrito num lugar e
 * apagado SÓ quando o item saía da barra. Sobrevivia a troca de cena, ida ao
 * mapa, diálogo e puzzle — o bloco inteiro. E como ficava em `zIndex 20` contra
 * o diálogo em 30, ela se escondia durante a fala e REAPARECIA depois, que era
 * exatamente o que dava a sensação de ter grudado na tela. O `<p>` não era botão
 * e não havia como fechá-lo.
 *
 * Agora fecha por três caminhos: clique no mesmo item, clique em qualquer outra
 * coisa, e sozinha depois de alguns segundos. SEM BOTÃO X — alvo pequeno ao vivo
 * é armadilha, e um X num canto seria o alvo mais apertado da tela.
 *
 * O efeito colateral que existia junto também foi corrigido: o mesmo `onClick`
 * chama `selecionarItem`, que ALTERNA, e antes chamava `setDescricaoDe`, que era
 * idempotente. Clicar duas vezes desselecionava o item e mantinha a descrição —
 * dois estados para o mesmo gesto, divergindo. Agora os dois alternam juntos.
 */
import { useEffect, useRef, useState } from 'react';
import { ITENS } from '../domain/content';
import type { Item, ItemId } from '../domain/types';
import { assetDoItem } from '../assets/manifest';
import { seletores, useJogo } from '../store/jogo';
import {
  barra,
  borda,
  camada,
  cores,
  duracao,
  easing,
  espaco,
  espera,
  overlay,
  raio,
  tipografia,
} from '../styles/tokens';
import { PainelDeSkills } from './PainelDeSkills';
import { ROTULOS_DOS_ITENS } from './rotulosDosItens';
import { Imagem } from './Imagem';

/** O que pode fechar (ou trocar) a descrição na tela. */
export type EventoDeDescricao =
  | { tipo: 'clique-item'; itemId: ItemId }
  | { tipo: 'clique-fora' }
  | { tipo: 'tempo' }
  | { tipo: 'itens-mudaram'; itens: readonly ItemId[] };

/**
 * Qual descrição fica na tela depois de um evento. Pura, e é onde mora a regra
 * inteira dos três caminhos de fechamento.
 *
 * Exportada porque é o que o teste consegue exercitar: a suíte roda sem DOM,
 * então não há como clicar de verdade — e o defeito que isto conserta era
 * justamente comportamento ao longo do tempo, que markup nenhum revela.
 */
export function proximaDescricao(
  atual: ItemId | null,
  evento: EventoDeDescricao,
): ItemId | null {
  switch (evento.tipo) {
    // Mesmo item fecha; item diferente troca. Um clique, um estado.
    case 'clique-item':
      return atual === evento.itemId ? null : evento.itemId;
    case 'clique-fora':
      return null;
    case 'tempo':
      return null;
    // Item consumido no meio da leitura não deixa descrição órfã na tela.
    case 'itens-mudaram':
      return atual !== null && evento.itens.includes(atual) ? atual : null;
  }
}

export function BarraDeItens(): JSX.Element {
  const itens = useJogo(seletores.itensNaBarra);
  const itemSelecionado = useJogo((s) => s.itemSelecionado);
  const selecionarItem = useJogo((s) => s.selecionarItem);
  const recebidos = useJogo(s => s.itensRecebidos);
  const mensagemConclusao = useJogo(s => s.mensagemConclusao);
  const fecharMensagemConclusao = useJogo(s => s.fecharMensagemConclusao);

  const [descricaoDe, setDescricaoDe] = useState<ItemId | null>(null);
  /** A região que NÃO conta como "clicar em outra coisa". */
  const regiaoDaBarra = useRef<HTMLElement | null>(null);

  // Caminho extra, que já existia: item que saiu da barra.
  useEffect(() => {
    setDescricaoDe((atual) => proximaDescricao(atual, { tipo: 'itens-mudaram', itens }));
  }, [itens]);

  /**
   * Caminho 1: alguns segundos e ela sai.
   *
   * O temporizador é rearmado a cada troca de item porque a dependência é o
   * item mostrado: sem isso, abrir a descrição de um segundo item herdaria o
   * tempo restante do primeiro e a segunda leitura duraria menos que a primeira.
   */
  useEffect(() => {
    if (descricaoDe === null && mensagemConclusao === null) return undefined;
    const id = window.setTimeout(
      () => setDescricaoDe((atual) => proximaDescricao(atual, { tipo: 'tempo' })),
      espera.descricaoDeItemMs,
    );
    return () => window.clearTimeout(id);
  }, [descricaoDe, mensagemConclusao]);

  /**
   * Caminho 2: clique em qualquer outra coisa.
   *
   * `pointerdown` na fase de captura, e não `click`: o clique que abre um
   * diálogo ou um puzzle monta um overlay, e nesse caso o `click` pode nunca
   * chegar ao topo com o alvo original. `pointerdown` acontece antes de
   * qualquer coisa mudar de lugar.
   *
   * A fronteira é a própria barra: clicar num item é o caminho 3 e já foi
   * tratado no `onClick`; qualquer ponto fora dela — cenário, hotspot, botão de
   * voltar, e a própria descrição — fecha.
   */
  useEffect(() => {
    if (descricaoDe === null && mensagemConclusao === null) return undefined;
    const aoApontar = (evento: PointerEvent): void => {
      const destino = evento.target;
      if (destino instanceof Node && regiaoDaBarra.current?.contains(destino)) return;
      setDescricaoDe((atual) => proximaDescricao(atual, { tipo: 'clique-fora' }));
      fecharMensagemConclusao();
    };
    window.addEventListener('pointerdown', aoApontar, true);
    return () => window.removeEventListener('pointerdown', aoApontar, true);
  }, [descricaoDe, mensagemConclusao, fecharMensagemConclusao]);

  const descricao: Item | undefined = descricaoDe === null ? undefined : ITENS[descricaoDe];

  return (
    <>
      {mensagemConclusao !== null ? (
        <button
          type="button"
          aria-label="Fechar lembrança da ação concluída"
          onClick={fecharMensagemConclusao}
          style={{
            position: 'absolute',
            left: espaco.md,
            bottom: espaco.xs,
            width: barra.zonaItens - 2 * espaco.md,
            height: overlay.barraDeItens - borda.grossa - 2 * espaco.xs,
            zIndex: camada.overlayPersistente + 1,
            background: cores.caixa,
            border: `${borda.media}px solid ${cores.contorno}`,
            borderRadius: raio.md,
            padding: espaco.sm,
            fontSize: tipografia.minimo,
            lineHeight: tipografia.alturaLinha.compacta,
            textAlign: 'left',
            color: cores.texto,
          }}
        >
          <strong style={{ color: cores.destaque }}>{mensagemConclusao.split(':', 1)[0]}:</strong>{' '}
          {mensagemConclusao.slice(mensagemConclusao.indexOf(':') + 1).trim()}
        </button>
      ) : descricao !== undefined ? (
        <button
          type="button"
          aria-label={`Fechar descrição de ${descricao.nome}`}
          onClick={() => setDescricaoDe(null)}
          style={{
            position: 'absolute',
            left: espaco.md,
            // A descrição substitui visualmente os slots na própria barra;
            // o contexto de um objeto não pode esconder quem está na cena.
            bottom: espaco.xs,
            width: barra.zonaItens - 2 * espaco.md,
            height: overlay.barraDeItens - borda.grossa - 2 * espaco.xs,
            zIndex: camada.overlayPersistente + 1,
            background: cores.caixa,
            border: `${borda.media}px solid ${cores.contorno}`,
            borderRadius: raio.md,
            padding: espaco.sm,
            fontSize: tipografia.minimo,
            lineHeight: tipografia.alturaLinha.compacta,
            textAlign: 'left',
            color: cores.texto,
          }}
        >
          <strong style={{ color: cores.destaque }}>{descricao.nome}:</strong> {descricao.descricao}
        </button>
      ) : null}

      <section
        ref={regiaoDaBarra}
        aria-label="Itens"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: overlay.barraDeItens,
          fontFamily: tipografia.familiaInterface,
          zIndex: camada.overlayPersistente,
          display: 'flex',
          alignItems: 'center',
          gap: espaco.md,
          padding: `${espaco.xs}px ${espaco.md}px`,
          background: cores.painel,
          borderTop: `${borda.grossa}px solid ${cores.contorno}`,
        }}
      >
        <h2
          style={{
            flex: '0 0 auto',
            width: barra.larguraDoRotulo,
            fontSize: tipografia.tamanhos.apoio,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.textoApoio,
            textTransform: 'uppercase',
          }}
        >
          Itens
        </h2>

        <ul style={{ display: 'flex', alignItems: 'stretch', gap: espaco.xs, flex: '0 0 auto' }}>
          {Array.from({ length: barra.slotsItens }, (_, indice) => {
            const id = itens[indice];
            if (!id) return <li key={`vazio-${indice}`} aria-label="Espaço vazio de item" style={{ width: barra.item.largura, height: barra.item.altura, border: `${borda.media}px solid ${cores.silhuetaContorno}`, background: cores.fundoElevado }} />;
            // Um único caminho de renderização para todos os itens.
            const item: Item | undefined = ITENS[id];
            if (item === undefined) return null;
            const ativo = itemSelecionado === id;
            return (
              <li key={id} style={{ flex: '0 1 auto' }}>
                <button
                  type="button"
                  aria-pressed={ativo}
                  title={`${item.nome} · ${item.descricao}`}
                  className={recebidos.includes(id) ? 'jogo-item-novo' : undefined}
                  aria-label={`${item.nome}. ${item.descricao}`}
                  onClick={() => {
                    // Caminho 3, e os dois alternam JUNTOS: seleção e descrição
                    // são o mesmo gesto, e antes divergiam no segundo clique.
                    setDescricaoDe((atual) =>
                      proximaDescricao(atual, { tipo: 'clique-item', itemId: id }),
                    );
                    selecionarItem(id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: espaco.xs,
                    width: barra.item.largura,
                    height: barra.item.altura,
                    padding: borda.fina,
                    background: ativo ? cores.destaque : cores.fundoElevado,
                    color: ativo ? cores.textoInverso : cores.texto,
                    border: `${ativo ? borda.maxima : borda.media}px solid ${
                      ativo ? cores.destaque : cores.contorno
                    }`,
                    borderRadius: raio.md,
                    cursor: 'pointer',
                    transition: `background ${duracao.curta}ms ${easing.suave}, border-color ${duracao.curta}ms ${easing.suave}`,
                  }}
                >
                  <Imagem
                    id={assetDoItem(id)}
                    rotulo={item.nome}
                    largura={barra.icone}
                    altura={barra.icone}
                    mostrarRotulo={false}
                    decorativo
                    style={{ filter: `drop-shadow(0 ${borda.fina}px 0 ${cores.sombra})` }}
                  />
                  <span
                    style={{
                      fontSize: tipografia.minimo,
                      fontWeight: tipografia.pesos.forte,
                      lineHeight: tipografia.alturaLinha.compacta,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ROTULOS_DOS_ITENS[id]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <PainelDeSkills />
      </section>
    </>
  );
}

export default BarraDeItens;
