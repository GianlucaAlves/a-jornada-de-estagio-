/**
 * Caixa de diálogo — menor, no alto, e com retrato de ROSTO (ADR-012, ADR-015).
 *
 * O QUE ESTAVA ERRADO, medido. A caixa ocupava 1376x340 px (22,6% do canvas,
 * opaca, x 64..1440 e y 510..850) e interceptava 22 dos 24 hotspots do jogo,
 * sete deles inteiros. E cobria justamente quem estava falando: Bianca 80%,
 * Rafael 75%, Cláudia 73%. O retrato de corpo inteiro (220x260) era o que mais
 * custava altura.
 *
 * A CAUSA, e por isso a correção não é "encolher um pouco". NPC é ancorado
 * pelos PÉS no piso e tem 336px de altura, então a faixa vertical do corpo dele
 * vai de ~485 até ~820 em quase toda cena. Qualquer caixa horizontal larga
 * colocada embaixo cai dentro dessa faixa — encolher a altura só reduz quanto
 * dele se cobre, não deixa de cobrir. A caixa sobe para o alto da tela, que é a
 * única faixa larga o bastante para texto e livre da faixa das pessoas. É
 * também onde as referências de point-and-click põem a fala.
 *
 * A caixa é FIXA. Balão junto do personagem foi descartado por motivo de
 * apresentação ao vivo: posição variável faz o apresentador não saber onde o
 * texto vai nascer, e a plateia procurar.
 *
 * A caixa inteira continua sendo o botão de avanço: o alvo é a região toda,
 * impossível de errar com o mouse durante a apresentação. Um nó por clique,
 * nunca por timer — o apresentador fala por cima e controla o ritmo.
 *
 * CARGO ACOMPANHA O NOME, sempre (ADR-015), e vem do registro de perfis em
 * `NPCS`, não de texto escrito à mão aqui. A versão anterior deste arquivo
 * mantinha uma tabela própria de nomes; duas fontes de verdade para a mesma
 * coisa é como o cargo desapareceria de um lugar sem ninguém notar.
 */
import { DIALOGOS, NPCS } from '../domain/content';
import { NOME_PROTAGONISTA } from '../domain/types';
import type {
  Dialogo as DialogoDef,
  DialogoAtivo,
  Locutor,
  NoDialogo,
  NpcId,
  SpriteId,
} from '../domain/types';
import { assetDoRetrato } from '../assets/manifest';
import { useJogo } from '../store/jogo';
import { POSICOES_DOS_DIALOGOS, chaveDaPresenca } from '../domain/content/presencas';
import {
  borda,
  caixaDeDialogo,
  camada,
  cores,
  espaco,
  raio,
  sombra,
  tipografia,
} from '../styles/tokens';
import { Imagem } from './Imagem';

const NPC_IDS: readonly NpcId[] = ['rafael', 'claudia', 'tiago', 'bianca', 'marcos'];

export function ehNpc(locutor: Locutor): locutor is NpcId {
  return (NPC_IDS as readonly string[]).includes(locutor);
}

export interface IdentidadeDeLocutor {
  nome: string;
  /** Vazio só para a própria Ana e para o sistema: eles não têm cargo a exibir. */
  cargo: string;
}

/**
 * Quem está falando, em nome e cargo.
 *
 * `narrador` devolve `null` porque narração não tem dono na tela — inventar um
 * nome para ela faria a plateia procurar quem falou.
 */
export function identidadeDoLocutor(locutor: Locutor): IdentidadeDeLocutor | null {
  if (locutor === 'narrador') return null;
  if (locutor === 'sistema') return { nome: 'Sistema', cargo: '' };
  if (locutor === 'ana' || locutor === 'ana-futura') {
    return { nome: NOME_PROTAGONISTA, cargo: '' };
  }
  const perfil = NPCS[locutor];
  return { nome: perfil.nome, cargo: perfil.cargo };
}

/**
 * A linha de nome, com cargo junto (ADR-015). Uma função, e não interpolação
 * espalhada, porque o cargo tem de aparecer em TODA ocorrência do nome e a
 * cena também usa esta composição na linha de foco do rodapé.
 */
export function linhaDeNome(identidade: IdentidadeDeLocutor): string {
  return identidade.cargo === ''
    ? identidade.nome
    : `${identidade.nome} · ${identidade.cargo}`;
}

