/**
 * Mapa hub-and-spoke.
 *
 * Os seis slots aparecem desde o início. Silhuetado = forma escura e ANÔNIMA:
 * a plateia sabe que existe algo ali e não sabe o quê. O desbloqueio revela o
 * nome. Concluído recebe marca discreta — nada de celebração.
 */
import { useEffect, useRef, useState } from 'react';
import { ASSET_MAPA } from '../assets/manifest';
import { LUGARES } from '../domain/content';
import { seletores, useJogo } from '../store/jogo';
import type { EstadoLugar, LugarId, Ponto } from '../domain/types';
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
  progressao,
  mapaJornada,
} from '../styles/tokens';
import { Imagem } from './Imagem';
import { Posicionado } from './Canvas';
import { SpriteAnimado } from './SpriteAnimado';

const LARGURA_SLOT = 300;
/**
 * Miniatura mais baixa que o desenho original (eram 168px): a área livre do
 * mapa não tem altura para duas fileiras de slot de ~300px sem que elas se
 * sobreponham. O que encolhe é arte decorativa — o rótulo continua em 28px.
 */
const ALTURA_MINIATURA = 120;
/**
 * Duas linhas de rótulo SEMPRE reservadas, em silhueta também: 'Sala de
 * Treinamento' quebra em duas linhas, e altura de slot que depende da métrica
 * da fonte não é geometria confiável. Reservar também evita que o slot mude de
 * tamanho no instante em que o nome é revelado.
 */
const ALTURA_ROTULO = Math.round(tipografia.tamanhos.corpo * tipografia.alturaLinha.corpo) * 2;
/** Altura total do slot, incluindo padding e borda (box-sizing: border-box). */
const ALTURA_SLOT =
  2 * espaco.sm + ALTURA_MINIATURA + espaco.sm + ALTURA_ROTULO + 2 * borda.grossa;

// ------------------------------------------------------------ enquadramento

/**
 * ÁREA LIVRE DO MAPA.
 *
 * As posições de LUGARES são % do canvas CHEIO — e o canvas cheio não está
 * livre: o painel de skills ocupa a faixa da direita e a barra de itens a faixa
 * de baixo. Aplicadas direto, duas slots caem atrás do painel e uma tem o
 * rótulo cortado pela barra. O conteúdo é fonte de verdade e não se mexe, então
 * o enquadramento é responsabilidade desta tela.
 *
 * Faixas excluídas (mesmos números de PainelDeSkills.tsx e BarraDeItens.tsx):
 *   - painel de skills: x >= 1500  (largura 420, ancorado à direita)
 *   - barra de itens:   y >= 890   (altura 190, ancorada embaixo)
 *   - título da tela:   y <= 146   (no canto superior esquerdo)
 *
 * CAIXA LIVRE, em px de canvas: x [64, 1468], y [166, 870].
 *
 * A caixa dos CENTROS é a caixa livre encolhida por meio slot em cada lado, de
 * modo que a moldura E o rótulo inteiros caibam dentro dela: x [214, 1318],
 * y [291, 745]. Os extremos declarados em LUGARES são normalizados para essa
 * caixa — a posição relativa de cada lugar (quem é esquerda, centro, direita,
 * cima, baixo) é preservada, e nenhum slot nem rótulo invade as faixas.
 */
const PAINEL_L = 420;
const BARRA_A = 190;
/** Altura real do <h1> da tela: uma linha de 40px + padding vertical. */
const ALTURA_TITULO =
  Math.round(tipografia.tamanhos.subtitulo * tipografia.alturaLinha.corpo) + 2 * espaco.sm;

const LIVRE_ESQ = espaco.margem;
const LIVRE_DIR = CANVAS.largura - PAINEL_L - espaco.margem;
const LIVRE_TOPO = espaco.margem + ALTURA_TITULO + espaco.md;
const LIVRE_BASE = CANVAS.altura - BARRA_A - espaco.md;

const CENTRO_ESQ = LIVRE_ESQ + LARGURA_SLOT / 2;
const CENTRO_DIR = LIVRE_DIR - LARGURA_SLOT / 2;
const CENTRO_TOPO = LIVRE_TOPO + ALTURA_SLOT / 2;
const CENTRO_BASE = LIVRE_BASE - ALTURA_SLOT / 2;

/** Extremos de LUGARES: normalizar por eles usa a caixa toda, sem achatar. */
const EXTREMOS = (() => {
  const lugares = Object.values(LUGARES);
  const xs = lugares.map((l) => l.pos.x);
  const ys = lugares.map((l) => l.pos.y);
  return {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };
})();

