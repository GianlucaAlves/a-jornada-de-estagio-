"""
Personagens: a Ana em quatro estados e os cinco NPCs, todos respirando.

POR QUE ESTE MÓDULO É ESCRITO ASSIM
O feedback do dono do projeto sobre a primeira Ana foi literal: *"os braços dela
estão esquisitos, é quase como se ela não tivesse braços, e está tudo muito
travadão"*. São duas queixas com uma causa cada, e as duas são consertadas aqui
por construção, não por retoque.

BRAÇOS — na pose encolhida o vão transparente de 1px entre braço e torso havia
sido removido de propósito, para sugerir "braços colados ao corpo".
`contornar()` é dilatação: sem o vão não nasce a linha interna escura, e do
ombro ao quadril virou um bloco só. Aqui o vão deixou de depender de quem
desenha: cada pose declara `linhas_vao`, e `_conferir_vao()` LEVANTA ERRO se
alguma linha dessa faixa não tiver três corridas opacas (braço | torso | braço).
Aviso não serviria — aviso passa batido e o PNG sai errado de novo. Postura
fechada se expressa estreitando o ombro e aproximando o braço, nunca fechando o
vão (bíblia §2.4).

TRAVADO — não havia animação nenhuma. Toda peça daqui também sai como tira de
respiração de 2 quadros, e a Ana sai com tira de caminhada de 4. Os quadros são
DERIVADOS do sprite parado (`_respirar`, e as pernas declaradas por segmento),
nunca redesenhados: redesenhar quadro de idle é o jeito garantido de o rosto de
11px piscar de um quadro para o outro.

GEOMETRIA (bíblia §5): grade 50x84, eixo em x=25, base em y=81. A base é fixa
nos nove personagens — altura variável por pose faria o elenco flutuar ao trocar
de cena, e a diferença de estatura entre NPCs sai do TOPO, não do pé. O desenho
para em y=80 porque `contornar()` é que ocupa a linha 81.

AUTORIA POR SEGMENTO, NÃO POR PIXEL
Tronco, braço e perna são listas de `(y0, y1, x0, x1)`. Isso existe por três
motivos práticos: o lado direito sai de `_espelhar()` (mirror em x=25) e não
pode desalinhar do esquerdo; mudar de pose é mudar quatro números em vez de
reescrever um bloco de texto; e uma perna que muda de coluna em degraus de 1px
por linha faz bolha no contorno (bíblia §10), o que fica óbvio na lista e
invisível no desenho char a char.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, replace
from pathlib import Path

from .nucleo import (
    ErroDeArte,
    Grade,
    contornar,
    escrever_sprite,
    escrever_tira,
    verificar_sprite,
)
from .paleta import CONTORNO, VAZIO
from .props import MADEIRA, NEUTRO

# --------------------------------------------------------------- geometria

LARGURA = 50
ALTURA = 84
EIXO = 25
CHAO = 81
"""Base DEPOIS do contorno. O desenho vai até 80; a dilatação faz a linha 81."""

Segmentos = tuple[tuple[int, int, int, int], ...]
"""(y0, y1, x0, x1) inclusivos. Unidade de autoria de tronco, braço e perna."""


# ------------------------------------------------------------------- pele
# Quatro famílias, e todas TÊM de aparecer no elenco: NPC sem variação de pele
# lê como o mesmo NPC repintado (bíblia §5.4). A tupla é (base, sombra, boca).
#
# Cuidado com `mais_escuro()` aqui: nas rampas de pele o primeiro char é o tom
# BASE e o segundo é a sombra, ao contrário da convenção escuro->claro do resto
# da paleta. Por isso a sombra é declarada, não calculada.
_PELES: dict[str, tuple[str, str, str]] = {
    "clara": ("s", "S", "t"),
    "media": ("t", "T", "k"),
    "escura": ("k", "l", "N"),
    "profunda": ("N", "O", "C"),
}


# ------------------------------------------------------------------ rosto
# DADO CANÔNICO (bíblia §5.2). Não redesenhar: a mesma função de rosto serve os
# quatro estados da Ana e os cinco NPCs, e é isso que mantém cada um
# reconhecível entre poses e entre quadros de animação. `s` é o tom base, `S` a
# sombra, `P` o cabelo (sobrancelha), `t` a boca, `K` o olho.
_ROSTO: tuple[str, ...] = (
    "sssssssssss",
    "SsssssssssS",
    "SsPPsssPPsS",
    "SsKKsssKKsS",
    "SsSssssSssS",
    "SssssSssssS",
    "SsssssssssS",
    "SssstttsssS",
    "SsssssssssS",
)
_ROSTO_X = 20
_ROSTO_W = 11
_ROSTO_H = len(_ROSTO)


# ------------------------------------------------------------- primitivas


def _espelhar(segs: Segmentos) -> Segmentos:
    """Reflete segmentos no eixo x=25.

    `LARGURA - x` e não `LARGURA - 1 - x`: o eixo do sprite é a coluna 25 numa
    grade de 50, então x=16 tem de virar x=34 (16+34=50). Errar isso por 1
    desloca metade da figura e o resultado é uma assimetria que ninguém
    consegue apontar de onde vem.
    """
    return tuple((y0, y1, LARGURA - x1, LARGURA - x0) for y0, y1, x0, x1 in segs)


def _bloco(g: Grade, segs: Segmentos, luz: str, corpo: str, sombra: str) -> None:
    """Preenche segmentos com volume: aresta esquerda clara, direita escura.

    Luz de cima-à-esquerda em tudo (bíblia §2.6). Direções de luz misturadas
    num mesmo elenco leem como colagem de autores diferentes.
    """
    for y0, y1, x0, x1 in segs:
        for y in range(y0, y1 + 1):
            g.linha_h(x0, y, x1 - x0 + 1, corpo)
            g.ponto(x0, y, luz)
            g.ponto(x1, y, sombra)


def _topo_iluminado(g: Grade, segs: Segmentos, luz: str) -> None:
    """Risca a primeira linha de cada segmento no tom claro (ombro, coxa)."""
    for y0, _, x0, x1 in segs:
        g.linha_h(x0, y0, x1 - x0 + 1, luz)


def _corridas_opacas(g: Grade, y: int) -> int:
    """Quantos blocos opacos separados existem na linha y."""
    corridas = 0
    dentro = False
    for x in range(g.largura):
        opaco = g.px[y][x] != VAZIO
        if opaco and not dentro:
            corridas += 1
        dentro = opaco
    return corridas


def _colunas_em(segs: Segmentos, y: int) -> tuple[int, int] | None:
    """Colunas que o segmento ocupa na linha y, ou None se não alcança a linha."""
    for y0, y1, x0, x1 in segs:
        if y0 <= y <= y1:
            return x0, x1
    return None


def _abrir_vao(
    g: Grade, esq: Segmentos, dir_: Segmentos, tronco: Segmentos, y0: int, y1: int
) -> None:
    """Carva o vão braço-torso, apagando o que tiver invadido a coluna.

    O vão é declarado pela pose, então ele não pode depender de todo desenho
    posterior se comportar. Cabelo comprido, capuz e cordão de crachá passam
    todos por essa faixa, e qualquer um deles derrete o braço no tronco sem
    deixar rastro no código. Carvar primeiro e conferir depois é mais barato que
    descobrir na folha de contato — que foi como a primeira Ana chegou sem braços.
    """
    for y in range(y0, y1 + 1):
        colunas_tronco = _colunas_em(tronco, y)
        if colunas_tronco is None:
            continue
        tx0, tx1 = colunas_tronco
        colunas_esq = _colunas_em(esq, y)
        if colunas_esq is not None:
            for x in range(colunas_esq[1] + 1, tx0):
                g.ponto(x, y, VAZIO)
        colunas_dir = _colunas_em(dir_, y)
        if colunas_dir is not None:
            for x in range(tx1 + 1, colunas_dir[0]):
                g.ponto(x, y, VAZIO)


def _conferir_vao(nome: str, g: Grade, y0: int, y1: int) -> None:
    """Exige braço | torso | braço em toda linha da faixa, ANTES do contorno.

    Este é o guarda que existe por causa do defeito que motivou o retrabalho.
    Três corridas opacas numa linha significam que há pelo menos uma coluna
    transparente de cada lado do tronco — e é dessa coluna que `contornar()`
    tira a linha interna que separa braço de torso. Duas corridas significam
    que um braço derreteu no corpo.

    Levanta erro em vez de avisar de propósito: um aviso deixaria o PNG sair e
    a regressão chegaria à apresentação, que é exatamente o que aconteceu antes.
    """
    for y in range(y0, y1 + 1):
        corridas = _corridas_opacas(g, y)
        if corridas < 3:
            raise ErroDeArte(
                f"{nome}: vão braço-torso fechado na linha y={y} "
                f"({corridas} bloco(s) opaco(s), esperado 3). "
                f"Bíblia §2.4: o vão é anatomia e nunca sai."
            )


def _rosto(g: Grade, y: int, pele: str, cabelo: str) -> None:
    """Escreve as 9 linhas canônicas do rosto, traduzindo para a pele do ator."""
    base, sombra, boca = _PELES[pele]
    troca = {"s": base, "S": sombra, "t": boca, "P": cabelo, "K": CONTORNO}
    for dy, linha in enumerate(_ROSTO):
        g.segmento(_ROSTO_X, y + dy, "".join(troca[ch] for ch in linha))


def _cabeca(
    g: Grade,
    y_topo: int,
    *,
    pele: str,
    cabelo: str,
    luz_cabelo: str,
    volume: int = 15,
    comprimento: int = 0,
    franja: bool = True,
    franja_baixa: bool = False,
    pescoco: bool = True,
    barba: str = "",
    oculos: bool = False,
    coque: int = 0,
) -> int:
    """Desenha cabeça e cabelo; devolve a primeira linha livre (a do ombro).

    `volume` é a largura da massa de cabelo e é o parâmetro que mais diferencia
    um NPC do outro: silhueta lê de longe em vídeo comprimido, cor não
    (bíblia §9). `comprimento` desce cabelo pelas laterais do pescoço.

    `franja_baixa` é como se faz o olhar para baixo da pose encolhida: a franja
    desce 1px e empurra TODAS as feições com ela, em vez de redesenhar o rosto.
    Combinado com `pescoco=False`, dá queixo enfiado no peito (bíblia §5.2).

    `coque` troca a franja por linha de cabelo alta e põe um nó saindo do alto
    da cabeça. É o terceiro estado de cabelo e o único que altera o contorno
    ACIMA da cabeça — ver o campo `Corpo.coque` para o porquê do nó sair pela
    lateral e não pelo topo.
    """
    base, sombra, _ = _PELES[pele]
    meia = volume // 2
    esq, dir_ = EIXO - meia, EIXO + meia

    # Calota: quatro larguras subindo até a massa cheia. Ímpares para a coroa
    # cair no eixo — largura par deixa a cabeça meio pixel fora do centro e a
    # figura inteira lê torta sem que se consiga dizer por quê.
    for i, w in enumerate((volume - 8, volume - 4, volume - 2, volume)):
        w = max(1, w | 1)
        g.linha_h(EIXO - w // 2, y_topo + i, w, cabelo)
    for i in range(4, 8):
        g.linha_h(esq, y_topo + i, volume, cabelo)

    # Mecha clara fora do centro, descendo em degrau. Simetria perfeita lê como
    # boneco de vitrine; 1px de assimetria já mata a cara de manequim (bíblia §9).
    g.segmento(esq + 2, y_topo + 3, luz_cabelo * 4)
    g.segmento(esq + 3, y_topo + 4, luz_cabelo * 4)
    g.segmento(esq + 4, y_topo + 5, luz_cabelo * 2)

    if coque:
        # PRIMEIRA TENTATIVA ERRADA, registrada porque é o tipo de coisa que se
        # tenta de novo: o nó saiu pela LATERAL do alto da cabeça (x30..34 na
        # altura da têmpora), para caber com y_topo=2 e manter a Cláudia a mais
        # alta do elenco sem tocar na grade. Olhando o PNG a 4x, aquilo não lia
        # como cabelo preso: lia como BONÉ. Massa escura estreita mais um lump
        # na lateral é a silhueta de uma aba, e a mecha grisalha deitada no topo
        # completava a ilusão virando faixa de boné.
        #
        # O nó tem de sair por CIMA, e é isso que custa as três linhas de grade
        # que `y_topo` desce. Off-axis para a direita (centro em 26,5 e não em
        # 25) porque simetria perfeita lê como boneco de vitrine (bíblia §9).
        if y_topo < 3:
            raise ErroDeArte(
                "coque exige y_topo>=3: o nó ocupa 3 linhas acima da calota, "
                "`contornar()` ocupa uma quarta, e `_respirar()` descarta a "
                "linha 0 — nó mais alto perde o contorno no quadro 2 e a tira "
                "TREME (bíblia §6.3)"
            )
        for dy, (x0, w) in enumerate(((EIXO, 4), (EIXO - 1, 6), (EIXO - 1, 6))):
            g.linha_h(x0, y_topo - 3 + dy, w, cabelo)
        # Luz na aresta superior-esquerda do nó, como em todo volume do jogo
        # (bíblia §2.6). Sem ela o nó é mancha; com ela é volume preso.
        g.segmento(EIXO, y_topo - 3, luz_cabelo * 2)
        g.segmento(EIXO - 1, y_topo - 2, luz_cabelo * 2)

    y_rosto = y_topo + 8 + (1 if franja_baixa else 0)
    if franja_baixa:
        g.linha_h(esq, y_topo + 8, volume, cabelo)

    # Moldura de cabelo atrás do rosto, depois o rosto por cima: ordem de
    # colagem é z-order, não existe z-index aqui (bíblia §9).
    for i in range(_ROSTO_H):
        g.linha_h(esq, y_rosto + i, volume, cabelo)
    _rosto(g, y_rosto, pele, cabelo)

    if coque:
        # Linha do cabelo ALTA e cheia, em vez de franja: cabelo preso não cai
        # na testa. É 1px numa cabeça de 11px de largura e é justamente o que
        # separa esta cabeça da da Ana, que tem franja em diagonal cobrindo
        # duas linhas de testa.
        g.linha_h(esq, y_rosto, volume, cabelo)
    elif franja:
        # Franja cortando a testa em diagonal, mais longa de um lado. Sem ela a
        # calota fecha num arco perfeito e a cabeça lê como capacete: nada no
        # contorno do cabelo quebra a simetria, e é a simetria que faz o
        # personagem parecer boneco de vitrine (bíblia §9).
        g.segmento(_ROSTO_X, y_rosto, cabelo * 4)
        g.segmento(_ROSTO_X + 1, y_rosto + 1, cabelo * 2)
        g.segmento(_ROSTO_X + _ROSTO_W - 2, y_rosto, cabelo * 2)

    if barba:
        # Barba entra pelas bochechas e fecha no queixo. A linha da boca é
        # redesenhada depois porque barba que engole a boca apaga a única
        # feição que dá expressão num rosto de 11px.
        for i in (5, 6, 7, 8):
            g.segmento(_ROSTO_X, y_rosto + i, barba * 2)
            g.segmento(_ROSTO_X + _ROSTO_W - 2, y_rosto + i, barba * 2)
        g.segmento(_ROSTO_X + 2, y_rosto + 8, barba * 7)
        g.segmento(_ROSTO_X + 4, y_rosto + 7, _PELES[pele][2] * 3)

    if oculos:
        # Aro embaixo do olho e ponte no eixo: aro POR CIMA do olho apagaria os
        # 2px que fazem o olhar, e o olhar é o que o rosto tem.
        aro = "U"
        g.segmento(_ROSTO_X + 1, y_rosto + 4, aro * 4)
        g.segmento(_ROSTO_X + 6, y_rosto + 4, aro * 4)
        g.ponto(EIXO, y_rosto + 3, aro)

    # Mandíbula: o rosto estreita em dois degraus e o cabelo avança na lateral.
    fim = y_rosto + _ROSTO_H
    g.linha_h(esq, fim, volume, cabelo)
    g.segmento(_ROSTO_X + 1, fim, (sombra + base * 7 + sombra))
    g.linha_h(esq, fim + 1, volume, cabelo)
    g.segmento(_ROSTO_X + 2, fim + 1, (sombra + base * 5 + sombra))
    if barba:
        g.segmento(_ROSTO_X + 1, fim, barba * 9)
        g.segmento(_ROSTO_X + 2, fim + 1, barba * 7)

    # Cabelo longo desce pelas laterais DEPOIS da mandíbula, deixando o meio
    # livre para o pescoço. É o que dá silhueta de cabelo comprido sem cobrir o
    # rosto.
    for i in range(comprimento):
        g.linha_h(esq, fim + 2 + i, 3, cabelo)
        g.linha_h(dir_ - 2, fim + 2 + i, 3, cabelo)
        g.ponto(dir_, fim + 2 + i, luz_cabelo)
    if comprimento:
        # 1px mais longo de um lado só: o mesmo truque de assimetria da mecha.
        g.linha_h(dir_ - 2, fim + 2 + comprimento, 3, cabelo)

    proxima = fim + 2
    if pescoco:
        # Pescoço inteiro em sombra: é a parte do corpo que nunca pega a luz de
        # cima, e sem ele o queixo cola no ombro.
        g.linha_h(EIXO - 2, proxima, 5, sombra)
        proxima += 1
    return proxima



# ------------------------------------------------------------------- corpo


@dataclass(frozen=True)
class Corpo:
    """Tudo que muda de um personagem ou de uma pose para a outra.

    O braço é declarado, não calculado, porque é ele que carrega a postura: a
    diferença entre encolhida, neutra, confiante e futura é a LARGURA DO VAZIO
    entre braço e torso (1px, 1px, 2px, triângulo de 3px). Silhueta lê de longe
    em vídeo comprimido; cor não (bíblia §9).
    """

    nome: str
    pele: str = "clara"
    cabelo: str = "P"
    luz_cabelo: str = "Q"
    volume_cabelo: int = 15
    comprimento_cabelo: int = 0
    franja: bool = True
    """Desliga a franja para cabeça raspada: franja em cabelo raspado lê como
    mancha na testa."""
    coque: int = 0
    """Cabelo PRESO: nó saindo do alto da cabeça, e linha do cabelo alta.

    Terceiro estado de cabelo, entre `franja=True` (solto) e `franja=False`
    (raspado), e é o único que muda a silhueta ACIMA da cabeça. Existe porque a
    Cláudia precisava deixar de ser a Ana repintada e os dois eixos baratos —
    tom de cabelo e tom de roupa — são justamente os que a compressão de vídeo
    come primeiro (bíblia §9). Cabelo preso lê de longe, lê nas duas escalas
    (`retratos.py` consome o mesmo campo) e diz "líder" sem rótulo (§5.4).

    Descartado: coque no TOPO da grade. A base é fixa em y=81, o topo útil
    acaba em y=2 porque `contornar()` ocupa uma linha acima e `_respirar()`
    come outra — nó desenhado acima disso perde o contorno no quadro de
    respiração e a tira TREME, que é o defeito de §6.3. Por isso o nó sai pela
    LATERAL do alto da cabeça, onde há grade sobrando."""
    barba: str = ""
    oculos: bool = False
    y_topo: int = 3
    franja_baixa: bool = False
    pescoco: bool = True

    roupa: tuple[str, str, str] = ("d", "c", "b")
    """(luz, corpo, sombra) da peça de cima. Três casas ADJACENTES da rampa:
    salto de dois valores vira mancha em vez de volume (bíblia §2.5)."""
    roupa_braco: tuple[str, str, str] | None = None
    """(luz, corpo, sombra) da MANGA, quando ela não é da mesma peça do tronco.
    None = manga na cor do tronco, que é o caso de blazer, camisa e moletom.

    Existe para o COLETE, e colete é a única peça da lista de §5.4 que muda a
    silhueta por VALOR em vez de por contorno: o tronco fica escuro e os braços
    ficam claros, então a figura tem duas faixas de valor onde todas as outras
    têm uma. É o que faz a Cláudia ler diferente da Ana a três metros da tela,
    onde "azul-marinho uma casa mais escuro" não lia nada."""
    gola: tuple[str, str] = ("8", "7")
    torso_peito: tuple[int, int] = (20, 30)
    torso_cintura: tuple[int, int] = (20, 30)
    y_cintura: int = 34
    lapela: bool = False
    """Só para blazer. Lapela em camiseta ou moletom lê como risco na roupa."""
    pin: str = ""

    braco: Segmentos = ()
    """Só o braço ESQUERDO. O direito sai de `_espelhar()` quando `braco_dir`
    é vazio — arte espelhada não pode desalinhar do original."""
    braco_dir: Segmentos = ()
    braco_andando: Segmentos = ()
    """Braço usado nas tiras de caminhada. Existe porque mão na cintura não é
    pose de locomoção: a `futura` anda com o braço solto, mas na largura de vão
    dela — o que muda entre os estados continua sendo o vazio, não a roupa."""
    manga: int = 0
    """Linhas de antebraço em pele antes da mão (manga arregaçada)."""
    mao: bool = True
    """Desliga a pele na ponta do braço para mão no bolso ou braço cruzado."""
    linhas_vao: tuple[int, int] | None = None

    y_barra: int = 41
    calca: tuple[str, str, str] = ("c", "b", "a")
    sapato: tuple[str, str, str] = ("n", "m", "o")
    """(couro, solado, brilho). Declarado por personagem porque era a MESMA
    tupla nas nove figuras e o terço inferior do elenco lia como um sprite só.
    Ver `_SAPATO_PADRAO` para o porquê de nenhum deles ser da família neutra."""
    cano: int = 0
    """Linhas de cano de bota subindo por cima da barra da calça.

    Variação de SILHUETA no pé, não só de cor: bota e sapato baixo se
    distinguem em vídeo comprimido, dois marrons diferentes não. Zero = sapato
    baixo, que é o caso da maioria."""
    passo: int = 0
    pes_juntos: bool = False
    y_respiro: int = 34
    """Linha em que a respiração dobra: tudo acima dela sobe 1px. Fica na
    cintura porque é lá que o movimento é absorvido num corpo em pé."""
    extra: Callable[[Grade, "Corpo"], None] | None = None


# Pernas por quadro de caminhada. Cada perna é uma lista de segmentos porque a
# coluna muda em degraus de 1 a 2px a cada 10 linhas: mudar 1px POR LINHA faz
# bolha no contorno, que foi um erro já cometido (bíblia §10).
_PERNAS: dict[int, tuple[Segmentos, Segmentos]] = {
    0: (((48, 78, 20, 24),), ((48, 78, 26, 30),)),
    1: (
        ((48, 57, 20, 24), (58, 67, 19, 23), (68, 78, 17, 21)),
        ((48, 57, 26, 30), (58, 67, 27, 31), (68, 78, 28, 32)),
    ),
    2: (((48, 78, 21, 24),), ((48, 78, 26, 29),)),
    3: (
        ((48, 57, 20, 24), (58, 67, 19, 23), (68, 78, 18, 22)),
        ((48, 57, 26, 30), (58, 67, 27, 31), (68, 78, 29, 33)),
    ),
    4: (((48, 78, 21, 24),), ((48, 78, 26, 29),)),
}
_PERNAS_JUNTAS: tuple[Segmentos, Segmentos] = (
    ((48, 78, 21, 24),),
    ((48, 78, 26, 29),),
)


_SAPATO_PADRAO = ("n", "m", "o")
"""(couro, solado, brilho) do sapato da Ana, e o valor de fábrica de `Corpo`.

