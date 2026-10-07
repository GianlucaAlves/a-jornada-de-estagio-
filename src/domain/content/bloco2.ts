/** Bloco 2: organizar as demandas e buscar o que falta aprender. */
import type { Cena, Dialogo, DialogoId } from '../types';

export const historiaApresentador = '';

export const CENAS_B2: readonly Cena[] = [
  {
    lugarId: 'cafezinho',
    bloco: 2,
    totalConversas: 2,
    totalMinigames: 1,
    aberturaTexto:
      'Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.',
    ecoTexto: 'Ela começou a anotar as demandas e a buscar o que ainda precisa aprender.',
    hotspots: [
      {
        id: 'b2-bianca',
        rotulo: 'Bianca',
        arte: { tipo: 'npc', npcId: 'bianca' },
        // Ela conversa com Ana do lado de quem pede café, diante da ponta do
        // balcão; y=80 a traz para o piso de circulação, sem pô-la atrás do tampo.
        pos: { x: 51, y: 80 },
        parada: { x: 40, y: 80 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-bianca' }],
      },
      {
        id: 'b2-maquina',
        rotulo: 'Máquina de café',
        arte: { tipo: 'objeto', assetId: 'objeto-maquina-cafe', largura: 128, altura: 192 },
        pos: { x: 16, y: 70 },
        parada: { x: 25, y: 76 },
        efeitos: [{ tipo: 'narrar', texto: 'Ela aperta o botão errado e sai chá. Ela bebe o chá.' }],
      },
      {
        id: 'b2-rafael',
        rotulo: 'Rafael',
        arte: { tipo: 'npc', npcId: 'rafael' },
        pos: { x: 62, y: 74 },
        parada: { x: 73, y: 76 },
        requerPuzzleResolvido: 'associar',
        bloqueadoTexto: 'Dá uma olhada no notebook do Escritório primeiro. Depois a gente conversa.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b2-rafael' }],
      },
    ],
  },
  {
    lugarId: 'escritorio',
    bloco: 2,
    totalConversas: 2,
    totalMinigames: 1,
    aberturaTexto: 'De volta à mesa. Agora ela já sabe o que está procurando.',
    ecoTexto: 'Um plano para dar conta do que chega e aprender o que ainda falta.',
    hotspots: [
      {
        id: 'b2-notebook',
        rotulo: 'Notebook da Ana',
        arte: { tipo: 'objeto', assetId: 'objeto-notebook-aberto', largura: 160, altura: 112 },
        pos: { x: 24.2, y: 72 },
        parada: { x: 12, y: 80 },
        requerHotspotsFeitos: ['b2-bianca'],
        bloqueadoTexto: 'Notebook: Ainda não sei o que procurar aqui.',
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'associar' }],
      },
    ],
  },
];

export const DIALOGOS_B2: Record<DialogoId, Dialogo> = {
  'b2-bianca': {
    id: 'b2-bianca',
    nos: [
      { tipo: 'fala', quem: 'bianca', texto: 'Você tá com cara de quem ganhou cinco pedidos antes do almoço. Foi isso?' },
      { tipo: 'fala', quem: 'ana', texto: 'Quase. Planilha, ferramenta nova... eu digo “deixa comigo” e depois tento lembrar de tudo.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Conheço. Eu vim de outra área e fui aprendendo com curso curto, já testando no trabalho.' },
      { tipo: 'fala', quem: 'ana', texto: 'Tipo o quê? Aqui já me pediram umas coisas que nunca vi na faculdade.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Planilhas, o programa da área, gestão de projetos. E inglês também: tem documento e projeto de fora que chega assim.' },
      { tipo: 'fala', quem: 'bianca', texto: 'Quando voltar pro Escritório, pesquisa essas ferramentas com calma. Escolhe uma pra começar; não precisa aprender tudo de uma vez.' },
    ],
  },
  'b2-rafael': {
    id: 'b2-rafael',
    nos: [
      { tipo: 'fala', quem: 'rafael', texto: 'E aí, conseguiu ligar as situações às práticas? Qual delas te faria falta já?' },
      { tipo: 'fala', quem: 'ana', texto: 'Anotar, com certeza. Essa semana deixei um prazo só na cabeça... não deu muito certo.' },
      { tipo: 'fala', quem: 'rafael', texto: 'Já fiz igual. Anota na hora o prazo, quem pediu e o que ficou combinado. A cabeça agradece.' },
      { tipo: 'fala', quem: 'ana', texto: 'E quando chegam três coisas juntas? Eu olho pra lista e travo.' },
      { tipo: 'fala', quem: 'rafael', texto: 'Olha o prazo e o tamanho do trabalho. O mais pesado eu tento fazer de manhã. Se os prazos batem, aviso cedo e combino.' },
      { tipo: 'fala', quem: 'rafael', texto: 'E separa um tempinho pro curso também. Se deixar pro “quando der”... já sabe. Toma, começa por esse caderno.' },
    ],
    efeitos: [
      { tipo: 'concederItem', itemId: 'anotacoes-treinamento' },
      { tipo: 'concluirLugar', lugarId: 'cafezinho' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
