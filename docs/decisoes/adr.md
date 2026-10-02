# Registro de decisões (ADR)

Log enxuto, em ordem cronológica. Cada entrada diz o que foi decidido, o que
foi descartado e a consequência. Escrito durante o grilling da v2.

---

## ADR-001 — Os cinco nomes são apenas apresentadores

**Decisão.** Pedro, Heloisa, João, Gianluca e Marianna são os cinco humanos que
apresentam ao vivo, um por fase. Eles **não** são personagens do jogo. O elenco
de NPCs é decisão separada.

**Descartado.** Fazer cada apresentador ser também o NPC da sua fase. Era
sedutor — a plateia veria gente real dizendo "isso aconteceu comigo" — mas
acoplava o conteúdo às pessoas que apresentam, e a atribuição de temas a
pessoas foi declarada não-fixa.

**Consequência boa e inesperada.** A proposta original dizia "cada fase uma
pessoa", o que ameaçava o clímax: `cartao-rafael` só paga no Bloco 5 porque o
Rafael foi conhecido no Bloco 1, e elenco de uso único quebraria isso. Como os
cinco nomes são apresentadores, **o elenco recorrente sobrevive intacto** e o
clímax não precisa ser redesenhado.

---

## ADR-002 — A Ana trabalha em apoio a projetos

**Decisão.** Área nomeada e universal: apoio a projetos / PMO júnior. O foco da
apresentação é ser estagiário e as atitudes que dão sucesso em qualquer área —
não um nicho.

**Descartado.** Não nomear área nenhuma ("o projeto", "o time"): parecia
elegante e é armadilha, porque história sem lugar concreto fica genérica no mau
sentido e a plateia perde o chão. As referências de point-and-click funcionam
porque o lugar é específico. Também descartado escolher a área na abertura:
multiplica o conteúdo e triplica o ensaio, para uma apresentação que acontece
uma vez.

**Consequência.** Tarefas que qualquer estagiário reconhece — planilha errada,
reunião sem pauta, relatório que ninguém leu — mantendo textura específica.
Todo vocabulário de tecnologia sai: `DT7 / Data & Transformation`,
`Engenharia de Dados`, logs, retry, timeout, fila de integração, Git.

---

## ADR-003 — O mapa deixa de ser navegação e passa a ser trilha

> **REVOGADO pelo ADR-021.** Mantido no registro porque a revogação explica
> melhor o desenho final do que o desenho final sozinho.

**Decisão.** A história é linear. O mapa hub-and-spoke vira indicador de
progresso: cinco marcos numa linha, o atual aceso. No clímax, as quatro
conexões são traçadas sobre a trilha.

**Descartado.** Matar o mapa — obrigaria a inventar palco novo para o momento
de maior valor emocional do projeto. E manter navegação com um lugar liberado
por vez: paga o custo do mapa e entrega ilusão de escolha, que é pior que não
ter escolha.

**Consequência.** `EstadoLugar` ('silhueta' | 'destravado' | 'concluido')
sobrevive com sentido novo: é progresso, não descoberta. `Mapa.tsx` e
`Mapa.geometria.test.ts` mudam de propósito. `voltarAoMapa` perde razão de ser
como saída de cena e precisa de outro desenho.

---

## ADR-004 — As mecânicas de puzzle ficam; o recheio é reescrito

**Decisão.** As quatro mecânicas aprovadas — `senha` (social: cada pessoa tem
um pedaço), `associar` (ligar frase a frase), `sequenciar` (ordenar),
`estruturar` (problema/solução/impacto) — permanecem. O recheio é trocado por
conteúdo universal.

**Requisito novo.** Cada puzzle tem de servir de **gancho** para o apresentador
daquela fase abordar o tema dele. O puzzle não é entretenimento: é o trampolim
da fala.

**Consequência.** Mecânica já foi escolhida para ser metáfora do tema e
resolvível em menos de 40s sem tutorial — isso é o caro e está testado. Recheio
é texto. Bônus: `sequenciar` com passos de um processo fica mais legível para
plateia mista do que com linhas de log.