Em MADEIRA, não em neutro. Primeira tentativa usou o neutro mais escuro e o pé
sumiu: contra a calça azul-escura a diferença de valor era de uma casa e a
figura terminava num toco. Marrom é a única família que aparece ali, e de quebra
põe 3px de quente nos pés — o frio domina a área, o quente domina a atenção.

POR QUE ISTO DEIXOU DE SER CONSTANTE GLOBAL
Era. E as nove figuras calçavam este mesmo (74,46,27): em vídeo comprimido, com
todas as calças na mesma faixa de valor azul-marinho, o terço inferior do elenco
lia como um sprite só repintado do peito para cima. Agora o sapato é campo de
`Corpo` e cada personagem escolhe família E valor — a Ana fica sendo a ÚNICA de
sapato marrom, que é o que faz dele traço dela e não uniforme da empresa.
"""


def _sapato(
    g: Grade,
    segs: Segmentos,
    fora: int,
    sapato: tuple[str, str, str] = _SAPATO_PADRAO,
    cano: int = 0,
) -> None:
    """Sapato nas três últimas linhas, 1px mais largo para o lado de `fora`.

    Três linhas e não duas porque em 4x um sapato de 2px de altura lê como
    sombra da barra da calça. Pé que não passa da calça lê como perna cortada.

    `cano` sobe `cano` linhas de couro por cima da barra da calça, na largura do
    pé. É como bota se diferencia de sapato baixo: pela SILHUETA. Dois marrons
    diferentes somem na compressão; um contorno que muda de forma, não.
    """
    _, _, x0, x1 = segs[-1]
    x0, x1 = (x0 + fora, x1) if fora < 0 else (x0, x1 + fora)
    couro, solado, brilho = sapato
    largura = x1 - x0 + 1
    for dy in range(cano):
        # o cano afina 1px de cada 3 linhas subindo: cano reto lê como tubo
        recuo = dy // 3
        g.linha_h(x0 + recuo, 77 - dy, largura - 2 * recuo, couro)
    g.linha_h(x0, 78, largura, couro)
    g.linha_h(x0, 79, largura, couro)
    g.linha_h(x0, 80, largura, solado)
    g.ponto(x0 if fora < 0 else x1, 78, brilho)


def _braco_com_mao(
    g: Grade, segs: Segmentos, c: Corpo, y_ombro: int, lado_luz: bool
) -> int:
    """Desenha um braço e devolve a linha da ponta da mão.

    A mão em pele no fim do braço é o que faz o braço LER como braço: um tubo
    de tecido sem mão é lido como dobra da roupa, e foi parte do "é quase como
    se ela não tivesse braços".

    A manga sai de `roupa_braco` e cai em `roupa` quando ela não existe: é o
    que permite colete (tronco escuro, manga clara) sem que blazer, camisa e
    moletom precisem declarar nada.
    """
    luz, corpo, sombra = c.roupa_braco or c.roupa
    base_pele, sombra_pele, _ = _PELES[c.pele]
    # Braço em sombra do lado que não pega luz: o volume do braço tem de se
    # opor ao do tronco, senão os dois viram a mesma superfície.
    _bloco(g, segs, luz if lado_luz else corpo, corpo if lado_luz else sombra, sombra)
    y_fim = max(y1 for _, y1, _, _ in segs)
    if not c.mao:
        return y_fim
    _, _, mx0, mx1 = segs[-1]
    for i in range(c.manga + 2):
        y = y_fim - i
        if y <= y_ombro:
            break
        g.linha_h(mx0, y, mx1 - mx0 + 1, base_pele)
        g.ponto(mx1, y, sombra_pele)
    return y_fim


def _y_ombro(c: Corpo) -> int:
    """Linha do ombro, DERIVADA do topo da cabeça.

    8 linhas de calota + 9 de rosto + 2 de mandíbula, mais 1 quando a franja
    desce e 1 quando há pescoço. Derivar em vez de declarar porque um ombro
    declarado fora de lugar desgruda o braço do corpo, e isso é invisível
    lendo o código — só aparece na folha de contato, tarde.
    """
    return c.y_topo + 19 + (1 if c.franja_baixa else 0) + (1 if c.pescoco else 0)


def _figura(c: Corpo) -> Grade:
    """Monta um personagem inteiro, sem contorno. `contornar()` é do chamador."""
    g = Grade(LARGURA, ALTURA)
    y_ombro = _cabeca(
        g,
        c.y_topo,
        pele=c.pele,
        cabelo=c.cabelo,
        luz_cabelo=c.luz_cabelo,
        volume=c.volume_cabelo,
        comprimento=c.comprimento_cabelo,
        franja=c.franja,
        franja_baixa=c.franja_baixa,
        pescoco=c.pescoco,
        barba=c.barba,
        oculos=c.oculos,
        coque=c.coque,
    )
    if c.braco and c.braco[0][0] != y_ombro:
        raise ErroDeArte(
            f"{c.nome}: braço começa em y={c.braco[0][0]} mas o ombro caiu em "
            f"y={y_ombro} — braço desgrudado do ombro flutua ao lado do corpo"
        )

    luz, corpo, sombra = c.roupa
    px0, px1 = c.torso_peito
    cx0, cx1 = c.torso_cintura
    tronco: Segmentos = (
        (y_ombro, c.y_cintura - 1, px0, px1),
        (c.y_cintura, c.y_barra - 1, cx0, cx1),
    )
    _bloco(g, tronco, luz, corpo, sombra)
    _topo_iluminado(g, tronco[:1], luz)

    # Decote em V da camisa por baixo: separa a peça de cima do pescoço e dá o
    # único tom quase-branco da figura, que é o que puxa o olho para o rosto.
    claro, escuro_gola = c.gola
    for i in range(4):
        w = 5 - i
        g.linha_h(EIXO - w // 2, y_ombro + i, w, claro)
        g.ponto(EIXO + w // 2, y_ombro + i, escuro_gola)

    if c.lapela:
        # Lapela: duas linhas de 1px abrindo do colarinho para fora. É o único
        # detalhe que faz um campo chapado de 11x18 ler como blazer em vez de
        # retângulo colorido, e custa doze pixels. Vem depois da gola de
        # propósito: ela morde a borda do branco, que é o que produz a dobra.
        for i in range(6):
            dx = 2 + i // 2
            g.ponto(EIXO - dx, y_ombro + i, sombra)
            g.ponto(EIXO + dx, y_ombro + i, sombra)

    if c.pin:
        # Crachá de 2x3 na lapela, fora do centro. Começou como fita no meio do
        # peito e lia como gravata amarela (bíblia §9) — acento pequeno e
        # descentrado é o que lê como crachá.
        for dy in range(3):
            g.segmento(px0 + 2, y_ombro + 5 + dy, c.pin * 2)
        g.ponto(px0 + 3, y_ombro + 7, "w")

    # Barra da peça de cima em K. Sem esta linha de 1px, peça de cima e calça
    # compartilham a família de tom e do ombro ao sapato lê como uma coluna
    # única — foi preciso três tentativas para descobrir isso (bíblia §5.1).
    g.linha_h(cx0, c.y_barra, cx1 - cx0 + 1, CONTORNO)

    calca_luz, calca_corpo, calca_sombra = c.calca
    quadril: Segmentos = ((c.y_barra + 1, 47, 20, 30),)
    _bloco(g, quadril, calca_luz, calca_corpo, calca_sombra)

    esq, dir_ = _PERNAS_JUNTAS if c.pes_juntos else _PERNAS[c.passo]
    # Perna da frente um passo mais clara que a de trás: é o que informa qual
    # perna avançou num sprite visto de frente, onde não há perspectiva para
    # fazer isso.
    frente_esq = c.passo in (1, 2)
    _bloco(g, esq, calca_luz, calca_corpo if frente_esq else calca_sombra, calca_sombra)
    _bloco(g, dir_, calca_corpo if frente_esq else calca_luz, calca_corpo, calca_sombra)

    # Vinco e dobra do joelho. A perna é a maior área plana da figura (11x31 px)
    # e área plana grande é o que faz sprite parecer recorte de papelão — a
    # primeira versão tinha calça e sapato na mesma família e a metade de baixo
    # do elenco lia como um pedestal. Duas linhas de 1px resolvem: o vinco dá o
    # cilindro, a dobra dá a articulação.
    for perna in (esq, dir_):
        for ly0, ly1, lx0, lx1 in perna:
            meio = lx0 + (lx1 - lx0) // 2
            for y in range(ly0, min(ly1, 77) + 1):
                g.ponto(meio, y, calca_luz)
            if ly0 <= 62 <= min(ly1, 77):
                g.linha_h(lx0, 62, lx1 - lx0 + 1, calca_sombra)
    _sapato(g, esq, -1, c.sapato, c.cano)
    _sapato(g, dir_, +1, c.sapato, c.cano)

    if c.braco:
        segs_dir = c.braco_dir or _espelhar(c.braco)
        y_esq = _braco_com_mao(g, c.braco, c, y_ombro, lado_luz=True)
        y_dir = _braco_com_mao(g, segs_dir, c, y_ombro, lado_luz=False)
        # Costura do ombro: o braço tem de NASCER do tronco. Ela preenche SÓ as
        # colunas do vão, e só na linha do ombro — ali braço e torso são um só
        # de propósito, porque é onde o braço se articula. Passar por cima do
        # braço apagaria a aresta iluminada dele.
        #
        # Na cor da MANGA e não do tronco: num colete é a camisa que passa por
        # cima do ombro, e costurar em cor de colete abriria uma ilha escura
        # entre dois campos claros — que lê como furo, não como ombro.
        luz_manga, _corpo_manga, sombra_manga = c.roupa_braco or c.roupa
        g.linha_h(c.braco[0][3] + 1, y_ombro, px0 - c.braco[0][3] - 1, luz_manga)
        g.linha_h(px1 + 1, y_ombro, segs_dir[0][2] - px1 - 1, sombra_manga)

        if c.comprimento_cabelo:
            # Cabelo comprido cai NA FRENTE do ombro, então vem depois do braço:
            # desenhado antes, o torso e o braço o cobriam inteiro e o
            # personagem ficava de cabelo curto sem o código dizer isso. Fica
            # nas colunas do BRAÇO, nunca nas do vão.
            ax0, ax1 = c.braco[0][2], c.braco[0][3]
            queda: Segmentos = ((y_ombro, y_ombro + c.comprimento_cabelo - 1, ax0, ax1),)
            _bloco(g, queda, c.luz_cabelo, c.cabelo, c.cabelo)
            # 1px mais comprido de um lado: assimetria de 1px mata a cara de
            # manequim, e aqui ela ainda cabe na caixa simétrica do sprite.
            _bloco(g, _espelhar(((queda[0][0], queda[0][1] + 1, ax0, ax1),)),
                   c.cabelo, c.cabelo, c.luz_cabelo)

        y0, y1 = c.linhas_vao or (y_ombro + 1, min(y_esq, y_dir) - 2)
        _abrir_vao(g, c.braco, segs_dir, tronco, y0, y1)
        _conferir_vao(c.nome, g, y0, y1)

        if c.extra is not None:
            c.extra(g, c)
            # Os extras desenham perto do vão de propósito (capuz na nuca,
            # cordão no peito, antebraço cruzado). Carvar e conferir de novo é o
            # que permite que eles sejam escritos sem medo.
            _abrir_vao(g, c.braco, segs_dir, tronco, y0, y1)
            _conferir_vao(c.nome, g, y0, y1)
        return g

    if c.extra is not None:
        c.extra(g, c)
    return g



# --------------------------------------------------------------------- Ana


def _ana(nome: str, **mudanca: object) -> Corpo:
    """Corpo da Ana com os traços que NÃO mudam entre os quatro estados.

    Roupa, cabelo e pele são idênticos nos três primeiros estados de propósito:
    se a pose se diferenciasse por cor, a diferença morreria na compressão de
    vídeo. O que muda é o vazio (bíblia §9), e manter tudo o resto igual é o que
    prova que o vazio está fazendo o trabalho.
    """
    padrao: dict[str, object] = {
        "pele": "clara",
        "cabelo": "P",
        "luz_cabelo": "Q",
        "volume_cabelo": 15,
        "comprimento_cabelo": 3,
        "roupa": ("d", "c", "b"),
        "calca": ("c", "b", "a"),
        "gola": ("8", "7"),
        "pin": "y",
        "manga": 1,
        "lapela": True,
    }
    padrao.update(mudanca)
    return Corpo(nome=nome, **padrao)  # type: ignore[arg-type]


# ENCOLHIDA — ombro desenhado em 13px (x19..31), vão de 1px em x21 e x29.
# É a pose que o dono do projeto reclamou. O braço aqui tem 2px de largura e o
# vão continua aberto: braço colado ao corpo se faz ESTREITANDO o ombro e
# aproximando o braço, jamais fechando o vão (bíblia §2.4).
# Cabeça 3px mais baixa, franja descida e sem pescoço = queixo enfiado no peito.
#
# POR QUE O CABELO ENCOLHEU PARA 13 E A MÃO VIROU PARA DENTRO
# A revisão mediu 17px de ombro contra os ~13px da bíblia §5.3 e estava certa na
# medida, errada na causa: o braço já estava em 13px: quem passava de 15 eram a
# MASSA DE CABELO (volume 15, x18..32, e ela cai por cima do ombro nas linhas
# 26..28) e a MÃO, que abria para fora até x18. Estreitar o torso não resolveria
# — 7px já é o mínimo que caiba a gola em V, e 5px jogaria a lapela em cima do
# braço. Então o que apertou foi o contorno da silhueta na altura do ombro:
# cabelo em 13px (x19..31, sobrando 1px de cada lado do rosto canônico de 11px,
# que lê como cabelo preso e reforça a pose) e a mão abrindo para DENTRO, x19..21
# em vez de x18..20. Resultado medido: 13px desenhados, 15px de caixa com o
# contorno — que é a mesma convenção em que a neutra mede 19 desenhados e 21 de
# caixa. 13 de CAIXA é geometricamente impossível: o rosto canônico tem 11px e
# ainda precisa de cabelo dos dois lados.
# A mão fechar contra o quadril nas linhas 38..39 é de propósito e fica fora da
# faixa conferida, como na `futura`: mão apoiada no corpo é postura, e o vão
# segue aberto em todas as 11 linhas de 27 a 37, que é onde ele é anatomia.
ANA_ENCOLHIDA = _ana(
    "ana-encolhida",
    y_topo=6,
    volume_cabelo=13,
    franja_baixa=True,
    pescoco=False,
    torso_peito=(22, 28),
    torso_cintura=(22, 28),
    braco=((26, 37, 19, 20), (38, 39, 19, 21)),
    braco_andando=((26, 37, 19, 20),),
    manga=0,
    pes_juntos=True,
)

# NEUTRA — ombro em 19px (x16..34), vão de 1px em x19 e x31. A referência da
# bíblia §5.3, e a pose que aparece na maior parte do jogo.
ANA_NEUTRA = _ana(
    "ana-neutra",
    y_topo=3,
    torso_cintura=(21, 29),
    braco=((23, 39, 16, 18),),
)

# CONFIANTE — ombro em 21px (x15..35), vão de 2px em x18..19. Cabeça 1px mais
# alta e base aberta. O vão dobrado é a leitura de "braço solto do corpo".
ANA_CONFIANTE = _ana(
    "ana-confiante",
    y_topo=2,
    torso_cintura=(21, 29),
    braco=((22, 39, 15, 17),),
)

# FUTURA — mão na cintura, vazio triangular de 3px no cotovelo (x18..20 nas
# linhas 28..35). Três é o mínimo: `contornar()` alcança 1px de cada lado, então
# com 2px o triângulo fecha em preto e a pose morre (bíblia §5.3). O truque que
# faz os 3px caberem em 21px de ombro é a cintura entrar 1px de cada lado já na
# linha 28 — blazer ajustado afina na cintura de todo jeito, e é essa folga que
# abre o triângulo sem alargar a silhueta.
# Único personagem autorizado a usar roxo `VWXY` (bíblia §3): é o acento que
# marca o clímax e gastá-lo antes mata o efeito.
ANA_FUTURA = _ana(
    "ana-futura",
    y_topo=2,
    roupa=("Y", "X", "W"),
    calca=("X", "W", "V"),
    gola=("M", "L"),
    pin="z",
    # Bota de cano curto na mesma família: é o único estado da Ana que troca o
    # sapato, e troca porque a `futura` é a única em que ela não é mais a pessoa
    # de mocassim marrom. Cano de 2px porque a silhueta do pé é o último lugar
    # onde a plateia ainda consegue ver diferença num sprite de 84px.
    # Couro em `Y` e não em `W` nem em `X`: com `W` o couro era o MESMO char do
    # corpo da calça e o pé desaparecia na barra — foi o que a folha de contato
    # mostrou. `X` resolvia só metade (23 pontos de luminância contra os ~30 que a
    # regra (d) do bloco dos NPCs exige). `Y` sobre `W` dá 84, e o pé lê de
    # relance, que é o que a única figura de revelação do jogo precisa.
    sapato=("Y", "X", "z"),
    cano=2,
    torso_cintura=(21, 29),
    y_cintura=28,
    braco=((22, 27, 15, 17), (28, 35, 15, 17), (36, 38, 16, 18), (39, 40, 18, 20)),
    braco_andando=((22, 39, 15, 17),),
    manga=0,
    # A mão FECHA o triângulo embaixo ao encostar na cintura, então as duas
    # últimas linhas ficam fora da conferência: ali braço e torso são um só de
    # propósito, e é o que faz a mão parecer apoiada em vez de flutuando.
    linhas_vao=(23, 38),
)

def _mesa_de_trabalho(g: Grade, c: Corpo) -> None:
    """Põe a Ana num posto: mãos no teclado e mesa cobrindo a pose em pé.

    A arte continua na mesma caixa e no mesmo eixo dos sprites de cena. O tampo
    cobre pernas e quadril porque a tela de encerramento precisa mostrar uma
    ação de trabalho, não uma Ana em pé diante de um escritório genérico.
    """
    g.retangulo(2, 49, 46, 3, MADEIRA[4])
    g.linha_h(2, 49, 46, MADEIRA[5])
    g.retangulo(2, 52, 46, 4, MADEIRA[2])
    g.linha_h(2, 52, 46, MADEIRA[5])
    g.retangulo(5, 56, 4, 24, MADEIRA[1])
    g.retangulo(41, 56, 4, 24, MADEIRA[1])
    g.retangulo(20, 50, 12, 3, NEUTRO[1])
    for px in (22, 25, 28):
        g.ponto(px, 51, NEUTRO[4])

    pele, sombra, _ = _PELES[c.pele]
    manga = c.roupa[1]
    g.retangulo(16, 44, 6, 3, manga)
    g.retangulo(28, 44, 6, 3, manga)
    g.retangulo(19, 46, 5, 3, pele)
    g.retangulo(26, 46, 5, 3, pele)
    g.linha_h(20, 48, 4, sombra)
    g.linha_h(26, 48, 4, sombra)


ANA_TRABALHANDO = replace(ANA_NEUTRA, nome="ana-trabalhando", extra=_mesa_de_trabalho)
ANA_FUTURA_TRABALHANDO = replace(
    ANA_FUTURA, nome="ana-futura-trabalhando", extra=_mesa_de_trabalho
)

ANAS: tuple[Corpo, ...] = (
    ANA_ENCOLHIDA,
    ANA_NEUTRA,
    ANA_CONFIANTE,
    ANA_FUTURA,
    ANA_TRABALHANDO,
    ANA_FUTURA_TRABALHANDO,
)


def _alongar_braco(segs: Segmentos, delta: int) -> Segmentos:
    """Muda o comprimento aparente do braço para o balanço da caminhada.

    Num sprite de frente não existe perspectiva para mostrar o braço indo à
    frente; o que informa o balanço é o COMPRIMENTO aparente — braço à frente
    encurta, braço atrás estica. Aproximar o braço do tronco não é opção: o vão
    já está no mínimo de 1px e fechá-lo é exatamente o defeito que este módulo
    conserta.
    """
    if not segs or delta == 0:
        return segs
    *inicio, (y0, y1, x0, x1) = segs
    return (*inicio, (y0, max(y0 + 1, y1 + delta), x0, x1))


_BALANCO: tuple[tuple[int, int], ...] = ((-2, 2), (-1, 1), (2, -2), (1, -1))
"""Contrafase por quadro: (esquerdo, direito). Os dois quadros de passagem usam
±1 em vez de 0 para que não saiam idênticos — dois quadros iguais numa tira de
quatro fazem o `steps(4)` do CSS parecer que travou."""


# -------------------------------------------------------------------- NPCs
# Cinco pessoas, não um boneco repintado (bíblia §5.4). O elenco é conferido em
# `gerar()`: as quatro famílias de pele TÊM de aparecer, e as alturas TÊM de
# diferir. Quem cada um é saiu dos diálogos em src/domain/content/bloco1..5.ts,
# não de invenção: Cláudia é líder, Tiago é infra, Rafael é a ponte social,
# Bianca faz documentação técnica e veio de Letras, Marcos é do Innovation.
#
# A estatura sai do TOPO, nunca do pé: a base em y=81 é fixa nos nove
# personagens. E o topo não pode subir de 2, porque `contornar()` come a linha
# de cima e o quadro de respiração come outra — daí a Ana neutra ser a
# referência e a variação de altura ir para baixo.
#
# O TERÇO INFERIOR: POR QUE CALÇA E SAPATO SÃO DADO DE PERSONAGEM
# Defeito medido pela revisão: as nove figuras calçavam o MESMO (74,46,27), e as
# cinco tuplas de calça caíam todas em azul-marinho ou neutro escuro — três NPCs
# em `("3","2","1")` e dois em `("4","3","2")`, ou seja luminância 66 em quatro de
# cinco. Em vídeo comprimido o joelho para baixo virava um sprite único e o elenco
# só se distinguia acima do peito. Metade da silhueta que a plateia vê quando a
# figura está atrás de uma mesa é justamente essa metade.
#
# As escolhas abaixo seguem quatro restrições, e nenhuma delas é gosto:
#
# (a) VALOR, não nome de cor. As luminâncias ficam em ~33 / 44 / 66 / 80 / 91 /
#     167: seis degraus. Seis cores diferentes no mesmo degrau seria o defeito de
#     novo, com outra fantasia.
# (b) FAMÍLIA. Azul, neutro, madeira e verde se distribuem de modo que duas
#     pessoas lado a lado nunca repitam o par hue+valor.
# (c) O PISO É O PLANO CLARO das seis cenas (bandas em `5` e `6`, luminância 127 e
#     167), então calça escura é o padrão — bíblia §4.2, a figura tem de cair numa
#     faixa de valor diferente do que está atrás dela. A exceção é a Bianca: ela
#     aparece no cafezinho, onde o piso é madeira ESCURA (`n`, 52), e ali calça
#     escura desapareceria. Ela é a única de calça clara, e é por causa do piso.
# (d) O SAPATO CONTRA A PRÓPRIA CALÇA. O pé tem 3 linhas; só lê se a diferença de
#     valor com a barra da calça passar de uns 30 pontos. Daí pé claro em quem tem
#     calça escura, e pé quase preto em quem tem calça média.
#
# A Ana fica fora da variação de propósito: os três primeiros estados são a MESMA
# pessoa na mesma roupa, e o que distingue as poses é o vazio, não a cor
# (bíblia §9). Ela passou a ser a ÚNICA de sapato marrom, e isso virou traço dela.


def _cordao_de_cracha(g: Grade, c: Corpo, fita: str, cartao: str) -> None:
    """Cordão em V dos ombros ao esterno, com o cartão pendurado.

    Acento pequeno e fora do centro (bíblia §9): 2px de fita de cada lado e um
    cartão de 4x5. Uma fita larga no meio do peito lê como gravata — foi o erro
    do primeiro crachá da Ana.
    """
    y = _y_ombro(c) + 1
    for i in range(6):
        g.ponto(EIXO - 4 + i // 2, y + i, fita)
        g.ponto(EIXO + 4 - i // 2, y + i, fita)
    g.linha_h(EIXO - 2, y + 6, 5, cartao)
    g.linha_h(EIXO - 2, y + 7, 5, cartao)
    g.linha_h(EIXO - 2, y + 8, 5, "6")
    g.linha_h(EIXO - 1, y + 9, 3, cartao)


def _extra_rafael(g: Grade, c: Corpo) -> None:
    _cordao_de_cracha(g, c, "a", "J")


def _extra_claudia(g: Grade, c: Corpo) -> None:
    """Colete aberto sobre camisa, e braços cruzados com o vão na HORIZONTAL.

    Cruzar os braços fecha o vão vertical por definição — o antebraço encosta no
    peito. A separação então tem de vir de outra direção: a linha 29 fica
    transparente de x18 a x32 e `contornar()` a transforma na aresta superior do
    antebraço. É o mesmo truque do vão de 1px, girado 90 graus, e é o que evita
    que o bloco de braços cruzados derreta no tronco.

    O ANTEBRAÇO É DA COR DA MANGA, e é o achado que conserta o defeito desta
    rodada. Ela tem colete escuro e camisa clara, então a faixa de braços
    cruzados atravessa o peito como uma BARRA CLARA sobre campo quase preto: 19
    px de largura, 4 de altura, ~100 pontos de luminância de diferença. Nenhuma
    outra figura do elenco tem barra horizontal de valor no peito, e é o traço
    que sobrevive à compressão — ao contrário de "blazer uma casa mais escuro
    que o da Ana", que era o que ela tinha antes e não lia de jeito nenhum.
    """
    luz, corpo, sombra = c.roupa_braco or c.roupa
    base_pele, sombra_pele, _ = _PELES[c.pele]
    y = _y_ombro(c)

    # Botoeira do colete: a camisa aparece numa faixa de 3px entre as duas
    # bordas do colete, e as bordas em K é que fazem a peça ler como ABERTA em
    # vez de blazer fechado — o mesmo mecanismo do cardigã da Bianca. Três
    # linhas contíguas, nunca pontos soltos: nesta escala 1px isolado não lê
    # como botão, lê como defeito de alpha.
    claro, escuro_gola = c.gola
    for dy in range(y + 4, y + 7):
        g.linha_h(EIXO - 1, dy, 3, claro)
        g.ponto(EIXO + 1, dy, escuro_gola)
        g.ponto(EIXO - 2, dy, CONTORNO)
        g.ponto(EIXO + 2, dy, CONTORNO)

    for x in range(18, 33):
        g.ponto(x, y + 7, VAZIO)
    faixa: Segmentos = ((y + 8, y + 11, 16, 34),)
    _bloco(g, faixa, luz, corpo, sombra)
    # Mão de cada braço aparece na ponta OPOSTA: é o que diz que estão cruzados
    # e não apenas apoiados.
    for mx in (16, 32):
        for dy in range(1, 4):
            g.linha_h(mx, y + 8 + dy, 3, base_pele)
            g.ponto(mx + 2, y + 8 + dy, sombra_pele)


def _extra_tiago(g: Grade, c: Corpo) -> None:
    """Capuz amontoado na nuca e bolso canguru — a silhueta do moletom.

    O capuz entra pelas laterais do pescoço, não por cima da cabeça: por cima
    ele cobriria o rosto de 11px, que é a única coisa que dá identidade.
    """
    luz, corpo, sombra = c.roupa
    y = _y_ombro(c)
    # Rows acima da linha do ombro: ali o capuz pode ser largo sem disputar a
    # coluna do vão, que começa logo abaixo.
    capuz: Segmentos = ((y - 2, y, 17, 20),)
    _bloco(g, capuz, luz, corpo, sombra)
    _bloco(g, _espelhar(capuz), corpo, corpo, sombra)
    # Cordão do capuz: 1px, dois tons, assimétrico de propósito.
    for dy in range(4):
        g.ponto(23, y + 3 + dy, "7")
        g.ponto(27, y + 3 + dy, "6")
    g.ponto(23, y + 7, "7")
    # Bolso canguru: aresta superior em K porque bolso sem linha de abertura é
    # só uma mancha mais escura no moletom.
    g.linha_h(21, y + 10, 9, CONTORNO)
    _bloco(g, ((y + 11, y + 14, 21, 29),), corpo, sombra, sombra)


def _extra_bianca(g: Grade, c: Corpo) -> None:
    """Cardigã aberto sobre camiseta, e a caneta de quem anota em guardanapo.

    A CANETA ERA VERMELHA E NÃO PODIA SER. A bíblia §3 dá UM vermelho por cena, e
    a Bianca aparece nas duas cenas cujo vermelho já está gasto: no cafezinho é a
    caneca sobre o balcão, na sala de reuniões é a pasta sobre a mesa. Três pixels
    de `F` no peito dela eram um segundo ponto de descanso do olho disputando com
    o primeiro, e num rosto a 4px do acento o segundo ganha. A caneta virou ciano
    da rampa `tela` — que é a família de quem desenha API, é o que já está aceso
    nas duas cenas (TV de avisos, TV da sala), e não gasta acento nenhum.
    """
    claro, escuro = c.gola
    y = _y_ombro(c)
    # A camiseta aparece numa faixa central entre as duas bordas do cardigã. As
    # bordas em K são o que faz a peça ler como ABERTA: sem elas é um suéter.
    _bloco(g, ((y + 3, c.y_barra - 1, 23, 27),), claro, claro, escuro)
    for dy in range(y + 3, c.y_barra):
        g.ponto(22, dy, CONTORNO)
        g.ponto(28, dy, CONTORNO)
    for dy in range(3):
        g.ponto(26, y + 4 + dy, "L")
    # Ponta clara de 1px: sem ela a caneta é um traço, com ela é um objeto. O
    # mesmo motivo do brilho no sapato — 3px só lê se um deles destacar.
    g.ponto(26, y + 4, "M")


def _extra_marcos(g: Grade, c: Corpo) -> None:
    """Post-it na mão e estampa na camiseta — o sujeito do mural do Innovation."""
    y = _y_ombro(c)
    for dy in range(3):
        g.segmento(33, y + 10 + dy, "xxx")
    g.ponto(33, y + 10, "z")
    g.segmento(23, y + 5, "zz")
    g.segmento(23, y + 6, "xz")


# Ponte social, Engenharia de Dados. Cabelo volumoso (17px, o maior do elenco),
# camisa social de manga arregaçada — o único com antebraço todo à mostra — e
# colarinho aberto mostrando pele. Ombro direito 1px mais baixo: postura
# relaxada de quem brinda com copo de café.
# Terço inferior: chino caqui (madeira `o`, luminância 80 — o único do elenco de
# calça QUENTE) e tênis de couro branco (`7`, 200). Ninguém mais está de bege, e
# o pé claro fecha a figura que já é a mais clara do peito para cima.
RAFAEL = Corpo(
    nome="rafael",
    pele="media",
    cabelo="P",
    luz_cabelo="Q",
    volume_cabelo=17,
    y_topo=3,
    roupa=("8", "7", "6"),
    gola=("t", "T"),
    calca=("p", "o", "n"),
    sapato=("7", "5", "8"),
    braco=((23, 39, 16, 18),),
    braco_dir=((24, 39, 32, 34),),
    manga=3,
    extra=_extra_rafael,
)

# Líder do DT7, a mais alta do elenco.
#
# ELA ERA A ANA REPINTADA. O defeito relatado pelo dono e confirmado na folha de
# contato: blazer azul-marinho, cabelo castanho no ombro, colarinho branco e
# crachá amarelo — os quatro traços da Ana, num tom de azul uma casa abaixo. Em
# cena com as duas juntas (fases 1, 3 e 4) a plateia não sabia quem era quem, e
# uma casa de rampa é exatamente o que a compressão de vídeo come primeiro.
#
# Cinco eixos mudaram JUNTOS, porque a bíblia §5.4 é explícita em que trocar o
# tom do mesmo blazer não é diferenciar:
#
# (1) CABELO, comprimento E volume. `coque=1`: o nó no alto da cabeça é o único
#     traço do elenco que altera o contorno ACIMA da cabeça, e cabelo preso é
#     silhueta — lê a três metros da tela, onde "castanho um tom diferente" não
#     lia nada. A Ana tem cabelo SOLTO com 3 linhas de queda no ombro; são as
#     duas pontas opostas da mesma medida, e nenhuma delas depende de cor.
# (2) COR do cabelo: preto `R` com mecha grisalha `U`. Era castanho `Q` com
#     `U` — a mesma família da Ana. Preto sobre grisalho dá ~110 pontos de
#     luminância na mecha, que é o dobro do que ela tinha.
# (3) SILHUETA DE ROUPA: colete, não blazer. `lapela=False` e `pin=""` matam os
#     dois acessórios que ela dividia com a Ana (lapela e crachá amarelo), e
#     `roupa_braco` põe a manga da camisa numa faixa de valor própria. Ver
#     `_extra_claudia` para a consequência que importa: barra clara de braços
#     cruzados atravessando um peito quase preto.
# (4) PALETA: colete `("3","2","1")` — neutro frio quase preto, o corpo em 46 de
#     luminância contra os 66 do blazer da Ana — e camisa camel `("r","q","p")`,
#     que é madeira CLARA (152). Ela passa a ser a única figura do elenco com
#     quente claro no torso, e a única cuja roupa tem duas faixas de valor.
#     A gola vai para `("r","q")`: o colarinho deixa de ser branco, que era o
#     quarto traço compartilhado.
# (5) POSTURA e ALTURA seguem sendo dela: braços cruzados (só ela no elenco) e a
#     silhueta mais alta — o topo do contorno dela cai em y=1, contra y=2 do
#     Rafael, que é o segundo.
#
# POR QUE `y_topo` CAIU DE 2 PARA 5. O nó precisa de 3 linhas acima da calota e
# `contornar()` de uma quarta. Com y_topo=2 não havia grade e a tentativa de
# resolver isso pela lateral virou boné (ver `_cabeca`). O crânio dela desceu
# 3px e o CABELO devolveu 4: ela continua sendo a mais alta, mas a altura passou
# a vir do penteado, que é onde ela lê como decisão em vez de como estatura. O
# braço desce junto — `Corpo.braco` tem de começar na linha do ombro, e `_figura`
# levanta erro se não começar.
#
# Terço inferior mantido de propósito: alfaiataria cinza-azulada (`3`, 66) e
# scarpin quase preto (`1` com solado em K, 26). É a única do elenco com o pé
# MAIS ESCURO que a calça — contraste invertido, e é ele que faz a silhueta dela
# ler como formal. Mexer aqui só desfaria raciocínio de piso já registrado.
CLAUDIA = Corpo(
    nome="claudia",
    pele="clara",
    cabelo="R",
    luz_cabelo="U",
    volume_cabelo=17,
    coque=1,
    y_topo=5,
    roupa=("3", "2", "1"),
    roupa_braco=("r", "q", "p"),
    gola=("r", "q"),
    calca=("4", "3", "2"),
    sapato=("1", "K", "4"),
    torso_cintura=(21, 29),
    braco=((25, 36, 15, 17),),
    mao=False,
    linhas_vao=(26, 31),
    extra=_extra_claudia,
)

# Infraestrutura. O mais largo do elenco (23px de ombro), moletom com capuz e
# bolso canguru, cabeça raspada e barba cheia, mãos enfiadas no bolso. O vão
# abre para 3px no braço e fecha para 1px no antebraço: manga folgada.
# Terço inferior: calça de moletom quase preta (`2`, 44 — o mais escuro do
# elenco) e bota de bico caramelo (`u`, 85) com 3px de cano. Infra usa bota, e o
# cano é a única variação de SILHUETA de pé do elenco: em vídeo comprimido a
# forma sobrevive onde a cor morre.
TIAGO = Corpo(
    nome="tiago",
    pele="escura",
    cabelo="R",
    luz_cabelo="Q",
    volume_cabelo=13,
    barba="R",
    franja=False,
    y_topo=4,
    roupa=("4", "3", "2"),
    gola=("3", "2"),
    calca=("3", "2", "1"),
    sapato=("u", "m", "v"),
    cano=3,
    braco=((24, 32, 14, 16), (33, 38, 16, 18)),
    mao=False,
    linhas_vao=(25, 38),
    extra=_extra_tiago,
)

# Documentação técnica e desenho de API, formada em Letras. A mais baixa do
# elenco (-4), cabelo preto longo passando do ombro, óculos e cardigã verde
# aberto sobre camiseta clara. Nenhum outro personagem usa óculos, e o verde do
# cardigã é dela — o único outro verde do elenco é a sapatilha dela mesma.
# Terço inferior: calça clara (`6`, 167) e sapatilha verde escura (`f`/`g`, 54).
# A calça é clara porque ela aparece no cafezinho, onde o piso é madeira escura
# (`n`, 52) e calça escura sumiria; ela é a única de calça clara do elenco.
BIANCA = Corpo(
    nome="bianca",
    pele="profunda",
    cabelo="R",
    luz_cabelo="Q",
    volume_cabelo=15,
    comprimento_cabelo=8,
    oculos=True,
    y_topo=7,
    roupa=("h", "g", "f"),
    gola=("7", "6"),
    calca=("7", "6", "5"),
    sapato=("g", "f", "h"),
    torso_cintura=(21, 29),
    braco=((27, 39, 16, 18),),
    manga=2,
    extra=_extra_bianca,
)

# Innovation. Camiseta em madeira quente — o único do elenco fora do frio
# corporativo, porque a cena dele é a de energia oposta à do Laboratório.
# Cabeça raspada nas laterais com barba curta, braços abrindo para fora e um
# post-it na mão.
# Terço inferior: jeans azul médio (`d`, 91) e tênis ciano (`L`, 150). Quente em
# cima, frio no meio, acento no pé: é o único do elenco cujo pé é a coisa mais
# SATURADA da figura, o que é exatamente o tom da cena dele.
MARCOS = Corpo(
    nome="marcos",
    pele="media",
    cabelo="P",
    luz_cabelo="Q",
    volume_cabelo=13,
    barba="P",
    franja=False,
    y_topo=5,
    roupa=("p", "o", "n"),
    gola=("p", "o"),
    calca=("e", "d", "c"),
    sapato=("L", "I", "M"),
    braco=((25, 31, 16, 18), (32, 38, 15, 17)),
    manga=5,
    linhas_vao=(26, 38),
    extra=_extra_marcos,
)

NPCS: tuple[Corpo, ...] = (RAFAEL, CLAUDIA, TIAGO, BIANCA, MARCOS)


# --------------------------------------------------------------- animação
# Emenda registrada na bíblia §6.1: a janela de 600–1200ms do spec vale para
# transição e entrada de elemento, NÃO para taxa de quadro de sprite. O CSS que
# consome estas tiras roda respiração em ~900ms (2 quadros) e caminhada em
# ~140ms por quadro (4 quadros) — ciclo de caminhada a 600ms por quadro não lê
# como caminhada, lê como defeito.


def _pronto(c: Corpo) -> Grade:
    """Figura montada e contornada. `contornar()` fecha a silhueta e, de quebra,
    transforma cada vão de 1px na linha interna que separa os volumes."""
    return contornar(_figura(c))


def _respirar(base: Grade, y_dobra: int) -> Grade:
    """Sobe 1px tudo que está acima de `y_dobra`, duplicando a linha da dobra.

    Deslocar o sprite INTEIRO faria o personagem quicar e sairia da base fixa em
    y=81. Dobrar na cintura e deixar a linha da dobra repetida é o que dá o
    movimento de inspiração mantendo os pés no chão — e o quadro sai do sprite
    parado, sem redesenhar nada, que é o que impede o rosto de 11px de mudar de
    um quadro para o outro.
    """
    quadro = base.clone()
    for y in range(y_dobra):
        quadro.px[y] = base.px[y + 1][:]
    return quadro


def _tira_idle(c: Corpo) -> list[Grade]:
    """Respiração: 2 quadros. O item de maior retorno do projeto — um sprite que
    respira deixa de ser adesivo (bíblia §6.2)."""
    parado = _pronto(c)
    return [parado, _respirar(parado, c.y_respiro)]


def _tira_andando(c: Corpo) -> list[Grade]:
    """Caminhada: contato, passagem, contato oposto, passagem.

    Substitui o `jogo-bob`, que balançava o sprite inteiro por CSS e era
    literalmente a "folha de papel arrastando" que o dono do projeto descreveu.
    """
    braco = c.braco_andando or c.braco
    espelhado = _espelhar(braco)
    quadros: list[Grade] = []
    for passo, (delta_esq, delta_dir) in enumerate(_BALANCO, start=1):
        quadro = replace(
            c,
            passo=passo,
            pes_juntos=False,
            braco=_alongar_braco(braco, delta_esq),
            braco_dir=_alongar_braco(espelhado, delta_dir),
            # O braço da caminhada tem geometria própria, então a faixa de
            # conferência do vão volta a ser a calculada.
            linhas_vao=None,
        )
        g = _pronto(quadro)
        if passo % 2 == 0:
            # Passagem: o corpo sobe 1px e o pé fica plantado. Dobrar no
            # tornozelo em vez de deslocar o sprite é o que impede o quique.
            g = _respirar(g, 78)
        quadros.append(g)
    return quadros


# ----------------------------------------------------------------- contrato


def _conferir_elenco(pecas: list[tuple[str, Grade]]) -> None:
    """Duas regras do elenco que só se verificam olhando o conjunto.

    Pele: as quatro famílias têm de aparecer. Elenco todo na mesma pele lê como
    o mesmo NPC repintado (bíblia §5.4), e isso é fácil de deixar acontecer
    desenhando um NPC por vez.

    Silhueta: nenhum par de NPCs pode ter a MESMA caixa (largura x altura). É a
    versão mecânica de "reconhecível por silhueta, antes da cor" — não garante
    beleza, mas pega o caso em que dois NPCs são o mesmo boneco de roupa trocada.
    """
    familias = {c.pele for c in NPCS}
    if familias != set(_PELES):
        faltam = sorted(set(_PELES) - familias)
        raise ErroDeArte(
            f"elenco não cobre as quatro famílias de pele: faltam {faltam}. "
            f"Elenco na mesma pele lê como o mesmo NPC repintado (bíblia §5.4)."
        )
    assinaturas: dict[tuple[int, int], str] = {}
    for nome, g in pecas:
        caixa = g.caixa()
        if caixa is None:
            raise ErroDeArte(f"{nome}: sprite vazio")
        x0, y0, x1, y1 = caixa
        chave = (x1 - x0 + 1, y1 - y0 + 1)
        if chave in assinaturas:
            raise ErroDeArte(
                f"{nome} e {assinaturas[chave]} têm a mesma silhueta {chave} — "
                f"variar altura e largura é o que faz o elenco ser cinco pessoas"
            )
        assinaturas[chave] = nome


def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG em `destino` e devolve (nome, grade) para a folha.

    `destino` é public/assets/protagonista/. Os NPCs vão para ../npcs/ porque é
    o que o manifest já declara (`npc-<id>` -> /assets/npcs/<id>.png): o caminho
    existe antes do arquivo, e dropar o PNG com o nome certo substitui a arte
    sem tocar em código.

    A folha de contato leva os nove sprites parados MAIS os quadros de animação
    da Ana. Quadro de animação que ninguém olha é quadro que treme na
    apresentação, e lado a lado em fundo xadrez é o único jeito de ver se a
    perna alterna e se a base não sobe.
    """
    pasta_npcs = destino.parent / "npcs"
    pecas: list[tuple[str, Grade]] = []
    npc_pecas: list[tuple[str, Grade]] = []
    avisos: list[str] = []

    def registrar(nome: str, g: Grade) -> None:
        avisos.extend(verificar_sprite(nome, g, centro=EIXO, chao=CHAO))

    for c in ANAS:
        parado = _pronto(c)
        registrar(c.nome, parado)
        escrever_sprite(destino / f"{c.nome}.png", parado)

        idle = _tira_idle(c)
        andando = _tira_andando(c)
        escrever_tira(destino / f"{c.nome}-idle.png", idle)
        escrever_tira(destino / f"{c.nome}-andando.png", andando)
        # O quadro 2 da respiração e os 4 da caminhada também passam pela
        # verificação: base que sobe num quadro só faz o personagem afundar no
        # meio da animação, e é o tipo de erro que ninguém consegue apontar.
        for i, q in enumerate(idle[1:], start=2):
            registrar(f"{c.nome}-idle q{i}", q)
        for i, q in enumerate(andando, start=1):
            registrar(f"{c.nome}-andando q{i}", q)

        pecas.append((c.nome, parado))

    for c in NPCS:
        parado = _pronto(c)
        registrar(c.nome, parado)
        escrever_sprite(pasta_npcs / f"{c.nome}.png", parado)
        idle = _tira_idle(c)
        escrever_tira(pasta_npcs / f"{c.nome}-idle.png", idle)
        registrar(f"{c.nome}-idle q2", idle[1])
        npc_pecas.append((c.nome, parado))

    _conferir_elenco(npc_pecas)
    pecas.extend(npc_pecas)

    # Os quadros da Ana neutra vão para a folha para que a caminhada possa ser
    # OLHADA quadro a quadro, e não só inferida do PNG da tira.
    pecas.append(("ana-neutra respirando", _tira_idle(ANA_NEUTRA)[1]))
    for i, q in enumerate(_tira_andando(ANA_NEUTRA), start=1):
        pecas.append((f"ana-neutra andando {i}", q))

    if avisos:
        # Não dá para levantar erro aqui: aviso de eixo ou de base tem de sair
        # junto com a arte, porque a correção é olhar a folha. Mas tem de sair
        # GRITANDO, senão vira ruído no log e some.
        print("[personagens] AVISOS DE verificar_sprite:")
        for aviso in avisos:
            print(f"  - {aviso}")
    else:
        print(f"[personagens] verificar_sprite: {len(pecas)} peças, zero aviso")
    return pecas
