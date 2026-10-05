# V2.4 — acabamento após inspeção da versão intermediária

Esta revisão completa o escopo de `00-refinamento.md`. O roteiro continua
intacto; os ajustes são de arte, composição, tempo de leitura e interação.

A revisão posterior de anatomia, atividades dos figurantes e cancelamento
do puzzle está em [02-revisao-de-figurantes.md](02-revisao-de-figurantes.md).
Ela substitui o aceite visual dos figurantes registrado abaixo: a medição
anterior não foi suficiente para avaliar poses e objetos na composição.

## HUD, falas e pensamentos

Manter lugar, época, nível e experiência na mesma coluna direita. Separar
navegação do avanço de fase. Medir os retângulos reais, incluindo as caixas
de fala e pensamento, em todos os nós do conteúdo. Texto completo deve caber
dentro da caixa, com piso de 22 px.

Na produção, reservar a faixa superior direita à fala para deixar o monitor
da linha visível. Na sala de reuniões, usar a faixa superior esquerda,
preservando televisão e palestrante. Nesses dois layouts, o nome do locutor
identifica a fala sem repetir um retrato; fonte de 24 px conserva a leitura.
As demais cenas mantêm o retrato em escala 4x e fonte de 28 px.

Aceite: nenhum botão sob o HUD; nenhum texto cortado; slide totalmente
visível durante a apresentação; pensamento sem transparência que confunda
texto e cenário. Conferir todas as falas, não apenas a primeira de cada fase.
As faixas laterais entram só por opacidade: deslocá-las para baixo durante
a entrada também cobria a cabeça de Cláudia, mesmo com o retângulo final correto.
Na reflexão, a faixa inferior substitui temporariamente o inventário para
que seus botões não ocultem os nomes de itens e habilidades.

## Experiência e evolução

Preservar cada recompensa numa fila, sem nova pontuação. A leitura do ganho
começa depois de fechar diálogo, narração, puzzle e entrega de item. Cada
ganho permanece 3,6 segundos. Conferir duas recompensas consecutivas depois
de quatro segundos com um modal aberto e a passagem entre cena e mapa.
O selo entra com pequeno crescimento dentro da própria moldura, totalmente
opaco desde o início. Medir também o selo durante a entrada: subir desde fora
do card e desaparecer por opacidade reproduzia o defeito relatado.

A evolução mostra preparação, punhos erguidos e novo figurino. A saída
aguarda o clique do apresentador: o temporizador anterior encerrava títulos
longos antes de haver tempo para observar. Movimento reduzido revela o título
e figurino completos imediatamente. Verificar as cinco passagens de nível.

A pasta dos níveis 3 e 5 integra o sprite, junto à mão e em proporção com o
corpo. Não sobrepor um ícone de inventário durante a caminhada ou a pose de
celebração. A sondagem das tiras precisa acompanhar o caminho atual: o estado
de uma pose anterior não autoriza exibir uma imagem ainda não carregada.

## Escritório e outra área

Eliminar mesas duplicadas. No escritório, o posto ocupa a pegada da mesa
original e reúne colega, cadeira, notebook e monitor auxiliar. Na outra área,
preservar o bench compartilhado e posicionar o colega sobre sua borda traseira,
com notebook apoiado; não acrescentar uma segunda escrivaninha. Cabeça, mãos,
teclado, tampo e cadeira devem formar um conjunto plausível.

Animar os dedos sem mudar a cor de pele ou apagar a planta da frente. O
primeiro quadro de cada recorte deve ser idêntico ao cenário; só o detalhe
animado muda. Inspecionar os dois quadros e a composição com Ana e os NPCs.

## Cafezinho e festa

Sofá vazio, com livro no assento. Figurante do balcão alterna gesto de beber,
com o cenário regenerado para cada pose: nunca reconstruir a parede copiando
uma coluna vizinha. Preservar uma única caneca e a silhueta original. Menu,
prateleira, plantas e recados ocupam superfícies reais. A festa mantém sua
vestimenta e luzes alternadas discretamente.

