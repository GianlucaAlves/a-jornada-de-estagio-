# A Jornada do Estágio — contexto integral para análise

Capturado em 4 de outubro de 2026, em 1920 × 1080. Este pacote contém a versão local atual, incluindo alterações ainda não commitadas.

## Como usar este pacote

Leia este guia e abra `galeria.html` para percorrer os prints. `indice.json` relaciona arquivo, legenda e estado. `conteudo-integral.json` contém o conteúdo tipado exportado em JSON. As imagens estão em `prints/`.

## Proposta e restrições

Uma apresentação corporativa ao vivo, compartilhada pelo Teams, usa um jogo point-and-click como fio narrativo. O apresentador controla os cliques; o público acompanha a evolução da estagiária Ana. Pixel art, contraste alto, texto grande e alvos largos atendem à compressão de vídeo e à pressão de uma apresentação ao vivo. Os cartões fazem a passagem entre cinco apresentadores; a sexta fase é o encerramento. A barra distingue objetos carregados de habilidades aprendidas. A tese visual do final é que objetos são usados e deixam de ocupar a barra, enquanto competências ficam com Ana.

## Método de captura e limites

As telas são renderizações reais no Chromium, sem montagens de UI. O script entra em fases e posiciona diálogos pela store de ensaio para registrar cada fala, sem exigir uma partida linear. Uma segunda passagem dispara ações da store em ordem para mostrar a progressão e as mudanças de elenco. Os puzzles são operados pelos controles reais, com erros e respostas corretas; na passagem de progressão a resolução é aplicada pela store. O catálogo mostra cada item isoladamente e as nove habilidades em estado documental. As revisitas e os fechos são estados preparados para mostrar seus textos. Prints estáticos não registram som, duração, caminhada, respiração nem todas as posições intermediárias de animação. Esta é uma cobertura de telas e conteúdo, não uma validação completa de todos os caminhos jogáveis. Os roteiros em referencias ajudam a entender a fala dos apresentadores, mas o conteúdo integral exportado é a referência para o que a versão atual exibe.

## Elenco

Ana é a protagonista; sua postura evolui de encolhida para neutra, confiante e futura.

- **Cláudia** — Líder do time.
- **Rafael** — Projetos, outro time.
- **Tiago** — Apoio operacional.
- **Bianca** — Documentação de produto.
- **Marcos** — Eventos internos, outra área.

## Fase 1 — O primeiro dia

Primeiro dia · apresentação: Pedro.

Ana chega ao Escritório insegura e precisa acessar o notebook. Conversa com Tiago, Cláudia e Rafael: as pistas da senha estão distribuídas entre os três. A conversa com a líder também aborda o que trouxe Ana até ali. O cartão de Rafael nasce dessa aproximação. O minigame pede NOVO / 12 / 03, representando a coragem de perguntar e a percepção de que ninguém precisa saber tudo sozinho.

### Pensamento de Ana

> Primeiro dia. Meu coração tá batendo tão rápido que parece que todo mundo consegue ouvir.

> Eu preciso parecer que sei o que estou fazendo. Se alguém perceber que eu não sei nada, vai achar que eu não deveria estar aqui.

> Talvez eu consiga resolver tudo sozinha... é só prestar atenção e não incomodar ninguém.

### Escritório

Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está olhando.

Contadores da fase: 3 conversas, 1 minigames.

- **Notebook** (b1-notebook).
- **Tiago** (b1-tiago).
- **Cláudia** (b1-claudia).
- **Rafael** (b1-rafael).
- **Tela aberta** (b1-tela); requer puzzle senha.
  Retorno bloqueado: A tela de login continua ali, esperando os três campos.

Revisita após conclusão: Aqui ela falou com três pessoas pra digitar oito caracteres.


## Fase 2 — O que ninguém ensinou

1 mês depois · apresentação: Heloisa.

Um mês depois, Ana percebe no Cafezinho que precisa aprender a organizar demandas e estudar. Bianca e Rafael abordam planejamento e desenvolvimento. Ana vai ao Escritório e associa quatro situações a quatro práticas: registrar pedidos e prazos, priorizar por urgência e esforço, fazer curso e aplicar a ferramenta, e estudar inglês. O puzzle concede certificado e competências. De volta ao Cafezinho, Rafael conversa sobre anotar, priorizar e reservar tempo para estudar; entrega o caderno de anotações e fecha a fase.

### Pensamento de Ana

> Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.

> Agora todo mundo me pede alguma coisa. Uma planilha, uma ata, um status pra ontem. E eu digo sim pra tudo e guardo tudo de cabeça.

