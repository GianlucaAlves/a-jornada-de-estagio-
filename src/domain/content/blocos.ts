/**
 * Blocos e cartões de transição.
 *
 * Cada bloco declara o estado que assume ter recebido do anterior. É isso que
 * torna cada fase construível, testável e ENSAIÁVEL isoladamente — é o que
 * permite ensaiar a fase 4 sem jogar as três anteriores, e é a garantia de que
 * a fase 6 tem o que revelar. Mantenha essa propriedade: um item a menos numa
 * destas tabelas é um ensaio do clímax que mente.
 *
 * SEIS FASES (ADR-024). As cinco primeiras são jogáveis; a sexta é o fim. O
 * clímax migrou da 5 para a 6, e a 5 passou a ser uma fase nova: competências,
 * faculdade e a pergunta "é esse o caminho?" (ADR-028).
 *
 * CADA FASE ABRE E FECHA NO MESMO LUGAR (ADR-021, ADR-025). Dentro dela há
 * leva-e-traz, e o item buscado fora tem de ser USADO no lugar de origem, senão
 * a fase não fecha onde abriu.
 *
 * Os `estadoAssumido` abaixo acompanham os ESQUELETOS de cena que vivem em
 * bloco1.ts..bloco6.ts. Quando as frentes de conteúdo escreverem as cenas de
 * verdade, estas tabelas mudam JUNTO — a suíte da store afirma os dois lados de
 * cada fronteira justamente para que a divergência apareça aqui e não no palco.
 */
import type { Bloco, BlocoId, CartaoTransicao } from '../types';

export const BLOCOS: Record<BlocoId, Bloco> = {
  1: {
    id: 1,
    titulo: 'O primeiro dia',
    // Começo do zero: só o Escritório, nada na barra, painel vazio.
    estadoAssumido: {
      itens: [],
      skills: [],
      lugaresDestravados: ['escritorio'],
      lugaresConcluidos: [],
    },
    fechoTexto:
      'Ela precisou falar com três pessoas pra digitar oito caracteres.\n' +
      'Nenhuma delas deu a resposta inteira.',
  },

  2: {
    id: 2,
    titulo: 'O que ninguém ensinou',
    // Da fase 1: o Cartão do Rafael e duas skills. O laço é Cafezinho →
    // Escritório → Cafezinho (ADR-032): conselho se recebe no café, trabalho se
    // faz na mesa. Por isso os DOIS entram destravados — a ida é parte da fase.
    estadoAssumido: {
      itens: ['cartao-rafael'],
      skills: ['coragem-perguntar', 'autoconhecimento'],
      lugaresDestravados: ['escritorio', 'cafezinho'],
      lugaresConcluidos: [],
    },
    fechoTexto:
      'Ela entrou no café sem saber o que estudar.\n' +
      'Saiu com quatro trilhas, um certificado que não serve pra nada hoje, e um caderno.',
  },

  3: {
    id: 3,
    titulo: 'Sem ninguém pedir',
    // Da fase 2: as Anotações (que são consumidas aqui) e o Certificado.
    // O laço é Linha de Produção → Escritório (ADR-021, ADR-025), e por isso os
    // DOIS entram destravados: a ida é parte da fase. A Linha vem primeiro
    // porque é a origem — é lá que ela vê a etapa que ninguém pediu para olhar.
    // O Cafezinho entra concluído: a fase 3 não tem cena lá, e concluído impede
    // reabrir o puzzle da fase anterior num clique acidental.
    estadoAssumido: {
      itens: ['anotacoes-treinamento', 'cartao-rafael', 'certificado-degree'],
      skills: [
        'coragem-perguntar',
        'autoconhecimento',
        'leitura-mercado',
        'aprendizado-continuo',
        'competencia-tecnica',
      ],
      lugaresDestravados: ['linha-producao', 'escritorio'],
      lugaresConcluidos: ['cafezinho'],
    },
    fechoTexto:
      'Ninguém pediu pra ela olhar aquela etapa.\n' +
      'Ela saiu de lá com um relatório e com o nome dela dentro dele.',
  },

  4: {
    id: 4,
    titulo: 'Mostrar o que fez',
    // Da fase 3: nada novo na barra além dos dois tardios — as Anotações e o
    // Relatório foram consumidos no caminho e não voltam.
    // O Escritório e a Linha de Produção entram concluídos pelo mesmo motivo do
    // Cafezinho na fase 3. A Linha precisa constar: sem ela o mapa esquece o
    // nome de um lugar em que a plateia acabou de ver a Ana trabalhar, e a
    // quarta conexão do clímax é traçada justamente por ele (conexoes.ts).
    estadoAssumido: {
      itens: ['cartao-rafael', 'certificado-degree'],
      skills: [
        'coragem-perguntar',
        'autoconhecimento',
        'leitura-mercado',
        'aprendizado-continuo',
        'competencia-tecnica',
        'proatividade',
        'protagonismo',
      ],
      lugaresDestravados: ['sala-reunioes'],
      lugaresConcluidos: ['escritorio', 'cafezinho', 'linha-producao'],
    },
    fechoTexto:
      'O trabalho era o mesmo antes e depois da página que ela escreveu.\n' +
      'O que mudou foi quanta gente sabia que ele existia.',
  },

  5: {
    id: 5,
    titulo: 'É esse o caminho?',
    // Os três tardios estão na barra e é assim que ficam: "sem uso aparente" é o
    // desenho deles, não um esquecimento (ADR-017).
    // Oito skills; a nona é a desta fase. O painel deixa de ser painel e passa a
    // ser a mecânica: é percorrendo as skills que ela revisa o estágio.
    // O lugar é OUTRA ÁREA e só ele (ADR-031): o Escritório era andaime e saiu,
    // então entra concluído junto dos outros três. A fase não fecha em lugar
    // recorrente de propósito — ela se deslocou para ter aquela conversa.
    estadoAssumido: {
      itens: ['cartao-rafael', 'certificado-degree', 'cracha-innovation'],
      skills: [
        'coragem-perguntar',
        'autoconhecimento',
        'leitura-mercado',
        'aprendizado-continuo',
        'competencia-tecnica',
        'proatividade',
        'protagonismo',
        'visibilidade',
      ],
      lugaresDestravados: ['outra-area'],
      lugaresConcluidos: ['escritorio', 'cafezinho', 'linha-producao', 'sala-reunioes'],
    },
    // A fase 5 NUNCA afirma o desfecho (ADR-028): ela não sabe, e por não saber
    // poderia ser que não fosse. O fecho é orgulho com incerteza, não consolo.
    fechoTexto: 'Ela não sabe se fica.\nSabe o que leva se não ficar.',
  },

  6: {
    id: 6,
    titulo: 'O que ela se tornou',
    // As nove skills no painel e os três tardios na barra: é exatamente o que a
    // revelação consome, uma conexão por clique. A festa acontece no Cafezinho,
    // que volta a estar aberto — o mesmo lugar transformado é o argumento visual
    // de que ele mudou porque ela mudou (ADR-029).
    // Os outros QUATRO entram concluídos, e os cinco slots do mapa têm de estar
    // nomeados aqui: as quatro conexões são traçadas sobre eles, e linha que
    // chega num slot silhuetado e sem nome não lê como razão (ADR-030).
    estadoAssumido: {
      itens: ['cartao-rafael', 'certificado-degree', 'cracha-innovation'],
      skills: [
        'coragem-perguntar',
        'autoconhecimento',
        'leitura-mercado',
        'aprendizado-continuo',
        'competencia-tecnica',
        'proatividade',
        'protagonismo',
        'visibilidade',
        'plano-futuro',
      ],
      lugaresDestravados: ['cafezinho'],
      lugaresConcluidos: ['escritorio', 'linha-producao', 'sala-reunioes', 'outra-area'],
    },
    fechoTexto: 'Tudo o que ela carregou, ela usou.\nTudo o que ela aprendeu, ela é.',
  },
};

