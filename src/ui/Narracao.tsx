/**
 * Overlay de narração e de falha.
 *
 * Duas coisas, um componente, porque a leitura na tela é idêntica: bloco de
 * texto grande, fundo escuro, fechado por clique. A mensagem de falha é ÚNICA
 * para toda combinação errada (decisão do spec: previsibilidade ao vivo vale
 * mais que variedade de resposta).
 */
import { useEffect, useRef, useState } from 'react';
import { useJogo } from '../store/jogo';
import {
  borda,
  camada,
  cores,
  espaco,
  raio,
  sombra,
  tipografia,
} from '../styles/tokens';

/**
 * Trava de entrada da camada — mesmo conceito do `travar()` em Revelacao.tsx.
 *
 * O overlay é `inset: 0` e fecha por clique em qualquer ponto: montar e aceitar
 * clique no mesmo quadro faz o segundo clique de um duplo-clique fechar a
 * narração antes de ela ser lida.
 */
const TRAVA_DE_ENTRADA_MS = 420;

export function Narracao(): JSX.Element | null {
  const narracao = useJogo((s) => s.narracao);
  const mensagemFalha = useJogo((s) => s.mensagemFalha);
  const fecharNarracao = useJogo((s) => s.fecharNarracao);
  const fecharMensagemFalha = useJogo((s) => s.fecharMensagemFalha);

  const botao = useRef<HTMLButtonElement | null>(null);
  const texto = mensagemFalha ?? narracao;

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

  useEffect(() => {
    if (texto === null) {
      // Sem texto não há camada: rearma para que a próxima nasça travada.
      setTravado(true);
      return;
    }
    botao.current?.focus();
    travar(TRAVA_DE_ENTRADA_MS);
  }, [texto]);

  if (texto === null) return null;

  const fechar = (): void => {
    if (travado) return;
    if (mensagemFalha !== null) fecharMensagemFalha();
    else fecharNarracao();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mensagemFalha !== null ? 'Mensagem' : 'Narração'}
      onClick={fechar}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: camada.narracao,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: espaco.margem,
        background: cores.veu,
        cursor: travado ? 'default' : 'pointer',
      }}
    >
      <div
        className="jogo-aparecer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: espaco.xl,
          width: 1320,
          maxWidth: '100%',
          background: cores.caixa,
          border: `${borda.grossa}px solid ${cores.contorno}`,
          borderRadius: raio.lg,
          boxShadow: sombra.caixa,
          padding: espaco.xl,
        }}
      >
        <p
          aria-live="polite"
          style={{
            fontSize: tipografia.tamanhos.rotulo,
            lineHeight: tipografia.alturaLinha.corpo,
            fontWeight: tipografia.pesos.normal,
            color: cores.texto,
          }}
        >
          {texto}
        </p>

        {/* `aria-disabled` em vez de `disabled`: a caixa recebe foco na entrada
            (leitor de tela lê o texto) e um botão desabilitado não é focável.
            O clique é barrado em `fechar`. */}
        <button
          ref={botao}
          type="button"
          className="jogo-botao"
          aria-label="Fechar e continuar"
          aria-disabled={travado}
          onClick={fechar}
          style={{
            alignSelf: 'flex-end',
            minWidth: 260,
            cursor: travado ? 'default' : 'pointer',
          }}
        >
          Continuar ▶
        </button>
      </div>
    </div>
  );
}

export default Narracao;