> Esta semana escapou um prazo. Não foi falta de vontade, foi falta de um jeito de me organizar.

> E tem coisa que me pedem e eu ainda não sei fazer. Quando tudo chega junto, eu travo e tento fazer tudo ao mesmo tempo.

### Cafezinho

Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.

Contadores da fase: 2 conversas, 1 minigames.

- **Bianca** (b2-bianca).
- **Máquina de café** (b2-maquina).
- **Rafael** (b2-rafael); requer puzzle associar.
  Retorno bloqueado: Dá uma olhada no notebook do Escritório primeiro. Depois a gente conversa.

Revisita após conclusão: Ela começou a anotar as demandas e a buscar o que ainda precisa aprender.

### Escritório

De volta à mesa. Agora ela já sabe o que está procurando.

Contadores da fase: 2 conversas, 1 minigames.

- **Notebook da Ana** (b2-notebook); depende de b2-bianca.
  Retorno bloqueado: Notebook: Ainda não sei o que procurar aqui.

Revisita após conclusão: Um plano para dar conta do que chega e aprender o que ainda falta.


## Fase 3 — Sem ninguém pedir

6 meses depois · apresentação: João.

Seis meses depois, Ana observa na Linha de Produção que a conferência de lotes vai para o papel e só é digitada no fim do turno. A iniciativa parte dela. Na própria Linha, usa as anotações para estruturar problema, solução e impacto; dois trechos verdadeiros são distratores porque não ajudam a agir. Produz o relatório, ganha proatividade e leva o documento ao Escritório para entregar a Cláudia, ganhando protagonismo. A melhoria usa planilha compartilhada no momento da conferência, para o próximo turno conhecer as pendências. Cláudia passa a reconhecer sua autoria.

### Pensamento de Ana

> Seis meses. Eu já não me perco tanto, e quando não entendo alguma coisa, sei como perguntar.

> Tem algo estranho nesses números. Ninguém me pediu pra olhar, e talvez nem seja problema meu.

> Mas eu não consigo deixar passar. Eu gosto de descobrir onde a informação trava.

### Linha de Produção

Seis meses. Ela tem tarefas de verdade agora. Nenhuma delas é essa.

Contadores da fase: 2 conversas, 1 minigames.

- **Tiago** (b3-tiago).
- **Números da linha** (b3-monitor); aceita Anotações do treinamento selecionado.
- **Relatório** (b3-relatorio); requer puzzle estruturar.
  Retorno bloqueado: Problema, solução e impacto ainda estão embaralhados. Não há relatório.

Revisita após conclusão: Aqui ela escreveu três páginas que ninguém tinha pedido.

### Escritório

Ela atravessou o prédio com três páginas na mão. A mesa é a mesma de seis meses atrás.

Contadores da fase: 2 conversas, 1 minigames.

- **Cláudia** (b3-claudia); aceita Relatório selecionado.

Revisita após conclusão: Aqui ela entregou um relatório que ninguém tinha pedido.


## Fase 4 — Mostrar o que fez

1 ano depois · apresentação: Gianluca.

Um ano depois, na Sala de Reuniões durante a Innovation Week, Ana precisa tornar o trabalho visível. O mesmo caso da fase anterior ganha uma apresentação pelo método STAR: Situação, Tarefa, Ação, Resultado. O minigame monta uma página para o gestor. O telão acompanha a apresentação. Há uma pausa dramática sem recompensa imediata; as conversas ligam entrega, comunicação e visibilidade. O crachá do evento permanece no inventário.

### Pensamento de Ana

> Um ano. Eu fiz coisas. Mas quem sabe disso além de mim?

> Só de pensar em ficar na frente de todo mundo, minhas mãos gelam.

> Acho que posso gostar de organizar tudo isso e ainda assim não gostar de ser o centro das atenções. Uma coisa não precisa vir com a outra.

### Sala de Reuniões

Um ano. Ela não é mais a estagiária nova; é só a estagiária. Innovation Week: as cadeiras viradas para a frente, a sala cheia, uma fila de estagiários mostrando o que fizeram. A próxima é ela.

Contadores da fase: 3 conversas, 1 minigames.

- **Marcos** (b4-marcos).
- **Tela da sala** (b4-tv); depende de b4-marcos.
  Retorno bloqueado: Marcos ainda está conversando com Ana sobre como organizar a apresentação.
- **A plateia** (b4-plateia); depende de b4-marcos.
  Retorno bloqueado: A plateia ainda está se acomodando. Ana conversa com Marcos antes de começar.
