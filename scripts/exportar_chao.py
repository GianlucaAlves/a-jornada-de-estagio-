"""
Exporta, por cena, em que faixa vertical o pé de uma figura pode cair.

POR QUE ISTO EXISTE
A revisão encontrou oito figuras em pé SOBRE o mobiliário: a Ana sobre a mesa
de reunião, a Ana e a Bianca sobre a mesa longa da sala de treinamento. A causa
é uma cegueira estrutural, não desatenção: os testes de geometria de cena nunca
viram o cenário, e o cenário nunca viu as coordenadas do conteúdo. Cada lado
estava internamente correto.

Este script fecha a lacuna. Para cada coluna de pixel de cada cena, calcula a
faixa contígua de piso disponível e escreve `docs/arte/chao.json`. O teste
`src/ui/Cena.chao.test.ts` consome esse arquivo e falha quando uma `parada` ou
um NPC ancorado no chão cai fora da faixa — ou seja, quando alguém está de pé
sobre um móvel.

COMO O PISO É RECONHECIDO
Pelo char da grade, não por heurística de imagem. Piso é neutro (`12345678`) ou
luz quente (`uvwxyz`, porque poça de luz é piso iluminado). Madeira `mnopqr` é
móvel — com UMA exceção declarada: no cafezinho o piso É de madeira, então lá a
checagem admite madeira e fica mais fraca de propósito. Está anotado como
limitação conhecida em vez de escondido.

Roda dentro de `gerar_arte.py`? Não: é passo separado para não acoplar a frente
de arte à de conteúdo. Rode depois de mexer em cenário.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

for _fluxo in (sys.stdout, sys.stderr):
    if hasattr(_fluxo, "reconfigure"):
        _fluxo.reconfigure(encoding="utf-8", errors="replace")

from pixelart import CENA, Grade  # noqa: E402
from pixelart import cenarios  # noqa: E402

LARGURA, ALTURA = CENA

NEUTRO = set("12345678")
LUZ = set("uvwxyz")
MADEIRA = set("mnopqr")

PISO_PADRAO = NEUTRO | LUZ

# AS CENAS VÊM DO REGISTRO DE `cenarios.py`, NÃO DE UMA LISTA AQUI.
#
# Havia uma tabela de seis cenas copiada à mão neste arquivo, e ela é exatamente a
# forma de defeito que este projeto já pagou caro: duas listas da mesma coisa em
# módulos diferentes, e quem acrescenta um cenário atualiza uma e esquece a outra.
# O sintoma seria silencioso e caro — o mapa de chão passaria a não cobrir a cena
# nova, `Cena.chao.test.ts` não teria faixa para validar e uma figura em pé sobre a
# esteira não reprovaria. A v2 acrescentou três cenas e aposentou três: era a
# atualização perfeita para esquecer.
#
# `cenarios.PISO_COM_MADEIRA` traz junto quais cenas têm piso de madeira de
# verdade, o que também era dado duplicado aqui.
CENAS = {
    **cenarios.CENAS_ATIVAS,
    # As três aposentadas continuam no mapa de chão de propósito, embora não sejam
    # mais exportadas como PNG: enquanto a frente de conteúdo não trocar os
    # `lugarId`, `bloco2.ts` e `bloco3.ts` ainda apontam para elas, e um mapa de
    # chão sem a cena faz o teste reprovar por "coluna sem piso nenhum" em vez de
    # por um defeito real. Sai quando o conteúdo sair.
    **cenarios.CENAS_FORA_DE_CIRCULACAO,
}

PISO_POR_CENA: dict[str, set[str]] = {
    nome: NEUTRO | LUZ | MADEIRA for nome in cenarios.PISO_COM_MADEIRA
}


def faixa_de_piso(grade: Grade, x: int, y0: int, piso: set[str]) -> tuple[int, int] | None:
    """Maior corrida contígua de piso na coluna x, dentro de [y0, ALTURA).

    A maior corrida e não a primeira: acima de uma mesa também há piso visível
    (o fundo da sala), e ancorar por lá poria a figura atrás do móvel. A faixa
    onde a figura realmente anda é a maior.
    """
    melhor: tuple[int, int] | None = None
    inicio: int | None = None
    for y in range(y0, ALTURA):
        if grade.em(x, y) in piso:
            if inicio is None:
                inicio = y
        else:
            if inicio is not None:
                if melhor is None or (y - 1 - inicio) > (melhor[1] - melhor[0]):
                    melhor = (inicio, y - 1)
                inicio = None
    if inicio is not None:
        if melhor is None or (ALTURA - 1 - inicio) > (melhor[1] - melhor[0]):
            melhor = (inicio, ALTURA - 1)
    return melhor


def main() -> int:
    saida: dict[str, dict[str, list[int]]] = {}
    for nome, (funcao, hz) in CENAS.items():
        grade = funcao()
        piso = PISO_POR_CENA.get(nome, PISO_PADRAO)
        topo: list[int] = []
        base: list[int] = []
        for x in range(LARGURA):
            faixa = faixa_de_piso(grade, x, hz, piso)
            if faixa is None:
                topo.append(-1)
                base.append(-1)
            else:
                topo.append(faixa[0])
                base.append(faixa[1])
        saida[nome] = {"topo": topo, "base": base}
        livres = sum(1 for t in topo if t >= 0)
        alturas = [b - t for t, b in zip(topo, base) if t >= 0]
        media = sum(alturas) / len(alturas) if alturas else 0
        print(f"{nome}: {livres}/{LARGURA} colunas com piso, faixa média {media:.1f}px")

    destino = RAIZ / "docs" / "arte" / "chao.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(
        json.dumps(
            {"largura": LARGURA, "altura": ALTURA, "cenas": saida},
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"escrito: {destino.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
