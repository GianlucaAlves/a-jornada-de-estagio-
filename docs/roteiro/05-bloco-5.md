# BLOCO 5 — A CHANCE APARECE

**Temas:** efetivação x experiência + carreira em construção contínua + as 3 perguntas
**Lugares:** Escritório → **Mapa**
**Sprite:** `ana-confiante` → `ana-futura`
**Cartão:** **2 anos depois — A chance aparece**
**Tempo alvo:** 13 min

> Objetivo do bloco é **reconhecimento, não surpresa**. A plateia pode já ter sacado — e se sacou, melhor. O alvo não é "não vi vindo", é *"claro, era isso o tempo todo"*.

---

# CENA A — ESCRITÓRIO

## Estado da cena

Mesma mesa do Bloco 1. Mesmo notebook. Mesmo enquadramento — **idêntico**, de propósito. A única coisa diferente na cena é a postura dela.

**Hotspot:** Notebook

## Abertura

> *Dois anos. O contrato fecha em três semanas. Ninguém falou nada sobre isso.*

> 💡 **Gancho de fala:** o apresentador deve apontar que é a mesma cena do começo. *"Mesma cadeira. Mesmo notebook. Mesma tela de login que ela não sabia abrir."*

---

## 1. Notebook — a mensagem

Ana senta. A tela abre **sem senha** — ela digita de cor, sem olhar. Detalhe de 2 segundos que diz dois anos.

Chega uma mensagem. **Cinco falas no total** — o e-mail cabe em duas linhas:

> **De: Cláudia Reis**
> **Assunto: Vaga — Engenharia de Plataforma**
>
> Abriu uma posição no time de Plataforma. É efetivação, não é estágio.
>
> Seu nome apareceu em três lugares diferentes na conversa de ontem. Você tem interesse?

Ana não responde — ela olha a tela.

> **Ana:** *(baixo)* Três lugares?

> ⚠️ A linha dos **três lugares** é o setup das três primeiras conexões da revelação. Ela não pode ser cortada nem parafraseada: a plateia precisa carregar o número "três" até o mapa.

> 💡 **Gancho de fala:** o e-mail não diz *por que* o nome dela apareceu. Ninguém no mundo real recebe essa explicação — **o mapa é que vai dar**. Deixar a pergunta dela no ar e clicar.

**→ Transição automática pro Mapa.** Única transição automática da apresentação inteira — a cena dissolve e o mapa entra.

---

# CENA B — O MAPA

O mapa que a plateia olhou por 50 minutos. Os 6 lugares, todos revelados, nenhum silhuetado. Fundo escuro.

No centro, onde não havia nada: **o convite**, um nó luminoso.

A barra de itens continua embaixo. O painel de skills continua na lateral. Nada foi escondido.

---

## 2. A REVELAÇÃO — especificação da animação

Cada conexão é disparada **por clique do apresentador**. Nunca por timer. Ele controla o ritmo e fala por cima de cada uma.

### Parâmetros contra a compressão do Teams

| Parâmetro | Valor |
|---|---|
| Espessura da linha | 6-8px |
| Duração do traçado | 800ms |
| Easing | `ease-out` |
| Pausa entre conexões | manual (clique) |
| Contraste | linha clara sobre fundo escuro, sem gradiente |
| Proibido | partículas, brilho difuso, linha fina, animação rápida |

### Conexão 1 — Cartão do Rafael

O ícone do cartão na barra **pulsa uma vez**. A linha sai dele, sobe até o Escritório, e do Escritório até o convite.

Texto, uma linha, fonte grande:

> **Perguntaram ao Rafael se ele conhecia alguém. Ele disse seu nome.**

O cartão **se apaga na barra**.

> 💡 **Gancho de fala:** *"Ela ganhou esse cartão no primeiro dia, num corredor, de um cara que ela nunca ligou. Ele ficou dois anos no inventário sem servir pra nada."*

---

### Conexão 2 — Certificado do Degree

Linha do certificado → Sala de Treinamento → convite.

> **A vaga pede Arquitetura de Sistemas. Ela concluiu há um ano e sete meses.**

O certificado se apaga.

> 💡 **Gancho de fala:** retomar textualmente a fala da Bianca. *"'Eu nem sei se vou usar isso.' 'Provavelmente não vai. Não agora.'"* — e deixar a frase respirar.

---

### Conexão 3 — Crachá do Innovation

Linha do crachá → Innovation → convite.

