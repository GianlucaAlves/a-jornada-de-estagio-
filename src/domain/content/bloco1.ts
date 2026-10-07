/**
 * FASE 1 — timidez e insegurança (apresenta: Pedro).
 *
 * Lugar único: Escritório. A fase abre e fecha no mesmo lugar (ADR-025) e aqui
 * isso é de graça, porque só existe um lugar.
 *
 * O PUZZLE DA SENHA É SOCIAL, NÃO LÓGICO. Os três pedaços da senha
 * (`PUZZLES.senha`) estão na boca de três pessoas diferentes, e nenhuma delas
 * tem a resposta inteira. É isso, e não a digitação, que é o coração da fase:
 * para entrar no sistema ela tem de falar com três pessoas no primeiro dia.
 *
 * CADA PISTA É DITA DE FORMA LITERAL, e isso não é gosto — é requisito. Pista
 * sugerida deixa o puzzle insolúvel ao vivo, e o jogo está no ar para quem não
 * tem apresentador ao lado. O teste de integridade cobra token por token que
 * `NOVO`, `12` e `03` apareçam em texto alcançável desta fase.
 *
 * NENHUMA FALA DIZ O TEMA. O Tiago fala em sigla e volta pro que estava
 * fazendo; a Cláudia responde e vai embora; o Rafael quebra o gelo com uma
 * piada sobre a tela de acesso e oferece ajuda. Medo de perguntar é o que a plateia VÊ acontecendo —
 * quem nomeia é quem apresenta (docs/roteiro/01-bloco-1.md).
 *
 * O CARTÃO DO RAFAEL É O ITEM TARDIO Nº 1 e paga na fase 6. Nada aqui o
 * sinaliza: ele nasce de uma conversa, com descrição factual, no meio de um
 * primeiro dia. Qualquer ênfase aqui entrega o clímax de graça.
 *
 * ORDEM DAS SKILLS: `coragem-perguntar` (Tiago) vem antes de
 * `autoconhecimento` (Cláudia), e a ordem de declaração dos hotspots é o que
 * garante isso — o painel preenche na ordem em que ela aprendeu, e a suíte da
 * store afirma a lista inteira, não o tamanho dela.
 *
 * COORDENADAS: medidas contra `docs/arte/chao.json` (scripts/_mapa_chao.py) e
 * olhadas em `docs/arte/previa-b1-escritorio.png`. O Escritório é apertado de
 * um jeito específico: a faixa x 36..50% só tem piso ABAIXO da barra de itens,
 * então ninguém pode ficar de pé no meio da cena, e o painel de skills come
 * tudo depois de x 73%. Sobram três bolsões — o do notebook (x 12..15), o de
 * trás da divisória (x 20..32, onde o Tiago fica com os pés em 61%) e o
 * corredor da direita (x 52..72).
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B1: readonly Cena[] = [
  {
    lugarId: 'escritorio',
    bloco: 1,
    totalConversas: 3,
    totalMinigames: 1,
    aberturaTexto:
      'Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está olhando.',
    ecoTexto: 'Aqui ela falou com três pessoas pra digitar oito caracteres.',
    hotspots: [
      {
        id: 'b1-notebook',
        rotulo: 'Notebook',
        arte: { tipo: 'objeto', assetId: 'objeto-notebook', largura: 160, altura: 112 },
        // Meio do tampo, e não a ponta esquerda: a ponta é o ÚNICO pedaço de
        // piso de verdade que sobra deste lado da sala, e ela é do Tiago.
        pos: { x: 30, y: 72 },
        parada: { x: 12, y: 80 },
        // SEM `umaVezSo`, e isso é a correção de corretude do ADR-011: a store
        // não rebaixa mais puzzle 'resolvido' para 'liberado', então reabrir é
        // seguro. E reabrir PRECISA ser seguro, porque o puzzle tem botão de
        // sair — com `umaVezSo` aqui, sair uma vez órfãnaria a fase inteira.
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'senha' }],
      },
      {
        // NA QUINA DA MESA, JUNTO DAS CAIXAS, e essa posição custou uma prévia
        // reprovada. O mapa de piso declara piso em x 20..32 / y 60..71, mas
        // aquilo é o TAMPO DA MESA lido como chão: a figura ali fica de pé
        // sobre o móvel, exatamente o defeito das 21 figuras. O teste passava e
        // a imagem não. Piso de verdade neste lado só existe em x 3..19, e a
        // posição de entrada da Ana come até x 15,7 — então esta é a única
        // vaga: x 18, pés em 80%.
        id: 'b1-tiago',
        rotulo: 'Tiago',
        arte: { tipo: 'npc', npcId: 'tiago' },
        pos: { x: 18, y: 80 },
        parada: { x: 7, y: 80 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-tiago' }],
      },
      {
        // Ela atravessa o corredor com o notebook na mão. Para, mas por pouco
        // tempo — e isso é de propósito: na fase 3 a mesma pessoa vai parar de
        // verdade, e a diferença tem de ser sentida sem ninguém explicar.
        id: 'b1-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        pos: { x: 52, y: 70 },
        parada: { x: 63, y: 76 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-claudia' }],
      },
      {
        // Mesa dele, do outro lado da sala. O único que puxa conversa sem ela
        // pedir nada.
        id: 'b1-rafael',
        rotulo: 'Rafael',
        arte: { tipo: 'npc', npcId: 'rafael' },
        pos: { x: 71, y: 76 },
        parada: { x: 60, y: 74 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b1-rafael' }],
      },
      {
        id: 'b1-tela',
        rotulo: 'Tela aberta',
        arte: { tipo: 'objeto', assetId: 'objeto-monitor-ligado', largura: 192, altura: 144 },
        // Coisa de mesa: ancorado pelo centro para a base cair na aresta do
        // tampo. Ancorado pela base ele flutua — foi visto na prévia.
        pos: { x: 40, y: 65.2 },
        parada: { x: 12, y: 80 },
        // O centro mantém a base do monitor no tampo; a prévia também lê a âncora
        // abaixo da parada para compor a mesma geometria que a interface.
        ancora: 'centro',
        requerPuzzleResolvido: 'senha',
        bloqueadoTexto: 'A tela de login continua ali, esperando os três campos.',
        // `umaVezSo` NÃO é por causa do puzzle (ver `b1-notebook`): é para o
        // fecho da fase não ser narrado duas vezes se alguém reclicar durante
        // a fala do apresentador.
        umaVezSo: true,
        efeitos: [
          {
            tipo: 'narrar',
            texto:
              'A tela abre. É só uma área de trabalho vazia. E ainda assim é a coisa mais importante que aconteceu hoje.',
          },
          { tipo: 'destravarLugar', lugarId: 'cafezinho' },
          { tipo: 'blocoConcluido' },
        ],
      },
    ],
  },
];

/**
 * Os três diálogos da senha. Um pedaço por pessoa, e cada pessoa entrega o
 * pedaço dela e PARA — ninguém resume a conversa anterior, ninguém explica o
 * que a cena significa.
 *
 * As direções de cena entre parênteses são marcação para quem lê a linha em voz
 * alta. O teste de frases-assinatura as ignora de propósito, para que mexer na
 * direção não reprove a frase.
 */
