# v2.2 / Spec 04 — Fase 5: querer ficar e pensar onde crescer

**Depende:** spec 00; posicionamento conforme spec 01.
**Leia:** ADR-027, ADR-028, ADR-031, `bloco5.ts`, `PainelDeSkills.tsx`,
`integridade.test.ts` e `docs/roteiro/05-bloco-5.md`.

**Arquivos:** conteúdo da fase 5, painel/store apenas se necessário para a
interação, testes correspondentes e roteiro. Não criar lugar, item ou puzzle.

## O problema

O diálogo atual diz “Eu não sei se eu fico. E não sei se é isso que eu quero
fazer”. Isso mistura desejo e resultado. O dono esclareceu: Ana gostaria de
ser efetivada; o contrato vai acabar e ela ainda não sabe se será. A dúvida
de carreira é sobre **qual área seguir**, não sobre querer permanecer na empresa.

A fase está curta e concentra a reflexão em um diálogo de seis falas. É preciso
dar espaço para rever o aprendizado, formular um plano e conversar sobre fatores
fora do controle de Ana, preservando a história da mudança de carreira de Bianca.

## O que entregar

### 1. Quatro momentos com propósito

| Momento | Interação | O que a plateia entende |
|---|---|---|
| Contrato chegando ao fim | Abertura e primeira conversa com Bianca | Ana quer ser efetivada, mas ainda não recebeu a decisão |
| Retrospectiva | Caderno conduz ao painel de skills | Ela aprendeu e tem realizações concretas para reconhecer |
| Área e direção | Grade e conversa sobre atividades que a interessam | Permanecer na empresa e escolher uma área são decisões diferentes |
| Conversa de fechamento | Bianca fala do próprio percurso e da incerteza | Mudar de área é possível; a experiência não depende da vaga |

A primeira conversa deve estar disponível na chegada, sem exigir a retrospectiva.
O fechamento só fica disponível depois do caderno e da grade. Se ambas usarem
Bianca, o hotspot oferece a conversa adequada ao momento; a anterior continua
relível por uma opção clara. Retomar não pode prender a fase numa conversa errada.

Ampliar por momentos distintos, não por um monólogo maior. Manter o limite
existente de seis nós por diálogo; dividir as conversas em vez de relaxar o
teste global. A fase só conclui no fechamento, concedendo `plano-futuro` uma vez.

### 2. Aprendizado como experiência visível

O caderno deve conduzir de fato ao painel “O que eu aprendi”, não apenas mandar
o apresentador abri-lo em uma narração. Ana reconhece aprendizados relacionados
a episódios já ocorridos: perguntar no primeiro dia, aprender para trabalhar,
resolver um problema por iniciativa própria e comunicar o resultado.

Percorrer skills é espaço de fala e reflexão; não acrescentar contador nem
obrigar a abrir as nove para passar. Caderno e grade mantêm função distinta:
um olha o percurso, a outra aproxima estudo e futuro. Não transformar diferenças
entre faculdade e trabalho em desqualificação da formação.

### 3. Desejo, escolha e incerteza separados

Falas-base que fixam o sentido; distribuir nas conversas mantendo o tom breve:

- Ana: “Meu contrato está acabando. Eu quero ser efetivada, mas ainda não sei
  se vai acontecer.”
- Ana: “Aprendi muito aqui. Agora estou pensando se quero continuar nessa área
  ou conhecer outra dentro da empresa.”
- Bianca: “Você aprendeu, entregou e tomou iniciativa. A gente viu isso.”
- Bianca: “Se a efetivação não vier, isso não apaga o que você fez. Às vezes
  não há vaga no time, e essa parte não está nas suas mãos.”
- Bianca mantém o contraste entre formação em Letras e trabalho com tecnologia,
  e relata como deixou de tratar a mudança como um desvio errado.
- Bianca: “O que você aprendeu a fazer aqui é seu. Isso não fica com a empresa.”

“Ana fez tudo certo” deve ser sustentado pelos episódios da jornada e pelo
reconhecimento deles, sem sugerir que desempenho garante vaga. A falta de vaga
é um exemplo hipotético de fator externo, não o resultado dela. Bianca não
promete efetivação e o jogo não anuncia a notícia da fase 6 antecipadamente.

### 4. Plano de carreira como pergunta concreta

Antes de concluir, Ana formula uma direção de exploração: reconhecer o que
gostou de fazer, o que quer aprender e com quem conversar sobre outra área.
Não precisa escolher uma profissão definitiva, aceitar uma vaga fictícia nem
resolver a dúvida em um menu de certo/errado.

O roteiro da Marianna ganha pausas para a plateia relacionar interesses,
competências e oportunidades. A cena permanece na Outra Área; a efetivação e
a festa continuam na fase 6.

## Critérios de aceite

**Implementado:** conversa inicial sobre contrato e desejo de efetivação, caderno
e grade como momentos próprios, e fechamento com a trajetória de Bianca,
reconhecimento de Ana e fatores externos. O caderno abre a última skill para
iniciar a retrospectiva; Bianca volta para o fechamento após os dois objetos.
Diálogos, portas e geometria passam na suíte.

- [x] Os quatro momentos têm conteúdo e interação próprios; o fechamento não
      está disponível logo na entrada.
- [x] Ana diz que quer ser efetivada; sua dúvida de carreira é sobre a área.
- [x] Contrato prestes a acabar e decisão desconhecida estão explícitos.
- [x] Caderno abre ou destaca o painel, com navegação e fechamento seguros.
- [x] Conquistas anteriores sustentam o reconhecimento do trabalho e aprendizado.
- [x] Bianca preserva a trajetória de mudança e nomeia fatores externos como
      possibilidades, sem prever o resultado ou prometer vaga.
- [x] Diálogos respeitam seis nós; conclusão e skill não se repetem na releitura.
- [x] Roteiro atualizado, prévia da fase conferida e duas verificações obrigatórias verdes.

No relatório, apresentar todas as conversas na ordem final e indicar os pontos
em que o apresentador abre a discussão, para avaliar ritmo e duração em ensaio.
