"""
Recuperação one-off: decodifica os PNG da Ana de volta para grade de chars.

Por que existe: o módulo que gerava a Ana foi apagado antes de ser commitado.
Os PNG sobreviveram, e a geometria dela (84 px de arte de altura) é exatamente
a altura-alvo na escala 4x — então a autoria é recuperável sem redesenhar.

O que faz: lê o PNG, desfaz os filtros de scanline, reduz pela escala original
(6x), casa cada RGB com o char mais próximo da PALETA NOVA (os nomes de char
mudaram quando a paleta cresceu) e escreve um módulo Python com as grades.

Descartável depois de rodar uma vez. Não é parte do pipeline.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

from pixelart.paleta import PALETA

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "public" / "assets" / "protagonista"
SAIDA = RAIZ / "scripts" / "pixelart" / "_ana_recuperada.py"
ESCALA_ORIGINAL = 6

NOMES = ["ana-encolhida", "ana-neutra", "ana-confiante", "ana-futura"]


def ler_png(caminho: Path) -> tuple[int, int, list[list[tuple[int, int, int, int]]]]:
    dados = caminho.read_bytes()
    if dados[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{caminho}: não é PNG")

    pos = 8
    largura = altura = profundidade = tipo_cor = 0
    idat = bytearray()
    while pos < len(dados):
        (tamanho,) = struct.unpack(">I", dados[pos : pos + 4])
        tipo = dados[pos + 4 : pos + 8]
        corpo = dados[pos + 8 : pos + 8 + tamanho]
        if tipo == b"IHDR":
            largura, altura, profundidade, tipo_cor = struct.unpack(">IIBB", corpo[:10])
        elif tipo == b"IDAT":
            idat.extend(corpo)
        elif tipo == b"IEND":
            break
        pos += 12 + tamanho

    if (profundidade, tipo_cor) != (8, 6):
        raise ValueError(f"{caminho}: esperado RGBA8, veio {profundidade}/{tipo_cor}")

    cru = zlib.decompress(bytes(idat))
    canais = 4
    passo = largura * canais
    linhas: list[list[tuple[int, int, int, int]]] = []
    anterior = bytearray(passo)
    p = 0
    for _ in range(altura):
        filtro = cru[p]
        p += 1
        linha = bytearray(cru[p : p + passo])
        p += passo
        # desfaz o filtro de scanline (PNG spec, seção 9)
        for i in range(passo):
            a = linha[i - canais] if i >= canais else 0
            b = anterior[i]
            c = anterior[i - canais] if i >= canais else 0
            if filtro == 0:
                pass
            elif filtro == 1:
                linha[i] = (linha[i] + a) & 0xFF
            elif filtro == 2:
                linha[i] = (linha[i] + b) & 0xFF
            elif filtro == 3:
                linha[i] = (linha[i] + (a + b) // 2) & 0xFF
            elif filtro == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                linha[i] = (linha[i] + pred) & 0xFF
            else:
                raise ValueError(f"filtro desconhecido: {filtro}")
        linhas.append(
            [tuple(linha[i : i + 4]) for i in range(0, passo, canais)]  # type: ignore[misc]
        )
        anterior = linha
    return largura, altura, linhas


def char_mais_proximo(rgb: tuple[int, int, int]) -> str:
    melhor, dist_melhor = "K", 1 << 30
    for ch, cor in PALETA.items():
        d = sum((a - b) ** 2 for a, b in zip(rgb, cor))
        if d < dist_melhor:
            melhor, dist_melhor = ch, d
    return melhor


def main() -> int:
    blocos: list[str] = []
    for nome in NOMES:
        caminho = ENTRADA / f"{nome}.png"
        if not caminho.exists():
            print(f"ausente: {caminho}")
            return 1
        w, h, px = ler_png(caminho)
        gw, gh = w // ESCALA_ORIGINAL, h // ESCALA_ORIGINAL
        filas: list[str] = []
        for gy in range(gh):
            fila = []
            for gx in range(gw):
                r, g, b, a = px[gy * ESCALA_ORIGINAL][gx * ESCALA_ORIGINAL]
                fila.append("." if a == 0 else char_mais_proximo((r, g, b)))
            filas.append("".join(fila))
        var = nome.replace("-", "_").upper()
        corpo = ",\n".join(f'    "{f}"' for f in filas)
        blocos.append(f"{var}: list[str] = [\n{corpo},\n]")
        print(f"{nome}: {w}x{h} -> grade {gw}x{gh}")

    cabecalho = '"""\nGrades da Ana recuperadas dos PNG de 6x (ver scripts/_recuperar_ana.py).\n\nCada entrada é uma lista de linhas, 1 char = 1 pixel, chars da PALETA nova.\nO CONTORNO JÁ ESTÁ APLICADO nestas grades: se for redesenhar, apague os \'K\'\nda borda e gere de novo com `contornar()`, senão o contorno engrossa.\n\nPonto de partida para personagens.py, não destino final: os braços da\nencolhida estão errados de propósito documentado na bíblia de arte.\n"""\n\nfrom __future__ import annotations\n\n'
    SAIDA.write_text(cabecalho + "\n\n".join(blocos) + "\n", encoding="utf-8")
    print(f"escrito: {SAIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
