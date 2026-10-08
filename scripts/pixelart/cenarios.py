"""
Os cinco lugares da v2, a variação de festa, o mapa e os objetos interativos.

Grade 480x270 (bíblia §2.1: 4 px reais por px de arte, em tudo). O piso encontra
o personagem em `CHAO_DA_CENA = 232`.

QUATRO DECISÕES DE COMPOSIÇÃO QUE VALEM PARA AS SEIS CENAS

1. HORIZONTE ALTO, POR CAUSA DO CONTEÚDO. `src/domain/content/bloco*.ts` põe as
   `parada` da Ana entre y=53% e y=84% do canvas — ou seja, entre 143 e 227 px
   de arte. Se a parede encontrasse o piso em 170 como um desenho de escritório
   pediria, metade dos pontos de parada cairia na parede. A junta parede-piso
   fica em ~150-158 em todas as cenas, o que dá uma faixa de caminhada de ~75px
   e faz TODA parada do roteiro cair em piso.

2. SANDUÍCHE DE VALOR, NÃO DEGRADÊ DE VALOR. A bíblia §4.2 pede plano de frente
   mais escuro; a consequência prática é que a parede desce para escuro (a banda
   atrás da CABEÇA da Ana é a mais escura da parede), o piso é o plano CLARO da
   cena, e o primeiro plano volta a ser quase preto. Assim o rosto claro dela lê
   contra a parede escura e a calça escura lê contra o piso claro. Um degradê
   monotônico claro→escuro faria a figura empatar em algum ponto do caminho.

3. NADA DE MÓVEL COM BASE ABAIXO DA FAIXA DE CAMINHADA, exceto o plano de
   FRENTE. A UI desenha o personagem SEMPRE por cima do cenário — não existe
   ordenação por profundidade. Então móvel cuja base fique abaixo de uma parada
   apareceria atrás de alguém que deveria estar atrás dele. Os únicos props com
   base abaixo de 232 são os do plano de frente, e eles ficam nos cantos, fora
   de qualquer ponto de parada.

4. PAREDE POVOADA EM TRÊS ALTURAS. Primeira versão desta arte deixou faixas de
   parede de 300x100 px vazias e a folha de contato mostrou seis cenas com cara
   de maquete. A parede agora recebe (a) pilar ou duto cortando a horizontal,
   (b) algo pendurado na altura dos olhos, (c) teto com forro modular. Textura
   sozinha não resolve parede vazia — o que resolve é ARESTA VERTICAL.

OBJETO INTERATIVO É SPRITE, NÃO CENÁRIO
Todo hotspot que não é NPC nem item (notebook, rack, quadro, TV...) sai como PNG
próprio com transparência em `public/assets/objetos/`, contornado, porque é ele
que recebe a aura de hover (bíblia §7.2). A cena deixa o lugar dele VAZIO — se o
objeto estivesse pintado no fundo, o sprite por cima faria um fantasma duplo. As
posições vazias saíram de `bloco1.ts`..`bloco5.ts` convertidas de % para px de
arte (x% * 4.8, y% * 2.7).
"""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path

from . import props, personagens, refinamentos
from .nucleo import (
    CENA,
    Grade,
    contornar,
    escrever_folha_de_contato,
    escrever_sprite,
    escrever_tira,
)
from .paleta import VAZIO, mais_claro, mais_escuro

LARGURA, ALTURA = CENA

# Raiz do repositório derivada DESTE arquivo, não do `destino` recebido.
# Antes a folha de objetos saía de `destino.parent.parent.parent`, o que casa
# por acidente quando `destino` é public/assets/cenarios e escreve FORA do
# repositório para qualquer outro destino — a prévia de cena, que usa pasta
# temporária, mandou a folha para AppData\Local. Caminho de saída nunca deve
# ser inferido do caminho de entrada.
_RAIZ_DO_REPO = Path(__file__).resolve().parent.parent.parent

# Junta parede-piso por cena. Ver decisão 1 no topo do arquivo.
HZ_ESCRITORIO = 156
HZ_CAFEZINHO = 152
HZ_TREINAMENTO = 154
HZ_LABORATORIO = 150
HZ_INNOVATION = 158
HZ_REUNIOES = 152
# As duas cenas novas da v2 têm junta MAIS ALTA que as seis primeiras, e é
# deliberado. As coordenadas das seis originais foram ajustadas ao cenário depois
# de o cenário existir; as fases 3 e 5 estão sendo escritas AGORA, por outra
# frente, contra um piso que ela não viu. Subir a junta é o que dá folga a quem
# escolhe a `parada`: com a junta em 144 e nenhum móvel de base abaixo de 176, a
# faixa de piso passa de 55 linhas em qualquer coluna e cobre de 65% a 85% da
# altura do canvas — que é a janela onde todas as 24 paradas do jogo atual caem.
HZ_LINHA_PRODUCAO = 148
HZ_OUTRA_AREA = 144


# ---------------------------------------------------------------- utilidades


def _assentar(
    g: Grade,
    x_centro: int,
    y_base: int,
    prop: Grade,
    *,
    sombra: bool = True,
    espelhar: bool = False,
    folga: int = 2,
) -> None:
    """Cola um prop pela base e assenta com sombra de contato.

    Existe para que "colar prop de chão" e "dar sombra de contato" sejam UM
    gesto. Separados, a sombra é a coisa que se esquece — e sem ela a cena
    inteira vira adesivo (bíblia §4.4).
    """
    g.colar_base(x_centro, y_base, prop, espelhar)
    if sombra:
        props.sombra_de_contato(g, x_centro, y_base, prop.largura + folga)


def _escurecer(g: Grade, x: int, y: int, w: int, h: int, passos: int = 1) -> None:
    """Desce `passos` na rampa de cada pixel da região.

    É como o plano de FRENTE fica mais escuro sem precisar de props duplicados
    em rampa escura: o prop é o mesmo, o plano é que muda de valor.
    """
    for dy in range(h):
        for dx in range(w):
            ch = g.em(x + dx, y + dy)
            if ch == VAZIO:
                continue
            g.ponto(x + dx, y + dy, mais_escuro(ch, passos))


def _aresta_de_luz(g: Grade, x: int, y: int, w: int, h: int, passos: int = 2) -> None:
    """Realce no PRIMEIRO pixel opaco de cada coluna da região.

    Serve ao plano de frente. Escurecer um prop dois passos o transforma numa
    mancha preta sem forma; devolver luz só na aresta de cima recupera a
    silhueta sem devolver o valor. É o que faz o objeto cortado pela borda
    inferior ler como objeto, e não como tarja.
    """
    for dx in range(w):
        for dy in range(h):
            ch = g.em(x + dx, y + dy)
            if ch == VAZIO:
                continue
            g.ponto(x + dx, y + dy, mais_claro(ch, passos))
            break


def _halo(g: Grade, cx: int, cy: int, rx: int, ry: int) -> None:
    """Halo de luminária na parede: elipse de dither que sobe uma casa na rampa.

    ERRO JÁ COMETIDO E CORRIGIDO AQUI, duas vezes. Primeiro o halo aclarava
    `(dx + dy) % n == 0`, que desenha LISTRAS DIAGONAIS — apareceu uma hachura
    na parede embaixo das calhas do escritório. Depois virou um RETÂNGULO de
    dither esparso, e as lâmpadas pendentes do Innovation ficaram com um
    quadrado pontilhado embaixo. Halo é elíptico e com a borda esparsa; é a
    mesma geometria da poça de luz do piso, só numa superfície vertical.
    """
    props.poca_de_luz(g, cx, cy, rx, ry, quente=None, passos=1)


def _halo_quente(g: Grade, cx: int, cy: int, rx: int, ry: int, tom: str = "x") -> None:
    """Halo de luminária numa parede CLARA: glow por COR, não por valor.

    ERRO ENCONTRADO AO OLHAR A IMAGEM, e é a terceira encarnação de um defeito
    que a bíblia §3 já registra. `_halo` aclara a parede um passo, e isso é o
    certo numa parede de valor médio — no escritório a banda é `5` e sobe para
    `6`. No cafezinho a parede alta é `7`, o PENÚLTIMO tom do neutro: um passo
    chega em `8`, que é quase branco. Resultado nas duas versões da cena: duas
    LUAS BRANCAS penduradas na parede, exatamente a descrição do defeito antigo.

    Numa parede que já está no topo da rampa não sobra valor para subir, então o
    glow tem de vir de HUE. Três anéis de salpico quente com densidade caindo de
    dentro para fora, sem tocar no valor do reboco.

    A dosagem é conservadora de propósito: a primeira poça de luz deste projeto
    pintava `v`/`w`/`x` com cobertura alta e saiu um TAPETE LARANJA LISTRADO.
    Aqui o núcleo tem 50% de cobertura, o meio 25% e a borda 11%, e só em padrão
    de dither conhecido — qualquer outro módulo desenha moiré nesta escala.
    """
    quente_frio = mais_escuro(tom)
    for dy in range(-ry, ry + 1):
        for dx in range(-rx, rx + 1):
            d = (dx / max(rx, 1)) ** 2 + (dy / max(ry, 1)) ** 2
            if d > 1.0 or g.em(cx + dx, cy + dy) == VAZIO:
                continue
            ax, ay = cx + dx, cy + dy
            if d < 0.10:
                g.ponto(ax, ay, tom if (dx + dy) % 2 == 0 else mais_claro(tom))
            elif d < 0.28:
                if (dx + dy) % 2 == 0:
                    g.ponto(ax, ay, tom)
            elif d < 0.62:
                if dx % 2 == 0 and dy % 2 == 0:
                    g.ponto(ax, ay, tom)
            elif dx % 3 == 0 and dy % 3 == 0:
                g.ponto(ax, ay, quente_frio)


def _vinheta(g: Grade) -> None:
    """Escurece as quatro bordas da cena.

    A moldura escura é o que mantém o olho no meio da imagem quando ela é
    projetada em tela cheia por vídeo comprimido; sem ela a cena "sangra" para
    fora e o centro perde peso.
    """
    for i, passos in ((0, 2), (1, 1), (2, 1)):
        _escurecer(g, 0, i, LARGURA, 1, passos)
        _escurecer(g, 0, ALTURA - 1 - i, LARGURA, 1, passos)
        _escurecer(g, i, 0, 1, ALTURA, passos)
        _escurecer(g, LARGURA - 1 - i, 0, 1, ALTURA, passos)
    for k in range(6):  # queda suave só nos cantos
        _escurecer(g, 3 + k, 3 + k, 22 - 2 * k, 1)
        _escurecer(g, LARGURA - 25 + k, 3 + k, 22 - 2 * k, 1)
        _escurecer(g, 3 + k, ALTURA - 4 - k, 22 - 2 * k, 1)
        _escurecer(g, LARGURA - 25 + k, ALTURA - 4 - k, 22 - 2 * k, 1)


