# v2.3 / Spec 03 — Reunião refeita, apresentação compreensível

**Depende:** specs 01 e 02. **Leia:** `src/domain/content/bloco4.ts`, `src/ui/Cena.tsx`, `src/ui/PausaBloco4.tsx`, `scripts/pixelart/cenarios.py`, `props.py`, `docs/roteiro/04-bloco-4.md` e a bíblia de arte.

## Problema e causa confirmada

A plateia atual é um único sprite de três pessoas de costas; seus corpos formam uma faixa compacta e as cadeiras do fundo não explicam onde cada uma está sentada. A tela pequena e o projetor competem com atril, pôsteres e pessoas. Durante `b4-apresentacao`, um resumo STAR em 2×2 ocupa só 17% da largura da tela. O teste de medição da caixa de diálogo informa ainda que ela cobre **43% do hotspot da TV**. Depois, `PausaBloco4.tsx` pinta **outra mesa, outras silhuetas, outro notebook e um telão em outra posição** por cima do cenário. Isso muda a geografia da sala no meio da história e torna a ação ilegível.

## Composição nova

Desenhar primeiro uma planta simples da sala e quatro quadros do mesmo enquadramento: preparação, Ana falando, silêncio com pessoas saindo e sala quase vazia. Definir uma única frente: telão grande com conteúdo legível, Ana ao lado dele, atril ligado fisicamente a essa posição. Projetor só fica se o feixe e a tela fizerem sentido; caso contrário, usar painel eletrônico. Móveis e pôsteres secundários não competem com a linha de visão entre plateia, Ana e telão.

A plateia deve ser formada por pessoas **separadas**, com cadeira e sombra próprias e ao menos duas silhuetas/poses diferentes. Cada pessoa olha para a frente da apresentação; não há fileira colada em bloco, corpos sem pernas ou cabeças na frente do conteúdo. O número de pessoas decorativas deve caber no espaço de circulação. Marcos, Cláudia e Bianca ocupam lugares identificáveis nos momentos em que aparecem; a entrada e a saída de cada um não cria cópia pintada no cenário.

## Sequência visual obrigatória

| Estado | O que se vê | O que o controle faz |
|---|---|---|
| Preparação | Marcos fala com Ana em área lateral; plateia se acomoda; tela mostra título neutro da apresentação. | Conversa e puzzle STAR continuam obrigatórios. |
| Início | Ana chega ao atril/ponto de fala; plateia volta a atenção a ela; telão troca para o caso da conferência. | Acionar atril abre a apresentação; nenhum clique salta direto para o silêncio. |
| Apresentação | Ana fala de situação, responsabilidade, ação e resultado; o telão mostra cada informação em ordem ou em quatro campos grandes, com título, texto curto e contraste de UI. Uma pessoa da plateia pode anotar; ninguém desaparece. | Avanço manual, suficiente para quem apresenta ler e comentar. Resumo e fala correspondem ao puzzle resolvido, sem métrica inventada. |
| Fim da fala | Ana termina e olha para a sala; conteúdo permanece no mesmo telão. | Clique explícito conclui a apresentação e inicia a pausa. |
| Silêncio | No **mesmo fundo e mesmas coordenadas**, uma pessoa se levanta, outra guarda o material, Cláudia sai e as cadeiras ficam vazias. Ana permanece no lugar, esperando. | Seguir a duração e o avanço manual existentes; sem texto, som, prêmio ou comemoração durante a pausa. |
| Depois | Sala mostra as cadeiras desocupadas e o telão ainda aceso; Cláudia e Bianca entram conforme seus diálogos. | Hotspots de fechamento aparecem na ordem do conteúdo. |

Substituir a composição paralela de `PausaBloco4.tsx` por camadas/estados derivados do mesmo cenário da reunião. Coordenadas, z-order e sprites devem vir de um contrato compartilhado; a transição entre `Cena` e pausa não troca mesa, luz, tela ou escala de Ana. A saída da plateia precisa ser movimento ou mudança de pose com trajetória legível; sumiço simultâneo por opacidade não basta. Se a animação reduzida estiver ativa, usar quadros estáticos sucessivos compreensíveis e manter o controle de avanço.

O telão deve ser grande o suficiente para texto com piso de 22 px de `tokens.ts` e bordas de ao menos 3 px. Evitar quatro blocos espremidos dentro dos 17% atuais. A caixa de diálogo não pode cobrir o resumo que a fala pede para acompanhar; reposicionar a caixa ou a apresentação conforme a nova planta. Usar uma linha visual única entre a fala correspondente, a área destacada no telão e a reação da sala. A pessoa que assiste precisa reconhecer “Ana está apresentando a melhoria na passagem de turno” antes de ler a caixa de diálogo.

## Persistência e apresentação ao vivo

Preservar STAR, Marcos, LinkedIn como dica, recompensa tardia e ordem do conteúdo. Testar salvar/recarregar antes do atril, no meio da apresentação, durante a pausa e depois dela: ninguém reaparece indevidamente e o crachá não é duplicado. Duplo-clique não pula estado. Hotspots mantêm alvos largos e respostas para portas bloqueadas. `prefers-reduced-motion` conserva todos os beats essenciais.

## Critérios de aceite

- [ ] Planta e quatro quadros de storyboard aprovados pela leitura visual: uma pessoa sem contexto aponta Ana, telão, plateia e o que está sendo mostrado.
- [ ] Plateia é composta por pessoas e cadeiras distinguíveis, sentadas em direção ao telão, com pernas/base coerentes e espaço de circulação.
- [ ] Telão e fala têm texto curto, legível em Teams comprimido; STAR aparece como contribuição concreta da Ana.
- [ ] A caixa de diálogo não encobre o conteúdo necessário do telão; o teste de interceptação e uma captura real confirmam.
- [ ] A passagem da apresentação para o silêncio mantém cenário, escala, telão, Ana e cadeiras nos mesmos lugares.
- [ ] Saída da plateia acontece em passos reconhecíveis; sala posterior mantém as cadeiras vazias, sem reaparecimento.
- [ ] Execução inteira assistida em navegador com movimento normal e reduzido, incluindo duplo-clique e recarga em cada estado.
- [ ] Roteiro, testes de fluxo, chão, prévias e ADR atualizados; typecheck e suíte completa verdes.
