"""
Os oito itens do inventário, em grade 24x24 (96x96 na tela, escala 4x).

LEIA docs/biblia-de-arte.md §2 (regras duras) e §3 (dosagem de paleta) antes de
mexer aqui. O que segue são as decisões específicas DESTA frente.

--------------------------------------------------------------------- silhueta
A 96px, contra a barra de itens, o que o olho pega primeiro é o CONTORNO. Cor
vem depois, e em vídeo comprimido às vezes não vem. Por isso os oito foram
escolhidos por forma antes de por cor, e nenhuma forma se repete:

    senha ................ chave vertical: arco vazado + haste + 2 dentes
    indicacao-trilha ..... guardanapo em diamante, borda irregular
    anotacoes-treinamento  caderno com espiral saindo pela esquerda
    relatorio ............ maço de folhas em retrato + clipe no topo
    projeto-entregue ..... caixa com tampa e fita cruzada
    cartao-rafael ........ retângulo largo e baixo, canto virado
    certificado-degree ... folha paisagem grande + selo pendurado
    cracha-innovation .... cordão em V torto sobre cartão retrato

Dois pares corriam risco de empatar e foram separados de propósito:
guardanapo e relatório são os dois "papel claro", então um é diamante de 45°
e o outro é retrato empilhado com clipe; cartão e certificado são os dois
"paisagem", então a razão foi aberta (14x8 contra 18x15) — a diferença de
tamanho é o que se lê de longe, não o conteúdo impresso.

------------------------------------------------------- um acento por item, 8x
A spec pede acento de família DIFERENTE nos oito, e a paleta tem sete famílias
não-reservadas (roxo é do clímax, pele e cabelo são de personagem). A oitava
saiu de `cabelo` usada como GRAFITE: P/Q/U é a única rampa escura-neutra-quente
que existe, e capa de caderno preta com espiral cinza é exatamente isso.

    senha ................ luz       u v x z   (latão)
    indicacao-trilha ..... neutro    6 7 8     (papel)
    anotacoes-treinamento grafite   P Q U     (capa preta + espiral)
    relatorio ............ azul      c d e     (clipe)
    projeto-entregue ..... madeira   m n o p q (papelão)
    cartao-rafael ........ tela      J L       (faixa ciano)
    certificado-degree ... verde     g h i j   (fio impresso + selo)
    cracha-innovation .... vermelho  D E F     (cordão)

ARMADILHA: a rampa `cabelo` ("PQRU") NÃO é monotônica em luminância — R é
quase preto e vem depois de Q. `mais_claro('Q')` devolve R e ESCURECE. Por isso
o caderno escolhe P/Q/U na mão em vez de usar os helpers.

-------------------------------------------------- os três tardios não aparecem
`cartao-rafael`, `certificado-degree` e `cracha-innovation` só revelam função no
Bloco 5. `types.ts` diz literalmente que a UI não os diferencia, então a arte
também não pode: nenhum brilho, nenhuma aura, nenhuma moldura de destaque,
nenhum acento reservado.

Não basta "não marcar" — é preciso não deixar CORRELAÇÃO que o olho pegue na
barra. Foi por isso que:
  - o item mais chamativo do conjunto é a chave de latão, que é IMEDIATO;
  - o item mais simples é a caixa de papelão, que é IMEDIATO;
  - o mais detalhado é o certificado, que é tardio — e o segundo mais detalhado
    é o relatório, que é imediato;
  - papel claro aparece nos dois grupos (guardanapo/relatório contra
    cartão/certificado), e objeto físico também (chave/caixa contra crachá).
O fio verde impresso do certificado é gráfica de certificado, não realce: a
caixa tem fita, o cartão tem faixa e o crachá tem tarja pelo mesmo motivo.

------------------------------------------------------------ desenho e margens
Tudo é autorado em faixa de char (`segmento`), com `.` como buraco, e ancorado
numa área segura de 20x20 em (MARGEM, MARGEM). A margem de 2px existe porque o
item sai em DUAS versões: a de barra leva uma passada de `contornar()` e a de
cena leva duas (2px de borda, que é o que faz o item ler sobre o cenário em vez
de sobre fundo escuro). Com margem 1 a segunda passada seria cortada na borda
do PNG.

Item é objeto solto: NÃO leva sombra de contato. Ele é mostrado na barra e como
hotspot, nunca assentado num piso.
"""