**Em aberto.** O quinto puzzle, `montar`, não entrou na lista de aprovados, mas
é estrutural: destrava o hotspot `entrega` e monta a PAUSA do Bloco 4.

---

## ADR-005 — Degreed e Percipio entram na fase 2

**Decisão.** As plataformas de desenvolvimento da Ericsson (Degreed e Percipio)
são conteúdo da fase 2, a da Heloisa, junto com aprendizado contínuo e
planejamento. Não haverá tela de finalização só para elas.

**Correção de fato.** O código escreve `Degree`; a plataforma é **Degreed**.
Corrigir em `puzzles.ts`, `base.ts` e nos roteiros.

**Descartado.** Tela nova depois da revelação. E o outro tema que a proposta
punha na finalização — "responsabilidade e atitude mesmo que não tenha sido
solicitado" — **não** vira conteúdo de fecho: é exatamente a tese que o clímax
já entrega pela skill `proatividade`, a única que permanece acesa quando todo o
resto se apaga. Repetir em texto depois enfraquece.

**Consequência.** A fase 2 passa a carregar dois assuntos (aprendizado contínuo
e planejamento), o que pode exigir dois ganchos em vez de um.

---

## ADR-006 — NPC passa a exibir cargo junto do nome

**Decisão.** Todo NPC mostra nome **e** cargo, para a plateia saber na hora quem
é aquela pessoa e por que ela importa. Os cinco nomes atuais ficam: nenhum
colide com os cinco apresentadores.

**Consequência.** `NpcId` ganha um registro de perfil com nome e cargo, e a
linha de nome do rodapé (§7.2 da bíblia) passa a exibir os dois.

---

## ADR-007 — `sequenciar` muda da fase 3 para a fase 2

**Decisão.** O puzzle de ordenação sai do Bloco 3 e vai para o Bloco 2, com
recheio de priorização: ordenar a semana por impacto no trabalho do time.

**Por quê.** A Heloisa passou a ter dois assuntos (aprendizado contínuo e
planejamento) e "priorizar por impacto no time" é literalmente um problema de
ordenação. Resolve dois problemas de uma vez: dá um gancho por assunto a ela e
desinfla o Bloco 3, que hoje carrega dois puzzles seguidos e é o mais longo.

**Consequência.** Bloco 2 fica com `associar` + `sequenciar`; Bloco 3 fica só
com `estruturar`. O terceiro pilar da Heloisa — negociar prazo quando cai uma
demanda e há prova na faculdade — é o material mais universal da proposta e
entra como gancho de fala do `sequenciar`, não como puzzle próprio.

---

## ADR-008 — O gancho de fala NÃO vira artefato do produto

**Decisão.** Os ganchos continuam onde estão: nos roteiros em markdown e no
roteiro pessoal de cada apresentador. O jogo não ganha campo tipado de gancho,
nem painel de apresentador, nem roteiro de bolso gerado.

**Por quê (nas palavras do dono).** "Os ganchos são o jogo naturalmente." O jogo
inteiro existe para fornecer ganchos: uma fala de NPC é gancho, um puzzle é
gancho. Formalizar em campo seria transformar em dado uma propriedade que é do
jogo todo.

**Descartado.** Um painel de cola na tela — armadilha que eu quase recomendei:
em compartilhamento de tela não existe tela privada, e a plateia veria a cola.

---

## ADR-009 — O Laboratório vira Linha de Produção

**Decisão.** O lugar do Bloco 3 passa a ser a linha de produção da Ericsson:
esteiras onde rádios de telecomunicação são montados passando por processos ao
longo do caminho, com robôs participando. Altamente tecnológico e, segundo o
dono, parecido com um laboratório de fato.

