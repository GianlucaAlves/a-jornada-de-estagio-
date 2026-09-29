/**
 * Os cinco puzzles. Cada mecânica é metáfora do tema do seu bloco, todas
 * resolvíveis em menos de 40 segundos e legíveis sem tutorial.
 *
 * Fonte de verdade: docs/roteiro/01-bloco-1.md a 04-bloco-4.md.
 */
import type { PuzzleDef, PuzzleId } from '../types';

export const PUZZLES: Record<PuzzleId, PuzzleDef> = {
  // Bloco 1 — o puzzle é social, não lógico: nenhum NPC tem a senha inteira.
  // Tiago dá o prefixo, Cláudia o código do time, Rafael o dia de entrada.
  senha: {
    id: 'senha',
    tipo: 'senha',
    rotulo: 'Senha temporária de primeiro acesso',
    gabarito: ['ERI', 'DT7', '01'],
  },

  // Bloco 2 — quatro lacunas de competência ligadas a quatro trilhas.
  // Plantio: os pares 1 e 2 voltam no Laboratório do Bloco 3; o par 3 é
  // exatamente o que falta nela no Bloco 4. Não comentar durante o puzzle.
  associar: {
    id: 'associar',
    tipo: 'associar',
    esquerda: [
      { id: 'lacuna-integracao', texto: 'Entender como dois sistemas conversam entre si' },
      { id: 'lacuna-causa', texto: 'Achar a causa de um erro que se repete' },
      { id: 'lacuna-explicar', texto: 'Explicar o que eu fiz pra quem não é técnico' },
      {
        id: 'lacuna-codigo',
        texto: 'Trabalhar no mesmo código que o time sem quebrar nada',
      },
    ],
    direita: [
      {
        id: 'trilha-arquitetura',
        texto: 'Degree · Fundamentos de Arquitetura de Sistemas (40h)',
      },
      { id: 'trilha-observabilidade', texto: 'Percipio · Observabilidade e leitura de logs' },
      { id: 'trilha-comunicacao', texto: 'Percipio · Comunicação para times técnicos' },
      { id: 'trilha-git', texto: 'Degree · Git e versionamento colaborativo' },
    ],
    gabarito: {
      'lacuna-integracao': 'trilha-arquitetura',
      'lacuna-causa': 'trilha-observabilidade',
      'lacuna-explicar': 'trilha-comunicacao',
      'lacuna-codigo': 'trilha-git',
    },
  },

  // Bloco 3, Laboratório — cinco linhas de log em ordem cronológica. O sistema
  // não revela a causa: a ordem revela. `linhas` já está embaralhada.
  sequenciar: {
    id: 'sequenciar',
    tipo: 'sequenciar',
    linhas: [
      { id: 'log-retry', texto: '03:14 — Fila reenvia o lote (retry automático)' },
      { id: 'log-envio', texto: '03:12 — Serviço de Faturamento envia o lote' },
      {
        id: 'log-duplicado',
        texto: '03:15 — Serviço de Cadastro processa o lote duas vezes',
      },
      { id: 'log-aceite', texto: '03:12 — Fila de integração aceita o lote' },
      { id: 'log-timeout', texto: '03:14 — Timeout na resposta do Serviço de Cadastro' },
    ],
    ordemCorreta: ['log-envio', 'log-aceite', 'log-timeout', 'log-retry', 'log-duplicado'],
  },

  // Bloco 3, Innovation — estruturar é escolher, não preencher: dois dos cinco
  // fragmentos não entram em lugar nenhum.
  estruturar: {
    id: 'estruturar',
    tipo: 'estruturar',
    campos: [
      { id: 'problema', rotulo: 'Problema' },
      { id: 'solucao', rotulo: 'Solução' },
      { id: 'impacto', rotulo: 'Impacto' },
    ],
    fragmentos: [
      {
        id: 'frag-reenvio',
        texto: 'O reenvio automático da fila não verifica se o lote já foi processado.',
        campo: 'problema',
      },
      {
        id: 'frag-identificador',
        texto: 'Marcar cada lote com um identificador único e ignorar repetições.',
        campo: 'solucao',
      },
      {
        id: 'frag-cobranca',
        texto: 'Lotes duplicados geram cobrança em dobro para o cliente final.',
        campo: 'impacto',
      },
      {
        id: 'frag-sistema-antigo',
        texto: 'O sistema é antigo e precisava ser refeito.',
        campo: null,
      },
      {
        id: 'frag-ninguem-notou',
        texto: 'Ninguém tinha notado isso antes.',
        campo: null,
      },
    ],
    textoDistrator: 'Isso é verdade. Mas ninguém consegue fazer nada com isso.',
  },

  // Bloco 4 — quatro peças num diagrama. Deliberadamente o mais satisfatório
  // dos quatro: o silêncio que vem depois precisa doer.
  montar: {
    id: 'montar',
    tipo: 'montar',
    pecas: [
      { id: 'peca-identificacao', texto: 'Serviço de identificação de lote' },
      { id: 'peca-duplicidade', texto: 'Verificação de duplicidade' },
      { id: 'peca-auditoria', texto: 'Registro de auditoria' },
      { id: 'peca-painel', texto: 'Painel de acompanhamento' },
    ],
  },
};
