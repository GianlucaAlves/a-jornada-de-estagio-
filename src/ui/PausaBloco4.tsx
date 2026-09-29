/**
 * A pausa do Bloco 4.
 *
 * Requisito mecânico, não direção artística: ao completar o puzzle de montar,
 * o sistema NÃO produz feedback nenhum. Sequência de ~8 segundos — Ana se vira
 * e espera; um NPC olha o celular; a líder fecha o notebook; as cadeiras
 * esvaziam; a sala fica vazia com o diagrama aceso ao fundo.
 *
 * SEM texto, SEM som, SEM item, SEM skill, SEM celebração de qualquer tipo.
 * Qualquer animação de comemoração aqui destrói o bloco.
 *
 * O avanço é manual e indefinido: o apresentador pode esticar o silêncio o
 * quanto quiser. `concluirPausaBloco4` só é chamado no clique dele.
 */
import { useEffect, useRef, useState } from 'react';
import { assetDoCenario, assetDoSprite } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import {
  CANVAS,
  borda,
  camada,
  cores,
  duracao,
  easing,
  raio,
} from '../styles/tokens';
import { Imagem } from './Imagem';

/** Marcas da sequência, em ms a partir da entrada. Total ~8s com o último fade. */
const MARCAS: readonly number[] = [
  600, // 1 — Ana se vira e espera
  2200, // 2 — um NPC olha o celular
  3800, // 3 — a líder fecha o notebook
  5400, // 4 — as cadeiras esvaziam
  7000, // 5 — sala vazia
];

/**
 * Trava do avanço — mesmo conceito do `travar()` em Revelacao.tsx.
 *
 * O botão de conclusão é uma camada `inset: 0` que monta junto com a pausa: o
 * segundo clique de um duplo-clique no hotspot `entrega` cai aqui e encerra a
 * pausa antes de ela ser vista. E é IRRECUPERÁVEL — `entrega` é umaVezSo e
 * `concluirPausaBloco4` só age no estado 'rodando'.
 *
 * ESCOLHA: travar até a sequência visual terminar, não apenas por ~400ms na
 * montagem. Uma trava curta resolveria só o duplo-clique; qualquer clique
 * nervoso dentro dos 8 segundos de silêncio mataria o momento do mesmo jeito, e
 * este é o momento mais importante do Bloco 4. Travar até o fim não tira
 * controle de ninguém: o avanço continua manual e indefinido — o apresentador
 * pode esticar o silêncio o quanto quiser, só não pode antecipá-lo.
 */
const ESPERA_DO_AVANCO_MS = (MARCAS[MARCAS.length - 1] ?? 0) + duracao.maxima;

/** Silhuetas em volta da mesa. Coordenadas em px de canvas. */
const LUGARES_A_MESA: readonly { x: number; y: number }[] = [
  { x: 760, y: 520 },
  { x: 1010, y: 500 },
  { x: 1260, y: 520 },
];

