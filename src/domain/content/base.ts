/**
 * Conteúdo base: itens, skills, lugares, perfis de NPC e os textos que não
 * pertencem a um bloco só. Fonte de verdade: docs/roteiro/00-fundamentos.md.
 *
 * Os Records são anotados explicitamente (não inferidos) para que a falta de
 * qualquer id seja erro de compilação — e para que a indexação devolva o valor
 * e não `T | undefined` sob `noUncheckedIndexedAccess`.
 *
 * TODO VOCABULÁRIO DE TECNOLOGIA SAIU DAQUI (ADR-002). A Ana é de apoio a
 * projetos: planilha, prazo, reunião, relatório, cobrança de status. O que
 * mudou não foi só a palavra — a descrição do certificado trocou de EIXO, de "o
 * que ela estudou" para "quanto, e por conta de quem" (ADR-023), porque
 * generalizar sem trocar o eixo teria matado a força da versão antiga.
 */
import type {
  Item,
  ItemId,
  Lugar,
  LugarId,
  NpcId,
  PerfilNpc,
  Skill,
  SkillId,
} from '../types';

// ---------------------------------------------------------------- itens

/**
 * Seis itens: Anotações, quatro itens tardios e o Relatório persistente. Eram oito.
 *
 * `senha`, `indicacao-trilha` e `projeto-entregue` foram cortados porque
 * nenhum efeito do jogo os usava (ADR-014, ADR-017). O corte importa: item que
 * entra na barra e nunca sai ensina à plateia que a barra é decoração — e a
 * barra é o mecanismo do clímax: quatro itens viram portas e o Relatório fica.
 *
 * `tardio` é metadado interno. A UI não diferencia, porque qualquer marcação
 * anunciaria o clímax.
 */
export const ITENS: Record<ItemId, Item> = {
  'anotacoes-treinamento': {
    id: 'anotacoes-treinamento',
    nome: 'Anotações do treinamento',
    descricao: 'Tudo o que ouço e preciso lembrar, registrado na hora.',
    tardio: false,
  },
  relatorio: {
    id: 'relatorio',
    nome: 'Relatório',
    descricao: 'Relatório criado por iniciativa própria: o registro de um problema, da solução proposta e do impacto para o próximo turno.',
    tardio: false,
  },
  'plano-carreira': {
    id: 'plano-carreira',
    nome: 'Plano de carreira',
    descricao: 'Ana escolheu explorar desenvolvimento de software: estudar como os sistemas se conectam e praticar em projetos pequenos.',
    tardio: true,
  },
  'cartao-rafael': {
    id: 'cartao-rafael',
    nome: 'Cartão do Rafael',
    descricao: 'Rafael adicionou Ana no Teams no primeiro dia. Uma conversa pode abrir uma porta?',
    tardio: true,
  },
  'certificado-degree': {
    id: 'certificado-degree',
    // O id fica: renomeá-lo arrastaria manifest, arte e scripts de geração por
    // um ganho de zero. O que mudou é o TEXTO, e o eixo dele.
    nome: 'Certificado de conclusão',
    descricao: 'Uma trilha escolhida a partir do que o trabalho já pede. O que Ana decidiu aprender por conta própria?',
    tardio: true,
  },
  'cracha-innovation': {
    id: 'cracha-innovation',
    nome: 'Crachá do Innovation',
    // Innovation Week é o nome do EVENTO, não de um lugar (ADR-026).
    descricao: 'Ana apresentou a melhoria na passagem de turno. Quem viu o trabalho dela chegar até ali?',
    tardio: true,
  },
};

/** Ordem persistente da barra: origem visual e sequência de leitura do clímax. */
export const ORDEM_ITENS: readonly ItemId[] = [
  'cartao-rafael',
  'certificado-degree',
  'cracha-innovation',
  'plano-carreira',
  'relatorio',
  'anotacoes-treinamento',
];

// ---------------------------------------------------------------- skills

/**
 * Nove skills, na ordem em que ela as aprende. Nunca se gastam.
 *
 * O painel é acordeão: só as conquistadas, cada uma clicável, e sem contador
 * (ADR-020) — contador revela o tamanho do caminho e a plateia passa a contar
 * quantas faltam em vez de acompanhar.
 *
 * `plano-futuro` migrou da fase 4 para a fase 5: a fase 5 é inteira sobre
 * competências, faculdade e a pergunta "é esse o caminho?" (ADR-024, ADR-028),
 * e é ela que tem o painel como MECÂNICA, não como painel.
 */