export interface FalaNaTela {
  no: NoDialogo;
  identidade: IdentidadeDeLocutor | null;
  /** Id de asset do retrato de rosto, ou null quando o locutor não tem rosto. */
  retratoId: string | null;
  /** Quantos nós o diálogo tem. Usado pelo teste de releitura. */
  total: number;
}

/**
 * Resolve o que vai na tela a partir do estado.
 *
 * Função pura e exportada porque é ela que o teste consegue exercitar: fora do
 * navegador o zustand serve o estado INICIAL ao renderizar, então nenhum teste
 * de markup chega a um diálogo aberto. Sem isto, a releitura de diálogo e a
 * presença do cargo não teriam como ser provadas.
 */
export function falaNaTela(
  ativo: DialogoAtivo | null,
  spriteDaAna: SpriteId,
): FalaNaTela | null {
  if (ativo === null) return null;
  const definicao: DialogoDef | undefined = DIALOGOS[ativo.dialogoId];
  if (definicao === undefined) return null;
  const no: NoDialogo | undefined = definicao.nos[ativo.indice];
  if (no === undefined) return null;
  return {
    no,
    identidade: identidadeDoLocutor(no.quem),
    retratoId: assetDoRetrato(no.quem, spriteDaAna),
    total: definicao.nos.length,
  };
}

// ------------------------------------------------------- geometria e capacidade

/** O retângulo que a caixa ocupa no canvas, em px. Medido pelo teste. */
export const RETANGULO_DA_CAIXA = {
  esquerda: caixaDeDialogo.esquerda,
  direita: caixaDeDialogo.esquerda + caixaDeDialogo.largura,
  topo: caixaDeDialogo.topo,
  base: caixaDeDialogo.topo + caixaDeDialogo.altura,
} as const;

/**
 * A caixa ANTIGA, guardada como número e não como lembrança.
 *
 * Fica aqui para que a comparação seja aritmética e verificável: o critério de
 * aceite pede a nova área em px e em % do canvas, e uma redução declarada só
 * vale contra o valor de onde se partiu.
 */
export const RETANGULO_ANTIGO = {
  esquerda: 64,
  direita: 1440,
  topo: 510,
  base: 850,
} as const;

/** Largura da coluna de texto: a caixa menos bordas, respiro e retrato. */
const LARGURA_DA_COLUNA_DE_TEXTO =
  caixaDeDialogo.largura -
  2 * borda.grossa -
  2 * espaco.md -
  caixaDeDialogo.retrato.largura -
  espaco.md;

/**
 * Largura média de glifo assumida para o corpo de 28px, em px.
 *
 * 0,55em é DELIBERADAMENTE largo para português em caixa mista (a média real
 * fica perto de 0,50em na pilha de fontes de sistema). Errar para o lado largo
 * faz o teste de capacidade reprovar ANTES de o texto vazar na tela; errar para
 * o estreito o faria aprovar um nó que a plateia veria cortado.
 */
const LARGURA_MEDIA_DE_GLIFO = Math.round(tipografia.tamanhos.corpo * 0.55);

const CARACTERES_POR_LINHA = Math.floor(
  LARGURA_DA_COLUNA_DE_TEXTO / LARGURA_MEDIA_DE_GLIFO,
);

export const CAPACIDADE_DE_TEXTO = {
  larguraDaColuna: LARGURA_DA_COLUNA_DE_TEXTO,
  larguraMediaDeGlifo: LARGURA_MEDIA_DE_GLIFO,
  linhas: caixaDeDialogo.linhasDeTexto,
  caracteresPorLinha: CARACTERES_POR_LINHA,
  caracteresMaximos: CARACTERES_POR_LINHA * caixaDeDialogo.linhasDeTexto,
} as const;

/**
 * Este nó cabe na caixa?
 *
 * A caixa não cresce: o remédio para um nó longo é PARTIR em dois nós, que é a
 * unidade do diálogo (um clique, um nó), e não devolver altura à caixa que
 * acabou de sair da frente de quem fala.
 */
export function cabeNaCaixa(texto: string): boolean {
  return texto.length <= CAPACIDADE_DE_TEXTO.caracteresMaximos;
}

// ------------------------------------------------------------------ componente

