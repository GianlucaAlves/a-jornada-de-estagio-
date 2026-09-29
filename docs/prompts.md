# Prompts de arte

24 assets. **Sempre concatene o PREÂMBULO ao prompt específico.** É isso que mantém as 24 imagens parecendo do mesmo mundo quando você regenera uma isolada, meses depois.

Substituir arte = dropar o arquivo no caminho indicado. Zero mudança de código. Enquanto o arquivo não existir, a UI cai no placeholder geométrico rotulado — nunca há imagem quebrada.

---

## PREÂMBULO DE ESTILO (copie em toda geração)

```
Ilustração digital estilo point-and-click clássico de aventura gráfica.
Pintura digital com sombreamento achatado em poucos tons, contornos legíveis,
formas grandes e claras. Alto contraste. Paleta limitada e fria: azul-petróleo
escuro (#16242e) como base de ambiente, cinza-azulado médio (#2e4654),
off-white (#eef2f4) para superfícies claras, e amarelo âmbar (#ffd43b) usado
com parcimônia apenas como acento de luz ou objeto de foco.

Ambiente corporativo brasileiro contemporâneo, escritório de empresa de
telecomunicações. Realista mas estilizado, nunca cartunesco, nunca fotográfico.

RESTRIÇÕES OBRIGATÓRIAS (a imagem será exibida comprimida por
compartilhamento de tela do Teams e assistida em notebook):
- Sem detalhe fino: nada de linhas de 1px, texturas sutis, padrões miúdos.
- Sem gradiente suave. Transições de cor em degraus visíveis.
- Sem partículas, poeira, brilho difuso, bloom, lens flare, bokeh.
- Sem texto legível na imagem (nenhuma palavra, placa ou rótulo).
- Contraste alto entre plano de foco e fundo. Nada de cinza sobre cinza.
- Iluminação simples e direcional. Uma fonte de luz dominante por cena.
```

**Prompt negativo (use sempre):**

```
texto, letras, palavras, watermark, assinatura, gradiente suave, bloom,
lens flare, partículas, poeira, bokeh, desfoque de fundo, textura fotográfica,
ruído, baixo contraste, cinza sobre cinza, detalhe minúsculo, estilo anime,
estilo cartunesco infantil, deformação de mãos, membros extras
```

---

## Identidade da protagonista (trave isto)

Os 4 sprites precisam parecer **a mesma pessoa**. Cole este bloco em toda geração de Ana — é o ponto mais frágil do pipeline inteiro.

```
Mulher brasileira, 21 anos, estagiária. Pele morena clara. Cabelo castanho
escuro, ondulado, na altura dos ombros, solto. Rosto de traços SIMPLES e pouco
detalhados (olhos, nariz e boca sugeridos, sem detalhe de textura de pele) —
rosto genérico é proposital e reproduz melhor entre imagens. Sem óculos.
Sem maquiagem marcante.

Roupa fixa: camiseta lisa cinza-azulada de manga curta, calça jeans escura,
tênis branco simples. Crachá corporativo branco pendurado em cordão azul
escuro no peito.

Corpo inteiro, de pé, vista lateral-frontal a três quartos, virada para a
direita. Fundo TRANSPARENTE. PNG. Aproximadamente 600x1000 px.
Personagem ocupando a altura total do quadro.
```

Se a IA insistir em variar o rosto, gere `ana-neutra` primeiro e use como imagem de referência para as outras três.

---

## Protagonista — 4 sprites

O arco de postura é o único arco de personagem que a plateia lê sem ninguém apontar. **A diferença entre os três primeiros é só linguagem corporal** — mesma roupa, mesmo cabelo, mesma pessoa.

### `ana-encolhida` → `public/assets/protagonista/ana-encolhida.png`
```
[PREÂMBULO] [IDENTIDADE]
Postura retraída: ombros caídos e voltados para dentro, cabeça ligeiramente
baixa, olhar para o chão à frente, braços junto ao corpo, uma das mãos
segurando a alça da bolsa contra o peito. Expressão de apreensão contida.
Parece querer ocupar menos espaço.
```

### `ana-neutra` → `public/assets/protagonista/ana-neutra.png`
```
[PREÂMBULO] [IDENTIDADE]
Postura neutra de trabalho: coluna ereta, ombros relaxados em posição natural,
cabeça erguida, olhar para frente na altura do horizonte. Um caderno sob o
braço. Expressão concentrada e tranquila. Nem tímida, nem imponente.
```

### `ana-confiante` → `public/assets/protagonista/ana-confiante.png`
```
[PREÂMBULO] [IDENTIDADE]
Postura confiante: ombros abertos e para trás, peito aberto, queixo erguido,
olhar firme para frente, peso distribuído com firmeza nas duas pernas, uma mão
no bolso. Expressão serena e segura. Mesma roupa, mesma pessoa — só o corpo
mudou.
```