**Por quê.** O tema do bloco é protagonismo, e aqui ele fica físico e visível:
o estagiário **vê algo que pode ser otimizado na linha** e age sem ninguém
pedir. Uma esteira em que um passo é mais lento que os outros é compreensível
para plateia de qualquer área — ao contrário de log com timeout e retry, que
exigia vocabulário.

**Descartado.** Re-tematizar para Arquivo (minha recomendação). Era mais barato
de arte, mas trocava o concreto pelo genérico: a linha de produção é o que a
Ericsson faz, e ancorar o protagonismo no produto real da empresa vale mais que
economia de props.

**Consequência.** Cenário novo (esteira, rádio em montagem, robô, painel de
processo) em vez de re-skin. `LugarId` muda de `laboratorio` para
`linha-producao`, e com ele manifest, arte, chao.json e conteúdo.

---

## ADR-010 — `montar` fica, mas precisa passar a ser um puzzle

**Decisão.** A mecânica de montar fica, com recheio universal: as quatro peças
montam o resumo de uma página que vai ao gestor.

**Fato que a auditoria revelou.** Hoje `montar` não é um puzzle: `PuzzleMontar`
não tem gabarito e `clicarEspaco` aceita qualquer peça em qualquer espaço, sem
comparação. O comentário do próprio arquivo admite "Não existe encaixe errado".
Os quatro alvos são retângulos tracejados cujo único texto é `aria-label`, e o
núcleo do diagrama é um `<rect>` sem texto. Não havia o que entender ali.

**Consequência.** Não é ajuste de texto: `montar` precisa de gabarito, de rótulo
visível em cada alvo e de estado de erro.

---

## ADR-011 — Sair do puzzle reinicia o puzzle; errar avisa

**Decisão.** O puzzle ganha botão de voltar. Sair **reinicia** o puzzle — o
progresso parcial não é preservado. Reabrir é permitido. E errar passa a avisar,
com uma linha curta e sem julgamento por puzzle.

**Correção de corretude que vem junto.** `abrirPuzzle` hoje escreve `liberado`
sem olhar o estado atual, e é por isso que todo hotspot que abre puzzle precisou
ser `umaVezSo`: reclicar rebaixaria um puzzle já `resolvido` e desarmaria a porta
seguinte. Passa a só escrever `liberado` quando o estado não é `resolvido`. Sem
isso, um botão de voltar órfã hotspots para sempre — no `sequenciar` seriam
cinco, e o bloco nunca emitiria `blocoConcluido`.

**Por quê avisar do erro.** Silêncio ao vivo faz o apresentador explicar o que
não devia ("acho que não foi isso, deixa eu tentar"). E se o jogo for
distribuído, quem joga sozinho não tem ninguém para dizer isso.

**Vem junto.** Três puzzles têm clique morto com cursor de mão — botão
`disabled` ainda exibindo `cursor: pointer`, o que numa apresentação parece
travamento.

---

## ADR-012 — O retrato do diálogo é só o rosto

**Decisão.** A caixa de diálogo encolhe, e o retrato passa a ser só o **rosto**
do personagem em vez do corpo inteiro.

**Fato que motivou.** A caixa ocupa hoje 1376×340 px — 22,6% do canvas, opaca —
e intercepta 22 dos 24 hotspots do jogo. Sete ficam 100% cobertos. Ela cobre
justamente quem está falando: Bianca 80%, Rafael 75%, Cláudia 73%.

**Descartado.** Remover o retrato (minha recomendação) e balão junto do
personagem. O balão foi descartado por motivo de apresentação ao vivo: posição
variável faz o apresentador não saber onde o texto vai nascer, e a plateia
procurar.

**Consequência de arte.** Retrato de rosto não é recorte do sprite: a cabeça
ocupa 15×20 px de arte na grade de 50×84, e ampliar isso para tamanho de retrato
daria blocos de 10px fora da grade. Precisa de arte própria, desenhada na mesma
escala 4x numa grade maior de rosto. Nove retratos: 5 NPCs + 4 estados da Ana.

---

## ADR-013 — A descrição de item se fecha

