# Bíblia de arte — apresentacao_jogo

## Emenda de figurantes — revisão de 5 de outubro de 2026

Os postos de notebook usam `figurante_digitando` e `notebook_obliquo`.
A cabeça reutiliza `_cabeca`, com a franja baixa do elenco e pescoço curto:
o perfil desenhado à parte alongava as feições e destoava dos demais.
A tela mantém área visível; reduzi-la à aresta fazia o notebook parecer
uma haste. O teclado precisa ficar atrás dos dedos. A camada
`bracos_digitando` repete as mesmas coordenadas do corpo para
resolver essa oclusão; acrescentar mãos em outra posição criava membros
desligados. Conferir cada quadro ampliado, além da cena com elenco.

Figurantes sentados usam anatomia própria em `figurante_sentado`: quadril
sobre almofada, coxas horizontais, canelas abaixo do joelho e pés no piso.
Não recortar a metade superior de um sprite em pé para sugerir esta pose.
O café possui leitura e celular no sofá, e serviço de café no balcão;
a festa troca essas atividades por conversa com copos. Produção acrescenta
inspeção de amostra, e apresentação acrescenta credenciamento com prancheta.

Cada quadro de atividade vem da regeneração do cenário completo. Alterar
uma pose muda sua oclusão e pode revelar parede ou móvel: copiar somente
pixels diferentes sobre o quadro anterior deixava buracos e membros soltos.
Gestos têm ciclo de três segundos ou mais, com atrasos distintos. Conferir
corpo, objeto e apoio juntos, com elenco e HUD, além de medir o chão.

## Emenda de refinamento — 5 de outubro de 2026

A revisão de acabamento unifica cada posto com seu móvel original. O primeiro
quadro dos recortes ambientais é o cenário intacto; poses alternativas do café
regeneram o fundo completo para não deixar remendos atrás do braço. O colega da
outra área ocupa a borda traseira do bench, e a pasta de Ana é parte do sprite.
Os robôs compartilham o passo e o período da esteira (304 px, oito segundos).
Falas e pensamentos usam faixas laterais na produção e na apresentação para
preservar as telas; sem retrato adicional nessas duas faixas. Na reflexão,
os controles inferiores substituem temporariamente o inventário. A evolução
aguarda o clique e revela imediatamente o figurino com movimento reduzido.

`scripts/pixelart/refinamentos.py` compõe detalhes ambientais sobre os cenários
e gera recortes animados completos. O arquivo `public/assets/ambientes/manifest.json`
é a fonte única das posições: `VidaDoCenario` o consome diretamente. Ao animar
um posto, alterar somente os pixels da mão preserva a planta à frente dele.
Novas regiões precisam aparecer na folha `contato-ambientes.png` e na inspeção
do navegador, onde existe o HUD e o elenco real.

O mapa passa a ser um campus em miniatura. Os marcos arquitetônicos têm sua
folha `contato-mapa.png`; a protagonista usa meia escala somente nesta tela,
pois representa um peão sobre uma maquete. Caminhos derivam dos centros dos
destinos da interface; não duplicá-los no PNG. Na cena, permanece a escala 4x.

A evolução usa pose de punhos erguidos, insígnia geométrica e variações de Ana
por nível (mangas, relógio, lapela e pin), preservando rosto e roupa ciano.
Os braços industriais têm quatro posições com base fixa; taxa deste ciclo é
ambiental, independente da caminhada. Movimento reduzido conserva o primeiro
quadro legível. Cartões de capítulo usam a próxima cena sob véu escuro.

## Emenda de identidade — outubro de 2026

A especificação «A Jornada do Estágio» substitui a reserva do roxo para o
clímax: Ana mantém roupa ciano em todas as poses, Rafael usa azul, Cláudia
vermelho, Tiago roxo, Bianca verde e Marcos âmbar. Silhuetas, peles e acessórios
existentes são preservados. Figurantes usam neutros com contorno de menor
contraste. A versão futura continua distinta pela pose, em vez de trocar a
identidade da roupa. A Jornada autoriza fonte de terminal na navegação, títulos
e barra; diálogos e descrições mantêm fonte proporcional. O piso segue 22 px.
Bordas secundárias de navegação e selos usam o token de 2 px solicitado;
contorno de interação, divisórias e caixa de diálogo conservam traços grossos.
Os selos da barra usam linhas largas de 32 px como exceção de lista; a
descrição aberta usa toda a zona e oferece um alvo amplo para fechar.