### `ana-futura` → `public/assets/protagonista/ana-futura.png`
```
[PREÂMBULO]
A MESMA mulher da identidade acima, dez anos mais velha: 31 anos. Mesmo tom de
pele, mesma cor de cabelo castanho escuro, agora em corte mais curto na altura
do maxilar. Mesmos traços simples de rosto, com leves linhas de expressão.

Roupa diferente e melhor: blazer azul-petróleo escuro sobre blusa off-white,
calça de alfaiataria. Sem crachá.

Postura calma e estabelecida, braços relaxados, uma mão levemente à frente
como quem vai apontar. Expressão de quem sabe a resposta e não precisa dizer.

Corpo inteiro, vista a três quartos virada para a esquerda. Fundo TRANSPARENTE.
PNG, aproximadamente 600x1000 px.
```

---

## Elenco fixo — 5 NPCs

Todos: **corpo inteiro, fundo transparente, PNG ~550x1000, vista a três quartos, rosto de traços simples.** Eles reaparecem ao longo de 2 anos, então precisam ser reconhecíveis de longe pela silhueta e pela cor da roupa.

### `npc-rafael` → `public/assets/npcs/rafael.png`
```
[PREÂMBULO]
Homem brasileiro, 26 anos, engenheiro de dados. Pele negra retinta. Cabelo
crespo curto. Barba curta aparada. Camisa polo verde-escura, calça jeans,
tênis. Crachá em cordão azul. Postura relaxada e aberta, peso em uma perna,
uma das mãos segurando um copo de café descartável. Expressão simpática e
tranquila, um leve sorriso — o tipo que ajuda mas não resolve por você.
Corpo inteiro, três quartos, fundo transparente, PNG 550x1000.
```

### `npc-claudia` → `public/assets/npcs/claudia.png`
```
[PREÂMBULO]
Mulher brasileira, 40 anos, tech lead. Pele clara. Cabelo castanho claro liso,
preso em coque baixo. Óculos de armação fina e escura. Blazer cinza-azulado
escuro sobre camisa off-white, calça escura. Notebook fechado debaixo do braço.
Postura de quem está em trânsito: tronco levemente à frente, passo iniciado.
Expressão neutra e focada, nem hostil nem calorosa — ocupada.
Corpo inteiro, três quartos, fundo transparente, PNG 550x1000.
```

### `npc-tiago` → `public/assets/npcs/tiago.png`
```
[PREÂMBULO]
Homem brasileiro, 30 anos, suporte de TI. Pele morena. Cabelo castanho escuro
curto e desalinhado. Sem barba. Camiseta preta lisa, calça cargo cinza, tênis.
Crachá em cordão azul, torto. Um cabo de rede enrolado na mão. Postura
descontraída e um pouco desengonçada, ombros soltos. Expressão de bom humor,
sorriso fácil.
Corpo inteiro, três quartos, fundo transparente, PNG 550x1000.
```

### `npc-bianca` → `public/assets/npcs/bianca.png`
```
[PREÂMBULO]
Mulher brasileira, 34 anos, documentação técnica e design de API. Pele parda.
Cabelo preto longo e liso, solto. Camisa de linho off-white de manga
enrolada, calça escura de alfaiataria. Caneca de cerâmica na mão. Postura
calma e apoiada, como quem está encostada numa mesa alta conversando sem pressa.
Expressão atenta e reflexiva, olhar direto.
Corpo inteiro, três quartos, fundo transparente, PNG 550x1000.
```

### `npc-marcos` → `public/assets/npcs/marcos.png`
```
[PREÂMBULO]
Homem brasileiro, 38 anos, facilitador de programa de inovação. Pele clara.
Cabelo grisalho curto. Barba grisalha curta. Camisa xadrez azul de manga
arregaçada sobre camiseta, calça jeans. Prancheta e canetão na mão. Postura
energética e expansiva, gesticulando com a mão livre. Expressão entusiasmada,
sorriso aberto, olhando para o interlocutor.
Corpo inteiro, três quartos, fundo transparente, PNG 550x1000.
```

---

## Cenários — 6 lugares

Todos: **1920x1080 PNG, perspectiva frontal levemente elevada (três quartos), como point-and-click clássico.** Cena VAZIA de pessoas — os personagens são sprites separados compostos por cima. Deixe a metade inferior do quadro relativamente livre: é onde a protagonista caminha.

### `cenario-escritorio` → `public/assets/cenarios/escritorio.png`
```
[PREÂMBULO]
Escritório corporativo aberto, vazio de pessoas, início de manhã. Em primeiro
plano à esquerda, uma mesa de trabalho com notebook fechado, monitor, caneca e
cadeira de escritório. Ao fundo, fileiras de mesas idênticas, divisórias
baixas, um rack de equipamentos de rede à direita. Janelas grandes na parede
do fundo com luz fria de manhã entrando em diagonal e criando sombras longas.
Metade inferior do quadro com piso livre. 1920x1080.
```

