# Spec — Apresentação Interativa "A Jornada do Estágio"

> **Status:** pronto para implementação. Não publicado em issue tracker — nenhum tracker está configurado neste projeto. Rodar `/setup-matt-pocock-skills` e depois publicar aplicando a label `ready-for-agent`.
>
> **Vocabulário:** este spec usa o vocabulário de domínio estabelecido em `docs/roteiro/00-fundamentos.md` — bloco, lugar, base recorrente, item imediato, item tardio, skill, cartão de transição, leva-e-traz de alcance curto, hotspot, ponto de parada, conexão, barra de itens, painel de skills. Não há ADRs neste projeto.

---

## Problem Statement

Cinco apresentadores precisam conduzir, ao vivo e em ~50 minutos, uma apresentação sobre a jornada de estágio — cada um dono de um bloco temático, cobrindo dez temas (timidez, autoconhecimento, competências x faculdade, plataformas de estudo, proatividade, projetos internos, visibilidade, planejamento, efetivação, carreira contínua). A tese que fecha tudo é *"o conhecimento fica, as chances aparecem."*

Slides não conseguem entregar essa tese. A tese depende de a plateia **acumular** coisas ao longo de dois anos narrativos e só depois perceber que aquilo convergiu. Num deck de bullet points, "networking importa" é uma afirmação que a plateia aceita ou não; não há como fazer a plateia *carregar* um cartão de visita por 40 minutos sem usar e depois descobrir que foi ele que abriu a porta. A conexão entre esforço disperso e oportunidade futura é uma experiência temporal, e slides não têm eixo de tempo nem estado acumulado.

Agravantes do contexto real da apresentação:

- É **ao vivo**, por Teams com compartilhamento de tela, sem ensaio infinito e sem segunda chance.
- Parte da plateia assiste em TV projetada, parte em notebook — legibilidade é desigual e a compressão de vídeo do Teams degrada detalhe fino.
- Há **cinco passagens de bastão**, e cada troca é um momento de atrito onde o ritmo pode morrer.
- Não há operador técnico dedicado nem rede de segurança: se algo travar na frente da plateia, travou.

## Solution

Uma aplicação de apresentação interativa em estilo point-and-click, narrada ao vivo pelos apresentadores, onde a plateia assiste a protagonista (Ana, estagiária) atravessar dois anos de contrato.

A navegação é **hub-and-spoke**: um mapa central com seis lugares (Escritório, Cafezinho, Sala de Treinamento, Laboratório, Innovation, Sala de Reuniões), com botão de voltar. Os seis slots aparecem silhuetados e sem nome desde o início — o nome é revelado no desbloqueio, que é progressivo. O Escritório é **base recorrente**: visitado em vários blocos com conteúdo diferente.

Dois sistemas de progressão deliberadamente separados:

- **Itens** ocupam uma barra inferior sempre visível. São selecionáveis e usáveis em NPCs e objetos de cena. Cinco são imediatos (usados no mesmo bloco); três são **itens tardios** (cartão do Rafael, certificado do Degree, crachá do Innovation) que ficam sem uso aparente até o final, totalmente misturados aos outros.
- **Skills** ocupam um painel lateral, como lista de texto, com peso visual deliberadamente diferente — não parecem objetos equipáveis. Nunca se gastam.

Entre blocos, um **cartão de transição** em tela cheia marca o salto de tempo (Primeiro dia → 1 mês depois → 6 meses depois → 1 ano depois → 2 anos depois). O cartão faz três trabalhos simultâneos: marca capítulo, cobre a troca de sprite da protagonista, e dá o respiro social para a passagem de bastão sem ninguém precisar anunciar.

O clímax acontece **no próprio mapa** que a plateia olhou por 50 minutos. Chega um convite de vaga, e quatro conexões são traçadas uma a uma, por clique do apresentador: os três itens tardios ligam-se ao convite como **portas** (indicação, competência, visibilidade) e a skill de proatividade liga-se como **motivo**. Os itens se apagam da barra ao conectar; a skill permanece acesa. Ao fim, a barra de itens esvazia e sai de cena, e o painel de skills permanece sozinho na tela — a tese em imagem, sem uma linha de texto explicando.

O objetivo do final é **reconhecimento, não surpresa**: se a plateia já suspeitava, melhor. Não é "não vi vindo", é *"claro, era isso o tempo todo"*.

## User Stories

### Apresentador — condução ao vivo