Leitura obrigatória antes de tocar em arte ou em interação de cena. Não
improvise estilo: está tudo aqui, inclusive os erros já cometidos e por que
falharam. Se uma decisão sua contraria este documento, o documento ganha — ou
você o altera e anota o motivo.

---

## 1. A referência: o que estamos copiando

Três jogos foram dados como referência. Cada um entra por um motivo diferente,
e misturar os três sem critério é o jeito mais rápido de fazer papa visual.

**Indiana Jones and the Fate of Atlantis** (SCUMM, 320x200) — é a referência de
**composição e riqueza**. O que se copia: cena montada em três planos com
profundidade real, superfície texturizada por dither em vez de cor plana, e
oposição quente/frio carregando a imagem (pedra cor de areia contra mar azul,
folhagem verde contra sombra fria). Personagem ocupa ~22% da altura da tela e o
cenário é o protagonista visual.

**Sepulchre / adventure moderno de baixa resolução** — é a referência de
**leitura e contraste**. O que se copia: contorno escuro grosso em tudo, paleta
curta e dessaturada com dois ou três acentos saturados, e o plano de fundo
escuro o suficiente para que o personagem nunca se perca nele. Personagem em
~30% da altura. É a referência mais próxima da nossa restrição de vídeo
comprimido.

**O terceiro, vetorial noir** — NÃO é referência de técnica (é vetor, não pixel
art). Entra por uma coisa só: **luz quente pontual num campo frio**. As janelas
âmbar nos telhados escuros são o único calor da imagem e é isso que dá drama.
Nossa cena de escritório deve usar o mesmo truque: monitor, luminária e janela
ao poente como ilhas quentes num ambiente frio.

**O que NÃO copiar de nenhum deles:** fonte pixelada para texto de UI. O spec
fixa 22px como piso absoluto de texto e fonte de sistema; a nostalgia de fonte
bitmap custa legibilidade em vídeo comprimido e a apresentação não pode pagar.
Pixel art é a arte; a UI de texto continua limpa.

---

## 2. Regras duras

### 2.1 Escala: 4 pixels reais por pixel de arte, em tudo

```
cena   1920x1080 / 4 = 480x270   (resolução de ponto-e-clique clássico)
Ana    84 px de arte             -> 336 px na tela -> 31% da altura
item   24x24 px de arte          -> 96x96 na tela
```

Uma escala só, para tudo. Escalas diferentes na mesma tela fazem cenário e
personagem parecerem dois jogos colados — é o erro mais visível e menos
perdoável de pixel art montada por várias mãos.

Histórico: a primeira Ana foi feita em 6x e ocupava 47% da altura da cena.
Parecia boneco colado em maquete. 4x põe ela em 31%, que é a proporção das
referências, e ainda dá ao cenário 480x270 de área útil em vez de 320x180.

### 2.2 `image-rendering: pixelated` é obrigatório

O canvas inteiro é escalado por CSS com fator fracionário
(`min(vw/1920, vh/1080)`). Sem `image-rendering: pixelated`, o navegador
interpola e a arte vira borrão. Com ele, o navegador usa vizinho mais próximo
e a grade sobrevive.

Caveat honesto: em fator fracionário alguns pixels saem 1 real px mais largos
que outros. É inevitável com canvas fixo de 1920x1080 e é aceitável — o que
não é aceitável é o borrão.

### 2.3 Contorno é gerado, nunca desenhado

`contornar()` faz dilatação 4-vizinhos. Contorno à mão fica com furo, e furo de
contorno é o defeito que mais entrega arte amadora.

Cor única para todo contorno do jogo: `K`. Contorno de cor variável é o que faz
sprites de autores diferentes não pertencerem à mesma cena.

### 2.4 O vão de 1px é a ferramenta mais importante que você tem

Deixe **1 pixel transparente** onde dois volumes se encostam. A dilatação
transforma esse vão em linha interna escura, e é isso que separa braço de
torso, perna de perna, dedo de mão.

**Esta é a regra que já foi quebrada e custou caro.** Na primeira Ana
encolhida, o vão foi removido de propósito para sugerir "braços colados ao
corpo". O resultado: do ombro ao quadril virou um bloco só e o feedback do dono
do projeto foi literal — *"é quase como se ela não tivesse braços"*.

