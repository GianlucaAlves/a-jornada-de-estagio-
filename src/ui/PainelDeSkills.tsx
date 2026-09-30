/**
 * Painel de skills — "O que eu aprendi", em ACORDEÃO (ADR-020).
 *
 * O que havia antes era meio caminho: a skill mais recente mostrava a frase
 * inteira e todas as anteriores só o nome, sem jeito de reabrir nenhuma. Quem
 * perdeu a frase, perdeu.
 *
 * Agora cada entrada é clicável para abrir e fechar, a recém-conquistada abre
 * sozinha e fecha a anterior, e NÃO EXISTE CONTADOR. Contador ("4 de 9") revela
 * o tamanho do caminho, e a plateia passa a contar quantas faltam em vez de
 * acompanhar — o clímax depende de a acumulação parecer conquistada, não
 * preenchida.
 *
 * ISTO É MAIS IMPORTANTE DO QUE PARECE. Na fase 5 este painel deixa de ser
 * painel e passa a ser a MECÂNICA da fase: a pessoa percorre as nove skills uma
 * por uma. Por isso o orçamento vertical aqui é orçamento de verdade, e não
 * folga — ver `GEOMETRIA_DO_PAINEL` e o teste que prova que as nove cabem com
 * uma aberta.
 *
 * O peso visual continua deliberadamente diferente da barra de itens: sem
 * ícone, sem moldura, nada que pareça objeto equipável. Os itens se gastam, o
 * painel permanece, e essa diferença é a tese. O que mudou é que agora ele
 * responde ao clique — e skill continua não sendo consumível.
 */
import { useEffect, useState } from 'react';
import { SKILLS } from '../domain/content';
import type { Skill, SkillId } from '../domain/types';
import { useJogo } from '../store/jogo';
import {
  CANVAS,
  alvo,
  borda,
  camada,
  cores,
  duracao,
  easing,
  espaco,
  overlay,
  raio,
  tipografia,
} from '../styles/tokens';

// ------------------------------------------------------------------- geometria

/**
 * Geometria do painel, em px de canvas.
 *
 * Exportada porque TRÊS lados precisam concordar sobre ela: este painel, a tela
 * de revelação (que desenha o próprio painel e de onde sai a quarta linha do
 * clímax — se as duas geometrias divergirem, o painel salta de lugar na troca
 * de tela) e o teste que prova que as nove skills cabem.
 *
 * Nenhum número aqui é literal: tudo sai de `tokens.ts`.
 */
export const GEOMETRIA_DO_PAINEL = {
  esquerda: CANVAS.largura - overlay.painelDeSkills,
  topo: overlay.painelTopo,
  largura: overlay.painelDeSkills,
  /** Até a barra de itens, com um respiro para a linha de nome do hotspot. */
  altura: CANVAS.altura - overlay.barraDeItens - espaco.md - overlay.painelTopo,
  padding: { vertical: espaco.sm, horizontal: espaco.md },
  /** Vão entre entradas. Pequeno de propósito: é ele ou a nona skill. */
  vao: espaco.xs,
  cabecalho: {
    fonte: tipografia.tamanhos.apoio,
    altura: Math.ceil(tipografia.tamanhos.apoio * tipografia.alturaLinha.compacta),
  },
  linha: {
    /** Piso de altura da entrada fechada. Ver a exceção em `alvo.linhaDeLista`. */
    alturaMinima: alvo.linhaDeLista,
    fonte: tipografia.tamanhos.apoio,
    padding: { vertical: espaco.xs, horizontal: espaco.sm },
  },
  texto: {
    fonte: tipografia.tamanhos.minimo,
  },
} as const;

/** Altura útil dentro do painel, descontado o respiro das bordas. */
export const ALTURA_UTIL_DO_PAINEL =
  GEOMETRIA_DO_PAINEL.altura - 2 * GEOMETRIA_DO_PAINEL.padding.vertical;