def _luminaria_de_teto(g: Grade, cx: int, largura: int, y: int = 6) -> None:
    """Calha embutida de luz FRIA + halo na parede logo abaixo.

    Fria porque o escritório é Ericsson e o contraste com a janela ao poente é o
    motor da cena (bíblia §1, terceira referência).
    """
    g.retangulo(cx - largura // 2, y, largura, 6, "5")
    g.linha_h(cx - largura // 2, y, largura, "7")
    g.dither(cx - largura // 2 + 1, y + 1, largura - 2, 4, "6", "8", "xadrez")
    g.moldura(cx - largura // 2, y, largura, 6, "3")
    _halo(g, cx, y + 14, largura // 2 + 4, 13)


def _encosto_de_primeiro_plano(
    largura: int = 96, altura: int = 40, ramp: str = props.AZUL
) -> Grade:
    """Encosto de cadeira grande, para ser CORTADO pela borda inferior.

    O plano de frente é o que mais falta em cena amadora e o que mais dá
    profundidade (bíblia §4.1). Um encosto de cadeira é o objeto perfeito para
    isso numa sala: é grande, é escuro, e a plateia sabe o tamanho dele, então
    ele dá escala ao resto sozinho.

    Tem costura vertical e apoio de braço porque encosto liso, depois de
    escurecido, vira uma tarja preta na borda da imagem.
    """
    g = Grade(largura, altura)
    esc, med, cla = props.tons_de_volume(ramp)
    g.retangulo(0, 4, largura, altura - 4, med)
    g.dither(1, 5, largura - 2, altura - 6, med, esc, "xadrez")
    for i in range(4):  # topo arredondado
        g.linha_h(i * 3, 4 - i // 2, largura - i * 6, med if i else cla)
    g.linha_h(2, 4, largura - 4, cla)
    g.linha_v(0, 6, altura - 6, cla)
    g.linha_v(largura - 1, 6, altura - 6, esc)
    g.dither(8, 12, largura - 16, altura - 18, med, cla, "esparso")
    for px in (6, largura - 8):  # costura das laterais
        g.linha_v(px, 8, altura - 10, esc)
        g.linha_v(px + 1, 8, altura - 10, cla)
    return g


def _tela_de_projecao(largura: int, altura: int) -> Grade:
    """Tela de projeção: rolo, pano claro e um slide aceso.

    Não é TV: o pano é quase branco e o conteúdo é LAVADO (dither claro) em vez
    de ciano saturado, porque projetor lava a imagem. É o que diferencia a sala
    de treinamento da sala de reuniões numa olhada.
    """
    g = Grade(largura, altura)
    g.retangulo(0, 0, largura, 3, "4")  # rolo
    g.linha_h(0, 0, largura, "6")
    g.retangulo(1, 3, largura - 2, altura - 3, "7")
    g.dither(2, 4, largura - 4, altura - 5, "7", "8", "esparso")
    g.linha_v(1, 3, altura - 3, "8")
    g.linha_v(largura - 2, 3, altura - 3, "5")
    g.linha_h(1, altura - 1, largura - 2, "5")
    # slide: barra de título + três marcadores, em tom frio lavado
    g.retangulo(6, 8, largura - 20, 3, "e")
    for i in range(3):
        g.linha_h(9, 16 + i * 6, largura - 26 - i * 4, "5")
        g.retangulo(6, 16 + i * 6 - 1, 2, 3, "d")
    return g


def _feixe_de_projetor(g: Grade, x_lente: int, y_lente: int, x_tela: int, y0: int, y1: int) -> None:
    """Cone de luz do projetor até a tela.

    Projetor sem feixe é uma caixa no teto. O feixe é o que diz que a sala está
    com a luz baixa e que a apresentação está rodando — e é a única maneira de
    mostrar "luz mais baixa" sem escurecer a cena até virar breu.

    Dois passos de rampa e dither xadrez: com um passo e dither esparso (a
    primeira tentativa) o feixe simplesmente não apareceu na folha de contato.
    """
    passo = max(1, x_lente - x_tela)
    for i in range(passo):
        x = x_lente - i
        t = i / passo
        topo = round(y_lente + (y0 - y_lente) * t)
        base = round(y_lente + (y1 - y_lente) * t)
        for y in range(topo, base + 1):
            ch = g.em(x, y)
            if ch == VAZIO:
                continue
            perto_da_borda = y - topo < 3 or base - y < 3
            if perto_da_borda:
                if (x + y) % 2 == 0:
                    g.ponto(x, y, mais_claro(ch))
            elif (x + y) % 2 == 0:
                g.ponto(x, y, mais_claro(ch, 2))
            else:
                g.ponto(x, y, mais_claro(ch))


# ----------------------------------------------------------------- cena 1/6


def escritorio(*, quadro: int = 0) -> Grade:
    """Base recorrente (Blocos 1, 3 e 5): baias, muitas telas, janela ao poente.

    DOIS RETÂNGULOS RESERVADOS, lidos de `bloco1.ts`/`bloco5.ts` e convertidos
    de % para px de arte (x% * 4,8 e y% * 2,7):

      x  92..140, y 166..194  `notebook` do Bloco 1 e do Bloco 5, base em 194 —
                              por isso o tampo da mesa da Ana está em y=194
                              exato e não em 196: 2px de folga viram 8px na tela
                              e o notebook flutuaria acima da mesa.
      x  91..139, y 122..158  `notebook-aberto` do Bloco 1 (usa o asset
                              `objeto-monitor-ligado`), ancorado pelo CENTRO na
                              parede da baia.

    Nada de cenário é desenhado dentro deles. Foi por isso que a tela decorativa
    que espia por cima da baia esquerda saiu de x=122 para x=160: ela caía em
    cima do retângulo do Bloco 1 e a plateia veria dois monitores sobrepostos.
    """
    hz = HZ_ESCRITORIO
    g = Grade(LARGURA, ALTURA, "3")

    # --- FUNDO
    props.parede_pintada(g, 0, hz, "5443")
    props.forro_de_teto(g, 0, 16)
    _luminaria_de_teto(g, 118, 78)
    _luminaria_de_teto(g, 344, 78)

    # parede povoada em três alturas (decisão 4)
    _assentar(g, 228, hz + 2, props.pilar(22, 142), sombra=False)
    _assentar(g, 466, hz + 2, props.pilar(20, 142), sombra=False)
    g.colar(64, 40, props.cartaz(28, 36, acento=props.TELA[3]))
    g.colar(110, 26, props.grelha_de_ar(26, 14))
    g.colar(146, 36, props.cartaz(32, 40, acento=props.VERDE[3]))
    g.colar(192, 40, props.relogio_de_parede(7))
    g.colar(250, 40, props.tv_de_parede(42, 28, "dash"))
    g.colar(426, 30, props.placa_sinalizacao(18, 11))
    # Janela ao poente: a única fonte quente do fundo (bíblia §1 e §3). É a janela
    # de ANDAR ALTO do jogo — skyline, quatro panos, peitoril fino — e é a mais
    # dramática das três de propósito: o escritório é a cena que precisa de
    # distância. As outras duas trocaram vista, hora e caixilho para que a
    # plateia não reconheça o mesmo desenho três vezes.
    g.colar(
        294,
        26,
        props.janela(
            122, 70, hora="poente", vista="cidade", montantes=3, travessas=1, peitoril=3
        ),
    )
    props.rodape(g, hz)

    # --- CHÃO: carpete CLARO. Ver decisão 2: é o plano claro do sanduíche.
    props.piso_em_bandas(g, hz, ALTURA, "6554")
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=16, semente=91)
    # Luz da janela no piso: quadrilátero inclinado para a direita com as três
    # sombras de montante dentro, e não a elipse de antes. A janela tem 3
    # montantes, então a mancha tem 3 barras — é essa correspondência que faz a
    # luz ter origem em vez de ser uma mancha clara no carpete.
    # Salpico em `z` (rampa luz) e não em `r` (rampa madeira): `r` é o creme mais
    # claro da MADEIRA, e `scripts/exportar_chao.py` reconhece piso pelo char —
    # madeira é móvel para ele. Pintar `r` no meio da faixa de caminhada partia a
    # corrida de piso daquelas colunas e o mapa de chão passava a dizer que ali
    # existe mesa. Luz quente sobre carpete é luz, não madeira; `z` é o mesmo
    # creme na família certa.
    props.poca_de_janela(
        g, 302, 172, 96, 60, inclinacao=30, barras=3, travessa=3, quente="z", passos=2
    )

    # --- MEIO
    _assentar(g, 38, 162, props.rack_servidor(34, 78))  # o rack do Tiago
    # Monitor colado ANTES do painel: o painel cobre a base dele e só a parte de
    # cima aparece por cima da divisória. É esse recorte — e não o painel — que
    # faz a plateia ler "baia" em vez de "biombo": tela espiando por cima da
    # parede é a imagem canônica de escritório de baias.
    _assentar(g, 160, 126, props.monitor(32, 26, "log"), sombra=False)
    _assentar(g, 246, 124, props.monitor(32, 26, "grafico"), sombra=False)
    _assentar(g, 130, 170, props.divisoria_baia(96, 56))
    _assentar(g, 250, 168, props.divisoria_baia(84, 54))
    _assentar(g, 452, 182, props.armario_baixo(56, 30, props.NEUTRO))
    _assentar(g, 452, 152, props.vaso_planta_baixa(22), sombra=False)

    # Colega no posto do fundo: a mesa esconde o corpo e as duas telas ficam
    # visivelmente ao alcance de alguém, sem criar outro hotspot.
    # O posto sentado é composto ao final, junto da sua animação.
    # mesa do fundo sob a janela, com duas telas: a identidade "muitas telas"
    # Mesa, colega e telas vêm de uma composição única em refinamentos.posto.
    # reflexo DUAS filas abaixo do topo: em cima da fila de realce do tampo ele
    # se intercala com o tom claro e o resultado lê como tampo salpicado de
    # dourado, não como brilho de tela.
    props.reflexo_de_tela(g, 300, 167, 112, 3, props.TELA[1])
    _assentar(g, 292, 196, props.cadeira_escritorio(perfil=True))
    _assentar(g, 412, 162, props.pilha_de_papel(13, 7), sombra=False)

    # --- mesa da Ana. Tampo em y=194; x 92..140 fica VAZIO para o notebook.
    _assentar(g, 170, 230, props.mesa_de_trabalho(150, 36))
    # O monitor clicável entra como camada do hotspot, exatamente sobre este
    # retângulo reservado. Desenhá-lo também no fundo criava duas telas quase
    # alinhadas, percebidas como uma tela torta quando a camada interativa abria.
    _assentar(g, 236, 194, props.luminaria_de_mesa(), sombra=False)
    props.poca_de_luz(g, 232, 192, 22, 4, quente="r")
    props.reflexo_de_tela(g, 192, 197, 34, 3, props.TELA[1])
    # ACENTO VERMELHO da cena, e o único: caneca FORA do retângulo do notebook
    _assentar(g, 178, 194, props.caneca(props.VERMELHO[3], vapor=True), sombra=False)
    # Sombra de contato DO OBJETO INTERATIVO. O sprite dele é PNG transparente
    # que a UI põe sobre qualquer fundo, então não pode trazer sombra própria —
    # ela mora aqui, no tampo, na posição exata que o hotspot declara. Sem isso o
    # notebook fica adesivo em cima da mesa (bíblia §4.4).
    props.sombra_de_contato(g, 116, 194, 44)
    _assentar(g, 272, 228, props.cadeira_escritorio())
    # piso da esquerda: caixa e papel encostados no painel da baia. Sem eles
    # sobrava um vazio de 80x60 px entre o rack e a mesa.
    _assentar(g, 62, 212, props.caixa_papelao(26, 22))
    _assentar(g, 62, 190, props.caixa_papelao(20, 17), sombra=False)
    _assentar(g, 84, 208, props.pilha_de_papel(14, 9))

    # --- FRENTE: baia vizinha cortada pela borda de baixo + planta cortada.
    # Olhar por cima do painel da baia ao lado é a versão de escritório do
    # rochedo em primeiro plano que Fate of Atlantis usa em quase todo quadro.
    _assentar(g, 68, 294, props.divisoria_baia(190, 62), sombra=False)
    _escurecer(g, 0, 232, 164, 38, 2)
    _aresta_de_luz(g, 0, 232, 164, 10, 2)
    _assentar(g, 450, 274, props.vaso_planta_alta(94), sombra=False)
    _escurecer(g, 428, 178, 52, 92, 1)
    refinamentos.decorar(g, 'escritorio', quadro)
    _vinheta(g)
    return g


# ----------------------------------------------------------------- cena 2/6


def cafezinho(*, festa: bool = False, gesto: bool = False) -> Grade:
    """A cena quente do jogo: madeira dominante, balcão, luz de fim de tarde.

    Aqui a proporção da bíblia §3 é invertida de propósito — madeira ~45% da
    área. O cafezinho é o contraponto do escritório, e contraponto que usa a
    mesma dosagem não é contraponto. O frio continua presente (máquina, tela de
    avisos, bebedouro) para que o lugar ainda pertença ao prédio.

    O lambri é DOIS passos mais escuro que o piso de madeira de propósito: na
    primeira versão os dois estavam no mesmo tom e a parede de madeira derreteu
    no piso de madeira — a sala perdeu o canto e virou uma mancha marrom de 480
    de largura.

    `festa=True` é a versão da fase 6 (ADR-029): o MESMO lugar transformado, que
    é o argumento visual de que o lugar mudou porque ela mudou. Por isso é um
    parâmetro desta função e não uma função nova — planta baixa, balcão, máquina
    de café, mesa alta, sofá e bebedouro têm de ser literalmente o mesmo código,
    senão as duas cenas divergem na primeira alteração e a plateia perde o
    reconhecimento, que é a única coisa que a versão de festa precisa entregar.

    O que a festa muda, e por quê:

    - **A luz.** A janela vai de `dourada` para `anoitecer` e DEIXA de ser fonte
      de luz; quem ilumina passa a ser a lâmpada. É o truque da terceira
      referência da bíblia §1 — luz quente pontual num campo frio — e é o que dá
      drama: fora está frio e escuro, dentro está quente e cheio. Os halos das
      pendentes crescem, a segunda ganha poça no chão e o cordão de lâmpadas
      acende. A primeira tentativa foi levar a janela ao poente e alongar a
      mancha de sol, e olhar a imagem mostrou que não funcionava: a janela ficava
      quase idêntica e a mancha virava uma cunha creme lavando o sofá.
    - **A decoração.** Bandeirolas e cordão de lâmpadas, os dois pendurados na
      metade de CIMA da imagem. Decoração de chão (mesa de buffet, caixa de
      bebida) foi descartada por um motivo mecânico: a fase 6 põe SEIS figuras
      neste piso, e todo móvel novo abaixo de y=176 tira 50 linhas da faixa de
      piso de umas 60 colunas.
    - **A mesa posta.** O balcão troca de conteúdo — bolo, salgados, copos e
      jarra no lugar da papelada e das garrafas. Objeto de balcão não é
      mobiliário: a base dele fica em y=150, 80px acima de qualquer ponto de
      parada, e nenhum deles aparece no mapa de chão.
    """
    hz = HZ_CAFEZINHO
    g = Grade(LARGURA, ALTURA, "4")

    props.parede_pintada(g, 0, 118, "7665")
    # lambri escuro da meia-parede para baixo. Ia até 96 (56px de altura) e com
    # o piso de madeira embaixo somava dois terços da imagem em marrom — o
    # cafezinho é a cena quente, não a cena marrom. Em 118 ele vira faixa.
    g.retangulo(0, 118, LARGURA, hz - 118, props.MADEIRA[1])
    g.dither(0, 118, LARGURA, hz - 118, props.MADEIRA[1], props.MADEIRA[0], "esparso")
    for x in range(0, LARGURA, 13):
        g.linha_v(x, 120, hz - 121, props.MADEIRA[0])
        g.linha_v(x + 1, 120, hz - 121, props.MADEIRA[2])
    g.linha_h(0, 115, LARGURA, props.MADEIRA[4])  # travessa da meia-parede
    g.linha_h(0, 116, LARGURA, props.MADEIRA[5])
    g.linha_h(0, 117, LARGURA, props.MADEIRA[0])
    props.forro_de_teto(g, 0, 14, passo=32)
    _assentar(g, 112, 52, props.luminaria_pendente(38), sombra=False)
    _assentar(g, 300, 46, props.luminaria_pendente(32), sombra=False)
    # Halo QUENTE, não claro. Ver `_halo_quente`: nas duas versões desta cena o
    # halo comum saía como lua branca, porque a banda de parede aqui é `7` e não
    # sobra valor para subir. Na festa o raio cresce — a luz elétrica passa a
    # mandar na cena, porque a janela virou anoitecer.
    _halo_quente(g, 112, 66, 26 if festa else 22, 18 if festa else 15)
    _halo_quente(g, 300, 60, 23 if festa else 19, 16 if festa else 13)

    # parede alta da esquerda: prateleira de canecas e relógio. Sem elas sobrava
    # um retângulo claro de 200x80 px — a maior área vazia das seis cenas.
    g.colar(26, 36, props.prateleira(56, 40, props.MADEIRA))
    g.colar(96, 44, props.relogio_de_parede(7))
    g.colar(130, 38, props.cartaz(26, 34, acento=props.LUZ[3]))
    # Janela de ANDAR BAIXO: caixilho quadriculado de seis panos, peitoril grosso
    # de bar e copa de árvore no lugar da skyline, em hora dourada (sol mais alto
    # que o poente do escritório). Nenhum dos quatro eixos coincide com a janela
    # do escritório — era o mesmo asset nas duas, e num jogo de seis cenas a
    # plateia passa por metade delas vendo a mesma coisa.
    g.colar(
        348,
        30,
        props.janela(
            112,
            66,
            hora="anoitecer" if festa else "dourada",
            vista="copa",
            montantes=1,
            travessas=2,
            peitoril=6,
        ),
    )
    g.colar(212, 40, props.tv_de_parede(40, 26, "dash"))
    g.colar(252, 44, props.cartaz(24, 30, acento=props.VERDE[3]))
    # Cartão de receitas preso abaixo da TV: um pequeno detalhe de uso diário
    # ocupa a faixa de parede livre sem empurrar móveis para a rota de circulação.
    g.retangulo(216, 75, 32, 32, props.MADEIRA[1])
    g.linha_h(216, 75, 32, props.MADEIRA[4])
    g.linha_v(216, 75, 32, props.MADEIRA[4])
    g.retangulo(219, 78, 26, 26, props.NEUTRO[2])
    g.linha_h(220, 79, 24, props.NEUTRO[5])
    g.linha_h(222, 82, 20, props.LUZ[3])
    # Três fichas e uma xícara desenhada à mão: a leitura é um mural de receitas,
    # sem texto minúsculo que se perca na escala de projeção.
    for y in (86, 91, 96):
        g.retangulo(222, y, 2, 2, props.VERDE[3] if y == 91 else props.TELA[3])
        g.linha_h(226, y + 1, 8 if y != 96 else 6, props.NEUTRO[6])
    g.retangulo(237, 88, 5, 5, props.MADEIRA[4])
    g.linha_h(236, 88, 7, props.NEUTRO[6])
    g.retangulo(238, 89, 3, 3, props.NEUTRO[5])
    g.ponto(243, 89, props.MADEIRA[4])
    g.linha_h(236, 94, 7, props.MADEIRA[4])
    props.rodape(g, hz, tom=props.MADEIRA[0])

    props.piso_de_madeira(g, hz, ALTURA)
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=14, semente=23)
    # A janela tem 1 montante e 2 travessas, então a mancha tem 1 barra vertical e
    # uma faixa horizontal. Sol mais alto que no escritório = mancha mais CURTA e
    # mais próxima da parede, com pouca inclinação. A forma tem de concordar com a
    # hora, senão a luz e o céu contam histórias diferentes.
    #
    # NA FESTA NÃO HÁ SOL. A primeira tentativa levou a janela ao poente e alongou
    # a mancha, e olhando a imagem ficou claro que não funcionava: a janela
    # continuava quase idêntica (a copa cobre 44% do vão e come a diferença de
    # céu) e a mancha virou uma cunha creme enorme lavando o sofá e a mesa alta.
    # Trocou de estratégia para o truque da terceira referência da bíblia §1, que
    # é o único que dá drama de verdade: LUZ QUENTE PONTUAL NUM CAMPO FRIO. A
    # janela vai a `anoitecer` (azul frio com uma faixa quente no horizonte) e
    # deixa de ser fonte de luz; quem ilumina passa a ser a lâmpada. Fora está
    # frio e escuro, dentro está quente e cheio — e é exatamente o que a fase 6
    # precisa dizer. A mancha dela no piso fica fraca e curta, porque é o que uma
    # janela que não ilumina projeta.
    props.poca_de_janela(
        g,
        338,
        158,
        90,
        34 if festa else 44,
        inclinacao=8 if festa else 14,
        barras=1,
        travessa=4,
        quente=None if festa else "q",
        passos=1 if festa else 2,
    )
    # Pendente: fonte pontual, e por isso elipse. Mais alta e mais estreita que as
    # do Innovation para que as duas cenas não exibam a mesma mancha.
    # Em y=222 e não em 178: a 178 ela caía DEBAIRO do balcão (que vai de y=150 a
    # y=202 e é colado depois) e não aparecia um pixel. Poça invisível é pior que
    # poça ausente — custa o mesmo e some sem avisar.
    props.poca_de_luz(g, 112, 222, 32, 12)
    if festa:
        # A segunda pendente (x=300) não tem poça na versão de dia porque a mesa
        # alta e o sofá comem o trecho; à noite, com a luz elétrica mandando na
        # cena em vez do sol, ela precisa de consequência no chão. Mais baixa e
        # mais larga que a primeira: duas poças idênticas seriam o carimbo.
        props.poca_de_luz(g, 296, 214, 40, 13, quente="x")
        # BANHO AMBIENTE NA FAIXA DA FRENTE, e isto veio de compor as seis figuras
        # em cima da cena e OLHAR. O piso de madeira escurece para a frente
        # (`piso_de_madeira` usa "ponm"), e a banda da frente é `m`, o mais escuro
        # da rampa. Três das seis figuras da fase 6 — Ana, Cláudia e Tiago — usam
        # calça escura, e ali elas PERDIAM AS PERNAS: do quadril para baixo o
        # valor da roupa empatava com o valor do piso, que é exatamente o que a
        # bíblia §4.2 proíbe, e silhueta perdida em vídeo comprimido é cena
        # ilegível. Um passo de rampa em toda a faixa (`m`->`n`, `n`->`o`) devolve a
        # separação sem clarear a cena inteira, e tem justificativa na própria
        # cena: é festa, as duas pendentes e o cordão de lâmpadas estão acesos, e a
        # janela deixou de ser a fonte. Elipse muito larga e muito baixa de
        # propósito — é luz somada de várias fontes, não uma lâmpada.
        props.poca_de_luz(g, 240, 226, 250, 36, quente="q", passos=1)

    # Uma pessoa serve café atrás do balcão. A bancada entra depois e cobre a
    # parte inferior do corpo; o copo e a máquina ficam ao alcance da mão.
    if not festa:
        # Fora das paradas x=21% e x=25%: ali a cabeça de Ana escondia o
        # figurante inteiro quando ela chegava à máquina ou falava com Bianca.
        g.colar(155, 107, personagens.figurante_servindo(quadro=int(gesto)))

    # --- balcão. A frente de interação moveu `maquina-cafe` para (77,189), que é
    # CHÃO e não bancada: o retângulo x 57..97 / y 141..189 ficou reservado e o
    # balcão começa em x=104 por causa dele. Antes o balcão ia de x=26 a x=200 e
    # a máquina apareceria pendurada na frente da porta do armário.
    _assentar(g, 178, 202, props.bancada(148, 52))
    # O BALCÃO É O MESMO; o que está EM CIMA dele muda. Objeto de balcão tem base
    # em y=150, uns 80px acima de qualquer ponto de parada, e nenhum deles entra
    # no mapa de chão — trocar o conteúdo é a única alteração de cena que não
    # arrisca o trabalho de quem está posicionando as seis figuras.
    # A caneca vermelha fica nas duas versões: é o ÚNICO acento vermelho da cena
    # (bíblia §3) e num dia de festa ela continua sendo o ponto de descanso do
    # olho. A planta sai só na festa porque o lugar dela virou a bandeja — e a
    # cena continua com planta, a alta do canto direito.
    if festa:
        _assentar(g, 128, 150, props.bolo(24, 18), sombra=False)
        _assentar(g, 152, 150, props.caneca(props.VERMELHO[3], vapor=True), sombra=False)
        _assentar(g, 176, 150, props.bandeja_de_salgados(26, 9), sombra=False)
        _assentar(g, 206, 150, props.copos(3), sombra=False)
        _assentar(g, 224, 150, props.jarra(16), sombra=False)
        _assentar(g, 242, 150, props.bandeja_de_salgados(20, 9), sombra=False)
    else:
        _assentar(g, 132, 150, props.pilha_de_papel(11, 6), sombra=False)
        _assentar(g, 150, 150, props.caneca(props.VERMELHO[3], vapor=True), sombra=False)
        _assentar(g, 188, 150, props.caneca(props.NEUTRO[6]), sombra=False)
        _assentar(g, 166, 150, props.vaso_planta_baixa(20), sombra=False)
        _assentar(g, 214, 150, props.caneca(props.MADEIRA[4]), sombra=False)
        _assentar(g, 230, 150, props.garrafa_agua(15), sombra=False)
        _assentar(g, 242, 150, props.garrafa_agua(13), sombra=False)
    # sombra de contato do objeto interativo, no piso, onde o hotspot declara
    props.sombra_de_contato(g, 77, 189, 34)
    _assentar(g, 24, 226, props.bebedouro(46))

    _assentar(g, 350, 232, props.mesa_alta(30, 50))
    _assentar(g, 322, 232, props.banqueta(30))
    _assentar(g, 380, 230, props.banqueta(28))
    _assentar(g, 344, 182, props.caneca(props.MADEIRA[4]), sombra=False)
    if festa:
        _assentar(g, 360, 182, props.copos(2), sombra=False)
    _assentar(g, 430, 232, props.sofa_pequeno(62, 34))
    _assentar(g, 472, 250, props.vaso_planta_alta(64))

    if festa:
        # DECORAÇÃO, toda na metade de CIMA da imagem. Isto não é economia de
        # esforço: é o que mantém a faixa de piso desta cena idêntica à da fase 2,
        # e a fase 6 põe seis figuras neste piso. Bandeirola, cordão de lâmpada e
        # balão são pendurados — a versão de festa custa ZERO linha de chão.
        #
        # A ordem importa e é z-order: a bandeirola vem depois de toda a parede e
        # de todos os quadros porque ela está esticada NA FRENTE deles,
        # atravessando a sala. Desenhada antes, o cartaz e a janela passariam por
        # cima e o fio pareceria pintado no reboco.
        props.bandeirolas(g, 20, 15, 460, arcos=2)
        # Cordão de lâmpadas na única faixa de parede livre da cena: abaixo dos
        # quadros (que terminam em y≈96) e acima do lambri (que começa em 118).
        props.guirlanda_de_luzes(g, 6, 106, 474)
        # Balões em cacho de dois na esquerda e um solitário na direita. Cacho de
        # um lado, unidade do outro: simetria perfeita lê como enfeite de vitrine,
        # e 1px de assimetria já mata isso (bíblia §9).
        g.colar(4, 76, props.balao(30, props.LUZ[3]))
        g.colar(16, 86, props.balao(26, props.TELA[3]))
        g.colar(462, 72, props.balao(28, props.VERDE[3]))

    # --- FRENTE: encosto de cadeira de madeira e banqueta cortados pela borda.
    # Era um tampo de mesa de reunião, e o tampo em trapézio cortado no canto
    # inferior direito lia como uma RAMPA subindo para fora da tela — a aresta
    # diagonal do trapézio é a culpada. Encosto é retangular e não mente.
    _assentar(g, 400, 284, _encosto_de_primeiro_plano(150, 52, props.MADEIRA), sombra=False)
    _escurecer(g, 322, 232, 158, 38, 2)
    _aresta_de_luz(g, 322, 232, 158, 12, 2)
    _assentar(g, 44, 282, props.banqueta(46), sombra=False)
    _escurecer(g, 28, 236, 34, 34, 1)
    refinamentos.decorar(g, 'cafezinho-festa' if festa else 'cafezinho', int(gesto))
    _vinheta(g)
    return g


# ----------------------------------------------------------------- cena 3/6


def sala_treinamento() -> Grade:
    """Cadeiras em fila, projetor com feixe, quadro branco, luz baixa.

    "Luz mais baixa" não se faz escurecendo tudo — em vídeo comprimido isso vira
    um borrão cinza. Faz-se tirando a luz de teto e deixando o FEIXE do projetor
    e a fresta da porta como as duas únicas fontes. A sala fica escura por
    contraste, não por falta de valor.
    """
    hz = HZ_TREINAMENTO
    g = Grade(LARGURA, ALTURA, "3")

    props.parede_pintada(g, 0, hz, "4332")
    props.forro_de_teto(g, 0, 14)
    g.colar(238, 14, props.projetor(26, 13))
    _assentar(g, 404, hz + 2, props.pilar(20, 140), sombra=False)
    g.colar(268, 32, props.grelha_de_ar(26, 14))

    tela = _tela_de_projecao(142, 84)
    g.colar(54, 22, tela)
    _feixe_de_projetor(g, 236, 26, 198, 24, 104)
    g.colar(324, 44, props.quadro_branco(56, 36))
    g.colar(20, 40, props.cartaz(24, 30, acento=props.VERDE[3]))
    props.rodape(g, hz)

    props.piso_em_bandas(g, hz, ALTURA, "5443")
    # 22 manchas e não 14: a banda do fundo deste piso tem 46 linhas e é a mais
    # escura das seis cenas, então é a que menos ganha quebra das outras camadas.
    # Com 14 sobrava um chapado de exatamente 40x40 px, encostado no limite do
    # checklist §4.5 — encostar no limite é passar nele na próxima mudança.
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=22, semente=57)

    # porta aberta à direita: a fonte de luz quente da cena, com a cunha no piso
    _assentar(g, 446, hz, props.porta(38, 94, aberta=True), sombra=False)
    # Cunha e não elipse: o vão tem 15px de largura e 94 de altura, então o que
    # ele projeta abre a partir da soleira. A elipse de antes ficava centrada a
    # 20px da porta e fazia a luz parecer vir do meio da sala.
    props.poca_de_porta(
        g, 444, 156, 16, 34, deriva=-14, quente="x", passos=2
    )
    _halo(g, 418, 118, 22, 32)

    # fila de cadeiras ao fundo. A vermelha é o acento único da cena. A terceira
    # saiu de x=182 para x=168 porque `conclusao-trilha` (item, ancorado pelo
    # centro) ocupa x 190..214 / y 128..152 e a cadeira invadia a coluna 190.
    for i, cx in enumerate((62, 122, 168, 242, 302, 362)):
        ramp = props.VERMELHO if cx == 242 else props.AZUL
        _assentar(g, cx, 172 + (i % 2), props.cadeira_escritorio(ramp, perfil=i % 3 == 2))

    _assentar(g, 48, 180, props.armario_baixo(60, 30, props.MADEIRA))
    _assentar(g, 34, 150, props.vaso_planta_baixa(22), sombra=False)
    _assentar(g, 64, 150, props.pilha_de_papel(13, 8), sombra=False)

    # --- mesa longa. Tampo 172..204; x 124..164 fica VAZIO para
    # `notebook-trilha`, cuja base o conteúdo declara em y=194.
    _assentar(g, 199, 216, props.mesa_de_reuniao(214, 44))
    _assentar(g, 262, 180, props.caneca(props.MADEIRA[4], vapor=True), sombra=False)
    _assentar(g, 286, 178, props.garrafa_agua(14), sombra=False)
    _assentar(g, 108, 182, props.pilha_de_papel(12, 7), sombra=False)
    props.sombra_de_contato(g, 144, 194, 44)  # sombra do objeto interativo

    # --- FRENTE: dois encostos cortados pela borda inferior
    _assentar(g, 112, 278, _encosto_de_primeiro_plano(96, 48), sombra=False)
    _escurecer(g, 62, 230, 102, 40, 2)
    _aresta_de_luz(g, 62, 230, 102, 12, 2)
    _assentar(g, 322, 282, _encosto_de_primeiro_plano(108, 50), sombra=False)
    _escurecer(g, 266, 232, 114, 38, 2)
    _aresta_de_luz(g, 266, 232, 114, 12, 2)
    _vinheta(g)
    return g


# ----------------------------------------------------------------- cena 4/6


def laboratorio() -> Grade:
    """Rack, LED, ciano dominante, bancada metálica, cabos.

    Ciano "dominante" sem virar circo: a ÁREA continua neutra e azul; o que
    domina é o BRILHO. Quarenta LEDs de 1px e duas telas acesas mandam na
    atenção sem passar de ~8% da área pintada de ciano.

    A bancada usa a rampa neutra CURTA (`NEUTRO[:5]`) e não a inteira. Com a
    rampa inteira o tom médio cai em `5`, que é claro, e a bancada saiu como um
    bloco branco-azulado de 190x60 no meio da sala — o objeto mais claro de uma
    cena que deveria ser a mais escura do jogo.
    """
    hz = HZ_LABORATORIO
    g = Grade(LARGURA, ALTURA, "2")

    props.parede_pintada(g, 0, hz, "4322")
    props.forro_de_teto(g, 0, 14)
    props.duto(g, 20, altura=8)
    # Segundo duto, na altura dos olhos, e dois cabos descendo dele. Não é
    # enfeite: a parede desta cena usa `"4322"`, ou seja duas bandas `2` coladas,
    # o que dá 75 linhas de tom único — e sobrava um chapado de 46x46 px entre os
    # racks e a janela da sala de servidores, o maior das seis cenas depois das
    # correções de textura. Mancha de sujeira não resolve área desse tamanho;
    # resolve ARESTA (bíblia decisão 4), e num laboratório a aresta que pertence
    # ao lugar é conduíte. Termina em x=190 para não invadir a janela da sala de
    # servidores, e passa ACIMA do retângulo reservado do `monitor` (y 112..148).
    # Em y=104 e não em y=100: com o conduíte 4px mais alto, o vão entre ele e o
    # rodapé ficava com 41 linhas de tom único e esse vão cai DENTRO do retângulo
    # reservado, onde não se pode desenhar cenário. Descer o conduíte 4px encosta
    # ele na borda do retângulo e resolve pelo lado de fora: 28 linhas acima, 38
    # abaixo, nenhuma das duas passando do limite de ~40 da bíblia §4.5.
    props.duto(g, 104, x0=64, x1=190, altura=6)
    # O conduíte DESVIA da janela da sala de servidores (x 192..284) e volta do
    # outro lado numa altura maior — que é como conduíte se comporta de verdade
    # quando encontra uma abertura, e de quebra quebra o chapado de 42x42 px que
    # sobrava entre a janela e o retângulo reservado do `quadro-branco`. Entra
    # antes do pilar, da placa e do painel de patch, que são colados depois e
    # passam por cima dele.
    props.duto(g, 80, x0=286, x1=LARGURA, altura=6)
    props.cabo(g, [(166, 110), (171, 126), (168, 141), (165, 148)], "1")
    props.cabo(g, [(176, 110), (180, 128), (184, 148)], "2")
    # Cabo descendo do conduíte até o rodapé em x 98..100, RENTE à borda esquerda
    # do retângulo reservado do `monitor` (x 101..149) e fora dele. É o que sobrou
    # do chapado daquele trecho: o vão entre o conduíte novo e o rodapé tem 41
    # linhas e quase todo ele fica atrás do sprite do monitor, então textura ali
    # seria trabalho invisível — e desenhar cenário DENTRO do retângulo é o que
    # produz fantasma duplo quando o sprite entra por cima. Um cabo colado na
    # borda externa quebra a coluna, aparece em cena e não invade nada.
    props.cabo(g, [(100, 109), (98, 129), (100, 148)], "1")
    props.cabo(g, [(0, 32), (120, 34), (260, 33), (420, 35), (479, 34)], "1")
    props.cabo(g, [(0, 36), (150, 38), (300, 37), (479, 39)], "2")
    # DOIS RETÂNGULOS RESERVADOS (de `bloco3.ts`, ancorados pelo centro):
    #   x 101..149, y 112..148  `monitor` do log
    #   x 290..362, y  89..137  `quadro-branco`
    # A fileira de racks perdeu o terceiro (estava em x 83..117, dentro do
    # primeiro retângulo), o extintor desceu para x 84..96 e o pilar subiu para
    # x=378 — estava em 320..340, no meio do segundo retângulo.
    _assentar(g, 378, hz + 2, props.pilar(20, 136, props.NEUTRO[:5]), sombra=False)
    g.colar(434, 50, props.placa_sinalizacao(16, 10))
    g.colar(298, 46, props.grelha_de_ar(24, 13))
    # painel de patch na parede alta da direita e cabo descendo dele
    g.colar(396, 46, props.rack_servidor(32, 38, leds=True))
    props.cabo(g, [(410, 86), (413, 110), (404, 136), (398, 148)], "1")
    # Janela para a sala de servidores ao lado. Enche a parede alta do centro
    # (era um vazio escuro de 150x80) e ao mesmo tempo JUSTIFICA o ciano
    # dominante: parte do brilho da cena vem de outra sala, não de lâmpada.
    g.retangulo(194, 52, 88, 44, "1")
    for i, rx in enumerate((198, 218, 238, 258)):
        g.retangulo(rx, 58, 15, 36, "2")
        g.linha_v(rx, 58, 36, "3")
        g.linha_v(rx + 14, 58, 36, "1")
        for ly in range(61, 92, 5):
            g.ponto(rx + 11, ly, props.TELA[3] if (i + ly) % 3 else props.TELA[1])
            g.ponto(rx + 3, ly + 2, props.TELA[1])
    for k in range(22):  # dois reflexos diagonais: é o que faz ler como vidro
        g.ponto(198 + k, 53 + k, "4")
        g.ponto(228 + k, 53 + k, "3")
    g.moldura(192, 50, 92, 48, "4")
    g.linha_h(192, 50, 92, "6")
    g.linha_h(192, 97, 92, "1")
    props.rodape(g, hz, tom="1")

    props.piso_ladrilhado(g, hz, ALTURA, "5443", cx=240)
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=12, semente=131)

    # fileira de racks à esquerda, um à direita. Só LED ciano/verde: LED
    # vermelho em quantidade roubaria o acento vermelho do extintor.
    for cx in (26, 62):
        _assentar(g, cx, 158, props.rack_servidor(34, 86))
    _assentar(g, 465, 158, props.rack_servidor(34, 86))
    _assentar(g, 62, 72, props.vaso_planta_baixa(20), sombra=False)  # planta esquecida
    g.colar(84, 96, props.extintor(24))  # ACENTO VERMELHO, único
    props.cabo(g, [(79, 110), (88, 126), (95, 142), (99, 148)], "1")
    props.cabo(g, [(79, 116), (90, 134), (97, 148)], "2")

    # --- bancada metálica. Tampo em y=148 porque é ali que a base do `monitor`
    # cai: o conteúdo ancora ele pelo CENTRO em (125,130) e ele tem 36px de
    # altura, então ocupa y 112..148. Com o tampo em 132 (a versão anterior) o
    # monitor ficaria enterrado 16px na frente da bancada.
    # x 100..152 do tampo fica VAZIO.
    _assentar(g, 195, 192, props.bancada(190, 44, props.NEUTRO[:5]))
    _assentar(g, 248, 148, props.monitor(38, 30, "dash"), sombra=False)
    _assentar(g, 280, 148, props.luminaria_de_mesa(), sombra=False)
    props.poca_de_luz(g, 276, 146, 22, 4, quente="q")
    # E a poça correspondente NO CHÃO. O checklist §4.5 pede "fonte de luz
    # quente com poça no chão" e esta cena tinha a poça só no tampo da bancada —
    # luz sem consequência no piso lê como adesivo, e no laboratório, que é a
    # cena mais escura, é a única mancha quente que o piso recebe.
    # Elipse é a forma certa aqui (a fonte é a luminária de bancada, pontual),
    # mas ESTREITA e fraca: a bancada fica na frente da lâmpada e corta a luz.
    # Antes era 44x16 com passos=1, praticamente a mesma elipse da janela do
    # escritório — o tamanho também é informação. Salpico em `z` e não no `r`
    # padrão: `r` é madeira, e o mapa de chão lê madeira como móvel.
    props.poca_de_luz(g, 272, 208, 29, 10, passos=1, quente="z")
    props.reflexo_de_tela(g, 170, 151, 90, 3, props.TELA[1])
    _assentar(g, 200, 148, props.caneca(props.TELA[2]), sombra=False)
    _assentar(g, 216, 148, props.telefone(15, 8), sombra=False)
    _assentar(g, 130, 192, props.cadeira_escritorio(perfil=True))
    props.sombra_de_contato(g, 125, 148, 46)  # sombra do objeto interativo

    # cabos rodando junto ao rodapé, não cruzando a área de caminhada: cabo no
    # meio do piso vira arranhão e a plateia lê como defeito da imagem
    props.cabo(g, [(20, 156), (120, 158), (230, 157), (300, 159), (420, 157), (452, 152)], "1")
    props.cabo(g, [(120, 161), (240, 163), (400, 161)], "2")

    _assentar(g, 408, 210, props.vaso_planta_alta(58))
    # armário de bancada com caixas: enche o piso da direita, que na primeira
    # folha de contato era um vazio de 140x80 ao lado do rack
    _assentar(g, 352, 190, props.armario_baixo(60, 28, props.NEUTRO[:5]))
    _assentar(g, 338, 162, props.caixa_papelao(24, 20), sombra=False)
    _assentar(g, 364, 162, props.caixa_papelao(18, 16), sombra=False)

    # --- FRENTE: canto de bancada cortado pela borda + caixa aberta
    _assentar(g, 44, 288, props.bancada(140, 58, props.NEUTRO[:5]), sombra=False)
    _escurecer(g, 0, 230, 118, 40, 2)
    _aresta_de_luz(g, 0, 230, 118, 12, 2)
    _assentar(g, 442, 280, props.caixa_papelao(46, 42, aberta=True), sombra=False)
    _escurecer(g, 416, 236, 64, 34, 1)
    _vinheta(g)
    return g


# ----------------------------------------------------------------- cena 5/6


def innovation() -> Grade:
    """Protótipo, post-it colorido, desarrumado e vivo. A energia oposta ao lab.

    "Mais vivo" aqui é literal: é a cena com mais verde, mais amarelo e mais
    coisa fora do lugar. Mas o acento vermelho continua sendo UM (a poltrona) e
    o roxo continua fora — roxo é reservado à revelação e gastá-lo antes mata o
    clímax (bíblia §3).
    """
    hz = HZ_INNOVATION
    g = Grade(LARGURA, ALTURA, "5")

    props.parede_pintada(g, 0, 122, "7665")
    # faixa de ripado de madeira na meia-parede: é o que dá o ar de "espaço
    # aberto reformado" em vez de sala de escritório. Antes ela ia de 104 a 158
    # com ripa a cada 9px e ocupava 480x54 — lia como CERCA DE TÁBUAS atrás de
    # tudo. Mais baixa e com ripa a cada 15px, volta a ser revestimento.
    g.retangulo(0, 122, LARGURA, hz - 122, props.MADEIRA[2])
    g.dither(0, 122, LARGURA, hz - 122, props.MADEIRA[2], props.MADEIRA[1], "esparso")
    for x in range(0, LARGURA, 15):
        g.linha_v(x, 124, hz - 126, props.MADEIRA[0])
        g.linha_v(x + 1, 124, hz - 126, props.MADEIRA[3])
    g.linha_h(0, 120, LARGURA, props.MADEIRA[4])
    g.linha_h(0, 121, LARGURA, props.MADEIRA[0])
    props.forro_de_teto(g, 0, 16, passo=34)

    # RETÂNGULO RESERVADO (de `bloco3.ts`, ancorado pelo centro):
    #   x 219..299, y 64..120  `mural` de post-its
    # As três lâmpadas pendentes saíram de 140/250/360 para 120/200/340: a do
    # meio ficava dentro do retângulo e o HALO dela apareceria vazando em volta
    # do mural como um brilho sem fonte. Os painéis de post-it da CENA também
    # recuaram — um deles encostava na lâmpada da esquerda.
    for cx in (120, 200, 340):
        _assentar(g, cx, 54, props.luminaria_pendente(32), sombra=False)
        _halo(g, cx, 68, 17, 15)

    g.colar(30, 34, props.painel_de_post_its(62, 58, com_fundo=False))
    g.colar(148, 44, props.painel_de_post_its(38, 44, com_fundo=False))
    g.colar(404, 44, props.cartaz(26, 32, acento=props.VERDE[3]))
    g.colar(436, 50, props.relogio_de_parede(6))
    props.rodape(g, hz, tom=props.MADEIRA[0])

    props.piso_em_bandas(g, hz, ALTURA, "6654")
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=16, semente=311)
    # piso claro (`6`): poça de um passo só. Com dois, `6` sobe para `8`, que é
    # quase branco, e a poça lê como um buraco de luz no carpete.
    # As duas manchas ficam SOB duas das três pendentes (x=200 e x=340) e em
    # tamanhos diferentes. Antes ficavam em 250 e 140, que não correspondiam a
    # lâmpada nenhuma — luz cuja fonte não está acima dela lê como sujeira clara no
    # chão. A terceira pendente (x=120) não ganha mancha de piso porque debaixo
    # dela está o carrinho do dashboard: a luz dela cai no tampo do carrinho, e é
    # por isso que ele tem realce de tela em cima. Poça escondida atrás de um móvel
    # custa o mesmo que uma visível e não pinta um pixel.
    # Salpico em `z` e não no `r` padrão, pelo mesmo motivo da poça do escritório:
    # `r` é madeira e o mapa de chão lê madeira como móvel.
    props.poca_de_luz(g, 200, 224, 46, 14, passos=1, quente="z")
    props.poca_de_luz(g, 344, 212, 30, 11, passos=1, quente="z")

    # quadro branco com rodinhas à esquerda
    g.colar(18, 122, props.quadro_branco(70, 46))
    for px in (28, 80):
        g.linha_v(px, 168, 32, "3")
        g.linha_v(px + 1, 168, 32, "5")
        g.retangulo(px - 2, 198, 6, 3, "2")
    g.linha_h(26, 170, 56, "3")
    props.sombra_de_contato(g, 54, 201, 62)

    # carrinho com dashboard: a tela ligada da cena. Rampa neutra CURTA, senão
    # o tom médio cai em `5` e o carrinho fica o objeto mais claro da cena.
    _assentar(g, 118, 228, props.armario_baixo(50, 26, props.NEUTRO[:6]))
    _assentar(g, 118, 202, props.monitor(44, 34, "dash"), sombra=False)
    props.reflexo_de_tela(g, 96, 205, 46, 3, props.TELA[1])

    # --- bancada do protótipo. Tampo em y=176.
    _assentar(g, 220, 216, props.mesa_de_trabalho(140, 40, props.MADEIRA))
    _assentar(g, 168, 176, props.caixa_papelao(24, 20, aberta=True), sombra=False)
    _assentar(g, 230, 176, _prototipo(), sombra=False)
    _assentar(g, 266, 176, props.pilha_de_papel(14, 8), sombra=False)
    _assentar(g, 284, 176, props.garrafa_agua(14), sombra=False)

    _assentar(g, 300, 232, props.mesa_alta(30, 52))
    _assentar(g, 336, 230, props.banqueta(28))
    _assentar(g, 296, 180, props.caneca(props.MADEIRA[4], vapor=True), sombra=False)
    # ACENTO VERMELHO, único: a poltrona
    _assentar(g, 438, 226, props.sofa_pequeno(56, 32, props.VERMELHO))
    _assentar(g, 470, 242, props.vaso_planta_alta(62))
    _assentar(g, 386, 214, props.vaso_planta_baixa(22))
    _assentar(g, 356, 198, props.pilha_de_papel(12, 5), sombra=False)  # papel no chão

    # --- FRENTE: caixa aberta + encosto de madeira cortados pela borda
    _assentar(g, 56, 278, props.caixa_papelao(48, 44, aberta=True), sombra=False)
    _escurecer(g, 30, 232, 54, 38, 2)
    _aresta_de_luz(g, 30, 232, 54, 12, 2)
    _assentar(g, 392, 286, _encosto_de_primeiro_plano(146, 54, props.MADEIRA), sombra=False)
    _escurecer(g, 316, 230, 164, 40, 2)
    _aresta_de_luz(g, 316, 230, 164, 12, 2)
    _vinheta(g)
    return g


def _prototipo() -> Grade:
    """O protótipo do Innovation: caixa com LED, antena e um fio solto.

    Deliberadamente meio feio e assimétrico. Protótipo simétrico e limpo lê como
    produto de catálogo, e a cena inteira existe para dizer "isso aqui está
    sendo feito agora".
    """
    g = Grade(26, 22)
    g.caixa_com_volume(2, 8, 20, 14, props.NEUTRO)
    g.dither(3, 9, 18, 12, props.NEUTRO[3], props.NEUTRO[2], "esparso")
    g.retangulo(5, 11, 11, 5, props.TELA[0])
    g.dither(6, 12, 9, 3, props.TELA[0], props.TELA[3], "xadrez")
    for i in range(3):
        g.ponto(18, 12 + i * 2, props.TELA[4] if i == 1 else props.VERDE[4])
    g.linha_v(8, 2, 6, "3")  # antena torta
    g.ponto(9, 1, "5")
    props.cabo(g, [(22, 18), (25, 14), (23, 10)], "1")
    return g


# --------------------------------------------------- cena nova: fase 3 (v2)


def linha_producao(*, quadro: int = 0) -> Grade:
    """Linha de montagem de rádios de telecom, com robôs — e UMA etapa diferente.

    Substitui o Laboratório (ADR-009). O tema da fase é PROTAGONISMO: a
    estagiária vê algo que pode ser otimizado e age sem ninguém pedir. O cenário
    tem de deixar isso visível, porque "log com timeout" exigia vocabulário e uma
    esteira em que um passo é mais lento que os outros não exige nada.

    COMO A CENA APONTA SOZINHA PARA A OPORTUNIDADE
    Nenhum texto, nenhuma seta. Cinco sinais empilhados no MESMO lugar da
    imagem, e cada um deles funciona isolado:

    1. **Repetição quebrada.** Três cabines de processo idênticas, em fila, no
       mesmo tom, na mesma altura. A quarta etapa não tem cabine — tem uma
       banqueta vazia e uma prancheta. Três iguais criam a expectativa; a
       exceção só existe porque a repetição existe.
    2. **Transporte mais velho.** O trecho dela é de ROLETES, não de lona:
       transporte por gravidade contra transporte motorizado. A textura do tampo
       muda de traço fino e regular para barra grossa e espaçada, e isso lê de
       longe.
    3. **Fila.** Sete rádios acumulados em duas camadas, encostados um no outro,
       ANTES do trecho de roletes. Engarrafamento é a imagem universal de
       gargalo.
    4. **O único vermelho da cena** está na torre de sinalização dessa etapa, em
       alerta. A bíblia §3 dá um acento vermelho por cena e ele foi gasto aqui de
       propósito: o olho vai primeiro ao vermelho, e o vermelho está no problema.
    5. **A única luz quente da cena** é a campânula em cima dela, com a poça no
       chão. As outras três lâmpadas são frias. Uma lâmpada de cor diferente no
       meio de quatro iguais é a coisa mais barata que existe para dizer "olhe
       aqui".

    MAQUINÁRIO EM AZUL, E ISSO É TÉCNICO
    `exportar_chao.py` reconhece piso pelo char: neutro e luz são piso, madeira é
    móvel. Esteira e cabine desenhadas em neutro entrariam no mapa de chão como
    piso, e `Cena.chao.test.ts` passaria a AUTORIZAR uma figura em pé sobre a
    esteira — o defeito mais caro deste projeto, com outra fantasia. Tudo que é
    máquina aqui usa a rampa azul, que não pertence a nenhum dos dois conjuntos.

    GEOMETRIA DE PISO
    A esteira ocupa y 140..169 e é o único móvel que cruza a faixa de caminhada;
    abaixo dela sobram 62 linhas de piso livre (170..231) em toda a largura. Isso
    põe a `parada` válida entre 63% e 85% da altura do canvas. O terço da direita
    (x>456) e as pontas não têm esteira e liberam de 148 a 231.
    """
    hz = HZ_LINHA_PRODUCAO
    g = Grade(LARGURA, ALTURA, "3")

    # --- FUNDO: galpão. Treliça no lugar do forro modular, que é o que troca o
    # tipo de EDIFÍCIO sem mudar nada embaixo.
    props.parede_pintada(g, 0, hz, "4332")
    props.trelica_de_teto(g, 0, altura=18, passo=64)
    # Passarela só na metade esquerda: atravessando os 480 ela viraria uma segunda
    # treliça e a parede alta perderia o contraste entre um lado ocupado e outro
    # vazio, que é o que dá assimetria à composição.
    props.passarela(g, 26, x0=0, x1=286)
    props.duto(g, 64, x0=286, x1=LARGURA, altura=7)
    props.duto(g, 96, x0=0, x1=200, altura=6)

    # Portão de enrolar na parede da direita: a linha ENTRA nele. É o que dá
    # destino ao fluxo — uma esteira que morre no meio da parede lê como maquete.
    _assentar(g, 456, hz, props.portao_industrial(58, 92, aberto=True), sombra=False)

    # parede povoada em três alturas (decisão 4 do topo do arquivo)
    _assentar(g, 300, hz + 2, props.pilar(20, 138, props.NEUTRO[:5]), sombra=False)

    # Quatro campânulas, e a de x=338 é a ÚNICA quente — ela fica sobre a etapa
    # manual e é a fonte de luz quente que o checklist §4.5 exige.
    # Coladas ANTES dos quadros de parede de propósito: `_halo` aclara o char que
    # encontra, então um halo pintado depois lavaria a tela do painel de produção
    # que estivesse embaixo dele. Luz de ambiente vem antes do objeto.
    for cx, quente in ((92, False), (176, False), (258, False), (338, True)):
        _assentar(g, cx, 58, props.luminaria_industrial(22, quente=quente), sombra=False)
        _halo(g, cx, 74, 20, 15)

    # A área 120..168 × 64..100 fica reservada ao hotspot `b3-monitor`, que
    # recebe o painel industrial nesta mesma posição, sem segundo quadro atrás.
    # Painéis elétricos no lugar do cartaz que estava aqui. O cartaz era um
    # retângulo quase branco de 26x34 colado exatamente acima da campânula quente,
    # e na imagem ele era o objeto MAIS CLARO da parede: roubava o olho justo do
    # ponto que a cena existe para apontar. Painel elétrico é escuro, tem LED
    # ciano e pertence a um galpão — enche a parede sem disputar atenção.
    g.colar(216, 66, props.rack_servidor(30, 36, leds=True))
    g.colar(392, 64, props.rack_servidor(28, 34, leds=True))
    g.colar(262, 70, props.placa_sinalizacao(20, 12))
    g.colar(352, 68, props.grelha_de_ar(24, 13))
    g.colar(430, 38, props.relogio_de_parede(7))
    # Conduíte na metade direita, abaixo dos painéis, com os cabos descendo dos
    # dois painéis até ele. A metade direita da parede alta era o maior trecho
    # liso da cena depois das correções, e o que resolve trecho liso é ARESTA.
    props.duto(g, 106, x0=286, x1=LARGURA, altura=6)
    props.cabo(g, [(224, 102), (228, 118), (226, 132), (224, hz - 3)], "1")
    props.cabo(g, [(236, 102), (240, 120), (238, hz - 3)], "2")
    props.cabo(g, [(398, 98), (402, 104), (400, 106)], "1")
    props.cabo(g, [(412, 98), (408, 103), (410, 106)], "2")
    props.cabo(g, [(290, 118), (340, 120), (400, 119), (479, 121)], "1")
    props.rodape(g, hz, tom="1")

    # --- CHÃO: concreto claro. Piso é o plano CLARO do sanduíche de valor
    # (decisão 2), e aqui ele precisa ser claro mesmo: a parede de galpão é a mais
    # escura das cenas e a figura anda na frente dela.
    #
    # Ladrilhado e não em bandas lisas, e isso saiu de olhar a imagem: entre a
    # faixa de segurança e o plano de frente sobravam 480x46 px de piso quase sem
    # variação, muito acima do limite de ~40x40 do checklist §4.5. Não dá para
    # resolver com prop — aquela faixa é justamente a de caminhada e tem de ficar
    # livre. Junta serrada de laje de concreto resolve com ARESTA, pertence ao
    # lugar e não ocupa um pixel de piso: `piso_ladrilhado` continua pintando char
    # neutro, então o mapa de chão não vê diferença.
    props.piso_ladrilhado(g, hz, ALTURA, "6554", cx=240)
    # Duas passadas de mancha, uma escura e uma clara, como `parede_pintada` faz.
    # Com uma só sobravam vãos lisos maiores que a janela de 40x40 do checklist.
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=20, semente=733)
    props.manchas(g, 0, hz + 6, LARGURA, ALTURA, quantidade=12, semente=947, claras=True)
    # Faixa de segurança pintada rente à linha: quebra a maior área plana da cena
    # (o piso) com duas arestas horizontais, e é identidade de fábrica de graça.
    props.faixa_de_seguranca(g, 176, x0=0, x1=LARGURA)
    # A poça da campânula quente, e a única mancha quente do piso.
    props.poca_de_luz(g, 338, 202, 40, 14, quente="z", passos=2)
    # Cunha de piso claro entrando pelo portão: é ela que faz o vão do portão ler
    # como profundidade em vez de retângulo preto. Fraca, porque o galpão vizinho
    # é mais escuro que esta sala e a luz vem de cá para lá.
    props.poca_de_porta(g, 456, hz, 20, 26, deriva=-16, quente=None, passos=1)

    # --- MEIO: a linha. Três trechos, colados em sequência, mesma base.
    # A ordem é da esquerda para a direita porque é a ordem em que a plateia lê, e
    # a etapa quebrada tem de vir DEPOIS das três iguais.
    #
    # O TRECHO DO MEIO É DE MADEIRA/FERRUGEM, e é a correção mais importante que
    # olhar a imagem produziu. Com os três trechos em azul, a diferença entre lona
    # e rolete não sobrevivia à escala: 84px de textura diferente no meio de 400
    # simplesmente não aparecia, e a fase 3 inteira depende de a plateia notar
    # aquela etapa. Trocar a FAMÍLIA de cor muda a silhueta em valor e em hue ao
    # mesmo tempo, e "esta parte é mais velha que o resto" passa a ser a primeira
    # coisa que se lê na linha.
    g.colar(48, 140, props.esteira(248, 30))
    g.colar(296, 140, props.esteira(84, 30, roletes=True, ramp=props.MADEIRA))
    g.colar(380, 140, props.esteira(76, 30))
    props.sombra_de_contato(g, 252, 170, 416, altura=2, forca=1)

    # três cabines automáticas, iguais de propósito
    for cx in (92, 176, 258):
        _assentar(g, cx, 142, props.celula_de_processo(52, 40), sombra=False)
    # Os braços são camadas próprias: a UI alterna duas poses sem redesenhar a
    # cena inteira, e a base permanece fixa sobre a linha.

    # As unidades em movimento também são camadas próprias para que sua posição
    # tenha uma única fonte de verdade. A fila parada do gargalo segue pintada.
    # ...e a FILA no trecho de roletes: seis encostados em duas camadas, um deles
    # ainda aberto. Engarrafamento é a imagem universal de gargalo.
    for x in (302, 315, 328, 341, 354, 367):
        _assentar(g, x, 145, props.radio_de_telecom(12, 20, montado=x != 328), sombra=False)
    for x in (309, 322, 335, 348):
        _assentar(g, x, 126, props.radio_de_telecom(12, 19), sombra=False)
    # depois da etapa manual a lona volta a ter espaço sobrando: o gargalo é ali
    _assentar(g, 402, 145, props.radio_de_telecom(12, 20), sombra=False)
    _assentar(g, 442, 145, props.radio_de_telecom(12, 20), sombra=False)

    # O POSTO MANUAL. Nenhuma cabine, nenhum robô: luminária de bancada presa à
    # esteira, prancheta na lona, banqueta vazia e caixa de peças no chão. A
    # ausência é o desenho — e a luminária de MESA no meio de uma linha de
    # campânulas de galpão é a escala humana entrando onde não devia haver.
    _assentar(g, 288, 141, props.luminaria_de_mesa(), sombra=False)
    _assentar(g, 378, 138, props.pilha_de_papel(16, 9), sombra=False)
    # Base em 190 e 188, e não em 200: prop de piso ENCOSTADO na linha em vez de
    # avançado para o meio da sala. A diferença é de dez pixels de arte e de dez
    # linhas de faixa de piso, e a faixa de piso é o que outra frente vai usar
    # para escolher onde a Ana para. Contar essas linhas é mais barato do que
    # descobrir na prévia que a figura está em cima da banqueta.
    _assentar(g, 352, 190, props.banqueta(34))
    _assentar(g, 292, 188, props.caixa_papelao(24, 20, aberta=True))
    # ACENTO VERMELHO da cena, e o único: a torre em alerta desta etapa.
    _assentar(g, 388, 142, props.torre_de_sinalizacao(26, alerta=True), sombra=False)
    # ...e as duas torres em verde das etapas que vão bem, para que o vermelho
    # tenha com o que ser comparado. Um alerta isolado é decoração; um alerta no
    # meio de dois "ok" é informação.
    _assentar(g, 132, 142, props.torre_de_sinalizacao(22), sombra=False)
    _assentar(g, 214, 142, props.torre_de_sinalizacao(22), sombra=False)

    # canto esquerdo: armário de ferramentas, tela de apontamento e A PLANTA
    _assentar(g, 28, 178, props.armario_baixo(54, 30, props.AZUL))
    _assentar(g, 14, 148, props.vaso_planta_baixa(22), sombra=False)
    _assentar(g, 44, 148, props.monitor(32, 26, "dash"), sombra=False)
    props.reflexo_de_tela(g, 14, 151, 44, 3, props.TELA[1])

    # piso da direita: carrinho e paletes com caixa, encostados na linha e no
    # extremo (x>410) para não comer coluna de parada
    _assentar(g, 424, 192, props.carrinho_de_carga(36, 26))
    _assentar(g, 424, 175, props.radio_de_telecom(12, 20), sombra=False)
    _assentar(g, 470, 190, props.palete(34, camadas=2))

    # --- FRENTE: paletes empilhados e caixa aberta à esquerda, carcaça de
    # máquina cortada no canto direito. Os dois cortados pela borda inferior.
    _assentar(g, 52, 272, props.palete(112, camadas=4), sombra=False)
    _assentar(g, 104, 268, props.caixa_papelao(46, 40, aberta=True), sombra=False)
    _escurecer(g, 0, 228, 152, 42, 2)
    _aresta_de_luz(g, 0, 228, 152, 12, 2)
    _assentar(g, 430, 288, props.celula_de_processo(132, 56, status="ok"), sombra=False)
    _escurecer(g, 364, 230, 116, 40, 2)
    _aresta_de_luz(g, 364, 230, 116, 12, 2)
    refinamentos.decorar(g, 'linha-producao', quadro)
    _vinheta(g)
    return g


