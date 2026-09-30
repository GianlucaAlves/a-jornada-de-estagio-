# Objetos interativos pendentes de arte

Escrito pela frente de **interação de cena** para a frente de **cenários**.
Fonte: `docs/specs/04-interacao-de-cena.md` §2 e `docs/specs/01-cenarios.md` §3.

## Por que estes objetos são sprite separado

Objeto que é hotspot recebe **aura no hover** — um contorno pixel-perfeito que
segue o alpha do PNG. Isso só funciona se o objeto for um arquivo próprio com
transparência. Se ele estiver pintado dentro do cenário, a única forma de
destacá-lo seria um retângulo por cima, que é exatamente o que acabou de sair
da tela.

Portanto, para cada item da lista: **o cenário deixa o lugar dele vazio** (a
mesa existe, o notebook não; a parede existe, o monitor não), e o PNG entra
sozinho em `public/assets/objetos/`.

Enquanto o PNG não existir, a UI cai no placeholder geométrico **sem rótulo** —
forma sólida com contorno, que já recebe aura e já mostra o nome na linha do
rodapé. A apresentação está navegável hoje; a arte melhora, não destrava.

## A lista

Tamanhos em **px de tela**. Divida por 4 para a grade de arte (escala única de
4x, bíblia §2.1). Todos são múltiplos de 4 e há teste que reprova quem não for.

| assetId | arquivo | tela | grade de arte | âncora | onde aparece |
|---|---|---|---|---|---|
| `objeto-notebook` | `objetos/notebook.png` | 160x112 | 40x28 | base | Escritório B1 — tela de login na mesa da Ana |
| `objeto-notebook-aberto` | `objetos/notebook-aberto.png` | 160x112 | 40x28 | base | Sala de Treinamento B2, Sala de Reuniões B4, Escritório B5 |
| `objeto-monitor-ligado` | `objetos/monitor-ligado.png` | 192x144 | 48x36 | centro | Escritório B1 ("Tela aberta"), Laboratório B3 ("Monitor do log") |
| `objeto-maquina-cafe` | `objetos/maquina-cafe.png` | 128x192 | 32x48 | base | Cafezinho B2 |
| `objeto-quadro-branco` | `objetos/quadro-branco.png` | 288x192 | 72x48 | centro | Laboratório B3 |
| `objeto-mural-postits` | `objetos/mural-postits.png` | 320x224 | 80x56 | centro | Innovation B3 |
| `objeto-tv-grande` | `objetos/tv-grande.png` | 384x240 | 96x60 | centro | Sala de Reuniões B4 |

Os ids já estão declarados em `src/assets/manifest.ts`. **Não é preciso tocar em
`src/`**: dropar o arquivo com o nome certo substitui a arte.

## O que a âncora exige de você

- **`base`** — a arte é ancorada pelo CENTRO-BASE. A última linha de pixel
  opaco é a que encosta na superfície, e é aí que vai a sombra de contato
  (bíblia §4.4). Sobra de pixel transparente embaixo faz o objeto flutuar.
- **`centro`** — coisa de parede, ancorada pelo centro geométrico. Centralize o
  conteúdo dentro da grade: 2 px de assimetria deslocam o objeto na parede.

## Dois deles pedem tira de ambiente

A UI escolhe tira de animação sozinha, pelo nome do arquivo (bíblia §6.4):
`<id>-idle.png` com **2 quadros** lado a lado. Se o arquivo existir, a UI usa;
se não existir, mostra o quadro parado sem quebrar. Não precisa avisar ninguém.

- `objeto-monitor-ligado-idle.png` — cursor piscando. É a "tela ligada"
  obrigatória da bíblia §3 em duas das seis cenas.
- `objeto-tv-grande-idle.png` — o diagrama da entrega do Bloco 4 pulsando um
  tom, ou nada: é o menos importante da lista.

Os dois quadros precisam ter **a mesma largura**, senão o passo do `steps()`
desalinha e a animação treme.

## Dois objetos que NÃO estão nesta lista de propósito

- **Certificado na tela** (Sala de Treinamento B2) usa `item-certificado-degree`.
- **Entregar** (Sala de Reuniões B4) usa `item-projeto-entregue`.

Os dois hotspots concedem esses itens, e os itens já têm sprite. Reaproveitar
evita inventar objeto de cenário para mostrar na parede o que a Ana está
prestes a receber — e mantém a arte do item e a do cenário contando a mesma
história.

## Onde os hotspots estão, em % do canvas

Para compor sabendo onde deixar espaço vazio. `pos` é a âncora da arte;
`parada` é onde a Ana fica ao interagir (lateral, nunca em cima).

| cena | hotspot | pos | parada |
|---|---|---|---|
| escritorio/B1 | notebook | 24, 72 | 36, 76 |
| escritorio/B1 | notebook-aberto | 24, 52 | 36, 76 |
| escritorio/B1 | tiago | 42, 70 | 54, 75 |
| escritorio/B1 | claudia | 58, 68 | 46, 75 |
| escritorio/B1 | rafael | 72, 74 | 60, 77 |
| cafezinho/B2 | maquina-cafe | 16, 70 | 28, 76 |
| cafezinho/B2 | bianca-cafe | 40, 72 | 52, 75 |
| cafezinho/B2 | rafael-cafe | 62, 70 | 50, 76 |
| sala-treinamento/B2 | notebook-trilha | 30, 72 | 42, 77 |
| sala-treinamento/B2 | conclusao-trilha | 42, 52 | 30, 77 |
| sala-treinamento/B2 | bianca-trilha | 58, 68 | 46, 76 |
| laboratorio/B3 | monitor | 26, 48 | 38, 74 |
| laboratorio/B3 | tiago | 52, 70 | 40, 76 |
| laboratorio/B3 | quadro-branco | 68, 42 | 52, 77 |
| escritorio/B3 | claudia | 58, 70 | 46, 76 |
| innovation/B3 | marcos | 30, 72 | 42, 77 |
| innovation/B3 | mural | 54, 34 | 58, 77 |
| innovation/B3 | rafael | 70, 72 | 58, 76 |
| sala-reunioes/B4 | tv | 50, 30 | 50, 76 |
| sala-reunioes/B4 | entrega | 50, 52 | 37, 76 |
| sala-reunioes/B4 | claudia | 34, 70 | 46, 75 |
| sala-reunioes/B4 | bianca | 18, 68 | 30, 76 |
| sala-reunioes/B4 | notebook | 72, 74 | 60, 77 |
| escritorio/B5 | notebook | 24, 72 | 36, 76 |

A Ana entra em toda cena em **(6, 76)** e nunca nasce sobre um hotspot — há
teste para isso.

Três restrições que o cenário herda destas posições:

1. **Nada de importante depois de x=78%.** O painel de skills ocupa os 420px da
   direita a partir do Bloco 1, e o que cai atrás dele é clique morto.
2. **Nada de importante depois de y=82%.** A barra de itens come os 190px de
   baixo, e a linha de nome do hotspot mais 52px acima dela.
3. **Piso útil entre y=63% e y=82%.** É onde as paradas ficam, e é a faixa em
   que o valor do piso tem de diferir do valor da Ana — senão a silhueta dela
   desaparece em vídeo comprimido (bíblia §4.2).
