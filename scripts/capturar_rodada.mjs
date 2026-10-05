/** Conferência visual e de interação em 1080p; usa o Playwright já disponível. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const destino = 'docs/arte/rodada-prints-2026-10-03';
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
const erros = [];
pagina.on('pageerror', erro => erros.push(erro.message));
try {
  await pagina.goto(process.env.JORNADA_URL ?? 'http://127.0.0.1:5175', { waitUntil: 'networkidle' });
  await pagina.getByRole('button', { name: /Começar/ }).click();
  // O Vite acrescenta versão às imports durante HMR. Importar o caminho sem
  // essa versão criaria outra store e o ensaio comandaria um jogo invisível.
  await pagina.evaluate(async () => {
    const fonte = await fetch('/src/App.tsx').then(r => r.text());
    window.caminhoDaStore = fonte.match(/from "([^"]*\/store\/jogo\.ts[^\"]*)"/)[1];
  });
  for (let bloco = 1; bloco <= 6; bloco++) {
    await pagina.evaluate(async bloco => {
      const { useJogo } = await import(window.caminhoDaStore);
      const { REFLEXOES } = await import('/src/domain/content/reflexoes.ts');
      useJogo.getState().reiniciar();
      useJogo.getState().entrarNoBloco(bloco);
      useJogo.getState().entrarNoLugar(REFLEXOES[bloco].lugarId);
      useJogo.getState().iniciarReflexao();
    }, bloco);
    await pagina.getByRole('dialog', { name: 'Ana · pensando' }).waitFor();
    assert.equal(await pagina.locator('[role="dialog"], [role="alertdialog"]').count(), 1);
    assert.equal(await pagina.locator('button.jogo-hotspot:enabled').count(), 0);
    await pagina.screenshot({ path: `${destino}/b${bloco}-reflexao.png` });
    await pagina.getByRole('button', { name: 'Pular reflexão' }).click();
    await pagina.evaluate(async () => {
      const { useJogo } = await import(window.caminhoDaStore);
      useJogo.getState().fecharNarracao();
    });
    await pagina.waitForTimeout(700);
    await pagina.screenshot({ path: `${destino}/b${bloco}-cena.png` });
    const barra = await pagina.getByRole('region', { name: 'Itens', exact: true }).boundingBox();
    assert.ok(barra && barra.y >= 929 && barra.height <= 151);
    assert.ok(await pagina.getByRole('region', { name: 'Itens', exact: true }).evaluate(el =>
      [...el.querySelectorAll('span')].every(span => {
        const texto = document.createRange();
        texto.selectNodeContents(span);
        return [...texto.getClientRects()].every(r => r.top >= el.getBoundingClientRect().top && r.bottom <= 1080);
      })
    ), `Texto da barra deve caber em 1080p no bloco ${bloco}`);
    const item = pagina.getByRole('region', { name: 'Itens', exact: true }).locator('ul').first().locator('button').first();
    if (await item.count()) {
      await item.click();
      const contexto = pagina.getByRole('button', { name: /Fechar descrição/ });
      const caixa = await contexto.boundingBox();
      assert.ok(caixa.y >= barra.y && caixa.y + caixa.height <= 1080);
      if (bloco === 2) await pagina.screenshot({ path: `${destino}/b2-item-contexto.png` });
      await contexto.click();
      await pagina.evaluate(async () => { const { useJogo } = await import(window.caminhoDaStore); useJogo.getState().selecionarItem(null); });
    }
    if (bloco === 3) {
      const esteira = pagina.locator('.jogo-esteira');
      const antes = await esteira.evaluate(el => getComputedStyle(el).transform);
      await pagina.waitForTimeout(400);
      const depois = await esteira.evaluate(el => getComputedStyle(el).transform);
      assert.notEqual(antes, depois);
    }
    if (bloco === 4) {
      for (const etapa of ['Situação', 'Tarefa', 'Ação', 'Resultado']) assert.equal(await pagina.getByText(etapa, { exact: true }).count(), 1);
      const titulo = await pagina.getByRole('heading', { level: 1 }).boundingBox();
      const banner = await pagina.getByText('Innovation Week', { exact: true }).boundingBox();
      assert.ok(titulo.y + titulo.height <= banner.y);
      const resumos = ['Lotes no papel', 'Passar pendências', 'Registro na hora', 'Turno já informado'];
      for (let passo = 0; passo < 4; passo++) {
        await pagina.evaluate(async passo => { const { useJogo } = await import(window.caminhoDaStore); useJogo.setState({ dialogoAtivo: { dialogoId: 'b4-apresentacao', indice: passo } }); }, passo);
        await pagina.getByText(resumos[passo], { exact: true }).waitFor();
        for (let i = 0; i < resumos.length; i++) assert.equal(await pagina.getByText(resumos[i], { exact: true }).count(), i <= passo ? 1 : 0);
      }
      await pagina.waitForTimeout(900);
      await pagina.screenshot({ path: `${destino}/b4-star-preenchido.png` });
      await pagina.evaluate(async () => { const { useJogo } = await import(window.caminhoDaStore); useJogo.setState({ dialogoAtivo: null, dialogosConcluidos: ['b4-apresentacao'] }); });
    }
    await pagina.getByRole('button', { name: 'Reabrir reflexão de Ana' }).click();
    await pagina.keyboard.press('ArrowRight');
    await pagina.keyboard.press('Escape');
    await pagina.getByRole('button', { name: 'Voltar ao mapa', exact: true }).click();
    await pagina.evaluate(async bloco => {
      const { useJogo } = await import(window.caminhoDaStore);
      const { REFLEXOES } = await import('/src/domain/content/reflexoes.ts');
      useJogo.getState().entrarNoLugar(REFLEXOES[bloco].lugarId);
      useJogo.getState().fecharNarracao();
    }, bloco);
    assert.equal(await pagina.getByRole('dialog', { name: 'Ana · pensando' }).count(), 0);
    if (bloco === 5) {
      const nomes = await pagina.getByRole('region', { name: 'Habilidades' }).locator('button').allTextContents();
      for (const nome of nomes) {
        const painel = pagina.getByRole('region', { name: 'Habilidades' });
        await painel.getByRole('button').filter({ hasText: nome }).click();
        assert.ok(await painel.evaluate(el => el.getBoundingClientRect().bottom <= 1080));
        await painel.getByRole('button', { expanded: true }).click();
      }
    }
  }
  await pagina.evaluate(async () => {
    const { useJogo } = await import(window.caminhoDaStore);
    useJogo.getState().irParaTela({ tipo: 'revelacao' });
  });
  await pagina.screenshot({ path: `${destino}/final-antes.png` });
  for (let i = 0; i < 4; i++) {
    const botao = pagina.getByRole('button', { name: 'Traçar a próxima conexão' });
    await botao.click();
    await pagina.waitForTimeout(1500);
  }
  await pagina.getByRole('button', { name: 'Esvaziar a barra de itens' }).click();
  await pagina.waitForTimeout(1300);
  await pagina.screenshot({ path: `${destino}/final-depois.png` });
  assert.equal(await pagina.getByRole('region', { name: 'Habilidades' }).locator('button').count(), 9);
  assert.ok(await pagina.evaluate(async () => {
    const { useJogo } = await import(window.caminhoDaStore);
    const s = useJogo.getState();
    return s.skills.length === 9 && Object.values(s.itens).every(e => e !== 'presente');
  }));
  assert.deepEqual(erros, []);
  console.log('Seis reflexões, bloqueio, releitura, nove selos e esvaziamento final conferidos em 1920×1080.');
} finally {
  await navegador.close();
}