> **Na conversa de ontem, duas pessoas do Innovation lembravam dela.**

O crachá se apaga.

> 💡 **Gancho de fala:** ela foi no evento por curiosidade. Não foi estratégia. **Não precisa ser estratégia** — precisa acontecer.

---

### Conexão 4 — A proatividade

Diferente das três. Não sai da barra de itens: sai do **painel de skills**, na lateral. Linha mais grossa (10px), traçado mais lento (1200ms), partindo de *Proatividade / Protagonismo* → Laboratório → Escritório → convite.

> **Três pessoas tinham o perfil. Uma tinha entregue algo que ninguém pediu.**
>
> **"Guardei seu nome."**

A skill **não se apaga**. Ela fica acesa.

> 💡 **Gancho de fala:** as três primeiras conexões foram **portas**. Essa é o **motivo**. As portas abriram pra muita gente; ela foi escolhida por causa do domingo à noite em que escreveu cinco páginas que ninguém pediu.

---

## 3. A imagem da tese

Depois da quarta conexão, o apresentador clica uma vez mais.

A **barra de itens se esvazia** — os três tardios se apagaram nas conexões, e os imediatos que sobraram se gastam aqui. Ela se recolhe e sai da tela.

> ℹ️ Só dois imediatos são consumidos durante a jornada: as **anotações** no monitor do Laboratório e o **relatório** na Cláudia. Senha, indicação de trilha e projeto entregue chegam inteiros até aqui — e é neste momento que se gastam. Nada sobra na barra.

O **painel de skills permanece**. As 9 skills, todas acesas, na lateral. Sozinhas na tela com o mapa.

Texto, centralizado, grande:

> **Tudo o que ela carregou, ela usou.**
> **Tudo o que ela aprendeu, ela é.**

> ⚠️ Esta é a tese em imagem, e é por isso que os dois sistemas foram desenhados separados desde o começo. Se itens e skills parecessem a mesma coisa, esse momento não existiria. Nenhuma fala precisa explicar — a tela explica.

> 💡 **Gancho de fala:** *"O conhecimento fica. As chances aparecem."*

---

# CENA C — O FECHO

## 4. A versão futura

O mapa escurece devagar, mas **não apaga** — fica aceso ao fundo.

`ana-futura` entra em cena. Mesma pessoa, dez anos depois. Ao lado dela, `ana-confiante` — as duas na mesma tela.

> **Ana:** Eu fui efetivada?

A versão futura não responde.

Ela **aponta pro mapa**.

Sustentar por 5 segundos. Sem texto. Sem movimento.

> 💡 **Gancho de fala:** a pergunta estava errada. *"Efetivação é um evento, e ela ia perguntar sobre um evento. A resposta é um mapa inteiro — dois anos de conversas, trilhas, um erro de madrugada, um crachá de cordão torto."* Se ela tivesse sido efetivada e não tivesse construído nada daquilo, não teria nada pra apontar.

---

## 5. As três perguntas

O mapa e os personagens desaparecem. Fundo escuro. Uma pergunta por vez, disparada por clique do apresentador. Fonte grande, centralizada.

> **O que fizemos para estar aqui?**

*(clique)*

> **O que gostaríamos de ouvir?**

*(clique)*

> **O que podemos levar de transformação?**

*(clique)*

As três juntas na tela. E ficam.

---

## 6. Silêncio

Nada muda. Nenhum botão, nenhum "fim", nenhum logo.

O apresentador não fala. A tela fica assim até alguém encerrar a chamada.

> ⚠️ Não implementar tela de créditos, botão de reiniciar visível, nem animação final. A última coisa que a plateia vê são as três perguntas dela mesma. Qualquer elemento de UI aqui quebra o fecho.
>
> *(Reiniciar para o próximo ensaio: recarregar a página.)*

---

## Checklist do bloco

| Elemento | Status |
|---|---|
| Itens consumidos | Cartão, Certificado, Crachá *(os 3 tardios)* |
| Skills | Nenhuma nova — **as 9 permanecem** |
| Conexões | 4 *(3 itens + 1 skill)*, cada uma por clique |
| Transição automática | 1 apenas *(Escritório → Mapa)* |
| Sprites | `ana-confiante` + `ana-futura` juntos |
| Requisito especial | barra de itens esvazia; painel de skills permanece |
| Callbacks | mesma cena do B1 · "não agora" (B2) · "guardei seu nome" (B3) |
| Fim | 3 perguntas, silêncio, nenhuma UI |