export const SKILLS: Record<SkillId, Skill> = {
  'coragem-perguntar': {
    id: 'coragem-perguntar',
    nome: 'Coragem de perguntar',
    texto:
      'Perguntar não é admitir que você não sabe. É o jeito mais rápido de passar a saber.',
    bloco: 1,
  },
  autoconhecimento: {
    id: 'autoconhecimento',
    nome: 'Autoconhecimento',
    texto: "Saber responder 'o que te trouxe aqui' antes que alguém pergunte.",
    bloco: 1,
  },
  'leitura-mercado': {
    id: 'leitura-mercado',
    nome: 'Leitura do que o trabalho pede',
    // Era 'Leitura de mercado' com um texto sobre diploma. O eixo continua o
    // mesmo — a grade não é a fronteira — mas agora vale para qualquer área.
    texto: 'Entender o que é urgente, o que dá mais trabalho e o que o time precisa primeiro.',
    bloco: 2,
  },
  'aprendizado-continuo': {
    id: 'aprendizado-continuo',
    nome: 'Aprendizado contínuo',
    texto: 'Ninguém aqui parou de estudar. Nem quem já chegou.',
    bloco: 2,
  },
  'competencia-tecnica': {
    id: 'competencia-tecnica',
    nome: 'Conhecimento aplicado',
    // O selo descreve a transferência do estudo para uma tarefa real, sem
    // prender a habilidade a uma ferramenta ou curso específico.
    texto: 'Aprender uma ferramenta e usar o que estudou numa tarefa real.',
    bloco: 2,
  },
  proatividade: {
    id: 'proatividade',
    nome: 'Proatividade',
    // A única que NÃO se apaga no clímax. É a tese do projeto (ADR-017).
    texto: 'Resolver o que ninguém mandou é o que te diferencia de quem só cumpre.',
    bloco: 3,
  },
  protagonismo: {
    id: 'protagonismo',
    nome: 'Protagonismo',
    texto: 'Liderança não vem com cargo. Vem de assumir o que ninguém assumiu.',
    bloco: 3,
  },
  visibilidade: {
    id: 'visibilidade',
    nome: 'Visibilidade',
    texto: 'Trabalho que ninguém sabe que existe não vira oportunidade sozinho.',
    bloco: 4,
  },
  'plano-futuro': {
    id: 'plano-futuro',
    nome: 'Plano de futuro',
    texto:
      'Onde eu quero estar não é uma pergunta pra depois. É a pergunta que organiza o agora.',
    bloco: 5,
  },
};

// ---------------------------------------------------------------- elenco

/**
 * Os cinco NPCs, com NOME e CARGO.
 *
 * Existe porque o cargo passou a acompanhar o nome em toda ocorrência
 * (ADR-006, ADR-015): a plateia tem vinte minutos e não pode gastar dois
 * deduzindo quem é a Cláudia.
 *
 * Cargo é FUNÇÃO, não título de RH — e todos saíram de tecnologia (ADR-002).
 * O caso da Bianca é o único de propósito ambíguo: ela é formada em Letras e
 * trabalha com tecnologia, e esse contraste é a frase mais anti-nicho que o
 * projeto pode dizer (ADR-027). O contraste vive nas FALAS dela, que são a
 * exceção declarada ao expurgo; o cargo aqui fica universal, senão o nicho
 * volta pela legenda do rodapé.
 *
 * Nenhum destes nomes colide com os cinco apresentadores (ADR-001): Pedro,
 * Heloisa, João, Gianluca e Marianna não são personagens do jogo.
 */
export const NPCS: Record<NpcId, PerfilNpc> = {
  claudia: { id: 'claudia', nome: 'Cláudia', cargo: 'Líder do time' },
  rafael: { id: 'rafael', nome: 'Rafael', cargo: 'Projetos, outro time' },
  tiago: { id: 'tiago', nome: 'Tiago', cargo: 'Apoio operacional' },
  bianca: { id: 'bianca', nome: 'Bianca', cargo: 'Desenvolvedora de API' },
  marcos: { id: 'marcos', nome: 'Marcos', cargo: 'Eventos internos, outra área' },
};

// ---------------------------------------------------------------- lugares

/**
 * Cinco slots, em % do canvas 1920x1080. Eram seis.
 *
 * DUAS RESTRIÇÕES GOVERNAM ESTES NÚMEROS, e as duas são verificáveis:
 *
 * 1. O CENTRO FICA LIVRE. É de lá que as cinco conexões do clímax saem, e uma
 *    moldura de 300x250 no meio do mapa faria a primeira linha nascer por baixo
 *    de um slot. A fileira de cima fica 227px acima do centro da área útil e a
 *    de baixo 227px abaixo: sobra um miolo limpo para a origem das linhas.
 *
 * 2. NENHUM PAR SE SOBREPÕE DEPOIS DO ENQUADRAMENTO. `Mapa.tsx` normaliza estas
 *    posições para a caixa livre (x 214..1318, y 291..745 em px de centro),
 *    porque o canvas cheio não está livre — painel de skills à direita, barra de
 *    itens embaixo. Na caixa dos centros cabem três colunas com 552px de passo
 *    (slot tem 300) e duas fileiras com 454px de passo (slot tem 250). Cinco
 *    lugares só entram como 3+2; qualquer outro arranjo encosta dois slots.
 *
 * Por isso os valores são 16/50/84 em x e 26/74 em y: são os extremos e o meio,
 * e o que importa é a PROPORÇÃO, porque o enquadramento normaliza pelos
 * extremos declarados aqui.
 */
export const LUGARES: Record<LugarId, Lugar> = {
  escritorio: { id: 'escritorio', nome: 'Escritório', pos: { x: 16, y: 26 } },
  cafezinho: { id: 'cafezinho', nome: 'Cafezinho', pos: { x: 50, y: 26 } },
  'linha-producao': {
    id: 'linha-producao',
    nome: 'Linha de Produção',
    pos: { x: 84, y: 26 },
  },
  'sala-reunioes': { id: 'sala-reunioes', nome: 'Sala de Reuniões', pos: { x: 16, y: 74 } },
  'outra-area': { id: 'outra-area', nome: 'Engenharia', pos: { x: 84, y: 74 } },
};

// ---------------------------------------------------------------- textos avulsos

/**
 * Mensagem única de falha para qualquer combinação errada de item e alvo.
 * Uma só: o apresentador nunca é surpreendido por um texto que não ensaiou.
 */
export const MENSAGEM_GENERICA =
  'Ana olha o que tem na mão, olha de novo pra frente, e guarda. Não é aqui.';

/** Fecho da fase 6. Uma por clique, e depois silêncio. */
export const PERGUNTAS_FINAIS: readonly string[] = [
  'Que contribuição sua merece ser conhecida — e como você contaria essa história?',
  'Em que área você quer crescer, e qual próximo passo pode experimentar?',
  'Se uma oportunidade não vier, o que depende de você e o que você leva dessa experiência?',
];
