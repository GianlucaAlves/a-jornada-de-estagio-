# Spec 07 — Ajustes narrativos e revelação

## Objetivo

Alinhar as falas das fases 1–6 com os temas de networking, visibilidade e escolha
de carreira; simplificar a interação da fase 4; e fechar a história com uma
revelação consistente com a escolha de carreira de Ana e a efetivação no time
de desenvolvimento de software.

## Critérios de aceite

1. Na fase 1, Rafael quebra o gelo com humor de reunião, sem piada sobre senha,
   e troca contato com Ana pelo Teams. As falas finais da fase 1 conectam
   nervosismo, timidez e construção de relações no trabalho.
2. Pegar o relatório na fase 3 não abre mensagem redundante. Entregá-lo à
   Cláudia não o consome: ele continua disponível como registro da iniciativa.
3. Ao trocar de fase, o cartão cobre a transição sem renderizar o PNG do cenário
   seguinte antes da chegada ao mapa.
4. Na fase 4, a ordem é Marcos → TV/puzzle → apresentação automática de Ana →
   Cláudia. A plateia permanece visível como parte do cenário, sem ser clicável
   nem necessária para avançar. Não há clique no atril ou conversa posterior com Bianca.
   Não há pausa/pose de apresentação. Cláudia relaciona a apresentação a novas
   oportunidades e recomenda publicar uma versão segura no LinkedIn.
5. A fase 5 aparece como “Engenharia” no mapa, mantendo o identificador salvo
   `outra-area`. Ao concluir a conversa com Bianca, Ana escolhe explorar
   desenvolvimento de software e define estudo e projetos pequenos como começo.
   Bianca reconhece que Ana aprendeu, entregou e tomou iniciativa; deixa claro
   que a falta de vaga depende do espaço no time, não de uma falha dela, e que
   conhecimento e experiência permanecem com ela. Ana recebe o item “Plano de
   carreira”.
6. A reflexão final começa com a efetivação confirmada no time de desenvolvimento de software.
   Ana explica por que escolheu desenvolvimento e que pretende aprender como os
   sistemas do time se conectam, começando por projetos pequenos.
   A pergunta de encerramento é “O que me trouxe até aqui?”.
7. A fase 6 explica que uma vaga abriu no time de desenvolvimento de software e a apresentação
   tornou visível a forma de pensar e trabalhar de Ana, fazendo seu nome chegar
   ao time. A revelação final tem cinco conexões: contato Teams, certificado, crachá,
   plano de carreira e relatório. As quatro conexões de itens tardios se consomem; o relatório
   permanece como evidência. Sua descrição deixa explícitos iniciativa e
   protagonismo.
8. Os cinco itens cabem na barra de inventário e na animação da revelação, com
   rótulos legíveis e origem animada alinhada ao ícone.

## Verificação

- `npm run typecheck`
- `npm test`
- Verificação de geometria dos cards e cinco slots em `Revelacao.test.ts`.
- Fluxo da fase 4 e estado preservado do relatório em `jogo.test.ts`.
