/** Quadro de conquista controlado pelo apresentador, um item por clique. */
import { useEffect, useRef, useState } from 'react';
import { assetDoItem } from '../assets/manifest';
import { ITENS } from '../domain/content/base';
import { useJogo } from '../store/jogo';
import { arte, borda, camada, cores, duracao, espaco, raio, sombra, tipografia } from '../styles/tokens';
import { Imagem } from './Imagem';

export function ItemRecebido(): JSX.Element | null {
  const itemId = useJogo((s) => s.itensRecebidos[0]);
  const fechar = useJogo((s) => s.fecharItemRecebido);
  const [pronto, setPronto] = useState(false);
  const botao = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!itemId) return undefined;
    setPronto(false);
    botao.current?.focus();
    // O segundo clique do puzzle não pode fechar a conquista antes da leitura.
    const id = window.setTimeout(() => setPronto(true), duracao.minima);
    return () => window.clearTimeout(id);
  }, [itemId]);

  if (!itemId) return null;
  const item = ITENS[itemId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Você recebeu ${item.nome}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: camada.itemRecebido,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: cores.veu,
      }}
    >
      <div
        style={{
          width: 1000,
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: espaco.md,
          padding: espaco.xl,
          background: cores.caixa,
          border: `${borda.grossa}px solid ${cores.destaque}`,
          borderRadius: raio.lg,
          boxShadow: sombra.caixa,
          textAlign: 'center',
        }}
      >
        <div style={{ position: 'relative', width: arte.personagem.largura, height: arte.personagem.altura + arte.item.altura }}>
          <div className="jogo-item-erguido" style={{ position: 'absolute', top: 0, left: (arte.personagem.largura - arte.item.largura) / 2, animationDuration: `${duracao.longa}ms` }}>
            <Imagem id={assetDoItem(itemId)} rotulo={item.nome} largura={arte.item.largura} altura={arte.item.altura} decorativo />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <Imagem id="ana-recebendo-item" rotulo="Ana levantando o item" largura={arte.personagem.largura} altura={arte.personagem.altura} decorativo />
          </div>
        </div>
        <h2 style={{ color: cores.destaque, fontSize: tipografia.tamanhos.titulo, fontWeight: tipografia.pesos.maximo }}>
          Você recebeu {item.nome}!
        </h2>
        <p style={{ color: cores.texto, fontSize: tipografia.tamanhos.corpo, lineHeight: tipografia.alturaLinha.corpo }}>
          {item.descricao}
        </p>
        <button ref={botao} type="button" className="jogo-botao" aria-disabled={!pronto} onClick={() => { if (pronto) fechar(); }}>
          Continuar ▶
        </button>
      </div>
    </div>
  );
}