**Decisão.** Clicar no mesmo item fecha; clicar em outra coisa fecha; e fecha
sozinha depois de alguns segundos. Sem botão X — alvo pequeno ao vivo é
armadilha.

**Fato.** `descricaoDe` (`BarraDeItens.tsx:39`) é estado local, escrito num
lugar e apagado só quando o item sai da barra. Sobrevive a troca de cena, ida ao
mapa, diálogo e puzzle — o bloco inteiro. Como fica em `zIndex 20` contra o
diálogo em 30, ela se esconde durante a fala e **reaparece** depois, que é o que
dá a sensação de ter grudado.

---

## ADR-014 — Menos itens; o item `senha` sai

**Decisão.** O inventário diminui. O item `senha` é removido: a senha é digitada
pela pessoa, então guardar um item que representa a senha e nunca usá-lo é
ruído.

**Fato levantado.** Três dos oito itens não são usados em lugar nenhum:
`senha`, `indicacao-trilha` e `projeto-entregue`. Dois são usados de verdade no
meio do jogo: `anotacoes-treinamento` (destrava o monitor do Bloco 3 e é
consumida) e `relatorio` (entregue à Cláudia). Os três tardios
(`cartao-rafael`, `certificado-degree`, `cracha-innovation`) são as portas do
clímax — neles "sem uso aparente" é o desenho, e o `cartao-rafael` ainda tem um
uso intermediário no Bloco 2.

---

## ADR-015 — Cargo aparece em toda ocorrência do nome

**Decisão.** Sempre que o nome de um NPC aparece — linha de foco no rodapé,
caixa de diálogo, qualquer lugar — o cargo vem junto.

**Restrição de redação.** Cargo aqui é função, não título de RH. "Líder do
time" comunica; "Gerente de Operações Sênior" é ruído.

---

## ADR-016 — Diálogo pode ser relido

**Decisão.** Clicar de novo num NPC repete o diálogo dele.

**Por quê.** Conserta uma classe de problema, não um caso. Hoje qualquer fala
perdida é perdida para sempre. O caso mais grave é a senha: as três pistas
(`ERI`, `DT7`, `01`) só existem nas falas, e quem não decorou não tem como
resolver. Com o jogo no ar para qualquer pessoa acessar, não há apresentador
para relembrar.

**Descartado.** Repetir as pistas dentro da tela do puzzle. Era a rede de
segurança que eu recomendei junto; o dono preferiu só a releitura.

**Risco residual aceito.** Para montar a senha a pessoa precisa reabrir três
diálogos e reler. É tedioso, mas é solúvel — e as pistas são literais nas
falas.

---

## ADR-017 — Cinco itens, e a quarta porta do clímax NÃO é item

**Decisão.** `indicacao-trilha` e `projeto-entregue` são cortados, junto do
`senha`. Ficam cinco: `anotacoes-treinamento` e `relatorio` (uso no meio do
jogo), e `cartao-rafael`, `certificado-degree`, `cracha-innovation` (as três
portas do clímax).

**Descartado, e o motivo importa.** Promover `projeto-entregue` a quarta porta
do clímax. Parecia elegante e destruiria a tese: a quarta conexão é a skill
`proatividade`, a única que **não** se apaga, e é o que sobra na tela quando a
barra de itens sai. Se a quarta porta fosse um item, a mensagem passaria a ser
"o que importa é o que você entrega" — quando o projeto inteiro argumenta que é
o que você se tornou.

---

## ADR-018 — Progresso salvo, com escolha na abertura

**Decisão.** O estado é salvo no navegador (bloco, tela, itens, skills, lugares,
puzzles), gravado a cada mudança. Na abertura, se houver progresso salvo, o jogo
oferece "Continuar" ou "Começar do início".

**Por quê a escolha explícita.** O pior defeito possível numa apresentação ao
vivo é abrir o jogo e ele começar no Bloco 4 por causa de um save do ensaio de
ontem. Retomada silenciosa é rápida e indefensável. A escolha na abertura também
é o caminho de reinício durante a apresentação: F5 leva à escolha.