from __future__ import annotations

from pathlib import Path

from .nucleo import Grade, contornar, escrever_sprite, verificar_sprite

# ------------------------------------------------------------------ constantes

LADO = 24
"""Grade do item. 24*4 = 96px na tela, conforme a bíblia §2.1."""

MARGEM = 2
"""Folga em cada lado para caber DUAS dilatações de contorno (versão de cena)."""

SEGURO = LADO - 2 * MARGEM
"""Área útil de desenho: 20x20."""

# Itens que aparecem como objeto dentro do cenário e não só na barra recebem a
# versão de contorno reforçado. Gerada para os OITO de propósito: a decisão de
# qual hotspot usa qual arte é da frente de UI (bíblia §7.3 pede um campo novo
# em `Hotspot` que ainda não existe), e gerar só para alguns criaria na pasta
# de assets exatamente a assimetria que o manifest proíbe em comentário —
# "nada aqui pode sugerir que estes três são diferentes dos outros cinco".
GERA_VERSAO_DE_CENA = True


def _faixas(g: Grade, linhas: list[tuple[int, int, str]]) -> None:
    """Escreve faixas (dy, dx, chars) relativas à área segura.

    Existe para que o desenho seja escrito como DESENHO e não como par de
    coordenadas: `(13, 8, "xvvuxxv")` é legível, `ponto(10,15,'x')` não é. O dx
    relativo também elimina a contagem de pontos de preenchimento à esquerda,
    que a bíblia §9 aponta como a maior fonte de desalinhamento.
    """
    for dy, dx, chars in linhas:
        g.segmento(MARGEM + dx, MARGEM + dy, chars)


def _nova() -> Grade:
    return Grade(LADO, LADO)


# ---------------------------------------------------------------------- senha
# "A senha do primeiro acesso. Montada com pedaço de três conversas."


def _senha() -> Grade:
    """Chave de latão vertical, com a haste partida em TRÊS segmentos.

    A senha é abstrata e não tem forma própria; chave é a forma que o gênero já
    convencionou para acesso, e é a única silhueta vazada do conjunto (o arco
    tem miolo transparente), o que a torna inconfundível a 96px.

    Os dois anéis escuros na haste dividem-na em três — a senha foi "montada com
    pedaço de três conversas". É o único lugar onde a descrição entra como
    estrutura em vez de como enfeite.
    """
    g = _nova()
    _faixas(
        g,
        [
            # arco: 9px de largura, miolo transparente em 3x3. O vão vira
            # linha interna na dilatação, que é o que faz o arco ler como anel.
            (0, 7, "xxxxx"),
            (1, 6, "xxvvvvu"),
            (2, 5, "xzvvvvvuu"),  # z = único glint especular do item
            (3, 5, "xxv...vvu"),
            (4, 5, "xvv...vvu"),
            (5, 5, "xvv...vuu"),
            (6, 5, "xvvvvvuuu"),
            (7, 6, "xvvvuuu"),
            (8, 7, "xvvuu"),
            # haste: 4px, luz na coluna da esquerda, sombra na da direita
            (9, 8, "xvvu"),
            (10, 8, "xvvu"),
            (11, 8, "xvvu"),
            (12, 8, "uuuu"),  # anel 1 — fim do primeiro segmento
            (13, 8, "xvvuxxv"),  # dente 1
            (14, 8, "xvvuvvu"),
            (15, 8, "xvvu"),
            (16, 8, "uuuu"),  # anel 2 — fim do segundo segmento
            (17, 8, "xvvuxv"),  # dente 2, menor: assimetria proposital
            (18, 8, "xvvuvu"),
            (19, 8, "xvv"),  # ponta 1px mais estreita que a haste
        ],
    )
    return g


# ----------------------------------------------------------- indicacao-trilha
# "Um papel de guardanapo com três nomes de trilha anotados pela Bianca."


