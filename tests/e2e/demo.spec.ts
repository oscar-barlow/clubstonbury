import { expect, test } from '@playwright/test';

test('demo page downloads a separate valid application and capacity dataset', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1, name: 'Try a demo lineup' })).toBeVisible();
  await expect(page.getByText('18 fake applications')).toBeVisible();

  const applicationsDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download applications' }).click();
  expect((await applicationsDownload).suggestedFilename()).toBe(
    'clubstonbury-demo-applications.csv',
  );

  const capacitiesDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download capacities' }).click();
  expect((await capacitiesDownload).suggestedFilename()).toBe('clubstonbury-demo-capacities.csv');

  await page.getByRole('link', { name: 'Open the allocation tool' }).click();
  await expect(page).toHaveURL(/\/allocate$/u);
  await expect(page.getByTestId('application-file')).toBeVisible();
});
