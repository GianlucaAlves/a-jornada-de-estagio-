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

### Conversas integrais

#### b1-tiago

**Tiago:** Ah, a nova! A senha inicial tá no e-mail de boas-vindas.

**Ana:** Então... não consigo abrir o e-mail sem a senha.

**Ana:** Fiquei um tempão olhando pra tela. Achei que perguntar logo no primeiro dia ia pegar mal.

**Tiago:** (pausa) É. Todo mundo cai nessa.

**Tiago:** O começo é NOVO, em maiúscula. Igual pra todo mundo.

**Tiago:** O do meio é o número do teu time; a Cláudia sabe. No fim vai o dia que você entrou.

**Tiago:** (volta pro que estava fazendo) Eu também demorei pra decorar onde abria chamado.

Consequências: {"tipo":"concederSkill","skillId":"coragem-perguntar"}.

#### b1-claudia

**Cláudia:** Você é a estagiária nova? Cláudia.

**Ana:** Sou, sim. Ana. Tô tentando entrar no sistema... qual é o número do time?

**Cláudia:** É 12. (para, volta meio metro) E me conta: o que te trouxe pra cá?

**Ana:** Queria ver como é no dia a dia. Na faculdade a gente vê muita coisa no papel, né?

**Cláudia:** Ah, entendi. (anota mentalmente e sai) Bom primeiro dia.

Consequências: {"tipo":"concederSkill","skillId":"autoconhecimento"}.

#### b1-rafael

**Rafael:** Você tá há quarenta minutos nessa tela, né? Eu levei quase uma hora e meia. Tá indo bem.

**Ana:** (constrangida) Tanto assim?

**Rafael:** Sou o Rafael, do time de Projetos, ali do lado. No fim vai o dia que você entrou: hoje é 03.

**Rafael:** (escreve o ramal atrás de um cartão) Qualquer coisa que travar, me chama. Sério.

**Rafael:** Pra primeiro dia, três ramais já é bastante. Eu levei uma semana pra achar todo mundo.

Consequências: {"tipo":"concederItem","itemId":"cartao-rafael"}.

Fecho: Ela precisou falar com três pessoas pra digitar oito caracteres.
Nenhuma delas deu a resposta inteira.


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

### Conversas integrais

#### b2-bianca

**Bianca:** Você tá com cara de quem ganhou cinco pedidos antes do almoço. Foi isso?

**Ana:** Quase. Planilha, ferramenta nova... eu digo “deixa comigo” e depois tento lembrar de tudo.

**Bianca:** Conheço. Eu vim de outra área e fui aprendendo com curso curto, já testando no trabalho.

**Ana:** Tipo o quê? Aqui já me pediram umas coisas que nunca vi na faculdade.

**Bianca:** Planilhas, o programa da área, gestão de projetos. E inglês também: tem documento e projeto de fora que chega assim.

**Bianca:** Olha aquele notebook no Escritório. Tem umas situações pra ligar com jeitos de resolver. Vê se alguma te ajuda.

#### b2-rafael

**Rafael:** E aí, conseguiu ligar as situações às práticas? Qual delas te faria falta já?

**Ana:** Anotar, com certeza. Essa semana deixei um prazo só na cabeça... não deu muito certo.

**Rafael:** Já fiz igual. Anota na hora o prazo, quem pediu e o que ficou combinado. A cabeça agradece.

**Ana:** E quando chegam três coisas juntas? Eu olho pra lista e travo.

**Rafael:** Olha o prazo e o tamanho do trabalho. O mais pesado eu tento fazer de manhã. Se os prazos batem, aviso cedo e combino.

**Rafael:** E separa um tempinho pro curso também. Se deixar pro “quando der”... já sabe. Toma, começa por esse caderno.

Consequências: {"tipo":"concederItem","itemId":"anotacoes-treinamento"}; {"tipo":"concluirLugar","lugarId":"cafezinho"}; {"tipo":"blocoConcluido"}.

Fecho: Ela percebeu o que ainda precisava aprender.
Saiu com um certificado e um jeito de organizar as demandas.


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

### Conversas integrais

#### b3-tiago

**Tiago:** Essa conferência aí sempre foi no papel. No fim do turno a gente passa pra planilha, senão não fecha.

**Tiago:** (dá de ombros) Sei lá, quando eu cheguei já era assim.

**Ana:** Eu fico pensando... gosto de achar onde a informação emperra. Se eu guardar isso só pra mim, o pessoal da noite continua no escuro.

**Tiago:** Começa. Ninguém pediu pra você olhar isso.

**Ana:** Pois é. Mas também ninguém pediu pra eu deixar quieto.

**Tiago:** (pausa, depois ri) Tá bom. Olha aí.

#### b3-claudia

**Cláudia:** O que é isso?

**Ana:** A conferência da linha, lembra? Aquela que só vai pra planilha no fim do turno.

**Cláudia:** (folheando) Quem te pediu isso?

**Ana:** Ninguém.

**Cláudia:** Peraí... seis meses fazendo isso à mão e ninguém tinha juntado por escrito?

**Cláudia:** Guardei seu nome.

Consequências: {"tipo":"concederSkill","skillId":"protagonismo"}; {"tipo":"destravarLugar","lugarId":"sala-reunioes"}; {"tipo":"blocoConcluido"}.

Fecho: Ninguém pediu pra ela olhar aquela etapa.
Ela saiu de lá com um relatório e com o nome dela dentro dele.


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

### Conversas integrais

#### b4-preparacao

**Marcos:** Antes de entrar: se alguém perguntar o que mudou com esse projeto, o que você conta?

**Ana:** Que eu participei. Mas... não sei se ficou claro o que eu fiz.

**Marcos:** Então conta em quatro passos: situação, tarefa, ação e resultado. Como tava, o que cabia a você, o que fez e no que deu.

**Ana:** Aí mostro a minha parte sem apagar o trabalho do time.

**Marcos:** Isso. E depois dá pra contar essa história num post profissional. Tem gente que não tava na sala.

**Marcos:** Só confere o que pode sair pra fora, tá? Fala do que aprendeu sem mostrar dado interno.

#### b4-apresentacao

**Ana:** Antes, a gente anotava a conferência no papel e só passava pra planilha no fim do turno. Quem chegava depois perguntava o que faltava.

**Ana:** Minha parte era deixar isso claro pro turno seguinte.

**Ana:** Passei a registrar na planilha compartilhada, ali na hora. Depois conferi com o pessoal da linha se tava funcionando.

**Ana:** Agora o outro turno já começa sabendo o que falta. Eu gosto de resolver essa passagem... ainda fico nervosa falando aqui na frente.

Consequências: {"tipo":"iniciarPausaBloco4"}.

#### b4-reconhecimento

**Cláudia:** Bom trabalho. (já de pé, notebook debaixo do braço)

**Ana:** Obrigada.

**Cláudia:** Depois manda no canal do time, pra quem não veio ver também.

Consequências: {"tipo":"concederItem","itemId":"cracha-innovation"}.

#### b4-virada

**Bianca:** (da porta) Foi muito bom, Ana. Sério.

**Ana:** Mas ninguém falou nada.

**Bianca:** Eu sei. Tava cheia de gente que já conhecia o projeto, né?

**Bianca:** Mas eles ouviram você contar o que mudou. Isso conta.

**Ana:** Nossa, eu tava tremendo por dentro. Ainda não sei se acostumo.

**Bianca:** Nem precisa decidir agora. Hoje você fez mesmo assim.

Consequências: {"tipo":"concederSkill","skillId":"visibilidade"}; {"tipo":"concluirLugar","lugarId":"sala-reunioes"}; {"tipo":"blocoConcluido"}.

Fecho: O trabalho era o mesmo antes e depois da página que ela escreveu.
O que mudou foi quanta gente sabia que ele existia.


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

### Conversas integrais

#### b5-contrato

**Bianca:** Tá chegando no fim do contrato... como isso tá batendo?

**Ana:** Quero muito ser efetivada. Só não sei se vai rolar, e fico tentando fingir que não me preocupa.

