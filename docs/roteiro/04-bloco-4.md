# BLOCO 4 — MOSTRAR O QUE FEZ

**Temas:** visibilidade / saber se vender
**Apresenta:** Gianluca
**Lugar:** Sala de Reuniões — é onde a **Innovation Week** acontece (ADR-026)
**Sprite:** `ana-confiante`
**Cartão:** **1 ano depois — Mostrar o que fez**
**Tempo alvo:** 8 min

---

## Estado da cena

Sala de reuniões vestida de evento. Na parede, a tela grande. Na faixa das
cadeiras, de costas para quem assiste, a **plateia** sentada. À direita da
cabeceira, o **atril**. A Cláudia à esquerda, atrás da mesa. A Bianca na porta,
que fica aberta desde o primeiro quadro — ela não está na reunião.

**Cinco hotspots:** A plateia · Tela da sala *(abre o puzzle)* · Apresentar para
a sala · Cláudia · Bianca

---

## Ordem dos cliques — leia antes de subir no palco

A cadeia é presa por porta em quase tudo, **menos num ponto**, e esse ponto é
seu:

| # | Clique | Porta |
|---|---|---|
| 1 | **A plateia** | nenhuma — está aberto desde o começo |
| 2 | **Tela da sala** | nenhuma |
| 3 | **Apresentar para a sala** | exige o puzzle resolvido |
| 4 | **Cláudia** | exige o 3 feito |
| 5 | **Bianca** | exige a Cláudia feita |

> ⚠️ **"A plateia" não é obrigatório pelo sistema, e devia ser.** Clique nele
> **imediatamente antes** de "Apresentar para a sala": é a linha que diz que a
> sala está ouvindo, e é contra ela que o silêncio da PAUSA tem peso. O beat é
> **relível** de propósito — se você já clicou por curiosidade no começo da cena,
> clique de novo na hora certa. O motivo de não haver porta ali está registrado
> no cabeçalho de `src/domain/content/bloco4.ts`.

---

## Abertura

> *Um ano. Ela não é mais a estagiária nova; é só a estagiária. Innovation Week:
> as cadeiras viradas para a frente, a sala cheia, uma fila de estagiários
> mostrando o que fizeram. A próxima é ela.*

---

## 1. A plateia

Clique. Na tela: gente sentada, de costas, virada para a frente.

> *A sala está cheia e as cadeiras estão todas viradas para a frente. Ninguém no
> celular, ninguém digitando: estão ouvindo quem está na frente da sala. A
> próxima é ela.*

> ℹ️ **"Ninguém no celular" é setup, não enfeite.** No segundo beat da PAUSA um
> NPC pega o celular. A leitura que a fase quer é essa: **eles ouviram**, e mesmo
> assim não disseram nada. Sem esta linha antes, o celular da PAUSA lê como
> grosseria, e a fase deixa de ser sobre trabalho invisível para virar uma fase
> sobre gente ruim.

---

## 2. PUZZLE — Montar

**Rótulo na tela:** *Uma página para o gestor*
**Instrução:** *Quatro campos, quatro peças. Cada peça pertence a um campo.*

| Campo | Peça |
|---|---|
| Situação | A conferência dos lotes só era digitada no fim do turno. |
| O que eu fiz | Passei a conferência para a planilha compartilhada, na hora. |
| Resultado | O turno seguinte já começa sabendo o que ficou pendente. |
| Próximo passo | Vale testar o mesmo formato nas outras duas linhas. |

Deliberadamente o mais **satisfatório** dos cinco: peça na casa errada é
recusada com aviso, e encaixar as quatro fecha a página. A plateia tem de sentir
competência — **a PAUSA só funciona se resolver isto tiver sido gostoso.**

> 💡 **Gancho de fala:** é o mesmo caso da fase 3, contado para cima. Situação,
> o que eu fiz, resultado, próximo passo. Quatro linhas. É isso que falta na
> maior parte do trabalho bom que ninguém vê.

---

## 3. Apresentar para a sala

