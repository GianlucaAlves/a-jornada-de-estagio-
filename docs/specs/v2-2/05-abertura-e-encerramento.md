# v2.2 / Spec 05 — Abertura e encerramento: Ana no escritório

**Depende:** specs 00 e 01. **Leia:** bíblia, `Abertura.tsx`, `Perguntas.tsx`,
`base.ts`, manifest, tokens e contratos de persistência.

**UI/conteúdo:** telas, perguntas finais, tokens, manifest se necessário e
testes. **Arte:** cenário/props; pose de Ana trabalhando em `personagens.py`.
Não usar geração externa de imagem: seguir o pipeline Python do projeto.

## O problema

O menu já mostra “A história da Ana” e oferece início ou retomada, mas falta
uma composição com a protagonista. O fecho mostra três perguntas genéricas
sobre fundo escuro simples. O pedido é tornar ambas as telas mais elaboradas,
com Ana no escritório, e substituir as reflexões finais.

## O que entregar

### 1. Composição de abertura

Usar o Escritório corrigido, com Ana visível em um posto de trabalho. Título
**A história da Ana** em destaque, texto de UI separado da pixel art e botões
largos numa área de leitura reservada. Compor texto e personagem em lados que
não se encubram; título não deve ficar em cima do rosto ou dos equipamentos.

Preservar a função atual: sem save, “Começar”; com save, “Continuar” e “Começar
do início”, fase e título de destino visíveis e aviso de que reiniciar apaga o
progresso. O foco inicial e a navegação por teclado continuam funcionando.
O menu tem fundo próprio: não expõe a cena ou os hotspots do progresso salvo.

### 2. Composição de encerramento

Depois da notícia, conexões e festa, cortar para o escritório com **Ana
trabalhando**. É a imagem de continuidade da carreira, não uma nova fase jogável
ou uma repetição do primeiro dia. Não alterar o arco da fase 6 nem colocar esse
retorno no momento da notícia.

A pose precisa mostrar trabalho: sentada ou em postura compatível com o posto,
mãos próximas ao teclado ou material e cadeira/mesa na profundidade correta.
Ana apenas parada ao lado de um notebook não cumpre o pedido. Uma respiração ou
gesto discreto pode dar vida; não exigir caminhada nem animação chamativa.

Compartilhar a composição de escritório entre abertura e fim quando possível,
com pose/estado apropriado. Menu usa Ana sem revelar sua versão futura; o fim
mostra a Ana que concluiu a jornada. Novo asset só quando a pose existente não
servir; nome, dimensões e fallback entram no manifest antes do uso.

### 3. Novas reflexões para a plateia

Substituir o conteúdo atual de `PERGUNTAS_FINAIS` por estas três perguntas-base:

1. **Que contribuição sua merece ser conhecida — e como você contaria essa história?**
2. **Em que área você quer crescer, e qual próximo passo pode experimentar?**
3. **Se uma oportunidade não vier, o que depende de você e o que você leva dessa experiência?**

A redação pode ser encurtada para caber na tela mantendo esses três eixos:
visibilidade, direção de carreira e aprendizado diante de fatores externos.
Não usar perguntas que tratem a não efetivação como algo ocorrido com Ana.

Mostrar uma pergunta por clique do apresentador. No fim, as três ficam visíveis
juntas para discussão, sem timer de saída. O fundo de escritório e Ana continuam
visíveis; uma placa sólida de alto contraste pode proteger o texto, ocupando
apenas a área de leitura. Não cobrir a tela inteira com um painel preto que
anule a composição solicitada.

Após a última pergunta, manter a tela estável para o debate, sem créditos,
botão de reinício ou chamada para outra ação. Movimento ambiente é discreto e
pode cessar ao completar as perguntas. `prefers-reduced-motion` preserva pose e
texto estáticos. Proteção contra duplo-clique mantém uma pergunta por avanço.

### 4. Legibilidade e robustez

Manter canvas, escala 4x, pixels sem suavização e fonte de sistema. Cor, tamanho,
camada, espaçamento e durações usam tokens. Texto nunca abaixo de 22px; testar
as três perguntas juntas com quebra de linha confortável e sem cortar Ana.

Falha no PNG continua pela cadeia de fallback. Cenário e pose de abertura/fim
são decorativos: não criam hotspots, concedem skills nem modificam o save.

## Critérios de aceite

**Implementado:** abertura e tela final usam o Escritório e Ana trabalhando;
as perguntas aparecem uma por clique e permanecem juntas. Os assets foram
gerados, as folhas de contato foram abertas e o teste da abertura permanece
verde. Capturas compostas e navegação real no navegador continuam pendentes.

- [x] Menu mostra título, Ana e escritório; opções e destino do save permanecem claros.
- [x] Início, retomada, reinício e teclado preservam o comportamento existente.
- [x] Encerramento mostra Ana trabalhando com apoio e profundidade coerentes.
- [x] Novas perguntas cobrem os três eixos e aparecem uma por clique, permanecendo
      juntas ao fim sobre o escritório.
- [ ] Texto tem contraste e leitura boa com a tela reduzida e em compartilhamento;
      fundo e Ana permanecem identificáveis.
- [ ] Redução de movimento e fallback de assets foram conferidos no navegador.
- [ ] Novas poses têm folha de contato gerada e aberta; abertura e fim têm
      capturas compostas abertas, pois as prévias de cena não cobrem essas telas.
- [x] Testes de abertura preservados e avanço final/duplo-clique verificados;
      `npm run typecheck` e `npm test` verdes.

No relatório, incluir capturas com e sem save e do encerramento com as três
perguntas. Atualizar o trecho de fecho no roteiro para acompanhar o novo debate.
