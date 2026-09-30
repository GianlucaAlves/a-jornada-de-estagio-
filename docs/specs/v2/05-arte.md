# v2 / Spec 05 — Arte: dois cenários novos, a festa e nove rostos

**Não depende de nenhuma outra frente.** Comece imediatamente.

**Leitura obrigatória:** `AGENTS.md`, `docs/biblia-de-arte.md` **inteiro**,
`docs/decisoes/v2-desenho.md`, `docs/decisoes/adr.md` (ADR-009, 012, 026, 029,
031).

## Você escreve

```
scripts/pixelart/cenarios.py
scripts/pixelart/props.py
scripts/pixelart/personagens.py
scripts/pixelart/retratos.py       (novo)
scripts/gerar_arte.py              (só para registrar a frente nova)
```

## Você NÃO toca

`src/**`, `scripts/pixelart/nucleo.py`, `paleta.py`, `itens.py`. Quatro agentes
trabalham em `src/**` em paralelo. **Não apague arquivo nenhum** — renomeie ou
deixe de exportar, mas não delete.

---

## 1. Linha de Produção (cenário novo, substitui o Laboratório)

Grade 480x270, piso em `CHAO_DA_CENA = 232`, escala 4x.

É a linha de produção da Ericsson: **esteiras onde rádios de telecomunicação são
montados**, passando por processos diferentes ao longo do caminho, com **robôs**
participando (ADR-009). Altamente tecnológica, e segundo o dono parecida com um
laboratório de fato.

O tema da fase é **protagonismo**: a estagiária vê algo que pode ser otimizado e
age sem ninguém pedir. O cenário precisa deixar isso **visível** — uma esteira em
que uma etapa é visivelmente diferente das outras é compreensível para plateia de
qualquer área, ao contrário de log com timeout, que era o que existia antes.

Cumpra o checklist da bíblia §4.5: três planos em valor distinto, objeto de
primeiro plano cortado pela borda inferior, uma planta, uma tela ligada, uma luz
quente com poça no chão, um acento vermelho, nenhuma área plana maior que ~40x40.

## 2. Outra área da empresa (cenário novo)

Andar diferente, baias de outro time, **outra luz** (ADR-031). É onde a fase 5
acontece: a Ana se deslocou para ter uma conversa com alguém de fora do time dela.

Precisa ler como escritório **e** ser inconfundível com o Escritório da fase 1.
Mude o que define um ambiente: temperatura de luz, altura das divisórias,
densidade de ocupação, cor de parede. Não repita o mesmo layout com outra paleta —
foi apontado na revisão anterior que janela e poça de luz repetidas entre cenas
leem como carimbo.

## 3. Cafezinho em festa (variação de cenário)

O Cafezinho existe. A fase 6 usa **o mesmo lugar transformado em festa**: é o
argumento visual de que o lugar mudou porque ela mudou. Mesma planta baixa, mesma
máquina de café, e agora decoração, mesa posta, luz mais quente.

**Restrição forte:** o elenco inteiro fica em cena — cinco NPCs mais a Ana, seis
figuras no mesmo piso. É o caso mais difícil de posicionamento do projeto. Deixe
piso livre suficiente e **rode `scripts/exportar_chao.py` depois**, porque outra
frente vai posicionar as figuras contra o seu mapa de piso.

## 4. Nove retratos de rosto (arte nova, `retratos.py`)

Cinco NPCs mais os quatro estados da Ana.

**Não é recorte do sprite.** A cabeça ocupa 15×20 px de arte na grade de 50×84, e
ampliar isso para tamanho de retrato daria blocos de 10px fora da grade —
exatamente o defeito que a escala única existe para evitar (ADR-012).

Desenhe na **mesma escala 4x**, numa grade de rosto maior: algo como 40×48 px de
arte, que dá 160×192 na tela. O rosto ganha espaço para expressão, que é o que uma
cabeça falante precisa, e é assim que as referências fazem — retrato mais detalhado
que o sprite em cena.

O rosto do retrato tem de ser **reconhecivelmente a mesma pessoa** do sprite:
mesmo cabelo, mesma pele, mesma roupa na altura do ombro. A bíblia §5.2 trata o
rosto como dado canônico por esse motivo.

Saída: `public/assets/retratos/<id>.png`, com `<id>` batendo com o que
`src/assets/manifest.ts` declara — a spec 00 define os ids. Se o manifest ainda
não os tiver, use `npc-<id>` e `ana-<estado>` e declare no relatório.

## 5. Limpeza

`sala-treinamento` e `innovation` deixam de ser lugares (ADR-026). Pare de gerar
os cenários deles. **Não apague os arquivos de arte** — deixe de exportar, e
anote no relatório o que saiu de circulação, para o caso de a Sala de Reuniões
querer reaproveitar props do auditório (projetor, tela, cadeiras em fila).

A Sala de Reuniões agora é **onde a Innovation Week acontece**. Ela precisa
comunicar exposição além de reunião: acrescente o que um evento de apresentação
tem, sem mover o mobiliário existente — outra frente vai posicionar figuras contra
o piso atual dela.

## 6. Depois de gerar

```
python scripts/gerar_arte.py
python scripts/exportar_chao.py      OBRIGATÓRIO: os cenários mudaram
```

E **olhe**: `docs/arte/contato-*.png` e as prévias. Sprite que não foi visto não
está pronto — é regra do projeto, não formalidade.

## Critérios de aceite

- [ ] `python scripts/gerar_arte.py` roda limpo, zero aviso de `verificar_sprite`
- [ ] `python scripts/exportar_chao.py` regerado, com piso em 480 de 480 colunas
      nos cinco lugares
- [ ] folhas de contato geradas **e olhadas**. No relatório, descreva o que você
      VIU em cada cenário novo e o que corrigiu depois de olhar.
- [ ] a Linha de Produção mostra uma etapa visivelmente diferente das outras
- [ ] a outra área não é confundível com o Escritório da fase 1 — diga no
      relatório o que você mudou além da paleta
- [ ] o Cafezinho em festa tem piso livre para seis figuras
- [ ] os nove retratos são reconhecivelmente as mesmas pessoas dos sprites
- [ ] `npm run typecheck` e `npm test` seguem passando

## Não faça

- não use escala diferente de 4x
- não invente cor fora de `paleta.py`; se faltar, adicione **lá** e anote na bíblia
- não mova mobiliário de cenário existente: outra frente está posicionando figuras
  contra a geometria atual
- não apague arquivo nenhum
- não use fonte pixelada nem escreva texto dentro de cenário
