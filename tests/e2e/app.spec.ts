import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function resetProgress(page: Page) {
  await page.goto('/review');
  await page.getByRole('button', { name: /Reiniciar progresso/ }).click();
  await page.getByRole('button', { name: 'Sim, reiniciar', exact: true }).click();
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('geometria-rpg:progress:v4');
    if (!raw) return false;
    try {
      const stored = JSON.parse(raw);
      return Array.isArray(stored.attempts) && stored.attempts.length === 0;
    } catch {
      return false;
    }
  });
}

async function applyEncounterRule(page: Page, skill: string, objects: string[]) {
  await page.getByRole('button', { name: skill, exact: true }).click();
  for (const name of objects) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar aplicação', exact: true }).click();
}

async function runDecisionJourney(page: Page, route: string, answers: string[]) {
  await page.goto(route);
  for (const [index, answer] of answers.entries()) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
    await page.getByRole('button', { name: index === answers.length - 1 ? 'Concluir rota' : 'Registrar e avançar', exact: true }).click();
  }
}

test('official Q15 requires mathematical choices and returns the official result', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/official-q15');
  for (const name of ['∠BCA ≅ ∠DCE por OPV', 'ALA', '△CBA ≅ △CDE', 'x=14', 'y=10', '1']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
    await page.getByRole('button', { name: 'Registrar e avançar', exact: true }).click();
  }
  await expect(page.getByText('x=14, y=10 e P₁/P₂=1.')).toBeVisible();
});

test('repeated error recommends a microquest and persists after closing and reopening', async ({ page, context }) => {
  await resetProgress(page);
  await page.goto('/encounter/ordered-correspondence');
  await page.getByRole('button', { name: 'Congruência', exact: true }).click();
  for (const name of ['A', 'E', 'B', 'D', 'C', 'F']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar aplicação' }).click();
  await page.getByRole('button', { name: 'Confirmar aplicação' }).click();
  await page.goto('/review');
  await expect(page.getByRole('link', { name: /Espelho de Vértices/ })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('geometria-rpg:progress:v4') ?? '{}'));
  expect(stored.skills['triangle-congruence'].mastery).toBe(0);
  expect(stored.skills['triangle-congruence'].correctAttempts).toBe(0);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/review');
  await expect(reopened.getByRole('link', { name: /Espelho de Vértices/ })).toBeVisible();
});

test('opening experiences never grants attempts or mastery', async ({ page }) => {
  await resetProgress(page);
  for (const route of ['/encounter/crossroads-opv', '/proof/isosceles-base-angles?mode=training', '/lab/coordinates']) {
    await page.goto(route);
  }
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('geometria-rpg:progress:v4') ?? '{}'));
  expect(stored.attempts).toHaveLength(0);
  expect(Object.values(stored.skills).every((profile) => (profile as { mastery: number }).mastery === 0)).toBe(true);
  expect(Object.values(stored.competencyStates).every((state) => (state as { evidenceCount: number }).evidenceCount === 0)).toBe(true);
});

test('a due review is secondary and never replaces Continuar jornada', async ({ page }) => {
  await resetProgress(page);
  await page.evaluate(() => {
    const key = 'geometria-rpg:progress:v4';
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    stored.reviewSchedule ??= {};
    stored.reviewSchedule['triangle-congruence'] = {
      conceptId: 'triangle-congruence', consecutiveCorrect: 2, recentErrors: 1, intervalDays: 1,
      lastSeen: '2026-08-10T12:00:00.000Z', nextReview: '2026-08-11T12:00:00.000Z',
    };
    localStorage.setItem(key, JSON.stringify(stored));
  });
  await page.goto('/map');
  await expect(page.getByRole('link', { name: /Continuar jornada.*A Ordem dos Vértices/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Revisão programada.*Espelho de Vértices/ })).toBeVisible();
});

test('V3 migrates to V4 without deleting the source backup', async ({ page }) => {
  await page.goto('/map');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('geometria-rpg:progress:v3', JSON.stringify({ version: 3, xp: 125, level: 2, attempts: [] }));
  });
  await page.reload();
  const state = await page.evaluate(() => ({
    source: localStorage.getItem('geometria-rpg:progress:v3'),
    migrated: JSON.parse(localStorage.getItem('geometria-rpg:progress:v4') ?? '{}'),
  }));
  expect(state.source).not.toBeNull();
  expect(state.migrated.version).toBe(4);
  expect(state.migrated.xp).toBe(125);
  expect(state.migrated.level).toBe(2);
});

