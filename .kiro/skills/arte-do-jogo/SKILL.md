---
name: arte-do-jogo
description: Direção de arte e pipeline de pixel art do apresentacao_jogo. Use SEMPRE que a tarefa envolver sprite, cenário, item, paleta, animação de personagem ou interação de hotspot em cena. Carrega escala, paleta, anatomia, regras de animação e os erros já cometidos.
---

# Arte do apresentacao_jogo

**Leia `docs/biblia-de-arte.md` inteiro antes de escrever uma linha.** Este
arquivo é só o índice e o resumo operacional; a bíblia é a autoridade.

## As cinco regras que mais se quebram

1. **Escala 4x em tudo.** Cena `480x270`, personagem `50x84` (eixo em x=25,
   base em y=81), item `24x24`. Escala misturada faz cenário e personagem
   parecerem dois jogos colados.
2. **Vão transparente de 1px entre volumes que se encostam.** A dilatação do
   contorno o vira linha interna. Sem ele o braço derrete no torso — já
   aconteceu e a Ana ficou sem braços.
3. **Luz de cima-à-esquerda, sombra é UM passo na rampa.** Use
   `mais_escuro()` / `mais_claro()` de `paleta.py`.
4. **70% frio, 20% madeira, 10% acento.** Frio domina a área, quente domina a
   atenção. Toda cena precisa de uma planta, uma tela ligada e uma luz quente
   com poça no chão.
5. **Terminou = folha de contato OLHADA.** Quem desenha por coordenada não vê
   o que fez. Sprite que não foi visto não está pronto.

## Pipeline

```
python scripts/gerar_arte.py
```

Escreve `public/assets/**` e `docs/arte/contato-*.png`. Abra a folha de contato
e olhe. Depois rode `npm run typecheck` e `npm test`.

## Onde escrever

| Frente | Arquivo |
|---|---|
| props de cenário | `scripts/pixelart/props.py` |
| cenários e mapa | `scripts/pixelart/cenarios.py` |
| Ana e NPCs | `scripts/pixelart/personagens.py` |
| itens | `scripts/pixelart/itens.py` |
| interação de cena | `src/ui/**`, `src/domain/**`, `src/styles/**` |

`nucleo.py` e `paleta.py` são fundação compartilhada: leia à vontade, altere só
de forma aditiva e anote na bíblia.

## API que você já tem (não reinvente)

`Grade.segmento(x, y, "SsKKsssKKsS")` autoria por faixa de char — é ler o
desenho enquanto escreve. `retangulo`, `moldura`, `caixa_com_volume(rampa)`,
`dither(padrao=xadrez|esparso|denso)`, `degrade_v(tons)`, `colar`,
`colar_base(x_centro, y_base, prop)`, `deslocar(dx, dy)` para quadro de
animação, `contornar()`, `verificar_sprite(centro=, chao=)`,
`escrever_sprite`, `escrever_tira` (animação), `escrever_folha_de_contato`.

Ponto de partida da Ana: `scripts/pixelart/_ana_recuperada.py` tem as quatro
poses em grade `50x84` — com o contorno JÁ aplicado. Apague os `K` de borda
antes de regerar o contorno.
