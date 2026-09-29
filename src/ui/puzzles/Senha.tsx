/**
 * Puzzle do Bloco 1 — composição de senha.
 *
 * Um campo por NPC, separados por hífen. O gabarito vem inteiro do PuzzleDef:
 * nenhuma resposta vive neste arquivo, e a quantidade de campos é derivada de
 * `gabarito.length` — trocar o conteúdo não exige tocar na UI.
 *
 * Sem botão de confirmar: a validação é imediata a cada tecla. No palco, um
 * botão é mais uma coisa pra errar, e a regra fica óbvia sem tutorial — três
 * pedaços, três pessoas, um hífen entre eles.
 */
import { useEffect, useRef, useState } from 'react';

import type { PuzzleSenha } from '../../domain/types';
import { useJogo } from '../../store/jogo';
import { borda, cores, duracao, easing, espaco, raio, tipografia } from '../../styles/tokens';

/** Tempo com a senha completa na tela antes de fechar o puzzle. */
const ESPERA_CONCLUSAO_MS = 900;
const LARGURA_CAMPO = 340;

const CSS = `
.pz-senha-campo::placeholder { color: ${cores.textoApoio}; opacity: 0.5; }
`;

function normalizar(valor: string): string {
  return valor.trim().toLowerCase();
}

export interface SenhaProps {
  def: PuzzleSenha;
}

export function Senha({ def }: SenhaProps): JSX.Element {
  const resolverPuzzle = useJogo((s) => s.resolverPuzzle);
  const [valores, setValores] = useState<string[]>(() => def.gabarito.map(() => ''));
  const campos = useRef<Array<HTMLInputElement | null>>([]);

  const acertos = def.gabarito.map(
    (esperado, i) => normalizar(valores[i] ?? '') === normalizar(esperado),
  );
  const completo = def.gabarito.length > 0 && acertos.every((certo) => certo);

  // Foco no primeiro campo: o apresentador começa a digitar sem clicar.
  useEffect(() => {
    campos.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!completo) return undefined;
    const id = window.setTimeout(() => resolverPuzzle('senha'), ESPERA_CONCLUSAO_MS);
    return () => window.clearTimeout(id);
  }, [completo, resolverPuzzle]);

  function aoDigitar(indice: number, valor: string): void {
    setValores((atual) => atual.map((v, i) => (i === indice ? valor : v)));
    const esperado = def.gabarito[indice];
    if (esperado && normalizar(valor) === normalizar(esperado)) {
      campos.current[indice + 1]?.focus();
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <style>{CSS}</style>

      <h2
        style={{
          fontSize: tipografia.tamanhos.titulo,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          color: cores.texto,
        }}
      >
        {def.rotulo}
      </h2>

      <p
        style={{
          marginTop: espaco.md,
          marginBottom: espaco.xxl,
          fontSize: tipografia.tamanhos.corpo,
          lineHeight: tipografia.alturaLinha.corpo,
          color: cores.textoApoio,
        }}
      >
        Cada pessoa te deu um pedaço. Junte os {def.gabarito.length}.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: espaco.lg,
        }}
      >
        {def.gabarito.map((_, indice) => {
          const certo = acertos[indice] === true;
          return (
            <div key={indice} style={{ display: 'flex', alignItems: 'center', gap: espaco.lg }}>
              {indice > 0 ? (
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: tipografia.tamanhos.titulo,
                    fontWeight: tipografia.pesos.maximo,
                    lineHeight: tipografia.alturaLinha.compacta,
                    color: cores.texto,
                  }}
                >
                  -
                </span>
              ) : null}

              <input
                ref={(el) => {
                  campos.current[indice] = el;
                }}
                className="pz-senha-campo"
                type="text"
                autoComplete="off"
                spellCheck={false}
                aria-label={`Parte ${indice + 1} de ${def.gabarito.length} da senha`}
                value={valores[indice] ?? ''}
                onChange={(evento) => aoDigitar(indice, evento.target.value)}
                placeholder="?"
                style={{
                  width: LARGURA_CAMPO,
                  padding: espaco.md,
                  textAlign: 'center',
                  fontSize: tipografia.tamanhos.titulo,
                  fontWeight: tipografia.pesos.forte,
                  lineHeight: tipografia.alturaLinha.compacta,
                  color: certo ? cores.textoInverso : cores.texto,
                  background: certo ? cores.destaque : cores.caixa,
                  border: `${certo ? borda.grossa : borda.media}px solid ${
                    certo ? cores.destaque : cores.contorno
                  }`,
                  borderRadius: raio.md,
                  transition: `background ${duracao.curta}ms ${easing.suave}, color ${duracao.curta}ms ${easing.suave}`,
                }}
              />
            </div>
          );
        })}
      </div>

      <p
        aria-live="polite"
        style={{
          marginTop: espaco.xxl,
          minHeight: tipografia.tamanhos.rotulo * 2,
          fontSize: tipografia.tamanhos.rotulo,
          fontWeight: tipografia.pesos.maximo,
          color: cores.destaque,
          opacity: completo ? 1 : 0,
          transition: `opacity ${duracao.curta}ms ${easing.suave}`,
        }}
      >
        Acesso liberado.
      </p>
    </div>
  );
}

export default Senha;