A lição: **postura fechada NUNCA se expressa removendo o vão.** Braço colado se
expressa mantendo o vão de 1px e aproximando o braço 1 ou 2 px do tronco. O
vão é anatomia, não enfeite.

### 2.5 Sombrear é andar UMA casa na rampa

`paleta.py` organiza as cores em rampas (`RAMPAS`) e oferece `mais_escuro()` /
`mais_claro()`. Sombra é um passo; luz é um passo. Salto de dois valores vira
mancha, não volume.

### 2.6 Luz vem de cima-à-esquerda. Sempre.

Aresta superior e esquerda de qualquer volume no tom claro, inferior e direita
no escuro. Uma cena com direções de luz misturadas lê como colagem.

### 2.7 Nada de gradiente suave

O spec proíbe e a razão é técnica: compressão de vídeo transforma gradiente
suave em faixa visível. Use `degrade_v()` (bandas com junta ditherizada) ou
`dither()`. Dither é a resposta de pixel art para transição, e é mais bonita
que gradiente nesta escala.

---

## 3. Paleta: a proporção importa mais que as cores

`scripts/pixelart/paleta.py` tem as cores. O que ela não pode impor é a
dosagem, e dosagem é o que separa "vivo" de "circo".

**Numa cena típica:**

| Proporção | Família | Papel |
|---|---|---|
| ~70% | neutros `12345678` + azuis `abcde` | parede, piso, divisória, móvel de escritório. A cama fria. |
| ~20% | madeira `mnopqr` | mesa, prateleira, piso de madeira, caixa. A massa quente. |
| ~10% | luz `uvwxyz`, verde `fghij`, vermelho `CDEFG`, tela `HIJLM` | acentos. Somados, não cada um. |

Frio domina a ÁREA, quente domina a ATENÇÃO. Invertendo, a cena perde o lugar
— e o lugar é um escritório Ericsson, não uma loja de doces.

**Roxo `VWXY` é reservado** à tela de revelação e ao estado `ana-futura`. Fora
disso não se usa: é o acento que marca o clímax e gastá-lo antes mata o efeito.

**Três fontes obrigatórias de vida em toda cena de escritório:**

1. **Uma planta.** Verde é a coisa mais barata que existe para tirar
   escritório de morgue. Nenhuma cena sem pelo menos uma.
2. **Uma tela ligada.** Ciano `HIJLM` num monitor, e o reflexo ciano no que
   estiver na frente dele. É a assinatura visual de escritório de tecnologia.
3. **Uma fonte de luz quente.** Luminária, janela ao poente, ou vão de porta
   iluminado. E a **poça de luz no chão** correspondente — luz sem consequência
   no piso lê como adesivo.

**Um acento vermelho por cena**, não mais: caneca, capa de livro, extintor,
estofado de cadeira. É o ponto onde o olho descansa.

---

## 4. Composição de cenário

Grade `480x270`. Piso encontra o personagem em `CHAO_DA_CENA = 232`.

### 4.1 Três planos, sempre

```
y   0.. 60   FUNDO     parede alta, janela, teto, luminária pendente
y  60..170   MEIO      onde a ação acontece: mesas, NPCs, telas, portas
y 170..232   CHÃO      piso, poças de luz, sombras de contato, tapete
y 232..270   FRENTE    borda de mesa, planta, cadeira cortada pela moldura
```

O plano de FRENTE é o que mais falta em cena amadora e o que mais dá
profundidade: um objeto grande, escuro e **cortado pela borda inferior** da
imagem. Fate of Atlantis usa pedra em primeiro plano em quase todo quadro.

### 4.2 Regra de valor por plano

Fundo mais escuro e dessaturado, meio médio, frente mais escura de novo. O
personagem tem de cair sempre numa faixa de valor DIFERENTE do que está atrás
dele — se o valor empatar, a silhueta desaparece, e silhueta perdida em vídeo
comprimido é cena ilegível.

### 4.3 Cena é MONTADA, não desenhada

480x270 são 129.600 pixels. Ninguém escreve isso à mão. Use `props.py`:
construa o prop uma vez e cole com `colar()` / `colar_base()`, espelhando,
variando o tom, repetindo em profundidade. Uma cena com 8 props colados 30
vezes fica pronta; com 30 props escritos à mão, não fica.

