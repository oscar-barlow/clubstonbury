import { expect, test } from '@playwright/test';

for (
  const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]
) {
  test(`${viewport.name} routes fit the viewport without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of ['/', '/allocate', '/demo']) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      const geometry = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: globalThis.innerWidth,
        headerBottom: document.querySelector('header')?.getBoundingClientRect().bottom ?? 0,
        mainTop: document.querySelector('main')?.getBoundingClientRect().top ?? 0,
      }));
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.mainTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
    }
  });
}