### `cenario-cafezinho` → `public/assets/cenarios/cafezinho.png`
```
[PREÂMBULO]
Copa corporativa pequena, vazia de pessoas. Máquina de café automática grande
encostada na parede à direita, bancada com pia, armários suspensos, uma mesa
alta redonda com dois banquetos altos ao centro-esquerda. Luz mais QUENTE e
acolhedora que o resto do prédio — ainda dentro da paleta, mas com o âmbar
puxando o ambiente. Contraste deliberado com o escritório.
Metade inferior com piso livre. 1920x1080.
```

### `cenario-sala-treinamento` → `public/assets/cenarios/sala-treinamento.png`
```
[PREÂMBULO]
Sala de treinamento pequena, vazia de pessoas, fim de tarde. Mesa longa
retangular ao centro com quatro cadeiras, um notebook aberto sobre ela. TV
grande apagada montada na parede do fundo. Flip chart de papel em branco no
canto. Uma única janela lateral com luz de fim de tarde baixa e lateral.
Ambiente de quem está estudando fora do horário nobre.
Metade inferior com piso livre. 1920x1080.
```

### `cenario-laboratorio` → `public/assets/cenarios/laboratorio.png`
```
[PREÂMBULO]
Laboratório técnico, vazio de pessoas. Racks de servidores altos ao fundo com
pequenos pontos de luz indicadora. Dois monitores grandes acesos sobre uma
bancada em primeiro plano à direita, exibindo blocos abstratos de linhas
monocromáticas (SEM TEXTO LEGÍVEL). Cadeira de escritório gasta. Quadro branco
vazio na parede esquerda. Luz FRIA e azulada, sem janelas, contraste forte
entre a luz dos monitores e a penumbra do resto. Oposto visual do Cafezinho.
Metade inferior com piso livre. 1920x1080.
```

### `cenario-innovation` → `public/assets/cenarios/innovation.png`
```
[PREÂMBULO]
Espaço aberto de inovação, vazio de pessoas, energético e claro. Parede coberta
de post-its coloridos em blocos de cor (SEM TEXTO). Mesas redondas baixas,
pufes, um painel de cortiça. Iluminação ampla e clara, muito mais aberta que o
Laboratório. Único cenário onde a paleta abre para cores mais saturadas nos
post-its, mantendo o resto do ambiente na paleta base.
Metade inferior com piso livre. 1920x1080.
```

### `cenario-sala-reunioes` → `public/assets/cenarios/sala-reunioes.png`
```
[PREÂMBULO]
Sala de reuniões corporativa, VAZIA de pessoas. Mesa oval grande ao centro com
seis cadeiras — duas delas afastadas e giradas, como se alguém tivesse acabado
de sair. TV grande na parede do fundo, acesa, exibindo um diagrama abstrato
de blocos conectados por linhas GROSSAS (SEM TEXTO). Parede de vidro à
esquerda dando para um corredor vazio. Luz uniforme e neutra de teto, sem
drama. A sala deve parecer maior do que precisaria ser — o vazio é o assunto.
Metade inferior com piso livre. 1920x1080.
```

> A sala de reuniões é o cenário mais importante da apresentação depois do mapa: é onde acontece a pausa de 8 segundos. Se ela não parecer solitária quando esvaziar, o Bloco 4 perde o impacto. Gere várias e escolha a mais vazia.

---

## Mapa

### `mapa` → `public/assets/mapa/mapa.png`
```
[PREÂMBULO]
Fundo de mapa estilizado de um andar de escritório corporativo, visto de cima
em perspectiva isométrica suave. Planta baixa abstrata e limpa: blocos de
ambientes separados por corredores, sem mobília detalhada, sem nomes, SEM TEXTO.
Tom bem ESCURO e dessaturado — este fundo fica atrás de seis ícones de lugar e
de linhas de luz âmbar, então precisa ser discreto e nunca competir com eles.
Vinheta escura nas bordas. Muito contraste possível contra elementos claros
sobrepostos. 1920x1080.
```

> Os 6 slots de lugar são desenhados em cima por código, em posições calculadas (ver `ENQUADRAMENTO` em `src/ui/Mapa.tsx`). O mapa é só o fundo. Não desenhe ícones de sala nem marcações de posição.

---

## Itens — 8 ícones

Todos: **PNG 256x256, fundo transparente, objeto isolado e centralizado, vista levemente de cima a três quartos, sombra sólida simples embaixo.**

