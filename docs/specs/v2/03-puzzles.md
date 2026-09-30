# v2 / Spec 03 — Puzzles: consertar o que está quebrado

**Depende da spec 00**, que já corrigiu `abrirPuzzle`, criou a ação
`fecharPuzzle` na store e adicionou gabarito ao tipo do `montar`.

**Leitura obrigatória:** `AGENTS.md`, `docs/decisoes/v2-desenho.md`,
`docs/decisoes/adr.md` (ADR-011 em especial).

## Você escreve

```
src/ui/puzzles/**          (todos os arquivos)
src/ui/puzzles/*.test.ts   (novos, onde a spec pedir)
```

## Você NÃO toca

`src/ui/*.tsx` fora de `puzzles/`, `src/styles/**`, `src/store/**`,
`src/domain/**`, `src/App.tsx`, `scripts/**`. Cinco agentes em paralelo. **Não
apague arquivo nenhum.**

Se precisar de CSS, use estilo inline ou os tokens já existentes — `global.css` e
`tokens.ts` são de outra frente nesta rodada.

---

## O que a auditoria encontrou, com arquivo e linha

Estes são fatos medidos, não impressões. Conserte todos.

### 1. `montar` não é um puzzle

`PuzzleMontar` não tinha gabarito e `clicarEspaco` aceitava qualquer peça em
qualquer espaço vazio sem comparar (`Montar.tsx:110-115`). O próprio comentário
registrava *"Não existe encaixe errado"* (`Montar.tsx:9-11`). Os quatro alvos são
retângulos tracejados cujo **único texto é `aria-label`** (`Montar.tsx:214`), e o
núcleo do diagrama é um `<rect>` sem texto dentro de um `svg aria-hidden`
(`Montar.tsx:175-188`). Havia 400px de vazio entre as fileiras (`ESPACO_LINHA`).

O dono disse que não entendeu o que era para fazer. Não havia o que entender.

**Conserte:** use o gabarito que a spec 00 adicionou ao conteúdo; cada alvo exibe
seu **rótulo visível** (não só `aria-label`); peça na casa errada é recusada com
aviso; e o vazio de 400px vira layout compacto.

### 2. `senha` — a resposta não está na tela quando é pedida

É o único dos cinco que não se resolve com mouse: três `<input type="text">`
(`Senha.tsx:113-145`). As pistas só existem nas falas já dispensadas, o overlay é
opaco, e não há diário. Além disso é sensível a ordem (comparação por índice,
`Senha.tsx:38-42`) e o auto-avanço de foco (`Senha.tsx:55-62`) faz quem digitar a
senha corrida acabar com o texto errado no campo 2.

**Decisão do dono: a senha continua digitada** (ADR-016), e o remédio para a
resposta é outro — o diálogo passa a ser relível, o que é trabalho de outra
frente. O que é SEU aqui:

- conserte o auto-avanço de foco para não engolir caracteres
- torne o erro visível (hoje não há sinal nenhum)
- deixe claro na tela quantos campos há e o que cada um espera

### 3. Clique morto com cursor de mão, em três puzzles

`AssociarPares.tsx:275` está `disabled` mas `:192` mantém `cursor: pointer`.
`Estruturar.tsx:220` e `:269`, o mesmo. `Sequenciar`, em `estiloSeta`
(`:158-174`), não declara cursor e herda `button { cursor: pointer }` do
`global.css`. Numa apresentação projetada, botão que parece clicável e não
responde **parece travamento** — e o spec do projeto rejeita hotspot morto por
esse exato motivo.

### 4. Nenhum puzzle avisa quando se erra

`associar` recua a linha em silêncio (`:157-163`); `sequenciar` não sinaliza nada
e não tem contador; `estruturar` sacode o campo em silêncio (`:91-97`) exceto no
distrator. Silêncio ao vivo faz o apresentador começar a explicar o que não devia.

**Conserte:** uma linha curta e **sem julgamento** por puzzle ("Não é essa a
ordem", "Essa não fecha essa lacuna"). Sem contador de tentativas e sem
penalidade — a plateia não está competindo.

## 5. Saída do puzzle

Todo puzzle ganha **botão de voltar**. Sair chama `fecharPuzzle` (spec 00) e
**reinicia** o puzzle: progresso parcial não é preservado (ADR-011).

Por que isto é seguro agora e não era antes: `abrirPuzzle` passou a não rebaixar
puzzle já `resolvido`, então reabrir não desarma a porta seguinte. Sem essa
correção, um botão de voltar órfãria hotspots para sempre — no `sequenciar` seriam
cinco, e o bloco nunca emitiria `blocoConcluido`.

Escape também fecha. O botão fica num canto previsível, com alvo de clique não
menor que `alvo.minimo`.

## 6. Legibilidade comum aos cinco

- instrução visível dizendo o que fazer, em texto, não só em `aria-label`
- progresso visível ("2 de 4") em todos, não só em alguns
- resolvível com **mouse** e com **teclado**, os dois
- nada abaixo de 22px, que é piso do spec
- `Estruturar` pode estar estourando o canvas (~954px calculados contra 952
  úteis). **Meça** e conserte se estourar.

## Critérios de aceite

- [ ] `npm run typecheck` e `npm test` verdes
- [ ] teste novo por puzzle, provando por mutação: peça na casa errada é recusada
      no `montar`; ordem errada avisa no `sequenciar`; par errado avisa no
      `associar`; distrator avisa no `estruturar`; senha errada avisa. **Cole a
      saída das mutações no relatório** e reverta.
- [ ] nenhum botão `disabled` com `cursor: pointer` em nenhum puzzle
- [ ] os cinco resolvíveis só com mouse, e os cinco só com teclado
- [ ] sair e reabrir um puzzle não trava progressão nenhuma — teste isso no
      `sequenciar`, que é o de maior raio de dano
- [ ] no relatório, para cada um dos cinco: qual é a instrução literal na tela, e
      como a pessoa descobre que acertou e que errou

## Não faça

- não mude a mecânica de nenhum puzzle: as quatro aprovadas ficam como são e o
  `montar` só ganha o que faltava para ser um puzzle
- não mude o conteúdo (`puzzles.ts`) — recheio é da spec 00
- não toque em `global.css` nem em `tokens.ts`
- não adicione contador de tentativas, tempo nem penalidade