**Consequência.** `reiniciar()` existe na store e hoje é código morto — nenhum
componente a chama. Passa a ser acionada pela tela de abertura.

---

## ADR-019 — Publicação na Vercel, sem mudança de produto

**Decisão.** O jogo será publicado na Vercel para acesso livre. Isso **não**
muda o desenho: continua sendo uma apresentação guiada, cujos ganchos são a fala
do apresentador.

**Consequência aceita.** Quem jogar sozinho recebe a história da Ana, não o
conselho de carreira. Foi decidido conscientemente: absorver a fala do
apresentador na narração engordaria a versão ao vivo, onde ele passaria a ler
junto com a tela.

**Verificado.** `npm run build` passa e a arte chega em
`dist/assets/{cenarios,itens,mapa,npcs,objetos,protagonista}`, sem colidir com o
bundle em `dist/assets/index-*.js`. Os caminhos absolutos do manifest
(`/assets/...`) funcionam em deploy na raiz do domínio.

---

## ADR-020 — Painel de skills em acordeão, sem contador

**Decisão.** Só as skills conquistadas aparecem. Cada uma é clicável para abrir
e fechar. A recém-conquistada abre sozinha e fecha a anterior.

**Descartado.** Mostrar as nove desde o começo, mesmo em silhueta, e exibir
contador "4 de 9". Os dois revelam o tamanho do caminho: a plateia passa a
contar quantas faltam em vez de acompanhar, e o clímax depende de a acumulação
parecer conquistada, não preenchida.

---

## ADR-021 — Linear entre fases, hub dentro da fase, e a fase é um laço

**Revoga o ADR-003**, que mandava o mapa virar trilha de progresso.

**Decisão.** A ordem das cinco fases é fixa — é isso que "linear" significa
aqui. Dentro de uma fase há leva-e-traz, e a fase **começa e termina no mesmo
lugar**.

**A navegação NÃO é restrita à fase.** Correção sobre a primeira redação deste
ADR: o mapa continua exatamente como é hoje. Lugares começam bloqueados e vão
sendo destravados, e a partir daí a pessoa pode ir para onde quiser — mas *não
vai ter nada para fazer* se não for onde a fase pede naquele momento. A contenção
vem do conteúdo, não de trava de navegação, e isso é melhor: não existe clique
recusado, que é o que parece bug quando projetado.

**O exemplo que fechou a decisão**, nas palavras do dono: a fase 3 começa na
linha de produção, onde a protagonista vê uma oportunidade de contribuir que
ninguém pediu; para agir ela vai ao escritório falar com alguém e pegar um item;
e volta à produção para usá-lo.

**Por quê isto é melhor que os dois extremos.** Linearidade total tirava do
apresentador o controle do ritmo e matava o palco do clímax. Hub-and-spoke
aberto deixava quem apresenta se perder ao vivo entre seis lugares. Restringir o
hub aos lugares da fase reduz a superfície de erro para dois ou três lugares, e
o laço (sair e voltar) dá forma fechada a cada fase.

**Consequências.** `Mapa.tsx`, `voltarAoMapa` e `EstadoLugar` sobrevivem com o
sentido original. A ideia de trilha morre. O clímax continua sendo traçado sobre
o mapa. E o grafo de itens de cada fase passa a ter uma restrição nova: o item
buscado fora tem de ser **usado** no lugar de origem, senão a fase não fecha
onde abriu.

---

## ADR-022 — O Escritório continua recorrendo nas fases 1, 3 e 5

**Decisão.** O mesmo cenário é reusado em três fases.

**Por quê.** É a coisa mais barata e mais eficaz do projeto: zero arte nova, e
entrega o argumento visual de que a pessoa mudou e o lugar não. O roteiro da
fase 5 já explora isso deliberadamente — *"Mesma cadeira. Mesmo notebook. Mesma
tela de login que ela não sabia abrir."* É o único momento em que a apresentação
compara começo e fim usando a própria imagem.