_SPANS_GUARDANAPO: list[tuple[int, int, int]] = [
    # (dy, primeira coluna, última coluna). Quadrado INCLINADO ~25°, não
    # diamante: arestas em degrau raso 3:1 em cima e embaixo, quase verticais nos
    # lados. Mais quatro irregularidades de 1px na borda, porque guardanapo tem
    # borda macia e aresta exata é metade do que denuncia forma geométrica.
    (2, 5, 7),
    (3, 5, 9),
    (4, 5, 12),
    (5, 4, 15),
    (6, 4, 18),
    (7, 4, 18),
    (8, 3, 17),
    (9, 3, 17),
    (10, 2, 17),
    (11, 3, 17),
    (12, 3, 16),
    (13, 2, 16),
    (14, 3, 17),
    (15, 5, 16),
    (16, 9, 16),
    (17, 12, 15),
]


def _indicacao_trilha() -> Grade:
    """Guardanapo inclinado com três linhas de anotação.

    Inclinado, e não alinhado aos eixos, por um motivo só: é a única forma
    NÃO-ortogonal do conjunto, e é o que impede o empate com o relatório, que é o
    outro papel claro. As três linhas de tinta de comprimento desigual são as
    três trilhas — sugeridas por traço, nunca por letra (a spec proíbe texto
    legível, e a 24px letra vira ruído).

    Custou TRÊS versões olhadas na folha de contato, e as duas descartadas valem
    registro porque são armadilhas de forma, não de cor:

    1. Diamante simétrico de 45° com sombra em bandas por (dx+dy). As bandas
       ficam paralelas às arestas e viram FACETA: leu como gema lapidada.
    2. Diamante com a ponta de baixo dobrada para cima (base cega) e as linhas
       na parte estreita de cima. Ponta em cima + base larga + listras
       horizontais leu como HAMBÚRGUER.

    O que resolveu foi tirar a simetria da forma inteira em vez de remendar
    sombra e dobra: quadrado torto tem quatro arestas retas e nenhum eixo de
    simetria, e é isso que o olho aceita como folha de papel jogada na mesa.
    A dobra de canto foi abandonada de propósito — tentada nos dois cantos, ela
    lê como buraco quando é clara e desaparece quando é escura.
    """
    g = _nova()

    for dy, a, b in _SPANS_GUARDANAPO:
        if dy <= 10:
            tom = "8"
        elif dy <= 14:
            tom = "7"
        else:
            tom = "6"
        g.segmento(MARGEM + a, MARGEM + dy, tom * (b - a + 1))

    # Juntas ditherizadas entre as faixas de valor: banda sólida é justamente o
    # que a compressão de vídeo transforma em faixa visível (bíblia §2.7).
    g.dither(MARGEM + 3, MARGEM + 11, 14, 1, "8", "7")
    g.dither(MARGEM + 5, MARGEM + 15, 11, 1, "7", "6")

    _faixas(
        g,
        [
            # três trilhas, à mão, apressadas. Começo e fim desalinhados nas três
            # (e a falha de 1px na do meio) é o que impede o conjunto de ler como
            # régua ou como código de barras.
            (6, 6, "55555555"),
            (8, 5, "55555.5555"),
            (10, 4, "5555555"),
        ],
    )
    return g


# ------------------------------------------------------ anotacoes-treinamento
# "Caderno cheio de anotações de arquitetura de sistema. Letra apressada."