function interpolar(
  valor: number,
  min: number,
  max: number,
  inicio: number,
  fim: number,
): number {
  // Todos no mesmo eixo: sem escala possível, centraliza em vez de dividir por 0.
  if (max <= min) return (inicio + fim) / 2;
  return inicio + ((valor - min) / (max - min)) * (fim - inicio);
}

/**
 * Centro do slot, de volta em % do canvas — é o que `Posicionado` espera.
 * Exportada para o teste de geometria em Mapa.geometria.test.ts.
 */
export function posicaoEnquadrada(pos: Ponto): Ponto {
  const x = interpolar(pos.x, EXTREMOS.xMin, EXTREMOS.xMax, CENTRO_ESQ, CENTRO_DIR);
  const y = interpolar(pos.y, EXTREMOS.yMin, EXTREMOS.yMax, CENTRO_TOPO, CENTRO_BASE);
  return { x: (x / CANVAS.largura) * 100, y: (y / CANVAS.altura) * 100 };
}

/** Caixa livre e tamanho do slot, para o teste de geometria. */
export const ENQUADRAMENTO = {
  livre: { esquerda: LIVRE_ESQ, direita: LIVRE_DIR, topo: LIVRE_TOPO, base: LIVRE_BASE },
  slot: { largura: LARGURA_SLOT, altura: ALTURA_SLOT },
} as const;

function rotuloAcessivel(nome: string | null, estado: EstadoLugar): string {
  if (estado === 'silhueta') return 'Lugar ainda não descoberto';
  const alvoNome = nome ?? 'Lugar';
  return estado === 'concluido' ? `${alvoNome} — já concluído. Entrar` : `Entrar em ${alvoNome}`;
}

