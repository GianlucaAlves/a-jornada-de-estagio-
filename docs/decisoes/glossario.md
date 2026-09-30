# Glossário

Vocabulário compartilhado deste projeto. Existe para que "fase", "bloco",
"lugar" e "pessoa" não signifiquem coisas diferentes em conversas diferentes.

Atualizado no fim do grilling da v2. Onde a v2 mudou o sentido de um termo, o
sentido antigo fica registrado — ler só o novo esconde por que o novo existe.

## Estrutura narrativa

**Fase** — a unidade da apresentação. São **seis**, em ordem fixa: cinco
jogáveis e a sexta é o fim. Cada uma tem um tema, um apresentador humano e um
lugar de origem. No código ainda se chama `BlocoId`, agora `1|2|3|4|5|6`.

**Bloco** — sinônimo de fase. O nome sobrevive no código (`BlocoId`,
`CENAS_B1`, `blocos.ts`) porque renomear conteúdo revisado custa mais do que
entrega. Na conversa, prefira "fase".

**Laço da fase** — a fase abre e fecha no **mesmo lugar**. Dentro dela há
leva-e-traz, e o item buscado fora tem de ser usado no lugar de origem, senão a
fase não fecha onde abriu.

**Cena** — o par (lugar, fase). O Escritório existe em três cenas diferentes.

**Lugar** — um dos **cinco** espaços. Eram seis: `sala-treinamento` e
`innovation` colapsaram na Sala de Reuniões. Três estados: `silhueta`,
`destravado`, `concluido`. A navegação é livre entre os destravados — a
contenção vem do conteúdo, não de trava de clique, porque clique recusado parece
bug quando projetado.

**Cartão de transição** — a tela entre fases, com o salto temporal, o tema e
**o nome do apresentador**.

## Elenco

**Protagonista** — Ana, de apoio a projetos. Quatro sprites por estado
emocional.

**NPC** — um dos cinco personagens recorrentes (Rafael, Cláudia, Tiago, Bianca,
Marcos). Aparece com **nome e cargo**, sempre. Recorrem entre fases de propósito:
a recorrência é o mecanismo do clímax e o argumento de que rede se constrói.

**Apresentador** — um dos cinco humanos que apresentam ao vivo (Pedro, Heloisa,
João, Gianluca, Marianna), um por fase. Não são personagens do jogo; o jogo só os
conhece pelo nome no cartão de transição.

**Gancho** — qualquer coisa no jogo que dá ao apresentador deixa para falar do
tema dele: uma fala de NPC, um puzzle, uma cena. Não é um campo no código — é uma
propriedade do jogo todo.

## Progressão

**Item** — objeto na barra de itens. **Cinco**, eram oito: saíram `senha`,
`indicacao-trilha` e `projeto-entregue`, que não eram usados em lugar nenhum.

**Item tardio** — três. Sem uso aparente até a fase 6, quando viram as PORTAS do
clímax. `tardio` é metadado interno: a UI não os diferencia, porque qualquer
marcação anunciaria o clímax.

**Skill** — competência adquirida. Nove, nunca se gastam. Ficam num painel em
**acordeão**: só as conquistadas, clicáveis, a nova abre e fecha a anterior, sem
contador. Na fase 5 esse painel deixa de ser painel e passa a ser a mecânica.

**Puzzle** — minijogo. **Quatro** mecânicas em uso: `senha`, `associar`,
`sequenciar`, `estruturar`, mais `montar` que precisa passar a ser um puzzle de
fato. Cada um resolvível em menos de 40 segundos, legível sem tutorial, com saída
que reinicia e aviso quando se erra.

## Clímax

**Revelação** — na fase 6, um personagem conta como o que a Ana fez a levou até
ali, e as quatro conexões são traçadas no mapa **enquanto ele fala**. Uma por
clique do apresentador, nunca por timer. Depois corta para a festa.

**Porta** — conexão que sai de um item tardio. Apaga-se ao conectar.

**Motivo** — a quarta conexão, da skill `proatividade`. Permanece acesa quando a
barra de itens já saiu. É o que a plateia leva.

## Restrições técnicas

**Vídeo comprimido** — o público assiste por compartilhamento de tela. Origem dos
pisos duros: texto nunca abaixo de 22px, borda nunca abaixo de 3px, nada de
gradiente suave, animação de transição entre 600 e 1200ms. A taxa de quadro de
sprite é exceção registrada: 110-180ms.

**Escala 4x** — quatro pixels reais por pixel de arte, em tudo. Cena 480x270,
personagem 50x84. Retrato de rosto é arte própria, não recorte do sprite.

**Cadeia de fallback** — `Imagem.tsx` resolve em três níveis: PNG do manifest,
arte vetorial de `src/arte`, placeholder rotulado. Nunca há imagem quebrada.

## Termos que morreram na v2

**Trilha de progresso** — o mapa ia virar cinco marcos numa linha (ADR-003). Foi
revogado: o mapa continua navegável.

**Innovation (lugar)** — era um laboratório de inovação com protótipos. Virou o
nome de um **evento** que acontece na Sala de Reuniões.

**Laboratório** — virou Linha de Produção: esteiras onde rádios de telecomunicação
são montados, com robôs. Protagonismo fica físico e visível.