/**
 * Seis cartões, um por fase.
 *
 * A fase 1 passou a ter cartão porque o cartão é o ÚNICO lugar em que o jogo
 * conhece os apresentadores (ADR-001, e o glossário). Sem cartão na fase 1, o
 * Pedro nunca aparece, e a passagem de bastão da primeira fase teria de ser
 * combinada fora do produto.
 *
 * A fase 6 é a única sem apresentador: ela é o fim, conduzido por quem estiver
 * no palco. Inventar um sexto nome criaria uma pessoa que a apresentação não tem.
 *
 * O cartão também cobre a troca de sprite — a mudança de postura dela acontece
 * escondida atrás dele, nunca à vista.
 */
export const CARTOES: readonly CartaoTransicao[] = [
  {
    bloco: 1,
    tempo: 'Primeiro dia',
    titulo: 'O primeiro dia',
    sprite: 'ana-encolhida',
    apresentador: 'Pedro',
  },
  {
    bloco: 2,
    tempo: '1 mês depois',
    titulo: 'O que ninguém ensinou',
    sprite: 'ana-neutra',
    apresentador: 'Heloisa',
  },
  {
    bloco: 3,
    tempo: '6 meses depois',
    titulo: 'Sem ninguém pedir',
    sprite: 'ana-neutra',
    apresentador: 'João',
  },
  {
    bloco: 4,
    tempo: '1 ano depois',
    titulo: 'Mostrar o que fez',
    sprite: 'ana-confiante',
    apresentador: 'Gianluca',
  },
  {
    bloco: 5,
    tempo: '2 anos depois',
    titulo: 'É esse o caminho?',
    sprite: 'ana-confiante',
    apresentador: 'Marianna',
  },
  {
    // Sem apresentador, de propósito. Ver o comentário acima.
    bloco: 6,
    tempo: '3 semanas depois',
    titulo: 'O que ela se tornou',
    sprite: 'ana-confiante',
  },
];
