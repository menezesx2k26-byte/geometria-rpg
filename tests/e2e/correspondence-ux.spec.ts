import { expect, test, type Locator } from '@playwright/test';

async function expectNoCorrectPairSideBySide(
  palette: Locator,
  correctPairs: readonly (readonly [string, string])[],
) {
  const labels = await palette.getByRole('button').allTextContents();
  expect(labels).toHaveLength(6);

  for (let index = 0; index < labels.length; index += 2) {
    const left = labels[index]?.trim() ?? '';
    const right = labels[index + 1]?.trim() ?? '';
    const revealsAnswer = correctPairs.some(
      ([a, b]) => (left === a && right === b) || (left === b && right === a),
    );
    expect(revealsAnswer, `row ${index / 2 + 1} leaked pair ${left}↔${right}`).toBe(false);
  }
}

test('correspondence encounter removes visual shortcuts and reveals only the current stage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/encounter/ordered-correspondence');

  await expect(page.getByText('△ABC ≅ △DEF', { exact: true })).toBeVisible();
  await expect(page.getByText(/Registrar A↔D, B↔E e C↔F na ordem correta/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Forme três pares de vértices correspondentes.' })).toBeVisible();

  const polygons = page.locator('.interactive-figure svg polygon');
  await expect(polygons).toHaveCount(2);
  await expect(polygons.nth(1)).toHaveAttribute('points', '470,340 580,70 360,70');

  const palette = page.getByLabel('Objetos selecionáveis');
  await expect(palette.getByRole('button')).toHaveCount(6);
  for (const label of ['A', 'B', 'C', 'D', 'E', 'F']) {
    await expect(palette.getByRole('button', { name: label, exact: true })).toBeVisible();
  }
  await expect(palette.getByRole('button', { name: 'AB', exact: true })).toHaveCount(0);
  await expectNoCorrectPairSideBySide(palette, [['A', 'D'], ['B', 'E'], ['C', 'F']]);

  const confirm = page.getByRole('button', { name: 'Confirmar aplicação', exact: true });
  await expect(confirm).toBeDisabled();

  await palette.getByRole('button', { name: 'A', exact: true }).click();
  await palette.getByRole('button', { name: 'D', exact: true }).click();
  await expect(page.getByText(/Par 1: A ↔ D/)).toBeVisible();
  await expect(page.getByText(/1\/3 pares completos · 2\/6 objetos selecionados/)).toBeVisible();

  // Tocar novamente em um membro remove o par inteiro em vez de reembaralhar os pares seguintes.
  await palette.getByRole('button', { name: 'D', exact: true }).click();
  await expect(page.getByText(/0\/3 pares completos · 0\/6 objetos selecionados/)).toBeVisible();

  for (const label of ['D', 'A', 'F', 'C', 'E', 'B']) {
    await palette.getByRole('button', { name: label, exact: true }).click();
  }
  await expect(page.getByText(/Par 1: D ↔ A/)).toBeVisible();
  await expect(page.getByText(/Par 2: F ↔ C/)).toBeVisible();
  await expect(page.getByText(/Par 3: E ↔ B/)).toBeVisible();
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(page.getByRole('heading', { name: /três pares de lados correspondentes/ })).toBeVisible();
  await expect(palette.getByRole('button')).toHaveCount(6);
  await expect(palette.getByRole('button', { name: 'A', exact: true })).toHaveCount(0);
  for (const label of ['AB', 'DE', 'BC', 'EF', 'AC', 'DF']) {
    await expect(palette.getByRole('button', { name: label, exact: true })).toBeVisible();
  }
  await expectNoCorrectPairSideBySide(palette, [['AB', 'DE'], ['BC', 'EF'], ['AC', 'DF']]);

  for (const label of ['DE', 'AB', 'EF', 'BC', 'DF', 'AC']) {
    await palette.getByRole('button', { name: label, exact: true }).click();
  }
  await confirm.click();

  await expect(page.getByRole('heading', { name: /três pares de ângulos correspondentes/ })).toBeVisible();
  await expectNoCorrectPairSideBySide(palette, [['∠A', '∠D'], ['∠B', '∠E'], ['∠C', '∠F']]);
  for (const label of ['∠D', '∠A', '∠F', '∠C', '∠E', '∠B']) {
    await palette.getByRole('button', { name: label, exact: true }).click();
  }
  await confirm.click();
  await expect(page.getByText(/O argumento completo/)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