---

## ADR-023 — O certificado especifica esforço, não matéria

**Decisão.** O item tardio da porta "competência" deixa de nomear curso e
plataforma. Passa a ser: *"Certificado de conclusão — 40 horas, fora do horário
de trabalho."* A conexão do clímax vira: *"A vaga pedia alguém disposto a
aprender o que ainda não sabia. Ela tinha quarenta horas que ninguém mandou
fazer."*

**Por quê a troca funciona e não é só generalização.** A força da versão antiga
vinha da especificidade — *"A vaga pede Arquitetura de Sistemas. Ela concluiu há
um ano e sete meses"* — e tirar o nome do curso destruiria isso se não houvesse
troca de eixo. Então o eixo trocou: de **o que** ela estudou para **quanto, e por
conta de quem**. É universal, é crível como exigência de vaga, e argumenta
melhor: a tese não é que ela sabia uma matéria, é que ela investiu em si mesma.
E passa a rimar com a quarta conexão, a da proatividade.

**Nota.** Degreed e Percipio continuam nomeados na fase 2 (ADR-005). O que não
se nomeia é o curso do certificado do clímax.

---

## ADR-024 — Seis fases: cinco jogáveis e a sexta é o fim

**Decisão.** O jogo passa a ter seis fases. As cinco primeiras são jogáveis. A
sexta é o fim: acontece a efetivação e vê-se o final, com interação mínima.

**O que isso muda em relação ao que existe.** Hoje `BlocoId = 1|2|3|4|5` e o
Bloco 5 **é** o clímax — notebook, mensagem, revelação, perguntas finais. Com a
sexta fase, o clímax migra para ela, e a fase 5 passa a ser uma fase jogável
nova, com o tema da Marianna: competências, área de estudo da faculdade, e a
pergunta "esse caminho é realmente pra mim?".

**Consequências.** `BlocoId` ganha o 6. `CARTOES` ganha um sexto cartão de
transição. `blocos.ts` ganha um sexto `estadoAssumido`. E abre-se um vão: os
quatro puzzles estão em f1 (`senha`), f2 (`associar` + `sequenciar`), f3
(`estruturar`) e f4 (`montar`) — a fase 5 nasce sem puzzle.

---

## ADR-025 — Os laços de cada fase

**Decisão.** Cada fase abre e fecha no mesmo lugar.

| Fase | Tema | Laço |
|---|---|---|
| 1 | timidez, insegurança | Escritório (um lugar só) |
| 2 | aprendizado contínuo, planejamento | Cafezinho → Sala de Treinamento → Cafezinho |
| 3 | protagonismo | Linha de Produção → Escritório → Linha de Produção |
| 4 | saber se vender | Innovation e Sala de Reuniões |
| 5 | competências, faculdade | a definir |
| 6 | efetivação, fim | Escritório |

**O Innovation migra da fase 3 para a fase 4.** Ele serve o tema do "saber se
vender" diretamente — é um evento de exposição — desafoga a fase 3, que era a
mais carregada, e faz o `cracha-innovation` ser obtido na fase da visibilidade,
o que deixa a porta do clímax contando uma história mais limpa.

**Correção que a fase 3 exigia.** Hoje o `relatorio` é concedido na produção e
entregue à Cláudia no escritório, então a fase termina onde não começou. Inverte:
a produção é origem e destino, e o escritório é a ida.

**Origem da fase 4: Sala de Reuniões.** A PAUSA — o silêncio projetado depois da
entrega — é o fecho da fase, e ela só funciona caindo no lugar de origem. Um
laço terminando no Innovation faria o silêncio cair num ambiente de evento e de
gente, que é o pior lugar possível para silêncio funcionar.

---

## ADR-026 — Innovation Week é evento, não laboratório

**Correção de fato do dono.** "Innovation Week é apenas o nome do evento onde os
estagiários apresentam as coisas que fizeram que geraram impactos positivos."