- **Apresentar para a sala** (b4-entrega); requer puzzle montar; depende de b4-marcos, b4-plateia.
  Retorno bloqueado: A página precisa estar montada e a sala pronta para ouvir.
- **Cláudia** (b4-claudia); depende de b4-entrega.
  Retorno bloqueado: Cláudia está com o notebook aberto, acompanhando a apresentação. Não é hora de interromper.
- **Bianca** (b4-bianca); depende de b4-claudia.
  Retorno bloqueado: Bianca está na porta, esperando a apresentação acabar.

Revisita após conclusão: As cadeiras continuam viradas para a frente. A tela ainda está acesa com a página dela, e não tem mais ninguém na sala.


## Fase 5 — É esse o caminho?

2 anos depois · apresentação: Marianna.

Dois anos depois, Ana conversa com Bianca em Outra Área. Revê competências, faculdade, interesses e possibilidades profissionais, enquanto a efetivação ainda é incerta. Bianca conta sua formação em Letras e sua atuação com documentação; orçamento e espaço no time também influenciam contratação. Esta fase não tem minigame: a revisão das habilidades e a conversa são a experiência central. Ana ganha plano de futuro sem receber antecipadamente a resposta sobre ficar.

### Pensamento de Ana

> Meu contrato está acabando. Eu quero ficar, isso eu sei.

> Mas, se me efetivarem, eu quero continuar nessa área? E se não, pra onde eu vou?

> Efetivação e escolha de carreira não são a mesma pergunta. Acho que a pergunta de verdade é: que tipo de problema eu gosto de resolver?

### Outra área

Dois anos. O contrato fecha em três semanas. Ana quer ser efetivada, mas ainda não sabe se vai acontecer. Ela também está pensando em que área quer construir a carreira.

Contadores da fase: 2 conversas, 0 minigames.

- **Bianca** (b5-bianca-inicial).
- **Caderno dela** (b5-caderno).
- **Grade do próximo semestre** (b5-grade).
- **Bianca** (b5-bianca); depende de b5-caderno, b5-grade.
  Retorno bloqueado: Bianca combinou de conversar depois que Ana olhasse o caderno e a grade.

Revisita após conclusão: Ana reconheceu o que aprendeu e começou a pensar no próximo passo da carreira.


## Fase 6 — O que ela se tornou

3 semanas depois.

Três semanas depois, o Cafezinho virou festa com todo o elenco. Cláudia confirma a efetivação e leva ao mapa. Quatro conexões explicam como as relações, estudo, exposição e iniciativa contribuíram. Cartão, certificado e crachá são consumidos; as nove habilidades permanecem. Ana aparece em sua versão futura e a apresentação fecha com perguntas para o público. As falas da festa retomam episódios anteriores; na implementação atual devem ser lidas antes de concluir a conversa com Cláudia, pois a revelação não retorna à cena.

### Pensamento de Ana

> Último dia de contrato. Eu não sei como isso vai terminar.

> No primeiro dia eu nem sabia como pedir uma senha. Hoje eu sei o que gosto, o que aprendi e o que ainda quero aprender.

> Seja qual for a resposta, essa história é minha.

### Cafezinho

Três semanas. O Cafezinho está cheio, alguém trouxe bolo e ninguém está trabalhando. O time inteiro está aqui, e é por causa dela.

Contadores da fase: 5 conversas, 0 minigames.

- **Cláudia** (b6-claudia).
- **Tiago** (b6-tiago).
- **Rafael** (b6-rafael).
- **Bianca** (b6-bianca).
- **Marcos** (b6-marcos).

Revisita após conclusão: Ninguém voltou pra mesa depois disso.


## Minigames — instruções, respostas e significado

Há quatro minigames na versão atual (um em cada fase de 1 a 4). As fases 5 e 6 não têm puzzle. Comentários históricos que falam em cinco puzzles não descrevem a versão atual.

### Senha temporária de primeiro acesso

Três campos, três pessoas. Cada uma sabe um pedaço; ninguém sabe a senha inteira.

Erro: A senha não abriu. Confira os três campos.

- Prefixo (igual para todo mundo): **NOVO**, pista de Tiago.
- Código do time (2 dígitos): **12**, pista de Cláudia.
- Dia em que você entrou (2 dígitos): **03**, pista de Rafael.

Lembrança ao revisitar: Notebook: Consegui entrar no sistema. Precisei de três pessoas pra isso, e tudo bem.

### Planejar e aprender na prática

