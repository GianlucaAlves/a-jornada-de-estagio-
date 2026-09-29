/**
 * BLOCO 2 — A REALIDADE DO MERCADO
 *
 * Duas cenas no mesmo dia: Cafezinho → Sala de Treinamento.
 *
 * A Sala de Treinamento não é alcançável antes da conversa com a Bianca, e o
 * portão é o `destravarLugar` do diálogo dela — não gating de hotspot. O slot
 * do mapa fica silhuetado até a indicação de trilha existir.
 *
 * O beat do Cartão do Rafael (`aceitaItem`) é deliberado: o item tardio nº 1
 * não serve pra nada agora, e a piada é o jeito de dizer isso sem dizer. Ele
 * NÃO é consumido — precisa chegar inteiro no Bloco 5.
 *
 * Ids de hotspot: `hotspotsFeitos` é uma lista GLOBAL que a store não limpa na
 * troca de bloco. Por isso os ids daqui são sufixados por cena (`-cafe`,
 * `-trilha`): um id repetido num hotspot `umaVezSo` de outro bloco já contaria
 * como acionado e viraria clique morto no palco.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B2: readonly Cena[] = [
  {
    lugarId: 'cafezinho',
    bloco: 2,
    aberturaTexto:
      'Um mês. Ela já sabe a senha de cor. Já sabe que ninguém almoça antes de meio-dia e meia. Ainda não sabe o que está fazendo.',
    ecoTexto: 'Aqui eu descobri o nome do que eu não sabia.',
    hotspots: [
      {
        id: 'maquina-cafe',
        rotulo: 'Máquina de café',
        pos: { x: 17, y: 47 },
        parada: { x: 22, y: 62 },
        efeitos: [
          { tipo: 'narrar', texto: 'Ana aperta o botão errado e sai chá. Ela bebe o chá.' },
        ],
      },
      {
        id: 'bianca-cafe',
        rotulo: 'Bianca',
        pos: { x: 46, y: 45 },
        parada: { x: 42, y: 60 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-bianca-cafezinho' }],
      },
      {
        id: 'rafael-cafe',
        rotulo: 'Rafael',
        pos: { x: 77, y: 47 },
        parada: { x: 72, y: 61 },
        aceitaItem: 'cartao-rafael',
        efeitosComItem: [
          { tipo: 'narrar', texto: 'Rafael: (ri) Esse cartão é meu, eu sei quem eu sou.' },
        ],
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-rafael-cafezinho' }],
      },
    ],
  },
  {
    lugarId: 'sala-treinamento',
    bloco: 2,
    aberturaTexto:
      'Sala pequena, TV na parede, mesa longa. Bianca já está lá com o notebook aberto.',
    ecoTexto: 'Aqui eu estudei o que faltou, à noite.',
    hotspots: [
      {
        id: 'bianca-trilha',
        rotulo: 'Bianca',
        pos: { x: 63, y: 45 },
        parada: { x: 58, y: 60 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-bianca-treinamento' }],
      },
      {
        id: 'notebook-trilha',
        rotulo: 'Notebook da Ana',
        pos: { x: 33, y: 67 },
        parada: { x: 36, y: 79 },
        umaVezSo: true,
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'associar' }],
      },
      {
        id: 'conclusao-trilha',
        rotulo: 'Certificado na tela',
        pos: { x: 43, y: 59 },
        parada: { x: 40, y: 75 },
        requerPuzzleResolvido: 'associar',
        bloqueadoTexto: 'As quatro lacunas ainda estão sem trilha. Nada pra concluir aqui.',
        umaVezSo: true,
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-conclusao-trilha' }],
      },
    ],
  },
];

export const DIALOGOS_B2: Record<DialogoId, Dialogo> = {
  /** O coração do bloco: é a Bianca que verbaliza o gap. */
  'b2-bianca-cafezinho': {
    id: 'b2-bianca-cafezinho',
    nos: [
      { tipo: 'fala', quem: 'bianca', texto: 'Você é do DT7, né? A Cláudia falou de você.' },
      { tipo: 'fala', quem: 'ana', texto: 'Falou?' },
      { tipo: 'fala', quem: 'bianca', texto: 'Falou que você pergunta muito. (pausa) Era elogio.' },
      { tipo: 'fala', quem: 'narrador', texto: 'Ana pergunta como ela chegou ali.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Eu sou formada em Letras.' },
      { tipo: 'fala', quem: 'ana', texto: '(pausa) Letras.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Trabalhei seis anos com revisão de texto. Fiz uma transição aos vinte e oito. Hoje eu faço documentação técnica e desenho de API.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ana pergunta como ela fez.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Estudando o que estava faltando. Que é diferente de estudar o que tem na grade.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Deixa eu te perguntar uma coisa. Na faculdade, quanto tempo você passou aprendendo a ler o log de um sistema que já está rodando em produção?',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Nenhum.' },
      { tipo: 'fala', quem: 'bianca', texto: 'E quanto tempo você passou provando teorema?' },
      { tipo: 'fala', quem: 'ana', texto: 'Bastante.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Pois é. Nenhum dos dois é inútil. Mas só um deles vai te aparecer na terça-feira.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Bianca pega um guardanapo.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Olha, tem duas coisas aqui dentro que ninguém te conta no primeiro dia. Degree, que é trilha estruturada, com certificado, tem começo e fim. E Percipio, que é biblioteca — você vai lá quando precisa de uma coisa específica, hoje, agora.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Degree é pra quando você não sabe o que não sabe. Percipio é pra quando você já sabe o nome do problema.',
      },
      { tipo: 'fala', quem: 'narrador', texto: 'Ela anota três trilhas e entrega.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Ah, e eu vou estar lá também. Eu não parei de estudar, Ana. Ninguém aqui parou.',
      },
    ],
    efeitos: [
      { tipo: 'concederItem', itemId: 'indicacao-trilha' },
      { tipo: 'concederSkill', skillId: 'leitura-mercado' },
      { tipo: 'concederSkill', skillId: 'aprendizado-continuo' },
      { tipo: 'destravarLugar', lugarId: 'sala-treinamento' },
    ],
  },

  /**
   * Reaparição. A plateia precisa reencontrá-lo aqui pra lembrar dele no
   * minuto 44 — sem isso a primeira conexão do final morre.
   */
  'b2-rafael-cafezinho': {
    id: 'b2-rafael-cafezinho',
    nos: [
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Sobreviveu ao primeiro mês. (brinda com o copo de café)',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Por pouco.' },
      { tipo: 'fala', quem: 'rafael', texto: 'Eu vi que você usou meu ramal zero vezes.' },
      { tipo: 'fala', quem: 'ana', texto: '(pausa) É.' },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto:
          'Tudo bem. Só não deixa de usar por achar que tá incomodando. Isso é o erro que eu cometi.',
      },
    ],
  },

  /** Antes do puzzle: o método. Listar o que faltou, depois achar a trilha. */
  'b2-bianca-treinamento': {
    id: 'b2-bianca-treinamento',
    nos: [
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Senta. Vou te mostrar uma coisa que leva cinco minutos e economiza seis meses.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Você lista o que apareceu na sua frente esse mês e não soube resolver. Depois você acha a trilha que fecha cada uma. Não é sobre estudar mais. É sobre estudar o que faltou.',
      },
    ],
  },

  /**
   * Fecho do bloco. A fala mais honesta da apresentação está aqui: ela
   * provavelmente NÃO vai usar aquilo agora.
   */
  'b2-conclusao-trilha': {
    id: 'b2-conclusao-trilha',
    nos: [
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: 'Quatro linhas na tela. Nenhuma delas estava na grade da faculdade.',
      },
      {
        tipo: 'fala',
        quem: 'narrador',
        texto: 'Ana conclui a primeira: Fundamentos de Arquitetura de Sistemas.',
      },
      { tipo: 'fala', quem: 'bianca', texto: 'Quarenta horas. Você fez em três semanas, à noite.' },
      { tipo: 'fala', quem: 'ana', texto: 'Eu nem sei se vou usar isso.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Provavelmente não vai. (pausa) Não agora.' },
    ],
    efeitos: [
      { tipo: 'concederItem', itemId: 'certificado-degree' },
      { tipo: 'concederItem', itemId: 'anotacoes-treinamento' },
      { tipo: 'concederSkill', skillId: 'competencia-tecnica' },
      { tipo: 'destravarLugar', lugarId: 'laboratorio' },
      { tipo: 'concluirLugar', lugarId: 'cafezinho' },
      { tipo: 'concluirLugar', lugarId: 'sala-treinamento' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
