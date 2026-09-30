# BLOCO 2 — O QUE NINGUÉM ENSINOU

**Temas:** aprendizado contínuo + planejamento
**Apresenta:** Heloisa
**Laço:** Cafezinho → Escritório → Cafezinho *(ADR-032)*
**Sprite:** `ana-neutra`
**Cartão:** **1 mês depois — O que ninguém ensinou**
**Puzzles:** `associar` (café) e `sequenciar` (mesa)
**Tempo alvo:** 9 min

> Conteúdo tipado em `src/domain/content/bloco2.ts`.

---

# CENA A — CAFEZINHO

## Estado da cena

Copa. Máquina de café à esquerda, balcão longo no meio, luz mais quente que o
Escritório. A **Bianca** encostada no balcão, o notebook dela aberto ao lado. Mais
à direita, o **Rafael**.

**Hotspots:** Bianca · Notebook da Bianca · Máquina de café · Rafael

## Abertura

> *Um mês. Ela já sabe a senha de cor e já sabe que ninguém almoça antes de
> meio-dia e meia. Ainda não sabe o que está fazendo.*

---

## 1. Bianca (documentação de produto) — o coração do bloco

Seis falas. Ela **abre** os dois assuntos do bloco e não explica nenhum.

> **Bianca:** Você é do time da Cláudia, né? Ela falou que você pergunta muito.
> Era elogio.
>
> **Bianca:** Eu sou formada em **Letras**. Hoje eu trabalho com **tecnologia**.
>
> **Ana:** *(pausa)* Letras.
>
> **Bianca:** Transição aos vinte e oito, estudando **o que estava faltando**. Que
> é diferente de estudar o que tem na grade.
>
> **Bianca:** Tem as duas aqui dentro: **Degreed** é trilha, com começo e fim.
> **Percipio** é biblioteca, pra quando você já sabe o nome do problema.
>
> **Bianca:** Eu ainda estudo, Ana. Ninguém aqui parou.

**→ Ganha skill: Leitura do que o trabalho pede**
**→ Ganha skill: Aprendizado contínuo**

> ⚠️ **A Bianca é a única exceção ao expurgo de vocabulário** (ADR-027). "Formada
> em Letras, trabalha com tecnologia" é a frase mais anti-nicho que este projeto
> pode dizer, e ela depende do contraste entre as duas áreas. **Aqui ela só
> planta.** Ela volta na fase 5 para falar de pivotar — não antecipe nada disso,
> nem em fala nem em comentário.

> 💡 **Gancho 1 — o elogio:** o que o Bloco 1 plantou já rendeu, e ela não ficou
> sabendo na hora. Isso vai acontecer de novo.

> 💡 **Gancho 2 — a grade x a terça-feira** *(a Bianca só abriu a porta com
> "estudar o que faltou"; o resto é seu)*: pergunte à plateia quanto tempo o curso
> deles dedicou a conduzir uma reunião com gente mais experiente na sala. E a
> prova teórica? Bastante. **Nenhum dos dois é inútil — mas só um deles aparece na
> terça-feira.** O diploma não é desperdício, ele é **incompleto**: dá a base de
> raciocínio, não dá o vocabulário do dia a dia. Quem trata isso como traição da
> faculdade fica ressentido; quem trata como lacuna, estuda.

> 💡 **Gancho 3 — Degreed x Percipio** *(ela deu uma frase pra cada; **desenvolva
> agora**)*: trilha estruturada é pra quando **você não sabe o que não sabe**;
> biblioteca sob demanda é pra quando **você já sabe o nome do problema** e precisa
> resolver hoje. Errar a ferramenta é o que faz a pessoa desistir: ninguém aguenta
> uma trilha de 40h pra tirar uma dúvida de 20 minutos, e ninguém constrói base
> pulando de vídeo em vídeo.

> 💡 **Gancho 4 — "ninguém aqui parou":** ela é a prova viva de que a transição é
> possível e de que ela não termina.

---

## 2. Notebook da Bianca — PUZZLE `associar`

**Mecânica:** ligar cada lacuna à trilha que fecha ela. 4 pares. Par errado
recua e avisa: *"Essa trilha não fecha essa lacuna."*

**Esquerda — "apareceu na minha frente e eu não soube resolver":**

1. Organizar a semana quando tudo parece urgente
2. Falar numa reunião cheia de gente mais experiente
3. Escrever um e-mail que a pessoa responde
4. Montar uma planilha que outra pessoa entende

**Direita — trilhas:** Degreed · Prioridades e gestão do próprio tempo (8h) ·
Percipio · Falar em público e conduzir reunião · Percipio · Escrita profissional
no trabalho · Degreed · Planilhas: montar, revisar, apresentar

> ⚠️ **Plantio deliberado.** A lacuna da reunião é exatamente o que falta nela no
> **Bloco 4**, onde o tema é saber se vender. A plateia não precisa notar agora —
> precisa reconhecer depois. **Não comente durante o puzzle.**

---

## 3. Máquina de café

