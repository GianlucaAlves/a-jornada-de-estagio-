"""
Props de cenário: a biblioteca que faz a cena existir.

480x270 são 129.600 pixels e ninguém escreve isso à mão. Cada função aqui
devolve uma `Grade` pequena — opaca só onde há matéria — para ser colada com
`colar_base()`. Cena é MONTADA, não desenhada (bíblia §4.3): uma cena com 8
props colados 30 vezes fica pronta; com 30 props escritos à mão, não fica.

QUATRO CONVENÇÕES QUE VALEM PARA TODO PROP DESTE ARQUIVO

1. Luz vem de cima-à-esquerda, sempre. Aresta superior e esquerda no tom
   claro, inferior e direita no escuro. Direção de luz misturada na mesma cena
   lê como colagem, não como lugar (bíblia §2.6).

2. Sombra é UMA casa na rampa (`mais_escuro`/`mais_claro` de 1 passo). Salto de
   dois valores vira mancha e não volume (bíblia §2.5).

3. O prop NÃO carrega a própria sombra de contato. Ela é pintada no piso pela
   `sombra_de_contato()` DEPOIS da colagem, porque precisa amostrar a cor do
   piso para escurecê-la um passo — sombra de cor fixa fica cinza-adesivo sobre
   carpete azul e sobre madeira ao mesmo tempo, e aí nenhuma das duas assenta.

4. Nada aqui devolve grade contornada. `contornar()` é para SPRITE (coisa que
   flutua sobre um fundo qualquer e precisa de silhueta fechada). Prop colado
   dentro da cena ganha separação pelo próprio valor e pelas arestas escuras;
   contorná-lo faria a cena virar um vitral de linhas preta.

Os props de objeto INTERATIVO são a exceção da regra 4 e vivem em
`cenarios.py`, porque lá eles saem como PNG próprio e aí a silhueta fechada é
justamente o que a aura de hover segue.
"""

from __future__ import annotations

from .nucleo import Grade
from .paleta import CONTORNO, VAZIO, mais_claro, mais_escuro, rampa

# ------------------------------------------------------------------- rampas
# Atalhos nomeados. Escrever a rampa literal no prop é o caminho curto para
# uma cena com dois cinzas diferentes que ninguém sabe de onde vieram.
NEUTRO = rampa("neutro")  # "12345678"
AZUL = rampa("azul")  # "abcde"
MADEIRA = rampa("madeira")  # "mnopqr"
LUZ = rampa("luz")  # "uvwxyz"
VERDE = rampa("verde")  # "fghij"
VERMELHO = rampa("vermelho")  # "CDEFG"
TELA = rampa("tela")  # "HIJLM"