Ligue cada situação a uma prática que pode ajudar.

Erro: Essa prática não resolve essa situação.

- Chegam pedidos de todo lado e já estou esquecendo prazos. → Anoto na hora o prazo, quem pediu e o que preciso entregar.
- Duas entregas disputam atenção: uma vence hoje, a outra exige foco. → Avalio urgência e esforço; deixo a tarefa mais pesada para a manhã.
- No trabalho pediram uma ferramenta que ainda não sei usar. → Faço um curso curto da ferramenta e já pratico no trabalho.
- Quero acompanhar projetos e documentos de equipes de outros países. → Estudo inglês para entender documentos e participar das conversas.

Lembrança ao revisitar: Notebook: Cruzei cada tema de estudo com um problema real do meu dia. Ainda não sei onde vou usar tudo isso, mas já comecei.

### A proposta dela, em três campos

Cada trecho vai num campo. Dois não entram em lugar nenhum — estruturar é escolher.

Erro: Esse trecho não responde o que o campo pergunta.

- Problema: A conferência de cada lote é anotada no papel e só digitada no fim do turno.
- Solução: Conferir direto na planilha compartilhada, no momento da conferência.
- Impacto: O turno seguinte começa sabendo o que ficou pendente, sem esperar a digitação.
- Distrator: O processo é antigo e já era assim antes de eu entrar.
- Distrator: Ninguém tinha reclamado disso até agora.

Lembrança ao revisitar: Clipboard · Relatório: Os números que pareciam soltos agora contam uma história. Ninguém pediu, mas está feito e leva o meu nome.

### Uma página para o gestor

Quatro campos, quatro peças. Cada peça pertence a um campo.

Erro: Essa peça não é desse campo.

- Situação: A conferência dos lotes só era digitada no fim do turno.
- Tarefa: Garantir que as pendências chegassem claras ao turno seguinte.
- Resultado: O turno seguinte já começa sabendo o que ficou pendente.
- Ação: Passei a conferência para a planilha compartilhada, na hora.

Lembrança ao revisitar: Telão: Situação, tarefa, ação e resultado no lugar. O que eu fiz deixou de ser só meu e passou a poder ser visto.

## Objetos e competências

- **Anotações do treinamento:** Tudo o que ouço e preciso lembrar, registrado na hora. É usado e consumido durante as fases.
- **Relatório:** Três páginas sobre uma falha na passagem de turno. Quem percebe o problema antes de receber a tarefa? É usado e consumido durante as fases.
- **Cartão do Rafael:** Rafael escreveu o ramal atrás, à mão. Uma conversa do primeiro dia ainda pode abrir uma porta? Permanece até o clímax.
- **Certificado de conclusão:** Uma trilha escolhida a partir do que o trabalho já pede. O que Ana decidiu aprender por conta própria? Permanece até o clímax.
- **Crachá do Innovation:** Ana apresentou a melhoria na passagem de turno. Quem viu o trabalho dela chegar até ali? Permanece até o clímax.

- **Coragem de perguntar** (fase 1): Perguntar não é admitir que você não sabe. É o jeito mais rápido de passar a saber.
- **Autoconhecimento** (fase 1): Saber responder 'o que te trouxe aqui' antes que alguém pergunte.
- **Leitura do que o trabalho pede** (fase 2): Entender o que é urgente, o que dá mais trabalho e o que o time precisa primeiro.
- **Aprendizado contínuo** (fase 2): Ninguém aqui parou de estudar. Nem quem já chegou.
- **Competência que ela foi buscar** (fase 2): Aprender o que ainda não sabia fazer. Serviu antes do que ela imaginava.
- **Proatividade** (fase 3): Resolver o que ninguém mandou é o que te diferencia de quem só cumpre.
- **Protagonismo** (fase 3): Liderança não vem com cargo. Vem de assumir o que ninguém assumiu.
- **Visibilidade** (fase 4): Trabalho que ninguém sabe que existe não vira oportunidade sozinho.
- **Plano de futuro** (fase 5): Onde eu quero estar não é uma pergunta pra depois. É a pergunta que organiza o agora.

## Conexões e perguntas do encerramento

1. Perguntaram ao Rafael se ele conhecia alguém. Ele disse seu nome. Origem: {"tipo":"item","itemId":"cartao-rafael"}; lugar: Escritório; consome origem: sim.

2. A vaga pedia alguém disposto a aprender o que ainda não sabia.
Ela tinha quarenta horas que ninguém mandou fazer. Origem: {"tipo":"item","itemId":"certificado-degree"}; lugar: Cafezinho; consome origem: sim.

