# v2.2 / Spec 03 — Sala de Reuniões: preparar, apresentar e então esperar

**Depende:** specs 00 e 01. **Leia:** bíblia, `bloco4.ts`, `puzzles.ts`,
`Cena.tsx`, `PausaBloco4.tsx`, store e `docs/roteiro/04-bloco-4.md`.

**Arte:** cenário, props e poses necessárias, cada qual em sua frente.
**Conteúdo/UI:** fase 4, puzzle `montar`, apresentação, pausa, contratos, testes
e roteiro. A integração pode atualizar a store e seus testes: uma expectativa
antiga não justifica deixar a nova sequência apenas na instrução do apresentador.

## O problema

A v2.1 já trocou o crachá por atril e acrescentou plateia. O conteúdo atual
registra que a mesa ocupa o espaço útil, forçando a plateia para a faixa de trás
e Ana para uma cabeceira estreita. O dono continua vendo plateia mal posicionada
e não entende o momento da apresentação. É preciso recompor a sala e mostrar
uma apresentação acontecendo antes de disparar o silêncio.

Além disso, falta preparação: um NPC precisa falar com Ana sobre comunicar o
próprio trabalho, STAR e posts no LinkedIn antes da reunião.

## O que entregar

### 1. Recompor a sala para o evento

Sala de Reuniões continua sendo o lugar da Innovation Week. Reduzir ou deslocar
a mesa central para liberar frente de apresentação, assentos e circulação.
Telão e atril ficam na mesma frente; plateia sentada olha para essa frente.
Corpos, cadeiras e profundidade precisam concordar: ninguém sentado sobre a
mesa, ninguém em pé fingindo estar sentado. Evitar o bloco único de pessoas
minúsculas; conferir escala e orientação na prévia montada.

Ana tem ponto de preparação e ponto de apresentação separados, ambos sobre
piso. Cláudia, Bianca e o NPC de preparação não disputam o mesmo lugar. Assentos
ocupados e cenário continuam iguais ao entrar na pausa; pessoas que precisam
sair não podem estar pintadas de forma permanente no fundo.

### 2. Preparação com Marcos

Usar **Marcos**, do elenco existente, como NPC que conversa com Ana antes de
ela começar. Ele orienta a comunicação; não resolve o puzzle por ela. A conversa
é obrigatória antes de abrir `montar`, relível e curta, com cargo junto do nome.

Texto-base para implementação, em seis falas, sujeito a ajuste de voz sem
perder os três assuntos solicitados:

1. Marcos: “Antes de começar: quem vai te ouvir sabe o que você fez?”
2. Ana: “Sabe que eu participei. Não sei se sabe o que mudou com o meu trabalho.”
3. Marcos: “Então conta pelo STAR: situação, tarefa, ação e resultado.
   Qual era o problema, o que era sua responsabilidade, o que você fez e o que mudou.”
4. Ana: “Assim eu consigo mostrar minha parte sem diminuir a do time.”
5. Marcos: “Isso. Se vender é dar clareza ao seu trabalho. E ele pode chegar
   a quem não estava aqui: um post no LinkedIn também pode contar essa história.”
6. Marcos: “Só compartilha o que pode ser público. Dá para falar do aprendizado
   sem expor dados ou informação interna.”

Não incluir integração com LinkedIn, publicação real ou recompensa por postar.
O roteiro amplia a dica com exemplos e discussão do apresentador.

### 3. O puzzle passa a praticar STAR

Hoje os quatro campos são Situação, O que eu fiz, Resultado e Próximo passo:
isso se aproxima do método, mas falta **Tarefa**. Nesta spec, a adaptação proposta
é usar Situação, Tarefa, Ação e Resultado, mantendo as quatro peças, a mecânica,
o gabarito, o retorno de erro e a saída segura.

Reaproveitar o caso dos lotes e da planilha. A tarefa explicita a responsabilidade
da Ana de tornar as pendências disponíveis ao próximo turno; ação é o que ela
executou e resultado é o efeito já descrito. Não inventar métricas nem novas
realizações. A proposta de expandir para outras linhas continua como próximo
passo no roteiro ou na apresentação, fora dos quatro campos do STAR.

### 4. Uma apresentação visível, com avanço manual

Sequência obrigatória:

```text
conversa com Marcos → montar resumo STAR → acionar atril
→ Ana apresenta com resumo no telão e sala ouvindo
→ clique para concluir a apresentação → PAUSA silenciosa
→ conversa com Cláudia → conversa com Bianca → fechamento da fase
```

Ao acionar o atril, Ana ocupa o ponto de apresentação e assume pose compatível
com falar para a sala. O telão mostra o resumo montado com texto de UI legível,
sem transformar as quatro peças em uma textura ilegível dentro do PNG.
Uma fala breve de Ana conta sua contribuição e resultado; a plateia permanece
voltada para ela. Não substituir esse momento por “Ana apresentou” na narração.

O apresentador controla o tempo de leitura. Um clique explícito conclui o
momento e só então dispara a pausa existente. Duplo-clique não pode pular a
apresentação nem encerrar a pausa; retomar save não pode repetir concessões ou
rearmar etapas concluídas. Preservar ids existentes onde possível e tratar
novos estados no contrato de persistência.

A pausa mantém silêncio, saída das pessoas, sala vazia e avanço manual após
sua sequência. A adaptação visual usa os mesmos lugares e pessoas da cena
anterior. Corrigir também o retorno à cena: plateia não reaparece depois de
ter saído. O crachá segue como recompensa tardia, sem anúncio de uso futuro.

Cada porta bloqueada responde com texto específico. Concluir `montar` não
dispara a pausa automaticamente nem permite saltar a preparação.

## Critérios de aceite

**Implementado:** sala aberta para palco e plateia; Marcos prepara Ana; o puzzle
pratica STAR; resumo e fala aparecem durante a apresentação, e só o avanço após
a última fala inicia a pausa. A pausa remove a plateia; Cláudia e Bianca entram
em sequência. Store, portas e geometria passam nos testes. Conferência da
transição e da legibilidade em execução real continua pendente.

- [x] Plateia sentada, virada para a apresentação e coerente com as cadeiras.
- [x] Marcos é acessível antes do puzzle; STAR, visibilidade e LinkedIn aparecem
      na conversa e têm ganchos no roteiro.
- [x] Os quatro campos praticam STAR e distinguem tarefa de ação.
- [x] Após o puzzle, a plateia vê Ana apresentar e consegue ler o resumo antes
      de qualquer silêncio; o tempo é controlado pelo apresentador.
- [x] Pausa permanece sem texto, som ou celebração; pessoas saem sem reaparecer
      indevidamente, mantendo continuidade entre as camadas.
- [x] Testes cobrem portas, ordem, duplo-clique e retomada dos novos estados;
      `npm run typecheck` e `npm test` verdes.
- [ ] Chão e prévias atualizados e abertos; sequência completa conferida no navegador.

No relatório, mostrar a sequência de telas e o diálogo final de Marcos.
