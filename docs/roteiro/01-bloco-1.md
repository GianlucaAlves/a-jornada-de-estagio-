# BLOCO 1 — O PRIMEIRO DIA

**Tema:** timidez e insegurança
**Apresenta:** Pedro
**Lugar:** Escritório (único — a fase abre e fecha no mesmo lugar)
**Sprite:** `ana-encolhida`
**Cartão:** **Primeiro dia — O primeiro dia**
**Puzzle:** `senha`
**Tempo alvo:** 9 min

> Conteúdo tipado em `src/domain/content/bloco1.ts`. O que está aqui é o mesmo
> conteúdo em prosa, mais os ganchos — que **não** existem no produto (ADR-008):
> eles vivem aqui e no roteiro pessoal de quem apresenta.

---

## Estado da cena

Escritório aberto, meia-luz de manhã. A mesa da Ana em primeiro plano, notebook
fechado no meio do tampo. À esquerda, junto das caixas, o **Tiago**. No corredor,
a **Cláudia** atravessando com o notebook na mão. Do outro lado, na mesa dele, o
**Rafael**.

**Hotspots:** Notebook · Tiago · Cláudia · Rafael · Tela aberta

Ana entra encolhida, perto da porta. Ela só chega na mesa quando o apresentador
clicar em algo.

---

## Abertura (antes de qualquer clique)

> *Primeiro dia. Ninguém te olha, e mesmo assim você sente que todo mundo está
> olhando.*

**Diálogo não tem escolha.** Cada NPC diz de 4 a 6 falas curtas, avança com um
clique e acaba. Ele planta a pista e para; **quem desenvolve o tema é você**.

---

## 1. Notebook (primeiro clique esperado)

Tela de login: **três campos**, com rótulo visível em cada um.

```
[ prefixo ] - [ time ] - [ dia ]
```

Instrução na tela: *"Três campos, três pessoas. Cada uma sabe um pedaço; ninguém
sabe a senha inteira."* Errar avisa: *"A senha não abriu. Confira os três
campos."*

**O quebra-cabeça é social, não lógico** — é o ponto do bloco. E o puzzle pode ser
reaberto quantas vezes quiser: tem botão de sair, e sair reinicia.

> 💡 **Gancho de fala:** *"Todo primeiro dia tem essa tela. E a senha nunca está
> no e-mail — porque pra abrir o e-mail você precisa da senha."*

---

## 2. Tiago (apoio operacional) — o primeiro que ela tenta

Escolha óbvia, e ele resolve só um terço.

> **Tiago:** Ah, a nova! A senha do primeiro acesso tá no e-mail de boas-vindas.
>
> **Ana:** Eu não consigo abrir o e-mail sem a senha.
>
> **Tiago:** *(pausa)* É. Todo mundo cai nessa.
>
> **Tiago:** O começo é igual pra todo mundo: **NOVO**, em letra maiúscula. O do
> meio é o número do teu time, isso é com a Cláudia.
>
> **Tiago:** E o fim é o dia que você entrou. *(volta pro que estava fazendo)*
> Ninguém chega sabendo.

**→ Campo 1: `NOVO`**
**→ Ganha skill: Coragem de perguntar**

> 💡 **Gancho de fala:** ele jogou pra outra pessoa e voltou pro que estava
> fazendo em trinta segundos — e não foi grosseria, foi o ritmo normal de quem já
> está dentro. Ela entendeu metade e não pediu pra repetir. **Quantas vezes a
> gente faz isso?** Esse é o custo silencioso de não perguntar: você sai da
> conversa com um terço da informação e com a sensação de que o problema é você.

---

## 3. Cláudia (líder do time) — a que está com pressa

Ela para, mas por pouco tempo. Isso é de propósito: no Bloco 3 ela vai parar de
verdade, e a diferença tem que ser sentida.

> **Cláudia:** Você é a estagiária nova. Cláudia.
>
> **Ana:** Ana. Preciso do número do time, pra senha.
>
> **Cláudia:** **12**. *(para, volta meio metro)* O que te trouxe pra cá?
>
> **Ana:** Queria ver como é na prática. Na faculdade eu só vi isso no papel.
>
> **Cláudia:** Hm. *(anota mentalmente e sai)* Bom primeiro dia.

