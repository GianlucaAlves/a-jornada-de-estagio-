# v2.3 / Spec 05 — Voz humana e autoconhecimento que cresce

**Depende:** auditoria 00; dialogar com o storyboard da spec 03. **Leia:** `src/domain/content/bloco1.ts` a `bloco6.ts`, `docs/roteiro/00-fundamentos.md` e os roteiros de cada fase; `src/domain/content/integridade.test.ts`.

## Problema

O jogo tem falas concretas e com humor que funcionam: a senha “no e-mail”, o chá que sai da máquina, o ramal usado zero vezes, “ninguém pediu pra eu não olhar” e o retorno do cartão na festa. Outras falas soam como resumo de uma lição, sem voz de personagem ou consequência imediata. Além disso, o autoconhecimento surge no primeiro dia e volta na fase 5, mas precisa **progredir em cada fase**, ligado ao trabalho que Ana acabou de fazer.

## Método de revisão

Revisar **todos** os diálogos, aberturas, ecos e narrações das seis fases, marcando cada linha como: informação necessária, decisão/observação de Ana, relação entre pessoas, humor, ou comentário abstrato. Para a última categoria, perguntar “quem diria isso, naquele lugar, logo após qual ação?”. Cortar ou trocar frases que só explicam a moral da cena. Não encher o texto de piadas: humor tem de vir do costume e do conflito de cada pessoa.

| Linha atual a rever | Por que soa genérica | Direção concreta |
|---|---|---|
| Tiago B1: “Ninguém chega sabendo.” | Fecha o assunto com uma máxima depois da pista. | Reagir ao erro de senha ou ao próprio primeiro acesso dele, mantendo o jeito seco. |
| Rafael B1: “Primeiro dia é sobre conhecer gente. Produzir é de amanhã em diante.” | Diz à plateia a lição já mostrada pelo cartão e pelo ramal. | Mostrar a ajuda em um gesto ou brincadeira sobre o tempo que Ana ficou presa na tela. |
| Bianca B2: “Ninguém aqui parou.” | Frase ampla que não acrescenta detalhe à mudança de Letras para tecnologia. | Dar exemplo pequeno do que ela ainda está estudando ou de uma dúvida atual. |
| Bianca B5: “O que você aprendeu é seu.” | Conclusão abstrata no momento mais pessoal da carreira da Ana. | Fazer referência à conferência, à apresentação e ao que Ana percebeu gostar de fazer; tratar falta de vaga como possibilidade externa, sem afirmar que será o caso. |
| Cláudia B6: “Três lugares e um motivo. Os três abriram a porta...” | A expressão promete explicação, mas soa como slogan antes da revelação. | Fazer uma transição falada que ainda deixe o mapa mostrar de onde vieram as indicações. |

Essas são amostras, não o limite da revisão. Preservar fatos, humor que funciona, pistas de puzzle, conexões tardias e o suspense da efetivação. Alterar frase-assinatura só junto do teste e da justificativa no roteiro. O teto atual de seis nós e 180 caracteres por fala permanece como orçamento inicial; se um diálogo precisar mais espaço, justificar pela ação que a pessoa executa, não por uma explicação do tema.

## Arco de autoconhecimento de Ana

| Fase | O que ela descobre sobre si | Evidência em cena/diálogo; evitar declaração pronta |
|---|---|---|
| 1 — primeiro dia | Consegue pedir ajuda e dizer por que quis vir, mesmo sem dominar o lugar. | Depois da senha, uma fala mostra o que a deixou travada e por que perguntou; Cláudia ouve a resposta “ver na prática”. |
| 2 — aprendizado e planejamento | Distingue uma lacuna que quer estudar de uma tarefa que só precisa priorizar; percebe limite real do tempo por causa da prova. | Na conversa com Bianca ou no retorno ao café, Ana nomeia uma tarefa de que gostou e outra que precisou negociar, sem virar sermão sobre produtividade. |
| 3 — iniciativa | Percebe que gosta de investigar o problema da passagem de turno e tomar a frente quando vê um gargalo. | Tiago observa a insistência; Ana fala do motivo específico para continuar olhando, não de “ser protagonista”. |
| 4 — visibilidade | Reconhece que prefere mostrar o trabalho com fatos; falar em público ainda lhe custa esforço. | Na preparação e após a sala esvaziar, ela nota a diferença entre executar bem e explicar sua contribuição; a apresentação mostra essa tentativa. |
| 5 — carreira | Quer ser efetivada, mas aprende a separar desejo de vaga, gosto pelo tipo de trabalho e escolha de área. | Caderno e grade dão exemplos do que aprendeu e do que a atrai; Bianca contrapõe sua mudança de Letras com a dúvida concreta da Ana. |
| 6 — nova etapa | A efetivação responde ao contrato, não encerra a descoberta. Ana já consegue nomear o que quer experimentar a seguir. | Na festa ou no fecho, ela responde com algo específico aprendido nas fases anteriores e admite uma pergunta ainda aberta. |

Cada etapa pode caber em uma ou duas falas. O narrador/apresentador conserva espaço para desenvolver o tema ao vivo. Nenhum NPC recita a tabela acima; os nomes das skills não precisam aparecer na boca do elenco. A fase 2 mantém as cinco tarefas do puzzle e a colisão entre demanda nova e prova; a fase 4 mantém STAR como ferramenta de contar um caso concreto.

## Vozes e revisão em voz alta

Tiago é seco e prático; Rafael aproxima pelo humor e pelo gesto; Cláudia observa e fala pouco; Bianca traz experiências próprias sem virar coach; Marcos facilita com perguntas. Ana muda com o tempo, mas não fala como se já soubesse a conclusão da fase seguinte. Ler cada diálogo em voz alta com os cliques reais: falas longas que interrompem a apresentação ou repetem o que o cenário mostra devem ser enxugadas. Revisar concordância, oralidade e consistência dos nomes, incluindo descrições do painel quando soarem como frases de efeito.

## Critérios de aceite

- [ ] Planilha de revisão cobre todos os diálogos e textos de cena, com linha original, decisão e motivo; cada fase tem um momento específico de autoconhecimento.
- [ ] Ao ouvir só a fala, é possível reconhecer o personagem pelo vocabulário e pela relação com Ana; nenhuma fala serve apenas como legenda moral da cena.
- [ ] Pistas, gabaritos, efeitos, ids e callbacks permanecem corretos; alterações de frases protegidas são refletidas conscientemente nos testes.
- [ ] Ana quer a efetivação na fase 5; o resultado continua desconhecido até a fase 6. Autoconhecimento não vira previsão do contrato.
- [ ] Roteiros e conteúdo tipado contam a mesma história; leitura em voz alta cabe no tempo da apresentação; typecheck e suíte inteira passam.