> *Ela aperta o botão errado e sai chá. Ela bebe o chá.*

Pequeno, bobo, e diz muito sobre onde ela está. Sem item, sem skill — só
personagem.

---

# CENA B — ESCRITÓRIO *(a ida)*

Mesmo cenário da fase 1. O lugar não mudou; ela mudou (ADR-022).

> *A mesa dela. A semana inteira em cima dela, e tudo parecendo urgente.*

**Hotspots:** Tela da Ana · Notebook da Ana · Certificado

## 1. Tela da Ana

> *Uma demanda nova caiu às cinco da tarde. A prova da faculdade é quinta. As duas
> coisas estão na mesma tela.*

Duas informações, zero comentário. É o setup do terceiro pilar.

## 2. Notebook da Ana — PUZZLE `sequenciar`

**Mecânica:** ordenar cinco linhas. Critério único, dito na instrução: **primeiro
o que destrava o trabalho do time.**

**Ordem correta:**

```
1  Corrigir a planilha de horas: três pessoas não conseguem lançar as delas
2  Avisar a liderança que a demanda nova cai no dia da prova da faculdade
3  Cobrar o status das duas frentes que a reunião de amanhã vai pedir
4  Enviar a ata da reunião de ontem para quem faltou
5  Organizar a pasta do projeto, que ninguém abre há um mês
```

> 💡 **Gancho do puzzle — o terceiro pilar da Heloisa, e é o material mais
> universal do projeto:** repare no que está em **segundo** lugar. Não é entregar a
> demanda nova; é **avisar**. Cair uma demanda de última hora no dia da prova é a
> coisa mais comum que existe, e há três saídas: aceitar e entregar mal, dizer um
> não seco, ou **avisar cedo, com transparência, e negociar o prazo**. Só uma
> delas mantém as duas coisas de pé. E repare no que ficou por último: a pasta que
> ninguém abre há um mês parecia trabalho, mas ninguém está esperando por ela.
> **Urgente e importante não são a mesma palavra.**

## 3. Certificado

> *Quarenta horas, todas fora do horário. Ela fecha o notebook e ainda não sabe
> onde isso serve.*

**→ Ganha: Certificado de conclusão** *(tardio, não sinalizar)*
**→ Ganha: Anotações do treinamento** *(usado na fase 3)*
**→ Ganha skill: Competência que ela foi buscar**

> 💡 **Gancho de fala:** essa é a fala mais honesta da apresentação. Ela **não**
> vai usar aquilo agora. A maior parte do que a gente estuda não tem aplicação
> imediata — e é exatamente por isso que a maior parte das pessoas para de
> estudar.

---

# CENA A' — CAFEZINHO *(o fecho)*

## 4. Rafael — só responde com o certificado na mão

Sem a trilha concluída: *"Ele está no meio de uma conversa. E a semana dela
continua inteira em cima da mesa."*

> **Rafael:** Sobreviveu ao primeiro mês. *(brinda com o copo)*
>
> **Ana:** Por pouco.
>
> **Rafael:** Eu vi que você usou meu ramal zero vezes.
>
> **Rafael:** Não deixa de chamar por achar que tá incomodando. Esse foi o meu
> erro.

**→ Cafezinho concluído. Fim do bloco.**

> 💡 **Gancho de fala:** a rede não serve de nada guardada. Ela tem o ramal desde
> o primeiro dia e nunca ligou. E note que **ele** chama isso de erro dele, não
> dela.

> ⚠️ Ele fala do **ramal**, nunca do cartão. Mencionar o objeto sinalizaria o item
> tardio.

---

## Fecho do bloco

> *Ela entrou no café sem saber o que estudar.*
> *Saiu com quatro trilhas, um certificado que não serve pra nada hoje, e um
> caderno.*

> 💡 **Gancho de fecho:** *"Um mês atrás ela não sabia nem o que perguntar. Agora
> ela sabe o nome do que ela não sabe. Isso é progresso, mesmo sem parecer."*

**→ Passa o bastão.** Cartão **"6 meses depois — Sem ninguém pedir"**.

---

## Checklist do bloco

| Elemento | Status |
|---|---|
| Itens ganhos | Certificado de conclusão *(tardio)*, Anotações do treinamento |
| Skills ganhas | Leitura do que o trabalho pede, Aprendizado contínuo, Competência que ela foi buscar *(nesta ordem)* |
| Lugar concluído | Cafezinho |
| NPCs | Bianca (nova), Rafael (reaparição) |
| Puzzles | `associar` no café · `sequenciar` na mesa |
| Laço | Cafezinho → Escritório → Cafezinho, fechado pelo certificado |

## Nota de encenação

O `associar` fica no **café**, não na mesa. A spec de conteúdo imaginava os dois
puzzles no Escritório; a suíte da store afirma que o hotspot que abre `associar` é
alcançável entrando no Cafezinho, e a leitura do café é melhor de qualquer forma:
a conversa vira lista ali, no notebook da Bianca, na frente dela. O que exige mesa
— ordenar a própria semana — é o que fica no Escritório.
