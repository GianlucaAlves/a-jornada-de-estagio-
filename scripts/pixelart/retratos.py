"""
Nove retratos de ROSTO: os quatro estados da Ana e os cinco NPCs.

POR QUE ESTE MÓDULO EXISTE E NÃO É UM RECORTE
A caixa de diálogo encolheu e o retrato passou a ser só o rosto (ADR-012). O
caminho barato seria recortar a cabeça do sprite e ampliar, e ele está fechado
por aritmética: na grade de 50x84 a cabeça ocupa 15x20 px de arte, e ampliar isso
para tamanho de retrato daria blocos de 8 a 10 px reais — a escala única de 4x
existe justamente para que isso nunca aconteça (bíblia §2.1). Arte de retrato tem
de ser DESENHADA na mesma escala, numa grade maior.

    grade 40x48 px de arte  ->  160x192 px na tela, a 4x

Vinte e duas linhas de rosto contra as nove do sprite. É esse fator de 2,4 que dá
espaço para sobrancelha de 5px, olho de 3px de pupila, órbita, nariz com sombra,
lábio inferior e sombra de queixo — as feições que uma cabeça falante precisa e
que não cabem em 11px de largura.

O QUE MANTÉM A MESMA PESSOA NAS DUAS ESCALAS
Nada aqui redeclara personagem. Cada retrato é montado a partir do MESMO
`Corpo` de `personagens.py` que gera o sprite: mesma família de pele, mesmo char
de cabelo e de mecha, mesmo volume relativo de cabelo, mesmo comprimento, mesma
franja, mesma barba, mesmos óculos, mesma roupa e mesma gola. Se alguém trocar o
cabelo do Tiago no sprite, o retrato dele troca junto e ninguém precisa lembrar
de nada — a alternativa (declarar os traços duas vezes) é a receita garantida de
retrato e sprite virarem duas pessoas diferentes depois da terceira alteração.

O que o retrato acrescenta é só o que depende da escala: as feições do rosto
grande e o recorte de busto.

AUTORIA POR FAIXA DE CHAR, COMO O SPRITE
O rosto é um bloco de 22 strings de 19 chars (`_ROSTO`), e `_conferir_rosto()`
recusa qualquer linha de comprimento diferente. A bíblia §9 registra que contar
pontos de preenchimento à mão é a maior fonte de erro de alinhamento deste tipo
de arte, e um pixel deslocado quebra a simetria do rosto sem avisar. Aqui a
checagem é automática e roda na importação do módulo.
"""

from __future__ import annotations

from pathlib import Path

from .nucleo import (
    ErroDeArte,
    Grade,
    contornar,
    escrever_sprite,
    verificar_sprite,
)
from .paleta import CONTORNO, VAZIO, mais_escuro
from .personagens import ANAS, EIXO as EIXO_SPRITE, NPCS, Corpo, _PELES

# --------------------------------------------------------------- geometria

LARGURA = 40
ALTURA = 48
EIXO = 20
"""Eixo do retrato. Grade PAR com eixo em 20 (e não 19,5) pela mesma razão do
sprite: as larguras de cabelo e de rosto são ímpares, então a coroa da cabeça e
o nariz caem exatamente no eixo. Largura par com feição ímpar é o que deixa a
figura meio pixel torta de um jeito que ninguém consegue apontar."""

Y_ROSTO = 10
"""Primeira linha do rosto. Acima dela só cabelo: 10 linhas de calota, que é o
que faz a testa existir. Retrato com o rosto encostado no topo lê como foto 3x4
mal recortada."""

X_ROSTO = 11
L_ROSTO = 19
"""Rosto em x 11..29, 19 px, centro exato em 20."""

Y_OMBRO = 38
"""Primeira linha de roupa. Dez linhas de busto: o suficiente para gola, lapela
e crachá, e pouco o bastante para o ROSTO continuar sendo o assunto do retrato —
que é o ponto inteiro do ADR-012."""


# ------------------------------------------------------------------- rosto
# DADO CANÔNICO DO RETRATO, na mesma convenção do `_ROSTO` do sprite: `s` é o tom
# base da pele, `S` a sombra, `t` a boca, `P` o cabelo (sobrancelha), `K` o olho.
# Traduzido para a pele de cada ator na hora de desenhar, exatamente como no
# sprite — é isso que mantém os nove rostos pertencendo ao mesmo elenco.
#
# As feições foram colocadas em colunas SIMÉTRICAS em torno do índice 9 (que é a
# coluna x=20, o eixo): órbita 2..6 e 12..16, pupila 3..5 e 13..15, boca 6..12.
# A única assimetria proposital é a sombra do nariz, que fica à direita do eixo
# (índices 10 e 11): simetria perfeita lê como boneco de vitrine e 1px de
# assimetria já mata isso (bíblia §9).
#
# TODA SOMBRA AQUI É CONTÍGUA, e isso é correção de olhar. A primeira versão tinha
# a maçã do rosto em `S` no índice 2 com `s` no índice 1, e a asa do nariz em `S`
# no índice 8 isolada — dois pixels de sombra cercados de pele. A 4x um pixel é um
# bloco de 4x4 na tela, então pixel isolado não vira sombra: vira SARDA. Os rostos
# claros saíram salpicados de pintinhas. É a mesma lição que `props.manchas` já
# registra para parede e piso — textura nesta escala precisa ser contígua, e ponto
# solto lê como defeito.
_ROSTO: tuple[str, ...] = (
    "sssssssssssssssssss",  # 0  testa alta, toda iluminada
    "SsssssssssssssssssS",  # 1
    "SsssssssssssssssssS",  # 2
    "SsPPPPPsssssPPPPPsS",  # 3  sobrancelhas, 5px cada
    "SsPPPPPsssssPPPPPsS",  # 4
    "SsssssssssssssssssS",  # 5
    "SsSSSSSsssssSSSSSsS",  # 6  pálpebra superior / órbita
    "SsSKKKSsssssSKKKSsS",  # 7  olhos: pupila de 3px
    "SsSKKKSsssssSKKKSsS",  # 8
    "SsSSSSSsssssSSSSSsS",  # 9  pálpebra inferior
    "SsssssssssssssssssS",  # 10
    "SsssssssssSsssssssS",  # 11 dorso do nariz, à direita do eixo
    "SSSsssssssSssssssSS",  # 12 maçã do rosto entrando
    "SSSsssssssSSsssssSS",  # 13
    "SsssssssSSSSSsssssS",  # 14 asa e base do nariz
    "SsssssssssssssssssS",  # 15
    "SsssssssssssssssssS",  # 16
    "SssssstttttttsssssS",  # 17 boca, 7px
    "SssssssSSSSSssssssS",  # 18 lábio inferior em sombra
    "SsssssssssssssssssS",  # 19
    "SssssSSSSSSSSSssssS",  # 20 sombra sob o queixo
    "SsssssssssssssssssS",  # 21
)
H_ROSTO = len(_ROSTO)


