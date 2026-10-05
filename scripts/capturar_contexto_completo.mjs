/** O pacote registra o conteúdo atual, pois roteiros históricos podem divergir da tela. */
import { chromium } from 'playwright';
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const destino = process.env.CAPTURAS_DESTINO ?? 'docs/arte/contexto-completo-2026-10-04';
await mkdir(`${destino}/prints`, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const retomar = process.env.CAPTURAS_RETOMAR === '1';
const capturas = retomar ? JSON.parse(await readFile(`${destino}/indice.json`, 'utf8')) : [];
const erros = [];
pagina.on('pageerror', erro => erros.push(erro.message));
const limpar = { reflexaoAtiva: null, narracao: null, dialogoAtivo: null, puzzleAberto: null, itensRecebidos: [], mensagemFalha: null, mensagemConclusao: null, itemSelecionado: null, pausaBloco4: 'inativa', blocoConcluido: false };
const escapar = texto => String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
async function estado(dados) {
  await pagina.evaluate(async dados => { const { useJogo } = await import(window.caminhoDaStore); useJogo.setState(dados); }, dados);
}
async function acao(nome, argumento) {
  await pagina.evaluate(async ([nome, argumento]) => { const { useJogo } = await import(window.caminhoDaStore); useJogo.getState()[nome](argumento); }, [nome, argumento]);
}
async function capturar(nome, descricao, espera = 180) {
  await pagina.waitForTimeout(espera);
  await pagina.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const arquivo = `${String(capturas.length + 1).padStart(3, '0')}-${nome}.png`;
  await pagina.screenshot({ path: `${destino}/prints/${arquivo}` });
  capturas.push({ arquivo, descricao, ...await pagina.evaluate(async () => { const { useJogo } = await import(window.caminhoDaStore); const s = useJogo.getState(); return { bloco: s.bloco, tela: s.tela, dialogo: s.dialogoAtivo, puzzle: s.puzzleAberto }; }) });
  await writeFile(`${destino}/indice.json`, JSON.stringify(capturas, null, 2), 'utf8');
  console.log(`${arquivo}: ${descricao}`);
}
async function preparar(bloco, lugarId) {
  await acao('reiniciar');
  await acao('entrarNoBloco', bloco);
  await estado({ ...limpar, reflexaoVista: Object.fromEntries([1, 2, 3, 4, 5, 6].map(b => [b, true])) });
  if (lugarId) { await acao('entrarNoLugar', lugarId); await estado(limpar); }
}

try {
  await pagina.goto(process.env.JORNADA_URL ?? 'http://127.0.0.1:5180', { waitUntil: 'networkidle' });
  // A importação precisa apontar para a mesma instância que o App usa no Vite.
  await pagina.evaluate(async () => {
    const fonte = await fetch('/src/App.tsx').then(r => r.text());
    window.caminhoDaStore = fonte.match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
  });
  const conteudo = await pagina.evaluate(async () => {
    const c = await import('/src/domain/content/index.ts');
    const { REFLEXOES } = await import('/src/domain/content/reflexoes.ts');
    return JSON.parse(JSON.stringify({ ...c, REFLEXOES }));
  });
  await writeFile(`${destino}/conteudo-integral.json`, JSON.stringify(conteudo, null, 2), 'utf8');
  if (!retomar) {
  await capturar('abertura', 'Abertura sem progresso salvo');
  await pagina.getByRole('button', { name: /Começar/ }).click();

  for (let bloco = 1; bloco <= 6; bloco++) {
    const cenas = conteudo.CENAS.filter(c => c.bloco === bloco);
    await preparar(bloco);
    await acao('irParaTela', { tipo: 'cartao', bloco });
    await capturar(`b${bloco}-cartao`, `Fase ${bloco}: cartão temporal e passagem de apresentação`, 700);
    await acao('entrarNoBloco', bloco);
    await capturar(`b${bloco}-mapa`, `Fase ${bloco}: mapa e lugares disponíveis`, 650);
    for (const cena of cenas) {
      await preparar(bloco, cena.lugarId);
      await capturar(`b${bloco}-${cena.lugarId}`, `Fase ${bloco}: ${conteudo.LUGARES[cena.lugarId].nome}, sem overlays`, 700);
      if (cena.aberturaTexto) {
        await estado({ narracao: cena.aberturaTexto });
        await capturar(`b${bloco}-${cena.lugarId}-narracao`, cena.aberturaTexto);
        await estado({ narracao: null });
      }
      for (const h of cena.hotspots) {
        // O nome acessível carrega o cargo do NPC; o índice segue a lista da cena.
        const botao = pagina.locator('button.jogo-hotspot').nth(cena.hotspots.indexOf(h));
        if (await botao.count()) { await botao.hover(); await capturar(`b${bloco}-${h.id}-foco`, `Hotspot: ${h.rotulo}; aura e linha de foco`); }
      }
      await pagina.mouse.move(1910, 1060);
      const ids = [...new Set(cena.hotspots.flatMap(h => [...h.efeitos, ...(h.efeitosComItem ?? [])].filter(e => e.tipo === 'dialogo').map(e => e.dialogoId)))];
      for (const id of ids) {
        const dialogo = conteudo.DIALOGOS[id];
        for (let indice = 0; indice < dialogo.nos.length; indice++) {
          await estado({ ...limpar, dialogoAtivo: { dialogoId: id, indice } });
          const no = dialogo.nos[indice];
          await capturar(`${id}-fala-${indice + 1}`, `${id}, fala ${indice + 1}/${dialogo.nos.length}: ${no.quem}: ${no.texto}`);
        }
      }
      await estado(limpar);
      const reflexao = conteudo.REFLEXOES[bloco];
      if (reflexao.lugarId === cena.lugarId) {
        await estado({ reflexaoAtiva: { etapa: 'tempo', indice: 0 } });
        await capturar(`b${bloco}-reflexao-tempo`, `Fase ${bloco}: abertura da reflexão`);
        for (let indice = 0; indice < reflexao.falas.length; indice++) {
          await estado({ reflexaoAtiva: { etapa: 'falas', indice } });
          await capturar(`b${bloco}-reflexao-${indice + 1}`, `Ana pensando: ${reflexao.falas[indice]}`);
        }
        await estado(limpar);
      }
      await estado({ lugares: { ...await pagina.evaluate(async () => (await import(window.caminhoDaStore)).useJogo.getState().lugares), [cena.lugarId]: 'concluido' }, narracao: cena.ecoTexto });
      await capturar(`b${bloco}-${cena.lugarId}-eco`, `Revisita concluída: ${cena.ecoTexto}`);
    }
    await preparar(bloco, cenas[0].lugarId);
    await estado({ blocoConcluido: true, narracao: conteudo.BLOCOS[bloco].fechoTexto });
    await capturar(`b${bloco}-fecho`, `Fecho da fase: ${conteudo.BLOCOS[bloco].fechoTexto}`);
  }

  // A progressão muda quem permanece na sala: registrar só diálogos isolados
  // não mostra a saída da plateia nem a segunda posição da Bianca.
  for (let bloco = 1; bloco <= 6; bloco++) {
    await preparar(bloco);
    const cenas = conteudo.CENAS.filter(c => c.bloco === bloco);
    for (const cena of cenas) {
      await acao('entrarNoLugar', cena.lugarId);
      await estado(limpar);
      const hotspots = bloco === 6 ? [...cena.hotspots.slice(1), cena.hotspots[0]] : cena.hotspots;
      for (const h of hotspots) {
        if (h.aceitaItem) await acao('selecionarItem', h.aceitaItem);
        await acao('clicarHotspot', h.id);
        await capturar(`${h.id}-acao`, `Progressão: ação de ${h.rotulo}`, 650);
        let atual = await pagina.evaluate(async () => { const s = (await import(window.caminhoDaStore)).useJogo.getState(); return { dialogoAtivo: s.dialogoAtivo, puzzleAberto: s.puzzleAberto, pausaBloco4: s.pausaBloco4 }; });
        if (atual.puzzleAberto) await acao('resolverPuzzle', atual.puzzleAberto);
        // Cada fala já tem print individual; aqui interessa a consequência.
        for (let i = 0; i < 30 && atual.dialogoAtivo; i++) {
          await acao('avancarDialogo');
          atual = await pagina.evaluate(async () => { const s = (await import(window.caminhoDaStore)).useJogo.getState(); return { dialogoAtivo: s.dialogoAtivo, pausaBloco4: s.pausaBloco4 }; });
        }
        if (atual.pausaBloco4 === 'rodando') {
          await capturar(`${h.id}-silencio`, 'Progressão: plateia saiu e a sala permanece em silêncio', 100);
          await acao('concluirPausaBloco4');
        }
        await estado({ narracao: null, itensRecebidos: [], mensagemFalha: null });
        await capturar(`${h.id}-consequencia`, `Progressão após ${h.rotulo}: elenco, objetos e habilidades`, 650);
      }
    }
  }

  for (const [indice, def] of Object.values(conteudo.PUZZLES).entries()) {
    const bloco = indice + 1;
    const cena = conteudo.CENAS.find(c => c.bloco === bloco && c.hotspots.some(h => [...h.efeitos, ...(h.efeitosComItem ?? [])].some(e => e.tipo === 'abrirPuzzle' && e.puzzleId === def.id)));
    await preparar(bloco, cena.lugarId);
    await estado({ puzzleAberto: def.id, puzzles: { senha: 'fechado', associar: 'fechado', estruturar: 'fechado', montar: 'fechado', [def.id]: 'liberado' }, aberturasDePuzzle: 100 + bloco });
    await capturar(`b${bloco}-${def.id}-inicio`, `Minigame: ${def.rotulo}; ${def.instrucao}`, 650);
    if (def.tipo === 'senha') {
      const campos = pagina.getByRole('textbox');
      for (let i = 0; i < def.gabarito.length; i++) await campos.nth(i).fill('ERRADO');
      await capturar(`b${bloco}-${def.id}-erro`, def.textoErro, 100);
      for (let i = 0; i < def.gabarito.length; i++) await campos.nth(i).fill(def.gabarito[i]);
      await capturar(`b${bloco}-${def.id}-acerto`, 'Senha completa: NOVO / 12 / 03', 600);
    } else if (def.tipo === 'associar') {
      const esq = def.esquerda[0];
      const errada = def.direita.find(d => d.id !== def.gabarito[esq.id]);
      await pagina.getByRole('button', { name: `Situação: ${esq.texto}`, exact: true }).click();
      await pagina.getByRole('button', { name: `Prática: ${errada.texto}`, exact: true }).click();
      await capturar(`b${bloco}-${def.id}-erro`, def.textoErro, 100);
      await pagina.waitForTimeout(1700);
      for (let i = 0; i < def.esquerda.length; i++) {
        const e = def.esquerda[i], d = def.direita.find(d => d.id === def.gabarito[e.id]);
        await pagina.getByRole('button', { name: `Situação: ${e.texto}`, exact: true }).click();
        await pagina.getByRole('button', { name: `Prática: ${d.texto}`, exact: true }).click();
        await capturar(`b${bloco}-${def.id}-par-${i + 1}`, `Associação correta ${i + 1}: ${e.texto} → ${d.texto}`, 650);
      }
    } else {
      const prefixo = def.tipo === 'montar' ? 'Peça' : 'Trecho';
      const verbo = def.tipo === 'montar' ? 'a peça escolhida' : 'o trecho escolhido';
      const pecas = def.pecas ?? def.fragmentos;
      const primeira = pecas.find(p => p.campo);
      const errado = def.campos.find(c => c.id !== primeira.campo);
      await pagina.getByRole('button', { name: `${prefixo}: ${primeira.texto}`, exact: true }).click();
      await pagina.getByRole('button', { name: `Colocar ${verbo} em ${errado.rotulo}`, exact: true }).click();
      await capturar(`b${bloco}-${def.id}-erro`, def.textoErro, 100);
      await pagina.waitForTimeout(1300);
      if (def.tipo === 'estruturar') {
        const distrator = pecas.find(p => p.campo === null);
        await pagina.getByRole('button', { name: `${prefixo}: ${distrator.texto}`, exact: true }).click();
        await capturar(`b${bloco}-${def.id}-distrator`, def.textoDistrator, 100);
      }
      for (const [i, campo] of def.campos.entries()) {
        const peca = pecas.find(p => p.campo === campo.id);
        const botao = pagina.getByRole('button', { name: `${prefixo}: ${peca.texto}`, exact: true });
        // A recusa conserva a seleção; desmarcá-la antes evita alternar para nulo.
        if (await botao.getAttribute('aria-pressed') !== 'true') await botao.click();
        await pagina.getByRole('button', { name: `Colocar ${verbo} em ${campo.rotulo}`, exact: true }).click();
        await capturar(`b${bloco}-${def.id}-campo-${i + 1}`, `${campo.rotulo}: ${peca.texto}`, 100);
      }
    }
    await pagina.waitForTimeout(2000);
    assert.equal(await pagina.evaluate(async id => (await import(window.caminhoDaStore)).useJogo.getState().puzzles[id], def.id), 'resolvido');
    await capturar(`b${bloco}-${def.id}-apos`, 'Retorno à cena depois da resolução');
    await estado(limpar);
    await acao('mostrarMensagemConclusao', def.mensagemConcluido);
    await capturar(`b${bloco}-${def.id}-lembranca`, `Revisita do minigame: ${def.mensagemConcluido}`);
  }

  await preparar(5, 'outra-area');
  await estado({ skills: Object.keys(conteudo.SKILLS) });
  await capturar('inventario-final', 'Três itens tardios e nove habilidades; estado de documentação');
  for (const item of Object.values(conteudo.ITENS)) {
    // A barra comporta três objetos; o catálogo mostra cada item isoladamente
    // para não esconder os últimos dois atrás do limite real de slots.
    await estado({ itens: Object.fromEntries(Object.keys(conteudo.ITENS).map(id => [id, id === item.id ? 'presente' : 'ausente'])) });
    await estado({ itensRecebidos: [item.id] });
    await capturar(`item-${item.id}-recebido`, `Recebimento de ${item.nome}`);
    await estado(limpar);
    await pagina.getByRole('region', { name: 'Itens', exact: true }).getByRole('button', { name: `${item.nome}. ${item.descricao}`, exact: true }).click();
    await capturar(`item-${item.id}-descricao`, `${item.nome}: ${item.descricao}`);
    await pagina.getByRole('button', { name: `Fechar descrição de ${item.nome}`, exact: true }).click();
    await acao('selecionarItem', null);
  }
  for (const skill of Object.values(conteudo.SKILLS)) {
    const painel = pagina.getByRole('region', { name: 'Habilidades' });
    await painel.getByRole('button', { name: `${skill.nome}. Abrir para ler.`, exact: true }).click();
    await capturar(`habilidade-${skill.id}`, `${skill.nome}: ${skill.texto}`);
    await painel.getByRole('button', { expanded: true }).click();
  }
  await preparar(4, 'sala-reunioes');
  await estado({ pausaBloco4: 'rodando' });
  await capturar('b4-pausa', 'Pausa dramática depois da apresentação: ausência de recompensa imediata', 100);
  await preparar(6, 'cafezinho');
  await acao('irParaTela', { tipo: 'revelacao' });
  await capturar('final-mapa-inicial', 'Revelação: mapa antes das quatro conexões', 650);
  for (let i = 0; i < conteudo.CONEXOES.length; i++) {
    await pagina.getByRole('button', { name: 'Traçar a próxima conexão', exact: true }).click();
    await capturar(`final-conexao-${i + 1}`, conteudo.CONEXOES[i].texto, 1600);
  }
  await pagina.getByRole('button', { name: 'Esvaziar a barra de itens', exact: true }).click();
  await capturar('final-barra-vazia', 'Itens consumidos; habilidades permanecem', 1600);
  await pagina.getByRole('button', { name: 'Mostrar a versão futura', exact: true }).click();
  await capturar('final-ana-futura-pergunta', 'Versão futura e pergunta do fecho', 700);
  await capturar('final-ana-futura', 'Sustentação visual depois da pergunta', 6000);
  await pagina.getByRole('button', { name: 'Ir para as perguntas finais', exact: true }).click();
  await capturar('perguntas-1', 'Primeira pergunta final', 1300);
  for (let i = 1; i < conteudo.PERGUNTAS_FINAIS.length; i++) {
    await pagina.getByRole('button', { name: 'Mostrar a próxima pergunta', exact: true }).click();
    await capturar(`perguntas-${i + 1}`, `Pergunta final ${i + 1}`, 1500);
  }
  } else {
    await preparar(6);
  }
  await pagina.reload({ waitUntil: 'networkidle' });
  // Reload apaga as variáveis da página junto com a instância anterior da store.
  await pagina.evaluate(async () => {
    const fonte = await fetch('/src/App.tsx').then(r => r.text());
    window.caminhoDaStore = fonte.match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
  });
  await capturar('abertura-retomada', 'Abertura com progresso salvo: continuar ou reiniciar');

  const resumos = [
    'Ana chega ao Escritório insegura e precisa acessar o notebook. Conversa com Tiago, Cláudia e Rafael: as pistas da senha estão distribuídas entre os três. A conversa com a líder também aborda o que trouxe Ana até ali. O cartão de Rafael nasce dessa aproximação. O minigame pede NOVO / 12 / 03, representando a coragem de perguntar e a percepção de que ninguém precisa saber tudo sozinho.',
    'Um mês depois, Ana percebe no Cafezinho que precisa aprender a organizar demandas e estudar. Bianca e Rafael abordam planejamento e desenvolvimento. Ana vai ao Escritório e associa quatro situações a quatro práticas: registrar pedidos e prazos, priorizar por urgência e esforço, fazer curso e aplicar a ferramenta, e estudar inglês. O puzzle concede certificado e competências. De volta ao Cafezinho, Rafael conversa sobre anotar, priorizar e reservar tempo para estudar; entrega o caderno de anotações e fecha a fase.',
    'Seis meses depois, Ana observa na Linha de Produção que a conferência de lotes vai para o papel e só é digitada no fim do turno. A iniciativa parte dela. Na própria Linha, usa as anotações para estruturar problema, solução e impacto; dois trechos verdadeiros são distratores porque não ajudam a agir. Produz o relatório, ganha proatividade e leva o documento ao Escritório para entregar a Cláudia, ganhando protagonismo. A melhoria usa planilha compartilhada no momento da conferência, para o próximo turno conhecer as pendências. Cláudia passa a reconhecer sua autoria.',
    'Um ano depois, na Sala de Reuniões durante a Innovation Week, Ana precisa tornar o trabalho visível. O mesmo caso da fase anterior ganha uma apresentação pelo método STAR: Situação, Tarefa, Ação, Resultado. O minigame monta uma página para o gestor. O telão acompanha a apresentação. Há uma pausa dramática sem recompensa imediata; as conversas ligam entrega, comunicação e visibilidade. O crachá do evento permanece no inventário.',
    'Dois anos depois, Ana conversa com Bianca em Outra Área. Revê competências, faculdade, interesses e possibilidades profissionais, enquanto a efetivação ainda é incerta. Bianca conta sua formação em Letras e sua atuação com documentação; orçamento e espaço no time também influenciam contratação. Esta fase não tem minigame: a revisão das habilidades e a conversa são a experiência central. Ana ganha plano de futuro sem receber antecipadamente a resposta sobre ficar.',
    'Três semanas depois, o Cafezinho virou festa com todo o elenco. Cláudia confirma a efetivação e leva ao mapa. Quatro conexões explicam como as relações, estudo, exposição e iniciativa contribuíram. Cartão, certificado e crachá são consumidos; as nove habilidades permanecem. Ana aparece em sua versão futura e a apresentação fecha com perguntas para o público. As falas da festa retomam episódios anteriores; na implementação atual devem ser lidas antes de concluir a conversa com Cláudia, pois a revelação não retorna à cena.'
  ];
  let guia = '# A Jornada do Estágio — contexto integral para análise\n\nCapturado em 4 de outubro de 2026, em 1920 × 1080. Este pacote contém a versão local atual, incluindo alterações ainda não commitadas.\n\n';
  guia += '## Como usar este pacote\n\nLeia este guia e abra `galeria.html` para percorrer os prints. `indice.json` relaciona arquivo, legenda e estado. `conteudo-integral.json` contém o conteúdo tipado exportado em JSON. As imagens estão em `prints/`.\n\n';
  guia += '## Proposta e restrições\n\nUma apresentação corporativa ao vivo, compartilhada pelo Teams, usa um jogo point-and-click como fio narrativo. O apresentador controla os cliques; o público acompanha a evolução da estagiária Ana. Pixel art, contraste alto, texto grande e alvos largos atendem à compressão de vídeo e à pressão de uma apresentação ao vivo. Os cartões fazem a passagem entre cinco apresentadores; a sexta fase é o encerramento. A barra distingue objetos carregados de habilidades aprendidas. A tese visual do final é que objetos são usados e deixam de ocupar a barra, enquanto competências ficam com Ana.\n\n';
  guia += '## Método de captura e limites\n\nAs telas são renderizações reais no Chromium, sem montagens de UI. O script entra em fases e posiciona diálogos pela store de ensaio para registrar cada fala, sem exigir uma partida linear. Uma segunda passagem dispara ações da store em ordem para mostrar a progressão e as mudanças de elenco. Os puzzles são operados pelos controles reais, com erros e respostas corretas; na passagem de progressão a resolução é aplicada pela store. O catálogo mostra cada item isoladamente e as nove habilidades em estado documental. As revisitas e os fechos são estados preparados para mostrar seus textos. Prints estáticos não registram som, duração, caminhada, respiração nem todas as posições intermediárias de animação. Esta é uma cobertura de telas e conteúdo, não uma validação completa de todos os caminhos jogáveis. Os roteiros em referencias ajudam a entender a fala dos apresentadores, mas o conteúdo integral exportado é a referência para o que a versão atual exibe.\n\n';
  guia += '## Elenco\n\nAna é a protagonista; sua postura evolui de encolhida para neutra, confiante e futura.\n\n';
  for (const npc of Object.values(conteudo.NPCS)) guia += `- **${npc.nome}** — ${npc.cargo}.\n`;
  for (let b = 1; b <= 6; b++) {
    const cartao = conteudo.CARTOES.find(c => c.bloco === b);
    guia += `\n## Fase ${b} — ${conteudo.BLOCOS[b].titulo}\n\n${cartao.tempo}${cartao.apresentador ? ` · apresentação: ${cartao.apresentador}` : ''}.\n\n${resumos[b - 1]}\n\n`;
    const reflexao = conteudo.REFLEXOES[b];
    guia += '### Pensamento de Ana\n\n';
    for (const fala of reflexao.falas) guia += `> ${fala}\n\n`;
    for (const cena of conteudo.CENAS.filter(c => c.bloco === b)) {
      guia += `### ${conteudo.LUGARES[cena.lugarId].nome}\n\n${cena.aberturaTexto ?? ''}\n\n`;
      guia += `Contadores da fase: ${cena.totalConversas} conversas, ${cena.totalMinigames} minigames.\n\n`;
      for (const h of cena.hotspots) {
        guia += `- **${h.rotulo}** (${h.id})`;
        if (h.requerItemPresente) guia += `; requer ${conteudo.ITENS[h.requerItemPresente].nome}`;
        if (h.aceitaItem) guia += `; aceita ${conteudo.ITENS[h.aceitaItem].nome} selecionado`;
        if (h.requerPuzzleResolvido) guia += `; requer puzzle ${h.requerPuzzleResolvido}`;
        if (h.requerHotspotsFeitos) guia += `; depende de ${h.requerHotspotsFeitos.join(', ')}`;
        guia += '.\n';
        if (h.bloqueadoTexto) guia += `  Retorno bloqueado: ${h.bloqueadoTexto}\n`;
      }
      guia += `\nRevisita após conclusão: ${cena.ecoTexto}\n\n`;
    }
    guia += '### Conversas integrais\n\n';
    for (const d of Object.values(conteudo.DIALOGOS).filter(d => d.id.startsWith(`b${b}-`))) {
      guia += `#### ${d.id}\n\n`;
      for (const no of d.nos) guia += `**${conteudo.NPCS[no.quem]?.nome ?? (no.quem === 'ana' ? 'Ana' : no.quem)}:** ${no.texto}\n\n`;
      if (d.efeitos?.length) guia += `Consequências: ${d.efeitos.map(e => JSON.stringify(e)).join('; ')}.\n\n`;
    }
    guia += `Fecho: ${conteudo.BLOCOS[b].fechoTexto}\n\n`;
  }
  guia += '## Minigames — instruções, respostas e significado\n\nHá quatro minigames na versão atual (um em cada fase de 1 a 4). As fases 5 e 6 não têm puzzle. Comentários históricos que falam em cinco puzzles não descrevem a versão atual.\n\n';
  for (const def of Object.values(conteudo.PUZZLES)) {
    guia += `### ${def.rotulo}\n\n${def.instrucao}\n\nErro: ${def.textoErro}\n\n`;
    if (def.tipo === 'senha') def.campos.forEach((c, i) => { guia += `- ${c.rotulo}: **${def.gabarito[i]}**, pista de ${conteudo.NPCS[c.npcId].nome}.\n`; });
    else if (def.tipo === 'associar') for (const e of def.esquerda) guia += `- ${e.texto} → ${def.direita.find(d => d.id === def.gabarito[e.id]).texto}\n`;
    else for (const p of def.pecas ?? def.fragmentos) guia += `- ${p.campo ? def.campos.find(c => c.id === p.campo).rotulo : 'Distrator'}: ${p.texto}\n`;
    guia += `\nLembrança ao revisitar: ${def.mensagemConcluido}\n\n`;
  }
  guia += '## Objetos e competências\n\n';
  for (const item of Object.values(conteudo.ITENS)) guia += `- **${item.nome}:** ${item.descricao}${item.tardio ? ' Permanece até o clímax.' : ' É usado e consumido durante as fases.'}\n`;
  guia += '\n';
  for (const skill of Object.values(conteudo.SKILLS)) guia += `- **${skill.nome}** (fase ${skill.bloco}): ${skill.texto}\n`;
  guia += '\n## Conexões e perguntas do encerramento\n\n';
  conteudo.CONEXOES.forEach((c, i) => { guia += `${i + 1}. ${c.texto} Origem: ${JSON.stringify(c.origem)}; lugar: ${conteudo.LUGARES[c.viaLugar].nome}; consome origem: ${c.consomeOrigem ? 'sim' : 'não'}.\n\n`; });
  for (const pergunta of conteudo.PERGUNTAS_FINAIS) guia += `- ${typeof pergunta === 'string' ? pergunta : JSON.stringify(pergunta)}\n`;
  guia += '\n## Sugestão de pedido à IA que analisar\n\nAnalise a apresentação usando este guia, o conteúdo integral e os prints. Avalie clareza da jornada, conexão entre conversas e minigames, legibilidade em Teams, composição das cenas, distinção dos personagens, hierarquia visual, compreensão das instruções, retorno de erro/acerto, navegação e coerência do clímax. Cite arquivos de imagem ao apontar problemas. Distinga defeitos observáveis, inferências e aspectos que só podem ser avaliados em movimento. Preserve a história revisada; priorize ajustes de apresentação e interação.\n\n';
  guia += `## Índice dos ${capturas.length} prints\n\n`;
  for (const c of capturas) guia += `- [${c.arquivo}](prints/${c.arquivo}) — ${c.descricao.replace(/\n/g, ' ')}\n`;
  await writeFile(`${destino}/LEIA-ME.md`, guia, 'utf8');
  await writeFile(`${destino}/indice.json`, JSON.stringify(capturas, null, 2), 'utf8');
  await writeFile(`${destino}/galeria.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Contexto completo — A Jornada do Estágio</title><style>body{background:#171b26;color:#fff;font:20px system-ui;margin:32px}a{color:#86dfff}figure{margin:40px 0}img{max-width:100%;height:auto;border:2px solid #718096}figcaption{margin:12px 0}nav{position:sticky;top:0;background:#171b26;padding:12px}input{font:inherit;width:70%;padding:8px}</style><h1>A Jornada do Estágio · ${capturas.length} prints</h1><p>4 de outubro de 2026 · 1920 × 1080 · <a href="LEIA-ME.md">Guia completo</a> · <a href="conteudo-integral.json">Conteúdo integral</a></p><nav><label>Filtrar: <input id="filtro" placeholder="fase, personagem, minigame, item…"></label></nav>${capturas.map(c => `<figure><a href="prints/${c.arquivo}"><img loading="lazy" src="prints/${c.arquivo}" alt="${escapar(c.descricao)}"></a><figcaption><strong>${escapar(c.arquivo)}</strong><br>${escapar(c.descricao)}</figcaption></figure>`).join('\n')}<script>document.querySelector('#filtro').addEventListener('input',e=>{for(const f of document.querySelectorAll('figure'))f.hidden=!f.textContent.toLocaleLowerCase('pt-BR').includes(e.target.value.toLocaleLowerCase('pt-BR'))})</script></html>`, 'utf8');
  await mkdir(`${destino}/referencias`, { recursive: true });
  for (const nome of ['contato-cenarios.png', 'contato-personagens.png', 'contato-itens.png', 'contato-retratos.png', 'contato-objetos.png']) await copyFile(`docs/arte/${nome}`, `${destino}/referencias/${nome}`);
  for (const nome of ['00-fundamentos', '01-bloco-1', '02-bloco-2', '03-bloco-3', '04-bloco-4', '05-bloco-5']) await copyFile(`docs/roteiro/${nome}.md`, `${destino}/referencias/${nome}.md`);
  await copyFile('docs/biblia-de-arte.md', `${destino}/referencias/biblia-de-arte.md`);
  await writeFile(`${destino}/verificacao.json`, JSON.stringify({ capturas: capturas.length, errosDePagina: erros, retomadaDaDocumentacao: retomar, resolucao: '1920x1080', metodo: 'Estados de ensaio; controles reais nos puzzles e encerramento' }, null, 2));
  assert.deepEqual(erros, [], 'Não deve haver erro JavaScript durante a captura');
  console.log(`Pacote completo: ${capturas.length} capturas em ${destino}`);
} finally {
  await navegador.close();
}