# --------------------------------------------------- cena nova: fase 5 (v2)


def outra_area(*, quadro: int = 0) -> Grade:
    """Outra área da empresa: andar diferente, outro time, OUTRA LUZ (ADR-031).

    A fase 5 acontece aqui porque a Ana se deslocou para conversar com alguém de
    fora do time dela — e o deslocamento é o que diz que a conversa importava.

    ┌──────────────────────────────────────────────────────────────────────────┐
    │ REESCRITA NA v2.1 A PARTIR DE TRÊS DEFEITOS VISTOS NA TELA.              │
    │                                                                          │
    │ 1. **Lavada.** E a causa medida NÃO é falta de amplitude: a versão antiga │
    │    já ia de luma 26 a 203 (p5..p95), que é 70% da escala. O que fazia a  │
    │    cena ler como lavada era a ÁREA de claro, e ela estava concentrada    │
    │    numa banda só. Medido no PNG antigo, fração de pixels com luma > 140: │
    │                                                                          │
    │        y   0.. 26  teto .................. 24%                          │
    │        y  26.. 70  parede alta ........... 80%                          │
    │        y  70..105  parede ................ 67%  <- o problema           │
    │        y 105..144  altura de cabeça ...... 15%                          │
    │        y 144..232  piso .................. 69%                          │
    │        cena inteira ...................... 49%                          │
    │                                                                          │
    │    Ou seja: metade da imagem era quase-branca, e a faixa y 70..105 — a   │
    │    que fica logo ACIMA do mobiliário, atrás de ombro e de monitor — era  │
    │    2/3 clara. Repare que a faixa de CABEÇA já era escura (15%): o feltro │
    │    antigo cobria y 106..144, então o rosto já recortava. Este comentário │
    │    dizia o contrário na primeira redação e estava errado; corrigido      │
    │    depois de medir, porque documento errado propaga defeito mais rápido  │
    │    que código errado (bíblia §10).                                       │
    │                                                                          │
    │    A correção é levar o feltro de y=106 para y=70: aquela banda cai de   │
    │    67% para 20% de claro (luma média 148 -> 91) e a cena inteira cai de  │
    │    49% para 42%. A faixa alta (26..70) FICA clara de propósito — é ela   │
    │    que recebe o lanternim e justifica a luz de cima.                     │
    │ 2. **Não lia como escritório.** Lia como BIBLIOTECA: uma estante de      │
    │    lombadas coloridas na parede alta, um tampo de madeira de 196x28 px   │
    │    sem nada em cima (que lê como balcão de atendimento), um sofá de      │
    │    espera — e NENHUM posto de trabalho. Um monitor e um notebook fechado │
    │    em 480px de cena não fazem escritório.                                │
    │ 3. **Artefato no chão.** O `tapete` (x 100..236, y 194..224) saía como um│
    │    retângulo claro pontilhado no meio do piso. O motivo está escrito em  │
    │    `props.tapete`, que ficou fora de circulação por causa disto.         │
    └──────────────────────────────────────────────────────────────────────────┘

    O PROBLEMA REAL DESTA CENA NÃO É DESENHAR UM ESCRITÓRIO, É NÃO DESENHAR O
    ESCRITÓRIO DA FASE 1. O dono foi específico: *"é um escritório assim como a
    primeira fase, porém um visual diferente de escritório, pois é uma sala
    diferente na mesma empresa."* Ou seja: mesmos MÓVEIS (baia, monitor, cadeira
    de escritório), outro LUGAR. Trocar os móveis por móveis de outro tipo de
    sala é o que produziu a biblioteca. Onze coisas mudam, e nenhuma delas é
    "trocar mesa por estante":

    1. **A geometria da luz.** O Escritório recebe sol de uma janela LATERAL ao
       poente, e a mancha dele no piso é um quadrilátero INCLINADO encostado na
       parede da direita. Aqui não há janela para fora nenhuma: a luz natural
       cai de um lanternim no TETO, e a mancha é `inclinacao=0` — luz de cima
       não inclina. Geometria de mancha é a coisa que a plateia lê primeiro sem
       saber que está lendo.
    2. **A altura das divisórias.** Lá, cinco painéis de baia de 54-56px com
       tela espiando por cima — a imagem canônica de escritório de baias. Aqui
       só há biombo de bancada de 18px, que não esconde ninguém: mesmo móvel,
       outra altura, outro jeito de trabalhar. É o eixo que o dono pediu.
    3. **A densidade e o AGRUPAMENTO.** Lá são mesas individuais, cada uma com
       seu painel. Aqui são POSTOS COMPARTILHADOS: um bench de 196px com dois
       lugares dividindo o mesmo tampo, mais um posto solto à esquerda.
    4. **O material e o valor da parede.** Lá é parede pintada lisa de cima a
       baixo. Aqui a faixa alta (y 26..70) é clara — é ela que recebe o
       lanternim — e daí para baixo é FELTRO acústico azul-escuro até o rodapé,
       74 linhas. O feltro antigo começava em 106 e o trecho y 70..105 era 2/3
       claro; levá-lo a 70 tira 47 pontos percentuais de área clara justamente
       na banda que fica atrás de ombro e acima de monitor.
    5. **O teto.** Lá, 16 linhas de forro modular com duas calhas embutidas.
       Aqui, 26 linhas e um lanternim: pé-direito maior, que é o que se sente
       ao trocar de andar.
    6. **O piso.** Lá carpete em bandas lisas `6554`. Aqui piso duro `7665`
       LADRILHADO, com as juntas convergindo para um ponto de fuga — carpete
       não tem junta, e a junta é o que diz "outro andar" de longe.
    7. **A iluminação artificial.** Lá, calhas embutidas no forro. Aqui,
       pendentes sobre o bench e uma luminária de MESA no posto da esquerda.
    8. **A sala fechada.** Lá tudo é aberto. Aqui há uma divisória de piso a
       teto com a porta dentro dela, no canto esquerdo, com o vidro jateado em
       tom ESCURO (`tom_vidro="4"`): sala fechada sem luz acesa. Escolha de
       área clara, não de gosto — ver `props.divisoria_de_gabinete`.
    9. **Os armários de lockers.** Móvel de andar compartilhado, e o
       Escritório não tem nada parecido.
    10. **O conteúdo da parede.** Lá: cartaz, relógio, TV, placa, rack, janela
        de skyline. Aqui: quadro branco de time, mural de post-its, TV de
        indicadores. Nenhum dos três está na fase 1.
    11. **O primeiro plano.** Lá, painel de baia à esquerda e planta alta à
        direita. Aqui, a divisória de vidro jateado da sala de onde a cena é
        vista e o encosto de um sofá.

    TRÊS RETÂNGULOS RESERVADOS, e a arte não desenha nada dentro deles (objeto
    pintado no fundo + sprite por cima = fantasma duplo):

      x  76..115, y 115..143  `b5-caderno`, base em 143 — é por isso que o
                              tampo do posto da esquerda está em y=143 exato.
      x 317..365, y 109..145  `b5-grade`, ancorado pelo CENTRO. Ela encosta no
                              biombo do bench, o que é o certo para uma folha
                              impressa apoiada na mesa.
      x 173..249, y 105..189  faixa em que a Bianca fica em pé (pos 44%/70%).

    As duas sombras de contato dos objetos são pintadas no tampo, nas posições
    exatas que `bloco5.ts` declara: o PNG do objeto é transparente e a UI o põe
    sobre qualquer fundo, então ele não pode trazer sombra própria (bíblia §4.4).
    """
    hz = HZ_OUTRA_AREA
    g = Grade(LARGURA, ALTURA, "5")

    # --- FUNDO: teto alto com lanternim, faixa clara, feltro escuro até o chão
    props.forro_de_teto(g, 0, 26, passo=30)
    # Lanternim FORA DO CENTRO (cx=150 e não 240), e a razão é de iluminação, não
    # de composição: a mancha dele no piso tem de caber num trecho de piso livre
    # que não colida com as duas poças das pendentes. Centrado em 240, a mancha
    # do teto e a poça da pendente de x=250 se somavam no mesmo pedaço de chão e
    # o resultado era um borrão claro de 180px sem fonte identificável — duas
    # luzes empilhadas leem como uma luz errada.
    props.claraboia(g, 150, 2, 168, 20)
    props.parede_pintada(g, 26, 68, "76")
    # A MEIA-PAREDE VIROU PAREDE INTEIRA, e é a correção central do defeito 1.
    # O feltro ia de 106 a 144 (38 linhas) e ficava quase todo atrás de móvel;
    # agora desce de 70 até o rodapé (74 linhas), cobrindo TODA a faixa em que a
    # cabeça de uma figura cai nesta cena (y 62..142, conforme as paradas de
    # `bloco5.ts`). Ripa a cada 16px em vez de 11: numa faixa duas vezes mais
    # alta, junta a cada 11px vira veludo cotelê.
    props.parede_de_feltro(g, 70, hz, ripas=16)

    # Pendentes e halos ANTES dos quadros de parede, de propósito: `_halo` aclara
    # o char que encontra, então um halo pintado depois salpicaria luz em cima do
    # papel dos cartazes — erro já cometido na Sala de Reuniões e registrado lá.
    for cx, alt, base, rx, ry in ((250, 30, 62, 19, 14), (352, 26, 66, 17, 13)):
        _assentar(g, cx, base, props.luminaria_pendente(alt), sombra=False)
        _halo(g, cx, base + 18, rx, ry)

    # Sala fechada no canto esquerdo, com a porta DENTRO da divisória. O vidro
    # jateado vai em tom escuro (ver `props.divisoria_de_gabinete`): é a parede
    # contra a qual a Ana para em x 8%, e ela precisa ser escura para o rosto
    # dela recortar.
    _assentar(g, 24, hz, props.divisoria_de_gabinete(56, 100, tom_vidro="4"), sombra=False)
    _assentar(g, 24, hz, props.porta(30, 90), sombra=False)

    # parede povoada em três alturas (decisão 4 do topo do arquivo). Tudo entre
    # y=72 e y=112, acima do biombo do bench (112) e do tampo do posto (143).
    g.colar(48, 72, props.quadro_branco(64, 40))  # quadro do time
    g.colar(124, 74, props.tv_de_parede(44, 28, "dash"))  # a tela ligada da parede
    g.colar(180, 74, props.painel_de_post_its(42, 36))
    g.colar(232, 84, props.grelha_de_ar(26, 14))
    g.colar(276, 72, props.cartaz(26, 36, acento=props.VERDE[3]))
    g.colar(312, 78, props.cartaz(24, 30, acento=props.LUZ[3]))
    g.colar(372, 84, props.placa_sinalizacao(20, 12))
    _assentar(g, 448, hz, props.armario_de_lockers(68, 76), sombra=False)
    _assentar(g, 448, 68, props.vaso_planta_baixa(20), sombra=False)
    props.rodape(g, hz, tom=props.AZUL[0])

    # --- CHÃO: piso DURO e ladrilhado, com a mancha do lanternim sem inclinação
    props.piso_ladrilhado(g, hz, ALTURA, "7665", cx=240)
    # Duas passadas de mancha, uma escura e uma clara, como `parede_pintada` faz.
    # Este é o piso mais claro e mais exposto das cenas e com uma passada só
    # sobravam trechos lisos bem acima dos ~40x40 do checklist §4.5.
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=20, semente=577)
    props.manchas(g, 0, hz + 6, LARGURA, ALTURA, quantidade=13, semente=613, claras=True)
    # `inclinacao=0` e `barras=3` para casar com os três caibros do lanternim:
    # luz de cima não inclina, e a sombra dos caibros dentro da mancha é o que diz
    # que a fonte é a abertura do teto e não uma janela fora de quadro.
    props.poca_de_janela(
        g, 100, 182, 100, 48, inclinacao=0, barras=3, travessa=0, quente=None, passos=1
    )
    # As poças das pendentes, quentes, fora da mancha do lanternim (ver o
    # comentário do lanternim). Tamanhos diferentes: duas poças idênticas são o
    # carimbo que a revisão de janelas já pegou uma vez.
    props.poca_de_luz(g, 250, 204, 32, 12, quente="z", passos=1)
    props.poca_de_luz(g, 352, 198, 26, 10, quente="z", passos=1)

    # --- MEIO / POSTO DA ESQUERDA. Tampo em y=143 exato porque é ali que a base
    # do `b5-caderno` cai; x 76..115 do tampo fica VAZIO para ele.
    _assentar(g, 124, 177, props.mesa_de_trabalho(140, 34, props.MADEIRA))
    _assentar(g, 124, 143, props.divisoria_acustica(120, 18), sombra=False)
    # Luminária de MESA e não pendente: escala humana num posto solto, e é ela
    # que cumpre "fonte de luz quente com poça" no lado esquerdo da imagem, onde
    # as duas pendentes não alcançam.
    _assentar(g, 66, 143, props.luminaria_de_mesa(), sombra=False)
    props.poca_de_luz(g, 68, 141, 17, 3, quente="r")
    _assentar(g, 134, 143, props.monitor(32, 26, "log"), sombra=False)
    _assentar(g, 168, 143, props.monitor(28, 22, "grafico"), sombra=False)
    props.reflexo_de_tela(g, 120, 146, 64, 3, props.TELA[1])
    _assentar(g, 188, 143, props.caneca(props.NEUTRO[6]), sombra=False)
    props.sombra_de_contato(g, 96, 143, 44)  # sombra do `b5-caderno`
    _assentar(g, 100, 194, props.cadeira_escritorio(props.AZUL))

    # --- MEIO / BENCH COMPARTILHADO. Tampo 130..157, aresta 158..161,
    # pés 162..169 — base em 170, que deixa 61 linhas de piso livre embaixo.
    #
    # O TAMPO CONTINUA SENDO O MESMO PROP E A MESMA BASE DE ANTES, de propósito:
    # as coordenadas de `bloco5.ts` foram medidas contra esta geometria. O que
    # mudou é o que está EM CIMA dele. Um tampo de 196x28 com um monitor e um
    # notebook fechado lê como balcão; o mesmo tampo com dois biombos de
    # bancada, três monitores e duas cadeiras lê como dois postos de trabalho —
    # e "posto de trabalho de verdade" era o que faltava.
    # Posto sentado substitui a pessoa em pé atrás da divisória.
    _assentar(g, 300, 170, props.mesa_de_reuniao(196, 40, props.MADEIRA))
    # O tampo tem 196x28 e saiu como uma LAJE marrom no meio da imagem: os três
    # veios que `mesa_de_reuniao` desenha não bastam nessa largura. Duas passadas
    # de mancha clara quebram a laje sem subir o contraste, que é o que faria o
    # tampo ganhar "nuvens" (o erro já registrado em `props.manchas`).
    props.manchas(g, 210, 132, 392, 156, quantidade=7, semente=811, claras=True)
    _assentar(g, 246, 130, props.divisoria_acustica(86, 18), sombra=False)
    _assentar(g, 354, 130, props.divisoria_acustica(86, 18), sombra=False)
    _assentar(g, 224, 130, props.monitor(32, 26, "grafico"), sombra=False)
    _assentar(g, 262, 130, props.monitor(30, 24, "log"), sombra=False)
    _assentar(g, 296, 130, props.notebook(26, 18, "desktop"), sombra=False)
    # O notebook do colega ocupa este apoio; uma tela anterior criava duplicata.
    props.reflexo_de_tela(g, 206, 133, 40, 3, props.TELA[1])
    _assentar(g, 212, 148, props.garrafa_agua(14), sombra=False)
    _assentar(g, 232, 150, props.telefone(15, 8), sombra=False)
    _assentar(g, 256, 148, props.pilha_de_papel(12, 6), sombra=False)
    _assentar(g, 300, 152, props.caneca(props.NEUTRO[6]), sombra=False)
    _assentar(g, 374, 150, props.pilha_de_papel(14, 8), sombra=False)
    props.sombra_de_contato(g, 341, 145, 50)  # sombra da `b5-grade`
    # ACENTO VERMELHO da cena, e o único: uma cadeira no bench. Escolhido no
    # mobiliário e não num objeto pequeno porque este é o miolo da imagem e é
    # onde a conversa da fase 5 acontece — o olho tem de descansar ali.
    _assentar(g, 272, 176, props.cadeira_escritorio(props.VERMELHO))
    _assentar(g, 380, 180, props.cadeira_escritorio(perfil=True), espelhar=True)

    # Planta alta na frente dos lockers. Base em 190 e encostada na borda: a
    # fase 5 põe três figuras neste piso e todo prop de chão a mais come coluna
    # de parada. x 395..429 não é usado por nenhuma delas.
    _assentar(g, 412, 190, props.vaso_planta_alta(62))

    # --- FRENTE: a divisória de vidro jateado da sala de onde se olha, e o
    # encosto de um sofá. Nem painel de baia nem planta alta — os dois primeiros
    # planos do Escritório — porque primeiro plano repetido é carimbo.
    _assentar(g, 70, 288, props.divisoria_de_gabinete(178, 56), sombra=False)
    _escurecer(g, 0, 230, 162, 40, 2)
    _aresta_de_luz(g, 0, 230, 162, 12, 2)
    _assentar(g, 420, 284, props.sofa_pequeno(130, 48, props.AZUL), sombra=False)
    _escurecer(g, 354, 234, 126, 36, 2)
    _aresta_de_luz(g, 354, 234, 126, 12, 2)
    refinamentos.decorar(g, 'outra-area', quadro)
    _vinheta(g)
    return g


