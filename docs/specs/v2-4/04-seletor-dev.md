# Troca rápida de fase para testes

Em `npm run dev`, F8 ou o botão DEV abre o seletor das seis fases.
F8, Escape ou Fechar fecha o painel. Disponível na abertura e sobre as
telas do jogo, inclusive quando um diálogo ou minigame estiver aberto.

Escolher uma fase reinicia o progresso salvo, aplica seu `estadoAssumido`
e abre o primeiro lugar destravado. Isso elimina resíduos de diálogos,
puzzles, interações e clímax do teste anterior. A reflexão inicial é
marcada como vista para agilizar; Pensamento continua permitindo reabri-la.

O painel só é montado com `import.meta.env.DEV`; o build de produção não
oferece botão nem atalho. Os testes verificam as seis entradas e o retorno
do clímax para uma fase anterior.