1. Como apresentador, quero que todo avanço seja disparado por clique meu, para que nada aconteça na tela enquanto eu ainda estou falando.
2. Como apresentador, quero que nenhuma transição ocorra por timer, para que eu nunca precise correr atrás da tela.
3. Como apresentador, quero que a única transição automática da apresentação seja a entrada no mapa no clímax, para que aquele momento tenha peso diferente de todos os outros.
4. Como apresentador, quero poder esticar a pausa dramática do Bloco 4 indefinidamente, para que eu possa calibrar o desconforto da plateia ao vivo.
5. Como apresentador, quero que o jogo funcione identicamente independente de qual dos cinco está operando, para que a troca de apresentador não exija conhecimento técnico.
6. Como apresentador, quero um cartão de transição em tela cheia entre blocos, para que eu tenha três segundos de respiro para assumir a fala do próximo bloco.
7. Como apresentador, quero que o cartão de transição mostre o salto de tempo e o título do bloco, para que a plateia entenda a mudança de capítulo sem eu explicar.
8. Como apresentador, quero clicar de novo durante a caminhada da protagonista para teleportá-la ao destino, para que eu não fique esperando o sprite atravessar a tela no meio de uma fala.
9. Como apresentador, quero que cada conexão do clímax seja disparada por clique separado, para que eu possa falar por cima de cada uma no meu ritmo.
10. Como apresentador, quero que as três perguntas finais apareçam uma por clique, para que eu controle o silêncio entre elas.
11. Como apresentador, quero avançar diálogos por clique, para que eu possa sincronizar a fala do NPC com a minha narração.
12. Como apresentador, quero que clicar num lugar já concluído abra a cena em estado concluído em vez de dar erro, para que um clique acidental não quebre a apresentação.
13. Como apresentador, quero que lugar concluído nunca repita puzzle nem diálogo, para que eu nunca seja forçado a rejogar algo ao vivo.
14. Como apresentador, quero poder mostrar a descrição de qualquer item clicando nele, para que eu possa dar close num objeto quando a minha fala pedir.
15. Como apresentador, quero poder usar um item tardio num NPC e receber uma resposta, para que eu possa encenar deliberadamente que aquele item não serve para nada ainda.
16. Como apresentador, quero recarregar a página para reiniciar a apresentação do zero, para que eu possa ensaiar de novo sem procedimento especial.

### Plateia — compreensão e experiência

17. Como membro da plateia, quero ver os seis lugares silhuetados desde o início, para que eu entenda o tamanho da jornada sem saber o que vem.
18. Como membro da plateia, quero que os nomes dos lugares fiquem escondidos até o desbloqueio, para que os títulos não anunciem o arco da história antes da hora.
19. Como membro da plateia, quero ver o mapa crescer ao longo da apresentação, para que eu sinta progressão acumulando.
20. Como membro da plateia, quero ver a barra de itens sempre visível, para que eu registre passivamente que existem coisas guardadas sem uso.
21. Como membro da plateia, quero que os itens tardios fiquem misturados aos itens normais, para que eu não seja avisado de quais são especiais.
22. Como membro da plateia, quero ver o painel de skills com aparência diferente da barra de itens, para que eu entenda sem explicação que são naturezas diferentes.
23. Como membro da plateia, quero ver o painel de skills preencher a cada bloco, para que "o conhecimento fica" seja algo que eu vi acontecer e não algo que me disseram.
24. Como membro da plateia, quero ver a postura da protagonista mudar entre blocos, para que eu perceba o arco dela sem ninguém apontar.
25. Como membro da plateia, quero ver os mesmos cinco NPCs reaparecerem ao longo dos dois anos, para que eu tenha relação com eles quando importar no final.
26. Como membro da plateia, quero ver os NPCs também evoluírem, para que "carreira em construção contínua" valha para todos e não só para a protagonista.
27. Como membro da plateia, quero que um item adquirido num lugar destrave algo em outro, para que eu aprenda a gramática "coisa antiga abre porta nova" antes do clímax.
28. Como membro da plateia, quero ver a protagonista usar no Laboratório o que ela estudou na Sala de Treinamento, para que eu experimente uma versão pequena da tese no meio da apresentação.
29. Como membro da plateia, quero que cada conexão do clímax venha com uma linha curta de texto, para que a mensagem chegue mesmo se a compressão do vídeo degradar a imagem.
30. Como membro da plateia, quero ver os itens se apagarem ao conectar e as skills permanecerem, para que eu veja a tese em vez de ouvi-la.
31. Como membro da plateia, quero que a apresentação termine nas três perguntas em silêncio, sem tela de créditos, para que a última coisa na minha frente seja uma pergunta sobre mim.
32. Como membro da plateia assistindo num notebook, quero texto grande e alto contraste, para que eu consiga ler tudo numa tela pequena com vídeo comprimido.
33. Como membro da plateia, quero que a pausa depois da entrega grande não tenha nenhuma celebração, para que eu sinta a frustração do esforço invisível em vez de ler sobre ela.

