"""Confere PNG entregue contra o cenário, inclusive escala e primeiro quadro.

Um recorte certo na grade pode estar errado no arquivo publicado. Comparar os
bytes finais detecta escala duplicada, fundo remendado e exportação desatualizada.
O leitor cobre o formato RGBA sem filtros usado pelo nosso gerador stdlib.
"""
from pathlib import Path
import json
import struct
import zlib

RAIZ = Path(__file__).resolve().parent.parent


def ler_png(caminho: Path):
    dados = caminho.read_bytes()
    assert dados[:8] == b'\x89PNG\r\n\x1a\n', caminho
    posicao, comprimido = 8, bytearray()
    largura = altura = 0
    while posicao < len(dados):
        tamanho = struct.unpack('>I', dados[posicao:posicao + 4])[0]
        tipo = dados[posicao + 4:posicao + 8]
        conteudo = dados[posicao + 8:posicao + 8 + tamanho]
        if tipo == b'IHDR':
            largura, altura, bits, cor, *_ = struct.unpack('>IIBBBBB', conteudo)
            assert bits == 8 and cor == 6, caminho
        elif tipo == b'IDAT':
            comprimido.extend(conteudo)
        posicao += tamanho + 12
    cru = zlib.decompress(comprimido)
    passo = largura * 4 + 1
    assert len(cru) == passo * altura, caminho
    assert all(cru[y * passo] == 0 for y in range(altura)), caminho
    return largura, altura, [cru[y * passo + 1:(y + 1) * passo] for y in range(altura)]


def main():
    ativos = RAIZ / 'public/assets'
    regioes = json.loads((ativos / 'ambientes/manifest.json').read_text(encoding='utf-8'))
    resultados = []
    for nome, recortes in regioes.items():
        _, _, fundo = ler_png(ativos / f'cenarios/{nome}.png')
        for indice, (x, y, w, h) in enumerate(recortes):
            caminho = ativos / f'ambientes/{nome}-{indice}.png'
            largura, altura, parado = ler_png(caminho)
            assert (largura, altura) == (w * 4, h * 4), caminho
            esperado = [linha[x * 16:(x + w) * 16] for linha in fundo[y * 4:(y + h) * 4]]
            assert parado == esperado, f'Recorte remenda o fundo: {caminho}'
            tw, th, tira = ler_png(caminho.with_name(f'{nome}-{indice}-idle.png'))
            assert (tw, th) == (largura * 2, altura), caminho
            primeiro = [linha[:largura * 4] for linha in tira]
            segundo = [linha[largura * 4:] for linha in tira]
            assert primeiro == parado, f'Primeiro quadro deslocado: {caminho}'
            mudancas = sum(a != b for la, lb in zip(primeiro, segundo) for a, b in zip(la, lb))
            assert mudancas > 0, f'Animacao sem movimento: {caminho}'
            resultados.append({'cenario': nome, 'recorte': indice, 'bytesAlterados': mudancas})
    destino = RAIZ / 'docs/arte/v2-4/recortes.json'
    destino.write_text(json.dumps(resultados, indent=2), encoding='utf-8')
    print(f'{len(resultados)} recortes: escala 4x, fundo intacto e dois quadros distintos.')


if __name__ == '__main__':
    main()
