"""
Núcleo de pixel art: grade, desenho, contorno, rasterização e PNG.

Sem dependências: o PNG é escrito com zlib/struct da stdlib, então qualquer
Python 3.11+ roda. Não instale Pillow para isto.

MODELO
Toda arte é uma `Grade` de chars (1 char = 1 pixel de arte), onde o char é uma
chave de `paleta.PALETA`. Nada aqui conhece cor RGB a não ser na hora de
rasterizar — o que permite trocar a paleta inteira sem tocar em um desenho.

ESCALA: 4 pixels reais por pixel de arte, em TODO o jogo.
Isso não é gosto, é o que amarra a ilusão. Escalas diferentes na mesma tela
fazem cenário e personagem parecerem dois jogos colados. A conta:
  cena    1920x1080 / 4 = 480x270  (resolução de ponto-e-clique clássico)
  Ana     84 px de arte de altura  -> 336 px na tela -> 31% da altura
31% é a proporção personagem/cena das referências (Fate of Atlantis fica em
~22%, Sepulchre em ~30%). A 6x a Ana dava 47% e parecia boneco colado em
maquete — foi por isso que a escala mudou.

COMO ESTE ARQUIVO É USADO
Cenário: monte uma `Grade(480, 270)` e desenhe com `retangulo`, `dither`,
`colar`. Cenário NÃO é desenhado pixel a pixel — é montado com props
reutilizáveis (ver props.py), que é como background de pixel art é feito.
Sprite: monte uma `Grade` pequena e passe por `contornar()` no fim.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

from .paleta import CONTORNO, PALETA, VAZIO

# ---------------------------------------------------------------- constantes

ESCALA = 4
"""Pixels reais por pixel de arte. Único para todo o jogo."""

CENA = (480, 270)
"""Grade de cenário e de mapa. 480*4=1920, 270*4=1080."""

CHAO_DA_CENA = 232
"""Linha em que o piso encontra o personagem, em px de arte.