export function PausaBloco4(): JSX.Element {
  const concluirPausaBloco4 = useJogo((s) => s.concluirPausaBloco4);
  const sprite = useJogo((s) => s.sprite);
  const [etapa, setEtapa] = useState(0);
  const [travado, setTravado] = useState(true);
  const temporizadores = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  function travar(espera: number): void {
    setTravado(true);
    const id = window.setTimeout(() => setTravado(false), espera);
    temporizadores.current.push(id);
  }

  // A trava cobre a montagem E toda a sequência de ~8s.
  useEffect(() => {
    travar(ESPERA_DO_AVANCO_MS);
  }, []);

  useEffect(() => {
    const marcas = MARCAS.map((ms, indice) =>
      window.setTimeout(() => setEtapa(indice + 1), ms),
    );
    return () => {
      for (const t of marcas) window.clearTimeout(t);
    };
  }, []);

  const virada = etapa >= 1;
  const celularAceso = etapa >= 2 && etapa < 4;
  const notebookFechado = etapa >= 3;
  const mesaVazia = etapa >= 4;
  const salaVazia = etapa >= 5;

  const transicaoLenta = `opacity ${duracao.maxima}ms ${easing.suave}, transform ${duracao.maxima}ms ${easing.suave}`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: CANVAS.largura,
        height: CANVAS.altura,
        zIndex: camada.pausa,
        overflow: 'hidden',
        background: cores.fundo,
      }}
    >
      <Imagem
        id={assetDoCenario('sala-reunioes')}
        rotulo="Sala de reuniões"
        largura={CANVAS.largura}
        altura={CANVAS.altura}
        decorativo
        mostrarRotulo={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Véu plano: a sala esvazia de luz junto com as pessoas. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: cores.veuLeve,
          opacity: salaVazia ? 1 : 0.7,
          transition: transicaoLenta,
        }}
      />

      {/* O diagrama montado, aceso ao fundo. Fica quando todo o resto sai. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 1420,
          top: 180,
          width: 360,
          height: 240,
          border: `${borda.maxima}px solid ${cores.acao}`,
          borderRadius: raio.md,
          background: cores.fundoElevado,
          opacity: salaVazia ? 1 : 0.85,
          transition: transicaoLenta,
        }}
      />

      {/* Mesa. Forma cheia, sem detalhe fino. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 620,
          top: 600,
          width: 800,
          height: 150,
          background: cores.silhueta,
          border: `${borda.grossa}px solid ${cores.silhuetaContorno}`,
          borderRadius: raio.lg,
        }}
      />

      {/* Notebook da líder: fecha e fica fechado. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 1180,
          top: notebookFechado ? 586 : 520,
          width: 150,
          height: notebookFechado ? 18 : 84,
          background: cores.fundoElevado,
          border: `${borda.media}px solid ${cores.silhuetaContorno}`,
          borderRadius: raio.sm,
          transition: `top ${duracao.longa}ms ${easing.suave}, height ${duracao.longa}ms ${easing.suave}`,
        }}
      />

      {/* Cadeiras e quem está nelas. As pessoas saem; as cadeiras ficam. */}
      {LUGARES_A_MESA.map((lugar, indice) => (
        <div key={`lugar-${String(indice)}`} aria-hidden>
          <div
            style={{
              position: 'absolute',
              left: lugar.x - 55,
              top: lugar.y + 120,
              width: 110,
              height: 90,
              background: cores.silhueta,
              border: `${borda.media}px solid ${cores.silhuetaContorno}`,
              borderRadius: raio.sm,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: lugar.x - 60,
              top: lugar.y,
              width: 120,
              height: 170,
              background: cores.silhueta,
              border: `${borda.grossa}px solid ${cores.silhuetaContorno}`,
              borderRadius: `${raio.redondo}px ${raio.redondo}px ${raio.md}px ${raio.md}px`,
              opacity: mesaVazia ? 0 : 1,
              transition: transicaoLenta,
            }}
          />
        </div>
      ))}

      {/* O celular de quem não está mais na reunião. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 1000,
          top: 560,
          width: 46,
          height: 74,
          background: cores.acao,
          borderRadius: raio.sm,
          opacity: celularAceso ? 1 : 0,
          transition: transicaoLenta,
        }}
      />

      {/* A líder. Sai depois de todos. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 1180,
          top: 470,
          width: 130,
          height: 200,
          background: cores.silhueta,
          border: `${borda.grossa}px solid ${cores.silhuetaContorno}`,
          borderRadius: `${raio.redondo}px ${raio.redondo}px ${raio.md}px ${raio.md}px`,
          opacity: salaVazia ? 0 : 1,
          transition: transicaoLenta,
        }}
      />

      {/* Ana. Se vira e espera. Continua lá no fim. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 330,
          top: 470,
          width: 260,
          height: 520,
          transform: virada ? 'scaleX(-1)' : 'scaleX(1)',
          transition: `transform ${duracao.longa}ms ${easing.suave}`,
        }}
      >
        <Imagem
          id={assetDoSprite(sprite)}
          rotulo=""
          largura={260}
          altura={520}
          decorativo
          mostrarRotulo={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Avanço manual e indefinido. Nenhum rótulo visível: a tela é silêncio.
          Só aceita clique depois que a sequência inteira passou. */}
      <button
        type="button"
        aria-label="Continuar após a pausa"
        disabled={travado}
        onClick={() => {
          if (travado) return;
          concluirPausaBloco4();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          cursor: travado ? 'default' : 'pointer',
        }}
      />
    </div>
  );
}

export default PausaBloco4;
