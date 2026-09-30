# v2 / Spec 01 — Conteúdo das fases 1, 2 e 3

**Depende da spec 00.** Os ids, os tipos, os cinco itens, os perfis de NPC com
cargo e o recheio dos puzzles já existem quando você começa. Você escreve
**diálogo, hotspot, narração e coordenada**.

**Leitura obrigatória:** `AGENTS.md`, `docs/decisoes/v2-desenho.md`,
`docs/decisoes/adr.md`, e `docs/roteiro/00-fundamentos.md` até `03-bloco-3.md`
para pegar o TOM. O tom é a coisa mais fácil de perder e a mais difícil de
recuperar.

## Você escreve

```
src/domain/content/bloco1.ts
src/domain/content/bloco2.ts
src/domain/content/bloco3.ts
docs/roteiro/01-bloco-1.md, 02-bloco-2.md, 03-bloco-3.md
```

## Você NÃO toca

Nenhum outro arquivo. Nem `base.ts`, nem `types.ts`, nem `puzzles.ts`, nem
`bloco4/5/6.ts`, nem `src/ui/**`, nem `scripts/**`. Cinco agentes trabalham em
paralelo. **Não apague arquivo nenhum.**

---

## O tom, que é metade do trabalho

Leia o conteúdo atual antes de escrever. A escrita deste projeto é **curta,
concreta e cheia de subtexto**. NPC entrega a informação e para. Ninguém
discursa. Exemplos do que já existe e que você deve igualar:

> **Tiago:** Ah, a nova! Senha de primeiro acesso tá no e-mail de boas-vindas.
> **Ana:** Eu não consigo abrir o e-mail sem a senha.
> **Tiago:** *(pausa)* É. Todo mundo cai nessa.

Note: três linhas, uma piada seca, zero explicação. O tema (medo de perguntar) não
é dito — é **encenado**, e o apresentador é quem o nomeia. Essa é a regra: o jogo
dá o gancho, o apresentador dá a lição. Conteúdo que explica a própria moral rouba
a fala do apresentador e é o pior erro possível aqui.

**Todo vocabulário de tecnologia sai** (ADR-002). Sem `DT7`, sem "Data &
Transformation", sem log, retry, timeout, Git, arquitetura de sistemas. A Ana é de
**apoio a projetos**: planilha, prazo, reunião, relatório, cobrança de status.

## Fase 1 — timidez e insegurança (Pedro)

**Lugar:** Escritório, um só. **Puzzle:** `senha`.

A cena do primeiro dia. Ela não consegue entrar no sistema e a senha precisa de
três pedaços que três pessoas diferentes têm. O puzzle é **social, não lógico** —
isso é o coração da fase e não pode ser diluído.

Obrigatório: cada NPC diz a pista dele de forma **literal e inequívoca**. Se a
pista for sugerida, o puzzle fica insolúvel ao vivo. As pistas exatas estão em
`puzzles.ts`, escritas pela spec 00 — use as que estão lá, não invente outras.

O Rafael deixa o cartão com o ramal escrito à mão. É o item tardio nº 1 e paga na
fase 6 — não sinalize isso de forma nenhuma.

Skills concedidas: `coragem-perguntar`, `autoconhecimento`.

## Fase 2 — aprendizado contínuo e planejamento (Heloisa)

**Laço:** Cafezinho → Escritório → Cafezinho. **Puzzles:** `associar` e
`sequenciar`.

Dois assuntos, um gancho cada. No Cafezinho a Bianca conta das plataformas
(Degreed e Percipio) e do jeito de se organizar. No Escritório a Ana faz o
trabalho: `associar` (as lacunas dela ligadas às trilhas) e `sequenciar`
(ordenar a semana por impacto no time). Volta ao Cafezinho para fechar.

**A Bianca é o coração desta fase.** Ela é formada em Letras e trabalha com
tecnologia, e é a **única exceção autorizada** ao expurgo de vocabulário técnico
(ADR-027) — porque a frase depende do contraste entre as duas áreas. Ela volta na
fase 5 falando disso; aqui ela só planta. Não antecipe.

