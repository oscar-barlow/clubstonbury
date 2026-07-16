import { expect, test } from '@playwright/test';

test('legal pages are linked and the GitHub logo links to the source repository', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Your allocation stays on your device' }),
  )
    .toBeVisible();
  await expect(page.getByText('lawful basis')).toHaveCount(0);

  await page.getByRole('link', { name: 'Terms', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'You remain responsible for every decision' }),
  )
    .toBeVisible();

  const sourceLink = page.getByRole('link', { name: 'Source on GitHub' });
  await expect(sourceLink).toHaveAttribute(
    'href',
    'https://github.com/oscar-barlow/clubstonbury',
  );
  await expect(sourceLink.locator('img')).toBeVisible();
});

for (
  const guide of [
    {
      name: 'Download administrator guide',
      filename: 'clubstonbury-admin-guide.pdf',
    },
    {
      name: 'Download algorithm guide',
      filename: 'clubstonbury-algorithm-guide.pdf',
    },
  ]
) {
  test(`${guide.filename} downloads from the home page`, async ({ page }) => {
    await page.goto('/');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: guide.name }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(guide.filename);
  });
}