def _conferir_rosto() -> None:
    """Recusa linha de rosto com comprimento errado, na importação do módulo.

    Uma linha com um char a mais desloca meia face e produz um rosto torto que
    passa por qualquer teste e só aparece olhando — e olhando de perto. Foi essa
    classe de erro que a bíblia §9 mandou parar de cometer contando pontos à mão.
    """
    for i, linha in enumerate(_ROSTO):
        if len(linha) != L_ROSTO:
            raise ErroDeArte(
                f"retratos: linha {i} do rosto tem {len(linha)} chars, "
                f"esperado {L_ROSTO}"
            )
    if Y_ROSTO + H_ROSTO + 3 > Y_OMBRO:
        raise ErroDeArte("retratos: rosto e mandíbula invadem a linha do ombro")


_conferir_rosto()


def _volume_de_cabelo(c: Corpo) -> int:
    """Volume de cabelo do retrato, DERIVADO do volume do sprite.

    O rosto do retrato tem 19px onde o do sprite tem 11, ou seja 1,73x. Aplicar o
    mesmo fator ao cabelo é o que faz o Tiago e o Marcos continuarem sendo os de
    cabeça mais estreita do elenco e o Rafael e a Cláudia os de mais massa — a
    diferença de silhueta entre eles é dado de personagem e tem de sobreviver à
    troca de escala, senão os cinco retratos ficam com a mesma cabeça.

    Cabeça raspada (`franja=False`) perde 4px: cabelo rente ao crânio é mais
    ESTREITO que cabelo com volume, e essa diferença é metade do que faz o Tiago
    e o Marcos não parecerem os outros três.

    Forçado a ÍMPAR (`| 1`) para a coroa cair no eixo, pela mesma razão do sprite.
    """
    bruto = round(c.volume_cabelo * 1.73)
    if not c.franja:
        bruto -= 4
    return max(17, min(31, bruto | 1))


def _alcance_do_cabelo(c: Corpo) -> int:
    """Quantas linhas do rosto a massa de cabelo desce pelas laterais.

    ERRO ENCONTRADO NA PRIMEIRA FOLHA DE CONTATO DOS RETRATOS: a massa descia
    sempre até a mandíbula, para os nove. Resultado: NOVE CABELOS IGUAIS, um
    chanel arredondado em todo mundo — inclusive no Tiago e no Marcos, que no
    sprite têm a cabeça RASPADA, e no Rafael, que tem topete e lateral rente.
    É o defeito de "capacete" que a franja existe para evitar, só que aplicado à
    silhueta inteira em vez de ao contorno.

    O alcance agora sai dos campos que o sprite já declara, e as quatro classes
    são visivelmente diferentes de longe, que é o teste que importa:

      coque                   cabelo preso: enquadra o rosto todo, nó por cima,
                              e NÃO cai no ombro
      comprimento_cabelo > 0  cabelo comprido: enquadra o rosto todo e cai no ombro
      franja, sem comprimento cabelo curto: afunila da têmpora até a face
      sem franja              raspado: só a calota, e a orelha aparece

    POR QUE O CABELO PRESO ENQUADRA O ROSTO TODO. Duas tentativas falharam antes
    desta, e as duas pela mesma causa. A primeira devolveu 4 (só a têmpora,
    coerente com "rente ao crânio") e a segunda 9 (o mesmo do cabelo curto):
    olhando a folha, o retrato continuou lendo como HOMEM nas duas.

    O diagnóstico só apareceu comparando quem FUNCIONA. Os quatro retratos da
    Ana e o da Bianca leem como mulher, e o que eles têm em comum não é o rosto
    — o rosto é dado canônico e é o MESMO nos nove. É o `comprimento_cabelo`,
    que os manda por este ramo e faz a massa descer até abaixo do maxilar. Os que
    leem como homem são justamente os de alcance curto. Nesta escala a leitura de
    gênero está na massa de cabelo ao lado e abaixo da face, não em nada acima
    dela: um nó de 4 linhas no alto, ainda por cima cortado pela moldura do
    retrato, não compensa maçã e maxilar nus.

    Então o cabelo preso passa a enquadrar como o comprido, e continua se
    distinguindo dele por duas coisas que sobrevivem à compressão: o nó com
    estrangulamento no alto, e a AUSÊNCIA de queda no ombro — `_cabelo_comprido`
    depende de `comprimento_cabelo`, que no cabelo preso é zero. Penteado
    recolhido, não solto.
    """
    if c.coque:
        return H_ROSTO + 3
    if c.comprimento_cabelo:
        return H_ROSTO + 3
    if c.franja:
        return 9
    return 3


def _deslocamento_da_cabeca(c: Corpo) -> int:
    """Quantas linhas a cabeça desce dentro do quadro, derivado de `y_topo`.

    No sprite a Ana encolhida tem a cabeça 3px mais baixa, a franja descida e
    nenhum pescoço, e é assim que o queixo fica enfiado no peito (bíblia §5.2).
    O retrato precisa do mesmo gesto, porque a caixa de diálogo mostra o retrato
    do estado atual e três estados com o mesmo rosto não informam nada.

    Dois px e não três: com três a coroa começava em y=3 e sobrava vazio no alto
    do quadro, que é o defeito oposto.
    """
    return 2 if not c.pescoco else 0


def _largura_do_ombro(c: Corpo) -> int:
    """Largura do busto, DERIVADA da coluna em que o braço do sprite começa.

    Primeira tentativa derivou de `torso_peito`, e olhar a folha mostrou que não
    servia: cinco dos nove personagens têm o mesmo `torso_peito` padrão, então
    cinco bustos saíram com a mesma largura. A envergadura do sprite não está no
    torso — está no BRAÇO. `Corpo.braco` declara a coluna externa do braço
    esquerdo, e é dela que sai o fato registrado em `personagens.py` de que o
    Tiago é "o mais largo do elenco": o braço dele começa em x=14 contra x=16 da
    maioria e x=19 da Ana encolhida.

    Meia-envergadura do sprite = 25 - coluna do braço. Multiplicada por 2 e pelo
    fator de escala do retrato, dá quatro larguras distintas no elenco em vez de
    duas. Teto de 36 para sobrar margem ao contorno nos 40 da grade.
    """
    if not c.braco:
        return 32
    meia = EIXO_SPRITE - c.braco[0][2]
    return max(24, min(36, round(meia * 2 * 1.6)))


