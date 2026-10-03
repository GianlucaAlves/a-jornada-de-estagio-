# A Jornada do Estágio — mudanças e conferência

## A1 — Itens e Habilidades

Barra opaca de 151 px (13,98% de 1080p), três slots de objetos e nove de selos.
A cena tem uma área própria acima da barra, preservando a escala 4× e as
coordenadas do piso. Objetos têm rótulos curtos, descrição contextual e sinal
de ganho; habilidades usam emblemas redondos, não são arrastáveis e pousam na
conquista. Clicar num selo mostra sua frase dentro da própria zona. Na
retrospectiva, o caderno ainda permite iniciar a leitura das habilidades.
No final, as conexões esvaziam os objetos; a zona de itens sai e os selos ficam
acesos. A corrente de proatividade permanece como motivo do convite.

Conferir: começar no Bloco 1, observar slots vazios, conquistar uma habilidade,
abrir sua frase, percorrer os selos no Bloco 5 e executar as quatro conexões no
final. Testes da barra, painel, revelação e travessia narrativa foram executados.

## A2 — Identidades

Ana ciano, Rafael azul, Cláudia vermelho, Tiago roxo, Bianca verde, Marcos âmbar.
As mesmas definições geram sprites, animações e retratos. Silhuetas existentes
distinguem blazer e pin, camisa e cordão, coque e braços cruzados, moletom e
barba, óculos e cardigã, camiseta e post-it. Figurantes e plateia usam neutros;
figurantes têm contorno menos contrastado. Ana conserva o ciano na versão futura.

Conferir: `docs/arte/contato-personagens.png`, `contato-retratos.png` e Cafezinho
com festa. Folhas abertas após a geração; não foi necessário tint CSS nem
redesenho provisório das silhuetas.

## A3 — Sala de Reuniões

A barra vermelha era **faixa intencional de evento**, gerada por
`props.faixa_pendurada`, e não um defeito de render. Foi deslocada e recebeu
«Innovation Week» em texto legível. Título e faixa ficam em bandas separadas.
As quatro células STAR aparecem vazias antes da apresentação; os quatro nós
preenchem os resumos cumulativamente e o quadro completo permanece ao final.
Plateia em duas fileiras, com espaço entre os corpos; cadeiras permanecem na
pausa. Marcos foi colocado à direita, no grupo visual de preparação da Ana.

Conferir: entrada do Bloco 4, quatro avanços no diálogo do atril, pausa e saída
da plateia. Piso exportado novamente e prévia composta aberta. Os testes de
integridade e geometria reprovaram uma primeira posição de Marcos, corrigida
antes de avançar.

## A4 — Pensamentos

Seis monólogos próprios, conforme o texto autorizado na especificação. Selo
temporal → reflexão → liberação dos hotspots. `reflexaoVista` é salvo por bloco;
save anterior sem esse campo continua válido. Clique ou seta direita avança;
«Pular reflexão» ou Escape termina. «Pensamento» reabre. Retrato, itálico,
borda tracejada e escurecimento com Ana em destaque distinguem o monólogo.
O gancho aparece somente quando solicitado, como fala opcional final, pois o
projeto não tem tela privada de apresentador. Perguntas finais existentes
foram preservadas: já tratam de escolhas e competências sem repetir os ganchos.

Conferir: entrar em cada bloco, pular, voltar pelo mapa e reabrir manualmente.
Os testes cobrem sequência, bloqueio, flag de conclusão e textos distintos.

## M1 — Ana

Entradas específicas por cena, com Ana ao centro da festa final. As poses reais
encolhida, neutra e confiante já existentes dão a evolução; o crachá do evento
acompanha as poses confiante e apresentando. Sombra sólida no PNG compartilha
a linha do pé, preservando o contrato geométrico e evitando sombra dupla em CSS.

Conferir: comparar Blocos 1 e 6; verificar piso, entrada e paradas em cada cena.

## M2 — Hierarquia e legibilidade

Saída secundária em 22 px, título sobre fundo opaco, legenda em fundo opaco e
22 px. Tipografia e cores continuam centralizadas; pares branco/fundo e apoio/
fundo têm contraste superior a 4,5:1. Fonte de terminal na navegação, títulos
e barra aproxima a UI da grade da arte; diálogos e descrições mantêm a fonte
proporcional. Bordas secundárias de 2 px seguem a nova especificação, com
exceção registrada na bíblia. Cantos menores na navegação e no título,
contornos de interação e divisórias mais fortes preservam a leitura.

## M3 — Produção

Esteira, rádios, dois robôs e equipamentos na metade direita já estavam
implementados no estado recebido; foram preservados. O relatório em clipboard
ganhou contorno persistente e legenda. Movimentos respeitam redução de animação.

## B1, B2 e B3

Selo de tempo por bloco, substituível por `Cena.seloTempo`. Progresso discreto
de conversas do bloco, sem contar releituras. Respiração dos NPCs e vapor da
cafeteira existentes foram preservados. Não há sistema de áudio no projeto;
nenhum som foi acrescentado.

## Arte pendente

- Expressões faciais específicas para os seis monólogos. O retrato atual segue
  a pose de cada bloco, mas não possui seis expressões próprias.

## Verificação reproduzível

`npm run typecheck` e `npm test` verificam tipos e suíte completa.
`python scripts/gerar_arte.py`, `python scripts/exportar_chao.py` e
`python scripts/previa_de_cena.py` produzem assets e prévias.
`node scripts/verificar_jornada.mjs` usa o Playwright já disponível no ambiente
para ensaiar as seis entradas, a retrospectiva e o final em 1920×1080; Vite deve
estar ativo em 5175, ou ser indicado por `JORNADA_URL`. Capturas em
`docs/arte/jornada/`.

Conferência final: typecheck aprovado, 388 testes aprovados em 21 arquivos e
ensaio de navegador aprovado em 1920×1080. O ensaio cobre bloqueio, releitura,
descrições contidas na barra, movimento da esteira, STAR cumulativo, nove selos
e saída dos itens. Folhas de contato, prévias compostas e capturas foram abertas.

## Descobertas

Nenhuma mudança fora do escopo narrativo foi aplicada. Os scripts de captura
e screenshots que já estavam sem rastreamento foram preservados.
