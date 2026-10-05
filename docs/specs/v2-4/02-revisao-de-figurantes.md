# Revisão de figurantes e continuidade — 05/10/2026

O aceite anterior não identificou problemas de anatomia e de leitura dos
figurantes. Recorte sem diferença de fundo e pé sobre piso são necessários,
mas não demonstram que a pose e o objeto fazem sentido. Esta revisão exige
corpo completo desenhado para a atividade, gesto identificável e inspeção
da composição com o elenco real, além das verificações geométricas.

## Critérios por ambiente e fase

- Escritório, fases 1, 2 e 3: colega realmente sentado, cadeira atrás do
  corpo, notebook apoiado no tampo, mãos sobre teclado. Não cortar um sprite
  em pé para simular uma pessoa sentada. Separar monitor, rosto e braços.
  Pequenos detalhes de trabalho devem sobreviver às três composições.
- Cafezinho, fase 2: dois figurantes sentados nas almofadas, joelhos dobrados
  e pés abaixo do assento. Um lê um livro reconhecível no colo; outro olha
  o celular. No balcão, o gesto é servir café, com recipiente e mão juntos,
  em vez de alternar uma mão sem contexto. Nada indefinido sobre o sofá.
- Produção, fase 3: além da esteira e dos robôs, incluir inspeção de uma
  amostra com bancada e ferramenta, identificação visual das peças e
  sinais de atividade coerentes com a operação. Preservar o painel clicável.
- Apresentação, fase 4: credenciamento com pessoa e prancheta, água e
  materiais organizados; plateia permanece sentada. Telas, faixa e palco
  continuam legíveis durante todas as falas.
- Outra área, fase 5: colega sentado no bench compartilhado, mãos sobre
  notebook, amostras organizadas e ferramentas apoiadas. Não inserir
  escrivaninha duplicada nem esconder membros sob telas mal posicionadas.
- Festa, fase 6: ocupantes do sofá têm atividade social própria, com gesto
  de conversa e copo; decoração e comida permanecem coerentes. As seis
  pessoas do roteiro conservam espaço e prioridade visual.

## Continuidade e mensagens

O painel da fase 3 continua acessível depois de entregar as anotações.
Cancelar, retornar do mapa ou retomar o save permite abri-lo por clique
direto. Reabrir não consome outro item, não repete XP e não rebaixa puzzle
resolvido. Testar o caminho real de entrega, cancelamento e retorno.

Eliminar as narrações automáticas de entrada que reapareciam depois das
reflexões. Manter o registro de visita, as pistas de hotspots e os ecos
de lugares concluídos. Cada uma das seis reflexões termina na própria cena,
sem uma segunda introdução aguardando por baixo.

## Verificação

Regenerar arte, exportar chão, gerar e abrir contato e oito prévias.
Inspecionar ambos os quadros de cada atividade e capturas do navegador.
Executar typecheck, suíte completa, build e auditorias de composição.

## Resultado da entrega

Critérios implementados nos seis blocos e oito combinações de fase/lugar.
Os rostos de quem trabalha no escritório e serve café foram afastados das
silhuetas do elenco e das paradas de Ana. O notebook do bench não é cortado
na borda do recorte. Livro, celular e copos possuem mãos e apoios definidos.

- Typecheck e build de produção aprovados.
- Suíte completa: 375 testes aprovados em 22 arquivos, incluindo regressão
  da entrega das anotações, cancelamento e reabertura sem repetir XP.
- `node scripts/verificar_reabertura.mjs`: clique real com item, saída do
  desafio, reabertura, retorno do mapa e retomada após recarregar o save.
  As seis reflexões terminam sem narração automática pendente.
- `node scripts/verificar_refinamento.mjs`: 20 verificações de composição,
  XP, evolução, percurso, 720p e movimento reduzido.
- `node scripts/verificar_acabamento.mjs`: 85 falas, 26 pensamentos, oito
  cenas em quatro instantes e cinco evoluções, sem cortes de texto.
- 18 recortes ambientais verificados, incluindo ambos os quadros das
  atividades. Arte, chão e oito prévias regenerados; contato e prévias
  abertos, junto às capturas com o HUD e o elenco real.

Capturas da revisão: `docs/arte/v2-4/acabamento/galeria.html`.
Prova de reabertura e save: `docs/arte/v2-4/continuidade/verificacao.json`,
`reaberto.png` e `retomado.png`.