/** Largura útil de texto dentro de uma entrada. */
export const LARGURA_UTIL_DA_LINHA =
  GEOMETRIA_DO_PAINEL.largura -
  2 * GEOMETRIA_DO_PAINEL.padding.horizontal -
  2 * GEOMETRIA_DO_PAINEL.linha.padding.horizontal;

/**
 * Passo vertical de uma entrada FECHADA de nome curto.
 *
 * É o número que a revelação usa para ancorar a quarta linha do clímax. Nome
 * longo quebra em duas linhas e empurra as entradas abaixo dele — o passo não é
 * uniforme no painel real, e isso está declarado aqui de propósito para que
 * ninguém o use como se fosse.
 */
export const PASSO_DA_LINHA =
  GEOMETRIA_DO_PAINEL.linha.alturaMinima + GEOMETRIA_DO_PAINEL.vao;

/** Y da primeira entrada, em px de canvas. */
export const PRIMEIRA_LINHA_Y =
  GEOMETRIA_DO_PAINEL.topo +
  GEOMETRIA_DO_PAINEL.padding.vertical +
  GEOMETRIA_DO_PAINEL.cabecalho.altura +
  GEOMETRIA_DO_PAINEL.vao;

// -------------------------------------------------------------- comportamento

/**
 * Qual entrada fica aberta depois de um clique.
 *
 * Função pura e exportada porque é a regra inteira do acordeão, e um teste de
 * markup não alcança isto: fora do navegador o zustand serve o estado inicial,
 * então nenhuma sequência de cliques é observável no HTML renderizado.
 */
export function proximaAberta(atual: SkillId | null, clicada: SkillId): SkillId | null {
  return atual === clicada ? null : clicada;
}

/**
 * Qual entrada abre sozinha quando a lista cresce: a última conquistada.
 *
 * "Abre sozinha e fecha a anterior" é uma frase só porque só existe UMA aberta
 * — fechar a anterior não é um segundo passo, é consequência de haver um único
 * slot. Foi a decisão que evitou um painel com quatro parágrafos abertos na
 * fase 5, que não caberiam na altura e ainda esconderiam a lista.
 */
export function aberturaAoConquistar(skills: readonly SkillId[]): SkillId | null {
  return skills.length === 0 ? null : (skills[skills.length - 1] ?? null);
}

// ------------------------------------------------------------------ componente

export interface PropsPainelDeSkills {
  skills: readonly Skill[];
  aberta: SkillId | null;
  aoAlternar: (id: SkillId) => void;
}

/**
 * A parte que só desenha, separada da que lê a store.
 *
 * A separação não é gosto de arquitetura: é a única forma de PROVAR o acordeão.
 * O teste precisa renderizar as NOVE skills com uma aberta, e via store isso é
 * inalcançável fora do navegador. Aqui as nove entram por prop.
 */