O gancho do `sequenciar` é o terceiro pilar da Heloisa, e é o material mais
universal do projeto: **negociar prazo com transparência** quando cai uma demanda
de última hora e há prova na faculdade. Nem aceitar e entregar mal, nem dizer um
não seco. Encene isso; não explique.

Itens concedidos: `certificado-degree` (tardio — sem sinalizar),
`anotacoes-treinamento` (usado na fase 3).
Skills: `leitura-mercado`, `aprendizado-continuo`, `competencia-tecnica` — com os
textos que a spec 00 revisou.

## Fase 3 — protagonismo (João)

**Laço:** Linha de Produção → Escritório → Linha de Produção. **Puzzle:**
`estruturar`.

A fase mais importante da tese. Ela começa na **linha de produção** — esteiras
onde rádios de telecomunicação são montados, com robôs ao longo do caminho — e vê
uma oportunidade de otimizar algo que **ninguém pediu para ela olhar**. Para agir
precisa de algo do Escritório: vai falar com a Cláudia e volta.

**Atenção à direção do laço.** Hoje o `relatorio` nasce na produção e é entregue
à Cláudia no Escritório, então a fase termina onde não começou. Inverta: a
produção é origem **e** destino; o Escritório é a ida. O `anotacoes-treinamento`
que veio da fase 2 é consumido aqui.

O `estruturar` é onde ela organiza o que viu em problema, solução e impacto — e
dois dos cinco fragmentos não encaixam em lugar nenhum, porque estruturar é
escolher. Mantenha os distratores.

Item concedido: `relatorio`. Skills: `proatividade`, `protagonismo`.
A `proatividade` é a skill que fica acesa no clímax — é a tese. O momento em que
ela é concedida é o momento mais importante da fase.

## Coordenadas: a armadilha conhecida

Toda `pos` e `parada` que você escrever passa por dois testes que **vão** reprovar
você se errar:

- `src/ui/Cena.chao.test.ts` — reprova pé fora do piso. Já pegou 21 figuras em pé
  sobre mobiliário.
- `src/ui/Cena.geometria.test.ts` — reprova hotspot sobreposto e Ana cobrindo o
  hotspot que acionou.

Antes de escolher coordenada, **leia o mapa de piso**:

```
python scripts/exportar_chao.py     (se a arte mudou)
python scripts/_mapa_chao.py        (imprime a faixa de piso por cena)
```

E depois **olhe**: `python scripts/previa_de_cena.py` monta cenário + elenco nas
coordenadas reais e escreve `docs/arte/previa-*.png`. Teste não substitui olhar.

Os cenários novos podem não existir ainda (outra frente os está desenhando). Se o
mapa de piso da Linha de Produção não existir, escreva as coordenadas como melhor
puder e **declare no relatório** que elas precisam de revisão quando a arte chegar.

## Critérios de aceite

- [ ] `npm run typecheck` e `npm test` verdes, incluindo os dois testes de
      geometria e o de vocabulário banido
- [ ] nenhuma fala explica a própria moral
- [ ] zero vocabulário técnico fora das falas da Bianca
- [ ] as três pistas da senha são literais
- [ ] cada fase abre e fecha no mesmo lugar
- [ ] os roteiros em `docs/roteiro/` foram atualizados junto, com os blocos
      `> 💡 **Gancho de fala:**` que já são convenção do projeto
- [ ] no relatório: cole as falas que você escreveu para os três momentos mais
      importantes (a primeira da fase 1, a da Bianca na fase 2, a da concessão de
      `proatividade` na fase 3) para revisão humana

## Não faça

- não escreva a lição na boca do NPC — o gancho é do apresentador
- não sinalize os itens tardios de forma nenhuma
- não mude `puzzles.ts`, `base.ts` nem `types.ts`
- não toque nas fases 4, 5 e 6
