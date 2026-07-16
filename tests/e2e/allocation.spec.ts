import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { strFromU8, unzipSync } from 'fflate';
import process from 'node:process';

const applications = path.join(process.cwd(), 'tests/fixtures/applications.csv');
const capacities = path.join(process.cwd(), 'tests/fixtures/capacities.csv');

async function completeAllocation(page: import('@playwright/test').Page): Promise<void> {
  await page.getByTestId('application-file').setInputFiles(applications);
  await expect(page.getByText('5 valid applications')).toBeVisible();
  await page.locator('#capacity-file').setInputFiles(capacities);
  await page.getByTestId('seed-input').fill('known-browser-seed');
  await expect(page.getByTestId('run-lottery')).toBeEnabled();
  await page.getByTestId('run-lottery').click();
  await expect(page.getByTestId('club-summary')).toBeVisible();
}

test('home-to-download workflow creates the expected timestamped ZIP', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Clubstonbury' })).toBeVisible();
  await expect(page.getByRole('heading', {
    name: 'Clubs matter. The stampede doesn’t have to.',
  })).toBeVisible();
  await expect(page.getByText(/important part of the school experience/u)).toBeVisible();
  await expect(page.getByText(/school staff to manage the rush/u)).toBeVisible();
  await expect(
    page.locator('.hero').getByText(/Families choose up to three clubs for their child/u),
  )
    .toBeVisible();
  expect(await page.locator('#principles h3').allTextContents()).toEqual([
    'Families get choice',
    'Rankings matter',
    'Everyone enters the same lottery',
    'First tickets first',
    'Waiting lists are included',
    'Mop-up is first come, first served',
  ]);
  expect((await page.locator('#principles .step-icon').allTextContents()).join('')).not.toMatch(
    /\d/u,
  );
  await expect(page.getByRole('heading', { name: 'Everyone enters the same lottery' }))
    .toBeVisible();
  await expect(page.getByText(/removing time pressure and stress for families/u)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Waiting lists are included' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mop-up is first come, first served' }))
    .toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create and share the form' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leave it open', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '5 easy steps', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Done!', exact: true })).toBeVisible();
  await expect(page.getByText('Send invoices, and file the allocation data for your records.'))
    .toBeVisible();
  await expect(page.getByRole('heading', { name: 'Practical Guides', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', {
    name: 'Free, fair and private, without another school platform.',
  })).toBeVisible();
  await expect(
    page.getByText(/Schools can use the survey and spreadsheet tools they already have/u),
  )
    .toBeVisible();
  await expect(page.getByText(/produces an allocation archive for the school’s records/u))
    .toBeVisible();
  await expect(page.getByText(/No new account, platform or integration is needed/u)).toBeVisible();
  await expect(page.getByText(/Choose 3 clubs for your child/u)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try it with demo data' })).toBeVisible();
  await expect(page.locator('.final-cta').getByRole('link', { name: 'Start an allocation' }))
    .toBeVisible();
  await expect(page.getByText('Fairness without Stress')).toHaveCount(0);
  await expect(page.getByText('Clubstonbury processes your CSV entirely inside this browser.'))
    .toHaveCount(0);
  await page.locator('.hero').getByRole('link', { name: 'Start an allocation' }).click();
  await completeAllocation(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('download-results').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^clubstonbury-results-\d{8}-\d{6}Z-known-browser-seed\.zip$/u,
  );
  const savedPath = await download.path();
  expect(savedPath).toBeTruthy();
  const files = unzipSync(await readFile(savedPath!));
  expect(Object.keys(files).sort()).toEqual([
    'allocations.csv',
    'club_summary.csv',
    'run_manifest.json',
    'unallocated.csv',
    'waiting_lists.csv',
  ]);
  expect(JSON.parse(strFromU8(files['run_manifest.json'])).seed).toBe('known-browser-seed');
});

test('cached app completes an allocation offline without run-time requests', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => await navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.goto('/allocate');
  await page.getByTestId('application-file').setInputFiles(applications);
  await page.locator('#capacity-file').setInputFiles(capacities);
  await page.getByTestId('seed-input').fill('offline-seed');

  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.getByTestId('run-lottery').click();
  await expect(page.getByTestId('download-results')).toBeVisible();
  expect(requests).toEqual([]);

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('download-results').click();
  await downloadPromise;
});
