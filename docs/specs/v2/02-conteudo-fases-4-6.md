# v2 / Spec 02 — Conteúdo das fases 4, 5 e 6

**Depende da spec 00.** Ids, tipos, itens, perfis de NPC e recheio de puzzle já
existem. Você escreve **diálogo, hotspot, narração e coordenada** — e as fases 5
e 6 são praticamente novas.

**Leitura obrigatória:** `AGENTS.md`, `docs/decisoes/v2-desenho.md`,
`docs/decisoes/adr.md`, e `docs/roteiro/00-fundamentos.md`, `04-bloco-4.md`,
`05-bloco-5.md` para pegar o TOM e entender o clímax que você vai mover.

## Você escreve

```
src/domain/content/bloco4.ts
src/domain/content/bloco5.ts
src/domain/content/bloco6.ts
docs/roteiro/04-bloco-4.md, 05-bloco-5.md, 06-bloco-6.md
```

## Você NÃO toca

Nenhum outro arquivo. Nem `base.ts`, `types.ts`, `puzzles.ts`, `bloco1/2/3.ts`,
`src/ui/**`, `scripts/**`. **Não apague arquivo nenhum.**

---

## O tom

Leia o conteúdo atual antes de escrever. Curto, concreto, cheio de subtexto. NPC
entrega e para. Ninguém discursa. **O jogo dá o gancho, o apresentador dá a
lição** — conteúdo que explica a própria moral rouba a fala do apresentador.

Todo vocabulário de tecnologia sai (ADR-002), com **uma exceção**: as falas da
Bianca sobre ser formada em Letras e trabalhar com tecnologia (ADR-027).

## Fase 4 — saber se vender (Gianluca)

**Lugar:** Sala de Reuniões, que é onde a **Innovation Week** acontece. Um lugar
só. **Puzzle:** `montar`.

Innovation Week é o nome do evento em que estagiários apresentam o que fizeram e
que gerou impacto positivo (ADR-026). Não é laboratório e não é lugar separado: é
o que está acontecendo nesta sala.

Sequência da fase: ela prepara o resumo (`montar` — quatro peças que formam a
página de uma folha para o gestor), apresenta, e **entrega**. Depois vem a PAUSA.

**A PAUSA é o beat mais delicado do jogo.** Silêncio absoluto, por requisito de
spec. Não adicione narração ali. Ela funciona porque vem imediatamente depois do
momento de maior satisfação — é por isso que o laço desta fase termina aqui, e é
por isso que o `montar` precisa ser gostoso de resolver.

Item concedido: `cracha-innovation` (tardio — **não sinalize**). Skill:
`visibilidade`.

## Fase 5 — competências, faculdade e incerteza (Marianna)

**Lugar:** outra área da empresa — andar diferente, baias de outro time, outra luz
(ADR-031). **Puzzle:** nenhum. **A mecânica é o painel de skills.**

Esta fase é nova e é a mais delicada de escrever, porque o tom é específico:

O estágio está **prestes a acabar**. Ela **não sabe** se vai ser efetivada — e por
não saber, poderia ser que não fosse. Não é uma fase sobre fracasso: é insegurança
**com** orgulho do que foi construído, e reflexão sobre o resto da carreira
(ADR-028). Cuidado para não escrever consolo antecipado; o jogo nunca afirma o
desfecho aqui.

Três coisas que a fase carrega:

1. **Como foi esse tempo.** Ela revisa o que aprendeu. A interação é abrir a aba
   "O que eu aprendi" e percorrer as nove skills — o painel deixa de ser painel e
   passa a ser o gameplay. Outra frente está construindo o acordeão; você escreve
   o conteúdo que dá motivo para abri-lo.
2. **É essa a carreira que eu quero?** Competências contra área de estudo da
   faculdade. Não resolva a pergunta; deixe-a aberta.
