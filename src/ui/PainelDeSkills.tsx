/**
 * Painel de skills — "O que eu aprendi".
 *
 * Lista de TEXTO na lateral: sem ícone, sem moldura, sem nada que pareça
 * objeto equipável. O peso visual é deliberadamente diferente da barra de
 * itens, porque os dois sistemas precisam ler como coisas diferentes: os itens
 * se consomem no Bloco 5, o painel permanece. Essa diferença é a tese.
 *
 * Skills nunca são consumidas e nunca são clicáveis.
 */
import { seletores, useJogo } from '../store/jogo';
import type { Skill } from '../domain/types';
import { camada, cores, espaco, tipografia } from '../styles/tokens';

export function PainelDeSkills(): JSX.Element | null {
  // Normalizado para tolerar índice não checado sem espalhar asserções.
  const skills: readonly (Skill | undefined)[] = useJogo(seletores.skillsNoPainel);

  if (skills.length === 0) return null;

  const ultimo = skills.length - 1;

  return (
    <section
      aria-label="O que eu aprendi"
      style={{
        position: 'absolute',
        right: 0,
        top: 120,
        bottom: 210,
        width: 420,
        zIndex: camada.overlayPersistente,
        display: 'flex',
        flexDirection: 'column',
        gap: espaco.md,
        padding: `${espaco.lg}px ${espaco.lg}px ${espaco.lg}px ${espaco.md}px`,
        // Véu plano só para garantir contraste sobre o cenário.
        // Sem borda e sem sombra: nada que pareça inventário.
        background: cores.veuLeve,
        overflow: 'hidden',
      }}
    >
      <h2
        style={{
          fontSize: tipografia.tamanhos.rotulo,
          fontWeight: tipografia.pesos.maximo,
          letterSpacing: tipografia.espacamento.largo,
          color: cores.destaque,
        }}
      >
        O que eu aprendi
      </h2>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: espaco.md }}>
        {skills.map((skill, indice) =>
          skill === undefined ? null : (
            <li key={skill.id} className={indice === ultimo ? 'jogo-aparecer' : undefined}>
              <span
                style={{
                  display: 'block',
                  fontSize: tipografia.tamanhos.corpo,
                  fontWeight: tipografia.pesos.forte,
                  lineHeight: tipografia.alturaLinha.compacta,
                  color: cores.texto,
                }}
              >
                {skill.nome}
              </span>

              {/* A frase inteira acompanha a skill mais recente — é a que o
                  apresentador acabou de justificar. As anteriores ficam como
                  lista de nomes, que é o que precisa sobrar na tela final. */}
              {indice === ultimo ? (
                <span
                  style={{
                    display: 'block',
                    marginTop: espaco.xs,
                    fontSize: tipografia.tamanhos.apoio,
                    lineHeight: tipografia.alturaLinha.corpo,
                    color: cores.textoApoio,
                  }}
                >
                  {skill.texto}
                </span>
              ) : null}
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

export default PainelDeSkills;
