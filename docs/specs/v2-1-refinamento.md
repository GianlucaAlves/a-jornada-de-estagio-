# v2.1 / Refinamento — o que foi visto na tela

Esta rodada não tem escopo novo. Todo item aqui nasceu de um defeito **visto
jogando** ou **medido na arte**, e cada um traz a evidência.

**Leitura obrigatória:** `AGENTS.md`, `docs/biblia-de-arte.md`,
`docs/decisoes/adr.md`, `docs/decisoes/v2-desenho.md`.

**O contrato de arte novo já existe** em `src/assets/manifest.ts` — quatro ids
(`objeto-caderno`, `objeto-grade-curricular`, `objeto-atril`, `objeto-plateia`).
Programe contra eles; não invente id.

---

## Frente A — Cláudia deixa de ser a Ana repintada

**Arquivos:** `scripts/pixelart/personagens.py`, `scripts/pixelart/retratos.py`.

### A evidência

Na folha de contato, **seis a oito figuras** compartilham a mesma descrição:
blazer azul-marinho, cabelo castanho na altura do ombro, crachá amarelo, colarinho
branco. São os quatro estados da Ana, a Cláudia, e os quadros de respiração. Numa
cena com Ana e Cláudia juntas — fase 1, fase 3, fase 4 — a plateia não tem como
saber quem é quem.

E no retrato a Cláudia **lê como homem**. A causa está no log de geração:

```
[retratos] npc-rafael:  cabeça 31px, cabelo  9, ombro 29px
[retratos] npc-claudia: cabeça 25px, cabelo  9, ombro 32px
```

Cabelo 9 nos dois. O retrato dela recebeu o cabelo curto do Rafael, enquanto o
sprite de corpo inteiro tem cabelo no ombro. Ela não tem design coerente em
nenhuma das duas escalas — o mapeamento do manifest está correto
(`retrato-npc-claudia` → `npc-claudia.png`), o defeito é na arte.

### O que entregar

**A Cláudia ganha identidade própria**, e ela é líder — isso deve estar na
silhueta, não num rótulo. Mude pelo menos três eixos ao mesmo tempo: **cabelo**
(comprimento e volume, não só tom), **silhueta de roupa** (a bíblia §5.4 é
explícita: não basta trocar o tom do mesmo blazer) e **paleta**. Considere
também altura, dentro dos ±4px que a bíblia autoriza.

**O retrato tem de ser a mesma pessoa do corpo.** Cabelo, pele e roupa na altura
do ombro batendo entre as duas escalas. Vale para os cinco NPCs, não só para ela.

**Auditoria de distinção, par a par.** Nove figuras (4 Ana + 5 NPCs), nos dois
formatos. Para cada par, a pergunta é: dá para diferenciar **pela silhueta**,
antes da cor? Se não, corrija.

**A Ana tem de ser inconfundível** — ela é a protagonista e aparece em toda cena.

### Critério de aceite

- [ ] `python scripts/gerar_arte.py` limpo, zero aviso de `verificar_sprite`
- [ ] folhas `contato-personagens.png` e `contato-retratos.png` geradas **e
      olhadas**
- [ ] no relatório, a matriz de distinção: para cada par de figuras, o que as
      separa. E responda direto: **a Cláudia do retrato é a mesma do corpo?**
- [ ] as quatro famílias de tom de pele continuam representadas no elenco

---

## Frente B — O cenário e os objetos da fase 5

**Arquivos:** `scripts/pixelart/cenarios.py`, `scripts/pixelart/props.py`.

### A evidência

`docs/arte/previa-b5-outra-area.png`, olhada: a sala está **lavada** — cinza-azul
claro com pouquíssimo contraste — e **não lê como escritório**. Lê como
biblioteca ou sala de estudos, por causa da estante, do balcão e da ausência de
posto de trabalho.

O dono foi específico: *"o cenário da fase 5 é um escritório assim como a
primeira fase, porém um visual diferente de escritório, pois é uma sala diferente
na mesma empresa."*

E há um **artefato**: um retângulo claro pontilhado no chão, à esquerda
(aproximadamente x 420..950px, y 790..880px no PNG de 1920x1080). Ele não lê como
tapete; lê como falha de renderização.

### O que entregar

**`outra-area` passa a ler como escritório**, e inconfundível com o Escritório da
fase 1. Baias ou postos de trabalho de verdade, monitores, cadeiras de escritório.
A diferença vem de luz, densidade de ocupação, altura de divisória e paleta — não
de trocar os móveis por móveis de outro tipo de sala.

**Mais contraste.** A bíblia §4.2 exige que o personagem caia numa faixa de valor
diferente do que está atrás dele. Hoje parede e piso estão quase no mesmo valor
claro, e a cena inteira ocupa um terço da rampa.

**Conserte o retângulo do chão** — ou faça dele um tapete que lê como tapete.