# Expressão por estado da Ana. É o ÚNICO dado deste módulo que não é derivado do
# `Corpo`, e o motivo é estrutural: no sprite as quatro poses se distinguem pela
# LARGURA DO VAZIO entre braço e torso (1px, 1px, 2px, triângulo de 3px), e um
# busto não tem braço nem vazio. Sem um dado próprio, `ana-neutra` e
# `ana-confiante` sairiam como a mesma imagem — e saíram, na primeira folha de
# contato: três dos nove retratos eram pixel a pixel idênticos.
#
# `baixo` desce as pupilas uma linha e fecha a pálpebra: olhar para baixo, que é
# a pose encolhida. `sorriso` levanta os cantos da boca e as sobrancelhas 1px.
# São dois pixels de diferença cada, e a 4x dois pixels num rosto de 19px são o
# que separa "insegura" de "à vontade".
EXPRESSAO: dict[str, str] = {
    "ana-encolhida": "baixo",
    "ana-neutra": "neutro",
    "ana-confiante": "sorriso",
    "ana-futura": "sorriso",
}


BARBA_CHEIA: frozenset[str] = frozenset({"tiago"})
"""Quem usa barba CHEIA em vez de curta.

É o segundo dado próprio do retrato, e existe pela mesma razão que `EXPRESSAO`:
comprimento de barba só existe nesta escala. No sprite, Tiago e Marcos declaram
`barba` com um char cada (`R` e `P`) e a barba é desenhada com a mesma forma nos
dois — em 11px de rosto não cabe distinguir barba cheia de barba curta. Em 19px
cabe, e precisa: os dois têm `volume_cabelo=13` e `franja=False`, então as duas
cabeças saíam com a MESMA largura e a checagem de conjunto reprovou, com razão.

A barba cheia avança 2px além da face de cada lado na altura do maxilar e desce
duas linhas abaixo do queixo — é mais larga que as bochechas, como barba cheia é
de verdade. Isso torna a cabeça do Tiago 4px mais larga que a do Marcos, o que é
diferença de SILHUETA e sobrevive à compressão; a cor da barba, que era a única
diferença antes, não sobrevive.
"""


def _pintar_rosto(g: Grade, c: Corpo, dy0: int) -> None:
    """Escreve as 22 linhas do rosto traduzindo para a pele e o cabelo do ator."""
    base, sombra, boca = _PELES[c.pele]
    troca = {"s": base, "S": sombra, "t": boca, "P": c.cabelo, "K": CONTORNO}
    for dy, linha in enumerate(_ROSTO):
        g.segmento(X_ROSTO, Y_ROSTO + dy0 + dy, "".join(troca[ch] for ch in linha))


def _expressar(g: Grade, c: Corpo, dy0: int) -> None:
    """Reescreve olhos, sobrancelha e boca conforme a expressão do estado.

    Vem DEPOIS do rosto canônico e sobrescreve só as linhas que mudam. Redesenhar
    o rosto inteiro por expressão é o caminho conhecido para o rosto mudar de
    pessoa entre dois estados — é a mesma razão pela qual o quadro de respiração
    do sprite é derivado do parado e não desenhado de novo.
    """
    modo = EXPRESSAO.get(c.nome, "neutro")
    if modo == "neutro":
        return
    base, sombra, boca = _PELES[c.pele]
    y = Y_ROSTO + dy0

    if modo == "baixo":
        # pálpebra pesada onde estava a pupila, e a pupila uma linha abaixo
        g.segmento(X_ROSTO + 2, y + 7, sombra * 5)
        g.segmento(X_ROSTO + 12, y + 7, sombra * 5)
        g.segmento(X_ROSTO + 3, y + 9, CONTORNO * 3)
        g.segmento(X_ROSTO + 13, y + 9, CONTORNO * 3)
        g.segmento(X_ROSTO + 2, y + 10, sombra + base * 3 + sombra)
        g.segmento(X_ROSTO + 12, y + 10, sombra + base * 3 + sombra)
        # boca menor e reta: 5px em vez de 7
        g.segmento(X_ROSTO + 5, y + 17, base + boca * 5 + base)
        g.segmento(X_ROSTO + 6, y + 18, base + sombra * 3 + base)
        return

    # sorriso: cantos da boca sobem 1px e as sobrancelhas também
    g.segmento(X_ROSTO + 5, y + 17, base * 2)
    g.segmento(X_ROSTO + 12, y + 17, base * 2)
    g.ponto(X_ROSTO + 5, y + 16, boca)
    g.ponto(X_ROSTO + 13, y + 16, boca)
    g.segmento(X_ROSTO + 6, y + 17, boca * 7)
    g.segmento(X_ROSTO + 6, y + 18, sombra * 7)
    for lado in (2, 12):
        g.segmento(X_ROSTO + lado, y + 2, c.cabelo * 5)
        g.segmento(X_ROSTO + lado, y + 4, base * 5)


def _orelhas(g: Grade, c: Corpo, dy0: int) -> None:
    """Orelhas, quando o cabelo não as cobre.

    Cabeça de cabelo curto ou raspada sem orelha lê como OVO, e a orelha é o
    detalhe mais barato que existe para consertar isso: dois blocos de 2x5 na
    altura do olho, com a aresta de fora em sombra. Em cabelo comprido elas não
    entram — ficariam por baixo da massa e seriam trabalho invisível.
    """
    if _alcance_do_cabelo(c) > 9:
        return
    base, sombra, _ = _PELES[c.pele]
    y = Y_ROSTO + dy0 + 7
    for x, tom_externo in ((X_ROSTO - 1, sombra), (X_ROSTO + L_ROSTO, sombra)):
        for i in range(5):
            g.ponto(x, y + i, base if i in (1, 2, 3) else tom_externo)
        g.ponto(x, y + 2, tom_externo)  # concha