**Decisão que veio depois, e que substitui a primeira leitura deste ADR:**
`sala-reunioes`, `sala-treinamento` e Innovation Week passam a ser **o mesmo
lugar e a mesma fase** — a fase 4. Não são três espaços: são três nomes para
onde a apresentação da estagiária acontece.

**Consequência no mundo.** O jogo tinha seis lugares e passa a ter cinco:
Escritório, Cafezinho, Linha de Produção, o lugar unificado da fase 4, e o lugar
novo da fase 5. `LugarId` muda, e com ele manifest, arte, `chao.json`,
`LUGARES` e as coordenadas de todo o conteúdo.

**Descartado.** Manter o Innovation como auditório próprio (cenário novo do
zero) e fazer o evento na Sala de Reuniões mantendo os dois separados.


---

## ADR-027 — Bianca é a voz do pivô, e volta na fase 5

**Decisão.** A Bianca aparece na fase 2 e **retorna na fase 5** para falar sobre
mudar de carreira.

**O achado que fundamenta.** Ela já é essa personagem no conteúdo existente:
*"Eu faço documentação técnica e desenho de API. Sou formada em Letras"*
(`bloco2.ts:125`), e o roteiro de fundamentos a descreve como quem veio de outra
área completamente e migrou. Ela também já é "o coração do Bloco 2".

**Por quê isso é estruturalmente bom.** As duas aparições dela viram as pontas
do arco de aprendizado: na fase 2 ela diz como estudar, na fase 5 ela diz que
está tudo bem se o caminho mudar. Mesma voz, e a segunda fala só tem peso porque
a primeira existiu.

**E é a única exceção ao expurgo de vocabulário técnico.** "Formada em Letras,
trabalha com tecnologia" é a frase mais anti-nicho que este projeto pode dizer, e
ela depende do contraste entre as duas áreas. O ADR-002 tira tecnologia do
domínio da Ana; aqui ela permanece de propósito, como destino de outra pessoa.

---

## ADR-028 — A fase 5 é reflexão sob incerteza, não anúncio de fracasso

**Correção do dono sobre uma premissa que eu havia inflado.** A fase 5 **não**
diz que ela pode não ser efetivada. Ela simplesmente **não sabe** — e por não
saber, poderia ser que não fosse. A reflexão é sobre o que sobra de qualquer
jeito: a experiência adquirida na jornada é o que mais importa.

**Consequência.** Não existe a contradição que eu tinha levantado entre a fase 5
e o final feliz da fase 6, porque a fase 5 nunca afirma o desfecho. O tom é
insegurança **com** orgulho do que foi construído, não consolo antecipado.

**O que a fase 5 carrega.** Como foi esse tempo de estágio; se é essa a carreira
que ela quer seguir; que dá para pivotar, e que pivotar não é erro — esta última
pela voz da Bianca (ADR-027).

**Lugar.** Ambiente estilo escritório, mas **diferente** do Escritório da fase 1.
Descartado o Cafezinho, que era minha proposta.

---

## ADR-029 — A fase 6 abre com a notícia e corta para a festa

**Decisão.** A ordem da fase 6 é: cartão de transição com o salto de tempo → uma
tela com um personagem dando a notícia da efetivação → corte para todo o elenco
comemorando no Cafezinho. Quando a pessoa entra na fase, a festa **já está
acontecendo**.

**Descartado.** Minha recomendação de pôr a festa no meio e as quatro conexões
como imagem final. O argumento era que a última coisa na tela é a que a plateia
leva para a segunda-feira; o dono preferiu a notícia na frente e a festa como
destino.

**Perda declarada.** O retorno ao Escritório do primeiro dia — *"mesma cadeira,
mesmo notebook, mesma tela de login que ela não sabia abrir"* — sai do clímax. Era
o único momento em que a apresentação comparava começo e fim pela própria imagem.
A festa ganha em calor e o espelho se perde.

---