### Progressão e regras de jogo

34. Como apresentador, quero que o notebook do Bloco 1 exija três campos preenchidos por três NPCs diferentes, para que a plateia veja que o problema é social e não lógico.
35. Como apresentador, quero que nenhum NPC do Bloco 1 tenha a senha inteira, para que "ninguém entrega de bandeja" seja mecânica e não fala.
36. Como apresentador, quero que o monitor do Laboratório não libere o puzzle sem as Anotações do treinamento, para que o elo entre estudo e resultado seja obrigatório e não decorativo.
37. Como apresentador, quero que a Sala de Treinamento só destrave com a indicação de trilha, para que o Cafezinho tenha consequência.
38. Como apresentador, quero que o Innovation só destrave depois do Relatório entregue, para que a ordem proatividade→canal institucional seja respeitada.
39. Como apresentador, quero que o leva-e-traz tenha alcance curto (mesmo bloco ou bloco imediatamente anterior), para que nenhum apresentador seja obrigado a narrar cena de bloco alheio.
40. Como apresentador, quero entregar o Relatório à Cláudia voltando ao Escritório, para que a base recorrente feche o ciclo sem inventar lugar novo.
41. Como apresentador, quero que combinações erradas de item e alvo devolvam sempre a mesma mensagem genérica, para que eu nunca seja surpreendido por um texto que não ensaiei.
42. Como apresentador, quero que os três itens tardios cheguem intactos ao Bloco 5, para que a revelação tenha o que revelar.
43. Como apresentador, quero que nenhuma ação dos blocos 1 a 4 consuma um item tardio, para que seja impossível quebrar o clímax por acidente.
44. Como apresentador, quero que cada um dos quatro puzzles seja resolvível em menos de 40 segundos, para que o jogo nunca roube o palco da fala.
45. Como apresentador, quero que a regra de cada puzzle seja óbvia olhando a tela, para que eu não precise explicar mecânica de jogo durante uma apresentação sobre carreira.
46. Como apresentador, quero que o puzzle de estruturar tenha dois fragmentos distratores que não encaixam em lugar nenhum, para que a plateia veja que estruturar é escolher e não preencher.
47. Como apresentador, quero que o puzzle de montar do Bloco 4 seja o mais satisfatório dos quatro, para que o silêncio seguinte doa mais.
48. Como apresentador, quero que as nove skills estejam todas presentes ao fim, para que o painel final tenha densidade suficiente para sustentar a tese.

### Dono do projeto — manutenção de conteúdo e arte

49. Como dono do projeto, quero substituir qualquer imagem trocando um arquivo de mesmo nome, para que eu possa refazer arte que eu não gostei sem tocar em código.
50. Como dono do projeto, quero que todo asset seja referenciado por um manifest central, para que eu saiba exatamente quais imagens existem e o que cada uma é.
51. Como dono do projeto, quero placeholders gerados automaticamente para tudo, para que a apresentação rode de ponta a ponta antes de qualquer arte existir.
52. Como dono do projeto, quero que um asset faltando caia no placeholder em vez de mostrar imagem quebrada, para que nada apareça como buraco na frente da plateia.
53. Como dono do projeto, quero um arquivo de prompts com preâmbulo de estilo travado, para que regenerar uma imagem isolada não quebre a consistência visual do conjunto.
54. Como dono do projeto, quero editar falas de NPC sem precisar entender a arquitetura, para que eu possa reescrever o roteiro com a minha voz.
55. Como dono do projeto, quero que uma referência quebrada no conteúdo falhe na compilação, para que eu descubra o erro ao salvar o arquivo e não na frente da plateia.
56. Como dono do projeto, quero autocomplete dos ids de item e lugar ao escrever conteúdo, para que eu não precise decorar nomes internos.
57. Como dono do projeto, quero trocar o nome da protagonista editando um único lugar, para que a decisão de nome possa ficar para depois.
58. Como dono do projeto, quero que as caixas de diálogo sejam dimensionadas com folga, para que um nome ou fala mais longa não quebre layout no dia.
59. Como dono do projeto, quero que cada apresentador possa reescrever o roteiro do próprio bloco isoladamente, para que a edição de um bloco não afete os outros.
60. Como dono do projeto, quero escolhas de fala da protagonista que não alteram progressão, para que cada apresentador escolha a resposta que combina com a narração dele.

### Robustez para apresentação ao vivo