`colar_base(x_centro, y_base, prop)` ancora pelo centro-base. Use sempre isso
para prop de chão. Posicionar prop de chão pelo canto superior é a causa da
metade dos objetos flutuando.

### 4.4 Sombra de contato é obrigatória

Todo objeto que toca o chão precisa de uma elipse escura achatada logo abaixo,
1 ou 2 px de altura, 1 a 2 casas mais escura que o piso. É o que assenta o
objeto. Sem isso tudo parece adesivo colado — inclusive o personagem.

### 4.5 Checklist antes de declarar um cenário pronto

- [ ] Três planos distintos em valor, e um objeto de primeiro plano cortado
      pela borda inferior
- [ ] Uma planta, uma tela ligada, uma fonte de luz quente com poça no chão
- [ ] Um acento vermelho, e só um
- [ ] Sombra de contato em tudo que toca o piso
- [ ] Nenhuma área maior que ~40x40 px com cor totalmente plana (texturize com
      dither esparso)
- [ ] O personagem cabe nos pontos de parada dos hotspots sem cobrir nada
      importante e sem empatar de valor com o fundo
- [ ] Nenhum hotspot da cena cai sobre outro (ver §6.4)

---

## 5. Anatomia de personagem

Grade `50x84`. Eixo em **x=25**. Base (chão) em **y=81**.

A base é fixa nos quatro estados da Ana e nos cinco NPCs. O `Protagonista`
ancora pelo rodapé; altura variável por pose faria o elenco flutuar ou afundar
ao trocar de cena.

### 5.1 Layout vertical de referência (Ana neutra)

```
y  2..21   cabeça + cabelo (20 linhas)
y 22..25   ombros
y 26..33   peito
y 34..36   cintura
y 37..39   mãos, na altura do quadril
y 40..40   tronco
y 41..41   barra do blazer — linha de 1px em K
y 42..47   quadril
y 48..77   pernas
y 78..78   tornozelo
y 79..81   sapatos
```

A **linha de barra do blazer em `K`** não é decoração: sem ela, blazer e calça
compartilham a família de tom e do ombro ao sapato lê como uma coluna só. Foi
preciso adicioná-la depois de três tentativas.

### 5.2 O rosto é dado canônico

Rosto em `x20..30` (11 px, centro exato em 25). Estas são as linhas do rosto da
Ana e **não devem ser redesenhadas** — a mesma função de cabeça serve os quatro
estados, e é isso que a mantém reconhecível. Manter rosto consistente entre
frames é onde arte gerada falha mais visivelmente; aqui a consistência é
estrutural, não cuidado manual.

```
testa      "sssssssssss"
testa      "SsssssssssS"
sobrancelha "SshhssshhsS"   <- usar o char de cabelo da paleta nova
olhos      "SsKKsssKKsS"    <- 2px por olho
sob-olho   "SsSssssSssS"
nariz      "SssssSssssS"    <- em x25
(neutro)   "SsssssssssS"
boca       "SssstttsssS"    <- em x24..26
(neutro)   "SsssssssssS"
```

Olhar para baixo (estado encolhida) NÃO se faz redesenhando o rosto: desce a
franja 1px, o que empurra todas as feições com ela, e remove a linha do pescoço
— queixo enfiado no peito.

### 5.3 Braços: a estrutura que já falhou

```
x16..18  braço     |  x19 VÃO  |  x20..30 torso  |  x31 VÃO  |  x32..34 braço
```

O vão é obrigatório. Ele varia conforme a postura e é o que comunica a postura:

| Estado | Vão | Ombros | Base |
|---|---|---|---|
| encolhida | **1px** (nunca zero) | estreitos, ~13px | pés juntos |
| neutra | 1px | ~19px | normal |
| confiante | 2px | ~21px | aberta |
| futura | mão na cintura: cotovelo abre vazio triangular | ~21px | aberta |

Na `futura`, o vazio triangular entre braço e torso precisa de **3px ou mais**
de largura para o miolo sobrar transparente — a dilatação só alcança 1px de
cada lado. Com 2px o triângulo fecha em preto e a pose morre.

### 5.4 NPCs: cinco pessoas, não um boneco repintado

Rafael, Cláudia, Tiago, Bianca e Marcos. Cada um precisa ser reconhecível **por
silhueta**, antes da cor:

