/**
 * Puzzle do Bloco 3 (Innovation) — estruturar a proposta.
 *
 * Fragmentos à esquerda, campos à direita: selecionar e colocar, a mesma
 * gramática do "usar item em alvo" do resto do jogo.
 *
 * Fragmento com `campo: null` é DISTRATOR: ao tentar colocar, aparece
 * `textoDistrator` e o fragmento volta pra lista. O puzzle é sobre escolher,
 * não sobre preencher — o distrator não encaixa em lugar nenhum.
 */
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { PuzzleEstruturar } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { borda, cores, duracao, easing, espaco, raio, tipografia } from '../../styles/tokens';

const LARGURA_FRAGMENTOS = 780;
const LARGURA_CAMPOS = 660;
const ALTURA_FRAGMENTO = 104;
const ALTURA_CAMPO = 148;
const ESPERA_CONCLUSAO_MS = 1200;
const AVISO_MS = 4500;

const CSS = `
@keyframes pz-est-sacudir {
  0% { transform: translateX(0); }
  25% { transform: translateX(-16px); }
  50% { transform: translateX(16px); }
  75% { transform: translateX(-8px); }
  100% { transform: translateX(0); }
}
.pz-est-sacudir { animation: pz-est-sacudir ${duracao.curta}ms ${easing.suave} 1; }
`;

export interface EstruturarProps {
  def: PuzzleEstruturar;
}