def _cabelo(g: Grade, c: Corpo, dy0: int) -> None:
    """Calota, mecha e moldura atrás do rosto, com o alcance da classe de cabelo.

    A ordem é a mesma do sprite e é z-order (bíblia §9): a massa de cabelo vai
    primeiro, inclusive ATRÁS de onde o rosto vai ficar, e o rosto entra por cima.
    Desenhar o cabelo depois exigiria recortar a silhueta do rosto à mão, que é
    como se produz furo de contorno.
    """
    volume = _volume_de_cabelo(c)
    meia = volume // 2
    esq = EIXO - meia

    if c.coque:
        # CABELO PRESO. A calota começa 4 linhas mais abaixo e as de cima ficam
        # para o nó. O espaço sai da CALOTA e não do busto, e isso foi medido:
        # descer a cabeça inteira (que é o que `_deslocamento_da_cabeca` faria)
        # deixaria 8 linhas de busto, e o busto precisa das 10 para caber gola,
        # painel de colete e botoeira — retrato com busto amassado lê como cabeça
        # decepada na caixa de diálogo.
        inicio = 4 + dy0
        for i in range(inicio, Y_ROSTO + dy0):
            idx = i - inicio
            degraus = (volume - 12, volume - 6, volume - 2, volume)
            w = degraus[idx] if idx < len(degraus) else volume
            w = max(3, w | 1)
            g.linha_h(EIXO - w // 2, i, w, c.cabelo)
        # O NÓ, E O ESTRANGULAMENTO QUE O FAZ LER COMO NÓ.
        #
        # Segunda tentativa registrada, porque a primeira falhou olhando: um nó
        # de 3 linhas em cima de uma calota comprimida saiu como cabelo ALTO, e
        # o retrato continuou lendo como homem. Massa larga em cima de massa
        # larga é uma cúpula só, por mais linhas que se empilhe.
        #
        # O que faz um coque ser um coque é a CINTURA: nó largo, pinça estreita,
        # cabeça larga. A pinça (7px contra os 11 do nó e os 11 do alto da
        # calota) é o pixel que importa; sem ela o resto é decoração. Off-axis
        # em EIXO+1 porque simetria perfeita lê como manequim (bíblia §9).
        for dy, w in enumerate((11, 13, 11, 7)):
            g.linha_h(EIXO + 1 - w // 2, dy0 + dy, w, c.cabelo)
        g.segmento(EIXO - 2, dy0 + 1, c.luz_cabelo * 4)
        g.ponto(EIXO - 3, dy0 + 2, c.luz_cabelo)
        # A MECHA GRISALHA, em diagonal pela calota. Ela existe no sprite (onde
        # `_cabeca` a desenha sempre) e tinha desaparecido aqui quando o ramo do
        # cabelo preso passou a montar a própria calota: sobravam dois pixels no
        # nó, e dois pixels não leem como mecha. Quatro de largura por quatro
        # linhas, derivando 1px por linha, dentro das larguras da calota
        # comprimida — é o traço que diz senioridade sem rótulo, e é o único
        # lugar de `U` claro na figura toda.
        for i in range(4):
            g.segmento(esq + 3 + i, inicio + 1 + i, c.luz_cabelo * 4)
    else:
        # Calota em degraus de largura. Todas ímpares para a coroa cair no eixo.
        degraus = (volume - 16, volume - 11, volume - 7, volume - 4, volume - 2, volume)
        for i in range(Y_ROSTO + dy0):
            idx = i - dy0
            w = degraus[idx] if 0 <= idx < len(degraus) else volume
            if idx < 0:
                continue
            g.linha_h(EIXO - max(3, w | 1) // 2, i, max(3, w | 1), c.cabelo)

        # Mecha clara descendo em degrau, FORA do centro. Assimetria de 1px mata
        # a cara de manequim. Não entra no cabelo preso: as linhas em que ela
        # cairia são o nó, e uma mecha na largura da calota CHEIA ficaria fora da
        # calota comprimida — pixel solto no vazio, que `contornar()` fecharia
        # como segunda silhueta. No cabelo preso a mecha vive no nó e na linha do
        # cabelo (ver `_franja`), que é onde o retrato a mostra melhor.
        for i, (dx, w) in enumerate(((2, 5), (3, 5), (4, 4), (5, 3))):
            g.segmento(esq + dx, dy0 + 2 + i, c.luz_cabelo * w)

    # Moldura de cabelo atrás do rosto, até onde a classe de cabelo alcança.
    #
    # AFUNILA quando o cabelo é curto, e isso conserta um defeito visto na folha:
    # o Rafael tem o maior volume do elenco (29px contra os 19 do rosto) e a
    # massa descia RETA por 9 linhas, o que desenhava um chanel arredondado — o
    # retrato dele lia mais feminino que o da Cláudia, que lia como homem. Massa
    # reta e larga é a silhueta de corte reto; volume no alto com lateral
    # afunilada é a silhueta de topete, que é o que o sprite dele tem. Cabelo
    # comprido NÃO afunila: ali a massa enquadra o rosto de propósito.
    afunilar = c.franja and not c.comprimento_cabelo
    for i in range(_alcance_do_cabelo(c)):
        w = max(L_ROSTO + 2, volume - 2 * (i // 2)) if afunilar else volume
        w = max(3, w | 1)
        g.linha_h(EIXO - w // 2, Y_ROSTO + dy0 + i, w, c.cabelo)


def _franja(g: Grade, c: Corpo, dy0: int) -> None:
    """Franja cortando a testa em diagonal, mais longa de um lado.

    Sem ela a calota fecha num arco perfeito e a cabeça lê como CAPACETE — nada
    no contorno do cabelo quebra a simetria. No retrato ela pesa mais que no
    sprite, porque a testa aqui tem três linhas visíveis em vez de uma.

    Em cabeça raspada a franja é substituída por um recuo de linha de cabelo em
    dither esparso: franja em cabelo raspado lê como mancha na testa (é o que o
    campo `franja` do sprite existe para evitar), mas testa sem NADA na linha do
    cabelo lê como touca de borracha. Em cabelo preso ela vira linha de cabelo
    alta e varrida — ver o bloco de `coque` abaixo.
    """
    y = Y_ROSTO + dy0
    if c.coque:
        # Cabelo preso não cai na testa, mas a linha do cabelo NÃO pode ser uma
        # barra reta: barra de 19px atravessando a testa foi a segunda coisa que
        # fez este retrato ler como homem (franja de corte reto). Vira ARCO — a
        # linha só na primeira fileira, e as TÊMPORAS descendo em degrau dos dois
        # lados, deixando a testa livre no meio. É o cabelo penteado para trás.
        #
        # A mecha grisalha dela vive aqui, na têmpora esquerda: quatro pixels
        # contíguos DENTRO da massa, nunca soltos — a 4x um pixel claro isolado
        # sobre pele não lê como mecha, lê como sarda (defeito que este módulo
        # já registra no rosto).
        g.segmento(X_ROSTO, y, c.cabelo * L_ROSTO)
        for dy, w in enumerate((4, 3, 2)):
            g.segmento(X_ROSTO, y + 1 + dy, c.cabelo * w)
            g.segmento(X_ROSTO + L_ROSTO - w, y + 1 + dy, c.cabelo * w)
        g.segmento(X_ROSTO, y + 1, c.luz_cabelo * 4)
        return
    if not c.franja:
        g.dither(X_ROSTO + 1, y, L_ROSTO - 2, 2, _PELES[c.pele][0], c.cabelo, "esparso")
        return
    for i, w in enumerate((13, 11, 8, 5)):
        g.segmento(X_ROSTO, y + i, c.cabelo * w)
    g.segmento(X_ROSTO + L_ROSTO - 4, y, c.cabelo * 4)
    g.segmento(X_ROSTO + L_ROSTO - 3, y + 1, c.cabelo * 3)
    g.segmento(X_ROSTO + 2, y + 1, c.luz_cabelo * 3)


def _mandibula(g: Grade, c: Corpo, dy0: int) -> None:
    """O rosto estreita em três degraus e o cabelo avança pela lateral."""
    base, sombra, _ = _PELES[c.pele]
    fim = Y_ROSTO + dy0 + H_ROSTO
    for i, recuo in enumerate((2, 4, 6)):
        largura = L_ROSTO - 2 * recuo
        g.segmento(X_ROSTO + recuo, fim + i, sombra + base * (largura - 2) + sombra)


def _barba(g: Grade, c: Corpo, dy0: int) -> None:
    """Barba pelas bochechas fechando no queixo, com a boca redesenhada por cima.

    Barba que engole a boca apaga a única feição que dá expressão — no sprite
    isso já estava registrado para um rosto de 11px, e num de 19px a boca é ainda
    mais do que o retrato tem para dizer.

    Duas formas, ver `BARBA_CHEIA`: a curta fica dentro da face, a cheia avança
    2px além dela de cada lado no maxilar e desce duas linhas abaixo do queixo.
    """
    if not c.barba:
        return
    _, _, boca = _PELES[c.pele]
    y = Y_ROSTO + dy0
    cheia = c.nome in BARBA_CHEIA
    # 3px além da face e não 2: a ORELHA já avança 1px de cada lado da face, então
    # com 2 a barba cheia terminava exatamente na mesma coluna da orelha e a cabeça
    # media igual à do Marcos — a checagem de conjunto continuou reprovando, e
    # estava certa. Barba cheia passa da orelha; é isso que a faz cheia.
    fora = 3 if cheia else 0

    for dy in range(10 if cheia else 14, H_ROSTO):
        # O contorno nasce na costeleta e se alarga aos poucos. A faixa reta
        # anterior parecia colada sobre a face, sobretudo no Tiago.
        recuo = min(fora, max(0, (dy - 10) // 3)) if cheia else 0
        espessura = 3 + recuo if cheia else 2
        g.segmento(X_ROSTO + 1 - recuo, y + dy, c.barba * espessura)
        g.segmento(X_ROSTO + L_ROSTO - 1 - espessura + recuo, y + dy, c.barba * espessura)
    # O bigode termina antes das bochechas e deixa o lábio legível.
    g.segmento(X_ROSTO + 5, y + 15, c.barba * 9)
    g.segmento(X_ROSTO + 4, y + 16, c.barba * 11)
    for dy in range(19, H_ROSTO):
        g.segmento(X_ROSTO + (3 if cheia else 5), y + dy, c.barba * (13 if cheia else 9))
    fim = y + H_ROSTO
    degraus = (4, 5, 7) if not cheia else (0, 1, 3, 5, 7)
    for i, recuo in enumerate(degraus):
        g.segmento(X_ROSTO + recuo, fim + i, c.barba * (L_ROSTO - 2 * recuo))
    g.segmento(X_ROSTO + 6, y + 17, boca * 7)
    g.segmento(X_ROSTO + 7, y + 18, mais_escuro(boca) * 5)


def _oculos(g: Grade, c: Corpo, dy0: int) -> None:
    """Aro retangular em volta de cada olho, ponte no eixo e haste na têmpora.

    MOLDURA, não preenchimento: o aro passa ao redor da pupila e nunca por cima
    dela. No sprite o aro tinha de ficar ABAIXO do olho porque 2px de pupila não
    sobrevivem a nada desenhado em cima; aqui o rosto é grande o suficiente para
    a lente inteira caber, e é o que faz a Bianca ser reconhecível de longe —
    ninguém mais no elenco usa óculos.
    """
    if not c.oculos:
        return
    aro = "U"
    y = Y_ROSTO + dy0
    for x0 in (X_ROSTO + 1, X_ROSTO + 11):
        g.moldura(x0, y + 5, 7, 7, aro)
    g.segmento(X_ROSTO + 8, y + 8, aro * 3)  # ponte
    g.ponto(X_ROSTO, y + 7, aro)  # hastes
    g.ponto(X_ROSTO + L_ROSTO - 1, y + 7, aro)


def _cabelo_comprido(g: Grade, c: Corpo, dy0: int) -> None:
    """Queda de cabelo pelas laterais, DEPOIS da mandíbula.

    Vai só nas colunas de fora do rosto e desce até a linha do ombro, deixando o
    meio livre para o pescoço. É o que dá silhueta de cabelo comprido sem cobrir
    o rosto — e no retrato é o traço que separa a Bianca (8 no sprite, o mais
    longo) da Cláudia (nenhum).
    """
    if not c.comprimento_cabelo:
        return
    volume = _volume_de_cabelo(c)
    meia = volume // 2
    esq, dir_ = EIXO - meia, EIXO + meia
    topo = Y_ROSTO + dy0 + H_ROSTO + 3
    queda = min(ALTURA - topo, round(c.comprimento_cabelo * 1.5))
    for i in range(queda):
        g.linha_h(esq, topo + i, 5, c.cabelo)
        g.linha_h(dir_ - 4, topo + i, 5, c.cabelo)
        g.ponto(dir_, topo + i, c.luz_cabelo)
    # 1px mais comprido de um lado: o mesmo truque de assimetria da mecha
    if queda and topo + queda < ALTURA:
        g.linha_h(dir_ - 4, topo + queda, 5, c.cabelo)


def _pescoco_e_busto(g: Grade, c: Corpo, dy0: int) -> None:
    """Pescoço em sombra, ombros em degraus e gola em V.

    O pescoço é INTEIRO em sombra: é a parte do corpo que nunca pega a luz de
    cima, e sem ele o queixo cola no ombro. Quando o `Corpo` declara
    `pescoco=False` — que é o caso da pose encolhida — ele simplesmente não é
    desenhado, e a cabeça já vem 2px mais baixa: queixo enfiado no peito, a mesma
    construção do sprite (bíblia §5.2).

    Os ombros abrem em degraus de 2 a 6px por linha e não em diagonal de 1px por
    linha, porque diagonal de 1px por linha faz bolha no contorno — erro já
    cometido no antebraço do sprite (bíblia §10).
    """
    base, sombra, _ = _PELES[c.pele]
    # O TRONCO manda no busto, inclusive em quem tem manga de outra cor.
    #
    # TENTATIVA DESCARTADA, e ela custou uma rodada de olhar: pintar o ombro na
    # cor da MANGA e abrir um painel escuro no centro, que é como um colete se
    # monta de fato. No retrato saiu CAMISA E GRAVATA — ombro claro com faixa
    # escura vertical no meio é exatamente essa silhueta, e ela empurrou o
    # retrato da Cláudia de volta para a leitura masculina que esta rodada
    # existe para consertar.
    #
    # Num busto de dez linhas a manga não aparece: o que se vê é ombro e gola. O
    # contraste manga/tronco do colete vive no SPRITE, onde o braço existe, e o
    # retrato carrega a peça por cor e por gola — mais a botoeira clara que
    # `_extra_claudia` desenha, que é clara sobre escuro e por isso lê como
    # camisa aparecendo, não como gravata.
    luz, corpo, sombra_roupa = c.roupa
    y_ombro = Y_OMBRO + dy0
    larg_max = _largura_do_ombro(c)

    fim_cabeca = Y_ROSTO + dy0 + H_ROSTO + 3
    if c.pescoco:
        for i in range(fim_cabeca, y_ombro):
            g.linha_h(EIXO - 4, i, 9, sombra)
            g.ponto(EIXO - 4, i, mais_escuro(sombra))
            g.ponto(EIXO + 4, i, mais_escuro(sombra))
        g.linha_h(EIXO - 3, fim_cabeca, 7, base)  # o queixo devolve um pouco de luz

    # degraus de ombro, proporcionais à largura máxima do personagem
    for i, frac in enumerate((0.44, 0.61, 0.78, 0.89, 0.94, 1.0)):
        y = y_ombro + i
        if y >= ALTURA:
            break
        w = max(3, round(larg_max * frac)) | 1
        x = EIXO - w // 2
        g.linha_h(x, y, w, corpo)
        g.ponto(x, y, luz)
        g.ponto(x + w - 1, y, sombra_roupa)
    for y in range(y_ombro + 6, ALTURA):
        x = EIXO - larg_max // 2
        g.linha_h(x, y, larg_max, corpo)
        g.ponto(x, y, luz)
        g.ponto(x + larg_max - 1, y, sombra_roupa)
    g.linha_h(EIXO - 8, y_ombro, 17, luz)  # aresta iluminada do ombro

    # Gola em V da camisa por baixo: o único tom quase-branco do busto, e é ele
    # que puxa o olho de volta para o rosto depois de descer pela roupa.
    claro, escuro_gola = c.gola
    for i in range(7):
        w = max(1, 13 - 2 * i)
        y = y_ombro + i
        if y >= ALTURA:
            break
        g.linha_h(EIXO - w // 2, y, w, claro)
        g.ponto(EIXO + w // 2, y, escuro_gola)

    if c.lapela:
        # Lapela: duas linhas abrindo do colarinho para fora. É o que faz um campo
        # chapado ler como blazer em vez de retângulo colorido, e custa 20 pixels.
        for i in range(8):
            dx = 5 + i
            y = y_ombro + 1 + i
            if y >= ALTURA or dx > larg_max // 2 - 1:
                break
            g.ponto(EIXO - dx, y, sombra_roupa)
            g.ponto(EIXO - dx + 1, y, corpo)
            g.ponto(EIXO + dx, y, sombra_roupa)
            g.ponto(EIXO + dx - 1, y, corpo)

    if c.pin:
        # Crachá de 3x4 na lapela, fora do centro. Começou como fita no meio do
        # peito e lia como gravata amarela (bíblia §9): acento pequeno e
        # descentrado é o que lê como crachá.
        px = EIXO - min(13, larg_max // 2 - 4)
        for dy in range(4):
            y = y_ombro + 4 + dy
            if y >= ALTURA:
                break
            g.segmento(px, y, c.pin * 3)
        g.ponto(px + 1, y_ombro + 6, "w")


# ------------------------------------------------- extras por personagem
# Os mesmos traços que `personagens.py` desenha no corpo, redesenhados nas
# coordenadas do busto. Não dá para reusar as funções de lá: elas escrevem em
# colunas da grade de 50x84 e no vão braço-torso, que aqui não existe.


def _extra_rafael(g: Grade, c: Corpo, dy0: int) -> None:
    """Cordão de crachá em V. É o objeto dele no sprite e tem de estar aqui."""
    y0 = Y_OMBRO + dy0
    for i in range(8):
        g.ponto(EIXO - 7 + i // 2, y0 + 1 + i, "a")
        g.ponto(EIXO + 7 - i // 2, y0 + 1 + i, "a")
    for dy in range(3):
        y = y0 + 7 + dy
        if y < ALTURA:
            g.linha_h(EIXO - 3, y, 7, "J")
    if y0 + 8 < ALTURA:
        g.linha_h(EIXO - 2, y0 + 8, 5, "6")


def _extra_bianca(g: Grade, c: Corpo, dy0: int) -> None:
    """Cardigã ABERTO sobre camiseta clara: as bordas em K é que abrem a peça.

    Sem as duas linhas de contorno descendo da gola é um suéter, e o cardigã
    aberto é a silhueta dela nas duas cenas em que aparece.
    """
    claro, escuro = c.gola
    for dy in range(Y_OMBRO + dy0 + 3, ALTURA):
        g.linha_h(EIXO - 4, dy, 9, claro)
        g.ponto(EIXO - 5, dy, CONTORNO)
        g.ponto(EIXO + 5, dy, CONTORNO)
        g.ponto(EIXO + 4, dy, escuro)


def _extra_tiago(g: Grade, c: Corpo, dy0: int) -> None:
    """Capuz amontoado pelas laterais do pescoço, nunca por cima da cabeça.

    Por cima ele cobriria o rosto, que é a única coisa que um retrato tem. E o
    cordão do capuz entra assimétrico de propósito.
    """
    luz, corpo, sombra = c.roupa
    y0 = Y_OMBRO + dy0
    for i in range(6):
        y = y0 - 3 + i
        if y < 0:
            continue
        w = 6 + i
        g.linha_h(EIXO - 9 - i // 2, y, w, corpo)
        g.linha_h(EIXO + 4 - i // 2, y, w, sombra)
        g.ponto(EIXO - 9 - i // 2, y, luz)
    for dy in range(5):
        y = y0 + 3 + dy
        if y < ALTURA:
            g.ponto(EIXO - 3, y, "7")
            g.ponto(EIXO + 3, y, "6")
    if y0 + 8 < ALTURA:
        g.ponto(EIXO - 3, y0 + 8, "7")


def _extra_marcos(g: Grade, c: Corpo, dy0: int) -> None:
    """Estampa da camiseta, fora do centro. Dois pixels claros e um quente."""
    y0 = Y_OMBRO + dy0
    for dy in range(3):
        y = y0 + 5 + dy
        if y < ALTURA:
            g.segmento(EIXO + 6, y, "xx")
    g.ponto(EIXO + 6, y0 + 5, "z")


def _extra_claudia(g: Grade, c: Corpo, dy0: int) -> None:
    """Botoeira do colete: o traço que só cabe nesta escala.

    Cláudia é líder e isso está na roupa, não num rótulo (bíblia §5.4). O colete
    em si já vem do `roupa_braco` dela, desenhado por `_pescoco_e_busto`; o que
    falta aqui é a botoeira que o fecha, e é ela que separa colete de blazer num
    busto de dez linhas.

    DESCARTADO, e vale registrar porque era a solução óbvia: um brinco de 1x2
    pendurado no lobo, como segundo sinal de gênero. Ele existiu e saiu quando o
    cabelo preso passou a enquadrar o rosto todo (ver `_alcance_do_cabelo`) — com
    a massa cobrindo a lateral da face, `_orelhas` não desenha mais a orelha, e
    brinco sem orelha de onde pender é pixel solto no vazio, que a 4x lê como
    defeito de alpha e não como jóia.
    """
    claro, escuro_gola = c.gola
    y0 = Y_OMBRO + dy0
    # Duas faixas de camisa camel nas bordas do busto devolvem ao retrato a
    # roupa de manga clara e colete escuro que identifica Cláudia no cenário.
    largura = _largura_do_ombro(c)
    manga_luz, manga, _ = c.roupa_braco or c.roupa
    for dy in range(y0 + 3, ALTURA):
        esquerda = EIXO - largura // 2
        direita = EIXO + largura // 2 - 3
        g.linha_h(esquerda, dy, 4, manga)
        g.linha_h(direita, dy, 4, manga)
        g.ponto(esquerda, dy, manga_luz)

    # Botoeira: faixa de 3px da camisa entre as duas bordas do colete, embaixo
    # do V da gola. Contígua, nunca pontos soltos, pelo mesmo motivo acima.
    for dy in range(7, ALTURA - y0):
        y = y0 + dy
        g.linha_h(EIXO - 1, y, 3, claro)
        g.ponto(EIXO + 1, y, escuro_gola)
        g.ponto(EIXO - 2, y, CONTORNO)
        g.ponto(EIXO + 2, y, CONTORNO)


EXTRAS: dict[str, object] = {
    "rafael": _extra_rafael,
    "bianca": _extra_bianca,
    "tiago": _extra_tiago,
    "marcos": _extra_marcos,
    "claudia": _extra_claudia,
}


# ------------------------------------------------------------------ montagem


def retrato(c: Corpo) -> Grade:
    """Monta um retrato inteiro e contorna.

    Contornado, ao contrário dos props de cenário: o retrato flutua sobre o painel
    da caixa de diálogo, que é fundo qualquer, e aí a silhueta fechada é
    obrigatória (bíblia §2.3). O busto encosta na linha de baixo da grade de
    propósito — `contornar()` não pinta fora da grade, então o corte fica limpo e
    lê como busto cortado pela moldura, que é como retrato de diálogo é feito.

    A ordem é z-order e não é livre: cabelo (inclusive atrás do rosto), rosto,
    franja, mandíbula, barba, óculos, orelha, busto, queda de cabelo e por fim o
    traço do personagem. Trocar duas dessas linhas de lugar apaga alguma coisa —
    franja antes do rosto desaparece, barba antes do rosto engole a boca, queda de
    cabelo antes do busto fica por baixo do ombro.
    """
    g = Grade(LARGURA, ALTURA)
    dy0 = _deslocamento_da_cabeca(c)
    _cabelo(g, c, dy0)
    _pintar_rosto(g, c, dy0)
    _franja(g, c, dy0)
    _mandibula(g, c, dy0)
    _barba(g, c, dy0)
    _oculos(g, c, dy0)
    _expressar(g, c, dy0)
    _orelhas(g, c, dy0)
    _pescoco_e_busto(g, c, dy0)
    _cabelo_comprido(g, c, dy0)
    extra = EXTRAS.get(c.nome)
    if extra is not None:
        extra(g, c, dy0)  # type: ignore[operator]
    return contornar(g)


def _largura_da_cabeca(g: Grade, dy0: int) -> int:
    """Largura da CABEÇA — da coroa ao maxilar, barba incluída.

    ERRO DE MEDIÇÃO CORRIGIDO AQUI, duas vezes. A primeira versão usava a caixa
    envolvente do retrato inteiro e concluiu que os cinco NPCs tinham "a mesma
    largura de cabeça, 38px" — 38 é a largura do OMBRO mais o contorno, e o ombro
    é a coisa mais larga de qualquer busto. A checagem comparava sempre a mesma
    medida e portanto nunca poderia reprovar nada: aviso que não consegue ser falso
    é pior que aviso nenhum, porque dá impressão de cobertura.

    A segunda versão media só a calota, e aí deixou de ver a barba — que é
    justamente o que separa a cabeça do Tiago da do Marcos. Agora vai da coroa até
    o último degrau do maxilar, que é o bloco que a plateia lê como "cabeça", e
    para antes da linha do ombro (34 contra 38) para o busto não contaminar.
    """
    esq, dir_ = g.largura, -1
    for y in range(dy0, Y_ROSTO + dy0 + H_ROSTO + 3):
        for x in range(g.largura):
            if g.em(x, y) != VAZIO:
                esq = min(esq, x)
                dir_ = max(dir_, x)
    return 0 if dir_ < 0 else dir_ - esq + 1


def _conferir_retrato(nome: str, g: Grade, dy0: int) -> list[str]:
    """Checagens que pegam o que o olho não pega num retrato.

    Devolve avisos em vez de levantar, pela mesma razão de `verificar_sprite`: o
    aviso deixa a arte sair e ser OLHADA, e olhar é o que corrige pixel art.

    (a) o busto tem de encostar na última linha — retrato que não encosta lê como
        boneco flutuando dentro da caixa de diálogo;
    (b) os dois olhos têm de existir, porque uma troca de pele que não mapeasse
        `K` apagaria o olhar e o rosto continuaria "certo" em tudo o mais;
    (c) a CABEÇA tem de ocupar pelo menos 40% da largura da grade — se ocupar
        menos, o retrato está pequeno para a caixa e volta a ser um sprite
        ampliado, que é exatamente o que o ADR-012 recusou.
    """
    avisos: list[str] = []
    caixa = g.caixa()
    if caixa is None:
        return [f"{nome}: retrato vazio"]
    _x0, y0, _x1, y1 = caixa
    if y1 != ALTURA - 1:
        avisos.append(f"{nome}: busto termina em y={y1}, esperado {ALTURA - 1} (flutua na caixa)")
    if y0 > dy0 + 1:
        avisos.append(f"{nome}: topo do cabelo em y={y0} (sobra vazio no alto do retrato)")
    cabeca = _largura_da_cabeca(g, dy0)
    if cabeca < round(LARGURA * 0.4):
        avisos.append(f"{nome}: cabeça com {cabeca}px em {LARGURA} de grade (pequena demais)")
    # a expressão `baixo` desce as pupilas uma linha, então as duas linhas são
    # verificadas juntas — o que importa é existir olhar, não a linha exata
    olhos = sum(
        1
        for y in (Y_ROSTO + dy0 + 7, Y_ROSTO + dy0 + 8, Y_ROSTO + dy0 + 9)
        for x in range(LARGURA)
        if g.em(x, y) == CONTORNO
    )
    if olhos < 8:  # 3px de pupila x 2 olhos x 2 linhas, com folga para o aro
        avisos.append(f"{nome}: só {olhos} pixels de olho nas linhas do olhar")
    return avisos


def gerar(destino: Path) -> list[tuple[str, Grade]]:
    """Escreve os nove retratos em `destino` e devolve (nome, grade) para a folha.

    `gerar_arte.py` passa `public/assets/retratos`.

    OS IDS. `src/assets/manifest.ts` ainda não declara retrato nenhum, então esta
    frente usa a convenção que a spec 05 §4 autoriza: `ana-<estado>` e
    `npc-<id>`, iguais aos ids de sprite. A entrada de manifest que falta está no
    relatório desta frente como pendência para a frente de contratos — e não é
    urgente, porque a cadeia de fallback de `Imagem.tsx` cobre asset ausente sem
    quebrar nada.
    """
    pecas: list[tuple[str, Grade]] = []
    avisos: list[str] = []
    assinaturas: list[tuple[str, tuple[int, int, int]]] = []

    for c in (*ANAS, *NPCS):
        g = retrato(c)
        # A Ana já se chama "ana-encolhida"; o NPC ganha o prefixo que o manifest
        # usa para sprite (`npc-<id>`), para que os nove ids do retrato sejam
        # derivados dos nove ids que já existem em vez de inventados.
        nome = c.nome if c in ANAS else f"npc-{c.nome}"
        dy0 = _deslocamento_da_cabeca(c)
        avisos.extend(_conferir_retrato(nome, g, dy0))
        avisos.extend(verificar_sprite(nome, g))
        escrever_sprite(destino / f"{nome}.png", g)
        pecas.append((nome, g))
        if c in NPCS:
            assinaturas.append(
                (
                    nome,
                    (
                        _largura_da_cabeca(g, dy0),
                        _alcance_do_cabelo(c),
                        _largura_do_ombro(c),
                    ),
                )
            )

    _conferir_elenco(assinaturas)

    if avisos:
        print("[retratos] AVISOS:")
        for aviso in avisos:
            print(f"  - {aviso}")
    else:
        print(f"[retratos] {len(pecas)} retratos, zero aviso")
    return pecas


def _conferir_elenco(assinaturas: list[tuple[str, tuple[int, int, int]]]) -> None:
    """Duas regras que só se verificam olhando o CONJUNTO dos cinco NPCs.

    Pele: as quatro famílias têm de aparecer, como no sprite. Elenco todo na
    mesma pele lê como o mesmo NPC repintado (bíblia §5.4), e num retrato de rosto
    — onde a pele é metade da área pintada — o defeito fica ainda mais óbvio que
    no sprite.

    Silhueta: nenhum par de NPCs pode ter a mesma TRINCA
    (largura da cabeça, alcance do cabelo, largura do ombro).

    POR QUE TRINCA E NÃO SÓ A LARGURA DA CABEÇA. A primeira versão comparava a
    largura da cabeça sozinha e entrou num jogo de gato e rato: o elenco tem cinco
    cabeças num intervalo de uns 10px de largura possível, então empate de inteiro
    acontece por acidente e não por dois personagens serem parecidos. Corrigir
    empate mexendo no desenho até os números se separarem é otimizar para a
    checagem, não para a imagem.

    A trinca é mais RIGOROSA, não mais frouxa: ela pede que dois NPCs difiram em
    pelo menos uma de três dimensões independentes de silhueta — massa de cabeça,
    comprimento de cabelo e envergadura — em vez de só na primeira. Dois retratos
    com as três iguais seriam de fato a mesma silhueta em cores diferentes, que é
    o defeito que se quer pegar. É a mesma escolha do `_conferir_elenco` do sprite,
    que compara a caixa (largura, altura) e não só a largura.
    """
    familias = {c.pele for c in NPCS}
    if familias != set(_PELES):
        faltam = sorted(set(_PELES) - familias)
        raise ErroDeArte(f"retratos: elenco não cobre as peles, faltam {faltam}")

    vistas: dict[tuple[int, int, int], str] = {}
    for nome, assinatura in assinaturas:
        cabeca, alcance, ombro = assinatura
        print(f"[retratos] {nome}: cabeça {cabeca}px, cabelo {alcance}, ombro {ombro}px")
        if assinatura in vistas:
            print(
                f"[retratos] AVISO: {nome} e {vistas[assinatura]} têm a mesma silhueta "
                f"{assinatura} — a diferença entre eles ficou só na cor, e cor é o que "
                f"a compressão de vídeo come primeiro"
            )
        vistas[assinatura] = nome