61. Como apresentador, quero que a apresentação rode sem internet depois de carregada, para que queda de rede não derrube o conteúdo.
62. Como apresentador, quero que não haja backend nem persistência, para que não exista serviço externo capaz de falhar durante a apresentação.
63. Como apresentador, quero que a apresentação não dependa de áudio, para que esquecer de compartilhar som no Teams não custe nada.
64. Como apresentador, quero canvas de dimensão fixa escalado por transformação, para que a posição que eu vi no meu monitor seja exatamente a projetada.
65. Como apresentador, quero que nenhum elemento de debug seja visível na tela compartilhada, para que a ilusão não quebre.
66. Como apresentador, quero animações lentas e de forma grande, para que a compressão de vídeo do Teams não transforme movimento em borrão.
67. Como apresentador, quero linhas grossas de alto contraste na revelação, para que as conexões sejam visíveis para quem assiste em notebook.
68. Como apresentador, quero que a tela final não tenha nenhum botão nem logo, para que o fecho seja silêncio e não interface.

### Desenvolvedor

69. Como desenvolvedor, quero um único ponto de entrada para dirigir toda a progressão, para que a apresentação inteira seja testável sem renderizar nada.
70. Como desenvolvedor, quero um teste que jogue do primeiro clique às três perguntas finais, para que exista garantia automatizada de que a apresentação é terminável.
71. Como desenvolvedor, quero testes que verifiquem as portas de leva-e-traz nos dois sentidos, para que o elo central da narrativa não regrida silenciosamente.
72. Como desenvolvedor, quero afirmar que a barra de itens esvazia e as nove skills permanecem ao fim, para que a tese seja verificada e não só desenhada.
73. Como desenvolvedor, quero que a integridade do grafo de conteúdo seja exercitada pelos mesmos testes de progressão, para que não exista uma segunda seam de teste.
74. Como desenvolvedor, quero que os testes não dependam de layout nem de componentes, para que trocar arte e reposicionar hotspots não quebre a suíte.

## Implementation Decisions

### Stack e arquitetura

- **Vite + React + TypeScript**, front-end apenas, sem backend e sem persistência. Todo estado em memória.
- **Sem router.** As telas são função do estado, não de URL. Não há navegação por histórico do browser.
- **Zustand** como store única de estado global. Escolhido sobre `useReducer` + Context por eliminar boilerplate e prop drilling num app onde quase toda tela lê estado.
- **Canvas de dimensão fixa 1920×1080**, centralizado e escalado por transformação CSS. Hotspots posicionados em coordenadas percentuais relativas ao canvas. Responsividade real foi rejeitada: não há usuário em celular, há um compartilhamento de tela conhecido, e canvas fixo garante paridade exata entre o monitor de quem constrói e a tela de quem assiste.

### Conteúdo como código

- Todo o conteúdo (falas de NPC, descrições de item, textos de skill, gabaritos de puzzle, definições de hotspot, cartões de transição) vive em **módulos TypeScript tipados**, não em JSON.
- A razão é o palco: em JSON, trocar o id de um item e esquecer de atualizar a referência num hotspot não produz erro até o momento do clique — falha silenciosa que aparece ao vivo. Em TS tipado, não compila. Trocar falha-em-runtime por falha-em-compilação é a decisão central deste projeto, porque não existe operador nem rede de segurança.
- Ids de item, lugar, NPC, skill e puzzle são tipos literais unidos, de modo que qualquer referência inválida seja erro de tipo e o autor do conteúdo tenha autocomplete.
- O conteúdo é organizado por bloco, para que cada apresentador possa reescrever o próprio bloco sem tocar nos outros.
- O nome da protagonista vive numa única constante exportada.

### Modelo de estado

A store mantém: bloco atual; conjunto de lugares e seu estado (silhuetado / destravado / concluído); conjunto de itens na barra com estado (presente / consumido); item atualmente selecionado; conjunto de skills adquiridas; estado de progressão interna de cada lugar (qual etapa do roteiro daquela cena já passou); estado de cada puzzle (não iniciado / liberado / resolvido); posição e sprite atual da protagonista; e o índice da conexão atual na sequência do clímax.

Estado derivado exposto por seletores: lugares visíveis no mapa e seus nomes revelados ou não; itens renderizáveis na barra; skills renderizáveis no painel; se o hotspot X está acionável dado o item selecionado; se o bloco atual pode ser encerrado.

**Cada bloco declara o estado que assume ter recebido.** Isso mantém o jogo consistente mesmo se a sequência for quebrada, e é o que permitiria adicionar salto entre blocos depois sem redesenhar nada.

### Navegação

