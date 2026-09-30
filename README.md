# A Jornada do Estágio

Apresentação corporativa disfarçada de jogo point-and-click. Uma pessoa
apresenta ao vivo, compartilhando tela, e navega a história da Ana — estagiária
de apoio a projetos que atravessa seis fases até a efetivação. Cinco
apresentadores humanos, um por fase, revezam a fala; o jogo dá o gancho, quem
apresenta dá a lição.

Não é um jogo comercial e não é genérico: é uma ferramenta de apresentação com
regras de design bem específicas, escritas para sobreviver a compressão de
vídeo e a uma plateia de estagiários de qualquer área, não só tecnologia.

## Sumário

- [O que é isto](#o-que-é-isto)
- [As seis fases](#as-seis-fases)
- [Stack](#stack)
- [Rodando localmente](#rodando-localmente)
- [Gerando a arte](#gerando-a-arte)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como a arte chega na tela](#como-a-arte-chega-na-tela)
- [Testes e garantias](#testes-e-garantias)
- [Documentação](#documentação)
- [Publicação](#publicação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## O que é isto

Duas restrições explicam quase toda decisão de design deste projeto:

**O público assiste por vídeo comprimido.** Compressão come contraste, apaga
linha fina e transforma gradiente suave em faixa. Por isso a UI trava valores
duros — texto nunca abaixo de 22px, borda nunca abaixo de 3px, zero gradiente —
e a arte é pixel art numa escala única (4 pixels reais por pixel de arte, em
tudo).

**A apresentação é ao vivo, uma vez, sob pressão.** Alvo de clique é largo,
saída de tela é sempre visível, hotspot que não responde é tratado como bug —
melhor não existir do que existir morto. Todo puzzle tem botão de voltar e
avisa quando se erra, porque silêncio ao vivo faz quem apresenta começar a
explicar o que não devia.

O jogo é deliberadamente **incompleto sem apresentador**: os NPCs e os puzzles
dão o gancho, a pessoa ao vivo dá o conselho de carreira. Quem jogar sozinho
(o projeto também roda publicado, sem apresentador) recebe a história da Ana,
não a lição — essa é uma troca consciente, documentada em
[`docs/decisoes/adr.md`](docs/decisoes/adr.md).

## As seis fases

A história é linear entre fases e livre dentro de cada uma: os lugares
liberados podem ser visitados em qualquer ordem, mas só há algo para fazer
onde a fase pede. Cada fase abre e fecha no mesmo lugar.

| # | Tema | Apresentador | Lugar | Puzzle |
|---|---|---|---|---|
| 1 | Timidez, insegurança | Pedro | Escritório | Senha (social) |
| 2 | Aprendizado contínuo, planejamento | Heloisa | Cafezinho ↔ Escritório | Associar + Sequenciar |
| 3 | Protagonismo | João | Linha de Produção ↔ Escritório | Estruturar |
| 4 | Saber se vender | Gianluca | Sala de Reuniões (Innovation Week) | Montar |
| 5 | Competências, incerteza | Marianna | Outra área da empresa | — (o painel de skills é a mecânica) |
| 6 | Efetivação | — | Cafezinho em festa | — |

No clímax da fase 6, quatro conexões são traçadas sobre o mapa enquanto um
personagem narra como cada uma delas levou a Ana até ali: três **portas** (itens
que ela recebeu ao longo da jornada, e que se apagam ao conectar) e um
**motivo** — a competência de proatividade, que permanece acesa depois que tudo
o mais se apagou. É a tese da apresentação: o que abriu a porta não foi um
currículo, foi o que ela decidiu fazer sem que ninguém pedisse.

O desenho completo, com cada decisão e o que foi descartado, está em
[`docs/decisoes/`](docs/decisoes).

## Stack

- **React 18 + TypeScript + Vite** — aplicação e build
- **Zustand** — máquina de estado única (`src/store/jogo.ts`)
- **Vitest** — suíte de testes
- **Python 3 (stdlib apenas)** — gerador de pixel art, sem dependências

Node 24 e npm foram usados no desenvolvimento; qualquer Node 18+ deve funcionar
pelas versões declaradas em `package.json`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Outros scripts:

```bash
npm run typecheck   # tsc --noEmit
npm test            # suíte completa (vitest run)
npm run build       # typecheck + build de produção
npm run preview     # serve o build de produção localmente
```

**Antes de declarar qualquer trabalho pronto**, as duas primeiras têm de passar
sem erro. `npm test` roda a suíte inteira, inclusive o teste que valida o grafo
de conteúdo inteiro — referência quebrada falha na compilação, não na frente da
plateia.

## Gerando a arte

Toda a pixel art é gerada por script Python sem dependências externas — nada de
`pip install`. Os PNGs finais já estão versionados em `public/assets/`, então
rodar o gerador não é necessário para usar o projeto; é necessário para
alterar a arte.

```bash
python scripts/gerar_arte.py       # regera cenários, personagens, itens, retratos
python scripts/exportar_chao.py    # remapeia onde há piso em cada cenário
python scripts/previa_de_cena.py   # monta cenário + elenco nas coordenadas reais
```

Depois de mexer em cenário, o exportador de piso **precisa** rodar de novo —
senão o teste de geometria valida contra um chão que não existe mais. Depois
de mexer em cenário ou em coordenada de conteúdo, a prévia de cena monta a
imagem exata que a plateia vai ver, e ela deve ser aberta e olhada: neste
projeto, teste automatizado e inspeção visual são as duas defesas contra o
mesmo tipo de bug (um exemplo real, com 21 personagens em pé sobre móveis, está
documentado em [`docs/decisoes/adr.md`](docs/decisoes/adr.md)), e nenhuma
substitui a outra.

A direção de arte completa — paleta, escala, anatomia de sprite, regras de
animação, e os erros já cometidos — está em
[`docs/biblia-de-arte.md`](docs/biblia-de-arte.md). É leitura obrigatória antes
de qualquer trabalho de arte ou de interação de cena.

## Estrutura do repositório

```
src/domain/        tipos e conteúdo (história, hotspots, diálogos, puzzles)
src/store/jogo.ts  máquina de estado única (Zustand)
src/ui/            componentes de tela
src/arte/          arte vetorial em SVG/React — o piso, usado quando falta PNG
src/assets/        manifest de assets e placeholder
scripts/pixelart/  gerador de pixel art (Python, stdlib apenas)
public/assets/     PNGs gerados — o que a aplicação consome de fato
docs/              spec, roteiro, bíblia de arte, decisões, specs de trabalho
```

## Como a arte chega na tela

`src/ui/Imagem.tsx` resolve todo asset em três níveis, nesta ordem:

1. **PNG em `public/assets/`**, referenciado pelo id em
   `src/assets/manifest.ts`. Tem precedência sobre tudo.
2. **Arte vetorial** em `src/arte/` (SVG desenhado em React).
3. **Placeholder geométrico rotulado**, para que nunca haja imagem quebrada.

Isso significa que dropar um PNG com o nome certo em `public/assets/`
substitui a arte sem tocar em código. O manifest já declara todos os ids; os
caminhos existem antes dos arquivos.

Uma pegadinha conhecida: `Imagem.tsx` guarda em memória, durante a sessão do
navegador, quais ids já falharam ao carregar. Se a página estava aberta quando
um PNG ainda não existia, ela não tenta de novo sozinha — recarregue com
Ctrl+Shift+R depois de gerar arte nova.

## Testes e garantias

A suíte cobre desde integridade de conteúdo até geometria de cena:

- **`src/domain/content/integridade.test.ts`** — valida o grafo de conteúdo
  inteiro: toda referência entre fase, item, skill, NPC e lugar existe e é
  alcançável.
- **`src/ui/Cena.chao.test.ts`** — reprova qualquer personagem posicionado fora
  do piso mapeado do cenário (pé sobre um móvel, por exemplo).
- **`src/ui/Cena.geometria.test.ts`** — reprova hotspots sobrepostos e casos em
  que a protagonista cobre o próprio hotspot que acabou de acionar.

Referência quebrada, personagem flutuando ou hotspot inacessível falham no
`npm test`, não na apresentação em si.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Contrato do repositório: regras duras, mapa de arquivos, divisão de trabalho entre frentes |
| [`docs/biblia-de-arte.md`](docs/biblia-de-arte.md) | Direção de arte completa: paleta, escala, anatomia, animação, erros já cometidos |
| [`docs/decisoes/v2-desenho.md`](docs/decisoes/v2-desenho.md) | O desenho consolidado da versão atual, em uma página |
| [`docs/decisoes/adr.md`](docs/decisoes/adr.md) | Registro de decisões de design, em ordem cronológica, com o que foi descartado e por quê |
| [`docs/decisoes/glossario.md`](docs/decisoes/glossario.md) | Vocabulário compartilhado do projeto |
| [`docs/roteiro/`](docs/roteiro) | Roteiro fase a fase, com ganchos de fala para quem apresenta |
| [`docs/specs/`](docs/specs) | Specs de trabalho usadas para implementar cada frente |

## Publicação

O projeto é uma SPA estática — `npm run build` gera `dist/`, publicável em
qualquer host de arquivos estáticos servindo na raiz do domínio (testado com
Vercel). Os caminhos de asset no manifest são absolutos a partir da raiz, então
o deploy precisa servir o site na raiz — não em um subdiretório.

## Contribuindo

Este projeto tem convenções bem específicas, todas em
[`AGENTS.md`](AGENTS.md):

- **Português em tudo** — comentários, nomes de domínio, documentos, commits.
- **Tokens, nunca literais** — nenhum componente escreve um valor de estilo que
  já exista em `src/styles/tokens.ts`; nenhum módulo de arte escreve uma cor
  que já exista em `scripts/pixelart/paleta.py`.
- **Comentário explica por quê, não o quê** — o código é densamente comentado,
  e o comentário carrega a decisão e o motivo do descarte, não uma paráfrase
  do código.
- **Conteúdo narrativo é fechado** — a história está revisada; ajustes de
  apresentação, sim, invenção de escopo, não.

## Licença

Ainda não definida. Até haver uma licença explícita, os direitos de uso e
distribuição deste código permanecem reservados ao autor.
