# AGENTS.md — contrato do apresentacao_jogo

Este arquivo é carregado automaticamente por todo agente que trabalha neste
repositório, inclusive subagentes. Se você está lendo isto, as regras abaixo
valem para você e não são sugestões.

## O que é este projeto

Uma apresentação corporativa disfarçada de jogo point-and-click. Uma pessoa
apresenta ao vivo, compartilhando tela pelo Teams, e navega a história da Ana
— estagiária que vira profissional ao longo de cinco blocos temporais.

React 18 + Vite + TypeScript + Zustand. Arte em pixel art gerada por script
Python sem dependências. Testes em Vitest.

Duas consequências que explicam quase toda decisão estranha do código:

O público assiste por **vídeo comprimido**. Compressão come contraste, apaga
linha fina e transforma gradiente suave em faixa. Por isso existe
`src/styles/tokens.ts` com pisos duros (texto nunca abaixo de 22px, borda
nunca abaixo de 3px, nada de gradiente).

A apresentação é **ao vivo, uma vez, sob pressão**. Por isso alvo de clique é
largo, saída é sempre visível, e hotspot que não responde é considerado bug —
melhor não existir do que existir morto.

## Leitura obrigatória antes de tocar em arte ou UI

**`docs/biblia-de-arte.md`** — direção de arte, escala, paleta, anatomia de
sprite, montagem de cenário, regras de animação e o pipeline de geração. Todo
trabalho de arte ou de interação de cena passa por lá. Não improvise estilo:
está tudo escrito, incluindo os erros já cometidos e por que falharam.

## Regras duras

### Idioma
Português em tudo: comentários, nomes de domínio, documentos, mensagens de
commit. O código existe para ser lido por quem apresenta.

### Tokens, nunca literais
Nenhum componente escreve um valor que já exista em `src/styles/tokens.ts`.
Nenhum módulo de arte escreve um RGB que já exista em
`scripts/pixelart/paleta.py`. Se falta um valor, adicione ao token — não ao
componente.

### Comentário explica POR QUE, não O QUE
O código deste projeto é densamente comentado e os comentários carregam a
decisão, o descarte e a consequência. Siga o tom: se você escrever
`// incrementa o contador`, está errado. Se escrever `// contador separado
porque compartilhar o índice fazia o diálogo pular a última linha`, está certo.

### Verificação antes de declarar pronto
```
npm run typecheck
npm test
```
As duas coisas. Sem exceção. `npm test` roda a suíte inteira, inclusive
`src/domain/content/integridade.test.ts`, que valida o grafo de conteúdo —
referência quebrada falha na compilação, não na frente da plateia.

### Arte termina em OLHAR
Quem desenha por coordenada não vê o que fez. Toda tarefa de arte termina
gerando a folha de contato e **abrindo a imagem**. Sprite que não foi visto não
está pronto. O comando está na bíblia.

### Não invente escopo
Este repositório tem spec (`docs/spec-apresentacao.md`), roteiro
(`docs/roteiro/`) e conteúdo tipado (`src/domain/content/`). O conteúdo
narrativo está fechado e revisado. Você ajusta apresentação, não a história.

## Mapa do repositório

```
src/domain/        tipos e conteúdo (história, hotspots, diálogos, puzzles)
src/store/jogo.ts  máquina de estado única (Zustand)
src/ui/            componentes de tela
src/arte/          arte VETORIAL em SVG/React — o piso, usado quando falta PNG
src/assets/        manifest de assets e placeholder
scripts/pixelart/  gerador de pixel art (Python, stdlib só)
public/assets/     PNG gerados. É o que a aplicação consome de verdade
docs/              spec, roteiro, bíblia de arte, specs de trabalho
```

### A cadeia de fallback de imagem
`src/ui/Imagem.tsx` resolve em três níveis, nesta ordem:
1. PNG em `public/assets/` (via `src/assets/manifest.ts`)
2. arte vetorial de `src/arte/`
3. placeholder geométrico rotulado

Isso significa que **dropar um PNG com o nome certo substitui a arte sem tocar
em código**. É o mecanismo central de entrega de arte. O manifest já declara
todos os ids; os caminhos existem antes dos arquivos.

Armadilha conhecida: `Imagem.tsx` mantém um `Set` de ids cujo PNG já falhou na
sessão. Se a página estava aberta quando o PNG não existia, ela não tenta de
novo — recarregue a aba (Ctrl+Shift+R) depois de gerar arte nova.

## Comandos

```
npm run dev         servidor de desenvolvimento (5173)
npm run typecheck   tsc --noEmit
npm test            suíte completa
npm run build       typecheck + build de produção

python scripts/gerar_arte.py       regera TODA a pixel art + folhas de contato
python scripts/exportar_chao.py    remapeia onde há piso em cada cena
python scripts/previa_de_cena.py   monta cenário + elenco nas coordenadas reais
```

Depois de mexer em CENÁRIO, rode `exportar_chao.py` — senão o teste de chão
valida contra um piso que não existe mais. Depois de mexer em cenário OU em
coordenada de conteúdo, rode `previa_de_cena.py` e **olhe as imagens**.

Python: use o interpretador do sistema. O gerador não tem dependências — se
alguma coisa pedir `pip install`, você saiu do trilho.

### A junta onde os bugs moram

O defeito mais caro deste projeto até agora foram 21 figuras humanas em pé
SOBRE o mobiliário, em 6 cenas. Nem a arte nem o conteúdo estavam errados: o
cenário nunca viu as coordenadas e os testes de geometria nunca viram o
cenário. Cada lado estava internamente coerente e o defeito vivia na junta.

Duas defesas existem agora e as duas são necessárias:

- `src/ui/Cena.chao.test.ts` — automática. Reprova pé fora do piso. Pegou as
  21 figuras.
- `scripts/previa_de_cena.py` — humana. Monta a imagem que a plateia vê. Pegou
  monitor flutuando e Ana cobrindo NPC, que passavam em todos os testes.

Teste não substitui olhar, e olhar não substitui teste.

## Divisão de trabalho quando há vários agentes

Arte e UI não se cruzam. Respeite as fronteiras de arquivo para não haver
conflito de escrita:

| Frente | Escreve em | NÃO toca em |
|---|---|---|
| cenários | `scripts/pixelart/cenarios.py`, `props.py` | `src/**` |
| personagens | `scripts/pixelart/personagens.py` | `src/**`, outros módulos de arte |
| itens | `scripts/pixelart/itens.py` | `src/**`, outros módulos de arte |
| interação/UI | `src/ui/**`, `src/domain/**`, `src/styles/**` | `scripts/**` |

`scripts/pixelart/nucleo.py` e `paleta.py` são fundação compartilhada: leia à
vontade, mas só altere se a mudança for aditiva e você anotar na bíblia.
