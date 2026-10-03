# v2.3 / Spec 02 — Mesma pessoa na cena e no diálogo

**Depende:** auditoria 00 e spec 01 para enquadramento. **Leia:** bíblia de arte §5; `scripts/pixelart/personagens.py` e `retratos.py`; `src/assets/manifest.ts`; `src/ui/Dialogo.tsx`.

## Problema observado

Os retratos são produzidos a partir do mesmo `Corpo` dos sprites, mas compartilhar parâmetros não garante semelhança visível. Na folha atual, as faces têm construção quase igual, o cabelo de algumas pessoas muda de massa entre escalas e a barba de Tiago e Marcos parece uma faixa aplicada fora do contorno natural da face. Cláudia e Bianca não são reconhecidas de imediato em comparação com as figuras da cena; a leitura de gênero relatada pelo usuário deve ser tratada como falha de identidade visual dessas personagens, sem usar “cabelo comprido = mulher” como regra para todo o elenco.

## Referência antes do desenho

Montar uma ficha lado a lado para **Ana em cada fase**, Rafael, Cláudia, Tiago, Bianca e Marcos: sprite inteiro, cabeça ampliada só para análise, retrato de diálogo e captura de cena com o diálogo aberto. Para cada um, anotar cor e linha do cabelo, comprimento, franja, barba, óculos, tom de pele, roupa/gola e três marcas exclusivas. A ficha deve usar os PNGs realmente carregados pelo manifest, inclusive fallbacks quando ausentes; a ordem dos NPCs na folha não substitui identificação por nome.

| Personagem | Correspondência que precisa sobreviver à escala |
|---|---|
| Ana | Mesmo rosto e cabelo nas poses; postura muda ao longo da jornada, sem parecer outra pessoa no retrato. |
| Rafael | Cabelo e uniforme de trabalho reconhecíveis; rosto não confundível com Ana ou Marcos. |
| Cláudia | Coque/mecha grisalha e colete com camisa visíveis no retrato e no sprite; proporção de rosto e cabelo coerente com a personagem definida. |
| Tiago | Cabelo rente, barba cheia seguindo bochechas e mandíbula, moletom identificável. Boca e queixo continuam visíveis. |
| Bianca | Cabelo longo, óculos e cardigã verde aberto coerentes entre retrato e cena; rosto distinto de Tiago, sem sombra que leia como barba. |
| Marcos | Lateral raspada e barba curta **diferentes** da barba cheia do Tiago, camiseta quente e expressão própria. |

## Redesenho e integração

Rever especialmente `_barba`, `_mandibula`, `_cabelo`, `_cabelo_comprido` e a ordem de colagem em `retratos.py`. A barba deve nascer nas laterais da face, acompanhar a curva do maxilar e terminar no queixo; testar a borda opaca sobre fundo claro e escuro. Um bigode não deve apagar lábios ou criar um retângulo central. Rever a proporção de franja, volume lateral, orelhas e linha do pescoço. A pele não recebe sombras isoladas que pareçam pelos.

É permitido ajustar `Corpo` e arte específica do retrato quando necessário, mas não resolver tudo com um molde idêntico e troca de cor. Se um traço for exclusivo de uma personagem, deixar sua fonte canônica explícita para que mudanças futuras atualizem sprite e retrato juntos. Conferir `assetDoRetrato` para cada locutor; a pose atual da Ana não pode puxar o retrato de outra fase nem o PNG de outro NPC. A escala 4× e a caixa de diálogo continuam legíveis em transmissão comprimida.

## Critérios de aceite

- [ ] Cinco NPCs e todas as poses da Ana têm ficha visual nomeada, gerada com os mesmos assets usados no jogo.
- [ ] Em comparação lado a lado, uma pessoa que não viu o código associa cada retrato ao sprite correto sem ler a legenda; registrar confusões e corrigir antes do aceite.
- [ ] Tiago e Marcos têm barba anatomicamente ligada ao rosto, com formas distintas; Bianca e Cláudia são reconhecíveis como as personagens da cena.
- [ ] Nenhum personagem muda sem motivo de cabelo, óculos, pele, roupa ou traço facial ao abrir diálogo.
- [ ] Folha de contato e capturas de diálogo abertas após geração; verificar em tamanho nativo, escala do canvas e vídeo comprimido.
- [ ] Gerador sem avisos de eixo/base; manifest, typecheck e testes completos passam.