test('crossroads encounter requires OPV, LAL and a corresponding consequence', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/crossroads-opv');
  await applyEncounterRule(page, 'OPV', ['∠AFB', '∠HFR']);
  await applyEncounterRule(page, 'LAL', ['△AFB', '△HFR']);
  await applyEncounterRule(page, 'Partes correspondentes', ['AB', 'HR']);
  await expect(page.getByText(/O argumento completo/)).toBeVisible();
});

test('ordered correspondence encounter validates vertices, sides and angles', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/ordered-correspondence');
  await applyEncounterRule(page, 'Congruência', ['A', 'D', 'B', 'E', 'C', 'F']);
  await applyEncounterRule(page, 'Congruência', ['AB', 'DE', 'BC', 'EF', 'AC', 'DF']);
  await applyEncounterRule(page, 'Congruência', ['∠A', '∠D', '∠B', '∠E', '∠C', '∠F']);
  await expect(page.getByText(/O argumento completo/)).toBeVisible();
});

test('single path teaches correspondence before the challenge and grants a visible reward', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/map');
  await expect(page.getByRole('link', { name: /Continuar jornada.*A Ordem dos Vértices/ })).toBeVisible();
  await page.getByRole('link', { name: /Continuar jornada.*A Ordem dos Vértices/ }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  for (const answer of ['E', 'F', 'DE', '∠F']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.getByRole('button', { name: 'Verificar resposta', exact: true }).click();
    await page.getByRole('button', { name: /Continuar/ }).click();
  }
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByRole('link', { name: /Iniciar desafio/ }).click();
  await applyEncounterRule(page, 'Congruência', ['A', 'D', 'B', 'E', 'C', 'F']);
  await applyEncounterRule(page, 'Congruência', ['AB', 'DE', 'BC', 'EF', 'AC', 'DF']);
  await applyEncounterRule(page, 'Congruência', ['∠A', '∠D', '∠B', '∠E', '∠C', '∠F']);
  await expect(page.getByRole('heading', { name: 'Conhecimento conquistado' })).toBeVisible();
  await expect(page.getByText('+40 XP')).toBeVisible();
  await page.getByRole('link', { name: /Continuar jornada/ }).click();
  await expect(page.getByRole('link', { name: /Continuar jornada.*A Encruzilhada/ })).toBeVisible();
});

test('primary navigation exposes only path, profile and achievements', async ({ page }) => {
  await page.goto('/map');
  const navigation = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(navigation.getByRole('link')).toHaveCount(3);
  await expect(navigation.getByRole('link', { name: 'Caminho' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Perfil' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Conquistas' })).toBeVisible();
});

test('guided proof requires five justified mathematical steps', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/proof/isosceles-base-angles?mode=training');
  for (const choice of ['Hipótese', 'Definição de bissetriz', 'Reflexividade', '△ABD ≅ △ACD por LAL', '∠ABC ≅ ∠BCA']) {
    await page.getByRole('button', { name: choice, exact: true }).click();
    await page.getByRole('button', { name: 'Validar passo', exact: true }).click();
  }
  await expect(page.getByText(/Prova-chefe concluída/)).toBeVisible();
});

test('coordinate lab requires three geometric point selections', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/lab/coordinates');
  for (const point of ['Ponto (-1, 1)', 'Ponto (-2, 2)', 'Ponto (0, 1)']) {
    await page.getByRole('gridcell', { name: point, exact: true }).click();
    await page.getByRole('button', { name: 'Verificar ponto', exact: true }).click();
    if (point !== 'Ponto (0, 1)') await page.getByRole('button', { name: 'Próximo alvo', exact: true }).click();
  }
  await expect(page.getByText(/Você investigou sinais, diagonais e eixos/)).toBeVisible();
});

test('line forge completes the canonical route through SPD, SI and SPI', async ({ page }) => {
  await resetProgress(page);
  await runDecisionJourney(page, '/lab/line-forge', [
    'M=(−3/2, 1/2)',
    'det=0; A, B e D são colineares',
    'x+y+1=0',
    '(−1,0) e (0,−1)',
    'x=3 é vertical; y=1 é horizontal',
    'AB: 3x−y=0 · AC: y=0',
    'r={(x,y)∈ℝ² : 3x−y=0}',
    'uma solução → r∩s={(3,1)} → concorrentes',
    'SI → r∩s=∅ → paralelas distintas',
    'SPI → infinitas soluções → retas coincidentes',
    '3x+7y+1=0',
  ]);
  await expect(page.getByText('Forjador de Retas')).toBeVisible();
});

