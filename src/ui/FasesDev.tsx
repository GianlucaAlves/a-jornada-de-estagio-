import { useEffect, useState } from 'react';
import { BLOCOS } from '../domain/content';
import type { BlocoId } from '../domain/types';
import { useJogo } from '../store/jogo';
import { borda, camada, cores, espaco, tipografia } from '../styles/tokens';

export function iniciarTesteDaFase(bloco: BlocoId): void {
  // Um salto durante diálogo ou após o clímax não pode carregar overlays,
  // puzzles resolvidos e barra recolhida do teste anterior para a nova fase.
  useJogo.getState().reiniciar();
  useJogo.getState().entrarNoBloco(bloco);
  // Testes entram direto na cena; o botão Pensamento permite ensaiar a
  // reflexão quando ela for o alvo, sem repeti-la a cada salto de fase.
  useJogo.setState({ reflexaoVista: { [bloco]: true } });
  const lugar = BLOCOS[bloco].estadoAssumido.lugaresDestravados[0];
  if (lugar) useJogo.getState().entrarNoLugar(lugar);
}

export function FasesDev({ aoTrocar }: { aoTrocar: () => void }): JSX.Element {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') { setAberto(false); return; }
      if (evento.key !== 'F8' || evento.repeat) return;
      evento.preventDefault();
      setAberto(valor => !valor);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return <>
    <button type="button" className="jogo-botao" onClick={() => setAberto(valor => !valor)}
      aria-label="Trocar fase para teste (F8)" aria-expanded={aberto}
      style={{ position: 'absolute', right: espaco.md, bottom: espaco.md,
        zIndex: camada.abertura + 1, fontSize: tipografia.minimo }}>
      DEV · F8
    </button>
    {aberto ? <div role="dialog" aria-modal="true" aria-label="Fases para desenvolvimento"
      style={{ position: 'absolute', inset: 0, zIndex: camada.abertura + 2,
        display: 'grid', placeItems: 'center', background: cores.veu, padding: espaco.margem }}>
      <section className="jogo-caixa" style={{ maxWidth: 1000 }}>
        <h2 style={{ fontSize: tipografia.tamanhos.subtitulo }}>Testar fase</h2>
        <p style={{ fontSize: tipografia.tamanhos.corpo, marginBlock: espaco.md }}>
          Cada salto reinicia o progresso salvo com os itens e habilidades iniciais da fase.
          A reflexão pode ser aberta pelo botão Pensamento.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: espaco.sm }}>
          {Object.values(BLOCOS).map(fase => <button key={fase.id} type="button"
            className="jogo-botao" onClick={() => {
              iniciarTesteDaFase(fase.id);
              aoTrocar();
              setAberto(false);
            }} style={{ textAlign: 'left', border: `${borda.media}px solid ${cores.contorno}` }}>
            {fase.id} · {fase.titulo}
          </button>)}
        </div>
        <button type="button" className="jogo-botao" autoFocus onClick={() => setAberto(false)}
          style={{ marginTop: espaco.md }}>Fechar · F8</button>
      </section>
    </div> : null}
  </>;
}
