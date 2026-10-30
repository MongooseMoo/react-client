import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';

// Explicit connected acceptance, run separately from CI's isolated fixtures.
// Uses a real ordinary guest and restores its original description in finally.
const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5178';

test('ordinary guest uses the property panel over live GMCP and restores its edit', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(`${origin}/?username=guest&password=guest`);
  await page.waitForFunction(() => window.mudClient?.gmcp.sessionReady, { timeout: 30_000 });
  await page.getByRole('tab', { name: 'Properties', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Property browser' });
  await panel.getByLabel('Object', { exact: true }).fill('me');
  await panel.getByLabel('Property name', { exact: true }).fill('description');
  await panel.getByRole('button', { name: 'Open property', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('heading', { name: 'description', exact: true })).toBeFocused();
  await expect(panel.getByRole('button', { name: 'Save value', exact: true })).toBeEnabled();
  const original = await page.evaluate(async () => {
    const { usePropertyBrowserStore } = await import('/src/stores/propertyBrowserStore.ts');
    return usePropertyBrowserStore.getState().detail.value;
  });
  try {
    await panel.getByLabel('Value type', { exact: true }).selectOption('str');
    await panel.getByLabel('Value', { exact: true }).fill('Property browser connected acceptance.');
    await panel.getByRole('button', { name: 'Save value', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(panel.getByRole('status')).toHaveText('Property saved.');
    await expect(panel.getByLabel('Value', { exact: true })).toHaveValue('Property browser connected acceptance.');
    await page.addScriptTag({ path: resolve('node_modules/axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('.properties-panel'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
      return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }));
    });
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(panel.getByLabel('Value', { exact: true })).toBeVisible();
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(panel.getByRole('button', { name: 'Save value', exact: true })).toBeVisible();
  } finally {
    await page.evaluate(async (value) => {
      const { usePropertyBrowserStore } = await import('/src/stores/propertyBrowserStore.ts');
      const state = usePropertyBrowserStore.getState();
      window.mudClient.gmcp.require('Object.Properties').save(state.target, state.detail, value);
    }, original);
    await expect.poll(() => page.evaluate(async () => {
      const { usePropertyBrowserStore } = await import('/src/stores/propertyBrowserStore.ts');
      const state = usePropertyBrowserStore.getState();
      return state.busy ? null : { error: state.error, value: state.detail.value };
    })).toEqual({ error: false, value: original });
    await page.evaluate(() => window.mudClient.sendCommand('@quit'));
  }
});