> ⚠️ Os três últimos são os **itens tardios**. Eles têm que parecer exatamente tão comuns quanto os outros cinco. Mesmo nível de detalhe, mesmo enquadramento, mesma iluminação, nenhum brilho, nenhuma aura, nenhum destaque. Qualquer diferença visual entrega o clímax 40 minutos antes.

### `item-senha` → `public/assets/itens/senha.png`
```
[PREÂMBULO]
Ícone de item: um post-it amarelo pequeno e amassado, com três blocos de
rabisco manuscrito ilegível separados por dois hífens (SEM TEXTO LEGÍVEL).
Objeto isolado, centralizado, vista a três quartos de cima, sombra sólida
embaixo. Fundo transparente. PNG 256x256.
```

### `item-indicacao-trilha` → `public/assets/itens/indicacao-trilha.png`
```
[PREÂMBULO]
Ícone de item: um guardanapo de papel branco dobrado, com três linhas curtas
de rabisco manuscrito ilegível a caneta (SEM TEXTO LEGÍVEL). Levemente
enrugado. Objeto isolado, centralizado, três quartos de cima, sombra sólida.
Fundo transparente. PNG 256x256.
```

### `item-anotacoes-treinamento` → `public/assets/itens/anotacoes-treinamento.png`
```
[PREÂMBULO]
Ícone de item: um caderno de capa dura cinza-azulada, ABERTO, mostrando duas
páginas com rabiscos apressados ilegíveis e um diagrama simples de caixas
ligadas por setas grossas (SEM TEXTO LEGÍVEL). Objeto isolado, centralizado,
três quartos de cima, sombra sólida. Fundo transparente. PNG 256x256.
```

### `item-relatorio` → `public/assets/itens/relatorio.png`
```
[PREÂMBULO]
Ícone de item: um maço de cinco folhas A4 grampeado no canto, levemente em
leque, com blocos cinza sugerindo parágrafos e um gráfico de linha simples
(SEM TEXTO LEGÍVEL). Objeto isolado, centralizado, três quartos de cima,
sombra sólida. Fundo transparente. PNG 256x256.
```

### `item-projeto-entregue` → `public/assets/itens/projeto-entregue.png`
```
[PREÂMBULO]
Ícone de item: um diagrama de quatro blocos retangulares encaixados e
conectados por linhas GROSSAS, formando uma estrutura simétrica e completa,
com um leve acento âmbar nos conectores. Objeto flutuante e isolado,
centralizado, três quartos de cima, sombra sólida. Fundo transparente.
PNG 256x256.
```

### `item-cartao-rafael` → `public/assets/itens/cartao-rafael.png`
```
[PREÂMBULO]
Ícone de item: um cartão de visita corporativo branco simples, de pé
levemente inclinado, com dois blocos cinza sugerindo nome e cargo impressos
e um rabisco manuscrito de números a caneta no canto inferior (SEM TEXTO
LEGÍVEL). Objeto comum e sem nenhum destaque especial. Isolado, centralizado,
três quartos de cima, sombra sólida. Fundo transparente. PNG 256x256.
```

### `item-certificado-degree` → `public/assets/itens/certificado-degree.png`
```
[PREÂMBULO]
Ícone de item: uma folha de certificado off-white com borda fina simples,
levemente enrolada num canto, com blocos cinza sugerindo linhas de texto e um
selo circular discreto (SEM TEXTO LEGÍVEL). Objeto comum e sem nenhum
destaque especial. Isolado, centralizado, três quartos de cima, sombra sólida.
Fundo transparente. PNG 256x256.
```

### `item-cracha-innovation` → `public/assets/itens/cracha-innovation.png`
```
[PREÂMBULO]
Ícone de item: um crachá de participante de evento, retangular e branco,
pendurado num cordão azul escuro que cai TORTO e enrolado. Dois blocos cinza
sugerindo nome e evento impressos (SEM TEXTO LEGÍVEL). Objeto comum e sem
nenhum destaque especial. Isolado, centralizado, três quartos de cima, sombra
sólida. Fundo transparente. PNG 256x256.
```

---

## Checklist de aceitação da arte

- [ ] As 4 Ana parecem a mesma pessoa. Compare lado a lado antes de aceitar.
- [ ] Os 5 NPCs são distinguíveis pela silhueta e cor de roupa, de longe.
- [ ] Nenhuma imagem tem texto legível.
- [ ] Os 3 itens tardios são visualmente indistinguíveis em "importância" dos 5 imediatos.
- [ ] Nenhum cenário tem pessoas desenhadas.
- [ ] A sala de reuniões parece vazia e grande demais.
- [ ] O mapa é escuro o suficiente para os slots e as linhas âmbar aparecerem por cima.
- [ ] Teste no Teams: compartilhe a tela e confira se ainda dá para ler tudo num notebook.

O último item é o único que importa de verdade. Arte que fica bonita no seu monitor e ilegível no Teams é arte que não serve para esta apresentação.
