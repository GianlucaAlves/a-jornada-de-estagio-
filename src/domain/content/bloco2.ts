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
  /**
   * O coração do bloco. Ela ABRE os dois assuntos (grade x mercado, Degree x
   * Percipio) em uma frase cada e para — a explicação é do apresentador, ver
   * os ganchos em docs/roteiro/02-bloco-2.md.
   */
  'b2-bianca-cafezinho': {
    id: 'b2-bianca-cafezinho',
    nos: [
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Você é do DT7? A Cláudia falou que você pergunta muito — era elogio.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu faço documentação técnica e desenho de API. Sou formada em Letras.',
      },
      { tipo: 'fala', quem: 'ana', texto: '(pausa) Letras.' },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Transição aos vinte e oito, estudando o que estava faltando. Que é diferente de estudar o que tem na grade.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          '(anota três trilhas num guardanapo) Degree é trilha com começo e fim. Percipio é biblioteca, pra quando você já sabe o nome do problema.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Eu vou estar lá também. Eu não parei de estudar, Ana — ninguém aqui parou.',
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
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Não deixa de usar por achar que tá incomodando. Esse foi o meu erro.',
      },
    ],
  },

  /** Antes do puzzle: o método, em duas linhas. */
  'b2-bianca-treinamento': {
    id: 'b2-bianca-treinamento',
    nos: [
      {
        tipo: 'fala',
        quem: 'bianca',
        texto: 'Senta. Cinco minutos aqui economizam seis meses.',
      },
      {
        tipo: 'fala',
        quem: 'bianca',
        texto:
          'Lista o que apareceu na sua frente e você não soube resolver. Depois acha a trilha que fecha cada uma.',
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
        quem: 'bianca',
        texto: 'Fundamentos de Arquitetura: quarenta horas. Você fez em três semanas, à noite.',
      },
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
