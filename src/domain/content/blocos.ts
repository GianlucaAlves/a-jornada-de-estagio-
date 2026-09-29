/**
 * Blocos e cartões de transição.
 *
 * Cada bloco declara o estado que assume ter recebido do anterior. É isso que
 * torna cada bloco construível, testável e ensaiável isoladamente — e é a
 * garantia de que o Bloco 5 tem o que revelar.
 *
 * Fonte de verdade: as tabelas de checklist no fim de docs/roteiro/0N-bloco-N.md.
 *
 * DIVERGÊNCIA CONHECIDA: docs/roteiro/05-bloco-5.md afirma em prosa que "os
 * cinco imediatos foram usados". Isso é falso no conteúdo executável — só
 * 'anotacoes-treinamento' e 'relatorio' têm efeito `consumirItem`. Os demais
 * imediatos permanecem na barra até `esvaziarBarra`, que é o que o próprio
 * roteiro pede ("Nada foi escondido", Cena B). A prosa do roteiro precisa ser
 * corrigida; a tabela de checklist dele já está certa.
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
      'Ela precisou falar com três pessoas pra digitar onze caracteres.\n' +
      'Nenhuma delas deu a resposta inteira.',
  },

  2: {
    id: 2,
    titulo: 'A realidade do mercado',
    // Do Bloco 1: Senha, Cartão do Rafael, duas skills, Cafezinho destravado.
    // O Escritório entra concluído — o Bloco 2 não tem cena lá, e concluído
    // impede repetir o puzzle da senha num clique acidental.
    estadoAssumido: {
      itens: ['senha', 'cartao-rafael'],
      skills: ['coragem-perguntar', 'autoconhecimento'],
      lugaresDestravados: ['cafezinho'],
      lugaresConcluidos: ['escritorio'],
    },
    fechoTexto:
      'Ela entrou no café sem saber o que estudar.\n' +
      'Saiu com três trilhas, um certificado que não serve pra nada hoje, e um caderno de anotações.',
  },

  3: {
    id: 3,
    titulo: 'Proatividade',
    // Do Bloco 2: Indicação de trilha, Certificado do Degree, Anotações do
    // treinamento, três skills, Laboratório destravado. O Escritório volta a
    // estar aberto: é nele que o Relatório é entregue à Cláudia.
    estadoAssumido: {
      itens: [
        'senha',
        'indicacao-trilha',
        'anotacoes-treinamento',
        'cartao-rafael',
        'certificado-degree',
      ],
      skills: [
        'coragem-perguntar',
        'autoconhecimento',
        'leitura-mercado',
        'aprendizado-continuo',
        'competencia-tecnica',
      ],
      lugaresDestravados: ['escritorio', 'laboratorio'],
      lugaresConcluidos: ['cafezinho', 'sala-treinamento'],
    },
    fechoTexto:
      'Ela entrou no Laboratório pra não olhar um erro.\n' +
      'Saiu com um relatório, uma proposta registrada, e um crachá de cordão torto.',
  },

  4: {
    id: 4,
    titulo: 'Mostrar o que fez',
    // Do Bloco 3: Crachá do Innovation e duas skills. As Anotações foram
    // consumidas no monitor e o Relatório na Cláudia — não voltam. Os outros
    // três imediatos ('senha', 'indicacao-trilha') seguem na barra, sem uso:
    // nenhum efeito do jogo os consome, e o 'projeto-entregue' nasce aqui.
    // O Escritório entra concluído pelo mesmo motivo do Bloco 2 — o Bloco 4 não
    // tem cena lá, e concluído impede reabrir a cena do B3 num clique acidental.
    estadoAssumido: {
      itens: [
        'senha',
        'indicacao-trilha',
        'cartao-rafael',
        'certificado-degree',
        'cracha-innovation',
      ],
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
      lugaresConcluidos: [
        'escritorio',
        'cafezinho',
        'sala-treinamento',
        'laboratorio',
        'innovation',
      ],
    },
    fechoTexto:
      'O trabalho era o mesmo antes e depois do parágrafo que ela escreveu.\n' +
      'O que mudou foi quanta gente sabia que ele existia.',
  },

  5: {
    id: 5,
    titulo: 'A chance aparece',
    // Seis itens na barra, não três. Só DOIS dos cinco imediatos foram gastos no
    // caminho: 'anotacoes-treinamento' no monitor do Laboratório (B3) e
    // 'relatorio' na Cláudia (B3). 'senha', 'indicacao-trilha' e
    // 'projeto-entregue' não são consumidos por efeito nenhum do jogo — eles
    // chegam aqui presentes e só se apagam no fim, pela ação `esvaziarBarra`.
    // Os três tardios são os que a revelação consome, um por conexão.
    // As nove skills estão no painel — é o que permanece.
    // O Escritório está aberto de novo: a mensagem chega na mesma mesa do B1.
    estadoAssumido: {
      itens: [
        'senha',
        'indicacao-trilha',
        'projeto-entregue',
        'cartao-rafael',
        'certificado-degree',
        'cracha-innovation',
      ],
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
      lugaresDestravados: ['escritorio'],
      lugaresConcluidos: [
        'cafezinho',
        'sala-treinamento',
        'laboratorio',
        'innovation',
        'sala-reunioes',
      ],
    },
    fechoTexto: 'Tudo o que ela carregou, ela usou.\nTudo o que ela aprendeu, ela é.',
  },
};

/**
 * Quatro cartões: o Bloco 1 abre direto, sem cartão. Cada cartão marca
 * capítulo, cobre a troca de sprite e dá o respiro da passagem de bastão.
 */
export const CARTOES: readonly CartaoTransicao[] = [
  { bloco: 2, tempo: '1 mês depois', titulo: 'A realidade do mercado', sprite: 'ana-neutra' },
  { bloco: 3, tempo: '6 meses depois', titulo: 'Proatividade', sprite: 'ana-neutra' },
  { bloco: 4, tempo: '1 ano depois', titulo: 'Mostrar o que fez', sprite: 'ana-confiante' },
  { bloco: 5, tempo: '2 anos depois', titulo: 'A chance aparece', sprite: 'ana-confiante' },
];
