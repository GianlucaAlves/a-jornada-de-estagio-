# Spec 03 — Itens: oito objetos que se leem a 24px

**Leia antes:** `AGENTS.md`, `docs/biblia-de-arte.md` (§2 regras duras, §3
paleta).

**Você escreve em:** `scripts/pixelart/itens.py`. **Não toque em `src/**` nem
nos outros módulos de arte.**

## Contexto que muda o desenho

Os oito itens têm um papel narrativo específico, descrito em
`src/domain/types.ts` e no conteúdo: cinco são **imediatos** e três são
**tardios** (sem uso aparente até o Bloco 5, quando viram as portas do clímax).

O tipo marca isso com `tardio: boolean`, mas há um comentário explícito no
código:

> *Itens tardios NUNCA insinuam uso futuro — qualquer marcação anunciaria o
> clímax.* / *Metadado interno; a UI NÃO diferencia.*

**Consequência direta para você: os três tardios não podem ter brilho, moldura,
aura, acento especial nem qualquer destaque visual.** Mesma linguagem, mesmo
peso, mesma quantidade de detalhe que os cinco imediatos. Se alguém olhando a
barra de itens conseguir apontar quais são os tardios, a arte estragou a
revelação.

## Entregáveis

### Os oito itens, grade `24x24`

Imediatos: `senha`, `indicacao-trilha`, `anotacoes-treinamento`, `relatorio`,
`projeto-entregue`.

Tardios: `cartao-rafael`, `certificado-degree`, `cracha-innovation`.

Leia `src/domain/content/base.ts` para o nome e a descrição de cada um antes de
desenhar — a descrição diz o que o objeto é.

24x24 é apertado, então:

- **silhueta primeiro.** A 96px na tela o que se lê é o contorno. Se dois itens
  têm silhueta parecida, um dos dois está errado.
- **um acento de cor por item**, para diferenciar na barra de itens. Use
  famílias diferentes entre os oito: não faça seis itens de papel branco.
- **sem texto legível.** Escrita a 24px vira ruído. Sugira com 2–3 linhas de
  dither num tom médio, nunca com letras.
- **volume com três casas da rampa**, luz de cima-à-esquerda. Use
  `caixa_com_volume()` como base para o que for retangular.
- item é objeto solto, então **não** leva sombra de contato — ele é mostrado
  sobre a barra de itens, não sobre um piso.

### Segunda versão para a cena

Item que aparece como hotspot no cenário precisa ler a 96px **contra o
cenário**, não contra o fundo escuro da barra. Gere também
`<id>-cena.png` com contorno reforçado: uma segunda passada de `contornar()`
nos itens que aparecem em cena deixa 2px de borda e resolve a leitura.

Confira em `src/domain/content/bloco1..5.ts` quais itens são hotspot de cena.

### Contrato do módulo

```python
def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG em `destino` e devolve (nome, grade) para a folha."""
```

`destino` é `public/assets/itens/`. Nomes conforme `src/assets/manifest.ts`.

## Critérios de aceite

- [ ] `python scripts/gerar_arte.py itens` roda limpo
- [ ] `docs/arte/contato-itens.png` gerada **e olhada** — no relatório,
      responda: *dá para nomear os oito só pela silhueta?* e *é possível
      apontar quais são os três tardios olhando a folha?* (a segunda resposta
      tem de ser **não**)
- [ ] 8 PNG em `public/assets/itens/` + as versões `-cena` necessárias
- [ ] oito silhuetas distintas, oito acentos de família diferente
- [ ] nenhum texto legível em nenhum item
- [ ] `npm run typecheck` e `npm test` seguem passando

## Não faça

- não destaque os itens tardios de forma alguma
- não escreva letras dentro do sprite
- não invente cor fora de `paleta.py`
- não use roxo (reservado à revelação)