def _anotacoes_treinamento() -> Grade:
    """Caderno de capa escura com espiral saindo pela borda esquerda.

    A espiral é o item inteiro: capa fechada sozinha seria um retângulo escuro,
    a silhueta mais fraca possível. Cinco anéis de grafite furando a borda
    quebram o contorno e dizem "caderno" antes de qualquer cor.

    Grafite vem de P/Q/U escolhidos à mão porque a rampa `cabelo` não é
    monotônica — ver a armadilha no topo do arquivo.
    """
    g = _nova()

    # Bloco de folhas primeiro: sobra 1px à direita e embaixo da capa, e é essa
    # borda clara que separa capa de miolo sem precisar de linha desenhada.
    g.retangulo(MARGEM + 6, MARGEM + 3, 12, 16, "7")
    g.linha_v(MARGEM + 17, MARGEM + 3, 16, "8")

    # Capa por cima: luz em cima/à esquerda, sombra embaixo/à direita.
    g.retangulo(MARGEM + 5, MARGEM + 2, 12, 16, "Q")
    g.linha_h(MARGEM + 5, MARGEM + 2, 12, "U")
    g.linha_v(MARGEM + 5, MARGEM + 2, 16, "U")
    g.linha_h(MARGEM + 5, MARGEM + 17, 12, "P")
    g.linha_v(MARGEM + 16, MARGEM + 2, 16, "P")

    # Etiqueta colada na capa, com duas linhas de letra apressada. Pequena e
    # fora do centro: etiqueta centralizada leria como rótulo de UI.
    g.retangulo(MARGEM + 8, MARGEM + 7, 8, 7, "8")
    g.linha_h(MARGEM + 8, MARGEM + 13, 8, "7")
    _faixas(g, [(9, 9, "55555"), (11, 9, "555555")])

    # Espiral: cinco anéis atravessando a lombada. Cada um leva 1px de sombra
    # embaixo, senão o anel lê como risco e não como arame.
    for dy in (4, 7, 10, 13, 16):
        _faixas(g, [(dy, 2, "UUUU"), (dy + 1, 2, "PPP")])
    return g


# ------------------------------------------------------------------ relatorio
# "Cinco páginas sobre um erro que ninguém pediu pra investigar."


def _relatorio() -> Grade:
    """Maço de folhas em retrato com clipe azul no topo.

    O leque de três camadas descendo para a esquerda é o que diz "cinco
    páginas" — uma folha só leria como certificado sem selo. O clipe existe
    tanto como acento (é o único azul dos oito) quanto como saliência: ele
    rompe a aresta de cima, e aresta rompida é o que separa este retrato dos
    outros retângulos do conjunto.
    """
    g = _nova()

    # Três camadas, cada uma 2px à esquerda e 1px abaixo da de cima. Começou com
    # 1px de deslocamento e o leque não aparecia: sobrava uma borda de 1px que
    # lia como sombra da folha, não como outra folha.
    g.retangulo(MARGEM + 2, MARGEM + 6, 14, 14, "6")
    g.retangulo(MARGEM + 4, MARGEM + 4, 13, 15, "7")
    g.retangulo(MARGEM + 5, MARGEM + 3, 13, 15, "8")
    g.linha_v(MARGEM + 17, MARGEM + 3, 15, "7")
    g.linha_h(MARGEM + 5, MARGEM + 17, 13, "7")

    # Texto corrido: quatro linhas de comprimento desigual. Desigual porque
    # quatro linhas do mesmo tamanho leem como código de barras.
    _faixas(
        g,
        [
            (7, 7, "555555555"),
            (9, 7, "55555555"),
            (11, 7, "555555555"),
            (13, 7, "555555"),
        ],
    )

    # Canto de baixo enrolado: papel solto enrola, prancheta não. É a metade do
    # que tira este item da leitura "prancheta" — a outra metade é o clipe fora
    # do centro, logo abaixo.
    _faixas(
        g,
        [
            (15, 15, "66"),
            (16, 14, "667"),
            (17, 13, "6677"),
        ],
    )

    # Clipe: corpo azul com aresta clara em cima e duas pernas mordendo o papel.
    # Estreito (5px) e DESCENTRADO. Na versão anterior era largo e centralizado, e
    # clamp largo no meio da aresta de cima é a assinatura de prancheta, que é
    # outro objeto — o item é um maço de folhas presas.
    g.retangulo(MARGEM + 6, MARGEM + 1, 5, 4, "d")
    g.linha_h(MARGEM + 6, MARGEM + 1, 5, "e")
    g.linha_h(MARGEM + 6, MARGEM + 4, 5, "c")
    _faixas(g, [(5, 6, "c"), (5, 10, "c")])
    return g


# ------------------------------------------------------------ projeto-entregue
# "A entrega. Funcionando, documentada, no prazo."