- Hub-and-spoke com mapa central e botão de voltar em toda cena.
- Seis lugares: Escritório, Cafezinho, Sala de Treinamento, Laboratório, Innovation, Sala de Reuniões. Os slots aparecem silhuetados e anônimos desde o início; o desbloqueio revela o nome.
- Ordem de desbloqueio: Escritório (início) → Cafezinho (notebook aberto) → Sala de Treinamento (indicação de trilha) → Laboratório (fim do Bloco 2) → Innovation (Relatório entregue) → Sala de Reuniões (fim do Bloco 3).
- O **Escritório é base recorrente**: mesmo lugar, conteúdo diferente por bloco (senha no 1, entrega do Relatório no 3, mensagem no 5). Quem narra é sempre o dono do bloco ativo.
- Lugar concluído é **visitável em estado concluído**: cenário, uma linha de eco de estado, botão de voltar, sem puzzle e sem repetir diálogo. Bloquear o clique foi rejeitado porque hotspot que não responde parece bug quando projetado.
- O Bloco 5 não tem lugar próprio: acontece no Escritório e depois **no mapa**.

### Protagonista e caminhada

- Personagem feminina com identidade definida, nome provisório numa constante única. Ser mulher é fato, não tema: nenhuma fala toca no assunto.
- **Quatro sprites**: encolhida (Bloco 1), neutra (Blocos 2-3), confiante (Blocos 4-5), versão futura adulta (fecho). A troca ocorre junto com o cartão de transição, de modo que a plateia nunca vê a mudança acontecer — só percebe que já aconteceu.
- **Sprite único que desliza**, com bob/inclinação sutil aplicado por CSS durante o movimento. Frames de ciclo de caminhada foram rejeitados: manter proporções e rosto consistentes entre frames é onde arte gerada por IA falha mais visivelmente. A troca para sprites multi-frame depois é substituição de asset, sem mudança de código.
- **Sem pathfinding.** Cada hotspot carrega um **ponto de parada**; a protagonista vai em linha reta até ele. Nenhum obstáculo, nenhum desvio.
- Clicar novamente durante a caminhada **teleporta** ao destino.

### Itens e skills — dois sistemas

- **Barra de itens** inferior, sempre visível. Itens são clicáveis (mostram descrição) e selecionáveis (viram cursor de uso).
- **Usar item em alvo**: itens podem ser usados em NPCs e objetos de cena. Combinação errada devolve **uma única mensagem genérica** para tudo. Mensagens customizadas por combinação foram consideradas e rejeitadas em favor de simplicidade e previsibilidade ao vivo.
- Cinco **itens imediatos**: Senha, Indicação de trilha, Anotações do treinamento, Relatório, Projeto entregue.
- Três **itens tardios**: Cartão do Rafael, Certificado do Degree, Crachá do Innovation. Ficam **totalmente misturados** aos imediatos, sem marcação visual, área separada ou restrição de seleção. Qualquer separação anunciaria o twist. Descrições são factuais e não insinuam uso futuro.
- **Painel de skills** lateral, como lista de texto, sem ícone e sem moldura — peso visual deliberadamente diferente da barra de itens, para que não pareçam equipáveis. Nove skills, acumuladas ao longo dos blocos, nunca consumidas.
- A separação entre os dois sistemas existe para viabilizar a imagem final: os itens se consomem, o painel de skills permanece.

### Leva-e-traz

- **Alcance curto**: um item destrava algo no mesmo bloco ou, no máximo, no bloco imediatamente anterior. Alcance total foi rejeitado por três motivos — quebra a posse de bloco entre cinco apresentadores, é onde jogos de fetch quest travam ("tenho o item, esqueci onde usa"), e o espaço de combinações item×lugar cresce além do ensaiável.
- Portas obrigatórias: Indicação de trilha destrava a Sala de Treinamento; **Anotações do treinamento são requisito para o puzzle do Laboratório**. Esta segunda é a peça central: é um Bloco 5 em miniatura, que ensina a gramática "item antigo abre porta nova" antes do clímax usá-la.
- O Relatório é entregue à Cláudia de volta no Escritório, usando a base recorrente em vez de criar lugar novo.

### Blocos e transições

- Cinco blocos, um por apresentador, arco narrativo de dois anos (duração do contrato de estágio — o que faz a pergunta sobre efetivação chegar num momento que a plateia reconhece como real).
- **Cartões de transição** em tela cheia, três segundos, mostrando salto de tempo e título: Primeiro dia (sem cartão, a apresentação abre direto) → 1 mês depois → 6 meses depois → 1 ano depois → 2 anos depois. Números redondos porque o cartão precisa ser lido de relance numa tela comprimida.
- O cartão é o único mecanismo de transição entre blocos e desempenha três funções: marcador de capítulo, cobertura para a troca de sprite, e respiro para a passagem de bastão.