# ----------------------------------------------------------------- cena 6/6


def sala_reunioes(*, quadro: int = 0) -> Grade:
    """A Sala de Reuniões onde acontece a INNOVATION WEEK (ADR-026).

    Simetria aqui é composição, não espelho: TV no centro exato (x=240), mesa
    centrada em 240, calha de luz centrada e os dois primeiros planos
    equilibrados. O vidro entra à esquerda e a janela à direita para que a
    simetria não fique inerte — sala perfeitamente espelhada lê como cartão de
    visita, não como lugar.

    ┌──────────────────────────────────────────────────────────────────────────┐
    │ DEFEITO VISTO NA TELA (v2.1): A SALA NÃO LIA COMO EVENTO.                │
    │                                                                          │
    │ O texto de abertura da fase 4 promete *"Innovation Week: a sala inteira  │
    │ é gente apresentando o que fez"* e o cenário entregava uma sala de       │
    │ reunião VAZIA. A vestimenta que existia não chegava: a faixa de tecido   │
    │ tinha 240px em azul quase do mesmo valor da calha de luz 12px acima, e   │
    │ as duas juntas liam como duas luminárias paralelas — a faixa não lia     │
    │ como faixa nenhuma. Três coisas entraram:                                │
    │                                                                          │
    │ 1. **A faixa cresceu, desceu e virou VERMELHA.** 300px, em y 30..48,     │
    │    longe da calha. Vermelho é o ÚNICO acento vermelho desta cena agora   │
    │    (a pasta que ficava na mesa saiu por isso — bíblia §3 dá um por cena) │
    │    e gastá-lo na faixa do evento é escolha de composição: o primeiro     │
    │    lugar onde o olho para passa a ser o que nomeia o lugar.              │
    │ 2. **Sessão de pôsteres na divisória de vidro da esquerda**, com banho   │
    │    de luz na parede e dois spots de trilho apontados. O evento deixa de  │
    │    estar só num canto da imagem.                                         │
    │ 3. **Fila de assentos no primeiro plano**, cortada pela borda de baixo,  │
    │    no lugar dos dois encostos soltos. É a plateia em cadeira vazia; a    │
    │    gente entra por cima, como `objeto-plateia`.                          │
    └──────────────────────────────────────────────────────────────────────────┘

    TODO O ACRÉSCIMO MORA FORA DA FAIXA DE CAMINHADA, E ISSO É RESTRIÇÃO, NÃO
    ESTILO. Esta é a cena mais apertada do projeto: a mesa oval cobre o miolo e
    a faixa de piso pisável tem entre 7 e 16 linhas em várias colunas
    (y 152..167 no centro-direita). Qualquer totem ou cavalete novo com base no
    piso invalidaria as coordenadas de `bloco4.ts`. Então o evento entra por
    onde não há piso: faixa pendurada no teto, pôsteres na parede e no vidro,
    spots no trilho, material de credenciamento na credência que já existe, e
    primeiro plano abaixo de y=226.

    TRÊS RETÂNGULOS RESERVADOS (de `bloco4.ts`):
      x 192..288, y  51..111  `tv` (centro)
      x 216..264, y 104..172  `entrega` — AMPLIADO na v2.1. Ele guardava um
                              sprite de ITEM de 24x24 (o crachá) e agora guarda
                              o `objeto-atril`, que é bem maior. Com base em
                              y=167 (62% do canvas) o atril ocupa x 222..258 e
                              y 111..167, e a sombra de contato dele está
                              pintada em (240, 167). Foi por isso que o
                              `suporte_de_tv` e a cadeira do meio saíram deste
                              trecho: ver os comentários no corpo.
      x 326..366, y 172..200  `notebook` (base, em cima da mesa)
    """
    hz = HZ_REUNIOES
    g = Grade(LARGURA, ALTURA, "4")

    props.parede_pintada(g, 0, hz, "5443")
    props.forro_de_teto(g, 0, 14)
    _luminaria_de_teto(g, 240, 150)
    # Os pilares saíram de 192/292 para 176/304 porque encostavam nas duas
    # colunas extremas do retângulo da TV — e pilar atrás de TV com aura viraria
    # uma borda dupla no hover.
    _assentar(g, 176, hz + 2, props.pilar(18, 138), sombra=False)
    _assentar(g, 304, hz + 2, props.pilar(18, 138), sombra=False)
    g.colar(206, 30, props.grelha_de_ar(26, 13))

    # vidro + porta à esquerda (é na porta que a Bianca aparece no Bloco 4)
    props.vidro(g, 64, 44, 108, 96, montantes=3)
    _assentar(g, 34, hz, props.porta(38, 98, aberta=True), sombra=False)
    # Janela de sala INTERNA: vista para a fachada do prédio vizinho, em hora de
    # anoitecer. É a única das três que não é fonte de luz — aqui quem ilumina é a
    # calha do teto e a fresta da porta — e por isso a mancha dela no piso é fraca.
    g.colar(
        330,
        32,
        props.janela(
            100, 64, hora="anoitecer", vista="vizinho", montantes=2, travessas=0, peitoril=4
        ),
    )
    props.vidro(g, 442, 44, 36, 96, montantes=1)
    props.rodape(g, hz)

    props.piso_ladrilhado(g, hz, ALTURA, "6554", cx=240)
    props.manchas(g, 0, hz + 2, LARGURA, ALTURA, quantidade=12, semente=419)
    # A CUNHA DA PORTA VEM DEPOIS DO PISO, e isso é a correção de um bug antigo:
    # a poça daqui era chamada logo abaixo do prop da porta, ou seja ANTES de
    # `piso_ladrilhado`, e o piso a apagava inteira. Havia uma chamada de luz na
    # cena que nunca pintou um pixel — a única fonte quente da sala estava sem
    # consequência no chão e ninguém viu porque o código dizia que estava lá.
    # Deriva para DENTRO da sala, ao contrário da do treinamento: as duas cenas têm
    # porta aberta, e cunha idêntica nas duas seria o carimbo de novo com outra
    # forma. Alcance menor porque aqui a calha do teto está acesa e compete.
    props.poca_de_porta(g, 32, 154, 15, 26, deriva=12, quente="x", passos=2)
    # 2 montantes na janela, 2 barras na mancha, e ela começa rente à parede
    # porque a mesa cobre tudo abaixo de y=168: poça posicionada no meio do piso
    # ficaria escondida pelo tampo e a janela perderia a consequência no chão.
    props.poca_de_janela(
        g, 336, 154, 84, 54, inclinacao=-20, barras=2, travessa=0, quente=None, passos=1
    )

    # --- credência sob a TV. Tampo em y=126.
    # O TRECHO x 216..264 DO TAMPO FICA VAZIO, e ele cresceu na v2.1: o hotspot
    # `entrega` guardava um crachá de 24x24 e passa a guardar o atril, que tem
    # 36x56 px de arte. A papelada e a garrafa recuaram para a esquerda e o
    # material de credenciamento para a direita.
    # A base larga saiu do palco para liberar a faixa da plateia.
    # O `suporte_de_tv` SAIU daqui (estava em x 232..248, y 110..118). Ele cai
    # inteiro dentro do retângulo do atril, e suporte metade coberto por um
    # objeto lê como TV flutuando — que é a classe de defeito que a prévia já
    # pegou uma vez neste projeto. A TV está na altura de TV de parede e lê como
    # fixada na parede, igual às outras cinco cenas, que nunca tiveram suporte.
    #
    # Sombra de contato do atril, em y=167 e não 168: 168 é a primeira fila do
    # TAMPO da mesa grande, e sombra pintada ali assenta o atril em cima da mesa
    # em vez de no piso atrás dela. 167 é a última fila de piso daquela coluna.
    props.sombra_de_contato(g, 296, 167, 40)

    # Cadeiras ao fundo, e agora são QUATRO: a do meio saiu de x=240 (caía dentro
    # do retângulo do atril, e cadeira pintada atrás de um objeto cuja base está
    # mais à frente lê como objeto flutuando) e nasceram duas em 200 e 284. Quatro
    # em vez de três também serve ao evento: fila mais densa lê como sala ocupada.
    #
    # x 312..345 NÃO RECEBE CADEIRA NOVA, e isto é geometria, não estética: as
    # paradas de `bloco4.ts` em 65%, 66% e 70% caem nessas colunas, onde a faixa
    # de piso tem 7 a 16 linhas entre o rodapé e a mesa. Uma cadeira ali reduz a
    # corrida de piso e reprova três paradas de uma vez.
    # A fileira antiga aparecia entre Ana e o telão e parecia uma segunda
    # plateia vazia. Dois assentos laterais bastam para localizar a sala.
    for cx, esp in ((104, False), (386, True)):
        _assentar(g, cx, 202, props.cadeira_escritorio(perfil=True), espelhar=esp)

    # --- mesa grande. Tampo 168..216; x 326..366 fica VAZIO para o `notebook`,
    # cuja base o conteúdo declara em y=200.
    # A mesa saiu porque escondia a plateia e ocupava a faixa de circulação.
    # A PASTA VERMELHA QUE FICAVA AQUI SAIU. A bíblia §3 dá UM acento vermelho
    # por cena e ele passou para a faixa do evento, que é 300px de largura e
    # nomeia o lugar. Dois vermelhos — um na faixa e um de 22x6 na mesa —
    # dividiriam o olho, e o de 22x6 perderia de qualquer jeito.
    _assentar(g, 16, 238, props.vaso_planta_alta(66))

    # --- INNOVATION WEEK (ADR-026): esta sala é ONDE O EVENTO ACONTECE, e
    # precisa comunicar exposição além de reunião.
    #
    # Faixa de tecido VERMELHA, 300px, em y 30..48. Era azul, com 240px, em
    # y 24..40: naquele tom e naquela altura ela caía na mesma faixa de valor da
    # calha de luz e as duas liam como duas luminárias paralelas. Vermelho de
    # valor médio contra a parede fria `5`/`4` é a única combinação desta paleta
    # que diz "tecido de evento" sem virar lâmpada.
    # Entre o cabeçalho e a TV: o tecido não passa atrás do título da sala.
    # Centralizada sobre a TV e com a ponta direita antes da coluna do HUD.
    g.colar(120, 37, props.faixa_pendurada(240, 14, props.VERMELHO))
    # O BANHO DE PAREDE VEM ANTES DOS PÔSTERES, e isso é correção de olhar.
    # Estava depois, e a `poca_de_luz` aclara o char que encontra — então ela
    # salpicava laranja EM CIMA dos pôsteres, o que lia como mancha no papel em
    # vez de luz na parede. Lavando a parede primeiro, os pôsteres entram limpos
    # e leem como iluminados porque o que está em volta deles está.
    props.poca_de_luz(g, 380, 116, 54, 30, quente="x", passos=1)
    props.poca_de_luz(g, 118, 74, 52, 30, quente="x", passos=1)
    # Fileira de pôsteres de projeto sob a janela: é a faixa de parede que sobrou
    # (x 330..430 entre a base da janela em y=96 e o rodapé em 152) e é a única da
    # cena que não colide com os três retângulos reservados.
    g.colar(370, 104, props.cartaz(26, 38, acento=props.VERDE[3]))
    # SESSÃO DE PÔSTERES NO VIDRO DA ESQUERDA. Pôster colado em divisória de
    # vidro é literalmente o que se vê num evento de pôsteres, e é o único lugar
    # da metade esquerda onde cabe algo: a porta ocupa x 15..53 e o vidro vai de
    # 64 a 172, todo acima da linha do piso. Custo zero em geometria de chão.
    g.colar(118, 56, props.cartaz(28, 38, acento=props.TELA[3]))
    # Quatro spots de trilho, dois por parede de pôster. Sem a consequência na
    # parede o spot é uma caixinha no teto — mesma lógica da poça no chão.
    for px in (370, 122):
        g.colar(px, 16, props.projetor(18, 10))
    # material de credenciamento na credência, na faixa livre do tampo (x 266..310)

    # A plateia e suas cadeiras são camadas da UI, não pixels do cenário. Assim
    # o piso continua legível e as duas fileiras podem ser compostas em camadas.
    # A faixa opaca antiga escondia toda a frente como uma parede preta.
    refinamentos.decorar(g, 'sala-reunioes', quadro)
    _vinheta(g)
    return g


