"""Pequenas histórias ambientais, sem alterar o roteiro nem a circulação."""
from pathlib import Path
import json
from .nucleo import Grade, escrever_sprite, escrever_tira, escrever_folha_de_contato
from . import props, personagens


def posto(quadro: int = 0, *, compartilhado: bool = False) -> Grade:
    """Pessoa sentada: coxas horizontais e teclado apoiado no tampo."""
    g = Grade(84 if compartilhado else 120, 48 if compartilhado else 88)
    # No escritório, o rosto fica além da silhueta de Rafael. No bench, o
    # notebook precisa terminar antes da borda traseira, sem cortar sua tela.
    deslocamento = 12 if compartilhado else 48
    g.colar(deslocamento + 1, 26, props.cadeira_escritorio())
    altura_da_pessoa = 1 if compartilhado else 5
    g.colar(deslocamento, altura_da_pessoa, personagens.figurante_digitando(quadro=quadro))
    if not compartilhado:
        # Uma única mesa ocupa exatamente a pegada do móvel original.
        # Colar outra mesa no fim criava gavetas e tampos incompatíveis.
        g.colar(0, 52, props.mesa_de_trabalho(120, 36))
        g.colar(12, 26, props.monitor(32, 26, 'grafico'))
        g.colar(7, 43, props.caneca('5'))
    # A tela oblíqua conserva a silhueta de um computador na escala do jogo;
    # reduzi-la a uma aresta fazia o aparelho parecer um fio sobre a mesa.
    g.colar(deslocamento + 32, 27 if not compartilhado else 23, props.notebook_obliquo())
    # O aparelho fica atrás dos dedos. A mesma camada usada no corpo mantém
    # os dois cotovelos ligados, sem inventar uma terceira mão sobre a tela.
    g.colar(deslocamento, altura_da_pessoa, personagens.bracos_digitando(quadro=quadro))
    return g


def sofa_ocupado(g: Grade, *, festa: bool = False, quadro: int = 0) -> None:
    """Quadris nas almofadas; objetos no colo têm dono e uma silhueta clara."""
    g.colar(389, 167, personagens.figurante_sentado(variacao=2, atividade='conversa' if festa else 'livro', quadro=quadro))
    g.colar(421, 167, personagens.figurante_sentado(variacao=1, atividade='conversa' if festa else 'celular', quadro=quadro))


def inspecao(g: Grade, quadro: int = 0) -> None:
    # Bancada de teste separada da esteira: medição de uma amostra de rádio.
    g.colar(409, 101, personagens.figurante_cafe(variacao=2))
    g.colar(395, 139, props.mesa_de_trabalho(58, 42))
    g.colar(400, 122, props.radio_de_telecom(14, 17))
    g.colar(434, 129, props.notebook(18, 10, 'grafico'))
    g.retangulo(426, 135 - quadro, 7, 3, 's')
    props.linha(g, 413, 134, 427, 136 - quadro, 'D')
    g.retangulo(416, 132, 7, 5, '2')
    g.retangulo(417, 133, 5, 2, 'L' if quadro else 'J')


def credenciamento(g: Grade, quadro: int = 0) -> None:
    g.colar(58, 91, personagens.figurante_cafe(variacao=0))
    # Balcão oculta as pernas porque a pessoa trabalha atrás dele; prancheta
    # tem caneta na mão, sem criar um novo personagem clicável do roteiro.
    g.colar(64, 124, props.armario_baixo(42, 26))
    g.colar(68, 116, props.pilha_de_papel(14, 8))
    g.colar(94, 107, props.garrafa_agua(17))
    g.retangulo(68, 120, 4, 3, 't')
    props.linha(g, 71, 119, 77 + quadro, 115, '2')


