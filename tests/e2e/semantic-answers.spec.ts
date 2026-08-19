import { expect, test, type Page } from '@playwright/test';

async function resetProgress(page: Page) {
  await page.goto('/review');
  await page.getByRole('button', { name: /Reiniciar progresso/ }).click();
  await page.getByRole('button', { name: 'Sim, reiniciar', exact: true }).click();
}

test('valid but noncanonical strategy is not recorded as an error', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/lab/exercise-48?focus=choose-distances');
  await page.getByRole('button', { name: 'Todas as dez distâncias entre os cinco pontos', exact: true }).click();
  await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
  await expect(page.getByText(/Isso é válido, porém/)).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('geometria-rpg:progress:v4') ?? '{}'));
  expect(stored.attempts.at(-1)?.correct).toBe(true);
});

test('ordered correspondence accepts pair order and orientation alternatives', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/ordered-correspondence');
  await page.getByRole('button', { name: 'Congruência', exact: true }).click();
  for (const name of ['D', 'A', 'F', 'C', 'E', 'B']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar aplicação', exact: true }).click();
  await expect(page.getByText(/Correspondência registrada/)).toBeVisible();
});

test('segment orientation FD is accepted as the same segment as DF', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/microquest/correspondence-pairs');
  await page.getByRole('button', { name: 'FD', exact: true }).click();
  await page.getByRole('button', { name: 'Verificar relação', exact: true }).click();
  await expect(page.getByText(/FD nomeia o mesmo segmento/)).toBeVisible();
});

test('Q15 accepts a synchronized equivalent triangle notation', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/official-q15');
  for (const choice of ['∠BCA ≅ ∠DCE por OPV', 'ALA']) {
    await page.getByRole('button', { name: choice, exact: true }).click();
    await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
    await page.getByRole('button', { name: 'Registrar e avançar', exact: true }).click();
  }
  await page.getByRole('button', { name: '△BAC ≅ △DEC', exact: true }).click();
  await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
  await expect(page.getByText(/permutações sincronizadas/)).toBeVisible();
});
