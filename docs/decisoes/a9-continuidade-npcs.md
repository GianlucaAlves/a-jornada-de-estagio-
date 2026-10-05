# A9 — continuidade dos NPCs

Presença física e hotspot de conversa têm ciclos distintos. A store guarda
`presencasNpcs`, por bloco, lugar e personagem, com posição, visibilidade e
percurso pendente. Examinar objetos não altera esse registro. O mesmo nó de
renderização acompanha o NPC quando o assunto muda.

`src/domain/content/presencas.ts` registra posições iniciais e finais de todos
os NPCs que participam de diálogos de cena. Os percursos de saída e retorno são
explícitos. Quem está fora entra pela mesma borda antes da releitura; a caixa de
fala espera a chegada. Fora de uma cena, o fecho da revelação conserva seu
tratamento próprio.

Na fase 5, Bianca permanece em 30%/70% depois da primeira conversa e enquanto
Ana examina caderno e grade. Ao iniciar o segundo diálogo, caminha até 44%/70%
e permanece lá, inclusive na revisita concluída.

Na fase 4, Marcos, Cláudia e Bianca estão presentes desde a abertura. Cláudia
acompanha a apresentação no palco; Bianca aguarda junto da porta. Marcos sai
pela direita após a preparação; Cláudia desce ao corredor em 34%/70% e sai pela
esquerda após o reconhecimento; Bianca sai pela esquerda depois da virada.
A plateia atravessa a borda após a última fala da apresentação, usando os
recortes existentes. Essa saída coletiva é provisória: atividades e animações
individuais da plateia pertencem à A11.

Os sprites usam as tiras existentes e o passo de dois estados do fallback.
Não há fade de NPC. A transformação caminha de forma linear; a preferência
por movimento reduzido desliga os quadros do sprite, preservando o deslocamento
necessário para explicar sua saída.

Ao salvar durante uma caminhada, o progresso guarda o destino final e a
visibilidade ao chegar. Trocar de cena também assenta os percursos: a transição
cobre a conclusão e a revisita conserva o resultado. Saves anteriores são
migrados pelas conversas concluídas, sem descartar o progresso.

A9 não redesenha cenários nem altera os diálogos. A13, a auditoria A10 e as
frentes A11/A12 ficam nas etapas seguintes solicitadas pelo usuário.