def decorar(g: Grade, nome: str, quadro: int = 0) -> None:
    if nome == 'escritorio':
        g.colar(296, 110, posto(quadro))
        g.colar(194, 58, props.painel_de_post_its(66, 32))
        # Patinho de depuração na divisória; antena e ondas num cartão ao lado.
        g.retangulo(271, 109, 8, 5, 'x')
        g.retangulo(275, 106, 5, 5, 'y')
        g.ponto(278, 107, 'K')
        g.retangulo(280, 109, 3, 2, 'v')
        # Fone pendurado na divisória e cabo até o dock: equipamento tem apoio.
        props.linha(g, 184, 113, 184, 128, '2')
        g.moldura(181, 121, 8, 10, '2')
        g.retangulo(180, 125, 3, 7, '5')
        g.retangulo(188, 125, 3, 7, '4')
    elif nome.startswith('cafezinho'):
        g.colar(275, 79, props.prateleira(52, 36))
        g.colar_base(293, 79, props.vaso_planta_baixa(18))
        g.colar(303, 72, props.caneca('5'))
        sofa_ocupado(g, festa=nome.endswith('festa'), quadro=quadro)
        # Menu em giz, com pequena xícara desenhada; leitura vem da silhueta.
        g.retangulo(168, 71, 42, 32, 'm')
        g.retangulo(171, 74, 36, 26, '1')
        for y, w in ((80, 24), (86, 18), (92, 22)):
            g.linha_h(177, y, w, '7')
        g.retangulo(199, 93, 5, 4, '7')
        g.moldura(204, 94, 3, 3, '7')
        g.linha_h(198, 98, 9, '7')
    elif nome == 'linha-producao':
        g.colar(308, 61, props.quadro_branco(42, 32))
        g.retangulo(356, 85, 40, 32, '3')
        g.moldura(356, 85, 40, 32, '5')
        for x in (362, 372, 382):
            g.retangulo(x, 96, 3, 16, '6')
            g.moldura(x - 2, 92, 7, 7, '7')
        g.colar(405, 95, props.caixa_papelao(24, 18, aberta=True))
        g.retangulo(402, 113, 30, 3, '5')
        g.linha_h(402, 113, 30, '7')
        g.retangulo(405, 116, 3, 7, '2')
        g.retangulo(426, 116, 3, 7, '2')
        inspecao(g, quadro)
    elif nome == 'sala-reunioes':
        # Credenciamento lateral, longe do palco e dos pés da plateia.
        credenciamento(g, quadro)
        g.colar(406, 111, props.cartaz(22, 34, acento='x'))
    elif nome == 'outra-area':
        g.colar(292, 82, posto(quadro, compartilhado=True))
        g.colar(182, 54, props.painel_de_post_its(50, 30))
        g.colar(432, 110, props.radio_de_telecom(14, 22))
        g.retangulo(428, 132, 24, 3, '4')
        g.linha_h(428, 132, 24, '7')
        g.retangulo(431, 135, 3, 5, '2')
        g.retangulo(446, 135, 3, 5, '2')
        # Planta está à frente da mesa, não cortada pela frente da gaveta.
        g.colar_base(412, 190, props.vaso_planta_alta(62))
        # Tapete de manutenção com parafusos, chave e placa sobre o bench.
        g.retangulo(222, 139, 34, 10, 'H')
        g.moldura(222, 139, 34, 10, 'J')
        for x in (225, 229, 233):
            g.retangulo(x, 142, 2, 2, '7')
        props.linha(g, 239, 144, 249, 144, '6')
        g.moldura(249, 141, 4, 5, '7')


# Regiões de arte, em pixels de origem; a UI usa exatamente estes recortes.
REGIOES = {
    'escritorio': [(296, 110, 120, 88), (23, 88, 28, 42), (192, 40, 15, 15)],
    'cafezinho': [(155, 107, 50, 56), (389, 167, 82, 68), (282, 57, 22, 22)],
    'cafezinho-festa': [(110, 104, 96, 12), (389, 167, 82, 68), (282, 57, 22, 22)],
    'linha-producao': [(395, 101, 58, 84), (430, 38, 15, 15), (220, 82, 24, 40)],
    'sala-reunioes': [(58, 91, 50, 84), (122, 16, 18, 10), (0, 174, 30, 64)],
    'outra-area': [(292, 82, 84, 48), (124, 114, 22, 17), (432, 110, 14, 22)],
}


