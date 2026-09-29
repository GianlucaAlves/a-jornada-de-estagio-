/**
 * Bloco 5 — a revelação, no mapa.
 *
 * Tela autossuficiente: desenha o mapa, a barra de itens e o painel de skills
 * ela mesma (o App já não monta os overlays persistentes aqui), porque as
 * LINHAS precisam sair de coordenadas conhecidas — o ícone do item na barra ou
 * a entrada do painel de skills — passar pelo lugar de `viaLugar` e chegar no
 * nó do convite. Medir o DOM sob o transform de escala do canvas é o tipo de
 * fragilidade que não sobrevive ao palco, então tudo aqui é aritmética.
 *
 * A geometria da barra espelha BarraDeItens (mesmo x, mesmo y, mesmo ícone) e a
 * do painel espelha PainelDeSkills: quando a tela troca, nada salta de lugar.
 *
 * Tudo é disparado por CLIQUE do apresentador — nunca por timer. Espessura e
 * duração de cada traçado vêm do próprio objeto Conexao. Sem partículas, sem
 * brilho difuso, sem linha fina, sem gradiente, sem animação rápida.
 */
import { useEffect, useRef, useState } from 'react';

import { ASSET_MAPA, assetDoItem, assetDoSprite } from '../assets/manifest';
import { CONEXOES, ITENS, LUGARES, SKILLS } from '../domain/content';
import type { Conexao, ItemId, LugarId, SkillId } from '../domain/types';
import { useJogo } from '../store/jogo';
import {
  CANVAS,
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

// ------------------------------------------------------------ geometria

/**
 * Retângulo útil do mapa: à esquerda do painel de skills e acima da barra de
 * itens, para que nenhum nó — nem o meio de nenhuma linha — fique escondido
 * atrás de um overlay. As posições relativas dos seis lugares (quem é
 * esquerda, centro, direita, cima, baixo) são preservadas.
 */
const MAPA_X = 80;
const MAPA_L = 1350;
const MAPA_Y = 130;
const MAPA_A = 660;

/** Nó do convite: centro do mapa, onde nunca houve nada. */
const CONVITE = { x: MAPA_X + MAPA_L / 2, y: MAPA_Y + MAPA_A / 2 };
const CONVITE_R = 50;
const NO_R = 44;

// Painel de skills — mesmos números de PainelDeSkills.tsx.
const PAINEL_L = 420;
const PAINEL_X = CANVAS.largura - PAINEL_L;
const PAINEL_Y = 120;
const PAINEL_BASE = 210;
const PAINEL_CABECALHO_A = 40;
const PAINEL_LINHA_A = 40;
const PAINEL_PASSO = PAINEL_LINHA_A + espaco.md;
const PAINEL_PRIMEIRA_LINHA_Y = PAINEL_Y + espaco.lg + PAINEL_CABECALHO_A + espaco.md;

// Barra de itens — mesmos números de BarraDeItens.tsx.
const BARRA_A = 190;
const BARRA_Y = CANVAS.altura - BARRA_A;
const BARRA_ROTULO_L = 120;
const ITEM_L = 210;
const ITEM_A = 132;
const ITEM_X = espaco.margem + BARRA_ROTULO_L + espaco.md;
const ITEM_PASSO = ITEM_L + espaco.md;
const ITEM_Y = BARRA_Y + espaco.md + (BARRA_A - 2 * espaco.md - ITEM_A) / 2;
const ICONE = 88;

/** Acima da barra e abaixo dos rótulos dos nós, com folga para duas linhas. */
const FAIXA_TEXTO_Y = 736;

/** ~5s de sustentação da versão futura apontando o mapa, sem texto. */
const SUSTENTACAO_MS = 5000;
/** A pergunta fica visível e sai: o gesto é que responde. */
const PERGUNTA_VISIVEL_MS = 2000;

function posicaoLugar(lugarId: LugarId): { x: number; y: number } {
  const lugar = LUGARES[lugarId];
  const pos = lugar ? lugar.pos : { x: 50, y: 50 };
  return {
    x: MAPA_X + (pos.x / 100) * MAPA_L,
    y: MAPA_Y + (pos.y / 100) * MAPA_A,
  };
}

/** Centro do ícone do item na barra — origem das três primeiras linhas. */
function centroDoIcone(indice: number): { x: number; y: number } {
  return {
    x: ITEM_X + indice * ITEM_PASSO + ITEM_L / 2,
    y: ITEM_Y + espaco.sm + ICONE / 2,
  };
}

/** Entrada do painel de skills — origem da quarta linha. */
function entradaDaSkill(indice: number): { x: number; y: number } {
  return {
    x: PAINEL_X,
    y: PAINEL_PRIMEIRA_LINHA_Y + indice * PAINEL_PASSO + PAINEL_LINHA_A / 2,
  };
}

const CSS = `
.rev-avancar:focus-visible { outline: ${borda.grossa}px solid ${cores.foco}; outline-offset: -16px; }
@keyframes rev-pulso {
  0% { transform: scale(1); }
  45% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
/* Um pulso, amplo e lento. O item avisa que é dele que a linha vai sair. */
.rev-pulso { animation: rev-pulso 800ms ${easing.suave} 1; }
`;

// ------------------------------------------------------------ linha

/**
 * Conexão traçada: origem -> lugar de passagem -> convite.
 * Espessura e duração vêm da Conexao; nada disso é decidido aqui.
 */
function LinhaConexao({
  pontos,
  espessura,
  duracaoMs,
  opacidade,
}: {
  pontos: readonly { x: number; y: number }[];
  espessura: number;
  duracaoMs: number;
  opacidade: number;
}): JSX.Element {
  const [tracada, setTracada] = useState(false);

  let comprimento = 0;
  for (let i = 1; i < pontos.length; i += 1) {
    const a = pontos[i - 1];
    const b = pontos[i];
    if (a && b) comprimento += Math.hypot(b.x - a.x, b.y - a.y);
  }

  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setTracada(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  return (
    <polyline
      points={pontos.map((p) => `${p.x},${p.y}`).join(' ')}
      fill="none"
      stroke={cores.destaque}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={comprimento}
      strokeDashoffset={tracada ? 0 : comprimento}
      opacity={opacidade}
      style={{
        transition: `stroke-dashoffset ${duracaoMs}ms ease-out, opacity ${duracao.longa}ms ease-out`,
      }}
    />
  );
}

// ------------------------------------------------------------ tela

type Fase = 'conexoes' | 'esvaziar' | 'futura' | 'perguntas';

const ROTULO_AVANCO: Record<Fase, string> = {
  conexoes: 'Traçar a próxima conexão',
  esvaziar: 'Esvaziar a barra de itens',
  futura: 'Mostrar a versão futura',
  perguntas: 'Ir para as perguntas finais',
};

export function Revelacao(): JSX.Element {
  const conexoesFeitas = useJogo((s) => s.revelacao.conexoesFeitas);
  const barraSaiu = useJogo((s) => s.revelacao.barraSaiu);
  const versaoFutura = useJogo((s) => s.revelacao.versaoFutura);
  const itens = useJogo((s) => s.itens);
  const skills = useJogo((s) => s.skills);
  const dispararConexao = useJogo((s) => s.dispararConexao);
  const esvaziarBarra = useJogo((s) => s.esvaziarBarra);
  const mostrarVersaoFutura = useJogo((s) => s.mostrarVersaoFutura);
  const avancarPergunta = useJogo((s) => s.avancarPergunta);

  /**
   * Slots da barra congelados na entrada, na mesma ordem da BarraDeItens: os
   * itens se apagam ao conectar, mas a âncora da linha tem que permanecer.
   */
  const [slots] = useState<ItemId[]>(() =>
    (Object.keys(itens) as ItemId[]).filter((id) => itens[id] === 'presente'),
  );

  const [travado, setTravado] = useState(false);
  const [perguntaVisivel, setPerguntaVisivel] = useState(false);
  const temporizadores = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    if (!versaoFutura) return undefined;
    setPerguntaVisivel(true);
    const id = window.setTimeout(() => setPerguntaVisivel(false), PERGUNTA_VISIVEL_MS);
    return () => window.clearTimeout(id);
  }, [versaoFutura]);

  const fase: Fase =
    conexoesFeitas < CONEXOES.length
      ? 'conexoes'
      : !barraSaiu
        ? 'esvaziar'
        : !versaoFutura
          ? 'futura'
          : 'perguntas';

  function travar(espera: number): void {
    setTravado(true);
    const id = window.setTimeout(() => setTravado(false), espera);
    temporizadores.current.push(id);
  }

  function avancar(): void {
    if (travado) return;
    switch (fase) {
      case 'conexoes': {
        const proxima = CONEXOES[conexoesFeitas];
        dispararConexao();
        // Trava só pelo tempo do traçado: dois cliques colados atropelariam
        // a linha que ainda está sendo desenhada.
        travar((proxima?.duracaoMs ?? duracao.media) + 250);
        break;
      }
      case 'esvaziar':
        esvaziarBarra();
        travar(duracao.longa);
        break;
      case 'futura':
        mostrarVersaoFutura();
        // Os ~5s de sustentação contam DEPOIS que a pergunta sai de cena.
        // Travar aqui é de propósito: o gesto sem texto é o conteúdo.
        travar(PERGUNTA_VISIVEL_MS + SUSTENTACAO_MS);
        break;
      case 'perguntas':
        avancarPergunta();
        break;
    }
  }

  const feitas = CONEXOES.slice(0, conexoesFeitas);
  const ultima: Conexao | undefined = CONEXOES[conexoesFeitas - 1];
  const lugaresTocados = new Set<LugarId>(feitas.map((c) => c.viaLugar));
  const skillsConectadas = new Set<SkillId>();
  for (const conexao of feitas) {
    if (conexao.origem.tipo === 'skill') skillsConectadas.add(conexao.origem.skillId);
  }
  /** Item que acabou de conectar: é ele que pulsa uma vez na barra. */
  const itemQuePulsa: ItemId | null =
    ultima && ultima.origem.tipo === 'item' ? ultima.origem.itemId : null;

  function pontosDaConexao(conexao: Conexao): readonly { x: number; y: number }[] {
    const via = posicaoLugar(conexao.viaLugar);
    if (conexao.origem.tipo === 'item') {
      const indice = slots.indexOf(conexao.origem.itemId);
      return [indice >= 0 ? centroDoIcone(indice) : { x: ITEM_X, y: ITEM_Y }, via, CONVITE];
    }
    const indice = skills.indexOf(conexao.origem.skillId);
    return [indice >= 0 ? entradaDaSkill(indice) : { x: PAINEL_X, y: PAINEL_Y }, via, CONVITE];
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: cores.fundo,
        color: cores.texto,
      }}
    >
      <style>{CSS}</style>

      {/* ------------------------------------------------------------ mapa */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.cenario,
          // Escurece devagar quando a versão futura entra, mas não apaga.
          opacity: versaoFutura ? 0.45 : 1,
          transition: `opacity ${duracao.maxima}ms ease-out`,
        }}
      >
        <Imagem
          id={ASSET_MAPA}
          rotulo="Mapa da jornada"
          largura={CANVAS.largura}
          altura={CANVAS.altura}
          decorativo
          mostrarRotulo={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            // Fundo escuro: a linha é a coisa mais clara da tela.
            opacity: 0.3,
          }}
        />

        <svg
          aria-hidden="true"
          width={CANVAS.largura}
          height={CANVAS.altura}
          viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`}
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          {(Object.keys(LUGARES) as LugarId[]).map((lugarId) => {
            const { x, y } = posicaoLugar(lugarId);
            const tocado = lugaresTocados.has(lugarId);
            const lugar = LUGARES[lugarId];
            return (
              <g key={lugarId}>
                <circle
                  cx={x}
                  cy={y}
                  r={NO_R}
                  fill={cores.painel}
                  stroke={tocado ? cores.destaque : cores.contorno}
                  strokeWidth={tocado ? borda.maxima : borda.media}
                  style={{
                    transition: `stroke ${duracao.media}ms ease-out, stroke-width ${duracao.media}ms ease-out`,
                  }}
                />
                <text
                  x={x}
                  y={y + NO_R + 34}
                  textAnchor="middle"
                  fill={tocado ? cores.destaque : cores.texto}
                  style={{
                    fontSize: tipografia.tamanhos.apoio,
                    fontWeight: tocado ? tipografia.pesos.maximo : tipografia.pesos.forte,
                  }}
                >
                  {lugar ? lugar.nome : lugarId}
                </text>
              </g>
            );
          })}

          {/* O convite: no centro, onde não havia nada. */}
          <circle
            cx={CONVITE.x}
            cy={CONVITE.y}
            r={CONVITE_R}
            fill={cores.destaque}
            stroke={cores.destaque}
            strokeWidth={borda.maxima}
          />
          <text
            x={CONVITE.x}
            y={CONVITE.y + CONVITE_R + 40}
            textAnchor="middle"
            fill={cores.destaque}
            style={{
              fontSize: tipografia.tamanhos.rotulo,
              fontWeight: tipografia.pesos.maximo,
            }}
          >
            O convite
          </text>
        </svg>
      </div>

      {/*
        Camada das linhas, ACIMA da barra e do painel: a linha tem que sair do
        ícone do item e da entrada da skill, não da borda de um overlay. Fica
        fora do escurecimento do mapa porque é ela a resposta que a versão
        futura aponta. As de item perdem peso quando a barra sai; a de skill
        fica acesa — é a tese.
      */}
      <svg
        aria-hidden="true"
        width={CANVAS.largura}
        height={CANVAS.altura}
        viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: camada.overlayPersistente + 1,
          pointerEvents: 'none',
        }}
      >
        {feitas.map((conexao, indice) => (
          <LinhaConexao
            key={`conexao-${indice}`}
            pontos={pontosDaConexao(conexao)}
            espessura={conexao.espessura}
            duracaoMs={conexao.duracaoMs}
            opacidade={barraSaiu && conexao.origem.tipo === 'item' ? 0.5 : 1}
          />
        ))}
      </svg>

      {/* ------------------------------------------------- painel de skills */}
      <section
        aria-label="O que eu aprendi"
        style={{
          position: 'absolute',
          left: PAINEL_X,
          top: PAINEL_Y,
          width: PAINEL_L,
          height: CANVAS.altura - PAINEL_Y - PAINEL_BASE,
          zIndex: camada.overlayPersistente,
          background: cores.veuLeve,
          overflow: 'hidden',
        }}
      >
        <h2
          style={{
            position: 'absolute',
            left: espaco.md,
            top: espaco.lg,
            height: PAINEL_CABECALHO_A,
            fontSize: tipografia.tamanhos.rotulo,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.destaque,
          }}
        >
          O que eu aprendi
        </h2>

        {skills.map((skillId, indice) => {
          const skill = SKILLS[skillId];
          const conectada = skillsConectadas.has(skillId);
          // Depois que a barra sai, as nove ficam acesas, sozinhas com o mapa.
          const acesa = conectada || barraSaiu;
          return (
            <span
              key={skillId}
              style={{
                position: 'absolute',
                left: espaco.md,
                top: PAINEL_PRIMEIRA_LINHA_Y - PAINEL_Y + indice * PAINEL_PASSO,
                width: PAINEL_L - espaco.md - espaco.lg,
                height: PAINEL_LINHA_A,
                display: 'flex',
                alignItems: 'center',
                fontSize: tipografia.tamanhos.corpo,
                fontWeight: conectada ? tipografia.pesos.maximo : tipografia.pesos.forte,
                lineHeight: tipografia.alturaLinha.compacta,
                color: acesa ? cores.destaque : cores.texto,
                transition: `color ${duracao.longa}ms ease-out`,
              }}
            >
              {skill ? skill.nome : skillId}
            </span>
          );
        })}
      </section>

      {/* --------------------------------------------------- barra de itens */}
      <section
        aria-label="Itens"
        style={{
          position: 'absolute',
          left: 0,
          top: BARRA_Y,
          width: CANVAS.largura,
          height: BARRA_A,
          zIndex: camada.overlayPersistente,
          background: cores.painel,
          borderTop: `${borda.grossa}px solid ${cores.contorno}`,
          // Depois da quarta conexão a barra se recolhe e sai de cena.
          transform: barraSaiu ? `translateY(${BARRA_A + 40}px)` : 'translateY(0)',
          opacity: barraSaiu ? 0 : 1,
          transition: `transform ${duracao.longa}ms ease-out, opacity ${duracao.longa}ms ease-out`,
        }}
      >
        <h2
          style={{
            position: 'absolute',
            left: espaco.margem,
            top: (BARRA_A - 30) / 2,
            width: BARRA_ROTULO_L,
            fontSize: tipografia.tamanhos.apoio,
            fontWeight: tipografia.pesos.maximo,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.textoApoio,
            textTransform: 'uppercase',
          }}
        >
          Itens
        </h2>

        {slots.map((itemId, indice) => {
          const consumido = itens[itemId] === 'consumido';
          const item = ITENS[itemId];
          const pulsando = itemQuePulsa === itemId;
          return (
            <span
              key={itemId}
              style={{
                position: 'absolute',
                left: ITEM_X + indice * ITEM_PASSO,
                top: ITEM_Y - BARRA_Y,
                width: ITEM_L,
                height: ITEM_A,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: espaco.xs,
                padding: espaco.sm,
                background: cores.fundoElevado,
                border: `${borda.media}px solid ${cores.contorno}`,
                borderRadius: raio.md,
                // Item que conectou se apaga na barra.
                opacity: consumido ? 0.12 : 1,
                transition: `opacity ${duracao.media}ms ease-out`,
              }}
            >
              {/* Wrapper próprio para o pulso: remontar o ícone não pode
                  interromper a transição de opacidade do slot. */}
              <span
                key={`icone-${itemId}-${pulsando ? conexoesFeitas : 0}`}
                className={pulsando ? 'rev-pulso' : undefined}
                style={{ display: 'block', width: ICONE, height: ICONE }}
              >
                <Imagem
                  id={assetDoItem(itemId)}
                  rotulo={item ? item.nome : itemId}
                  largura={ICONE}
                  altura={ICONE}
                  mostrarRotulo={false}
                  decorativo
                />
              </span>
              <span
                style={{
                  fontSize: tipografia.tamanhos.apoio,
                  fontWeight: tipografia.pesos.forte,
                  lineHeight: tipografia.alturaLinha.compacta,
                  textAlign: 'center',
                  color: cores.texto,
                }}
              >
                {item ? item.nome : itemId}
              </span>
            </span>
          );
        })}
      </section>

      {/* -------------------------------- uma linha curta de texto por conexão */}
      <p
        aria-live="polite"
        style={{
          position: 'absolute',
          left: espaco.margem,
          top: FAIXA_TEXTO_Y,
          width: CANVAS.largura - 2 * espaco.margem - PAINEL_L + espaco.margem,
          zIndex: camada.narracao,
          margin: 0,
          padding: `${espaco.md}px ${espaco.lg}px`,
          background: cores.veu,
          borderRadius: raio.md,
          textAlign: 'center',
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.forte,
          lineHeight: tipografia.alturaLinha.compacta,
          // A quarta conexão traz duas linhas no próprio texto.
          whiteSpace: 'pre-line',
          color: cores.texto,
          opacity: ultima && !barraSaiu ? 1 : 0,
          transition: `opacity ${duracao.media}ms ease-out`,
        }}
      >
        {ultima ? ultima.texto : ''}
      </p>

      {/*
        A TESE EM IMAGEM. Não há texto aqui de propósito: a barra vazia saindo
        de cena e o painel de nove skills que permanece aceso são a tese inteira.
        Nenhuma fala precisa explicar — a tela explica, e qualquer parágrafo
        nesta faixa competiria com a imagem que ele deveria deixar falar. O
        apresentador diz a tese em voz alta; está no roteiro como gancho de fala.
      */}

      {/* ----------------------------------------------------- versão futura */}
      {versaoFutura ? (
        <>
          {/* As duas na mesma tela: mesma pessoa, dez anos de distância. */}
          <div
            className="jogo-surgir"
            style={{
              position: 'absolute',
              left: 200,
              top: 620,
              zIndex: camada.protagonista,
            }}
          >
            <Imagem id={assetDoSprite('ana-confiante')} rotulo="Ana" largura={190} altura={400} />
          </div>
          <div
            className="jogo-surgir"
            style={{
              position: 'absolute',
              left: 410,
              top: 570,
              zIndex: camada.protagonista,
            }}
          >
            <Imagem
              id={assetDoSprite('ana-futura')}
              rotulo="Ana, dez anos depois"
              largura={230}
              altura={450}
            />
          </div>

          <p
            style={{
              position: 'absolute',
              left: 150,
              top: 470,
              width: 700,
              zIndex: camada.narracao,
              margin: 0,
              padding: `${espaco.md}px ${espaco.lg}px`,
              background: cores.caixa,
              border: `${borda.grossa}px solid ${cores.contorno}`,
              borderRadius: raio.lg,
              textAlign: 'center',
              fontSize: tipografia.tamanhos.subtitulo,
              fontWeight: tipografia.pesos.forte,
              color: cores.texto,
              opacity: perguntaVisivel ? 1 : 0,
              transition: `opacity ${duracao.media}ms ease-out`,
            }}
          >
            Eu fui efetivada?
          </p>

          {/*
            Ela não responde: aponta pro mapa. Fora da camada escurecida,
            porque o gesto é a resposta e precisa de contraste. Sustentado sem
            texto e sem movimento até o apresentador clicar.
          */}
          {perguntaVisivel ? null : (
            <svg
              aria-hidden="true"
              className="jogo-surgir"
              width={CANVAS.largura}
              height={CANVAS.altura}
              viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: camada.protagonista + 1,
                pointerEvents: 'none',
              }}
            >
              <line
                x1={660}
                y1={860}
                x2={775}
                y2={589}
                stroke={cores.destaque}
                strokeWidth={14}
                strokeLinecap="round"
              />
              <polygon points="800,530 803,601 747,577" fill={cores.destaque} />
            </svg>
          )}
        </>
      ) : null}

      {/* --------------------------------------------------- avanço por clique */}
      <button
        type="button"
        className="rev-avancar"
        aria-label={ROTULO_AVANCO[fase]}
        disabled={travado}
        onClick={avancar}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: camada.cartao,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: travado ? 'default' : 'pointer',
        }}
      />
    </div>
  );
}

export default Revelacao;
