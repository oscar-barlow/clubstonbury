import assert from 'node:assert/strict';
import { strFromU8, unzipSync } from 'fflate';
import { runAllocation } from '../../src/lib/allocation/allocate.ts';
import { createRunManifest } from '../../src/lib/allocation/manifest.ts';
import { buildClubSummaries } from '../../src/lib/allocation/summary.ts';
import type { AllocationRunInput } from '../../src/lib/allocation/types.ts';
import {
  buildResultFiles,
  createCsv,
  createResultZip,
  resultArchiveName,
} from '../../src/lib/csv/export.ts';

Deno.test('CSV output quotes special values and protects spreadsheet formulas', () => {
  const csv = createCsv(['text', 'number'], [['=SUM(A1)', -3], ['comma,value', 2], [
    'say "hello"\nnext',
    1,
  ], ['Théâtre', 0]]);
  assert.ok(csv.includes("'=SUM(A1),-3"));
  assert.ok(csv.includes('"comma,value",2'));
  assert.ok(csv.includes('"say ""hello""\nnext",1'));
  assert.ok(csv.endsWith('\r\n'));
});

Deno.test('full allocation pipeline creates all archive files and a reproducible manifest', async () => {
  const input: AllocationRunInput = {
    applications: [
      { id: '@child', timestamp: '2026-01-01T00:00:00Z', choices: ['Art, Craft', 'Drama'] },
      { id: 'child-b', timestamp: '2026-01-02T00:00:00Z', choices: ['Drama'] },
    ],
    capacities: { 'Art, Craft': 1, Drama: 1 },
    seed: 'integration-seed',
    algorithmVersion: 'v1',
  };
  const result = await runAllocation(input);
  const manifest = await createRunManifest({
    input,
    inputCsv: 'source',
    runTimestamp: '2026-07-15T19:30:12.000Z',
    warnings: [],
  });
  const files = buildResultFiles(input, result, buildClubSummaries(input, result), manifest);
  const zip = unzipSync(createResultZip(files));
  assert.deepEqual(Object.keys(zip).sort(), [
    'allocations.csv',
    'club_summary.csv',
    'run_manifest.json',
    'unallocated.csv',
    'waiting_lists.csv',
  ]);
  assert.equal(JSON.parse(strFromU8(zip['run_manifest.json'])).seed, 'integration-seed');
  assert.ok(strFromU8(zip['allocations.csv']).includes("'@child"));
  assert.equal(
    resultArchiveName(manifest.runTimestamp, manifest.seed),
    'clubstonbury-results-20260715-193012Z-integration-seed.zip',
  );
  assert.equal(
    resultArchiveName(manifest.runTimestamp, 'school / autumn 2026'),
    'clubstonbury-results-20260715-193012Z-school-autumn-2026.zip',
  );
});