test('exercise 48 requires the full model before the exact metric proof', async ({ page }) => {
  await resetProgress(page);
  await runDecisionJourney(page, '/lab/exercise-48', [
    'O=(0,0), B=(0,2), C=(2,0)',
    'M=(0,1) e N=(1,0)',
    'r=↔BN e s=↔MC',
    'r: 2x+y−2=0 · s: x+2y−2=0',
    '{ 2x+y−2=0 ; x+2y−2=0 }',
    'x=y=2/3; P=(2/3,2/3)=r∩s',
    'PB e PN',
    'd(P,B)=2√5/3 · d(P,N)=√5/3',
    'Como 2√5/3=2·(√5/3), então d(P,B)=2d(P,N)',
  ]);
  await expect(page.getByText('Modelador Métrico')).toBeVisible();
});

test('parallelism and crossover routes demand justification and transfer', async ({ page }) => {
  await resetProgress(page);
  await runDecisionJourney(page, '/lab/parallelism', [
    'Alternos internos: α≅β',
    'x=15',
    'Pela conversa: r∥s',
    'Comparar △AMB e △CMD, depois △AMD e △CMB por LAL',
  ]);
  await expect(page.getByText('Arquiteto das Paralelas')).toBeVisible();
  await runDecisionJourney(page, '/lab/crossover', [
    'Sintética: vértice→ponto médio · Analítica: midpoint + reta por dois pontos',
    'Solução comum do sistema formado pelas duas equações',
    'Calcular M_AB e obter a reta por M perpendicular à reta AB',
  ]);
  await expect(page.getByText('Tradutor Geométrico')).toBeVisible();
});

for (const width of [360, 390, 412]) {
  test(`mobile ${width}px has no horizontal overflow and touch targets are usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/map', '/mission/ordered-correspondence', '/encounter/ordered-correspondence', '/encounter/crossroads-opv', '/encounter/official-q15', '/profile', '/achievements', '/lab/line-forge', '/lab/parallelism', '/lab/exercise-48']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, route).toBeLessThanOrEqual(1);
      const interactiveSizes = await page.locator('button:visible, a:visible').evaluateAll((elements) => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height, text: element.textContent?.trim() };
      }));
      const tiny = interactiveSizes.filter((item) => item.width < 44 || item.height < 40);
      expect(tiny, route).toEqual([]);
    }
  });
}


test('ordered correspondence labels remain separated on narrow mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/mission/ordered-correspondence');
  await expect(page.locator('.interactive-figure svg')).toBeVisible();
  await expect(page.locator('.interactive-figure svg text').filter({ hasText: /^C$/ })).toBeVisible();
  await expect(page.locator('.interactive-figure svg text').filter({ hasText: /^E$/ })).toBeVisible();
  const labels = page.locator('.interactive-figure svg text');
  const positions = await labels.evaluateAll((elements) => Object.fromEntries(elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return [element.textContent ?? '', { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }];
  })));
  const c = positions.C;
  const e = positions.E;
  expect(c).toBeTruthy();
  expect(e).toBeTruthy();
  expect(e.left - c.right).toBeGreaterThanOrEqual(8);
});

test('unknown routes show a recoverable not-found screen', async ({ page }) => {
  await page.goto('/territorio-que-nao-existe');
  await expect(page.getByRole('heading', { name: /território não existe/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Voltar ao caminho' })).toBeVisible();
});

test('direct route refresh works and RPG assets load', async ({ page, request }) => {
  await page.goto('/proof/isosceles-base-angles?mode=training');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'O Espelho do Isósceles' })).toBeVisible();
  for (const path of ['/assets/rpg/derived/lal.png', '/assets/rpg/derived/quest-banner.png', '/assets/rpg/derived/boss-proof.png']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
  }
});

test('critical pages have no serious axe violations', async ({ page }) => {
  for (const route of ['/map', '/mission/ordered-correspondence', '/profile', '/achievements', '/lab/coordinates', '/lab/parallelism', '/lab/line-forge', '/lab/exercise-48', '/training', '/review']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious, `${route}: ${serious.map((item) => item.id).join(', ')}`).toEqual([]);
  }
});
