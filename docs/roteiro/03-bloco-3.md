# BLOCO 3 — PROATIVIDADE E OS PROJETOS INTERNOS

**Temas:** proatividade / protagonismo + projetos internos i9 / Innovation
**Lugares:** Laboratório → Escritório *(entrega)* → Innovation
**Sprite:** `ana-neutra`
**Cartão:** **6 meses depois — Proatividade**
**Tempo alvo:** 11 min *(o bloco mais pesado — 3 cenas, 2 puzzles)*

---

# CENA A — LABORATÓRIO

## Estado da cena

Sala técnica. Racks, dois monitores grandes com log rolando, cadeira ruim. Luz fria e azulada — contraste com o Cafezinho. Tiago está lá.

**Hotspots:** Monitor do log · Tiago · Quadro branco

---

## Abertura

> *Seis meses. Ela tem tarefas de verdade agora. Nenhuma delas é essa.*

---

## 1. Monitor do log — porta trancada

Primeiro clique, **sem as anotações selecionadas**:

> *Linhas e linhas de texto. Ana reconhece umas palavras. Não reconhece o que elas querem dizer juntas.*
>
> **Ana:** Isso aqui não faz sentido nenhum.

Nada acontece. É a porta do leva-e-traz.

> 💡 **Gancho de fala:** *"Seis meses atrás ela olharia isso e fecharia a aba. Ela quase fecha."*

---

## 2. Tiago — o acesso

> **Tiago:** Esse erro aí? Deixa. Ele aparece toda madrugada há uns oito meses.
>
> **Ana:** E ninguém olha?
>
> **Tiago:** A gente reprocessa na mão de manhã e segue o jogo. *(dá de ombros)* Entrou no orçamento da rotina.

Ana pede acesso ao histórico completo.

> **Tiago:** Pra quê? Ninguém pediu isso pra você.
>
> **Ana:** Ninguém pediu pra eu não olhar também.
>
> **Tiago:** *(pausa, depois ri)* Tá liberado.

> 💡 **Gancho de fala:** *"'Entrou no orçamento da rotina'. Toda empresa tem uns cinco desses. Todo mundo sabe, ninguém olha, porque olhar não é tarefa de ninguém."* — **esse é o bloco inteiro em uma frase.**

---

## 3. Usar as **Anotações do treinamento** no monitor

**O elo.** O que ela estudou no Bloco 2 é literalmente o que abre a porta aqui.

> *Ana abre o caderno na página de fluxo entre serviços. Olha o log. Olha o caderno. Olha o log de novo.*
>
> **Ana:** Espera. Esses dois sistemas não deveriam estar conversando nessa ordem.

**→ Libera o puzzle**

> ⚠️ **Não comente o elo agora.** Se o apresentador disser "viu, o estudo dela serviu!", ele gasta aqui o efeito que o Bloco 5 precisa. Deixe a plateia sentir sozinha. No máximo: uma pausa.

---

## 4. PUZZLE — Sequenciar

**Mecânica:** 5 linhas de log embaralhadas. Arrastar pra ordem cronológica correta. Quando a ordem fecha, a causa fica óbvia sozinha — o puzzle não "revela" nada, a ordem revela.

**Linhas (embaralhadas na tela):**

- `03:14` — Fila reenvia o lote *(retry automático)*
- `03:12` — Serviço de Faturamento envia o lote
- `03:15` — Serviço de Cadastro processa o lote **duas vezes**
- `03:12` — Fila de integração aceita o lote
- `03:14` — Timeout na resposta do Serviço de Cadastro

**Ordem correta:**

```
03:12  Faturamento envia o lote
03:12  Fila aceita o lote
03:14  Timeout na resposta do Cadastro
03:14  Fila reenvia o lote (retry automático)
03:15  Cadastro processa o lote duas vezes
```

Ao fechar a sequência, as duas últimas linhas acendem juntas:

> *O Cadastro recebeu o lote. Demorou pra responder. A fila achou que tinha falhado e mandou de novo.*
>
> **Ana:** Não falhou nenhuma vez. Funcionou duas.

> 💡 **Gancho de fala:** ela não achou um bug difícil. Ela achou um bug que **ninguém tinha ordenado**. A informação estava ali há oito meses.

---

## 5. Quadro branco — montar o Relatório

> *Ana escreve cinco páginas num domingo à noite. Ninguém pediu. Ninguém vai cobrar. Ninguém sabe que ela está fazendo.*

**→ Ganha: Relatório**
**→ Ganha skill: Proatividade**

> **Ana:** *(pra si mesma)* E se ela achar que eu tô passando por cima de alguém?

Fica no ar sem resposta.

> 💡 **Gancho de fala:** o medo do Bloco 1 não desapareceu — ele mudou de assunto. Antes era medo de perguntar; agora é medo de se expor. Ele vai mudar de assunto de novo no Bloco 4.

---

# CENA B — ESCRITÓRIO *(volta)*