**Bianca:** Justo. E, tirando essa vaga, já se pegou pensando no tipo de trabalho que quer fazer?

**Ana:** Na conferência curti organizar a informação. Na apresentação, ficar na frente da sala... nem tanto. Quero entender essa diferença.

#### b5-pivo

**Bianca:** Você circulou "passagem de turno" três vezes no caderno.

**Ana:** Acho que gostei de descobrir onde a informação travava. Mas não sei se quero fazer isso aqui... ou em outra área.

**Ana:** E a efetivação? Faltam três semanas e ninguém falou se tem vaga. Tento separar essa ansiedade da escolha da área, mas é difícil.

**Bianca:** Sou formada em Letras e trabalho com documentação. Até descobrir esse caminho, achava que mudar era me desviar.

**Bianca:** Eu vi você lá na linha, montando a conferência. E depois explicando o que mudou na reunião.

**Bianca:** Se a vaga não aparecer, isso continua sendo seu. E a decisão também passa pelo orçamento, pelo espaço no time... nem tudo depende da gente.

Consequências: {"tipo":"concederSkill","skillId":"plano-futuro"}; {"tipo":"concluirLugar","lugarId":"outra-area"}; {"tipo":"blocoConcluido"}.

Fecho: Ela não sabe se fica.
Sabe o que leva se não ficar.


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

### Conversas integrais

#### b6-noticia

**Cláudia:** Assinaram hoje cedo. Você foi efetivada. É oficial.

**Ana:** Eu... espera, é sério?

**Cláudia:** Seu nome apareceu em três lugares diferentes na conversa de ontem.

**Ana:** (baixo) Três lugares?

**Cláudia:** O pessoal de Produto precisava de alguém pra organizar a documentação. Foi por aí que seu nome chegou até lá.

**Cláudia:** Vem cá. Eu te mostro de onde veio cada um.

Consequências: {"tipo":"blocoConcluido"}; {"tipo":"irParaRevelacao"}.

#### b6-rafael-ramal

**Rafael:** Anotei seu ramal. Pra ficar justo, né?

**Ana:** (ri) Sem cartão dessa vez, hein.

#### b6-tiago-pergunta

**Tiago:** Dois anos e você ainda pergunta. Gosto disso.

**Ana:** Eu ainda não entendo metade do que você fala.

**Tiago:** Nem eu. A gente descobre junto.

#### b6-bianca-mudanca

**Bianca:** Eu falei que dava pra mudar de ideia no meio do caminho, lembra?

**Ana:** Eu achava que gostava da planilha. Acho que gostei mesmo foi de fazer a informação chegar a quem precisava.

#### b6-marcos-proximo

**Marcos:** Ano que vem você apresenta de novo? Agora do outro lado da mesa.

**Ana:** Pode ser. Da próxima vez quero trazer um projeto desde o começo.

#### b6-fecho

**Ana:** Eu passei três semanas com uma pergunta na cabeça. "Eu fui efetivada?"

Fecho: Tudo o que ela carregou, ela usou.
Tudo o que ela aprendeu, ela é.

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

## Índice dos 297 prints

