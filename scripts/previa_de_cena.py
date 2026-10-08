"""
Prévia composta: cenário + elenco + itens nas coordenadas reais do conteúdo.

POR QUE ISTO EXISTE
Toda a arte pode estar correta e todas as coordenadas podem passar nos testes, e
a cena ainda sair errada — porque ninguém nunca vê as duas coisas JUNTAS. Foi
assim que oito figuras acabaram de pé sobre o mobiliário: `cenarios.py` estava
certo, `bloco*.ts` estava certo, e o defeito vivia na junta.

`src/ui/Cena.chao.test.ts` é o guard automático (pé fora do piso reprova).
Este script é o guard humano: monta a imagem que a plateia vai ver e deixa
OLHAR. Os dois são necessários — o teste pegou as 21 figuras sobre móvel, mas
só a prévia pega monitor flutuando e Ana cobrindo NPC.

    python scripts/previa_de_cena.py

Escreve docs/arte/previa-b<N>-<lugar>.png, uma por cena.

LIMITAÇÃO DECLARADA
As coordenadas são extraídas dos .ts por expressão regular, não por parser de
TypeScript. É adequado porque isto é ferramenta de olhar, não porta de
qualidade: se o parse errar, a prévia sai visivelmente torta e o erro se
denuncia. A porta de qualidade é o teste em vitest, que lê o conteúdo de
verdade.
"""

from __future__ import annotations

import re
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

for _f in (sys.stdout, sys.stderr):
    if hasattr(_f, "reconfigure"):
        _f.reconfigure(encoding="utf-8", errors="replace")

from pixelart import CENA, Grade, escrever_sprite  # noqa: E402
from pixelart import cenarios, itens, personagens  # noqa: E402

LARGURA, ALTURA = CENA
CONTEUDO = RAIZ / "src" / "domain" / "content"
SAIDA = RAIZ / "docs" / "arte"

# sprite da Ana por bloco, conforme src/domain/content/blocos.ts
SPRITE_POR_BLOCO = {
    1: "ana-nivel-1",
    2: "ana-nivel-2",
    3: "ana-nivel-3",
    4: "ana-nivel-4",
    5: "ana-nivel-5",
    6: "ana-nivel-6",
}

RE_CENA = re.compile(r"lugarId:\s*'([a-z-]+)'\s*,\s*\n\s*bloco:\s*(\d)")
RE_HOTSPOT = re.compile(
    r"id:\s*'([^']+)'.*?"
    r"pos:\s*\{\s*x:\s*(-?[\d.]+)\s*,\s*y:\s*(-?[\d.]+)\s*\}.*?"
    r"parada:\s*\{\s*x:\s*(-?[\d.]+)\s*,\s*y:\s*(-?[\d.]+)\s*\}",
    re.S,
)
RE_ARTE = re.compile(
    r"arte:\s*\{\s*tipo:\s*'(npc|item|objeto)'\s*,\s*"
    r"(?:npcId|itemId|assetId):\s*'([^']+)'"
)
RE_ANCORA = re.compile(r"ancora:\s*'(base|centro)'")


def catalogo() -> dict[str, Grade]:
    """Toda a arte por nome, pegando as grades direto dos módulos."""
    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp)
        pecas: list[tuple[str, Grade]] = []
        for modulo, sub in ((cenarios, "cenarios"), (personagens, "protagonista"), (itens, "itens")):
            try:
                pecas.extend(modulo.gerar(d / sub))
            except Exception as e:  # noqa: BLE001
                print(f"aviso: {modulo.__name__}.gerar falhou ({e})")
        # objetos interativos não entram no retorno de `gerar` (têm folha
        # própria), mas a prévia precisa deles: são metade dos hotspots
        try:
            pecas.extend(cenarios._objetos())  # noqa: SLF001
        except Exception as e:  # noqa: BLE001
            print(f"aviso: objetos não carregaram ({e})")
    return dict(pecas)


def arte_de(cat: dict[str, Grade], tipo: str, ident: str) -> Grade | None:
    """Resolve o nome do asset tolerando as convenções dos três módulos."""
    tentativas = [ident]
    if tipo == "objeto":
        tentativas += [ident.removeprefix("objeto-")]
    if tipo == "item":
        tentativas += [f"{ident}-cena"]
    for chave in tentativas:
        if chave in cat:
            return cat[chave]
    return None


def blocos() -> list[tuple[str, int, list[dict[str, object]]]]:
    saida: list[tuple[str, int, list[dict[str, object]]]] = []
    for arquivo in sorted(CONTEUDO.glob("bloco[0-9].ts")):
        texto = arquivo.read_text(encoding="utf-8")
        # corta por cena: cada `lugarId`+`bloco` abre um trecho
        marcas = [(m.start(), m.group(1), int(m.group(2))) for m in RE_CENA.finditer(texto)]
        for i, (inicio, lugar, bloco) in enumerate(marcas):
            fim = marcas[i + 1][0] if i + 1 < len(marcas) else len(texto)
            trecho = texto[inicio:fim]
            # o bloco de hotspots termina onde começam os diálogos
            corte = trecho.find("DIALOGOS_")
            if corte > 0:
                trecho = trecho[:corte]
            hotspots: list[dict[str, object]] = []
            for m in RE_HOTSPOT.finditer(trecho):
                depois = trecho[m.end() : m.end() + 600]
                arte = RE_ARTE.search(trecho[m.start() : m.end() + 600])
                # A UI respeita dimensões declaradas do hotspot. Ignorá-las
                # mostrava pranchetas e púlpitos gigantes só nesta ferramenta.
                bloco_arte = trecho[m.start():m.end()].split('arte:', 1)[-1].split('}', 1)[0]
                dimensoes = dict(re.findall(r'(largura|altura):\s*(\d+)', bloco_arte))
                anc = RE_ANCORA.search(depois)
                hotspots.append(
                    {
                        "id": m.group(1),
                        "pos": (float(m.group(2)), float(m.group(3))),
                        "parada": (float(m.group(4)), float(m.group(5))),
                        "tipo": arte.group(1) if arte else None,
                        "ident": arte.group(2) if arte else None,
                        "ancora": anc.group(1) if anc else "base",
                        "dimensoes": dimensoes,
                    }
                )
            saida.append((lugar, bloco, hotspots))
    return saida


