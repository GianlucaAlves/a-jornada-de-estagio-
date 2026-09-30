# v2 — desenho consolidado

Síntese do grilling. Cada linha aqui tem um ADR por trás em
`docs/decisoes/adr.md`; este documento existe para ver o conjunto de uma vez.

**Estado: aguardando confirmação do dono antes de virar spec.**

---

## A mudança em uma frase

A história deixa de ser sobre uma estagiária de dados num squad de tecnologia e
passa a ser sobre **ser estagiário** — as atitudes que dão sucesso em qualquer
área. Seis fases em ordem fixa, cinco apresentadores humanos, e todo vocabulário
de nicho fora.

---

## As seis fases

| # | Tema | Apresentador | Lugar (laço) | Puzzle |
|---|---|---|---|---|
| 1 | timidez, insegurança | Pedro | Escritório | `senha` |
| 2 | aprendizado contínuo, planejamento | Heloisa | Cafezinho → Escritório → Cafezinho | `associar` + `sequenciar` |
| 3 | protagonismo | João | Linha de Produção → Escritório → Linha de Produção | `estruturar` |
| 4 | saber se vender | Gianluca | Sala de Reuniões (= Innovation Week) | `montar` |
| 5 | competências, faculdade, incerteza | Marianna | Outra área da empresa | nenhum — o painel de skills é a mecânica |
| 6 | efetivação, fim | — | Cafezinho em festa | nenhum |

A ordem dos temas é fixa: é isso que "linear" significa aqui. Dentro da fase há
leva-e-traz, e **a fase abre e fecha no mesmo lugar**.

A navegação pelo mapa continua como é hoje: lugares começam bloqueados, vão sendo
destravados, e daí em diante a pessoa vai onde quiser — só não tem nada para fazer
fora de onde a fase pede. A contenção vem do conteúdo, não de trava de clique.

## Os cinco lugares

Eram seis. `sala-treinamento` e `innovation` colapsaram na Sala de Reuniões
(ADR-026); a fase 5 trouxe um lugar novo (ADR-031).

1. **Escritório** — fases 1, 2 (ida) e 3 (ida). Recorre de propósito.
2. **Cafezinho** — fase 2 (origem) e fase 6, em versão de festa.
3. **Linha de Produção** — fase 3. Esteiras, rádios em montagem, robôs.
4. **Sala de Reuniões** — fase 4. É onde a Innovation Week acontece e onde a
   entrega e a PAUSA caem.
5. **Outra área da empresa** — fase 5. Andar diferente, outro time, outra luz.

## A fase 6, momento a momento

```
cartão de transição (salto de tempo)
        ↓
personagem conta como o que ela fez a levou até ali
   — e as QUATRO CONEXÕES são traçadas no mapa enquanto ele fala
        ↓
corta para o Cafezinho: elenco inteiro comemorando
        ↓
perguntas finais
```

As quatro conexões continuam sendo três **portas** (itens tardios, que se apagam)
mais um **motivo** (a skill `proatividade`, que permanece acesa). É a tese.

## Elenco

Cinco NPCs, recorrentes, com **cargo sempre junto do nome**. Os nomes ficam —
nenhum colide com os apresentadores. Os cargos saem de tecnologia.

- **Cláudia** — líder da Ana
- **Rafael** — colega de outro time, a ponte social; é dele o cartão
- **Tiago** — veterano do operacional, seco
- **Bianca** — dois anos de casa; mostra Degreed e Percipio na fase 2 e **volta
  na fase 5** para falar de pivotar. Formada em Letras, trabalha com tecnologia:
  é a única exceção permitida ao expurgo de vocabulário técnico, porque a frase
  depende do contraste entre as duas áreas.
- **Marcos** — de outra área

## Os cinco itens

Eram oito. Saíram `senha`, `indicacao-trilha` e `projeto-entregue`, que não eram
usados em lugar nenhum.

| Item | Onde nasce | Onde é usado |
|---|---|---|
| `anotacoes-treinamento` | fase 2 | fase 3, e é consumida |
| `relatorio` | fase 3 | fase 3, entregue à Cláudia |
| `cartao-rafael` | fase 1 | fase 2, e é porta do clímax |
| `certificado-degree` | fase 2 | porta do clímax |
| `cracha-innovation` | fase 4 | porta do clímax |

