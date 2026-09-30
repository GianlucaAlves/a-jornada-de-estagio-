"""Mostra, por cena, a faixa de piso a cada 4% de largura.

Ferramenta de leitura para escolher `pos` e `parada` com informação em vez de
palpite. Descartável; o guard permanente é `src/ui/Cena.chao.test.ts`.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
for _f in (sys.stdout, sys.stderr):
    if hasattr(_f, "reconfigure"):
        _f.reconfigure(encoding="utf-8", errors="replace")

dados = json.loads((RAIZ / "docs" / "arte" / "chao.json").read_text(encoding="utf-8"))
LARG, ALT = dados["largura"], dados["altura"]

for cena, m in dados["cenas"].items():
    print(f"\n=== {cena} ===")
    print("  x%  |  faixa de piso em y%   | altura")
    for pct in range(4, 100, 4):
        x = round(pct / 100 * LARG)
        x = min(max(x, 0), LARG - 1)
        t, b = m["topo"][x], m["base"][x]
        if t < 0:
            print(f"  {pct:3d}  |  sem piso")
            continue
        print(
            f"  {pct:3d}  |  {t / ALT * 100:5.1f}% .. {b / ALT * 100:5.1f}%  | {b - t:3d}px"
        )
