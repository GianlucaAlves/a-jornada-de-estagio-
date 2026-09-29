/**
 * Conteúdo base: itens, skills, lugares e os textos que não pertencem a um
 * bloco só. Fonte de verdade: docs/roteiro/00-fundamentos.md.
 *
 * Os Records são anotados explicitamente (não inferidos) para que a falta de
 * qualquer id seja erro de compilação — e para que a indexação devolva o valor
 * e não `T | undefined` sob `noUncheckedIndexedAccess`.
 */
import type { Item, ItemId, Lugar, LugarId, Skill, SkillId } from '../types';

// ---------------------------------------------------------------- itens

/**
 * Oito itens: cinco imediatos, três tardios. `tardio` é metadado interno — a
 * UI não diferencia, porque qualquer marcação anunciaria o clímax.
 */
export const ITENS: Record<ItemId, Item> = {
  senha: {
    id: 'senha',
    nome: 'Senha',
    descricao: 'A senha do primeiro acesso. Montada com pedaço de três conversas.',
    tardio: false,
  },
  'indicacao-trilha': {
    id: 'indicacao-trilha',
    nome: 'Indicação de trilha',
    descricao: 'Um papel de guardanapo com três nomes de trilha anotados pela Bianca.',
    tardio: false,
  },
  'anotacoes-treinamento': {
    id: 'anotacoes-treinamento',
    nome: 'Anotações do treinamento',
    descricao: 'Caderno cheio de anotações de arquitetura de sistema. Letra apressada.',
    tardio: false,
  },
  relatorio: {
    id: 'relatorio',
    nome: 'Relatório',
    descricao: 'Cinco páginas sobre um erro que ninguém pediu pra investigar.',
    tardio: false,
  },
  'projeto-entregue': {
    id: 'projeto-entregue',
    nome: 'Projeto entregue',
    descricao: 'A entrega. Funcionando, documentada, no prazo.',
    tardio: false,
  },
  'cartao-rafael': {
    id: 'cartao-rafael',
    nome: 'Cartão do Rafael',
    descricao: 'Rafael Moreira — Engenharia de Dados. Ele escreveu o ramal atrás, à mão.',
    tardio: true,
  },
  'certificado-degree': {
    id: 'certificado-degree',
    nome: 'Certificado do Degree',
    descricao: 'Certificado de conclusão. Fundamentos de Arquitetura de Sistemas. 40h.',
    tardio: true,
  },
  'cracha-innovation': {
    id: 'cracha-innovation',
    nome: 'Crachá do Innovation',
    descricao: 'Crachá de participante. Innovation Day. O cordão ficou torto na foto.',
    tardio: true,
  },
};

// ---------------------------------------------------------------- skills

/** Nove skills, na ordem em que ela as aprende. Nunca se gastam. */
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
    nome: 'Leitura de mercado',
    texto: 'O diploma diz onde você passou. Não diz o que você sabe fazer.',
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
    nome: 'Competência técnica',
    texto: 'Arquitetura de sistemas. Serviu antes do que eu imaginava.',
    bloco: 2,
  },
  proatividade: {
    id: 'proatividade',
    nome: 'Proatividade',
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
    bloco: 4,
  },
};

// ---------------------------------------------------------------- lugares

/**
 * Seis slots, em % do canvas 1920x1080. Bem separados e longe do centro: o
 * centro do mapa é onde o convite aparece no clímax, e é de lá que as quatro
 * conexões saem.
 */
export const LUGARES: Record<LugarId, Lugar> = {
  escritorio: { id: 'escritorio', nome: 'Escritório', pos: { x: 22, y: 30 } },
  cafezinho: { id: 'cafezinho', nome: 'Cafezinho', pos: { x: 50, y: 21 } },
  'sala-treinamento': {
    id: 'sala-treinamento',
    nome: 'Sala de Treinamento',
    pos: { x: 79, y: 31 },
  },
  laboratorio: { id: 'laboratorio', nome: 'Laboratório', pos: { x: 18, y: 66 } },
  innovation: { id: 'innovation', nome: 'Innovation', pos: { x: 50, y: 74 } },
  'sala-reunioes': { id: 'sala-reunioes', nome: 'Sala de Reuniões', pos: { x: 83, y: 64 } },
};

// ---------------------------------------------------------------- textos avulsos

/**
 * Mensagem única de falha para qualquer combinação errada de item e alvo.
 * Uma só: o apresentador nunca é surpreendido por um texto que não ensaiou.
 */
export const MENSAGEM_GENERICA =
  'Ana olha o que tem na mão, olha de novo pra frente, e guarda. Não é aqui.';

/** Fecho do Bloco 5. Uma por clique, e depois silêncio. */
export const PERGUNTAS_FINAIS: readonly string[] = [
  'O que fizemos para estar aqui?',
  'O que gostaríamos de ouvir?',
  'O que podemos levar de transformação?',
];
