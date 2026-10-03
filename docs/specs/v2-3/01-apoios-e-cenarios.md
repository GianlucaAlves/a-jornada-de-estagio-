# v2.3 / Spec 01 — Objetos apoiados e cenas compostas

**Depende:** auditoria 00. **Leia:** bíblia de arte §§4, 7 e 8; `scripts/pixelart/cenarios.py`, `props.py`, `itens.py`; `src/domain/content/bloco*.ts`; `src/ui/Cena.tsx`; `scripts/previa_de_cena.py`.

## Problema e causa

A v2.2 verificou o pé dos personagens, mas declarou resolvidos objetos que continuam flutuando. O desenho de fundo, o sprite interativo e a coordenada do hotspot são três fontes separadas; o teste de chão cobre apenas uma delas. O monitor do escritório, o certificado, o painel e o relatório da linha mostram por que cada par precisa ser revisado montado.

## Contrato de composição

Para cada objeto visível, registrar: `(lugar, fase, estado)`, id do asset, caixa dos **pixels opacos** do PNG, âncora usada pela UI, superfície física, linha de contato, ordem de camada e zona de clique. A superfície pode ser tampo, parede, prancheta, cavalete ou chão; deve estar desenhada antes de posicionar o objeto. Sombra de contato ou fixação torna a ligação visível. Itens coletáveis devem desaparecer da cena ao serem coletados sem deixar duplicata pintada no fundo.

Não usar centro da caixa transparente como evidência de apoio. O pé/base opaca deve encontrar a superfície em toda escala de exibição do canvas. Não resolver deslocando o hotspot para uma superfície que o sprite não toca. Se o suporte estiver errado, redesenhar o cenário ou o objeto e rever a coordenada juntos.

| Cena e alvo | Alteração exigida |
|---|---|
| Escritório B1/B2/B3 — `b1-notebook`, `b1-tela`, `b2-mesa`, `b2-tela` | Notebook e monitor devem ocupar uma mesa de trabalho inequívoca, com pés/base sobre o tampo. Distinguir telas decorativas ao fundo dos dispositivos clicáveis à frente. Verificar que o monitor não parece pousar na divisória nem avançar para o vazio. Reutilizar a mesma geometria do posto nas três fases. |
| Escritório B2 — `b2-certificado` | Mostrar certificado deitado sobre a mesa ou preso em suporte/mural existente. O hotspot fica sobre a própria peça, sem papel vertical suspenso no vão entre móveis. Sua aparição após o puzzle não desloca a mesa. |
| Cafezinho B2/B6 — máquina e notebook | Máquina ligada à bancada, com saída, copo e bandeja na mesma estação. Notebook da Bianca pousa no balcão, orientado para ela. Balcão e mesas laterais têm objetos usados por alguém, sem multiplicar objetos interativos. |
| Linha de Produção B3 — `b3-monitor` e `b3-relatorio` | Painel instalado em suporte ou console à altura de leitura, fora da faixa de caminhada e da esteira. Relatório apoiado em prancheta/bancada ou preso a uma caixa que de fato ofereça superfície; jamais folha vertical solta no piso. Manter rádios e robôs da v2.2 como referência de escala e ritmo. |
| Outra Área B5 — `b5-caderno`, `b5-grade` | Criar um posto de revisão: caderno aberto no tampo, grade sobre mesa, quadro ou suporte nomeável. Ambos permanecem legíveis quando Bianca e Ana ocupam suas posições reais. Reduzir a competição de telas atrás dos dois alvos. |
| Cafezinho B6 e outras cenas compartilhadas | Revalidar apoios ao trocar a variante do fundo e quando NPCs entram ou saem; decoração nova não cobre objeto necessário nem porta. |

## Verificação que faltou na rodada anterior

Estender `scripts/previa_de_cena.py` ou criar ferramenta equivalente para produzir **quadros por estado alcançável**, com apenas uma Ana, NPCs realmente visíveis, itens já coletados ocultos, cenários de festa e camadas de UI relevantes. Separar quadro de auditoria de todos os pontos de parada, que continua útil como mapa de conflito, do quadro de aceite visto pelo público. Para cena animada, exportar quadros representativos e conferir a execução em navegador.

Criar checagem de geometria dos apoios declarados: base opaca dentro da faixa do tampo/suporte com tolerância de um pixel de arte; objeto de chão dentro de piso livre; sem interseção indevida com área de passagem e hotspots. O teste não deve inferir “piso” pela cor de tampo. Corrigir `chao.json` após mexer em cenário e inspecionar o resultado manualmente.

## Critérios de aceite

- [ ] Tabela de apoios cobre todos os hotspots e props maiores das oito combinações ativas listadas na auditoria, inclusive entrada e paradas de Ana.
- [ ] Monitor, notebook, certificado, relatório, painel, caderno e grade tocam suportes plausíveis em imagens compostas; nenhuma base opaca termina no ar.
- [ ] O mesmo escritório mantém postos e circulação coerentes em B1, B2 e B3; Cafezinho comum e festa mantêm a mesma planta.
- [ ] Nenhum NPC ou Ana cobre o alvo no ponto de parada, pisa em mobiliário ou perde contraste com o fundo.
- [ ] Hotspots e saída continuam acessíveis por mouse e teclado, com respostas em todos os estados; props de fundo não criam alvos mortos.
- [ ] Prévias por estado e teste de apoio pegam pelo menos os quatro defeitos citados acima antes de corrigir a arte; capturas posteriores comprovam a correção.
- [ ] Gerador, exportação do chão, prévias, abertura das imagens, typecheck e suíte inteira concluídos depois da mudança.
