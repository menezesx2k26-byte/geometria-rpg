import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function resetProgress(page: Page) {
  await page.goto('/review');
  await page.getByRole('button', { name: /Reiniciar progresso/ }).click();
}

async function applyEncounterRule(page: Page, skill: string, objects: string[]) {
  await page.getByRole('button', { name: skill, exact: true }).click();
  for (const name of objects) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar aplicação', exact: true }).click();
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
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('geometria-rpg:progress:v2') ?? '{}'));
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
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('geometria-rpg:progress:v2') ?? '{}'));
  expect(stored.attempts).toHaveLength(0);
  expect(Object.values(stored.skills).every((profile) => (profile as { mastery: number }).mastery === 0)).toBe(true);
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

test('guided proof requires five justified mathematical steps', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/proof/isosceles-base-angles?mode=training');
  for (const choice of ['Hipótese', 'Definição de bissetriz', 'Reflexividade', '△ABD ≅ △ACD por LAL', '∠ABC ≅ ∠BCA']) {
    await page.getByRole('button', { name: choice, exact: true }).click();
    await page.getByRole('button', { name: 'Validar passo', exact: true }).click();
  }
  await expect(page.getByText(/Boss Proof concluída/)).toBeVisible();
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

for (const width of [360, 390, 412]) {
  test(`mobile ${width}px has no horizontal overflow and touch targets are usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/vertical-slice');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const interactiveSizes = await page.locator('button:visible, a:visible').evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, text: element.textContent?.trim() };
    }));
    const tiny = interactiveSizes.filter((item) => item.width < 44 || item.height < 40);
    expect(tiny).toEqual([]);
  });
}

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
  for (const route of ['/map', '/vertical-slice', '/lab/coordinates', '/review']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious, `${route}: ${serious.map((item) => item.id).join(', ')}`).toEqual([]);
  }
});
