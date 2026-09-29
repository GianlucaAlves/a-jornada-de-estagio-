/**
 * Barra de itens — sempre visível, sempre no mesmo lugar.
 *
 * CRÍTICO: itens tardios NÃO recebem nenhuma diferenciação. Nem cor, nem
 * moldura, nem ordem, nem área separada, nem tooltip. Este componente NÃO LÊ
 * o campo `tardio` em nenhuma hipótese — qualquer marcação aqui anunciaria o
 * clímax do Bloco 5 uma hora antes dele acontecer.
 *
 * O peso visual é deliberadamente "de objeto": ícone + moldura. O painel de
 * skills é o oposto, de propósito.
 */
import { useEffect, useState } from 'react';
import { ITENS } from '../domain/content';
import type { Item, ItemId } from '../domain/types';
import { assetDoItem } from '../assets/manifest';
import { seletores, useJogo } from '../store/jogo';
import {
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

const LARGURA_ITEM = 210;
const LADO_ICONE = 88;

export function BarraDeItens(): JSX.Element {
  const itens = useJogo(seletores.itensNaBarra);
  const itemSelecionado = useJogo((s) => s.itemSelecionado);
  const selecionarItem = useJogo((s) => s.selecionarItem);

  const [descricaoDe, setDescricaoDe] = useState<ItemId | null>(null);

  // Item que saiu da barra não deixa descrição órfã na tela.
  useEffect(() => {
    if (descricaoDe !== null && !itens.includes(descricaoDe)) setDescricaoDe(null);
  }, [itens, descricaoDe]);

  const descricao: Item | undefined = descricaoDe === null ? undefined : ITENS[descricaoDe];

  return (
    <>
      {descricao !== undefined ? (
        <p
          className="jogo-aparecer"
          style={{
            position: 'absolute',
            left: espaco.margem,
            bottom: 210,
            maxWidth: 1180,
            zIndex: camada.overlayPersistente,
            background: cores.caixa,
            border: `${borda.media}px solid ${cores.contorno}`,
            borderRadius: raio.md,
            padding: `${espaco.md}px ${espaco.lg}px`,
            fontSize: tipografia.tamanhos.corpo,
            lineHeight: tipografia.alturaLinha.corpo,
            color: cores.texto,
          }}
        >
          <strong style={{ color: cores.destaque }}>{descricao.nome}:</strong> {descricao.descricao}
        </p>
      ) : null}

      <section
        aria-label="Itens"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: 190,
          zIndex: camada.overlayPersistente,
          display: 'flex',
          alignItems: 'center',
          gap: espaco.md,
          padding: `${espaco.md}px ${espaco.margem}px`,
          background: cores.painel,
          borderTop: `${borda.grossa}px solid ${cores.contorno}`,
        }}
      >
        <h2
          style={{
            flex: '0 0 auto',
            width: 120,
            fontSize: tipografia.tamanhos.apoio,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.textoApoio,
            textTransform: 'uppercase',
          }}
        >
          Itens
        </h2>

        <ul style={{ display: 'flex', alignItems: 'stretch', gap: espaco.md, flex: '1 1 auto' }}>
          {itens.map((id) => {
            // Um único caminho de renderização para todos os itens.
            const item: Item | undefined = ITENS[id];
            if (item === undefined) return null;
            const ativo = itemSelecionado === id;
            return (
              <li key={id} style={{ flex: '0 1 auto' }}>
                <button
                  type="button"
                  aria-pressed={ativo}
                  aria-label={`${item.nome}. ${item.descricao}`}
                  onClick={() => {
                    setDescricaoDe(id);
                    selecionarItem(id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: espaco.xs,
                    width: LARGURA_ITEM,
                    minHeight: alvo.confortavel + LADO_ICONE / 2,
                    padding: espaco.sm,
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
                    largura={LADO_ICONE}
                    altura={LADO_ICONE}
                    mostrarRotulo={false}
                    decorativo
                  />
                  <span
                    style={{
                      fontSize: tipografia.tamanhos.apoio,
                      fontWeight: tipografia.pesos.forte,
                      lineHeight: tipografia.alturaLinha.compacta,
                      textAlign: 'center',
                    }}
                  >
                    {item.nome}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

export default BarraDeItens;