**→ Campo 2: `12`**
**→ Ganha skill: Autoconhecimento**

> 💡 **Gancho de fala:** ela não foi hostil, ela estava ocupada — e a gente
> confunde as duas coisas o tempo todo no começo. Note que ela **voltou meio
> metro pra perguntar**. Ouviu a resposta e não mostrou nada. Guarde essa cena:
> no Bloco 3 a mesma pessoa vai parar de verdade.

---

## 4. Rafael (projetos, outro time) — o que trata ela como pessoa

Único que puxa conversa sem ela pedir.

> **Rafael:** Você tá há quarenta minutos naquela tela, né? Relaxa, eu fiquei uma
> hora e vinte.
>
> **Ana:** *(constrangida)* Tanto assim?
>
> **Rafael:** Rafael, projetos, time do lado. O fim da senha é o dia que você
> entrou: hoje, dia **03**.
>
> **Rafael:** *(escreve o ramal atrás de um cartão)* Qualquer coisa que travar, me
> chama. Sério.
>
> **Rafael:** Primeiro dia é sobre conhecer gente. Produzir é de amanhã em diante.

**→ Campo 3: `03`**
**→ Ganha: Cartão do Rafael**

> ⚠️ **Não aponte o cartão.** Ele é o item tardio nº 1 e paga na fase 6. Qualquer
> ênfase aqui — na fala, no gesto ou no clique — entrega o clímax de graça.

> 💡 **Gancho de fala:** ele sabia há quarenta minutos e esperou ela travar —
> porque ele viveu isso ano passado. A coisa mais valiosa que ela levou do
> primeiro dia não foi a senha, foi ele. E ela não tinha como saber disso ainda.
>
> 💡 **Gancho extra (o que o Rafael não disse):** gente ocupada comprime
> informação; quem está chegando lê compressão como desinteresse. Quase ninguém
> está te tratando mal — a maioria está com a cabeça em outra coisa.

---

## 5. Tela aberta — o fecho

Com os três campos: **`NOVO-12-03`**. A tela clareia devagar.

> *A tela abre. É só uma área de trabalho vazia. E ainda assim é a coisa mais
> importante que aconteceu hoje.*

**→ Destrava no mapa: Cafezinho**

---

## Fecho do bloco

O sprite **não muda ainda** — a mudança de postura vem escondida atrás do cartão
de transição.

> *Ela precisou falar com três pessoas pra digitar oito caracteres.*
> *Nenhuma delas deu a resposta inteira.*

> 💡 **Gancho de fecho:** *"O medo atrapalhou? Atrapalhou — ela demorou quarenta
> minutos pra levantar da cadeira. Mas o que destravou não foi a senha. Foi ela
> ter levantado."*

**→ Passa o bastão.** Cartão **"1 mês depois — O que ninguém ensinou"**.

---

## Checklist do bloco

| Elemento | Status |
|---|---|
| Itens ganhos | Cartão do Rafael *(tardio, não sinalizar)* |
| Skills ganhas | Coragem de perguntar, Autoconhecimento *(nesta ordem)* |
| Lugar destravado | Cafezinho |
| NPCs apresentados | Tiago, Cláudia, Rafael |
| Puzzle | Senha em 3 campos (`NOVO-12-03`) |
| Interações mínimas | 5 cliques (notebook, 3 NPCs, tela) |

## Nota de encenação (por que as posições são essas)

O Escritório é apertado de um jeito que não se vê no código: a faixa do meio só
tem piso **abaixo** da barra de itens e o painel de skills come tudo depois de
x 73%. Sobram dois bolsões — a quina da mesa, à esquerda, e o corredor da
direita — e é por isso que o Tiago fica junto das caixas e a Cláudia e o Rafael
ficam do outro lado.

O mapa de piso **mente** sobre a faixa atrás da mesa (x 20..32): ele declara piso
onde há tampo. Uma figura ali passa nos testes e aparece de pé sobre o móvel na
prévia — foi o que aconteceu na primeira tentativa deste bloco. Depois de mexer
em coordenada, rode `scripts/previa_de_cena.py` e **olhe**.