3. Na conversa de ontem, duas pessoas da Innovation Week lembravam dela. Origem: {"tipo":"item","itemId":"cracha-innovation"}; lugar: Sala de Reuniões; consome origem: sim.

4. Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu.
"Guardei seu nome." Origem: {"tipo":"skill","skillId":"proatividade"}; lugar: Linha de Produção; consome origem: não.

- Que contribuição sua merece ser conhecida — e como você contaria essa história?
- Em que área você quer crescer, e qual próximo passo pode experimentar?
- Se uma oportunidade não vier, o que depende de você e o que você leva dessa experiência?

## Sugestão de pedido à IA que analisar

Analise a apresentação usando este guia, o conteúdo integral e os prints. Avalie clareza da jornada, conexão entre conversas e minigames, legibilidade em Teams, composição das cenas, distinção dos personagens, hierarquia visual, compreensão das instruções, retorno de erro/acerto, navegação e coerência do clímax. Cite arquivos de imagem ao apontar problemas. Distinga defeitos observáveis, inferências e aspectos que só podem ser avaliados em movimento. Preserve a história revisada; priorize ajustes de apresentação e interação.


## Seleção visual para começar

A seleção contém 28 prints. O pacote integral contém 297, com todas as falas.

- 001-abertura.png — Abertura sem progresso salvo
- 003-b1-mapa.png — Fase 1: mapa e lugares disponíveis
- 150-b6-mapa.png — Fase 6: mapa e lugares disponíveis
- 004-b1-escritorio.png — Fase 1: Escritório, sem overlays
- 036-b2-cafezinho.png — Fase 2: Cafezinho, sem overlays
- 059-b2-escritorio.png — Fase 2: Escritório, sem overlays
- 066-b3-linha-producao.png — Fase 3: Linha de Produção, sem overlays
- 082-b3-escritorio.png — Fase 3: Escritório, sem overlays
- 095-b4-sala-reunioes.png — Fase 4: Sala de Reuniões, sem overlays
- 128-b5-outra-area.png — Fase 5: Outra área, sem overlays
- 151-b6-cafezinho.png — Fase 6: Cafezinho, sem overlays
- 030-b1-reflexao-2.png — Ana pensando: Eu preciso parecer que sei o que estou fazendo. Se alguém perceber que eu não sei nada, vai achar que eu não deveria estar aqui.
- 026-b1-rafael-fala-4.png — b1-rafael, fala 4/5: rafael: (escreve o ramal atrás de um cartão) Qualquer coisa que travar, me chama. Sério.
- 110-b4-apresentacao-fala-4.png — b4-apresentacao, fala 4/4: ana: Agora o outro turno já começa sabendo o que falta. Eu gosto de resolver essa passagem... ainda fico nervosa falando aqui na frente.
- 212-b4-entrega-silencio.png — Progressão: plateia saiu e a sala permanece em silêncio
- 214-b4-claudia-acao.png — Progressão: ação de Cláudia
- 224-b5-bianca-acao.png — Progressão: ação de Bianca
- 236-b1-senha-inicio.png — Minigame: Senha temporária de primeiro acesso; Três campos, três pessoas. Cada uma sabe um pedaço; ninguém sabe a senha inteira.
- 241-b2-associar-inicio.png — Minigame: Planejar e aprender na prática; Ligue cada situação a uma prática que pode ajudar.
- 249-b3-estruturar-inicio.png — Minigame: A proposta dela, em três campos; Cada trecho vai num campo. Dois não entram em lugar nenhum — estruturar é escolher.
- 257-b4-montar-inicio.png — Minigame: Uma página para o gestor; Quatro campos, quatro peças. Cada peça pertence a um campo.
- 251-b3-estruturar-distrator.png — Isso é verdade. Mas ninguém consegue fazer nada com isso.
- 271-item-cartao-rafael-descricao.png — Cartão do Rafael: Rafael escreveu o ramal atrás, à mão. Uma conversa do primeiro dia ainda pode abrir uma porta?
- 284-habilidade-plano-futuro.png — Plano de futuro: Onde eu quero estar não é uma pergunta pra depois. É a pergunta que organiza o agora.
- 290-final-conexao-4.png — Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu.
"Guardei seu nome."
- 291-final-barra-vazia.png — Itens consumidos; habilidades permanecem
- 293-final-ana-futura.png — Sustentação visual depois da pergunta
- 296-perguntas-3.png — Pergunta final 3
