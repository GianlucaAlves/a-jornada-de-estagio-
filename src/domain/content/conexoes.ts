/**
 * As quatro conexões do clímax, na ordem em que o apresentador as dispara —
 * uma por clique, nunca por timer.
 *
 * As três primeiras saem de itens tardios e são PORTAS: indicação social,
 * competência, visibilidade. Elas se apagam da barra ao conectar.
 * A quarta sai do painel de skills e é o MOTIVO. Ela permanece acesa — é a tese.
 *
 * A quarta NÃO pode ser um item. Promover um item a quarta porta parecia
 * elegante e destruiria o argumento: a mensagem passaria a ser "o que importa é
 * o que você entrega", quando o projeto inteiro argumenta que é o que você se
 * tornou (ADR-017). É por isso que ela é a única que não se consome, e é ela que
 * sobra na tela quando a barra de itens sai.
 *
 * As conexões são traçadas ENQUANTO o personagem fala, na fase 6: cada uma é uma
 * razão, dita e desenhada ao mesmo tempo (ADR-030). Depois corta para a festa.
 *
 * `viaLugar` aponta para o lugar onde aquilo aconteceu, e os quatro são
 * distintos: quatro linhas saindo do centro para o mesmo slot não leem como
 * quatro razões.
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
    // Linha de Produção: é lá que ela agiu sem ninguém pedir. A quarta conexão
    // tinha de sair do lugar do protagonismo, senão a skill se acende sobre um
    // lugar onde ela não fez nada.
    origem: { tipo: 'skill', skillId: 'proatividade' },
    viaLugar: 'linha-producao',
    texto:
      'Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu.\n' +
      '"Guardei seu nome."',
    // A skill NÃO se apaga. É o que sobra na tela quando a barra sai.
    consomeOrigem: false,
    espessura: 10,
    duracaoMs: 1200,
  },
];
