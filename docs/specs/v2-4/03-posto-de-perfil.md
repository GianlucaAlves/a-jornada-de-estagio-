# Correção do posto de notebook — segunda revisão

A captura enviada revela um erro de desenho aceito na revisão anterior:
rosto frontal, notebook lateral e braços acrescentados por cima de uma pose
que já possuía mãos. Não basta a imagem carregar e caber na caixa.

O perfil adotado na primeira revisão também falhou: rosto comprido,
pescoço exposto e tela reduzida a uma haste. A nova captura do usuário
invalidou a avaliação visual anterior, apesar dos testes aprovados.

Reutilizar a cabeça canônica do elenco, sem esticar ou redesenhar as
feições. Usar franja baixa e deslocamento sobre o ombro, pescoço curto,
tronco com volume e cotovelos ligados aos antebraços. A tela oblíqua deve
ser reconhecível na escala da cena, com dobradiça e teclado apoiados no
tampo. Cadeira atrás do tronco e mãos sobre o teclado. Os dois quadros
alteram as mãos, preservando cabeça, cadeira e articulações.

Aplicar a mesma construção ao posto compartilhado da outra área, que
herdava o defeito. Conferir os dois quadros ampliados e a cena real com
Rafael, Ana e HUD. Regenerar chão e prévias, e executar typecheck e testes.

## Verificação realizada

As capturas do navegador em `docs/arte/v2-4/posto/` registram os dois
quadros, separadamente, do escritório e da outra área, com detalhes
ampliados. Foram abertas e avaliadas junto das prévias e folhas de contato.
A pose mantém cabeça e cotovelos estáveis; as mãos alternam sobre o teclado.

`scripts/verificar_posto.mjs` reproduz essa captura com o elenco e HUD reais.
`verificar_recortes.py` aprovou os 18 recortes: o primeiro quadro coincide
com o cenário e o segundo contém alterações. Chão e prévias regenerados.
Typecheck aprovado e suíte completa aprovada: 375 testes em 22 arquivos.