- **altura** varia em ±4px sobre a base de 84
- **tom de pele** varia de verdade: a paleta tem quatro famílias (`sS`, `tT`,
  `kl`, `NO`) e todas devem ser usadas. Elenco todo na mesma pele lê como o
  mesmo NPC repintado.
- **cabelo** varia em volume e comprimento, não só em cor
- **roupa** varia em silhueta: camisa social, camiseta, blazer, moletom,
  colete. Não basta trocar o tom do mesmo blazer.
- **postura** varia: ombro caído, braços cruzados, mão no bolso

Cláudia é líder e Tiago é infra: isso deve estar na roupa, não num rótulo.

---

## 6. Animação

O objetivo declarado pelo dono do projeto: *"que ao menos não pareça um pedaço
de papel se arrastando pelo cenário"*. O alvo não é animação complexa — é tirar
a sensação de decalque.

### 6.1 Emenda explícita ao spec de legibilidade

`docs/spec-apresentacao.md` e `tokens.ts` fixam toda animação na janela
600–1200ms. **Essa janela vale para transição e entrada de elemento** (opacidade,
deslocamento, revelação), onde movimento rápido é o que a compressão destrói.

**Ela NÃO vale para taxa de quadro de sprite.** Ciclo de caminhada a 600ms por
quadro não lê como caminhada, lê como defeito. Taxa de sprite fica em
**110–180ms por quadro**, e isso é uma exceção deliberada, registrada aqui, não
um descuido. Toda animação de sprite continua obrigada a respeitar
`prefers-reduced-motion`.

### 6.2 O que animar, em ordem de retorno sobre esforço

1. **Respiração parada (idle), 2 quadros, ~900ms.** Ombro e cabeça sobem 1px.
   É o item de maior retorno do documento: um sprite que respira deixa de ser
   adesivo. Todo personagem em cena precisa disso, Ana e NPCs.
2. **Caminhada, 4 quadros, ~140ms.** Contato, passagem, contato oposto,
   passagem. Substitui o `jogo-bob` atual, que é o sprite inteiro balançando e
   é justamente a "folha de papel arrastando".
3. **Ambiente de cena, 2–3 quadros, 400–900ms.** Cursor piscando na tela,
   vapor da caneca, luminária oscilando 1 tom, folha de planta mexendo. Três
   pontos de movimento por cena bastam para a cena parecer habitada.
4. **Piscar de olhos, 2 quadros, intervalo longo e irregular.** Barato e
   desproporcionalmente eficaz em rosto de 11px.
5. **Reação ao hotspot acionado.** Um quadro de "olhar para" antes do diálogo.

**Dessincronize.** NPCs respirando no mesmo compasso parecem uma engrenagem.
Use `animation-delay` diferente por NPC.

### 6.3 Como a animação é entregue

`escrever_tira()` gera os quadros lado a lado num PNG só. O CSS anda o
`background-position` com `steps(n)`:

```css
.jogo-sprite { background-repeat: no-repeat; image-rendering: pixelated; }
.jogo-tira-2 { animation: jogo-quadros 900ms steps(2) infinite; }
.jogo-tira-4 { animation: jogo-quadros 560ms steps(4) infinite; }

@keyframes jogo-quadros {
  from { background-position-x: 0; }
  to   { background-position-x: var(--tira-fim, 0); }
}
```

e o componente passa, inline, a largura de UM quadro multiplicada pelo número
de quadros, negativa:

```
background-size: (n * 100)% 100%
--tira-fim:      (-n * largura-do-quadro)px
```

Zero timer em JS, zero re-render de React por quadro. Todos os quadros da tira
têm de ter a mesma largura, senão o passo do `steps()` desalinha e a animação
treme — `escrever_tira()` levanta erro se não tiverem.

**O deslocamento é em PIXEL. Nunca em porcentagem.** Isto já custou um bug em
produção: uma versão anterior desta seção trazia
`to { background-position-x: -200%; }`, e os NPCs piscavam na tela — apareciam
e desapareciam. Dois motivos, e os dois valem saber:

*Sinal.* Em `background-position`, porcentagem resolve contra
(largura do elemento − largura da imagem). Com a tira sendo N vezes mais larga
que a caixa, essa diferença é NEGATIVA, então porcentagem negativa empurra a
imagem para a DIREITA, fora do elemento. Metade do ciclo o sprite não estava em
lugar nenhum.