**Quatro objetos novos**, conforme o contrato já no manifest:

- `objeto-caderno` — caderno de **papel**, aberto, com escrita à mão. Hoje a
  fase 5 desenha "Caderno dela" com um laptop.
- `objeto-grade-curricular` — grade impressa: folha com linhas e colunas. Hoje é
  um monitor.
- `objeto-atril` — atril de onde se apresenta, para a fase 4.
- `objeto-plateia` — plateia sentada, de costas, para primeiro plano da fase 4.

**A Sala de Reuniões precisa ler como Innovation Week.** O texto de abertura
promete *"a sala inteira é gente apresentando"* e o cenário entrega uma sala
vazia. Vista o lugar: cartaz do evento, cadeiras voltadas para a frente, e deixe
piso livre onde a plateia e o atril vão entrar como objeto.

**Não mova mobiliário existente** de outras cenas: as coordenadas do conteúdo
foram medidas contra a geometria atual. Se mexer em `outra-area` ou
`sala-reunioes`, rode `exportar_chao.py` e **relate** que as coordenadas daquelas
duas cenas precisam de revisão.

### Critério de aceite

- [ ] `gerar_arte.py` e `exportar_chao.py` limpos
- [ ] folhas de contato e prévias geradas **e olhadas**
- [ ] no relatório: o que você VIU em `outra-area` antes e depois, e o que mudou
      além da paleta para ela não ser confundível com o Escritório
- [ ] o artefato do chão sumiu
- [ ] os quatro objetos novos existem em `public/assets/objetos/`

---

## Frente C — A reflexão que faltou na fase 5

**Arquivos:** `src/domain/content/bloco5.ts`, `docs/roteiro/05-bloco-5.md`.

### A evidência

O dono: *"faltou a reflexão na fase 5 sobre a possibilidade de não ser efetivado
quando Ana ainda não sabe o que vai acontecer, esse é um gancho importante pra
apresentação."*

Ele está certo, e a causa é minha: o ADR-028 me fez proteger a fase de **afirmar
o desfecho**, e no processo a reflexão sobre *o que acontece se não vier* ficou de
fora. Hoje o diálogo `b5-pivo` tem só *"Eu não sei se eu fico"* (nó 2) e fecha
com *"O que você aprendeu a fazer aqui é seu"* (nó 6). Falta o passo do meio.

### O que entregar

A reflexão entra, e a regra do ADR-028 **continua valendo**: o jogo nunca afirma
que ela não será efetivada, e nunca prevê o desfecho. A distinção é fina e é o
trabalho todo:

- **Proibido:** "eu acho que não vou ficar", "se eu não ficar, foi bom mesmo
  assim" dito como consolo antecipado, qualquer previsão.
- **É isso que se quer:** ela não sabe, e pensa em voz alta no que acontece nas
  duas hipóteses. O que ela construiu não depende do resultado. A experiência é
  dela em qualquer cenário.

A Bianca é a voz certa para sustentar isso (ADR-027): ela não seguiu o caminho
previsto e está bem. Mas **cuidado com a armadilha**: ela não pode consolar, e não
pode prometer final feliz. Ela conta o que aconteceu com ela e reenquadra de
passagem — é o que o nó 5 já faz bem.

**Aponte os dois objetos para a arte nova:** `b5-caderno` passa a usar
`objeto-caderno` e `b5-grade` passa a usar `objeto-grade-curricular`. Reveja
tamanho e âncora: caderno de papel na mesa e grade impressa não têm a mesma
proporção que laptop e monitor, e âncora errada faz objeto flutuar.

**A lição continua não estando na boca de ninguém.** Que pivotar não é erro e
que a experiência é o que mais importa é fala da Marianna, no roteiro.

### Critério de aceite

- [ ] `npm run typecheck` e `npm test` verdes
- [ ] nenhuma linha nova afirma ou prevê o desfecho
- [ ] `previa_de_cena.py` rodado e a prévia da fase 5 **olhada**: os dois objetos
      novos assentam na superfície e não flutuam
- [ ] no relatório, cole o diálogo `b5-pivo` inteiro, na ordem final. É o texto
      de maior peso desta rodada e precisa de revisão humana.

---

## Frente D — O momento da apresentação (fase 4)

**Arquivos:** `src/domain/content/bloco4.ts`, `docs/roteiro/04-bloco-4.md`.

### A evidência

O dono: *"o momento da apresentação, não dá pra entender direito o que está
acontecendo."* Lendo o conteúdo, o motivo aparece inteiro:

O hotspot que **é** o ato de apresentar (`b4-entrega`, rótulo "Apresentar") tem
como arte o **crachá** — `arte: { tipo: 'item', itemId: 'cracha-innovation' }` —
ancorado no centro, flutuando sobre a mesa. A recompensa está fazendo papel do
gesto. E logo depois vem a PAUSA, em silêncio absoluto por requisito.

