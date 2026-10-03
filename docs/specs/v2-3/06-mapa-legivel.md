# v2.3 / Spec 06 — Fundo de mapa que orienta

**Depende:** auditoria 00. **Leia:** `src/ui/Mapa.tsx`, `src/ui/Mapa.geometria.test.ts`, `src/domain/content/base.ts`, `scripts/pixelart/cenarios.py::mapa`, `src/styles/tokens.ts` e a bíblia de arte.

## Problema

O PNG atual parece uma fachada noturna coberta por janelas iluminadas. Atrás dos cartões de lugar, não informa caminho, andar nem relação espacial. A tela se chama “Mapa da jornada”, mas o fundo não é reconhecido como mapa; as miniaturas dos cartões acabam competindo com uma textura abstrata.

## Composição proposta

Desenhar uma **planta simplificada de um andar corporativo vista de cima**, na paleta existente: corredor central, portas e cinco zonas/salas em posições compatíveis com os cinco slots ativos de `LUGARES`. Entrada ou recepção marcada por uma forma simples e um caminho que sugere navegação. O desenho deve parecer um mapa ao primeiro olhar, mesmo sem ler rótulos; não precisa fingir precisão arquitetônica do prédio real. Usar bordas grossas, blocos de cor e poucas linhas. O fundo fica escuro e discreto para os cartões permanecerem principais.

Os nomes e imagens dos lugares seguem nas peças interativas. Lugar bloqueado conserva silhueta e nome oculto; o fundo pode mostrar sua sala como contorno, sem placa, ícone exclusivo ou detalhe que revele seu conteúdo. Lugar concluído continua com a marca discreta atual. Uma rota ou segmento pode receber realce conforme o estado, desde que seja compreensível em movimento reduzido e sem animação. Não criar uma rede de linhas atrás dos cartões que pareça quebrada ou que cruze textos.

Antes de desenhar, usar `ENQUADRAMENTO` de `Mapa.tsx` para marcar área livre, painel de skills, barra de itens, título e retângulo de cada slot. A arte reserva respiro nessas zonas; não deslocar cartões até colidirem com overlays. Se o mapa precisar de legenda, usar texto de UI de no mínimo 22 px, sem minúsculas dentro do PNG. Preservar click, foco, teclado e estado de desbloqueio.

## Critérios de aceite

- [ ] Uma pessoa que vê o fundo sem cartões o identifica como planta/mapa de andar, com corredor e salas, em poucos segundos.
- [ ] Com os cinco cartões e overlays, caminhos e relações espaciais continuam visíveis sem poluir rótulos; nenhum nome de lugar bloqueado vaza pelo fundo.
- [ ] Área livre e geometria dos slots passam no teste; alvo de clique e foco permanecem evidentes.
- [ ] PNG e fallback têm a mesma leitura geral; folha de contato e captura do mapa em escala de apresentação foram abertas.
- [ ] Typecheck, suíte inteira e revisão em vídeo comprimido concluídos.