# --------------------------------------------------------------------- mapa


def cafezinho_festa() -> Grade:
    """A variação de festa do Cafezinho, como entrada própria do registro.

    Existe para que `CENAS_ATIVAS` possa mapear um nome de arquivo a uma função
    sem argumento, como todas as outras. A alternativa era `functools.partial`,
    que não tem docstring e não aparece em rastreio de erro com nome útil.
    """
    return cafezinho(festa=True)


# ------------------------------------------------------------ registro de cenas
#
# POR QUE UM REGISTRO, E NÃO UMA LISTA DENTRO DE `gerar()`
# `scripts/exportar_chao.py` mantinha a sua própria tabela de cenas, copiada à
# mão desta lista. Duas listas da mesma coisa em arquivos diferentes é a receita
# do defeito que este projeto já pagou caro: quem acrescenta um cenário atualiza
# uma e esquece a outra, e o mapa de chão passa a validar contra uma cena que não
# existe mais (ou a não validar a cena nova). O registro é a fonte única; o
# exportador e o gerador leem daqui.

CENAS_ATIVAS: dict[str, tuple[Callable[[], Grade], int]] = {
    "escritorio": (escritorio, HZ_ESCRITORIO),
    "cafezinho": (cafezinho, HZ_CAFEZINHO),
    "cafezinho-festa": (cafezinho_festa, HZ_CAFEZINHO),
    "linha-producao": (linha_producao, HZ_LINHA_PRODUCAO),
    "sala-reunioes": (sala_reunioes, HZ_REUNIOES),
    "outra-area": (outra_area, HZ_OUTRA_AREA),
}
"""Nome de arquivo -> (função, junta parede-piso).

Os cinco primeiros nomes são os cinco `LugarId` da v2 (spec 00 §1), porque
`assetDoCenario()` deriva o asset do id do lugar: `cenario-<lugarId>` ->
`/assets/cenarios/<lugarId>.png`. Errar o nome aqui faz a cena cair no
placeholder sem erro nenhum aparecer.

`cafezinho-festa` é o sexto e NÃO é um lugar: é uma segunda arte para o mesmo
`LugarId`. Ela precisa de uma entrada própria no manifest e de alguém escolhendo
entre as duas por fase — está registrado no relatório desta frente como pendência
para a frente de contratos.
"""

