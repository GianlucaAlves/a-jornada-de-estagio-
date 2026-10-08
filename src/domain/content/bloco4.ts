/**
 * Fase 4: Marcos prepara Ana para apresentar; a sala, o resumo STAR e o elenco
 * visível acompanham a ordem real de interação.
 *
 * Ordem: Marcos -> puzzle da TV -> apresentação automática de Ana -> Cláudia.
 * Resolver o resumo já inicia a fala, sem clique na plateia, no atril ou pausa
 * encenada. Cláudia fecha a fase e entrega o crachá.
 *
 * Coordenadas de personagens, plateia e atril foram revisadas com a prévia
 * composta e os testes de geometria. A sala foi aberta para reservar o palco.
 */
import type { Cena, Dialogo, DialogoId } from '../types';

export const CENAS_B4: readonly Cena[] = [
  {
    lugarId: 'sala-reunioes',
    bloco: 4,
    totalConversas: 2,
    totalMinigames: 1,
    aberturaTexto:
      'Um ano. Ela não é mais a estagiária nova; é só a estagiária. ' +
      'Innovation Week: as cadeiras viradas para a frente, a sala cheia, ' +
      'uma fila de estagiários mostrando o que fizeram. A próxima é ela.',
    // A releitura mantém a plateia na sala: a apresentação terminou, mas as
    // pessoas que a acompanharam continuam parte do cenário.
    ecoTexto:
      'A plateia continua nas cadeiras, virada para a frente. A tela ainda está ' +
      'acesa com a página que Ana apresentou.',
    hotspots: [
      {
        id: 'b4-marcos',
        rotulo: 'Marcos',
        arte: { tipo: 'npc', npcId: 'marcos' },
        pos: { x: 86, y: 70 },
        parada: { x: 65.5, y: 62 },
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-preparacao' }],
      },
      {
        id: 'b4-tv',
        rotulo: 'Tela da sala',
        arte: { tipo: 'objeto', assetId: 'objeto-tv-grande', largura: 384, altura: 240 },
        pos: { x: 50, y: 30 },
        // A parada fica na lateral do palco, em piso livre diante da tela.
        parada: { x: 66, y: 62 },
        requerHotspotsFeitos: ['b4-marcos'],
        bloqueadoTexto: 'Marcos ainda está conversando com Ana sobre como organizar a apresentação.',
        // Coisa de parede: ancora pelo centro, senão a TV assenta no chão.
        // Declarada DEPOIS de `parada`, e dentro dos 600 caracteres seguintes,
        // porque é ali que `previa_de_cena.py` procura — âncora escrita antes,
        // ou longe, sai da janela e a prévia desenha a TV em pé no chão. A
        // prévia é uma das duas defesas desta cena, não um enfeite.
        ancora: 'centro',
        // SEM `umaVezSo`: reabrir o puzzle é seguro desde o ADR-011, e precisa
        // ser, porque agora o puzzle tem botão de sair.
        efeitos: [{ tipo: 'abrirPuzzle', puzzleId: 'montar' }],
      },
      {
        // Depois do silêncio. Ela é a única que ainda não saiu de quadro.
        id: 'b4-claudia',
        rotulo: 'Cláudia',
        arte: { tipo: 'npc', npcId: 'claudia' },
        pos: { x: 34, y: 62 },
        // A parada preserva espaço entre Cláudia, plateia e palco.
        parada: { x: 65, y: 62 },
        requerDialogosConcluidos: ['b4-apresentacao'],
        bloqueadoTexto: 'Cláudia espera Ana terminar de apresentar o trabalho.',
        efeitos: [{ tipo: 'dialogo', dialogoId: 'b4-reconhecimento' }],
      },
    ],
  },
];

export const DIALOGOS_B4: Record<DialogoId, Dialogo> = {
  'b4-preparacao': {
    id: 'b4-preparacao',
    nos: [
      { tipo: 'fala', quem: 'marcos', texto: 'Antes de entrar: se alguém perguntar o que mudou com esse projeto, o que você conta?' },
      { tipo: 'fala', quem: 'ana', texto: 'Que eu participei. Mas... não sei se ficou claro o que eu fiz.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Então conta em quatro passos: situação, tarefa, ação e resultado. Como tava, o que cabia a você, o que fez e no que deu.' },
      { tipo: 'fala', quem: 'ana', texto: 'Aí mostro a minha parte sem apagar o trabalho do time.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Isso. E depois dá pra contar essa história num post profissional. Tem gente que não tava na sala.' },
      { tipo: 'fala', quem: 'marcos', texto: 'Só confere o que pode sair pra fora, tá? Fala do que aprendeu sem mostrar dado interno.' },
    ],
  },
  'b4-apresentacao': {
    id: 'b4-apresentacao',
    nos: [
      { tipo: 'fala', quem: 'ana', texto: 'Antes, a gente anotava a conferência no papel e só passava pra planilha no fim do turno. Quem chegava depois perguntava o que faltava.' },
      { tipo: 'fala', quem: 'ana', texto: 'Minha parte era deixar isso claro pro turno seguinte.' },
      { tipo: 'fala', quem: 'ana', texto: 'Passei a registrar na planilha compartilhada, ali na hora. Depois conferi com o pessoal da linha se tava funcionando.' },
      { tipo: 'fala', quem: 'ana', texto: 'Agora o outro turno já começa sabendo o que falta. Eu gosto de resolver essa passagem... ainda fico nervosa falando aqui na frente.' },
    ],
    efeitos: [],
  },
  /**
   * Cláudia explica como a apresentação amplia as oportunidades e recomenda
   * compartilhar uma versão pública do trabalho no LinkedIn, sem dado interno.
   */
  'b4-reconhecimento': {
    id: 'b4-reconhecimento',
    nos: [
      { tipo: 'fala', quem: 'claudia', texto: 'Você explicou com clareza o que mudou e qual foi a sua parte.' },
      { tipo: 'fala', quem: 'ana', texto: 'Eu estava nervosa, mas queria que as pessoas entendessem o trabalho.' },
      { tipo: 'fala', quem: 'claudia', texto: 'Agora mais gente sabe o que você fez e como pode contribuir. Isso pode abrir outras portas.' },
      { tipo: 'fala', quem: 'claudia', texto: 'Faz uma versão pro LinkedIn também, sem nenhum dado interno. Assim, quem não estava aqui pode conhecer seu trabalho.' },
    ],
    efeitos: [
      { tipo: 'concederItem', itemId: 'cracha-innovation' },
      { tipo: 'concederSkill', skillId: 'visibilidade' },
      { tipo: 'concluirLugar', lugarId: 'sala-reunioes' },
      { tipo: 'blocoConcluido' },
    ],
  },
};