export const DIALOGOS_B1: Record<DialogoId, Dialogo> = {
  'b1-tiago': {
    id: 'b1-tiago',
    nos: [
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'Ah, a nova! A senha inicial tá no e-mail de boas-vindas.',
      },
      { tipo: 'fala', quem: 'ana', texto: 'Então... não consigo abrir o e-mail sem a senha.' },
      { tipo: 'fala', quem: 'ana', texto: 'Fiquei um tempão olhando pra tela. Achei que perguntar logo no primeiro dia ia pegar mal.' },
      // A piada seca é o beat inteiro. Ele não se desculpa e não resolve: ele
      // reconhece e segue. É o ritmo normal de quem já está dentro.
      { tipo: 'fala', quem: 'tiago', texto: '(pausa) É. Todo mundo cai nessa.' },
      {
        // PISTA 1, literal: o prefixo é igual para todo mundo, e quem está há
        // anos na casa responde isso sem pensar.
        tipo: 'fala',
        quem: 'tiago',
        texto: 'O começo é NOVO, em maiúscula. Igual pra todo mundo.',
      },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: 'O do meio é o número do teu time; a Cláudia sabe. No fim vai o dia que você entrou.',
      },
      {
        tipo: 'fala',
        quem: 'tiago',
        texto: '(volta pro que estava fazendo) Eu também demorei pra decorar onde abria chamado.',
      },
    ],
    // Ela perguntou. É a primeira coisa que ela faz sozinha no dia.
    efeitos: [{ tipo: 'concederSkill', skillId: 'coragem-perguntar' }],
  },

  'b1-claudia': {
    id: 'b1-claudia',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'Você é a estagiária nova? Cláudia.' },
      { tipo: 'fala', quem: 'ana', texto: 'Sou, sim. Ana. Tô tentando entrar no sistema... qual é o número do time?' },
      {
        // PISTA 2, literal. E é a deixa dela para a pergunta que planta o
        // autoconhecimento — "volta meio metro" é a única coisa que mostra que
        // a resposta importou.
        tipo: 'fala',
        quem: 'claudia',
        texto: 'É 12. (para, volta meio metro) E me conta: o que te trouxe pra cá?',
      },
      {
        tipo: 'fala',
        quem: 'ana',
        texto: 'Queria ver como é no dia a dia. Na faculdade a gente vê muita coisa no papel, né?',
      },
      {
        tipo: 'fala',
        quem: 'claudia',
        texto: 'Ah, entendi. (anota mentalmente e sai) Bom primeiro dia.',
      },
    ],
    // Ela soube responder "o que te trouxe aqui" sem enrolar. A Cláudia não
    // elogia — ela guarda. O que isso custou à Ana é assunto do apresentador.
    efeitos: [{ tipo: 'concederSkill', skillId: 'autoconhecimento' }],
  },

  'b1-rafael': {
    id: 'b1-rafael',
    nos: [
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'A tela de login pede a senha antes de deixar você abrir o e-mail que tem a senha. Alguém desenhou isso numa sexta-feira, só pode.',
      },
      { tipo: 'fala', quem: 'ana', texto: '(ri, aliviada) Ainda bem que não sou a única achando isso estranho.' },
      {
        // PISTA 3, literal, com o dia em dois dígitos para não haver dúvida.
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Sou o Rafael, do time de Projetos, ali do lado. No fim vai o dia que você entrou: hoje é 03.',
      },
      {
        // O cartão nasce aqui, no meio de uma frase sobre outra coisa. É o item
        // tardio nº 1 e não pode ganhar ênfase nenhuma.
        tipo: 'fala',
        quem: 'rafael',
        texto: '(escreve o ramal atrás de um cartão) Qualquer coisa que travar, me chama. Sério.',
      },
      {
        tipo: 'fala',
        quem: 'rafael',
        texto: 'Pra primeiro dia, três ramais já é bastante. Eu levei uma semana pra achar todo mundo.',
      },
    ],
    efeitos: [{ tipo: 'concederItem', itemId: 'cartao-rafael' }],
  },
};