Clique no **atril**. A Ana caminha até ele e fica de pé ao lado. No quadro há, ao
mesmo tempo: a página no telão, o atril, a Ana de pé e a plateia sentada
olhando para a frente.

E o sistema **não devolve nada**. Ela recebe o crachá do evento em silêncio, sem
aviso, sem texto.

> ⚠️ Era aqui que estava o defeito da versão anterior: o botão de apresentar era
> o **crachá** — a recompensa fazendo papel do gesto —, flutuando sobre a mesa.
> Clicava-se num crachá no ar e vinha o silêncio, e ninguém entendia o que tinha
> acontecido. **Não troque a arte deste hotspot de volta.**

---

## 4. A PAUSA — especificação mecânica

**Isto não é uma sugestão de direção. É um requisito.**

| Tempo | O que acontece |
|---|---|
| 0s | Diagrama completo, aceso |
| +0,6s | Ana se vira pra mesa. Fica esperando. |
| +2,2s | Um NPC olha o celular. |
| +3,8s | A líder fecha o notebook. |
| +5,4s | As cadeiras esvaziam. |
| +7s | Sala vazia. Ana de pé, sozinha, diagrama aceso atrás dela. |

**Sem texto. Sem som. Sem item novo na tela. Sem skill. Sem celebração de
nenhum tipo.** Nada.

O avanço é **manual e indefinido**: nada acontece até você clicar. Se quiser
esticar em quinze segundos de silêncio, o sistema permite. O clique só é aceito
depois de a sequência inteira passar — clique nervoso no meio não mata o
momento.

> ⚠️ Esta é a única cena em que a **ausência** de feedback é a mensagem.
> Qualquer animação de "parabéns" aqui destrói o bloco.

---

## 5. O momento com a plateia

Única quebra de quarta parede aprovada da apresentação. Vire-se para a câmera:

> *"Quem já entregou alguma coisa boa e ninguém falou nada?"*

Retórica. ~15 segundos. Nada é esperado do sistema, ninguém precisa responder.

> 💡 **Gancho de fala:** ninguém foi malvado. Ninguém ignorou de propósito. Todos
> tinham a próxima reunião. **Isso é pior** — porque não tem vilão pra culpar,
> então também não tem nada pra consertar esperando.

---

## 6. Cláudia — a que não comentou

Ela é a única que ainda não saiu de quadro.

> ℹ️ **Regra de diálogo deste bloco (e de todos):** o NPC **planta**, o
> apresentador **desenvolve**. Nenhum diálogo passa de 6 falas, nenhuma fala
> passa de duas frases, e não há escolhas de fala. Todo conteúdo temático que não
> está na boca do NPC está num **Gancho de fala** — os ganchos não são enfeite,
> são o roteiro do apresentador.

> **Cláudia:** Bom trabalho. *(já de pé, notebook debaixo do braço)*
>
> **Ana:** Obrigada.
>
> **Cláudia:** Manda no canal do time depois, pra quem não estava aqui ver.

E sai.

> 💡 **Gancho de fala:** ela **falou**. Falou em quatro palavras e uma instrução,
> no meio de uma saída. Do ponto de vista dela, ela deu feedback e um
> direcionamento. Do ponto de vista da Ana, foi quase nada. As duas leituras
> estão certas — e essa distância é onde a maior parte da frustração de carreira
> vive.

---

## 7. Bianca — a virada

Ela aparece na porta. Não estava na reunião. **Seis linhas, e ela para.** Ela não
ensina nada aqui — ela vira a mesa e sai do caminho.

> **Bianca:** *(da porta)* Isso é bom, Ana. Bom de verdade.
>
> **Ana:** Ninguém falou nada.
>
> **Bianca:** Quem ia falar? Naquela sala só tinha quem já sabia do projeto.
>
> **Bianca:** Lembra a sua lista? "Falar numa reunião cheia de gente mais
> experiente."
>
> **Ana:** *(pausa)* Eu nunca fiz essa trilha.
>
> **Bianca:** Não. Você fez as outras três.

