# Spec 01 — Cenários: seis lugares que parecem habitados

**Leia antes:** `AGENTS.md`, `docs/biblia-de-arte.md` (§1 referências, §3
paleta, §4 composição — os três são obrigatórios).

**Você escreve em:** `scripts/pixelart/props.py` e
`scripts/pixelart/cenarios.py`. **Não toque em `src/**` nem nos outros módulos
de arte.**

## O problema

Os cenários atuais são vetoriais e, segundo o dono do projeto, *"meio vazios e
que não fazem sentido"*. Falta densidade, falta calor, falta profundidade. O
alvo é a riqueza de Fate of Atlantis: cena em três planos, superfície
texturizada, oposição quente/frio.

## Entregáveis

### 1. `props.py` — a biblioteca que faz a cena existir

480x270 são 129.600 pixels. Ninguém escreve isso à mão. **Cena é montada, não
desenhada.** Construa props como funções que devolvem `Grade` e cole com
`colar_base()`.

Mínimo esperado (cada um com 2–3 variações de tom ou tamanho):

*Mobiliário:* mesa de trabalho, cadeira de escritório (frente e perfil),
armário baixo, prateleira, divisória de baia, mesa de reunião, sofá pequeno.

*Tecnologia:* monitor ligado (com tira de 2 quadros para o cursor piscando),
notebook aberto e fechado, rack de servidor com LEDs, telefone, projetor,
tela de TV grande.

*Vida — os três obrigatórios da bíblia §3:* vaso com planta (duas espécies,
tamanhos diferentes), caneca (com vapor em 2 quadros), luminária de mesa e
pendente, quadro branco com rabisco, cartaz na parede, pilha de papel, caixa
de papelão, bebedouro, garrafa de água.

*Arquitetura:* janela (dia e poente), porta aberta e fechada, batente, rodapé,
placa de sinalização, extintor (o acento vermelho).

Cada prop precisa de **sombra de contato** (bíblia §4.4) — sem ela tudo parece
adesivo.

### 2. `cenarios.py` — os 6 lugares + o mapa

`escritorio`, `cafezinho`, `sala-treinamento`, `laboratorio`, `innovation`,
`sala-reunioes`, `mapa`. Grade `480x270`, piso em `CHAO_DA_CENA = 232`.

**Leia `src/domain/content/bloco1.ts` até `bloco5.ts` antes de compor.** Cada
cena tem hotspots com `pos` e `parada` em % do canvas, e o cenário tem de
deixar espaço para eles: o notebook do Bloco 1 fica em `{x:29, y:74}`, então
existe uma mesa ali. O escritório é base recorrente (Blocos 1, 3 e 5) e precisa
funcionar nos três.

Cada cena cumpre o checklist da bíblia §4.5. Repetindo o que mais falha:

- três planos distintos em **valor**, e um objeto de primeiro plano **cortado
  pela borda inferior** — é o que mais dá profundidade e o que mais falta
- uma planta, uma tela ligada, uma luz quente **com poça no chão**
- exatamente um acento vermelho
- nenhuma área maior que ~40x40 px com cor plana: texturize com dither esparso
- o personagem cai em faixa de valor diferente do que está atrás dele

Dê identidade a cada lugar, não repinte o mesmo escritório:

| Lugar | Identidade visual |
|---|---|
| escritorio | baias, muitas telas, luz fria de teto, janela ao fundo |
| cafezinho | madeira dominante, luz quente, caneca, bancada, mais aconchegante |
| sala-treinamento | cadeiras em fila, projetor, quadro branco, luz mais baixa |
| laboratorio | rack, LED, ciano dominante, bancada metálica, cabos |
| innovation | protótipo, post-it colorido, mais desarrumado e mais vivo |
| sala-reunioes | mesa grande, TV, vidro, formal e simétrica |

O **mapa** não é cena: é diagrama dos seis lugares. Precisa funcionar com lugar
em três estados (`silhueta`, `destravado`, `concluido`) — leia `src/ui/Mapa.tsx`
para ver como é consumido.

### 3. Sprites de objeto interativo

A frente de interação de cena vai deixar em `docs/specs/objetos-pendentes.md` a
lista de objetos que são hotspot (notebook, rack, quadro...). **Cada um precisa
de PNG próprio**, com transparência, em `public/assets/objetos/<nome>.png`, e o
cenário deve deixar o lugar dele vazio — objeto interativo é sprite separado
para poder receber aura no hover.

Se o arquivo ainda não existir quando você começar, gere os objetos óbvios do
Bloco 1 (`notebook`, `notebook-aberto`) e siga.

### 4. Contrato do módulo

```python
def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG em `destino` e devolve (nome, grade) para a folha."""
```

`scripts/gerar_arte.py` chama isso. Nomes de arquivo conforme
`src/assets/manifest.ts`: `cenarios/escritorio.png` etc.

## Critérios de aceite

- [ ] `python scripts/gerar_arte.py cenarios` roda limpo
- [ ] `docs/arte/contato-cenarios.png` gerada **e olhada** — descreva no seu
      relatório o que você viu em cada cena e o que corrigiu depois de olhar
- [ ] 7 PNG em `public/assets/cenarios/` + `public/assets/mapa/mapa.png`
- [ ] cada cena passa o checklist §4.5 (liste-o item por item no relatório)
- [ ] os seis lugares são distinguíveis entre si sem legenda
- [ ] `npm run typecheck` e `npm test` seguem passando

## Não faça

- não use escala diferente de 4x
- não invente cor fora de `paleta.py`; se faltar, adicione lá e anote na bíblia
- não deixe o cenário mais claro que o personagem na área atrás dele
- não use fonte pixelada nem escreva texto dentro do cenário (a UI cuida do
  texto, e o piso de 22px é do spec)
