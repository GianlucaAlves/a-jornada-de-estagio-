# v2.3 / Auditoria visual e escopo da nova rodada

Esta rodada responde à avaliação do jogo em execução: ainda há objetos sem apoio, retratos que não parecem os personagens, pouca vida fora da produção e uma reunião cuja apresentação não se entende. **Estado: análise e specs; implementação pendente.** A declaração de aceite da v2.2 não vale como prova visual destes pontos.

## Como a auditoria foi feita

Foram abertas as prévias compostas de cada cena ativa, as folhas de cenário, personagens e retratos e o PNG do mapa. As posições foram cruzadas com `src/domain/content/bloco*.ts`, `src/ui/Cena.tsx`, `src/ui/PausaBloco4.tsx`, `src/ui/Mapa.tsx` e os geradores. A prévia atual desenha **uma Ana em cada parada simultaneamente**, inclusive hotspots que aparecem em momentos diferentes. Portanto, cópias de Ana e encontros entre estados incompatíveis são limitações da ferramenta; apoios de objetos e conflitos com móveis continuam achados úteis. As animações e a sequência real ainda precisam ser vistas no navegador.

## Achados por cena ativa

| Cena | Achado observável | Correção a especificar |
|---|---|---|
| Escritório, fases 1–3 | O monitor interativo à frente da divisória parece suspenso acima/atrás do tampo; notebook, monitor e mesa usam âncoras diferentes. Na fase 2, o certificado aparece vertical no vão da divisória, sem mesa ou suporte visível. | Definir superfícies de apoio, medir pixels opacos e redesenhar/posicionar cada objeto sobre uma delas. Revisar também a cópia da mesa nas três fases. |
| Cafezinho, fase 2 | Máquina isolada à esquerda, balcão grande pouco usado, notebook aberto no balcão sem relação visual com uma pessoa usando-o. A área de conversa parece vazia quando só os NPCs da trama estão presentes. | Reorganizar máquina, xícaras e bancada como uma estação de café; pôr pessoas decorativas realizando ações pequenas, sem bloquear Bianca, Rafael ou os cliques. |
| Cafezinho, fase 6 | Decoração de festa existe, mas o elenco interativo fica enfileirado e imóvel, sem relação com as mesas e os copos. | Variar poses e pequenos grupos, preservando a ordem dos diálogos da festa. |
| Linha de Produção, fase 3 | Rádios e robôs dão leitura clara de produção. O `b3-monitor` surge no corredor/na frente baixa da esteira e o relatório aparece no chão, ao lado da caixa. | Conservar o ciclo da esteira; fixar painel em console/suporte e relatório em prancheta, bancada ou caixa com superfície visível. |
| Sala de Reuniões, fase 4 | Três pessoas em bloco de costas parecem uma peça única; cadeiras, projetor, atril e telão não formam uma frente de apresentação clara. A plateia é um hotspot que some, não uma ação legível. O teste da caixa de diálogo mede 43% de cobertura do hotspot da TV. | Reprojetar composição e assentos individualmente; storyboard da preparação, fala, reação e saída, com texto visível durante o diálogo. |
| Outra Área, fase 5 | Caderno e grade são grandes peças soltas sobre uma cena muito carregada de telas; a grade parece erguida diante da mesa e a Bianca da prévia pode coincidir com paradas da Ana. | Criar um posto de revisão com caderno e grade em superfícies explícitas; simplificar o fundo perto dos focos e verificar cada estado narrativo isolado. |
| Mapa | O fundo é uma fachada abstrata com luzes; não se reconhece um mapa ou orientação espacial. | Criar planta simplificada do prédio, com rotas e zonas que sustentem os slots sem revelar lugares bloqueados. |

As imagens de Sala de Treinamento, Laboratório e Innovation ainda estão em `docs/arte`, mas esses lugares não estão no manifest das cenas ativas. Sua prévia antiga não deve ser usada como evidência de aceite; ativos sem uso só entram se uma rota real os consumir. A verificação inicial da implementação deve listar todos os pares `(lugar, fase)` alcançáveis e detectar arquivos órfãos.

## Achados que atravessam cenas

- A folha de retratos mostra muitos rostos com a mesma forma; as diferenças declaradas no `Corpo` não se traduzem de modo convincente. Tiago e Marcos têm barba pintada em faixas que parecem deslocadas do maxilar. Cláudia e Bianca exigem comparação lado a lado com os sprites para corrigir cabelo, roupa e leitura da personagem sem recorrer a estereótipos de gênero.
- `PausaBloco4.tsx` desenha mesa, silhuetas, notebook e um novo retângulo de telão em coordenadas que não correspondem à sala atual. A cena muda de geometria após a apresentação; essa é uma causa verificável da animação confusa.
- `previa_de_cena.py` não mostra estados narrativos nem camadas de UI. O teste de chão valida pés humanos, mas não prova apoio de computador, papel ou painel. A próxima rodada precisa de prévias por estado e uma verificação de apoio objeto–superfície, mais observação no navegador.

## Ordem e documentos

1. [01-apoios-e-cenarios.md](01-apoios-e-cenarios.md): apoio físico e composição por cena.
2. [02-personagens-e-retratos.md](02-personagens-e-retratos.md): identidade visual do elenco.
3. [03-reuniao-e-apresentacao.md](03-reuniao-e-apresentacao.md): refazer a reunião inteira e sua sequência.
4. [04-vida-nos-ambientes.md](04-vida-nos-ambientes.md): pessoas e atividade ambiental.
5. [05-dialogos-e-autoconhecimento.md](05-dialogos-e-autoconhecimento.md): voz, humor e progressão interna da Ana.
6. [06-mapa-legivel.md](06-mapa-legivel.md): fundo reconhecível para a navegação.

O pedido autoriza rever cenários, retratos e diálogos. Preservar os fatos estruturais da história: Ana quer ser efetivada, o resultado só chega na fase 6, o relatório precede a reunião, STAR organiza a apresentação, e o silêncio posterior conserva avanço manual. `docs/biblia-de-arte.md` rege escala, paleta, sombra, contraste e o processo de olhar. Atualizar roteiro e ADRs quando a implementação fixar a nova versão; não reescrever fatos por causa de um prop.

## Porta de aceite da rodada

- [ ] Capturas por estado de todas as cenas ativas, com UI, Ana e NPCs nas posições daquele momento; a ferramenta não repete uma Ana por hotspot na imagem de aceite.
- [ ] Lista de todos os objetos interativos e decorativos com superfície de apoio identificada; revisão ampliada de contato, sombra e ordem de camadas.
- [ ] Comparação de cada NPC: sprite, retrato e cena com diálogo aberto, inclusive barba e penteado.
- [ ] Reunião observada do começo ao fim por alguém que não implementou a sequência: consegue dizer quem apresenta, o que foi apresentado e por que a sala esvazia.
- [ ] Movimento visto em vídeo comprimido, em escala real e com `prefers-reduced-motion`; personagens decorativos não capturam clique.
- [ ] `python scripts/gerar_arte.py`, `python scripts/exportar_chao.py` depois de cenário, `python scripts/previa_de_cena.py`, folhas e prévias abertas; `npm run typecheck` e `npm test` verdes.

Estas caixas são trabalho futuro. O documento registra achados visuais, não valida as correções antes de serem desenhadas e testadas.
