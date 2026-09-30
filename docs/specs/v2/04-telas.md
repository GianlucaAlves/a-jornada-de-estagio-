# v2 / Spec 04 — Telas: diálogo, itens, skills e abertura

**Depende da spec 00**, que já criou os perfis de NPC com cargo, a persistência
na store e a ação `fecharPuzzle`.

**Leitura obrigatória:** `AGENTS.md`, `docs/decisoes/v2-desenho.md`,
`docs/decisoes/adr.md` (ADR-012, 013, 015, 016, 018, 020), e
`docs/biblia-de-arte.md` §7 para a interação de cena.

## Você escreve

```
src/ui/*.tsx            (exceto src/ui/puzzles/**)
src/ui/*.test.ts
src/styles/tokens.ts
src/styles/global.css
src/App.tsx
```

## Você NÃO toca

`src/ui/puzzles/**`, `src/store/**`, `src/domain/**`, `scripts/**`. Cinco agentes
em paralelo. **Não apague arquivo nenhum.**

---

## 1. A caixa de diálogo encolhe, e o retrato passa a ser o rosto

**Números medidos hoje:** `Dialogo.tsx` ocupa 1376×340 px — **22,6% do canvas**,
fundo opaco `#0a1220`, retângulo x 64→1440, y 510→850. Ela intercepta **22 dos 24
hotspots** do jogo; sete ficam 100% cobertos. E cobre justamente quem está
falando: Bianca 80%, Rafael 75%, Cláudia 73%. O retrato de corpo inteiro (220×260)
é o que mais custa altura.

**Faça:** retrato só de **rosto**, caixa proporcionalmente menor, e o cenário
visível. O rosto vem de `public/assets/retratos/<id>.png` — outra frente está
desenhando. **A arte pode não existir ainda:** a cadeia de fallback de
`Imagem.tsx` cobre isso e é para isso que ela existe. Não espere pela arte.

Toda ocorrência do nome do NPC vem com **cargo** (ADR-015), vindo do registro que
a spec 00 criou. Cargo é função, não título de RH.

## 2. Diálogo pode ser relido

Clicar de novo num NPC repete o diálogo dele (ADR-016). Isto conserta uma classe
de problema, não um caso: hoje qualquer fala perdida é perdida para sempre. O caso
grave é a senha — as pistas só existem nas falas, e quem não decorou não resolve.

## 3. A descrição de item se fecha

**Fato:** `descricaoDe` (`BarraDeItens.tsx:39`) é estado local, escrito num lugar
e apagado **só** quando o item sai da barra. Sobrevive a troca de cena, ida ao
mapa, diálogo e puzzle — o bloco inteiro. Em `zIndex 20` contra o diálogo em 30,
ela se esconde durante a fala e **reaparece** depois, que é o que dá a sensação de
ter grudado. O `<p>` não é botão e não tem como fechar.

**Faça:** clicar no mesmo item fecha; clicar em outra coisa fecha; e fecha sozinha
depois de alguns segundos. **Sem botão X** — alvo pequeno ao vivo é armadilha.

Cuidado com o efeito colateral existente: o mesmo `onClick` chama
`selecionarItem`, que **alterna**, e `setDescricaoDe`, que é idempotente. Clicar
duas vezes hoje desseleciona o item e mantém a descrição.

## 4. Painel de skills em acordeão

Hoje a mais recente mostra a frase inteira e as anteriores só o nome — metade do
caminho. **Faça:** cada entrada clicável para abrir e fechar; a recém-conquistada
abre sozinha e fecha a anterior; **sem contador** (ADR-020).

Isto é mais importante do que parece: na **fase 5** este painel deixa de ser
painel e passa a ser a mecânica da fase. A pessoa vai percorrer as nove skills uma
por uma. Construa pensando nisso — e teste com nove abertas e fechadas.

Skills continuam não-consumíveis. O peso visual continua deliberadamente diferente
da barra de itens: os itens se gastam, o painel permanece, e essa diferença é a
tese.

## 5. Tela de abertura com escolha

Nova. Se houver progresso salvo (a store expõe isso), oferece **"Continuar"** ou
**"Começar do início"**. Se não houver, só começa.

Por que a escolha é explícita e não retomada silenciosa: o pior defeito possível
ao vivo é abrir o jogo e ele começar na fase 4 por causa de um save do ensaio de
ontem (ADR-018). A tela de abertura também é o caminho de reinício durante a
apresentação — F5 leva a ela.

`reiniciar()` já existe na store e hoje é **código morto**: nenhum componente a
chama. Passa a ser acionada aqui.

## 6. Seis fases

`App.tsx` e `CartaoDeTransicao.tsx` precisam da sexta fase. O cartão passa a
exibir o **nome do apresentador** junto do salto temporal e do tema.

## 7. Tokens

Todo valor novo entra em `tokens.ts`. Nenhum literal em componente — é regra dura
do projeto. Se faltar token, crie.

## Critérios de aceite

- [ ] `npm run typecheck` e `npm test` verdes
- [ ] **meça e relate** a nova área da caixa de diálogo em px e em % do canvas, e
      quantos dos hotspots ela intercepta agora. O número antigo é 22 de 24; o
      novo tem de ser drasticamente menor, e quero o número, não a impressão.
- [ ] a descrição de item fecha pelos três caminhos, provado em teste
- [ ] o acordeão funciona com as nove skills; abrir uma fecha a anterior
- [ ] a tela de abertura aparece com save e sem save, e "Começar do início"
      realmente zera
- [ ] cargo aparece junto do nome em toda ocorrência
- [ ] diálogo relido pela segunda vez mostra as mesmas falas
- [ ] nenhum literal novo em componente que devesse estar em `tokens.ts`
- [ ] `image-rendering: pixelated` continua aplicado à arte do jogo

## Não faça

- não toque em `src/ui/puzzles/**` nem em `src/store/**`
- não espere pela arte dos retratos: a cadeia de fallback existe para isso
- não use fonte abaixo de 22px em lugar nenhum
- não remova o botão "Voltar ao mapa" nem seu `disabled` com motivo — é decisão
  de spec e está comentada no código