CENAS_FORA_DE_CIRCULACAO: dict[str, tuple[Callable[[], Grade], int]] = {
    "sala-treinamento": (sala_treinamento, HZ_TREINAMENTO),
    "laboratorio": (laboratorio, HZ_LABORATORIO),
    "innovation": (innovation, HZ_INNOVATION),
}
"""Cenas que deixaram de ser lugares, mas cujo CÓDIGO fica.

`sala-treinamento` e `innovation` colapsaram na Sala de Reuniões (ADR-026) e o
`laboratorio` virou a Linha de Produção (ADR-009). Nada foi apagado de propósito:
a spec manda deixar de exportar, não deletar, e a Sala de Reuniões pode querer
reaproveitar props destas cenas (tela de projeção, feixe de projetor, cadeiras em
fila, protótipo). Elas continuam chamáveis e continuam compilando — se um dia
voltarem, basta mover a linha de um dicionário para o outro.
"""

PISO_COM_MADEIRA: tuple[str, ...] = ("cafezinho", "cafezinho-festa")
"""Cenas em que `exportar_chao.py` tem de aceitar madeira como piso.

No cafezinho o piso É de madeira por decisão de arte (é o que dá o calor da
cena), então lá a checagem não consegue distinguir piso de tampo de mesa. É
limitação conhecida e está declarada, não escondida — e a versão de festa herda
o mesmo piso, logo a mesma limitação.
"""