## ADR-030 — As quatro conexões são traçadas enquanto o personagem fala

**Decisão.** Na fase 6, o personagem que conversa com a Ana conta como as coisas
que ela fez a levaram até aquele momento, **conectando tudo** — e as quatro
conexões são desenhadas no mapa durante essa fala. Depois corta para a festa.

**Por quê isto resolve.** A palavra "revelação" estava juntando duas coisas: a
notícia da efetivação e a sequência das quatro conexões (três portas mais a skill
`proatividade`). Com esta decisão a notícia e o porquê acontecem no mesmo
momento: cada conexão é uma razão, dita e desenhada ao mesmo tempo. A festa vira
consequência, não explicação.

**Descartado.** Pôr as conexões depois da festa (minha recomendação — a última
imagem é a que a plateia leva) e tirá-las do jogo deixando o apresentador
explicar de viva voz. A segunda jogaria fora a única coisa no jogo que argumenta
visualmente.

---

## ADR-031 — A fase 5 acontece em outra área da empresa

**Decisão.** O lugar da fase 5 é **outra área da empresa**: andar diferente,
baias de outro time, luz diferente. A Ana está ali porque foi conversar com
alguém de fora do time dela — a Bianca.

**Descartado.** A mesa dela depois do horário, esvaziada (minha recomendação, mais
barata de arte). E o Cafezinho.

**Consequência.** É cenário novo de verdade, não re-vestimenta do Escritório. Em
troca, dá o motivo da cena de graça: ela **se deslocou** para ter aquela
conversa, o que já diz que a conversa importava.

---

## ADR-032 — O laço da fase 2 é Cafezinho → Escritório → Cafezinho

**Decisão.** A Heloisa recebe a dica no Cafezinho, a Ana vai trabalhar no próprio
posto no Escritório, e volta ao Cafezinho para fechar a fase.

**Por quê.** Quando a Sala de Treinamento foi absorvida pela fase 4 (ADR-026), o
laço proposto para a fase 2 perdeu o destino. Dois puzzles no mesmo cenário
fariam a fase mais carregada do jogo parecer longa e parada. O deslocamento
quebra o ritmo sem custar arte, e está narrativamente certo: conselho se recebe
no café, trabalho se faz na mesa.

---

## ADR-033 — As cenas v2.2 mostram apoio, sequência e trabalho em andamento

**Decisão.** As cenas revisadas combinam composição de cenário e conteúdo
interativo: os objetos ocupam superfícies compatíveis, o elenco entra quando a
sequência narrativa pede e as camadas de ambiente são integradas pela UI. Na
fase 3, rádios atravessam a esteira enquanto dois braços alternam repouso e
alcance. Na fase 4, a plateia ocupa a sala antes da apresentação e sai quando a
pausa começa.

**Apresentação.** Marcos prepara Ana sobre clareza, STAR e compartilhamento
público no LinkedIn. O puzzle usa Situação, Tarefa, Ação e Resultado; ao
concluir, Ana apresenta com o resumo visível na tela e o clique final inicia a
pausa.

**Fase 5.** Bianca conversa com Ana na chegada sobre o contrato que termina e o
desejo de efetivação. Depois de rever o caderno e a grade, a conversa final
separa a possibilidade de uma vaga da escolha de área. Mudar de carreira é
apresentado como caminho legítimo; a falta hipotética de vaga não apaga o que
Ana aprendeu e entregou.

O caderno abre a última skill no painel e inicia a retrospectiva; antes desse
gesto, as descrições ficam recolhidas para que a interação tenha um começo claro.

**Fecho visual.** A abertura e as perguntas finais usam o Escritório como fundo
e uma pose de Ana trabalhando. As perguntas mantêm os temas de visibilidade,
direção de carreira e fatores fora do controle individual.

**Verificação.** Typecheck, suíte completa, exportação de chão e prévias de
cena foram executados. O ciclo animado e as transições precisam de conferência
no navegador, pois as prévias do pipeline são estáticas.








