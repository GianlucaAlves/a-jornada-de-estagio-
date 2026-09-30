"""
Paleta de pixel art do projeto.

Um char = uma cor. É a chave que os módulos de arte usam na grade.

POR QUE A PALETA ANTIGA NÃO SERVIA
A `PALETA` de src/arte/paleta.ts tem 12 cores e quase todas no mesmo hue frio
(#16242e, #2e4654). Com um hue só não existe oposição quente/frio, e sem
oposição toda cena lê como monótona por mais detalhe que se coloque. Também
havia dois valores por hue, o que impede sombrear: uma forma com dois tons é
um decalque, não um volume.

O QUE MUDOU
Rampas de 4 a 5 valores por família, e famílias quentes de verdade para se
opor ao frio corporativo: madeira, luz de lâmpada, verde de planta, vermelho.
A referência que a gente está seguindo (Fate of Atlantis) tira a riqueza dela
exatamente disso — pedra cor de areia contra mar azul, folhagem verde contra
sombra fria. O escritório continua Ericsson e continua frio; o que entra é o
contraponto quente que faz o frio LER como frio.

REGRA DE USO
Frio domina a área, quente domina a atenção. Numa cena típica: 70% neutros e
azuis, 20% madeira, 10% luz/verde/vermelho somados. Invertendo isso a cena
vira um circo e perde o lugar.

Convenção dos chars: minúscula = tom escuro da família, MAIÚSCULA = tom claro.
`.` é transparente e nunca é cor.
"""

from __future__ import annotations

# --------------------------------------------------------------- contorno
# Um só preto-azulado para TODO contorno do jogo. Contorno de cor variável é
# o erro que faz sprites de autores diferentes não pertencerem à mesma cena.
CONTORNO = "K"