def _projeto_entregue() -> Grade:
    """Caixa de papelão fechada com fita cruzada.

    Entrega é abstrata; caixa lacrada é a forma que diz "fechado e a caminho"
    sem precisar de texto. É também o item mais SIMPLES dos oito, de propósito:
    o conjunto precisa de amplitude de detalhe, e a amplitude tinha de existir
    dentro do grupo dos imediatos para não virar pista dos tardios.

    Único item construído com `caixa_com_volume()`, que já resolve as três
    casas da rampa e a luz de cima-à-esquerda.

    ERRO CORRIGIDO: a primeira versão tinha fita CRUZADA (vertical + horizontal)
    sobre um dither esparso da face. O dither esparso é uma grade regular, e
    grade regular dividida por duas fitas lê como BARRA DE CHOCOLATE — foi o que
    a folha de contato mostrou. A fita agora é uma banda horizontal só, o grão
    virou mancha irregular, e a costura vertical existe apenas abaixo da fita.
    """
    g = _nova()

    g.caixa_com_volume(MARGEM + 4, MARGEM + 7, 14, 12, "mnopqr")
    g.caixa_com_volume(MARGEM + 3, MARGEM + 4, 16, 4, "mnopqr")

    # Grão do papelão: manchas soltas, nunca padrão. Face de 14x12 totalmente
    # plana leria como plástico (bíblia §4.5), mas textura regular nesta escala
    # compete com a silhueta em vez de servi-la.
    for dx, dy in ((5, 9), (8, 10), (15, 9), (6, 16), (12, 17), (16, 10), (9, 16)):
        g.ponto(MARGEM + dx, MARGEM + dy, "o")

    # Costura das abas: só no trecho abaixo da fita, senão volta a fechar grade.
    g.linha_v(MARGEM + 11, MARGEM + 14, 4, "n")

    # Fita: 1px mais larga que o corpo em cada lado, porque ela dá a volta na
    # caixa. Mais CLARA que o papelão — fita de empacotamento reflete, e banda
    # escura sobre madeira já é o que a cinta do caderno faz.
    g.linha_h(MARGEM + 3, MARGEM + 11, 16, "r")
    g.linha_h(MARGEM + 3, MARGEM + 12, 16, "q")
    g.linha_h(MARGEM + 3, MARGEM + 13, 16, "q")

    # Pedaço de fita selando a tampa, desalinhado do centro de propósito.
    g.retangulo(MARGEM + 9, MARGEM + 4, 2, 4, "q")
    g.ponto(MARGEM + 9, MARGEM + 4, "r")
    return g


# --------------------------------------------------------------- cartao-rafael
# "Rafael Moreira — Engenharia de Dados. Ele escreveu o ramal atrás, à mão."


def _cartao_rafael() -> Grade:
    """Cartão de visita, canto de baixo virado mostrando o avesso escrito.

    16x9 contra o certificado em 18x15: os dois são paisagem, e o que separa os
    dois a 96px é a RAZÃO (1,8 contra 1,2), não o conteúdo impresso. A primeira
    versão tinha 14x8 e a dobra de 3px simplesmente não aparecia na folha.

    O canto virado carrega a descrição inteira — o ramal escrito à mão está no
    avesso, então o avesso precisa aparecer. Duas manchas de tinta e nada mais:
    ramal com dígitos legíveis violaria a proibição de texto.
    """
    g = _nova()

    g.retangulo(MARGEM + 2, MARGEM + 7, 16, 9, "8")
    g.linha_h(MARGEM + 2, MARGEM + 15, 16, "6")
    g.linha_v(MARGEM + 17, MARGEM + 7, 9, "7")

    # Faixa ciano à esquerda: acento da família `tela`, o único dos oito.
    g.retangulo(MARGEM + 3, MARGEM + 8, 4, 7, "J")
    g.linha_h(MARGEM + 3, MARGEM + 8, 4, "L")

    # Nome e cargo: duas linhas, a de baixo mais curta.
    _faixas(g, [(9, 9, "6666666"), (11, 9, "66666")])

    # Canto virado: triângulo no avesso (sombra) com a diagonal da dobra 1 casa
    # mais escura, e o ramal à mão por cima.
    _faixas(
        g,
        [
            (11, 16, "77"),
            (12, 15, "777"),
            (13, 14, "7777"),
            (14, 13, "77777"),
            (15, 12, "777777"),
            (11, 15, "6"),
            (12, 14, "6"),
            (13, 13, "6"),
            (14, 12, "6"),
            (13, 15, "55"),
            (14, 14, "555"),
        ],
    )
    return g