export function Mapa(): JSX.Element {
  const slots = useJogo(seletores.slotsDoMapa);
  const entrarNoLugar = useJogo((s) => s.entrarNoLugar);
  const nivel = useJogo(s => s.nivel);
  const [destino, setDestino] = useState<LugarId | null>(null);
  const [posicao, setPosicao] = useState<Ponto>(mapaJornada.centro);
  const temporizador = useRef<number>();
  useEffect(() => () => window.clearTimeout(temporizador.current), []);
  function viajar(id: LugarId): void {
    if (destino) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { entrarNoLugar(id); return; }
    setDestino(id);
    const alvo = posicaoEnquadrada(LUGARES[id].pos);
    setPosicao({ x: alvo.x, y: posicao.y });
    temporizador.current = window.setTimeout(() => {
      setPosicao(alvo);
      temporizador.current = window.setTimeout(() => entrarNoLugar(id), progressao.percursoMapa / 2);
    }, progressao.percursoMapa / 2);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: camada.cenario }}>
      <SpriteAnimado
        id={ASSET_MAPA}
        rotulo="Campus da jornada"
        largura={CANVAS.largura}
        altura={CANVAS.altura}
        decorativo
        estado="estatico"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animationDuration: `${duracao.esteira}ms` }}
      />

      <svg aria-hidden="true" viewBox={`0 0 ${CANVAS.largura} ${CANVAS.altura}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {slots.map(slot => {
          const p = posicaoEnquadrada(slot.pos);
          const d = `M ${p.x * CANVAS.largura / 100} ${mapaJornada.centro.y * CANVAS.altura / 100} V ${p.y * CANVAS.altura / 100}`;
          return <g key={slot.id}><path d={d} fill="none" stroke={cores.textoApoio} strokeWidth={espaco.lg + borda.grossa * 2} /><path d={d} fill="none" stroke={cores.caixa} strokeWidth={espaco.lg} /><path d={d} fill="none" stroke={slot.estado === 'concluido' ? cores.sucesso : slot.estado === 'silhueta' ? cores.silhuetaContorno : cores.destaque} strokeWidth={borda.grossa} strokeDasharray={`${espaco.sm} ${espaco.sm}`} /></g>;
        })}
        <path d={`M ${CENTRO_ESQ} ${mapaJornada.centro.y * CANVAS.altura / 100} H ${CENTRO_DIR}`} fill="none" stroke={cores.textoApoio} strokeWidth={espaco.lg + borda.grossa * 2} />
        <path d={`M ${CENTRO_ESQ} ${mapaJornada.centro.y * CANVAS.altura / 100} H ${CENTRO_DIR}`} fill="none" stroke={cores.caixa} strokeWidth={espaco.lg} />
        <path d={`M ${CENTRO_ESQ} ${mapaJornada.centro.y * CANVAS.altura / 100} H ${CENTRO_DIR}`} fill="none" stroke={cores.textoApoio} strokeWidth={borda.grossa} strokeDasharray={`${espaco.sm} ${espaco.sm}`} />
      </svg>
      <div aria-hidden="true" style={{ position: 'absolute', left: `${posicao.x}%`, top: `${posicao.y}%`, transform: 'translate(-50%, -100%)', zIndex: camada.protagonista, pointerEvents: 'none', transition: `left ${progressao.percursoMapa / 2}ms linear, top ${progressao.percursoMapa / 2}ms linear` }}><SpriteAnimado id={`ana-nivel-${nivel}`} rotulo="Ana no mapa" largura={mapaJornada.ana.largura} altura={mapaJornada.ana.altura} estado={destino ? 'andando' : 'parado'} decorativo /></div>

      <h1
        style={{
          position: 'absolute',
          left: espaco.margem,
          top: espaco.margem,
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.maximo,
          color: cores.texto,
          background: cores.veuLeve,
          padding: `${espaco.sm}px ${espaco.lg}px`,
          borderRadius: raio.md,
        }}
      >
        Escolha seu próximo destino
      </h1>

      {slots.map((slot) => (
        <SlotDoMapa
          key={slot.id}
          id={slot.id}
          nome={slot.nome}
          estado={slot.estado}
          pos={posicaoEnquadrada(slot.pos)}
          onEntrar={viajar}
        />
      ))}
    </div>
  );
}

interface PropsSlot {
  id: LugarId;
  nome: string | null;
  estado: EstadoLugar;
  /** Centro do slot, já enquadrado na área livre, em % do canvas. */
  pos: Ponto;
  onEntrar: (lugarId: LugarId) => void;
}

function SlotDoMapa({ id, nome, estado, pos, onEntrar }: PropsSlot): JSX.Element {
  const silhuetado = estado === 'silhueta';
  const concluido = estado === 'concluido';

  const corDaBorda = silhuetado
    ? cores.silhuetaContorno
    : concluido
      ? cores.sucesso
      : cores.contorno;

  return (
    <Posicionado pos={pos} ancora="centro" zIndex={camada.hotspot}>
      <button
        type="button"
        className="jogo-botao-nu"
        disabled={silhuetado}
        aria-label={rotuloAcessivel(nome, estado)}
        onClick={() => {
          if (!silhuetado) onEntrar(id);
        }}
        style={{
          width: LARGURA_SLOT,
          // Altura fixa (e não mínima): é ela que o enquadramento usa para
          // garantir que nem moldura nem rótulo invadam as faixas dos overlays.
          height: ALTURA_SLOT,
          minHeight: alvo.confortavel,
          padding: espaco.sm,
          background: 'transparent',
          border: `${borda.media}px solid transparent`,
          borderRadius: raio.sm,
          cursor: silhuetado ? 'default' : 'pointer',
          transition: `background ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: ALTURA_MINIATURA,
            borderRadius: raio.md,
            overflow: 'hidden',
            background: 'transparent',
          }}
        >
          {silhuetado ? <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 68 36"><path d="M4 33V15H14V5H52V15H64V33Z" fill={cores.silhueta} stroke={cores.silhuetaContorno} strokeWidth="2" /><path d="M30 14H38V20H34V24 M34 27V29" fill="none" stroke={cores.textoApoio} strokeWidth="3" /></svg> : (
            <Imagem
              id={`marco-${id}`}
              rotulo={nome ?? 'Lugar'}
              largura={LARGURA_SLOT - espaco.md}
              altura={ALTURA_MINIATURA}
              decorativo
              mostrarRotulo={false}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </span>

        {/* Espaço do rótulo é reservado SEMPRE: a altura do slot é geometria,
            não resultado da métrica do texto. Silhueta não mostra nome — é o
            ponto todo do slot anônimo — mas ocupa o mesmo retângulo. */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: espaco.sm,
            marginTop: espaco.sm,
            height: ALTURA_ROTULO,
            overflow: 'hidden',
            fontSize: tipografia.tamanhos.corpo,
            fontWeight: tipografia.pesos.forte,
            lineHeight: tipografia.alturaLinha.corpo,
            color: cores.texto,
            textAlign: 'center',
            background: cores.caixa,
            borderBottom: `${borda.grossa}px solid ${corDaBorda}`,
          }}
        >
          {silhuetado ? 'A descobrir' : (
            <>
              {nome ?? 'Lugar'}
              {/* Marca discreta de concluído: um traço de cor, sem festa. */}
              {concluido ? (
                <span
                  aria-hidden
                  style={{ color: cores.sucesso, fontWeight: tipografia.pesos.maximo }}
                >
                  ✓
                </span>
              ) : null}
            </>
          )}
        </span>
      </button>
    </Posicionado>
  );
}

export default Mapa;
