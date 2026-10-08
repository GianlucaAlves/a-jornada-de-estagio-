/**
 * As cinco conexões do clímax, na ordem em que o apresentador as dispara —
 * uma por clique, nunca por timer.
 *
 * As três primeiras saem de itens tardios e são PORTAS: indicação social,
 * competência, visibilidade. Elas se apagam da barra ao conectar.
 * A quarta vem do plano que Ana escolheu. A quinta sai do relatório e é a
 * EVIDÊNCIA persistente do protagonismo.
 *
 * O relatório permanece no mapa como evidência concreta da iniciativa de Ana.
 *
 * As conexões são traçadas ENQUANTO o personagem fala, na fase 6: cada uma é uma
 * razão, dita e desenhada ao mesmo tempo (ADR-030). Depois corta para a festa.
 *
 * `viaLugar` aponta para o lugar onde aquilo aconteceu, e os cinco são
 * distintos: cinco linhas saindo do centro para o mesmo slot não leem como
 * cinco razões.
 *
 * Parâmetros contra a compressão do Teams: linha grossa de alto contraste,
 * traçado lento.
 */
import type { Conexao } from '../types';

export const CONEXOES: readonly Conexao[] = [
  {
    // Escritório: é onde ela conheceu o Rafael, no primeiro dia, porque precisou
    // de um pedaço da senha que só ele tinha.
    origem: { tipo: 'item', itemId: 'cartao-rafael' },
    viaLugar: 'escritorio',
    texto: 'Perguntaram ao Rafael se ele conhecia alguém. Ele disse seu nome.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    // Cafezinho: a fase 2 nasce e morre lá, e é de lá que sai o certificado.
    //
    // TROCA DE EIXO (ADR-023). Era "A vaga pede Arquitetura de Sistemas. Ela
    // concluiu há um ano e sete meses" — a força vinha da especificidade, e
    // apenas apagar o nome do curso teria destruído isso. Então o eixo mudou: de
    // O QUE ela estudou para QUANTO, e POR CONTA DE QUEM. É universal, é crível
    // como exigência de vaga, argumenta melhor — a tese não é que ela sabia uma
    // matéria, é que ela investiu em si mesma — e passa a rimar com a quarta.
    origem: { tipo: 'item', itemId: 'certificado-degree' },
    viaLugar: 'cafezinho',
    texto:
      'A vaga pedia alguém disposto a aprender o que ainda não sabia.\n' +
      'Ela tinha quarenta horas que ninguém mandou fazer.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    // Sala de Reuniões: é onde a Innovation Week acontece (ADR-026). O crachá
    // deixou de vir de um lugar chamado "Innovation" porque esse lugar nunca
    // existiu — é o nome do evento.
    origem: { tipo: 'item', itemId: 'cracha-innovation' },
    viaLugar: 'sala-reunioes',
    texto: 'Na conversa de ontem, duas pessoas da Innovation Week lembravam dela.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    // Engenharia: o plano registra a direção de carreira e o próximo passo concreto.
    origem: { tipo: 'item', itemId: 'plano-carreira' },
    viaLugar: 'outra-area',
    texto: 'Ela escolheu explorar desenvolvimento de software e já sabe como começar.',
    consomeOrigem: true,
    espessura: 7,
    duracaoMs: 800,
  },
  {
    // O relatório permanece como prova concreta da iniciativa e do protagonismo.
    origem: { tipo: 'item', itemId: 'relatorio' },
    viaLugar: 'linha-producao',
    texto: 'Ela identificou o problema e tomou a iniciativa de propor uma solução.',
    consomeOrigem: false,
    espessura: 10,
    duracaoMs: 1200,
  },
];