# ---------------------------------------------------------- certificado-degree
# "Certificado de conclusão. Fundamentos de Arquitetura de Sistemas. 40h."


def _certificado_degree() -> Grade:
    """Folha paisagem grande, fio impresso e selo pendurado embaixo-à-esquerda.

    O fio verde é gráfica impressa de certificado, não realce de item tardio —
    mesma categoria da fita da caixa e da faixa do cartão. Sem ele a folha lê
    como papel em branco e empata com o guardanapo.

    O selo fica embaixo-à-ESQUERDA e as fitas escapam pela borda de baixo: é a
    saliência que quebra o retângulo e dá a silhueta. À direita ele espelharia o
    canto virado do cartão, que é justamente o vizinho de quem precisa se
    diferenciar.

    ERRO CORRIGIDO: a primeira versão tinha `moldura()` fechada em verde. Fio
    fechado ao redor de uma folha não lê como gráfica de certificado, lê como
    PORTA-RETRATO — e "item com moldura" é exatamente a leitura que um tardio não
    pode ter, mesmo quando a moldura é impressa. Duas réguas horizontais dão a
    mesma informação tipográfica sem cercar nada.
    """
    g = _nova()

    g.retangulo(MARGEM + 1, MARGEM + 3, 18, 15, "8")
    g.linha_v(MARGEM + 18, MARGEM + 3, 15, "7")
    g.linha_h(MARGEM + 1, MARGEM + 17, 18, "7")

    # Duas réguas impressas, abertas nas laterais.
    g.linha_h(MARGEM + 3, MARGEM + 5, 14, "h")
    g.linha_h(MARGEM + 3, MARGEM + 15, 14, "h")

    # Título mais escuro que o corpo: hierarquia por valor, não por tamanho.
    _faixas(
        g,
        [
            (8, 6, "55555555"),
            (10, 4, "666666666666"),
            (12, 4, "6666666666"),
        ],
    )

    # Selo: roseta de 5x5 com brilho no miolo e duas fitas passando da folha.
    _faixas(
        g,
        [
            (12, 4, "iii"),
            (13, 3, "iiiii"),
            (14, 3, "iijii"),
            (15, 3, "iiihh"),
            (16, 4, "ihh"),
            (17, 4, "gg"),
            (17, 7, "gg"),
            (18, 4, "gg"),
            (18, 7, "gg"),
        ],
    )
    return g


# --------------------------------------------------------- cracha-innovation
# "Crachá de participante. Innovation Day. O cordão ficou torto na foto."


