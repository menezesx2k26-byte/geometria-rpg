import { expect, test } from '@playwright/test';

test('correspondence encounter uses two explicit sets instead of a random six-card puzzle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/encounter/ordered-correspondence');

  await expect(page.getByText('△ABC ≅ △DEF', { exact: true })).toBeVisible();
  await expect(page.getByText(/Registrar A↔D, B↔E e C↔F na ordem correta/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Forme três pares de vértices correspondentes.' })).toBeVisible();

  // A figura volta a ser geométrica e neutra; não é deformada para esconder a resposta.
  const polygons = page.locator('.interactive-figure svg polygon');
  await expect(polygons).toHaveCount(2);
  await expect(polygons.nth(1)).toHaveAttribute('points', '360,340 470,70 580,340');
  await expect(page.locator('.tick-mark')).toHaveCount(0);

  const palette = page.getByLabel('Objetos selecionáveis');
  const columns = palette.locator(':scope > div');
  await expect(columns).toHaveCount(2);
  await expect(columns.nth(0).getByText('△ABC', { exact: true })).toBeVisible();
  await expect(columns.nth(1).getByText('△DEF', { exact: true })).toBeVisible();

  const left = columns.nth(0);
  const right = columns.nth(1);
  await expect(left.getByRole('button')).toHaveCount(3);
  await expect(right.getByRole('button')).toHaveCount(3);
  await expect(left.getByRole('button').allTextContents()).resolves.toEqual(['A', 'B', 'C']);

  const rightOrder = await right.getByRole('button').allTextContents();
  expect(rightOrder).not.toEqual(['D', 'E', 'F']);
  expect(new Set(rightOrder)).toEqual(new Set(['D', 'E', 'F']));

  const confirm = page.getByRole('button', { name: 'Confirmar aplicação', exact: true });
  await expect(confirm).toBeDisabled();

  // Ao começar num conjunto, o segundo clique precisa vir do outro conjunto.
  await left.getByRole('button', { name: 'A', exact: true }).click();
  await expect(left.getByRole('button', { name: 'B', exact: true })).toBeDisabled();
  await expect(left.getByRole('button', { name: 'C', exact: true })).toBeDisabled();
  for (const label of ['D', 'E', 'F']) {
    await expect(right.getByRole('button', { name: label, exact: true })).toBeEnabled();
  }
  await right.getByRole('button', { name: 'D', exact: true }).click();
  await expect(page.getByText(/Par 1: A ↔ D/)).toBeVisible();

  // Remover um membro remove o par inteiro, permitindo refazer sem bagunçar os demais.
  await right.getByRole('button', { name: 'D', exact: true }).click();
  await expect(page.getByText(/0\/3 pares completos · 0\/6 objetos selecionados/)).toBeVisible();

  // A direção também continua livre: começar pelo segundo triângulo é válido.
  await right.getByRole('button', { name: 'D', exact: true }).click();
  await left.getByRole('button', { name: 'A', exact: true }).click();
  await right.getByRole('button', { name: 'F', exact: true }).click();
  await left.getByRole('button', { name: 'C', exact: true }).click();
  await right.getByRole('button', { name: 'E', exact: true }).click();
  await left.getByRole('button', { name: 'B', exact: true }).click();
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(page.getByRole('heading', { name: /três pares de lados correspondentes/ })).toBeVisible();
  await expect(columns.nth(0).getByRole('button').allTextContents()).resolves.toEqual(['AB', 'BC', 'AC']);
  const sideTargets = await columns.nth(1).getByRole('button').allTextContents();
  expect(sideTargets).not.toEqual(['DE', 'EF', 'DF']);
  expect(new Set(sideTargets)).toEqual(new Set(['DE', 'EF', 'DF']));

  await columns.nth(0).getByRole('button', { name: 'AB', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: 'DE', exact: true }).click();
  await columns.nth(0).getByRole('button', { name: 'BC', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: 'EF', exact: true }).click();
  await columns.nth(0).getByRole('button', { name: 'AC', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: 'DF', exact: true }).click();
  await confirm.click();

  await expect(page.getByRole('heading', { name: /três pares de ângulos correspondentes/ })).toBeVisible();
  await expect(columns.nth(0).getByRole('button').allTextContents()).resolves.toEqual(['∠A', '∠B', '∠C']);
  const angleTargets = await columns.nth(1).getByRole('button').allTextContents();
  expect(angleTargets).not.toEqual(['∠D', '∠E', '∠F']);
  expect(new Set(angleTargets)).toEqual(new Set(['∠D', '∠E', '∠F']));

  await columns.nth(0).getByRole('button', { name: '∠A', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: '∠D', exact: true }).click();
  await columns.nth(0).getByRole('button', { name: '∠B', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: '∠E', exact: true }).click();
  await columns.nth(0).getByRole('button', { name: '∠C', exact: true }).click();
  await columns.nth(1).getByRole('button', { name: '∠F', exact: true }).click();
  await confirm.click();

  await expect(page.getByText(/O argumento completo/)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
