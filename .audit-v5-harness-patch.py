from pathlib import Path

path = Path('tests/e2e/app.spec.ts')
src = path.read_text(encoding='utf-8')

old = """async function resetProgress(page: Page) {
  await page.goto('/review');
  await page.getByRole('button', { name: /Reiniciar progresso/ }).click();
}
"""
new = """async function resetProgress(page: Page) {
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
"""
if old not in src:
    raise SystemExit('resetProgress pattern not found')
src = src.replace(old, new, 1)

old = """    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    stored.reviewSchedule['triangle-congruence'] = {
"""
new = """    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    stored.reviewSchedule ??= {};
    stored.reviewSchedule['triangle-congruence'] = {
"""
if old not in src:
    raise SystemExit('reviewSchedule pattern not found')
src = src.replace(old, new, 1)

old = """  await page.goto('/mission/ordered-correspondence');
  const labels = page.locator('.interactive-figure svg text');
"""
new = """  await page.goto('/mission/ordered-correspondence');
  await expect(page.locator('.interactive-figure svg')).toBeVisible();
  await expect(page.locator('.interactive-figure svg text').filter({ hasText: /^C$/ })).toBeVisible();
  await expect(page.locator('.interactive-figure svg text').filter({ hasText: /^E$/ })).toBeVisible();
  const labels = page.locator('.interactive-figure svg text');
"""
if old not in src:
    raise SystemExit('mobile SVG wait pattern not found')
src = src.replace(old, new, 1)

path.write_text(src, encoding='utf-8')