def mapa() -> Grade:
    return refinamentos.campus()


# ------------------------------------------------- objetos interativos (PNG)
#
# NOTA DE FRONTEIRA: `entrega` (Bloco 4) e `conclusao-trilha` (Bloco 2) chegaram
# a ganhar sprite próprio aqui — uma prancheta e um monitor com certificado. Os
# dois foram removidos depois de ler `bloco2.ts`/`bloco4.ts`: a frente de
# interação declarou `arte: { tipo: 'item', ... }` para ambos, reaproveitando o
# sprite do item que cada hotspot concede. Dois sprites para a mesma coisa na
# mesma tela seria pior que nenhum, e o `assetId` é decisão de quem declara o
# hotspot, não de quem desenha.


# nome de arquivo -> caixa em px de ARTE.
#
# Os dois vêm de fora desta frente e não são escolha nossa: os nomes são os de
# `src/assets/manifest.ts` (`/assets/objetos/<nome>.png`) e as caixas são os
# `largura`/`altura` que `bloco*.ts` declara em px de TELA, divididos por 4.
#
# Casar o tamanho exato importa mais do que parece: a UI fixa width/height em
# CSS, então um PNG com tamanho intrínseco diferente é reescalado pelo navegador
# por um fator fracionário — e aí `image-rendering: pixelated` não salva nada,
# a grade de 4x quebra e o objeto fica com pixels de larguras diferentes ao lado
# de um cenário que está na grade.
CAIXAS_DE_OBJETO: dict[str, tuple[int, int]] = {
    "notebook": (40, 28),
    "notebook-aberto": (40, 28),
    "monitor-ligado": (48, 36),
    "maquina-cafe": (32, 48),
    "quadro-branco": (72, 48),
    "mural-postits": (80, 56),
    "tv-grande": (96, 60),
    # ------------------------------------------------- refinamento da v2.1
    # Os dois primeiros herdam DE PROPÓSITO a caixa do asset que substituem:
    # `objeto-caderno` entra no lugar de `objeto-notebook-aberto` (160x112 px de
    # tela) e `objeto-grade-curricular` no lugar de `objeto-monitor-ligado`
    # (192x144). Assim a frente de conteúdo troca UMA STRING — o `assetId` — e a
    # grade de 4x continua fechando. Se ela decidir outro tamanho, é aqui que
    # muda, e a mudança é de uma linha.
    "caderno": (40, 28),
    "grade-curricular": (48, 36),
    # Os dois da fase 4 são novos e não têm caixa herdada. Estes são os números
    # que a frente de interação precisa declarar em `bloco4.ts`:
    #   objeto-atril   -> largura: 144, altura: 224
    #   objeto-plateia -> largura: 936, altura: 136 (fileira de trás, cenário)
    "atril": (36, 56),
    "plateia": (234, 34),
    "plateia-frente": (234, 64),
    "plateia-vazia": (234, 64),
    "figurante-cafe-1": (50, 84),
    "figurante-cafe-1-gesto": (50, 84),
    "figurante-cafe-2": (50, 84),
    "figurante-cafe-2-gesto": (50, 84),
    # ACHADO, NÃO ESCOPO: `objeto-painel-processo` está no manifest e é usado por
    # `bloco3.ts` com 192x144, mas nunca foi gerado — o hotspot da Linha de
    # Produção caía no placeholder rotulado, e em silêncio, porque a cadeia de
    # fallback de `Imagem.tsx` não quebra. Ver `props.painel_de_processo`.
    "painel-processo": (48, 36),
    "radio-telecom": (16, 24),
    "radio-telecom-aberto": (16, 24),
    "braco-robotico": (24, 50),
    "braco-robotico-estendido": (24, 50),
}


