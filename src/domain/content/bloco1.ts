/**
 * BLOCO 1 — O PRIMEIRO DIA
 *
 * Lugar único: Escritório (base recorrente — NUNCA concluído, porque a Ana
 * volta aqui nos Blocos 3 e 5).
 *
 * Desenho da cena: o puzzle da senha é SOCIAL, não lógico. O notebook só
 * responde depois dos três NPCs conversados; antes disso devolve a narração
 * de senha inválida do roteiro. Nenhum NPC tem a resposta inteira.
 *
 * `notebook` abre o puzzle; `notebook-aberto` é o depois — só responde com o
 * puzzle 'senha' resolvido, e é ele que concede senha, skills e o Cafezinho.
 * Os dois são `umaVezSo` para que um clique repetido não reabra (e portanto
 * não rebaixe de 'resolvido' para 'liberado') o puzzle no meio da fala.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B1: readonly Cena[] = [
  {
    lugarId: 'escritorio',
    bloco: 1,
    aberturaTexto:
      'Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está olhando.',
    ecoTexto: 'Aqui eu falei com três pessoas pra digitar onze caracteres.',
    hotspots: [
      {
        id: 'notebook',
        rotulo: 'Notebook',
        pos: { x: 29, y: 74 },
        parada: { x: 33, y: 84 },
        requerHotspotsFeitos: ['tiago', 'claudia', 'rafael'],
        bloqueadoTexto:
          'Senha inválida. Ana olha em volta. Ninguém vai resolver isso pra ela.',
        umaVezSo: true,
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'senha' }],
      },
      {
        id: 'tiago',
        rotulo: 'Tiago',
        pos: { x: 14, y: 45 },
        parada: { x: 19, y: 56 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-tiago' }],
      },
      {
        id: 'claudia',
        rotulo: 'Cláudia',
        pos: { x: 52, y: 41 },
        parada: { x: 56, y: 53 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-claudia' }],
      },
      {
        id: 'rafael',
        rotulo: 'Rafael',
        pos: { x: 79, y: 49 },
        parada: { x: 74, y: 61 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-rafael' }],
      },
      {
        id: 'notebook-aberto',
        rotulo: 'Tela aberta',
        pos: { x: 36, y: 65 },
        parada: { x: 33, y: 84 },
        requerPuzzleResolvido: 'senha',
        bloqueadoTexto: 'A tela de login continua ali, esperando os três campos.',
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A tela abre. É só uma área de trabalho vazia. E ainda assim é a coisa mais importante que aconteceu hoje.',
          },
          { tipo: 'concederItem', itemId: 'senha' },
          { tipo: 'concederSkill', skillId: 'coragem-perguntar' },
          { tipo: 'concederSkill', skillId: 'autoconhecimento' },
          { tipo: 'destravarLugar', lugarId: 'cafezinho' },
          { tipo: 'blocoConcluido' },
        ],
      },
    ],
  },
];

export const DIALOGOS_B1: Record<DialogoId, Dialogo> = {
  /** Tiago resolve um terço e fala em sigla sem perceber. */
  'b1-tiago': {
    id: 'b1-tiago',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Ah, a nova! Beleza? Senha de primeiro acesso, né. Tá no e-mail de boas-vindas.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Eu... não consigo abrir o e-mail sem a senha.' },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: '(pausa) É. Faz sentido. (risada) Todo mundo cai nessa.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ele digita algo.' },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto:
          'Olha, o prefixo é fixo, é ERI pra todo mundo. O do meio é o código do teu time, e isso eu não sei de cabeça — pergunta pra tua líder, a Cláudia. E o último é o dia que você entrou.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Antes de voltar pro rack, ele pergunta:' },
      { tipo: 'fala', quem: 'tiago', texto: 'E você é de que área mesmo?' },
      {
        tipo: 'escolha',
        opcoes: [
          'Ainda estou descobrindo, pra ser sincera.',
          'Sistemas de Informação. Mas nunca mexi com nada em produção.',
          'Boa pergunta.',
        ],
      },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Tranquilo. Ninguém chega sabendo. Qualquer coisa, chama.',
      },
    ],
  },

  /** Cláudia para, mas por pouco tempo. A diferença com o Bloco 3 é o ponto. */
  'b1-claudia': {
    id: 'b1-claudia',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'Oi. Você é a estagiária nova, né. Cláudia.' },
      { tipo: 'fala', quem: 'ana', texto: 'Isso. Ana. Eu... preciso do código do time, pra senha.' },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'DT7. (já andando) Data & Transformation, sétimo squad.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ela para dois passos depois e volta meio metro.' },
      { tipo: 'fala', quem: 'claudia', texto: 'O que te trouxe pra cá?' },
      {
        tipo: 'escolha',
        opcoes: [
          'Queria ver como é na prática. A faculdade é muito teórica.',
          'Honestamente? Precisava começar em algum lugar.',
          'Quero aprender com gente que já faz isso há tempo.',
        ],
      },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Hm. (não reage, anota mentalmente) Tá. Bom primeiro dia.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'E sai.' },
    ],
  },

  /** Rafael: a ponte social. Deixa o cartão — item tardio nº 1. */
  'b1-rafael': {
    id: 'b1-rafael',
    nos: [
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Você tá há uns quarenta minutos naquela tela de senha, né?',
      },
      { tipo: 'fala', quem: 'ana', texto: '(constrangida) Tanto assim?' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Relaxa, eu fiquei uma hora e vinte. Ano passado. Rafael, Dados.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ele se aproxima da mesa.' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'O último campo é o dia que você entrou. Hoje, dia 01. Dois dígitos.',
      },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto:
          'E o DT7 que a Cláudia falou — Data & Transformation. Ela fala em sigla porque a cabeça dela tá sempre em outra coisa, não é com você.',
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'Como você sabia que era ela que eu tinha perguntado?',
      },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto:
          'Porque é sempre ela. (pega um cartão) Olha, qualquer coisa que você travar, me chama. Sério. Eu sei exatamente como é hoje.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ele escreve o ramal atrás, à mão, e entrega.' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto:
          'Primeiro dia é sobre conhecer gente, não sobre produzir nada. Ninguém tá esperando resultado de você hoje.',
      },
    ],
    efeitos: [{ tipo: 'concederItem', itemId: 'cartao-rafael' }],
  },
};