def tons_de_volume(ramp: str) -> tuple[str, str, str]:
    """(escuro, medio, claro) de uma rampa.

    Mesma escolha de `Grade.caixa_com_volume` de propósito: prop montado à mão
    e prop montado pelo atalho têm de sair com o mesmo volume, senão a cena
    ganha duas linguagens de sombreamento.
    """
    return ramp[0], ramp[len(ramp) // 2], ramp[-2]


# ------------------------------------------------------------- primitivas


def linha(g: Grade, x0: int, y0: int, x1: int, y1: int, cor: str) -> None:
    """Bresenham. O núcleo só tem linha reta H e V, e cabo/folha são diagonais."""
    dx, dy = abs(x1 - x0), abs(y1 - y0)
    sx = 1 if x1 >= x0 else -1
    sy = 1 if y1 >= y0 else -1
    erro = dx - dy
    x, y = x0, y0
    while True:
        g.ponto(x, y, cor)
        if x == x1 and y == y1:
            return
        e2 = 2 * erro
        if e2 > -dy:
            erro -= dy
            x += sx
        if e2 < dx:
            erro += dx
            y += sy


def _elipse(g: Grade, cx: int, cy: int, rx: int, ry: int, cor: str) -> None:
    for dy in range(-ry, ry + 1):
        for dx in range(-rx, rx + 1):
            if (dx / max(rx, 1)) ** 2 + (dy / max(ry, 1)) ** 2 <= 1.0:
                g.ponto(cx + dx, cy + dy, cor)


def _borda_de_volume(g: Grade, x: int, y: int, w: int, h: int, claro: str, escuro: str) -> None:
    """Aresta clara em cima/esquerda, escura embaixo/direita. A regra §2.6."""
    g.linha_h(x, y, w, claro)
    g.linha_v(x, y, h, claro)
    g.linha_h(x, y + h - 1, w, escuro)
    g.linha_v(x + w - 1, y, h, escuro)


# ------------------------------------------------- assentar e iluminar cena


def sombra_de_contato(
    g: Grade,
    x_centro: int,
    y_base: int,
    largura: int,
    *,
    altura: int = 2,
    forca: int = 1,
) -> None:
    """Elipse achatada logo abaixo de um objeto que toca o chão (bíblia §4.4).

    Amostra a cor que já está no piso e desce `forca` casas na rampa DELA. É o
    que permite a mesma chamada assentar um prop sobre carpete azul e sobre
    piso de madeira: a sombra pertence ao piso, não ao objeto.

    Sem isto tudo parece adesivo colado — inclusive o personagem.
    """
    for dy in range(altura):
        # a elipse afina para baixo: sombra que não afina lê como pedestal
        meia = max(1, (largura // 2) - dy * max(1, largura // 8))
        passos = forca + (1 if dy == 0 else 0)
        for dx in range(-meia, meia + 1):
            base = g.em(x_centro + dx, y_base + dy)
            if base == VAZIO:
                continue
            g.ponto(x_centro + dx, y_base + dy, mais_escuro(base, passos))


def poca_de_luz(
    g: Grade,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
    *,
    quente: str | None = "r",
    passos: int = 2,
) -> None:
    """Poça de luz de fonte PONTUAL: sobe a rampa do próprio piso em três anéis.

    Luz sem consequência no chão lê como adesivo (bíblia §3): a luminária e o
    halo de parede PRECISAM desta poça para existirem como luz.

    ESCOPO: lâmpada. Elipse é a mancha de uma fonte pontual, e só dela. Janela
    tem `poca_de_janela()` e porta tem `poca_de_porta()` — esta função servia às
    três e o resultado foi a mesma elipse do mesmo tamanho em quatro cenas, que a
    revisão leu como carimbo. Forma da mancha é o que informa a fonte; usar uma
    forma para todas as fontes apaga a informação e ainda denuncia a repetição.

    `passos` é o teto de quantas casas a rampa sobe, e existe porque a mesma
    função serve piso escuro e parede clara. Dois passos sobre madeira escura
    dão uma poça quente perfeita; dois passos sobre parede `6` chegam em `8`, que
    é quase branco — e aí o halo da lâmpada pendente do cafezinho virou uma LUA
    branca pendurada na parede. Parede pede `passos=1`.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: a primeira versão pintava `v`/`w`/`x`
    direto sobre o carpete. Saiu um tapete laranja listrado — porque (a) o salto
    de hue de azul para laranja em cobertura alta não lê como luz, lê como
    tinta, e (b) o padrão `(dx+dy) % 4` faz listras diagonais em vez de dither.
    Agora a poça é o piso um/dois passos mais claro, com o tom quente entrando
    só como salpico no miolo. Luz é valor, não cor.
    """
    forte = max(1, passos)
    fraco = max(1, passos - 1)
    for dy in range(-ry, ry + 1):
        for dx in range(-rx, rx + 1):
            d = (dx / max(rx, 1)) ** 2 + (dy / max(ry, 1)) ** 2
            if d > 1.0:
                continue
            base = g.em(cx + dx, cy + dy)
            if base == VAZIO:
                continue
            ax, ay = cx + dx, cy + dy
            if d < 0.30:
                g.ponto(ax, ay, mais_claro(base, forte if (dx + dy) % 2 == 0 else fraco))
                # salpico quente em padrão ESPARSO. Com `(dx+dy) % 4` o salpico
                # saía em LISTRAS DIAGONAIS dentro da poça — visível na poça da
                # sala de reuniões e na da mesa da Ana. Só xadrez/esparso/denso
                # são padrões de dither; qualquer outro módulo desenha moiré.
                if quente and dx % 2 == 0 and dy % 2 == 0 and d < 0.16:
                    g.ponto(ax, ay, quente)
            elif d < 0.64:
                if (dx + dy) % 2 == 0:
                    g.ponto(ax, ay, mais_claro(base, fraco))
            else:
                if dx % 2 == 0 and dy % 2 == 0:
                    g.ponto(ax, ay, mais_claro(base, fraco))


def poca_de_janela(
    g: Grade,
    x_esq: int,
    y_topo: int,
    largura: int,
    altura: int,
    *,
    inclinacao: int = 0,
    barras: int = 1,
    travessa: int = 0,
    quente: str | None = "r",
    passos: int = 2,
) -> None:
    """Mancha de luz de JANELA: quadrilátero inclinado, riscado pelos caixilhos.

    POR QUE ISTO EXISTE
    Havia uma função de poça só, a elíptica, e ela pintava a luz de janela, de
    porta e de lâmpada com a mesma forma e quase o mesmo tamanho em quatro cenas.
    A revisão leu carimbo, e com razão: a forma da mancha é a única coisa na
    imagem que diz de onde vem a luz. Elipse é o que uma fonte PONTUAL projeta —
    lâmpada de mesa, pendente. Uma janela é uma abertura retangular com barras, e
    o que ela põe no chão é um quadrilátero inclinado com as sombras dos montantes
    dentro. Desenhar isso custa o mesmo e informa a fonte.

    `inclinacao` desloca a base em relação ao topo (o sol não está de frente).
    `barras` é quantos montantes a janela tem, e sai como faixa NÃO aclarada —
    sombra dentro da luz, que é o detalhe que vende a coisa. `travessa` faz o
    mesmo na horizontal.

    A mancha também ABRE conforme se afasta: sem isso o paralelogramo lê como
    tapete retangular esquecido no chão.
    """
    forte = max(1, passos)
    fraco = max(1, passos - 1)
    y_travessa = y_topo + round(altura * 0.42) if travessa else -99
    for dy in range(altura):
        t = dy / max(1, altura - 1)
        desloca = round(inclinacao * t)
        folga = round(largura * 0.14 * t)
        x0 = x_esq + desloca - folga
        x1 = x_esq + largura + desloca + folga
        if y_travessa <= y_topo + dy < y_travessa + travessa:
            continue
        vaos = [round(x0 + (x1 - x0) * (k + 1) / (barras + 1)) for k in range(barras)]
        for x in range(x0, x1):
            if any(0 <= x - v <= 1 for v in vaos):
                continue  # sombra do montante: fica na cor crua do piso
            base = g.em(x, y_topo + dy)
            if base == VAZIO:
                continue
            borda = x - x0 < 3 or x1 - 1 - x < 3 or dy < 2 or altura - 1 - dy < 3
            ax, ay = x, y_topo + dy
            if borda:
                if (x + dy) % 2 == 0:
                    g.ponto(ax, ay, mais_claro(base, fraco))
            elif t < 0.55:
                g.ponto(ax, ay, mais_claro(base, forte if (x + dy) % 2 == 0 else fraco))
                # salpico quente só na metade de cima, que é a mais perto da
                # janela. Padrão esparso: qualquer módulo diferente de
                # xadrez/esparso/denso desenha moiré nesta escala.
                if quente and x % 2 == 0 and dy % 2 == 0 and t < 0.24:
                    g.ponto(ax, ay, quente)
            elif (x + dy) % 2 == 0:
                g.ponto(ax, ay, mais_claro(base, fraco))


def poca_de_porta(
    g: Grade,
    x_vao: int,
    y_soleira: int,
    largura_vao: int,
    alcance: int,
    *,
    deriva: int = 0,
    quente: str | None = "x",
    passos: int = 2,
) -> None:
    """Cunha de luz saindo de um vão de porta, abrindo e apagando ao avançar.

    A outra metade da correção de forma. Porta aberta é uma abertura ESTREITA e
    ALTA: o que ela projeta é um leque que começa na largura do vão e abre, com a
    ponta desmanchando. Estava saindo como a mesma elipse da lâmpada, e elipse
    centrada longe da porta faz a luz parecer vir do meio da sala.

    `deriva` inclina o leque para o lado, porque a porta não está de frente para
    a plateia em nenhuma das duas cenas que a usam.
    """
    forte = max(1, passos)
    fraco = max(1, passos - 1)
    for dy in range(alcance):
        t = dy / max(1, alcance - 1)
        meia = max(1, round(largura_vao / 2 + largura_vao * 0.95 * t))
        cx = x_vao + round(deriva * t)
        for dx in range(-meia, meia + 1):
            x = cx + dx
            base = g.em(x, y_soleira + dy)
            if base == VAZIO:
                continue
            ax, ay = x, y_soleira + dy
            na_borda = meia - abs(dx) < 4
            if t > 0.72:  # ponta da cunha: só resíduo, senão vira tapete
                if x % 2 == 0 and dy % 2 == 0:
                    g.ponto(ax, ay, mais_claro(base, fraco))
            elif na_borda:
                if (x + dy) % 2 == 0:
                    g.ponto(ax, ay, mais_claro(base, fraco))
            else:
                g.ponto(ax, ay, mais_claro(base, forte if (x + dy) % 2 == 0 else fraco))
                if quente and x % 2 == 0 and dy % 2 == 0 and t < 0.3:
                    g.ponto(ax, ay, quente)


def reflexo_de_tela(g: Grade, x: int, y: int, w: int, h: int, tom: str = "I") -> None:
    """Salpico ciano numa superfície em frente a um monitor.

    A bíblia §3 pede tela ligada E o reflexo dela no que está na frente. O
    reflexo é o que faz a tela emitir em vez de só estar acesa — e é a
    assinatura visual de escritório de tecnologia.
    """
    for dy in range(h):
        for dx in range(w):
            if (dx + dy * 2) % 5 != 0:
                continue
            if g.em(x + dx, y + dy) == VAZIO:
                continue
            g.ponto(x + dx, y + dy, tom)


# ------------------------------------------------------ parede, piso, vidro


def serie(semente: int) -> "object":
    """Gerador determinístico de inteiros. Aleatório de verdade faria a arte
    mudar a cada execução, e arte que muda sozinha não pode ser revisada."""
    x = semente & 0x7FFFFFFF

    def proximo(limite: int) -> int:
        nonlocal x
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        return (x >> 7) % max(1, limite)

    return proximo


def _quebra(ch: str, *, claro: bool = False) -> str:
    """Tom vizinho GARANTIDAMENTE diferente de `ch`. Desce se der, sobe se não.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI, e é a causa de todos os chapados que a
    revisão mediu contra o limite de ~40x40 da bíblia §4.5.

    `mais_escuro()` no primeiro char de uma rampa devolve o PRÓPRIO char, e
    `mais_claro()` no último faz o mesmo — é o comportamento correto delas, mas
    quem usa o resultado para desenhar uma junta ou uma linha de textura fica com
    um desenho invisível, e invisível exatamente nos extremos da rampa. Os
    extremos são onde estão as maiores áreas chapadas da arte:

      - banda `m` do piso do cafezinho: 480x47 px de madeira escura sem um pixel
        de variação, porque `mais_escuro("m")` é `"m"` e as juntas das fiadas
        estavam todas pintando `m` sobre `m`;
      - juntas de banda de parede em strings com char repetido (`"5443"`,
        `"4322"`, `"7665"`): a junta ditherizava `4` com `4`, então duas bandas
        iguais coladas viravam UMA banda do dobro da altura. A parede do
        escritório acumulava 78 linhas de `4` sem quebra nenhuma.

    Não serve para sombra: sombra que sobe na rampa é realce. `sombra_de_contato`
    continua com `mais_escuro` puro de propósito.
    """
    alvo = mais_claro(ch) if claro else mais_escuro(ch)
    if alvo != ch:
        return alvo
    return mais_escuro(ch) if claro else mais_claro(ch)


def manchas(
    g: Grade,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    *,
    quantidade: int = 14,
    semente: int = 7,
    claras: bool = False,
) -> None:
    """Sujeira/sombreado em MANCHAS grandes de dither, não em pontos isolados.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: a primeira versão texturizava parede e
    piso escurecendo pixels espalhados por uma fórmula regular. A 4x um pixel é
    um bloco de 4x4 na tela, então ponto isolado não vira textura — vira chapa
    de metal perfurado, e foi exatamente o que apareceu na primeira folha de
    contato das seis cenas.

    Textura nesta escala precisa ser CONTÍGUA: uma região de dither xadrez ou
    esparso lê como superfície; um ponto solto lê como defeito.

    AS POSIÇÕES SÃO ESTRATIFICADAS, NÃO SORTEADAS. A versão anterior sorteava
    x e y livremente na região, e sorteio uniforme AGRUPA: com 12 manchas numa
    parede de 480x156 px, três caíam quase em cima uma da outra e sobrava um
    buraco liso de 53x53 px — que é justamente o que o limite de ~40x40 da bíblia
    §4.5 proíbe. Agora a região é dividida numa grade e cada célula recebe UMA
    mancha, sorteada só dentro dela: o espalhamento passa a ser garantido e o
    sorteio dentro da célula é o que impede a grade de aparecer. `quantidade` vira
    o número ALVO de manchas — o número real é o da grade que melhor acomoda ele.
    """
    proximo = serie(semente)
    largura_regiao = max(1, x1 - x0)
    altura_regiao = max(1, y1 - y0)
    colunas = max(1, round((quantidade * largura_regiao / altura_regiao) ** 0.5))
    linhas = max(1, -(-quantidade // colunas))
    passo_x = largura_regiao / colunas
    passo_y = altura_regiao / linhas
    for i in range(colunas * linhas):
        # ACHATADA e ESPARSA. A versão anterior sorteava manchas quase redondas
        # de até 48x20 com dither xadrez, e a parede do Innovation ganhou oito
        # NUVENS cinzas claramente visíveis. Sujeira de parede é comprida, baixa
        # e de 25% de cobertura — some de longe e só tira o ar de tinta nova.
        w = 20 + proximo(44)
        h = 4 + proximo(7)
        cel_x = x0 + (i % colunas) * passo_x
        cel_y = y0 + (i // colunas) * passo_y
        x = round(cel_x + proximo(max(1, round(passo_x))) - w / 3)
        y = round(cel_y + proximo(max(1, round(passo_y))) - h / 2)
        x = max(x0, min(x, x1 - 2))
        y = max(y0, min(y, y1 - 2))
        base = g.em(x + w // 2, y + h // 2)
        if base == VAZIO:
            continue
        outro = _quebra(base, claro=claras)
        rx, ry = max(1, w // 2), max(1, h // 2)
        for dy in range(h):
            for dx in range(w):
                # ELIPSE, não retângulo: mancha retangular de dither lê como
                # remendo colado. Foi o que apareceu nas paredes da primeira
                # versão — blocos cinza claramente quadrados no reboco.
                if ((dx - rx) / rx) ** 2 + ((dy - ry) / ry) ** 2 > 1.0:
                    continue
                if g.em(x + dx, y + dy) != base:
                    continue  # não atravessa a junta de banda nem um prop
                if dx % 2 == 0 and dy % 2 == 0:
                    g.ponto(x + dx, y + dy, outro)


def parede_pintada(
    g: Grade,
    y0: int,
    y1: int,
    tons: str,
    *,
    x0: int = 0,
    x1: int | None = None,
    sujeira: bool = True,
) -> None:
    """Parede em bandas com junta de TRÊS filas, escurecendo para baixo.

    Escurece para baixo porque a luz vem de cima, e a banda mais escura fica
    justamente atrás da cabeça do personagem — é o que faz o rosto claro dele
    ler (decisão 2 de `cenarios.py`).

    A junta tem três filas (esparso, xadrez, denso) e não uma: com uma fila a
    troca de banda ainda aparece como listra horizontal, e listra horizontal é o
    que a compressão de vídeo transforma em banding.

    QUANDO DOIS CHARS DE `tons` SÃO IGUAIS, NÃO EXISTE JUNTA — e é de propósito.
    As strings reais (`"5443"`, `"4322"`, `"7665"`) repetem char, e duas bandas
    iguais coladas viram uma banda do dobro da altura: era daí que vinham os
    chapados de 46x46 e 67x67 px que a revisão mediu contra o limite da bíblia
    §4.5. A primeira correção foi desenhar uma junta artificial ali, com
    `_quebra()`, e ela FALHOU na folha de contato: junta só funciona como
    transição quando separa dois tons diferentes; entre dois tons iguais as três
    filas viram uma LISTRA de 1920 px de ponta a ponta, e a sala de treinamento
    ganhou cinco delas — a "folha de caderno pautada" que o próprio
    `piso_em_bandas` já registra como erro cometido. A quebra de banda dobrada
    tem de vir de TEXTURA, nunca de linha, e é o que as duas passadas de
    `manchas` abaixo fazem.
    """
    x1 = g.largura if x1 is None else x1
    w = x1 - x0
    n = len(tons)
    total = y1 - y0
    faixa = max(1, total // n)
    for i, ch in enumerate(tons):
        topo = y0 + i * faixa
        alto = (total - i * faixa) if i == n - 1 else faixa
        if alto <= 0:
            break
        g.retangulo(x0, topo, w, alto, ch)
        if i > 0 and tons[i - 1] != ch:
            anterior = tons[i - 1]
            g.dither(x0, topo - 3, w, 1, anterior, ch, "esparso")
            g.dither(x0, topo - 2, w, 1, anterior, ch, "xadrez")
            g.dither(x0, topo - 1, w, 1, anterior, ch, "denso")
    if sujeira:
        # Duas passadas, uma escura e uma clara, com sementes diferentes. Com uma
        # só, de `w // 40` manchas, sobravam vãos lisos maiores que a janela de
        # 40x40 do checklist em cinco das seis paredes. Duas passadas dobram a
        # cobertura sem subir o contraste de cada mancha, que é o que faria a
        # parede ganhar "nuvens" visíveis (o erro registrado em `manchas`).
        manchas(g, x0, y0 + 2, x1, y1, quantidade=max(10, w // 18), semente=y0 + w)
        manchas(
            g,
            x0,
            y0 + 2,
            x1,
            y1,
            quantidade=max(7, w // 30),
            semente=y0 * 3 + w + 17,
            claras=True,
        )


def piso_em_bandas(g: Grade, y0: int, y1: int, tons: str) -> None:
    """Piso com bandas de altura CRESCENTE para a frente e junta de TRÊS filas.

    Banda de altura igual lê como escada; banda crescendo lê como piso indo
    embora — é perspectiva de pobre e funciona nesta escala. O valor desce para
    a frente porque o plano de FRENTE é o mais escuro da cena (bíblia §4.2).

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: a junta era UMA fila de dither xadrez
    mais uma fila de "costura" esparsa. Em 1920px isso vira uma LINHA
    PONTILHADA de ponta a ponta da imagem, e três delas fizeram o Innovation
    parecer folha de caderno pautada. Junta precisa de três filas (esparso,
    xadrez, denso) para ser transição em vez de régua.

    E o mesmo cuidado de `parede_pintada`: char repetido em `tons` (`"6654"`)
    NÃO ganha junta, porque junta entre dois tons iguais é uma listra e não uma
    transição — a quebra da banda dobrada vem das `manchas` que a cena chama
    depois. Já as juntas de tábua e de ladrilho são linhas de verdade e essas
    passam por `_quebra()`, que garante que elas apareçam também na banda mais
    escura da rampa.
    """
    n = len(tons)
    total = y1 - y0
    pesos = [i + 1 for i in range(n)]
    soma = sum(pesos)
    y = y0
    for i, ch in enumerate(tons):
        alto = total - (y - y0) if i == n - 1 else max(1, round(total * pesos[i] / soma))
        g.retangulo(0, y, g.largura, alto, ch)
        if i > 0 and y - 3 >= y0 and tons[i - 1] != ch:
            anterior = tons[i - 1]
            g.dither(0, y - 3, g.largura, 1, anterior, ch, "esparso")
            g.dither(0, y - 2, g.largura, 1, anterior, ch, "xadrez")
            g.dither(0, y - 1, g.largura, 1, anterior, ch, "denso")
        y += alto


def piso_ladrilhado(g: Grade, y0: int, y1: int, tons: str, cx: int = 240) -> None:
    """Piso em bandas + costuras convergindo para um ponto de fuga em `cx`.

    Só o laboratório e a sala de reuniões usam: carpete não tem junta visível e
    desenhar junta em carpete é o tipo de detalhe que denuncia arte por
    coordenada.
    """
    piso_em_bandas(g, y0, y1, tons)
    for k in range(-9, 10):
        if k == 0:
            continue
        # a junta abre conforme desce: a cor é amostrada A CADA linha porque a
        # banda do piso muda de valor, e junta de cor fixa atravessaria três
        # bandas como um arranhão
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0 - 1)
            x = round(cx + k * (9 + 21 * t))
            base = g.em(x, y)
            if base == VAZIO:
                continue
            g.ponto(x, y, _quebra(base))
    for y in range(y0 + 6, y1, max(5, (y1 - y0) // 7)):
        g.dither(0, y, g.largura, 1, g.em(0, y), _quebra(g.em(0, y)), "denso")


def piso_de_madeira(g: Grade, y0: int, y1: int) -> None:
    """Tábua corrida: fiadas horizontais longas com emenda de topo esparsa.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: a primeira versão punha emenda de topo a
    cada 22px, e 22 é curto o bastante para a emenda virar o lado curto de um
    tijolo. O piso do cafezinho saiu lendo como PAREDE DE TIJOLOS deitada. Tábua
    é comprida: emenda a cada ~74px, deslocada por fiada, e a fiada ganha uma
    junta contínua com um realce de 1px logo abaixo para ter espessura.

    O cafezinho é a cena quente do jogo e o piso é a maior área dela: é aqui que
    a madeira vira os ~45% de massa quente que invertem a proporção padrão.

    E é aqui que estava o maior chapado das seis cenas: a banda do fundo é `m`,
    o primeiro char da rampa madeira, e toda a textura de fiada usava
    `mais_escuro` — que em `m` devolve `m`. Resultado: 480x47 px de marrom
    escuro absolutamente lisos, sem uma junta, sem uma emenda. Ver `_quebra()`.
    """
    piso_em_bandas(g, y0, y1, "ponm")
    y = y0 + 3
    fila = 0
    while y < y1:
        alto = 7 + fila * 2  # fiada larga: fiada estreita + emenda = tijolo
        for x in range(g.largura):  # junta entre fiadas, seca e sem realce
            g.ponto(x, y, _quebra(g.em(x, y)))
        for x in range((fila * 47) % 118, g.largura, 118):  # emenda de topo
            for dy in range(1, alto):
                if y + dy < y1:
                    g.ponto(x, y + dy, _quebra(g.em(x, y + dy)))
        y += alto
        fila += 1


def vidro(g: Grade, x: int, y: int, w: int, h: int, *, montantes: int = 3) -> None:
    """Divisória de vidro: quase nada + dois reflexos diagonais.

    Vidro em pixel art não é transparência, é RUÍDO CONTROLADO: o que faz ler
    como vidro é a diagonal clara sobre um campo levemente MAIS CLARO que a
    parede, mais os montantes escuros. Vidro desenhado com muita coisa dentro
    vira aquário.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: o campo era `3`, um passo mais ESCURO que
    a parede da sala de reuniões. Resultado: dois painéis pretos com um risco
    branco, lendo como lousa. Vidro reflete o teto, então é mais claro que a
    parede — é essa relação, e não o desenho interno, que faz o material.
    """
    g.retangulo(x, y, w, h, "4")
    g.dither(x, y, w, h, "4", "5", "esparso")
    for i in range(2):
        ox = x + w // 4 + i * (w // 3)
        for k in range(min(h, w // 3)):
            g.ponto(ox + k, y + k, "7")
            g.ponto(ox + k + 1, y + k, "6")
    for i in range(montantes + 1):
        px = x + round(i * (w - 1) / montantes)
        g.linha_v(px, y, h, "2")
        g.ponto(px, y, "6")
    g.linha_h(x, y, w, "6")
    g.linha_h(x, y + h - 1, w, "2")


# ------------------------------------------------------------- mobiliário


def mesa_de_trabalho(
    largura: int = 64,
    altura: int = 42,
    ramp: str = MADEIRA,
    *,
    gaveteiro: bool = True,
) -> Grade:
    """Mesa vista de frente: tampo CLARO, saia média, vão de pés escuro.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: na primeira versão o vão de pés ocupava
    quase toda a altura e o tampo tinha 4px. Na folha de contato a mesa saiu
    como um bloco marrom escuro — parecia um banco de madeira encostado na
    parede. Três valores empilhados (tampo claro / saia média / vão quase preto)
    é o que faz uma mesa LER como mesa numa silhueta de 150x36.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    vao = mais_escuro(esc)
    saia_topo = 6
    saia_base = min(altura - 6, saia_topo + max(6, altura // 4))

    # tampo: duas filas claras (a face que recebe a luz) + corpo + aresta. A
    # fila do meio era dither xadrez e, a 4x, uma fila de xadrez de 150px vira
    # uma LINHA PONTILHADA amarela atravessando a mesa. Linha sólida.
    g.retangulo(0, 0, largura, 2, cla)
    g.retangulo(0, 2, largura, 3, med)
    g.linha_h(0, 2, largura, mais_claro(med))
    g.linha_h(0, 5, largura, esc)

    # saia frontal: é ela que dá "mesa" e não "prateleira". Lisa, com um friso
    # de 2px no lugar de dither — a 4x um dither esparso numa faixa de 150x6
    # lê como fita trançada, não como madeira.
    g.retangulo(1, saia_topo, largura - 2, saia_base - saia_topo, med)
    g.linha_h(1, saia_topo, largura - 2, mais_claro(med))
    g.linha_h(1, saia_base - 1, largura - 2, esc)
    g.linha_h(3, saia_topo + 3, largura - 6, esc)
    g.linha_h(3, saia_topo + 4, largura - 6, mais_claro(med))

    # vão de pés: quase preto. O vazio escuro é o que dá profundidade e o que
    # permite uma cadeira entrar embaixo sem virar colagem.
    g.retangulo(0, saia_base, largura, altura - saia_base, vao)
    g.dither(0, saia_base, largura, 3, vao, esc, "xadrez")
    for lado in (0, largura - 5):
        g.retangulo(lado, saia_base, 5, altura - saia_base, med)
        _borda_de_volume(g, lado, saia_base, 5, altura - saia_base, cla, esc)

    if gaveteiro and largura >= 40:
        gx = largura - 24
        gh = altura - saia_base
        g.retangulo(gx, saia_base, 18, gh, med)
        _borda_de_volume(g, gx, saia_base, 18, gh, cla, esc)
        for i in range(3):
            gy = saia_base + 2 + i * max(2, (gh - 3) // 3)
            if gy >= altura - 1:
                break
            g.linha_h(gx + 1, gy, 16, esc)
            g.linha_h(gx + 6, gy + 1, 7, cla)  # puxador
    return g


def armario_baixo(largura: int = 56, altura: int = 30, ramp: str = NEUTRO) -> Grade:
    """Armário/credência de duas portas. Serve de base para plantas e telas."""
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    g.retangulo(0, 3, largura, altura - 3, med)
    _borda_de_volume(g, 0, 3, largura, altura - 3, cla, esc)
    meio = largura // 2
    for px in (2, meio + 1):
        pw = meio - 3
        g.retangulo(px, 6, pw, altura - 11, mais_claro(med))
        g.moldura(px, 6, pw, altura - 11, esc)
        g.linha_h(px + 1, 7, pw - 2, cla)
    g.linha_v(meio - 2, 8, altura - 15, cla)  # puxadores
    g.linha_v(meio + 2, 8, altura - 15, cla)
    g.retangulo(0, 0, largura, 3, mais_claro(med))  # tampo
    g.linha_h(0, 0, largura, cla)
    g.linha_h(0, 2, largura, esc)
    g.retangulo(1, altura - 2, largura - 2, 2, mais_escuro(esc))  # rodapé/plinto
    return g


def prateleira(largura: int = 48, altura: int = 40, ramp: str = MADEIRA) -> Grade:
    """Estante de 3 níveis com lombadas e caixas.

    As lombadas usam tons de famílias diferentes porque estante monocromática
    lê como parede listrada. Nenhuma lombada vermelha: o acento vermelho da
    cena é um só e é escolhido na composição, não escondido numa estante.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    g.retangulo(0, 0, largura, altura, mais_escuro(esc))
    for lado in (0, largura - 3):
        g.retangulo(lado, 0, 3, altura, med)
        _borda_de_volume(g, lado, 0, 3, altura, cla, esc)

    niveis = 3
    passo = altura // niveis
    lombadas = "eiJ56qd"
    k = 0
    for n in range(niveis):
        y = n * passo
        g.retangulo(0, y, largura, 2, med)
        g.linha_h(0, y, largura, cla)
        x = 4
        while x < largura - 6:
            larg = 2 + (k % 3)
            alto = passo - 4 - (k % 2)
            ch = lombadas[k % len(lombadas)]
            g.retangulo(x, y + passo - alto - 1, larg, alto, ch)
            g.linha_v(x, y + passo - alto - 1, alto, mais_claro(ch))
            g.linha_v(x + larg - 1, y + passo - alto - 1, alto, mais_escuro(ch))
            x += larg + 1
            k += 1
        # uma caixa no lugar dos livros, de vez em quando
        if n == 1:
            g.caixa_com_volume(largura - 18, y + 4, 13, passo - 6, MADEIRA)
    return g


def divisoria_baia(largura: int = 84, altura: int = 50) -> Grade:
    """Painel de baia: tecido, perfil de alumínio, BANCADA e PÉS visíveis.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: a primeira versão era um retângulo de
    tecido com dois pés de 3px. Na folha de contato saiu como um quadro-negro
    pendurado na parede — porque um retângulo de tom único encostado na parede
    não tem nada que diga a que distância está. O que conserta é a BANCADA
    presa ao painel (superfície horizontal clara, com sombra embaixo) e o vão
    de 7px sob o painel, que mostra o piso passando por trás dos pés.

    É a peça que salva o escritório: um painel de valor médio atrás da faixa de
    caminhada garante que a Ana nunca empate de valor com a parede do fundo.
    """
    g = Grade(largura, altura)
    base_painel = altura - 7

    g.retangulo(0, 2, largura, base_painel - 2, "d")
    g.dither(0, 2, largura, base_painel - 2, "d", "c", "xadrez")
    g.dither(3, 5, largura - 6, base_painel - 10, "d", "e", "esparso")
    g.retangulo(0, 0, largura, 2, "6")  # perfil de alumínio
    g.linha_h(0, 0, largura, "7")
    g.linha_h(0, 1, largura, "4")
    g.linha_v(0, 2, base_painel - 2, "e")
    g.linha_v(largura - 1, 2, base_painel - 2, "a")
    g.linha_h(0, base_painel - 1, largura, "a")

    sy = base_painel - 15  # bancada presa ao painel
    g.retangulo(0, sy, largura, 3, "6")
    g.linha_h(0, sy, largura, "7")
    g.linha_h(0, sy + 2, largura, "3")
    g.dither(0, sy + 3, largura, 3, "c", "b", "denso")

    for px in (3, largura - 7):  # pés
        g.retangulo(px, base_painel, 4, 7, "3")
        g.linha_v(px, base_painel, 7, "5")
        g.linha_h(px - 1, altura - 1, 6, "2")
    return g


def bancada(largura: int = 90, altura: int = 50, ramp: str = MADEIRA) -> Grade:
    """Balcão de altura de peito: tampo com pingadeira, portas e rodapé recuado.

    A pingadeira (tampo 2px mais largo que o corpo) e o rodapé RECUADO são os
    dois detalhes que separam balcão de caixote. Sem o rodapé recuado o móvel
    encosta no chão como um tijolo; com ele, ganha uma sombra própria na base e
    passa a ter espessura.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    corpo_x, corpo_w = 2, largura - 4

    g.retangulo(corpo_x, 5, corpo_w, altura - 5, med)
    g.dither(corpo_x, 5, corpo_w, 3, med, esc, "denso")  # sombra sob a pingadeira

    portas = max(2, corpo_w // 34)
    passo = corpo_w // portas
    for i in range(portas):
        pw = passo - 4
        px = corpo_x + 2 + i * passo
        ph = altura - 17
        # painel LISO, com volume só nas arestas. Dither dentro de um painel de
        # 30x35 lê como palha trançada a 4x — e área menor que 40x40 pode ser
        # plana sem violar o checklist §4.5.
        g.retangulo(px, 10, pw, ph, mais_claro(med))
        _borda_de_volume(g, px, 10, pw, ph, cla, esc)
        g.linha_h(px + pw // 2 - 2, 13, 5, cla)  # puxador

    g.retangulo(corpo_x + 2, altura - 5, corpo_w - 4, 5, mais_escuro(esc))
    g.linha_h(corpo_x + 2, altura - 5, corpo_w - 4, esc)

    g.retangulo(0, 0, largura, 5, cla)  # tampo
    g.linha_h(0, 0, largura, mais_claro(cla))
    g.linha_h(0, 4, largura, esc)
    g.dither(1, 1, largura - 2, 3, cla, mais_claro(cla), "esparso")
    return g


def pilar(largura: int = 22, altura: int = 120, ramp: str = NEUTRO) -> Grade:
    """Pilar estrutural. Serve para QUEBRAR parede longa.

    Uma parede de 480px sem interrupção vertical é a maior área plana possível
    numa cena, e nenhuma quantidade de dither resolve isso — o que resolve é uma
    aresta vertical clara com sombra do lado direito, que é exatamente o que um
    pilar dá de graça.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    g.retangulo(0, 0, largura, altura, med)
    g.linha_v(0, 0, altura, cla)
    g.linha_v(1, 0, altura, mais_claro(med))
    g.linha_v(largura - 2, 0, altura, esc)
    g.linha_v(largura - 1, 0, altura, mais_escuro(esc))
    g.dither(3, 2, largura - 6, altura - 4, med, mais_claro(med), "esparso")
    g.retangulo(-1, altura - 6, largura + 2, 3, mais_claro(med))  # base alargada
    g.linha_h(0, altura - 6, largura, cla)
    g.linha_h(0, altura - 4, largura, esc)
    return g


def grelha_de_ar(largura: int = 26, altura: int = 14) -> Grade:
    """Grelha de ar-condicionado. Detalhe de parede que ninguém nota e que,
    faltando, deixa a parede com cara de maquete."""
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "4")
    _borda_de_volume(g, 0, 0, largura, altura, "6", "2")
    for y in range(2, altura - 2, 3):
        g.linha_h(2, y, largura - 4, "2")
        g.linha_h(2, y + 1, largura - 4, "5")
    return g


def relogio_de_parede(raio: int = 7) -> Grade:
    """Relógio. Sem números (o spec proíbe fonte pixelada no cenário): só o
    aro, dois ponteiros e a marca das 12."""
    d = raio * 2 + 1
    g = Grade(d, d)
    _elipse(g, raio, raio, raio, raio, "6")
    _elipse(g, raio, raio, raio - 1, raio - 1, "8")
    g.linha_v(raio, 1, 2, "3")
    linha(g, raio, raio, raio, raio - 4, "2")  # ponteiro grande
    linha(g, raio, raio, raio + 3, raio + 2, "3")  # ponteiro pequeno
    g.ponto(raio, raio, "1")
    return g


def forro_de_teto(g: Grade, y0: int, y1: int, *, passo: int = 26) -> None:
    """Forro modular: cruzeta de perfis claros sobre um campo escuro.

    O teto é a faixa que menos recebe atenção e a que mais rápido entrega que a
    cena foi montada às pressas. Duas famílias de linha resolvem.
    """
    g.retangulo(0, y0, g.largura, y1 - y0, "2")
    g.dither(0, y0, g.largura, y1 - y0, "2", "1", "xadrez")
    for x in range(0, g.largura, passo):
        g.linha_v(x, y0, y1 - y0, "4")
        g.linha_v(x + 1, y0, y1 - y0, "1")
    for y in range(y0 + 4, y1, 6):
        g.linha_h(0, y, g.largura, "3")
    g.linha_h(0, y1 - 1, g.largura, "1")


def duto(g: Grade, y: int, *, x0: int = 0, x1: int | None = None, altura: int = 7) -> None:
    """Duto/tubulação horizontal correndo pela parede. Identidade de sala
    técnica, e de graça: é um cilindro, ou seja, três filas de valor."""
    x1 = g.largura if x1 is None else x1
    w = x1 - x0
    g.retangulo(x0, y, w, altura, "3")
    g.linha_h(x0, y, w, "5")
    g.linha_h(x0, y + 1, w, "4")
    g.linha_h(x0, y + altura - 1, w, "1")
    for x in range(x0 + 14, x1, 46):  # flanges
        g.retangulo(x, y - 1, 3, altura + 2, "4")
        g.linha_v(x, y - 1, altura + 2, "6")
        g.linha_v(x + 2, y - 1, altura + 2, "2")


def cadeira_escritorio(ramp: str = AZUL, *, perfil: bool = False) -> Grade:
    """Cadeira de escritório. `perfil` gira o encosto e encurta o assento.

    Duas silhuetas em vez de uma: cadeira sempre de frente numa fila de cinco
    denuncia a repetição na hora. A de perfil também serve de prop de FRENTE
    cortado pela moldura.
    """
    g = Grade(22 if not perfil else 20, 42)
    esc, med, cla = tons_de_volume(ramp)

    if perfil:
        g.retangulo(11, 0, 6, 17, med)  # encosto inclinado
        g.retangulo(12, 0, 5, 2, cla)
        g.linha_v(16, 1, 16, esc)
        g.retangulo(2, 16, 15, 7, mais_claro(med))  # assento
        g.linha_h(2, 16, 15, cla)
        g.linha_h(2, 22, 15, esc)
        g.retangulo(7, 17, 3, 5, esc)  # braço
    else:
        g.retangulo(4, 0, 14, 15, med)  # encosto
        g.ponto(4, 0, VAZIO)
        g.ponto(17, 0, VAZIO)
        _borda_de_volume(g, 4, 0, 14, 15, cla, esc)
        g.dither(6, 2, 10, 11, med, mais_escuro(med), "esparso")
        # ASSENTO: 7px e um passo mais CLARO que o encosto. Com 5px e o mesmo
        # tom do encosto a cadeira saía como uma placa escura num pedestal — o
        # assento é a única superfície horizontal dela e é o que recebe luz.
        g.retangulo(1, 16, 20, 7, mais_claro(med))
        g.linha_h(1, 16, 20, cla)
        g.linha_h(1, 22, 20, esc)
        for bx in (0, 20):  # braços
            g.retangulo(bx, 12, 2, 5, mais_escuro(med))

    cx = g.largura // 2
    g.retangulo(cx - 2, 23, 4, 11, "3")  # coluna
    g.linha_v(cx - 2, 23, 11, "5")
    g.linha_v(cx + 1, 23, 11, "2")
    _elipse(g, cx, 35, 9, 3, "2")  # aranha de cinco pontas, achatada
    _elipse(g, cx, 34, 8, 2, "4")
    for px in (cx - 9, cx - 1, cx + 7):  # rodízios
        g.retangulo(px, 37, 3, 2, "2")
        g.ponto(px, 37, "4")
    return g


def sofa_pequeno(largura: int = 62, altura: int = 34, ramp: str = AZUL) -> Grade:
    """Sofá de dois lugares. Assento em duas almofadas: uma só lê como banco."""
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    g.retangulo(0, 0, largura, altura - 5, med)
    _borda_de_volume(g, 0, 0, largura, altura - 5, cla, esc)
    g.retangulo(0, 0, largura, 3, mais_claro(med))  # topo do encosto
    g.linha_h(0, 0, largura, cla)
    for bx in (0, largura - 8):  # braços
        g.retangulo(bx, 6, 8, altura - 11, mais_escuro(med))
        g.linha_h(bx, 6, 8, med)
    meio = largura // 2
    for i, ax in enumerate((9, meio + 1)):
        aw = meio - 10
        g.retangulo(ax, 14, aw, altura - 20, mais_claro(med))
        g.linha_h(ax, 14, aw, cla)
        g.dither(ax + 1, 15, aw - 2, altura - 22, mais_claro(med), med, "esparso")
        del i
    for px in (4, largura - 7):  # pés de madeira
        g.retangulo(px, altura - 5, 3, 5, "n")
        g.linha_v(px, altura - 5, 5, "o")
    return g


def mesa_de_reuniao(largura: int = 200, altura: int = 38, ramp: str = MADEIRA) -> Grade:
    """Mesa grande vista de cima-à-frente: tampo em trapézio + aresta + pés.

    O trapézio (aresta de trás mais estreita que a da frente) é a única
    perspectiva que existe nesta arte. Sem ele a mesa de reunião lê como uma
    tábua flutuando, e a sala de reuniões é a cena mais simétrica do jogo —
    simetria sem profundidade fica cartão de visita.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    prof = altura - 12
    recuo_tras = largura // 8

    for i in range(prof):
        t = i / max(1, prof - 1)
        recuo = round(recuo_tras * (1 - t))
        x = recuo
        w = largura - 2 * recuo
        tom = mais_claro(med) if i < prof // 2 else med
        g.retangulo(x, i, w, 1, tom)
        g.ponto(x, i, cla)
        g.ponto(x + w - 1, i, esc)
    g.linha_h(0, 0, 0, cla)
    g.dither(recuo_tras, 1, largura - 2 * recuo_tras, prof - 2, mais_claro(med), cla, "esparso")
    # veio de madeira: linhas SÓLIDAS longas, 1 passo mais escuras. O tampo tem
    # 300x36 e é a maior área plana das seis cenas — o checklist §4.5 proíbe
    # área plana acima de ~40x40, e dither sozinho num tampo lê como lixa.
    for i, frac in enumerate((0.3, 0.55, 0.78)):
        vy = max(1, round(prof * frac))
        x0 = 8 + i * 17
        g.linha_h(x0, vy, max(4, largura - x0 - 12 - i * 9), med)
        g.linha_h(x0 + 6, vy + 1, max(3, largura - x0 - 40 - i * 14), mais_claro(med))

    g.retangulo(0, prof, largura, 4, esc)  # aresta frontal
    g.linha_h(0, prof, largura, med)
    for px in (largura // 6, largura - largura // 6 - 6):  # pés em painel
        g.retangulo(px, prof + 4, 6, altura - prof - 4, mais_escuro(esc))
        g.linha_v(px, prof + 4, altura - prof - 4, esc)
    return g


def mesa_alta(largura: int = 26, altura: int = 44, ramp: str = MADEIRA) -> Grade:
    """Mesa bistrô: tampo redondo, coluna e disco. O prop do cafezinho."""
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    cx = largura // 2
    _elipse(g, cx, 3, largura // 2 - 1, 3, med)
    _elipse(g, cx, 2, largura // 2 - 2, 2, mais_claro(med))
    g.linha_h(1, 5, largura - 2, esc)
    g.retangulo(cx - 2, 6, 4, altura - 10, "3")
    g.linha_v(cx - 2, 6, altura - 10, "5")
    g.linha_v(cx + 1, 6, altura - 10, "2")
    _elipse(g, cx, altura - 3, largura // 2 - 3, 2, "2")
    _elipse(g, cx, altura - 4, largura // 2 - 4, 1, "4")
    return g


def banqueta(altura: int = 30) -> Grade:
    """Banqueta alta de balcão. Duas por balcão já vendem "lugar de parar"."""
    g = Grade(14, altura)
    _elipse(g, 7, 2, 6, 2, "o")
    _elipse(g, 7, 1, 5, 1, "p")
    g.linha_h(1, 4, 12, "n")
    for px in (2, 11):
        g.linha_v(px, 5, altura - 6, "3")
        g.ponto(px, 5, "5")
    g.linha_h(2, altura - 10, 10, "3")
    g.linha_h(1, altura - 1, 12, "2")
    return g


# ------------------------------------------------------------- tecnologia


def _conteudo_tela(g: Grade, x: int, y: int, w: int, h: int, tipo: str) -> None:
    """Conteúdo de tela ligada, em 4 casas da rampa `tela`.

    Nunca texto de verdade: o spec proíbe fonte pixelada e, a 4x, uma linha de
    texto de 3px viraria borrão cinza em vídeo comprimido. O que lê como texto
    aqui é a MÉTRICA — filas de tracinhos de comprimento irregular.
    """
    fundo, meio, claro, brilho = TELA[0], TELA[2], TELA[3], TELA[4]
    g.retangulo(x, y, w, h, fundo)
    g.dither(x, y, w, h, fundo, TELA[1], "esparso")

    if tipo == "log":
        # log de madrugada: filas densas, uma delas destacada (o erro)
        for i, ly in enumerate(range(y + 1, y + h - 1, 2)):
            comp = 3 + ((i * 7) % max(2, w - 6))
            tom = brilho if i == 3 else meio
            g.linha_h(x + 2, ly, min(comp, w - 4), tom)
    elif tipo == "login":
        cxx = x + w // 2
        g.moldura(cxx - w // 3, y + h // 4, 2 * (w // 3), h // 2, meio)
        for i in range(2):
            g.linha_h(cxx - w // 4, y + h // 4 + 2 + i * 3, w // 2, claro)
        g.linha_v(cxx - w // 4, y + h // 4 + 8, 2, brilho)  # cursor
    elif tipo == "desktop":
        g.retangulo(x, y, w, 2, meio)  # barra de título
        for i in range(3):
            g.retangulo(x + 2 + i * 4, y + 4, 3, 3, claro)
        g.moldura(x + w // 3, y + h // 3, w // 2, h // 2, claro)
        g.dither(x + w // 3 + 1, y + h // 3 + 1, w // 2 - 2, h // 2 - 2, fundo, meio, "esparso")
    elif tipo == "grafico":
        for i in range(4):
            alto = 2 + ((i * 5) % max(2, h - 4))
            g.retangulo(x + 2 + i * 4, y + h - 1 - alto, 3, alto, claro)
        linha(g, x + 2, y + h - 3, x + w - 3, y + 2, brilho)
    elif tipo == "diagrama":
        # Conteúdo mais CLARO que as outras telas de propósito: a TV do Bloco 4
        # é um objeto de 72x44 pendurado numa parede clara, e com o diagrama só
        # em contorno ela lia como um buraco preto. Caixa preenchida, contorno
        # no tom mais claro da rampa e conector de 2px.
        g.dither(x, y, w, h, fundo, TELA[1], "xadrez")
        g.retangulo(x + 2, y + 2, w - 4, 3, meio)
        g.linha_h(x + 2, y + 2, (w - 4) // 2, brilho)
        cy = y + h // 2 + 2
        larg_caixa = max(6, w // 4 - 1)
        for i in range(3):
            bx = x + 3 + i * (w // 3)
            g.retangulo(bx, cy - 4, larg_caixa, 9, meio)
            g.moldura(bx, cy - 4, larg_caixa, 9, brilho)
            g.linha_h(bx + 2, cy - 1, larg_caixa - 4, claro)
            if i < 2:
                vao = (w // 3) - larg_caixa
                g.linha_h(bx + larg_caixa, cy - 1, max(1, vao), brilho)
                g.linha_h(bx + larg_caixa, cy, max(1, vao), claro)
        g.linha_h(x + 4, y + h - 3, w - 8, meio)
    elif tipo == "processo":
        # Painel de acompanhamento da linha: quatro etapas em fila e a TERCEIRA
        # atrasada, com a fila acumulada embaixo dela. É o conteúdo que a fase 3
        # inteira depende de a plateia ler, e ele repete em tela o que a esteira
        # já diz em planta — redundância deliberada: quem não notou o gargalo na
        # esteira nota no painel, e vice-versa.
        #
        # Âmbar e não VERMELHO na etapa lenta, de propósito. A linha de produção
        # gasta o seu único acento vermelho na torre de sinalização em alerta
        # (bíblia §3), e um segundo vermelho a 192px de distância dividiria o
        # olho exatamente no ponto que a cena existe para apontar. Âmbar é a
        # mesma linguagem da torre sem disputar com ela.
        g.linha_h(x + 2, y + 1, w - 4, meio)
        g.linha_h(x + 2, y + 2, (w - 4) // 2, claro)
        cy = y + h // 2
        larg_etapa = max(4, (w - 6) // 4 - 2)
        passo = larg_etapa + 2
        for i in range(4):
            bx = x + 3 + i * passo
            lenta = i == 2
            corpo = LUZ[1] if lenta else VERDE[1]
            borda = LUZ[4] if lenta else VERDE[4]
            alto = 8 if lenta else 6
            g.retangulo(bx, cy - alto // 2, larg_etapa, alto, corpo)
            g.moldura(bx, cy - alto // 2, larg_etapa, alto, borda)
            if i < 3:  # conector entre etapas
                g.linha_h(bx + larg_etapa, cy, 2, claro)
        for i in range(4):
            # fila de peças esperando: barra comprida sob a etapa lenta contra
            # três curtas. Comprimento é a informação; cor só reforça.
            bx = x + 3 + i * passo
            comp = larg_etapa if i == 2 else max(1, larg_etapa // 3)
            g.linha_h(bx, y + h - 3, comp, LUZ[3] if i == 2 else meio)
            g.linha_h(bx, y + h - 2, comp, LUZ[1] if i == 2 else fundo)
    elif tipo == "certificado":
        g.retangulo(x + 2, y + 2, w - 4, h - 4, "7")  # folha clara
        for i in range(3):
            g.linha_h(x + 5, y + 5 + i * 3, w - 12, "4")
        _elipse(g, x + w - 7, y + h - 6, 3, 3, "y")  # selo
        _elipse(g, x + w - 7, y + h - 6, 2, 2, "x")
    elif tipo == "slide":
        g.linha_h(x + 3, y + 3, w - 8, brilho)
        for i in range(3):
            g.linha_h(x + 5, y + 7 + i * 3, w - 12 - i * 2, claro)
    elif tipo == "dash":
        g.moldura(x + 1, y + 1, w // 2 - 1, h - 2, meio)
        for i in range(3):
            g.linha_h(x + 3, y + 3 + i * 3, w // 2 - 6, claro)
        for i in range(4):
            alto = 2 + ((i * 3) % max(2, h - 5))
            g.retangulo(x + w // 2 + 2 + i * 3, y + h - 2 - alto, 2, alto, brilho)
    else:
        g.dither(x + 1, y + 1, w - 2, h - 2, fundo, meio, "xadrez")


def monitor(
    largura: int = 34,
    altura: int = 28,
    conteudo: str = "log",
    *,
    com_pe: bool = True,
) -> Grade:
    """Monitor ligado. A tela acesa é obrigatória em toda cena (bíblia §3)."""
    g = Grade(largura, altura)
    corpo_h = altura - (6 if com_pe else 0)
    g.retangulo(0, 0, largura, corpo_h, "2")
    _borda_de_volume(g, 0, 0, largura, corpo_h, "4", "1")
    _conteudo_tela(g, 2, 2, largura - 4, corpo_h - 5, conteudo)
    g.linha_h(2, corpo_h - 2, largura - 4, "3")  # queixo do monitor
    if com_pe:
        cx = largura // 2
        g.retangulo(cx - 2, corpo_h, 4, 4, "2")
        g.linha_v(cx - 2, corpo_h, 4, "4")
        g.retangulo(cx - 7, altura - 2, 14, 2, "3")
        g.linha_h(cx - 7, altura - 2, 14, "5")
    return g


def notebook(largura: int = 30, altura: int = 22, conteudo: str = "login") -> Grade:
    """Notebook aberto: tela inclinada + base em cunha + faixa de teclado.

    A base é uma cunha (mais larga na frente) e não um retângulo: retângulo lê
    como livro fechado, cunha lê como notebook visto de frente-cima.
    """
    g = Grade(largura, altura)
    tela_h = altura - 6
    g.retangulo(2, 0, largura - 4, tela_h, "2")
    _borda_de_volume(g, 2, 0, largura - 4, tela_h, "4", "1")
    _conteudo_tela(g, 4, 2, largura - 8, tela_h - 3, conteudo)

    for i in range(4):  # base em cunha
        y = tela_h + i
        recuo = max(0, 2 - i)
        g.retangulo(recuo, y, largura - 2 * recuo, 1, "5" if i == 0 else "4")
    g.linha_h(0, altura - 2, largura, "3")
    g.linha_h(0, altura - 1, largura, "2")
    g.dither(3, tela_h + 1, largura - 6, 2, "4", "3", "xadrez")  # teclado
    return g


def notebook_fechado(largura: int = 26, altura: int = 7) -> Grade:
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "3")
    _borda_de_volume(g, 0, 0, largura, altura, "5", "1")
    g.linha_h(2, altura - 2, largura - 4, "2")
    g.ponto(largura - 4, 1, "L")  # LED de carga
    return g


def rack_servidor(largura: int = 34, altura: int = 82, *, leds: bool = True) -> Grade:
    """Rack com colunas de LED ciano. A identidade do laboratório.

    LED só ciano/verde: um LED vermelho de 1px ainda conta como acento
    vermelho quando há 40 deles, e a regra é UM acento vermelho por cena.
    """
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "1")
    _borda_de_volume(g, 0, 0, largura, altura, "3", CONTORNO)
    g.dither(1, 1, largura - 2, altura - 2, "1", "2", "esparso")
    y = 3
    k = 0
    while y < altura - 5:
        alto = 5 + (k % 3)
        g.retangulo(2, y, largura - 4, alto, "2")
        g.linha_h(2, y, largura - 4, "3")
        g.linha_h(2, y + alto - 1, largura - 4, "1")
        g.dither(3, y + 1, largura - 6, alto - 2, "2", "1", "xadrez")  # grelha
        if leds:
            for i in range(3):
                tom = TELA[4] if (k + i) % 4 == 0 else TELA[3] if (k + i) % 2 == 0 else TELA[1]
                g.ponto(largura - 5 - i * 2, y + 1, tom)
            if k % 3 == 0:
                g.ponto(4, y + alto - 2, VERDE[4])
        y += alto + 1
        k += 1
    g.retangulo(1, altura - 3, largura - 2, 3, "1")
    g.linha_h(1, altura - 3, largura - 2, "2")
    return g


def telefone(largura: int = 15, altura: int = 8) -> Grade:
    g = Grade(largura, altura)
    g.retangulo(0, 3, largura, altura - 3, "2")
    _borda_de_volume(g, 0, 3, largura, altura - 3, "4", "1")
    g.retangulo(1, 0, largura - 2, 3, "3")  # monofone
    g.linha_h(1, 0, largura - 2, "5")
    g.dither(2, 5, largura - 8, 2, "1", "3", "xadrez")  # teclas
    g.ponto(largura - 3, 5, TELA[3])
    return g


def projetor(largura: int = 26, altura: int = 13) -> Grade:
    """Projetor de teto. Vem com o suporte: projetor sem haste flutua."""
    g = Grade(largura, altura)
    cx = largura // 2
    g.retangulo(cx - 1, 0, 3, 4, "3")  # haste
    g.linha_v(cx - 1, 0, 4, "5")
    g.retangulo(1, 4, largura - 2, altura - 6, "6")
    _borda_de_volume(g, 1, 4, largura - 2, altura - 6, "7", "3")
    g.dither(2, 5, largura - 4, altura - 8, "6", "5", "esparso")
    _elipse(g, largura - 6, altura - 4, 3, 2, "1")
    _elipse(g, largura - 6, altura - 4, 2, 1, LUZ[5])  # lente acesa
    g.linha_h(2, altura - 2, 6, "4")
    return g


def tv_de_parede(largura: int = 62, altura: int = 38, conteudo: str = "diagrama") -> Grade:
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "1")
    _borda_de_volume(g, 0, 0, largura, altura, "3", CONTORNO)
    _conteudo_tela(g, 2, 2, largura - 4, altura - 4, conteudo)
    return g


def cabo(g: Grade, pontos: list[tuple[int, int]], tom: str = "1") -> None:
    """Cabo: polilinha + 1px mais escuro embaixo, para não ler como arranhão."""
    for i in range(len(pontos) - 1):
        (x0, y0), (x1, y1) = pontos[i], pontos[i + 1]
        linha(g, x0, y0, x1, y1, tom)
        linha(g, x0, y0 + 1, x1, y1 + 1, mais_escuro(tom))


# -------------------------------------------------------------------- vida


def _folha(g: Grade, x: int, y: int, dx: int, dy: int, comp: int, tom: str) -> None:
    """Folha afilada: engrossa no meio e fecha na ponta."""
    for i in range(comp):
        t = i / max(1, comp - 1)
        px = x + round(dx * t * comp / max(1, comp))
        py = y + round(dy * t * comp / max(1, comp))
        grossura = 2 if 0.2 < t < 0.75 else 1
        for k in range(grossura):
            g.ponto(px + k, py, tom if t < 0.8 else mais_claro(tom))


def vaso_planta_alta(altura: int = 62) -> Grade:
    """Planta de folha lanceolada (espécie 1). Toda cena precisa de uma."""
    g = Grade(34, altura)
    cx = 17
    vaso_h = 14
    topo = altura - vaso_h

    hastes = (
        (-4, -1, 16, VERDE[2]),
        (4, -1, 18, VERDE[3]),
        (-2, -1, 22, VERDE[3]),
        (3, -1, 13, VERDE[1]),
        (-6, -1, 11, VERDE[1]),
        (6, -1, 14, VERDE[4]),
        (0, -1, 25, VERDE[2]),
    )
    for dx, dy, comp, tom in hastes:
        _folha(g, cx + dx // 2, topo - 1, dx // 5 if dx else 0, dy, comp, tom)
        linha(g, cx, topo, cx + dx, topo - comp, tom)
        linha(g, cx + dx, topo - comp, cx + dx + (2 if dx >= 0 else -2), topo - comp + 3, mais_claro(tom))

    g.retangulo(cx - 8, topo, 16, vaso_h, MADEIRA[3])  # vaso
    for i in range(vaso_h):  # afunila
        recuo = i // 4
        g.ponto(cx - 8 + recuo - 1, topo + i, VAZIO)
        g.ponto(cx + 8 - recuo, topo + i, VAZIO)
        g.ponto(cx - 8 + recuo, topo + i, MADEIRA[4])
        g.ponto(cx + 7 - recuo, topo + i, MADEIRA[1])
    g.retangulo(cx - 9, topo, 18, 2, MADEIRA[4])
    g.linha_h(cx - 9, topo, 18, MADEIRA[5])
    g.dither(cx - 7, topo + 3, 14, vaso_h - 5, MADEIRA[3], MADEIRA[2], "esparso")
    g.dither(cx - 6, topo + 1, 12, 1, VERDE[0], MADEIRA[1], "xadrez")  # terra
    return g


def vaso_planta_baixa(largura: int = 22) -> Grade:
    """Planta arbustiva (espécie 2). Duas espécies porque a mesma planta
    repetida em seis cenas lê como carimbo."""
    g = Grade(largura, 24)
    cx = largura // 2
    for raio, tom in ((8, VERDE[1]), (6, VERDE[2]), (4, VERDE[3])):
        _elipse(g, cx, 9, raio, raio - 2, tom)
    g.dither(cx - 7, 4, 14, 8, VERDE[2], VERDE[3], "esparso")
    for dx in (-6, -2, 3, 6):  # pontas soltas quebram o ovo verde
        g.ponto(cx + dx, 2 + abs(dx) // 3, VERDE[4])
        g.ponto(cx + dx, 3 + abs(dx) // 3, VERDE[3])
    g.retangulo(cx - 5, 16, 10, 8, "5")
    _borda_de_volume(g, cx - 5, 16, 10, 8, "6", "3")
    g.linha_h(cx - 6, 16, 12, "6")
    return g


def caneca(cor: str = VERMELHO[3], *, vapor: bool = False) -> Grade:
    """Caneca 9x9 com asa. Com `vapor`, três pixels acima — vida por 3 pixels."""
    g = Grade(11, 13 if vapor else 9)
    base_y = 4 if vapor else 0
    g.retangulo(1, base_y, 7, 9, cor)
    _borda_de_volume(g, 1, base_y, 7, 9, mais_claro(cor), mais_escuro(cor))
    g.linha_h(2, base_y, 5, mais_claro(cor))
    g.linha_v(8, base_y + 2, 4, mais_escuro(cor))  # asa
    g.ponto(9, base_y + 3, mais_escuro(cor))
    g.ponto(9, base_y + 4, mais_escuro(cor))
    g.dither(2, base_y + 1, 5, 2, cor, mais_claro(cor), "esparso")
    if vapor:
        for i, (dx, dy) in enumerate(((3, 3), (4, 2), (3, 1), (5, 0))):
            g.ponto(dx, dy, "7" if i % 2 else "6")
    return g


def luminaria_de_mesa() -> Grade:
    """Luminária de mesa com cúpula acesa. A ilha quente da mesa da Ana."""
    g = Grade(18, 26)
    g.retangulo(2, 22, 12, 4, "2")  # base
    g.linha_h(2, 22, 12, "4")
    linha(g, 8, 22, 12, 10, "3")
    linha(g, 9, 22, 13, 10, "2")
    for i in range(6):  # cúpula
        w = 12 - i
        g.retangulo(8 - w // 2 + 2, 4 + i, w, 1, MADEIRA[2] if i < 3 else MADEIRA[1])
    g.linha_h(6, 4, 9, MADEIRA[4])
    g.retangulo(7, 10, 7, 2, LUZ[5])  # lâmpada
    g.dither(6, 12, 9, 3, VAZIO, LUZ[3], "esparso")  # halo descendo
    return g


def luminaria_pendente(altura: int = 34) -> Grade:
    g = Grade(22, altura)
    cx = 11
    g.linha_v(cx, 0, altura - 12, "1")
    g.linha_v(cx + 1, 0, altura - 12, "2")
    for i in range(7):  # cone
        w = 4 + i * 3
        g.retangulo(cx - w // 2, altura - 12 + i, w, 1, "3" if i < 4 else "2")
    g.linha_h(cx - 2, altura - 12, 5, "5")
    g.retangulo(cx - 4, altura - 5, 9, 2, LUZ[5])
    g.dither(cx - 6, altura - 3, 13, 3, VAZIO, LUZ[3], "esparso")
    return g


def quadro_branco(largura: int = 58, altura: int = 38, *, rabisco: bool = True) -> Grade:
    """Quadro branco com moldura de alumínio, calha e rabisco.

    O rabisco é caixa-e-flecha em ciano e azul, nunca letra: letra de 3px em
    vídeo comprimido é sujeira, e a bíblia proíbe texto dentro do cenário.
    """
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura - 3, "7")
    g.dither(1, 1, largura - 2, altura - 5, "7", "8", "esparso")
    g.moldura(0, 0, largura, altura - 3, "5")
    g.linha_h(0, 0, largura, "6")
    g.linha_h(0, altura - 4, largura, "4")
    g.retangulo(2, altura - 3, largura - 4, 3, "5")  # calha
    g.linha_h(2, altura - 3, largura - 4, "6")
    if rabisco:
        g.moldura(5, 6, 13, 8, "a")
        g.moldura(largura - 22, 6, 13, 8, TELA[2])
        g.linha_h(18, 10, largura - 40, "a")
        g.ponto(largura - 23, 9, "a")
        g.ponto(largura - 23, 11, "a")
        g.moldura(largura // 2 - 6, altura - 16, 12, 7, TELA[2])
        linha(g, 11, 14, largura // 2 - 6, altura - 14, "a")
        for i in range(3):
            g.linha_h(7, altura - 14 + i * 2, 9, "5")
        g.retangulo(largura - 10, altura - 3, 3, 1, VERMELHO[3])  # pincel
    return g


def cartaz(largura: int = 26, altura: int = 34, acento: str = TELA[3]) -> Grade:
    """Cartaz de parede: moldura, um bloco de cor e filas de "texto"."""
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "7")
    g.moldura(0, 0, largura, altura, "4")
    g.linha_h(0, 0, largura, "6")
    g.retangulo(2, 2, largura - 4, altura // 2 - 2, acento)
    g.dither(3, 3, largura - 6, altura // 2 - 4, acento, mais_claro(acento), "esparso")
    _elipse(g, largura // 2, altura // 4, 4, 4, mais_claro(acento, 2))
    for i in range(4):
        g.linha_h(3, altura // 2 + 2 + i * 3, largura - 6 - (i % 2) * 5, "4")
    return g


def pilha_de_papel(largura: int = 13, altura: int = 7) -> Grade:
    """Pilha de folhas: cada folha 1px deslocada. Sem o desalinho é um tijolo."""
    g = Grade(largura, altura)
    for i in range(altura):
        desloca = (i % 3) - 1
        g.retangulo(1 + desloca, altura - 1 - i, largura - 2, 1, "8" if i % 2 else "7")
        g.ponto(1 + desloca, altura - 1 - i, "6")
    g.linha_h(1, altura - 1, largura - 2, "5")
    return g


def caixa_papelao(largura: int = 22, altura: int = 18, *, aberta: bool = False) -> Grade:
    """Caixa de papelão. LISA, com fita e dobra de canto.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI: o corpo era um dither esparso de duas
    casas da madeira, e a 4x isso deu trama — as caixas do Innovation e do
    laboratório saíram lendo como cestos de vime.
    """
    g = Grade(largura, altura)
    g.caixa_com_volume(0, 0, largura, altura, MADEIRA)
    g.linha_v(largura // 2, 1, altura - 2, MADEIRA[2])  # emenda de fita
    g.linha_v(largura // 2 + 1, 1, altura - 2, MADEIRA[4])
    linha(g, 0, altura - 5, 4, altura - 1, MADEIRA[2])  # dobra do canto
    if aberta:
        for i in range(4):  # abas abertas para fora
            g.linha_h(0, i, largura // 2 - i, MADEIRA[4])
            g.linha_h(largura // 2 + i, i, largura // 2 - i, MADEIRA[2])
        g.retangulo(2, 4, largura - 4, 4, "1")  # miolo escuro
        g.dither(2, 7, largura - 4, 1, "1", MADEIRA[1], "xadrez")
    else:
        g.linha_h(1, 1, largura - 2, MADEIRA[4])
        g.retangulo(2, altura // 2 - 1, largura - 4, 2, "7")  # etiqueta
        g.linha_h(2, altura // 2 - 1, largura - 4, "8")
    return g


def bebedouro(altura: int = 46) -> Grade:
    g = Grade(20, altura)
    g.retangulo(3, 14, 14, altura - 14, "6")
    _borda_de_volume(g, 3, 14, 14, altura - 14, "7", "4")
    g.dither(4, 15, 12, altura - 16, "6", "7", "esparso")
    for i in range(14):  # galão
        w = 12 - abs(7 - i) // 2
        g.retangulo(10 - w // 2, i, w, 1, TELA[1] if i > 3 else "5")
    g.dither(5, 4, 10, 9, TELA[1], TELA[2], "esparso")
    g.retangulo(6, 20, 8, 3, "4")  # torneira e bandeja
    g.linha_h(6, 20, 8, "5")
    g.ponto(13, 22, "3")
    g.retangulo(5, altura - 3, 10, 3, "3")
    return g


def garrafa_agua(altura: int = 15) -> Grade:
    g = Grade(7, altura)
    g.retangulo(2, 0, 3, 3, "5")  # tampa
    g.retangulo(1, 3, 5, altura - 3, TELA[1])
    _borda_de_volume(g, 1, 3, 5, altura - 3, TELA[3], TELA[0])
    g.dither(2, 5, 3, altura - 7, TELA[1], TELA[2], "esparso")
    return g


def post_it(cor: str = LUZ[4]) -> Grade:
    """Post-it 6x6 com dobra e dois rabiscos. A unidade do Innovation."""
    g = Grade(6, 6)
    g.retangulo(0, 0, 6, 6, cor)
    g.linha_h(0, 0, 6, mais_claro(cor))
    g.linha_h(0, 5, 6, mais_escuro(cor))
    g.linha_v(5, 0, 6, mais_escuro(cor))
    g.linha_h(1, 2, 3, mais_escuro(cor, 2))
    g.linha_h(1, 4, 2, mais_escuro(cor, 2))
    return g


def painel_de_post_its(largura: int = 54, altura: int = 40, *, com_fundo: bool = True) -> Grade:
    """Grade de post-its. Sem vermelho: o acento vermelho da cena é único."""
    g = Grade(largura, altura)
    if com_fundo:
        g.retangulo(0, 0, largura, altura, MADEIRA[2])
        g.dither(1, 1, largura - 2, altura - 2, MADEIRA[2], MADEIRA[1], "esparso")
        g.moldura(0, 0, largura, altura, MADEIRA[1])
        g.linha_h(0, 0, largura, MADEIRA[3])
    cores = (LUZ[4], VERDE[3], TELA[3], LUZ[2], VERDE[4], LUZ[5], TELA[2])
    k = 0
    for y in range(3, altura - 7, 8):
        for x in range(3, largura - 7, 8):
            if (x + y) % 24 == 3:  # uma falha na grade: mural cheio lê como azulejo
                k += 1
                continue
            nota = post_it(cores[k % len(cores)])
            g.colar(x + (k % 2), y + ((k // 2) % 2), nota)
            k += 1
    return g


# ------------------------------------------------------------ arquitetura


_CEU_POR_HORA: dict[str, str] = {
    # Sol baixo, laranja forte: é a hora do escritório e o único calor do fundo.
    "poente": "uvwx",
    # Sol mais alto e mais claro. Fim de tarde, não poente: serve ao cafezinho,
    # que é a cena quente e não pode estar na mesma hora que a cena fria.
    "dourada": "vwxz",
    # Azul frio em cima e só uma faixa quente rente ao horizonte. A janela para
    # de ser fonte de luz e passa a ser fundo — é o que a sala de reuniões pede,
    # porque lá a luz é a calha do teto e não a janela.
    "anoitecer": "bcuv",
    # Nublado, sem calor nenhum. Único caso em que a janela não pede poça.
    "dia": "cde6",
}
"""Céu por hora do dia, de cima para baixo na rampa.

Existe para que duas cenas com janela não estejam na mesma hora. Não basta:
a `vista` também tem de mudar, porque o padrão de torres da skyline é um
desenho reconhecível e sobrevive a qualquer troca de céu.
"""


def _vista_cidade(g: Grade, x0: int, base: int, largura: int, quente: bool) -> None:
    """Skyline: torres de altura irregular na base do céu, quase silhueta.

    A vista de andar alto, e a que existia antes. Fica com o escritório, que é a
    cena que precisa de distância — horizonte é o que dá a sensação de estar
    acima da cidade, e é o que faz a janela dele ser a mais dramática das três.
    """
    x = x0
    k = 0
    while x < x0 + largura - 1:
        w = 4 + (k % 4)
        h = 5 + ((k * 7) % 14)
        g.retangulo(x, base - h, min(w, x0 + largura - x), h, "a" if k % 2 else "b")
        for jy in range(base - h + 2, base - 1, 3):  # janelinhas acesas
            if (k + jy) % 3 == 0:
                g.ponto(x + 1, jy, LUZ[4] if quente else TELA[3])
        x += w + 1
        k += 1


def _vista_copa(g: Grade, x0: int, base: int, largura: int, altura_vidro: int) -> None:
    """Copa de árvore ocupando o terço de baixo do vão: vista de andar baixo.

    Entra porque a MESMA skyline aparecia em três das seis cenas e a revisão leu
    a janela como um asset carimbado. Trocar a hora do dia não bastaria: o que
    denuncia a repetição é o padrão de torres, que é um desenho reconhecível.
    Folhagem muda a silhueta inteira do vão, e de quebra põe verde numa cena.

    Lóbulos de alturas diferentes com o topo em tom claro, porque massa verde de
    tom único lê como tapume pintado. O tronco sai fora do centro: simetria é o
    que faz arte gerada parecer gerada.
    """
    alto = max(6, round(altura_vidro * 0.44))
    topo = base - alto

    # silhueta distante ATRÁS da copa. Sem ela a folhagem flutua sobre o céu e o
    # vão perde a profundidade que a skyline dava de graça.
    x = x0
    k = 0
    while x < x0 + largura - 1:
        h = 3 + ((k * 5) % 6)
        g.retangulo(x, base - h - 2, min(5 + (k % 3), x0 + largura - x), h, "b")
        x += 6 + (k % 3)
        k += 1

    x = x0
    k = 0
    while x < x0 + largura:
        w = min(5 + (k % 4), x0 + largura - x)
        sobe = (k * 3) % 7
        h = alto - sobe
        if h <= 1 or w <= 0:
            x += max(1, w)
            k += 1
            continue
        g.retangulo(x, topo + sobe, w, h, VERDE[1])
        g.dither(x, topo + sobe, w, h, VERDE[1], VERDE[0], "xadrez")
        g.linha_h(x, topo + sobe, w, VERDE[2])
        if k % 2 == 0:  # o sol pega só uma folha a cada duas
            g.linha_h(x + 1, topo + sobe, max(1, w - 3), VERDE[3])
        x += w
        k += 1

    tx = x0 + largura // 3  # tronco fora do centro
    g.linha_v(tx, base - 4, 4, MADEIRA[0])
    g.linha_v(tx + 1, base - 4, 4, MADEIRA[1])


def _vista_vizinho(
    g: Grade, x0: int, y0: int, largura: int, altura_vidro: int, quente: bool
) -> None:
    """Fachada do prédio vizinho, perto: vista bloqueada e uma fresta de céu.

    A terceira variação, e a mais diferente das outras duas: em vez de horizonte,
    uma parede com grade de janelas ocupando quase todo o vão. É a vista de sala
    interna — e é ela que faz a janela da sala de reuniões não ser a janela do
    escritório mesmo com o caixilho parecido.

    A fresta de céu no alto não é enfeite: sem ela a janela vira um quadro escuro
    pendurado, porque nada dentro do vão diz que ali existe exterior.
    """
    fresta = max(2, round(altura_vidro * 0.24))
    topo = y0 + fresta
    alto = altura_vidro - fresta
    g.retangulo(x0, topo, largura, alto, "b")
    g.dither(x0, topo, largura, alto, "b", "a", "esparso")
    g.linha_h(x0, topo, largura, "c")  # parapeito do vizinho, pega a luz do céu

    k = 0
    for jy in range(topo + 3, y0 + altura_vidro - 4, 7):
        for jx in range(x0 + 2, x0 + largura - 6, 9):
            sorte = (k * 5 + jy) % 7
            if sorte == 0:
                tom, realce = (LUZ[2], LUZ[4]) if quente else (TELA[1], TELA[3])
            elif sorte == 3:
                tom, realce = TELA[0], TELA[2]
            else:
                # a maioria apagada: o calor só é calor se a maioria estiver
                # escura. Foi a lição da fachada do mapa, que com 40% acesas
                # virou árvore de natal.
                tom, realce = "a", "b"
            g.retangulo(jx, jy, 6, 4, tom)
            g.linha_h(jx, jy, 6, realce)
            k += 1


def janela(
    largura: int = 100,
    altura: int = 64,
    *,
    poente: bool = True,
    hora: str = "",
    vista: str = "cidade",
    montantes: int = 1,
    travessas: int = 1,
    peitoril: int = 3,
) -> Grade:
    """Janela com céu, vista, caixilho e peitoril — parametrizada.

    A versão `poente` é o truque roubado da terceira referência: luz quente
    pontual num campo frio é o que dá drama. Ela vem acompanhada de
    `poca_de_janela()` no piso, senão é adesivo (bíblia §3).

    POR QUE ESTA FUNÇÃO TEM SEIS PARÂMETROS E NÃO UM
    Ela era `janela(largura, altura, poente=True)` e a única variação possível era
    a caixa. Resultado medido pela revisão: escritório, cafezinho e sala de
    reuniões — metade das cenas — exibiam a MESMA janela, mesmo céu, mesmo
    caixilho de um montante no centro, mesma skyline, mesmo peitoril de 3px. Três
    ocorrências do mesmo desenho em seis cenas é o que a plateia lê como
    biblioteca de asset reaproveitada, e é pior que uma cena vazia porque parece
    descuido em vez de escolha.

    Os quatro eixos de variação escolhidos são os que mudam a SILHUETA do vão, não
    só a cor dele: quantidade de montantes e travessas (a grade do caixilho),
    altura do peitoril, o que se vê através (`vista`) e a hora (`hora`). Trocar só
    a hora não resolveria — o padrão de torres da skyline é um desenho
    reconhecível e apareceria igual nas três de qualquer cor que fosse o céu.
    """
    g = Grade(largura, altura)
    tons = _CEU_POR_HORA[hora or ("poente" if poente else "dia")]
    quente = tons[-1] in LUZ
    g.retangulo(0, 0, largura, altura, "2")

    # o vidro termina onde o peitoril começa, e a moldura fecha na linha de cima
    # dele. Derivar do peitoril em vez de usar os `altura - 4` e `altura - 7`
    # cravados de antes é o que permite peitoril grosso sem o vidro invadir.
    y_moldura = altura - peitoril - 1
    h_vidro = max(4, y_moldura - 2)
    g.degrade_v(2, 2, largura - 4, h_vidro, tons)
    base = 2 + h_vidro

    if vista == "copa":
        _vista_copa(g, 2, base, largura - 4, h_vidro)
    elif vista == "vizinho":
        _vista_vizinho(g, 2, 2, largura - 4, h_vidro, quente)
    else:
        _vista_cidade(g, 2, base, largura - 4, quente)

    g.moldura(0, 0, largura, y_moldura + 1, "3")
    g.linha_h(0, 0, largura, "4")
    for i in range(montantes):
        px = round((i + 1) * (largura - 1) / (montantes + 1))
        g.linha_v(px, 1, y_moldura - 1, "3")
        g.linha_v(px + 1, 1, y_moldura - 1, "2")
    for i in range(travessas):
        py = 2 + round((i + 1) * h_vidro / (travessas + 1))
        g.linha_h(1, py, largura - 2, "5")  # aresta de cima do perfil, iluminada
        g.linha_h(1, py + 1, largura - 2, "3")

    g.retangulo(-1, altura - peitoril, largura + 2, peitoril, "6")
    g.linha_h(0, altura - peitoril, largura, "7")
    g.linha_h(0, altura - 1, largura, "4")
    if peitoril >= 5:
        # peitoril grosso precisa de aresta e sombra próprias: sem elas uma faixa
        # de 6px de tom único vira tarja cinza atravessando a parede.
        g.linha_h(0, altura - peitoril + 2, largura, "5")
        g.dither(0, altura - peitoril + 3, largura, peitoril - 4, "6", "5", "esparso")
    return g


def porta(largura: int = 34, altura: int = 74, *, aberta: bool = False) -> Grade:
    """Porta. Aberta = vão quente com poça: é a terceira fonte de luz do jogo."""
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "3")  # batente
    g.linha_h(0, 0, largura, "5")
    g.linha_v(0, 0, altura, "5")
    g.linha_v(largura - 1, 0, altura, "1")
    if aberta:
        # O vão não é um retângulo laranja: é um CORREDOR. Teto escuro em cima,
        # piso muito claro embaixo e a sombra do batente à esquerda. Sem essas
        # três coisas o vão lê como faixa de cor colada na parede — foi o que
        # aconteceu na primeira folha de contato da sala de treinamento.
        vao_x, vao_w = 3, largura - 11
        g.retangulo(vao_x, 3, vao_w, altura - 3, LUZ[1])
        g.degrade_v(vao_x, 3, vao_w, altura - 15, "uvw")
        g.retangulo(vao_x, 5, vao_w, 4, mais_escuro(LUZ[0]))  # teto do corredor
        g.dither(vao_x, 9, vao_w, 2, LUZ[0], LUZ[1], "xadrez")
        g.retangulo(vao_x, altura - 12, vao_w, 12, LUZ[3])  # piso iluminado
        g.dither(vao_x, altura - 14, vao_w, 3, LUZ[2], LUZ[3], "xadrez")
        g.linha_h(vao_x, altura - 12, vao_w, LUZ[5])
        g.linha_v(vao_x, 3, altura - 3, LUZ[0])  # sombra do batente
        g.linha_v(vao_x + 1, 3, altura - 3, LUZ[1])
        g.retangulo(largura - 8, 2, 6, altura - 2, MADEIRA[2])  # folha encostada
        g.linha_v(largura - 8, 2, altura - 2, MADEIRA[4])
        g.linha_v(largura - 3, 2, altura - 2, MADEIRA[0])
        g.ponto(largura - 7, altura // 2, "6")
    else:
        g.retangulo(3, 3, largura - 6, altura - 3, MADEIRA[2])
        g.dither(4, 4, largura - 8, altura - 5, MADEIRA[2], MADEIRA[1], "esparso")
        g.moldura(6, 8, largura - 12, altura // 2 - 8, MADEIRA[1])
        g.linha_h(6, 8, largura - 12, MADEIRA[3])
        g.ponto(largura - 7, altura // 2, "6")  # maçaneta
        g.ponto(largura - 8, altura // 2, "4")
    return g


def rodape(g: Grade, y: int, *, x0: int = 0, x1: int | None = None, tom: str = "2") -> None:
    """Rodapé de 2px na junta parede-piso.

    Sem ele a parede não ENCOSTA no piso: os dois planos ficam empilhados como
    duas faixas de cor e a cena perde o canto da sala.
    """
    x1 = g.largura if x1 is None else x1
    g.linha_h(x0, y - 2, x1 - x0, mais_claro(tom, 2))
    g.linha_h(x0, y - 1, x1 - x0, tom)
    g.linha_h(x0, y, x1 - x0, mais_escuro(tom))


def placa_sinalizacao(largura: int = 18, altura: int = 11) -> Grade:
    """Placa de parede. Pictograma abstrato: seta + barra. Nunca texto."""
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "4")
    _borda_de_volume(g, 0, 0, largura, altura, "6", "2")
    g.retangulo(2, 2, largura - 4, altura - 4, "2")
    g.linha_h(4, altura // 2, largura - 9, "7")
    for i in range(3):  # ponta de seta
        g.ponto(largura - 5 - i, altura // 2 - 1 - i, "7")
        g.ponto(largura - 5 - i, altura // 2 + 1 + i, "7")
    return g


def extintor(altura: int = 24) -> Grade:
    """Extintor: O acento vermelho. Um por cena, nunca dois (bíblia §3)."""
    g = Grade(12, altura)
    g.retangulo(3, 4, 6, altura - 6, VERMELHO[3])
    _borda_de_volume(g, 3, 4, 6, altura - 6, VERMELHO[4], VERMELHO[1])
    g.ponto(3, 4, VAZIO)
    g.ponto(8, 4, VAZIO)
    g.retangulo(5, 1, 2, 3, "4")  # gargalo
    g.retangulo(4, 0, 5, 2, "5")  # gatilho
    g.linha_h(4, 0, 5, "6")
    linha(g, 8, 2, 10, 7, "2")  # mangueira
    linha(g, 10, 7, 9, 12, "2")
    g.retangulo(3, altura // 2, 6, 3, "7")  # etiqueta
    g.retangulo(1, altura - 5, 10, 2, "3")  # suporte de parede
    g.retangulo(4, altura - 2, 5, 2, VERMELHO[1])
    return g


def maquina_de_cafe(largura: int = 30, altura: int = 46) -> Grade:
    """Máquina de café de balcão. Usada como prop E como objeto interativo."""
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, altura, "4")
    _borda_de_volume(g, 0, 0, largura, altura, "6", "2")
    g.dither(1, 1, largura - 2, altura - 2, "4", "5", "esparso")
    g.retangulo(2, 2, largura - 4, 9, "2")  # painel superior
    for i in range(3):
        g.ponto(4 + i * 3, 5, TELA[3] if i == 0 else "6")
    g.retangulo(largura - 12, 4, 9, 5, TELA[0])
    g.dither(largura - 11, 5, 7, 3, TELA[0], TELA[2], "xadrez")  # visor aceso
    g.retangulo(3, 13, largura - 6, altura - 24, "5")  # nicho
    g.retangulo(5, 15, largura - 10, altura - 28, "1")
    g.dither(6, 16, largura - 12, altura - 30, "1", "2", "esparso")
    g.retangulo(largura // 2 - 4, 15, 8, 3, "6")  # bico
    g.linha_h(largura // 2 - 4, 15, 8, "7")
    g.retangulo(largura // 2 - 3, 18, 2, 2, MADEIRA[1])  # fio de café
    g.retangulo(4, altura - 11, largura - 8, 3, "3")  # grade de gotejamento
    g.dither(5, altura - 10, largura - 10, 1, "3", "2", "xadrez")
    g.retangulo(2, altura - 7, largura - 4, 5, "4")
    g.linha_h(2, altura - 7, largura - 4, "6")
    return g


def suporte_de_tv(largura: int = 14, altura: int = 6) -> Grade:
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, 2, "2")
    g.retangulo(largura // 2 - 1, 0, 3, altura, "3")
    g.linha_v(largura // 2 - 1, 0, altura, "4")
    return g



# ----------------------------------------------------- linha de produção
#
# POR QUE ESTA FAMÍLIA DE PROPS É AZUL, E NÃO NEUTRA
# `scripts/exportar_chao.py` reconhece piso pelo CHAR: neutro `12345678` e luz
# `uvwxyz` são piso, madeira `mnopqr` é móvel. Máquina desenhada em neutro
# entraria no mapa de chão como se fosse piso, e o teste `Cena.chao.test.ts`
# passaria a autorizar uma figura em pé SOBRE a esteira — que é a classe de
# defeito mais caro deste projeto, com outra fantasia.
#
# Então tudo que é maquinário aqui usa a rampa AZUL (mais o contorno `K`), que
# não pertence a nenhum dos dois conjuntos e portanto lê como obstáculo. De
# quebra é a escolha certa de arte: cinza-azulado é a cor de máquina industrial,
# e mantém a cena dentro dos ~70% frios da bíblia §3.


def esteira(
    largura: int = 120, altura: int = 30, *, roletes: bool = False, ramp: str = AZUL
) -> Grade:
    """Trecho de esteira visto de frente-cima: tampo, viga, pernas e vão.

    Mesma pilha de três valores da `mesa_de_trabalho` (tampo claro / viga média /
    vão quase preto) de propósito: é o que faz uma silhueta horizontal comprida
    ler como superfície de apoio em vez de tarja. Uma esteira desenhada como
    retângulo de tom único é indistinguível de uma divisória deitada.

    `roletes` troca a lona por roletes livres — transporte por gravidade e
    empurrão contra transporte motorizado.

    `ramp` EXISTE POR UM MOTIVO DE LEITURA, e foi acrescentado depois de olhar a
    cena. Com os três trechos na mesma rampa azul, a diferença entre lona e
    rolete não sobrevivia: a 4x, num trecho de 84px no meio de 400, textura de
    tampo não é sinal suficiente, e a etapa que a fase 3 inteira depende de a
    plateia notar simplesmente não aparecia. Trocar a FAMÍLIA de cor do trecho
    resolve de longe — o trecho velho sai em madeira/ferrugem contra o azul do
    maquinário novo, e aí "esta parte aqui é mais antiga que o resto" se lê antes
    de qualquer detalhe.

    Madeira também é móvel para `exportar_chao.py`, como o azul não é piso: as
    duas famílias servem, e nenhuma das duas abre buraco no mapa de chão.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    tampo = 5
    viga_base = min(altura - 8, tampo + 7)

    # tampo: a face que recebe a luz de cima
    g.retangulo(0, 0, largura, tampo, cla)
    g.linha_h(0, 0, largura, mais_claro(cla))
    if roletes:
        # rolete: barra transversal de 3px a cada 5, com a ponta iluminada. Passo
        # curto e barra GROSSA — com 2px a cada 6 (a primeira tentativa) o trecho
        # lia igual ao da lona a 4px por pixel de arte.
        for x in range(1, largura - 2, 5):
            g.linha_v(x, 1, tampo - 1, mais_claro(cla))
            g.linha_v(x + 1, 1, tampo - 1, med)
            g.linha_v(x + 2, 1, tampo - 1, esc)
    else:
        for x in range(2, largura - 1, 3):
            g.ponto(x, 2, med)
            g.ponto(x, 3, med)
    g.linha_h(0, tampo - 1, largura, esc)

    # viga lateral com parafusos: sem ela o tampo flutua sobre as pernas
    g.retangulo(0, tampo, largura, viga_base - tampo, med)
    g.linha_h(0, tampo, largura, mais_claro(med))
    g.linha_h(0, viga_base - 1, largura, esc)
    for x in range(4, largura - 3, 11):
        g.ponto(x, tampo + 2, cla)
        g.ponto(x, tampo + 3, esc)

    # pernas em par, com travessa: perna solitária lê como palito
    g.retangulo(0, viga_base, largura, altura - viga_base, mais_escuro(esc))
    for px in range(6, largura - 6, 38):
        g.retangulo(px, viga_base, 4, altura - viga_base, med)
        _borda_de_volume(g, px, viga_base, 4, altura - viga_base, cla, esc)
        g.linha_h(px, altura - 4, min(24, largura - px), esc)
        g.linha_h(px, altura - 3, min(24, largura - px), med)
    # caixa de comando e bandeja de cabo no vão: o vão tem 480x13 na cena e
    # precisava de algo. Área plana grande é o que faz cena parecer vazia.
    for px in range(20, largura - 16, 74):
        g.retangulo(px, viga_base + 2, 9, 7, med)
        _borda_de_volume(g, px, viga_base + 2, 9, 7, cla, esc)
        g.ponto(px + 2, viga_base + 4, TELA[3])
        g.ponto(px + 5, viga_base + 4, VERDE[3])
    g.linha_h(0, altura - 7, largura, esc)
    g.linha_h(0, altura - 6, largura, med)
    return g


def radio_de_telecom(largura: int = 12, altura: int = 20, *, montado: bool = True) -> Grade:
    """A peça que a linha monta: rádio de telecom com aletas e conectores.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI. A primeira versão tinha corpo em
    `NEUTRO[:6]` e aletas em `4`/`6`, e na primeira imagem da cena os rádios
    saíram CLAROS — do mesmo valor da parede — alinhados e igualmente espaçados
    ao longo de 400px de esteira. O resultado não lia como equipamento: lia como
    uma CERCA DE RIPAS atravessando a cena, e a fila acumulada (que é o ponto da
    cena inteira) desaparecia dentro da cerca.

    Três correções, e a ordem de importância é esta:
    (a) o corpo desceu para `NEUTRO[:5]`, ficando mais ESCURO que a parede — o
        objeto tem de cair numa faixa de valor diferente do que está atrás dele
        (bíblia §4.2), e antes ele caía na mesma;
    (b) as aletas pararam de ocupar a peça inteira: agora vão só até dois terços
        da altura, e o terço de baixo é bloco liso com a placa de conectores, o
        que dá TOPO e BASE distintos em vez de uma ripa uniforme;
    (c) 12px de largura em vez de 14, com suporte de fixação de 1px saindo dos
        lados — a silhueta deixou de ser um retângulo.
    """
    g = Grade(largura, altura)
    corpo = altura - 5
    g.caixa_com_volume(1, 0, largura - 2, corpo, NEUTRO[:5])
    # aletas só nos dois terços de cima: é o que dá topo e base à peça
    aletas = max(3, (corpo * 2) // 3)
    for x in range(2, largura - 2, 2):
        g.linha_v(x, 2, aletas - 2, "2")
        g.linha_v(x + 1, 2, aletas - 2, "4")
    g.linha_h(2, 1, largura - 4, "5")
    g.linha_h(1, aletas, largura - 2, "1")  # arremate do dissipador
    g.linha_h(1, aletas + 1, largura - 2, "4")
    # suporte de fixação saindo dos lados: mata o retângulo puro
    g.ponto(0, 3, "3")
    g.ponto(0, 4, "5")
    g.ponto(largura - 1, 3, "2")
    g.ponto(largura - 1, 4, "4")

    if montado:
        g.retangulo(2, corpo - 3, largura - 4, 3, "1")  # placa de conectores
        g.linha_h(2, corpo - 3, largura - 4, "3")
        for i in range((largura - 6) // 3 + 1):
            g.ponto(3 + i * 3, corpo - 2, "4")
        g.retangulo(2, corpo, largura - 4, 4, "2")  # pedestal
        g.linha_h(2, corpo, largura - 4, "4")
        g.ponto(largura - 3, 2, TELA[4])  # LED de vida
    else:
        # carcaça aberta: sem tampa no dissipador e com fio pendurado. É assim
        # que se lê "ainda está sendo feito" sem escrever texto no cenário.
        g.retangulo(2, 2, largura - 4, aletas - 2, "1")
        g.dither(2, 2, largura - 4, aletas - 2, "1", "2", "xadrez")
        g.linha_h(2, 2, largura - 4, "3")
        for i in range(2):
            g.linha_v(4 + i * 3, 4, aletas - 5, MADEIRA[3])
        g.retangulo(2, corpo, largura - 4, 4, "2")
    return g


def celula_de_processo(largura: int = 52, altura: int = 40, *, status: str = "ok") -> Grade:
    """Cabine fechada de processo, com visor aceso e chapa de identificação.

    É a etapa AUTOMÁTICA da linha: fechada, iluminada por dentro, sem ninguém
    do lado. Três delas iguais em fila são o padrão contra o qual a quarta etapa
    se destaca — repetição é o que cria a expectativa que a exceção quebra.

    `status` só muda o tom do visor e da lâmpada: `ok` em ciano, `parado` em
    quente. Nunca vermelho aqui — o acento vermelho da cena é um só e ele está
    reservado para a torre de sinalização da etapa lenta.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(AZUL)
    g.retangulo(0, 0, largura, altura, med)
    _borda_de_volume(g, 0, 0, largura, altura, cla, esc)
    g.dither(1, 1, largura - 2, altura - 2, med, mais_escuro(med), "esparso")

    # visor: o que faz a cabine ler como máquina ligada e não como armário.
    # ERRO CORRIGIDO DEPOIS DE OLHAR: o visor ocupava `largura-16` por
    # `altura-18`, quase a cabine inteira, e as três em fila liam como TRÊS
    # TELEVISÕES penduradas — uma parede de monitores, não uma linha de produção.
    # Encolhido e deslocado para a direita, com painel de comando ao lado, a
    # proporção vira máquina: muito corpo, pouca janela.
    vx, vy = 15, 8
    vw, vh = largura - 27, altura - 22
    tom = TELA[1] if status == "ok" else LUZ[1]
    brilho = TELA[3] if status == "ok" else LUZ[3]
    g.retangulo(vx, vy, vw, vh, tom)
    g.dither(vx + 1, vy + 1, vw - 2, vh - 2, tom, brilho, "esparso")
    g.moldura(vx, vy, vw, vh, esc)
    g.linha_h(vx, vy, vw, cla)
    for k in range(min(vh, vw // 2)):  # reflexo diagonal: é o que faz ler vidro
        g.ponto(vx + 2 + k, vy + 1 + k, brilho)
    # a ferramenta lá dentro, em silhueta: máquina com visor vazio lê como forno
    g.retangulo(vx + vw // 2 - 2, vy + 1, 4, vh - 5, esc)
    g.linha_h(vx + 3, vy + vh - 4, vw - 6, esc)

    # painel de comando à esquerda do visor: botoeira e mostrador
    g.retangulo(4, 7, 9, altura - 20, mais_escuro(med))
    _borda_de_volume(g, 4, 7, 9, altura - 20, cla, esc)
    g.retangulo(5, 8, 7, 4, TELA[0])
    g.dither(6, 9, 5, 2, TELA[0], TELA[2], "xadrez")
    for i in range(max(1, (altura - 34) // 4)):
        g.ponto(6, 14 + i * 4, VERDE[3])
        g.ponto(9, 14 + i * 4, LUZ[3])
        g.ponto(6, 15 + i * 4, esc)
        g.ponto(9, 15 + i * 4, esc)

    # chapa de identificação e lâmpada de topo
    g.retangulo(largura - 9, 6, 6, altura - 16, mais_claro(med))
    _borda_de_volume(g, largura - 9, 6, 6, altura - 16, cla, esc)
    for i in range(3):
        g.linha_h(largura - 8, 9 + i * 4, 4, esc)
    g.retangulo(largura - 9, 2, 6, 3, brilho)
    g.linha_h(largura - 9, 2, 6, mais_claro(brilho))
    # grade de exaustão embaixo: aresta horizontal que quebra o campo chapado
    for y in range(altura - 8, altura - 2, 2):
        g.linha_h(4, y, largura - 16, esc)
        g.linha_h(4, y + 1, largura - 16, cla)
    return g


def braco_robotico(altura: int = 46, *, estendido: bool = False) -> Grade:
    """Braço robótico de base fixa: base, torre, antebraço em diagonal e garra.

    Robô é o que o ADR-009 pede em cena, e o que faz um robô ler como robô nesta
    escala é a ARTICULAÇÃO: base grossa, junta visível (2px mais claro), braço
    mais fino que a torre e uma garra de duas pontas. Um braço reto e de
    espessura única lê como cano.

    `estendido` abaixa o antebraço sobre a esteira. Dois robôs na mesma pose numa
    fila de quatro denunciam a repetição na hora — é a mesma lição da fila de
    cadeiras da sala de treinamento.
    """
    g = Grade(22, altura)
    esc, med, cla = tons_de_volume(AZUL)
    cx = 8

    # base e torre
    g.retangulo(cx - 6, altura - 6, 13, 6, med)
    _borda_de_volume(g, cx - 6, altura - 6, 13, 6, cla, esc)
    g.retangulo(cx - 3, 10, 7, altura - 16, med)
    g.linha_v(cx - 3, 10, altura - 16, cla)
    g.linha_v(cx + 3, 10, altura - 16, esc)
    g.dither(cx - 2, 12, 5, altura - 20, med, mais_escuro(med), "esparso")

    # junta do ombro: 2px mais claro, é o que diz "isto gira"
    g.retangulo(cx - 4, 8, 9, 4, cla)
    g.moldura(cx - 4, 8, 9, 4, esc)
    g.ponto(cx, 9, LUZ[4])  # piloto aceso

    # antebraço em diagonal, com a garra na ponta
    if estendido:
        pontos = ((cx + 2, 10), (14, 18), (18, 26))
    else:
        pontos = ((cx + 2, 9), (15, 10), (19, 16))
    for i in range(len(pontos) - 1):
        (x0, y0), (x1, y1) = pontos[i], pontos[i + 1]
        linha(g, x0, y0, x1, y1, med)
        linha(g, x0, y0 - 1, x1, y1 - 1, cla)
        linha(g, x0, y0 + 1, x1, y1 + 1, esc)
    gx, gy = pontos[-1]
    g.retangulo(gx - 1, gy, 3, 3, esc)
    g.ponto(gx - 2, gy + 3, med)
    g.ponto(gx + 2, gy + 3, med)
    g.ponto(gx - 2, gy + 4, cla)
    g.ponto(gx + 2, gy + 4, cla)
    return g


def torre_de_sinalizacao(altura: int = 24, *, alerta: bool = False) -> Grade:
    """Coluna de três lâmpadas sobre um mastro. Verde/âmbar/vermelho.

    Com `alerta`, a vermelha é a acesa e as outras duas ficam apagadas — e é
    esta função que gasta o ÚNICO acento vermelho da linha de produção
    (bíblia §3). Gastá-lo aqui é escolha de composição: o olho da plateia vai
    primeiro ao ponto vermelho, e o ponto vermelho está exatamente na etapa que
    a protagonista percebe que dá para melhorar. A cena aponta sozinha.
    """
    g = Grade(9, altura)
    esc, med, cla = tons_de_volume(AZUL)
    g.retangulo(3, 12, 3, altura - 12, med)  # mastro
    g.linha_v(3, 12, altura - 12, cla)
    g.linha_v(5, 12, altura - 12, esc)
    g.retangulo(1, altura - 3, 7, 3, esc)  # sapata

    acesa = (VERMELHO[3], LUZ[3], VERDE[3])
    apagada = (VERMELHO[0], LUZ[0], VERDE[0])
    ordem = (0, 1, 2) if alerta else (2, 1, 0)
    for i, camada in enumerate(ordem):
        y = 1 + i * 4
        viva = (alerta and camada == 0) or (not alerta and camada == 2)
        tom = acesa[camada] if viva else apagada[camada]
        g.retangulo(1, y, 7, 3, tom)
        g.linha_h(2, y, 5, mais_claro(tom) if viva else tom)
        g.linha_h(1, y + 3, 7, esc)
    return g


def palete(largura: int = 32, *, camadas: int = 1) -> Grade:
    """Palete de madeira, empilhável. A massa quente de uma cena de fábrica.

    A bíblia §3 pede ~20% de madeira na área, e uma fábrica não tem mesa de
    madeira: tem palete e caixa. `camadas` empilha, e empilhar é o que dá volume
    de verdade sem custar prop novo.
    """
    alto = 6 * camadas
    g = Grade(largura, alto)
    esc, med, cla = tons_de_volume(MADEIRA)
    for c in range(camadas):
        y = alto - 6 * (c + 1)
        g.retangulo(0, y, largura, 2, med)  # tábuas de cima
        g.linha_h(0, y, largura, cla)
        for x in range(0, largura, 7):
            g.ponto(x, y, esc)
            g.ponto(x, y + 1, esc)
        g.retangulo(0, y + 2, largura, 2, mais_escuro(esc))  # vão
        for px in (1, largura // 2 - 2, largura - 5):  # cepos
            g.retangulo(px, y + 2, 4, 2, med)
            g.linha_v(px, y + 2, 2, cla)
        g.retangulo(0, y + 4, largura, 2, med)  # tábua de baixo
        g.linha_h(0, y + 5, largura, esc)
    return g


def carrinho_de_carga(largura: int = 34, altura: int = 26) -> Grade:
    """Carrinho de plataforma com alça. Prop de piso que diz "aqui há fluxo"."""
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(AZUL)
    g.retangulo(0, 8, largura, 4, med)  # plataforma
    g.linha_h(0, 8, largura, cla)
    g.linha_h(0, 11, largura, esc)
    g.linha_v(largura - 3, 0, 9, med)  # alça
    g.linha_v(largura - 2, 0, 9, esc)
    g.linha_h(largura - 8, 0, 6, cla)
    for px in (3, largura - 10):  # rodas
        _elipse(g, px, altura - 4, 3, 3, esc)
        _elipse(g, px, altura - 4, 2, 2, med)
        g.ponto(px - 1, altura - 5, cla)
    g.retangulo(2, 12, largura - 6, 2, esc)  # chassi
    return g


def trelica_de_teto(g: Grade, y: int, *, altura: int = 16, passo: int = 64) -> None:
    """Tesoura de telhado: duas cordas horizontais e diagonais em zigue-zague.

    Substitui o forro modular nas cenas que não são escritório. O forro diz
    "prédio administrativo"; a treliça diz "galpão", e diz sozinha — é a única
    coisa no alto da imagem que muda o tipo de edifício sem mudar nada embaixo.
    """
    g.retangulo(0, y, g.largura, altura, "1")
    g.dither(0, y, g.largura, altura, "1", "2", "esparso")
    for linha_y in (y + 1, y + altura - 2):
        g.linha_h(0, linha_y, g.largura, "4")
        g.linha_h(0, linha_y + 1, g.largura, "2")
    for x in range(0, g.largura + passo, passo):
        # o zigue-zague fecha em V e depois em Λ: diagonal só num sentido lê
        # como hachura, e hachura no teto é o defeito que o halo já cometeu
        linha(g, x, y + 2, x + passo // 2, y + altura - 2, "3")
        linha(g, x + passo // 2, y + altura - 2, x + passo, y + 2, "3")
        g.linha_v(x, y + 2, altura - 4, "4")


def passarela(g: Grade, y: int, *, x0: int = 0, x1: int | None = None) -> None:
    """Passarela metálica cruzando a parede alta, com guarda-corpo e piso vazado.

    É a ARESTA HORIZONTAL que quebra uma parede de galpão, e a bíblia decisão 4
    diz que parede vazia se resolve com aresta, não com textura. Também dá escala
    à cena: a plateia sabe que cabe uma pessoa ali em cima.
    """
    x1 = g.largura if x1 is None else x1
    w = x1 - x0
    # guarda-corpo: corrimão, travessa e balaústres
    g.linha_h(x0, y, w, "6")
    g.linha_h(x0, y + 1, w, "3")
    g.linha_h(x0, y + 6, w, "4")
    for x in range(x0 + 3, x1, 9):
        g.linha_v(x, y + 1, 6, "4")
    # piso vazado: dois tons alternados em passo curto = chapa perfurada
    g.retangulo(x0, y + 8, w, 4, "3")
    g.linha_h(x0, y + 8, w, "5")
    g.dither(x0, y + 9, w, 2, "3", "2", "xadrez")
    g.linha_h(x0, y + 11, w, "1")
    for x in range(x0 + 12, x1, 48):  # mãos-francesas
        linha(g, x, y + 12, x + 7, y + 19, "2")
        linha(g, x + 1, y + 12, x + 8, y + 19, "3")


def portao_industrial(largura: int = 72, altura: int = 88, *, aberto: bool = True) -> Grade:
    """Portão de enrolar. Aberto, o vão é a boca escura por onde a linha sai.

    Vão ESCURO e não quente: as duas portas abertas do jogo (treinamento e sala
    de reuniões) já projetam cunha de luz quente, e uma terceira seria o carimbo
    que a revisão de janelas registrou. Aqui o vão é o galpão vizinho, mais
    escuro que esta sala, e o que o faz ler como profundidade é a cunha de piso
    CLARO entrando por ele, não a luz saindo.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(NEUTRO[:6])
    g.retangulo(0, 0, largura, altura, med)  # batente
    g.linha_h(0, 0, largura, cla)
    g.linha_v(0, 0, altura, cla)
    g.linha_v(largura - 1, 0, altura, esc)

    if aberto:
        vx, vw = 4, largura - 8
        g.retangulo(vx, 14, vw, altura - 14, "1")
        g.dither(vx, 14, vw, altura - 14, "1", "2", "esparso")
        # silhuetas no galpão vizinho: sem elas o vão é um buraco preto
        for i, (sx, sh) in enumerate(((6, 18), (22, 26), (40, 14), (54, 22))):
            if vx + sx + 10 > vx + vw:
                break
            g.retangulo(vx + sx, altura - sh, 10, sh, "2")
            g.linha_h(vx + sx, altura - sh, 10, "3")
            if i % 2 == 0:
                g.ponto(vx + sx + 3, altura - sh + 4, TELA[2])
        g.linha_h(vx, altura - 4, vw, "4")  # soleira
        g.linha_h(vx, altura - 3, vw, "5")
        # tambor da cortina enrolada, em cima
        g.retangulo(2, 2, largura - 4, 11, med)
        for y in range(3, 12, 3):
            g.linha_h(3, y, largura - 6, esc)
            g.linha_h(3, y + 1, largura - 6, cla)
    else:
        for y in range(2, altura - 2, 4):
            g.linha_h(2, y, largura - 4, med)
            g.linha_h(2, y + 1, largura - 4, cla)
            g.linha_h(2, y + 2, largura - 4, esc)
    return g


def luminaria_industrial(altura: int = 22, *, quente: bool = False) -> Grade:
    """Campânula de galpão: haste, refletor em sino e lâmpada.

    `quente` troca a lâmpada fria pela quente. Na linha de produção existe UMA
    quente, sobre a etapa manual, e é ela que cumpre a exigência de fonte de luz
    quente do checklist §4.5 — e ao mesmo tempo marca a etapa diferente. Uma
    lâmpada de cor diferente no meio de quatro iguais é a coisa mais barata que
    existe para dizer "olhe aqui".
    """
    g = Grade(26, altura)
    cx = 13
    g.linha_v(cx, 0, altura - 9, "1")
    g.linha_v(cx + 1, 0, altura - 9, "3")
    for i in range(6):  # sino: abre rápido e fecha na aba
        w = 6 + i * 3
        g.retangulo(cx - w // 2, altura - 9 + i, w, 1, "4" if i < 3 else "3")
    g.linha_h(cx - 3, altura - 9, 7, "6")
    g.linha_h(cx - 11, altura - 4, 23, "2")  # aba
    lampada = LUZ[5] if quente else TELA[4]
    halo = LUZ[3] if quente else TELA[3]
    g.retangulo(cx - 4, altura - 3, 9, 2, lampada)
    g.dither(cx - 6, altura - 1, 13, 1, VAZIO, halo, "esparso")
    return g


def faixa_de_seguranca(g: Grade, y: int, *, x0: int = 0, x1: int | None = None) -> None:
    """Faixa amarela pintada no piso, em duas linhas com hachura entre elas.

    Identidade de piso de fábrica, e de graça: duas linhas horizontais quebram a
    maior área plana da cena, que é sempre o piso.

    Pintada com a rampa LUZ de propósito. `exportar_chao.py` trata `uvwxyz` como
    piso (poça de luz É piso iluminado), então a faixa não abre um buraco no mapa
    de chão — pintá-la em madeira ou azul cortaria a corrida de piso daquelas
    colunas e o mapa passaria a dizer que ali existe móvel.

    ERRO CORRIGIDO DEPOIS DE OLHAR: a faixa saía em `LUZ[1]`/`LUZ[2]` e virava a
    coisa mais saturada da imagem, atravessando os 480px. A cena tem UM acento
    vermelho (a torre em alerta) e a função dele é ser o primeiro lugar onde o
    olho para; uma faixa laranja de 1920px de ponta a ponta ganhava essa disputa.
    Agora ela usa os dois tons mais ESCUROS da rampa: continua legível como
    pintura de piso e não compete com nada.
    """
    x1 = g.largura if x1 is None else x1
    g.linha_h(x0, y, x1 - x0, LUZ[1])
    g.linha_h(x0, y + 1, x1 - x0, LUZ[0])
    g.linha_h(x0, y + 7, x1 - x0, LUZ[1])
    g.linha_h(x0, y + 8, x1 - x0, LUZ[0])
    for x in range(x0, x1, 6):  # hachura diagonal entre as duas linhas
        linha(g, x, y + 7, x + 5, y + 2, LUZ[0])


# --------------------------------------------------------- outra área (f5)


def parede_de_feltro(g: Grade, y0: int, y1: int, *, ripas: int = 11) -> None:
    """Meia-parede de feltro acústico em painéis verticais.

    Existe para que a fase 5 não seja o Escritório repintado. O que define um
    ambiente não é a cor da parede, é o material e a altura da divisão: o
    Escritório tem parede pintada lisa de cima a baixo, aqui há uma faixa de
    painel acústico até a altura do peito, com junta vertical a cada 11px. Em
    vídeo comprimido a junta vertical sobrevive e a cor não.
    """
    g.retangulo(0, y0, g.largura, y1 - y0, AZUL[1])
    g.dither(0, y0, g.largura, y1 - y0, AZUL[1], AZUL[2], "esparso")
    for x in range(0, g.largura, ripas):
        g.linha_v(x, y0 + 1, y1 - y0 - 2, AZUL[0])
        g.linha_v(x + 1, y0 + 1, y1 - y0 - 2, AZUL[3])
    g.linha_h(0, y0 - 2, g.largura, "7")  # arremate de alumínio no topo
    g.linha_h(0, y0 - 1, g.largura, "5")
    g.linha_h(0, y0, g.largura, AZUL[0])
    g.linha_h(0, y1 - 1, g.largura, AZUL[0])


def claraboia(g: Grade, cx: int, y: int, largura: int, altura: int) -> None:
    """Lanternim no teto: vidro claro entre caibros, com moldura em perspectiva.

    É a diferença de LUZ que o ADR-031 pede. O Escritório recebe luz de uma
    janela lateral ao poente: a mancha dele no piso é um quadrilátero inclinado,
    encostado na parede da direita. Aqui a luz vem de CIMA: a mancha é centrada,
    simétrica e no meio do piso. Geometria de luz diferente é o que impede a
    plateia de ler a segunda cena como a primeira com outra tinta — e ela lê
    isso sem saber que está lendo.
    """
    x0 = cx - largura // 2
    g.retangulo(x0, y, largura, altura, "6")
    g.degrade_v(x0 + 2, y + 1, largura - 4, altura - 2, "876")
    for i in range(1, 4):  # caibros
        px = x0 + round(i * largura / 4)
        g.linha_v(px, y, altura, "5")
        g.linha_v(px + 1, y, altura, "3")
    g.moldura(x0, y, largura, altura, "4")
    g.linha_h(x0, y, largura, "7")
    g.linha_h(x0, y + altura - 1, largura, "2")
    # rebaixo do forro em volta: sem ele o vidro lê como quadro na parede
    for k in range(3):
        g.linha_h(x0 - 2 - k, y + altura + k, largura + 4 + 2 * k, "3" if k else "5")


def tapete(largura: int = 128, altura: int = 30) -> Grade:
    """Tapete de área, em trama de dois tons neutros com franja.

    ┌──────────────────────────────────────────────────────────────────────────┐
    │ FORA DE CIRCULAÇÃO. Nenhuma cena chama esta função hoje, e o motivo é um │
    │ defeito VISTO NA TELA — está escrito aqui porque a próxima pessoa que    │
    │ pensar em pôr um tapete numa cena precisa saber por que este saiu.       │
    │                                                                          │
    │ Em `outra-area` o tapete ficava no miolo do piso (x 100..236, y 194..224)│
    │ e o feedback do dono foi literal: *"há um retângulo claro pontilhado no  │
    │ chão... não lê como tapete, lê como falha de render"*. E ele estava       │
    │ certo — o defeito é estrutural, não de dosagem:                          │
    │                                                                          │
    │ 1. O tapete TEM DE ser neutro (madeira e azul são móvel para             │
    │    `exportar_chao.py`, e um tapete de móvel proibiria pisar nele), e o   │
    │    piso daquela cena também é neutro. Duas superfícies na mesma família, │
    │    a 2 passos de distância, separadas só por uma moldura de 1px.         │
    │ 2. Trama de dither `xadrez` num retângulo de 136x30 px a 4x é uma grade  │
    │    regular de 544x120 px na tela — o olho lê padrão de erro, não tecido. │
    │ 3. Não havia nada em cima dele. Tapete existe embaixo de móvel; tapete   │
    │    sozinho no meio da sala não tem função e por isso não tem leitura.    │
    │                                                                          │
    │ O que substituiu: POSTO DE TRABALHO. O tapete estava ali para fazer o    │
    │ miolo vazio parecer intencional, e o miolo deixou de ser vazio.          │
    │                                                                          │
    │ Se um dia voltar: embaixo de mobiliário, com pelo menos 3 passos de      │
    │ rampa de diferença do piso, e nunca na faixa de caminhada.               │
    └──────────────────────────────────────────────────────────────────────────┘

    ERRO CORRIGIDO DEPOIS DE OLHAR (e que não bastou): a primeira versão tinha
    campo `7` sobre um piso que também tem banda `7`, e o tapete simplesmente NÃO
    APARECIA. Passou a campo `8` com borda dupla e franja de 2px — e aí passou a
    aparecer como artefato, que é o defeito acima.
    """
    g = Grade(largura, altura)
    g.retangulo(0, 2, largura, altura - 4, "8")
    g.dither(3, 5, largura - 6, altura - 10, "8", "7", "xadrez")
    g.moldura(0, 2, largura, altura - 4, "5")
    g.moldura(2, 4, largura - 4, altura - 8, "6")
    g.linha_h(0, altura - 3, largura, "4")
    # trama interna: losangos esparsos, que é o mínimo para não ler como lençol
    for i in range(6, largura - 6, 16):
        for j in range(8, altura - 9, 8):
            g.ponto(i, j, "5")
            g.ponto(i + 1, j + 1, "5")
            g.ponto(i - 1, j + 1, "5")
            g.ponto(i, j + 2, "5")
    for x in range(0, largura, 3):  # franja de 2px nas duas pontas
        g.ponto(x, 0, "6")
        g.ponto(x, 1, "7")
        g.ponto(x, altura - 2, "6")
        g.ponto(x, altura - 1, "5")
    return g


def divisoria_acustica(largura: int = 74, altura: int = 20) -> Grade:
    """Biombo BAIXO de bancada, com perfil e duas garras de fixação.

    O contraste com a `divisoria_baia` é o ponto: lá o painel tem 54px e uma tela
    espiando por cima, e é a imagem canônica de escritório de baias. Aqui o
    painel tem 20px e não esconde ninguém — é bancada aberta, outro jeito de
    trabalhar. A bíblia pede que a outra área mude a ALTURA DAS DIVISÓRIAS, e
    esta é a metade baixa dessa mudança; a outra metade é a divisória de piso a
    teto dos gabinetes.

    ERRO CORRIGIDO DEPOIS DE OLHAR, DUAS VEZES. Primeiro era `VERDE[1]` chapado e
    saiu como um BLOCO DE COR de 80x20 atrás da bancada, lendo como lousa e
    disputando o verde com a planta (que é a fonte de vida obrigatória da cena). A
    segunda versão, em `6`/`7`, ficou CLARA demais: contra o feltro azul-escuro da
    parede ela lia como uma luminária fluorescente deitada em cima da mesa. O tom
    certo é o do meio — corpo em `5`, nervura em `4`, e só o perfil de alumínio em
    `7`. Separa do feltro sem emitir luz.

    Char neutro pode aqui: a base do biombo fica em y=134 e o mapa de chão só
    varre de y=144 para baixo, então nada disto é lido como piso.
    """
    g = Grade(largura, altura)
    g.retangulo(0, 2, largura, altura - 6, "5")
    g.dither(1, 3, largura - 2, altura - 8, "5", "6", "esparso")
    for x in range(2, largura - 2, 6):  # nervura de tecido
        g.linha_v(x, 3, altura - 9, "4")
        g.linha_v(x + 1, 3, altura - 9, "6")
    g.retangulo(0, 0, largura, 2, "6")  # perfil de alumínio
    g.linha_h(0, 0, largura, "7")
    g.linha_h(0, 1, largura, "3")
    g.linha_v(0, 2, altura - 6, "6")
    g.linha_v(largura - 1, 2, altura - 6, "3")
    g.linha_h(0, altura - 5, largura, "2")
    for px in (4, largura - 7):  # garras de fixação na bancada
        g.retangulo(px, altura - 4, 3, 4, "4")
        g.linha_v(px, altura - 4, 4, "6")
    return g


def divisoria_de_gabinete(largura: int = 64, altura: int = 96, *, tom_vidro: str = "6") -> Grade:
    """Divisória de piso a teto: rodapé de madeira e vidro jateado até o teto.

    A metade ALTA da mudança de divisória. Ela fecha uma sala de verdade, o que
    o Escritório não tem em nenhum ponto: lá tudo é aberto e de meia altura.
    Vidro jateado e não transparente porque vidro transparente pediria interior
    desenhado, e interior de sala fechada num vão de 64px vira sujeira.

    `tom_vidro` EXISTE PARA CORTAR ÁREA CLARA, e foi acrescentado depois de
    MEDIR a cena da fase 5. Com o vidro em `6`/`7` esta divisória é 118x75 px de
    quase-branco parada logo acima do mobiliário, na metade esquerda da imagem —
    e a banda em que ela vive (y 70..105) era a mais clara da cena depois da
    parede alta, com 67% dos pixels em luma > 140. Ela não cobria a cabeça de
    ninguém (a base de madeira dela é que fica na altura de cabeça, e é escura);
    o problema era de ÁREA, não de silhueta. Em `4` o mesmo prop lê como sala
    fechada SEM luz acesa, que é mais dramático e custa zero em geometria.

    ERRO CORRIGIDO DEPOIS DE OLHAR: a base de madeira ocupava um TERÇO da altura
    no tom médio da rampa, e no meio de uma parede clara ela saiu como um bloco
    mostarda de 118x33 flutuando — lia como um móvel encostado, não como rodapé
    de divisória. Passou a um quarto da altura e dois tons mais escura, com um
    friso claro no arremate: é rodapé quando é baixo e escuro, e é móvel quando é
    alto e claro.
    """
    g = Grade(largura, altura)
    esc, med, _cla = tons_de_volume(MADEIRA)
    vidro = tom_vidro
    claro = mais_claro(vidro)
    perfil = mais_escuro(vidro, 2)
    base = max(8, altura // 4)
    g.retangulo(0, altura - base, largura, base, esc)
    g.dither(1, altura - base + 1, largura - 2, base - 2, esc, mais_escuro(esc), "esparso")
    g.linha_h(0, altura - base, largura, med)  # friso de arremate
    g.linha_h(0, altura - base + 1, largura, esc)
    g.linha_h(0, altura - 1, largura, mais_escuro(esc))
    # vidro jateado: campo claro, sem reflexo diagonal. O reflexo é o que faz
    # vidro LIMPO, e aqui a intenção é o oposto.
    g.retangulo(0, 0, largura, altura - base, vidro)
    g.dither(1, 1, largura - 2, altura - base - 2, vidro, claro, "denso")
    g.moldura(0, 0, largura, altura - base, perfil)
    g.linha_h(0, 0, largura, claro)
    for i in range(1, 3):
        px = round(i * largura / 3)
        g.linha_v(px, 1, altura - base - 2, perfil)
        g.linha_v(px + 1, 1, altura - base - 2, claro)
    # travessa na altura do peito: divisória de vidro sem travessa lê como painel
    g.linha_h(1, altura - base - 26, largura - 2, perfil)
    g.linha_h(1, altura - base - 25, largura - 2, claro)
    g.linha_h(0, altura - base - 2, largura, perfil)
    return g


def armario_de_lockers(largura: int = 66, altura: int = 74) -> Grade:
    """Parede de armários de porta pequena, com puxador e etiqueta.

    Prop de parede alta que NÃO existe no Escritório e que diz "aqui trabalha
    outro time": armário pessoal é o móvel de andar compartilhado. Também é a
    densidade empurrada para a borda — a outra área é mais vazia no meio de
    propósito, para caber figura, e o que enche a imagem fica encostado na parede.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(AZUL)
    g.retangulo(0, 0, largura, altura, med)
    _borda_de_volume(g, 0, 0, largura, altura, cla, esc)
    colunas = max(2, largura // 22)
    linhas_n = max(3, altura // 24)
    pw = (largura - 4) // colunas
    ph = (altura - 4) // linhas_n
    for c in range(colunas):
        for l in range(linhas_n):
            px, py = 2 + c * pw, 2 + l * ph
            g.retangulo(px, py, pw - 2, ph - 2, mais_claro(med))
            _borda_de_volume(g, px, py, pw - 2, ph - 2, cla, esc)
            g.linha_v(px + pw - 5, py + 3, max(2, ph // 3), cla)  # puxador
            g.retangulo(px + 2, py + 2, 5, 2, "7")  # etiqueta
            if (c + l) % 3 == 0:  # grelha de ventilação em algumas portas
                for k in range(2):
                    g.linha_h(px + 3, py + ph - 6 + k * 2, pw - 8, esc)
    g.retangulo(1, altura - 3, largura - 2, 3, mais_escuro(esc))
    return g


# ---------------------------------------------------------- festa (fase 6)


def bandeirolas(g: Grade, x0: int, y: int, x1: int, *, arcos: int = 3) -> None:
    """Fio de bandeirinhas triangulares pendurado em catenária.

    A decoração mais legível que existe nesta escala: o triângulo tem três
    pixels de base e ainda lê, e o fio em catenária dá a curva que diz "isto foi
    pendurado", que é o que separa festa de cartaz. Cores da rampa luz, verde e
    tela, nunca vermelho — o acento vermelho da cena continua sendo um só, e no
    cafezinho ele é a caneca sobre o balcão.
    """
    cores = (LUZ[3], VERDE[3], TELA[3], LUZ[5], VERDE[4], TELA[2])
    largura = x1 - x0
    vao = largura / arcos
    k = 0
    for a in range(arcos):
        ax0 = x0 + a * vao
        for i in range(round(vao)):
            t = i / max(1, vao - 1)
            # catenária aproximada por parábola: 4t(1-t) é a barriga do fio
            queda = round(9 * 4 * t * (1 - t))
            x = round(ax0 + i)
            g.ponto(x, y + queda, "2")
            g.ponto(x, y + queda - 1, "4")
            if i % 8 == 4:  # uma bandeirinha a cada 8px
                cor = cores[k % len(cores)]
                for dy in range(5):
                    w = 7 - dy - dy
                    if w <= 0:
                        break
                    g.linha_h(x - w // 2, y + queda + 1 + dy, w, cor)
                g.ponto(x - 2, y + queda + 1, mais_claro(cor))
                k += 1


def guirlanda_de_luzes(g: Grade, x0: int, y: int, x1: int) -> None:
    """Cordão de lâmpadas: fio reto com lâmpadas acesas e o halo de cada uma.

    Duas famílias de luz no mesmo fio (`x` e `z`) porque cordão de lâmpada com
    todas as lâmpadas do mesmo tom lê como pontilhado. O halo de 1px em volta é
    o que faz a lâmpada EMITIR em vez de só estar colorida.
    """
    for x in range(x0, x1):
        g.ponto(x, y, "2")
    for i, x in enumerate(range(x0 + 5, x1 - 2, 13)):
        tom = LUZ[5] if i % 2 else LUZ[3]
        g.linha_v(x, y + 1, 2, "3")
        g.retangulo(x - 1, y + 3, 3, 3, tom)
        g.ponto(x, y + 2, mais_claro(tom))
        for dx, dy in ((-2, 4), (2, 4), (0, 6)):
            if g.em(x + dx, y + dy) != VAZIO:
                g.ponto(x + dx, y + dy, mais_claro(g.em(x + dx, y + dy)))


def bolo(largura: int = 22, altura: int = 16) -> Grade:
    """Bolo em prato, com cobertura e uma vela. O centro da mesa posta.

    Cobertura pingando pelas laterais em degraus de 1 e 2px: cobertura reta lê
    como camada de tinta. A vela é 1px de pavio e 2px de chama, que é o mínimo
    para ler como chama e o máximo que cabe.
    """
    g = Grade(largura, altura)
    g.retangulo(2, 6, largura - 4, altura - 9, MADEIRA[3])  # massa
    g.dither(3, 7, largura - 6, altura - 11, MADEIRA[3], MADEIRA[2], "esparso")
    g.linha_v(2, 6, altura - 9, MADEIRA[4])
    g.linha_v(largura - 3, 6, altura - 9, MADEIRA[1])
    g.retangulo(1, 4, largura - 2, 3, "8")  # cobertura
    g.linha_h(1, 4, largura - 2, "z")
    for i, x in enumerate(range(2, largura - 2, 4)):  # pingos
        g.linha_v(x, 7, 1 + (i % 2) * 2, "8")
    g.linha_v(largura // 2, 0, 3, "6")  # vela
    g.ponto(largura // 2, 0, LUZ[5])
    g.ponto(largura // 2 - 1, 1, LUZ[3])
    g.retangulo(0, altura - 3, largura, 2, "7")  # prato
    g.linha_h(0, altura - 3, largura, "8")
    g.linha_h(1, altura - 1, largura - 2, "5")
    return g


def bandeja_de_salgados(largura: int = 24, altura: int = 9) -> Grade:
    """Bandeja com salgadinhos em duas fileiras. Mesa posta em 9 linhas."""
    g = Grade(largura, altura)
    g.retangulo(0, altura - 4, largura, 3, "6")
    g.linha_h(0, altura - 4, largura, "8")
    g.linha_h(0, altura - 2, largura, "4")
    for fila in range(2):
        for i in range(2, largura - 3, 5):
            x = i + fila * 2
            y = altura - 6 - fila * 3
            g.retangulo(x, y, 4, 3, MADEIRA[4])
            g.linha_h(x, y, 4, MADEIRA[5])
            g.ponto(x + 3, y + 2, MADEIRA[2])
    return g


def copos(quantidade: int = 3) -> Grade:
    """Fileira de copos plásticos com suco. Vida por 6 pixels cada."""
    g = Grade(quantidade * 5 + 1, 9)
    for i in range(quantidade):
        x = i * 5
        for dy in range(9):  # copo afunila
            recuo = dy // 5
            g.linha_h(x + recuo, dy, 4 - 2 * recuo, "7")
        g.linha_v(x, 0, 6, "8")
        g.linha_v(x + 3, 0, 6, "5")
        g.retangulo(x + 1, 2, 2, 4, LUZ[3] if i % 2 else LUZ[2])
    return g


def jarra(altura: int = 16) -> Grade:
    """Jarra de suco com asa e nível de líquido."""
    g = Grade(12, altura)
    g.retangulo(1, 3, 8, altura - 3, "7")
    _borda_de_volume(g, 1, 3, 8, altura - 3, "8", "5")
    g.retangulo(2, 7, 6, altura - 8, LUZ[2])  # nível
    g.linha_h(2, 7, 6, LUZ[4])
    g.dither(3, 9, 4, altura - 11, LUZ[2], LUZ[1], "esparso")
    g.retangulo(2, 0, 6, 3, "6")  # boca
    g.linha_h(2, 0, 6, "8")
    g.linha_v(9, 6, 5, "6")  # asa
    g.ponto(10, 7, "6")
    g.ponto(10, 9, "6")
    return g


def balao(altura: int = 18, cor: str = LUZ[3]) -> Grade:
    """Balão com fio. Redondo com um brilho fora do centro e um bico embaixo."""
    g = Grade(13, altura)
    raio = min(6, (altura - 6) // 2)
    _elipse(g, 6, raio + 1, raio, raio, cor)
    _elipse(g, 5, raio, raio - 2, raio - 2, mais_claro(cor))
    g.ponto(4, raio - 1, "8")  # brilho especular: é o que faz ler como balão
    g.ponto(6, raio * 2 + 2, mais_escuro(cor))  # bico
    for dy in range(raio * 2 + 3, altura):  # fio ondulando
        g.ponto(6 + (dy % 3) - 1, dy, "3")
    return g



def faixa_pendurada(largura: int = 240, altura: int = 16, cloth: str = AZUL) -> Grade:
    """Faixa de tecido pendurada por dois cordões, com bloco de cor e frisos.

    É o que transforma uma sala de reuniões em sala de EVENTO sem mover um
    móvel: a faixa mora no alto da imagem, presa ao teto, e não toca o piso —
    então não interfere na geometria de chão contra a qual outra frente está
    posicionando figuras.

    ERRO CORRIGIDO DEPOIS DE OLHAR: o tecido era `7`/`8`, quase branco, e a faixa
    saiu na mesma faixa de valor da CALHA DE LUZ do teto, 12px acima dela. As duas
    juntas liam como duas luminárias paralelas e a faixa não lia como tecido
    nenhum. Tecido de evento é colorido e de valor médio; o branco é da lâmpada.
    Agora o corpo sai na rampa recebida (azul corporativo por padrão) e o bloco de
    acento fica em luz quente, que é o único quase-branco que sobra.

    Sem texto, como todo cenário deste projeto: o que lê como escrita é a
    MÉTRICA (frisos de comprimentos irregulares), e a bíblia proíbe fonte
    pixelada no cenário porque a 4x uma letra de 3px vira sujeira em vídeo
    comprimido.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(cloth)
    for px in (6, largura - 7):  # cordões
        g.linha_v(px, 0, 4, "2")
        g.ponto(px + 1, 1, "4")
    corpo = altura - 4
    g.retangulo(0, 4, largura, corpo, med)
    g.dither(1, 5, largura - 2, corpo - 2, med, esc, "esparso")
    g.linha_h(0, 4, largura, cla)
    g.linha_h(0, altura - 1, largura, mais_escuro(esc))
    # bloco de acento à esquerda e frisos à direita: a diagramação de uma faixa
    g.retangulo(3, 6, corpo + 4, corpo - 4, LUZ[3])
    g.dither(4, 7, corpo + 2, corpo - 6, LUZ[3], LUZ[4], "esparso")
    g.moldura(3, 6, corpo + 4, corpo - 4, LUZ[1])
    for i, frac in enumerate((0.62, 0.44, 0.74)):
        g.linha_h(corpo + 12, 7 + i * 3, round((largura - corpo - 20) * frac), cla)
    # barra de arremate embaixo, com pingentes: sem ela a faixa lê como fita
    for x in range(4, largura - 3, 9):
        g.ponto(x, altura - 1, cla)
        g.ponto(x + 1, altura - 1, med)
    return g

# ------------------------------------------ objetos interativos da v2.1
#
# POR QUE ESTES CINCO PROPS MORAM AQUI E NÃO EM `itens.py`
# Item é o que entra no inventário e some da cena ao ser usado; objeto é
# mobiliário clicável, e mobiliário é desta frente. Papel em cima de mesa,
# atril de piso, plateia de primeiro plano e painel de parede são mobiliário.
#
# Os ids já estavam declarados em `src/assets/manifest.ts` antes de existir
# arquivo — declarar o id antes do PNG é o fluxo normal deste repositório, não
# gambiarra: a cadeia de fallback de `Imagem.tsx` cobre o vão.
#
# ESTES CINCO SÃO A EXCEÇÃO DA REGRA 4 DO TOPO DESTE ARQUIVO: quem os cola é
# `cenarios._objeto()`, que passa por `contornar()`, porque é a silhueta fechada
# que a aura de hover segue (bíblia §7.2).


def caderno_aberto(largura: int = 36, altura: int = 22) -> Grade:
    """Caderno de PAPEL aberto, com escrita à mão. NÃO é laptop.

    Nasce de um defeito de RÓTULO, não de arte: o hotspot "Caderno dela" da
    fase 5 era desenhado com `objeto-notebook-aberto`, e a plateia via um laptop
    debaixo de uma etiqueta que dizia caderno. Arte emprestada que contradiz o
    próprio rótulo é pior que placeholder, porque o placeholder confessa.

    TRÊS COISAS FAZEM ISTO LER COMO PAPEL A 4x, e nenhuma delas é a cor:

    1. **O vale central.** Duas páginas com uma dobra no meio, não um retângulo.
       É a única silhueta que um laptop aberto não tem — laptop dobra para
       CIMA, caderno dobra para BAIXO.
    2. **A escrita irregular.** Filas de comprimento desigual, com recuo e uma
       quebra na segunda metade de algumas. Fila regular lê como tela (é o que
       `_conteudo_tela` usa de propósito para dizer "log"); fila torta lê como
       letra. Nunca texto de verdade: a bíblia proíbe fonte pixelada no cenário.
    3. **A espessura do bloco.** Duas filas de folha acumulada embaixo. Sem
       elas o caderno lê como duas folhas soltas.

    Zero ciano nesta arte, e isso é regra e não gosto: um pixel de `HIJLM` num
    objeto de 160px devolve a leitura de tela que ela existe para tirar.
    """
    g = Grade(largura, altura)
    meio = largura // 2
    corpo = altura - 2  # as duas últimas filas são a espessura do bloco

    # folha com leve perspectiva: a aresta de TRÁS é mais estreita, porque a
    # plateia olha de cima-à-frente. Retângulo puro lê como adesivo na mesa.
    for i in range(corpo):
        t = i / max(1, corpo - 1)
        recuo = max(0, round((1 - t) * largura * 0.09))
        g.linha_h(recuo, i, largura - 2 * recuo, "8")
        g.ponto(recuo, i, "7")
        g.ponto(largura - 1 - recuo, i, "6")

    # o vale central: é ele que diz caderno em vez de laptop
    for i in range(corpo):
        g.ponto(meio - 1, i, "7")
        g.ponto(meio, i, "6")
        g.ponto(meio + 1, i, "7")
    for i in range(2, corpo - 1, 3):  # argolas atravessando o vale
        g.ponto(meio - 2, i, "5")
        g.ponto(meio, i, "8")
        g.ponto(meio + 2, i, "5")

    # título sublinhado na página da esquerda. A fase 5 diz que ela escreve
    # "o que eu sei fazer hoje" em cima de uma página nova: o sublinhado é a
    # única maneira de mostrar que existe um título sem escrever letra.
    g.linha_h(3, 2, meio - 8, "3")
    g.linha_h(3, 3, meio - 9, "5")

    # escrita à mão: comprimento irregular, recuo alternado e quebra de linha
    for pagina, x0 in ((0, 3), (1, meio + 3)):
        util = meio - 6
        for k in range(4):
            y = 6 + k * 4 if pagina == 0 else 3 + k * 4
            if y >= corpo - 2:
                break
            comp = max(3, util - 1 - ((k * 5 + pagina * 3) % max(2, util // 2)))
            g.linha_h(x0 + (1 if k % 2 else 0), y, comp, "4")
            if comp > 6:  # a linha não fecha reta: letra manuscrita nunca fecha
                g.linha_h(x0 + 1, y + 1, max(2, comp // 3), "5")

    g.linha_h(1, corpo, largura - 2, "6")  # espessura do bloco de folhas
    g.linha_h(2, corpo + 1, largura - 4, "5")
    return g


def grade_impressa(largura: int = 42, altura: int = 28) -> Grade:
    """Grade curricular IMPRESSA: folha com linhas e colunas. NÃO é tela.

    Mesmo defeito de rótulo do `caderno_aberto`: "Grade do próximo semestre" era
    desenhada com `objeto-monitor-ligado`, e o hotspot dizia grade enquanto a
    tela mostrava um monitor.

    O que separa folha de tela aqui é a AUSÊNCIA DE MOLDURA e a presença de
    perspectiva: monitor tem carcaça em volta e fica de pé; folha tem aresta de
    papel e deita na mesa. E o clipe no canto — silhueta que nenhuma tela tem.

    Marca-texto em `LUZ` e não em ciano: duas células marcadas dizem que ELA
    marcou, que é o gancho da fase (ela reconhece três matérias e nenhuma é o
    que faz todo dia). Ciano devolveria a leitura de tela.
    """
    g = Grade(largura, altura)

    # folha com perspectiva leve + aresta de papel na frente
    for i in range(altura):
        t = i / max(1, altura - 1)
        recuo = max(0, round((1 - t) * largura * 0.07))
        g.linha_h(recuo, i, largura - 2 * recuo, "8")
        g.ponto(recuo, i, "7")
        g.ponto(largura - 1 - recuo, i, "6")
    g.linha_h(2, altura - 1, largura - 4, "5")

    colunas, linhas_n = 5, 5
    passo = (largura - 8) / colunas
    passo_y = (altura - 10) / linhas_n

    # cabeçalho: faixa escura com um rótulo por coluna. É o que faz a plateia
    # ler TABELA em vez de folha pautada.
    g.retangulo(3, 2, largura - 6, 4, "5")
    g.linha_h(3, 2, largura - 6, "6")
    for c in range(colunas):
        g.linha_h(round(4 + c * passo), 4, max(2, round(passo) - 3), "8")

    for l in range(linhas_n + 1):  # grade
        g.linha_h(3, round(7 + l * passo_y), largura - 6, "6")
    for c in range(colunas + 1):
        g.linha_v(round(3 + c * passo), 7, round(linhas_n * passo_y), "6")

    # células ocupadas, e duas delas marcadas a marca-texto
    ocupadas = ((0, 0), (1, 2), (2, 1), (3, 3), (4, 0), (2, 4))
    marcadas = ((1, 2), (3, 3))
    for c, l in ocupadas:
        x = round(4 + c * passo)
        y = round(8 + l * passo_y)
        w = max(2, round(passo) - 2)
        h = max(2, round(passo_y) - 2)
        cor = LUZ[3] if (c, l) in marcadas else "6"
        g.retangulo(x, y, w, h, cor)
        g.dither(x, y, w, h, cor, mais_claro(cor), "esparso")

    # clipe de papel no canto, fora do centro: a silhueta que diz "impresso"
    g.linha_v(largura - 9, 0, 6, "5")
    g.linha_v(largura - 7, 1, 5, "6")
    g.linha_h(largura - 9, 0, 3, "5")
    g.linha_h(largura - 9, 6, 3, "4")
    return g


def atril(largura: int = 32, altura: int = 52) -> Grade:
    """Atril de onde se apresenta: tampo inclinado, folha, painel e base.

    Nasce do defeito mais caro da fase 4: o hotspot cujo rótulo é "Apresentar"
    tinha como arte o CRACHÁ que ele concede — a recompensa fazendo papel do
    gesto, flutuando no meio da mesa. Clicava-se num crachá e vinha silêncio.

    DUAS COISAS FAZEM UM ATRIL LER COMO ATRIL E NÃO COMO ARMÁRIO ESTREITO:

    1. **A inclinação do tampo.** Púlpito de topo reto é um armário. A aresta de
       trás 3px mais alta que a da frente é o que dá a função.
    2. **A folha em cima.** Sem ela o objeto é um pedestal. Com ela, alguém
       acabou de subir ali com uma página na mão — que é exatamente o que a
       fase 4 precisa mostrar.

    A faixa de acento em `LUZ` no painel frontal é o que o faz pertencer a um
    EVENTO em vez de a uma sala de aula. Não é o acento vermelho da cena: a
    Sala de Reuniões gasta o vermelho na faixa do evento, e duas fontes de
    vermelho na mesma imagem dividem o olho.

    O microfone sai FORA do centro de propósito — simetria perfeita lê como
    móvel de catálogo, e 1px de assimetria já mata isso (bíblia §9).
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(AZUL)
    y_tampo = 5
    base_corpo = altura - 5

    # microfone em gooseneck, saindo do lado direito
    linha(g, largura - 10, y_tampo + 1, largura - 8, y_tampo - 2, "3")
    linha(g, largura - 8, y_tampo - 2, largura - 6, y_tampo - 5, "4")
    g.retangulo(largura - 7, 0, 3, 3, "2")
    g.linha_h(largura - 7, 0, 3, "5")

    # TAMPO INCLINADO, DESENHADO COLUNA POR COLUNA. Foi a correção de olhar o
    # sprite: com o tampo montado por `linha_h` a aresta de cima saía HORIZONTAL
    # e o objeto lia como pedestal (ou lixeira) com uma faixa laranja. A
    # inclinação é a única coisa que diz "isto é superfície de leitura", e ela só
    # existe se a aresta de trás estiver mais ALTA que a da frente — o que, numa
    # grade de chars, se faz variando o y de início por coluna.
    inclina = 4
    for dx in range(largura):
        topo = y_tampo + inclina - round(inclina * dx / max(1, largura - 1))
        g.linha_v(dx, topo, 7, med)
        g.ponto(dx, topo, cla)
        g.ponto(dx, topo + 6, esc)
    # a folha sobre o tampo, acompanhando a inclinação: é ela que faz do atril
    # um atril e não um pedestal
    for dx in range(5, largura - 9):
        topo = y_tampo + inclina - round(inclina * dx / max(1, largura - 1))
        g.linha_v(dx, topo + 1, 4, "8")
        g.ponto(dx, topo + 1, "z")
    for k in range(2):  # duas filas de "texto" na folha, de comprimentos desiguais
        for dx in range(7, largura - 12 - k * 5):
            topo = y_tampo + inclina - round(inclina * dx / max(1, largura - 1))
            g.ponto(dx, topo + 2 + k, "5" if k == 0 else "6")
    # lábio frontal do tampo: sem ele o tampo derrete no corpo
    g.linha_h(1, y_tampo + inclina + 7, largura - 2, esc)

    # corpo em trapézio: estreita para baixo, o que dá presença ao tampo
    topo_corpo = y_tampo + inclina + 8
    for i in range(topo_corpo, base_corpo):
        t = (i - topo_corpo) / max(1, base_corpo - topo_corpo - 1)
        recuo = round(3 * t)
        g.linha_h(3 + recuo, i, largura - 6 - 2 * recuo, med)
        g.ponto(3 + recuo, i, cla)
        g.ponto(largura - 4 - recuo, i, esc)
    g.dither(6, topo_corpo + 2, largura - 12, base_corpo - topo_corpo - 4, med, esc, "esparso")

    # faixa de acento do evento no painel frontal
    faixa_y = topo_corpo + (base_corpo - topo_corpo) // 3
    g.retangulo(6, faixa_y, largura - 12, 6, LUZ[1])
    g.linha_h(6, faixa_y, largura - 12, LUZ[3])
    g.linha_h(6, faixa_y + 5, largura - 12, LUZ[0])
    g.linha_h(8, faixa_y + 2, largura - 18, "8")
    g.linha_h(8, faixa_y + 3, largura - 23, LUZ[4])

    # base alargada: atril sem base cai, e a plateia sabe disso
    g.retangulo(1, base_corpo, largura - 2, 3, mais_escuro(esc))
    g.linha_h(1, base_corpo, largura - 2, esc)
    g.retangulo(3, altura - 2, largura - 6, 2, mais_escuro(esc))
    g.linha_h(4, altura - 2, largura - 8, esc)
    return g


def plateia(largura: int = 196, altura: int = 46, *, pessoas: int = 5) -> Grade:
    """Plateia sentada de costas, para PRIMEIRO PLANO cortado pela borda.

    Existe porque o texto de abertura da fase 4 promete *"a sala inteira é gente
    apresentando"* e o cenário entregava uma sala vazia. Sala de evento sem
    plateia não é sala de evento — é sala.

    É plano de FRENTE, então é escura (bíblia §4.2) e cortada pela borda
    inferior (§4.1). O que a faz ler apesar de escura é o REALCE DE ARESTA no
    alto de cada cabeça e de cada ombro: a luz da sala vem de cima, então só o
    topo pega luz, e é esse fio claro que desenha a silhueta. Escurecer sem
    devolver aresta transforma primeiro plano em tarja preta — erro já cometido
    e a razão de `_aresta_de_luz` existir em `cenarios.py`.

    CINCO PESSOAS, NENHUMA IGUAL À OUTRA, e a variação é por SILHUETA antes de
    cor (bíblia §5.4 aplicada a figurante): altura de cabeça desigual, volume de
    cabelo diferente, largura de ombro diferente, e uma delas inclinada. Cinco
    cabeças idênticas em fila leem como grade de pontos — é o mesmo defeito da
    fachada do mapa e da cerca de rádios da linha de produção.

    Os tons de pele percorrem as quatro famílias da paleta. Elenco de figurante
    todo na mesma pele é a versão preguiçosa do mesmo NPC repintado, e aparece
    tanto quanto no elenco nomeado.
    """
    g = Grade(largura, altura)
    proximo = serie(20250514)
    passo = largura / pessoas
    peles = ("S", "T", "k", "N", "l")
    cabelos = ("P", "Q", "R", "U", "P")
    roupas = (AZUL, NEUTRO[:5], MADEIRA[:4], AZUL, NEUTRO[:4])

    for i in range(pessoas):
        cx = round(passo * (i + 0.5)) + (proximo(3) - 1)
        esc, med, cla = tons_de_volume(roupas[i % len(roupas)])
        pele = peles[i % len(peles)]
        cabelo = cabelos[i % len(cabelos)]
        desce = proximo(4)  # cabeça mais alta ou mais baixa
        r_cab = 6 + proximo(2)  # raio da cabeça
        topo = 2 + desce
        ombro_y = topo + r_cab * 2 + 2
        meia = round(passo * 0.46) + proximo(3)

        # ombros e costas, abrindo até a borda de baixo
        for dy in range(ombro_y, altura):
            t = (dy - ombro_y) / max(1, altura - ombro_y - 1)
            w = max(2, round(meia * (0.42 + 0.58 * min(1.0, t * 1.9))))
            g.linha_h(cx - w, dy, 2 * w + 1, med)
            g.ponto(cx - w, dy, cla)
            g.ponto(cx + w, dy, esc)
        g.dither(cx - meia // 2, ombro_y + 4, meia, altura - ombro_y - 5, med, esc, "esparso")
        # aresta de luz no ombro: sem ela a figura é uma mancha
        w0 = max(2, round(meia * 0.42))
        g.linha_h(cx - w0, ombro_y, 2 * w0 + 1, cla)

        # nuca em tom de pele: 2px, e é o que separa cabeça de capuz
        g.linha_h(cx - 2, ombro_y - 2, 5, pele)
        g.linha_h(cx - 2, ombro_y - 1, 5, mais_escuro(pele))

        # cabeça, com o cabelo cobrindo a parte de trás (é de costas)
        _elipse(g, cx, topo + r_cab, r_cab, r_cab + 1, cabelo)
        _elipse(g, cx - 1, topo + r_cab - 1, r_cab - 2, r_cab - 1, mais_claro(cabelo))
        g.linha_h(cx - r_cab + 2, topo, 2 * r_cab - 3, mais_claro(cabelo, 2))
        # orelha de um lado só: assimetria de 1px mata a cara de manequim
        g.ponto(cx + r_cab - 1, topo + r_cab + 1, pele)
        g.ponto(cx + r_cab - 1, topo + r_cab + 2, mais_escuro(pele))

        # encosto do assento aparecendo entre as pessoas
        if i < pessoas - 1:
            bx = round(passo * (i + 1))
            g.retangulo(bx - 3, altura - 14, 7, 14, esc)
            g.linha_h(bx - 3, altura - 14, 7, med)
    return g


def fileira_de_assentos(
    largura: int = 480,
    altura: int = 54,
    ramp: str = AZUL,
    *,
    assentos: int = 6,
    saliencia: int = 10,
    semente: int = 7,
) -> Grade:
    """Fila de assentos vista de trás, para primeiro plano cortado pela borda.

    A vestimenta de evento que NÃO custa geometria de chão. A Sala de Reuniões
    precisa ler como Innovation Week, e o caminho óbvio — totem, cavalete, mesa
    de credenciamento — teria base no piso e invalidaria as coordenadas que
    outra frente mediu contra a cena atual. Assento de primeiro plano vive
    abaixo da faixa de caminhada, onde ninguém para.

    ┌──────────────────────────────────────────────────────────────────────────┐
    │ O BLOCO OPACO CONTÍNUO NÃO É PREGUIÇA, É REQUISITO DO MAPA DE CHÃO.      │
    │                                                                          │
    │ `exportar_chao.py` devolve, por coluna, a MAIOR corrida contígua de piso │
    │ abaixo da junta parede-piso. Se esta fila tivesse qualquer vão entre     │
    │ assentos, aquela coluna teria uma corrida de piso indo até a borda de    │
    │ baixo da imagem — e na Sala de Reuniões essa corrida seria MAIOR que a   │
    │ faixa real de caminhada (que ali tem 7 a 16 linhas, porque a mesa oval   │
    │ cobre o miolo). O mapa passaria a dizer que a figura anda no primeiro    │
    │ plano, `Cena.chao.test.ts` concordaria, e três paradas da fase 4         │
    │ reprovariam sem que nada visual tivesse mudado.                          │
    │                                                                          │
    │ Daí o desenho: de `saliencia` para baixo é opaco em TODA a largura, e as │
    │ únicas colunas vazadas ficam nas `saliencia` filas de cima, onde os      │
    │ encostos sobem. E a rampa é AZUL porque neutro seria lido como PISO pelo │
    │ exportador — é o mesmo erro que aposentou `props.tapete`.                │
    └──────────────────────────────────────────────────────────────────────────┘

    Alturas, larguras e centros desiguais por sorteio determinístico: seis
    encostos idênticos em fila leem como grade de pontos, que é o defeito da
    primeira fachada do mapa e da primeira fila de rádios da linha de produção.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(ramp)
    proximo = serie(semente)

    # a fila de TRÁS: bloco opaco, mais escuro, ditherizado. É contra ela que os
    # encostos da frente recortam, e é ela que fecha todas as colunas.
    g.retangulo(0, saliencia, largura, altura - saliencia, esc)
    g.dither(0, saliencia, largura, altura - saliencia, esc, mais_escuro(esc), "esparso")

    passo = largura / assentos
    for i in range(assentos):
        w = max(14, round(passo) - 6 - proximo(7))
        sobe = proximo(saliencia + 1)  # quanto o encosto passa da linha de corte
        topo = saliencia - sobe
        cx = round(passo * (i + 0.5)) + (proximo(7) - 3)
        x = cx - w // 2
        alto = altura - topo
        g.retangulo(x, topo + 2, w, alto - 2, med)
        g.dither(x + 1, topo + 3, w - 2, alto - 5, med, esc, "xadrez")
        for k in range(3):  # topo arredondado: encosto de canto reto lê como caixa
            g.linha_h(x + k * 2, topo + 2 - k // 2, w - k * 4, med if k else cla)
        g.linha_h(x + 2, topo + 2, w - 4, cla)
        g.linha_v(x, topo + 3, alto - 3, cla)
        g.linha_v(x + w - 1, topo + 3, alto - 3, esc)
        for px in (x + 4, x + w - 6):  # costura do estofado
            g.linha_v(px, topo + 5, alto - 8, esc)
            g.linha_v(px + 1, topo + 5, alto - 8, cla)
    return g


def painel_de_processo(largura: int = 44, altura: int = 32) -> Grade:
    """Painel de acompanhamento da linha: caixa industrial + tela de etapas.

    ┌──────────────────────────────────────────────────────────────────────────┐
    │ ACHADO, NÃO ESCOPO. `objeto-painel-processo` está declarado em          │
    │ `src/assets/manifest.ts` e é usado por `bloco3.ts` (192x144 px de tela), │
    │ mas `cenarios._objetos()` nunca o gerava e não existe arte vetorial de  │
    │ objeto em `src/arte/` — ou seja, o hotspot da Linha de Produção caía no  │
    │ PLACEHOLDER geométrico rotulado, silenciosamente, porque a cadeia de     │
    │ fallback de `Imagem.tsx` nunca quebra. Está relatado.                    │
    └──────────────────────────────────────────────────────────────────────────┘

    Caixa antes de tela: o que separa painel industrial de televisão é a
    proporção (muito corpo, pouca janela), a botoeira ao lado e a etiqueta
    embaixo. Mesma lição que `celula_de_processo` já pagou — com o visor
    ocupando a peça inteira, três cabines em fila liam como parede de monitores.
    """
    g = Grade(largura, altura)
    esc, med, cla = tons_de_volume(AZUL)
    g.retangulo(0, 0, largura, altura, med)
    _borda_de_volume(g, 0, 0, largura, altura, cla, esc)
    g.dither(1, 1, largura - 2, altura - 2, med, mais_escuro(med), "esparso")

    tela_w, tela_h = largura - 13, altura - 11
    _conteudo_tela(g, 3, 3, tela_w, tela_h, "processo")
    g.moldura(3, 3, tela_w, tela_h, esc)
    g.linha_h(3, 3, tela_w, cla)

    # botoeira à direita: três pilotos e um botão de parada
    for i, tom in enumerate((VERDE[3], LUZ[3], TELA[3])):
        g.ponto(largura - 6, 6 + i * 5, tom)
        g.ponto(largura - 5, 6 + i * 5, mais_claro(tom))
        g.linha_h(largura - 6, 7 + i * 5, 2, esc)
    g.retangulo(largura - 8, altura - 11, 6, 5, esc)
    g.linha_h(largura - 8, altura - 11, 6, cla)
    g.retangulo(largura - 7, altura - 10, 4, 3, VERMELHO[2])

    # etiqueta de identificação: papel claro embaixo da tela
    g.retangulo(3, altura - 6, tela_w, 3, "7")
    g.linha_h(4, altura - 6, tela_w - 2, "8")
    g.linha_h(4, altura - 4, tela_w - 4, "5")
    return g