def em_arte(pct: tuple[float, float]) -> tuple[int, int]:
    return round(pct[0] / 100 * LARGURA), round(pct[1] / 100 * ALTURA)


def cenario_de(cat: dict[str, Grade], lugar: str, bloco: int) -> Grade | None:
    """Cenário do par (lugar, fase), não só do lugar.

    O mesmo lugar pode ter vestimenta por fase: o Cafezinho da fase 6 é a versão
    de FESTA. A regra vive em `assetDoCenario` em src/assets/manifest.ts, que é a
    fonte de verdade; aqui ela é espelhada porque a prévia precisa mostrar o que
    a plateia vai ver.

    Existe por um defeito real: o manifest já devolvia o cenário de festa e
    `Cena.tsx` chamava `assetDoCenario` sem passar a fase, então a arte de festa
    nunca chegava à tela. A prévia não pegou porque também ignorava a fase — a
    ferramenta de olhar tinha o mesmo ponto cego que o código.
    """
    if lugar == "cafezinho" and bloco == 6:
        festa = cat.get("cafezinho-festa")
        if festa is not None:
            return festa
        print("aviso: cafezinho-festa não existe; usando o cafezinho comum")
    return cat.get(lugar)


def main() -> int:
    cat = catalogo()
    if not cat:
        print("nenhuma arte disponível")
        return 1

    total = 0
    for lugar, bloco, hotspots in blocos():
        fundo = cenario_de(cat, lugar, bloco)
        if fundo is None:
            print(f"aviso: sem cenário para {lugar}")
            continue
        g = fundo.clone()

        # Cadeiras vazias formam a base; as duas camadas ocupadas recompõem as
        # fileiras sem hotspot e na mesma ordem de sobreposição usada pela UI.
        if lugar == "sala-reunioes" and bloco == 4:
            cadeiras = cat.get("plateia-vazia")
            if cadeiras is not None:
                g.colar_base(round(0.53 * LARGURA), round(0.854 * ALTURA), cadeiras)
            tras = cat.get("plateia")
            if tras is not None:
                g.colar_base(round(0.53 * LARGURA), round(0.854 * ALTURA) - 30, tras)
            frente = cat.get("plateia-frente")
            if frente is not None:
                g.colar_base(round(0.53 * LARGURA), round(0.854 * ALTURA), frente)

        # Camadas de CSS da esteira e dos robÃ´s ganham um quadro estÃ¡tico na
        # prÃ©via para conferir apoio e colisÃ£o com o cenÃ¡rio real.
        if lugar == "linha-producao" and bloco == 3:
            repouso = cat.get("braco-robotico")
            radios = ("radio-telecom", "radio-telecom-aberto", "radio-telecom")
            for esquerda, ident in zip((108, 184, 260), radios):
                radio = cat.get(ident)
                if radio is not None:
                    g.colar_base(esquerda + radio.largura // 2, 145, radio)
            if repouso is not None:
                for centro in (134, 210):
                    g.colar_base(centro, 142, repouso)

        # Assuntos de uma mesma pessoa compartilham o corpo na UI.
        pessoas_vistas = set()
        # arte dos hotspots primeiro: a Ana entra por cima, como na cena real
        for h in hotspots:
            tipo, ident = h["tipo"], h["ident"]
            if not tipo or not ident:
                continue
            if tipo == 'npc':
                if ident in pessoas_vistas:
                    continue
                pessoas_vistas.add(ident)
            peca = arte_de(cat, str(tipo), str(ident))
            if peca is None:
                print(f"aviso: {lugar}/B{bloco} '{h['id']}' sem arte para {ident}")
                continue
            dimensoes = h['dimensoes']
            if 'largura' in dimensoes and 'altura' in dimensoes:
                w, altura_peca = int(dimensoes['largura']) // 4, int(dimensoes['altura']) // 4
                ajustada = Grade(w, altura_peca)
                for py in range(altura_peca):
                    for px in range(w):
                        ajustada.ponto(px, py, peca.em(px * peca.largura // w, py * peca.altura // altura_peca))
                peca = ajustada
            x, y = em_arte(h["pos"])  # type: ignore[arg-type]
            if h["ancora"] == "centro":
                g.colar(x - peca.largura // 2, y - peca.altura // 2, peca)
            else:
                g.colar_base(x, y, peca)

        ana = cat.get(SPRITE_POR_BLOCO.get(bloco, "ana-neutra"))
        if ana is not None:
            # uma Ana por hotspot: mostra TODOS os pontos de parada de uma vez,
            # que é o que revela parada em cima de móvel ou de NPC
            for h in hotspots:
                x, y = em_arte(h["parada"])  # type: ignore[arg-type]
                g.colar_base(x, y, ana)

        destino = SAIDA / f"previa-b{bloco}-{lugar}.png"
        w, hgt = escrever_sprite(destino, g)
        print(f"{lugar}/B{bloco}: {len(hotspots)} hotspots -> {destino.name} ({w}x{hgt})")
        total += 1

    print(f"\n{total} prévias em {SAIDA.relative_to(RAIZ)}  <- OLHE ESTAS IMAGENS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
