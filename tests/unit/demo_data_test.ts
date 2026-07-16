import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { runAllocation } from '../../src/lib/allocation/allocate.ts';
import { createRandomSeed } from '../../src/lib/allocation/priority.ts';
import { allocationMetrics, buildClubSummaries } from '../../src/lib/allocation/summary.ts';
import type { AllocationRunInput } from '../../src/lib/allocation/types.ts';
import { validateCapacityImport } from '../../src/lib/capacities/import.ts';
import { parseApplicationCsv, parseCapacityText } from '../../src/lib/csv/parse.ts';
import { resolveClubNames, validateApplications } from '../../src/lib/csv/validate.ts';

async function load(relativePath: string): Promise<string> {
  return await readFile(path.join(process.cwd(), relativePath), 'utf8');
}

async function checkDataset(
  applicationsPath: string,
  capacitiesPath: string,
  expectedCount: number,
  expectEveryChildAllocated = false,
) {
  const validation = validateApplications(parseApplicationCsv(await load(applicationsPath)));
  assert.equal(validation.issues.filter((issue) => issue.severity === 'error').length, 0);
  assert.equal(validation.conflicts.length, 0);
  assert.equal(validation.applications.length, expectedCount);

  const clubs = [...new Set(validation.applications.flatMap((application) => application.choices))];
  const parsedCapacities = parseCapacityText(await load(capacitiesPath));
  const capacityImport = validateCapacityImport(parsedCapacities.rows, clubs);
  assert.deepEqual(parsedCapacities.errors, []);
  assert.deepEqual(capacityImport.errors, []);
  assert.equal(Object.keys(capacityImport.values).length, clubs.length);

  const input: AllocationRunInput = {
    applications: validation.applications,
    capacities: capacityImport.values,
    seed: 'shipped-data-test-seed',
    algorithmVersion: 'clubstonbury-v1',
  };
  const result = await runAllocation(input);
  const summaries = buildClubSummaries(input, result);
  const metrics = allocationMetrics(input, result);
  assert.equal(summaries.length, clubs.length);
  assert.equal(metrics.totalChildren, expectedCount);
  assert.equal(metrics.totalAllocated + metrics.totalUnused, metrics.totalCapacity);
  assert.equal(
    metrics.noClub + metrics.oneClub + metrics.twoClubs + metrics.threeClubs,
    expectedCount,
  );
  if (expectEveryChildAllocated) {
    for (const club of clubs) {
      const firstChoiceCount = validation.applications.filter((application) =>
        application.choices[0] === club
      ).length;
      assert.ok(
        capacityImport.values[club] >= firstChoiceCount,
        `${club} must have room for every first-choice applicant`,
      );
    }
    assert.equal(metrics.noClub, 0);
  }
}

Deno.test('downloadable demo applications and capacities form a valid allocation', async () => {
  await checkDataset(
    'static/demo/clubstonbury-demo-applications.csv',
    'static/demo/clubstonbury-demo-capacities.csv',
    18,
    true,
  );
});

Deno.test('manual applications and capacities form a valid allocation', async () => {
  await checkDataset(
    'tests/manual/manual-applications.csv',
    'tests/manual/manual-capacities.csv',
    30,
  );
});

Deno.test('manual invalid fixture exercises six validation failures', async () => {
  const validation = validateApplications(
    parseApplicationCsv(await load('tests/manual/manual-invalid-applications.csv')),
  );
  assert.equal(validation.applications.length, 1);
  assert.equal(validation.issues.filter((issue) => issue.severity === 'error').length, 6);
});

Deno.test('seed generation is cryptographically shaped and blank seeds are rejected', async () => {
  const first = createRandomSeed();
  const second = createRandomSeed();
  assert.match(first, /^[a-f0-9]{48}$/u);
  assert.notEqual(first, second);
  await assert.rejects(
    () => runAllocation({ applications: [], capacities: {}, seed: ' ', algorithmVersion: 'v1' }),
    /seed is required/,
  );
});

Deno.test('club-name resolutions map variants without mutating other choices', () => {
  const applications = [{ id: 'a', timestamp: '2026-01-01', choices: ['ART  CLUB', 'Drama'] }];
  const resolved = resolveClubNames(applications, { 'art club': 'Art Club' });
  assert.deepEqual(resolved[0].choices, ['Art Club', 'Drama']);
  assert.deepEqual(applications[0].choices, ['ART  CLUB', 'Drama']);
});

Deno.test('empty capacity input reports a clear parsing error', () => {
  assert.deepEqual(parseCapacityText(''), { rows: [], errors: ['The capacity list is empty.'] });
});
