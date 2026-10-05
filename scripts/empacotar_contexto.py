"""PNG já é comprimido; o ZIP serve para enviar o pacote inteiro com seus textos."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

raiz = Path(__file__).resolve().parent.parent
pasta = raiz / 'docs' / 'arte' / 'contexto-completo-2026-10-04'
indice = json.loads((pasta / 'indice.json').read_text(encoding='utf-8'))
assert len(indice) == json.loads((pasta / 'verificacao.json').read_text(encoding='utf-8'))['capturas']
for nome, arquivos in [
    ('contexto-completo-2026-10-04.zip', sorted(pasta.rglob('*'))),
    ('selecao-para-ia-2026-10-04.zip', sorted((pasta / 'selecao-para-ia').rglob('*'))),
]:
    destino = pasta.parent / nome
    with ZipFile(destino, 'w', ZIP_DEFLATED, compresslevel=6) as pacote:
        for arquivo in arquivos:
            if arquivo.is_file():
                pacote.write(arquivo, arquivo.relative_to(pasta))
    with ZipFile(destino) as pacote:
        assert pacote.testzip() is None
    print(f'{destino.name}: {destino.stat().st_size / 1024 / 1024:.1f} MB')