## Produção

Braços industriais com pedestal curto, ombro, cotovelo e garra identificáveis.
Quatro poses: recolher, baixar sobre a peça, levantar e retornar. Base fixa.
Espaçamento de 304 px entre estações acompanha o espaçamento dos rádios;
ciclo de oito segundos acompanha a esteira, com pequeno atraso entre gestos.
Conferir o encontro entre ferramenta e peça, além da silhueta em repouso.
Ferramentas, embalagem, quadro de controle e suportes não invadem o piso.

## Sala de apresentações

Uma única moldura física de televisão. O slide ocupa apenas a área útil,
sem borda branca adicional nem gráfico antigo aparecendo por baixo. Os quatro
passos STAR permanecem legíveis; a fala fica ao lado. Innovation Week deve
estar dentro do tecido vermelho, com margem vertical real. Conferir início,
todos os passos e estado final após a saída da plateia.

## Mapa e controles

Campus com costa em degraus, talude, água, árvores, praça com fonte, mesas
externas, bicicletário e pátio de antenas com técnico. Evitar textura densa
que pareça carpete e vasos de escritório ampliados. Miniaturas arquitetônicas
distinguem os lugares descobertos; lugares bloqueados permanecem anônimos.
O caminho horizontal é compartilhado, e cada ramal indica seu estado sem
repintar o caminho de outro destino. Ana usa o figurino do nível atual e
percorre a rota antes da entrada. Pictogramas autorais substituem emojis;
texto e contadores continuam sendo a indicação principal.
Fonte, água, luzes de antenas e tablet do técnico têm dois quadros discretos,
com base e caminhos imóveis e alternativa estática para movimento reduzido.

## Verificação de entrega

Regenerar PNGs, exportar chão e gerar prévias. Abrir folhas de contato,
prévias das oito combinações de fase/lugar e capturas do navegador. Registrar
quatro instantes por cenário, todas as falas e pensamentos, cinco evoluções,
XP em fila, movimento reduzido e viewport de 720p. Executar typecheck, suíte
Vitest completa e build de produção. Resultados ficam em
`docs/arte/v2-4/`, incluindo a auditoria em `acabamento/`.

## Resultado da revisão — 05/10/2026

Todos os pontos acima foram implementados e conferidos. A faixa foi
centralizada sobre a TV, e a auditoria mede o texto do evento para impedir
que uma fala esconda suas primeiras letras. O passo destacado do slide usa
texto escuro sobre azul para conservar contraste.

- `npm run typecheck`: aprovado.
- `npm test`: 374 testes aprovados em 22 arquivos, incluindo conteúdo,
  geometria, chão, presença e diálogos.
- `npm run build`: aprovado.
- `node scripts/verificar_refinamento.mjs`: 20 verificações de composição,
  fila de XP, evolução, percurso, 720p e movimento reduzido; sem imagens
  ausentes ou erros de execução no navegador.
- `node scripts/verificar_acabamento.mjs`: 85 falas e 26 pensamentos
  verificados sem corte de texto; oito combinações de fase/lugar em quatro
  instantes; cinco evoluções verificadas em pose e figurino final.
- `python scripts/verificar_recortes.py`: 18 recortes conferidos; quadro
  inicial coincide com o cenário e quadro alternativo possui mudança real.
- Arte regenerada, chão exportado e oito prévias compostas novamente.
  Folhas de contato, prévias e capturas do navegador abertas para inspeção.

A galeria principal está em `docs/arte/v2-4/galeria.html`. A galeria filtrável
e as medidas da inspeção estão em `docs/arte/v2-4/acabamento/`. As prévias de
cena mostram Ana em todas as paradas para verificar a geometria; as capturas
do navegador mostram a composição efetiva com uma única protagonista.