> ⚠️ **Callback do Bloco 2.** É o par `lacuna-reuniao` → `trilha-apresentar` do
> puzzle de associar. A plateia identificou a lacuna junto com ela e viu a Ana
> não fechar essa. A Bianca **não explica** o callback — se a plateia não
> lembrar, **você é quem lembra**, numa frase, antes de clicar.

> 💡 **Gancho de fala:** visibilidade não é autopromoção. É **tradução**. Ela fez
> um trabalho excelente numa língua que só quatro pessoas falam — e a trilha que
> ela deixou de fazer era exatamente a de traduzir.

**→ Ganha skill: Visibilidade** *(concedida no fim do diálogo, e a fase fecha)*

---

## 8. Aprender a comunicar — **fala do apresentador**

A Bianca plantou; quem desenvolve é você. O sistema acende `Visibilidade` no
painel **sem nenhuma linha de NPC que a explique** — a explicação é ao vivo.
Enumere aqui, olhando pro painel que acabou de acender:

> 💡 **Gancho de fala — três coisas, e nenhuma delas é se vender:**
>
> **Um: conta o que você fez em termos de quem escuta.** Não o nome do processo.
> *"O turno seguinte já começa sabendo o que ficou pendente."*
>
> **Dois: conta pra quem não estava na sala.** O canal do time, o fórum, a pessoa
> que te perguntou no café. Não é puxar o saco de ninguém — é deixar rastro.
>
> **Três: escreve onde você quer estar em dois anos.** Porque se você não
> escrever, alguém escreve pra você.

> ℹ️ A terceira é **plantio da fase 5**, não desta: a skill *Plano de futuro*
> acende lá (ADR-028 e `bloco5.ts`). Diga a frase de qualquer jeito — ela é o
> gancho que leva a plateia para a fase seguinte.

---

## Fecho do bloco

> *O trabalho era o mesmo antes e depois da página que ela escreveu.*
> *O que mudou foi quanta gente sabia que ele existia.*

> 💡 **Gancho de fecho:** *"Trabalho invisível não vira oportunidade sozinho. Não
> porque o mundo é injusto — porque ninguém consegue reconhecer o que não vê."*

**→ Passa o bastão.** Cartão **"É esse o caminho?"**.

---

## Checklist do bloco

| Elemento | Status |
|---|---|
| Itens ganhos | **Crachá Innovation** — concedido em silêncio, sem aviso nenhum |
| Skills ganhas | **Visibilidade** |
| Lugares destravados | nenhum |
| NPCs | Cláudia, Bianca |
| Puzzle | Montar 4 peças *(o mais satisfatório)* |
| Requisito especial | **PAUSA de ~8s sem feedback** + quebra de quarta parede |
| Callback | par nº 3 do puzzle de associar, do Bloco 2 |
| Carga do tema | as três lições de comunicação são **fala do apresentador** (§8) |

---

## O que SAIU deste roteiro, e é decisão

Registrado para que ninguém reponha por achar que foi esquecimento:

- **A notificação do Marcos.** Plantava o mecanismo de mensagem da fase 5 e
  convidava a Ana para o Innovation Day. Os dois motivos morreram: a Innovation
  Week **é** esta sala (ADR-026), então não há para onde convidar, e a fase 5
  passou a ter o painel de skills como mecânica (ADR-024), então não há mensagem
  para plantar.
- **O item "Projeto entregue".** Nenhum efeito do jogo o usava (ADR-014,
  ADR-017). O item desta fase é o crachá.
- **A skill "Plano de futuro" nesta fase.** Migrou para a fase 5, que é inteira
  sobre isso.
- **"A sala inteira é gente apresentando", na abertura.** O texto prometia o que
  nenhum cenário entrega — exigiria vinte figuras humanas pintadas no fundo, na
  escala do elenco. A abertura passa a prometer o que está na tela: sala cheia,
  cadeiras viradas para a frente, fila de estagiários, e a próxima é ela.