*Escala.* Mesmo com o sinal certo, os quadros de uma tira de N caem em `0%`,
`100/(N−1)%`, … `100%`. Com N=2, `steps(2)` de 0% a 100% entrega 0% e 50% —
meio quadro. A conta só fecharia com `(N−1)` no denominador, o que é frágil.
Em pixel é direto: anda `N × largura`, e `steps(N)` para em
`0, −1W, −2W … −(N−1)W`.

O guard está em `src/ui/SpriteAnimado.test.ts`, que reprova qualquer
`background-position` com porcentagem negativa no CSS.

### 6.4 Ponto cego: a tira não existe em teste de render

`SpriteAnimado` sonda a tira com `Image()` antes de usá-la, porque
`background-image` apontando para 404 não cai em fallback — o elemento fica
vazio e o sprite DESAPARECE. Fora do navegador a sondagem devolve `false`,
então todo teste de render exercita o ramo SEM tira, e o estilo da tira nunca
entra no markup. Foi nesse ponto cego que o bug de porcentagem viveu.

Consequência prática: o que vale testar em animação de sprite é a **função
pura** que monta o estilo (`estiloDaTira`), não o componente renderizado.

### 6.5 Nomes de arquivo de animação

```
<id>.png             quadro único, parado
<id>-idle.png        tira de respiração (2 quadros)
<id>-andando.png     tira de caminhada (4 quadros)
```

O manifest continua apontando para `<id>.png`. As tiras são assets adicionais
que a UI escolhe por estado.

### 6.5 A tira é OPCIONAL, e a UI descobre sozinha

Registrado pela frente de interação, porque muda o que a frente de arte precisa
entregar e quando.

A UI **sonda** a existência da tira (`src/ui/SpriteAnimado.tsx`) antes de usá-la:
uma requisição por caminho, por sessão. Consequências práticas:

- **Você não avisa ninguém.** Basta o arquivo existir com o nome de §6.4 e a
  animação passa a rodar. Nenhuma linha de `src/` muda.
- **Tira ausente não quebra nada.** `background-image` apontando para 404 não
  cai em fallback: o elemento fica vazio e o sprite DESAPARECE da cena. É por
  isso que existe a sondagem, e é por isso que não se aponta CSS direto para uma
  tira que talvez não exista.
- **Sem tira, a figura ainda respira.** A UI aplica uma aproximação por CSS
  (`jogo-respira`): o sprite inteiro sobe 1 px de arte em dois passos duros. Não
  é o ombro subindo — só a tira dá isso — mas já tira a cara de adesivo. Quando
  a tira chega, a aproximação sai de cena automaticamente.
- **Os quadros têm de ter a mesma largura.** `escrever_tira()` já levanta erro
  se não tiverem; se tiverem, o passo do `steps()` desalinha e a animação treme.

E uma coisa que a UI **não** faz: sombra de contato. Nada em CSS assenta o
sprite no chão, porque somar uma sombra de CSS com a do PNG daria sombra dupla
quando a arte chegasse. A sombra de contato de §4.4 é responsabilidade da arte,
inclusive no sprite de objeto interativo.

---

## 7. Interação em cena: o que substitui o retângulo

### 7.1 O problema atual

`Cena.tsx` renderiza cada hotspot como um `<button className="jogo-botao">` com
`minWidth: 260` e o rótulo de texto dentro. Consequência: NPCs e itens **não
existem visualmente** — a cena é um cenário vazio com placas de texto por cima,
e não se sabe com quem se está falando até clicar.

### 7.2 O desenho correto

**O hotspot É a arte.** O botão fica transparente e envolve o sprite do NPC, do
item ou do objeto. Ancorado por `base` para coisa de chão, `centro` para coisa
de parede.

**Alvo de clique nunca menor que `alvo.minimo` (64px).** Item de 96px já passa;
objeto pequeno precisa de área invisível em volta. A apresentação é ao vivo e
sob pressão: alvo apertado é bug.

**Aura no hover e no foco.** Contorno pixel-perfeito seguindo o alpha do PNG,
via `drop-shadow` empilhado em quatro direções:

