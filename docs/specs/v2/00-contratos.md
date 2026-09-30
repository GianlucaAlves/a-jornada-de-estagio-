# v2 / Spec 00 — Contratos

**Roda sozinha, antes de todas as outras.** Esta frente define os ids, os tipos e
as ações de store contra os quais as outras cinco programam. Nada pode começar
antes dela.

**Leitura obrigatória:** `AGENTS.md`, `docs/decisoes/v2-desenho.md` (inteiro) e
`docs/decisoes/adr.md` (inteiro). O glossário em `docs/decisoes/glossario.md`
define o vocabulário.

## Você escreve

```
src/domain/types.ts
src/domain/content/base.ts
src/domain/content/blocos.ts
src/domain/content/puzzles.ts
src/domain/content/conexoes.ts
src/domain/content/index.ts
src/domain/content/integridade.test.ts
src/domain/content/bloco1.ts .. bloco6.ts   (apenas ESQUELETOS — ver §7)
src/store/jogo.ts
src/store/jogo.test.ts
src/assets/manifest.ts
```

## Você NÃO toca

`src/ui/**`, `src/styles/**`, `src/App.tsx`, `scripts/**`. Cinco agentes estão
escrevendo lá em paralelo. **Não apague arquivo nenhum** sem que esta spec mande.

---

## 1. `types.ts`

- `BlocoId` passa a `1|2|3|4|5|6`.
- `LugarId` passa a exatamente cinco: `escritorio`, `cafezinho`,
  `linha-producao`, `sala-reunioes`, `outra-area`. Saem `sala-treinamento` e
  `laboratorio`/`innovation`.
- `ItemId` perde `senha`, `indicacao-trilha` e `projeto-entregue`. Ficam cinco.
- `NpcId` fica igual. **Novo:** um tipo de perfil de NPC com `nome` e `cargo`,
  porque cargo agora acompanha o nome em toda ocorrência (ADR-015).
- `CartaoTransicao` ganha o campo do apresentador.
- `SkillId` fica igual (nove).

## 2. `base.ts`

- `ITENS`: cinco.
- `SKILLS`: nove, com o texto revisado para sair de vocabulário técnico.
  `competencia-tecnica` e `leitura-mercado` são as que mais precisam.
- `LUGARES`: cinco, com posições no mapa redistribuídas — cinco slots bem
  separados, longe do centro, porque o centro é de onde saem as quatro conexões
  do clímax.
- **Novo:** `NPCS`, o registro de perfil com nome e cargo dos cinco. Cargo é
  função, não título de RH: "Líder do time" comunica, "Gerente de Operações
  Sênior" é ruído.

## 3. `blocos.ts`

Seis cartões de transição, cada um com salto temporal, tema e apresentador:
Pedro (1), Heloisa (2), João (3), Gianluca (4), Marianna (5). A fase 6 não tem
apresentador — deixe o campo opcional ou vazio, e comente por quê.

Seis `estadoAssumido`, um por fase, para que cada fase continue ensaiável
isoladamente. Esse é o motivo pelo qual eles existem; mantenha a propriedade.

## 4. `puzzles.ts` — o recheio universal é SEU trabalho

Esta é a parte mais delicada da spec. Cinco puzzles, e nenhum deles pode conter
vocabulário de tecnologia.

- **`senha`** (fase 1) — social: cada NPC tem um pedaço. Continua com três
  campos digitados. Troque `ERI/DT7/01` por fragmentos universais de uma senha de
  primeiro acesso. **As pistas têm de ser literais e inequívocas nas falas**,
  senão o puzzle fica insolúvel ao vivo.
- **`associar`** (fase 2) — ligar lacuna de competência a trilha de curso.
  Lacunas universais: organizar a semana, falar em reunião, escrever e-mail que
  a pessoa responde, montar planilha que alguém entende. Trilhas nomeadas em
  **Degreed** e **Percipio** (atenção: o código hoje escreve `Degree`, errado).
- **`sequenciar`** (fase 2, veio da 3) — ordenar tarefas da semana por impacto no
  trabalho do time. Sai o log com timeout e retry. Cinco linhas.
- **`estruturar`** (fase 3) — problema, solução, impacto, com dois fragmentos
  que não encaixam em lugar nenhum. O conteúdo passa a ser a oportunidade que ela
  viu na linha de produção. Mantenha os dois distratores: estruturar é escolher,
  não preencher.