Resultado: clica-se numa TV, resolve-se um puzzle, clica-se num crachá flutuante,
e vem silêncio. **Nada na tela mostra uma apresentação acontecendo.** O silêncio
foi desenhado para doer depois do momento de maior satisfação, mas sem nada
mostrado antes, ele só confunde.

### O que entregar

**O gesto de apresentar ganha arte de gesto.** Use `objeto-atril` — ela sobe para
apresentar. O crachá continua sendo **concedido** pelo hotspot; ele só deixa de
ser o botão.

**A apresentação passa a ser mostrada.** Antes da PAUSA, alguma coisa tem de
acontecer na tela que diga "ela está apresentando agora, e a sala está ouvindo".
Você tem `objeto-plateia` para o primeiro plano e a TV da sala para o conteúdo.

**A PAUSA continua intocável.** Silêncio absoluto, zero narração em
`b4-entrega`. Ela é o beat mais delicado do jogo e o fecho do laço. O que você
está consertando é o que vem **antes** dela, para que o silêncio tenha contra o
que contrastar.

**O texto de abertura tem de casar com a tela.** Ele promete "a sala inteira é
gente apresentando"; ou o cenário entrega isso (a frente B está vestindo a sala),
ou o texto muda.

**Cuidado com a ordem das portas.** Os quatro beats são presos por porta:
apresentar → entregar → silêncio → Cláudia → Bianca. Se você inserir um beat,
ele entra na cadeia de `requerHotspotsFeitos` e cada porta precisa de
`bloqueadoTexto` próprio — hotspot que responde com silêncio parece travamento
no palco.

### Critério de aceite

- [ ] `npm run typecheck` e `npm test` verdes
- [ ] `previa_de_cena.py` rodado e a prévia da fase 4 **olhada**
- [ ] o crachá não é mais o botão de apresentar
- [ ] a PAUSA continua sem narração nenhuma
- [ ] no relatório, descreva a sequência final beat a beat, e o que a plateia
      **vê** em cada um

---

## Frente E — Ligar os pontos (fase 6)

**Arquivos:** `src/ui/Revelacao.tsx`, `src/ui/Revelacao.test.ts` (novo se
necessário).

### A evidência

O dono: *"o momento da efetivação onde se liga os pontos também está mal feito,
não acho que ficou legal assim."*

Lendo o componente: tudo é aritmética sobre um mapa sintetizado — `MAPA_X = 80`,
`CONVITE_R = 50`, `NO_R = 44` — e o que a plateia vê são **círculos e linhas**. É
geometria abstrata onde deveria estar significado. O cabeçalho ainda diz "Bloco 5
— a revelação", de antes de a fase 6 existir (ADR-024).

A decisão de não medir o DOM é **correta e deve ser preservada**: medir sob o
transform de escala do canvas é fragilidade que não sobrevive ao palco.

### O que entregar

**As quatro conexões continuam sendo quatro cliques do apresentador**, nunca
timer, com espessura e duração vindas do próprio objeto `Conexao`. Isso é spec e
não muda.

**O que muda é o que se vê.** Hoje: nó circular, linha, nó circular. Precisa
ficar claro que cada linha é **uma coisa que ela fez levando a uma oportunidade**.
Pense no que dá significado: a arte do item na origem em vez de um círculo, o
cenário do lugar no nó do meio, o destaque do que permanece aceso no fim.

**A quarta conexão é diferente das três e isso tem de ler na tela.** As três
primeiras saem de itens e **se apagam**; a quarta sai da skill `proatividade` e
**permanece acesa** quando todo o resto se apagou. Essa permanência é a tese do
projeto inteiro — se a plateia não perceber que sobrou uma coisa acesa, o clímax
não entregou.

**Atualize o cabeçalho** para fase 6.

**Restrições que continuam:** sem partícula, sem brilho difuso, sem linha fina,
sem gradiente, sem animação rápida. Traçado lento e grosso, alto contraste.

### Critério de aceite

- [ ] `npm run typecheck` e `npm test` verdes
- [ ] nada de medição de DOM: continua aritmética
- [ ] as três portas se apagam e o motivo permanece aceso, e isso é visível
- [ ] no relatório, descreva o que a plateia vê em cada um dos quatro cliques, e
      o que fica na tela depois do quarto

---

## Regras para todas as frentes

- **Não apague arquivo nenhum.** Já houve perda de trabalho neste projeto.
- **Não invente id de asset:** os quatro novos já estão no manifest.
- **Respeite a fronteira de arquivo da sua frente.** A rodada anterior teve três
  defeitos, e os três nasceram em juntas entre frentes.
- Terminar = `npm run typecheck` + `npm test` verdes, e arte **olhada**.
- Se faltar decisão que os ADRs não tomaram, **pare e relate** em vez de escolher.