```css
.jogo-hotspot:hover .jogo-hotspot-arte,
.jogo-hotspot:focus-visible .jogo-hotspot-arte {
  filter:
    drop-shadow( 4px 0 0 #ffd43b) drop-shadow(-4px 0 0 #ffd43b)
    drop-shadow(0  4px 0 #ffd43b) drop-shadow(0 -4px 0 #ffd43b);
}
```

4px é exatamente 1 pixel de arte na escala 4x, então a aura cai na grade. Cor:
`cores.destaque` normalmente; `cores.acao` quando há item selecionado, porque aí
o gesto é "usar em" e não "interagir com".

**O nome aparece numa linha única, fixa.** Rodapé, centralizado, discreta,
aparece só com o ponteiro ou o foco sobre algo. É a linha de status do SCUMM e
é a solução que as referências já validaram. Nunca um retângulo por hotspot.

Texto no piso de 22px do spec — discreto é posição e peso, não tamanho de
fonte. Fonte menor que 22px é proibida mesmo aqui.

### 7.3 O contrato precisa de um campo novo

`Hotspot` em `types.ts` hoje tem `pos` e `rotulo`, e nada que diga qual arte
desenhar. Sem isso o hotspot não pode virar sprite. É necessário um campo
declarando a arte, e um teste de integridade que **falhe** quando um hotspot
não declara arte — hotspot invisível é a regressão exata que estamos
consertando, e ela tem de quebrar a build, não a apresentação.

### 7.4 Hotspots não podem se sobrepor

Hoje se sobrepõem, e com sprites isso fica pior que com retângulos. As posições
em `src/domain/content/bloco*.ts` precisam ser revisadas junto com o cenário:
cada hotspot com sua área, e o ponto de `parada` da Ana escolhido para que ela
não cubra o hotspot que acabou de acionar.

---

## 8. Pipeline

```
python scripts/gerar_arte.py          regera TUDO e escreve as folhas de contato
python scripts/exportar_chao.py       remapeia onde há piso em cada cena
python scripts/previa_de_cena.py      monta cenário + elenco nas coordenadas reais
```

Saídas:

```
public/assets/...                     o que a aplicação consome
docs/arte/contato-<frente>.png        folha de contato por frente de trabalho
docs/arte/previa-b<N>-<lugar>.png     a cena montada, como a plateia vê
docs/arte/chao.json                   onde há piso, consumido pelo teste de chão
```

### 8.1 Arte termina em OLHAR. Sem exceção.

Quem desenha por coordenada **não vê o que fez**. Rodar o gerador não é
terminar; terminar é abrir a folha de contato e olhar. Sprite que não foi visto
não está pronto.

A folha sai em fundo xadrez de propósito: erro de alpha é invisível em fundo
sólido, e alinhamento de base só se compara lado a lado.

### 8.2 `verificar_sprite()` pega o que o olho não pega

Eixo fora do centro por 1px e base fora da linha do chão são erros que deixam a
figura torta ou flutuando sem que se consiga apontar onde. Chame a verificação
em tudo e leia os avisos.

### 8.3 A junta entre arte e conteúdo é onde os bugs moram

O defeito mais caro do projeto até agora: 21 figuras humanas em pé SOBRE o
mobiliário, em 6 cenas. Nem a arte nem o conteúdo estavam errados. `cenarios.py`
desenhava uma mesa no meio da faixa de caminhada; `bloco*.ts` punha a `parada`
da Ana exatamente ali. O cenário nunca viu as coordenadas, e
`Cena.geometria.test.ts` — que valida hotspot contra hotspot — nunca viu o
cenário. Cada lado internamente coerente, o defeito na junta.

**Duas defesas, as duas necessárias:**

`scripts/exportar_chao.py` percorre a grade de cada cenário e escreve, por
coluna, a maior faixa contígua de piso. `src/ui/Cena.chao.test.ts` converte cada
coordenada de conteúdo para pixel de arte e reprova pé fora da faixa. Automático,
pegou as 21 figuras. **Rode o exportador depois de mexer em cenário**, senão o
teste valida contra um piso que não existe mais.

`scripts/previa_de_cena.py` monta cenário + hotspots + uma Ana em cada ponto de
parada, e escreve a imagem que a plateia vai ver. Humano. Pegou dois defeitos
que passavam em todos os testes: um monitor flutuando no meio da parede com o
suporte no ar, e a Ana cobrindo 143px dos 200 do Tiago — que é o defeito de "NPC
que não existe na tela", só deslocado.