### Puzzles

Quatro mecânicas distintas, cada uma escolhida como metáfora do tema do seu bloco, todas resolvíveis em menos de 40 segundos e legíveis sem tutorial:

- **Bloco 1 — composição de senha** em três campos, cada um preenchido por um NPC diferente. Nenhum NPC tem a resposta inteira; o puzzle é social, não lógico.
- **Bloco 2 — associar pares**: quatro lacunas de competência ligadas a quatro trilhas de estudo. Os pares 1 e 2 plantam o Bloco 3; o par 3 planta o Bloco 4.
- **Bloco 3 (Laboratório) — sequenciar**: cinco linhas de log ordenadas cronologicamente. A causa não é revelada pelo sistema; ela fica óbvia quando a ordem fecha.
- **Bloco 3 (Innovation) — estruturar**: cinco fragmentos, três campos (problema / solução / impacto), **dois fragmentos são distratores** que não encaixam em lugar nenhum. O puzzle é sobre escolher, não sobre preencher.
- **Bloco 4 — montar**: quatro peças encaixadas num diagrama. Deliberadamente o mais satisfatório dos quatro, com snap firme e alinhamento final, para que o silêncio seguinte doa mais.

Nenhum puzzle tem fallback automático ou botão de pular: a simplicidade deles é a mitigação.

### A pausa do Bloco 4

Requisito mecânico, não direção artística. Ao completar o puzzle de montar, o sistema **não produz feedback nenhum**. Sequência ao longo de ~8 segundos: a protagonista se vira e espera; um NPC olha o celular; a líder fecha o notebook; cadeiras esvaziam; sala vazia com o diagrama aceso ao fundo. Sem texto, sem som, sem item, sem skill.

O avanço é manual e indefinido — o apresentador pode esticar. Qualquer animação de celebração aqui destrói o bloco.

Este bloco contém a única quebra de quarta parede aprovada: uma pergunta retórica do apresentador à plateia, que não exige nada do sistema.

### Revelação do Bloco 5

- Transição automática única: Escritório → mapa, disparada pela chegada da mensagem.
- **Quatro conexões**, cada uma disparada por clique do apresentador, nunca por timer. Três partem de itens tardios na barra e são **portas** (indicação social, competência, visibilidade); a quarta parte do painel de skills e é o **motivo** (proatividade), com linha mais grossa e traçado mais lento.
- Cada conexão traz **uma linha curta de texto**. O plano original pedia silêncio total; o texto foi adotado porque o objetivo virou reconhecimento e não surpresa, porque conexão visual sutil se perde na compressão do Teams, e porque o apresentador precisa de cue de ritmo para falar por cima.
- Parâmetros contra compressão: linha de 6-8px (10px na quarta), traçado de 800ms (1200ms na quarta), pausa manual entre conexões, alto contraste sem gradiente. Proibido partículas, brilho difuso e linha fina.
- Os três itens **se apagam da barra** ao conectar. A skill **permanece acesa**.
- Depois da quarta conexão, a barra de itens esvazia e sai de cena; o painel de skills permanece sozinho com o mapa.
- Fecho: versão futura entra, a protagonista pergunta se foi efetivada, a versão futura aponta para o mapa em vez de responder, sustentado por ~5 segundos. Depois as três perguntas, uma por clique, e silêncio.
- **Nenhuma UI na tela final**: sem créditos, sem botão de reiniciar visível, sem logo. Reiniciar é recarregar a página.

### Legibilidade (restrição de entrega por Teams)

Orçamento travado antes de qualquer arte, porque compartilhamento de tela comprime pesado e parte da plateia assiste em notebook:

- Corpo de texto ~28px no canvas de 1080p; nada abaixo de 22px em nenhum contexto.
- Alto contraste obrigatório. Proibido cinza sobre cinza.
- Proibido detalhe fino: sem linhas de 1px, sem partículas, sem gradiente sutil.
- Animações amplas e lentas (600-1200ms). Movimento rápido e delicado é exatamente o que a compressão destrói.
- Margens generosas — quem assiste em notebook perde as bordas de atenção.
- **Sem áudio.** Compartilhar som pelo Teams exige uma opção que o apresentador frequentemente esquece; uma apresentação que depende de som e roda muda está quebrada, e o momento mais forte do roteiro funciona por silêncio visual.

### Pipeline de assets