PALETA: dict[str, tuple[int, int, int]] = {
    # ------------------------------------------------------------ contorno
    "K": (0x0B, 0x0F, 0x16),  # contorno universal
    # --------------------------------------------- neutros frios (concreto,
    # parede, carpete, vidro). A cama de toda cena de escritório.
    "1": (0x14, 0x1B, 0x26),
    "2": (0x22, 0x2E, 0x3E),
    "3": (0x34, 0x45, 0x59),
    "4": (0x4B, 0x60, 0x77),
    "5": (0x6C, 0x84, 0x9B),
    "6": (0x97, 0xAB, 0xBE),
    "7": (0xC3, 0xCE, 0xD4),  # = superficieSombra do vetor
    "8": (0xEE, 0xF2, 0xF4),  # = superficie do vetor
    # ------------------------------------------ azul corporativo (móvel,
    # divisória, terno, carpete escuro)
    "a": (0x0E, 0x1C, 0x2B),
    "b": (0x16, 0x24, 0x2E),  # = ambiente do vetor
    "c": (0x2E, 0x46, 0x54),  # = ambienteClaro do vetor
    "d": (0x3F, 0x63, 0x78),
    "e": (0x5A, 0x8A, 0xA3),
    # ------------------------------------------- madeira (mesa, piso, caixa,
    # prateleira). Principal massa quente da cena.
    "m": (0x2E, 0x1C, 0x12),
    "n": (0x4A, 0x2E, 0x1B),
    "o": (0x6E, 0x47, 0x28),
    "p": (0x96, 0x68, 0x36),
    "q": (0xC2, 0x91, 0x4E),
    "r": (0xE0, 0xB8, 0x7A),
    # ------------------------------------------ luz quente (lâmpada, janela
    # ao poente, poça de luz no chão, reflexo em metal)
    "u": (0x8A, 0x4A, 0x14),
    "v": (0xC9, 0x72, 0x1F),
    "w": (0xF0, 0x98, 0x2C),
    "x": (0xFF, 0xBE, 0x55),
    "y": (0xFF, 0xD4, 0x3B),  # = acento do vetor
    "z": (0xFF, 0xF0, 0xB0),
    # ----------------------------------------- verde (planta). A fonte mais
    # barata de vida num escritório: use em TODA cena.
    "f": (0x12, 0x2A, 0x1A),
    "g": (0x1D, 0x45, 0x27),
    "h": (0x2D, 0x68, 0x38),
    "i": (0x45, 0x8F, 0x4C),
    "j": (0x77, 0xBE, 0x68),
    # ------------------------------------------- vermelho (caneca, cadeira,
    # alerta, extintor, capa de livro). Acento de atenção.
    "C": (0x3E, 0x12, 0x1C),
    "D": (0x6B, 0x1E, 0x2C),
    "E": (0x9E, 0x33, 0x3C),
    "F": (0xC9, 0x50, 0x49),
    "G": (0xF0, 0x7C, 0x63),
    # ---------------------------------------- ciano de tela (monitor ligado,
    # luz de tela no rosto, LED). Assinatura visual de escritório de tech.
    "H": (0x08, 0x2E, 0x38),
    "I": (0x0E, 0x55, 0x62),
    "J": (0x1B, 0x86, 0x95),
    "L": (0x3E, 0xB8, 0xC4),
    "M": (0x92, 0xE8, 0xE8),
    # --------------------------------------------------------------- pele
    # 4 tons de pele, cada um com sombra. O elenco é diverso e isso é dado,
    # não enfeite: NPC sem variação de pele lê como o mesmo NPC repintado.
    "s": (0xF0, 0xC9, 0xA6),
    "S": (0xD3, 0xA7, 0x81),
    "t": (0xC9, 0x8D, 0x62),
    "T": (0xA8, 0x6F, 0x49),
    "k": (0x8D, 0x5A, 0x3B),
    "l": (0x6E, 0x42, 0x2A),
    "N": (0x5A, 0x35, 0x24),
    "O": (0x40, 0x24, 0x1A),
    # -------------------------------------------------------------- cabelo
    "P": (0x2B, 0x20, 0x18),
    "Q": (0x4A, 0x35, 0x26),
    "R": (0x14, 0x14, 0x14),
    "U": (0x8A, 0x85, 0x80),
    # ------------------------------------- roxo (reservado à revelação e ao
    # estado 'futura'. Fora disso, NÃO usar: é o acento que marca o clímax.)
    "V": (0x24, 0x16, 0x38),
    "W": (0x44, 0x28, 0x66),
    "X": (0x6D, 0x44, 0x9E),
    "Y": (0xA0, 0x72, 0xD0),
}

VAZIO = "."

# ------------------------------------------------------------ agrupamentos
# Rampas nomeadas, em ordem escuro -> claro. Sombrear = andar UMA casa na
# rampa, nunca duas: salto de dois valores vira mancha, não sombra.
RAMPAS: dict[str, str] = {
    "neutro": "12345678",
    "azul": "abcde",
    "madeira": "mnopqr",
    "luz": "uvwxyz",
    "verde": "fghij",
    "vermelho": "CDEFG",
    "tela": "HIJLM",
    "pele-clara": "sS",
    "pele-media": "tT",
    "pele-escura": "kl",
    "pele-profunda": "NO",
    "cabelo": "PQRU",
    "roxo": "VWXY",
}


def rampa(nome: str) -> str:
    return RAMPAS[nome]


def mais_escuro(ch: str, passos: int = 1) -> str:
    """Desce `passos` na rampa do char. Usado para sombra coerente."""
    for r in RAMPAS.values():
        if ch in r:
            i = max(0, r.index(ch) - passos)
            return r[i]
    return ch


def mais_claro(ch: str, passos: int = 1) -> str:
    """Sobe `passos` na rampa do char. Usado para luz coerente."""
    for r in RAMPAS.values():
        if ch in r:
            i = min(len(r) - 1, r.index(ch) + passos)
            return r[i]
    return ch
