"""
Gerador de pixel art do apresentacao_jogo.

Leia `docs/biblia-de-arte.md` antes de escrever arte aqui. A bíblia carrega a
direção, a escala, a paleta, a anatomia de sprite e os erros já cometidos.

Fronteiras de escrita (para vários agentes trabalharem em paralelo):
  nucleo.py       fundação: grade, desenho, contorno, PNG. Mudança só aditiva.
  paleta.py       cores. Mudança só aditiva.
  props.py        props reutilizáveis de cenário
  cenarios.py     os 6 cenários + o mapa
  personagens.py  Ana (4 estados) + 5 NPCs
  itens.py        os 8 itens
"""

from .nucleo import (
    CENA,
    CHAO_DA_CENA,
    ESCALA,
    ErroDeArte,
    Grade,
    contornar,
    escrever_folha_de_contato,
    escrever_sprite,
    escrever_tira,
    verificar_sprite,
)
from .paleta import CONTORNO, PALETA, RAMPAS, VAZIO, mais_claro, mais_escuro, rampa

__all__ = [
    "CENA",
    "CHAO_DA_CENA",
    "CONTORNO",
    "ESCALA",
    "ErroDeArte",
    "Grade",
    "PALETA",
    "RAMPAS",
    "VAZIO",
    "contornar",
    "escrever_folha_de_contato",
    "escrever_sprite",
    "escrever_tira",
    "mais_claro",
    "mais_escuro",
    "rampa",
    "verificar_sprite",
]