- **Manifest central** mapeando id de asset para caminho. Substituir arte é dropar arquivo de mesmo nome, sem tocar em código.
- Cenários em 1920×1080. Personagens e itens em PNG com fundo transparente.
- **Placeholders gerados** (formas geométricas rotuladas) para todo asset, de modo que a apresentação seja navegável, cronometrável e ensaiável antes de qualquer arte existir. Asset ausente cai no placeholder em vez de mostrar imagem quebrada.
- Arquivo de prompts com **preâmbulo de estilo travado** (paleta, ângulo de câmera, nível de detalhe, tratamento de luz) concatenado a um prompt por asset. Sem isso, cada regeração é loteria de estilo e os lugares deixam de parecer do mesmo prédio.
- A descrição física da protagonista faz parte do preâmbulo, já que os quatro sprites precisam parecer a mesma pessoa.

### Elenco

Cinco NPCs fixos e recorrentes, cada um aparecendo em pelo menos dois blocos, todos evoluindo ao longo dos dois anos. Elenco descartável de aparição única foi rejeitado porque a primeira conexão do clímax (cartão → indicação) só emociona se a plateia lembrar quem é a pessoa — o que exige que ela tenha aparecido mais de uma vez.

Ganho secundário: elenco fixo mostra as outras pessoas também mudando, o que sustenta "carreira em construção contínua" sem linha de exposição. Custo de arte cai de ~15 personagens para 5.

### Escolhas de diálogo

A protagonista tem escolhas de fala em momentos de autoconhecimento. **Nenhuma altera progressão** — todas convergem. Existem para que cada apresentador selecione a resposta que combina com a própria narração.

## Testing Decisions

### O que faz um bom teste aqui

Testes verificam **comportamento externo observável da progressão**, nunca detalhe de implementação. Um bom teste afirma "depois de clicar no monitor sem as Anotações, o puzzle não está liberado" — não "a função X foi chamada" nem "o componente Y renderizou".

Testes **não dependem de layout, de componentes renderizados nem de posição de hotspot**. Isso é deliberado: a arte e o posicionamento vão mudar muito enquanto o dono do projeto substitui imagens, e uma suíte atrelada a layout seria abandonada na primeira semana.

### Seam única

**A superfície pública da store — ações e seletores — dirigida de forma headless.** Não há seam existente para reaproveitar (projeto greenfield), então esta é proposta no ponto mais alto possível, e é a única.

A apresentação inteira deve ser jogável sem renderizar nada: entrar em lugar, clicar hotspot, avançar diálogo, selecionar item, usar item em alvo, resolver puzzle, voltar ao mapa, avançar bloco, disparar conexão. O estado derivado é lido pelos mesmos seletores que a UI consome.

Renderizar componentes e clicar via testing-library foi considerado e rejeitado: subiria o acoplamento ao layout sem cobrir nenhum risco adicional relevante.

### O que será testado

- **Playthrough completo** — um teste que joga do primeiro clique até as três perguntas finais, afirmando o estado em cada fronteira de bloco. Dado que não existe painel de operador, este é a única rede de segurança automatizada: se passa, existe caminho do início ao fim.
- **Portas de leva-e-traz, nos dois sentidos** — o monitor do Laboratório não libera o puzzle sem as Anotações e libera com elas; a Sala de Treinamento não destrava sem a indicação de trilha.
- **Grafo de desbloqueio** — a ordem dos seis lugares, e que nenhum lugar fica inalcançável.
- **Sobrevivência dos itens tardios** — os três chegam intactos ao Bloco 5, e nenhuma ação dos blocos 1 a 4 os consome.
- **Estado concluído** — revisitar lugar concluído não reabre puzzle nem repete diálogo, e não altera inventário nem skills.
- **Uso de item em alvo errado** — devolve a mensagem genérica e não altera estado.
- **A tese, assertada** — ao fim das quatro conexões, a barra de itens está vazia e as nove skills estão presentes.
- **Sequência da revelação** — as quatro conexões só avançam por disparo explícito e apenas em ordem.
- **Integridade do grafo de conteúdo** — todo hotspot referencia id existente, todo diálogo termina, todo puzzle tem gabarito válido. Exercitado pelos mesmos testes de progressão, sem criar uma segunda seam. Parte disso é garantida em tempo de compilação pela decisão de conteúdo tipado.

### O que não tem cobertura automatizada

Declarado explicitamente para não gerar falsa confiança: legibilidade no Teams, tamanho de fonte efetivo, contraste percebido, timing da pausa de 8 segundos, suavidade da caminhada, e se a revelação emociona. Isso é verificação visual e humana — só o **ensaio cronometrado** resolve, e o ensaio é parte obrigatória da entrega.

### Prior art

