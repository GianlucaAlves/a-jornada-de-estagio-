# v2.2 / Refinamento — cenas vivas, apresentação clara e carreira em reflexão

Esta rodada parte da análise do dono depois de jogar: objetos sem apoio,
personagens mal posicionados, produção pouco viva, plateia estranha, apresentação
difícil de entender, fase 5 curta e abertura e encerramento pouco elaborados.

**Estado:** implementação concluída; revisão automática e prévias executadas.
O movimento real dos ciclos e o fluxo visual completo ainda precisam de uma
passagem no navegador, pois a prévia de cena é estática.

**Leitura obrigatória:** `AGENTS.md`, `docs/biblia-de-arte.md`,
`docs/decisoes/adr.md`, `docs/specs/v2-1-refinamento.md` e o conteúdo atual.
As specs anteriores explicam o histórico; o pedido atual governa esta rodada.

## O que muda e o que continua

O pedido autoriza mudanças narrativas delimitadas: um NPC preparando Ana para
apresentar, STAR e LinkedIn como assunto dessa conversa, ampliação da fase 5 e
substituição das perguntas finais. A regra de conteúdo fechado não impede essas
mudanças explicitamente solicitadas. O restante da história permanece fora do
escopo: seis fases, elenco recorrente, efetivação na fase 6, quatro conexões,
festa e silêncio da fase 4 continuam.

Esta rodada substitui três restrições antigas apenas onde necessário:

- A orientação de não mover mobiliário da v2.1 deixa de valer nas cenas revisadas:
  cenário e coordenadas precisam ser corrigidos juntos.
- A orientação de deixar todo conselho na fala do apresentador passa a admitir
  dicas breves do NPC sobre comunicação e carreira. O roteiro desenvolve os
  temas; a conversa dá uma situação concreta para começar.
- As perguntas de `base.ts` serão substituídas. O fecho mantém avanço manual e
  discussão com a plateia, agora sobre um escritório com Ana trabalhando.

O ADR-028 continua valendo quanto à incerteza do resultado, com a precisão pedida
agora: Ana **quer ser efetivada**, ainda não sabe se haverá efetivação e avalia
em qual área gostaria de construir carreira. Falta de vaga pode ser uma hipótese;
não vira explicação factual do caso dela nem antecipação de fracasso.

## Specs e ordem de execução

| Ordem | Documento | Resultado |
|---|---|---|
| 1 | `01-cenarios-e-posicionamento.md` | Apoios, circulação e elenco coerentes em todas as cenas ativas |
| 2 | `02-linha-de-producao.md` | Robôs trabalhando e rádios de telecomunicação circulando na esteira |
| 3 | `03-reuniao-e-star.md` | Sala recomposta, preparação com NPC e apresentação visível antes do silêncio |
| 4 | `04-fase-5-plano-de-carreira.md` | Fase com retrospectiva, desejo de efetivação e escolha de área |
| 5 | `05-abertura-e-encerramento.md` | Menu e perguntas finais com Ana no escritório |

A auditoria de cenas vem primeiro. Linha de Produção e Sala de Reuniões têm
composição própria nas specs 02 e 03; a spec 01 define a verificação comum.
O fundo de escritório das telas de abertura e fim só é montado depois de
corrigidos os apoios dessa cena.

## Fronteiras de implementação

Arte escreve em `scripts/pixelart/cenarios.py` e `props.py`; poses e animações
humanas em `personagens.py`. UI e conteúdo escrevem em `src/**` e nos roteiros.
Nenhuma frente de arte resolve coordenada alterando `src/**`, e nenhuma frente
de UI corrige um móvel editando `scripts/**`. A integração revisa os dois lados
com a mesma prévia, em sequência quando os arquivos forem compartilhados.

Novos assets ou estados exigem contrato explícito antes de serem consumidos:
manifest, tipos, tokens, store e persistência, conforme o caso. Não pressupor
que um PNG novo anime sozinho: sprite humano já tem sondagem de tiras; ambiente
animado precisa de integração própria. O fallback continua obrigatório.

Atualizar ADRs e roteiros afetados na implementação, registrando as mudanças
acima sem apagar as decisões antigas. O título atual, **A história da Ana**, é
mantido; criar um novo nome de jogo não faz parte deste pedido.

## Registro da implementação

- Cenários regenerados e chão reexportado; folhas de contato e prévias abertas.
- Linha de produção recebe rádios em movimento contínuo e braços robóticos com
  ciclos de repouso/alcance e estado estático legível com movimento reduzido.
- Sala de reunião foi recomposta sem a mesa central; Marcos prepara Ana, o
  puzzle pratica STAR e a apresentação mostra o resumo antes da pausa.
- Fase 5 separa a conversa inicial sobre o contrato da reflexão final após
  caderno e grade. Ana quer ser efetivada e considera a área em que quer crescer.
- Abertura e perguntas finais usam o escritório, com Ana em pose de trabalho;
  as perguntas cobrem visibilidade, direção de carreira e fatores externos.
- `npm.cmd run typecheck` e `npm.cmd test`: aprovados; 388 testes passaram.

## Entrega verificável

- [x] Cada spec registra o comportamento implementado e a evidência de aceite.
- [x] `npm run typecheck` e `npm test` verdes, com a suíte inteira.
- [x] Após cenário: `python scripts/gerar_arte.py`, `python scripts/exportar_chao.py`
      e `python scripts/previa_de_cena.py`.
- [x] Após coordenada: regenerar prévias. Abrir folhas de contato e prévias
      afetadas; registrar os problemas encontrados e corrigidos.
- [ ] Conferir no navegador movimento, camadas, clique e texto. Prévias estáticas
      não validam animação nem transição entre apresentação e pausa.
- [ ] Recarregar a aba após gerar PNGs para limpar o cache de falhas de `Imagem`.

As imagens e o navegador são verificações da futura implementação. Para esta
entrega documental, o aceite é cobertura do pedido, dependências explícitas e
critérios executáveis, além das duas verificações obrigatórias do repositório.
