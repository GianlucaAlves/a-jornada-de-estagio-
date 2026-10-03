# v2.3 / Spec 04 — Pessoas e pequenas ações nos ambientes

**Depende:** correção de apoios da spec 01 e composição da spec 03. **Leia:** bíblia de arte §§3–6, `scripts/pixelart/cenarios.py`, `personagens.py`, `src/ui/Cena.tsx`, `src/styles/tokens.ts` e `global.css`.

## Problema

Os lugares ainda parecem montados para receber somente Ana e os NPCs clicáveis. O Cafezinho da fase 2 tem um balcão comprido e quase nenhuma ação; os escritórios têm muitas telas e poucos trabalhadores; na festa, o elenco está alinhado como uma seleção de personagens. A produção é a referência positiva: a atividade mostra a função do lugar sem pedir clique.

## Ações propostas por lugar

| Lugar e fase | Vida de fundo | Relação física exigida |
|---|---|---|
| Cafezinho B2 | Uma pessoa enche um copo na máquina; duas conversam junto a uma mesa, com gestos discretos e posições diferentes. | Copo sob a saída, braço alcança máquina; interlocutores olham um para o outro e têm pés ou assentos apoiados. Não encobrir Bianca, Rafael, notebook ou máquina clicável. |
| Escritório B1–B3 | Uma pessoa trabalha sentada em posto completo; outra cruza um corredor ao fundo ou se levanta para consultar um colega. Telas mudam apenas um detalhe reconhecível. | Pose sentada tem cadeira, mesa, teclado e mão em contato. Caminhada usa corredor livre, nunca passa através de divisória ou Ana. O primeiro dia pode ter menos atividade do que B3 sem parecer vazio. |
| Outra Área B5 | Duas pessoas trabalham em equipe em postos diferentes, com uma consulta breve a quadro ou mesa. | Grupo ajuda a distinguir a área; não invade o posto de reflexão da Ana nem a conversa com Bianca. |
| Cafezinho B6 | Pequenos grupos junto ao balcão e à mesa da festa; alguém serve café e outro conversa com copo na mão. | Festa mantém planta do Cafezinho B2; o elenco necessário para os diálogos continua identificável e clicável. |
| Linha de Produção B3 | Manter rádio e robôs da v2.2; no máximo acrescentar sinais funcionais discretos se a nova composição pedir. | O ritmo existente continua foco da cena, sem camadas competindo com os hotspots. |

Pessoas decorativas precisam de silhuetas próprias e não recebem nome/cargo do elenco fixo, retrato, falas textuais nem hotspot. O gesto deve ser lido sem balão de conversa: inclinação de cabeça, mudança de braço, copo levantado, olhar e resposta do outro. Não clonar cinco vezes a mesma pessoa de Ana. A cena congelada, inclusive com movimento reduzido ou PNG ausente, ainda mostra a ação por poses e objetos corretamente apoiados.

## Contrato de animação

Cada ação tem quadro-base completo, poses, âncora, faixa ocupada, duração e retorno sem salto. Escolher ciclos curtos e discretos, com pausas diferentes entre pessoas; a máquina responde ao gesto da pessoa, e não “serve” café sozinha. Camadas são decorativas (`aria-hidden`, sem foco, sem pointer events), ficam atrás dos protagonistas quando a perspectiva exigir e não alteram estado de jogo. CSS por quadros ou sprites em tira podem ser usados conforme a bíblia; tempos e medidas reutilizáveis vêm de tokens. Evitar atualização de React a cada quadro.

Na tela compartilhada, movimento do fundo deve ser secundário à fala. Durante diálogo, puzzle, apresentação e pausa, ações que desviem atenção podem parar em pose neutra; a pausa da reunião segue a spec 03. Testar o resultado em janela de apresentação e vídeo comprimido, porque detalhes de um pixel podem desaparecer.

## Critérios de aceite

- [ ] Cada escritório e o Cafezinho mostram pelo menos uma ação ambiental reconhecível e apoiada; B2 e B6 têm composição própria sem trocar a planta.
- [ ] Máquina, xícara, braço e copo formam um gesto coerente; as duas pessoas em conversa olham uma para a outra.
- [ ] Nenhuma pessoa decorativa parece NPC clicável, cobre o elenco principal, atravessa móvel ou rouba clique/foco.
- [ ] Em três ciclos de cada ação, ancoragem, pausa e reinício permanecem naturais; movimento reduzido e fallback estático continuam claros.
- [ ] Cenários e sprites gerados, chão reexportado, prévias por estado abertas e execução observada no navegador; typecheck e testes completos passam.