Nenhuma. O projeto é greenfield: não há código, nem suíte de testes, nem framework configurado. Os testes deste spec estabelecem o padrão para o resto do projeto. Runner: o padrão do ecossistema Vite (Vitest).

## Out of Scope

- **Backend, persistência e rede.** Nada é salvo. Não há save/resume, nem estado entre sessões. Recarregar a página reinicia.
- **Painel de operador, atalhos de emergência e pulo de puzzle.** Recusado deliberadamente pelo dono do projeto. A consequência aceita é que ensaiar o Bloco 5 exige jogar desde o início.
- **Áudio de qualquer tipo** — música, efeitos, narração.
- **Responsividade real e suporte a mobile.** Canvas fixo escalado é a decisão; não há usuário em celular.
- **Participação da plateia como mecânica.** A plateia assiste. A única quebra de quarta parede é uma pergunta retórica no Bloco 4 que não exige nada do sistema.
- **Alcance total de leva-e-traz.** Backtracking irrestrito entre todos os lugares visitados.
- **Ciclos de caminhada multi-frame e pathfinding.**
- **Mensagens customizadas por combinação de item e alvo.**
- **Ser mulher como tema da apresentação.** É fato do personagem; nenhuma fala trata do assunto. Registrado que, se uma das apresentadoras quiser abordar a partir da própria experiência, o lugar previsto é o Cafezinho do Bloco 2 — mas isso não está neste escopo.
- **Nome definitivo da protagonista.** Fica numa constante; a decisão é posterior.
- **Arte final.** O escopo entrega placeholders, manifest e prompts. A curadoria e regeração das imagens é do dono do projeto.
- **Logos, marcas e identidade visual oficial da empresa.** Nomes de programas internos aparecem no roteiro como texto; nenhum asset de marca é produzido.
- **Internacionalização.** Conteúdo em português do Brasil, texto embutido, sem camada de tradução.
- **Suporte completo a leitores de tela e auditoria WCAG.** Contraste alto, tipografia grande, alvos de clique amplos, elementos interativos semânticos e foco visível estão no escopo; certificação de acessibilidade assistiva completa não está, dada a natureza de artefato de apresentação operado por uma pessoa conhecida.
- **Analytics, telemetria e qualquer chamada de rede externa.**

## Further Notes

### Riscos aceitos, registrados

- **Sem rede de segurança de operador.** Decisão consciente do dono. O leva-e-traz aumenta o risco de travamento por memória espacial ("tenho o item, esqueci onde usa") — mitigado por alcance curto, que mantém o espaço de possibilidades pequeno o suficiente para ser ensaiado de cabeça.
- **Escopo maior que o plano original.** Caminhada, quatro mecânicas distintas e leva-e-traz foram somados ao plano inicial. Prazo foi declarado não-restritivo.
- **Consistência dos quatro sprites da protagonista** é o ponto mais frágil do pipeline de arte. Mitigado por sprite único deslizante (sem frames de caminhada), rosto de baixo detalhe e descrição física no preâmbulo de prompt.
- **Os 50 minutos só se confirmam no ensaio cronometrado.** Pesos por bloco: 9 / 9 / 11 / 8 / 13 minutos. O Bloco 3 tem três cenas e dois puzzles e é o candidato natural a corte se estourar.

### Ordem de construção recomendada

Fatias verticais (um bloco jogável por vez) em vez de camadas horizontais, para que um prazo apertado deixe blocos completos em vez de cinco blocos meio-feitos. **Construir o Bloco 5 cedo** — é onde está a tese e a animação mais complexa, e é o único efeito cujo fracasso derruba a apresentação inteira. Descobrir na última semana que a revelação não funciona seria fatal.

### Dependências externas ao código

- Decisão do nome definitivo da protagonista.
- Geração e curadoria das ~25 imagens.
- Cada apresentador reescrever o roteiro do próprio bloco na própria voz — texto que a pessoa não escreveu ela narra mal.
- Ensaio cronometrado completo, com treino das cinco passagens de bastão.

### Roteiro

O roteiro cena a cena completo já está escrito e é a fonte de verdade para todo o conteúdo: `docs/roteiro/00-fundamentos.md` (elenco, itens, skills, cartões, tabela de desbloqueio) e `docs/roteiro/01-bloco-1.md` a `05-bloco-5.md` (cenas, falas, ganchos de fala, checklist de estado por bloco).

### Pendência de processo

Este spec está local porque não há issue tracker configurado. Depois de `/setup-matt-pocock-skills`, publicar e aplicar `ready-for-agent`. Vale também promover o vocabulário de `00-fundamentos.md` a glossário formal do projeto, já que o spec e os tickets futuros dependem dele.
