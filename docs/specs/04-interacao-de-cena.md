# Spec 04 — Interação de cena: o hotspot passa a ser a arte

**Leia antes:** `AGENTS.md`, `docs/biblia-de-arte.md` (§7 inteiro, §6 para
animação). Sua frente escreve em `src/**`. **Não toque em `scripts/**`.**

## O problema

`src/ui/Cena.tsx` hoje renderiza cada hotspot assim:

```tsx
<button className="jogo-botao" style={{ minWidth: 260, maxWidth: 520, ... }}>
  {hotspot.rotulo}
</button>
```

Consequência: NPCs e itens **não existem visualmente**. A cena é um cenário com
placas de texto por cima, e não se sabe com quem se está falando até clicar.
Os retângulos se sobrepõem. É a regressão central que esta spec conserta.

## Entregáveis

### 1. `Hotspot` passa a declarar sua arte (`src/domain/types.ts`)

```ts
/** Qual arte representa este hotspot dentro da cena. */
export type ArteDeHotspot =
  | { tipo: 'npc'; npcId: NpcId }
  | { tipo: 'item'; itemId: ItemId }
  /** Objeto de cenário interativo (notebook, rack, quadro...). */
  | { tipo: 'objeto'; assetId: string; largura: number; altura: number };
```

Adicione a `Hotspot`:

```ts
  /** OBRIGATÓRIO: hotspot sem arte é hotspot invisível, e isso é bug. */
  arte: ArteDeHotspot;
  /** 'base' = assenta no chão (padrão). 'centro' = coisa de parede. */
  ancora?: 'base' | 'centro';
```

Campo **obrigatório de propósito**: a ausência tem de quebrar a compilação, não
a apresentação.

### 2. Migre o conteúdo (`src/domain/content/bloco1..5.ts`)

Todo hotspot recebe `arte`. Hotspot cujo id coincide com um `NpcId` vira
`{ tipo: 'npc' }`. Hotspot de item vira `{ tipo: 'item' }`. O resto é `objeto`
com um `assetId` novo e tamanho em px de tela (múltiplos de 4).

Declare os `assetId` de objeto em `src/assets/manifest.ts`, apontando para
`/assets/objetos/<nome>.png`. **Os PNG podem não existir ainda** — a cadeia de
fallback do `Imagem.tsx` cobre isso, e é justamente para isso que ela existe.
Deixe a lista de objetos que você criou em `docs/specs/objetos-pendentes.md`
para a frente de cenários gerar a arte.

### 3. Corrija sobreposição de hotspots

Hoje se sobrepõem, e com sprite fica pior que com retângulo. Revise `pos` e
`parada` em todos os blocos:

- nenhuma área de hotspot invade outra
- a `parada` da Ana é escolhida para ela **não cobrir** o hotspot que acabou de
  acionar — lateral ou à frente, nunca em cima
- nada cai atrás do botão "Voltar ao mapa" (canto superior esquerdo) nem do
  título (topo centro)

Adicione teste em `src/domain/content/integridade.test.ts`:
- todo hotspot declara `arte`
- dois hotspots da mesma cena não ficam a menos de 6% de distância em `pos`
- todo `assetId` de objeto existe no `MANIFEST`

### 4. `Cena.tsx`: o hotspot vira arte com aura

Substitua o botão-retângulo por um botão **nu** (`jogo-botao-nu`) envolvendo
`<Imagem>`:

- alvo de clique nunca menor que `alvo.minimo`; objeto pequeno ganha área
  invisível em volta (padding), não sprite esticado
- `aria-label` mantém o texto atual (interagir com / usar item em) — a
  acessibilidade não pode regredir junto com o retângulo
- ancoragem via `Posicionado` com `ancora` do hotspot
- **aura no `:hover` e no `:focus-visible`**, nunca só no hover: quem navega por
  teclado precisa do mesmo sinal

### 5. Linha de nome no rodapé (componente novo, `src/ui/LinhaDeFoco.tsx`)

Uma linha única, fixa, centralizada no rodapé, que mostra o rótulo do hotspot
sob o ponteiro ou com foco. Vazia quando não há nada.

- fonte no piso do spec (`tipografia.tamanhos.minimo`, 22px) — discreto é
  posição e peso, **nunca** fonte menor que 22px
- fundo `cores.veuLeve`, sem borda grossa: não é caixa, é legenda
- some sem animação de saída brusca; use `duracao.curta`
- **um** elemento na tela, não um por hotspot

### 6. Aura e animação em `src/styles/global.css` + `tokens.ts`

```css
.jogo-hotspot-arte { image-rendering: pixelated; }

.jogo-hotspot:hover .jogo-hotspot-arte,
.jogo-hotspot:focus-visible .jogo-hotspot-arte {
  filter:
    drop-shadow( 4px 0 0 var(--aura)) drop-shadow(-4px 0 0 var(--aura))
    drop-shadow(0  4px 0 var(--aura)) drop-shadow(0 -4px 0 var(--aura));
}
```

4px é exatamente 1 pixel de arte na escala 4x, então a aura cai na grade. Cor:
`cores.destaque` normalmente, `cores.acao` quando há item selecionado.

Adicione a `tokens.ts` o que faltar (espessura da aura, altura da linha de
nome). **Nenhum literal novo em componente.**

`image-rendering: pixelated` também precisa entrar na regra `img` global —
sem ele toda a pixel art borra, porque o canvas é escalado por fator
fracionário.

### 7. Animação: trocar o `jogo-bob` por quadros

O `jogo-bob` atual balança o sprite inteiro com rotação. É literalmente "papel
arrastando" e deve sair.

- **idle**: toda figura em cena (Ana e NPCs) anima uma tira de 2 quadros,
  ~900ms, via `background-position` + `steps(2)`. Ver bíblia §6.3.
- **andando**: Ana troca para a tira de 4 quadros, ~140ms, enquanto se move.
- **dessincronize** os NPCs com `animation-delay` diferente por NPC, senão
  parecem uma engrenagem.
- as tiras podem não existir ainda: caia no PNG parado quando faltar, sem
  quebrar.
- respeite `prefers-reduced-motion` em tudo.

Leia a bíblia §6.1: a janela de 600–1200ms do spec **não** se aplica a taxa de
quadro de sprite. Isso é emenda registrada, não descuido.

## Critérios de aceite

- [ ] `npm run typecheck` e `npm test` passam
- [ ] nenhum `<button>` de hotspot com `minWidth` de texto sobrou em `Cena.tsx`
- [ ] teste novo falha se um hotspot perder `arte`
- [ ] teste novo falha se dois hotspots da mesma cena se sobrepuserem
- [ ] `image-rendering: pixelated` aplicado à arte do jogo
- [ ] aura responde a hover **e** a foco de teclado
- [ ] linha de nome existe uma vez, no rodapé, a 22px
- [ ] `jogo-bob` removido; idle por tira de quadros no lugar

## Não faça

- não mexa em `scripts/**` (é de outra frente)
- não mude texto de diálogo, narração ou roteiro: conteúdo narrativo está
  fechado
- não remova o botão "Voltar ao mapa" nem seu comportamento de `disabled` com
  motivo — é decisão de spec e está comentada no código
- não baixe fonte abaixo de 22px em lugar nenhum