3. **Dá para pivotar, e pivotar não é erro.** Esta é a fala da **Bianca**, que
   volta aqui. Ela é formada em Letras e trabalha com tecnologia. Ela não seguiu o
   caminho previsto e está bem — e é ela quem permite o jogo ser honesto sobre o
   pivô sem desmentir o final feliz que vem na fase seguinte. Para uma plateia de
   estagiários de áreas diferentes, ela é provavelmente a figura com quem mais
   gente vai se identificar. **Escreva a melhor fala do projeto aqui.**

Skill: `plano-futuro`. Nenhum item.

## Fase 6 — efetivação e fim

**Lugares:** a notícia e depois o Cafezinho **em festa**. Interação mínima.

Ordem exata (ADR-029 e ADR-030):

```
cartão de transição (salto de tempo)
        ↓
um personagem conta como o que ela fez a levou até ali, CONECTANDO TUDO
   — as quatro conexões são traçadas no mapa ENQUANTO ele fala
        ↓
corta para o Cafezinho: elenco inteiro comemorando a efetivação
        ↓
perguntas finais
```

Quando a pessoa entra na fase, **a festa já está acontecendo** — não há construção
de suspense aqui, o suspense foi a fase 5.

As quatro conexões vêm de `conexoes.ts` e já estão escritas pela spec 00: três
portas (itens tardios, que se apagam) e um motivo (a skill `proatividade`, que
**permanece acesa** quando todo o resto se apagou). Essa permanência é a tese do
projeto inteiro. Você escreve a fala do personagem que as narra — e cada conexão
é uma razão dita e desenhada ao mesmo tempo.

**O que você está movendo.** O conteúdo do clímax hoje vive em `bloco5.ts`
(notebook, mensagem, revelação). A spec 00 já o migrou para o esqueleto de
`bloco6.ts`. Sua tarefa é adaptá-lo à ordem nova e ao Cafezinho em festa.

**Perda declarada, não a tente consertar.** O retorno ao Escritório do primeiro
dia — *"mesma cadeira, mesmo notebook, mesma tela de login que ela não sabia
abrir"* — sai do clímax por decisão do dono. Não o reintroduza.

As `PERGUNTAS_FINAIS` já existem em `base.ts`, três, uma por clique, e depois
silêncio. Use as que estão lá.

## Coordenadas: a armadilha conhecida

Dois testes vão reprovar coordenada errada:
`src/ui/Cena.chao.test.ts` (pé fora do piso — já pegou 21 figuras em pé sobre
mobiliário) e `src/ui/Cena.geometria.test.ts` (hotspot sobreposto, Ana cobrindo o
que acionou).

```
python scripts/exportar_chao.py     (se a arte mudou)
python scripts/_mapa_chao.py        (faixa de piso por cena)
python scripts/previa_de_cena.py    (monta a cena e ESCREVE a imagem — OLHE)
```

A fase 6 tem o elenco inteiro numa cena só. Isso é cinco figuras mais a Ana no
mesmo piso: **é o caso mais difícil de posicionar do projeto**. Use o mapa de
piso, e olhe a prévia antes de declarar pronto.

O Cafezinho em festa e a outra área da empresa podem não existir ainda. Se não
existirem, escreva o melhor que puder e **declare no relatório** que as
coordenadas precisam de revisão quando a arte chegar.

## Critérios de aceite

- [ ] `npm run typecheck` e `npm test` verdes, incluindo geometria e vocabulário
- [ ] a PAUSA da fase 4 continua em silêncio absoluto
- [ ] a fase 5 nunca afirma que ela não será efetivada
- [ ] os itens tardios não são sinalizados
- [ ] a ordem da fase 6 é notícia+conexões → festa → perguntas
- [ ] roteiros atualizados, com os blocos `> 💡 **Gancho de fala:**`
- [ ] no relatório: cole a fala da Bianca na fase 5 e a fala que narra as quatro
      conexões na fase 6. São os dois textos de maior peso do projeto e precisam
      de revisão humana

## Não faça

- não escreva a lição na boca do NPC
- não reintroduza o retorno ao Escritório no clímax
- não adicione narração na PAUSA
- não mude `conexoes.ts`, `puzzles.ts`, `base.ts` nem `types.ts`
- não toque nas fases 1, 2 e 3
