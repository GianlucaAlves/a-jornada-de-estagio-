# v2.2 / Spec 02 — Linha de Produção: robôs trabalhando, rádios na esteira

**Depende:** specs 00 e 01. **Leia:** bíblia de arte (§4, §6 e §8),
`src/domain/content/bloco3.ts`, `scripts/pixelart/cenarios.py` e `props.py`.

**Arte:** cenários e props; **UI:** camadas de ambiente, tokens e contrato de
assets se necessário. Conteúdo só muda nas coordenadas exigidas pela composição.

## O problema

A linha precisa parecer uma produção em funcionamento. O pedido é específico:
robôs trabalhando e **rádios de telecomunicação** sendo produzidos e andando
pela esteira. São equipamentos de telecom, não rádios domésticos ou caixinhas
genéricas. Essa atividade é ambiente; não cria um novo minigame.

## O que entregar

### 1. Um processo que a imagem explica

Compor uma esteira com entrada de unidades, estação de montagem ou inspeção e
saída. Mostrar rádios em mais de um estágio, por exemplo carcaça aberta e
unidade fechada com conectores e dissipação visíveis. A diferença deve aparecer
pela silhueta, sem depender de marca, modelo real ou texto minúsculo.

Pelo menos dois braços robóticos ocupam estações distintas, com bases fixas e
ferramentas voltadas para uma unidade na esteira. Não são braços flutuantes nem
figuras humanas metálicas. Racks, peças e sinalização ajudam a ler o ambiente
industrial; o corredor de Ana e Tiago fica separado da faixa de máquinas.

### 2. Movimento de produção

Os rádios deslocam-se em uma direção sobre a superfície da esteira. Entram e
saem por limites coerentes; o reinício do ciclo fica escondido por uma estação
ou pelo limite da faixa, sem teletransporte visível no meio do quadro. Permanecem
assentados durante todo o percurso, sem balançar ou atravessar robôs.

Braços alternam aproximação, trabalho e retorno, preservando a base. Pelo menos
uma operação coincide visualmente com a passagem ou parada de um rádio em sua
estação. O ciclo deve parecer trabalho, não oscilação aleatória. Esteira e robôs
têm ritmos compatíveis sem exigir simulação física.

Entregar fundo estático completo e camadas animadas separadas, com uma tabela
de contrato: id, arquivo, tamanho de quadro, quantidade de quadros, âncora,
posição, percurso e duração. Integrar essas camadas na UI; o pipeline atual de
PNG estático não passa a animar apenas por receber arquivos novos.

Usar passos de pixel e mecanismos CSS existentes quando adequados, sem
re-render de React por quadro. Durações e medidas compartilhadas vêm de tokens.
Seguir a exceção de quadros da bíblia, sem acelerar movimentos para chamar atenção.

### 3. Robustez ao vivo

Com `prefers-reduced-motion`, a composição fica estática e mostra um estado de
trabalho compreensível. Se a camada animada faltar, a cena ainda mostra robôs e
rádios; sondagem ou fallback evita máquinas desaparecidas. Decoração animada
não intercepta clique ou foco e não muda o resultado de nenhuma interação.

## Critérios de aceite

**Implementado:** sete rádios alternam entre carcaça aberta e unidade montada e
percorrem uma faixa contínua de 304 px em oito segundos; dois braços alternam
repouso e alcance em ciclos de quatro segundos.
Tokens, camadas sem clique, estado de movimento reduzido e fallback seguem os
contratos existentes. A prévia estática confirma posição e apoio; três ciclos
no navegador continuam pendentes.

| Id/arquivo | Quadro exibido | Âncora e posição | Percurso/ciclo |
|---|---:|---|---|
| `objeto-radio-telecom` · `public/assets/objetos/radio-telecom.png` | 64×96 px, unidade montada | base na esteira, y=580 px; faixa x=192–1184 px | intercala com carcaça aberta, espaçadas por 304 px em um ciclo de 8000 ms |
| `objeto-radio-telecom-aberto` · `public/assets/objetos/radio-telecom-aberto.png` | 64×96 px, carcaça em montagem | mesma âncora e faixa | alternância visual; o percurso periódico evita salto no reinício |
| `objeto-braco-robotico` · `public/assets/objetos/braco-robotico.png` | 96×200 px, repouso | base fixa em (536,568) px e (864,568) px | posição fixa; intercala com alcance a cada 4000 ms |
| `objeto-braco-robotico-estendido` · `public/assets/objetos/braco-robotico-estendido.png` | 96×200 px, alcance | mesma base das poses de repouso | opacidade em degraus; segundo braço defasado em 2000 ms |

- [x] Rádios de telecomunicação são reconhecíveis como unidades em produção.
- [x] Dois robôs ou mais estão ancorados em estações e executam operações visíveis.
- [ ] Assistir a três ciclos no navegador confirma apoio, direção, operação e
      reinício sem salto no meio da esteira.
- [x] Ana e Tiago ocupam piso livre, sem passar pela área das máquinas.
- [x] Movimento reduzido e ausência de animação preservam a leitura da produção.
- [x] Hotspots continuam clicáveis e a animação não toma o foco do diálogo.
- [x] Gerador, exportação de chão e prévias executados; folhas e prévia abertas.
- [x] `npm run typecheck` e `npm test` verdes; a suíte completa passou com 388
      testes. As camadas usam assets estáticos alternados por CSS e preservam
      o estado legível em movimento reduzido e sem animação.

No relatório, incluir o quadro estático e uma captura do ciclo no navegador.
Não mudar o problema, a solução ou o impacto narrado na fase 3.
