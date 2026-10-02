# v2.2 / Spec 01 — Cenários e elenco: cada coisa no seu lugar

**Leia antes:** spec 00, bíblia de arte (§3, §4, §7 e §8),
`src/ui/geometriaDeCena.ts`, `src/ui/Cena.tsx` e `src/domain/content/bloco*.ts`.

**Arte:** `scripts/pixelart/cenarios.py`, `props.py` e PNGs gerados.
**Integração:** coordenadas de `src/domain/content/bloco*.ts`, geometria e testes
de cena quando necessários. As duas frentes não compartilham arquivos de escrita.

## O problema

O dono relata computadores flutuando sobre mesas e personagens mal posicionados.
Também pede mais elementos para que os ambientes tenham vida. Acrescentar
decoração antes de resolver apoio e circulação multiplica os defeitos.

O teste de chão atual verifica figuras humanas; um monitor apoiado no ar pode
passar. A inspeção precisa incluir o cenário montado com objetos interativos,
Ana e NPCs, não apenas o PNG de fundo.

## O que entregar

### 1. Auditoria de todas as cenas ativas

Revisar Escritório nas fases 1, 2 e 3, Cafezinho nas fases 2 e 6, Linha de
Produção na fase 3, Sala de Reuniões na fase 4 e Outra Área na fase 5. Conferir
também o elenco da festa. Lugares antigos sem uso no fluxo atual não recebem
redesenho nesta rodada.

Antes de editar, montar uma tabela de achados por cena: objeto ou personagem,
problema visível, superfície ou ponto esperado e correção proposta. Incluir
posição de entrada e todas as paradas da Ana, com barra de itens e painel de
skills visíveis. O escritório recorrente precisa funcionar nas três fases.

### 2. Apoio físico e profundidade

Monitor e notebook têm pé ou base tocando o tampo, com perspectiva compatível.
Papel, caderno, caneca e telefone apoiam na mesma superfície. Não corrigir apenas
o centro da caixa: margens transparentes do PNG também afetam o apoio visível.

Móvel de chão e personagem têm sombra de contato e base sobre piso livre.
Personagem em pé não ocupa tampo, cadeira ou esteira. Pessoa sentada exige pose
e cadeira coerentes; deslocar um sprite em pé para trás da mesa não produz essa
pose. Um objeto interativo existe uma vez: cenário deixa seu lugar reservado,
sem uma segunda cópia pintada atrás.

Corrigir composição e coordenadas como um par. As posições atuais não são
intocáveis: podem ser substituídas se a circulação e os testes forem revalidados.
Ana chega ao alvo sem esconder a pessoa ou o objeto com que interage.

### 3. Mais vida com função visual

| Ambiente | Elementos a explorar na composição |
|---|---|
| Escritório | Postos de trabalho completos, divisórias, documentos, telefone, planta e luz de trabalho |
| Cafezinho | Bancada equipada, café, utensílios e objetos de uso cotidiano; festa com adereços próprios |
| Linha de Produção | Estações, robôs, rádios, área de inspeção e sinalização; detalhamento na spec 02 |
| Sala de Reuniões | Telão, assentos ocupados, atril e identidade de Innovation Week; detalhamento na spec 03 |
| Outra Área | Postos completos de outro time, caderno e grade apoiados, identidade distinta do Escritório |

Cada cena recebe elementos de uso cotidiano distribuídos nos três planos da
bíblia, mantendo contraste, paleta e corredores. Densidade não é uma quantidade
fixa de props: cada acréscimo precisa tornar o lugar reconhecível sem disputar
atenção com o alvo da interação. Decoração não vira hotspot sem uma resposta
prevista no conteúdo.

## Critérios de aceite

**Implementado:** cenários ativos regenerados; escritório, produção, reunião,
Outra Área e personagens foram conferidos nas prévias compostas. A geometria e
o piso passam na suíte. A sala de reunião perdeu a mesa que invadia a plateia;
os NPCs dessa fase agora entram conforme a sequência. A prévia continua sendo
estática e não substitui a revisão de interações no navegador.

- [ ] Relatório cobre todas as combinações de lugar e fase acima, com achados
      antes e correções depois.
- [x] Nenhum equipamento flutua; apoios são visíveis na imagem montada.
- [x] Nenhum pé fica sobre mobiliário, e Ana não encobre o alvo ao parar.
- [ ] Entradas, paradas, hotspots e overlays foram conferidos juntos; cliques
      continuam largos e acessíveis por teclado.
- [ ] Escritório, Cafezinho e Outra Área têm mais vida e identidades distinguíveis.
- [x] Folhas e prévias regeneradas e abertas, incluindo todas as fases que
      compartilham cenário alterado; `chao.json` atualizado.
- [x] `npm run typecheck` e `npm test` verdes, incluindo chão e geometria.

O teste de chão e a prévia continuam necessários juntos. Não ampliar o mapa de
piso para chamar mesa de chão, nem reduzir sprites para esconder conflitos.