export function Dialogo(): JSX.Element | null {
  const presencas = useJogo(s => s.presencasNpcs);
  const tela = useJogo(s => s.tela);
  const bloco = useJogo(s => s.bloco);
  const dialogoAtivo = useJogo((s) => s.dialogoAtivo);
  const sprite = useJogo((s) => s.sprite);
  const avancarDialogo = useJogo((s) => s.avancarDialogo);

  const fala = falaNaTela(dialogoAtivo, sprite);
  if (fala === null) return null;
  // A fala espera quem estava fora atravessar a borda. O retrato sozinho não
  // substitui a presença do locutor na cena compartilhada com a plateia.
  if (tela.tipo === 'cena') {
    if ((POSICOES_DOS_DIALOGOS[dialogoAtivo!.dialogoId] ?? []).some(m => presencas[m.chave]?.movimento)) return null;
    if (ehNpc(fala.no.quem) && !presencas[chaveDaPresenca(bloco, tela.lugarId, fala.no.quem)]?.visivel) return null;
  }

  const nome = fala.identidade === null ? '' : linhaDeNome(fala.identidade);

  return (
    <button
      type="button"
      className="jogo-aparecer"
      aria-label={`Avançar diálogo. ${nome.length > 0 ? `${nome}: ` : ''}${fala.no.texto}`}
      onClick={avancarDialogo}
      style={{
        position: 'absolute',
        left: caixaDeDialogo.esquerda,
        top: caixaDeDialogo.topo,
        width: caixaDeDialogo.largura,
        height: caixaDeDialogo.altura,
        zIndex: camada.dialogo,
        display: 'flex',
        gap: espaco.md,
        alignItems: 'flex-start',
        background: cores.caixa,
        border: `${borda.grossa}px solid ${cores.contorno}`,
        borderRadius: raio.lg,
        boxShadow: sombra.caixa,
        padding: espaco.md,
        textAlign: 'left',
        color: cores.texto,
        cursor: 'pointer',
        /**
         * Clipar não é a defesa contra texto longo — o teste de capacidade é.
         * Isto existe só para que, se um nó escapar, ele fique cortado dentro
         * da moldura em vez de vazar por cima do cenário, que na projeção lê
         * como travamento.
         */
        overflow: 'hidden',
      }}
    >
      {fala.retratoId === null ? null : (
        <Imagem
          id={fala.retratoId}
          rotulo={nome}
          largura={caixaDeDialogo.retrato.largura}
          altura={caixaDeDialogo.retrato.altura}
          mostrarRotulo={false}
          decorativo
          style={{ flex: '0 0 auto', borderRadius: raio.md }}
        />
      )}

      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          // `minWidth: 0` em coluna de flex é o que permite o texto quebrar em
          // vez de esticar a caixa por dentro.
          minWidth: 0,
          alignSelf: 'stretch',
        }}
      >
        {/*
          A linha de nome existe SEMPRE, mesmo vazia (narração não tem dono): é
          ela que carrega o cue de avanço, e uma caixa sem cue nenhum numa fala
          de narrador deixaria o apresentador sem saber se aquela tela avança por
          clique ou espera algo.
        */}
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: espaco.sm,
            marginBottom: espaco.sm,
            fontSize: tipografia.tamanhos.corpo,
            fontWeight: tipografia.pesos.maximo,
            lineHeight: tipografia.alturaLinha.compacta,
            letterSpacing: tipografia.espacamento.largo,
            color: cores.destaque,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {nome}
          </span>

          {/*
            O CUE DE AVANÇO É UM GLIFO, não a frase "Clique para continuar".
            Dois motivos, e os dois são medidos: a frase ocupava uma LINHA
            inteira da caixa, e a caixa já está na altura mínima que o retrato
            de rosto permite — a linha sairia da altura do texto, deixando duas
            linhas para a fala em vez de três. E a frase na mesma linha do nome
            não cabe: "Marcos · Eventos internos, outra área" mais a frase passa
            da largura da coluna, e encurtar o nome comeria o cargo, que é
            obrigatório (ADR-015).
            A afordância não se perdeu: a caixa INTEIRA é o botão, o cursor é de
            mão, e o `aria-label` diz "Avançar diálogo".
          */}
          <span
            className="jogo-pulso"
            aria-hidden
            style={{ flex: '0 0 auto', color: cores.textoApoio }}
          >
            ▶
          </span>
        </span>

        <span
          style={{
            display: 'block',
            flex: '1 1 auto',
            fontSize: tipografia.tamanhos.corpo,
            lineHeight: tipografia.alturaLinha.corpo,
            fontWeight: tipografia.pesos.normal,
            color: cores.texto,
          }}
        >
          {fala.no.texto}
        </span>
      </span>
    </button>
  );
}

export default Dialogo;
