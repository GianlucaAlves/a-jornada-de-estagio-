# Spec 02 — Personagens: a Ana com braços, e cinco pessoas distintas

**Leia antes:** `AGENTS.md`, `docs/biblia-de-arte.md` (§2.4 o vão, §5 anatomia,
§6 animação — obrigatórios).

**Você escreve em:** `scripts/pixelart/personagens.py`. **Não toque em `src/**`
nem nos outros módulos de arte.**

## O problema, nas palavras do dono do projeto

> *"o sprite da Ana está meio esquisito na primeira fase, os braços dela estão
> esquisitos, é quase como se ela não tivesse braços, e mais do que isso, está
> tudo muito travadão"*

As duas queixas têm causa conhecida e documentada:

**Braços.** Na pose `encolhida` o vão de 1px entre braço e torso foi removido
de propósito, para sugerir "braços colados ao corpo". Resultado: do ombro ao
quadril virou um bloco só. Ver bíblia §2.4 — **o vão é anatomia e nunca sai.**
Postura fechada se faz mantendo o vão e aproximando o braço 1–2px.

**Travado.** Não há animação nenhuma; o `jogo-bob` atual balança o sprite
inteiro por CSS, o que lê como folha de papel arrastando.

## Ponto de partida

`scripts/pixelart/_ana_recuperada.py` tem as quatro poses em grade `50x84`,
recuperadas dos PNG antigos. **O contorno já está aplicado nelas** — apague os
`K` de borda antes de chamar `contornar()`, senão o contorno engrossa.

A geometria é reaproveitável: 84px de altura é exatamente a altura-alvo em 4x.
O rosto (bíblia §5.2) é dado canônico e **não deve ser redesenhado**.

## Entregáveis

### 1. As quatro poses da Ana, com braços legíveis

`ana-encolhida`, `ana-neutra`, `ana-confiante`, `ana-futura`.
Eixo em `x=25`, base em `y=81` nas quatro.

Diferencie por **vazio**, conforme bíblia §5.3:

| Pose | Vão braço-torso | Ombros | Base | Cabeça |
|---|---|---|---|---|
| encolhida | **1px, nunca zero** | ~13px | pés juntos | 3px mais baixa, queixo enfiado |
| neutra | 1px | ~19px | normal | normal |
| confiante | 2px | ~21px | aberta | 1px mais alta |
| futura | triângulo de **3px ou mais** | ~21px | aberta | 1px mais alta |

Na `futura` o vazio do cotovelo precisa de 3px+ para o miolo sobrar
transparente: a dilatação alcança só 1px de cada lado, e com 2px o triângulo
fecha em preto e a pose morre.

`ana-futura` é o único personagem autorizado a usar roxo `VWXY` (bíblia §3).

### 2. Cinco NPCs distintos

`rafael`, `claudia`, `tiago`, `bianca`, `marcos`. Base em `y=81`.

Leia os diálogos em `src/domain/content/bloco1..5.ts` para saber quem é cada um
antes de desenhar. Cláudia é líder; Tiago é infraestrutura; Rafael é a ponte
social.

Cada um reconhecível **por silhueta, antes da cor** (bíblia §5.4):

- altura varia ±4px sobre a base de 84
- **tom de pele varia de verdade**: a paleta tem quatro famílias (`sS`, `tT`,
  `kl`, `NO`) e todas devem aparecer. Elenco todo na mesma pele lê como o mesmo
  NPC repintado.
- cabelo varia em volume e comprimento, não só em cor
- roupa varia em **silhueta**: camisa social, camiseta, blazer, moletom,
  colete — não basta trocar o tom do mesmo blazer
- postura varia: ombro caído, braços cruzados (com vão!), mão no bolso

### 3. Animação: tiras de quadros

Use `deslocar()` — respiração é o mesmo sprite 1px acima, não um sprite novo.
Redesenhar quadro de idle introduz inconsistência de rosto.

Para **cada** personagem (Ana nos 4 estados + 5 NPCs):

- `<id>-idle.png` — tira de **2 quadros**: ombro e cabeça 1px acima. É o item
  de maior retorno do projeto inteiro: sprite que respira deixa de ser adesivo.

Para a Ana, adicionalmente:

- `<id>-andando.png` — tira de **4 quadros**: contato, passagem, contato
  oposto, passagem. Pernas alternando, braços em contrafase, corpo 1px acima
  nas passagens.

`escrever_tira()` exige quadros de largura idêntica e levanta erro se não
forem — é o que evita a animação tremer.

### 4. Contrato do módulo

```python
def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG em `destino` e devolve (nome, grade) para a folha."""
```

`destino` é `public/assets/protagonista/`. Os NPCs vão em
`public/assets/npcs/<id>.png` — crie a pasta; confira os nomes em
`src/assets/manifest.ts`.

Chame `verificar_sprite(nome, grade, centro=25, chao=81)` em **tudo** e
resolva todo aviso. Eixo fora por 1px deixa a figura torta sem que se consiga
apontar onde.

## Critérios de aceite

- [ ] `python scripts/gerar_arte.py personagens` roda limpo, zero aviso de
      `verificar_sprite`
- [ ] `docs/arte/contato-personagens.png` gerada **e olhada** — no relatório,
      responda explicitamente: *dá para ver os braços da Ana encolhida?* e
      *os cinco NPCs são distinguíveis entre si sem legenda?*
- [ ] 4 sprites da Ana + 5 NPCs + 9 tiras de idle + 4 tiras de caminhada
- [ ] o vão braço-torso existe em **todas** as poses, inclusive encolhida
- [ ] as quatro famílias de pele aparecem no elenco
- [ ] `npm run typecheck` e `npm test` seguem passando

## Não faça

- não redesenhe o rosto: use o dado canônico da bíblia §5.2
- não remova o vão para expressar postura fechada — é o erro que causou isto
- não mude a base de `y=81`: altura variável faz o elenco flutuar ao trocar
  de cena
- não use roxo fora de `ana-futura`