- **`montar`** (fase 4) — quatro peças que montam o resumo de uma página para o
  gestor. **Hoje `PuzzleMontar` não tem gabarito**, e é por isso que qualquer
  peça encaixa em qualquer espaço. Adicione o gabarito ao tipo e ao conteúdo:
  cada peça pertence a um campo nomeado.

## 5. `conexoes.ts`

Quatro conexões. As três portas saem dos itens tardios; a quarta sai da skill
`proatividade` e **não** se consome. O texto da porta do certificado muda para o
eixo novo (ADR-023): quarenta horas fora do horário, não nome de curso.

`viaLugar` de cada conexão precisa apontar para um dos cinco lugares novos.

## 6. `jogo.ts` — três mudanças de comportamento

**6.1 Correção de corretude.** `abrirPuzzle` hoje escreve `liberado` sem olhar o
estado atual. É por isso que todo hotspot que abre puzzle precisou ser
`umaVezSo`: reclicar rebaixaria um puzzle `resolvido` e desarmaria a porta
seguinte. Passe a só escrever `liberado` quando o estado **não** for `resolvido`.

**6.2 `fecharPuzzle`.** Ação nova. Fecha o overlay e **reinicia** o puzzle — o
progresso parcial não é preservado (ADR-011). Sem ela, o botão de voltar que a
spec 03 vai construir órfãria hotspots para sempre: no `sequenciar` seriam cinco,
e o bloco nunca emitiria `blocoConcluido`.

**6.3 Persistência.** Salvar no `localStorage` a cada mudança: fase, tela, itens,
skills, lugares, puzzles, sprite. Expor o suficiente para a tela de abertura
decidir: existe progresso salvo? qual fase? Além de `continuar()` e do
`reiniciar()` que já existe e hoje é **código morto** — nenhum componente o
chama.

Cuidado com versão de save: um save da v1.1 no navegador de alguém tem
`LugarId` que não existe mais. Guarde um número de versão e **descarte** save de
versão diferente, em silêncio.

## 7. Os esqueletos de bloco

Você cria os seis arquivos `bloco1.ts` .. `bloco6.ts` em estado **válido e
mínimo**: tipos corretos, ids existentes, `npm run typecheck` e `npm test`
passando. Não escreva diálogo — duas outras frentes vão preencher.

O conteúdo do clímax que hoje está em `bloco5.ts` (notebook, mensagem, revelação)
**migra para `bloco6.ts`**. O `bloco5.ts` fica esqueleto para a fase nova de
reflexão.

Mínimo por esqueleto: um hotspot que concede o que a fase precisa conceder e
emite `blocoConcluido`, para que a cadeia de seis fases seja jogável de ponta a
ponta desde já. Isso é o que permite às outras frentes rodarem a suíte.

## 8. `integridade.test.ts`

Mantenha tudo que já valida e acrescente:

- todo `LugarId` referenciado existe nos cinco
- todo item concedido é usado em algum lugar, **exceto** os três tardios, que são
  usados só no clímax — e essa exceção tem de ser explícita no teste, porque foi
  ela que deixou três itens mortos passarem na v1
- todo NPC referenciado em `arte: { tipo: 'npc' }` tem perfil em `NPCS` com cargo
  não vazio
- as seis fases existem e cada uma tem ao menos um caminho que emite
  `blocoConcluido`
- nenhum texto de conteúdo contém os termos banidos: `DT7`, `Data & Transformation`,
  `log`, `retry`, `timeout`, `Git`, `API` **exceto** nas falas da Bianca
  (ADR-027 — ela é a exceção declarada, e o teste deve documentar isso)

## Critérios de aceite

- [ ] `npm run typecheck` sem erro
- [ ] `npm test` verde
- [ ] `npm run build` passa
- [ ] o jogo é jogável de ponta a ponta pelas seis fases com os esqueletos
- [ ] mutação: remover um `LugarId` de `LUGARES` quebra o teste; um item concedido
      e nunca usado quebra o teste; um NPC sem cargo quebra o teste. **Prove as
      três mutações no relatório** e reverta.

## Não faça

- não escreva diálogo (é de outras duas frentes)
- não toque em `src/ui/**`, `src/styles/**`, `src/App.tsx` ou `scripts/**`
- não apague arquivo que esta spec não mandou apagar
- não invente decisão que os ADRs não tomaram: se faltar decisão, **pare e
  relate** em vez de escolher
