import assert from 'node:assert/strict';
import { parseApplicationCsv, parseCapacityText } from '../../src/lib/csv/parse.ts';
import { validateApplications } from '../../src/lib/csv/validate.ts';
import { validateCapacityImport } from '../../src/lib/capacities/import.ts';

Deno.test('CSV parser handles BOM, quoted commas, UTF-8, line breaks and empty rows', () => {
  const source = '\uFEFFid,timestamp,choice_1,choice_2,choice_3\r\n' +
    'kid_1,2026-09-01T10:00:00Z,"Art, Craft","Théâtre\nClub",\r\n\r\n';
  const result = validateApplications(parseApplicationCsv(source));
  assert.equal(result.issues.filter((issue) => issue.severity === 'error').length, 0);
  assert.equal(result.applications.length, 1);
  assert.deepEqual(result.applications[0].choices, ['Art, Craft', 'Théâtre Club']);
});

Deno.test('validation reports missing and additional case-sensitive columns', () => {
  const result = validateApplications(
    parseApplicationCsv('id,timestamp,Choice_1,choice_2,choice_3,note\na,2026-01-01,,x,,ok'),
  );
  assert.ok(
    result.issues.some((issue) => issue.message.includes('Missing required column: choice_1')),
  );
  assert.ok(
    result.issues.some((issue) =>
      issue.severity === 'warning' && issue.message.includes('Additional columns')
    ),
  );
});

Deno.test('validation rejects duplicate IDs, invalid timestamps, gaps and duplicate choices', () => {
  const source = `id,timestamp,choice_1,choice_2,choice_3
same,not-a-date,Football,,Drama
same,2026-09-02T09:00:00Z,Art,art,
,2026-09-03T09:00:00Z,,,
`;
  const messages = validateApplications(parseApplicationCsv(source)).issues.map((issue) =>
    issue.message
  );
  assert.ok(messages.some((message) => message.includes('Timestamp is not')));
  assert.ok(messages.some((message) => message.includes('choice_3 is present')));
  assert.ok(messages.some((message) => message.includes('Duplicate id')));
  assert.ok(messages.some((message) => message.includes('appears more than once')));
  assert.ok(messages.some((message) => message.includes('Child ID is blank')));
  assert.ok(messages.some((message) => message.includes('First choice is blank')));
});

Deno.test('likely club-name variants require explicit resolution', () => {
  const source = `id,timestamp,choice_1,choice_2,choice_3
a,2026-01-01,Art Club,,
b,2026-01-02,art  club,,
`;
  const result = validateApplications(parseApplicationCsv(source));
  assert.equal(result.conflicts.length, 1);
  assert.deepEqual(result.conflicts[0].variants, ['Art Club', 'art  club']);
});

Deno.test('capacity imports accept CSV and TSV while rejecting unknown, duplicate and invalid rows', () => {
  const valid = parseCapacityText('club\tcapacity\nFootball\t20\nDrama\t0');
  assert.deepEqual(validateCapacityImport(valid.rows, ['Football', 'Drama']), {
    values: { Football: 20, Drama: 0 },
    errors: [],
  });
  const invalid = parseCapacityText('Football,4\nfootball,5\nUnknown,2\nDrama,-1');
  const checked = validateCapacityImport(invalid.rows, ['Football', 'Drama']);
  assert.equal(checked.errors.length, 3);
});