export function PainelDeSkillsVisual({
  skills,
  aberta,
  aoAlternar,
}: PropsPainelDeSkills): JSX.Element | null {
  if (skills.length === 0) return null;

  return (
    <section
      aria-label="O que eu aprendi"
      style={{
        position: 'absolute',
        left: GEOMETRIA_DO_PAINEL.esquerda,
        top: GEOMETRIA_DO_PAINEL.topo,
        width: GEOMETRIA_DO_PAINEL.largura,
        height: GEOMETRIA_DO_PAINEL.altura,
        zIndex: camada.overlayPersistente,
        display: 'flex',
        flexDirection: 'column',
        gap: GEOMETRIA_DO_PAINEL.vao,
        padding: `${GEOMETRIA_DO_PAINEL.padding.vertical}px ${GEOMETRIA_DO_PAINEL.padding.horizontal}px`,
        // Véu plano só para garantir contraste sobre o cenário.
        // Sem borda e sem sombra: nada que pareça inventário.
        background: cores.veuLeve,
        overflow: 'hidden',
      }}
    >
      {/* SEM CONTADOR. O título diz o que é; quantas são não se anuncia. */}
      <h2
        style={{
          flex: '0 0 auto',
          height: GEOMETRIA_DO_PAINEL.cabecalho.altura,
          fontSize: GEOMETRIA_DO_PAINEL.cabecalho.fonte,
          fontWeight: tipografia.pesos.maximo,
          lineHeight: tipografia.alturaLinha.compacta,
          letterSpacing: tipografia.espacamento.largo,
          color: cores.destaque,
        }}
      >
        O que eu aprendi
      </h2>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: GEOMETRIA_DO_PAINEL.vao }}>
        {skills.map((skill) => {
          const abertaAgora = aberta === skill.id;
          return (
            <li key={skill.id}>
              <button
                type="button"
                className="jogo-botao-nu"
                aria-expanded={abertaAgora}
                aria-label={
                  abertaAgora
                    ? `${skill.nome}. Fechar. ${skill.texto}`
                    : `${skill.nome}. Abrir para ler.`
                }
                onClick={() => aoAlternar(skill.id)}
                style={{
                  width: '100%',
                  minHeight: GEOMETRIA_DO_PAINEL.linha.alturaMinima,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: GEOMETRIA_DO_PAINEL.vao,
                  padding: `${GEOMETRIA_DO_PAINEL.linha.padding.vertical}px ${GEOMETRIA_DO_PAINEL.linha.padding.horizontal}px`,
                  /**
                   * Aberta ganha fundo e uma borda ESQUERDA: a borda marca a
                   * entrada aberta sem desenhar uma moldura, que é o que faria
                   * a skill parecer objeto de inventário. A moldura é a
                   * linguagem da barra de itens de propósito.
                   */
                  background: abertaAgora ? cores.fundoElevado : 'transparent',
                  borderLeft: `${borda.media}px solid ${
                    abertaAgora ? cores.destaque : 'transparent'
                  }`,
                  borderRadius: raio.sm,
                  cursor: 'pointer',
                  transition: `background ${duracao.curta}ms ${easing.suave}`,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: GEOMETRIA_DO_PAINEL.linha.fonte,
                    fontWeight: tipografia.pesos.forte,
                    lineHeight: tipografia.alturaLinha.compacta,
                    color: abertaAgora ? cores.destaque : cores.texto,
                  }}
                >
                  {skill.nome}
                </span>

                {abertaAgora ? (
                  <span
                    style={{
                      display: 'block',
                      fontSize: GEOMETRIA_DO_PAINEL.texto.fonte,
                      lineHeight: tipografia.alturaLinha.corpo,
                      fontWeight: tipografia.pesos.normal,
                      color: cores.textoApoio,
                    }}
                  >
                    {skill.texto}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PainelDeSkills(): JSX.Element | null {
  /**
   * `s.skills` e não um seletor que mapeia: um seletor que devolve array novo
   * faz o zustand ver snapshot diferente a cada notificação da store, e o
   * painel re-renderizaria a cada clique em qualquer lugar do jogo. Aqui isso
   * deixou de ser só desperdício: o efeito abaixo depende do TAMANHO da lista.
   */
  const ids = useJogo((s) => s.skills);
  const [aberta, setAberta] = useState<SkillId | null>(null);

  /**
   * Skill nova abre sozinha e fecha a anterior.
   *
   * A dependência é a REFERÊNCIA da lista, e ela só troca quando a store
   * concede uma skill ou quando uma fase é montada — nunca em re-render. É por
   * isso que o seletor acima devolve `s.skills` cru: se devolvesse array novo a
   * cada leitura, este efeito rodaria em todo clique do jogo e reabriria a
   * última skill por cima da que a pessoa estava lendo. Na fase 5, onde o painel
   * É a mecânica, isso seria o defeito principal da fase.
   */
  useEffect(() => {
    setAberta(aberturaAoConquistar(ids));
  }, [ids]);

  const skills: Skill[] = ids.map((id) => SKILLS[id]);

  return (
    <PainelDeSkillsVisual
      skills={skills}
      aberta={aberta}
      aoAlternar={(id) => setAberta((atual) => proximaAberta(atual, id))}
    />
  );
}

export default PainelDeSkills;