def _objeto(nome: str, prop: Grade) -> tuple[str, Grade]:
    """Centraliza o prop na caixa declarada e contorna.

    A folga de 2px em cada lado não é estética: `contornar()` só pinta pixel
    transparente que já existe na grade, então arte encostada na borda sai com
    contorno CORTADO nos lados — e contorno com furo é o defeito que mais
    entrega arte amadora (bíblia §2.3). A folga dá onde o contorno nascer.
    """
    largura, altura = CAIXAS_DE_OBJETO[nome]
    cel = Grade(largura, altura)
    cel.colar((largura - prop.largura) // 2, (altura - prop.altura) // 2, prop)
    return nome, contornar(cel)


def _objetos() -> list[tuple[str, Grade]]:
    """Um PNG por asset de objeto declarado no manifest — doze na v2.1.

    Eram sete. A primeira versão desta frente gerou dez arquivos, um por hotspot
    que não é NPC nem item; a frente de interação resolveu diferente e é ela que
    manda, porque é ela que declara o `assetId`: `notebook-trilha` e o notebook
    dos Blocos 4 e 5 reaproveitam `objeto-notebook-aberto`, `monitor` e
    `notebook-aberto` do Bloco 1 reaproveitam `objeto-monitor-ligado`, e
    `conclusao-trilha` e `entrega` viraram `tipo: 'item'`. Sobraram sete.

    A v2.1 acrescenta CINCO, e cada um tem uma razão diferente:

    - `caderno` e `grade-curricular` nascem de arte emprestada que CONTRADIZIA o
      próprio rótulo: a fase 5 desenhava "Caderno dela" com um laptop e "Grade do
      próximo semestre" com um monitor. O conteúdo falava de papel e a tela
      mostrava equipamento.
    - `atril` e `plateia` nascem de a fase 4 não mostrar apresentação nenhuma: o
      hotspot "Apresentar" tinha como arte o crachá que ele CONCEDE, e a sala
      estava vazia embaixo de um texto que promete "a sala inteira é gente
      apresentando".
    - `painel-processo` não é escopo novo: ele já estava no manifest e já era
      usado por `bloco3.ts`, e simplesmente nunca tinha sido gerado.

    Cada um sai contornado porque aqui a silhueta fechada é o que a aura de
    hover segue (bíblia §7.2) — é a única exceção à regra 4 do topo de
    `props.py`.
    """
    return [
        # Bloco 1 e 5 — a mesa da Ana. `notebook` é a tela de login, e
        # `notebook-aberto` é o depois; diferenciados pelo CONTEÚDO da tela, não
        # pelo formato, senão pareceriam dois notebooks diferentes na mesma mesa.
        _objeto("notebook", props.notebook(36, 24, "login")),
        _objeto("notebook-aberto", props.notebook(36, 24, "desktop")),
        # Serve ao `monitor` do log no Bloco 3 E à "tela aberta" do Bloco 1. O
        # conteúdo é `log` porque o Bloco 3 inteiro depende de a plateia ler
        # aquilo como um log — e log também lê como "tela ligada" no Bloco 1.
        _objeto("monitor-ligado", props.monitor(44, 32, "log")),
        _objeto("maquina-cafe", props.maquina_de_cafe(28, 44)),
        _objeto("quadro-branco", props.quadro_branco(68, 44)),
        _objeto("mural-postits", props.painel_de_post_its(76, 52)),
        _objeto("tv-grande", props.tv_de_parede(92, 56, "diagrama")),
        # --- v2.1
        _objeto("caderno", props.caderno_aberto(36, 22)),
        _objeto("grade-curricular", props.grade_impressa(42, 28)),
        _objeto("atril", props.atril(32, 52)),
        _objeto("plateia", props.plateia(altura=32, fileira="tras")),
        _objeto("plateia-frente", props.plateia(fileira="frente")),
        _objeto("plateia-vazia", props.plateia(ocupada=False)),
        _objeto("figurante-cafe-1", personagens.figurante_cafe(variacao=0)),
        _objeto("figurante-cafe-1-gesto", personagens.figurante_cafe(variacao=0, gesto=True)),
        _objeto("figurante-cafe-2", personagens.figurante_cafe(variacao=2)),
        _objeto("figurante-cafe-2-gesto", personagens.figurante_cafe(variacao=2, gesto=True)),
        _objeto("painel-processo", props.painel_de_processo(44, 32)),
        _objeto("radio-telecom", props.radio_de_telecom(16, 24)),
        _objeto("radio-telecom-aberto", props.radio_de_telecom(16, 24, montado=False)),
        _objeto("braco-robotico", props.braco_robotico(46)),
        _objeto("braco-robotico-estendido", props.braco_robotico(46, estendido=True)),
    ]


# ------------------------------------------------------------------ contrato


def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os PNG e devolve (nome, grade) das imagens de cena.

    `gerar_arte.py` passa `public/assets/cenarios`. O mapa vai para
    `../mapa/mapa.png` e os objetos para `../objetos/` porque é o que
    `src/assets/manifest.ts` e a spec 01 §3 declaram — subir um nível é feio,
    mas mentir sobre o caminho do asset é pior.

    Só as cenas entram na folha de contato desta frente: a folha usa uma célula
    do tamanho da maior peça, então um objeto de 30x22 no meio de sete imagens
    de 480x270 sairia como um ponto perdido em 129.600 px de xadrez. Os objetos
    ganham a própria folha, em escala 3.

    AS TRÊS CENAS APOSENTADAS NÃO SÃO ESCRITAS E NÃO ENTRAM NA FOLHA. O PNG
    antigo delas continua em `public/assets/cenarios/` e nada aqui o apaga: sair
    de circulação é deixar de gerar, não deletar. Consequência prática de quem
    for olhar: enquanto a frente de conteúdo não trocar os `lugarId`,
    `previa_de_cena.py` vai avisar "sem cenário para laboratorio" nos blocos
    velhos e pular. O aviso é correto — aquele lugar não existe mais.
    """
    cenas: list[tuple[str, Grade]] = [
        (nome, funcao()) for nome, (funcao, _hz) in CENAS_ATIVAS.items()
    ]
    for nome, grade in cenas:
        escrever_sprite(destino / f"{nome}.png", grade)

    refinamentos.ambientes(destino.parent / "ambientes", cenas)
    grade_mapa = mapa()
    escrever_sprite(destino.parent / "mapa" / "mapa.png", grade_mapa)
    mapa_ativo = refinamentos.campus_em_movimento(grade_mapa)
    escrever_tira(destino.parent / 'mapa' / 'mapa-idle.png', [grade_mapa, mapa_ativo])
    escrever_folha_de_contato(_RAIZ_DO_REPO / 'docs/arte/contato-mapa-ambiente.png',
                             [('campus repouso', grade_mapa), ('campus ativo', mapa_ativo)], por_fila=1, escala=2)
    marcos = [(lugar, refinamentos.marco(lugar)) for lugar in
              ('escritorio', 'cafezinho', 'linha-producao', 'sala-reunioes', 'outra-area')]
    for lugar, marco in marcos:
        escrever_sprite(destino.parent / 'mapa' / f'{lugar}.png', marco)
    escrever_folha_de_contato(_RAIZ_DO_REPO / 'docs/arte/contato-mapa.png', marcos, por_fila=5, escala=4)

    objetos = _objetos()
    pasta_objetos = destino.parent / "objetos"
    for nome, grade in objetos:
        escrever_sprite(pasta_objetos / f"{nome}.png", grade)
    ciclo = [_objeto('braco-robotico', props.braco_robotico(46, fase=f))[1] for f in range(4)]
    escrever_tira(pasta_objetos / 'braco-robotico-andando.png', ciclo)
    objetos.extend((f'robô quadro {f}', g) for f, g in enumerate(ciclo))

    folha_objetos = _RAIZ_DO_REPO / "docs" / "arte" / "contato-objetos.png"
    escrever_folha_de_contato(folha_objetos, objetos, por_fila=5, escala=3)
    print(f"[cenarios] {len(objetos)} objetos -> {pasta_objetos}")
    print(f"[cenarios] folha de objetos -> {folha_objetos}  <- OLHE ESTA IMAGEM TAMBÉM")
    print(
        "[cenarios] fora de circulação (código mantido, PNG antigo preservado): "
        + ", ".join(CENAS_FORA_DE_CIRCULACAO)
    )

    return [*cenas, ("mapa", grade_mapa)]