Todo personagem e todo prop de chão assenta aqui. Fixar isso é o que impede o
elenco de flutuar ou afundar ao trocar de cenário.
"""


class ErroDeArte(Exception):
    """Erro de autoria detectado na montagem — some antes de virar PNG."""


# --------------------------------------------------------------------- grade


class Grade:
    """Matriz de chars com API de desenho. Origem no topo-esquerda."""

    __slots__ = ("largura", "altura", "px")

    def __init__(self, largura: int, altura: int, fundo: str = VAZIO) -> None:
        self.largura = largura
        self.altura = altura
        self.px: list[list[str]] = [[fundo] * largura for _ in range(altura)]

    # ------------------------------------------------------------ primitivas

    def ponto(self, x: int, y: int, cor: str) -> None:
        if 0 <= x < self.largura and 0 <= y < self.altura:
            self.px[y][x] = cor

    def em(self, x: int, y: int) -> str:
        if 0 <= x < self.largura and 0 <= y < self.altura:
            return self.px[y][x]
        return VAZIO

    def segmento(self, x: int, y: int, chars: str) -> None:
        """Escreve uma fila horizontal de chars a partir de (x, y).

        Primitiva de autoria de sprite: escrever `"SsKKsssKKsS"` é LER o
        desenho enquanto se escreve, o que não acontece com coordenada solta.
        `.` dentro da string é transparente e não sobrescreve.
        """
        for i, ch in enumerate(chars):
            if ch != VAZIO:
                self.ponto(x + i, y, ch)

    def linhas(self, y0: int, linhas: list[str], x0: int = 0) -> None:
        for dy, linha in enumerate(linhas):
            self.segmento(x0, y0 + dy, linha)

    def linha_h(self, x: int, y: int, comprimento: int, cor: str) -> None:
        for i in range(comprimento):
            self.ponto(x + i, y, cor)

    def linha_v(self, x: int, y: int, comprimento: int, cor: str) -> None:
        for i in range(comprimento):
            self.ponto(x, y + i, cor)

    def retangulo(self, x: int, y: int, w: int, h: int, cor: str) -> None:
        for dy in range(h):
            self.linha_h(x, y + dy, w, cor)

    def moldura(self, x: int, y: int, w: int, h: int, cor: str) -> None:
        self.linha_h(x, y, w, cor)
        self.linha_h(x, y + h - 1, w, cor)
        self.linha_v(x, y, h, cor)
        self.linha_v(x + w - 1, y, h, cor)

    def caixa_com_volume(self, x: int, y: int, w: int, h: int, rampa: str) -> None:
        """Retângulo com luz em cima/esquerda e sombra embaixo/direita.

        Atalho para o prop mais comum de cenário (mesa, armário, caixa). Usa
        três casas da rampa: clara na aresta iluminada, média no corpo, escura
        na aresta em sombra. Luz vem sempre de cima-à-esquerda.
        """
        if len(rampa) < 3:
            raise ErroDeArte(f"rampa curta para volume: {rampa!r}")
        escuro, medio, claro = rampa[0], rampa[len(rampa) // 2], rampa[-2]
        self.retangulo(x, y, w, h, medio)
        self.linha_h(x, y, w, claro)
        self.linha_v(x, y, h, claro)
        self.linha_h(x, y + h - 1, w, escuro)
        self.linha_v(x + w - 1, y, h, escuro)

    # -------------------------------------------------------------- textura

    def dither(self, x: int, y: int, w: int, h: int, a: str, b: str, padrao: str = "xadrez") -> None:
        """Mistura dois tons numa grade regular.

        É assim que pixel art faz transição sem gradiente. O gradiente suave é
        proibido pelo spec (a compressão de vídeo o vira faixa), e o dither
        resolve o mesmo problema com dois tons sólidos.

        `xadrez` = 50/50, `esparso` = 25% de `b`, `denso` = 75% de `b`.
        """
        for dy in range(h):
            for dx in range(w):
                if padrao == "xadrez":
                    usa_b = (dx + dy) % 2 == 0
                elif padrao == "esparso":
                    usa_b = (dx % 2 == 0) and (dy % 2 == 0)
                elif padrao == "denso":
                    usa_b = not ((dx % 2 == 1) and (dy % 2 == 1))
                else:
                    raise ErroDeArte(f"padrão de dither desconhecido: {padrao}")
                self.ponto(x + dx, y + dy, b if usa_b else a)

    def degrade_v(self, x: int, y: int, w: int, h: int, tons: str) -> None:
        """Bandas horizontais descendo a rampa `tons`, com dither na junta.

        Usado para parede e céu. A junta ditherizada evita a faixa dura que
        banda sólida deixa — e faixa dura é exatamente o que a compressão
        transforma em banding visível.
        """
        if not tons:
            return
        faixa = max(1, h // len(tons))
        for i, ch in enumerate(tons):
            topo = y + i * faixa
            alto = faixa if i < len(tons) - 1 else h - i * faixa
            if alto <= 0:
                break
            self.retangulo(x, topo, w, alto, ch)
            if i > 0:
                self.dither(x, topo, w, 1, tons[i - 1], ch, "xadrez")

    # ------------------------------------------------------------ composição

    def colar(self, x: int, y: int, outra: Grade, espelhar: bool = False) -> None:
        """Cola outra grade respeitando transparência.

        Prop é colado, não redesenhado. Uma cena com 30 props escritos à mão
        não fica pronta; com 8 props colados 30 vezes, fica.
        """
        for dy in range(outra.altura):
            for dx in range(outra.largura):
                sx = outra.largura - 1 - dx if espelhar else dx
                ch = outra.px[dy][sx]
                if ch != VAZIO:
                    self.ponto(x + dx, y + dy, ch)

    def colar_base(self, x_centro: int, y_base: int, outra: Grade, espelhar: bool = False) -> None:
        """Cola ancorando pelo CENTRO-BASE do prop.

        É a âncora natural de qualquer coisa que fique no chão: você posiciona
        onde os pés tocam, não onde o canto superior cai. Posicionar prop de
        chão pelo canto é a causa da metade dos itens flutuando.
        """
        self.colar(x_centro - outra.largura // 2, y_base - outra.altura, outra, espelhar)

    def recortar(self, x: int, y: int, w: int, h: int) -> Grade:
        fora = Grade(w, h)
        for dy in range(h):
            for dx in range(w):
                fora.px[dy][dx] = self.em(x + dx, y + dy)
        return fora

    def clone(self) -> Grade:
        nova = Grade(self.largura, self.altura)
        nova.px = [linha[:] for linha in self.px]
        return nova

    def deslocar(self, dx: int, dy: int) -> Grade:
        """Cópia deslocada. Base de quadro de animação: um braço 1px acima."""
        nova = Grade(self.largura, self.altura)
        nova.colar(dx, dy, self)
        return nova

    # ------------------------------------------------------------- medidas

    def caixa(self) -> tuple[int, int, int, int] | None:
        """Bounding box do conteúdo opaco, ou None se vazia."""
        xs: list[int] = []
        ys: list[int] = []
        for y in range(self.altura):
            for x in range(self.largura):
                if self.px[y][x] != VAZIO:
                    xs.append(x)
                    ys.append(y)
        if not xs:
            return None
        return min(xs), min(ys), max(xs), max(ys)


# ------------------------------------------------------------------ contorno


def contornar(grade: Grade, cor: str = CONTORNO) -> Grade:
    """Outline de 1px por dilatação 4-vizinhos da silhueta.

    Por que gerar e não desenhar: contorno à mão fica com furo, e furo de
    contorno é o defeito que mais entrega arte amadora. Gerado, é sempre
    fechado e sempre da mesma espessura.

    4-vizinhos e não 8: com 8 o contorno engorda nas diagonais e ombro e
    queixo ficam empastados nesta escala.

    Efeito colateral que o desenho deve EXPLORAR: um vão transparente de 1px
    entre dois volumes vira linha interna. É assim que braço se separa de
    torso e perna de perna. Tirar o vão faz o braço derreter no corpo — foi
    exatamente o defeito que deixou a primeira Ana encolhida sem braços.
    """
    fora = grade.clone()
    for y in range(grade.altura):
        for x in range(grade.largura):
            if grade.px[y][x] != VAZIO:
                continue
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                if grade.em(x + dx, y + dy) != VAZIO:
                    fora.px[y][x] = cor
                    break
    return fora


# ------------------------------------------------------------- verificações


def verificar_sprite(
    nome: str,
    grade: Grade,
    *,
    centro: int | None = None,
    chao: int | None = None,
    largura_maxima: int | None = None,
) -> list[str]:
    """Checagens que pegam os erros INVISÍVEIS de sprite feito por coordenada.

    Devolve avisos em vez de levantar: aviso deixa a arte sair e ser olhada, e
    olhar é o que corrige pixel art. Char fora da paleta, porém, é erro — sai
    RGB errado no PNG e ninguém percebe até a apresentação.
    """
    avisos: list[str] = []
    for fila in grade.px:
        for ch in fila:
            if ch != VAZIO and ch not in PALETA:
                raise ErroDeArte(f"{nome}: char {ch!r} não está na PALETA")

    caixa = grade.caixa()
    if caixa is None:
        return [f"{nome}: sprite vazio"]

    x0, y0, x1, y1 = caixa
    if centro is not None:
        meio = (x0 + x1) / 2
        if abs(meio - centro) > 0.5:
            avisos.append(f"{nome}: eixo em {meio}, esperado {centro} (figura sai torta)")
    if chao is not None and y1 != chao:
        avisos.append(f"{nome}: base em y={y1}, esperado {chao} (vai flutuar ou afundar)")
    if largura_maxima is not None and (x1 - x0 + 1) > largura_maxima:
        avisos.append(f"{nome}: largura {x1 - x0 + 1} passa do máximo {largura_maxima}")
    return avisos


# ----------------------------------------------------------------- PNG cru


def _bloco(tipo: bytes, dados: bytes) -> bytes:
    return (
        struct.pack(">I", len(dados))
        + tipo
        + dados
        + struct.pack(">I", zlib.crc32(tipo + dados) & 0xFFFFFFFF)
    )


def _escrever_rgba(caminho: Path, w: int, h: int, linhas: list[bytearray]) -> None:
    cru = bytearray()
    for linha in linhas:
        cru.append(0)  # filtro 0 (None) por linha
        cru.extend(linha)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with caminho.open("wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(_bloco(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(_bloco(b"IDAT", zlib.compress(bytes(cru), 9)))
        f.write(_bloco(b"IEND", b""))


def _rasterizar(filas: list[list[Grade]], escala: int, xadrez: bool) -> tuple[int, int, list[bytearray]]:
    """Rasteriza uma matriz de grades num bitmap único.

    1x1 é um sprite; 1xN é tira de animação; MxN é folha de contato.
    """
    alturas = [max((g.altura for g in fila), default=0) for fila in filas]
    w_arte = max((sum(g.largura for g in fila) for fila in filas), default=0)
    h_arte = sum(alturas)

    linhas: list[bytearray] = []
    for i, fila in enumerate(filas):
        for ay in range(alturas[i]):
            linha = bytearray()
            usado = 0
            for g in fila:
                for ax in range(g.largura):
                    ch = g.px[ay][ax] if ay < g.altura else VAZIO
                    if ch == VAZIO:
                        if xadrez:
                            v = 0x2A if ((ax // 8) + (ay // 8)) % 2 == 0 else 0x1E
                            rgba = bytes((v, v, v, 255))
                        else:
                            rgba = bytes(4)
                    else:
                        rgba = bytes((*PALETA[ch], 255))
                    linha.extend(rgba * escala)
                usado += g.largura
            if usado < w_arte:
                falta = (w_arte - usado) * escala
                linha.extend((bytes((0x1E, 0x1E, 0x1E, 255)) if xadrez else bytes(4)) * falta)
            for _ in range(escala):
                linhas.append(linha[:])
    return w_arte * escala, h_arte * escala, linhas


# ------------------------------------------------------------------ saídas


def escrever_sprite(caminho: Path, grade: Grade, escala: int = ESCALA) -> tuple[int, int]:
    """PNG único, fundo transparente, nearest-neighbor em fator inteiro."""
    w, h, linhas = _rasterizar([[grade]], escala, xadrez=False)
    _escrever_rgba(caminho, w, h, linhas)
    return w, h


def escrever_tira(caminho: Path, quadros: list[Grade], escala: int = ESCALA) -> tuple[int, int]:
    """Tira horizontal de quadros, para animar por CSS.

    O CSS anima `background-position` com `steps(n)`: zero timer em JS, zero
    re-render de React por quadro. Todos os quadros TÊM de ter a mesma
    largura, senão o passo do steps() desalinha e a animação treme.
    """
    if not quadros:
        raise ErroDeArte("tira sem quadros")
    larguras = {g.largura for g in quadros}
    if len(larguras) != 1:
        raise ErroDeArte(f"tira com larguras diferentes: {sorted(larguras)}")
    w, h, linhas = _rasterizar([quadros], escala, xadrez=False)
    _escrever_rgba(caminho, w, h, linhas)
    return w, h


def escrever_folha_de_contato(
    caminho: Path,
    nomeados: list[tuple[str, Grade]],
    por_fila: int = 6,
    escala: int = 2,
) -> tuple[int, int]:
    """Folha de contato: toda a arte num PNG só, em fundo xadrez.

    Existe por um motivo operacional, não estético: quem desenha por
    coordenada NÃO vê o que fez. Renderizar tudo numa imagem e OLHAR é o passo
    que separa sprite de bloco colorido. Fundo xadrez porque erro de alpha é
    invisível em fundo sólido.

    Toda tarefa de arte deste repositório termina olhando esta folha.
    """
    if not nomeados:
        raise ErroDeArte("folha de contato sem arte")
    alt = max(g.altura for _, g in nomeados)
    larg = max(g.largura for _, g in nomeados)

    celulas: list[Grade] = []
    for _, g in nomeados:
        cel = Grade(larg + 2, alt + 2)
        # alinhado pela base: comparar altura entre sprites é o ponto da folha
        cel.colar(1 + (larg - g.largura) // 2, 1 + (alt - g.altura), g)
        celulas.append(cel)

    filas: list[list[Grade]] = []
    for i in range(0, len(celulas), por_fila):
        fila = celulas[i : i + por_fila]
        while len(fila) < por_fila:
            fila.append(Grade(larg + 2, alt + 2))
        filas.append(fila)

    w, h, linhas = _rasterizar(filas, escala, xadrez=True)
    _escrever_rgba(caminho, w, h, linhas)
    return w, h