def _cracha_innovation() -> Grade:
    """Crachá de cordão. O V é torto porque a descrição diz que é.

    A perna esquerda desce 4 colunas em 7 linhas e a direita 5 em 6, e começam
    em alturas diferentes: o V sai assimétrico sem parecer erro de desenho. Um V
    simétrico leria como laço de embrulho.

    O cordão é toda a silhueta — cartão retrato sozinho não se distingue do
    cartão de visita. Por isso ele vem primeiro e ocupa um terço da altura.
    """
    g = _nova()

    # Cordão: dois pares de pixels por linha, o da esquerda iluminado.
    cordao_esquerda = [(0, 5), (1, 5), (2, 6), (3, 6), (4, 7), (5, 7), (6, 8)]
    cordao_direita = [(1, 15), (2, 15), (3, 14), (4, 13), (5, 12), (6, 11)]
    for dy, dx in cordao_esquerda:
        _faixas(g, [(dy, dx, "FE")])
    for dy, dx in cordao_direita:
        _faixas(g, [(dy, dx, "FE")])

    # Presilha de metal onde as duas pernas se encontram.
    g.retangulo(MARGEM + 9, MARGEM + 7, 4, 2, "6")
    g.linha_h(MARGEM + 9, MARGEM + 7, 4, "7")

    # Cartão.
    g.retangulo(MARGEM + 5, MARGEM + 9, 12, 10, "8")
    g.linha_h(MARGEM + 5, MARGEM + 18, 12, "6")
    g.linha_v(MARGEM + 16, MARGEM + 9, 10, "7")

    # Tarja do evento no topo do cartão.
    g.retangulo(MARGEM + 6, MARGEM + 10, 10, 3, "E")
    g.linha_h(MARGEM + 6, MARGEM + 10, 10, "F")
    g.linha_h(MARGEM + 6, MARGEM + 12, 10, "D")

    # Foto 3x4 à esquerda e duas linhas de nome à direita — o arranjo que faz
    # um retângulo branco ler como credencial.
    g.retangulo(MARGEM + 6, MARGEM + 14, 4, 4, "6")
    g.retangulo(MARGEM + 7, MARGEM + 15, 2, 2, "5")
    _faixas(g, [(14, 11, "66666"), (16, 11, "6666")])
    return g


# ------------------------------------------------------------------- catálogo

# Ordem idêntica à de ITENS em src/domain/content/base.ts. Manter a ordem é o
# que permite conferir a folha de contato contra o conteúdo sem adivinhar qual
# célula é qual — a folha não desenha rótulo.
ITENS: list[tuple[str, object]] = [
    ("senha", _senha),
    ("indicacao-trilha", _indicacao_trilha),
    ("anotacoes-treinamento", _anotacoes_treinamento),
    ("relatorio", _relatorio),
    ("projeto-entregue", _projeto_entregue),
    ("cartao-rafael", _cartao_rafael),
    ("certificado-degree", _certificado_degree),
    ("cracha-innovation", _cracha_innovation),
]


def _conferir_margem(nome: str, g: Grade) -> list[str]:
    """Avisa se o desenho invade a folga reservada às duas dilatações.

    `verificar_sprite()` não pega isto porque não sabe que o item sai em duas
    versões de contorno. Sem o aviso, a borda reforçada da versão de cena sai
    cortada num lado só — e cortada de um lado é o tipo de erro que a folha de
    contato esconde, porque some no xadrez do fundo.
    """
    caixa = g.caixa()
    if caixa is None:
        return [f"{nome}: item vazio"]
    x0, y0, x1, y1 = caixa
    if x0 < MARGEM or y0 < MARGEM or x1 > LADO - 1 - MARGEM or y1 > LADO - 1 - MARGEM:
        return [
            f"{nome}: desenho em ({x0},{y0})-({x1},{y1}) invade a folga de "
            f"{MARGEM}px; o contorno duplo da versão de cena vai sair cortado"
        ]
    return []


def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG em `destino` e devolve (nome, grade) para a folha.

    Cada item vira dois arquivos: `<id>.png` com uma passada de contorno (barra
    de itens, fundo escuro) e `<id>-cena.png` com duas (2px de borda, para o
    item ler sobre o cenário, spec 03).

    A folha sai em pares item/cena lado a lado porque é a comparação que precisa
    ser olhada: a única pergunta sobre a versão de cena é se o contorno grosso
    engoliu detalhe, e isso só se responde com as duas juntas.
    """
    pecas: list[tuple[str, Grade]] = []
    avisos: list[str] = []

    for nome, construir in ITENS:
        cru = construir()  # type: ignore[operator]
        avisos += _conferir_margem(nome, cru)
        avisos += verificar_sprite(nome, cru, largura_maxima=LADO)

        barra = contornar(cru)
        escrever_sprite(destino / f"{nome}.png", barra)
        pecas.append((nome, barra))

        if GERA_VERSAO_DE_CENA:
            cena = contornar(barra)
            escrever_sprite(destino / f"{nome}-cena.png", cena)
            pecas.append((f"{nome}-cena", cena))

    for aviso in avisos:
        print(f"[itens] aviso: {aviso}")
    return pecas