**Leva-e-traz de alcance curto.** O mapa não destrava nada novo: ela volta à própria mesa. Quem narra continua sendo o dono do Bloco 3.

## Usar o **Relatório** na Cláudia

Cláudia está na mesa dela. Diferente do Bloco 1: ela **para**.

> **Cláudia:** O que é isso?
>
> **Ana:** É o erro da madrugada. Aquele que a gente reprocessa na mão.
>
> **Cláudia:** *(folheando)* Quem te pediu isso?

Pausa longa. Deixa a plateia desconfortável.

> **Ana:** Ninguém.

Cláudia continua folheando. Chega na última página. Fecha.

> **Cláudia:** O retry não é idempotente. Oito meses. *(olha pra ela)* Ninguém tinha pedido isso.
>
> **Cláudia:** **Guardei seu nome.**

Ela volta pro monitor. A conversa acabou.

**→ Ganha skill: Protagonismo**
**→ Destrava no mapa: Innovation**

> 💡 **Gancho de fala:** *"Ela não foi promovida. Não ganhou bônus. Não teve aplauso. Ganhou quatro palavras de uma pessoa ocupada."* — e o apresentador deve deixar essas quatro palavras **no ar**, sem explicar. Elas voltam no Bloco 5.

---

# CENA C — INNOVATION

## Estado da cena

Espaço aberto, post-its na parede, mesas redondas, gente em pé. Energia oposta à do Laboratório. Marcos circulando. **Rafael está no fundo** — a plateia precisa vê-lo aqui.

**Hotspots:** Marcos · Mural de post-its · Rafael

---

## 1. Marcos

> **Marcos:** Você é a do relatório do retry!
>
> **Ana:** *(desconcertada)* Como você...
>
> **Marcos:** A Cláudia comentou numa reunião. *(sorri)* Olha, achar o problema é metade. Você quer que alguém conserte?
>
> **Ana:** Quero.
>
> **Marcos:** Então você não precisa de um relatório. Precisa de uma **proposta**. É diferente.

> 💡 **Gancho de fala:** ele não está corrigindo ela — está mostrando o canal. Iniciativa sem estrutura morre na gaveta. O i9 existe justamente pra isso: transformar "eu notei uma coisa" em algo que entra em roadmap.

---

## 2. PUZZLE — Estruturar

**Mecânica:** 5 fragmentos soltos, 3 campos. Dois fragmentos são **distratores** e não entram em lugar nenhum — o puzzle é sobre escolher, não sobre encaixar tudo.

**Campos:** `Problema` · `Solução` · `Impacto`

**Fragmentos:**

| Fragmento | Vai para |
|---|---|
| "O reenvio automático da fila não verifica se o lote já foi processado." | **Problema** |
| "Marcar cada lote com um identificador único e ignorar repetições." | **Solução** |
| "Lotes duplicados geram cobrança em dobro para o cliente final." | **Impacto** |
| "O sistema é antigo e precisava ser refeito." | ✗ distrator |
| "Ninguém tinha notado isso antes." | ✗ distrator |

Ao tentar colocar um distrator:

> **Marcos:** Isso é verdade. Mas ninguém consegue fazer nada com isso.

Ao completar:

> **Marcos:** Pronto. Agora é uma proposta. Antes era uma reclamação bem pesquisada.

**→ Ganha: Crachá do Innovation** *(item tardio nº 3)*

---

## 3. Rafael — reaparição 3

> **Rafael:** Não acredito que você tá aqui.
>
> **Ana:** Eu também não.
>
> **Rafael:** *(aponta o crachá dela)* Guarda esse. Eu tenho os meus três.

Terceira aparição dele. A plateia agora tem relação com o Rafael — é isso que faz a primeira conexão do Bloco 5 funcionar.

---

## Fecho do bloco

> *Ela entrou no Laboratório pra não olhar um erro.*
> *Saiu com um relatório, uma proposta registrada, e um crachá de cordão torto.*

> 💡 **Gancho de fecho:** *"Liderança sem cargo é isso. Ela não mandou em ninguém. Ela só assumiu uma coisa que não era dela."*

**→ Destrava no mapa: Sala de Reuniões**
**→ Passa o bastão.** Cartão **"1 ano depois — Mostrar o que fez"**.

---

## Checklist do bloco

| Elemento | Status |
|---|---|
| Itens ganhos | Relatório *(consumido)*, Crachá do Innovation |
| Item consumido | Anotações do treinamento *(no monitor)*, Relatório *(na Cláudia)* |
| Skills ganhas | Proatividade, Protagonismo |
| Lugares destravados | Innovation, Sala de Reuniões |
| NPCs | Tiago, Cláudia, Marcos (novo), Rafael |
| Puzzles | Sequenciar log (5 linhas) · Estruturar proposta (3 campos + 2 distratores) |
| Leva-e-traz | Anotações (B2→B3) · Relatório (Laboratório→Escritório) |
| Plantio | "Guardei seu nome" → Bloco 5 |
