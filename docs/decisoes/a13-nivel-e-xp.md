# A13 — nível e experiência da Ana

Os títulos, pesos e aparência ficam em `src/domain/content/niveis.ts`.
A tabela lista somente interações obrigatórias. Os totais são 60, 40, 50,
70 e 40 XP nos blocos 1 a 5; o bloco 6 mostra experiência completa sem
receber pontos nem abrir outro nível.

Conversas pontuam na última fala. Minigames pontuam na primeira solução,
nunca na abertura. Ações pontuam depois de passar pelas condições e pelo
uso correto de item. A store guarda os identificadores pontuados e calcula
a soma sem duplicação. O teste da jornada inteira confere o total exato ao
fechar cada bloco, além dos testes de releitura, saída de puzzle, opcional,
uso errado e migração de save.

O HUD opaco ocupa x 1520..1856, abaixo do selo temporal. O menor texto tem
22 px. A verificação no navegador mede o HUD contra todos os botões visíveis
em oito cenas e seus mapas: nenhum alvo coberto. Minigames escondem o HUD.
O ganho aparece junto do hotspot por 1200 ms; a barra preenche em 800 ms.
Ao concluir a fase, a barra pulsa e a saída para o mapa recebe destaque verde.

A evolução preserva o fecho existente, mostra o nível e Ana ao centro,
troca a postura e digita o título seguinte. Tem som curto e partículas
quadradas. O limite configurado é 3800 ms e qualquer clique pula para o
cartão temporal, que mantém sua leitura manual. `prefers-reduced-motion`
desliga os movimentos decorativos e a transição da barra.

As poses existentes mantêm o ciano: encolhida no nível 1, neutra nos níveis
2 e 3, confiante nos demais. Nos níveis 3 e 5, a composição acrescenta uma
pasta de trabalho com um asset existente. O acessório não concede nem
consome item. O lanyard da pose confiante já diferencia o nível 4.
A Ana futura permanece reservada à revelação. Não se antecipou um crachá
de funcionário ao anúncio de contratação.

O save armazena nível, XP, interações pontuadas, fases com evolução já
exibida e conclusão da fase. Saves anteriores migram por diálogos
concluídos, puzzles resolvidos e ações obrigatórias executadas. Uma conversa
apenas aberta não ganha pontos na migração. Retomar durante a evolução
volta ao mapa da fase concluída; o próximo avanço vai diretamente ao cartão,
evitando repetir a celebração ou deixar a passagem sem saída.

Verificação: `npm.cmd run typecheck` e `npm.cmd test` (373 testes).
`node scripts/verificar_niveis.mjs` grava prints, vídeo e medições em
`docs/arte/a13-niveis/`. As imagens foram abertas e inspecionadas.

A próxima etapa é A10, fase 1: auditoria e proposta de layout. O redesenho
dos cenários depende da aprovação do usuário, conforme o pedido original.