export function Estruturar({ def }: EstruturarProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  /** campoId -> fragmentoId */
  const [colocados, setColocados] = useState<Record<string, string>>({});
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [sacudindo, setSacudindo] = useState<string | null>(null);
  const temporizadores = useRef<number[]>([]);

  const completo = def.campos.length > 0 && Object.keys(colocados).length === def.campos.length;

  useEffect(
    () => () => {
      for (const id of temporizadores.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('estruturar'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  function agendar(acao: () => void, atraso: number): void {
    const id = window.setTimeout(acao, atraso);
    temporizadores.current.push(id);
  }

  function clicarFragmento(id: string): void {
    setAviso(null);
    setSelecionado((atual) => (atual === id ? null : id));
  }

  function clicarCampo(campoId: string): void {
    const fragId = selecionado;
    if (!fragId || colocados[campoId]) return;

    const fragmento = def.fragmentos.find((f) => f.id === fragId);
    if (!fragmento) return;

    // Distrator: verdadeiro, mas ninguém consegue fazer nada com isso.
    if (fragmento.campo === null) {
      setSelecionado(null);
      setAviso(def.textoDistrator);
      agendar(() => setAviso(null), AVISO_MS);
      return;
    }

    // Fragmento certo, campo errado: volta pra lista, sem texto e sem punição.
    if (fragmento.campo !== campoId) {
      setSelecionado(null);
      setSacudindo(campoId);
      agendar(() => setSacudindo(null), duracao.curta);
      return;
    }

    setColocados((atual) => ({ ...atual, [campoId]: fragId }));
    setSelecionado(null);
    setAviso(null);
  }

  const usados = new Set(Object.values(colocados));
  const textoPorFragmento = new Map(def.fragmentos.map((f) => [f.id, f.texto]));

  return (
    <div style={{ textAlign: 'center' }}>
      <style>{CSS}</style>

      <h2
        style={{
          fontSize: tipografia.tamanhos.subtitulo,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.texto,
        }}
      >
        Da reclamação para a proposta
      </h2>
      <p
        style={{
          marginTop: espaco.md,
          marginBottom: espaco.xl,
          fontSize: tipografia.tamanhos.corpo,
          color: cores.textoApoio,
        }}
      >
        Escolha um fragmento e coloque no campo dele. Nem todo fragmento tem campo.
      </p>

      <div
        style={{
          display: 'flex',
          gap: espaco.xxl,
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <ul
          style={{
            width: LARGURA_FRAGMENTOS,
            display: 'flex',
            flexDirection: 'column',
            gap: espaco.md,
          }}
        >
          {def.fragmentos.map((fragmento) => {
            const colocado = usados.has(fragmento.id);
            const ativo = selecionado === fragmento.id;
            return (
              <li key={fragmento.id}>
                <button
                  type="button"
                  aria-label={`Fragmento: ${fragmento.texto}${colocado ? ' (já usado)' : ''}`}
                  aria-pressed={ativo}
                  disabled={colocado}
                  onClick={() => clicarFragmento(fragmento.id)}
                  style={{
                    width: '100%',
                    minHeight: ALTURA_FRAGMENTO,
                    padding: `${espaco.md}px ${espaco.lg}px`,
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'left',
                    fontSize: tipografia.tamanhos.corpo,
                    fontWeight: tipografia.pesos.forte,
                    lineHeight: tipografia.alturaLinha.compacta,
                    color: cores.texto,
                    background: cores.caixa,
                    border: `${ativo ? borda.grossa : borda.media}px solid ${
                      ativo ? cores.destaque : cores.contorno
                    }`,
                    borderRadius: raio.md,
                    opacity: colocado ? 0.2 : 1,
                    cursor: colocado ? 'default' : 'pointer',
                    transition: `border-color ${duracao.curta}ms ${easing.suave}, opacity ${duracao.curta}ms ${easing.suave}`,
                  }}
                >
                  {fragmento.texto}
                </button>
              </li>
            );
          })}
        </ul>

        <div
          style={{
            width: LARGURA_CAMPOS,
            display: 'flex',
            flexDirection: 'column',
            gap: espaco.lg,
          }}
        >
          {def.campos.map((campo) => {
            const fragId = colocados[campo.id];
            const texto = fragId ? textoPorFragmento.get(fragId) : undefined;
            const preenchido = texto !== undefined;
            return (
              <div key={campo.id} style={{ textAlign: 'left' }}>
                <span
                  style={{
                    display: 'block',
                    marginBottom: espaco.xs,
                    fontSize: tipografia.tamanhos.corpo,
                    fontWeight: tipografia.pesos.maximo,
                    letterSpacing: tipografia.espacamento.largo,
                    textTransform: 'uppercase',
                    color: cores.destaque,
                  }}
                >
                  {campo.rotulo}
                </span>
                <button
                  type="button"
                  className={sacudindo === campo.id ? 'pz-est-sacudir' : undefined}
                  aria-label={
                    preenchido
                      ? `${campo.rotulo}: ${texto}`
                      : `Colocar o fragmento selecionado em ${campo.rotulo}`
                  }
                  disabled={preenchido || selecionado === null}
                  onClick={() => clicarCampo(campo.id)}
                  style={estiloCampo(preenchido)}
                >
                  {texto ?? ''}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p
        aria-live="polite"
        style={{
          maxWidth: 1400,
          minHeight: tipografia.tamanhos.rotulo * 2,
          margin: `${espaco.xl}px auto 0`,
          fontSize: tipografia.tamanhos.rotulo,
          fontWeight: tipografia.pesos.forte,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.destaque,
          opacity: aviso ? 1 : 0,
          transition: `opacity ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        {aviso ?? ''}
      </p>
    </div>
  );
}

function estiloCampo(preenchido: boolean): CSSProperties {
  return {
    width: '100%',
    minHeight: ALTURA_CAMPO,
    padding: `${espaco.md}px ${espaco.lg}px`,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    fontSize: tipografia.tamanhos.corpo,
    fontWeight: tipografia.pesos.forte,
    lineHeight: tipografia.alturaLinha.compacta,
    color: preenchido ? cores.textoInverso : cores.textoApoio,
    background: preenchido ? cores.destaque : cores.caixa,
    border: `${borda.media}px ${preenchido ? 'solid' : 'dashed'} ${
      preenchido ? cores.destaque : cores.contorno
    }`,
    borderRadius: raio.md,
    cursor: preenchido ? 'default' : 'pointer',
    transition: `background ${duracao.curta}ms ${easing.suave}, color ${duracao.curta}ms ${easing.suave}`,
  };
}

export default Estruturar;
