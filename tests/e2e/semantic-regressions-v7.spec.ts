import { expect, test, type Page } from '@playwright/test';

async function resetProgress(page: Page) {
  await page.goto('/review');
  await page.getByRole('button', { name: /Reiniciar progresso/ }).click();
  await page.getByRole('button', { name: 'Sim, reiniciar', exact: true }).click();
}

test('Q15 accepts OPV-prefixed notation and a wrapped ALA answer', async ({ page }) => {
  await resetProgress(page);
  await page.goto('/encounter/official-q15');

  const freeAnswer = page.getByLabel('Ou escreva uma resposta matematicamente equivalente');
  await freeAnswer.fill('OPV: ∠BCA ≅ ∠DCE');
  await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
  await expect(page.getByText(/Forma matematicamente equivalente aceita/)).toBeVisible();
  await page.getByRole('button', { name: /Registrar e avançar/ }).click();

  await freeAnswer.fill('caso ALA');
  await page.getByRole('button', { name: 'Sustentar resposta', exact: true }).click();
  await expect(page.getByText(/Forma matematicamente equivalente aceita/)).toBeVisible();
});