def ambientes(destino: Path, cenas: list[tuple[str, Grade]]) -> None:
    destino.mkdir(parents=True, exist_ok=True)
    (destino / 'manifest.json').write_text(json.dumps(REGIOES, indent=2), encoding='utf-8')
    pecas = []
    for nome, base in cenas:
        # Regenerar a cena com a pose alternativa conserva o fundo real por
        # trás do braço. Não há pixels inventados nem caneca duplicada.
        from .cenarios import cafezinho, escritorio, outra_area, linha_producao, sala_reunioes
        alternativa = {
            'escritorio': lambda: escritorio(quadro=1),
            'cafezinho': lambda: cafezinho(gesto=True),
            'cafezinho-festa': lambda: cafezinho(festa=True, gesto=True),
            'linha-producao': lambda: linha_producao(quadro=1),
            'sala-reunioes': lambda: sala_reunioes(quadro=1),
            'outra-area': lambda: outra_area(quadro=1),
        }[nome]()
        for indice, (x, y, w, h) in enumerate(REGIOES[nome]):
            quadros = []
            for fase in range(2):
                g = Grade(w, h)
                for py in range(h):
                    for px in range(w):
                        g.ponto(px, py, base.em(x + px, y + py))
                if (indice == 0 and nome != 'cafezinho-festa') or (indice == 1 and nome.startswith('cafezinho')):
                    if fase:
                        for py in range(h):
                            for px in range(w):
                                g.ponto(px, py, alternativa.em(x + px, y + py))
                elif (nome == 'escritorio' and indice == 2) or (nome == 'linha-producao' and indice == 1):
                    if fase:
                        # Só o ponteiro muda: a moldura já recebeu a iluminação
                        # do cenário e não pode ser repintada com outra paleta.
                        g.ponto(9, 8, '8')
                        g.ponto(10, 8, '8')
                        g.ponto(9, 6, '2')
                elif nome == 'cafezinho-festa' and indice == 0:
                    if fase:
                        for py in range(h):
                            for px in range(w):
                                if g.em(px, py) in 'xyz':
                                    g.ponto(px, py, 'w')
                elif (nome.startswith('cafezinho') and indice == 2) or (nome == 'sala-reunioes' and indice == 2):
                    # Só a ponta das folhas oscila; vaso e caule continuam presos.
                    if fase:
                        for py in range(h - 8):
                            for px in range(w - 2):
                                cor = base.em(x + px, y + py)
                                if cor in 'fghi' and (px + py) % 7 == 0:
                                    g.ponto(px, py, props.mais_claro(cor))
                elif nome == 'sala-reunioes':
                    if fase:
                        g.retangulo(12, 4, 2, 2, 'J')
                elif nome == 'outra-area' and indice == 1:
                    if fase:
                        g.linha_h(5, 10, 10, 'L')
                elif nome == 'linha-producao' and indice == 0:
                    if fase:
                        g.retangulo(27, 19, 7, 5, 'g')
                else:
                    # Pilotos de atividade em racks e amostras de telecom.
                    if fase:
                        g.retangulo(w // 2, h // 2, 2, 2, 'J')
                quadros.append(g)
            arquivo = destino / f'{nome}-{indice}.png'
            escrever_sprite(arquivo, quadros[0])
            escrever_tira(destino / f'{nome}-{indice}-idle.png', quadros)
            pecas.extend((f'{nome} {indice} q{q}', g) for q, g in enumerate(quadros))
    raiz = Path(__file__).resolve().parents[2]
    escrever_folha_de_contato(raiz / 'docs/arte/contato-ambientes.png', pecas, por_fila=6, escala=3)


def campus() -> Grade:
    g = Grade(480, 270, 'a')
    # Pequena ilha industrial: costa recortada, cais e jardim de antenas.
    g.dither(0, 0, 480, 270, 'a', 'b', 'esparso')
    # Costa em degraus e talude iluminado: a ilha tem volume e deixa o mar
    # visível nas bordas, em vez de parecer um retângulo de carpete verde.
    for y in range(18, 245):
        recuo = 16 if y < 34 or y > 226 else 8 if y < 48 or y > 212 else 0
        esquerda, direita = 12 + recuo, 452 - recuo
        g.linha_h(esquerda + 3, y + 7, direita - esquerda, 'n')
        g.linha_h(esquerda + 1, y + 3, direita - esquerda, 'q')
        g.linha_h(esquerda, y, direita - esquerda, 'g')
    for y in range(24, 234, 7):
        for x in range(20 + y % 13, 442, 29):
            if g.em(x, y) == 'g':
                g.linha_h(x, y, 2, 'h')
    # Caminhos e prédios são camadas derivadas das posições dos destinos.
    # Duplicá-los no fundo produzia duas plantas diferentes sobrepostas.
    for x, y, w, h in ((112, 85, 29, 27), (250, 142, 24, 20), (389, 162, 35, 18)):
        g.retangulo(x, y, w, h, 'p')
        g.retangulo(x + 2, y + 2, w - 4, h - 4, 'I')
        for linha in range(y + 6, y + h - 2, 5):
            g.linha_h(x + 6, linha, w - 12, 'J')
    for x, y in ((22, 95), (138, 30), (277, 92), (404, 48), (422, 181), (136, 208), (273, 216), (18, 214)):
        # Árvores do jardim têm tronco e copa; vasos de escritório gigantes
        # no mapa confundiam a escala da maquete.
        props._elipse(g, x + 9, y + 18, 10, 3, 'f')
        g.retangulo(x + 7, y + 8, 4, 10, 'o')
        props._elipse(g, x + 9, y + 6, 10, 8, 'f')
        props._elipse(g, x + 8, y + 4, 8, 7, 'h')
        props._elipse(g, x + 5, y + 2, 4, 3, 'i')
    # Heliponto de conexão e pequena antena no extremo do campus.
    g.moldura(391, 104, 40, 34, 'q')
    g.linha_v(400, 111, 20, '7'); g.linha_v(420, 111, 20, '7')
    g.linha_h(400, 120, 21, '7')
    g.colar(390, 202, props.radio_de_telecom(14, 24))
    for x in range(32, 440, 35):
        g.linha_h(x, 249, 16, 'c')
    for x, y in ((101, 152), (260, 45), (358, 185), (142, 181)):
        g.retangulo(x, y, 14, 4, 'p')
        g.linha_h(x, y, 14, 'r')
        g.retangulo(x + 2, y + 4, 2, 3, '2')
        g.retangulo(x + 10, y + 4, 2, 3, '2')
    for x in (383, 394, 405):
        props._elipse(g, x, 78, 3, 3, '2')
        props._elipse(g, x + 6, 78, 3, 3, '2')
        props.linha(g, x, 78, x + 3, 71, '7')
        props.linha(g, x + 3, 71, x + 6, 78, '7')
    for x, y in ((140, 96), (288, 50), (370, 205), (85, 201)):
        g.retangulo(x, y, 2, 10, '2')
        g.retangulo(x - 2, y - 2, 6, 4, 'y')
    # Pátio de antenas e pequenas histórias legíveis junto aos destinos.
    g.retangulo(391, 154, 42, 39, 'c')
    g.moldura(391, 154, 42, 39, '5')
    for ax in (400, 423):
        g.retangulo(ax - 2, 173, 5, 14, '3')
        props.linha(g, ax, 157, ax - 8, 180, '7')
        props.linha(g, ax, 157, ax + 8, 180, '6')
        g.linha_v(ax, 157, 25, '7')
        g.linha_h(ax - 5, 168, 11, '7')
        g.ponto(ax, 154, 'F')
    # Técnico no pátio: capacete, tablet e caixa de ferramentas.
    g.retangulo(412, 177, 4, 4, 's')
    g.retangulo(411, 176, 6, 2, 'x')
    g.retangulo(411, 181, 6, 7, 'J')
    g.retangulo(410, 188, 2, 5, '2')
    g.retangulo(415, 188, 2, 5, '2')
    g.retangulo(416, 183, 4, 4, '7')
    g.retangulo(422, 190, 7, 4, 'D')
    # Praça central: mosaico de circuito e fonte de três níveis.
    g.retangulo(160, 110, 39, 21, 'c')
    for cy in (113, 126):
        g.linha_h(163, cy, 33, '5')
    props._elipse(g, 180, 122, 10, 5, '5')
    props._elipse(g, 180, 120, 8, 3, 'J')
    g.retangulo(178, 111, 4, 10, '6')
    g.linha_v(179, 106, 10, 'M')
    # Mesa externa com duas pessoas sentadas, fora dos caminhos de viagem.
    g.retangulo(272, 174, 18, 6, 'p')
    g.linha_h(272, 174, 18, 'r')
    for px in (274, 285):
        g.retangulo(px, 167, 3, 4, 's')
        g.retangulo(px - 1, 171, 5, 4, 'J' if px == 274 else 'D')
    g.retangulo(279, 173, 4, 2, '8')
    return g


def campus_em_movimento(base: Grade) -> Grade:
    g = base.clone()
    # O ambiente muda dentro da mesma grade, sem deslocar a ilha ou os caminhos.
    for y in range(270):
        for x in range(480):
            if base.em(x, y) == 'J' and (x + y) % 9 == 0:
                g.ponto(x, y, 'L')
    g.ponto(178, 108, 'M')
    g.ponto(181, 112, 'M')
    g.ponto(177, 117, 'M')
    g.retangulo(416, 183, 3, 2, 'J')
    for x in (400, 423):
        g.ponto(x, 154, 'x')
    return g


def marco(nome: str) -> Grade:
    g = Grade(68, 36)
    props._elipse(g, 34, 32, 33, 3, '1')
    g.retangulo(5, 11, 57, 21, '4')
    g.retangulo(5, 11, 57, 6, '6')
    g.linha_h(5, 11, 57, '8')
    g.linha_v(61, 17, 15, '2')
    for x in (10, 21, 43, 54):
        g.retangulo(x, 20, 6, 7, 'H')
        g.linha_h(x, 20, 6, 'L')
    g.retangulo(30, 21, 9, 11, '1')
    if nome == 'escritorio':
        g.retangulo(15, 1, 38, 11, '5')
        for x in (20, 31, 42):
            g.retangulo(x, 4, 6, 5, 'J')
        g.linha_v(57, 2, 9, '7')
        g.linha_h(53, 3, 9, '7')
    elif nome == 'cafezinho':
        for x in range(5, 61, 8):
            g.retangulo(x, 13, 4, 5, 'x')
        g.colar(28, 1, props.caneca('y', vapor=True))
        g.colar(0, 21, props.vaso_planta_baixa(12))
    elif nome == 'linha-producao':
        for x in (10, 28, 46):
            for i in range(12):
                g.linha_v(x + i, 11 - i // 2, i // 2 + 1, '6')
        g.retangulo(55, 1, 5, 11, '3')
        g.linha_h(54, 1, 7, '7')
        g.retangulo(26, 20, 19, 12, '2')
        for y in (21, 24, 27):
            g.linha_h(27, y, 17, '5')
    elif nome == 'sala-reunioes':
        g.retangulo(12, 5, 44, 9, 'D')
        g.linha_h(14, 7, 40, 'F')
        for x in (16, 48):
            g.retangulo(x, 20, 4, 12, '7')
        g.retangulo(24, 18, 22, 3, 'y')
    else:
        g.retangulo(12, 3, 42, 10, 'b')
        for x in range(16, 51, 7):
            g.retangulo(x, 5, 4, 6, 'J')
        g.colar(49, 20, props.vaso_planta_baixa(14))
    return g