- [001-abertura.png](prints/001-abertura.png) — Abertura sem progresso salvo
- [002-b1-cartao.png](prints/002-b1-cartao.png) — Fase 1: cartão temporal e passagem de apresentação
- [003-b1-mapa.png](prints/003-b1-mapa.png) — Fase 1: mapa e lugares disponíveis
- [004-b1-escritorio.png](prints/004-b1-escritorio.png) — Fase 1: Escritório, sem overlays
- [005-b1-escritorio-narracao.png](prints/005-b1-escritorio-narracao.png) — Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está olhando.
- [006-b1-b1-notebook-foco.png](prints/006-b1-b1-notebook-foco.png) — Hotspot: Notebook; aura e linha de foco
- [007-b1-b1-tiago-foco.png](prints/007-b1-b1-tiago-foco.png) — Hotspot: Tiago; aura e linha de foco
- [008-b1-b1-claudia-foco.png](prints/008-b1-b1-claudia-foco.png) — Hotspot: Cláudia; aura e linha de foco
- [009-b1-b1-rafael-foco.png](prints/009-b1-b1-rafael-foco.png) — Hotspot: Rafael; aura e linha de foco
- [010-b1-b1-tela-foco.png](prints/010-b1-b1-tela-foco.png) — Hotspot: Tela aberta; aura e linha de foco
- [011-b1-tiago-fala-1.png](prints/011-b1-tiago-fala-1.png) — b1-tiago, fala 1/7: tiago: Ah, a nova! A senha inicial tá no e-mail de boas-vindas.
- [012-b1-tiago-fala-2.png](prints/012-b1-tiago-fala-2.png) — b1-tiago, fala 2/7: ana: Então... não consigo abrir o e-mail sem a senha.
- [013-b1-tiago-fala-3.png](prints/013-b1-tiago-fala-3.png) — b1-tiago, fala 3/7: ana: Fiquei um tempão olhando pra tela. Achei que perguntar logo no primeiro dia ia pegar mal.
- [014-b1-tiago-fala-4.png](prints/014-b1-tiago-fala-4.png) — b1-tiago, fala 4/7: tiago: (pausa) É. Todo mundo cai nessa.
- [015-b1-tiago-fala-5.png](prints/015-b1-tiago-fala-5.png) — b1-tiago, fala 5/7: tiago: O começo é NOVO, em maiúscula. Igual pra todo mundo.
- [016-b1-tiago-fala-6.png](prints/016-b1-tiago-fala-6.png) — b1-tiago, fala 6/7: tiago: O do meio é o número do teu time; a Cláudia sabe. No fim vai o dia que você entrou.
- [017-b1-tiago-fala-7.png](prints/017-b1-tiago-fala-7.png) — b1-tiago, fala 7/7: tiago: (volta pro que estava fazendo) Eu também demorei pra decorar onde abria chamado.
- [018-b1-claudia-fala-1.png](prints/018-b1-claudia-fala-1.png) — b1-claudia, fala 1/5: claudia: Você é a estagiária nova? Cláudia.
- [019-b1-claudia-fala-2.png](prints/019-b1-claudia-fala-2.png) — b1-claudia, fala 2/5: ana: Sou, sim. Ana. Tô tentando entrar no sistema... qual é o número do time?
- [020-b1-claudia-fala-3.png](prints/020-b1-claudia-fala-3.png) — b1-claudia, fala 3/5: claudia: É 12. (para, volta meio metro) E me conta: o que te trouxe pra cá?
- [021-b1-claudia-fala-4.png](prints/021-b1-claudia-fala-4.png) — b1-claudia, fala 4/5: ana: Queria ver como é no dia a dia. Na faculdade a gente vê muita coisa no papel, né?
- [022-b1-claudia-fala-5.png](prints/022-b1-claudia-fala-5.png) — b1-claudia, fala 5/5: claudia: Ah, entendi. (anota mentalmente e sai) Bom primeiro dia.
- [023-b1-rafael-fala-1.png](prints/023-b1-rafael-fala-1.png) — b1-rafael, fala 1/5: rafael: Você tá há quarenta minutos nessa tela, né? Eu levei quase uma hora e meia. Tá indo bem.
- [024-b1-rafael-fala-2.png](prints/024-b1-rafael-fala-2.png) — b1-rafael, fala 2/5: ana: (constrangida) Tanto assim?
- [025-b1-rafael-fala-3.png](prints/025-b1-rafael-fala-3.png) — b1-rafael, fala 3/5: rafael: Sou o Rafael, do time de Projetos, ali do lado. No fim vai o dia que você entrou: hoje é 03.
- [026-b1-rafael-fala-4.png](prints/026-b1-rafael-fala-4.png) — b1-rafael, fala 4/5: rafael: (escreve o ramal atrás de um cartão) Qualquer coisa que travar, me chama. Sério.
- [027-b1-rafael-fala-5.png](prints/027-b1-rafael-fala-5.png) — b1-rafael, fala 5/5: rafael: Pra primeiro dia, três ramais já é bastante. Eu levei uma semana pra achar todo mundo.
- [028-b1-reflexao-tempo.png](prints/028-b1-reflexao-tempo.png) — Fase 1: abertura da reflexão
- [029-b1-reflexao-1.png](prints/029-b1-reflexao-1.png) — Ana pensando: Primeiro dia. Meu coração tá batendo tão rápido que parece que todo mundo consegue ouvir.
- [030-b1-reflexao-2.png](prints/030-b1-reflexao-2.png) — Ana pensando: Eu preciso parecer que sei o que estou fazendo. Se alguém perceber que eu não sei nada, vai achar que eu não deveria estar aqui.
- [031-b1-reflexao-3.png](prints/031-b1-reflexao-3.png) — Ana pensando: Talvez eu consiga resolver tudo sozinha... é só prestar atenção e não incomodar ninguém.
- [032-b1-escritorio-eco.png](prints/032-b1-escritorio-eco.png) — Revisita concluída: Aqui ela falou com três pessoas pra digitar oito caracteres.
- [033-b1-fecho.png](prints/033-b1-fecho.png) — Fecho da fase: Ela precisou falar com três pessoas pra digitar oito caracteres. Nenhuma delas deu a resposta inteira.
- [034-b2-cartao.png](prints/034-b2-cartao.png) — Fase 2: cartão temporal e passagem de apresentação
- [035-b2-mapa.png](prints/035-b2-mapa.png) — Fase 2: mapa e lugares disponíveis
- [036-b2-cafezinho.png](prints/036-b2-cafezinho.png) — Fase 2: Cafezinho, sem overlays
- [037-b2-cafezinho-narracao.png](prints/037-b2-cafezinho-narracao.png) — Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.
- [038-b2-b2-bianca-foco.png](prints/038-b2-b2-bianca-foco.png) — Hotspot: Bianca; aura e linha de foco
- [039-b2-b2-maquina-foco.png](prints/039-b2-b2-maquina-foco.png) — Hotspot: Máquina de café; aura e linha de foco
- [040-b2-b2-rafael-foco.png](prints/040-b2-b2-rafael-foco.png) — Hotspot: Rafael; aura e linha de foco
- [041-b2-bianca-fala-1.png](prints/041-b2-bianca-fala-1.png) — b2-bianca, fala 1/6: bianca: Você tá com cara de quem ganhou cinco pedidos antes do almoço. Foi isso?
- [042-b2-bianca-fala-2.png](prints/042-b2-bianca-fala-2.png) — b2-bianca, fala 2/6: ana: Quase. Planilha, ferramenta nova... eu digo “deixa comigo” e depois tento lembrar de tudo.
- [043-b2-bianca-fala-3.png](prints/043-b2-bianca-fala-3.png) — b2-bianca, fala 3/6: bianca: Conheço. Eu vim de outra área e fui aprendendo com curso curto, já testando no trabalho.
- [044-b2-bianca-fala-4.png](prints/044-b2-bianca-fala-4.png) — b2-bianca, fala 4/6: ana: Tipo o quê? Aqui já me pediram umas coisas que nunca vi na faculdade.
- [045-b2-bianca-fala-5.png](prints/045-b2-bianca-fala-5.png) — b2-bianca, fala 5/6: bianca: Planilhas, o programa da área, gestão de projetos. E inglês também: tem documento e projeto de fora que chega assim.
- [046-b2-bianca-fala-6.png](prints/046-b2-bianca-fala-6.png) — b2-bianca, fala 6/6: bianca: Olha aquele notebook no Escritório. Tem umas situações pra ligar com jeitos de resolver. Vê se alguma te ajuda.
- [047-b2-rafael-fala-1.png](prints/047-b2-rafael-fala-1.png) — b2-rafael, fala 1/6: rafael: E aí, conseguiu ligar as situações às práticas? Qual delas te faria falta já?
- [048-b2-rafael-fala-2.png](prints/048-b2-rafael-fala-2.png) — b2-rafael, fala 2/6: ana: Anotar, com certeza. Essa semana deixei um prazo só na cabeça... não deu muito certo.
- [049-b2-rafael-fala-3.png](prints/049-b2-rafael-fala-3.png) — b2-rafael, fala 3/6: rafael: Já fiz igual. Anota na hora o prazo, quem pediu e o que ficou combinado. A cabeça agradece.
- [050-b2-rafael-fala-4.png](prints/050-b2-rafael-fala-4.png) — b2-rafael, fala 4/6: ana: E quando chegam três coisas juntas? Eu olho pra lista e travo.
- [051-b2-rafael-fala-5.png](prints/051-b2-rafael-fala-5.png) — b2-rafael, fala 5/6: rafael: Olha o prazo e o tamanho do trabalho. O mais pesado eu tento fazer de manhã. Se os prazos batem, aviso cedo e combino.
- [052-b2-rafael-fala-6.png](prints/052-b2-rafael-fala-6.png) — b2-rafael, fala 6/6: rafael: E separa um tempinho pro curso também. Se deixar pro “quando der”... já sabe. Toma, começa por esse caderno.
- [053-b2-reflexao-tempo.png](prints/053-b2-reflexao-tempo.png) — Fase 2: abertura da reflexão
- [054-b2-reflexao-1.png](prints/054-b2-reflexao-1.png) — Ana pensando: Um mês. Já sei onde fica o café e como entrar no sistema. Mas ainda tem muita coisa que a faculdade não falou.
- [055-b2-reflexao-2.png](prints/055-b2-reflexao-2.png) — Ana pensando: Agora todo mundo me pede alguma coisa. Uma planilha, uma ata, um status pra ontem. E eu digo sim pra tudo e guardo tudo de cabeça.
- [056-b2-reflexao-3.png](prints/056-b2-reflexao-3.png) — Ana pensando: Esta semana escapou um prazo. Não foi falta de vontade, foi falta de um jeito de me organizar.
- [057-b2-reflexao-4.png](prints/057-b2-reflexao-4.png) — Ana pensando: E tem coisa que me pedem e eu ainda não sei fazer. Quando tudo chega junto, eu travo e tento fazer tudo ao mesmo tempo.
- [058-b2-cafezinho-eco.png](prints/058-b2-cafezinho-eco.png) — Revisita concluída: Ela começou a anotar as demandas e a buscar o que ainda precisa aprender.
- [059-b2-escritorio.png](prints/059-b2-escritorio.png) — Fase 2: Escritório, sem overlays
- [060-b2-escritorio-narracao.png](prints/060-b2-escritorio-narracao.png) — De volta à mesa. Agora ela já sabe o que está procurando.
- [061-b2-b2-notebook-foco.png](prints/061-b2-b2-notebook-foco.png) — Hotspot: Notebook da Ana; aura e linha de foco
- [062-b2-escritorio-eco.png](prints/062-b2-escritorio-eco.png) — Revisita concluída: Um plano para dar conta do que chega e aprender o que ainda falta.
- [063-b2-fecho.png](prints/063-b2-fecho.png) — Fecho da fase: Ela percebeu o que ainda precisava aprender. Saiu com um certificado e um jeito de organizar as demandas.
- [064-b3-cartao.png](prints/064-b3-cartao.png) — Fase 3: cartão temporal e passagem de apresentação
- [065-b3-mapa.png](prints/065-b3-mapa.png) — Fase 3: mapa e lugares disponíveis
- [066-b3-linha-producao.png](prints/066-b3-linha-producao.png) — Fase 3: Linha de Produção, sem overlays
- [067-b3-linha-producao-narracao.png](prints/067-b3-linha-producao-narracao.png) — Seis meses. Ela tem tarefas de verdade agora. Nenhuma delas é essa.
- [068-b3-b3-tiago-foco.png](prints/068-b3-b3-tiago-foco.png) — Hotspot: Tiago; aura e linha de foco
- [069-b3-b3-monitor-foco.png](prints/069-b3-b3-monitor-foco.png) — Hotspot: Números da linha; aura e linha de foco
- [070-b3-b3-relatorio-foco.png](prints/070-b3-b3-relatorio-foco.png) — Hotspot: Relatório; aura e linha de foco
- [071-b3-tiago-fala-1.png](prints/071-b3-tiago-fala-1.png) — b3-tiago, fala 1/6: tiago: Essa conferência aí sempre foi no papel. No fim do turno a gente passa pra planilha, senão não fecha.
- [072-b3-tiago-fala-2.png](prints/072-b3-tiago-fala-2.png) — b3-tiago, fala 2/6: tiago: (dá de ombros) Sei lá, quando eu cheguei já era assim.
- [073-b3-tiago-fala-3.png](prints/073-b3-tiago-fala-3.png) — b3-tiago, fala 3/6: ana: Eu fico pensando... gosto de achar onde a informação emperra. Se eu guardar isso só pra mim, o pessoal da noite continua no escuro.
- [074-b3-tiago-fala-4.png](prints/074-b3-tiago-fala-4.png) — b3-tiago, fala 4/6: tiago: Começa. Ninguém pediu pra você olhar isso.
- [075-b3-tiago-fala-5.png](prints/075-b3-tiago-fala-5.png) — b3-tiago, fala 5/6: ana: Pois é. Mas também ninguém pediu pra eu deixar quieto.
- [076-b3-tiago-fala-6.png](prints/076-b3-tiago-fala-6.png) — b3-tiago, fala 6/6: tiago: (pausa, depois ri) Tá bom. Olha aí.
- [077-b3-reflexao-tempo.png](prints/077-b3-reflexao-tempo.png) — Fase 3: abertura da reflexão
- [078-b3-reflexao-1.png](prints/078-b3-reflexao-1.png) — Ana pensando: Seis meses. Eu já não me perco tanto, e quando não entendo alguma coisa, sei como perguntar.
- [079-b3-reflexao-2.png](prints/079-b3-reflexao-2.png) — Ana pensando: Tem algo estranho nesses números. Ninguém me pediu pra olhar, e talvez nem seja problema meu.
- [080-b3-reflexao-3.png](prints/080-b3-reflexao-3.png) — Ana pensando: Mas eu não consigo deixar passar. Eu gosto de descobrir onde a informação trava.
- [081-b3-linha-producao-eco.png](prints/081-b3-linha-producao-eco.png) — Revisita concluída: Aqui ela escreveu três páginas que ninguém tinha pedido.
- [082-b3-escritorio.png](prints/082-b3-escritorio.png) — Fase 3: Escritório, sem overlays
- [083-b3-escritorio-narracao.png](prints/083-b3-escritorio-narracao.png) — Ela atravessou o prédio com três páginas na mão. A mesa é a mesma de seis meses atrás.
- [084-b3-b3-claudia-foco.png](prints/084-b3-b3-claudia-foco.png) — Hotspot: Cláudia; aura e linha de foco
- [085-b3-claudia-fala-1.png](prints/085-b3-claudia-fala-1.png) — b3-claudia, fala 1/6: claudia: O que é isso?
- [086-b3-claudia-fala-2.png](prints/086-b3-claudia-fala-2.png) — b3-claudia, fala 2/6: ana: A conferência da linha, lembra? Aquela que só vai pra planilha no fim do turno.
- [087-b3-claudia-fala-3.png](prints/087-b3-claudia-fala-3.png) — b3-claudia, fala 3/6: claudia: (folheando) Quem te pediu isso?
- [088-b3-claudia-fala-4.png](prints/088-b3-claudia-fala-4.png) — b3-claudia, fala 4/6: ana: Ninguém.
- [089-b3-claudia-fala-5.png](prints/089-b3-claudia-fala-5.png) — b3-claudia, fala 5/6: claudia: Peraí... seis meses fazendo isso à mão e ninguém tinha juntado por escrito?
- [090-b3-claudia-fala-6.png](prints/090-b3-claudia-fala-6.png) — b3-claudia, fala 6/6: claudia: Guardei seu nome.
- [091-b3-escritorio-eco.png](prints/091-b3-escritorio-eco.png) — Revisita concluída: Aqui ela entregou um relatório que ninguém tinha pedido.
- [092-b3-fecho.png](prints/092-b3-fecho.png) — Fecho da fase: Ninguém pediu pra ela olhar aquela etapa. Ela saiu de lá com um relatório e com o nome dela dentro dele.
- [093-b4-cartao.png](prints/093-b4-cartao.png) — Fase 4: cartão temporal e passagem de apresentação
- [094-b4-mapa.png](prints/094-b4-mapa.png) — Fase 4: mapa e lugares disponíveis
- [095-b4-sala-reunioes.png](prints/095-b4-sala-reunioes.png) — Fase 4: Sala de Reuniões, sem overlays
- [096-b4-sala-reunioes-narracao.png](prints/096-b4-sala-reunioes-narracao.png) — Um ano. Ela não é mais a estagiária nova; é só a estagiária. Innovation Week: as cadeiras viradas para a frente, a sala cheia, uma fila de estagiários mostrando o que fizeram. A próxima é ela.
- [097-b4-b4-marcos-foco.png](prints/097-b4-b4-marcos-foco.png) — Hotspot: Marcos; aura e linha de foco
- [098-b4-b4-tv-foco.png](prints/098-b4-b4-tv-foco.png) — Hotspot: Tela da sala; aura e linha de foco
- [099-b4-b4-plateia-foco.png](prints/099-b4-b4-plateia-foco.png) — Hotspot: A plateia; aura e linha de foco
- [100-b4-b4-entrega-foco.png](prints/100-b4-b4-entrega-foco.png) — Hotspot: Apresentar para a sala; aura e linha de foco
- [101-b4-preparacao-fala-1.png](prints/101-b4-preparacao-fala-1.png) — b4-preparacao, fala 1/6: marcos: Antes de entrar: se alguém perguntar o que mudou com esse projeto, o que você conta?
- [102-b4-preparacao-fala-2.png](prints/102-b4-preparacao-fala-2.png) — b4-preparacao, fala 2/6: ana: Que eu participei. Mas... não sei se ficou claro o que eu fiz.
- [103-b4-preparacao-fala-3.png](prints/103-b4-preparacao-fala-3.png) — b4-preparacao, fala 3/6: marcos: Então conta em quatro passos: situação, tarefa, ação e resultado. Como tava, o que cabia a você, o que fez e no que deu.
- [104-b4-preparacao-fala-4.png](prints/104-b4-preparacao-fala-4.png) — b4-preparacao, fala 4/6: ana: Aí mostro a minha parte sem apagar o trabalho do time.
- [105-b4-preparacao-fala-5.png](prints/105-b4-preparacao-fala-5.png) — b4-preparacao, fala 5/6: marcos: Isso. E depois dá pra contar essa história num post profissional. Tem gente que não tava na sala.
- [106-b4-preparacao-fala-6.png](prints/106-b4-preparacao-fala-6.png) — b4-preparacao, fala 6/6: marcos: Só confere o que pode sair pra fora, tá? Fala do que aprendeu sem mostrar dado interno.
- [107-b4-apresentacao-fala-1.png](prints/107-b4-apresentacao-fala-1.png) — b4-apresentacao, fala 1/4: ana: Antes, a gente anotava a conferência no papel e só passava pra planilha no fim do turno. Quem chegava depois perguntava o que faltava.
- [108-b4-apresentacao-fala-2.png](prints/108-b4-apresentacao-fala-2.png) — b4-apresentacao, fala 2/4: ana: Minha parte era deixar isso claro pro turno seguinte.
- [109-b4-apresentacao-fala-3.png](prints/109-b4-apresentacao-fala-3.png) — b4-apresentacao, fala 3/4: ana: Passei a registrar na planilha compartilhada, ali na hora. Depois conferi com o pessoal da linha se tava funcionando.
- [110-b4-apresentacao-fala-4.png](prints/110-b4-apresentacao-fala-4.png) — b4-apresentacao, fala 4/4: ana: Agora o outro turno já começa sabendo o que falta. Eu gosto de resolver essa passagem... ainda fico nervosa falando aqui na frente.
- [111-b4-reconhecimento-fala-1.png](prints/111-b4-reconhecimento-fala-1.png) — b4-reconhecimento, fala 1/3: claudia: Bom trabalho. (já de pé, notebook debaixo do braço)
- [112-b4-reconhecimento-fala-2.png](prints/112-b4-reconhecimento-fala-2.png) — b4-reconhecimento, fala 2/3: ana: Obrigada.
- [113-b4-reconhecimento-fala-3.png](prints/113-b4-reconhecimento-fala-3.png) — b4-reconhecimento, fala 3/3: claudia: Depois manda no canal do time, pra quem não veio ver também.
- [114-b4-virada-fala-1.png](prints/114-b4-virada-fala-1.png) — b4-virada, fala 1/6: bianca: (da porta) Foi muito bom, Ana. Sério.
- [115-b4-virada-fala-2.png](prints/115-b4-virada-fala-2.png) — b4-virada, fala 2/6: ana: Mas ninguém falou nada.
- [116-b4-virada-fala-3.png](prints/116-b4-virada-fala-3.png) — b4-virada, fala 3/6: bianca: Eu sei. Tava cheia de gente que já conhecia o projeto, né?
- [117-b4-virada-fala-4.png](prints/117-b4-virada-fala-4.png) — b4-virada, fala 4/6: bianca: Mas eles ouviram você contar o que mudou. Isso conta.
- [118-b4-virada-fala-5.png](prints/118-b4-virada-fala-5.png) — b4-virada, fala 5/6: ana: Nossa, eu tava tremendo por dentro. Ainda não sei se acostumo.
- [119-b4-virada-fala-6.png](prints/119-b4-virada-fala-6.png) — b4-virada, fala 6/6: bianca: Nem precisa decidir agora. Hoje você fez mesmo assim.
- [120-b4-reflexao-tempo.png](prints/120-b4-reflexao-tempo.png) — Fase 4: abertura da reflexão
- [121-b4-reflexao-1.png](prints/121-b4-reflexao-1.png) — Ana pensando: Um ano. Eu fiz coisas. Mas quem sabe disso além de mim?
- [122-b4-reflexao-2.png](prints/122-b4-reflexao-2.png) — Ana pensando: Só de pensar em ficar na frente de todo mundo, minhas mãos gelam.
- [123-b4-reflexao-3.png](prints/123-b4-reflexao-3.png) — Ana pensando: Acho que posso gostar de organizar tudo isso e ainda assim não gostar de ser o centro das atenções. Uma coisa não precisa vir com a outra.
- [124-b4-sala-reunioes-eco.png](prints/124-b4-sala-reunioes-eco.png) — Revisita concluída: As cadeiras continuam viradas para a frente. A tela ainda está acesa com a página dela, e não tem mais ninguém na sala.
- [125-b4-fecho.png](prints/125-b4-fecho.png) — Fecho da fase: O trabalho era o mesmo antes e depois da página que ela escreveu. O que mudou foi quanta gente sabia que ele existia.
- [126-b5-cartao.png](prints/126-b5-cartao.png) — Fase 5: cartão temporal e passagem de apresentação
- [127-b5-mapa.png](prints/127-b5-mapa.png) — Fase 5: mapa e lugares disponíveis
- [128-b5-outra-area.png](prints/128-b5-outra-area.png) — Fase 5: Outra área, sem overlays
- [129-b5-outra-area-narracao.png](prints/129-b5-outra-area-narracao.png) — Dois anos. O contrato fecha em três semanas. Ana quer ser efetivada, mas ainda não sabe se vai acontecer. Ela também está pensando em que área quer construir a carreira.
- [130-b5-b5-bianca-inicial-foco.png](prints/130-b5-b5-bianca-inicial-foco.png) — Hotspot: Bianca; aura e linha de foco
- [131-b5-b5-caderno-foco.png](prints/131-b5-b5-caderno-foco.png) — Hotspot: Caderno dela; aura e linha de foco
- [132-b5-b5-grade-foco.png](prints/132-b5-b5-grade-foco.png) — Hotspot: Grade do próximo semestre; aura e linha de foco
- [133-b5-contrato-fala-1.png](prints/133-b5-contrato-fala-1.png) — b5-contrato, fala 1/4: bianca: Tá chegando no fim do contrato... como isso tá batendo?
- [134-b5-contrato-fala-2.png](prints/134-b5-contrato-fala-2.png) — b5-contrato, fala 2/4: ana: Quero muito ser efetivada. Só não sei se vai rolar, e fico tentando fingir que não me preocupa.
- [135-b5-contrato-fala-3.png](prints/135-b5-contrato-fala-3.png) — b5-contrato, fala 3/4: bianca: Justo. E, tirando essa vaga, já se pegou pensando no tipo de trabalho que quer fazer?
- [136-b5-contrato-fala-4.png](prints/136-b5-contrato-fala-4.png) — b5-contrato, fala 4/4: ana: Na conferência curti organizar a informação. Na apresentação, ficar na frente da sala... nem tanto. Quero entender essa diferença.
- [137-b5-pivo-fala-1.png](prints/137-b5-pivo-fala-1.png) — b5-pivo, fala 1/6: bianca: Você circulou "passagem de turno" três vezes no caderno.
- [138-b5-pivo-fala-2.png](prints/138-b5-pivo-fala-2.png) — b5-pivo, fala 2/6: ana: Acho que gostei de descobrir onde a informação travava. Mas não sei se quero fazer isso aqui... ou em outra área.
- [139-b5-pivo-fala-3.png](prints/139-b5-pivo-fala-3.png) — b5-pivo, fala 3/6: ana: E a efetivação? Faltam três semanas e ninguém falou se tem vaga. Tento separar essa ansiedade da escolha da área, mas é difícil.
- [140-b5-pivo-fala-4.png](prints/140-b5-pivo-fala-4.png) — b5-pivo, fala 4/6: bianca: Sou formada em Letras e trabalho com documentação. Até descobrir esse caminho, achava que mudar era me desviar.
- [141-b5-pivo-fala-5.png](prints/141-b5-pivo-fala-5.png) — b5-pivo, fala 5/6: bianca: Eu vi você lá na linha, montando a conferência. E depois explicando o que mudou na reunião.
- [142-b5-pivo-fala-6.png](prints/142-b5-pivo-fala-6.png) — b5-pivo, fala 6/6: bianca: Se a vaga não aparecer, isso continua sendo seu. E a decisão também passa pelo orçamento, pelo espaço no time... nem tudo depende da gente.
- [143-b5-reflexao-tempo.png](prints/143-b5-reflexao-tempo.png) — Fase 5: abertura da reflexão
- [144-b5-reflexao-1.png](prints/144-b5-reflexao-1.png) — Ana pensando: Meu contrato está acabando. Eu quero ficar, isso eu sei.
- [145-b5-reflexao-2.png](prints/145-b5-reflexao-2.png) — Ana pensando: Mas, se me efetivarem, eu quero continuar nessa área? E se não, pra onde eu vou?
- [146-b5-reflexao-3.png](prints/146-b5-reflexao-3.png) — Ana pensando: Efetivação e escolha de carreira não são a mesma pergunta. Acho que a pergunta de verdade é: que tipo de problema eu gosto de resolver?
- [147-b5-outra-area-eco.png](prints/147-b5-outra-area-eco.png) — Revisita concluída: Ana reconheceu o que aprendeu e começou a pensar no próximo passo da carreira.
- [148-b5-fecho.png](prints/148-b5-fecho.png) — Fecho da fase: Ela não sabe se fica. Sabe o que leva se não ficar.
- [149-b6-cartao.png](prints/149-b6-cartao.png) — Fase 6: cartão temporal e passagem de apresentação
- [150-b6-mapa.png](prints/150-b6-mapa.png) — Fase 6: mapa e lugares disponíveis
- [151-b6-cafezinho.png](prints/151-b6-cafezinho.png) — Fase 6: Cafezinho, sem overlays
- [152-b6-cafezinho-narracao.png](prints/152-b6-cafezinho-narracao.png) — Três semanas. O Cafezinho está cheio, alguém trouxe bolo e ninguém está trabalhando. O time inteiro está aqui, e é por causa dela.
- [153-b6-b6-claudia-foco.png](prints/153-b6-b6-claudia-foco.png) — Hotspot: Cláudia; aura e linha de foco
- [154-b6-b6-tiago-foco.png](prints/154-b6-b6-tiago-foco.png) — Hotspot: Tiago; aura e linha de foco
- [155-b6-b6-rafael-foco.png](prints/155-b6-b6-rafael-foco.png) — Hotspot: Rafael; aura e linha de foco
- [156-b6-b6-bianca-foco.png](prints/156-b6-b6-bianca-foco.png) — Hotspot: Bianca; aura e linha de foco
- [157-b6-b6-marcos-foco.png](prints/157-b6-b6-marcos-foco.png) — Hotspot: Marcos; aura e linha de foco
- [158-b6-noticia-fala-1.png](prints/158-b6-noticia-fala-1.png) — b6-noticia, fala 1/6: claudia: Assinaram hoje cedo. Você foi efetivada. É oficial.
- [159-b6-noticia-fala-2.png](prints/159-b6-noticia-fala-2.png) — b6-noticia, fala 2/6: ana: Eu... espera, é sério?
- [160-b6-noticia-fala-3.png](prints/160-b6-noticia-fala-3.png) — b6-noticia, fala 3/6: claudia: Seu nome apareceu em três lugares diferentes na conversa de ontem.
- [161-b6-noticia-fala-4.png](prints/161-b6-noticia-fala-4.png) — b6-noticia, fala 4/6: ana: (baixo) Três lugares?
- [162-b6-noticia-fala-5.png](prints/162-b6-noticia-fala-5.png) — b6-noticia, fala 5/6: claudia: O pessoal de Produto precisava de alguém pra organizar a documentação. Foi por aí que seu nome chegou até lá.
- [163-b6-noticia-fala-6.png](prints/163-b6-noticia-fala-6.png) — b6-noticia, fala 6/6: claudia: Vem cá. Eu te mostro de onde veio cada um.
- [164-b6-tiago-pergunta-fala-1.png](prints/164-b6-tiago-pergunta-fala-1.png) — b6-tiago-pergunta, fala 1/3: tiago: Dois anos e você ainda pergunta. Gosto disso.
- [165-b6-tiago-pergunta-fala-2.png](prints/165-b6-tiago-pergunta-fala-2.png) — b6-tiago-pergunta, fala 2/3: ana: Eu ainda não entendo metade do que você fala.
- [166-b6-tiago-pergunta-fala-3.png](prints/166-b6-tiago-pergunta-fala-3.png) — b6-tiago-pergunta, fala 3/3: tiago: Nem eu. A gente descobre junto.
- [167-b6-rafael-ramal-fala-1.png](prints/167-b6-rafael-ramal-fala-1.png) — b6-rafael-ramal, fala 1/2: rafael: Anotei seu ramal. Pra ficar justo, né?
- [168-b6-rafael-ramal-fala-2.png](prints/168-b6-rafael-ramal-fala-2.png) — b6-rafael-ramal, fala 2/2: ana: (ri) Sem cartão dessa vez, hein.
- [169-b6-bianca-mudanca-fala-1.png](prints/169-b6-bianca-mudanca-fala-1.png) — b6-bianca-mudanca, fala 1/2: bianca: Eu falei que dava pra mudar de ideia no meio do caminho, lembra?
- [170-b6-bianca-mudanca-fala-2.png](prints/170-b6-bianca-mudanca-fala-2.png) — b6-bianca-mudanca, fala 2/2: ana: Eu achava que gostava da planilha. Acho que gostei mesmo foi de fazer a informação chegar a quem precisava.
- [171-b6-marcos-proximo-fala-1.png](prints/171-b6-marcos-proximo-fala-1.png) — b6-marcos-proximo, fala 1/2: marcos: Ano que vem você apresenta de novo? Agora do outro lado da mesa.
- [172-b6-marcos-proximo-fala-2.png](prints/172-b6-marcos-proximo-fala-2.png) — b6-marcos-proximo, fala 2/2: ana: Pode ser. Da próxima vez quero trazer um projeto desde o começo.
- [173-b6-reflexao-tempo.png](prints/173-b6-reflexao-tempo.png) — Fase 6: abertura da reflexão
- [174-b6-reflexao-1.png](prints/174-b6-reflexao-1.png) — Ana pensando: Último dia de contrato. Eu não sei como isso vai terminar.
- [175-b6-reflexao-2.png](prints/175-b6-reflexao-2.png) — Ana pensando: No primeiro dia eu nem sabia como pedir uma senha. Hoje eu sei o que gosto, o que aprendi e o que ainda quero aprender.
- [176-b6-reflexao-3.png](prints/176-b6-reflexao-3.png) — Ana pensando: Seja qual for a resposta, essa história é minha.
- [177-b6-cafezinho-eco.png](prints/177-b6-cafezinho-eco.png) — Revisita concluída: Ninguém voltou pra mesa depois disso.
- [178-b6-fecho.png](prints/178-b6-fecho.png) — Fecho da fase: Tudo o que ela carregou, ela usou. Tudo o que ela aprendeu, ela é.
- [179-b1-notebook-acao.png](prints/179-b1-notebook-acao.png) — Progressão: ação de Notebook
- [180-b1-notebook-consequencia.png](prints/180-b1-notebook-consequencia.png) — Progressão após Notebook: elenco, objetos e habilidades
- [181-b1-tiago-acao.png](prints/181-b1-tiago-acao.png) — Progressão: ação de Tiago
- [182-b1-tiago-consequencia.png](prints/182-b1-tiago-consequencia.png) — Progressão após Tiago: elenco, objetos e habilidades
- [183-b1-claudia-acao.png](prints/183-b1-claudia-acao.png) — Progressão: ação de Cláudia
- [184-b1-claudia-consequencia.png](prints/184-b1-claudia-consequencia.png) — Progressão após Cláudia: elenco, objetos e habilidades
- [185-b1-rafael-acao.png](prints/185-b1-rafael-acao.png) — Progressão: ação de Rafael
- [186-b1-rafael-consequencia.png](prints/186-b1-rafael-consequencia.png) — Progressão após Rafael: elenco, objetos e habilidades
- [187-b1-tela-acao.png](prints/187-b1-tela-acao.png) — Progressão: ação de Tela aberta
- [188-b1-tela-consequencia.png](prints/188-b1-tela-consequencia.png) — Progressão após Tela aberta: elenco, objetos e habilidades
- [189-b2-bianca-acao.png](prints/189-b2-bianca-acao.png) — Progressão: ação de Bianca
- [190-b2-bianca-consequencia.png](prints/190-b2-bianca-consequencia.png) — Progressão após Bianca: elenco, objetos e habilidades
- [191-b2-maquina-acao.png](prints/191-b2-maquina-acao.png) — Progressão: ação de Máquina de café
- [192-b2-maquina-consequencia.png](prints/192-b2-maquina-consequencia.png) — Progressão após Máquina de café: elenco, objetos e habilidades
- [193-b2-rafael-acao.png](prints/193-b2-rafael-acao.png) — Progressão: ação de Rafael
- [194-b2-rafael-consequencia.png](prints/194-b2-rafael-consequencia.png) — Progressão após Rafael: elenco, objetos e habilidades
- [195-b2-notebook-acao.png](prints/195-b2-notebook-acao.png) — Progressão: ação de Notebook da Ana
- [196-b2-notebook-consequencia.png](prints/196-b2-notebook-consequencia.png) — Progressão após Notebook da Ana: elenco, objetos e habilidades
- [197-b3-tiago-acao.png](prints/197-b3-tiago-acao.png) — Progressão: ação de Tiago
- [198-b3-tiago-consequencia.png](prints/198-b3-tiago-consequencia.png) — Progressão após Tiago: elenco, objetos e habilidades
- [199-b3-monitor-acao.png](prints/199-b3-monitor-acao.png) — Progressão: ação de Números da linha
- [200-b3-monitor-consequencia.png](prints/200-b3-monitor-consequencia.png) — Progressão após Números da linha: elenco, objetos e habilidades
- [201-b3-relatorio-acao.png](prints/201-b3-relatorio-acao.png) — Progressão: ação de Relatório
- [202-b3-relatorio-consequencia.png](prints/202-b3-relatorio-consequencia.png) — Progressão após Relatório: elenco, objetos e habilidades
- [203-b3-claudia-acao.png](prints/203-b3-claudia-acao.png) — Progressão: ação de Cláudia
- [204-b3-claudia-consequencia.png](prints/204-b3-claudia-consequencia.png) — Progressão após Cláudia: elenco, objetos e habilidades
- [205-b4-marcos-acao.png](prints/205-b4-marcos-acao.png) — Progressão: ação de Marcos
- [206-b4-marcos-consequencia.png](prints/206-b4-marcos-consequencia.png) — Progressão após Marcos: elenco, objetos e habilidades
- [207-b4-tv-acao.png](prints/207-b4-tv-acao.png) — Progressão: ação de Tela da sala
- [208-b4-tv-consequencia.png](prints/208-b4-tv-consequencia.png) — Progressão após Tela da sala: elenco, objetos e habilidades
- [209-b4-plateia-acao.png](prints/209-b4-plateia-acao.png) — Progressão: ação de A plateia
- [210-b4-plateia-consequencia.png](prints/210-b4-plateia-consequencia.png) — Progressão após A plateia: elenco, objetos e habilidades
- [211-b4-entrega-acao.png](prints/211-b4-entrega-acao.png) — Progressão: ação de Apresentar para a sala
- [212-b4-entrega-silencio.png](prints/212-b4-entrega-silencio.png) — Progressão: plateia saiu e a sala permanece em silêncio
- [213-b4-entrega-consequencia.png](prints/213-b4-entrega-consequencia.png) — Progressão após Apresentar para a sala: elenco, objetos e habilidades
- [214-b4-claudia-acao.png](prints/214-b4-claudia-acao.png) — Progressão: ação de Cláudia
- [215-b4-claudia-consequencia.png](prints/215-b4-claudia-consequencia.png) — Progressão após Cláudia: elenco, objetos e habilidades
- [216-b4-bianca-acao.png](prints/216-b4-bianca-acao.png) — Progressão: ação de Bianca
- [217-b4-bianca-consequencia.png](prints/217-b4-bianca-consequencia.png) — Progressão após Bianca: elenco, objetos e habilidades
- [218-b5-bianca-inicial-acao.png](prints/218-b5-bianca-inicial-acao.png) — Progressão: ação de Bianca
- [219-b5-bianca-inicial-consequencia.png](prints/219-b5-bianca-inicial-consequencia.png) — Progressão após Bianca: elenco, objetos e habilidades
- [220-b5-caderno-acao.png](prints/220-b5-caderno-acao.png) — Progressão: ação de Caderno dela
- [221-b5-caderno-consequencia.png](prints/221-b5-caderno-consequencia.png) — Progressão após Caderno dela: elenco, objetos e habilidades
- [222-b5-grade-acao.png](prints/222-b5-grade-acao.png) — Progressão: ação de Grade do próximo semestre
- [223-b5-grade-consequencia.png](prints/223-b5-grade-consequencia.png) — Progressão após Grade do próximo semestre: elenco, objetos e habilidades
- [224-b5-bianca-acao.png](prints/224-b5-bianca-acao.png) — Progressão: ação de Bianca
- [225-b5-bianca-consequencia.png](prints/225-b5-bianca-consequencia.png) — Progressão após Bianca: elenco, objetos e habilidades
- [226-b6-tiago-acao.png](prints/226-b6-tiago-acao.png) — Progressão: ação de Tiago
- [227-b6-tiago-consequencia.png](prints/227-b6-tiago-consequencia.png) — Progressão após Tiago: elenco, objetos e habilidades
- [228-b6-rafael-acao.png](prints/228-b6-rafael-acao.png) — Progressão: ação de Rafael
- [229-b6-rafael-consequencia.png](prints/229-b6-rafael-consequencia.png) — Progressão após Rafael: elenco, objetos e habilidades
- [230-b6-bianca-acao.png](prints/230-b6-bianca-acao.png) — Progressão: ação de Bianca
- [231-b6-bianca-consequencia.png](prints/231-b6-bianca-consequencia.png) — Progressão após Bianca: elenco, objetos e habilidades
- [232-b6-marcos-acao.png](prints/232-b6-marcos-acao.png) — Progressão: ação de Marcos
- [233-b6-marcos-consequencia.png](prints/233-b6-marcos-consequencia.png) — Progressão após Marcos: elenco, objetos e habilidades
- [234-b6-claudia-acao.png](prints/234-b6-claudia-acao.png) — Progressão: ação de Cláudia
- [235-b6-claudia-consequencia.png](prints/235-b6-claudia-consequencia.png) — Progressão após Cláudia: elenco, objetos e habilidades
- [236-b1-senha-inicio.png](prints/236-b1-senha-inicio.png) — Minigame: Senha temporária de primeiro acesso; Três campos, três pessoas. Cada uma sabe um pedaço; ninguém sabe a senha inteira.
- [237-b1-senha-erro.png](prints/237-b1-senha-erro.png) — A senha não abriu. Confira os três campos.
- [238-b1-senha-acerto.png](prints/238-b1-senha-acerto.png) — Senha completa: NOVO / 12 / 03
- [239-b1-senha-apos.png](prints/239-b1-senha-apos.png) — Retorno à cena depois da resolução
- [240-b1-senha-lembranca.png](prints/240-b1-senha-lembranca.png) — Revisita do minigame: Notebook: Consegui entrar no sistema. Precisei de três pessoas pra isso, e tudo bem.
- [241-b2-associar-inicio.png](prints/241-b2-associar-inicio.png) — Minigame: Planejar e aprender na prática; Ligue cada situação a uma prática que pode ajudar.
- [242-b2-associar-erro.png](prints/242-b2-associar-erro.png) — Essa prática não resolve essa situação.
- [243-b2-associar-par-1.png](prints/243-b2-associar-par-1.png) — Associação correta 1: Chegam pedidos de todo lado e já estou esquecendo prazos. → Anoto na hora o prazo, quem pediu e o que preciso entregar.
- [244-b2-associar-par-2.png](prints/244-b2-associar-par-2.png) — Associação correta 2: Duas entregas disputam atenção: uma vence hoje, a outra exige foco. → Avalio urgência e esforço; deixo a tarefa mais pesada para a manhã.
- [245-b2-associar-par-3.png](prints/245-b2-associar-par-3.png) — Associação correta 3: No trabalho pediram uma ferramenta que ainda não sei usar. → Faço um curso curto da ferramenta e já pratico no trabalho.
- [246-b2-associar-par-4.png](prints/246-b2-associar-par-4.png) — Associação correta 4: Quero acompanhar projetos e documentos de equipes de outros países. → Estudo inglês para entender documentos e participar das conversas.
- [247-b2-associar-apos.png](prints/247-b2-associar-apos.png) — Retorno à cena depois da resolução
- [248-b2-associar-lembranca.png](prints/248-b2-associar-lembranca.png) — Revisita do minigame: Notebook: Cruzei cada tema de estudo com um problema real do meu dia. Ainda não sei onde vou usar tudo isso, mas já comecei.
- [249-b3-estruturar-inicio.png](prints/249-b3-estruturar-inicio.png) — Minigame: A proposta dela, em três campos; Cada trecho vai num campo. Dois não entram em lugar nenhum — estruturar é escolher.
- [250-b3-estruturar-erro.png](prints/250-b3-estruturar-erro.png) — Esse trecho não responde o que o campo pergunta.
- [251-b3-estruturar-distrator.png](prints/251-b3-estruturar-distrator.png) — Isso é verdade. Mas ninguém consegue fazer nada com isso.
- [252-b3-estruturar-campo-1.png](prints/252-b3-estruturar-campo-1.png) — Problema: A conferência de cada lote é anotada no papel e só digitada no fim do turno.
- [253-b3-estruturar-campo-2.png](prints/253-b3-estruturar-campo-2.png) — Solução: Conferir direto na planilha compartilhada, no momento da conferência.
- [254-b3-estruturar-campo-3.png](prints/254-b3-estruturar-campo-3.png) — Impacto: O turno seguinte começa sabendo o que ficou pendente, sem esperar a digitação.
- [255-b3-estruturar-apos.png](prints/255-b3-estruturar-apos.png) — Retorno à cena depois da resolução
- [256-b3-estruturar-lembranca.png](prints/256-b3-estruturar-lembranca.png) — Revisita do minigame: Clipboard · Relatório: Os números que pareciam soltos agora contam uma história. Ninguém pediu, mas está feito e leva o meu nome.
- [257-b4-montar-inicio.png](prints/257-b4-montar-inicio.png) — Minigame: Uma página para o gestor; Quatro campos, quatro peças. Cada peça pertence a um campo.
- [258-b4-montar-erro.png](prints/258-b4-montar-erro.png) — Essa peça não é desse campo.
- [259-b4-montar-campo-1.png](prints/259-b4-montar-campo-1.png) — Situação: A conferência dos lotes só era digitada no fim do turno.
- [260-b4-montar-campo-2.png](prints/260-b4-montar-campo-2.png) — Tarefa: Garantir que as pendências chegassem claras ao turno seguinte.
- [261-b4-montar-campo-3.png](prints/261-b4-montar-campo-3.png) — Ação: Passei a conferência para a planilha compartilhada, na hora.
- [262-b4-montar-campo-4.png](prints/262-b4-montar-campo-4.png) — Resultado: O turno seguinte já começa sabendo o que ficou pendente.
- [263-b4-montar-apos.png](prints/263-b4-montar-apos.png) — Retorno à cena depois da resolução
- [264-b4-montar-lembranca.png](prints/264-b4-montar-lembranca.png) — Revisita do minigame: Telão: Situação, tarefa, ação e resultado no lugar. O que eu fiz deixou de ser só meu e passou a poder ser visto.
- [265-inventario-final.png](prints/265-inventario-final.png) — Três itens tardios e nove habilidades; estado de documentação
- [266-item-anotacoes-treinamento-recebido.png](prints/266-item-anotacoes-treinamento-recebido.png) — Recebimento de Anotações do treinamento
- [267-item-anotacoes-treinamento-descricao.png](prints/267-item-anotacoes-treinamento-descricao.png) — Anotações do treinamento: Tudo o que ouço e preciso lembrar, registrado na hora.
- [268-item-relatorio-recebido.png](prints/268-item-relatorio-recebido.png) — Recebimento de Relatório
- [269-item-relatorio-descricao.png](prints/269-item-relatorio-descricao.png) — Relatório: Três páginas sobre uma falha na passagem de turno. Quem percebe o problema antes de receber a tarefa?
- [270-item-cartao-rafael-recebido.png](prints/270-item-cartao-rafael-recebido.png) — Recebimento de Cartão do Rafael
- [271-item-cartao-rafael-descricao.png](prints/271-item-cartao-rafael-descricao.png) — Cartão do Rafael: Rafael escreveu o ramal atrás, à mão. Uma conversa do primeiro dia ainda pode abrir uma porta?
- [272-item-certificado-degree-recebido.png](prints/272-item-certificado-degree-recebido.png) — Recebimento de Certificado de conclusão
- [273-item-certificado-degree-descricao.png](prints/273-item-certificado-degree-descricao.png) — Certificado de conclusão: Uma trilha escolhida a partir do que o trabalho já pede. O que Ana decidiu aprender por conta própria?
- [274-item-cracha-innovation-recebido.png](prints/274-item-cracha-innovation-recebido.png) — Recebimento de Crachá do Innovation
- [275-item-cracha-innovation-descricao.png](prints/275-item-cracha-innovation-descricao.png) — Crachá do Innovation: Ana apresentou a melhoria na passagem de turno. Quem viu o trabalho dela chegar até ali?
- [276-habilidade-coragem-perguntar.png](prints/276-habilidade-coragem-perguntar.png) — Coragem de perguntar: Perguntar não é admitir que você não sabe. É o jeito mais rápido de passar a saber.
- [277-habilidade-autoconhecimento.png](prints/277-habilidade-autoconhecimento.png) — Autoconhecimento: Saber responder 'o que te trouxe aqui' antes que alguém pergunte.
- [278-habilidade-leitura-mercado.png](prints/278-habilidade-leitura-mercado.png) — Leitura do que o trabalho pede: Entender o que é urgente, o que dá mais trabalho e o que o time precisa primeiro.
- [279-habilidade-aprendizado-continuo.png](prints/279-habilidade-aprendizado-continuo.png) — Aprendizado contínuo: Ninguém aqui parou de estudar. Nem quem já chegou.
- [280-habilidade-competencia-tecnica.png](prints/280-habilidade-competencia-tecnica.png) — Competência que ela foi buscar: Aprender o que ainda não sabia fazer. Serviu antes do que ela imaginava.
- [281-habilidade-proatividade.png](prints/281-habilidade-proatividade.png) — Proatividade: Resolver o que ninguém mandou é o que te diferencia de quem só cumpre.
- [282-habilidade-protagonismo.png](prints/282-habilidade-protagonismo.png) — Protagonismo: Liderança não vem com cargo. Vem de assumir o que ninguém assumiu.
- [283-habilidade-visibilidade.png](prints/283-habilidade-visibilidade.png) — Visibilidade: Trabalho que ninguém sabe que existe não vira oportunidade sozinho.
- [284-habilidade-plano-futuro.png](prints/284-habilidade-plano-futuro.png) — Plano de futuro: Onde eu quero estar não é uma pergunta pra depois. É a pergunta que organiza o agora.
- [285-b4-pausa.png](prints/285-b4-pausa.png) — Pausa dramática depois da apresentação: ausência de recompensa imediata
- [286-final-mapa-inicial.png](prints/286-final-mapa-inicial.png) — Revelação: mapa antes das quatro conexões
- [287-final-conexao-1.png](prints/287-final-conexao-1.png) — Perguntaram ao Rafael se ele conhecia alguém. Ele disse seu nome.
- [288-final-conexao-2.png](prints/288-final-conexao-2.png) — A vaga pedia alguém disposto a aprender o que ainda não sabia. Ela tinha quarenta horas que ninguém mandou fazer.
- [289-final-conexao-3.png](prints/289-final-conexao-3.png) — Na conversa de ontem, duas pessoas da Innovation Week lembravam dela.
- [290-final-conexao-4.png](prints/290-final-conexao-4.png) — Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu. "Guardei seu nome."
- [291-final-barra-vazia.png](prints/291-final-barra-vazia.png) — Itens consumidos; habilidades permanecem
- [292-final-ana-futura-pergunta.png](prints/292-final-ana-futura-pergunta.png) — Versão futura e pergunta do fecho
- [293-final-ana-futura.png](prints/293-final-ana-futura.png) — Sustentação visual depois da pergunta
- [294-perguntas-1.png](prints/294-perguntas-1.png) — Primeira pergunta final
- [295-perguntas-2.png](prints/295-perguntas-2.png) — Pergunta final 2
- [296-perguntas-3.png](prints/296-perguntas-3.png) — Pergunta final 3
- [297-abertura-retomada.png](prints/297-abertura-retomada.png) — Abertura com progresso salvo: continuar ou reiniciar