Teste não substitui olhar, e olhar não substitui teste. O teste pega a classe de
erro que você sabe nomear; a prévia pega a que você não sabe.

### 8.4 Caminho de saída nunca se infere do caminho de entrada

`cenarios.py` derivava o caminho da folha de objetos de
`destino.parent.parent.parent`. Casava por acidente quando `destino` era
`public/assets/cenarios`, e quando a prévia passou uma pasta temporária a folha
foi escrita em `AppData\Local\docs\arte` — fora do repositório. Resolva a raiz a
partir de `__file__`, nunca do argumento.

---

## 9. Padrões aprendidos (atalhos que funcionam)

Anotados para não serem redescobertos. Use.

**Autore sprite em faixa de char, não em coordenada.** `g.segmento(20, 13,
"SsKKsssKKsS")` é LER o desenho enquanto escreve. Coordenada solta é escrever
às cegas.

**Não conte pontos de preenchimento.** Escreva só o trecho que importa e dê o
`x` inicial. Contar `.` à mão é a maior fonte de erro de alinhamento, e um
pixel deslocado quebra a simetria do rosto sem avisar.

**Ordem de colagem é z-order.** `colar()` desenha por cima. Torso primeiro,
braço depois, e o braço fica na frente. Não existe z-index aqui, existe ordem.

**Quadro de animação por `deslocar()`.** Respiração é o mesmo sprite 1px acima,
não um sprite novo. Redesenhar quadro de idle é desperdício e introduz
inconsistência.

**Assimetria de 1px mata a cara de manequim.** Cabelo caindo 1px mais de um
lado, ou acento fora do centro. Simetria perfeita lê como boneco de vitrine.

**Acento pequeno e fora do centro.** O crachá da Ana começou como fita no meio
do peito e lia como gravata amarela; virou pin de 2x3 na lapela e passou a ler
como crachá.

**Diferencie por vazio, não por cor.** As quatro poses da Ana se distinguem
pela largura do vão braço-torso (0, 1, 2, triângulo). Silhueta lê de longe em
vídeo comprimido; cor não.

**Textura antes de detalhe.** Uma parede ditherizada com dois tons parece mais
rica que a mesma parede plana com três objetos pendurados. Area grande e plana
é o que faz cena parecer vazia.

---

## 10. Erros já cometidos

Registrados porque custaram tempo e vão se repetir se não estiverem escritos.

**Escala de 6x.** Personagem em 47% da altura, cenário reduzido a 320x180.
Corrigido para 4x.

**Vão de braço removido para sugerir postura fechada.** A Ana encolhida ficou
sem braços. O vão de 1px é anatomia e nunca sai.

**Blazer e calça na mesma família de tom, sem linha de barra.** Do ombro ao
sapato lia como coluna única. Resolvido com 1px de `K` na barra.

**Fita de crachá no meio do peito.** Lia como gravata amarela. Virou pin na
lapela.

**Antebraço fechando em diagonal 1px por linha.** Gerou bolhas no contorno do
braço. Se o braço muda de posição, mude em degraus maiores ou mantenha reto.

**Paleta de 12 cores num hue só.** Impossível sombrear (dois valores por
família) e impossível não ficar monótono (sem oposição quente/frio). Resolvido
com rampas de 4–5 valores e famílias quentes.

**Sprite gerado e não olhado.** Três iterações da Ana saíram erradas e só
foram pegas ao renderizar e olhar. A folha de contato existe por isso.

**Deslocamento de tira em porcentagem.** Os NPCs piscavam na tela. A §6.3 desta
bíblia trazia o exemplo errado (`-200%`), e a implementação o seguiu
fielmente — documento errado propaga defeito mais rápido que código errado.
Corrigido para pixel, com guard em teste.

**Guard de CSS lido com `?raw` sob o vitest.** A primeira versão do teste de
regressão importava o CSS com `?raw` e recebia string VAZIA, então o guard
passava contra nada. Verde falso é pior que teste ausente: sempre afirme que a
entrada do teste não está vazia antes de afirmar sobre o conteúdo dela.

**Arquivo de arte apagado antes de commitar.** O módulo que gerava a Ana foi
removido junto com lixo temporário e não estava no git. Foi possível recuperar
decodificando os PNG (`scripts/_recuperar_ana.py`), mas o barato é commitar
antes de mexer.
