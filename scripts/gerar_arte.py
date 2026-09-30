"""
Regera TODA a pixel art do projeto.

    python scripts/gerar_arte.py            tudo
    python scripts/gerar_arte.py cenarios   só uma frente

Contrato que cada módulo de arte cumpre:

    def gerar(destino: Path) -> list[tuple[str, Grade]]

Escreve os PNG dentro de `destino` e devolve os pares (nome, grade) que vão
para a folha de contato daquela frente. Devolver a grade em vez de só escrever
é o que permite a folha existir — e a folha é o passo em que a arte é OLHADA,
que a bíblia trata como parte de "pronto".

Os módulos são importados de forma tolerante: um módulo ainda não escrito (ou
quebrado) NÃO derruba as outras frentes. Isso existe porque várias frentes
trabalham em paralelo e uma não pode bloquear a outra.
"""

from __future__ import annotations

import importlib
import sys
import traceback
from pathlib import Path

# Windows: o console emite em cp1252 por padrão e come os acentos das mensagens
# (ou faz o chamador falhar ao decodificar a saída, que foi o que aconteceu).
# Forçar UTF-8 aqui vale para qualquer agente que rode isto por pipe.
for _fluxo in (sys.stdout, sys.stderr):
    if hasattr(_fluxo, "reconfigure"):
        _fluxo.reconfigure(encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pixelart import escrever_folha_de_contato  # noqa: E402

# frente -> (módulo, subpasta de saída em public/assets)
FRENTES: dict[str, tuple[str, str]] = {
    "cenarios": ("pixelart.cenarios", "cenarios"),
    "personagens": ("pixelart.personagens", "protagonista"),
    "itens": ("pixelart.itens", "itens"),
    # Retrato de ROSTO da caixa de diálogo (ADR-012). Frente separada de
    # `personagens` de propósito: a grade é outra (40x48 contra 50x84) e a folha
    # de contato precisa ser própria, porque a folha usa uma célula do tamanho da
    # maior peça — nove retratos no meio de nove sprites de corpo inteiro sairiam
    # com metade da célula vazia e a comparação entre rostos, que é o ponto de
    # olhar, ficaria pior.
    "retratos": ("pixelart.retratos", "retratos"),
}


def rodar(frente: str) -> int:
    nome_modulo, subpasta = FRENTES[frente]
    try:
        modulo = importlib.import_module(nome_modulo)
    except ModuleNotFoundError:
        print(f"[{frente}] módulo {nome_modulo} ainda não existe — pulando")
        return 0
    except Exception:
        print(f"[{frente}] módulo não importou:")
        traceback.print_exc()
        return 1

    if not hasattr(modulo, "gerar"):
        print(f"[{frente}] {nome_modulo} não expõe gerar(destino) — pulando")
        return 0

    destino = RAIZ / "public" / "assets" / subpasta
    try:
        pecas = modulo.gerar(destino)
    except Exception:
        print(f"[{frente}] gerar() falhou:")
        traceback.print_exc()
        return 1

    if not pecas:
        print(f"[{frente}] nada gerado")
        return 0

    folha = RAIZ / "docs" / "arte" / f"contato-{frente}.png"
    # cenário é grande: 1 por fila, em escala 1, senão a folha fica gigante
    grande = any(g.largura > 200 for _, g in pecas)
    w, h = escrever_folha_de_contato(
        folha, pecas, por_fila=1 if grande else 6, escala=1 if grande else 3
    )
    print(f"[{frente}] {len(pecas)} peças -> {destino.relative_to(RAIZ)}")
    print(f"[{frente}] folha de contato {w}x{h} -> {folha.relative_to(RAIZ)}  <- OLHE ESTA IMAGEM")
    return 0


def main(argv: list[str]) -> int:
    pedidas = argv[1:] or list(FRENTES)
    desconhecidas = [f for f in pedidas if f not in FRENTES]
    if desconhecidas:
        print(f"frente desconhecida: {desconhecidas}. Disponíveis: {list(FRENTES)}")
        return 2
    return max(rodar(f) for f in pedidas)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