O certificado deixa de nomear curso e plataforma. Passa a ser *"40 horas, fora do
horário de trabalho"*, e a conexão do clímax vira *"A vaga pedia alguém disposto
a aprender o que ainda não sabia. Ela tinha quarenta horas que ninguém mandou
fazer."* Trocou o eixo: de **o que** ela estudou para **quanto, e por conta de
quem**.

## Os quatro puzzles

Mecânicas ficam, recheio é reescrito para ser universal e servir de gancho ao
apresentador da fase.

- **`senha`** (f1) — social: cada NPC tem um pedaço. Continua digitada, e agora o
  diálogo pode ser relido, porque as pistas só existem nas falas.
- **`associar`** (f2) — ligar lacuna a trilha, no Degreed e no Percipio.
- **`sequenciar`** (f2) — ordenar a semana por impacto no trabalho do time. Veio
  da fase 3. O gancho é o terceiro pilar da Heloisa: negociar prazo com
  transparência quando cai uma demanda e há prova na faculdade.
- **`estruturar`** (f3) — problema, solução, impacto, com dois fragmentos que não
  encaixam em lugar nenhum.
- **`montar`** (f4) — quatro peças que montam o resumo de uma página para o
  gestor. **Hoje não é um puzzle**: não tem gabarito, qualquer peça encaixa em
  qualquer espaço, e os alvos não têm rótulo visível. Precisa de gabarito, rótulo
  e estado de erro.

Todos passam a avisar quando se erra.

## Mudanças técnicas que os ADRs fixaram

**Corretude**
- `abrirPuzzle` só escreve `liberado` se o estado não for `resolvido`. Sem isso,
  todo hotspot que abre puzzle precisa ser `umaVezSo`, e um botão de voltar
  órfãria hotspots para sempre — no `sequenciar` seriam cinco.
- Puzzle ganha saída; sair **reinicia** o puzzle.
- Três puzzles têm clique morto com cursor de mão (botão `disabled` ainda com
  `cursor: pointer`).

**Persistência**
- Estado salvo no navegador a cada mudança: fase, tela, itens, skills, lugares,
  puzzles.
- Na abertura, se houver progresso salvo: "Continuar" ou "Começar do início". A
  escolha é explícita porque o pior defeito ao vivo é abrir o jogo e ele começar
  na fase 4 por causa do ensaio de ontem.
- `reiniciar()` já existe na store e hoje é código morto.

**Tela**
- Caixa de diálogo encolhe. O retrato passa a ser só o **rosto**. Hoje ela ocupa
  1376×340 px — 22,6% do canvas, opaca — e intercepta 22 dos 24 hotspots, sete
  deles 100%, cobrindo justamente quem fala.
- **Nove retratos de rosto** em arte nova: 5 NPCs e 4 estados da Ana. Não sai por
  recorte — a cabeça tem 15×20 px de arte na grade de 50×84, e ampliar daria
  blocos fora da grade.
- Descrição de item passa a fechar: clique no mesmo item, clique em outra coisa,
  ou alguns segundos. Hoje é estado local apagado só quando o item sai da barra,
  e sobrevive ao bloco inteiro.
- Painel de skills em acordeão: só as conquistadas, clicáveis, a nova abre e
  fecha a anterior. Sem contador.
- Cargo do NPC em toda ocorrência do nome.
- Diálogo pode ser relido clicando de novo no NPC.

**Estrutura**
- `BlocoId` ganha o 6. `CARTOES` ganha o sexto cartão, com o nome do apresentador.
- `LugarId` muda: cinco lugares, nomes novos.
- Correção de fato: a plataforma é **Degreed**, não `Degree`.

**Publicação**
- Vercel, na raiz do domínio. Verificado: `npm run build` passa e a arte chega em
  `dist/assets/**` sem colidir com o bundle.
- Consequência aceita: quem jogar sozinho recebe a história, não o conselho de
  carreira — os ganchos são a fala do apresentador, e absorvê-los na narração
  engordaria a versão ao vivo.

---

## O que este documento NÃO decide

Escrita. Os diálogos das seis fases, o recheio exato dos quatro puzzles, os
cargos literais dos cinco NPCs, o texto da fase 5, a composição dos dois cenários
novos (Linha de Produção e outra área) e a versão de festa do Cafezinho.

Isso vira spec por frente, com subagentes em paralelo.
